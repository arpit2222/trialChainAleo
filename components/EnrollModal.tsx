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
import type { Trial } from "@/types";

interface EnrollModalProps {
  trial: Trial;
  credentialRecord: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EnrollModal({
  trial,
  credentialRecord,
  open,
  onOpenChange,
  onSuccess,
}: EnrollModalProps) {
  const { enrollPatient } = useTrialChain();
  const { txState, startPolling, reset } = usePolling();
  const [submitting, setSubmitting] = useState(false);

  const handleEnroll = async () => {
    if (!credentialRecord) {
      toast.error("No credential found. Ask a hospital to issue one.");
      return;
    }

    try {
      setSubmitting(true);
      const txId = await enrollPatient(credentialRecord, trial.id);
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

          {!credentialRecord && (
            <p className="text-sm text-amber-400">
              ⚠ No PatientCredential found in your wallet. You need a credential
              issued by a hospital/IRB before enrolling.
            </p>
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
                disabled={isLoading || !credentialRecord}
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
