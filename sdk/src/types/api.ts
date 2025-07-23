import type { Agreement, User, OutcomeData } from './index'

// AIDEV-NOTE: API request/response types for PactDa SDK HTTP client

// Base API response wrapper
export interface ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
  error?: string
}

// Error response structure
export interface ApiError {
  message: string
  status: number
  code: string
  details?: Record<string, any>
}

// Agreement API types
export interface CreateAgreementRequest {
  parties: Array<{
    address: string
    role: string
    metadata?: Record<string, any>
  }>
  escrowConfig: {
    amount: number
    currency: string
    releaseConditions?: string[]
    timelock?: number
  }
  resolutionPolicy: {
    type: 'automated' | 'manual' | 'oracle'
    resolverAddress?: string
    parameters?: Record<string, any>
  }
  metadata?: Record<string, any>
}

export interface CreateAgreementResponse {
  agreement: Agreement
  transactionHash?: string
  blockchainId?: string
}

export interface GetAgreementRequest {
  agreementId: string
}

export interface GetAgreementResponse {
  agreement: Agreement
  transactionHistory?: Array<{
    type: string
    timestamp: Date
    transactionHash: string
    details: Record<string, any>
  }>
}

export interface ReportOutcomeRequest {
  agreementId: string
  outcomeData: OutcomeData
  reporterAddress: string
  signature?: string
}

export interface ReportOutcomeResponse {
  success: boolean
  transactionHash?: string
  blockchainId?: string
  distributionDetails?: Array<{
    address: string
    amount: number
    currency: string
    transactionHash: string
  }>
}

// User API types
export interface ConnectUserRequest {
  zkProof: string
  address: string
  provider: string
  email?: string
  metadata?: Record<string, any>
}

export interface ConnectUserResponse {
  user: User
  accessToken?: string
  refreshToken?: string
  sessionId: string
}

export interface GetUserProfileRequest {
  userId?: string
  address?: string
}

export interface GetUserProfileResponse {
  user: User
  statistics: {
    totalAgreements: number
    completedAgreements: number
    disputedAgreements: number
    totalVolume: number
    averageResolutionTime: number
  }
  recentActivity: Array<{
    type: string
    timestamp: Date
    agreementId: string
    details: Record<string, any>
  }>
}

// Credit API types
export interface GetCreditBalanceRequest {
  userId: string
}

export interface GetCreditBalanceResponse {
  balance: number
  currency: string
  lastUpdated: Date
  transactions: Array<{
    id: string
    type: 'credit' | 'debit'
    amount: number
    description: string
    timestamp: Date
    agreementId?: string
  }>
}

export interface DeductCreditsRequest {
  userId: string
  amount: number
  description: string
  agreementId?: string
  metadata?: Record<string, any>
}

export interface DeductCreditsResponse {
  success: boolean
  newBalance: number
  transactionId: string
  timestamp: Date
}

// WebSocket event types
export interface WebSocketEvent {
  type: string
  timestamp: Date
  data: Record<string, any>
}

export interface AgreementCreatedEvent extends WebSocketEvent {
  type: 'agreement_created'
  data: {
    agreementId: string
    agreement: Agreement
    createdBy: string
  }
}

export interface AgreementFundedEvent extends WebSocketEvent {
  type: 'agreement_funded'
  data: {
    agreementId: string
    fundedBy: string
    amount: number
    currency: string
    transactionHash: string
  }
}

export interface AgreementCompletedEvent extends WebSocketEvent {
  type: 'agreement_completed'
  data: {
    agreementId: string
    result: 'completed' | 'cancelled' | 'disputed'
    winnerAddress?: string
    distribution: Array<{
      address: string
      amount: number
      currency: string
    }>
    transactionHash: string
  }
}

export interface AgreementDisputedEvent extends WebSocketEvent {
  type: 'agreement_disputed'
  data: {
    agreementId: string
    disputedBy: string
    reason: string
    evidence?: string[]
    timestamp: Date
  }
}

// HTTP client configuration
export interface HttpClientConfig {
  baseURL: string
  timeout: number
  apiKey: string
  enableMocks: boolean
  mockDelay?: number
}

// API endpoint paths
export const API_ENDPOINTS = {
  // Agreement endpoints
  AGREEMENTS: '/api/v1/agreements',
  AGREEMENT_BY_ID: (id: string) => `/api/v1/agreements/${id}`,
  AGREEMENT_OUTCOME: (id: string) => `/api/v1/agreements/${id}/outcome`,
  
  // User endpoints
  USER_CONNECT: '/api/v1/users/connect',
  USER_PROFILE: '/api/v1/users/profile',
  USER_BY_ID: (id: string) => `/api/v1/users/${id}`,
  
  // Credit endpoints
  CREDIT_BALANCE: '/api/v1/credits/balance',
  CREDIT_DEDUCT: '/api/v1/credits/deduct',
  CREDIT_HISTORY: '/api/v1/credits/history',
  
  // Health and status
  HEALTH: '/api/v1/health',
  STATUS: '/api/v1/status'
} as const