module counter::counter {
    use std::signer;

    /// Counter resource stored under each user's account
    struct Counter has key {
        value: u64,
    }

    /// Initialize counter resource for the caller
    public entry fun initialize(account: &signer) {
        let addr = signer::address_of(account);
        assert!(!exists<Counter>(addr), 1); // Error if counter already exists
        move_to(account, Counter { value: 0 });
    }

    /// Increment the counter by 1
    public entry fun increment(account: &signer) acquires Counter {
        let addr = signer::address_of(account);
        assert!(exists<Counter>(addr), 2); // Error if counter doesn't exist
        let counter = borrow_global_mut<Counter>(addr);
        counter.value = counter.value + 1;
    }

    /// Reset the counter to 0
    public entry fun reset(account: &signer) acquires Counter {
        let addr = signer::address_of(account);
        assert!(exists<Counter>(addr), 2); // Error if counter doesn't exist
        let counter = borrow_global_mut<Counter>(addr);
        counter.value = 0;
    }

    #[view]
    /// View function to read the counter value
    public fun get_value(owner: address): u64 acquires Counter {
        if (!exists<Counter>(owner)) {
            return 0
        };
        borrow_global<Counter>(owner).value
    }

    #[view]
    /// Check if counter is initialized for an address
    public fun is_initialized(owner: address): bool {
        exists<Counter>(owner)
    }
}
