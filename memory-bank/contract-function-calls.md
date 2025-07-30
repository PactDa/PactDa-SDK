# PactDa Smart Contract Function Calls Documentation

## Overview
This document provides detailed information for calling PactDa smart contract functions, including milestone functionality with practical examples.

---

## Core Agreement Functions

### 1. create_agreement()
Creates a new PactDa contract with escrow and auto-creates resolver.

**Function Signature:**
```move
public entry fun create_agreement(
    parties: vector<address>,
    authority_address: address,
    title: String,
    creator: address,
    clock: &Clock,
    ctx: &mut TxContext,
)
```

**Example Call:**
```typescript
// TypeScript SDK example
const parties = [
    "0x1234...contractor_address",
    "0x5678...client_address"
];

await moveCall({
    target: `${PACKAGE_ID}::pactda_core::create_agreement`,
    arguments: [
        parties,                           // vector<address>
        "0x9999...authority_address",       // address (resolver auto-created)
        "Website Development Project",      // title
        "0x1234...contractor_address",     // creator
        clock_object,                      // &Clock
    ],
});
```

**CLI Example:**
```bash
sui client call \
    --package $PACKAGE_ID \
    --module pactda_core \
    --function create_agreement \
    --args \
        "[$CONTRACTOR_ADDRESS,$CLIENT_ADDRESS]" \
        $AUTHORITY_ADDRESS \
        "Website Development Project" \
        $CONTRACTOR_ADDRESS \
        $CLOCK_ID
```

---

### 2. fund_escrow()
Funds the escrow account for a contract.

**Example Call:**
```typescript
// Fund escrow with 1000 SUI
await moveCall({
    target: `${PACKAGE_ID}::pactda_core::fund_escrow`,
    arguments: [
        contract_id,      // PactDaContract object
        escrow_id,        // Escrow object  
        coin_object,      // Coin<SUI> (1000 * 10^9 MIST)
        clock_object,     // &Clock
    ],
});
```

**CLI Example:**
```bash
# Fund with 1000 SUI
sui client call \
    --package $PACKAGE_ID \
    --module pactda_core \
    --function fund_escrow \
    --args $CONTRACT_ID $ESCROW_ID $COIN_ID $CLOCK_ID \
    --gas-budget 10000000
```

---

## Milestone Management Functions

### 3. add_milestone()
Adds a new milestone to an existing contract.

**Example Call:**
```typescript
// Add milestone for "Frontend Development" - 300 SUI
const metadata = JSON.stringify({
    title: "Frontend Development",
    description: "Complete React frontend with responsive design",
    deliverables: ["Homepage", "Dashboard", "User Profile"],
    deadline: "2025-02-15"
});

await moveCall({
    target: `${PACKAGE_ID}::pactda_core::add_milestone`,
    arguments: [
        contract_id,                    // PactDaContract object
        300000000000,                   // 300 SUI in MIST
        "0x5678...client_address",      // approver address
        metadata,                       // JSON metadata string
        clock_object,                   // &Clock
    ],
});
```

**CLI Example:**
```bash
# Add milestone worth 300 SUI
sui client call \
    --package $PACKAGE_ID \
    --module pactda_core \
    --function add_milestone \
    --args \
        $CONTRACT_ID \
        300000000000 \
        $CLIENT_ADDRESS \
        '{"title":"Frontend Development","description":"Complete React frontend"}' \
        $CLOCK_ID
```

---

### 4. complete_milestone()
Marks milestone work as completed by contractor.

**Example Call:**
```typescript
// Contractor marks milestone 1 as complete
await moveCall({
    target: `${PACKAGE_ID}::pactda_core::complete_milestone`,
    arguments: [
        contract_id,    // PactDaContract object
        1,              // milestone_id
        clock_object,   // &Clock
    ],
});
```

**CLI Example:**
```bash
# Complete milestone ID 1
sui client call \
    --package $PACKAGE_ID \
    --module pactda_core \
    --function complete_milestone \
    --args $CONTRACT_ID 1 $CLOCK_ID
```

---

### 5. approve_milestone()
Approves completed milestone work.

**Example Call:**
```typescript
// Client approves milestone 1
await moveCall({
    target: `${PACKAGE_ID}::pactda_core::approve_milestone`,
    arguments: [
        contract_id,    // PactDaContract object
        1,              // milestone_id
        clock_object,   // &Clock
    ],
});
```

**CLI Example:**
```bash
# Approve milestone ID 1 (must be called by approver)
sui client call \
    --package $PACKAGE_ID \
    --module pactda_core \
    --function approve_milestone \
    --args $CONTRACT_ID 1 $CLOCK_ID
```

---

### 6. withdraw_milestone_payment()
Withdraws payment for approved milestone.

**Example Call:**
```typescript
// Contractor withdraws payment for milestone 1
await moveCall({
    target: `${PACKAGE_ID}::pactda_core::withdraw_milestone_payment`,
    arguments: [
        contract_id,    // PactDaContract object
        escrow_id,      // Escrow object
        1,              // milestone_id
        clock_object,   // &Clock
    ],
});
```

**CLI Example:**
```bash
# Withdraw payment for milestone ID 1
sui client call \
    --package $PACKAGE_ID \
    --module pactda_core \
    --function withdraw_milestone_payment \
    --args $CONTRACT_ID $ESCROW_ID 1 $CLOCK_ID
```

---

### 7. change_milestone_approver()
Changes the approver for a milestone.

**Example Call:**
```typescript
// Creator changes approver from client to project manager
await moveCall({
    target: `${PACKAGE_ID}::pactda_core::change_milestone_approver`,
    arguments: [
        contract_id,                        // PactDaContract object
        1,                                  // milestone_id
        "0x9999...project_manager_address", // new_approver
        clock_object,                       // &Clock
    ],
});
```

**CLI Example:**
```bash
# Change approver for milestone ID 1
sui client call \
    --package $PACKAGE_ID \
    --module pactda_core \
    --function change_milestone_approver \
    --args $CONTRACT_ID 1 $NEW_APPROVER_ADDRESS $CLOCK_ID
```

---

## Complete Workflow Example

Here's a complete milestone-based project workflow:

### 1. Setup Project
```typescript
// 1. Create contract (resolver auto-created)
await create_agreement([contractor, client], authority_address, "Website Project", contractor);

// 2. Fund escrow with 1000 SUI
await fund_escrow(contract, escrow, coin_1000_sui);

// 3. Add milestones
await add_milestone(contract, 300_sui, client, '{"title":"Frontend"}');    // ID: 1
await add_milestone(contract, 400_sui, client, '{"title":"Backend"}');     // ID: 2  
await add_milestone(contract, 300_sui, client, '{"title":"Testing"}');     // ID: 3
```

### 2. Work on Milestone 1
```typescript
// Contractor completes frontend work
await complete_milestone(contract, 1);  // Status: PENDING → COMPLETED

// Client reviews and approves
await approve_milestone(contract, 1);   // Status: COMPLETED → APPROVED

// Contractor withdraws payment
await withdraw_milestone_payment(contract, escrow, 1);  // Status: APPROVED → WITHDRAWN
// Contractor receives 300 SUI
```

### 3. Handle Approver Change
```typescript
// If client becomes unavailable, creator can change approver
await change_milestone_approver(contract, 2, project_manager_address);
```

---

## Event Monitoring Examples

### Listen for Milestone Events
```typescript
// Listen for milestone completion
client.subscribeEvent({
    filter: {
        Package: PACKAGE_ID,
        EventType: `${PACKAGE_ID}::pactda_core::MilestoneCompletedEvent`
    },
    onMessage: (event) => {
        console.log('Milestone completed:', {
            contract_id: event.parsedJson.contract_id,
            milestone_id: event.parsedJson.milestone_id,
            completed_by: event.parsedJson.completed_by,
            approver: event.parsedJson.approver
        });
    }
});

// Listen for milestone approvals
client.subscribeEvent({
    filter: {
        Package: PACKAGE_ID,
        EventType: `${PACKAGE_ID}::pactda_core::MilestoneApprovedEvent`
    },
    onMessage: (event) => {
        console.log('Milestone approved:', {
            milestone_id: event.parsedJson.milestone_id,
            withdrawal_amount: event.parsedJson.withdrawal_amount
        });
    }
});
```

---

## Error Handling Examples

### Common Error Scenarios
```typescript
try {
    await complete_milestone(contract_id, milestone_id);
} catch (error) {
    if (error.message.includes('EUnauthorized')) {
        console.error('You are not authorized to complete this milestone');
        // Check if caller is the approver (not allowed to complete)
    }
    
    if (error.message.includes('EInvalidStatus')) {
        console.error('Contract must be ACTIVE or milestone must be PENDING');
        // Check contract and milestone status
    }
    
    if (error.message.includes('EMilestoneNotFound')) {
        console.error('Milestone ID does not exist');
        // Verify milestone_id is correct
    }
}

try {
    await withdraw_milestone_payment(contract_id, escrow_id, milestone_id);
} catch (error) {
    if (error.message.includes('EMilestoneExceedsBalance')) {
        console.error('Insufficient escrow balance for withdrawal');
        // Check escrow balance vs milestone amount
    }
    
    if (error.message.includes('EMilestoneNotApproved')) {
        console.error('Milestone must be approved before withdrawal');
        // Ensure milestone is in APPROVED status
    }
}
```

---

## Security Best Practices

### 1. Validation Before Calls
```typescript
// Always validate before making calls
function validateMilestoneWithdrawal(milestone, escrow) {
    if (milestone.status !== MILESTONE_STATUS_APPROVED) {
        throw new Error('Milestone not approved');
    }
    
    const available = escrow.balance - escrow.total_milestone_withdrawn;
    if (milestone.withdrawal_amount > available) {
        throw new Error('Insufficient escrow balance');
    }
}
```

### 2. Status Checking
```typescript
// Check statuses before operations
const contract = await getContract(contract_id);
if (contract.status !== CONTRACT_STATUS_ACTIVE) {
    throw new Error('Contract must be ACTIVE');
}

const milestone = await getMilestone(contract_id, milestone_id);
if (milestone.status !== MILESTONE_STATUS_PENDING) {
    throw new Error('Invalid milestone status for completion');
}
```

### 3. Access Control Verification
```typescript
// Verify caller permissions
function canCompleteMilestone(caller, milestone, contract) {
    return contract.parties.includes(caller) && 
           caller !== milestone.approver;
}

function canApproveMilestone(caller, milestone) {
    return caller === milestone.approver;
}
```

---

## Status Constants Reference

```typescript
// Contract Status
const CONTRACT_STATUS_DRAFT = 0;
const CONTRACT_STATUS_ACTIVE = 1;
const CONTRACT_STATUS_COMPLETED = 2;
const CONTRACT_STATUS_DISPUTED = 3;
const CONTRACT_STATUS_CANCELLED = 4;

// Milestone Status  
const MILESTONE_STATUS_PENDING = 0;
const MILESTONE_STATUS_COMPLETED = 1;
const MILESTONE_STATUS_APPROVED = 2;
const MILESTONE_STATUS_WITHDRAWN = 3;

// Escrow Status
const ESCROW_STATUS_EMPTY = 0;
const ESCROW_STATUS_FUNDED = 1;
const ESCROW_STATUS_RELEASED = 2;
const ESCROW_STATUS_REFUNDED = 3;
```

---

*Document Version: 1.0*  
*Last Updated: 2025-01-23*  
*Contract Location: `contract/sources/pactda_core.move`*