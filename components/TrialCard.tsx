"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TRIAL_STATUS_LABELS, type Trial, type TrialStatus } from "@/types";
import { Users, Clock, DollarSign } from "lucide-react";

interface TrialCardProps {
  trial: Trial;
  linkPrefix?: string;
}

const statusColor: Record<TrialStatus, string> = {
  0: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  1: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  2: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  3: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function TrialCard({ trial, linkPrefix = "/trials" }: TrialCardProps) {
  return (
    <Link href={`${linkPrefix}/${trial.id}`}>
      <Card className="border-white/10 bg-white/5 p-5 hover:bg-white/10 transition group cursor-pointer">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition">
            {trial.title}
          </h3>
          <Badge className={statusColor[trial.status]}>
            {TRIAL_STATUS_LABELS[trial.status]}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {trial.enrollmentCount}/{trial.maxEnrollment}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Age {trial.minAge}–{trial.maxAge}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />${trial.compensationUsdc} USDCx
          </span>
        </div>

        <p className="mt-2 text-xs text-zinc-500 font-mono truncate">
          ID: {trial.id}
        </p>
      </Card>
    </Link>
  );
}
