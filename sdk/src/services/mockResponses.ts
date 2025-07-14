import type {
  CreateAgreementRequest,
  CreateAgreementResponse,
  GetAgreementResponse,
  ReportOutcomeResponse,
  ConnectUserResponse,
  GetUserProfileResponse,
  GetCreditBalanceResponse,
  DeductCreditsResponse
} from '../types/api'
import { AgreementStatus } from '../types'

// AIDEV-NOTE: Mock data provider for development and testing
export class MockResponseProvider {
  private static instance: MockResponseProvider
  private agreements: Map<string, any> = new Map()
  private users: Map<string, any> = new Map()
  private credits: Map<string, any> = new Map()

  static getInstance(): MockResponseProvider {
    if (!MockResponseProvider.instance) {
      MockResponseProvider.instance = new MockResponseProvider()
    }
    return MockResponseProvider.instance
  }

  // Generate mock IDs
  private generateId(prefix: string): string {
    return `${prefix}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Mock Agreement responses
  createAgreement(request: CreateAgreementRequest): CreateAgreementResponse {
    const agreementId = this.generateId('agreement')
    const agreement = {
      id: agreementId,
      parties: request.parties,
      escrowConfig: request.escrowConfig,
      resolutionPolicy: request.resolutionPolicy,
      status: AgreementStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: request.metadata
    }

    this.agreements.set(agreementId, agreement)

    return {
      agreement,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
      blockchainId: this.generateId('blockchain')
    }
  }

  getAgreement(agreementId: string): GetAgreementResponse {
    const agreement = this.agreements.get(agreementId)
    
    if (!agreement) {
      throw {
        message: 'Agreement not found',
        status: 404,
        code: 'AGREEMENT_NOT_FOUND'
      }
    }

    return {
      agreement,
      transactionHistory: [
        {
          type: 'created',
          timestamp: agreement.createdAt,
          transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
          details: {
            creator: agreement.parties[0]?.address,
            gasUsed: 21000,
            gasPrice: '20000000000'
          }
        },
        {
          type: 'funded',
          timestamp: new Date(agreement.createdAt.getTime() + 5 * 60 * 1000), // 5 minutes later
          transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
          details: {
            funder: agreement.parties[0]?.address,
            amount: agreement.escrowConfig.amount,
            currency: agreement.escrowConfig.currency
          }
        }
      ]
    }
  }

  reportOutcome(agreementId: string, outcomeData: any): ReportOutcomeResponse {
    const agreement = this.agreements.get(agreementId)
    
    if (!agreement) {
      throw {
        message: 'Agreement not found',
        status: 404,
        code: 'AGREEMENT_NOT_FOUND'
      }
    }

    // Update agreement status
    agreement.status = AgreementStatus.COMPLETED
    agreement.updatedAt = new Date()
    this.agreements.set(agreementId, agreement)

    return {
      success: true,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
      blockchainId: this.generateId('blockchain'),
      distributionDetails: outcomeData.distribution || [
        {
          address: agreement.parties[0]?.address || '0x123...',
          amount: agreement.escrowConfig.amount * 0.95, // 5% fee
          currency: agreement.escrowConfig.currency,
          transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
        }
      ]
    }
  }

  // Mock User responses
  connectUser(request: any): ConnectUserResponse {
    const userId = this.generateId('user')
    const user = {
      id: userId,
      address: request.address,
      provider: request.provider,
      email: request.email,
      isAuthenticated: true
    }

    this.users.set(userId, user)

    // Initialize credit balance for new user
    this.credits.set(userId, {
      balance: 1000, // Starting balance
      currency: 'credits',
      lastUpdated: new Date(),
      transactions: [
        {
          id: this.generateId('tx'),
          type: 'credit',
          amount: 1000,
          description: 'Welcome bonus',
          timestamp: new Date(),
          agreementId: undefined
        }
      ]
    })

    return {
      user,
      accessToken: 'mock_access_token_' + Math.random().toString(36).substr(2, 20),
      refreshToken: 'mock_refresh_token_' + Math.random().toString(36).substr(2, 20),
      sessionId: this.generateId('session')
    }
  }

  getUserProfile(userId: string): GetUserProfileResponse {
    const user = this.users.get(userId)
    
    if (!user) {
      throw {
        message: 'User not found',
        status: 404,
        code: 'USER_NOT_FOUND'
      }
    }

    // Generate mock statistics
    const userAgreements = Array.from(this.agreements.values())
      .filter(agreement => 
        agreement.parties.some((party: any) => party.address === user.address)
      )

    return {
      user,
      statistics: {
        totalAgreements: userAgreements.length,
        completedAgreements: userAgreements.filter(a => a.status === AgreementStatus.COMPLETED).length,
        disputedAgreements: userAgreements.filter(a => a.status === AgreementStatus.DISPUTED).length,
        totalVolume: userAgreements.reduce((sum, a) => sum + a.escrowConfig.amount, 0),
        averageResolutionTime: 3600000 // 1 hour in milliseconds
      },
      recentActivity: userAgreements.slice(-5).map(agreement => ({
        type: 'agreement_created',
        timestamp: agreement.createdAt,
        agreementId: agreement.id,
        details: {
          status: agreement.status,
          amount: agreement.escrowConfig.amount,
          currency: agreement.escrowConfig.currency
        }
      }))
    }
  }

  // Mock Credit responses
  getCreditBalance(userId: string): GetCreditBalanceResponse {
    const userCredits = this.credits.get(userId)
    
    if (!userCredits) {
      throw {
        message: 'User credits not found',
        status: 404,
        code: 'USER_CREDITS_NOT_FOUND'
      }
    }

    return userCredits
  }

  deductCredits(userId: string, amount: number, description: string, agreementId?: string): DeductCreditsResponse {
    const userCredits = this.credits.get(userId)
    
    if (!userCredits) {
      throw {
        message: 'User credits not found',
        status: 404,
        code: 'USER_CREDITS_NOT_FOUND'
      }
    }

    if (userCredits.balance < amount) {
      throw {
        message: 'Insufficient credits',
        status: 400,
        code: 'INSUFFICIENT_CREDITS'
      }
    }

    // Deduct credits
    userCredits.balance -= amount
    userCredits.lastUpdated = new Date()
    
    // Add transaction record
    const transaction = {
      id: this.generateId('tx'),
      type: 'debit' as const,
      amount,
      description,
      timestamp: new Date(),
      agreementId
    }
    
    userCredits.transactions.push(transaction)
    this.credits.set(userId, userCredits)

    return {
      success: true,
      newBalance: userCredits.balance,
      transactionId: transaction.id,
      timestamp: transaction.timestamp
    }
  }

  // Health check responses
  getHealth(): { status: string; timestamp: Date } {
    return {
      status: 'healthy',
      timestamp: new Date()
    }
  }

  getStatus(): {
    version: string
    environment: string
    uptime: number
    services: Record<string, string>
  } {
    return {
      version: '0.0.1',
      environment: 'development',
      uptime: Math.floor(Math.random() * 3600000), // Random uptime in milliseconds
      services: {
        database: 'connected',
        blockchain: 'connected',
        websocket: 'connected',
        cache: 'connected'
      }
    }
  }

  // Utility methods for testing
  reset(): void {
    this.agreements.clear()
    this.users.clear()
    this.credits.clear()
  }

  seedTestData(): void {
    // Create test user
    const testUser = {
      id: 'test_user_123',
      address: '0x742d35Cc6634C0532925a3b8D86dB2543E7A3F6C',
      provider: 'enoki_zk',
      email: 'test@example.com',
      isAuthenticated: true
    }
    
    this.users.set(testUser.id, testUser)
    
    // Create test credit balance
    this.credits.set(testUser.id, {
      balance: 5000,
      currency: 'credits',
      lastUpdated: new Date(),
      transactions: [
        {
          id: 'tx_welcome',
          type: 'credit',
          amount: 1000,
          description: 'Welcome bonus',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          agreementId: undefined
        },
        {
          id: 'tx_purchase',
          type: 'credit',
          amount: 4000,
          description: 'Credit purchase',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          agreementId: undefined
        }
      ]
    })
  }
}