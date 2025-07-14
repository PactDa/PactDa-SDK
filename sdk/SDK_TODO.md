# PactDa SDK Implementation TODO

## Project Overview
Replace mock implementations with structured HTTP client layer that can seamlessly transition from mock responses to real API endpoints.

## Phase 1: Core HTTP Client Infrastructure ⚡ ✅ COMPLETED

### 1.1 HTTP Client Service
- [x] Create `src/services/httpClient.ts` with axios configuration
- [x] Implement environment-specific base URLs
- [x] Add request/response interceptors
- [x] Setup authentication header injection
- [x] Add error handling and retry logic
- [x] Implement mock response simulation

### 1.2 API Endpoint Definitions
- [x] Create `src/services/apiEndpoints.ts` with typed endpoint definitions
- [x] Define request/response interfaces in `src/types/api.ts`
- [x] Setup environment-specific URL construction
- [x] Add endpoint versioning support

### 1.3 Mock Data Provider
- [x] Create `src/services/mockResponses.ts` with realistic mock responses
- [x] Implement simulated server responses for all endpoints
- [x] Add configurable delays to simulate network latency
- [x] Create realistic data structures matching API contracts

### 1.4 Type Definitions
- [x] Create `src/types/api.ts` with API request/response types
- [x] Define HTTP client configuration types
- [x] Add error response types
- [x] Create service export index

## Phase 2: Integration with SDK Methods 🔧

### 2.1 Update Core SDK Methods
- [ ] Replace `createAgreement()` mock logic with HTTP calls
- [ ] Replace `reportOutcome()` mock logic with HTTP calls
- [ ] Update `getAgreementStatus()` to use HTTP client
- [ ] Add proper error handling and response parsing

### 2.2 Authentication Integration
- [ ] Add API key authentication headers
- [ ] Implement token refresh logic (if needed)
- [ ] Handle authentication errors gracefully
- [ ] Add user session management

## Phase 3: Development Features 🚀

### 3.1 Environment Configuration
- [ ] Development: Mock responses with delays
- [ ] Testnet: Real API calls to testnet endpoints
- [ ] Production: Real API calls to production endpoints
- [ ] Add environment detection and switching

### 3.2 Error Handling & Retry Logic
- [ ] Network error handling
- [ ] Rate limiting responses
- [ ] Automatic retry for transient failures
- [ ] Proper error event emission

## Phase 4: Testing & Documentation 📚

### 4.1 Unit Tests
- [ ] Create tests for HTTP client with mocked axios
- [ ] Test all SDK methods with mock responses
- [ ] Test error handling scenarios
- [ ] Test environment switching

### 4.2 Integration Tests
- [ ] Test full SDK flow with mock server
- [ ] Test authentication scenarios
- [ ] Test network error scenarios
- [ ] Test rate limiting scenarios

### 4.3 Documentation
- [ ] Update README with HTTP client usage
- [ ] Document API endpoint structure
- [ ] Add environment configuration guide
- [ ] Create troubleshooting guide

## Expected API Endpoints

### Agreement Endpoints
```typescript
POST /api/v1/agreements          # Create agreement
GET /api/v1/agreements/:id       # Get agreement status  
PUT /api/v1/agreements/:id       # Update agreement
POST /api/v1/agreements/:id/outcome # Report outcome
```

### User Endpoints
```typescript
GET /api/v1/users/profile        # Get user profile
POST /api/v1/users/connect       # Connect user via zkLogin
```

### Credit Endpoints
```typescript
GET /api/v1/credits/balance      # Get credit balance
POST /api/v1/credits/deduct      # Deduct credits
```

## File Structure
```
sdk/src/
├── services/
│   ├── httpClient.ts       # Main HTTP client class
│   ├── apiEndpoints.ts     # API endpoint definitions
│   ├── mockResponses.ts    # Mock data provider
│   └── index.ts           # Export all services
├── types/
│   ├── api.ts             # API request/response types
│   └── index.ts           # Export all types
├── pactda.ts              # Updated to use HTTP client
└── index.ts               # Main SDK export
```

## Progress Tracking
- [x] Phase 1 Complete: Core HTTP Client Infrastructure ✅
- [ ] Phase 2 Complete: Integration with SDK Methods  
- [ ] Phase 3 Complete: Development Features
- [ ] Phase 4 Complete: Testing & Documentation

## Notes
- All implementations should maintain backward compatibility
- Focus on TypeScript type safety throughout
- Ensure easy transition from mock to real API
- Prioritize developer experience and debugging capabilities