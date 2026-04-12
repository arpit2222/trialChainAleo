"use client";

import Link from "next/link";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";
import { Shield, FlaskConical } from "lucide-react";

export function Navbar() {
  const { publicKey } = useWallet();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-emerald-400" />
          <span className="text-lg font-bold text-white">TrialChain</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
          <Link href="/trials" className="hover:text-white transition">
            Browse Trials
          </Link>
          {publicKey && (
            <>
              <Link
                href="/sponsor"
                className="hover:text-white transition"
              >
                Sponsor
              </Link>
              <Link
                href="/patient"
                className="hover:text-white transition"
              >
                Patient
              </Link>
              <Link
                href="/results"
                className="hover:text-white transition"
              >
                Results
              </Link>
            </>
          )}
          <Link href="/verify" className="hover:text-white transition">
            Verify
          </Link>
        </nav>

        <WalletMultiButton />
      </div>
    </header>
  );
}
