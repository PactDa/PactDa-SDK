#[test_only]
module pactda::test_resolution_policies {
    use sui::test_scenario as ts;
    use sui::clock::{Self, Clock};
    use std::string;
    use std::option;
    use pactda::resolution_policies::{Self, ProgrammaticResolver};

    // Test addresses
    const ADMIN: address = @0x1;
    const AUTHORITY: address = @0x2;
    const PLAYER_A: address = @0x3;
    const PLAYER_B: address = @0x4;
    const UNAUTHORIZED: address = @0x5;

    #[test]
    fun test_create_resolver_success() {
        let mut scenario = ts::begin(ADMIN);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let resolver = resolution_policies::create_resolver(
                AUTHORITY,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            // Verify resolver details
            let (authority, outcome, data) = resolution_policies::get_resolver_details(&resolver);
            assert!(authority == AUTHORITY, 0);
            assert!(option::is_none(&outcome), 1);
            assert!(data == string::utf8(b""), 2);
            assert!(!resolution_policies::is_resolved(&resolver), 3);
            assert!(resolution_policies::is_authority(&resolver, AUTHORITY), 4);
            assert!(!resolution_policies::is_authority(&resolver, UNAUTHORIZED), 5);
            
            // Make resolver shared for further testing
            sui::transfer::public_share_object(resolver);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_report_outcome_success() {
        let mut scenario = ts::begin(ADMIN);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        // Create resolver
        ts::next_tx(&mut scenario, ADMIN);
        {
            let resolver = resolution_policies::create_resolver(
                AUTHORITY,
                &clock,
                ts::ctx(&mut scenario)
            );
            sui::transfer::public_share_object(resolver);
        };
        
        // Authority reports outcome
        ts::next_tx(&mut scenario, AUTHORITY);
        {
            let mut resolver = ts::take_shared<ProgrammaticResolver>(&scenario);
            
            resolution_policies::report_outcome(
                &mut resolver,
                PLAYER_A, // Player A wins
                &clock,
                ts::ctx(&mut scenario)
            );
            
            // Verify outcome was set
            let (authority, outcome, _) = resolution_policies::get_resolver_details(&resolver);
            assert!(authority == AUTHORITY, 0);
            assert!(option::is_some(&outcome), 1);
            assert!(*option::borrow(&outcome) == PLAYER_A, 2);
            assert!(resolution_policies::is_resolved(&resolver), 3);
            
            // Verify get_outcome function
            let outcome_option = resolution_policies::get_outcome(&resolver);
            assert!(option::is_some(&outcome_option), 4);
            assert!(*option::borrow(&outcome_option) == PLAYER_A, 5);
            
            ts::return_shared(resolver);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = resolution_policies::EUnauthorized)]
    fun test_report_outcome_unauthorized() {
        let mut scenario = ts::begin(ADMIN);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        // Create resolver with AUTHORITY
        ts::next_tx(&mut scenario, ADMIN);
        {
            let resolver = resolution_policies::create_resolver(
                AUTHORITY,
                &clock,
                ts::ctx(&mut scenario)
            );
            sui::transfer::public_share_object(resolver);
        };
        
        // Unauthorized user tries to report outcome - should fail
        ts::next_tx(&mut scenario, UNAUTHORIZED);
        {
            let mut resolver = ts::take_shared<ProgrammaticResolver>(&scenario);
            
            resolution_policies::report_outcome(
                &mut resolver,
                PLAYER_A,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(resolver);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = resolution_policies::EAlreadyResolved)]
    fun test_report_outcome_already_resolved() {
        let mut scenario = ts::begin(ADMIN);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        // Create resolver
        ts::next_tx(&mut scenario, ADMIN);
        {
            let resolver = resolution_policies::create_resolver(
                AUTHORITY,
                &clock,
                ts::ctx(&mut scenario)
            );
            sui::transfer::public_share_object(resolver);
        };
        
        // First outcome report
        ts::next_tx(&mut scenario, AUTHORITY);
        {
            let mut resolver = ts::take_shared<ProgrammaticResolver>(&scenario);
            
            resolution_policies::report_outcome(
                &mut resolver,
                PLAYER_A,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(resolver);
        };
        
        // Second outcome report - should fail
        ts::next_tx(&mut scenario, AUTHORITY);
        {
            let mut resolver = ts::take_shared<ProgrammaticResolver>(&scenario);
            
            resolution_policies::report_outcome(
                &mut resolver,
                PLAYER_B, // Try to change outcome
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(resolver);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_resolver_different_winners() {
        let mut scenario = ts::begin(ADMIN);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        // Test Player A wins
        ts::next_tx(&mut scenario, ADMIN);
        {
            let resolver = resolution_policies::create_resolver(
                AUTHORITY,
                &clock,
                ts::ctx(&mut scenario)
            );
            sui::transfer::public_share_object(resolver);
        };
        
        ts::next_tx(&mut scenario, AUTHORITY);
        {
            let mut resolver = ts::take_shared<ProgrammaticResolver>(&scenario);
            
            resolution_policies::report_outcome(
                &mut resolver,
                PLAYER_A,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            let outcome = resolution_policies::get_outcome(&resolver);
            assert!(*option::borrow(&outcome) == PLAYER_A, 0);
            
            ts::return_shared(resolver);
        };
        
        // Test Player B wins (new resolver)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let resolver2 = resolution_policies::create_resolver(
                AUTHORITY,
                &clock,
                ts::ctx(&mut scenario)
            );
            sui::transfer::public_share_object(resolver2);
        };
        
        ts::next_tx(&mut scenario, AUTHORITY);
        {
            let mut resolver2 = ts::take_shared<ProgrammaticResolver>(&scenario);
            
            resolution_policies::report_outcome(
                &mut resolver2,
                PLAYER_B,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            let outcome = resolution_policies::get_outcome(&resolver2);
            assert!(*option::borrow(&outcome) == PLAYER_B, 1);
            
            ts::return_shared(resolver2);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_resolver_authority_validation() {
        let mut scenario = ts::begin(ADMIN);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let resolver = resolution_policies::create_resolver(
                AUTHORITY,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            // Test authority validation
            assert!(resolution_policies::is_authority(&resolver, AUTHORITY), 0);
            assert!(!resolution_policies::is_authority(&resolver, PLAYER_A), 1);
            assert!(!resolution_policies::is_authority(&resolver, PLAYER_B), 2);
            assert!(!resolution_policies::is_authority(&resolver, UNAUTHORIZED), 3);
            
            sui::transfer::public_share_object(resolver);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_resolver_initial_state() {
        let mut scenario = ts::begin(ADMIN);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let resolver = resolution_policies::create_resolver(
                AUTHORITY,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            // Verify initial state
            assert!(!resolution_policies::is_resolved(&resolver), 0);
            
            let outcome = resolution_policies::get_outcome(&resolver);
            assert!(option::is_none(&outcome), 1);
            
            let (authority, outcome_check, data) = resolution_policies::get_resolver_details(&resolver);
            assert!(authority == AUTHORITY, 2);
            assert!(option::is_none(&outcome_check), 3);
            assert!(data == string::utf8(b""), 4);
            
            sui::transfer::public_share_object(resolver);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_multiple_resolvers_independence() {
        let mut scenario = ts::begin(ADMIN);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        // Create resolver with AUTHORITY
        ts::next_tx(&mut scenario, ADMIN);
        {
            let resolver1 = resolution_policies::create_resolver(
                AUTHORITY,
                &clock,
                ts::ctx(&mut scenario)
            );
            sui::transfer::public_share_object(resolver1);
        };
        
        // Resolve resolver with AUTHORITY
        ts::next_tx(&mut scenario, AUTHORITY);
        {
            let mut resolver1 = ts::take_shared<ProgrammaticResolver>(&scenario);
            
            resolution_policies::report_outcome(
                &mut resolver1,
                PLAYER_A,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            assert!(resolution_policies::is_resolved(&resolver1), 0);
            
            ts::return_shared(resolver1);
        };
        
        // Create second independent resolver with different authority  
        ts::next_tx(&mut scenario, ADMIN);
        {
            let resolver2 = resolution_policies::create_resolver(
                PLAYER_A, // Different authority
                &clock,
                ts::ctx(&mut scenario)
            );
            
            // Verify it's independent and unresolved
            assert!(!resolution_policies::is_resolved(&resolver2), 1);
            assert!(resolution_policies::is_authority(&resolver2, PLAYER_A), 2);
            assert!(!resolution_policies::is_authority(&resolver2, AUTHORITY), 3);
            
            sui::transfer::public_share_object(resolver2);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
} 