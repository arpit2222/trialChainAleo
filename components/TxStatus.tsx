"use client";

import { EXPLORER_URL } from "@/constants/program";
import type { TxState } from "@/types";
import { Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";

export function TxStatus({ txState }: { txState: TxState }) {
  if (txState.status === "idle" || !txState.txId) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm space-y-2">
      {txState.status === "pending" && (
        <div className="flex items-center gap-2 text-amber-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Transaction pending...
        </div>
      )}
      {txState.status === "confirmed" && (
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          Transaction confirmed!
        </div>
      )}
      {txState.status === "rejected" && (
        <div className="flex items-center gap-2 text-red-400">
          <XCircle className="h-4 w-4" />
          {txState.error || "Transaction rejected."}
        </div>
      )}
      <a
        href={`${EXPLORER_URL}/transaction/${txState.txId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
      >
        {txState.txId.slice(0, 16)}... <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
