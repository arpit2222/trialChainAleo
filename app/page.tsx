"use client";

import Link from "next/link";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";
import { motion } from "framer-motion";
import {
  Shield,
  FlaskConical,
  Lock,
  DollarSign,
  Eye,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Shield,
    title: "ZK Eligibility Proofs",
    desc: "Patients prove they qualify for trials without revealing medical records. Aleo ZK circuits verify age, condition, and biomarkers privately.",
  },
  {
    icon: Lock,
    title: "Anti-Suppression",
    desc: "Sponsors cryptographically commit to results at registration. If results are buried, the commitment mismatch is publicly verifiable.",
  },
  {
    icon: DollarSign,
    title: "USDCx Compensation",
    desc: "Patients earn private USDCx payments for participation. No identity linkage — value flows directly to the patient's wallet.",
  },
  {
    icon: Eye,
    title: "Selective Disclosure",
    desc: "Prove enrollment to regulators without revealing your identity. Auditors verify on-chain nullifiers, not patient data.",
  },
];

export default function LandingPage() {
  const { publicKey } = useWallet();

  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pt-24 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400 mb-6">
            <FlaskConical className="h-4 w-4" />
            Aleo Privacy Buildathon Wave 5
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Clinical Trials,{" "}
            <span className="text-emerald-400">Privately</span>
          </h1>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
            TrialChain uses Aleo zero-knowledge proofs so patients can prove
            eligibility without exposing medical data, sponsors cannot suppress
            results, and compensation flows privately via USDCx.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            {publicKey ? (
              <>
                <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-500">
                  <Link href="/patient">
                    Patient Portal <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/sponsor">Register a Trial</Link>
                </Button>
              </>
            ) : (
              <WalletMultiButton />
            )}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 pb-24">
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              className="rounded-xl border border-white/10 bg-white/5 p-6"
            >
              <f.icon className="h-6 w-6 text-emerald-400 mb-3" />
              <h3 className="text-sm font-semibold text-white">{f.title}</h3>
              <p className="mt-1 text-xs text-zinc-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-5xl px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            ["$50B+", "Lost annually to result suppression"],
            ["85%", "Of trials fail to recruit on time"],
            ["$41K", "Average cost per patient recruited"],
            ["0%", "Patient compensation in current trials"],
          ].map(([stat, label]) => (
            <div key={stat}>
              <p className="text-2xl font-bold text-emerald-400">{stat}</p>
              <p className="text-xs text-zinc-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
