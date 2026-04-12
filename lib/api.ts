import { API_URL, PROGRAM_ID } from "@/constants/program";

const BASE = `${API_URL}/testnet`;

export async function getMappingValue(
  mappingName: string,
  key: string
): Promise<string | null> {
  const res = await fetch(
    `${BASE}/program/${PROGRAM_ID}/mapping/${mappingName}/${key}`
  );
  if (!res.ok) return null;
  const text = await res.text();
  return text.replace(/"/g, "").trim();
}

export async function getEnrollmentCount(trialId: string): Promise<number> {
  const val = await getMappingValue("enrollment_counts", `${trialId}field`);
  if (!val) return 0;
  return parseInt(val.replace("u32", ""), 10);
}

export async function getTrialData(
  trialId: string
): Promise<Record<string, string> | null> {
  const val = await getMappingValue("trial_registry", `${trialId}field`);
  if (!val) return null;
  try {
    return parseAleoStruct(val);
  } catch {
    return null;
  }
}

export async function getResultCommitment(
  trialId: string
): Promise<string | null> {
  return getMappingValue("result_commitments", `${trialId}field`);
}

export async function getRevealedResult(
  trialId: string
): Promise<string | null> {
  return getMappingValue("revealed_results", `${trialId}field`);
}

export async function isNullifierUsed(nullifier: string): Promise<boolean> {
  const val = await getMappingValue("used_nullifiers", `${nullifier}field`);
  return val === "true";
}

export async function getTransactionStatus(
  txId: string
): Promise<{ status: string; error?: string }> {
  const res = await fetch(`${BASE}/transaction/${txId}`);
  if (!res.ok) {
    return { status: "pending" };
  }
  const data = await res.json();
  if (data.execution) {
    return { status: "confirmed" };
  }
  return { status: "rejected", error: "Transaction was rejected" };
}

export async function getLatestHeight(): Promise<number> {
  const res = await fetch(`${BASE}/latest/height`);
  if (!res.ok) throw new Error("Failed to fetch height");
  return Number(await res.json());
}

// Parse Aleo struct string like "{ field1: value1, field2: value2 }"
function parseAleoStruct(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  const inner = raw.replace(/^\{/, "").replace(/\}$/, "").trim();
  const pairs = inner.split(",").map((s) => s.trim());
  for (const pair of pairs) {
    const colonIdx = pair.indexOf(":");
    if (colonIdx === -1) continue;
    const key = pair.slice(0, colonIdx).trim();
    const value = pair.slice(colonIdx + 1).trim();
    result[key] = value;
  }
  return result;
}
