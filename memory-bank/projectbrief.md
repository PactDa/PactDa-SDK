PactDa SDK & API: Project Brief
Project: PactDa - A "Trust-as-a-Service" Protocol
Target Audience for this Brief: AI Code Assistant (Claude)
Goal: To assist in the development of the backend API and the developer-facing SDK for the PactDa MVP.

1. Project Overview & Goal
PactDa is a decentralized protocol anchored on the Sui blockchain. Our mission is to make it incredibly simple for any developer (including those with no Web3 experience) to integrate secure agreements, escrow, and automated settlement logic into their applications.

The goal for this development phase is to build the SDK and API for our "Pioneer Developer Event". Developers will use our PactDa-Lite SDK to build simple wager-based applications (like a 2-player chess game) where an entry fee is escrowed and automatically paid to the winner.

The core philosophy is maximum abstraction. The developer using our SDK should not have to think about gas fees, smart contracts, or blockchain transactions. Their experience should feel like using a standard Web2 API service like Stripe or Twilio.

2. Core Architecture
The system consists of four primary layers. Your focus will be on the Server and SDK layers.

Smart Contracts (Sui): The on-chain source of truth. Manages the PactDaContract, Escrow, and a ProgrammaticResolver object.

Server (API): The centralized gateway that manages developer access, API keys, the "API Credit" system, and sponsors gas for transactions.

SDK (TypeScript): The developer's toolkit. A simple library that communicates with our Server API to trigger on-chain actions.

Client (Developer Portal): The website where developers sign up, get API keys, and manage their accounts.

3. Server (API) Specification
The server acts as the secure, managed gateway to the PactDa protocol.

Tech Stack: NestJS (Node.js/TypeScript), MongoDB, TypeORM.

Deployment: Serverless environment (e.g., Vercel, AWS Lambda).

Key Services & Logic:
Auth Service:

Functionality: Manages developer accounts (email/password), subscription tiers, and API key generation/validation.

Database Models: Developer, Subscription, ApiKey.

API Gateway & Credit System (Middleware):

Functionality: This is a critical piece of middleware that protects all core endpoints.

Process:

Extracts the X-API-Key header from every incoming SDK request.

Validates the key against the database.

Retrieves the developer's credit balance (e.g., 4,500 / 50,000).

Checks the credit cost for the requested action (e.g., createAgreement costs 10 credits).

If credits are sufficient, it deducts the credits and forwards the request to the appropriate service.

If insufficient, it must return a 402 Payment Required error.

Gas Sponsorship Service:

Functionality: The "Gas Tank" that executes transactions on behalf of developers.

Process:

Receives a validated request from the API Gateway.

Constructs a Sui TransactionBlock based on the request's parameters (e.g., calling pactda_core::create_agreement).

Signs the transaction using the protocol's secure "Gas Tank" private key (loaded from a secure secret manager, NOT hardcoded).

Submits the transaction to the Sui network.

Returns the result (e.g., the new agreementId) to the SDK.

Required API Endpoints:
POST /v1/agreements/create

Purpose: To create a new programmatic agreement on the Sui blockchain.

Request Body: { parties: string[], escrowConfig: { inputs: { party: string, amount: number }[] }, resolutionPolicy: { authority: string } }

Logic: Validates input, then passes the request to the Gas Sponsorship Service to create the PactDaContract and ProgrammaticResolver objects on-chain.

Returns: { success: true, agreementId: string }

POST /v1/agreements/resolve

Purpose: To allow the designated authority to report the outcome of an agreement.

Request Body: { agreementId: string, outcomeData: { winner: string } }

Logic:

Verifies that the API key used for this request belongs to the developer associated with the authority_address of this specific agreementId. This is a critical security check.

Passes the request to the Gas Sponsorship Service to call the report_outcome function on the correct ProgrammaticResolver object on-chain.

Returns: { success: true, transactionDigest: string }

4. SDK (PactDa-Lite) Specification
The SDK is the primary product. It must be extremely simple and intuitive.

Tech Stack: TypeScript, published to npm as @pactda/sdk-lite.

Core Principle: Abstract away all blockchain complexity. The developer using this SDK should feel like they are interacting with a simple Web2 API.

Key Functions to Implement:
pactda.init({ apiKey: 'YOUR_API_KEY' })

Purpose: Configures the SDK instance with the developer's API key.

Logic: Stores the apiKey internally to be used in the X-API-Key header for all subsequent server requests.

pactda.connectUser()

Purpose: Provide "Onboarding-as-a-Service".

Logic: This function must integrate and trigger the Sui Enoki managed UI for zkLogin. It should handle the entire flow and session management provided by the Enoki SDK.

Returns: A promise that resolves with the suiAddress: string of the successfully onboarded user.

pactda.createAgreement(params: CreateAgreementParams)

Purpose: Allows a developer to create a complete agreement with a single function call.

Input (CreateAgreementParams): A simple JavaScript object matching the /v1/agreements/create endpoint's request body.

Logic:

Makes an authenticated POST request to the PactDa Server API.

Handles the server's response, which will include the agreementId and instructions for the funding phase.

The SDK should then abstract the funding process, prompting each party in params.parties via their wallet to submit their required stake.

Returns: A promise that resolves with the agreementId: string once the agreement is created and fully funded.

pactda.reportOutcome(params: ReportOutcomeParams)

Purpose: Allows the designated authority (e.g., a game server) to resolve an agreement.

Input (ReportOutcomeParams): An object matching the /v1/agreements/resolve endpoint's request body.

Logic: Makes an authenticated POST request to the server. This function should only succeed if the API key used in init() is associated with the authority for that agreement.

Returns: A promise that resolves when the server confirms the transaction was successfully submitted.

pactda.on(eventName: string, callback: (data: any) => void) (Stretch Goal)

Purpose: Enable real-time updates.

Logic: Establishes a WebSocket connection to the PactDa Server and invokes the callback when a relevant event is received.

5. Key Principles for AI Assistance
Type Safety: All code, especially for the SDK and the NestJS server, must use TypeScript with strict types. Define interfaces for all API request/response bodies and SDK parameters.

Security: When generating server code, prioritize security. Use environment variables for secrets (like the Gas Tank private key), validate all inputs, and ensure the reportOutcome endpoint has strict authorization checks.

Abstraction: The code generated for the SDK should not contain any direct references to @mysten/sui.js or TransactionBlock. All on-chain interaction is proxied through the server.