#[test_only]
module pactda::test_milestone_payments {
    use sui::test_scenario::{Self, Scenario};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::test_utils;
    use sui::clock::{Self, Clock};
    use std::string;
    use std::vector;

    use pactda::pactda_core::{
        Self, PactDaContract, Escrow, 
        MilestoneCreatedEvent, MilestoneCompletedEvent, MilestoneApprovedEvent, 
        MilestonePaymentWithdrawnEvent, MilestoneRemovedEvent, MilestoneApproverChangedEvent
    };
    use pactda::resolution_policies::{Self, ProgrammaticResolver};

    // Test addresses
    const CONTRACTOR: address = @0x1;
    const CLIENT: address = @0x2;
    const PROJECT_MANAGER: address = @0x3;
    const UNAUTHORIZED: address = @0x999;

    // Test amounts (in MIST)
    const MILESTONE_1_AMOUNT: u64 = 300_000_000_000; // 300 SUI
    const MILESTONE_2_AMOUNT: u64 = 400_000_000_000; // 400 SUI  
    const MILESTONE_3_AMOUNT: u64 = 300_000_000_000; // 300 SUI
    const TOTAL_ESCROW_AMOUNT: u64 = 1_000_000_000_000; // 1000 SUI
    const LARGE_AMOUNT: u64 = 18446744073709551615; // Max u64

    // === HELPER FUNCTIONS ===

    fun setup_milestone_contract(scenario: &mut Scenario): (PactDaContract, Escrow, Clock) {
        test_scenario::next_tx(scenario, CONTRACTOR);
        let clock = clock::create_for_testing(test_scenario::ctx(scenario));
        
        let resolver = resolution_policies::create_resolver(
            CONTRACTOR,
            &clock,
            test_scenario::ctx(scenario)
        );
        
        let parties = vector[CONTRACTOR, CLIENT, PROJECT_MANAGER];
        pactda_core::create_agreement(
            parties,
            resolver,
            string::utf8(b"Milestone Test Project"),
            CONTRACTOR,
            &clock,
            test_scenario::ctx(scenario)
        );
        
        test_scenario::next_tx(scenario, CONTRACTOR);
        let contract = test_scenario::take_shared<PactDaContract>(scenario);
        let escrow = test_scenario::take_shared<Escrow>(scenario);
        
        (contract, escrow, clock)
    }

    fun fund_escrow_helper(
        scenario: &mut Scenario, 
        contract: &mut PactDaContract, 
        escrow: &mut Escrow,
        clock: &Clock,
        amount: u64
    ) {
        let coin = coin::mint_for_testing<SUI>(amount, test_scenario::ctx(scenario));
        pactda_core::fund_escrow(contract, escrow, coin, clock, test_scenario::ctx(scenario));
    }

    fun complete_milestone_workflow(
        scenario: &mut Scenario,
        contract: &mut PactDaContract,
        escrow: &mut Escrow,
        clock: &Clock,
        milestone_id: u64,
        approver: address
    ) {
        // Complete by contractor
        pactda_core::complete_milestone(contract, milestone_id, clock, test_scenario::ctx(scenario));
        
        // Approve by designated approver
        test_scenario::next_tx(scenario, approver);
        pactda_core::approve_milestone(contract, milestone_id, clock, test_scenario::ctx(scenario));
        
        // Withdraw by contractor
        test_scenario::next_tx(scenario, CONTRACTOR);
        pactda_core::withdraw_milestone_payment(contract, escrow, milestone_id, clock, test_scenario::ctx(scenario));
    }

    // === 1. MILESTONE CREATION & MANAGEMENT TESTS ===

    #[test]
    fun test_add_milestone_success() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, escrow, clock) = setup_milestone_contract(&mut scenario);
        
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Frontend Development', 'deadline': '2025-02-15'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = pactda_core::EUnauthorized)]
    fun test_add_milestone_unauthorized() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, escrow, clock) = setup_milestone_contract(&mut scenario);
        
        test_scenario::next_tx(&mut scenario, CLIENT);
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Unauthorized Milestone'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = pactda_core::EMilestoneInvalidApprover)]
    fun test_add_milestone_invalid_approver() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, escrow, clock) = setup_milestone_contract(&mut scenario);
        
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT,
            UNAUTHORIZED,
            string::utf8(b"{'title': 'Invalid Approver Milestone'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = pactda_core::EInvalidWithdrawalAmount)]
    fun test_add_milestone_zero_amount() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, escrow, clock) = setup_milestone_contract(&mut scenario);
        
        pactda_core::add_milestone(
            &mut contract,
            0,
            CLIENT,
            string::utf8(b"{'title': 'Zero Amount Milestone'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_remove_milestone_success() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, escrow, clock) = setup_milestone_contract(&mut scenario);
        
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Test Milestone'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        pactda_core::remove_milestone(
            &mut contract,
            1,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = pactda_core::EUnauthorized)]
    fun test_remove_milestone_unauthorized() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, escrow, clock) = setup_milestone_contract(&mut scenario);
        
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Test Milestone'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::next_tx(&mut scenario, CLIENT);
        pactda_core::remove_milestone(
            &mut contract,
            1,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    // === 2. MILESTONE WORKFLOW TESTS ===

    #[test]
    fun test_complete_milestone_success() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, mut escrow, clock) = setup_milestone_contract(&mut scenario);
        
        fund_escrow_helper(&mut scenario, &mut contract, &mut escrow, &clock, TOTAL_ESCROW_AMOUNT);
        
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Frontend Development'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        pactda_core::complete_milestone(
            &mut contract,
            1,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = pactda_core::EUnauthorized)]
    fun test_complete_milestone_by_approver() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, mut escrow, clock) = setup_milestone_contract(&mut scenario);
        
        fund_escrow_helper(&mut scenario, &mut contract, &mut escrow, &clock, TOTAL_ESCROW_AMOUNT);
        
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Frontend Development'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        // CRITICAL: Approver cannot complete their own milestone
        test_scenario::next_tx(&mut scenario, CLIENT);
        pactda_core::complete_milestone(
            &mut contract,
            1,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_approve_milestone_success() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, mut escrow, clock) = setup_milestone_contract(&mut scenario);
        
        fund_escrow_helper(&mut scenario, &mut contract, &mut escrow, &clock, TOTAL_ESCROW_AMOUNT);
        
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Frontend Development'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        pactda_core::complete_milestone(
            &mut contract,
            1,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::next_tx(&mut scenario, CLIENT);
        pactda_core::approve_milestone(
            &mut contract,
            1,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = pactda_core::EUnauthorized)]
    fun test_approve_milestone_unauthorized() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, mut escrow, clock) = setup_milestone_contract(&mut scenario);
        
        fund_escrow_helper(&mut scenario, &mut contract, &mut escrow, &clock, TOTAL_ESCROW_AMOUNT);
        
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Frontend Development'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        pactda_core::complete_milestone(
            &mut contract,
            1,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        // Try to approve as non-approver
        test_scenario::next_tx(&mut scenario, PROJECT_MANAGER);
        pactda_core::approve_milestone(
            &mut contract,
            1,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_withdraw_milestone_success() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, mut escrow, clock) = setup_milestone_contract(&mut scenario);
        
        fund_escrow_helper(&mut scenario, &mut contract, &mut escrow, &clock, TOTAL_ESCROW_AMOUNT);
        
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Frontend Development'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        complete_milestone_workflow(&mut scenario, &mut contract, &mut escrow, &clock, 1, CLIENT);
        
        // Verify contractor received payment
        test_scenario::next_tx(&mut scenario, CONTRACTOR);
        let payment = test_scenario::take_from_sender<Coin<SUI>>(&scenario);
        assert!(coin::value(&payment) == MILESTONE_1_AMOUNT, 0);
        
        test_scenario::return_to_sender(&scenario, payment);
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = pactda_core::EMilestoneNotApproved)]
    fun test_withdraw_not_approved() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, mut escrow, clock) = setup_milestone_contract(&mut scenario);
        
        fund_escrow_helper(&mut scenario, &mut contract, &mut escrow, &clock, TOTAL_ESCROW_AMOUNT);
        
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Frontend Development'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        pactda_core::complete_milestone(
            &mut contract,
            1,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        // Try to withdraw without approval
        pactda_core::withdraw_milestone_payment(
            &mut contract,
            &mut escrow,
            1,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    // === 3. PHASE 4 SECURITY - FINANCIAL PROTECTION TESTS ===

    #[test]
    #[expected_failure(abort_code = pactda_core::EInsufficientEscrow)]
    fun test_insufficient_escrow_withdrawal() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, mut escrow, clock) = setup_milestone_contract(&mut scenario);
        
        // Fund escrow with less than milestone amount
        fund_escrow_helper(&mut scenario, &mut contract, &mut escrow, &clock, 100_000_000_000); // 100 SUI
        
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT, // 300 SUI
            CLIENT,
            string::utf8(b"{'title': 'Large Milestone'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        pactda_core::complete_milestone(&mut contract, 1, &clock, test_scenario::ctx(&mut scenario));
        
        test_scenario::next_tx(&mut scenario, CLIENT);
        pactda_core::approve_milestone(&mut contract, 1, &clock, test_scenario::ctx(&mut scenario));
        
        test_scenario::next_tx(&mut scenario, CONTRACTOR);
        pactda_core::withdraw_milestone_payment(
            &mut contract,
            &mut escrow,
            1,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_multiple_withdrawal_balance_tracking() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, mut escrow, clock) = setup_milestone_contract(&mut scenario);
        
        fund_escrow_helper(&mut scenario, &mut contract, &mut escrow, &clock, TOTAL_ESCROW_AMOUNT);
        
        // Add multiple milestones
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Milestone 1'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_2_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Milestone 2'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        // Complete and withdraw both milestones
        complete_milestone_workflow(&mut scenario, &mut contract, &mut escrow, &clock, 1, CLIENT);
        complete_milestone_workflow(&mut scenario, &mut contract, &mut escrow, &clock, 2, CLIENT);
        
        // Verify total payments received
        test_scenario::next_tx(&mut scenario, CONTRACTOR);
        let payment1 = test_scenario::take_from_sender<Coin<SUI>>(&scenario);
        let payment2 = test_scenario::take_from_sender<Coin<SUI>>(&scenario);
        
        let total_received = coin::value(&payment1) + coin::value(&payment2);
        assert!(total_received == MILESTONE_1_AMOUNT + MILESTONE_2_AMOUNT, 0);
        
        test_scenario::return_to_sender(&scenario, payment1);
        test_scenario::return_to_sender(&scenario, payment2);
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = pactda_core::ESettlementConflict)]
    fun test_settlement_locked_after_withdrawal() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, mut escrow, clock) = setup_milestone_contract(&mut scenario);
        
        fund_escrow_helper(&mut scenario, &mut contract, &mut escrow, &clock, TOTAL_ESCROW_AMOUNT);
        
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Frontend Development'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        complete_milestone_workflow(&mut scenario, &mut contract, &mut escrow, &clock, 1, CLIENT);
        
        // Try to settle (should fail - settlement locked)
        test_scenario::next_tx(&mut scenario, CONTRACTOR);
        let mut resolver = test_scenario::take_shared<ProgrammaticResolver>(&scenario);
        
        resolution_policies::report_outcome(&mut resolver, CLIENT, &clock, test_scenario::ctx(&mut scenario));
        
        pactda_core::settle_agreement(
            &mut contract,
            &mut escrow,
            &resolver,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(resolver);
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = pactda_core::EInsufficientEscrow)]
    fun test_empty_escrow_withdrawal_attempt() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, mut escrow, clock) = setup_milestone_contract(&mut scenario);
        
        // Don't fund escrow
        
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Frontend Development'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        pactda_core::complete_milestone(&mut contract, 1, &clock, test_scenario::ctx(&mut scenario));
        
        test_scenario::next_tx(&mut scenario, CLIENT);
        pactda_core::approve_milestone(&mut contract, 1, &clock, test_scenario::ctx(&mut scenario));
        
        test_scenario::next_tx(&mut scenario, CONTRACTOR);
        pactda_core::withdraw_milestone_payment(
            &mut contract,
            &mut escrow,
            1,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    // === 4. CREATOR PRIVILEGE ABUSE PREVENTION TESTS ===

    #[test]
    #[expected_failure(abort_code = pactda_core::EApproverChangeBlocked)]
    fun test_change_approver_to_creator_blocked() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, escrow, clock) = setup_milestone_contract(&mut scenario);
        
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Frontend Development'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        // CRITICAL: Creator cannot set themselves as approver
        pactda_core::change_milestone_approver(
            &mut contract,
            1,
            CONTRACTOR, // Creator trying to set themselves as approver
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = pactda_core::EApproverChangeBlocked)]
    fun test_change_approver_same_person_blocked() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, escrow, clock) = setup_milestone_contract(&mut scenario);
        
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Frontend Development'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        // Try to set same approver (no-op protection)
        pactda_core::change_milestone_approver(
            &mut contract,
            1,
            CLIENT, // Same as current approver
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_change_approver_success() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, escrow, clock) = setup_milestone_contract(&mut scenario);
        
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Frontend Development'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        // Change approver from CLIENT to PROJECT_MANAGER
        pactda_core::change_milestone_approver(
            &mut contract,
            1,
            PROJECT_MANAGER,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = pactda_core::EUnauthorized)]
    fun test_change_approver_unauthorized() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, escrow, clock) = setup_milestone_contract(&mut scenario);
        
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Frontend Development'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        // Try to change approver as non-creator
        test_scenario::next_tx(&mut scenario, CLIENT);
        pactda_core::change_milestone_approver(
            &mut contract,
            1,
            PROJECT_MANAGER,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    // === 5. SETTLEMENT VS MILESTONE CONFLICTS TESTS ===

    #[test]
    fun test_milestone_settlement_remaining_balance() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, mut escrow, clock) = setup_milestone_contract(&mut scenario);
        
        fund_escrow_helper(&mut scenario, &mut contract, &mut escrow, &clock, TOTAL_ESCROW_AMOUNT);
        
        // Add one milestone
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Partial Work'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        complete_milestone_workflow(&mut scenario, &mut contract, &mut escrow, &clock, 1, CLIENT);
        
        // Settle remaining balance
        test_scenario::next_tx(&mut scenario, CONTRACTOR);
        let mut resolver = test_scenario::take_shared<ProgrammaticResolver>(&scenario);
        
        resolution_policies::report_outcome(&mut resolver, CLIENT, &clock, test_scenario::ctx(&mut scenario));
        
        pactda_core::settle_agreement(
            &mut contract,
            &mut escrow,
            &resolver,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        // Verify payments
        test_scenario::next_tx(&mut scenario, CONTRACTOR);
        let milestone_payment = test_scenario::take_from_sender<Coin<SUI>>(&scenario);
        assert!(coin::value(&milestone_payment) == MILESTONE_1_AMOUNT, 0);
        
        test_scenario::next_tx(&mut scenario, CLIENT);
        let settlement_payment = test_scenario::take_from_sender<Coin<SUI>>(&scenario);
        let remaining_amount = TOTAL_ESCROW_AMOUNT - MILESTONE_1_AMOUNT;
        assert!(coin::value(&settlement_payment) == remaining_amount, 0);
        
        test_scenario::return_to_sender(&scenario, milestone_payment);
        test_scenario::return_to_sender(&scenario, settlement_payment);
        test_scenario::return_shared(resolver);
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_regular_contract_settlement_unaffected() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, mut escrow, clock) = setup_milestone_contract(&mut scenario);
        
        fund_escrow_helper(&mut scenario, &mut contract, &mut escrow, &clock, TOTAL_ESCROW_AMOUNT);
        
        // Don't add any milestones - use as regular contract
        test_scenario::next_tx(&mut scenario, CONTRACTOR);
        let mut resolver = test_scenario::take_shared<ProgrammaticResolver>(&scenario);
        
        resolution_policies::report_outcome(&mut resolver, CLIENT, &clock, test_scenario::ctx(&mut scenario));
        
        pactda_core::settle_agreement(
            &mut contract,
            &mut escrow,
            &resolver,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        // Verify settlement
        test_scenario::next_tx(&mut scenario, CLIENT);
        let payment = test_scenario::take_from_sender<Coin<SUI>>(&scenario);
        assert!(coin::value(&payment) == TOTAL_ESCROW_AMOUNT, 0);
        
        test_scenario::return_to_sender(&scenario, payment);
        test_scenario::return_shared(resolver);
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    // === 6. ACCESS CONTROL & AUTHORIZATION TESTS ===

    #[test]
    #[expected_failure(abort_code = pactda_core::EUnauthorized)]
    fun test_non_party_access_denied() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, mut escrow, clock) = setup_milestone_contract(&mut scenario);
        
        fund_escrow_helper(&mut scenario, &mut contract, &mut escrow, &clock, TOTAL_ESCROW_AMOUNT);
        
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Frontend Development'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        // Try to complete as non-party
        test_scenario::next_tx(&mut scenario, UNAUTHORIZED);
        pactda_core::complete_milestone(
            &mut contract,
            1,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = pactda_core::EInvalidStatus)]
    fun test_active_contract_only_operations() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
        
        let resolver = resolution_policies::create_resolver(
            CONTRACTOR,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        let parties = vector[CONTRACTOR, CLIENT, PROJECT_MANAGER];
        pactda_core::create_agreement(
            parties,
            resolver,
            string::utf8(b"Draft Contract"),
            CONTRACTOR,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::next_tx(&mut scenario, CONTRACTOR);
        let mut contract = test_scenario::take_shared<PactDaContract>(&scenario);
        let escrow = test_scenario::take_shared<Escrow>(&scenario);
        
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Test'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        // Try to complete milestone on DRAFT contract (should fail)
        pactda_core::complete_milestone(
            &mut contract,
            1,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    // === 7. STATE CORRUPTION & RACE CONDITIONS TESTS ===

    #[test]
    #[expected_failure(abort_code = pactda_core::EInvalidMilestone)]
    fun test_double_completion_prevention() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, mut escrow, clock) = setup_milestone_contract(&mut scenario);
        
        fund_escrow_helper(&mut scenario, &mut contract, &mut escrow, &clock, TOTAL_ESCROW_AMOUNT);
        
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Frontend Development'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        // Complete milestone first time
        pactda_core::complete_milestone(
            &mut contract,
            1,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        // Try to complete again (should fail)
        pactda_core::complete_milestone(
            &mut contract,
            1,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = pactda_core::EInvalidMilestone)]
    fun test_double_approval_prevention() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, mut escrow, clock) = setup_milestone_contract(&mut scenario);
        
        fund_escrow_helper(&mut scenario, &mut contract, &mut escrow, &clock, TOTAL_ESCROW_AMOUNT);
        
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Frontend Development'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        pactda_core::complete_milestone(&mut contract, 1, &clock, test_scenario::ctx(&mut scenario));
        
        test_scenario::next_tx(&mut scenario, CLIENT);
        pactda_core::approve_milestone(&mut contract, 1, &clock, test_scenario::ctx(&mut scenario));
        
        // Try to approve again (should fail)
        pactda_core::approve_milestone(&mut contract, 1, &clock, test_scenario::ctx(&mut scenario));
        
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    // === 8. ERROR CODE COVERAGE TESTS ===

    #[test]
    #[expected_failure(abort_code = pactda_core::EMilestoneNotFound)]
    fun test_invalid_milestone_id() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, mut escrow, clock) = setup_milestone_contract(&mut scenario);
        
        fund_escrow_helper(&mut scenario, &mut contract, &mut escrow, &clock, TOTAL_ESCROW_AMOUNT);
        
        // Try to complete non-existent milestone
        pactda_core::complete_milestone(
            &mut contract,
            999, // Non-existent ID
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    // === 9. INTEGRATION & BACKWARDS COMPATIBILITY TESTS ===

    #[test]
    fun test_complete_milestone_project_workflow() {
        let mut scenario = test_scenario::begin(CONTRACTOR);
        let (mut contract, mut escrow, clock) = setup_milestone_contract(&mut scenario);
        
        fund_escrow_helper(&mut scenario, &mut contract, &mut escrow, &clock, TOTAL_ESCROW_AMOUNT);
        
        // Add 3 milestones
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_1_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Frontend', 'deadline': '2025-02-15'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_2_AMOUNT,
            CLIENT,
            string::utf8(b"{'title': 'Backend', 'deadline': '2025-03-15'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        pactda_core::add_milestone(
            &mut contract,
            MILESTONE_3_AMOUNT,
            PROJECT_MANAGER,
            string::utf8(b"{'title': 'Testing', 'deadline': '2025-04-15'}"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        // Complete all milestones
        complete_milestone_workflow(&mut scenario, &mut contract, &mut escrow, &clock, 1, CLIENT);
        complete_milestone_workflow(&mut scenario, &mut contract, &mut escrow, &clock, 2, CLIENT);
        complete_milestone_workflow(&mut scenario, &mut contract, &mut escrow, &clock, 3, PROJECT_MANAGER);
        
        // Verify all payments received
        test_scenario::next_tx(&mut scenario, CONTRACTOR);
        let payment1 = test_scenario::take_from_sender<Coin<SUI>>(&scenario);
        let payment2 = test_scenario::take_from_sender<Coin<SUI>>(&scenario);
        let payment3 = test_scenario::take_from_sender<Coin<SUI>>(&scenario);
        
        let total_received = coin::value(&payment1) + coin::value(&payment2) + coin::value(&payment3);
        assert!(total_received == MILESTONE_1_AMOUNT + MILESTONE_2_AMOUNT + MILESTONE_3_AMOUNT, 0);
        
        test_scenario::return_to_sender(&scenario, payment1);
        test_scenario::return_to_sender(&scenario, payment2);
        test_scenario::return_to_sender(&scenario, payment3);
        test_scenario::return_shared(contract);
        test_scenario::return_shared(escrow);
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }
}