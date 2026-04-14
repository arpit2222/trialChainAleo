import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";
import { PROGRAM_ID } from "@/constants/program";

export function useWalletRecords() {
  const { connected, address, requestRecords } = useWallet();
  const [credentials, setCredentials] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [sponsorKeys, setSponsorKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecords = useCallback(async () => {
    if (!connected || !requestRecords) return;
    setLoading(true);
    try {
      const all = await requestRecords(PROGRAM_ID);
      console.log("[WalletRecords] Raw records:", all);
      console.log("[WalletRecords] Number of records:", (all as any[])?.length);

      const creds: any[] = [];
      const rcpts: any[] = [];
      const keys: any[] = [];

      for (const record of all as any[]) {
        console.log("[WalletRecords] Record:", JSON.stringify(record, null, 2));
        console.log("[WalletRecords] All keys:", Object.keys(record));
        console.log("[WalletRecords] Record prototype keys:", Object.getOwnPropertyNames(record));
        if (record.data) console.log("[WalletRecords] Data keys:", Object.keys(record.data));
        console.log("[WalletRecords] Has nonce?", record.nonce, record._nonce, record.data?._nonce);
        console.log("[WalletRecords] Has ciphertext?", record.ciphertext, record.recordCiphertext);
        console.log("[WalletRecords] Has plaintext?", record.plaintext);
        const recordName = record.recordName || "";
        const recordStr = typeof record === "string" ? record : JSON.stringify(record);

        // Build a plaintext string from the data object if not already present
        if (!record.plaintext && record.data) {
          const dataEntries = Object.entries(record.data)
            .filter(([k]) => k !== "_version")
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ");
          record.plaintext = `${recordName} { ${dataEntries} }`;
        }

        console.log("[WalletRecords] recordName:", recordName, "plaintext:", record.plaintext);

        if (recordName === "PatientCredential" || recordStr.includes("credential_id")) {
          creds.push(record);
        } else if (recordName === "EnrollmentReceipt" || recordStr.includes("nullifier")) {
          rcpts.push(record);
        } else if (recordName === "SponsorKey" || recordStr.includes("salt")) {
          keys.push(record);
        }
      }

      console.log("[WalletRecords] Credentials:", creds.length, "Receipts:", rcpts.length, "Keys:", keys.length);

      setCredentials(creds);
      setReceipts(rcpts);
      setSponsorKeys(keys);
    } catch {
      // Silently ignore — wallet may not be fully connected yet
    } finally {
      setLoading(false);
    }
  }, [connected, address, requestRecords]);

  // Don't auto-fetch — only fetch when user clicks Refresh
  // This prevents the Leo Wallet "Share records" popup on every page load

  return {
    credentials,
    receipts,
    sponsorKeys,
    loading,
    refetch: fetchRecords,
  };
}
