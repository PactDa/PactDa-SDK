import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { PactDaConfig } from '../types'

// AIDEV-NOTE: HTTP client service for PactDa SDK with mock and real API support
export interface HttpClientConfig {
  baseURL: string
  timeout: number
  apiKey: string
  enableMocks: boolean
  mockDelay?: number
}

export interface ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export class HttpClient {
  private axiosInstance: AxiosInstance
  private config: HttpClientConfig
  private mockMode: boolean = false

  constructor(config: HttpClientConfig) {
    this.config = config
    this.mockMode = config.enableMocks

    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'X-SDK-Version': '0.0.1',
        'X-SDK-Client': 'pactda-sdk-lite'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Log request in development
        if (this.config.enableMocks) {
          console.log(`[PactDa SDK] ${config.method?.toUpperCase()} ${config.url}`, config.data)
        }
        
        return config
      },
      (error) => {
        console.error('[PactDa SDK] Request error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response in development
        if (this.config.enableMocks) {
          console.log(`[PactDa SDK] Response ${response.status}`, response.data)
        }
        
        return response
      },
      (error) => {
        console.error('[PactDa SDK] Response error:', error.response?.data || error.message)
        
        // Transform error for consistent handling
        const apiError = {
          message: error.response?.data?.message || error.message,
          status: error.response?.status || 500,
          code: error.response?.data?.code || 'UNKNOWN_ERROR'
        }
        
        return Promise.reject(apiError)
      }
    )
  }

  // AIDEV-NOTE: Generic request method that handles both mock and real API calls
  async request<T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      // Simulate network delay in mock mode
      if (this.mockMode && this.config.mockDelay) {
        await new Promise(resolve => setTimeout(resolve, this.config.mockDelay))
      }

      const response = await this.axiosInstance.request<ApiResponse<T>>(config)
      return response.data
    } catch (error: any) {
      throw {
        message: error.message || 'Request failed',
        status: error.status || 500,
        code: error.code || 'NETWORK_ERROR'
      }
    }
  }

  // Convenience methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url })
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data })
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data })
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url })
  }

  // Update authentication
  updateApiKey(apiKey: string): void {
    this.config.apiKey = apiKey
    this.axiosInstance.defaults.headers['Authorization'] = `Bearer ${apiKey}`
  }

  // Enable/disable mock mode
  setMockMode(enabled: boolean): void {
    this.mockMode = enabled
    this.config.enableMocks = enabled
  }

  // Get current configuration
  getConfig(): HttpClientConfig {
    return { ...this.config }
  }
}

// AIDEV-NOTE: Factory function to create HTTP client from PactDa config
export function createHttpClient(config: PactDaConfig): HttpClient {
  const environment = config.environment || 'development'
  const enableMocks = environment === 'development'
  
  const httpConfig: HttpClientConfig = {
    baseURL: config.apiUrl || getDefaultApiUrl(environment),
    timeout: 10000, // 10 seconds
    apiKey: config.apiKey,
    enableMocks,
    mockDelay: enableMocks ? 500 : undefined // 500ms delay for mock responses
  }

  return new HttpClient(httpConfig)
}

function getDefaultApiUrl(environment: string): string {
  switch (environment) {
    case 'production':
      return 'https://api.pactda.com'
    case 'testnet':
      return 'https://api-testnet.pactda.com'
    default:
      return 'http://localhost:3000'
  }
}