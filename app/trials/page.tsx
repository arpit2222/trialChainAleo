"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";
import { useWalletRecords } from "@/hooks/useWalletRecords";
import { TrialCard } from "@/components/TrialCard";
import { EnrollModal } from "@/components/EnrollModal";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getTrialData, getEnrollmentCount } from "@/lib/api";
import { Search, FlaskConical } from "lucide-react";
import type { Trial, TrialStatus } from "@/types";

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
  const { connected, address } = useWallet();
  const { credentials, refetch: refetchRecords } = useWalletRecords();
  const [search, setSearch] = useState("");
  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [loadedTrials, setLoadedTrials] = useState<Trial[]>([]);

  const allTrials = [...loadedTrials, ...SEED_TRIALS];
  const filtered = allTrials.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  const credentialRecord = credentials.length > 0 ? credentials[0] : null;

  // Auto-load the user's registered trials on mount
  useEffect(() => {
    const loadMyTrials = async () => {
      const trialIds = [
        { id: "1975990926371624392613934817234498750441115264165644470795261778214522639715", txId: "at19wua7xkr3ky0df9zaz2j9dvu4gswd96gk93w8nwg8mcq0pzgqgzqhqkzme" },
        { id: "2584780927310332760886810506057148741907627745285309466315042444442406030880", txId: "at1tat94rrd86ue27927hx4vy6ej92a5fvu7lhh5klwqhwx2c0kdyqqc69wwa" }, // New trial from Leo Wallet
      ];

      // Load saved titles from localStorage
      const trialTitles = JSON.parse(localStorage.getItem('trialTitles') || '{}');

      const trials: Trial[] = [];
      for (const { id: trialId, txId } of trialIds) {
        try {
          const trialData = await getTrialData(trialId);
          if (trialData) {
            const enrollmentCount = await getEnrollmentCount(trialId);
            const savedTitle = trialTitles[trialId];
            const trial: Trial = {
              id: trialId,
              sponsorHash: trialData.sponsor_hash || "0",
              title: savedTitle || `Phase III Diabetes Study (ID: ${trialId.slice(0, 8)}...)`,
              protocolHash: trialData.protocol_hash || "0",
              minAge: parseInt(trialData.min_age || "18"),
              maxAge: parseInt(trialData.max_age || "65"),
              requiredConditionHash: trialData.required_condition_hash || "0",
              maxEnrollment: parseInt(trialData.max_enrollment || "100"),
              compensationUsdc: parseInt(trialData.compensation_usdc || "0") / 1_000_000,
              resultDeadlineBlock: parseInt(trialData.result_deadline_block || "0"),
              status: (parseInt(trialData.status || "0") as TrialStatus),
              enrollmentCount,
            };
            (trial as any).txId = txId; // Attach txId for explorer link
            trials.push(trial);
          }
        } catch {
          // Trial not yet registered or error
        }
      }
      setLoadedTrials(trials);
    };
    loadMyTrials();
  }, []);

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

      {/* On-chain trials section */}
      {loadedTrials.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            On-Chain Trials
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loadedTrials.map((trial) => (
              <TrialCard
                key={trial.id}
                trial={trial}
                disableLink
                isOnChain
                txId={(trial as any).txId}
                onClick={() => {
                  if (connected) {
                    setSelectedTrial(trial);
                    setEnrollOpen(true);
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Demo seed trials section */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-400">Demo Seed Trials</h2>
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
                  if (connected) {
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
      </div>

      {selectedTrial && (
        <EnrollModal
          trial={selectedTrial}
          credentialRecord={credentialRecord}
          open={enrollOpen}
          onOpenChange={setEnrollOpen}
          onSuccess={() => setSelectedTrial(null)}
          onLoadCredentials={refetchRecords}
        />
      )}
    </div>
  );
}
