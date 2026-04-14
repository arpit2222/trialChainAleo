// ============================================================
// Types aligned with Leo program records & structs
// ============================================================

// Matches Leo TrialData struct (public on-chain)
export interface TrialData {
  sponsor_hash: string;
  title_hash: string;
  protocol_hash: string;
  min_age: number;
  max_age: number;
  required_condition_hash: string;
  max_enrollment: number;
  compensation_usdc: number; // in micros (6 decimals)
  result_deadline_block: number;
  status: TrialStatus;
}

export type TrialStatus = 0 | 1 | 2 | 3;
// 0 = recruiting, 1 = closed, 2 = results_posted, 3 = cancelled

export const TRIAL_STATUS_LABELS: Record<TrialStatus, string> = {
  0: "Recruiting",
  1: "Closed",
  2: "Results Posted",
  3: "Cancelled",
};

// Frontend-enriched trial for display
export interface Trial {
  id: string; // field value
  title: string; // resolved from title_hash or user input
  protocolHash: string;
  sponsorHash: string;
  minAge: number;
  maxAge: number;
  requiredConditionHash: string;
  maxEnrollment: number;
  compensationUsdc: number; // in whole dollars
  resultDeadlineBlock: number;
  status: TrialStatus;
  enrollmentCount: number;
}

// Matches Leo PatientCredential record (private)
export interface PatientCredential {
  owner: string;
  issuer_hash: string;
  age: number;
  condition_hash: string;
  lab_value: number;
  credential_id: string;
  _nonce: string;
  _raw?: string;
}

// Matches Leo EnrollmentReceipt record (private)
export interface EnrollmentReceipt {
  owner: string;
  trial_id: string;
  nullifier: string;
  compensation_usdc: number;
  _nonce: string;
  _raw?: string;
}

// Matches Leo SponsorKey record (private)
export interface SponsorKey {
  owner: string;
  trial_id: string;
  salt: string;
  _nonce: string;
  _raw?: string;
}

// Form input types for sponsor
export interface RegisterTrialInput {
  trialId: string;
  title: string;
  protocolHash: string;
  minAge: number;
  maxAge: number;
  conditionCode: string; // ICD-10 code — hashed client-side
  maxEnrollment: number;
  compensationUsdc: number; // in whole dollars
  resultDeadlineBlocks: number;
  preCommittedResultHash: string;
}

// Form input for issuing credential
export interface IssueCredentialInput {
  patientAddress: string;
  age: number;
  conditionCode: string; // ICD-10 — hashed client-side
  labValue: number;
}

// Transaction polling state
export interface TxState {
  txId: string | null;
  onchainTxId?: string | null;
  status: "idle" | "pending" | "confirmed" | "rejected";
  error?: string;
}
