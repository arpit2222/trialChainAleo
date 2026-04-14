"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { EXPLORER_URL } from "@/constants/program";
import { ExternalLink, History, CheckCircle2, Clock, XCircle } from "lucide-react";

interface TxRecord {
  id: string;
  type: "register_trial" | "enroll_patient" | "issue_credential" | "commit_results" | "verify_enrollment";
  status: "pending" | "confirmed" | "rejected";
  timestamp: number;
  trialId?: string;
  trialTitle?: string;
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<TxRecord[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('trialChainTransactions') || '[]');

    // Seed existing on-chain transactions if not already present
    const existingTxs: TxRecord[] = [
      {
        id: "at19wua7xkr3ky0df9zaz2j9dvu4gswd96gk93w8nwg8mcq0pzgqgzqhqkzme",
        type: "register_trial",
        status: "confirmed",
        timestamp: Date.now() - 86400000, // 1 day ago
        trialId: "1975990926371624392613934817234498750441115264165644470795261778214522639715",
        trialTitle: "Phase III Diabetes Study (CLI)",
      },
      {
        id: "at1tat94rrd86ue27927hx4vy6ej92a5fvu7lhh5klwqhwx2c0kdyqqc69wwa",
        type: "register_trial",
        status: "confirmed",
        timestamp: Date.now() - 3600000, // 1 hour ago
        trialId: "2584780927310332760886810506057148741907627745285309466315042444442406030880",
        trialTitle: "Phase III Diabetes Study (Leo Wallet)",
      },
    ];

    // Add existing txs if not already in storage
    const storedIds = new Set(stored.map((t: TxRecord) => t.id));
    const newTxs = existingTxs.filter((t) => !storedIds.has(t.id));
    const allTxs = [...newTxs, ...stored];

    setTransactions(allTxs.sort((a: TxRecord, b: TxRecord) => b.timestamp - a.timestamp));
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Clock className="h-5 w-5 text-amber-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      register_trial: "Register Trial",
      enroll_patient: "Enroll Patient",
      issue_credential: "Issue Credential",
      commit_results: "Commit Results",
      verify_enrollment: "Verify Enrollment",
    };
    return labels[type] || type;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <History className="h-6 w-6 text-emerald-400" />
          Transaction History
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          View all your on-chain transactions and their status.
        </p>
      </div>

      {transactions.length === 0 ? (
        <Card className="border-white/10 bg-white/5 p-8 text-center">
          <p className="text-zinc-500">No transactions yet. Submit a trial registration or enrollment to see it here.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <Card key={tx.id} className="border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {getStatusIcon(tx.status)}
                  <div>
                    <p className="text-sm font-medium text-white">
                      {getTypeLabel(tx.type)}
                    </p>
                    {tx.trialTitle && (
                      <p className="text-xs text-zinc-400">{tx.trialTitle}</p>
                    )}
                    <p className="text-xs text-zinc-500 mt-1">
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <a
                  href={`${EXPLORER_URL}/transactions?q=${tx.id}&t=transactions-table`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 shrink-0"
                >
                  Explorer <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
