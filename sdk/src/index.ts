/**
 * PactDa SDK - Trust-based agreements without blockchain complexity
 * @version 0.0.1
 */

export { PactDa } from './pactda'
export type {
  PactDaConfig,
  User,
  Agreement,
  AgreementStatus,
  Party,
  EscrowConfig,
  ResolutionPolicy,
  OutcomeData,
  EventCallback,
  CreateAgreementParams,
  ReportOutcomeParams,
} from './types'

// Re-export for convenience
export { createPactDa } from './pactda' 