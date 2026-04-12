"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { useWalletRecords } from "@/hooks/useWalletRecords";
import { TrialCard } from "@/components/TrialCard";
import { EnrollModal } from "@/components/EnrollModal";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getLatestHeight } from "@/lib/api";
import { Search, FlaskConical } from "lucide-react";
import type { Trial } from "@/types";

// For MVP: hardcoded trial list — in production, fetched from on-chain mappings
const SEED_TRIALS: Trial[] = [
  {
    id: "100",
    title: "Phase III Diabetes Study — HbA1c Reduction",
    protocolHash: "0",
    sponsorHash: "0",
    minAge: 30,
    maxAge: 65,
    requiredConditionHash: "0",
    maxEnrollment: 500,
    compensationUsdc: 100,
    resultDeadlineBlock: 999999,
    status: 0,
    enrollmentCount: 47,
  },
  {
    id: "200",
    title: "Phase II Oncology — CAR-T Immunotherapy",
    protocolHash: "0",
    sponsorHash: "0",
    minAge: 18,
    maxAge: 70,
    requiredConditionHash: "0",
    maxEnrollment: 200,
    compensationUsdc: 250,
    resultDeadlineBlock: 999999,
    status: 0,
    enrollmentCount: 12,
  },
  {
    id: "300",
    title: "Phase I Cardiology — Novel Statin Variant",
    protocolHash: "0",
    sponsorHash: "0",
    minAge: 40,
    maxAge: 80,
    requiredConditionHash: "0",
    maxEnrollment: 100,
    compensationUsdc: 75,
    resultDeadlineBlock: 999999,
    status: 0,
    enrollmentCount: 89,
  },
];

export default function TrialsPage() {
  const { publicKey } = useWallet();
  const { credentials } = useWalletRecords();
  const [search, setSearch] = useState("");
  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null);
  const [enrollOpen, setEnrollOpen] = useState(false);

  const filtered = SEED_TRIALS.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  const credentialRecord = credentials.length > 0 ? credentials[0].plaintext : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-emerald-400" />
          Active Trials
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Browse recruiting trials. Eligibility is verified via ZK proof — your
          data never leaves your device.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search trials..."
          className="pl-9 bg-white/5 border-white/10"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="border-white/10 bg-white/5 p-8 text-center">
          <p className="text-zinc-500">No trials match your search.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((trial) => (
            <div
              key={trial.id}
              onClick={() => {
                if (publicKey) {
                  setSelectedTrial(trial);
                  setEnrollOpen(true);
                }
              }}
            >
              <TrialCard trial={trial} />
            </div>
          ))}
        </div>
      )}

      {selectedTrial && (
        <EnrollModal
          trial={selectedTrial}
          credentialRecord={credentialRecord}
          open={enrollOpen}
          onOpenChange={setEnrollOpen}
          onSuccess={() => setSelectedTrial(null)}
        />
      )}
    </div>
  );
}
