"use client";

import { useState } from "react";
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";
import { useTrialChain } from "@/hooks/useTrialChain";
import { useWalletRecords } from "@/hooks/useWalletRecords";
import { usePolling } from "@/hooks/usePolling";
import { hashBytes } from "@/lib/crypto";
import { ResultCommitment } from "@/components/ResultCommitment";
import { TxStatus } from "@/components/TxStatus";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileText, Loader2, Upload } from "lucide-react";

export default function ResultsPage() {
  const { connected } = useWallet();
  const { commitResults } = useTrialChain();
  const { sponsorKeys } = useWalletRecords();
  const { txState, startPolling } = usePolling();

  const [trialId, setTrialId] = useState("");
  const [resultHash, setResultHash] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const hash = await hashBytes(bytes);
    setResultHash(hash);
    toast.success("File hashed locally. Ready to commit.");
  };

  const handleCommit = async () => {
    if (!resultHash || !trialId) {
      toast.error("Upload a results file and specify the trial ID.");
      return;
    }

    const sponsorKey = sponsorKeys.find((k) =>
      k.plaintext?.includes(trialId)
    );
    if (!sponsorKey) {
      toast.error("No SponsorKey found for this trial in your wallet.");
      return;
    }

    try {
      setSubmitting(true);
      const txId = await commitResults(
        sponsorKey.plaintext,
        trialId,
        resultHash
      );
      startPolling(txId);
      toast.success("Result commitment submitted!");
    } catch (err: any) {
      toast.error(err.message || "Commit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!connected) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-zinc-500">Connect your wallet to post results.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-400" />
          Commit Trial Results
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Hash your results dataset locally. Commit the hash on-chain — suppression
          becomes cryptographically impossible.
        </p>
      </div>

      <Card className="border-white/10 bg-white/5 p-6 space-y-5">
        <div className="space-y-2">
          <Label>Trial ID (field value)</Label>
          <Input
            value={trialId}
            onChange={(e) => setTrialId(e.target.value)}
            placeholder="e.g. 12345"
            className="bg-white/5 border-white/10"
          />
        </div>

        <div className="space-y-2">
          <Label>Upload Results Dataset</Label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-400 hover:bg-white/10 transition">
              <Upload className="h-4 w-4" />
              Choose File
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            {resultHash && (
              <span className="text-xs text-emerald-400 font-mono truncate max-w-[200px]">
                {resultHash.slice(0, 20)}...
              </span>
            )}
          </div>
        </div>

        <Button
          onClick={handleCommit}
          disabled={submitting || !resultHash || txState.status === "pending"}
          className="w-full bg-blue-600 hover:bg-blue-500"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Committing...
            </>
          ) : (
            "Commit Results On-Chain"
          )}
        </Button>
      </Card>

      <TxStatus txState={txState} />

      {resultHash && (
        <ResultCommitment
          trialId={trialId || "—"}
          revealedHash={resultHash}
          status={0}
        />
      )}
    </div>
  );
}
