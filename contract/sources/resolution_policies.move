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
        authority_address: address,
        outcome: Option<address>, // MVP spec: Option<address> (the declared winner)
        
        created_at: u64,
        resolved_at: Option<u64>,
        resolution_data: String,
    }

    // === Events ===

    /// Resolver Created Event
    public struct ResolverCreatedEvent has copy, drop {
        resolver_id: ID,
        authority_address: address,
        timestamp: u64,
    }

    /// Outcome Reported Event
    public struct OutcomeReportedEvent has copy, drop {
        resolver_id: ID,
        authority_address: address,
        winner_address: address,
        resolution_data: String,
        timestamp: u64,
    }

    // === Core Functions ===

    /// Create a new programmatic resolver (internal function)
    public fun create_resolver(
        authority_address: address,
        clock: &Clock,
        ctx: &mut TxContext,
    ): ProgrammaticResolver {
        let current_time = sui::clock::timestamp_ms(clock);
        
        let resolver = ProgrammaticResolver {
            id: object::new(ctx),
            authority_address,
            outcome: option::none(), // MVP spec: starts as None
            created_at: current_time,
            resolved_at: option::none(),
            resolution_data: string::utf8(b""),
        };
        
        let resolver_id = object::id(&resolver);
        
        event::emit(ResolverCreatedEvent {
            resolver_id,
            authority_address,
            timestamp: current_time,
        });
        
        resolver
    }

    /// Create resolver and transfer to authority
    /// AIDEV-NOTE: This function is deprecated as create_agreement now auto-creates resolvers
    public entry fun create_resolver_entry(
        authority_address: address,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let resolver = create_resolver(authority_address, clock, ctx);
        transfer::transfer(resolver, authority_address);
    }
    */

    /// Report outcome 
    public entry fun report_outcome(
        resolver: &mut ProgrammaticResolver,
        winner_address: address,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = sui::clock::timestamp_ms(clock);
        
        assert!(sender == resolver.authority_address, EUnauthorized);
        
        assert!(option::is_none(&resolver.outcome), EAlreadyResolved);
        
        resolver.outcome = option::some(winner_address);
        resolver.resolved_at = option::some(current_time);
        
        event::emit(OutcomeReportedEvent {
            resolver_id: object::id(resolver),
            authority_address: sender,
            winner_address,
            resolution_data: resolver.resolution_data,
            timestamp: current_time,
        });
    }

    // === Getter Functions for SDK/API ===

    /// Get resolver details
    public fun get_resolver_details(resolver: &ProgrammaticResolver): (address, Option<address>, String) {
        (resolver.authority_address, resolver.outcome, resolver.resolution_data)
    }

    /// Check if resolver is resolved
    public fun is_resolved(resolver: &ProgrammaticResolver): bool {
        option::is_some(&resolver.outcome)
    }

    /// Get outcome
    public fun get_outcome(resolver: &ProgrammaticResolver): Option<address> {
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