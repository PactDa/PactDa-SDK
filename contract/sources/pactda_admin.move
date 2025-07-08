/*
/// Module: pactda_admin
/// PactDa Admin Module - MVP Version
/// Administrative functions and capabilities
*/

module pactda::pactda_admin {
    // === Imports ===
    use sui::event;
    use std::string::{Self, String};
    use sui::tx_context::{TxContext};
    use sui::object::{UID, ID};
    use sui::transfer;
    use sui::clock::{Clock};
    use std::vector;

    // === Error Codes ===
    const EUnauthorized: u64 = 1;

    // === Admin Capability ===

    /// AdminCap Object - One-time capability for team lead
    public struct AdminCap has key, store {
        id: UID,
        created_at: u64,
        admin_address: address,
        permissions: vector<String>,
    }

    /// VCNFT for demonstration purposes
    public struct VCNFT has key, store {
        id: UID,
        name: String,
        description: String,
        image_url: String,
        attributes: vector<String>,
        minted_by: address,
        minted_at: u64,
        token_id: u64,
    }

    // === Events ===

    /// Admin Cap Created Event
    public struct AdminCapCreatedEvent has copy, drop {
        admin_cap_id: ID,
        admin_address: address,
        timestamp: u64,
    }

    /// VCNFT Minted Event
    public struct VCNFTMintedEvent has copy, drop {
        nft_id: ID,
        name: String,
        recipient: address,
        token_id: u64,
        minted_by: address,
        timestamp: u64,
    }

    // === Admin Functions ===

    /// Initialize admin capability - Called once on package publish
    fun init(ctx: &mut TxContext) {
        let admin_address = tx_context::sender(ctx);
        
        // Create permissions vector
        let mut permissions = vector::empty<String>();
        vector::push_back(&mut permissions, string::utf8(b"mint_vcnft"));
        vector::push_back(&mut permissions, string::utf8(b"manage_protocol"));
        vector::push_back(&mut permissions, string::utf8(b"emergency_pause"));
        
        let admin_cap = AdminCap {
            id: object::new(ctx),
            created_at: 0, // Will be set when clock is available
            admin_address,
            permissions,
        };
        
        let admin_cap_id = object::id(&admin_cap);
        
        // Emit event
        event::emit(AdminCapCreatedEvent {
            admin_cap_id,
            admin_address,
            timestamp: 0,
        });
        
        // Transfer to admin
        transfer::public_transfer(admin_cap, admin_address);
    }

    /// Mint VCNFT for demonstration purposes
    public entry fun admin_mint_vcnft(
        _admin_cap: &AdminCap,
        recipient: address,
        name: String,
        description: String,
        image_url: String,
        attributes: vector<String>,
        token_id: u64,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = sui::clock::timestamp_ms(clock);
        
        // Validate admin capability (ownership is checked by reference)
        // Additional validation could be added here
        
        let vcnft = VCNFT {
            id: object::new(ctx),
            name,
            description,
            image_url,
            attributes,
            minted_by: sender,
            minted_at: current_time,
            token_id,
        };
        
        let nft_id = object::id(&vcnft);
        
        // Emit event
        event::emit(VCNFTMintedEvent {
            nft_id,
            name,
            recipient,
            token_id,
            minted_by: sender,
            timestamp: current_time,
        });
        
        // Transfer to recipient
        transfer::public_transfer(vcnft, recipient);
    }

    /// Update admin permissions (admin only)
    public entry fun update_permissions(
        admin_cap: &mut AdminCap,
        new_permissions: vector<String>,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        
        // Validate sender is the admin
        assert!(sender == admin_cap.admin_address, EUnauthorized);
        
        // Update permissions
        admin_cap.permissions = new_permissions;
    }

    /// Transfer admin capability to new admin
    public entry fun transfer_admin_cap(
        admin_cap: AdminCap,
        new_admin: address,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        
        // Validate sender is current admin
        assert!(sender == admin_cap.admin_address, EUnauthorized);
        
        // Transfer to new admin
        transfer::public_transfer(admin_cap, new_admin);
    }

    // === Getter Functions for SDK/API ===

    /// Get admin cap details
    public fun get_admin_details(admin_cap: &AdminCap): (address, vector<String>, u64) {
        (admin_cap.admin_address, admin_cap.permissions, admin_cap.created_at)
    }

    /// Get VCNFT details
    public fun get_vcnft_details(vcnft: &VCNFT): (String, String, String, u64, address, u64) {
        (
            vcnft.name,
            vcnft.description,
            vcnft.image_url,
            vcnft.token_id,
            vcnft.minted_by,
            vcnft.minted_at
        )
    }

    /// Check if address has admin capability
    public fun is_admin(admin_cap: &AdminCap, address: address): bool {
        admin_cap.admin_address == address
    }

    /// Check if admin has specific permission
    public fun has_permission(admin_cap: &AdminCap, permission: String): bool {
        vector::contains(&admin_cap.permissions, &permission)
    }

    #[test_only]
    public fun is_valid_admin(admin_cap: &AdminCap): bool {
        // Basic validation - admin cap exists and has valid permissions
        vector::length(&admin_cap.permissions) > 0 && 
        admin_cap.admin_address != @0x0
    }

    #[test_only]
    public fun test_admin_cap_creation(ctx: &mut TxContext) {
        init(ctx)
    }
} 