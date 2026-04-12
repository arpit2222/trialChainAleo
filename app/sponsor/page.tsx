"use client";

import { useState } from "react";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { useTrialChain } from "@/hooks/useTrialChain";
import { usePolling } from "@/hooks/usePolling";
import { useWalletRecords } from "@/hooks/useWalletRecords";
import { generateRandomField, hashString } from "@/lib/crypto";
import { TxStatus } from "@/components/TxStatus";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { FlaskConical, Loader2, Plus } from "lucide-react";

export default function SponsorPage() {
  const { publicKey } = useWallet();
  const { registerTrial } = useTrialChain();
  const { txState, startPolling } = usePolling();
  const { sponsorKeys, refetch } = useWalletRecords();
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [conditionCode, setConditionCode] = useState("");
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(65);
  const [maxEnrollment, setMaxEnrollment] = useState(100);
  const [compensationUsdc, setCompensationUsdc] = useState(50);
  const [deadlineBlocks, setDeadlineBlocks] = useState(100000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      toast.error("Connect your wallet first.");
      return;
    }
    if (!title || !conditionCode) {
      toast.error("Fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      const trialId = generateRandomField();
      const preCommittedResultHash = generateRandomField();

      const { txId } = await registerTrial({
        trialId,
        title,
        protocolHash: title, // simplified — in production, hash of protocol PDF
        minAge,
        maxAge,
        conditionCode,
        maxEnrollment,
        compensationUsdc,
        resultDeadlineBlocks: deadlineBlocks,
        preCommittedResultHash,
      });

      startPolling(txId);
      toast.success("Trial registration submitted!");
    } catch (err: any) {
      toast.error(err.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-zinc-500">Connect your wallet to register a trial.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-emerald-400" />
          Register a Clinical Trial
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Define eligibility criteria and compensation. Patient data is never accessible.
        </p>
      </div>

      <Card className="border-white/10 bg-white/5 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Trial Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Phase III Diabetes Study"
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="space-y-2">
            <Label>Disease Code (ICD-10)</Label>
            <Input
              value={conditionCode}
              onChange={(e) => setConditionCode(e.target.value)}
              placeholder="e.g. E11.9 (Type 2 Diabetes)"
              className="bg-white/5 border-white/10"
            />
            <p className="text-xs text-zinc-500">
              Hashed client-side before on-chain submission.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Age</Label>
              <Input
                type="number"
                value={minAge}
                onChange={(e) => setMinAge(Number(e.target.value))}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Max Age</Label>
              <Input
                type="number"
                value={maxAge}
                onChange={(e) => setMaxAge(Number(e.target.value))}
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Enrollment</Label>
              <Input
                type="number"
                value={maxEnrollment}
                onChange={(e) => setMaxEnrollment(Number(e.target.value))}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Compensation (USDCx)</Label>
              <Input
                type="number"
                value={compensationUsdc}
                onChange={(e) => setCompensationUsdc(Number(e.target.value))}
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Result Deadline (blocks from now)</Label>
            <Input
              type="number"
              value={deadlineBlocks}
              onChange={(e) => setDeadlineBlocks(Number(e.target.value))}
              className="bg-white/5 border-white/10"
            />
          </div>

          <Separator className="bg-white/10" />

          <Button
            type="submit"
            disabled={submitting || txState.status === "pending"}
            className="w-full bg-emerald-600 hover:bg-emerald-500"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Register Trial On-Chain
              </>
            )}
          </Button>
        </form>
      </Card>

      <TxStatus txState={txState} />

      {sponsorKeys.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Your Sponsor Keys</h2>
          {sponsorKeys.map((key, i) => (
            <Card key={i} className="border-white/10 bg-white/5 p-3 text-xs font-mono text-zinc-400 break-all">
              {key.plaintext?.slice(0, 120)}...
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
