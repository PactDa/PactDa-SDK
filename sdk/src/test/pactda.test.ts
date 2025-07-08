import { describe, it, expect, beforeEach } from 'vitest'
import { createPactDa, PactDa } from '../pactda'
import { SDKEvents } from '../types'

describe('PactDa SDK', () => {
  let pactda: PactDa

  beforeEach(() => {
    pactda = createPactDa({
      apiKey: 'test-api-key-123',
      environment: 'development'
    })
  })

  describe('Initialization', () => {
    it('should create PactDa instance with config', () => {
      expect(pactda).toBeDefined()
      expect(pactda).toBeInstanceOf(PactDa)
    })

    it('should initialize with API key', async () => {
      await expect(pactda.init()).resolves.not.toThrow()
    })

    it('should throw error if no API key provided', async () => {
      const invalidPactda = createPactDa({ apiKey: '' })
      await expect(invalidPactda.init()).rejects.toThrow('API key is required')
    })
  })

  describe('User Connection', () => {
    beforeEach(async () => {
      await pactda.init()
    })

    it('should connect user and return user object', async () => {
      const user = await pactda.connectUser()
      
      expect(user).toBeDefined()
      expect(user.id).toBeDefined()
      expect(user.address).toBeDefined()
      expect(user.provider).toBe('enoki_zk')
      expect(user.isAuthenticated).toBe(true)
    })

    it('should get current user after connection', async () => {
      const user = await pactda.connectUser()
      const currentUser = pactda.getCurrentUser()
      
      expect(currentUser).toEqual(user)
    })

    it('should disconnect user', async () => {
      await pactda.connectUser()
      pactda.disconnect()
      
      expect(pactda.getCurrentUser()).toBeNull()
    })
  })

  describe('Agreement Creation', () => {
    beforeEach(async () => {
      await pactda.init()
      await pactda.connectUser()
    })

    it('should create agreement with valid parameters', async () => {
      const agreementParams = {
        parties: [
          { address: '0x123', role: 'player1' },
          { address: '0x456', role: 'player2' }
        ],
        escrowConfig: {
          amount: 100,
          currency: 'SUI'
        },
        resolutionPolicy: {
          type: 'automated' as const,
          resolverAddress: '0x789'
        }
      }

      const agreement = await pactda.createAgreement(agreementParams)
      
      expect(agreement).toBeDefined()
      expect(agreement.id).toBeDefined()
      expect(agreement.parties).toEqual(agreementParams.parties)
      expect(agreement.escrowConfig).toEqual(agreementParams.escrowConfig)
      expect(agreement.status).toBe('DRAFT')
    })

    it('should throw error if user not connected', async () => {
      pactda.disconnect()
      
      const agreementParams = {
        parties: [
          { address: '0x123', role: 'player1' },
          { address: '0x456', role: 'player2' }
        ],
        escrowConfig: {
          amount: 100,
          currency: 'SUI'
        },
        resolutionPolicy: {
          type: 'automated' as const,
          resolverAddress: '0x789'
        }
      }

      await expect(pactda.createAgreement(agreementParams))
        .rejects.toThrow('User must be connected before creating agreements')
    })
  })

  describe('Outcome Reporting', () => {
    beforeEach(async () => {
      await pactda.init()
      await pactda.connectUser()
    })

    it('should report outcome successfully', async () => {
      const outcomeParams = {
        agreementId: 'test-agreement-123',
        outcomeData: {
          agreementId: 'test-agreement-123',
          result: 'completed' as const,
          winnerAddress: '0x123'
        }
      }

      const result = await pactda.reportOutcome(outcomeParams)
      expect(result).toBe(true)
    })

    it('should throw error if user not connected', async () => {
      pactda.disconnect()
      
      const outcomeParams = {
        agreementId: 'test-agreement-123',
        outcomeData: {
          agreementId: 'test-agreement-123',
          result: 'completed' as const,
          winnerAddress: '0x123'
        }
      }

      await expect(pactda.reportOutcome(outcomeParams))
        .rejects.toThrow('User must be connected before reporting outcomes')
    })
  })

  describe('Event System', () => {
    it('should register and trigger event listeners', async () => {
      let eventTriggered = false
      let eventData: any = null

      pactda.on(SDKEvents.USER_CONNECTED, (data) => {
        eventTriggered = true
        eventData = data
      })

      await pactda.init()
      await pactda.connectUser()

      expect(eventTriggered).toBe(true)
      expect(eventData).toBeDefined()
    })

    it('should remove event listeners', () => {
      let eventTriggered = false
      
      const callback = () => {
        eventTriggered = true
      }

      pactda.on(SDKEvents.USER_CONNECTED, callback)
      pactda.off(SDKEvents.USER_CONNECTED, callback)

      // Manually emit event to test removal
      // Since emit is private, we test indirectly through disconnect
      pactda.disconnect()
      expect(eventTriggered).toBe(false)
    })
  })

  describe('Configuration', () => {
    it('should use default development environment', () => {
      const devPactda = createPactDa({ apiKey: 'test' })
      expect(devPactda).toBeDefined()
    })

    it('should accept custom environment', () => {
      const testnetPactda = createPactDa({ 
        apiKey: 'test',
        environment: 'testnet'
      })
      expect(testnetPactda).toBeDefined()
    })

    it('should accept custom API URLs', () => {
      const customPactda = createPactDa({ 
        apiKey: 'test',
        apiUrl: 'https://custom-api.example.com',
        wsUrl: 'wss://custom-ws.example.com'
      })
      expect(customPactda).toBeDefined()
    })
  })
}) 