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

    // === Core MVP Structs ===

    /// Simplified PactDa Contract - MVP Version
    public struct PactDaContract has key, store {
        id: UID,
        // Core fields as specified in MVP
        parties: vector<address>,
        status: u8,
        escrow_id: ID,
        resolution_policy_id: ID,
        
        // Additional essential fields
        title: String,
        created_at: u64,
        creator: address,
    }

    /// Simplified Escrow - MVP Version  
    public struct Escrow has key, store {
        id: UID,
        // Core fields as specified in MVP
        contract_id: ID,
        balance: Balance<SUI>,
        
        // Additional essential fields
        status: u8,
        funded_by: vector<address>,
        funded_amounts: vector<u64>,
        created_at: u64,
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

    // === Core Functions ===

    /// Create agreement - MVP Implementation matching spec
    public entry fun create_agreement(
        parties: vector<address>,
        resolver: ProgrammaticResolver,
        title: String,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = sui::clock::timestamp_ms(clock);
        
        // Validate input
        assert!(vector::length(&parties) >= 2, EInvalidParty);
        assert!(!vector::is_empty(&parties), EInvalidParty);
        
        let resolver_id = object::id(&resolver);
        
        // Create UIDs for proper linking
        let contract_uid = object::new(ctx);
        let escrow_uid = object::new(ctx);
        let contract_id = object::uid_to_inner(&contract_uid);
        let escrow_id = object::uid_to_inner(&escrow_uid);
        
        // Create contract with linked escrow ID
        let contract = PactDaContract {
            id: contract_uid,
            parties,
            status: CONTRACT_STATUS_DRAFT,
            escrow_id,
            resolution_policy_id: resolver_id,
            title,
            created_at: current_time,
            creator: sender,
        };
        
        // Create escrow with linked contract ID
        let escrow = Escrow {
            id: escrow_uid,
            contract_id,
            balance: balance::zero(),
            status: ESCROW_STATUS_EMPTY,
            funded_by: vector::empty(),
            funded_amounts: vector::empty(),
            created_at: current_time,
        };
        
        // Emit event
        event::emit(AgreementCreatedEvent {
            contract_id,
            escrow_id,
            resolution_policy_id: resolver_id,
            parties: contract.parties,
            creator: sender,
            title,
            timestamp: current_time,
        });
        
        // Make all objects shared
        transfer::public_share_object(contract);
        transfer::public_share_object(escrow);
        transfer::public_share_object(resolver);
    }

    /// Fund escrow - MVP Implementation
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
        assert!(vector::contains(&contract.parties, &sender), EUnauthorized);
        // Allow funding in both DRAFT and ACTIVE status for multiple party funding
        assert!(contract.status == CONTRACT_STATUS_DRAFT || contract.status == CONTRACT_STATUS_ACTIVE, EInvalidStatus);
        
        // Validate escrow belongs to contract
        assert!(escrow.contract_id == object::id(contract), EEscrowNotFound);
        
        let amount = coin::value(&payment);
        assert!(amount > 0, EInsufficientFunds);
        
        // Add funds to escrow
        balance::join(&mut escrow.balance, coin::into_balance(payment));
        vector::push_back(&mut escrow.funded_by, sender);
        vector::push_back(&mut escrow.funded_amounts, amount);
        
        // Update status
        escrow.status = ESCROW_STATUS_FUNDED;
        contract.status = CONTRACT_STATUS_ACTIVE;
        
        let total_balance = balance::value(&escrow.balance);
        
        // Emit event
        event::emit(EscrowFundedEvent {
            escrow_id: object::id(escrow),
            contract_id: object::id(contract),
            funded_by: sender,
            amount,
            total_balance,
            timestamp: current_time,
        });
    }

    /// Settle agreement - MVP Implementation reading from resolver
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
        
        // Read outcome from resolver - MVP spec requirement
        assert!(resolution_policies::is_resolved(resolver), ENotResolved);
        let winner_option = resolution_policies::get_outcome(resolver);
        assert!(option::is_some(&winner_option), ENotResolved);
        let winner = *option::borrow(&winner_option);
        
        // Validate winner is a party
        assert!(vector::contains(&contract.parties, &winner), EInvalidParty);
        
        // Transfer funds to winner
        let total_amount = balance::value(&escrow.balance);
        let payout = coin::from_balance(
            balance::withdraw_all(&mut escrow.balance),
            ctx
        );
        
        // Update status
        contract.status = CONTRACT_STATUS_COMPLETED;
        escrow.status = ESCROW_STATUS_RELEASED;
        
        // Emit event
        event::emit(AgreementSettledEvent {
            contract_id: object::id(contract),
            escrow_id: object::id(escrow),
            winner,
            amount: total_amount,
            timestamp: current_time,
        });
        
        // Transfer payout to winner
        transfer::public_transfer(payout, winner);
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