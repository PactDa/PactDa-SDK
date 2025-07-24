# PactDa Smart Contract CLI Guide - Complete Workflow

This guide shows how to create and manage PactDa contracts from zero using the Sui CLI.

## Prerequisites
- Sui CLI installed and configured
- Active wallet with SUI tokens for gas fees
- Package ID: `0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db`
- Clock ID: `0x6` (system object, always the same)

---

## Step 1: Create Agreement Contract

Create your agreement contract. The resolver is automatically created for you.

### Command Template:
```bash
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function create_agreement \
    --args \
        "[PARTY1_ADDRESS,PARTY2_ADDRESS]" \
        AUTHORITY_ADDRESS \
        "CONTRACT_TITLE" \
        CREATOR_ADDRESS \
        0x6 \
    --gas-budget 10000000
```

### Complete Example:
```bash
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function create_agreement \
    --args \
        "[0x6663396a5a0e06b0d6af81f9b63371ec18f104d5a453a0be0e598862e89f7da0,0x07b565b5969a2dbbd09ee259417e688b5b3cdaca2b139acf03d3f8a6af0da681]" \
        0x07b565b5969a2dbbd09ee259417e688b5b3cdaca2b139acf03d3f8a6af0da681 \
        "Website Development Project" \
        0x07b565b5969a2dbbd09ee259417e688b5b3cdaca2b139acf03d3f8a6af0da681 \
        0x6 \
    --gas-budget 10000000
```

### Parameters explained:
- **parties**: Array of participant addresses (contractor, client, etc.)
- **authority_address**: Address that can resolve disputes (receives the auto-created resolver)
- **title**: Human-readable contract name
- **creator**: Address of the person creating the contract
- **clock**: Always `0x6` (system clock object)

### Save Contract and Escrow IDs:
The transaction will create:
1. **Contract ID** - shared object for managing the agreement
2. **Escrow ID** - shared object for holding funds  
3. **Resolver** - owned by the authority address (auto-created)

---

## Step 2: Fund the Escrow (Optional)

Add funds to the contract's escrow account.

### Command:
```bash
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function fund_escrow \
    --args CONTRACT_ID ESCROW_ID COIN_OBJECT 0x6 \
    --gas-budget 10000000
```

### Get a coin object:
```bash
# Get your coin objects
sui client gas

# Use one of the coin objects from the output
```

---

## Step 3: Add Milestones (Optional)

Create project milestones with specific amounts and approvers.

### Command:
```bash
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function add_milestone \
    --args \
        CONTRACT_ID \
        AMOUNT_IN_MIST \
        APPROVER_ADDRESS \
        '{"title":"Milestone Name","description":"Description"}' \
        0x6 \
    --gas-budget 10000000
```

### Example (300 SUI milestone):
```bash
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function add_milestone \
    --args \
        0xCONTRACT_ID \
        300000000000 \
        0x07b565b5969a2dbbd09ee259417e688b5b3cdaca2b139acf03d3f8a6af0da681 \
        '{"title":"Frontend Development","description":"Complete React frontend"}' \
        0x6 \
    --gas-budget 10000000
```

---

## Milestone Workflow

### Complete Milestone (Contractor):
```bash
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function complete_milestone \
    --args CONTRACT_ID MILESTONE_ID 0x6
```

### Approve Milestone (Client/Approver):
```bash
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function approve_milestone \
    --args CONTRACT_ID MILESTONE_ID 0x6
```

### Withdraw Payment (Contractor):
```bash
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function withdraw_milestone_payment \
    --args CONTRACT_ID ESCROW_ID MILESTONE_ID 0x6
```

---

## Key Addresses Reference

- **Package ID**: `0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db`
- **Clock ID**: `0x6` (always the same)
- **Gas Budget**: `10000000` (10M MIST, adjust if needed)

## Important Notes

1. **Resolver Ownership**: The resolver is owned by the authority address, not shared
2. **Contract & Escrow**: These are shared objects that all parties can access
3. **Object IDs**: Save all object IDs from transaction outputs for future operations
4. **Authority Powers**: Only the resolver authority can resolve disputes
5. **Milestone IDs**: Start from 1 and increment with each milestone added

## Troubleshooting

- **"Insufficient gas"**: Increase `--gas-budget` value
- **"Object not found"**: Verify object IDs are correct and objects exist
- **"Unauthorized"**: Ensure you're calling functions with the correct signer
- **"Invalid status"**: Check contract/milestone status before operations

This guide provides the complete workflow for creating and managing PactDa contracts via CLI!