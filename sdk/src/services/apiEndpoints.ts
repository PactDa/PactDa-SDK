import type { HttpClient } from './httpClient'
import type {
  CreateAgreementRequest,
  CreateAgreementResponse,
  GetAgreementRequest,
  GetAgreementResponse,
  ReportOutcomeRequest,
  ReportOutcomeResponse,
  ConnectUserRequest,
  ConnectUserResponse,
  GetUserProfileRequest,
  GetUserProfileResponse,
  GetCreditBalanceRequest,
  GetCreditBalanceResponse,
  DeductCreditsRequest,
  DeductCreditsResponse
} from '../types/api'
import { API_ENDPOINTS } from '../types/api'

// AIDEV-NOTE: API endpoint service that wraps HTTP client with typed methods
export class ApiEndpoints {
  constructor(private httpClient: HttpClient) {}

  // Agreement endpoints
  async createAgreement(request: CreateAgreementRequest): Promise<CreateAgreementResponse> {
    const response = await this.httpClient.post<CreateAgreementResponse>(
      API_ENDPOINTS.AGREEMENTS,
      request
    )
    return response.data
  }

  async getAgreement(request: GetAgreementRequest): Promise<GetAgreementResponse> {
    const response = await this.httpClient.get<GetAgreementResponse>(
      API_ENDPOINTS.AGREEMENT_BY_ID(request.agreementId)
    )
    return response.data
  }

  async reportOutcome(request: ReportOutcomeRequest): Promise<ReportOutcomeResponse> {
    const response = await this.httpClient.post<ReportOutcomeResponse>(
      API_ENDPOINTS.AGREEMENT_OUTCOME(request.agreementId),
      request
    )
    return response.data
  }

  // User endpoints
  async connectUser(request: ConnectUserRequest): Promise<ConnectUserResponse> {
    const response = await this.httpClient.post<ConnectUserResponse>(
      API_ENDPOINTS.USER_CONNECT,
      request
    )
    return response.data
  }

  async getUserProfile(request: GetUserProfileRequest): Promise<GetUserProfileResponse> {
    const params = new URLSearchParams()
    if (request.userId) params.append('userId', request.userId)
    if (request.address) params.append('address', request.address)
    
    const response = await this.httpClient.get<GetUserProfileResponse>(
      `${API_ENDPOINTS.USER_PROFILE}?${params.toString()}`
    )
    return response.data
  }

  // Credit endpoints
  async getCreditBalance(request: GetCreditBalanceRequest): Promise<GetCreditBalanceResponse> {
    const response = await this.httpClient.get<GetCreditBalanceResponse>(
      `${API_ENDPOINTS.CREDIT_BALANCE}?userId=${request.userId}`
    )
    return response.data
  }

  async deductCredits(request: DeductCreditsRequest): Promise<DeductCreditsResponse> {
    const response = await this.httpClient.post<DeductCreditsResponse>(
      API_ENDPOINTS.CREDIT_DEDUCT,
      request
    )
    return response.data
  }

  // Health check endpoints
  async checkHealth(): Promise<{ status: string; timestamp: Date }> {
    const response = await this.httpClient.get<{ status: string; timestamp: Date }>(
      API_ENDPOINTS.HEALTH
    )
    return response.data
  }

  async getStatus(): Promise<{ 
    version: string
    environment: string
    uptime: number
    services: Record<string, string>
  }> {
    const response = await this.httpClient.get<{
      version: string
      environment: string
      uptime: number
      services: Record<string, string>
    }>(API_ENDPOINTS.STATUS)
    return response.data
  }
}