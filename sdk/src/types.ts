/**
 * Core configuration for PactDa SDK
 */
export interface PactDaConfig {
  apiKey: string
  environment?: 'production' | 'testnet' | 'development'
  apiUrl?: string
  wsUrl?: string
}

/**
 * User information from Sui Enoki zkLogin
 */
export interface User {
  id: string
  address: string
  provider: string
  email?: string
  isAuthenticated: boolean
}

/**
 * Agreement status enumeration
 */
export enum AgreementStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  FUNDED = 'FUNDED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED'
}

/**
 * Party in an agreement
 */
export interface Party {
  address: string
  role: string
  metadata?: Record<string, any>
}

/**
 * Escrow configuration
 */
export interface EscrowConfig {
  amount: number
  currency: string
  releaseConditions?: string[]
  timelock?: number
}

/**
 * Resolution policy for disputes
 */
export interface ResolutionPolicy {
  type: 'automated' | 'manual' | 'oracle'
  resolverAddress?: string
  parameters?: Record<string, any>
}

/**
 * Core agreement structure
 */
export interface Agreement {
  id: string
  parties: Party[]
  escrowConfig: EscrowConfig
  resolutionPolicy: ResolutionPolicy
  status: AgreementStatus
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

/**
 * Outcome data for agreement resolution
 */
export interface OutcomeData {
  agreementId: string
  result: 'completed' | 'cancelled' | 'disputed'
  winnerAddress?: string
  distribution?: { address: string; amount: number }[]
  evidence?: string[]
  metadata?: Record<string, any>
}

/**
 * Parameters for creating an agreement
 */
export interface CreateAgreementParams {
  parties: Party[]
  escrowConfig: EscrowConfig
  resolutionPolicy: ResolutionPolicy
  metadata?: Record<string, any>
}

/**
 * Parameters for reporting outcome
 */
export interface ReportOutcomeParams {
  agreementId: string
  outcomeData: OutcomeData
}

/**
 * Event callback function type
 */
export type EventCallback = (data: any) => void

/**
 * SDK Events
 */
export enum SDKEvents {
  AGREEMENT_CREATED = 'agreement_created',
  AGREEMENT_FUNDED = 'agreement_funded',
  AGREEMENT_COMPLETED = 'agreement_completed',
  AGREEMENT_CANCELLED = 'agreement_cancelled',
  USER_CONNECTED = 'user_connected',
  USER_DISCONNECTED = 'user_disconnected',
  ERROR = 'error'
} 