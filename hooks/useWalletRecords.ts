import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { PROGRAM_ID } from "@/constants/program";

export function useWalletRecords() {
  const { publicKey, requestRecords } = useWallet();
  const [credentials, setCredentials] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [sponsorKeys, setSponsorKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecords = useCallback(async () => {
    if (!publicKey || !requestRecords) return;
    setLoading(true);
    try {
      const all = await requestRecords(PROGRAM_ID);
      const creds: any[] = [];
      const rcpts: any[] = [];
      const keys: any[] = [];

      for (const record of all) {
        const plaintext = record.plaintext || "";
        if (plaintext.includes("PatientCredential")) {
          creds.push(record);
        } else if (plaintext.includes("EnrollmentReceipt")) {
          rcpts.push(record);
        } else if (plaintext.includes("SponsorKey")) {
          keys.push(record);
        }
      }

      setCredentials(creds);
      setReceipts(rcpts);
      setSponsorKeys(keys);
    } catch (err) {
      console.error("Failed to fetch records:", err);
    } finally {
      setLoading(false);
    }
  }, [publicKey, requestRecords]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    credentials,
    receipts,
    sponsorKeys,
    loading,
    refetch: fetchRecords,
  };
}
