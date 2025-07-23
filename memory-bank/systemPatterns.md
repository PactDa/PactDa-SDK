PactDa System Patterns & Architecture
High-Level Architecture
PactDa is built on a modular, four-layer architecture designed for scalability and separation of concerns:

Smart Contracts (The Trust Layer): The on-chain source of truth, built on Sui with Move. It handles the immutable logic for agreements, escrow, and resolution. It is designed with a "Pluggable Policy" pattern, where the core agreement contract delegates resolution logic to separate, specialized resolver modules.

Server (The Protocol Gateway): A centralized backend that acts as a secure gateway to the protocol. It manages developer access, provides convenience services, and abstracts away blockchain complexities.

SDK (The Developer's Toolkit): The primary interface for developers. It's an abstraction layer that simplifies interaction with both the Server and the Smart Contracts.

Client (The Developer Portal): The public-facing website for developer onboarding, documentation, and account management.

Key Design Patterns
Trust-as-a-Service: The core business model. We provide the foundational trust logic (agreements, escrow, resolution) so that other applications don't have to build it themselves.

API Credit Abstraction: To create a simple, gas-less experience for end-users, we abstract away the concept of gas fees. Developers purchase "API Credits" via a subscription, and each sponsored transaction consumes a predictable number of credits.

Gas Sponsorship ("Gas Tank"): The server maintains a secure Sui wallet to pay for the gas fees of transactions initiated via the PactDa-Lite SDK, funded by the API Credit system.

Onboarding-as-a-Service: The SDK provides a simple, one-function call (connectUser) that leverages Sui Enoki to handle the entire complex zkLogin flow, making user onboarding trivial for integrating developers.

Modular Resolvers: The smart contract architecture separates the agreement from the resolution method, allowing different "Resolution Policies" (e.g., Programmatic, VCNFT Vote) to be plugged in as needed.