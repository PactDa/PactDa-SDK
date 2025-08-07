# PactDa Smart Contract Integration Guide

This comprehensive guide covers both CLI usage and TypeScript SDK integration for the PactDa smart contracts. Choose your preferred integration method below.

## Contract Architecture Overview

PactDa implements a trust-based agreement platform with three core smart contracts:

- **`pactda_core.move`** - Main agreement and escrow management with milestone support
- **`resolution_policies.move`** - Programmatic outcome resolution by trusted authorities  
- **`pactda_admin.move`** - Administrative functions and demonstration features

## Prerequisites

### For CLI Usage
- Sui CLI installed and configured
- Active wallet with SUI tokens for gas fees

### For TypeScript SDK Integration
- Node.js 18+ 
- TypeScript project setup
- Sui TypeScript SDK: `@mysten/sui`
- dApp Kit (optional, for React): `@mysten/dapp-kit`

### Contract Configuration
- **Package ID**: `0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db`
- **Clock ID**: `0x6` (system object, always the same)

---

# TypeScript SDK Integration

## Installation

```bash
npm install @mysten/sui @mysten/dapp-kit @tanstack/react-query
```

## Server-Based Architecture Setup

**Important:** PactDa contracts use a server-based architecture where a single server address acts as the `creator` and handles all blockchain transactions on behalf of users. This design provides better gas management, user experience, and centralized business logic validation.

```typescript
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';

// Initialize client for your PactDa server
const client = new SuiClient({
  url: getFullnodeUrl('testnet') // or 'mainnet'
});

// Server keypair - this address will be the 'creator' for all contracts
const serverKeypair = Ed25519Keypair.deriveKeypair('your-server-mnemonic-phrase');
// or from private key: Ed25519Keypair.fromSecretKey(serverSecretKey);

const SERVER_ADDRESS = serverKeypair.getPublicKey().toSuiAddress();
```

## React dApp Setup (Optional)

```typescript
// main.tsx
import '@mysten/dapp-kit/dist/index.css';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const networks = {
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <SuiClientProvider networks={networks} defaultNetwork="testnet">
      <WalletProvider>
        <App />
      </WalletProvider>
    </SuiClientProvider>
  </QueryClientProvider>
);
```

## Core Contract Interactions

### 1. Create Agreement Contract

**Server Function:** Only the server can create contracts and will be set as the `creator`.

```typescript
const PACKAGE_ID = "0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db";
const CLOCK_ID = "0x6";

async function createAgreement(
  parties: string[],
  authorityAddress: string,
  title: string
) {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::pactda_core::create_agreement`,
    arguments: [
      tx.pure(parties),                    // vector<address> - user addresses
      tx.pure(authorityAddress),           // address - dispute resolver
      tx.pure(title),                      // String - contract title
      tx.pure(SERVER_ADDRESS),             // address - server as creator
      tx.object(CLOCK_ID),                 // &Clock
    ],
  });

  // Server signs and executes
  const result = await client.signAndExecuteTransaction({
    signer: serverKeypair,
    transaction: tx,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });

  // Extract created object IDs from result
  const contractId = result.objectChanges?.find(
    change => change.type === 'created' && 
    change.objectType.includes('PactDaContract')
  )?.objectId;
  
  const escrowId = result.objectChanges?.find(
    change => change.type === 'created' && 
    change.objectType.includes('Escrow')
  )?.objectId;

  return { contractId, escrowId, result };
}
```

### 2. Fund Escrow

**Server Function:** Only the server can fund escrow (server manages all funds on behalf of users).

```typescript
async function fundEscrow(
  contractId: string,
  escrowId: string,
  coinObject: string,  // Server's coin object
  fundedByUser?: string // Optional: track which user this funding represents
) {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::pactda_core::fund_escrow`,
    arguments: [
      tx.object(contractId),
      tx.object(escrowId),
      tx.object(coinObject),           // Server's coin
      tx.object(CLOCK_ID),
    ],
  });

  // Server signs and executes
  return await client.signAndExecuteTransaction({
    signer: serverKeypair,
    transaction: tx,
    options: {
      showEffects: true,
    },
  });
}
```

### 3. Milestone Management

#### Add Milestone
**Server Function:** Only the server (creator) can add milestones.

```typescript
async function addMilestone(
  contractId: string,
  withdrawalAmount: number,  // in MIST (1 SUI = 1_000_000_000 MIST)
  approverAddress: string,   // User address who will approve this milestone
  metadata: string
) {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::pactda_core::add_milestone`,
    arguments: [
      tx.object(contractId),
      tx.pure(withdrawalAmount),
      tx.pure(approverAddress),        // User who can approve
      tx.pure(metadata),
      tx.object(CLOCK_ID),
    ],
  });

  // Server signs and executes
  return await client.signAndExecuteTransaction({
    signer: serverKeypair,
    transaction: tx,
  });
}
```

#### Complete Milestone
**Server Function:** Server marks milestone complete on behalf of users after validating completion.

```typescript
async function completeMilestone(
  contractId: string,
  milestoneId: number,
  completedByUser?: string  // Optional: track which user completed the work
) {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::pactda_core::complete_milestone`,
    arguments: [
      tx.object(contractId),
      tx.pure(milestoneId),
      tx.object(CLOCK_ID),
    ],
  });

  // Server signs and executes
  return await client.signAndExecuteTransaction({
    signer: serverKeypair,
    transaction: tx,
  });
}
```

#### Approve Milestone
**Server Function:** Server approves milestone on behalf of the designated approver after validation.

```typescript
async function approveMilestone(
  contractId: string,
  milestoneId: number,
  approverAddress: string  // Must match the milestone's designated approver
) {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::pactda_core::approve_milestone`,
    arguments: [
      tx.object(contractId),
      tx.pure(milestoneId),
      tx.pure(approverAddress),      // The user who is approving
      tx.object(CLOCK_ID),
    ],
  });

  // Server signs and executes
  return await client.signAndExecuteTransaction({
    signer: serverKeypair,
    transaction: tx,
  });
}
```

#### Withdraw Milestone Payment
**Server Function:** Server withdraws payment and transfers to designated recipient.

```typescript
async function withdrawMilestonePayment(
  contractId: string,
  escrowId: string,
  milestoneId: number,
  recipientAddress: string  // User who should receive the payment
) {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::pactda_core::withdraw_milestone_payment`,
    arguments: [
      tx.object(contractId),
      tx.object(escrowId),
      tx.pure(milestoneId),
      tx.pure(recipientAddress),       // Who receives the payment
      tx.object(CLOCK_ID),
    ],
  });

  // Server signs and executes
  return await client.signAndExecuteTransaction({
    signer: serverKeypair,
    transaction: tx,
  });
}
```


### 4. Dispute Resolution

#### Create Resolver (Authority)
```typescript
async function createResolver(authorityAddress: string) {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::resolution_policies::create_resolver_entry`,
    arguments: [
      tx.pure(authorityAddress),
      tx.object(CLOCK_ID),
    ],
  });

  return await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
  });
}
```

#### Report Outcome (Authority)
```typescript
async function reportOutcome(
  resolverObject: string,  // ProgrammaticResolver object ID
  winnerAddress: string
) {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::resolution_policies::report_outcome`,
    arguments: [
      tx.object(resolverObject),
      tx.pure(winnerAddress),
      tx.object(CLOCK_ID),
    ],
  });

  return await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
  });
}
```

#### Settle Agreement
```typescript
async function settleAgreement(
  contractId: string,
  escrowId: string,
  resolverObject: string
) {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::pactda_core::settle_agreement`,
    arguments: [
      tx.object(contractId),
      tx.object(escrowId),
      tx.object(resolverObject),
      tx.object(CLOCK_ID),
    ],
  });

  return await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
  });
}
```

## Event Listening and State Management

### Subscribe to Contract Events
```typescript
// Subscribe to agreement events
const unsubscribe = await client.subscribeEvent({
  filter: {
    Package: PACKAGE_ID,
  },
  onMessage: (event) => {
    console.log('Contract event:', event);
    
    // Handle different event types
    switch (event.type) {
      case `${PACKAGE_ID}::pactda_core::AgreementCreatedEvent`:
        handleAgreementCreated(event.parsedJson);
        break;
      case `${PACKAGE_ID}::pactda_core::MilestoneCompletedEvent`:
        handleMilestoneCompleted(event.parsedJson);
        break;
      // ... handle other events
    }
  },
});
```

### Query Contract State
```typescript
// Get contract details
async function getContractDetails(contractId: string) {
  const response = await client.getObject({
    id: contractId,
    options: {
      showContent: true,
      showType: true,
    },
  });
  
  return response.data?.content;
}

// Get all objects owned by an address
async function getOwnedObjects(address: string) {
  return await client.getOwnedObjects({
    owner: address,
    options: {
      showType: true,
      showContent: true,
    },
  });
}
```

## React Integration Examples

### Using dApp Kit Hooks
```typescript
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';

function ContractInteraction() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const createAgreement = async () => {
    if (!currentAccount) return;

    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::pactda_core::create_agreement`,
      arguments: [
        tx.pure(['0xparty1', '0xparty2']),
        tx.pure('0xauthority'),
        tx.pure('My Contract'),
        tx.pure(currentAccount.address),
        tx.object(CLOCK_ID),
      ],
    });

    try {
      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      console.log('Agreement created:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <button onClick={createAgreement}>
      Create Agreement
    </button>
  );
}
```

## Utility Functions

### Convert SUI to MIST
```typescript
const SUI_TO_MIST = 1_000_000_000;

function suiToMist(suiAmount: number): number {
  return Math.floor(suiAmount * SUI_TO_MIST);
}

function mistToSui(mistAmount: number): number {
  return mistAmount / SUI_TO_MIST;
}
```

### Get Available Coins
```typescript
async function getAvailableCoins(address: string) {
  const coins = await client.getCoins({
    owner: address,
    coinType: '0x2::sui::SUI',
  });
  
  return coins.data.filter(coin => coin.balance !== '0');
}
```

## Gas Management and Error Handling

### Gas Estimation
```typescript
// Estimate gas before execution
async function estimateGas(tx: Transaction) {
  const dryRun = await client.dryRunTransactionBlock({
    transactionBlock: await tx.build({ 
      client,
      onlyTransactionKind: true 
    }),
  });
  
  console.log('Estimated gas cost:', dryRun.effects.gasUsed);
  return dryRun;
}

// Set appropriate gas budget
tx.setGasBudget(10_000_000); // 0.01 SUI in MIST
```

### Error Handling Best Practices
```typescript
async function safeContractCall(contractFunction: () => Promise<any>) {
  try {
    const result = await contractFunction();
    
    if (result.effects?.status?.status !== 'success') {
      throw new Error(`Transaction failed: ${result.effects?.status?.error}`);
    }
    
    return result;
  } catch (error) {
    console.error('Contract call failed:', error);
    
    // Handle specific error types
    if (error.message?.includes('Insufficient gas')) {
      throw new Error('Please increase gas budget');
    } else if (error.message?.includes('Object not found')) {
      throw new Error('Contract object not found - check object IDs');
    } else if (error.message?.includes('Unauthorized')) {
      throw new Error('Not authorized for this operation');
    }
    
    throw error;
  }
}
```

## Complete Integration Example

```typescript
// complete-example.ts
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';

export class PactDaServerClient {
  private client: SuiClient;
  private serverKeypair: Ed25519Keypair;
  private packageId: string;
  private clockId: string = '0x6';
  private serverAddress: string;

  constructor(
    serverPrivateKey: string,  // Server's private key
    network: 'testnet' | 'mainnet' = 'testnet',
    packageId: string = '0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db'
  ) {
    this.client = new SuiClient({ url: getFullnodeUrl(network) });
    this.serverKeypair = Ed25519Keypair.deriveKeypair(serverPrivateKey);
    this.serverAddress = this.serverKeypair.getPublicKey().toSuiAddress();
    this.packageId = packageId;
  }

  // Create a complete agreement workflow (server handles everything)
  async createProjectContract(
    userAddresses: string[],      // Client and contractor addresses
    authorityAddress: string,     // Dispute resolver
    title: string,
    milestones: Array<{ amount: number; approver: string; metadata: string }>
  ) {
    try {
      // 1. Server creates agreement with user addresses as parties
      const { contractId, escrowId } = await this.createAgreement(
        userAddresses,
        authorityAddress,
        title
      );

      // 2. Server adds milestones
      const milestoneIds: number[] = [];
      for (let i = 0; i < milestones.length; i++) {
        await this.addMilestone(
          contractId!,
          this.suiToMist(milestones[i].amount),
          milestones[i].approver,
          milestones[i].metadata
        );
        milestoneIds.push(i + 1); // Milestone IDs start from 1
      }

      return {
        contractId,
        escrowId,
        milestoneIds,
        serverAddress: this.serverAddress,
        success: true
      };
    } catch (error) {
      console.error('Failed to create project contract:', error);
      return { success: false, error };
    }
  }

  private async createAgreement(
    parties: string[],
    authorityAddress: string,
    title: string
  ) {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.packageId}::pactda_core::create_agreement`,
      arguments: [
        tx.pure(parties),              // User addresses
        tx.pure(authorityAddress),
        tx.pure(title),
        tx.pure(this.serverAddress),   // Server is always the creator
        tx.object(this.clockId),
      ],
    });
    tx.setGasBudget(10_000_000);

    const result = await this.client.signAndExecuteTransaction({
      signer: this.serverKeypair,      // Server signs all transactions
      transaction: tx,
      options: { showEffects: true, showObjectChanges: true },
    });

    const contractId = result.objectChanges?.find(
      change => change.type === 'created' && 
      change.objectType.includes('PactDaContract')
    )?.objectId;
    
    const escrowId = result.objectChanges?.find(
      change => change.type === 'created' && 
      change.objectType.includes('Escrow')
    )?.objectId;

    return { contractId, escrowId, result };
  }

  private async addMilestone(
    contractId: string,
    withdrawalAmount: number,
    approverAddress: string,
    metadata: string
  ) {
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.packageId}::pactda_core::add_milestone`,
      arguments: [
        tx.object(contractId),
        tx.pure(withdrawalAmount),
        tx.pure(approverAddress),
        tx.pure(metadata),
        tx.object(this.clockId),
      ],
    });
    tx.setGasBudget(10_000_000);

    return await this.client.signAndExecuteTransaction({
      signer: this.serverKeypair,    // Server signs all transactions
      transaction: tx,
    });
  }

  private suiToMist(suiAmount: number): number {
    return Math.floor(suiAmount * 1_000_000_000);
  }

  getServerAddress(): string {
    return this.serverAddress;
  }

  // Additional server-specific methods
  async fundEscrowFromServer(contractId: string, escrowId: string, amount: number) {
    // Server funds escrow with its own coins
    const coins = await this.client.getCoins({
      owner: this.serverAddress,
      coinType: '0x2::sui::SUI',
    });
    
    const coinToUse = coins.data.find(coin => parseInt(coin.balance) >= amount);
    if (!coinToUse) throw new Error('Insufficient server balance');

    return await this.fundEscrow(contractId, escrowId, coinToUse.coinObjectId);
  }

  async withdrawMilestoneToUser(
    contractId: string, 
    escrowId: string, 
    milestoneId: number, 
    recipientAddress: string
  ) {
    // Server withdraws milestone payment and sends to user
    // Note: Requires contract update to accept recipient parameter
    const tx = new Transaction();
    tx.moveCall({
      target: `${this.packageId}::pactda_core::withdraw_milestone_payment`,
      arguments: [
        tx.object(contractId),
        tx.object(escrowId),
        tx.pure(milestoneId),
        tx.pure(recipientAddress),  // Send to user, not server
        tx.object(this.clockId),
      ],
    });
    tx.setGasBudget(10_000_000);

    return await this.client.signAndExecuteTransaction({
      signer: this.serverKeypair,
      transaction: tx,
    });
  }
}

// Server Usage Example
async function main() {
  const serverClient = new PactDaServerClient('your-server-private-key-or-mnemonic');
  
  const result = await serverClient.createProjectContract(
    ['0xclient_address', '0xcontractor_address'],  // User addresses
    '0xmediator_address',                          // Dispute resolver
    'Website Development',
    [
      { amount: 5, approver: '0xclient_address', metadata: 'Frontend completed' },
      { amount: 5, approver: '0xclient_address', metadata: 'Backend completed' },
      { amount: 2, approver: '0xclient_address', metadata: 'Final testing' }
    ]
  );

  console.log('Project contract created:', result);
  console.log('Server address:', serverClient.getServerAddress());
  
  // Server workflow example:
  if (result.success) {
    // 1. Server funds escrow
    await serverClient.fundEscrowFromServer(result.contractId!, result.escrowId!, 12_000_000_000); // 12 SUI
    
    // 2. Later: Server completes milestone on behalf of contractor
    await serverClient.completeMilestone(result.contractId!, 1);
    
    // 3. Server approves milestone on behalf of client
    await serverClient.approveMilestone(result.contractId!, 1, '0xclient_address');
    
    // 4. Server withdraws and sends payment to contractor
    await serverClient.withdrawMilestoneToUser(result.contractId!, result.escrowId!, 1, '0xcontractor_address');
  }
}
```

## Status Constants Reference

```typescript
// Contract Status Constants
export const CONTRACT_STATUS = {
  DRAFT: 0,      // Initial state, can add milestones
  ACTIVE: 1,     // Funded and active
  COMPLETED: 2,  // Successfully completed
  DISPUTED: 3,   // Under dispute resolution
  CANCELLED: 4   // Cancelled by parties
} as const;

// Escrow Status Constants  
export const ESCROW_STATUS = {
  EMPTY: 0,      // No funds deposited
  FUNDED: 1,     // Has available balance
  RELEASED: 2    // Funds have been distributed
} as const;

// Milestone Status Constants
export const MILESTONE_STATUS = {
  PENDING: 0,    // Created, waiting for completion
  COMPLETED: 1,  // Marked complete by contractor
  APPROVED: 2,   // Approved by client
  WITHDRAWN: 3   // Payment withdrawn
} as const;
```

## Server Architecture Benefits & User Flow

### ✅ **Advantages of Server-Based Architecture**

1. **Gas Management**: Server pays all transaction fees, eliminating user gas concerns
2. **User Experience**: Users interact via API/web interface, no wallet setup required
3. **Centralized Logic**: Complex business rules handled off-chain by server
4. **Atomic Operations**: Server can batch multiple transactions together
5. **Simplified Integration**: Single server interface for all blockchain operations
6. **Scalability**: Server can handle high transaction volumes efficiently

### 🔄 **Typical User Flow**

```
User Action          →  Server API          →  Blockchain Transaction
─────────────────────────────────────────────────────────────────────
Create Project       →  POST /contracts     →  create_agreement()
Fund Project         →  POST /fund          →  fund_escrow()
Complete Milestone   →  PUT /milestones     →  complete_milestone()
Approve Work         →  PUT /approvals      →  approve_milestone()
Withdraw Payment     →  POST /withdraw      →  withdraw_milestone_payment()
```

### 🏗️ **Server Implementation Requirements**

1. **Secure Key Management**: Server private key must be securely stored
2. **User Authentication**: Validate user permissions before blockchain calls  
3. **Balance Management**: Track user deposits and withdrawals off-chain
4. **Event Monitoring**: Subscribe to blockchain events for state updates
5. **Error Handling**: Robust error handling for failed transactions

### 🔧 **Required Smart Contract Updates**

To fully implement the server architecture, update the `withdraw_milestone_payment` function:

```move
public entry fun withdraw_milestone_payment(
    contract: &mut PactDaContract,
    escrow: &mut Escrow,
    milestone_id: u64,
    recipient: address,        // Add this parameter
    clock: &Clock,
    ctx: &mut TxContext,
) {
    // ... existing validation ...
    
    // Transfer to recipient instead of sender
    transfer::public_transfer(payment, recipient);
}
```

---

# CLI Integration (Server-Based Architecture)

The Sui CLI provides direct access to smart contract functions for server deployment. This section covers comprehensive CLI usage for PactDa contracts in a server-based architecture where a single server address handles all transactions on behalf of users.

## CLI Prerequisites & Setup

### Server Environment Setup
```bash
# Install Sui CLI (if not already installed)
curl -fLJO https://github.com/MystenLabs/sui/releases/latest/download/sui-mainnet-ubuntu-x86_64.tgz
tar -xf sui-mainnet-ubuntu-x86_64.tgz
sudo chmod +x sui
sudo mv sui /usr/local/bin/

# Initialize Sui client for your server
sui client

# Import your server's private key (this will be the 'creator' for all contracts)
sui client import [your-server-private-key] ed25519

# Get some SUI tokens from faucet (testnet only) or fund from exchange (mainnet)
sui client faucet

# Check server address and available funds
sui client active-address
sui client gas

# Set environment variables for scripts
export SERVER_ADDRESS=$(sui client active-address)
echo "Server Address: $SERVER_ADDRESS"
```

### Network Configuration
```bash
# Switch to testnet
sui client switch --env testnet

# Switch to mainnet (when ready for production)
sui client switch --env mainnet

# Check current environment
sui client envs
```

## Core Contract Operations

### 1. Agreement Creation

#### Basic Agreement (2-Party Contest/Wager)
**Server Creates:** Server creates agreement on behalf of users.

```bash
# Server creates agreement with user addresses as parties
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function create_agreement \
    --args \
        "[0xuser1_address,0xuser2_address]" \
        0xgame_authority_address \
        "Gaming Tournament - Finals" \
        $SERVER_ADDRESS \
        0x6 \
    --gas-budget 10000000
```

#### Multi-Party Business Agreement
**Server Creates:** Server creates agreement with multiple user addresses.

```bash
# Server creates business agreement
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function create_agreement \
    --args \
        "[0xclient_address,0xcontractor_address,0xdesigner_address]" \
        0xmediator_authority_address \
        "E-commerce Platform Development" \
        $SERVER_ADDRESS \
        0x6 \
    --gas-budget 15000000
```

**Extract Object IDs from output:**
```bash
# Save these IDs from the transaction result
CONTRACT_ID=0x[created_contract_id]
ESCROW_ID=0x[created_escrow_id]
RESOLVER_ID=0x[created_resolver_id]  # Owned by authority
```

### 2. Escrow Funding

#### Server Funds Escrow
**Server Only:** Server funds escrow on behalf of users with server's funds.

```bash
# First, get server's available coins
sui client gas

# Server funds escrow with server's coin object
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function fund_escrow \
    --args $CONTRACT_ID $ESCROW_ID 0x[server_coin_object_id] 0x6 \
    --gas-budget 10000000
```

#### Split Coins for Precise Funding
```bash
# Split a large coin to get exact amount (e.g., 10 SUI = 10000000000 MIST)
sui client split-coin --coin-id 0x[large_coin_id] --amounts 10000000000 --gas-budget 5000000

# Use the split coin for funding
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function fund_escrow \
    --args $CONTRACT_ID $ESCROW_ID 0x[split_coin_id] 0x6 \
    --gas-budget 10000000
```

### 3. Project Milestone Management

#### Add Milestone (Creator Only)
```bash
# Milestone for 3 SUI (3000000000 MIST)
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function add_milestone \
    --args \
        $CONTRACT_ID \
        3000000000 \
        0xclient_approver_address \
        '{"phase":"Frontend","deliverables":["React components","Responsive design","User authentication"],"due_date":"2024-03-15"}' \
        0x6 \
    --gas-budget 10000000
```

#### Multiple Milestones Script
```bash
#!/bin/bash
# create_milestones.sh - Add multiple milestones

CONTRACT_ID="0xcontract123"
APPROVER="0xclient456"

# Milestone 1: Frontend (5 SUI)
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function add_milestone \
    --args $CONTRACT_ID 5000000000 $APPROVER '{"title":"Frontend Development","description":"Complete user interface"}' 0x6 \
    --gas-budget 10000000

# Milestone 2: Backend (7 SUI)  
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function add_milestone \
    --args $CONTRACT_ID 7000000000 $APPROVER '{"title":"Backend API","description":"Database and API implementation"}' 0x6 \
    --gas-budget 10000000

# Milestone 3: Testing (3 SUI)
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function add_milestone \
    --args $CONTRACT_ID 3000000000 $APPROVER '{"title":"Testing & Deployment","description":"QA testing and production deployment"}' 0x6 \
    --gas-budget 10000000
```

#### Complete Milestone (Server)
**Server Only:** Server marks milestone complete on behalf of contractor.

```bash
# Server marks milestone 1 as completed
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function complete_milestone \
    --args $CONTRACT_ID 1 0x6 \
    --gas-budget 8000000
```

#### Approve Milestone (Server)  
**Server Only:** Server approves milestone on behalf of designated approver.

```bash
# Server approves milestone 1 on behalf of the designated approver
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function approve_milestone \
    --args $CONTRACT_ID 1 0xclient_approver_address 0x6 \
    --gas-budget 8000000
```

#### Withdraw Milestone Payment (Server)
**Server Only:** Server withdraws payment and sends to recipient.

```bash
# Server withdraws payment for approved milestone and sends to recipient
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function withdraw_milestone_payment \
    --args $CONTRACT_ID $ESCROW_ID 1 0xrecipient_user_address 0x6 \
    --gas-budget 10000000
```

**Note:** You'll need to update the smart contract to accept a recipient address parameter.

### 4. Dispute Resolution Workflow

#### Create Resolver (Authority)
```bash
# Authority creates their resolver
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module resolution_policies \
    --function create_resolver_entry \
    --args 0xauthority_address 0x6 \
    --gas-budget 8000000
```

#### Report Outcome (Authority Only)
```bash
# Authority reports the winner
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module resolution_policies \
    --function report_outcome \
    --args $RESOLVER_ID 0xwinner_party_address 0x6 \
    --gas-budget 8000000
```

#### Settle Agreement (Any Party After Resolution)
```bash
# Execute settlement based on resolver decision
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function settle_agreement \
    --args $CONTRACT_ID $ESCROW_ID $RESOLVER_ID 0x6 \
    --gas-budget 12000000
```

## Administrative Functions

### Mint Demonstration NFT (Admin Only)
```bash
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_admin \
    --function admin_mint_vcnft \
    --args \
        $ADMIN_CAP_ID \
        0xrecipient_address \
        "PactDa Achievement Badge" \
        "Awarded for successful project completion" \
        "https://images.pactda.com/achievement-badge.png" \
        "[\"category:achievement\",\"project:web-development\",\"completion:2024\"]" \
        12345 \
        0x6 \
    --gas-budget 10000000
```

## Query and Inspection Commands

### Check Object Details
```bash
# Get contract details
sui client object $CONTRACT_ID

# Get escrow balance and status
sui client object $ESCROW_ID

# Get resolver information
sui client object $RESOLVER_ID

# Get all objects owned by an address
sui client objects 0xaddress
```

### Event Monitoring
```bash
# Monitor events from the package
sui client events --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db

# Filter events by module
sui client events --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db --module pactda_core

# Get transaction details
sui client transaction $TX_DIGEST
```

### Balance and Gas Management
```bash
# Check SUI balance
sui client balance

# Get gas coins with amounts
sui client gas --json

# Merge smaller coins into one (gas optimization)
sui client merge-coin --primary-coin 0xcoin1 --coin-to-merge 0xcoin2 --gas-budget 5000000
```

## Complete CLI Workflows

### Simple Wager/Contest Workflow
```bash
#!/bin/bash
# simple_wager.sh - Complete 2-party wager setup

# Variables
PLAYER1="0xplayer1_address"  
PLAYER2="0xplayer2_address"
AUTHORITY="0xgame_authority"
WAGER_AMOUNT="5000000000"  # 5 SUI in MIST

echo "=== Creating Wager Agreement ==="
# Step 1: Create agreement
RESULT=$(sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function create_agreement \
    --args "[\"$PLAYER1\",\"$PLAYER2\"]" "$AUTHORITY" "Gaming Contest Wager" "$PLAYER1" 0x6 \
    --gas-budget 10000000 --json)

# Extract IDs (you'll need to parse JSON output)
CONTRACT_ID=$(echo $RESULT | jq -r '.objectChanges[] | select(.type=="created" and (.objectType | contains("PactDaContract"))) | .objectId')
ESCROW_ID=$(echo $RESULT | jq -r '.objectChanges[] | select(.type=="created" and (.objectType | contains("Escrow"))) | .objectId')

echo "Contract ID: $CONTRACT_ID"
echo "Escrow ID: $ESCROW_ID"

echo "=== Both Players Fund Escrow ==="
# Step 2: Players fund the wager (run this from each player's wallet)
# Player 1 funding
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function fund_escrow \
    --args $CONTRACT_ID $ESCROW_ID 0x[player1_coin] 0x6 \
    --gas-budget 10000000

# Player 2 funding (switch to player 2 wallet)
# sui client switch --address $PLAYER2
# sui client call ... (same command with player2_coin)

echo "=== Wager is now active - waiting for game result ==="
echo "Authority will report outcome after game completion"
```

### Project-Based Contract Workflow
```bash
#!/bin/bash
# project_contract.sh - Complete freelance project setup

# Variables
CLIENT="0xclient_address"
CONTRACTOR="0xcontractor_address"  
PROJECT_FUND="15000000000"  # 15 SUI total project value

echo "=== Creating Project Agreement ==="
# Create agreement with client as authority
RESULT=$(sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function create_agreement \
    --args "[\"$CLIENT\",\"$CONTRACTOR\"]" "$CLIENT" "Website Development Project" "$CLIENT" 0x6 \
    --gas-budget 10000000 --json)

CONTRACT_ID=$(echo $RESULT | jq -r '.objectChanges[] | select(.type=="created" and (.objectType | contains("PactDaContract"))) | .objectId')
ESCROW_ID=$(echo $RESULT | jq -r '.objectChanges[] | select(.type=="created" and (.objectType | contains("Escrow"))) | .objectId')

echo "=== Adding Project Milestones ==="
# Add 3 milestones
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function add_milestone \
    --args $CONTRACT_ID 6000000000 $CLIENT '{"title":"UI/UX Design","deliverables":["Mockups","Prototypes"]}' 0x6 \
    --gas-budget 10000000

sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function add_milestone \
    --args $CONTRACT_ID 7000000000 $CLIENT '{"title":"Development","deliverables":["Frontend","Backend","Database"]}' 0x6 \
    --gas-budget 10000000

sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function add_milestone \
    --args $CONTRACT_ID 2000000000 $CLIENT '{"title":"Testing & Deployment","deliverables":["QA","Production deployment"]}' 0x6 \
    --gas-budget 10000000

echo "=== Client Funds Full Project Amount ==="
sui client call \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function fund_escrow \
    --args $CONTRACT_ID $ESCROW_ID 0x[client_coin] 0x6 \
    --gas-budget 10000000

echo "Project setup complete!"
echo "Contract ID: $CONTRACT_ID"  
echo "Escrow ID: $ESCROW_ID"
echo ""
echo "Next steps:"
echo "1. Contractor completes milestone 1"
echo "2. Client approves milestone 1"  
echo "3. Contractor withdraws milestone 1 payment"
echo "4. Repeat for remaining milestones"
```

## CLI Tips and Best Practices

### Gas Optimization
```bash
# Use dry-run to estimate gas costs
sui client call --dry-run \
    --package 0xe461e911e3094a467af8f2e6e6bb52863b525ce09e9736289c54741ea1a045db \
    --module pactda_core \
    --function create_agreement \
    --args "[\"0xaddr1\",\"0xaddr2\"]" "0xauth" "Test" "0xcreator" 0x6

# Batch operations when possible to save gas
# Merge small coins before funding large escrows
sui client merge-coin --primary-coin $BIG_COIN --coin-to-merge $SMALL_COIN1,$SMALL_COIN2
```

### JSON Output Parsing
```bash
# Use jq for parsing transaction results
RESULT=$(sui client call ... --json)
CONTRACT_ID=$(echo $RESULT | jq -r '.objectChanges[] | select(.objectType | contains("PactDaContract")) | .objectId')

# Save important IDs to file
echo "CONTRACT_ID=$CONTRACT_ID" >> .env
echo "ESCROW_ID=$ESCROW_ID" >> .env
source .env
```

### Error Handling
```bash
# Check transaction success before proceeding
if [[ $? -eq 0 ]]; then
    echo "Transaction successful"
else
    echo "Transaction failed"
    exit 1
fi

# Verify object exists before using
sui client object $CONTRACT_ID > /dev/null 2>&1
if [[ $? -ne 0 ]]; then
    echo "Error: Contract $CONTRACT_ID not found"
    exit 1
fi
```

## Troubleshooting Guide

### Common Issues and Solutions

**"Insufficient gas"**
```bash
# Increase gas budget
--gas-budget 20000000  # 0.02 SUI

# Or merge coins to have larger gas coin
sui client merge-coin --primary-coin $LARGE_COIN --coin-to-merge $SMALL_COINS
```

**"Object not found"**  
```bash
# Verify object ID is correct
sui client object $OBJECT_ID

# Check if you're on correct network
sui client envs
sui client switch --env testnet
```

**"Unauthorized operation"**
```bash
# Check you're using correct wallet address
sui client active-address

# Switch to correct address if needed
sui client switch --address $CORRECT_ADDRESS
```

**"Invalid status for operation"**
```bash
# Check contract/milestone status
sui client object $CONTRACT_ID

# Ensure proper workflow order (create -> fund -> milestone operations)
```

### Network Issues
```bash
# Test connectivity
sui client call --dry-run --package 0x2 --module coin --function value --args 0x2::sui::SUI

# Switch RPC endpoint if needed
sui client switch --env https://fullnode.testnet.sui.io:443
```

This comprehensive CLI guide provides complete command-line access to all PactDa smart contract functionality, from simple wagers to complex milestone-based projects.