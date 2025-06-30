/*
/// Module: resolution_policies
/// PactDa Resolution Policies - MVP Version
/// Programmatic resolution for agreements
*/

module pactda::resolution_policies {
    // === Imports ===
    use sui::event;
    use std::string::{Self, String};
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use std::option::{Self, Option};
    use sui::clock::{Clock};

    // === Error Codes ===
    const EUnauthorized: u64 = 1;
    const EAlreadyResolved: u64 = 2;
    const EInvalidOutcome: u64 = 3;
    const EInvalidContract: u64 = 4;

    // === Outcome Constants ===
    const OUTCOME_PENDING: u8 = 0;
    const OUTCOME_PARTY_A_WINS: u8 = 1;
    const OUTCOME_PARTY_B_WINS: u8 = 2;
    const OUTCOME_DRAW: u8 = 3;
    const OUTCOME_CANCELLED: u8 = 4;

    // === Programmatic Resolver Module ===

    /// ProgrammaticResolver Object - MVP Implementation
    public struct ProgrammaticResolver has key, store {
        id: UID,
        // Core fields as specified in MVP
        contract_id: ID,
        authority_address: address,
        outcome: u8,
        
        // Additional essential fields
        created_at: u64,
        resolved_at: Option<u64>,
        resolution_data: String,
    }

    // === Events ===

    /// Resolver Created Event
    public struct ResolverCreatedEvent has copy, drop {
        resolver_id: ID,
        contract_id: ID,
        authority_address: address,
        timestamp: u64,
    }

    /// Outcome Reported Event
    public struct OutcomeReportedEvent has copy, drop {
        resolver_id: ID,
        contract_id: ID,
        authority_address: address,
        outcome: u8,
        resolution_data: String,
        timestamp: u64,
    }

    // === Core Functions ===

    /// Create a new programmatic resolver
    public entry fun create_resolver(
        contract_id: ID,
        authority_address: address,
        clock: &Clock,
        ctx: &mut TxContext,
    ): ID {
        let current_time = sui::clock::timestamp_ms(clock);
        
        let resolver = ProgrammaticResolver {
            id: object::new(ctx),
            contract_id,
            authority_address,
            outcome: OUTCOME_PENDING,
            created_at: current_time,
            resolved_at: option::none(),
            resolution_data: string::utf8(b""),
        };
        
        let resolver_id = object::id(&resolver);
        
        // Emit event
        event::emit(ResolverCreatedEvent {
            resolver_id,
            contract_id,
            authority_address,
            timestamp: current_time,
        });
        
        transfer::public_share_object(resolver);
        resolver_id
    }

    /// Report outcome - Critical security checkpoint
    public entry fun report_outcome(
        resolver: &mut ProgrammaticResolver,
        outcome: u8,
        resolution_data: String,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = sui::clock::timestamp_ms(clock);
        
        // Critical security check - only authority can report outcome
        assert!(sender == resolver.authority_address, EUnauthorized);
        
        // Validate outcome hasn't been set yet
        assert!(resolver.outcome == OUTCOME_PENDING, EAlreadyResolved);
        
        // Validate outcome value
        assert!(
            outcome == OUTCOME_PARTY_A_WINS || 
            outcome == OUTCOME_PARTY_B_WINS || 
            outcome == OUTCOME_DRAW || 
            outcome == OUTCOME_CANCELLED,
            EInvalidOutcome
        );
        
        // Set the outcome
        resolver.outcome = outcome;
        resolver.resolved_at = option::some(current_time);
        resolver.resolution_data = resolution_data;
        
        // Emit event
        event::emit(OutcomeReportedEvent {
            resolver_id: object::id(resolver),
            contract_id: resolver.contract_id,
            authority_address: sender,
            outcome,
            resolution_data,
            timestamp: current_time,
        });
    }

    // === Getter Functions for SDK/API ===

    /// Get resolver details
    public fun get_resolver_details(resolver: &ProgrammaticResolver): (ID, address, u8, String) {
        (resolver.contract_id, resolver.authority_address, resolver.outcome, resolver.resolution_data)
    }

    /// Check if resolver is resolved
    public fun is_resolved(resolver: &ProgrammaticResolver): bool {
        resolver.outcome != OUTCOME_PENDING
    }

    /// Get outcome
    public fun get_outcome(resolver: &ProgrammaticResolver): u8 {
        resolver.outcome
    }

    /// Check if address is authorized to resolve
    public fun is_authority(resolver: &ProgrammaticResolver, address: address): bool {
        resolver.authority_address == address
    }

    // === Public Constants for SDK/API ===
    
    public fun outcome_pending(): u8 { OUTCOME_PENDING }
    public fun outcome_party_a_wins(): u8 { OUTCOME_PARTY_A_WINS }
    public fun outcome_party_b_wins(): u8 { OUTCOME_PARTY_B_WINS }
    public fun outcome_draw(): u8 { OUTCOME_DRAW }
    public fun outcome_cancelled(): u8 { OUTCOME_CANCELLED }
} 