"use client";

import { useState } from "react";
import {
  getTrialData,
  getEnrollmentCount,
  getResultCommitment,
  getRevealedResult,
  isNullifierUsed,
} from "@/lib/api";
import { ResultCommitment } from "@/components/ResultCommitment";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TRIAL_STATUS_LABELS, type TrialStatus } from "@/types";
import { toast } from "sonner";
import {
  Search,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function VerifyPage() {
  // Trial verification
  const [trialId, setTrialId] = useState("");
  const [trialLoading, setTrialLoading] = useState(false);
  const [trialResult, setTrialResult] = useState<any>(null);

  // Nullifier verification
  const [nullifier, setNullifier] = useState("");
  const [nullifierLoading, setNullifierLoading] = useState(false);
  const [nullifierResult, setNullifierResult] = useState<boolean | null>(null);

  const handleTrialVerify = async () => {
    if (!trialId) return;
    setTrialLoading(true);
    setTrialResult(null);
    try {
      const [data, count, commitment, revealed] = await Promise.all([
        getTrialData(trialId),
        getEnrollmentCount(trialId),
        getResultCommitment(trialId),
        getRevealedResult(trialId),
      ]);

      if (!data) {
        toast.error("Trial not found on-chain.");
        setTrialResult(null);
      } else {
        setTrialResult({ data, count, commitment, revealed });
      }
    } catch {
      toast.error("Failed to query Aleo network.");
    } finally {
      setTrialLoading(false);
    }
  };

  const handleNullifierVerify = async () => {
    if (!nullifier) return;
    setNullifierLoading(true);
    setNullifierResult(null);
    try {
      const used = await isNullifierUsed(nullifier);
      setNullifierResult(used);
    } catch {
      toast.error("Failed to verify nullifier.");
    } finally {
      setNullifierLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          Public Verification
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          No wallet needed. Anyone can verify trial integrity and enrollment
          proofs on the Aleo blockchain.
        </p>
      </div>

      <Tabs defaultValue="trial">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="trial">Verify Trial</TabsTrigger>
          <TabsTrigger value="nullifier">Check Enrollment</TabsTrigger>
        </TabsList>

        <TabsContent value="trial" className="mt-4 space-y-4">
          <Card className="border-white/10 bg-white/5 p-5 space-y-4">
            <div className="space-y-2">
              <Label>Trial ID</Label>
              <div className="flex gap-2">
                <Input
                  value={trialId}
                  onChange={(e) => setTrialId(e.target.value)}
                  placeholder="Enter trial field ID"
                  className="bg-white/5 border-white/10"
                />
                <Button
                  onClick={handleTrialVerify}
                  disabled={trialLoading || !trialId}
                >
                  {trialLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {trialResult && (
            <div className="space-y-4">
              <Card className="border-white/10 bg-white/5 p-4 space-y-2 text-sm">
                <p className="text-zinc-400">
                  <span className="text-zinc-500">Status:</span>{" "}
                  {TRIAL_STATUS_LABELS[
                    (Number(
                      trialResult.data.status?.replace("u8", "")
                    ) || 0) as TrialStatus
                  ] ?? "Unknown"}
                </p>
                <p className="text-zinc-400">
                  <span className="text-zinc-500">Enrollment:</span>{" "}
                  {trialResult.count} /{" "}
                  {trialResult.data.max_enrollment?.replace("u32", "") ?? "?"}
                </p>
                <p className="text-zinc-400">
                  <span className="text-zinc-500">Age Range:</span>{" "}
                  {trialResult.data.min_age?.replace("u8", "")}–
                  {trialResult.data.max_age?.replace("u8", "")}
                </p>
                <p className="text-zinc-400">
                  <span className="text-zinc-500">Compensation:</span> $
                  {(
                    Number(
                      trialResult.data.compensation_usdc?.replace("u64", "")
                    ) / 1_000_000
                  ).toFixed(2)}{" "}
                  USDCx
                </p>
              </Card>

              <ResultCommitment
                trialId={trialId}
                commitment={trialResult.commitment}
                revealedHash={trialResult.revealed}
                status={Number(
                  trialResult.data.status?.replace("u8", "")
                ) || 0}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="nullifier" className="mt-4 space-y-4">
          <Card className="border-white/10 bg-white/5 p-5 space-y-4">
            <div className="space-y-2">
              <Label>Enrollment Nullifier</Label>
              <div className="flex gap-2">
                <Input
                  value={nullifier}
                  onChange={(e) => setNullifier(e.target.value)}
                  placeholder="Enter nullifier field value"
                  className="bg-white/5 border-white/10"
                />
                <Button
                  onClick={handleNullifierVerify}
                  disabled={nullifierLoading || !nullifier}
                >
                  {nullifierLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-zinc-500">
                Patients can share their nullifier hash to prove enrollment
                without revealing identity.
              </p>
            </div>
          </Card>

          {nullifierResult !== null && (
            <Card className="border-white/10 bg-white/5 p-4">
              {nullifierResult ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  This nullifier is registered on-chain — enrollment confirmed.
                </div>
              ) : (
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <XCircle className="h-4 w-4" />
                  Nullifier not found on-chain.
                </div>
              )}
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
