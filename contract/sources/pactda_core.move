/*
/// Module: pactda_core
/// PactDa Protocol Core Module - MVP Version
/// Simplified implementation for Trust-as-a-Service platform
/// Features: Basic agreements, escrow, and programmatic resolution
*/

module pactda::pactda_core {
    // === Imports ===
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::event;
    use std::string::{Self, String};
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use std::option::{Self, Option};
    use std::vector;
    use sui::clock::{Clock};
    use pactda::resolution_policies::{Self, ProgrammaticResolver};

    // === Error Codes ===
    const EUnauthorized: u64 = 1;
    const EInvalidStatus: u64 = 2;
    const EInvalidParty: u64 = 3;
    const EInsufficientFunds: u64 = 4;
    const EContractNotFound: u64 = 5;
    const EEscrowNotFound: u64 = 6;
    const EAlreadyFunded: u64 = 7;
    const ENotResolved: u64 = 8;
    
    // === Milestone Error Codes ===
    const EMilestoneNotFound: u64 = 9;
    const EInvalidMilestone: u64 = 10;
    const EMilestoneAlreadyCompleted: u64 = 11;
    const EMilestoneNotApproved: u64 = 12;
    const EMilestoneAlreadyWithdrawn: u64 = 13;
    const EInvalidWithdrawalAmount: u64 = 14;
    const EMilestoneInvalidApprover: u64 = 15;
    const EMilestoneExceedsBalance: u64 = 16;
    
    // === Phase 4 Security Error Codes ===
    const EArithmeticOverflow: u64 = 17;
    const EArithmeticUnderflow: u64 = 18;
    const ESettlementConflict: u64 = 19;
    const EInsufficientEscrow: u64 = 20;
    const EApproverChangeBlocked: u64 = 21;

    // === Status Constants ===
    const CONTRACT_STATUS_DRAFT: u8 = 0;
    const CONTRACT_STATUS_ACTIVE: u8 = 1;
    const CONTRACT_STATUS_COMPLETED: u8 = 2;
    const CONTRACT_STATUS_DISPUTED: u8 = 3;
    const CONTRACT_STATUS_CANCELLED: u8 = 4;

    const ESCROW_STATUS_EMPTY: u8 = 0;
    const ESCROW_STATUS_FUNDED: u8 = 1;
    const ESCROW_STATUS_RELEASED: u8 = 2;
    const ESCROW_STATUS_REFUNDED: u8 = 3;

    // === Milestone Status Constants ===
    const MILESTONE_STATUS_PENDING: u8 = 0;
    const MILESTONE_STATUS_COMPLETED: u8 = 1;
    const MILESTONE_STATUS_APPROVED: u8 = 2;
    const MILESTONE_STATUS_WITHDRAWN: u8 = 3;

    // === Core MVP Structs ===

    /// Milestone struct for project-based payments
    public struct Milestone has store, copy, drop {
        id: u64,                        // Unique milestone ID within contract
        withdrawal_amount: u64,         // Amount contractor can withdraw for this milestone
        approver: address,              // Who can approve this milestone completion
        status: u8,                     // Current milestone status (pending/completed/approved/withdrawn)
        metadata: String,               // JSON blob for client-side complex data
        created_at: u64,                // When milestone was created
        completed_at: Option<u64>,      // When contractor marked as completed
        approved_at: Option<u64>,       // When approver approved the work
        withdrawn_at: Option<u64>,      // When payment was withdrawn
    }

    public struct PactDaContract has key, store {
        id: UID,
        parties: vector<address>,
        status: u8,
        escrow_id: ID,
        resolution_policy_id: ID,
        
        // Additional essential fields
        title: String,
        created_at: u64,
        creator: address,
        
        // Milestone support fields (minimal approach)
        milestone_mode: bool,                   // Flag: true for milestone contracts, false for regular
        milestones: Option<vector<Milestone>>,  // Optional milestone storage (None for regular contracts)
        next_milestone_id: u64,                 // Auto-incrementing ID counter for unique milestone IDs
    }

    public struct Escrow has key, store {
        id: UID,
        contract_id: ID,
        balance: Balance<SUI>,
        
        // Additional essential fields
        status: u8,
        funded_by: vector<address>,
        funded_amounts: vector<u64>,
        created_at: u64,
        
        // Milestone withdrawal tracking
        total_milestone_withdrawn: u64,         // Total amount withdrawn via milestones
        
        is_settlement_locked: bool,             // Prevents settlement after milestone withdrawals
    }

    // === Events ===

    /// Agreement Created Event
    public struct AgreementCreatedEvent has copy, drop {
        contract_id: ID,
        escrow_id: ID,
        resolution_policy_id: ID,
        parties: vector<address>,
        creator: address,
        title: String,
        timestamp: u64,
    }

    /// Escrow Funded Event
    public struct EscrowFundedEvent has copy, drop {
        escrow_id: ID,
        contract_id: ID,
        funded_by: address,
        amount: u64,
        total_balance: u64,
        timestamp: u64,
    }

    /// Agreement Settled Event
    public struct AgreementSettledEvent has copy, drop {
        contract_id: ID,
        escrow_id: ID,
        winner: address,
        amount: u64,
        timestamp: u64,
    }

    
    /// Safe addition with overflow protection
    fun safe_add_u64(a: u64, b: u64): u64 {
        let max_u64 = 18446744073709551615; // 2^64 - 1
        assert!(a <= max_u64 - b, EArithmeticOverflow);
        a + b
    }
    
    /// Safe subtraction with underflow protection
    fun safe_sub_u64(a: u64, b: u64): u64 {
        assert!(a >= b, EArithmeticUnderflow);
        a - b
    }
    
    /// Calculate available escrow balance safely
    fun get_available_escrow_balance(escrow: &Escrow): u64 {
        let total_balance = balance::value(&escrow.balance);
        if (escrow.total_milestone_withdrawn > total_balance) {
            0 
        } else {
            total_balance - escrow.total_milestone_withdrawn
        }
    }
    
    /// Validate escrow has sufficient balance for operation
    fun validate_escrow_balance(escrow: &Escrow, required_amount: u64) {
        let available = get_available_escrow_balance(escrow);
        assert!(available >= required_amount, EInsufficientEscrow);
        assert!(balance::value(&escrow.balance) >= required_amount, EInsufficientEscrow);
    }

    // === Core Functions ===

    /// Create agreement 
    public entry fun create_agreement(
        parties: vector<address>,
        authority_address: address,
        title: String,
        creator: address,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let current_time = sui::clock::timestamp_ms(clock);
        
        // Validate input
        assert!(vector::length(&parties) >= 2, EInvalidParty);
        assert!(!vector::is_empty(&parties), EInvalidParty);
        
        let resolver = resolution_policies::create_resolver(authority_address, clock, ctx);
        let resolver_id = object::id(&resolver);
        
        let contract_uid = object::new(ctx);
        let escrow_uid = object::new(ctx);
        let contract_id = object::uid_to_inner(&contract_uid);
        let escrow_id = object::uid_to_inner(&escrow_uid);
        
        let contract = PactDaContract {
            id: contract_uid,
            parties,
            status: CONTRACT_STATUS_DRAFT,
            escrow_id,
            resolution_policy_id: resolver_id,
            title,
            created_at: current_time,
            creator: creator,
            // Initialize milestone fields for regular contract
            milestone_mode: false,
            milestones: option::none(),
            next_milestone_id: 1,
        };
        
        let escrow = Escrow {
            id: escrow_uid,
            contract_id,
            balance: balance::zero(),
            status: ESCROW_STATUS_EMPTY,
            funded_by: vector::empty(),
            funded_amounts: vector::empty(),
            created_at: current_time,
            // Initialize milestone tracking
            total_milestone_withdrawn: 0,
            // Initialize Phase 4 security fields
            is_settlement_locked: false,
        };
        
        event::emit(AgreementCreatedEvent {
            contract_id,
            escrow_id,
            resolution_policy_id: resolver_id,
            parties: contract.parties,
            creator: creator,
            title,
            timestamp: current_time,
        });
        
        transfer::public_share_object(contract);
        transfer::public_share_object(escrow);
        transfer::public_transfer(resolver, authority_address);
    }

    /// Fund escrow 
    public entry fun fund_escrow(
        contract: &mut PactDaContract,
        escrow: &mut Escrow,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = sui::clock::timestamp_ms(clock);
        
        // Validate sender is a party
        // TODO: no need to check cause server do
        // assert!(vector::contains(&contract.parties, &sender), EUnauthorized);
        // Allow funding in both DRAFT and ACTIVE status for multiple party funding
        assert!(contract.status == CONTRACT_STATUS_DRAFT || contract.status == CONTRACT_STATUS_ACTIVE, EInvalidStatus);

        // Validate contract.creator must be the same
        assert!(sender == contract.creator, EUnauthorized);

        
        // Validate escrow belongs to contract
        assert!(escrow.contract_id == object::id(contract), EEscrowNotFound);
        
        let amount = coin::value(&payment);
        assert!(amount > 0, EInsufficientFunds);
        
        balance::join(&mut escrow.balance, coin::into_balance(payment));
        vector::push_back(&mut escrow.funded_by, sender);
        vector::push_back(&mut escrow.funded_amounts, amount);
        
        escrow.status = ESCROW_STATUS_FUNDED;
        contract.status = CONTRACT_STATUS_ACTIVE;
        
        let total_balance = balance::value(&escrow.balance);
        
        event::emit(EscrowFundedEvent {
            escrow_id: object::id(escrow),
            contract_id: object::id(contract),
            funded_by: sender,
            amount,
            total_balance,
            timestamp: current_time,
        });
    }

    /// Settle agreement
    public entry fun settle_agreement(
        contract: &mut PactDaContract,
        escrow: &mut Escrow,
        resolver: &ProgrammaticResolver,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let current_time = sui::clock::timestamp_ms(clock);
        
        // Validate escrow belongs to contract
        assert!(escrow.contract_id == object::id(contract), EEscrowNotFound);
        assert!(contract.escrow_id == object::id(escrow), EEscrowNotFound);
        
        // Validate resolver belongs to contract
        assert!(contract.resolution_policy_id == object::id(resolver), ENotResolved);
        
        // Validate status
        assert!(contract.status == CONTRACT_STATUS_ACTIVE, EInvalidStatus);
        assert!(escrow.status == ESCROW_STATUS_FUNDED, EInvalidStatus);
        
        assert!(!escrow.is_settlement_locked, ESettlementConflict);
        
        assert!(resolution_policies::is_resolved(resolver), ENotResolved);
        let winner_option = resolution_policies::get_outcome(resolver);
        assert!(option::is_some(&winner_option), ENotResolved);
        let winner = *option::borrow(&winner_option);
        assert!(vector::contains(&contract.parties, &winner), EInvalidParty);
        
        let settlement_amount = if (contract.milestone_mode) {
            get_available_escrow_balance(escrow)
        } else {
            balance::value(&escrow.balance)
        };
        
        assert!(settlement_amount > 0, EInsufficientEscrow);
        
        let payout = if (contract.milestone_mode) {
            coin::from_balance(
                balance::split(&mut escrow.balance, settlement_amount),
                ctx
            )
        } else {
            coin::from_balance(
                balance::withdraw_all(&mut escrow.balance),
                ctx
            )
        };
        
        contract.status = CONTRACT_STATUS_COMPLETED;
        escrow.status = ESCROW_STATUS_RELEASED;
        
        event::emit(AgreementSettledEvent {
            contract_id: object::id(contract),
            escrow_id: object::id(escrow),
            winner,
            amount: settlement_amount,
            timestamp: current_time,
        });
        
        transfer::public_transfer(payout, winner);
    }

    /// Add milestone to existing agreement
    /// AIDEV-NOTE: Only creator can add milestones, works on DRAFT/ACTIVE contracts, no balance validation needed
    public entry fun add_milestone(
        contract: &mut PactDaContract,
        withdrawal_amount: u64,
        approver: address,
        metadata: String,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = sui::clock::timestamp_ms(clock);
        
        // Validate only creator can add milestones
        assert!(sender == contract.creator, EUnauthorized);
        
        // Validate contract status - only DRAFT and ACTIVE allowed
        assert!(
            contract.status == CONTRACT_STATUS_DRAFT || contract.status == CONTRACT_STATUS_ACTIVE,
            EInvalidStatus
        );
        
        // Validate approver is a party to the contract
        assert!(vector::contains(&contract.parties, &approver), EMilestoneInvalidApprover);
        
        // Validate withdrawal amount
        assert!(withdrawal_amount > 0, EInvalidWithdrawalAmount);
        
        if (!contract.milestone_mode) {
            contract.milestone_mode = true;
            contract.milestones = option::some(vector::empty<Milestone>());
        };
        
        let milestone_id = contract.next_milestone_id;
        contract.next_milestone_id = milestone_id + 1;
        
        let milestone = Milestone {
            id: milestone_id,
            withdrawal_amount,
            approver,
            status: MILESTONE_STATUS_PENDING,
            metadata,
            created_at: current_time,
            completed_at: option::none(),
            approved_at: option::none(),
            withdrawn_at: option::none(),
        };
        
        let milestones_ref = option::borrow_mut(&mut contract.milestones);
        vector::push_back(milestones_ref, milestone);
        
        event::emit(MilestoneCreatedEvent {
            contract_id: object::id(contract),
            milestone_id,
            withdrawal_amount,
            approver,
            creator: sender,
            timestamp: current_time,
        });
    }

    /// Remove milestone from agreement
    /// AIDEV-NOTE: Only creator can remove, only pending milestones can be removed
    public entry fun remove_milestone(
        contract: &mut PactDaContract,
        milestone_id: u64,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = sui::clock::timestamp_ms(clock);
        
        // Validate only creator can remove milestones
        assert!(sender == contract.creator, EUnauthorized);
        
        // Validate contract has milestone mode enabled
        assert!(contract.milestone_mode, EInvalidMilestone);
        assert!(option::is_some(&contract.milestones), EInvalidMilestone);
        
        let milestones_ref = option::borrow_mut(&mut contract.milestones);
        let milestone_count = vector::length(milestones_ref);
        let mut found_index: Option<u64> = option::none();
        
        // Find milestone by ID
        let mut i = 0;
        while (i < milestone_count) {
            let milestone = vector::borrow(milestones_ref, i);
            if (milestone.id == milestone_id) {
                assert!(milestone.status == MILESTONE_STATUS_PENDING, EMilestoneAlreadyCompleted);
                found_index = option::some(i);
                break
            };
            i = i + 1;
        };
        
        assert!(option::is_some(&found_index), EMilestoneNotFound);
        let index = *option::borrow(&found_index);
        
        vector::remove(milestones_ref, index);
        
        event::emit(MilestoneRemovedEvent {
            contract_id: object::id(contract),
            milestone_id,
            creator: sender,
            timestamp: current_time,
        });
    }

    /// Complete milestone 
    /// AIDEV-NOTE: Only non-approver parties can complete milestones, only on ACTIVE contracts
    public entry fun complete_milestone(
        contract: &mut PactDaContract,
        milestone_id: u64,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = sui::clock::timestamp_ms(clock);
        
        // Validate contract status - only ACTIVE contracts allowed
        assert!(contract.status == CONTRACT_STATUS_ACTIVE, EInvalidStatus);
        
        // Validate sender is a party to the contract
        // TODO: no need to check cause server send
        //assert!(vector::contains(&contract.parties, &sender), EUnauthorized);
        // Validate contract.creator must be the same
        assert!(sender == contract.creator, EUnauthorized);

        
        // Validate contract has milestone mode enabled
        assert!(contract.milestone_mode, EInvalidMilestone);
        assert!(option::is_some(&contract.milestones), EInvalidMilestone);
        
        let milestones_ref = option::borrow_mut(&mut contract.milestones);
        let milestone_count = vector::length(milestones_ref);
        let mut found_index: Option<u64> = option::none();
        
        // Find milestone by ID
        let mut i = 0;
        while (i < milestone_count) {
            let milestone = vector::borrow(milestones_ref, i);
            if (milestone.id == milestone_id) {
                assert!(milestone.status == MILESTONE_STATUS_PENDING, EInvalidMilestone);
                found_index = option::some(i);
                break
            };
            i = i + 1;
        };
        
        assert!(option::is_some(&found_index), EMilestoneNotFound);
        let index = *option::borrow(&found_index);
        
        let milestone_ref = vector::borrow_mut(milestones_ref, index);
        milestone_ref.status = MILESTONE_STATUS_COMPLETED;
        milestone_ref.completed_at = option::some(current_time);
        let approver = milestone_ref.approver;
        
        let contract_id = object::id(contract);
        event::emit(MilestoneCompletedEvent {
            contract_id,
            milestone_id,
            completed_by: sender,
            approver,
            timestamp: current_time,
        });
    }

    /// Approve milestone 
    /// AIDEV-NOTE: Only designated approver can approve completed milestones
    public entry fun approve_milestone(
        contract: &mut PactDaContract,
        milestone_id: u64,
        approver: address, 
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = sui::clock::timestamp_ms(clock);
        
        // Validate contract status - only ACTIVE contracts allowed
        assert!(contract.status == CONTRACT_STATUS_ACTIVE, EInvalidStatus);
        
        // Validate contract has milestone mode enabled
        assert!(contract.milestone_mode, EInvalidMilestone);
        assert!(option::is_some(&contract.milestones), EInvalidMilestone);

        // Validate contract.creator must be the same
        assert!(sender == contract.creator, EUnauthorized);
        
        let milestones_ref = option::borrow_mut(&mut contract.milestones);
        let milestone_count = vector::length(milestones_ref);
        let mut found_index: Option<u64> = option::none();
        
        let mut i = 0;
        while (i < milestone_count) {
            let milestone = vector::borrow(milestones_ref, i);
            if (milestone.id == milestone_id) {
                assert!(approver == milestone.approver, EUnauthorized);
                assert!(milestone.status == MILESTONE_STATUS_COMPLETED, EInvalidMilestone);
                found_index = option::some(i);
                break
            };
            i = i + 1;
        };
        
        assert!(option::is_some(&found_index), EMilestoneNotFound);
        let index = *option::borrow(&found_index);
        
        let milestone_ref = vector::borrow_mut(milestones_ref, index);
        milestone_ref.status = MILESTONE_STATUS_APPROVED;
        milestone_ref.approved_at = option::some(current_time);
        let withdrawal_amount = milestone_ref.withdrawal_amount;
        
        let contract_id = object::id(contract);
        event::emit(MilestoneApprovedEvent {
            contract_id,
            milestone_id,
            approver: sender,
            withdrawal_amount,
            timestamp: current_time,
        });
    }

    /// Withdraw milestone payment 
    public entry fun withdraw_milestone_payment(
        contract: &mut PactDaContract,
        escrow: &mut Escrow,
        milestone_id: u64,
        recipient: address,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = sui::clock::timestamp_ms(clock);
        
        // Validate contract status - only ACTIVE contracts allowed
        assert!(contract.status == CONTRACT_STATUS_ACTIVE, EInvalidStatus);
        
        // Validate escrow belongs to contract
        assert!(escrow.contract_id == object::id(contract), EEscrowNotFound);
        assert!(contract.escrow_id == object::id(escrow), EEscrowNotFound);
        
        // Validate sender is a party to the contrac
        assert!(vector::contains(&contract.parties, &recipient), EUnauthorized);

        // Validate contract.creator must be the same
        assert!(sender == contract.creator, EUnauthorized);

        
        // Validate contract has milestone mode enabled
        assert!(contract.milestone_mode, EInvalidMilestone);
        assert!(option::is_some(&contract.milestones), EInvalidMilestone);
        
        let milestones_ref = option::borrow_mut(&mut contract.milestones);
        let milestone_count = vector::length(milestones_ref);
        let mut found_index: Option<u64> = option::none();
        
        let mut i = 0;
        while (i < milestone_count) {
            let milestone = vector::borrow(milestones_ref, i);
            if (milestone.id == milestone_id) {
                assert!(milestone.status == MILESTONE_STATUS_APPROVED, EMilestoneNotApproved);
                found_index = option::some(i);
                break
            };
            i = i + 1;
        };
        
        // Validate milestone was found
        assert!(option::is_some(&found_index), EMilestoneNotFound);
        let index = *option::borrow(&found_index);
        let milestone_ref = vector::borrow_mut(milestones_ref, index);
        
        validate_escrow_balance(escrow, milestone_ref.withdrawal_amount);
        
        assert!(milestone_ref.withdrawal_amount > 0, EInvalidWithdrawalAmount);
        assert!(balance::value(&escrow.balance) > 0, EInsufficientEscrow);
        
        let withdrawal_amount = milestone_ref.withdrawal_amount;
        
        milestone_ref.status = MILESTONE_STATUS_WITHDRAWN;
        milestone_ref.withdrawn_at = option::some(current_time);
        
        escrow.total_milestone_withdrawn = safe_add_u64(
            escrow.total_milestone_withdrawn, 
            withdrawal_amount
        );
        
        escrow.is_settlement_locked = true;
        
        let payment = coin::from_balance(
            balance::split(&mut escrow.balance, withdrawal_amount),
            ctx
        );
        
        let contract_id = object::id(contract);
        let escrow_id = object::id(escrow);
        event::emit(MilestonePaymentWithdrawnEvent {
            contract_id,
            escrow_id,
            milestone_id,
            withdrawn_by: sender,
            recipient: recipient,
            amount: withdrawal_amount,
            timestamp: current_time,
        });
        
        transfer::public_transfer(payment, recipient);
    }

    /// Change milestone approver
    public entry fun change_milestone_approver(
        contract: &mut PactDaContract,
        milestone_id: u64,
        new_approver: address,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = sui::clock::timestamp_ms(clock);
        
        // Validate only creator can change approver
        assert!(sender == contract.creator, EUnauthorized);
        
        // Validate contract status - only ACTIVE/DRAFT contracts allowed
        assert!(
            contract.status == CONTRACT_STATUS_DRAFT || contract.status == CONTRACT_STATUS_ACTIVE,
            EInvalidStatus
        );
        
        // Validate new approver is a party to the contract
        assert!(vector::contains(&contract.parties, &new_approver), EMilestoneInvalidApprover);
        
        assert!(new_approver != contract.creator, EApproverChangeBlocked);
        
        // Validate contract has milestone mode enabled
        assert!(contract.milestone_mode, EInvalidMilestone);
        assert!(option::is_some(&contract.milestones), EInvalidMilestone);
        
        let milestones_ref = option::borrow_mut(&mut contract.milestones);
        let milestone_count = vector::length(milestones_ref);
        let mut found_index: Option<u64> = option::none();
        
        let mut i = 0;
        while (i < milestone_count) {
            let milestone = vector::borrow(milestones_ref, i);
            if (milestone.id == milestone_id) {
                assert!(
                    milestone.status == MILESTONE_STATUS_PENDING || milestone.status == MILESTONE_STATUS_COMPLETED,
                    EMilestoneAlreadyCompleted
                );
                if (milestone.status == MILESTONE_STATUS_COMPLETED) {
                    assert!(contract.status == CONTRACT_STATUS_DRAFT, EApproverChangeBlocked);
                };
                
                found_index = option::some(i);
                break
            };
            i = i + 1;
        };
        
        // Validate milestone was found
        assert!(option::is_some(&found_index), EMilestoneNotFound);
        let index = *option::borrow(&found_index);
        
        let milestone_ref = vector::borrow_mut(milestones_ref, index);
        let old_approver = milestone_ref.approver;
        
        assert!(old_approver != new_approver, EApproverChangeBlocked);
        
        milestone_ref.approver = new_approver;
        
        let contract_id = object::id(contract);
        event::emit(MilestoneApproverChangedEvent {
            contract_id,
            milestone_id,
            old_approver,
            new_approver,
            changed_by: sender,
            timestamp: current_time,
        });
    }

    // === Events for Milestone Functionality ===

    /// Milestone Created Event
    public struct MilestoneCreatedEvent has copy, drop {
        contract_id: ID,
        milestone_id: u64,
        withdrawal_amount: u64,
        approver: address,
        creator: address,
        timestamp: u64,
    }

    /// Milestone Removed Event
    public struct MilestoneRemovedEvent has copy, drop {
        contract_id: ID,
        milestone_id: u64,
        creator: address,
        timestamp: u64,
    }

    /// Milestone Completed Event
    public struct MilestoneCompletedEvent has copy, drop {
        contract_id: ID,
        milestone_id: u64,
        completed_by: address,
        approver: address,
        timestamp: u64,
    }

    /// Milestone Approved Event
    public struct MilestoneApprovedEvent has copy, drop {
        contract_id: ID,
        milestone_id: u64,
        approver: address,
        withdrawal_amount: u64,
        timestamp: u64,
    }

    /// Milestone Payment Withdrawn Event
    public struct MilestonePaymentWithdrawnEvent has copy, drop {
        contract_id: ID,
        escrow_id: ID,
        milestone_id: u64,
        withdrawn_by: address,
        recipient: address,
        amount: u64,
        timestamp: u64,
    }

    /// Milestone Approver Changed Event
    public struct MilestoneApproverChangedEvent has copy, drop {
        contract_id: ID,
        milestone_id: u64,
        old_approver: address,
        new_approver: address,
        changed_by: address,
        timestamp: u64,
    }

    // === Getter Functions for SDK/API ===

    /// Get contract details
    public fun get_contract_details(contract: &PactDaContract): (vector<address>, u8, ID, ID, String) {
        (contract.parties, contract.status, contract.escrow_id, contract.resolution_policy_id, contract.title)
    }

    /// Get escrow details
    public fun get_escrow_details(escrow: &Escrow): (ID, u64, u8) {
        (escrow.contract_id, balance::value(&escrow.balance), escrow.status)
    }

    /// Check if address is party to contract
    public fun is_party(contract: &PactDaContract, party: address): bool {
        vector::contains(&contract.parties, &party)
    }

    // === Public Constants for SDK/API ===
    
    public fun contract_status_draft(): u8 { CONTRACT_STATUS_DRAFT }
    public fun contract_status_active(): u8 { CONTRACT_STATUS_ACTIVE }
    public fun contract_status_completed(): u8 { CONTRACT_STATUS_COMPLETED }
    public fun contract_status_disputed(): u8 { CONTRACT_STATUS_DISPUTED }
    public fun contract_status_cancelled(): u8 { CONTRACT_STATUS_CANCELLED }
    
    public fun escrow_status_empty(): u8 { ESCROW_STATUS_EMPTY }
    public fun escrow_status_funded(): u8 { ESCROW_STATUS_FUNDED }
    public fun escrow_status_released(): u8 { ESCROW_STATUS_RELEASED }
    public fun escrow_status_refunded(): u8 { ESCROW_STATUS_REFUNDED }
} 