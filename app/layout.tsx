import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AleoWalletProvider } from "@/components/WalletProvider";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TrialChain — Privacy-First Clinical Trials on Aleo",
  description:
    "Patients prove eligibility with ZK proofs. Sponsors cannot suppress results. Compensation flows privately via USDCx.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <AleoWalletProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Toaster theme="dark" richColors position="bottom-right" />
        </AleoWalletProvider>
      </body>
    </html>
  );
}
