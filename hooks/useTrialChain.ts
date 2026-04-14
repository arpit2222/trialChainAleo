import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";
import { useCallback } from "react";
import { PROGRAM_ID } from "@/constants/program";
import { hashString, generateRandomField } from "@/lib/crypto";
import { getCurrentBlockHeight, fieldInput, u8Input, u32Input, u64Input } from "@/lib/aleo";
import type { RegisterTrialInput, IssueCredentialInput } from "@/types";

// Helper to save transaction to localStorage history
const saveTransaction = (
  txId: string,
  type: "register_trial" | "enroll_patient" | "issue_credential" | "commit_results" | "verify_enrollment",
  status: "pending" | "confirmed" | "rejected" = "pending",
  extra?: { trialId?: string; trialTitle?: string }
) => {
  const stored = JSON.parse(localStorage.getItem('trialChainTransactions') || '[]');
  stored.push({
    id: txId,
    type,
    status,
    timestamp: Date.now(),
    ...extra,
  });
  localStorage.setItem('trialChainTransactions', JSON.stringify(stored));
};

export function useTrialChain() {
  const { connected, address, executeTransaction, requestRecords } = useWallet();

  const registerTrial = async (params: RegisterTrialInput) => {
    if (!connected || !executeTransaction)
      throw new Error("Wallet not connected");

    const conditionHash = await hashString(params.conditionCode);
    const titleHash = await hashString(params.title);
    const protocolHash = await hashString(params.protocolHash);
    const resultCommitmentSalt = generateRandomField();
    const compensationMicros = BigInt(params.compensationUsdc) * 1_000_000n;
    const currentBlock = await getCurrentBlockHeight();
    const deadlineBlock = currentBlock + params.resultDeadlineBlocks;

    const inputs = [
      fieldInput(params.trialId),
      fieldInput(titleHash),
      fieldInput(protocolHash),
      u8Input(params.minAge),
      u8Input(params.maxAge),
      fieldInput(conditionHash),
      u32Input(params.maxEnrollment),
      u64Input(compensationMicros),
      u32Input(deadlineBlock),
      fieldInput(resultCommitmentSalt),
      fieldInput(params.preCommittedResultHash),
    ];

    console.log("[TrialChain] register_trial inputs:", inputs);

    let tx;
    try {
      tx = await executeTransaction({
        program: PROGRAM_ID,
        function: "register_trial",
        inputs,
        fee: 3_000_000,
      });
    } catch (execErr: any) {
      console.error("[TrialChain] executeTransaction error:", execErr);
      console.error("[TrialChain] Error name:", execErr?.name);
      console.error("[TrialChain] Error message:", execErr?.message);
      console.error("[TrialChain] Full error object:", JSON.stringify(execErr, null, 2));
      throw new Error(`Wallet execution failed: ${execErr?.message || 'Unknown error'}`);
    }

    console.log("[TrialChain] register_trial response:", tx);

    if (!tx?.transactionId) {
      throw new Error("Wallet did not return a transaction ID. Check wallet for errors.");
    }

    // Save to transaction history
    saveTransaction(tx.transactionId, "register_trial", "pending", {
      trialId: params.trialId,
      trialTitle: params.title,
    });

    return { txId: tx.transactionId, resultCommitmentSalt };
  };

  const enrollPatient = async (
    credentialRecord: string,
    trialId: string,
    expectedMinAge: number,
    expectedMaxAge: number,
    expectedConditionHash: string,
    expectedCompensation: bigint
  ) => {
    if (!connected || !executeTransaction)
      throw new Error("Wallet not connected");

    const inputs = [
      credentialRecord,
      fieldInput(trialId),
      u8Input(expectedMinAge),
      u8Input(expectedMaxAge),
      fieldInput(expectedConditionHash),
      u64Input(expectedCompensation),
    ];

    const tx = await executeTransaction({
      program: PROGRAM_ID,
      function: "enroll_patient",
      inputs,
      fee: 3_000_000,
    });

    const txId = tx?.transactionId || "";
    if (txId) {
      saveTransaction(txId, "enroll_patient", "pending", { trialId });
    }

    return txId;
  };

  const issueCredential = async (params: IssueCredentialInput) => {
    if (!connected || !executeTransaction)
      throw new Error("Wallet not connected");

    const conditionHash = await hashString(params.conditionCode);
    const credentialId = generateRandomField();

    const inputs = [
      params.patientAddress,
      u8Input(params.age),
      fieldInput(conditionHash),
      u64Input(params.labValue),
      fieldInput(credentialId),
    ];

    const tx = await executeTransaction({
      program: PROGRAM_ID,
      function: "issue_credential",
      inputs,
      fee: 500_000,
    });

    return tx?.transactionId || "";
  };

  const commitResults = async (
    sponsorKeyRecord: string,
    trialId: string,
    resultHash: string
  ) => {
    if (!connected || !executeTransaction)
      throw new Error("Wallet not connected");

    const inputs = [
      sponsorKeyRecord,
      fieldInput(trialId),
      fieldInput(resultHash),
    ];

    const tx = await executeTransaction({
      program: PROGRAM_ID,
      function: "commit_results",
      inputs,
      fee: 3_000_000,
    });

    return tx?.transactionId || "";
  };

  const verifyEnrollment = async (
    receiptRecord: string,
    trialId: string
  ) => {
    if (!connected || !executeTransaction)
      throw new Error("Wallet not connected");

    const inputs = [receiptRecord, fieldInput(trialId)];

    const tx = await executeTransaction({
      program: PROGRAM_ID,
      function: "verify_enrollment",
      inputs,
      fee: 500_000,
    });

    return tx?.transactionId || "";
  };

  const getMyRecords = async (
    filterType?: string
  ): Promise<any[]> => {
    if (!connected || !requestRecords) return [];
    try {
      const records = await requestRecords(PROGRAM_ID);
      if (!filterType) return records;
      return records.filter((r: any) =>
        r.plaintext?.includes(filterType) ||
        r.data?.type === filterType
      );
    } catch {
      return [];
    }
  };

  return {
    registerTrial,
    enrollPatient,
    issueCredential,
    commitResults,
    verifyEnrollment,
    getMyRecords,
    isConnected: connected,
    walletAddress: address,
  };
}
