#[test_only]
module pactda::test_pactda_core {
    use sui::test_scenario as ts;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use std::string;
    use std::vector;
    use pactda::pactda_core::{Self, PactDaContract, Escrow};
    use pactda::resolution_policies::{Self, ProgrammaticResolver};

    // Test addresses
    const ADMIN: address = @0x1;
    const PLAYER_A: address = @0x2;
    const PLAYER_B: address = @0x3;
    const AUTHORITY: address = @0x4;
    const NON_PARTY: address = @0x5;

    #[test]
    fun test_create_agreement_success() {
        let mut scenario = ts::begin(ADMIN);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        // Setup parties
        let parties = vector[PLAYER_A, PLAYER_B];
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            // Create resolver
            let resolver = resolution_policies::create_resolver(
                AUTHORITY,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            // Create agreement
            pactda_core::create_agreement(
                parties,
                resolver,
                string::utf8(b"Rock Paper Scissors Game"),
                &clock,
                ts::ctx(&mut scenario)
            );
        };
        
        // Verify contract was created
        ts::next_tx(&mut scenario, ADMIN);
        {
            let contract = ts::take_shared<PactDaContract>(&scenario);
            let escrow = ts::take_shared<Escrow>(&scenario);
            let resolver = ts::take_shared<ProgrammaticResolver>(&scenario);
            
            let (contract_parties, status, escrow_id, resolver_id, title) = 
                pactda_core::get_contract_details(&contract);
            
            assert!(vector::length(&contract_parties) == 2, 0);
            assert!(status == pactda_core::contract_status_draft(), 1);
            assert!(title == string::utf8(b"Rock Paper Scissors Game"), 2);
            assert!(escrow_id == sui::object::id(&escrow), 3);
            assert!(resolver_id == sui::object::id(&resolver), 4);
            
            ts::return_shared(contract);
            ts::return_shared(escrow);
            ts::return_shared(resolver);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = pactda_core::EInvalidParty)]
    fun test_create_agreement_empty_parties() {
        let mut scenario = ts::begin(ADMIN);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let resolver = resolution_policies::create_resolver(
                AUTHORITY,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            // Should fail with empty parties
            pactda_core::create_agreement(
                vector::empty(),
                resolver,
                string::utf8(b"Invalid Game"),
                &clock,
                ts::ctx(&mut scenario)
            );
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_fund_escrow_success() {
        let mut scenario = ts::begin(ADMIN);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        // Create agreement first
        let parties = vector[PLAYER_A, PLAYER_B];
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let resolver = resolution_policies::create_resolver(
                AUTHORITY,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            pactda_core::create_agreement(
                parties,
                resolver,
                string::utf8(b"Wager Game"),
                &clock,
                ts::ctx(&mut scenario)
            );
        };
        
        // Player A funds escrow
        ts::next_tx(&mut scenario, PLAYER_A);
        {
            let mut contract = ts::take_shared<PactDaContract>(&scenario);
            let mut escrow = ts::take_shared<Escrow>(&scenario);
            
            let payment = coin::mint_for_testing<SUI>(1000, ts::ctx(&mut scenario));
            
            pactda_core::fund_escrow(
                &mut contract,
                &mut escrow,
                payment,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            // Verify escrow is funded
            let (_, balance, status) = pactda_core::get_escrow_details(&escrow);
            assert!(balance == 1000, 0);
            assert!(status == pactda_core::escrow_status_funded(), 1);
            
            // Verify contract is active
            let (_, contract_status, _, _, _) = pactda_core::get_contract_details(&contract);
            assert!(contract_status == pactda_core::contract_status_active(), 2);
            
            ts::return_shared(contract);
            ts::return_shared(escrow);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = pactda_core::EUnauthorized)]
    fun test_fund_escrow_unauthorized() {
        let mut scenario = ts::begin(ADMIN);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        // Create agreement
        ts::next_tx(&mut scenario, ADMIN);
        {
            let resolver = resolution_policies::create_resolver(
                AUTHORITY,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            pactda_core::create_agreement(
                vector[PLAYER_A, PLAYER_B],
                resolver,
                string::utf8(b"Game"),
                &clock,
                ts::ctx(&mut scenario)
            );
        };
        
        // Non-party tries to fund - should fail
        ts::next_tx(&mut scenario, NON_PARTY);
        {
            let mut contract = ts::take_shared<PactDaContract>(&scenario);
            let mut escrow = ts::take_shared<Escrow>(&scenario);
            
            let payment = coin::mint_for_testing<SUI>(1000, ts::ctx(&mut scenario));
            
            pactda_core::fund_escrow(
                &mut contract,
                &mut escrow,
                payment,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(contract);
            ts::return_shared(escrow);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_complete_game_flow() {
        let mut scenario = ts::begin(ADMIN);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        // 1. Create agreement
        ts::next_tx(&mut scenario, ADMIN);
        {
            let resolver = resolution_policies::create_resolver(
                AUTHORITY,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            pactda_core::create_agreement(
                vector[PLAYER_A, PLAYER_B],
                resolver,
                string::utf8(b"Rock Paper Scissors"),
                &clock,
                ts::ctx(&mut scenario)
            );
        };
        
        // 2. Both players fund escrow
        ts::next_tx(&mut scenario, PLAYER_A);
        {
            let mut contract = ts::take_shared<PactDaContract>(&scenario);
            let mut escrow = ts::take_shared<Escrow>(&scenario);
            
            let payment = coin::mint_for_testing<SUI>(500, ts::ctx(&mut scenario));
            pactda_core::fund_escrow(&mut contract, &mut escrow, payment, &clock, ts::ctx(&mut scenario));
            
            ts::return_shared(contract);
            ts::return_shared(escrow);
        };
        
        ts::next_tx(&mut scenario, PLAYER_B);
        {
            let mut contract = ts::take_shared<PactDaContract>(&scenario);
            let mut escrow = ts::take_shared<Escrow>(&scenario);
            
            let payment = coin::mint_for_testing<SUI>(500, ts::ctx(&mut scenario));
            pactda_core::fund_escrow(&mut contract, &mut escrow, payment, &clock, ts::ctx(&mut scenario));
            
            ts::return_shared(contract);
            ts::return_shared(escrow);
        };
        
        // 3. Authority reports outcome
        ts::next_tx(&mut scenario, AUTHORITY);
        {
            let mut resolver = ts::take_shared<ProgrammaticResolver>(&scenario);
            
            resolution_policies::report_outcome(
                &mut resolver,
                PLAYER_A, // Player A wins
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(resolver);
        };
        
        // 4. Settle agreement
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut contract = ts::take_shared<PactDaContract>(&scenario);
            let mut escrow = ts::take_shared<Escrow>(&scenario);
            let resolver = ts::take_shared<ProgrammaticResolver>(&scenario);
            
            pactda_core::settle_agreement(
                &mut contract,
                &mut escrow,
                &resolver,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            // Verify final states
            let (_, contract_status, _, _, _) = pactda_core::get_contract_details(&contract);
            assert!(contract_status == pactda_core::contract_status_completed(), 0);
            
            let (_, balance, escrow_status) = pactda_core::get_escrow_details(&escrow);
            assert!(balance == 0, 1); // All funds released
            assert!(escrow_status == pactda_core::escrow_status_released(), 2);
            
            ts::return_shared(contract);
            ts::return_shared(escrow);
            ts::return_shared(resolver);
        };
        
        // 5. Verify Player A received the payout
        ts::next_tx(&mut scenario, PLAYER_A);
        {
            let payout = ts::take_from_sender<Coin<SUI>>(&scenario);
            assert!(coin::value(&payout) == 1000, 0); // Total wager amount
            ts::return_to_sender(&scenario, payout);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = pactda_core::ENotResolved)]
    fun test_settle_without_resolution() {
        let mut scenario = ts::begin(ADMIN);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        // Create and fund agreement
        ts::next_tx(&mut scenario, ADMIN);
        {
            let resolver = resolution_policies::create_resolver(
                AUTHORITY,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            pactda_core::create_agreement(
                vector[PLAYER_A, PLAYER_B],
                resolver,
                string::utf8(b"Game"),
                &clock,
                ts::ctx(&mut scenario)
            );
        };
        
        ts::next_tx(&mut scenario, PLAYER_A);
        {
            let mut contract = ts::take_shared<PactDaContract>(&scenario);
            let mut escrow = ts::take_shared<Escrow>(&scenario);
            
            let payment = coin::mint_for_testing<SUI>(1000, ts::ctx(&mut scenario));
            pactda_core::fund_escrow(&mut contract, &mut escrow, payment, &clock, ts::ctx(&mut scenario));
            
            ts::return_shared(contract);
            ts::return_shared(escrow);
        };
        
        // Try to settle without reporting outcome - should fail
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut contract = ts::take_shared<PactDaContract>(&scenario);
            let mut escrow = ts::take_shared<Escrow>(&scenario);
            let resolver = ts::take_shared<ProgrammaticResolver>(&scenario);
            
            pactda_core::settle_agreement(
                &mut contract,
                &mut escrow,
                &resolver,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(contract);
            ts::return_shared(escrow);
            ts::return_shared(resolver);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = pactda_core::EInvalidStatus)]
    fun test_fund_escrow_wrong_status() {
        let mut scenario = ts::begin(ADMIN);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        // Create and complete full agreement flow to COMPLETED status
        ts::next_tx(&mut scenario, ADMIN);
        {
            let resolver = resolution_policies::create_resolver(
                AUTHORITY,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            pactda_core::create_agreement(
                vector[PLAYER_A, PLAYER_B],
                resolver,
                string::utf8(b"Game"),
                &clock,
                ts::ctx(&mut scenario)
            );
        };
        
        // Fund the escrow
        ts::next_tx(&mut scenario, PLAYER_A);
        {
            let mut contract = ts::take_shared<PactDaContract>(&scenario);
            let mut escrow = ts::take_shared<Escrow>(&scenario);
            
            let payment = coin::mint_for_testing<SUI>(1000, ts::ctx(&mut scenario));
            pactda_core::fund_escrow(&mut contract, &mut escrow, payment, &clock, ts::ctx(&mut scenario));
            
            ts::return_shared(contract);
            ts::return_shared(escrow);
        };
        
        // Report outcome
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
        
        // Settle agreement to COMPLETED status
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut contract = ts::take_shared<PactDaContract>(&scenario);
            let mut escrow = ts::take_shared<Escrow>(&scenario);
            let resolver = ts::take_shared<ProgrammaticResolver>(&scenario);
            
            pactda_core::settle_agreement(&mut contract, &mut escrow, &resolver, &clock, ts::ctx(&mut scenario));
            
            ts::return_shared(contract);
            ts::return_shared(escrow);
            ts::return_shared(resolver);
        };
        
        // Try to fund after completion - should fail as status is now COMPLETED
        ts::next_tx(&mut scenario, PLAYER_B);
        {
            let mut contract = ts::take_shared<PactDaContract>(&scenario);
            let mut escrow = ts::take_shared<Escrow>(&scenario);
            
            let payment = coin::mint_for_testing<SUI>(500, ts::ctx(&mut scenario));
            pactda_core::fund_escrow(&mut contract, &mut escrow, payment, &clock, ts::ctx(&mut scenario));
            
            ts::return_shared(contract);
            ts::return_shared(escrow);
        };
        
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
} 