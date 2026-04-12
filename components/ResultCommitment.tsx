"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EXPLORER_URL } from "@/constants/program";
import { CheckCircle2, Clock, ExternalLink, Hash } from "lucide-react";

interface ResultCommitmentProps {
  trialId: string;
  commitment?: string | null;
  revealedHash?: string | null;
  status: number;
}

export function ResultCommitment({
  trialId,
  commitment,
  revealedHash,
  status,
}: ResultCommitmentProps) {
  const hasResults = status === 2;

  return (
    <Card className="border-white/10 bg-white/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white flex items-center gap-2">
          <Hash className="h-4 w-4 text-blue-400" />
          Result Integrity
        </span>
        <Badge
          className={
            hasResults
              ? "bg-blue-500/20 text-blue-400"
              : "bg-zinc-500/20 text-zinc-400"
          }
        >
          {hasResults ? "Results Posted" : "Awaiting Results"}
        </Badge>
      </div>

      {commitment && (
        <div className="text-xs space-y-1">
          <p className="text-zinc-500">Pre-committed hash:</p>
          <p className="font-mono text-zinc-300 break-all">{commitment}</p>
        </div>
      )}

      {revealedHash && (
        <div className="text-xs space-y-1">
          <p className="text-zinc-500 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            Revealed result hash:
          </p>
          <p className="font-mono text-emerald-300 break-all">{revealedHash}</p>
        </div>
      )}

      {!commitment && !revealedHash && (
        <div className="text-xs text-zinc-500 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          No commitment data available yet.
        </div>
      )}

      <a
        href={`${EXPLORER_URL}/program/${trialId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
      >
        View on Explorer <ExternalLink className="h-3 w-3" />
      </a>
    </Card>
  );
}
