"use client";

import { useState } from "react";
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";
import { useWalletRecords } from "@/hooks/useWalletRecords";
import { useTrialChain } from "@/hooks/useTrialChain";
import { usePolling } from "@/hooks/usePolling";
import { TxStatus } from "@/components/TxStatus";
import { CredentialDisplay } from "@/components/CredentialDisplay";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EXPLORER_URL } from "@/constants/program";
import { toast } from "sonner";
import {
  KeyRound,
  Receipt,
  RefreshCw,
  ExternalLink,
  DollarSign,
  Loader2,
  Plus,
} from "lucide-react";

export default function PatientPage() {
  const { connected, address } = useWallet();
  const { credentials, receipts, loading, refetch } = useWalletRecords();
  const { issueCredential } = useTrialChain();
  const { txState, startPolling } = usePolling();

  // Self-issue credential form state
  const [issuing, setIssuing] = useState(false);
  const [credAge, setCredAge] = useState(35);
  const [credCondition, setCredCondition] = useState("E11.9");
  const [credLabValue, setCredLabValue] = useState(120);

  const handleSelfIssue = async () => {
    if (!address) return;
    try {
      setIssuing(true);
      console.log("[Patient] Issuing credential to self:", address);
      const txId = await issueCredential({
        patientAddress: address,
        age: credAge,
        conditionCode: credCondition,
        labValue: credLabValue,
      });
      if (txId) {
        startPolling(txId);
        toast.success("Credential issuance submitted!");
      }
    } catch (err: any) {
      console.error("[Patient] Issue credential error:", err);
      toast.error(err.message || "Failed to issue credential");
    } finally {
      setIssuing(false);
    }
  };

  if (!connected) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-zinc-500">Connect your wallet to view your records.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-emerald-400" />
            Patient Portal
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Your private records — stored in your wallet, never exposed on-chain.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="credentials">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="credentials">
            Credentials ({credentials.length})
          </TabsTrigger>
          <TabsTrigger value="enrollments">
            Enrollments ({receipts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="credentials" className="mt-4 space-y-4">
          {/* Self-issue credential for demo */}
          <Card className="border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Issue Credential (Demo)
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                In production, a hospital/IRB issues this. For demo, issue one to yourself.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Age</Label>
                <Input
                  type="number"
                  value={credAge}
                  onChange={(e) => setCredAge(Number(e.target.value))}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Condition (ICD-10)</Label>
                <Input
                  value={credCondition}
                  onChange={(e) => setCredCondition(e.target.value)}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Lab Value</Label>
                <Input
                  type="number"
                  value={credLabValue}
                  onChange={(e) => setCredLabValue(Number(e.target.value))}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSelfIssue}
                disabled={issuing}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                {issuing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Issuing...
                  </>
                ) : (
                  "Issue Credential to Self"
                )}
              </Button>
              <p className="text-xs text-zinc-500 font-mono truncate">
                To: {address}
              </p>
            </div>
            <TxStatus txState={txState} />
          </Card>

          {credentials.length === 0 ? (
            <Card className="border-white/10 bg-white/5 p-6 text-center">
              <KeyRound className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">
                No credentials found. Issue one above or wait for a hospital/IRB.
              </p>
              <p className="text-xs text-zinc-600 mt-2 font-mono">
                {address}
              </p>
            </Card>
          ) : (
            credentials.map((cred, i) => (
              <CredentialDisplay key={i} credential={cred} />
            ))
          )}
        </TabsContent>

        <TabsContent value="enrollments" className="mt-4 space-y-4">
          {receipts.length === 0 ? (
            <Card className="border-white/10 bg-white/5 p-6 text-center">
              <Receipt className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">
                No enrollment receipts. Browse trials and enroll with a ZK proof.
              </p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <a href="/trials">Browse Trials</a>
              </Button>
            </Card>
          ) : (
            receipts.map((receipt, i) => {
              const plaintext = receipt.plaintext || "";
              const getField = (name: string) => {
                const m = plaintext.match(new RegExp(`${name}:\\s*([^,}]+)`));
                return m ? m[1].trim() : "—";
              };
              const trialId = getField("trial_id").replace("field", "");
              const compensation = getField("compensation_usdc").replace("u64", "");
              const nullifier = getField("nullifier").replace("field", "");

              return (
                <Card
                  key={i}
                  className="border-white/10 bg-white/5 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-blue-400" />
                      Enrollment Receipt
                    </span>
                    <Badge className="bg-emerald-500/20 text-emerald-400">
                      Enrolled
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-zinc-500">Trial ID</p>
                      <p className="text-white font-mono truncate">
                        {trialId.slice(0, 16)}...
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Compensation</p>
                      <p className="text-white flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {(Number(compensation) / 1_000_000).toFixed(2)} USDCx
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono truncate">
                    Nullifier: {nullifier.slice(0, 24)}...
                  </p>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
