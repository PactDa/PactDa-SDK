# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Last Update 2025-07-14

## Repository Overview

PactDa SDK is a trust-based agreement platform that enables developers to integrate escrow and dispute resolution into their applications without blockchain complexity. The repository consists of four main components:

- **SDK** (`/sdk/`) - TypeScript SDK for client integration
- **Server** (`/server/`) - NestJS backend API with PostgreSQL
- **Contract** (`/contract/`) - Sui Move smart contracts for on-chain logic
- **Client** (`/client/`) - React-based documentation and dashboard portal (planned)

Golden rule: When unsure about implementation details or requirements, ALWAYS consult the developer rather than making assumptions.

## Project Memory & Context (`/memory-bank/`)

Before working on specific code, always refer to the files in the `/memory-bank/` directory. This folder contains the high-level "why" behind our project.

- **`projectbrief.md`**: Contains the one-sentence description and the overall goal of the project. Refer to this to understand the core mission.
- **Other documents in this folder**: Contain detailed specifications, architectural decisions, and the strategic vision for the product.

Use the context from these files to ensure that any code you help write aligns with our strategic goals, target audience, and architectural patterns.


---

## Non-negotiable golden rules

| #: | AI *may* do                                                            | AI *must NOT* do                                                                    |
|---|------------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| G-0 | Whenever unsure about something that's related to the project, ask the developer for clarification before making changes.    |  ❌ Write changes or use tools when you are not sure about something project specific, or if you don't have context for a particular feature/decision. |
| G-1 | Generate code **only inside** relevant source directories (e.g., `src/agents-api/agents_api/` for the main API, `src/cli/src/` for the CLI, `src/integrations-service/` for integration-specific code) or explicitly pointed files.    | ❌ Touch `tests/`, `SPEC.md`, or any `*_spec.py` / `*.ward` files (humans own tests & specs). |
| G-2 | Add/update **`AIDEV-NOTE:` anchor comments** near non-trivial edited code. | ❌ Delete or mangle existing `AIDEV-` comments.                                     |
| G-3 | Follow lint/style configs (`pyproject.toml`, `.ruff.toml`, `.pre-commit-config.yaml`). Use the project's configured linter, if available, instead of manually re-formatting code. | ❌ Re-format code to any other style.                                               |
| G-4 | For changes >300 LOC or >3 files, **ask for confirmation**.            | ❌ Refactor large modules without human guidance.                                     |
| G-5 | Stay within the current task context. Inform the dev if it'd be better to start afresh.                                  | ❌ Continue work from a prior prompt after "new task" – start a fresh session.      |

---


## Development Commands

### SDK Development (`/sdk/`)
```bash
cd sdk
npm run build              # Build SDK for production
npm run dev               # Build in watch mode for development
npm run test              # Run tests with Vitest
npm run test:ci           # Run tests in CI mode
npm run lint              # Run ESLint
npm run lint:fix          # Fix ESLint issues automatically
npm run type-check        # TypeScript type checking
npm run clean             # Clean dist directory
```

### Server Development (`/server/`)
```bash
cd server
# Docker-based development (recommended)
docker-compose up -d --build    # Start all services (NestJS + PostgreSQL + PgAdmin)
docker-compose down             # Stop all services
docker-compose logs nestjs      # View NestJS logs
docker-compose logs postgres    # View PostgreSQL logs

# Local development
npm run build             # Build application
npm run start:dev         # Start in development mode
npm run start:debug       # Start in debug mode
npm run test              # Run unit tests
npm run test:e2e          # Run end-to-end tests
npm run lint              # Run ESLint
```

### Contract Development (`/contract/`)
```bash
cd contract
sui move build            # Build Move contracts
sui move test             # Run Move tests
```

### Client Development (`/client/`) - Planned
```bash
cd client
npm run dev               # Start development server
npm run build             # Build for production
npm run preview           # Preview production build
npm run test              # Run component tests
npm run lint              # Run ESLint
npm run type-check        # TypeScript type checking
```

## Architecture Overview

### Core Trust-Based Agreement Flow
The system enables wager-based games and agreements through:

1. **Developer Onboarding** - API key generation via PactDa Portal
2. **Player Authentication** - Sui Enoki zkLogin integration
3. **Agreement Creation** - On-chain contracts with escrow protection
4. **Trusted Authority Resolution** - Designated authorities report outcomes
5. **Automatic Settlement** - Blockchain-enforced fund distribution

---

## SDK Architecture (`/sdk/`)

### Core Structure
- **Main Entry**: `sdk/src/index.ts` exports the PactDa class
- **Core Logic**: `sdk/src/pactda.ts` contains main SDK implementation
- **Type Definitions**: `sdk/src/types.ts` provides TypeScript interfaces
- **Dependencies**: Axios for HTTP, Socket.IO for WebSocket, Mysten Enoki for Sui integration

### Development Rules
- **Type Safety**: Always use TypeScript interfaces from `types.ts`
- **Error Handling**: Implement comprehensive error handling for all SDK methods
- **Event System**: Use Socket.IO for real-time events (agreement_created, agreement_completed, etc.)
- **Environment Configuration**: Support development, testnet, and production environments
- **Authentication**: Integrate with Sui Enoki zkLogin for user authentication
- **API Communication**: Use Axios for HTTP requests to the server

### Key Implementation Patterns
- **Class-based SDK**: Main PactDa class with initialization and method chaining
- **Event Emitters**: Use event listeners for real-time updates
- **Promise-based API**: All async operations return Promises
- **Configuration Object**: Accept config object with apiKey, environment, and optional URLs
- **Method Validation**: Validate inputs before API calls

### Testing Guidelines
- **Framework**: Use Vitest for testing
- **Coverage**: Test all public methods and error cases
- **Mocking**: Mock external dependencies (Axios, Socket.IO)
- **Integration**: Test actual API integration in separate test suite

---

## Server Architecture (`/server/`)

### NestJS Module Structure
- **Modular Architecture**: Separate modules for user, credit, payment, API keys, and permissions
- **Database**: PostgreSQL with TypeORM
- **Authentication**: API key-based with user management
- **Real-time**: WebSocket support for live updates

### Core Services
- **CreditService** (`server/src/credit/credit.service.ts`): Manages API credit transactions and balances
- **ApiKeyService** (`server/src/apikey/api-key.service.ts`): Handles API key generation, validation, and quota management
- **UserService** (`server/src/user/user.service.ts`): User management with credit balance tracking

### Development Rules
- **Entity-First Design**: Create TypeORM entities before services
- **Service Layer**: Business logic in services, not controllers
- **DTO Validation**: Use class-validator for request/response validation
- **Error Handling**: Implement custom exception filters
- **Database Migrations**: Use TypeORM migrations for schema changes
- **API Versioning**: Version APIs from the start (/v1/, /v2/)

### Database Guidelines
- **Relations**: Use proper TypeORM relations between entities
- **Indexes**: Add database indexes for frequently queried fields
- **Transactions**: Use database transactions for multi-step operations
- **Connection Pooling**: Configure proper connection pooling
- **Environment Variables**: Use ConfigService for all database configuration

### Authentication & Authorization
- **API Key Authentication**: Validate API keys for all protected endpoints
- **User Context**: Attach user information to requests after API key validation
- **Rate Limiting**: Implement rate limiting based on API key quotas
- **Credit System**: Deduct credits for API usage

### Docker Development
- **Primary Method**: Use `docker-compose up -d --build` for development
- **Hot Reload**: NestJS supports hot reload in development mode
- **Database Access**: Use PgAdmin at localhost:8080 for database management
- **Log Monitoring**: Use `docker-compose logs nestjs` for debugging

---

## Smart Contract Architecture (`/contract/`)

### Sui Move Structure
- **Core Module** (`pactda_core.move`): Generic agreement and escrow logic
- **Resolution Module** (`resolution_policies.move`): ProgrammaticResolver for trusted authority pattern
- **Admin Module** (`pactda_admin.move`): Administrative capabilities

### Development Rules
- **Move Best Practices**: Follow Sui Move coding conventions
- **Security First**: Implement proper access controls and validation
- **Gas Optimization**: Optimize for minimal gas usage
- **Error Handling**: Use proper error codes and messages
- **Testing**: Write comprehensive tests for all contract functions

### Key Patterns
- **Capability-based Security**: Use Sui's capability system for access control
- **Object-centric Design**: Design around Sui's object model
- **Event Emission**: Emit events for all state changes
- **Escrow Management**: Implement secure escrow holding and release mechanisms

### Contract Interaction
- **ProgrammaticResolver**: Use for automated outcome reporting
- **Escrow Objects**: Handle SUI coin escrow with proper validation
- **Agreement Lifecycle**: Track agreement states (draft, active, completed, disputed, cancelled)
- **Admin Functions**: Separate admin capabilities from user functions

### Testing Strategy
- **Unit Tests**: Test individual contract functions
- **Integration Tests**: Test contract interactions
- **Security Tests**: Test access controls and edge cases
- **Gas Tests**: Measure and optimize gas usage

---

## Client Portal Architecture (`/client/`) - Planned

### React Application Structure
The client will be a React-based web application providing:

**Documentation Portal**:
- Interactive API documentation with live examples
- SDK integration guides and tutorials
- Code examples for different programming languages
- Live API testing interface

**Dashboard Portal**:
- User authentication and profile management
- API key generation and management interface
- Credit balance tracking and transaction history
- Usage analytics and API call logs
- Billing and payment management

### Technical Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Routing**: React Router for SPA navigation
- **State Management**: React Query for API state management
- **Build Tool**: Vite for fast development and building
- **API Integration**: Axios client connecting to NestJS server

### Development Rules
- **Component-based Architecture**: Create reusable components
- **TypeScript**: Use strict TypeScript configuration
- **State Management**: Use React Query for server state, local state for UI
- **Styling**: Use Tailwind CSS with custom design system
- **API Integration**: Create service layer for API calls
- **Error Boundaries**: Implement proper error handling

### Planned Structure
```
/client/
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Main application pages
│   │   ├── docs/          # Documentation pages
│   │   └── dashboard/     # Dashboard pages
│   ├── services/          # API service layer
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript definitions
│   └── utils/             # Helper functions
├── public/                # Static assets
└── package.json          # Dependencies and scripts
```

### UI/UX Guidelines
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Code splitting and lazy loading
- **User Experience**: Progressive enhancement and graceful degradation

### Environment Configuration

#### Server Environment Variables (required)
```bash
POSTGRES_USER=admin
POSTGRES_PASSWORD=11223344
POSTGRES_DB=Pactda_DB
PGADMIN_DEFAULT_EMAIL=admin@pactda.com
PGADMIN_DEFAULT_PASSWORD=11223344
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=admin
DB_PASSWORD=11223344
DB_DATABASE=Pactda_DB
```

#### SDK Environment Options
- `development` - Local development server
- `testnet` - Sui testnet environment
- `production` - Mainnet environment

#### Client Environment Variables (planned)
```bash
VITE_API_BASE_URL=http://localhost:3000  # Server API URL
VITE_WS_URL=ws://localhost:3000          # WebSocket URL
VITE_ENVIRONMENT=development             # Environment mode
```

## Testing Strategy

### SDK Tests
- **Framework**: Vitest with TypeScript support
- **Location**: `sdk/src/test/`
- **Run**: `npm run test` (watch mode) or `npm run test:ci` (single run)

### Server Tests
- **Unit Tests**: Jest framework (`npm run test`)
- **E2E Tests**: Jest with Supertest (`npm run test:e2e`)
- **Coverage**: `npm run test:cov`

### Contract Tests
- **Framework**: Sui Move testing framework
- **Location**: `contract/tests/`
- **Files**: `test_pactda_core.move`, `test_pactda_admin.move`, `test_resolution_policies.move`

### Client Tests (planned)
- **Unit Tests**: Vitest with React Testing Library
- **Component Tests**: Testing component behavior and interactions
- **E2E Tests**: Playwright for full user journey testing

## API Integration Points

### Credit Management APIs
- `GET /credits/user/:userId` - Get user's credit transactions
- `POST /credits` - Create new credit transaction
- `GET /credits/history/:userId` - Get transaction history

### API Key Management APIs
- `GET /api-keys/user/:userId` - Get user's API keys
- `POST /api-keys` - Generate new API key
- `PUT /api-keys/:id/revoke` - Revoke API key
- `GET /api-keys/:id/usage` - Get API key usage stats

### User Management APIs
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update user profile
- `GET /users/:id/api-logs` - Get API usage logs

## AI Assistant Workflow: Step-by-Step Methodology

When responding to user instructions, the AI assistant (Claude, Cursor, GPT, etc.) should follow this process to ensure clarity, correctness, and maintainability:

1. **Consult Relevant Guidance**: When the user gives an instruction, consult the relevant instructions from `AGENTS.md` files (both root and directory-specific) for the request.
2. **Clarify Ambiguities**: Based on what you could gather, see if there's any need for clarifications. If so, ask the user targeted questions before proceeding.
3. **Break Down & Plan**: Break down the task at hand and chalk out a rough plan for carrying it out, referencing project conventions and best practices.
4. **Trivial Tasks**: If the plan/request is trivial, go ahead and get started immediately.
5. **Non-Trivial Tasks**: Otherwise, present the plan to the user for review and iterate based on their feedback.
6. **Track Progress**: Use a to-do list (internally, or optionally in a `TODOS.md` file) to keep track of your progress on multi-step or complex tasks.
7. **If Stuck, Re-plan**: If you get stuck or blocked, return to step 3 to re-evaluate and adjust your plan.
8. **Update Documentation**: Once the user's request is fulfilled, update relevant anchor comments (`AIDEV-NOTE`, etc.) and `AGENTS.md` files in the files and directories you touched.
9. **User Review**: After completing the task, ask the user to review what you've done, and repeat the process as needed.
10. **Session Boundaries**: If the user's request isn't directly related to the current context and can be safely started in a fresh session, suggest starting from scratch to avoid context confusion.

## Service Access (Development)
- **API Server**: http://localhost:3000
- **PgAdmin**: http://localhost:8080 (database management)
- **PostgreSQL**: localhost:5432
- **Client Portal** (planned): http://localhost:5173

## Key Integration Points

- **Sui Enoki**: Used for zkLogin user authentication
- **Socket.IO**: Real-time event communication between SDK and server
- **TypeORM**: Database ORM with entity-based architecture
- **Vite**: Modern build tool for SDK bundling with TypeScript support
- **React Query**: For efficient API state management in client
- **Tailwind CSS**: For consistent and responsive UI design


---

## Anchor comments

Add specially formatted comments throughout the codebase, where appropriate, for yourself as inline knowledge that can be easily `grep`ped for. 

### Guidelines:

- Use `AIDEV-NOTE:`, `AIDEV-TODO:`, or `AIDEV-QUESTION:` (all-caps prefix) for comments aimed at AI and developers.
- Keep them concise (≤ 120 chars).
- **Important:** Before scanning files, always first try to **locate existing anchors** `AIDEV-*` in relevant subdirectories.
- **Update relevant anchors** when modifying associated code.
- **Do not remove `AIDEV-NOTE`s** without explicit human instruction.
- Make sure to add relevant anchor comments, whenever a file or piece of code is:
  * too long, or
  * too complex, or
  * very important, or
  * confusing, or
  * could have a bug unrelated to the task you are currently working on.

Example:
```python
# AIDEV-NOTE: perf-hot-path; avoid extra allocations (see ADR-24)
async def render_feed(...):
    ...
```

---

## Commit discipline

*   **Granular commits**: One logical change per commit.
*   **Tag AI-generated commits**: e.g., `feat: optimise feed query [AI]`.
*   **Clear commit messages**: Explain the *why*; link to issues/ADRs if architectural.
*   **Use `git worktree`** for parallel/long-running AI branches (e.g., `git worktree add ../wip-foo -b wip-foo`).
*   **Review AI-generated code**: Never merge code you don't understand.

---

##  Directory-Specific AGENTS.md Files

*   **Always check for `CLAUDE.md` files in specific directories** before working on code within them. These files contain targeted context.
*   If a directory's `CLAUDE.md` is outdated or incorrect, **update it**.
*   If you make significant changes to a directory's structure, patterns, or critical implementation details, **document these in its `CLAUDE.md`**.
*   If a directory lacks a `CLAUDE.md` but contains complex logic or patterns worth documenting for AI/humans, **suggest creating one**.