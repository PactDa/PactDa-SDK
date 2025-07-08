PactDa SDK: Specification & Checkpoints (MVP)
Version: 1.0 (English)
Goal: To develop the PactDa-Lite SDK (@pactda/sdk-lite), an easy-to-use TypeScript package for the "Pioneer Developer Event". The primary design principle is maximum abstraction, providing developers with a simple interface to integrate PactDa's trust features without needing deep blockchain knowledge.

1. Core Concept & Architecture
The SDK acts as the primary toolkit for developers. It will handle two main responsibilities:

Onboarding: Providing "Onboarding-as-a-Service" by integrating Sui Enoki to handle the zkLogin flow seamlessly.

Agreement Management: Communicating with the PactDa Server (via a developer's API key) to trigger gas-sponsored, on-chain actions like creating and resolving agreements.

2. MVP Scope
In Scope:
Initialization: Configure the SDK with a developer's API key.

User Connection: A single function to onboard users via the Sui Enoki zkLogin flow.

Core Functions: Simple, high-level functions to createAgreement and reportOutcome.

Real-time Updates (Stretch Goal): A listener for real-time events pushed from the server.

Documentation: Clear JSDoc comments and a tutorial for the primary game use case.

NPM Publishing: The package must be published to npm for easy access.

Out of Scope:
PactDa-Pro SDK: No granular, low-level functions will be exposed in this version.

Direct Smart Contract Calls: The SDK will not require the developer to construct TransactionBlocks. All on-chain interactions are proxied through the PactDa Server.

Complex State Management: The SDK will be lightweight and will not manage complex application state for the developer.

3. Core Functions & Logic
pactda.init({ apiKey: '...' }): Authenticates the developer's application for using the PactDa Protocol's managed services.

pactda.connectUser(): Provides "Onboarding-as-a-Service" by triggering the Sui Enoki managed UI flow for zkLogin and returning the user's Sui address.

pactda.createAgreement({ ... }): A single function that takes a simple JavaScript object to define an agreement (parties, escrow rules, resolution policy) and calls the PactDa Server to deploy it on-chain.

pactda.reportOutcome({ ... }): A secure function for the designated "judge" to report the final result of an agreement via the PactDa Server.

pactda.on(eventName, callback): (Stretch Goal) Subscribes to a WebSocket connection from the PactDa Server to listen for real-time updates.

4. Development Checkpoints
This is a detailed task list for the SDK development team.

Checkpoint 1: Project Setup & Publishing

[ ] Initialize a new TypeScript project.

[ ] Configure a bundler (like Vite or Rollup) in "library mode" to create optimized builds for both ESM and CJS formats.

[ ] Set up the package.json file with the correct name (@pactda/sdk-lite), version, and scripts.

[ ] Publish an initial v0.0.1 to npm to ensure the publishing process works.

Checkpoint 2: Initialization & User Onboarding

[ ] Implement the init({ apiKey: '...' }) function to store the API key for future server requests.

[ ] Integrate the Sui Enoki SDK.

[ ] Develop the connectUser() function to correctly trigger the Enoki UI flow and successfully return a Sui address.

[ ] Write clear documentation and examples for these two functions.

Checkpoint 3: Core Agreement Creation Logic

[ ] Define the TypeScript interfaces for the parameters of createAgreement (e.g., CreateAgreementParams).

[ ] Implement the createAgreement function to make a secure, authenticated POST request to the PactDa Server's /api/v1/agreements/create endpoint.

[ ] Ensure the function handles the server's response correctly, including the multi-step funding flow prompts for each party.

[ ] Write unit tests to mock the API call and check that the function behaves as expected.

Checkpoint 4: Outcome Reporting Logic

[ ] Define the TypeScript interfaces for the reportOutcome function's parameters.

[ ] Implement the reportOutcome function to make a secure, authenticated POST request to the PactDa Server's /api/v1/agreements/resolve endpoint.

[ ] Write unit tests for this function.

Checkpoint 5: Real-time Event Handling (Stretch Goal)

[ ] Research and choose a lightweight WebSocket client library (like socket.io-client).

[ ] Implement the on(eventName, callback) function to manage subscriptions to the PactDa Server's WebSocket service.

[ ] Implement connection and reconnection logic.

Checkpoint 6: Final Documentation & Publishing

[ ] Ensure all public functions have clear JSDoc comments.

[ ] Create a comprehensive README file with a Quickstart guide and examples for the target use case (e.g., wager-based game).

[ ] Build the final version of the SDK.

[ ] Publish the official v0.1.0 (or similar) to npm.

Once all these checkpoints are complete, the SDK will be ready for the Pioneer Developer Event.