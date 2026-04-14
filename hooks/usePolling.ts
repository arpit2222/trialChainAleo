import { useState, useCallback, useRef } from "react";
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";
import type { TxState } from "@/types";

export function usePolling() {
  const { transactionStatus: walletTxStatus } = useWallet();
  const [txState, setTxState] = useState<TxState>({
    txId: null,
    onchainTxId: null,
    status: "idle",
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (txId: string) => {
      stopPolling();
      setTxState({ txId, onchainTxId: null, status: "pending" });

      intervalRef.current = setInterval(async () => {
        try {
          const result = await walletTxStatus(txId);
          const status = result?.status?.toLowerCase();

          console.log("[Polling] Transaction status:", status, "Result:", result);

          if (status === "accepted" || status === "finalized" || status === "completed" || status === "success") {
            setTxState({
              txId,
              onchainTxId: result?.transactionId || txId,
              status: "confirmed",
            });
            stopPolling();
          } else if (status === "rejected" || status === "failed" || status === "error") {
            setTxState({
              txId,
              onchainTxId: null,
              status: "rejected",
              error: result?.error || `Transaction ${status}`,
            });
            stopPolling();
          }
        } catch (err) {
          console.log("[Polling] Error checking status:", err);
          // Keep polling on network error
        }
      }, 3000);
    },
    [stopPolling, walletTxStatus]
  );

  const reset = useCallback(() => {
    stopPolling();
    setTxState({ txId: null, onchainTxId: null, status: "idle" });
  }, [stopPolling]);

  return { txState, startPolling, stopPolling, reset };
}
