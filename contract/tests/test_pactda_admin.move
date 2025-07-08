#[test_only]
module pactda::test_pactda_admin {
    use sui::test_scenario as ts;
    use pactda::pactda_admin::{Self, AdminCap};

    // Test addresses
    const ADMIN: address = @0x1;
    const NON_ADMIN: address = @0x2;

    #[test]
    fun test_init_admin_cap() {
        let mut scenario = ts::begin(ADMIN);
        
        // Initialize admin capability
        ts::next_tx(&mut scenario, ADMIN);
        {
            pactda_admin::test_admin_cap_creation(ts::ctx(&mut scenario));
        };
        
        // Verify admin cap was created and sent to admin
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            
            // Verify admin cap exists and has correct properties
            assert!(pactda_admin::is_valid_admin(&admin_cap), 0);
            
            // Return the admin cap
            ts::return_to_sender(&scenario, admin_cap);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_admin_cap_ownership() {
        let mut scenario = ts::begin(ADMIN);
        
        // Initialize admin capability
        ts::next_tx(&mut scenario, ADMIN);
        {
            pactda_admin::test_admin_cap_creation(ts::ctx(&mut scenario));
        };
        
        // Admin should have the admin cap
        ts::next_tx(&mut scenario, ADMIN); 
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            
            // Verify admin cap7properties
            assert!(pactda_admin::is_valid_admin(&admin_cap), 0);
            
            ts::return_to_sender(&scenario, admin_cap);
        };
        
        // Non-admin should not have admin cap
        ts::next_tx(&mut scenario, NON_ADMIN);
        {
            // This should not find any admin cap for non-admin
            assert!(!ts::has_most_recent_for_sender<AdminCap>(&scenario), 1);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_admin_cap_transfer() {
        let mut scenario = ts::begin(ADMIN);
        
        // Initialize admin capability
        ts::next_tx(&mut scenario, ADMIN);
        {
            pactda_admin::test_admin_cap_creation(ts::ctx(&mut scenario));
        };
        
        // Transfer admin cap to another address
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            
            // Transfer to NON_ADMIN
            sui::transfer::public_transfer(admin_cap, NON_ADMIN);
        };
        
        // Verify new owner has admin cap
        ts::next_tx(&mut scenario, NON_ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            
            assert!(pactda_admin::is_valid_admin(&admin_cap), 0);
            
            ts::return_to_sender(&scenario, admin_cap);
        };
        
        // Original admin should no longer have admin cap
        ts::next_tx(&mut scenario, ADMIN);
        {
            assert!(!ts::has_most_recent_for_sender<AdminCap>(&scenario), 1);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_multiple_init_calls() {
        let mut scenario = ts::begin(ADMIN);
        
        // First init call
        ts::next_tx(&mut scenario, ADMIN);
        {
            pactda_admin::test_admin_cap_creation(ts::ctx(&mut scenario));
        };
        
        // Second init call (should create another admin cap)
        ts::next_tx(&mut scenario, ADMIN);
        {
            pactda_admin::test_admin_cap_creation(ts::ctx(&mut scenario));
        };
        
        // Admin should have received two admin caps
        ts::next_tx(&mut scenario, ADMIN);
        {
            // Take first admin cap
            let admin_cap1 = ts::take_from_sender<AdminCap>(&scenario);
            assert!(pactda_admin::is_valid_admin(&admin_cap1), 0);
            
            // Take second admin cap
            let admin_cap2 = ts::take_from_sender<AdminCap>(&scenario);
            assert!(pactda_admin::is_valid_admin(&admin_cap2), 1);
            
            // Return both caps
            ts::return_to_sender(&scenario, admin_cap1);
            ts::return_to_sender(&scenario, admin_cap2);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_admin_cap_validation() {
        let mut scenario = ts::begin(ADMIN);
        
        // Initialize admin capability
        ts::next_tx(&mut scenario, ADMIN);
        {
            pactda_admin::test_admin_cap_creation(ts::ctx(&mut scenario));
        };
        
        // Test admin cap validation
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            
            // Basic validation
            assert!(pactda_admin::is_valid_admin(&admin_cap), 0);
            
            ts::return_to_sender(&scenario, admin_cap);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_admin_init_from_different_senders() {
        let mut scenario = ts::begin(ADMIN);
        
        // Admin initializes
        ts::next_tx(&mut scenario, ADMIN);
        {
            pactda_admin::test_admin_cap_creation(ts::ctx(&mut scenario));
        };
        
        // Non-admin also initializes (should work)
        ts::next_tx(&mut scenario, NON_ADMIN);
        {
            pactda_admin::test_admin_cap_creation(ts::ctx(&mut scenario));
        };
        
        // Both should have admin caps
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            assert!(pactda_admin::is_valid_admin(&admin_cap), 0);
            ts::return_to_sender(&scenario, admin_cap);
        };
        
        ts::next_tx(&mut scenario, NON_ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            assert!(pactda_admin::is_valid_admin(&admin_cap), 1);
            ts::return_to_sender(&scenario, admin_cap);
        };
        
        ts::end(scenario);
    }
} 