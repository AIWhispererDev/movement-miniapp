module social::social {
    use std::string;
    use std::signer;
    use std::vector;

    struct Post has store, drop {
        author: address,
        content: string::String,
        timestamp_ms: u64,
        reactions: u64,
    }

    struct Feed has key {
        posts: vector<Post>,
    }

    // Removed PostView; we return Post directly in views

    // Global feed stored under the module's named address @social
    /// Pointer to a canonical post in an owner's feed
    struct Pointer has store, drop {
        owner: address,
        index: u64,
    }

    /// Global index stores pointers to canonical posts
    struct GlobalIndex has key {
        pointers: vector<Pointer>,
    }

    /// Initialize once on publish. Called automatically when module is published.
    fun init_module(deployer: &signer) {
        let who = signer::address_of(deployer);
        assert!(who == @social, 1);
        if (!exists<GlobalIndex>(@social)) {
            move_to<GlobalIndex>(deployer, GlobalIndex { pointers: vector::empty<Pointer>() });
        };
    }

    /// One-time manual initializer, callable only by the module deployer (@social)
    public entry fun init_global(deployer: &signer) {
        let who = signer::address_of(deployer);
        assert!(who == @social, 1);
        if (!exists<GlobalIndex>(@social)) {
            move_to<GlobalIndex>(deployer, GlobalIndex { pointers: vector::empty<Pointer>() });
        };
    }

    public entry fun post(account: &signer, content: string::String) acquires Feed, GlobalIndex {
        let addr = signer::address_of(account);
        if (!exists<Feed>(addr)) {
            move_to<Feed>(account, Feed { posts: vector::empty<Post>() });
        };
        let feed = borrow_global_mut<Feed>(addr);
        let p = Post { author: addr, content, timestamp_ms: 0, reactions: 0 };
        vector::push_back(&mut feed.posts, p);

        // Append pointer to global index if initialized
        if (exists<GlobalIndex>(@social)) {
            let g = borrow_global_mut<GlobalIndex>(@social);
            let len = vector::length(&feed.posts);
            let last_idx = len - 1;
            vector::push_back(&mut g.pointers, Pointer { owner: addr, index: last_idx });
        };
    }

    /// React to a specific owner's post at index
    public entry fun react(_actor: &signer, owner: address, index: u64) acquires Feed {
        let feed = borrow_global_mut<Feed>(owner);
        let p_ref = vector::borrow_mut(&mut feed.posts, index);
        p_ref.reactions = p_ref.reactions + 1;
    }

    // VIEW FUNCTIONS
    // Returns true if a feed exists for the given owner
    #[view]
    public fun has_feed(owner: address): bool {
        exists<Feed>(owner)
    }

    // Returns number of posts for the given owner
    #[view]
    public fun get_post_count(owner: address): u64 acquires Feed {
        if (!exists<Feed>(owner)) { return 0 };
        let feed = borrow_global<Feed>(owner);
        vector::length(&feed.posts)
    }

    // Returns a single post by index
    #[view]
    public fun get_post(owner: address, index: u64): Post acquires Feed {
        let feed = borrow_global<Feed>(owner);
        let p_ref = vector::borrow(&feed.posts, index);
        Post { author: p_ref.author, content: clone_string(&p_ref.content), timestamp_ms: p_ref.timestamp_ms, reactions: p_ref.reactions }
    }

    // Global feed views
    #[view]
    public fun get_global_count(): u64 acquires GlobalIndex {
        if (!exists<GlobalIndex>(@social)) { return 0 };
        let g = borrow_global<GlobalIndex>(@social);
        vector::length(&g.pointers)
    }

    // Returns (owner, index) pointer
    #[view]
    public fun get_global_pointer(index: u64): (address, u64) acquires GlobalIndex {
        let g = borrow_global<GlobalIndex>(@social);
        let ptr = vector::borrow(&g.pointers, index);
        (ptr.owner, ptr.index)
    }

    // Returns all posts in the global feed
    #[view]
    public fun get_global_feed(): vector<Post> acquires GlobalIndex, Feed {
        if (!exists<GlobalIndex>(@social)) { 
            return vector::empty<Post>() 
        };
        
        let g = borrow_global<GlobalIndex>(@social);
        let len = vector::length(&g.pointers);
        let result = vector::empty<Post>();
        let i = 0u64;
        
        while (i < len) {
            let ptr = vector::borrow(&g.pointers, i);
            let feed = borrow_global<Feed>(ptr.owner);
            let post_ref = vector::borrow(&feed.posts, ptr.index);
            vector::push_back(&mut result, Post {
                author: post_ref.author,
                content: clone_string(&post_ref.content),
                timestamp_ms: post_ref.timestamp_ms,
                reactions: post_ref.reactions
            });
            i = i + 1;
        };
        
        result
    }

    // Returns all posts for a single owner
    #[view]
    public fun get_owner_feed(owner: address): vector<Post> acquires Feed {
        if (!exists<Feed>(owner)) { 
            return vector::empty<Post>() 
        };
        
        let feed = borrow_global<Feed>(owner);
        let len = vector::length(&feed.posts);
        let result = vector::empty<Post>();
        let i = 0u64;
        
        while (i < len) {
            let post_ref = vector::borrow(&feed.posts, i);
            vector::push_back(&mut result, Post {
                author: post_ref.author,
                content: clone_string(&post_ref.content),
                timestamp_ms: post_ref.timestamp_ms,
                reactions: post_ref.reactions
            });
            i = i + 1;
        };
        
        result
    }

    // Clone a string without requiring Move 2 helpers
    fun clone_string(s: &string::String): string::String {
        let src: &vector<u8> = string::bytes(s);
        let out = vector::empty<u8>();
        let len = vector::length(src);
        let i = 0u64;
        while (i < len) {
            let b_ref = vector::borrow(src, i);
            let b = *b_ref;
            vector::push_back(&mut out, b);
            i = i + 1;
        };
        string::utf8(out)
    }
}


