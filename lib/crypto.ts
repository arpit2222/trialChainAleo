import { FIELD_MODULUS } from "@/constants/program";

export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  const bigInt = BigInt("0x" + hex) % FIELD_MODULUS;
  return bigInt.toString();
}

export async function hashAddress(address: string): Promise<string> {
  return hashString(address);
}

export function generateRandomField(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const hex = Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const bigInt = BigInt("0x" + hex) % FIELD_MODULUS;
  return bigInt.toString();
}

export function generateSalt(): string {
  return generateRandomField();
}

export async function hashBytes(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data.buffer as ArrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  const bigInt = BigInt("0x" + hex) % FIELD_MODULUS;
  return bigInt.toString();
}
