import type {
  PactDaConfig,
  User,
  Agreement,
  CreateAgreementParams,
  ReportOutcomeParams,
  EventCallback,
} from './types'
import { SDKEvents } from './types'

/**
 * Main PactDa SDK class
 */
export class PactDa {
  private config: PactDaConfig
  private user: User | null = null
  private eventListeners: Map<string, EventCallback[]> = new Map()

  constructor(config: PactDaConfig) {
    this.config = {
      environment: 'development',
      apiUrl: this.getDefaultApiUrl(config.environment || 'development'),
      wsUrl: this.getDefaultWsUrl(config.environment || 'development'),
      ...config,
    }
  }

  /**
   * Initialize the SDK with API key authentication
   */
  async init(options?: { apiKey?: string }): Promise<void> {
    const apiKey = options?.apiKey || this.config.apiKey
    
    if (!apiKey) {
      throw new Error('API key is required for PactDa SDK initialization')
    }

    // TODO: Implement API key validation with backend
    console.log('PactDa SDK initialized with API key:', apiKey.substring(0, 8) + '...')
    
    // Emit initialization event
    this.emit(SDKEvents.USER_CONNECTED, { apiKey: apiKey.substring(0, 8) + '...' })
  }

  /**
   * Connect user via Sui Enoki zkLogin
   */
  async connectUser(): Promise<User> {
    try {
      // TODO: Implement Sui Enoki zkLogin integration
      // For now, return mock user data for development
      const mockUser: User = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        address: '0x' + Math.random().toString(16).substr(2, 40),
        provider: 'enoki_zk',
        email: 'developer@example.com',
        isAuthenticated: true,
      }

      this.user = mockUser
      this.emit(SDKEvents.USER_CONNECTED, mockUser)
      
      return mockUser
    } catch (error) {
      this.emit(SDKEvents.ERROR, { error: 'Failed to connect user', details: error })
      throw new Error('Failed to connect user via Enoki zkLogin')
    }
  }

  /**
   * Create a new agreement
   */
  async createAgreement(params: CreateAgreementParams): Promise<Agreement> {
    if (!this.user) {
      throw new Error('User must be connected before creating agreements')
    }

    try {
      // TODO: Implement actual blockchain interaction
      // For now, return mock agreement for development
      const agreement: Agreement = {
        id: 'agreement_' + Math.random().toString(36).substr(2, 9),
        parties: params.parties,
        escrowConfig: params.escrowConfig,
        resolutionPolicy: params.resolutionPolicy,
        status: 'DRAFT' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: params.metadata,
      }

      this.emit(SDKEvents.AGREEMENT_CREATED, agreement)
      
      return agreement
    } catch (error) {
      this.emit(SDKEvents.ERROR, { error: 'Failed to create agreement', details: error })
      throw new Error('Failed to create agreement')
    }
  }

  /**
   * Report outcome for an agreement
   */
  async reportOutcome(params: ReportOutcomeParams): Promise<boolean> {
    if (!this.user) {
      throw new Error('User must be connected before reporting outcomes')
    }

    try {
      // TODO: Implement actual outcome reporting to blockchain
      console.log('Reporting outcome for agreement:', params.agreementId)
      
      this.emit(SDKEvents.AGREEMENT_COMPLETED, params)
      
      return true
    } catch (error) {
      this.emit(SDKEvents.ERROR, { error: 'Failed to report outcome', details: error })
      throw new Error('Failed to report outcome')
    }
  }

  /**
   * Get agreement status
   */
  async getAgreementStatus(agreementId: string): Promise<Agreement | null> {
    try {
      // TODO: Implement actual status fetching from blockchain
      console.log('Fetching status for agreement:', agreementId)
      
      // Return mock data for development
      return null
    } catch (error) {
      this.emit(SDKEvents.ERROR, { error: 'Failed to get agreement status', details: error })
      throw new Error('Failed to get agreement status')
    }
  }

  /**
   * Event listener for real-time updates
   */
  on(eventName: SDKEvents, callback: EventCallback): void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, [])
    }
    this.eventListeners.get(eventName)!.push(callback)
  }

  /**
   * Remove event listener
   */
  off(eventName: SDKEvents, callback: EventCallback): void {
    const listeners = this.eventListeners.get(eventName)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(eventName: SDKEvents, data: any): void {
    const listeners = this.eventListeners.get(eventName)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in event listener:', error)
        }
      })
    }
  }

  /**
   * Get current connected user
   */
  getCurrentUser(): User | null {
    return this.user
  }

  /**
   * Disconnect user
   */
  disconnect(): void {
    this.user = null
    this.emit(SDKEvents.USER_DISCONNECTED, {})
  }

  /**
   * Get default API URL based on environment
   */
  private getDefaultApiUrl(environment: string): string {
    switch (environment) {
      case 'production':
        return 'https://api.pactda.com'
      case 'testnet':
        return 'https://api-testnet.pactda.com'
      default:
        return 'http://localhost:3000'
    }
  }

  /**
   * Get default WebSocket URL based on environment
   */
  private getDefaultWsUrl(environment: string): string {
    switch (environment) {
      case 'production':
        return 'wss://ws.pactda.com'
      case 'testnet':
        return 'wss://ws-testnet.pactda.com'
      default:
        return 'ws://localhost:3001'
    }
  }
}

/**
 * Factory function to create PactDa instance
 */
export function createPactDa(config: PactDaConfig): PactDa {
  return new PactDa(config)
} 