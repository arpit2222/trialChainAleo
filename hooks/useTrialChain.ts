import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { Transaction, WalletAdapterNetwork } from "@demox-labs/aleo-wallet-adapter-base";
import { PROGRAM_ID } from "@/constants/program";
import { hashString, generateRandomField } from "@/lib/crypto";
import { getCurrentBlockHeight, fieldInput, u8Input, u32Input, u64Input } from "@/lib/aleo";
import type { RegisterTrialInput, IssueCredentialInput } from "@/types";

export function useTrialChain() {
  const { publicKey, requestTransaction, requestRecords } = useWallet();

  const registerTrial = async (params: RegisterTrialInput) => {
    if (!publicKey || !requestTransaction)
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

    const tx = Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.Testnet,
      PROGRAM_ID,
      "register_trial",
      inputs,
      150_000
    );

    const txId = await requestTransaction(tx);
    return { txId, resultCommitmentSalt };
  };

  const enrollPatient = async (
    credentialRecord: string,
    trialId: string
  ) => {
    if (!publicKey || !requestTransaction)
      throw new Error("Wallet not connected");

    const enrollmentSalt = generateRandomField();
    const inputs = [credentialRecord, fieldInput(trialId), fieldInput(enrollmentSalt)];

    const tx = Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.Testnet,
      PROGRAM_ID,
      "enroll_patient",
      inputs,
      200_000
    );

    return await requestTransaction(tx);
  };

  const issueCredential = async (params: IssueCredentialInput) => {
    if (!publicKey || !requestTransaction)
      throw new Error("Wallet not connected");

    const conditionHash = await hashString(params.conditionCode);
    const credentialId = generateRandomField();

    const inputs = [
      params.patientAddress,
      u8Input(params.age),
      fieldInput(conditionHash),
      u64Input(params.labValue),
      fieldInput(credentialId),
      u32Input(params.expiryBlocks),
    ];

    const tx = Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.Testnet,
      PROGRAM_ID,
      "issue_credential",
      inputs,
      100_000
    );

    return await requestTransaction(tx);
  };

  const commitResults = async (
    sponsorKeyRecord: string,
    trialId: string,
    resultHash: string,
    positiveCount: number,
    negativeCount: number
  ) => {
    if (!publicKey || !requestTransaction)
      throw new Error("Wallet not connected");

    const inputs = [
      sponsorKeyRecord,
      fieldInput(trialId),
      fieldInput(resultHash),
      u32Input(positiveCount),
      u32Input(negativeCount),
    ];

    const tx = Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.Testnet,
      PROGRAM_ID,
      "commit_results",
      inputs,
      150_000
    );

    return await requestTransaction(tx);
  };

  const claimCompensation = async (
    receiptRecord: string,
    usdcRecord: string
  ) => {
    if (!publicKey || !requestTransaction)
      throw new Error("Wallet not connected");

    const inputs = [receiptRecord, usdcRecord];

    const tx = Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.Testnet,
      PROGRAM_ID,
      "claim_compensation",
      inputs,
      150_000
    );

    return await requestTransaction(tx);
  };

  const verifyEnrollment = async (
    receiptRecord: string,
    trialId: string
  ) => {
    if (!publicKey || !requestTransaction)
      throw new Error("Wallet not connected");

    const inputs = [receiptRecord, fieldInput(trialId)];

    const tx = Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.Testnet,
      PROGRAM_ID,
      "verify_enrollment",
      inputs,
      100_000
    );

    return await requestTransaction(tx);
  };

  const getMyRecords = async (
    filterType?: string
  ): Promise<any[]> => {
    if (!publicKey || !requestRecords) return [];
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
    claimCompensation,
    verifyEnrollment,
    getMyRecords,
    isConnected: !!publicKey,
    walletAddress: publicKey,
  };
}
