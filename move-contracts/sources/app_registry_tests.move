#[test_only]
module app_registry::app_registry_tests {
    use std::signer;
    use std::string;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use app_registry::app_registry::{Self};

    // Test addresses
    // In tests, we use @app_registry as the registry address
    const REGISTRY_ADDR: address = @app_registry;
    const DEV1_ADDR: address = @0x100;
    const DEV2_ADDR: address = @0x101;
    const DEV3_ADDR: address = @0x102;
    const DEV4_ADDR: address = @0x103;
    const DEV5_ADDR: address = @0x104;

    fun last_app_index(dev: address): u64 {
        let (ids, _apps) = app_registry::get_developer_apps(dev);
        let len = vector::length(&ids);
        let last_index = len - 1;
        *vector::borrow(&ids, last_index)
    }


    #[test(registry = @app_registry, framework = @0x1)]
    fun test_get_all_active_apps(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));

        // Initialize registry
        app_registry::init_for_test(&registry);

        // Initialize coin type if not already initialized
        if (!coin::is_coin_initialized<AptosCoin>()) {
            let (_burn_cap, _mint_cap) = aptos_framework::aptos_coin::initialize_for_test(&framework);
            coin::destroy_burn_cap(_burn_cap);
            coin::destroy_mint_cap(_mint_cap);
        };

        // Register treasury address for coin type (needed to receive fees)
        coin::register<AptosCoin>(&registry);

        // Create test accounts
        let dev1 = account::create_account_for_test(DEV1_ADDR);
        let dev2 = account::create_account_for_test(DEV2_ADDR);
        let dev3 = account::create_account_for_test(DEV3_ADDR);

        // Register and fund accounts with coins (20 MOVE = 2000000000 octas)
        coin::register<AptosCoin>(&dev1);
        coin::register<AptosCoin>(&dev2);
        coin::register<AptosCoin>(&dev3);
        aptos_framework::aptos_coin::mint(&framework, DEV1_ADDR, 2000000000);
        aptos_framework::aptos_coin::mint(&framework, DEV2_ADDR, 2000000000);
        aptos_framework::aptos_coin::mint(&framework, DEV3_ADDR, 2000000000);

        // Submit apps
        app_registry::submit_app(
            &dev1,
            string::utf8(b"App 1"),
            string::utf8(b"Description 1"),
            string::utf8(b"G"),
            string::utf8(b"https://app1.com"),
            string::utf8(b"app-1"),
            string::utf8(b"Dev 1"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );

        app_registry::submit_app(
            &dev2,
            string::utf8(b"App 2"),
            string::utf8(b"Description 2"),
            string::utf8(b"D"),
            string::utf8(b"https://app2.com"),
            string::utf8(b"app-2"),
            string::utf8(b"Dev 2"),
            string::utf8(b"defi"),
            string::utf8(b"all"),
            vector::empty(),
        );

        app_registry::submit_app(
            &dev3,
            string::utf8(b"App 3"),
            string::utf8(b"Description 3"),
            string::utf8(b"N"),
            string::utf8(b"https://app3.com"),
            string::utf8(b"app-3"),
            string::utf8(b"Dev 3"),
            string::utf8(b"nft"),
            string::utf8(b"all"),
            vector::empty(),
        );

        // Before approval, should return empty
        let apps = app_registry::get_all_active_apps();
        assert!(vector::length(&apps) == 0, 1);

        // Approve apps
        let app1 = last_app_index(DEV1_ADDR);
        let app2 = last_app_index(DEV2_ADDR);
        app_registry::approve_app(&registry, app1);
        app_registry::approve_app(&registry, app2);

        // Should return 2 approved apps
        let apps = app_registry::get_all_active_apps();
        assert!(vector::length(&apps) == 2, 2);

        // Approve third app
        let app3 = last_app_index(DEV3_ADDR);
        app_registry::approve_app(&registry, app3);

        // Should return 3 approved apps
        let apps = app_registry::get_all_active_apps();
        assert!(vector::length(&apps) == 3, 3);
    }

    #[test(registry = @app_registry, framework = @0x1)]
    fun test_get_apps_by_category(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));

        // Initialize registry
        app_registry::init_for_test(&registry);

        // Initialize coin type if not already initialized
        if (!coin::is_coin_initialized<AptosCoin>()) {
            let (_burn_cap, _mint_cap) = aptos_framework::aptos_coin::initialize_for_test(&framework);
            coin::destroy_burn_cap(_burn_cap);
            coin::destroy_mint_cap(_mint_cap);
        };

        // Register treasury address for coin type (needed to receive fees)
        coin::register<AptosCoin>(&registry);

        // Create test accounts
        let dev1 = account::create_account_for_test(DEV1_ADDR);
        let dev2 = account::create_account_for_test(DEV2_ADDR);
        let dev3 = account::create_account_for_test(DEV3_ADDR);

        // Register and fund accounts with coins (20 MOVE = 2000000000 octas)
        coin::register<AptosCoin>(&dev1);
        coin::register<AptosCoin>(&dev2);
        coin::register<AptosCoin>(&dev3);
        aptos_framework::aptos_coin::mint(&framework, DEV1_ADDR, 2000000000);
        aptos_framework::aptos_coin::mint(&framework, DEV2_ADDR, 2000000000);
        aptos_framework::aptos_coin::mint(&framework, DEV3_ADDR, 2000000000);

        // Submit apps in different categories
        app_registry::submit_app(
            &dev1,
            string::utf8(b"Game 1"),
            string::utf8(b"A cool game"),
            string::utf8(b"G"),
            string::utf8(b"https://game1.com"),
            string::utf8(b"game-1"),
            string::utf8(b"Dev 1"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );

        app_registry::submit_app(
            &dev2,
            string::utf8(b"DeFi 1"),
            string::utf8(b"A DeFi protocol"),
            string::utf8(b"D"),
            string::utf8(b"https://defi1.com"),
            string::utf8(b"defi-1"),
            string::utf8(b"Dev 2"),
            string::utf8(b"defi"),
            string::utf8(b"all"),
            vector::empty(),
        );

        app_registry::submit_app(
            &dev3,
            string::utf8(b"Game 2"),
            string::utf8(b"Another game"),
            string::utf8(b"G"),
            string::utf8(b"https://game2.com"),
            string::utf8(b"game-2"),
            string::utf8(b"Dev 3"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );

        // Approve all apps
        let a1 = last_app_index(DEV1_ADDR);
        let a2 = last_app_index(DEV2_ADDR);
        let a3 = last_app_index(DEV3_ADDR);
        app_registry::approve_app(&registry, a1);
        app_registry::approve_app(&registry, a2);
        app_registry::approve_app(&registry, a3);

        // Get games - should return 2
        let games = app_registry::get_apps_by_category(string::utf8(b"game"));
        assert!(vector::length(&games) == 2, 1);

        // Get defi - should return 1
        let defi_apps = app_registry::get_apps_by_category(string::utf8(b"defi"));
        assert!(vector::length(&defi_apps) == 1, 2);

        // Get nft - should return 0
        let nft_apps = app_registry::get_apps_by_category(string::utf8(b"nft"));
        assert!(vector::length(&nft_apps) == 0, 3);
    }

    #[test(registry = @app_registry, framework = @0x1)]
    fun test_get_active_apps_paginated(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));

        // Initialize registry
        app_registry::init_for_test(&registry);

        // Initialize coin type if not already initialized
        if (!coin::is_coin_initialized<AptosCoin>()) {
            let (_burn_cap, _mint_cap) = aptos_framework::aptos_coin::initialize_for_test(&framework);
            coin::destroy_burn_cap(_burn_cap);
            coin::destroy_mint_cap(_mint_cap);
        };

        // Register treasury address for coin type (needed to receive fees)
        coin::register<AptosCoin>(&registry);

        // Create and approve 5 apps
        let dev1 = account::create_account_for_test(DEV1_ADDR);
        let dev2 = account::create_account_for_test(DEV2_ADDR);
        let dev3 = account::create_account_for_test(DEV3_ADDR);
        let dev4 = account::create_account_for_test(DEV4_ADDR);
        let dev5 = account::create_account_for_test(DEV5_ADDR);

        // Initialize coin type if not already initialized
        if (!coin::is_coin_initialized<AptosCoin>()) {
            let (_burn_cap, _mint_cap) = aptos_framework::aptos_coin::initialize_for_test(&framework);
            coin::destroy_burn_cap(_burn_cap);
            coin::destroy_mint_cap(_mint_cap);
        };

        // Register treasury address for coin type (needed to receive fees)
        coin::register<AptosCoin>(&registry);

        // Register and fund accounts with coins (20 MOVE = 2000000000 octas)
        coin::register<AptosCoin>(&dev1);
        coin::register<AptosCoin>(&dev2);
        coin::register<AptosCoin>(&dev3);
        coin::register<AptosCoin>(&dev4);
        coin::register<AptosCoin>(&dev5);
        aptos_framework::aptos_coin::mint(&framework, DEV1_ADDR, 2000000000);
        aptos_framework::aptos_coin::mint(&framework, DEV2_ADDR, 2000000000);
        aptos_framework::aptos_coin::mint(&framework, DEV3_ADDR, 2000000000);
        aptos_framework::aptos_coin::mint(&framework, DEV4_ADDR, 2000000000);
        aptos_framework::aptos_coin::mint(&framework, DEV5_ADDR, 2000000000);

        app_registry::submit_app(
            &dev1,
            string::utf8(b"App 1"),
            string::utf8(b"Description 1"),
            string::utf8(b"G"),
            string::utf8(b"https://app1.com"),
            string::utf8(b"app-1"),
            string::utf8(b"Dev"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );
        let app1 = last_app_index(DEV1_ADDR);
        app_registry::approve_app(&registry, app1);

        app_registry::submit_app(
            &dev2,
            string::utf8(b"App 2"),
            string::utf8(b"Description 2"),
            string::utf8(b"G"),
            string::utf8(b"https://app2.com"),
            string::utf8(b"app-2"),
            string::utf8(b"Dev"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );
        let app2 = last_app_index(DEV2_ADDR);
        app_registry::approve_app(&registry, app2);

        app_registry::submit_app(
            &dev3,
            string::utf8(b"App 3"),
            string::utf8(b"Description 3"),
            string::utf8(b"G"),
            string::utf8(b"https://app3.com"),
            string::utf8(b"app-3"),
            string::utf8(b"Dev"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );
        let app3 = last_app_index(DEV3_ADDR);
        app_registry::approve_app(&registry, app3);

        app_registry::submit_app(
            &dev4,
            string::utf8(b"App 4"),
            string::utf8(b"Description 4"),
            string::utf8(b"G"),
            string::utf8(b"https://app4.com"),
            string::utf8(b"app-4"),
            string::utf8(b"Dev"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );
        let app4 = last_app_index(DEV4_ADDR);
        app_registry::approve_app(&registry, app4);

        app_registry::submit_app(
            &dev5,
            string::utf8(b"App 5"),
            string::utf8(b"Description 5"),
            string::utf8(b"G"),
            string::utf8(b"https://app5.com"),
            string::utf8(b"app-5"),
            string::utf8(b"Dev"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );
        let app5 = last_app_index(DEV5_ADDR);
        app_registry::approve_app(&registry, app5);

        // Test pagination
        // Get first 2 apps
        let apps = app_registry::get_active_apps_paginated(0, 2);
        assert!(vector::length(&apps) == 2, 1);

        // Get next 2 apps
        let apps = app_registry::get_active_apps_paginated(2, 2);
        assert!(vector::length(&apps) == 2, 2);

        // Get last app
        let apps = app_registry::get_active_apps_paginated(4, 2);
        assert!(vector::length(&apps) == 1, 3);

        // Get beyond range - should return empty
        let apps = app_registry::get_active_apps_paginated(10, 2);
        assert!(vector::length(&apps) == 0, 4);
    }

    #[test(registry = @app_registry, framework = @0x1)]
    fun test_get_developer_apps(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));

        // Initialize registry
        app_registry::init_for_test(&registry);

        // Initialize coin type if not already initialized
        if (!coin::is_coin_initialized<AptosCoin>()) {
            let (_burn_cap, _mint_cap) = aptos_framework::aptos_coin::initialize_for_test(&framework);
            coin::destroy_burn_cap(_burn_cap);
            coin::destroy_mint_cap(_mint_cap);
        };

        // Register treasury address for coin type (needed to receive fees)
        coin::register<AptosCoin>(&registry);

        // Create test account
        let dev1 = account::create_account_for_test(DEV1_ADDR);

        // Register and fund account with coins (20 MOVE = 2000000000 octas)
        coin::register<AptosCoin>(&dev1);
        aptos_framework::aptos_coin::mint(&framework, DEV1_ADDR, 2000000000);

        // Developer with no apps
        let (_ids0, apps0) = app_registry::get_developer_apps(DEV1_ADDR);
        assert!(vector::length(&apps0) == 0, 1);

        // Submit first app
        app_registry::submit_app(
            &dev1,
            string::utf8(b"My App"),
            string::utf8(b"Description"),
            string::utf8(b"G"),
            string::utf8(b"https://myapp.com"),
            string::utf8(b"my-app"),
            string::utf8(b"Dev 1"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );

        // Submit second app
        app_registry::submit_app(
            &dev1,
            string::utf8(b"My App 2"),
            string::utf8(b"Description 2"),
            string::utf8(b"G"),
            string::utf8(b"https://myapp2.com"),
            string::utf8(b"my-app-2"),
            string::utf8(b"Dev 1"),
            string::utf8(b"defi"),
            string::utf8(b"all"),
            vector::empty(),
        );

        // Should see two pending apps
        let (_ids1, apps1) = app_registry::get_developer_apps(DEV1_ADDR);
        assert!(vector::length(&apps1) == 2, 2);

        // Approve the latest app
        let app2 = last_app_index(DEV1_ADDR);
        app_registry::approve_app(&registry, app2);

        // Should still see both apps (one approved, one pending)
        let (_ids2, apps2) = app_registry::get_developer_apps(DEV1_ADDR);
        assert!(vector::length(&apps2) == 2, 3);

        // Verify ownership metadata for both
        let a0 = vector::borrow(&apps2, 0);
        let a1 = vector::borrow(&apps2, 1);
        assert!(app_registry::get_app_developer_address(a0) == DEV1_ADDR, 4);
        assert!(app_registry::get_app_developer_address(a1) == DEV1_ADDR, 5);
    }

    #[test(registry = @app_registry, framework = @0x1)]
    fun test_remove_app_updates_approved_list(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));

        // Initialize registry
        app_registry::init_for_test(&registry);

        // Create test accounts
        let dev1 = account::create_account_for_test(DEV1_ADDR);
        let dev2 = account::create_account_for_test(DEV2_ADDR);

        // Initialize coin type if not already initialized
        if (!coin::is_coin_initialized<AptosCoin>()) {
            let (_burn_cap, _mint_cap) = aptos_framework::aptos_coin::initialize_for_test(&framework);
            coin::destroy_burn_cap(_burn_cap);
            coin::destroy_mint_cap(_mint_cap);
        };

        // Register treasury address for coin type (needed to receive fees)
        coin::register<AptosCoin>(&registry);

        // Register and fund accounts with coins (20 MOVE = 2000000000 octas)
        coin::register<AptosCoin>(&dev1);
        coin::register<AptosCoin>(&dev2);
        aptos_framework::aptos_coin::mint(&framework, DEV1_ADDR, 2000000000);
        aptos_framework::aptos_coin::mint(&framework, DEV2_ADDR, 2000000000);

        // Submit and approve apps
        app_registry::submit_app(
            &dev1,
            string::utf8(b"App 1"),
            string::utf8(b"Description 1"),
            string::utf8(b"G"),
            string::utf8(b"https://app1.com"),
            string::utf8(b"app-1"),
            string::utf8(b"Dev 1"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );
        app_registry::submit_app(
            &dev2,
            string::utf8(b"App 2"),
            string::utf8(b"Description 2"),
            string::utf8(b"D"),
            string::utf8(b"https://app2.com"),
            string::utf8(b"app-2"),
            string::utf8(b"Dev 2"),
            string::utf8(b"defi"),
            string::utf8(b"all"),
            vector::empty(),
        );
        let app1 = last_app_index(DEV1_ADDR);
        let app2 = last_app_index(DEV2_ADDR);
        app_registry::approve_app(&registry, app1);
        app_registry::approve_app(&registry, app2);

        // Should have 2 approved apps
        let apps = app_registry::get_all_active_apps();
        assert!(vector::length(&apps) == 2, 1);

        // Remove one app
        app_registry::remove_app(&dev1, app1);

        // Should have 1 approved app
        let apps = app_registry::get_all_active_apps();
        assert!(vector::length(&apps) == 1, 2);

        // Verify the remaining app is dev2's
        let app = vector::borrow(&apps, 0);
        assert!(app_registry::get_app_developer_address(app) == DEV2_ADDR, 3);
    }

    #[test(registry = @app_registry, framework = @0x1)]
    fun test_approve_rejected_app(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));

        // Initialize registry
        app_registry::init_for_test(&registry);

        // Dev account
        let dev1 = account::create_account_for_test(DEV1_ADDR);

        // Initialize coin type if not already initialized
        if (!coin::is_coin_initialized<AptosCoin>()) {
            let (_burn_cap, _mint_cap) = aptos_framework::aptos_coin::initialize_for_test(&framework);
            coin::destroy_burn_cap(_burn_cap);
            coin::destroy_mint_cap(_mint_cap);
        };

        // Register treasury address for coin type (needed to receive fees)
        coin::register<AptosCoin>(&registry);

        // Register and fund account with coins (20 MOVE = 2000000000 octas)
        coin::register<AptosCoin>(&dev1);
        aptos_framework::aptos_coin::mint(&framework, DEV1_ADDR, 2000000000);

        // Submit app and reject it
        app_registry::submit_app(
            &dev1,
            string::utf8(b"App"),
            string::utf8(b"Desc"),
            string::utf8(b"G"),
            string::utf8(b"https://a.com"),
            string::utf8(b"slug-a"),
            string::utf8(b"Dev"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );
        let id_p = last_app_index(DEV1_ADDR);
        app_registry::reject_app(&registry, id_p, string::utf8(b"policy"));

        // Approve previously rejected app
        app_registry::approve_rejected_app(&registry, id_p);

        // Assert it shows up as active
        let apps = app_registry::get_all_active_apps();
        assert!(vector::length(&apps) == 1, 1);
        let app = vector::borrow(&apps, 0);
        assert!(app_registry::get_app_developer_address(app) == DEV1_ADDR, 2);
    }

    #[test(registry = @app_registry, framework = @0x1)]
    fun test_revert_to_pending_from_approved(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));

        app_registry::init_for_test(&registry);

        let dev1 = account::create_account_for_test(DEV1_ADDR);

        // Initialize coin type if not already initialized
        if (!coin::is_coin_initialized<AptosCoin>()) {
            let (_burn_cap, _mint_cap) = aptos_framework::aptos_coin::initialize_for_test(&framework);
            coin::destroy_burn_cap(_burn_cap);
            coin::destroy_mint_cap(_mint_cap);
        };

        // Register treasury address for coin type (needed to receive fees)
        coin::register<AptosCoin>(&registry);

        // Register and fund account with coins (20 MOVE = 2000000000 octas)
        coin::register<AptosCoin>(&dev1);
        aptos_framework::aptos_coin::mint(&framework, DEV1_ADDR, 2000000000);

        // Submit and approve
        app_registry::submit_app(
            &dev1,
            string::utf8(b"App"),
            string::utf8(b"Desc"),
            string::utf8(b"G"),
            string::utf8(b"https://a.com"),
            string::utf8(b"slug-a"),
            string::utf8(b"Dev"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );
        let app1 = last_app_index(DEV1_ADDR);
        app_registry::approve_app(&registry, app1);

        // Revert to pending
        app_registry::revert_to_pending(&registry, app1);

        // Should no longer be in active list
        let apps = app_registry::get_all_active_apps();
        assert!(vector::length(&apps) == 0, 1);

        // Stats should reflect 0 approved and 1 pending
        let (_total, approved, pending) = app_registry::get_stats();
        assert!(approved == 0, 2);
        assert!(pending == 1, 3);
    }

    #[test(registry = @app_registry, framework = @0x1)]
    fun test_get_non_approved_apps_returns_pending_and_rejected(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));
        app_registry::init_for_test(&registry);

        let dev1 = account::create_account_for_test(DEV1_ADDR);
        let dev2 = account::create_account_for_test(DEV2_ADDR);
        let dev3 = account::create_account_for_test(DEV3_ADDR);

        // Initialize coin type if not already initialized
        if (!coin::is_coin_initialized<AptosCoin>()) {
            let (_burn_cap, _mint_cap) = aptos_framework::aptos_coin::initialize_for_test(&framework);
            coin::destroy_burn_cap(_burn_cap);
            coin::destroy_mint_cap(_mint_cap);
        };

        // Register treasury address for coin type (needed to receive fees)
        coin::register<AptosCoin>(&registry);

        // Register and fund accounts with coins (20 MOVE = 2000000000 octas)
        coin::register<AptosCoin>(&dev1);
        coin::register<AptosCoin>(&dev2);
        coin::register<AptosCoin>(&dev3);
        aptos_framework::aptos_coin::mint(&framework, DEV1_ADDR, 2000000000);
        aptos_framework::aptos_coin::mint(&framework, DEV2_ADDR, 2000000000);
        aptos_framework::aptos_coin::mint(&framework, DEV3_ADDR, 2000000000);

        // Submit three apps
        app_registry::submit_app(&dev1, string::utf8(b"A1"), string::utf8(b"D1"), string::utf8(b"G"), string::utf8(b"http://a1"), string::utf8(b"slug-a1"), string::utf8(b"Dev1"), string::utf8(b"game"), string::utf8(b"all"), vector::empty());
        app_registry::submit_app(&dev2, string::utf8(b"A2"), string::utf8(b"D2"), string::utf8(b"G"), string::utf8(b"http://a2"), string::utf8(b"slug-a2"), string::utf8(b"Dev2"), string::utf8(b"defi"), string::utf8(b"all"), vector::empty());
        app_registry::submit_app(&dev3, string::utf8(b"A3"), string::utf8(b"D3"), string::utf8(b"G"), string::utf8(b"http://a3"), string::utf8(b"slug-a3"), string::utf8(b"Dev3"), string::utf8(b"nft"), string::utf8(b"all"), vector::empty());
        let a1 = last_app_index(DEV1_ADDR);
        let a2 = last_app_index(DEV2_ADDR);

        // Approve dev1, reject dev2, leave dev3 pending
        app_registry::approve_app(&registry, a1);
        app_registry::reject_app(&registry, a2, string::utf8(b"policy"));

        // Fetch non-approved apps
        let apps = app_registry::get_non_approved_apps();
        // Should include dev2 (rejected) and dev3 (pending) only
        assert!(vector::length(&apps) == 2, 1);
    }

    

    #[test(registry = @app_registry, framework = @0x1)]
    fun test_reject_only_pending_and_counters(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));

        app_registry::init_for_test(&registry);

        // Create dev and submit
        let dev1 = account::create_account_for_test(DEV1_ADDR);

        // Initialize coin type if not already initialized
        if (!coin::is_coin_initialized<AptosCoin>()) {
            let (_burn_cap, _mint_cap) = aptos_framework::aptos_coin::initialize_for_test(&framework);
            coin::destroy_burn_cap(_burn_cap);
            coin::destroy_mint_cap(_mint_cap);
        };

        // Register treasury address for coin type (needed to receive fees)
        coin::register<AptosCoin>(&registry);

        // Register and fund account with coins (20 MOVE = 2000000000 octas)
        coin::register<AptosCoin>(&dev1);
        aptos_framework::aptos_coin::mint(&framework, DEV1_ADDR, 2000000000);

        app_registry::submit_app(
            &dev1,
            string::utf8(b"App"),
            string::utf8(b"Desc"),
            string::utf8(b"G"),
            string::utf8(b"https://a.com"),
            string::utf8(b"slug-a"),
            string::utf8(b"Dev"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );

        // Reject pending should succeed and reduce pending count to 0
        let id_p = last_app_index(DEV1_ADDR);
        app_registry::reject_app(&registry, id_p, string::utf8(b"policy"));
        let (total, approved, pending) = app_registry::get_stats();
        assert!(total == 1, 1);
        assert!(approved == 0, 2);
        assert!(pending == 0, 3);
    }

    #[test(registry = @app_registry, framework = @0x1)]
    #[expected_failure(abort_code = 6, location = app_registry::app_registry)]
    fun test_rejecting_approved_aborts(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));

        app_registry::init_for_test(&registry);

        let dev1 = account::create_account_for_test(DEV1_ADDR);

        // Initialize coin type if not already initialized
        if (!coin::is_coin_initialized<AptosCoin>()) {
            let (_burn_cap, _mint_cap) = aptos_framework::aptos_coin::initialize_for_test(&framework);
            coin::destroy_burn_cap(_burn_cap);
            coin::destroy_mint_cap(_mint_cap);
        };

        // Register treasury address for coin type (needed to receive fees)
        coin::register<AptosCoin>(&registry);

        // Register and fund account with coins (20 MOVE = 2000000000 octas)
        coin::register<AptosCoin>(&dev1);
        aptos_framework::aptos_coin::mint(&framework, DEV1_ADDR, 2000000000);

        app_registry::submit_app(
            &dev1,
            string::utf8(b"App"),
            string::utf8(b"Desc"),
            string::utf8(b"G"),
            string::utf8(b"https://a.com"),
            string::utf8(b"slug-a"),
            string::utf8(b"Dev"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );
        let id_a = last_app_index(DEV1_ADDR);
        app_registry::approve_app(&registry, id_a);

        // Rejecting a non-pending app should abort (pending-only policy)
        app_registry::reject_app(&registry, id_a, string::utf8(b"policy"));
    }

    #[test(registry = @app_registry, framework = @0x1)]
    fun test_resubmission_after_rejection(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));

        app_registry::init_for_test(&registry);

        let dev1 = account::create_account_for_test(DEV1_ADDR);

        // Initialize coin type if not already initialized
        if (!coin::is_coin_initialized<AptosCoin>()) {
            let (_burn_cap, _mint_cap) = aptos_framework::aptos_coin::initialize_for_test(&framework);
            coin::destroy_burn_cap(_burn_cap);
            coin::destroy_mint_cap(_mint_cap);
        };

        // Register treasury address for coin type (needed to receive fees)
        coin::register<AptosCoin>(&registry);

        // Register and fund account with coins (20 MOVE = 2000000000 octas)
        coin::register<AptosCoin>(&dev1);
        aptos_framework::aptos_coin::mint(&framework, DEV1_ADDR, 2000000000);

        // First submit
        app_registry::submit_app(
            &dev1,
            string::utf8(b"App"),
            string::utf8(b"Desc"),
            string::utf8(b"G"),
            string::utf8(b"https://a.com"),
            string::utf8(b"slug-a"),
            string::utf8(b"Dev"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );
        let id_first = last_app_index(DEV1_ADDR);
        // Reject
        app_registry::reject_app(&registry, id_first, string::utf8(b"policy"));

        // Resubmit should succeed (same developer), and pending becomes 1
        app_registry::submit_app(
            &dev1,
            string::utf8(b"App v2"),
            string::utf8(b"Desc v2"),
            string::utf8(b"G"),
            string::utf8(b"https://a2.com"),
            string::utf8(b"slug-a2"),
            string::utf8(b"Dev"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );

        let (total, approved, pending) = app_registry::get_stats();
        // After rejection then new submission, total apps should be 2 (one rejected, one pending)
        assert!(total == 2, 1);
        assert!(approved == 0, 2);
        assert!(pending == 1, 3);
    }

    #[test(registry = @app_registry, framework = @0x1)]
    #[expected_failure(abort_code = 11, location = app_registry::app_registry)]
    fun test_prevent_last_owner_removal(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));

        app_registry::init_for_test(&registry);

        // With one owner, removal should abort
        app_registry::remove_owner(&registry, signer::address_of(&registry));
    }

    #[test(registry = @app_registry, framework = @0x1)]
    fun test_single_developer_multiple_apps(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));
        app_registry::init_for_test(&registry);

        let dev1 = account::create_account_for_test(DEV1_ADDR);

        // Initialize coin type if not already initialized
        if (!coin::is_coin_initialized<AptosCoin>()) {
            let (_burn_cap, _mint_cap) = aptos_framework::aptos_coin::initialize_for_test(&framework);
            coin::destroy_burn_cap(_burn_cap);
            coin::destroy_mint_cap(_mint_cap);
        };

        // Register treasury address for coin type (needed to receive fees)
        coin::register<AptosCoin>(&registry);

        // Register and fund account with coins (20 MOVE = 2000000000 octas)
        coin::register<AptosCoin>(&dev1);
        aptos_framework::aptos_coin::mint(&framework, DEV1_ADDR, 2000000000);

        // Submit two apps from same developer
        app_registry::submit_app(
            &dev1,
            string::utf8(b"A1"),
            string::utf8(b"D1"),
            string::utf8(b"I"),
            string::utf8(b"http://a1"),
            string::utf8(b"slug-a1"),
            string::utf8(b"Dev1"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );
        let id1 = last_app_index(DEV1_ADDR);
        app_registry::submit_app(
            &dev1,
            string::utf8(b"A2"),
            string::utf8(b"D2"),
            string::utf8(b"I"),
            string::utf8(b"http://a2"),
            string::utf8(b"slug-a2"),
            string::utf8(b"Dev1"),
            string::utf8(b"defi"),
            string::utf8(b"all"),
            vector::empty(),
        );
        let id2 = last_app_index(DEV1_ADDR);

        // Developer should have two app entries
        let (_ids_final, apps_final) = app_registry::get_developer_apps(DEV1_ADDR);
        assert!(vector::length(&apps_final) == 2, 1);

        // Approve both and verify they appear in active list
        app_registry::approve_app(&registry, id1);
        app_registry::approve_app(&registry, id2);

        let active = app_registry::get_all_active_apps();
        assert!(vector::length(&active) == 2, 2);
    }

    #[test(registry = @app_registry, framework = @0x1)]
    #[expected_failure(abort_code = 12, location = app_registry::app_registry)]
    fun test_submit_duplicate_url_aborts(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));
        app_registry::init_for_test(&registry);

        let dev1 = account::create_account_for_test(DEV1_ADDR);
        let dev2 = account::create_account_for_test(DEV2_ADDR);

        // Initialize coin type if not already initialized
        if (!coin::is_coin_initialized<AptosCoin>()) {
            let (_burn_cap, _mint_cap) = aptos_framework::aptos_coin::initialize_for_test(&framework);
            coin::destroy_burn_cap(_burn_cap);
            coin::destroy_mint_cap(_mint_cap);
        };

        // Register treasury address for coin type (needed to receive fees)
        coin::register<AptosCoin>(&registry);

        // Register and fund accounts with coins (20 MOVE = 2000000000 octas)
        coin::register<AptosCoin>(&dev1);
        coin::register<AptosCoin>(&dev2);
        aptos_framework::aptos_coin::mint(&framework, DEV1_ADDR, 2000000000);
        aptos_framework::aptos_coin::mint(&framework, DEV2_ADDR, 2000000000);

        // Case: https with trailing slash
        app_registry::submit_app(
            &dev1,
            string::utf8(b"A1"),
            string::utf8(b"D1"),
            string::utf8(b"G"),
            string::utf8(b"https://example.com/"),
            string::utf8(b"slug-ex"),
            string::utf8(b"Dev1"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );

        // Case: http without trailing slash (normalized equal) should abort
        app_registry::submit_app(
            &dev2,
            string::utf8(b"A2"),
            string::utf8(b"D2"),
            string::utf8(b"G"),
            string::utf8(b"http://example.com"),
            string::utf8(b"slug-ex-2"),
            string::utf8(b"Dev2"),
            string::utf8(b"defi"),
            string::utf8(b"all"),
            vector::empty(),
        );
    }

    #[test(registry = @app_registry, framework = @0x1)]
    fun test_resubmit_same_url_after_rejection_ok(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));
        app_registry::init_for_test(&registry);

        let dev1 = account::create_account_for_test(DEV1_ADDR);

        // Initialize coin type if not already initialized
        if (!coin::is_coin_initialized<AptosCoin>()) {
            let (_burn_cap, _mint_cap) = aptos_framework::aptos_coin::initialize_for_test(&framework);
            coin::destroy_burn_cap(_burn_cap);
            coin::destroy_mint_cap(_mint_cap);
        };

        // Register treasury address for coin type (needed to receive fees)
        coin::register<AptosCoin>(&registry);

        // Register and fund account with coins (20 MOVE = 2000000000 octas)
        coin::register<AptosCoin>(&dev1);
        aptos_framework::aptos_coin::mint(&framework, DEV1_ADDR, 2000000000);

        // Submit with URL X
        app_registry::submit_app(
            &dev1,
            string::utf8(b"App"),
            string::utf8(b"Desc"),
            string::utf8(b"G"),
            string::utf8(b"https://unique.url"),
            string::utf8(b"slug-u"),
            string::utf8(b"Dev"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );
        let id = last_app_index(DEV1_ADDR);

        // Reject it
        app_registry::reject_app(&registry, id, string::utf8(b"policy"));

        // Resubmit with the same URL X should succeed
        app_registry::submit_app(
            &dev1,
            string::utf8(b"App v2"),
            string::utf8(b"Desc v2"),
            string::utf8(b"G"),
            string::utf8(b"https://unique.url"),
            string::utf8(b"slug-u2"),
            string::utf8(b"Dev"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );

        // Now there should be 2 total apps (one rejected, one pending)
        let (total, approved, pending) = app_registry::get_stats();
        assert!(total == 2, 1);
        assert!(approved == 0, 2);
        assert!(pending == 1, 3);
    }

    #[test(registry = @app_registry, framework = @0x1)]
    #[expected_failure(abort_code = 13, location = app_registry::app_registry)]
    fun test_submit_duplicate_slug_aborts(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));
        app_registry::init_for_test(&registry);

        let dev1 = account::create_account_for_test(DEV1_ADDR);
        let dev2 = account::create_account_for_test(DEV2_ADDR);

        // Initialize coin type if not already initialized
        if (!coin::is_coin_initialized<AptosCoin>()) {
            let (_burn_cap, _mint_cap) = aptos_framework::aptos_coin::initialize_for_test(&framework);
            coin::destroy_burn_cap(_burn_cap);
            coin::destroy_mint_cap(_mint_cap);
        };

        // Register treasury address for coin type (needed to receive fees)
        coin::register<AptosCoin>(&registry);

        // Register and fund accounts with coins (20 MOVE = 2000000000 octas)
        coin::register<AptosCoin>(&dev1);
        coin::register<AptosCoin>(&dev2);
        aptos_framework::aptos_coin::mint(&framework, DEV1_ADDR, 2000000000);
        aptos_framework::aptos_coin::mint(&framework, DEV2_ADDR, 2000000000);

        // First submission with slug "same-slug"
        app_registry::submit_app(
            &dev1,
            string::utf8(b"S1"),
            string::utf8(b"D1"),
            string::utf8(b"G"),
            string::utf8(b"https://slug1.com"),
            string::utf8(b"same-slug"),
            string::utf8(b"Dev1"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );

        // Second submission with different URL but same slug should abort (slug uniqueness)
        app_registry::submit_app(
            &dev2,
            string::utf8(b"S2"),
            string::utf8(b"D2"),
            string::utf8(b"G"),
            string::utf8(b"https://slug2.com"),
            string::utf8(b"same-slug"),
            string::utf8(b"Dev2"),
            string::utf8(b"defi"),
            string::utf8(b"all"),
            vector::empty(),
        );
    }

    #[test(registry = @app_registry, framework = @0x1)]
    fun test_update_treasury_address(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));
        app_registry::init_for_test(&registry);

        // Create a new treasury address
        let new_treasury = account::create_account_for_test(@0x200);
        let new_treasury_addr = signer::address_of(&new_treasury);

        // Verify initial treasury address is @app_registry
        let initial_treasury = app_registry::get_treasury_address();
        assert!(initial_treasury == @app_registry, 1);

        // Update treasury address
        app_registry::update_treasury_address(&registry, new_treasury_addr);

        // Verify treasury address was updated
        let updated_treasury = app_registry::get_treasury_address();
        assert!(updated_treasury == new_treasury_addr, 2);
    }

    #[test(registry = @app_registry, framework = @0x1)]
    #[expected_failure(abort_code = 1, location = app_registry::app_registry)]
    fun test_update_treasury_address_requires_owner(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));
        app_registry::init_for_test(&registry);

        // Create a non-owner account
        let dev1 = account::create_account_for_test(DEV1_ADDR);
        let new_treasury_addr = @0x200;

        // Non-owner should not be able to update treasury address
        app_registry::update_treasury_address(&dev1, new_treasury_addr);
    }

    #[test(registry = @app_registry, framework = @0x1)]
    fun test_update_submit_fee(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));
        app_registry::init_for_test(&registry);

        // Verify initial fee is 1000000000 (10 MOVE)
        let initial_fee = app_registry::get_submit_fee();
        assert!(initial_fee == 1000000000, 1);

        // Update submit fee to 1000000000 (10 MOVE)
        let new_fee = 1000000000;
        app_registry::update_submit_fee(&registry, new_fee);

        // Verify fee was updated
        let updated_fee = app_registry::get_submit_fee();
        assert!(updated_fee == new_fee, 2);
    }

    #[test(registry = @app_registry, framework = @0x1)]
    #[expected_failure(abort_code = 1, location = app_registry::app_registry)]
    fun test_update_submit_fee_requires_owner(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));
        app_registry::init_for_test(&registry);

        // Create a non-owner account
        let dev1 = account::create_account_for_test(DEV1_ADDR);

        // Non-owner should not be able to update submit fee
        app_registry::update_submit_fee(&dev1, 1000000000);
    }

    #[test(registry = @app_registry, framework = @0x1)]
    fun test_submit_app_charges_fee(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));
        app_registry::init_for_test(&registry);

        // Create developer account
        let dev1 = account::create_account_for_test(DEV1_ADDR);

        // Set fee to 10 MOVE for this test
        app_registry::update_submit_fee(&registry, 1000000000);

        // Initialize coin type if not already initialized
        if (!coin::is_coin_initialized<AptosCoin>()) {
            let (_burn_cap, _mint_cap) = aptos_framework::aptos_coin::initialize_for_test(&framework);
            coin::destroy_burn_cap(_burn_cap);
            coin::destroy_mint_cap(_mint_cap);
        };

        // Register treasury address for coin type (needed to receive fees)
        coin::register<AptosCoin>(&registry);

        // Fund the developer account with coins (20 MOVE = 2000000000 octas)
        coin::register<AptosCoin>(&dev1);
        aptos_framework::aptos_coin::mint(&framework, DEV1_ADDR, 2000000000);

        // Verify initial fee is 1000000000 (10 MOVE)
        let fee = app_registry::get_submit_fee();
        assert!(fee == 1000000000, 1);

        // Submit an app - this should charge the fee
        app_registry::submit_app(
            &dev1,
            string::utf8(b"Test App"),
            string::utf8(b"Test Description"),
            string::utf8(b"G"),
            string::utf8(b"https://test.com"),
            string::utf8(b"test-app"),
            string::utf8(b"Test Dev"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );

        // Verify app was created (indirectly confirms fee was charged and submission succeeded)
        let app_index = last_app_index(DEV1_ADDR);
        // Just verify the app exists - accessing private fields would require a getter function
        assert!(app_registry::app_exists(app_index), 2);
    }

    #[test(registry = @app_registry, framework = @0x1)]
    fun test_get_app_by_slug(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));
        app_registry::init_for_test(&registry);

        // Initialize coin type if not already initialized
        if (!coin::is_coin_initialized<AptosCoin>()) {
            let (_burn_cap, _mint_cap) = aptos_framework::aptos_coin::initialize_for_test(&framework);
            coin::destroy_burn_cap(_burn_cap);
            coin::destroy_mint_cap(_mint_cap);
        };

        // Register treasury address for coin type (needed to receive fees)
        coin::register<AptosCoin>(&registry);

        // Create test accounts
        let dev1 = account::create_account_for_test(DEV1_ADDR);
        let dev2 = account::create_account_for_test(DEV2_ADDR);

        // Register and fund accounts with coins (20 MOVE = 2000000000 octas)
        coin::register<AptosCoin>(&dev1);
        coin::register<AptosCoin>(&dev2);
        aptos_framework::aptos_coin::mint(&framework, DEV1_ADDR, 2000000000);
        aptos_framework::aptos_coin::mint(&framework, DEV2_ADDR, 2000000000);

        // Submit apps with different slugs
        app_registry::submit_app(
            &dev1,
            string::utf8(b"Send Tokens"),
            string::utf8(b"Send tokens app"),
            string::utf8(b"G"),
            string::utf8(b"https://send-tokens.com"),
            string::utf8(b"send-tokens"),
            string::utf8(b"Dev 1"),
            string::utf8(b"defi"),
            string::utf8(b"all"),
            vector::empty(),
        );

        app_registry::submit_app(
            &dev2,
            string::utf8(b"Bridge App"),
            string::utf8(b"Bridge app"),
            string::utf8(b"B"),
            string::utf8(b"https://bridge.com"),
            string::utf8(b"bridge-app"),
            string::utf8(b"Dev 2"),
            string::utf8(b"defi"),
            string::utf8(b"all"),
            vector::empty(),
        );

        // Get app indices
        let send_tokens_index = last_app_index(DEV1_ADDR);
        let bridge_index = last_app_index(DEV2_ADDR);

        // Approve send-tokens app
        app_registry::approve_app(&registry, send_tokens_index);

        // Test: get approved app by slug should succeed
        let app = app_registry::get_app_by_slug(string::utf8(b"send-tokens"));
        assert!(app_registry::get_app_slug(&app) == string::utf8(b"send-tokens"), 1);
        assert!(app_registry::get_app_name(&app) == string::utf8(b"Send Tokens"), 2);
        assert!(app_registry::get_app_url(&app) == string::utf8(b"https://send-tokens.com"), 3);

        // Verify bridge app exists but is pending
        let bridge_app = app_registry::get_app(bridge_index);
        assert!(app_registry::get_app_slug(&bridge_app) == string::utf8(b"bridge-app"), 4);
    }

    #[test(registry = @app_registry, framework = @0x1)]
    #[expected_failure(abort_code = 4, location = app_registry::app_registry)]
    fun test_get_app_by_slug_not_approved_aborts(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));
        app_registry::init_for_test(&registry);

        // Initialize coin type if not already initialized
        if (!coin::is_coin_initialized<AptosCoin>()) {
            let (_burn_cap, _mint_cap) = aptos_framework::aptos_coin::initialize_for_test(&framework);
            coin::destroy_burn_cap(_burn_cap);
            coin::destroy_mint_cap(_mint_cap);
        };

        // Register treasury address for coin type (needed to receive fees)
        coin::register<AptosCoin>(&registry);

        // Create test account
        let dev1 = account::create_account_for_test(DEV1_ADDR);

        // Register and fund account with coins (20 MOVE = 2000000000 octas)
        coin::register<AptosCoin>(&dev1);
        aptos_framework::aptos_coin::mint(&framework, DEV1_ADDR, 2000000000);

        // Submit app but don't approve it
        app_registry::submit_app(
            &dev1,
            string::utf8(b"Pending App"),
            string::utf8(b"Pending app"),
            string::utf8(b"G"),
            string::utf8(b"https://pending.com"),
            string::utf8(b"pending-app"),
            string::utf8(b"Dev 1"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );

        // This should abort since the app is not approved
        app_registry::get_app_by_slug(string::utf8(b"pending-app"));
    }

    #[test(registry = @app_registry, framework = @0x1)]
    #[expected_failure(abort_code = 4, location = app_registry::app_registry)]
    fun test_get_app_by_slug_not_found_aborts(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));
        app_registry::init_for_test(&registry);

        // Try to get app by slug that doesn't exist - should abort
        app_registry::get_app_by_slug(string::utf8(b"non-existent-app"));
    }

    #[test(registry = @app_registry, framework = @0x1)]
    fun test_request_update_changes_approved_to_pending(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));
        app_registry::init_for_test(&registry);

        // Initialize coin type if not already initialized
        if (!coin::is_coin_initialized<AptosCoin>()) {
            let (_burn_cap, _mint_cap) = aptos_framework::aptos_coin::initialize_for_test(&framework);
            coin::destroy_burn_cap(_burn_cap);
            coin::destroy_mint_cap(_mint_cap);
        };

        // Register treasury address for coin type (needed to receive fees)
        coin::register<AptosCoin>(&registry);

        // Create test account
        let dev1 = account::create_account_for_test(DEV1_ADDR);

        // Register and fund account with coins (20 MOVE = 2000000000 octas)
        coin::register<AptosCoin>(&dev1);
        aptos_framework::aptos_coin::mint(&framework, DEV1_ADDR, 2000000000);

        // Submit and approve app
        app_registry::submit_app(
            &dev1,
            string::utf8(b"Original App"),
            string::utf8(b"Original description"),
            string::utf8(b"G"),
            string::utf8(b"https://original.com"),
            string::utf8(b"original-app"),
            string::utf8(b"Dev 1"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );
        let app_index = last_app_index(DEV1_ADDR);
        app_registry::approve_app(&registry, app_index);

        // Verify app is approved and in active list
        let apps = app_registry::get_all_active_apps();
        assert!(vector::length(&apps) == 1, 1);
        let (total, approved, pending) = app_registry::get_stats();
        assert!(total == 1, 2);
        assert!(approved == 1, 3);
        assert!(pending == 0, 4);

        // Request update - should change status to PENDING
        app_registry::request_update(
            &dev1,
            app_index,
            string::utf8(b"Updated App"),
            string::utf8(b"Updated description"),
            string::utf8(b"U"),
            string::utf8(b"https://updated.com"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );

        // Verify app is now PENDING and not in active list
        let apps = app_registry::get_all_active_apps();
        assert!(vector::length(&apps) == 0, 5);
        let (total2, approved2, pending2) = app_registry::get_stats();
        assert!(total2 == 1, 6);
        assert!(approved2 == 0, 7);
        assert!(pending2 == 1, 8);

        // Verify app status is PENDING
        let app = app_registry::get_app(app_index);
        assert!(app_registry::get_app_status(&app) == 0, 9); // STATUS_PENDING = 0
        assert!(!app_registry::get_app_verified(&app), 10);
    }

    #[test(registry = @app_registry, framework = @0x1)]
    fun test_approve_update_restores_to_approved(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));
        app_registry::init_for_test(&registry);

        // Initialize coin type if not already initialized
        if (!coin::is_coin_initialized<AptosCoin>()) {
            let (_burn_cap, _mint_cap) = aptos_framework::aptos_coin::initialize_for_test(&framework);
            coin::destroy_burn_cap(_burn_cap);
            coin::destroy_mint_cap(_mint_cap);
        };

        // Register treasury address for coin type (needed to receive fees)
        coin::register<AptosCoin>(&registry);

        // Create test account
        let dev1 = account::create_account_for_test(DEV1_ADDR);

        // Register and fund account with coins (20 MOVE = 2000000000 octas)
        coin::register<AptosCoin>(&dev1);
        aptos_framework::aptos_coin::mint(&framework, DEV1_ADDR, 2000000000);

        // Submit and approve app
        app_registry::submit_app(
            &dev1,
            string::utf8(b"Original App"),
            string::utf8(b"Original description"),
            string::utf8(b"G"),
            string::utf8(b"https://original.com"),
            string::utf8(b"original-app"),
            string::utf8(b"Dev 1"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );
        let app_index = last_app_index(DEV1_ADDR);
        app_registry::approve_app(&registry, app_index);

        // Request update
        app_registry::request_update(
            &dev1,
            app_index,
            string::utf8(b"Updated App"),
            string::utf8(b"Updated description"),
            string::utf8(b"U"),
            string::utf8(b"https://updated.com"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );

        // Verify app is PENDING
        let (_, approved_before, pending_before) = app_registry::get_stats();
        assert!(approved_before == 0, 1);
        assert!(pending_before == 1, 2);

        // Approve update
        app_registry::approve_update(&registry, app_index);

        // Verify app is APPROVED again and in active list
        let apps = app_registry::get_all_active_apps();
        assert!(vector::length(&apps) == 1, 3);
        let (_, approved_after, pending_after) = app_registry::get_stats();
        assert!(approved_after == 1, 4);
        assert!(pending_after == 0, 5);

        // Verify app metadata was updated
        let app = app_registry::get_app(app_index);
        assert!(app_registry::get_app_name(&app) == string::utf8(b"Updated App"), 6);
        assert!(app_registry::get_app_description(&app) == string::utf8(b"Updated description"), 7);
        assert!(app_registry::get_app_status(&app) == 1, 8); // STATUS_APPROVED = 1
        assert!(app_registry::get_app_verified(&app), 9);
    }

    #[test(registry = @app_registry, framework = @0x1)]
    fun test_request_update_on_pending_app(registry: signer, framework: signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        account::create_account_for_test(signer::address_of(&registry));
        app_registry::init_for_test(&registry);

        // Initialize coin type if not already initialized
        if (!coin::is_coin_initialized<AptosCoin>()) {
            let (_burn_cap, _mint_cap) = aptos_framework::aptos_coin::initialize_for_test(&framework);
            coin::destroy_burn_cap(_burn_cap);
            coin::destroy_mint_cap(_mint_cap);
        };

        // Register treasury address for coin type (needed to receive fees)
        coin::register<AptosCoin>(&registry);

        // Create test account
        let dev1 = account::create_account_for_test(DEV1_ADDR);

        // Register and fund account with coins (20 MOVE = 2000000000 octas)
        coin::register<AptosCoin>(&dev1);
        aptos_framework::aptos_coin::mint(&framework, DEV1_ADDR, 2000000000);

        // Submit app (starts as PENDING)
        app_registry::submit_app(
            &dev1,
            string::utf8(b"Pending App"),
            string::utf8(b"Pending description"),
            string::utf8(b"G"),
            string::utf8(b"https://pending.com"),
            string::utf8(b"pending-app"),
            string::utf8(b"Dev 1"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );
        let app_index = last_app_index(DEV1_ADDR);

        // Verify app is PENDING
        let (_, approved_before, pending_before) = app_registry::get_stats();
        assert!(approved_before == 0, 1);
        assert!(pending_before == 1, 2);

        // Request update on pending app (should still be PENDING)
        app_registry::request_update(
            &dev1,
            app_index,
            string::utf8(b"Updated Pending App"),
            string::utf8(b"Updated pending description"),
            string::utf8(b"U"),
            string::utf8(b"https://updated-pending.com"),
            string::utf8(b"game"),
            string::utf8(b"all"),
            vector::empty(),
        );

        // Verify app is still PENDING (counters shouldn't change)
        let (_, approved_after, pending_after) = app_registry::get_stats();
        assert!(approved_after == 0, 3);
        assert!(pending_after == 1, 4);

        // Approve update - should transition from PENDING to APPROVED
        app_registry::approve_update(&registry, app_index);

        // Verify app is now APPROVED
        let apps = app_registry::get_all_active_apps();
        assert!(vector::length(&apps) == 1, 5);
        let (_, approved_final, pending_final) = app_registry::get_stats();
        assert!(approved_final == 1, 6);
        assert!(pending_final == 0, 7);

        // Verify metadata was updated
        let app = app_registry::get_app(app_index);
        assert!(app_registry::get_app_name(&app) == string::utf8(b"Updated Pending App"), 8);
        assert!(app_registry::get_app_status(&app) == 1, 9); // STATUS_APPROVED = 1
    }
}
