"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Clock, Hash } from "lucide-react";

interface CredentialDisplayProps {
  credential: any;
  currentBlock?: number;
}

export function CredentialDisplay({
  credential,
  currentBlock,
}: CredentialDisplayProps) {
  const plaintext = credential?.plaintext || "";

  // Parse fields from plaintext — rough extraction
  const getField = (name: string): string => {
    const regex = new RegExp(`${name}:\\s*([^,}]+)`);
    const match = plaintext.match(regex);
    return match ? match[1].trim() : "—";
  };

  const age = getField("age").replace("u8", "");
  const conditionHash = getField("condition_hash").replace("field", "");
  const labValue = getField("lab_value").replace("u64", "");
  const expiryBlock = parseInt(getField("expiry_block").replace("u32", ""), 10);
  const credId = getField("credential_id").replace("field", "");

  const isExpired = currentBlock ? currentBlock > expiryBlock : false;

  return (
    <Card className="border-white/10 bg-white/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-semibold text-white">
            Patient Credential
          </span>
        </div>
        <Badge className={isExpired ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}>
          {isExpired ? "Expired" : "Active"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-zinc-500">Age</p>
          <p className="text-white font-mono">{age}</p>
        </div>
        <div>
          <p className="text-zinc-500">Lab Value</p>
          <p className="text-white font-mono">{labValue}</p>
        </div>
        <div>
          <p className="text-zinc-500">Condition Hash</p>
          <p className="text-white font-mono truncate">{conditionHash.slice(0, 16)}...</p>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-zinc-500" />
          <p className="text-zinc-500">Expires block</p>
          <p className="text-white font-mono ml-auto">{expiryBlock || "—"}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-zinc-500">
        <Hash className="h-3 w-3" />
        <span className="font-mono truncate">{credId.slice(0, 24)}...</span>
      </div>
    </Card>
  );
}
