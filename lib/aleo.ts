import { Transaction, WalletAdapterNetwork } from "@demox-labs/aleo-wallet-adapter-base";
import { PROGRAM_ID } from "@/constants/program";

export function buildTransaction(
  publicKey: string,
  functionName: string,
  inputs: string[],
  fee: number = 150_000
): Transaction {
  return Transaction.createTransaction(
    publicKey,
    WalletAdapterNetwork.Testnet,
    PROGRAM_ID,
    functionName,
    inputs,
    fee
  );
}

export async function getCurrentBlockHeight(): Promise<number> {
  const res = await fetch(
    "https://api.testnet.provable.com/v0/testnet/latest/height"
  );
  if (!res.ok) throw new Error("Failed to fetch block height");
  const height = await res.json();
  return Number(height);
}

export function formatAleoAddress(address: string, chars: number = 6): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function fieldInput(value: string): string {
  return `${value}field`;
}

export function u8Input(value: number): string {
  return `${value}u8`;
}

export function u32Input(value: number): string {
  return `${value}u32`;
}

export function u64Input(value: bigint | number): string {
  return `${BigInt(value)}u64`;
}
