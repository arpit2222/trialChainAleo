"use client";

import { useState } from "react";
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";
import { useWalletRecords } from "@/hooks/useWalletRecords";
import { CredentialDisplay } from "@/components/CredentialDisplay";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EXPLORER_URL } from "@/constants/program";
import {
  KeyRound,
  Receipt,
  RefreshCw,
  ExternalLink,
  DollarSign,
} from "lucide-react";

export default function PatientPage() {
  const { connected, address } = useWallet();
  const { credentials, receipts, loading, refetch } = useWalletRecords();

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
          {credentials.length === 0 ? (
            <Card className="border-white/10 bg-white/5 p-6 text-center">
              <KeyRound className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">
                No credentials found. A hospital or IRB must issue a
                PatientCredential to your wallet address.
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
