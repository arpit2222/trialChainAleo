"use client";

import { useState } from "react";
import { useTrialChain } from "@/hooks/useTrialChain";
import { usePolling } from "@/hooks/usePolling";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { hashString } from "@/lib/crypto";
import type { Trial } from "@/types";

interface EnrollModalProps {
  trial: Trial;
  credentialRecord: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onLoadCredentials?: () => void;
}

export function EnrollModal({
  trial,
  credentialRecord,
  open,
  onOpenChange,
  onSuccess,
  onLoadCredentials,
}: EnrollModalProps) {
  const { enrollPatient } = useTrialChain();
  const { txState, startPolling, reset } = usePolling();
  const [submitting, setSubmitting] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const handleEnroll = async () => {
    if (!credentialRecord && !demoMode) {
      toast.error("No credential found. Ask a hospital to issue one.");
      return;
    }

    // Demo mode: show simulated success without actual transaction
    if (demoMode) {
      setSubmitting(true);
      setTimeout(() => {
        toast.success("Demo: Enrollment would succeed with valid credential!");
        setSubmitting(false);
      }, 1500);
      return;
    }

    try {
      setSubmitting(true);
      const conditionHash = trial.requiredConditionHash !== "0"
        ? trial.requiredConditionHash
        : await hashString("");
      const compensationMicros = BigInt(trial.compensationUsdc) * 1_000_000n;

      // Pass the full record object — enrollPatient will format it
      console.log("[EnrollModal] Using credential record:", credentialRecord);

      const txId = await enrollPatient(
        credentialRecord,
        trial.id,
        trial.minAge,
        trial.maxAge,
        conditionHash,
        compensationMicros
      );
      startPolling(txId);
      toast.info("ZK proof submitted — waiting for confirmation...");
    } catch (err: any) {
      toast.error(err.message || "Enrollment failed");
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = submitting || txState.status === "pending";
  const isConfirmed = txState.status === "confirmed";
  const isRejected = txState.status === "rejected";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!isLoading) {
          onOpenChange(v);
          if (!v) reset();
        }
      }}
    >
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            ZK Enrollment
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Your medical data stays private. Only a ZK proof of eligibility is
            sent on-chain.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm space-y-1">
            <p className="text-zinc-300">
              <span className="text-zinc-500">Trial:</span> {trial.title}
            </p>
            <p className="text-zinc-300">
              <span className="text-zinc-500">Age range:</span> {trial.minAge}–
              {trial.maxAge}
            </p>
            <p className="text-zinc-300">
              <span className="text-zinc-500">Compensation:</span> $
              {trial.compensationUsdc} USDCx
            </p>
          </div>

          {/* Demo mode checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="demoMode"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="demoMode" className="text-xs text-zinc-400 cursor-pointer">
              Demo Mode (skip credential requirement)
            </label>
          </div>

          {!credentialRecord && !demoMode && (
            <div className="space-y-2">
              <p className="text-sm text-amber-400">
                ⚠ No PatientCredential loaded. Click below to load from your wallet.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadCredentials}
              >
                Load Credentials from Wallet
              </Button>
            </div>
          )}

          {isConfirmed && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Enrollment confirmed! ZK proof verified on-chain.
            </div>
          )}

          {isRejected && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <XCircle className="h-4 w-4" />
              {txState.error || "Transaction was rejected."}
            </div>
          )}

          {txState.status === "pending" && (
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating ZK proof & confirming on-chain...
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            {isConfirmed ? (
              <Button
                onClick={() => {
                  onOpenChange(false);
                  reset();
                  onSuccess?.();
                }}
              >
                Done
              </Button>
            ) : (
              <Button
                onClick={handleEnroll}
                disabled={isLoading || (!credentialRecord && !demoMode)}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Enroll with ZK Proof"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
