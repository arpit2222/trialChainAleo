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
      const creds: any[] = [];
      const rcpts: any[] = [];
      const keys: any[] = [];

      for (const record of all as any[]) {
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
    } catch {
      // Silently ignore — wallet may not be fully connected yet
    } finally {
      setLoading(false);
    }
  }, [connected, address, requestRecords]);

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
