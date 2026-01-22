module app_registry::app_registry {
    use std::signer;
    use std::string; // module for string::bytes, string::from_bytes
    use std::string::String;
    use std::vector;
    use std::option;
    use aptos_std::big_ordered_map::{Self, BigOrderedMap};
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    #[test_only]
    use aptos_framework::account;

    // Error codes
    const E_NOT_OWNER: u64 = 1;
    const E_NOT_INITIALIZED: u64 = 2;
    const E_ALREADY_INITIALIZED: u64 = 3;
    const E_APP_NOT_FOUND: u64 = 4;
    const E_APP_ALREADY_EXISTS: u64 = 5;
    const E_INVALID_STATUS: u64 = 6;
    const E_NOT_APP_OWNER: u64 = 7;
    const E_UNAUTHORIZED: u64 = 8;
    const E_PENDING_CHANGES: u64 = 9;
    const E_RATE_LIMIT_EXCEEDED: u64 = 10;
    const E_CANNOT_REMOVE_LAST_OWNER: u64 = 11;
    const E_URL_IN_USE: u64 = 12;
    const E_SLUG_IN_USE: u64 = 13;

    // Rate limiting constants
    const MAX_SUBMISSIONS_PER_PERIOD: u64 = 2;
    const RATE_LIMIT_PERIOD_SECONDS: u64 = 86400; // 24 hours

    // App status
    const STATUS_PENDING: u8 = 0;
    const STATUS_APPROVED: u8 = 1;
    const STATUS_REJECTED: u8 = 2;

    /// Metadata for a mini app
    struct AppMetadata has store, drop, copy {
        // Basic info
        name: String,
        description: String,
        icon: String,  // emoji or icon identifier
        url: String,
        slug: String, // the app id in frontends

        // Developer info
        developer_address: address,
        developer_name: String,

        // Classification
        category: String,  // "game", "defi", "social", "utility", "nft"
        language: String,  // ISO 639-1 code (e.g., "en", "es", "zh") or "all" for universal apps

        // Status
        status: u8,

        // Timestamps
        submitted_at: u64,
        updated_at: u64,
        approved_at: u64,

        // Stats (optional, can be updated)
        downloads: u64,
        rating: u64,  // stored as rating * 10 (e.g., 45 = 4.5 stars)

        // Permissions requested
        permissions: vector<String>,

        // Verification
        verified: bool,
    }

    /// Pending changes for an app (requires owner approval)
    struct PendingChange has store, drop, copy {
        new_metadata: AppMetadata,
        requested_at: u64,
        change_type: u8,  // 0 = update, 1 = removal
    }

    /// Submission tracking for rate limiting
    struct SubmissionRecord has store, drop, copy {
        timestamps: vector<u64>,  // List of submission timestamps
    }

    

    /// Input payload for submissions/resubmissions
    struct SubmissionInput has store, drop, copy {
        name: String,
        description: String,
        icon: String,
        url: String,
        slug: String,
        developer_name: String,
        category: String,
        language: String,  // ISO 639-1 code or "all"
        permissions: vector<String>,
    }

    /// Registry resource that holds all apps
    struct AppRegistry has key {
        // Main app storage: app_index -> AppMetadata
        apps: BigOrderedMap<u64, AppMetadata>,

        // Pending changes: app_index -> PendingChange
        pending_changes: BigOrderedMap<u64, PendingChange>,

        // Rate limiting: developer_address -> SubmissionRecord
        submission_records: BigOrderedMap<address, SubmissionRecord>,

        // Admin addresses who can approve apps
        owners: vector<address>,

        // Registry stats
        total_apps: u64,
        approved_apps: u64,
        pending_apps: u64,

        // Global app index counter
        next_app_index: u64,

        // Auxiliary data for efficient querying
        // List of all app indices (for iteration)
        app_indices: vector<u64>,
        // Approved app indices only
        approved_app_indices: vector<u64>,

        // Developer index: developer_address -> vector of app_indices
        developer_index: BigOrderedMap<address, vector<u64>>,

        // Treasury and fees
        treasury_address: address,
        submit_fee: u64,  // Fee in octas
    }

    // Events
    #[event]
    struct AppSubmittedEvent has drop, store {
        developer_address: address,
        app_name: String,
        timestamp: u64,
    }

    #[event]
    struct AppApprovedEvent has drop, store {
        developer_address: address,
        app_name: String,
        approved_by: address,
        timestamp: u64,
    }

    #[event]
    struct AppRejectedEvent has drop, store {
        developer_address: address,
        app_name: String,
        rejected_by: address,
        reason: String,
        timestamp: u64,
    }

    #[event]
    struct AppUpdateRequestedEvent has drop, store {
        developer_address: address,
        app_name: String,
        timestamp: u64,
    }

    #[event]
    struct AppRemovedEvent has drop, store {
        developer_address: address,
        app_name: String,
        removed_by: address,
        timestamp: u64,
    }

    /// Initialize the registry (automatically called when module is published)
    fun init_module(deployer: &signer) {
        let deployer_addr = signer::address_of(deployer);

        // Ensure deployer is the app_registry account
        assert!(deployer_addr == @app_registry, E_NOT_INITIALIZED);

        // Check if already initialized
        assert!(!exists<AppRegistry>(@app_registry), E_ALREADY_INITIALIZED);

        // Create registry
        let registry = AppRegistry {
            apps: big_ordered_map::new_with_config(0, 0, false),
            pending_changes: big_ordered_map::new_with_config(0, 0, false),
            submission_records: big_ordered_map::new_with_config(0, 0, false),
            owners: vector::empty(),
            total_apps: 0,
            approved_apps: 0,
            pending_apps: 0,
            next_app_index: 0,
            app_indices: vector::empty(),
            approved_app_indices: vector::empty(),
            developer_index: big_ordered_map::new_with_config(0, 0, false),
            treasury_address: @app_registry,
            submit_fee: 1000000000,  // 10 MOVE in octas
        };

        // Add deployer as initial owner
        vector::push_back(&mut registry.owners, deployer_addr);

        move_to(deployer, registry);
    }

    /// Submit a new app for approval
    public entry fun submit_app(
        developer: &signer,
        name: String,
        description: String,
        icon: String,
        url: String,
        slug: String,
        developer_name: String,
        category: String,
        language: String,
        permissions: vector<String>,
    ) acquires AppRegistry {
        let developer_addr = signer::address_of(developer);

        // Get registry
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global_mut<AppRegistry>(@app_registry);

        // Charge submission fee
        let fee = registry.submit_fee;
        if (fee > 0) {
            coin::transfer<AptosCoin>(developer, registry.treasury_address, fee);
        };

        // Check rate limiting
        check_and_update_rate_limit(&mut registry.submission_records, developer_addr);

        // Enforce uniqueness across non-rejected apps:
        // - URL uniqueness (scheme/trailing-slash agnostic)
        // - Slug uniqueness (exact match)
        let url_key = normalize_url(&url);
        let i = 0;
        let n = vector::length(&registry.app_indices);
        while (i < n) {
            let index_i = *vector::borrow(&registry.app_indices, i);
            if (big_ordered_map::contains(&registry.apps, &index_i)) {
                let app_i = big_ordered_map::borrow(&registry.apps, &index_i);
                if (app_i.status != STATUS_REJECTED) {
                    // URL uniqueness check
                    let existing_key = normalize_url(&app_i.url);
                    if (existing_key == url_key) { assert!(false, E_URL_IN_USE); };
                    // Slug uniqueness check
                    if (app_i.slug == slug) { assert!(false, E_SLUG_IN_USE); };
                };
            };
            i = i + 1;
        };

        // Create app metadata
        let input = SubmissionInput {
            name,
            description,
            icon,
            url,
            slug,
            developer_name,
            category,
            language,
            permissions,
        };
        let metadata = build_app_metadata(input, developer_addr);

        // Assign new app index
        let app_index = registry.next_app_index;
        registry.next_app_index = app_index + 1;

        // Add to registry
        big_ordered_map::add(&mut registry.apps, app_index, metadata);
        registry.total_apps = registry.total_apps + 1;
        registry.pending_apps = registry.pending_apps + 1;

        // Add to app_indices list
        vector::push_back(&mut registry.app_indices, app_index);

        // Update developer index
        let dev_list = if (big_ordered_map::contains(&registry.developer_index, &developer_addr)) {
            big_ordered_map::remove(&mut registry.developer_index, &developer_addr)
        } else {
            vector::empty()
        };
        vector::push_back(&mut dev_list, app_index);
        big_ordered_map::add(&mut registry.developer_index, developer_addr, dev_list);

        // Emit event
        event::emit(AppSubmittedEvent {
            developer_address: developer_addr,
            app_name: metadata.name,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Approve a pending app (owner only)
    public entry fun approve_app(
        owner: &signer,
        app_index: u64,
    ) acquires AppRegistry {
        let owner_addr = signer::address_of(owner);

        // Get registry
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global_mut<AppRegistry>(@app_registry);

        // Check if caller is owner
        assert!(is_owner(owner_addr, &registry.owners), E_NOT_OWNER);

        // Check if app exists
        assert!(big_ordered_map::contains(&registry.apps, &app_index), E_APP_NOT_FOUND);

        // Get and update app
        let app = big_ordered_map::remove(&mut registry.apps, &app_index);
        assert!(app.status == STATUS_PENDING, E_INVALID_STATUS);

        app.status = STATUS_APPROVED;
        app.approved_at = timestamp::now_seconds();
        app.updated_at = timestamp::now_seconds();
        app.verified = true;
        big_ordered_map::add(&mut registry.apps, app_index, app);

        // Update counters
        registry.approved_apps = registry.approved_apps + 1;
        registry.pending_apps = registry.pending_apps - 1;

        // Add to approved apps list
        vector::push_back(&mut registry.approved_app_indices, app_index);

        // Emit event
        event::emit(AppApprovedEvent {
            developer_address: app.developer_address,
            app_name: app.name,
            approved_by: owner_addr,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Reject a pending app (owner only)
    public entry fun reject_app(
        owner: &signer,
        app_index: u64,
        reason: String,
    ) acquires AppRegistry {
        let owner_addr = signer::address_of(owner);

        // Get registry
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global_mut<AppRegistry>(@app_registry);

        // Check if caller is owner
        assert!(is_owner(owner_addr, &registry.owners), E_NOT_OWNER);

        // Check if app exists
        assert!(big_ordered_map::contains(&registry.apps, &app_index), E_APP_NOT_FOUND);

        // Get and update app
        let app = big_ordered_map::remove(&mut registry.apps, &app_index);
        let app_name = app.name;

        // Only pending submissions can be rejected
        assert!(app.status == STATUS_PENDING, E_INVALID_STATUS);

        app.status = STATUS_REJECTED;
        app.updated_at = timestamp::now_seconds();
        big_ordered_map::add(&mut registry.apps, app_index, app);

        // Decrement pending counter
        registry.pending_apps = registry.pending_apps - 1;

        // Emit event
        event::emit(AppRejectedEvent {
            developer_address: app.developer_address,
            app_name,
            rejected_by: owner_addr,
            reason,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Request to update app metadata (requires owner approval)
    public entry fun request_update(
        developer: &signer,
        app_index: u64,
        name: String,
        description: String,
        icon: String,
        url: String,
        category: String,
        language: String,
        permissions: vector<String>,
    ) acquires AppRegistry {
        let developer_addr = signer::address_of(developer);

        // Get registry
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global_mut<AppRegistry>(@app_registry);

        // Check if app exists and caller is owner
        assert!(big_ordered_map::contains(&registry.apps, &app_index), E_APP_NOT_FOUND);
        let current_app = big_ordered_map::borrow(&registry.apps, &app_index);
        assert!(current_app.developer_address == developer_addr, E_NOT_APP_OWNER);

        // Check for existing pending changes
        assert!(!big_ordered_map::contains(&registry.pending_changes, &app_index), E_PENDING_CHANGES);

        // If app is APPROVED, change status to PENDING when update is requested
        let was_approved = current_app.status == STATUS_APPROVED;
        if (was_approved) {
            let app = big_ordered_map::remove(&mut registry.apps, &app_index);
            app.status = STATUS_PENDING;
            app.updated_at = timestamp::now_seconds();
            app.verified = false;
            big_ordered_map::add(&mut registry.apps, app_index, app);
            
            // Update counters
            registry.approved_apps = registry.approved_apps - 1;
            registry.pending_apps = registry.pending_apps + 1;
            
            // Remove from approved apps list
            let (found, index) = vector::index_of(&registry.approved_app_indices, &app_index);
            if (found) {
                vector::remove(&mut registry.approved_app_indices, index);
            };
        };

        // Re-borrow current_app after potential mutation
        let current_app_updated = big_ordered_map::borrow(&registry.apps, &app_index);

        // Create updated metadata (status will be APPROVED in pending change, set back on approval)
        let updated_metadata = AppMetadata {
            name,
            description,
            icon,
            url,
            slug: current_app_updated.slug,
            developer_address: current_app_updated.developer_address,
            developer_name: current_app_updated.developer_name,
            category,
            language,
            status: STATUS_APPROVED,  // Will be set to APPROVED when update is approved
            submitted_at: current_app_updated.submitted_at,
            updated_at: timestamp::now_seconds(),
            approved_at: 0,  // Will be set when update is approved
            downloads: current_app_updated.downloads,
            rating: current_app_updated.rating,
            permissions,
            verified: true,  // Will be set to true when update is approved
        };

        // Create pending change
        let pending_change = PendingChange {
            new_metadata: updated_metadata,
            requested_at: timestamp::now_seconds(),
            change_type: 0,  // update
        };

        big_ordered_map::add(&mut registry.pending_changes, app_index, pending_change);

        // Emit event
        event::emit(AppUpdateRequestedEvent {
            developer_address: developer_addr,
            app_name: name,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Approve pending update (owner only)
    public entry fun approve_update(
        owner: &signer,
        app_index: u64,
    ) acquires AppRegistry {
        let owner_addr = signer::address_of(owner);

        // Get registry
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global_mut<AppRegistry>(@app_registry);

        // Check if caller is owner
        assert!(is_owner(owner_addr, &registry.owners), E_NOT_OWNER);

        // Check if pending change exists
        assert!(big_ordered_map::contains(&registry.pending_changes, &app_index), E_APP_NOT_FOUND);

        // Get pending change and apply it
        let pending_change = big_ordered_map::remove(&mut registry.pending_changes, &app_index);

        // Get current app to check previous status
        let app = big_ordered_map::remove(&mut registry.apps, &app_index);
        let was_pending = app.status == STATUS_PENDING;

        // Update app with new metadata
        app = pending_change.new_metadata;

        // Ensure status is APPROVED and set timestamps
        app.status = STATUS_APPROVED;
        app.approved_at = timestamp::now_seconds();
        app.updated_at = timestamp::now_seconds();
        app.verified = true;
        big_ordered_map::add(&mut registry.apps, app_index, app);

        // Update counters if status changed
        if (was_pending) {
            registry.pending_apps = registry.pending_apps - 1;
            registry.approved_apps = registry.approved_apps + 1;
        };

        // Add to approved apps list if not already there
        let (found, _) = vector::index_of(&registry.approved_app_indices, &app_index);
        if (!found) {
            vector::push_back(&mut registry.approved_app_indices, app_index);
        };
    }

    /// Remove app (developer or owner)
    public entry fun remove_app(
        caller: &signer,
        app_index: u64,
    ) acquires AppRegistry {
        let caller_addr = signer::address_of(caller);

        // Get registry
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global_mut<AppRegistry>(@app_registry);

        // Check if app exists
        assert!(big_ordered_map::contains(&registry.apps, &app_index), E_APP_NOT_FOUND);

        // Read required fields first, then drop the borrow before mutating the table
        let (app_name, app_status, dev_addr) = {
            let app = big_ordered_map::borrow(&registry.apps, &app_index);
            let is_owner_caller = is_owner(caller_addr, &registry.owners);
            let is_developer = caller_addr == app.developer_address;
            assert!(is_owner_caller || is_developer, E_UNAUTHORIZED);
            (app.name, app.status, app.developer_address)
        };

        // Remove app
        big_ordered_map::remove(&mut registry.apps, &app_index);

        // Update counters
        registry.total_apps = registry.total_apps - 1;
        if (app_status == STATUS_PENDING) {
            registry.pending_apps = registry.pending_apps - 1;
        } else if (app_status == STATUS_APPROVED) {
            registry.approved_apps = registry.approved_apps - 1;

            // Remove from approved apps list
            let (found, index) = vector::index_of(&registry.approved_app_indices, &app_index);
            if (found) {
                vector::remove(&mut registry.approved_app_indices, index);
            };
        };

        // Remove from app_indices list
        let (found, index) = vector::index_of(&registry.app_indices, &app_index);
        if (found) {
            vector::remove(&mut registry.app_indices, index);
        };

        // Remove any pending changes
        if (big_ordered_map::contains(&registry.pending_changes, &app_index)) {
            big_ordered_map::remove(&mut registry.pending_changes, &app_index);
        };

        // Remove from developer index
        if (big_ordered_map::contains(&registry.developer_index, &dev_addr)) {
            let ids = big_ordered_map::remove(&mut registry.developer_index, &dev_addr);
            let (found2, idx2) = vector::index_of(&ids, &app_index);
            if (found2) { 
                vector::remove(&mut ids, idx2);
            };
            // Always add back (even if empty) to preserve original behavior
            big_ordered_map::add(&mut registry.developer_index, dev_addr, ids);
        };

        // Emit event
        event::emit(AppRemovedEvent {
            developer_address: dev_addr,
            app_name,
            removed_by: caller_addr,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Update app stats (owner only - for updating downloads/ratings)
    public entry fun update_stats(
        owner: &signer,
        app_index: u64,
        downloads: u64,
        rating: u64,  // rating * 10 (e.g., 45 = 4.5 stars)
    ) acquires AppRegistry {
        let owner_addr = signer::address_of(owner);

        // Get registry
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global_mut<AppRegistry>(@app_registry);

        // Check if caller is owner
        assert!(is_owner(owner_addr, &registry.owners), E_NOT_OWNER);

        // Check if app exists
        assert!(big_ordered_map::contains(&registry.apps, &app_index), E_APP_NOT_FOUND);

        // Update stats
        let app = big_ordered_map::remove(&mut registry.apps, &app_index);
        app.downloads = downloads;
        big_ordered_map::add(&mut registry.apps, app_index, app);
        app.rating = rating;
        app.updated_at = timestamp::now_seconds();
    }

    /// Add a new admin/owner to the registry
    ///
    /// Grants admin privileges to a new address, allowing them to approve/reject apps,
    /// manage other admins, and access admin-only view functions. This function enables
    /// decentralized administration where multiple addresses can manage the app registry.
    ///
    /// # Parameters
    /// * `owner` - The current admin's signer (must already be an owner)
    /// * `new_owner` - The address to grant admin privileges to
    ///
    /// # Aborts
    /// * `E_NOT_INITIALIZED` - If the registry doesn't exist at the given address
    /// * `E_NOT_OWNER` - If the caller is not currently registered as an admin/owner
    ///
    /// # State Changes
    /// * Adds new_owner to registry.owners vector (if not already present)
    ///
    /// # Access Control
    /// Admin-only function. Only existing admins can add new admins.
    ///
    /// # Note
    /// This function is idempotent - calling it multiple times with the same address
    /// will not create duplicate entries.
    public entry fun add_owner(
        owner: &signer,
        new_owner: address,
    ) acquires AppRegistry {
        let owner_addr = signer::address_of(owner);

        // Get registry
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global_mut<AppRegistry>(@app_registry);

        // Check if caller is owner
        assert!(is_owner(owner_addr, &registry.owners), E_NOT_OWNER);

        // Add new owner if not already present
        if (!is_owner(new_owner, &registry.owners)) {
            vector::push_back(&mut registry.owners, new_owner);
        };
    }

    /// Update the treasury address (owner only)
    ///
    /// Allows owners to change where submission fees are sent.
    ///
    /// # Parameters
    /// * `owner` - The current admin's signer (must be an owner)
    /// * `new_treasury_address` - The new address to receive submission fees
    ///
    /// # Aborts
    /// * `E_NOT_INITIALIZED` - If the registry doesn't exist
    /// * `E_NOT_OWNER` - If the caller is not an owner
    public entry fun update_treasury_address(
        owner: &signer,
        new_treasury_address: address,
    ) acquires AppRegistry {
        let owner_addr = signer::address_of(owner);

        // Get registry
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global_mut<AppRegistry>(@app_registry);

        // Check if caller is owner
        assert!(is_owner(owner_addr, &registry.owners), E_NOT_OWNER);

        // Update treasury address
        registry.treasury_address = new_treasury_address;
    }

    /// Update the submission fee (owner only)
    ///
    /// Allows owners to change the fee charged for app submissions.
    /// Fee is specified in octas (1 octa = 0.00000001 MOVE).
    ///
    /// # Parameters
    /// * `owner` - The current admin's signer (must be an owner)
    /// * `new_fee` - The new submission fee in octas
    ///
    /// # Aborts
    /// * `E_NOT_INITIALIZED` - If the registry doesn't exist
    /// * `E_NOT_OWNER` - If the caller is not an owner
    public entry fun update_submit_fee(
        owner: &signer,
        new_fee: u64,
    ) acquires AppRegistry {
        let owner_addr = signer::address_of(owner);

        // Get registry
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global_mut<AppRegistry>(@app_registry);

        // Check if caller is owner
        assert!(is_owner(owner_addr, &registry.owners), E_NOT_OWNER);

        // Update submission fee
        registry.submit_fee = new_fee;
    }

    /// Remove an admin/owner from the registry
    ///
    /// Revokes admin privileges from an address. This is useful for removing admins who
    /// no longer need access or whose privileges should be revoked. The registry must
    /// always have at least one owner to prevent being locked out.
    ///
    /// # Parameters
    /// * `owner` - The current admin's signer (must be an owner)
    /// * `owner_to_remove` - The address to revoke admin privileges from
    ///
    /// # Aborts
    /// * `E_NOT_INITIALIZED` - If the registry doesn't exist at the given address
    /// * `E_NOT_OWNER` - If the caller is not currently registered as an admin/owner
    /// * `E_CANNOT_REMOVE_LAST_OWNER` - If attempting to remove the last remaining owner
    ///
    /// # State Changes
    /// * Removes owner_to_remove from registry.owners vector (if present)
    ///
    /// # Access Control
    /// Admin-only function. Only existing admins can remove other admins.
    ///
    /// # Safety
    /// This function includes a critical safety check to prevent removal of the last owner,
    /// which would permanently lock the registry. At least one owner must always remain.
    ///
    /// # Note
    /// Admins can remove themselves, but only if other admins exist. This function is
    /// idempotent - calling it for an address that's not an owner has no effect.
    public entry fun remove_owner(
        owner: &signer,
        owner_to_remove: address,
    ) acquires AppRegistry {
        let owner_addr = signer::address_of(owner);

        // Get registry
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global_mut<AppRegistry>(@app_registry);

        // Check if caller is owner
        assert!(is_owner(owner_addr, &registry.owners), E_NOT_OWNER);

        // Prevent removing the last remaining owner
        let owners_len = vector::length(&registry.owners);
        assert!(owners_len > 1, E_CANNOT_REMOVE_LAST_OWNER);

        // Remove owner
        let (found, index) = vector::index_of(&registry.owners, &owner_to_remove);
        if (found) {
            vector::remove(&mut registry.owners, index);
        };
    }

    // ======== View Functions ========

    #[view]
    /// Get all admin/owner addresses
    ///
    /// Returns a list of all addresses that have admin privileges on the registry.
    /// These addresses can approve/reject apps, manage other admins, and access
    /// admin-only view functions.
    ///
    /// # Parameters
    ///
    /// # Returns
    /// * `vector<address>` - A vector containing all admin/owner addresses
    ///
    /// # Aborts
    /// * `E_NOT_INITIALIZED` - If the registry doesn't exist at the given address
    ///
    /// # Usage
    /// Used by admin dashboards to display current admins or verify admin status.
    /// This is a public view function - anyone can see who the admins are for transparency.
    public fun get_owners(): vector<address> acquires AppRegistry {
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global<AppRegistry>(@app_registry);
        registry.owners
    }

    #[view]
    /// Get the treasury address
    ///
    /// Returns the address where submission fees are sent.
    ///
    /// # Returns
    /// * `address` - The treasury address
    ///
    /// # Aborts
    /// * `E_NOT_INITIALIZED` - If the registry doesn't exist
    public fun get_treasury_address(): address acquires AppRegistry {
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global<AppRegistry>(@app_registry);
        registry.treasury_address
    }

    #[view]
    /// Get the submission fee
    ///
    /// Returns the fee charged for app submissions in octas.
    ///
    /// # Returns
    /// * `u64` - The submission fee in octas (1 octa = 0.00000001 MOVE)
    ///
    /// # Aborts
    /// * `E_NOT_INITIALIZED` - If the registry doesn't exist
    public fun get_submit_fee(): u64 acquires AppRegistry {
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global<AppRegistry>(@app_registry);
        registry.submit_fee
    }

    #[view]
    /// Get app metadata by global app id
    ///
    /// # Parameters
    /// * `app_index` - Global index of the app
    ///
    /// # Returns
    /// * `AppMetadata` - Metadata for the specified app id
    ///
    /// # Aborts
    /// * `E_NOT_INITIALIZED` - If the registry doesn't exist
    /// * `E_APP_NOT_FOUND` - If the app id does not exist
    ///
    /// # Usage
    /// Fetch a single app's metadata for display or validation.
    public fun get_app(app_index: u64): AppMetadata acquires AppRegistry {
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global<AppRegistry>(@app_registry);
        assert!(big_ordered_map::contains(&registry.apps, &app_index), E_APP_NOT_FOUND);
        *big_ordered_map::borrow(&registry.apps, &app_index)
    }

    #[view]
    /// Get app metadata by slug (approved apps only)
    ///
    /// # Parameters
    /// * `slug` - The unique slug identifier of the app
    ///
    /// # Returns
    /// * `AppMetadata` - The app metadata if found and approved
    ///
    /// # Aborts
    /// * `E_NOT_INITIALIZED` - If the registry doesn't exist
    /// * `E_APP_NOT_FOUND` - If no approved app with the given slug exists
    ///
    /// # Usage
    /// Fetch app metadata using the slug for URL routing (e.g., /app/send-tokens).
    /// Only returns approved apps.
    public fun get_app_by_slug(slug: String): AppMetadata acquires AppRegistry {
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global<AppRegistry>(@app_registry);
        
        // Search through approved app indices to find matching slug
        let i = 0;
        let len = vector::length(&registry.approved_app_indices);
        while (i < len) {
            let app_index = *vector::borrow(&registry.approved_app_indices, i);
            if (big_ordered_map::contains(&registry.apps, &app_index)) {
                let app = big_ordered_map::borrow(&registry.apps, &app_index);
                if (app.slug == slug && app.status == STATUS_APPROVED) {
                    return *app
                };
            };
            i = i + 1;
        };
        
        // App not found or not approved
        abort E_APP_NOT_FOUND
    }

    #[view]
    /// Check if an app exists by global app id
    ///
    /// # Parameters
    /// * `app_index` - Global index of the app
    ///
    /// # Returns
    /// * `bool` - True if the app exists, false otherwise
    ///
    /// # Usage
    /// Lightweight existence check before calling functions that require the app.
    public fun app_exists(app_index: u64): bool acquires AppRegistry {
        if (!exists<AppRegistry>(@app_registry)) {
            return false
        };
        let registry = borrow_global<AppRegistry>(@app_registry);
        big_ordered_map::contains(&registry.apps, &app_index)
    }

    #[view]
    /// Get registry stats
    ///
    /// # Parameters
    ///
    /// # Returns
    /// * `(u64, u64, u64)` - `(total_apps, approved_apps, pending_apps)`
    ///
    /// # Aborts
    /// * `E_NOT_INITIALIZED` - If the registry doesn't exist
    ///
    /// # Usage
    /// Display registry KPIs in dashboards.
    public fun get_stats(): (u64, u64, u64) acquires AppRegistry {
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global<AppRegistry>(@app_registry);
        (registry.total_apps, registry.approved_apps, registry.pending_apps)
    }

    #[view]
    /// Check if an address is an owner/admin
    ///
    /// # Parameters
    /// * `address` - Address to check
    ///
    /// # Returns
    /// * `bool` - True if `address` is an owner, false otherwise
    ///
    /// # Aborts
    /// * `E_NOT_INITIALIZED` - If the registry doesn't exist
    ///
    /// # Usage
    /// Gate admin-only operations and views.
    public fun check_is_owner(address: address): bool acquires AppRegistry {
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global<AppRegistry>(@app_registry);
        is_owner(address, &registry.owners)
    }

    #[view]
    /// Get pending change for an app
    public fun get_pending_change(app_index: u64): PendingChange acquires AppRegistry {
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global<AppRegistry>(@app_registry);
        assert!(big_ordered_map::contains(&registry.pending_changes, &app_index), E_APP_NOT_FOUND);
        *big_ordered_map::borrow(&registry.pending_changes, &app_index)
    }

    #[view]
    /// Check if there's a pending change for an app
    public fun has_pending_change(app_index: u64): bool acquires AppRegistry {
        if (!exists<AppRegistry>(@app_registry)) {
            return false
        };
        let registry = borrow_global<AppRegistry>(@app_registry);
        big_ordered_map::contains(&registry.pending_changes, &app_index)
    }

    #[view]
    /// Get all approved apps
    public fun get_all_active_apps(): vector<AppMetadata> acquires AppRegistry {
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global<AppRegistry>(@app_registry);

        let apps = vector::empty<AppMetadata>();
        let i = 0;
        let len = vector::length(&registry.approved_app_indices);

        while (i < len) {
            let index = *vector::borrow(&registry.approved_app_indices, i);
            let app_opt = big_ordered_map::get(&registry.apps, &index);
            if (option::is_some(&app_opt)) {
                let app = *option::borrow(&app_opt);
                if (app.status == STATUS_APPROVED) {
                    vector::push_back(&mut apps, app);
                };
            };
            i = i + 1;
        };

        apps
    }

    #[view]
    /// Get all approved apps in a specific category
    public fun get_apps_by_category(category: String): vector<AppMetadata> acquires AppRegistry {
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global<AppRegistry>(@app_registry);

        let apps = vector::empty<AppMetadata>();
        let i = 0;
        let len = vector::length(&registry.approved_app_indices);

        while (i < len) {
            let index = *vector::borrow(&registry.approved_app_indices, i);
            let app_opt = big_ordered_map::get(&registry.apps, &index);
            if (option::is_some(&app_opt)) {
                let app = *option::borrow(&app_opt);
                if (app.status == STATUS_APPROVED && app.category == category) {
                    vector::push_back(&mut apps, app);
                };
            };
            i = i + 1;
        };

        apps
    }

    #[view]
    /// Get paginated approved apps
    /// offset: starting index, limit: max number of apps to return
    public fun get_active_apps_paginated(
        offset: u64,
        limit: u64,
    ): vector<AppMetadata> acquires AppRegistry {
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global<AppRegistry>(@app_registry);

        let apps = vector::empty<AppMetadata>();
        let total_approved = vector::length(&registry.approved_app_indices);

        // Check if offset is within bounds
        if (offset >= total_approved) {
            return apps
        };

        let end = offset + limit;
        if (end > total_approved) {
            end = total_approved;
        };

        let i = offset;
        while (i < end) {
            let index = *vector::borrow(&registry.approved_app_indices, i);
            let app_opt = big_ordered_map::get(&registry.apps, &index);
            if (option::is_some(&app_opt)) {
                let app = *option::borrow(&app_opt);
                if (app.status == STATUS_APPROVED) {
                    vector::push_back(&mut apps, app);
                };
            };
            i = i + 1;
        };

        apps
    }

    #[view]
    /// Get all apps submitted by a developer
    ///
    /// Returns parallel vectors that are index-aligned:
    /// - First vector contains global `app_index`s for the developer's apps.
    /// - Second vector contains corresponding `AppMetadata` entries at the same indexes.
    ///
    /// # Parameters
    /// * `developer_address` - The developer's account address
    ///
    /// # Returns
    /// * `(vector<u64>, vector<AppMetadata>)` - Pair of vectors `(ids, apps)` such that
    ///   `ids[i]` corresponds to `apps[i]` for all valid indexes
    ///
    /// # Aborts
    /// * `E_NOT_INITIALIZED` - If the registry doesn't exist
    ///
    /// # Usage
    /// - Developer dashboards to list all of a developer's apps with their global ids
    /// - Backends that need to fetch and display per-developer submissions
    /// - Scripts that want to iterate over the developer's app ids and read details
    public fun get_developer_apps(developer_address: address): (vector<u64>, vector<AppMetadata>) acquires AppRegistry {
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global<AppRegistry>(@app_registry);

        let ids_out = vector::empty<u64>();
        let apps_out = vector::empty<AppMetadata>();

        if (big_ordered_map::contains(&registry.developer_index, &developer_address)) {
            let ids = big_ordered_map::borrow(&registry.developer_index, &developer_address);
            let i = 0;
            let len = vector::length(ids);
            while (i < len) {
                let index = *vector::borrow(ids, i);
            if (big_ordered_map::contains(&registry.apps, &index)) {
                let app = big_ordered_map::borrow(&registry.apps, &index);
                    vector::push_back(&mut ids_out, index);
                    vector::push_back(&mut apps_out, *app);
                };
                i = i + 1;
            };
        };

        (ids_out, apps_out)
    }

    #[view]
    /// Get all app addresses registered in the system
    ///
    /// This function returns a complete list of all developer addresses that have submitted apps,
    /// regardless of their approval status (pending, approved, or rejected).
    ///
    /// # Parameters
    ///
    /// # Returns
    /// * `vector<address>` - A vector containing all developer addresses with registered apps
    ///
    /// # Aborts
    /// * `E_NOT_INITIALIZED` - If the registry doesn't exist at the given address
    ///
    /// # Usage
    /// Primarily used by admin dashboards to iterate through all apps in the system
    public fun get_all_app_indices(): vector<u64> acquires AppRegistry {
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global<AppRegistry>(@app_registry);
        registry.app_indices
    }

    #[view]
    /// Get all non-approved apps (pending + rejected) for admin review
    ///
    /// This function returns apps that require admin attention - either pending initial review
    /// or previously rejected.
    ///
    /// # Parameters
    ///
    /// # Returns
    /// * `vector<AppMetadata>` - A vector containing metadata for all pending and rejected apps
    ///
    /// # Aborts
    /// * `E_NOT_INITIALIZED` - If the registry doesn't exist at the given address
    ///
    /// # Usage
    /// Used by the admin dashboard to display apps awaiting moderation or re-review
    public fun get_non_approved_apps(): vector<AppMetadata> acquires AppRegistry {
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global<AppRegistry>(@app_registry);

        let apps = vector::empty<AppMetadata>();
        let i = 0;
        let len = vector::length(&registry.app_indices);

        while (i < len) {
            let index = *vector::borrow(&registry.app_indices, i);
            if (big_ordered_map::contains(&registry.apps, &index)) {
                let app = big_ordered_map::borrow(&registry.apps, &index);
                // Include pending and rejected apps only
                if (app.status == STATUS_PENDING || app.status == STATUS_REJECTED) {
                    vector::push_back(&mut apps, *app);
                };
            };
            i = i + 1;
        };

        apps
    }

    /// Change app status from rejected to approved
    ///
    /// Allows admins to approve a previously rejected app without requiring resubmission.
    /// This is useful for cases where an app was initially rejected but later deemed acceptable,
    /// or when rejection reasons have been addressed without a formal resubmission.
    ///
    /// # Parameters
    /// * `owner` - The admin's signer (must be registered as an owner)
    /// * `developer_address` - The address of the developer whose app should be approved
    ///
    /// # Aborts
    /// * `E_NOT_INITIALIZED` - If the registry doesn't exist at the given address
    /// * `E_NOT_OWNER` - If the caller is not registered as an admin/owner
    /// * `E_APP_NOT_FOUND` - If no app exists for the given developer address
    /// * `E_INVALID_STATUS` - If the app's current status is not STATUS_REJECTED
    ///
    /// # State Changes
    /// * Sets app.status to STATUS_APPROVED
    /// * Updates app.approved_at and app.updated_at timestamps
    /// * Sets app.verified to true
    /// * Increments registry.approved_apps counter
    /// * Adds app_index to registry.approved_app_indices
    ///
    /// # Events
    /// * Emits `AppApprovedEvent` with approval details
    ///
    /// # Access Control
    /// Admin-only function. Only addresses in the registry's `owners` vector can call this.
    public entry fun approve_rejected_app(
        owner: &signer,
        app_index: u64,
    ) acquires AppRegistry {
        let owner_addr = signer::address_of(owner);

        // Get registry
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global_mut<AppRegistry>(@app_registry);

        // Check if caller is owner
        assert!(is_owner(owner_addr, &registry.owners), E_NOT_OWNER);

        // Check if app exists
        assert!(big_ordered_map::contains(&registry.apps, &app_index), E_APP_NOT_FOUND);

        // Get and update app
        let app = big_ordered_map::remove(&mut registry.apps, &app_index);
        assert!(app.status == STATUS_REJECTED, E_INVALID_STATUS);

        app.status = STATUS_APPROVED;
        app.approved_at = timestamp::now_seconds();
        app.updated_at = timestamp::now_seconds();
        app.verified = true;
        big_ordered_map::add(&mut registry.apps, app_index, app);

        // Update counters (rejected apps don't affect pending_apps counter)
        registry.approved_apps = registry.approved_apps + 1;

        // Add to approved apps list
        vector::push_back(&mut registry.approved_app_indices, app_index);

        // Emit event
        event::emit(AppApprovedEvent {
            developer_address: app.developer_address,
            app_name: app.name,
            approved_by: owner_addr,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Change app status from approved back to pending for re-review
    ///
    /// Allows admins to revert an approved app back to pending status when the app needs
    /// additional review. This may be necessary if:
    /// - Policy violations are discovered after approval
    /// - The app requires updates to meet new guidelines
    /// - A mistaken approval needs to be reconsidered
    ///
    /// # Parameters
    /// * `owner` - The admin's signer (must be registered as an owner)
    /// * `developer_address` - The address of the developer whose app should be reverted
    ///
    /// # Aborts
    /// * `E_NOT_INITIALIZED` - If the registry doesn't exist at the given address
    /// * `E_NOT_OWNER` - If the caller is not registered as an admin/owner
    /// * `E_APP_NOT_FOUND` - If no app exists for the given developer address
    /// * `E_INVALID_STATUS` - If the app's current status is not STATUS_APPROVED
    ///
    /// # State Changes
    /// * Sets app.status to STATUS_PENDING
    /// * Updates app.updated_at timestamp
    /// * Sets app.verified to false
    /// * Resets app.approved_at to 0
    /// * Decrements registry.approved_apps counter
    /// * Increments registry.pending_apps counter
    /// * Removes app_index from registry.approved_app_indices
    ///
    /// # Events
    /// * No events are emitted (follows the pattern of reject_app)
    ///
    /// # Access Control
    /// Admin-only function. Only addresses in the registry's `owners` vector can call this.
    ///
    /// # Note
    /// This operation makes the app invisible to public queries (get_all_active_apps) until
    /// it is re-approved. The app remains accessible via get_non_approved_apps for admin review.
    public entry fun revert_to_pending(
        owner: &signer,
        app_index: u64,
    ) acquires AppRegistry {
        let owner_addr = signer::address_of(owner);

        // Get registry
        assert!(exists<AppRegistry>(@app_registry), E_NOT_INITIALIZED);
        let registry = borrow_global_mut<AppRegistry>(@app_registry);

        // Check if caller is owner
        assert!(is_owner(owner_addr, &registry.owners), E_NOT_OWNER);

        // Check if app exists
        assert!(big_ordered_map::contains(&registry.apps, &app_index), E_APP_NOT_FOUND);

        // Get and update app
        let app = big_ordered_map::remove(&mut registry.apps, &app_index);
        assert!(app.status == STATUS_APPROVED, E_INVALID_STATUS);

        app.status = STATUS_PENDING;
        app.updated_at = timestamp::now_seconds();
        app.verified = false;
        app.approved_at = 0;
        big_ordered_map::add(&mut registry.apps, app_index, app);

        // Update counters
        registry.approved_apps = registry.approved_apps - 1;
        registry.pending_apps = registry.pending_apps + 1;

        // Remove from approved apps list
        let (found, index) = vector::index_of(&registry.approved_app_indices, &app_index);
        if (found) {
            vector::remove(&mut registry.approved_app_indices, index);
        };
    }

    // ======== Helper Functions ========

    /// Build a normalized URL key for comparison:
    /// - Strips scheme (http:// or https://)
    /// - Strips a single trailing '/'
    fun normalize_url(url: &String): String {
        let bytes_ref = string::bytes(url);

        // 1) Strip scheme
        let mut_start = 0;
        if (has_prefix(bytes_ref, mut_start, b"https://")) {
            mut_start = mut_start + 8; // len("https://")
        } else if (has_prefix(bytes_ref, mut_start, b"http://")) {
            mut_start = mut_start + 7; // len("http://")
        };

        // 2) Copy from `mut_start` and drop a single trailing '/'
        let out = vector::empty<u8>();
        let i = mut_start;
        let blen = vector::length(bytes_ref);
        while (i < blen) {
            vector::push_back(&mut out, *vector::borrow(bytes_ref, i));
            i = i + 1;
        };
        let out_len = vector::length(&out);
        if (out_len > 0) {
            let last = *vector::borrow(&out, out_len - 1);
            if (last == 47 /* '/' */) { let _ = vector::pop_back(&mut out); };
        };

        string::utf8(out)
    }

    fun has_prefix(bytes_ref: &vector<u8>, start: u64, prefix: vector<u8>): bool {
        let plen = vector::length(&prefix);
        let blen = vector::length(bytes_ref);
        if (blen < start + plen) { return false };
        let i = 0;
        while (i < plen) {
            if (*vector::borrow(bytes_ref, start + i) != *vector::borrow(&prefix, i)) { return false };
            i = i + 1;
        };
        true
    }

    /// Build AppMetadata for a submission (first-time or resubmission)
    fun build_app_metadata(input: SubmissionInput, developer_address: address): AppMetadata {
        AppMetadata {
            name: input.name,
            description: input.description,
            icon: input.icon,
            url: input.url,
            slug: input.slug,
            developer_address: developer_address,
            developer_name: input.developer_name,
            category: input.category,
            language: input.language,
            status: STATUS_PENDING,
            submitted_at: timestamp::now_seconds(),
            updated_at: timestamp::now_seconds(),
            approved_at: 0,
            downloads: 0,
            rating: 0,
            permissions: input.permissions,
            verified: false,
        }
    }

    /// Check if address is in owners list
    fun is_owner(addr: address, owners: &vector<address>): bool {
        vector::contains(owners, &addr)
    }

    /// Check and update rate limiting for submissions
    fun check_and_update_rate_limit(
        submission_records: &mut BigOrderedMap<address, SubmissionRecord>,
        developer_addr: address
    ) {
        let current_time = timestamp::now_seconds();
        // Handle underflow for tests where timestamp might be 0
        let cutoff_time = if (current_time >= RATE_LIMIT_PERIOD_SECONDS) {
            current_time - RATE_LIMIT_PERIOD_SECONDS
        } else {
            0
        };

        // Get or create submission record
        if (!big_ordered_map::contains(submission_records, &developer_addr)) {
            // First submission for this address
            let record = SubmissionRecord {
                timestamps: vector::empty()
            };
            vector::push_back(&mut record.timestamps, current_time);
            big_ordered_map::add(submission_records, developer_addr, record);
            return
        };

        // Get existing record
        let record = big_ordered_map::remove(submission_records, &developer_addr);

        // Clean up old timestamps (outside the rate limit period)
        let cleaned_timestamps = vector::empty<u64>();
        let i = 0;
        let len = vector::length(&record.timestamps);

        while (i < len) {
            let ts = *vector::borrow(&record.timestamps, i);
            if (ts > cutoff_time) {
                vector::push_back(&mut cleaned_timestamps, ts);
            };
            i = i + 1;
        };

        // Check if rate limit exceeded
        assert!(
            vector::length(&cleaned_timestamps) < MAX_SUBMISSIONS_PER_PERIOD,
            E_RATE_LIMIT_EXCEEDED
        );

        // Add current submission
        vector::push_back(&mut cleaned_timestamps, current_time);
        record.timestamps = cleaned_timestamps;
        big_ordered_map::add(submission_records, developer_addr, record);
    }

    // ======== Accessor Functions ========

    /// Get developer address from AppMetadata
    public fun get_app_developer_address(app: &AppMetadata): address {
        app.developer_address
    }

    public fun get_app_slug(app: &AppMetadata): String {
        app.slug
    }

    public fun get_app_name(app: &AppMetadata): String {
        app.name
    }

    public fun get_app_url(app: &AppMetadata): String {
        app.url
    }

    public fun get_app_status(app: &AppMetadata): u8 {
        app.status
    }

    public fun get_app_verified(app: &AppMetadata): bool {
        app.verified
    }

    public fun get_app_description(app: &AppMetadata): String {
        app.description
    }

    public fun get_app_language(app: &AppMetadata): String {
        app.language
    }

    public fun get_app_category(app: &AppMetadata): String {
        app.category
    }

    // ======== Test Functions ========
    #[test_only]
    public fun init_for_test(account: &signer) {
        let account_addr = signer::address_of(account);

        // For tests, store at @app_registry (same as production)
        // Check if already initialized
        assert!(!exists<AppRegistry>(@app_registry), E_ALREADY_INITIALIZED);

        // Create account (automatically registers CoinStore for AptosCoin when coin type is initialized)
        // Note: create_account_for_test is safe to call even if account exists
        account::create_account_for_test(@app_registry);

        // Create registry
        let registry = AppRegistry {
            apps: big_ordered_map::new_with_config(0, 0, false),
            pending_changes: big_ordered_map::new_with_config(0, 0, false),
            submission_records: big_ordered_map::new_with_config(0, 0, false),
            owners: vector::empty(),
            total_apps: 0,
            approved_apps: 0,
            pending_apps: 0,
            next_app_index: 0,
            app_indices: vector::empty(),
            approved_app_indices: vector::empty(),
            developer_index: big_ordered_map::new_with_config(0, 0, false),
            treasury_address: @app_registry,
            submit_fee: 1000000000,  // 10 MOVE in octas
        };

        // Add test account as initial owner
        vector::push_back(&mut registry.owners, account_addr);

        // For tests, we need to ensure the account at @app_registry exists
        // The test annotation should set registry = @app_registry
        move_to(account, registry);
    }
}
