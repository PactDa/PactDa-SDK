# PactDa Milestone Payments - Smart Contract Concept

## Overview
Extension of the existing PactDa core smart contract to support milestone-based project payments while maintaining simplicity and security. The design follows the principle: **Smart Contract = Trust + Money, Client = UX + Business Logic**.

## Architecture Decision
- **EXTEND** existing `PactDaContract` and `Escrow` (not create new contracts)
- **MINIMAL** smart contract complexity - core financial operations only
- **CLIENT-SIDE** handles complex business logic, deadlines, notifications
- **BACKWARD COMPATIBLE** with existing regular agreements

## Core Smart Contract Components

### 1. Extended PactDaContract Structure
```move
public struct PactDaContract has key, store {
    // Existing core fields
    id: UID,
    parties: vector<address>,
    status: u8,
    escrow_id: ID,
    resolution_policy_id: ID,
    title: String,
    created_at: u64,
    creator: address,
    
    // NEW: Milestone support (optional)
    milestones: Option<vector<Milestone>>,  // Empty for regular contracts
    milestone_mode: bool,                   // Flag for milestone vs regular
    next_milestone_id: u64,                 // Auto-incrementing ID counter
}
```

### 2. Minimal Milestone Structure
```move
public struct Milestone has store, copy, drop {
    id: u64,                    // Unique milestone ID within contract
    withdrawal_amount: u64,     // Amount contractor can withdraw
    approver: address,          // Single approver (client coordinates multi-sig)
    status: u8,                 // 4 states: pending/completed/approved/withdrawn
    metadata: String,           // JSON blob for client complex data storage
    created_at: u64,
    completed_at: Option<u64>,
    approved_at: Option<u64>,
    withdrawn_at: Option<u64>,
}
```

### 3. Extended Escrow Tracking
```move
public struct Escrow has key, store {
    // Existing fields
    id: UID,
    contract_id: ID,
    balance: Balance<SUI>,
    status: u8,
    funded_by: vector<address>,
    funded_amounts: vector<u64>,
    created_at: u64,
    
    // NEW: Milestone withdrawal tracking
    milestone_withdrawals: vector<u64>,  // Amount withdrawn per milestone ID
    total_withdrawn: u64,                // Total milestone withdrawals
}
```

## Core Smart Contract Functions (Minimal Set)

### 1. Contract Creation
- `create_agreement()` - existing function (regular contracts)
- `create_milestone_agreement()` - new function (milestone contracts)
- Both use same escrow system

### 2. Milestone Management
- `add_milestone(contract, withdrawal_amount, approver, metadata)` - add milestone
- `update_milestone_metadata(contract, milestone_id, metadata)` - client updates only
- `remove_milestone(contract, milestone_id)` - before completion only

### 3. Milestone Workflow (Core Trust Operations)
- `complete_milestone(contract, milestone_id)` - contractor marks work done
- `approve_milestone(contract, milestone_id)` - approver validates work
- `withdraw_milestone_payment(contract, milestone_id)` - contractor gets paid

### 4. Financial Validations (Smart Contract Enforced)
- Total withdrawable amounts ≤ escrow balance
- Only designated approver can approve
- Only contractor (from parties) can complete/withdraw
- No withdrawal before approval
- No duplicate withdrawals

## Client-Side Responsibilities (Complex Logic)

### 1. Business Logic
- **Deadline Management**: Track deadlines, send warnings, auto-approve
- **Dependency Tracking**: Ensure milestone order/prerequisites
- **Multi-signature Coordination**: Collect multiple approvals before calling contract
- **Progress Analytics**: Calculate completion rates, budget utilization
- **Role-based Permissions**: Different UI views for different users

### 2. Data Management
- **Complex Milestone Data**: Store in metadata JSON or separate database
- **Project History**: Track all state changes and communications
- **File Attachments**: Deliverables, documentation, reviews
- **Notification System**: Email, SMS, in-app notifications

### 3. UX Features
- **Real-time Updates**: WebSocket integration for live status
- **Dashboard Analytics**: Project health, timeline visualization
- **Mobile Support**: Responsive design, push notifications
- **Offline Capability**: Cache data, sync when connected

## Integration with Existing System

### 1. Backward Compatibility
- Existing `PactDaContract` remains unchanged for regular agreements
- New milestone fields are optional
- All existing SDK/API endpoints continue working
- No breaking changes to current contracts

### 2. Settlement Integration
- Regular `settle_agreement()` works for non-milestone contracts
- For milestone contracts: final settlement handles any remaining balance
- Maintains compatibility with `ProgrammaticResolver`
- Dispute resolution can still be used if needed

### 3. Event System
- New milestone events for SDK/server integration
- Existing events remain unchanged
- Progressive enhancement approach

## Security Considerations

### 1. Financial Security (Smart Contract)
- Withdrawal validation: only approved milestones
- Balance checks: prevent over-withdrawal
- Access controls: role-based permissions
- Audit trail: all transactions logged on-chain

### 2. Authorization (Smart Contract)
- Approver validation: only designated addresses
- Contractor validation: only project parties
- State validation: proper milestone progression
- Double-spending prevention: withdrawal tracking

### 3. Business Logic Security (Client-Side)
- Input validation: sanitize metadata
- Rate limiting: prevent spam operations
- Authentication: secure API access
- Data encryption: sensitive information

## Implementation Benefits

### 1. Smart Contract Benefits
- **Lower Gas Costs**: Minimal on-chain logic
- **Easier Auditing**: Smaller attack surface
- **Faster Execution**: Simple operations
- **Better Security**: Less complex code to exploit

### 2. Client Benefits
- **Rich UX**: Complex features without blockchain constraints
- **Fast Iteration**: Update business logic without redeployment
- **Better Performance**: No waiting for blockchain confirmations
- **Offline Features**: Work without network connectivity

### 3. Developer Benefits
- **Familiar Patterns**: Extends existing successful architecture
- **Gradual Adoption**: Can add milestone features incrementally
- **Flexible Implementation**: Client logic can vary per use case
- **Cost Effective**: Lower development and maintenance costs

## Example Usage Flow

### 1. Project Creation
```typescript
// Client creates milestone project
const project = await pactda.createMilestoneAgreement({
  parties: [client, contractor],
  title: "Website Development",
  milestones: [
    { title: "Design", amount: 300, approver: client },
    { title: "Development", amount: 500, approver: client },
    { title: "Testing", amount: 200, approver: client }
  ]
});
```

### 2. Funding
```typescript
// Client funds entire project (existing escrow system)
await pactda.fundEscrow(projectId, totalAmount);
```

### 3. Milestone Workflow
```typescript
// Contractor completes milestone
await pactda.completeMilestone(projectId, milestoneId);

// Client approves (or automated after review period)
await pactda.approveMilestone(projectId, milestoneId);

// Contractor withdraws payment
await pactda.withdrawMilestonePayment(projectId, milestoneId);
```

### 4. Client-Side Features
```typescript
// Client handles complex logic
class MilestoneManager {
  checkDeadlines() { /* deadline tracking */ }
  calculateProgress() { /* analytics */ }
  sendNotifications() { /* alerts */ }
  validateDependencies() { /* workflow rules */ }
}
```

This design maintains the elegance and security of the existing PactDa system while adding powerful milestone capabilities through a clean separation of concerns.