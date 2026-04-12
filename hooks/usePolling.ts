import { useState, useCallback, useRef } from "react";
import { getTransactionStatus } from "@/lib/api";
import type { TxState } from "@/types";

export function usePolling() {
  const [txState, setTxState] = useState<TxState>({
    txId: null,
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
      setTxState({ txId, status: "pending" });

      intervalRef.current = setInterval(async () => {
        try {
          const result = await getTransactionStatus(txId);
          if (result.status === "confirmed") {
            setTxState({ txId, status: "confirmed" });
            stopPolling();
          } else if (result.status === "rejected") {
            setTxState({ txId, status: "rejected", error: result.error });
            stopPolling();
          }
        } catch {
          // Keep polling on network error
        }
      }, 5000);
    },
    [stopPolling]
  );

  const reset = useCallback(() => {
    stopPolling();
    setTxState({ txId: null, status: "idle" });
  }, [stopPolling]);

  return { txState, startPolling, stopPolling, reset };
}
