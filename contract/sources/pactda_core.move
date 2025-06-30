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
        escrow_id: Option<ID>,
        resolution_policy_id: Option<ID>,
        
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
        status: u8,
        
        // Additional essential fields
        funded_by: vector<address>,
        funded_amounts: vector<u64>,
        created_at: u64,
    }

    // === Events ===

    /// Contract Created Event
    public struct ContractCreatedEvent has copy, drop {
        contract_id: ID,
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

    /// Create a new agreement - MVP Implementation
    public entry fun create_agreement(
        parties: vector<address>,
        title: String,
        resolution_policy_id: Option<ID>,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = sui::clock::timestamp_ms(clock);
        
        // Validate input
        assert!(vector::length(&parties) >= 2, EInvalidParty);
        assert!(!vector::is_empty(&parties), EInvalidParty);
        
        // Create contract
        let contract = PactDaContract {
            id: object::new(ctx),
            parties,
            status: CONTRACT_STATUS_DRAFT,
            escrow_id: option::none(),
            resolution_policy_id,
            title,
            created_at: current_time,
            creator: sender,
        };
        
        let contract_id = object::id(&contract);
        
        // Emit event
        event::emit(ContractCreatedEvent {
            contract_id,
            parties: contract.parties,
            creator: sender,
            title,
            timestamp: current_time,
        });
        
        // Make contract shared so parties can interact with it
        transfer::public_share_object(contract);
    }

    /// Fund escrow - MVP Implementation
    public entry fun fund_escrow(
        contract: &mut PactDaContract,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = sui::clock::timestamp_ms(clock);
        
        // Validate sender is a party
        assert!(vector::contains(&contract.parties, &sender), EUnauthorized);
        assert!(contract.status == CONTRACT_STATUS_DRAFT, EInvalidStatus);
        
        let amount = coin::value(&payment);
        assert!(amount > 0, EInsufficientFunds);
        
        // Create or update escrow
        if (option::is_none(&contract.escrow_id)) {
            // Create new escrow
            let escrow = Escrow {
                id: object::new(ctx),
                contract_id: object::id(contract),
                balance: coin::into_balance(payment),
                status: ESCROW_STATUS_FUNDED,
                funded_by: vector::singleton(sender),
                funded_amounts: vector::singleton(amount),
                created_at: current_time,
            };
            
            let escrow_id = object::id(&escrow);
            contract.escrow_id = option::some(escrow_id);
            contract.status = CONTRACT_STATUS_ACTIVE;
            
            // Emit event
            event::emit(EscrowFundedEvent {
                escrow_id,
                contract_id: object::id(contract),
                funded_by: sender,
                amount,
                total_balance: amount,
                timestamp: current_time,
            });
            
            transfer::public_share_object(escrow);
        } else {
            // This is a simplified MVP - in production you'd handle multiple fundings
            abort EAlreadyFunded
        };
    }

    /// Settle agreement - MVP Implementation
    public entry fun settle_agreement(
        contract: &mut PactDaContract,
        escrow: &mut Escrow,
        winner: address,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let current_time = sui::clock::timestamp_ms(clock);
        
        // Validate escrow belongs to contract
        assert!(option::contains(&contract.escrow_id, &object::id(escrow)), EEscrowNotFound);
        assert!(escrow.contract_id == object::id(contract), EEscrowNotFound);
        
        // Validate winner is a party
        assert!(vector::contains(&contract.parties, &winner), EInvalidParty);
        
        // Validate status
        assert!(contract.status == CONTRACT_STATUS_ACTIVE, EInvalidStatus);
        assert!(escrow.status == ESCROW_STATUS_FUNDED, EInvalidStatus);
        
        // For MVP, we'll require resolution policy to authorize this
        assert!(option::is_some(&contract.resolution_policy_id), ENotResolved);
        
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
    public fun get_contract_details(contract: &PactDaContract): (vector<address>, u8, Option<ID>, String) {
        (contract.parties, contract.status, contract.resolution_policy_id, contract.title)
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