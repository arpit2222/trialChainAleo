"use client";

import React, { FC, useMemo } from "react";
import { AleoWalletProvider as WalletProvider } from "@provablehq/aleo-wallet-adaptor-react";
import { WalletModalProvider } from "@provablehq/aleo-wallet-adaptor-react-ui";
import { ShieldWalletAdapter } from "@provablehq/aleo-wallet-adaptor-shield";
import { LeoWalletAdapter } from "@provablehq/aleo-wallet-adaptor-leo";
import { DecryptPermission } from "@provablehq/aleo-wallet-adaptor-core";
import { Network } from "@provablehq/aleo-types";
import "@provablehq/aleo-wallet-adaptor-react-ui/dist/styles.css";
import { PROGRAM_ID } from "@/constants/program";

export const AleoWalletProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const wallets = useMemo(
    () => [
      new ShieldWalletAdapter(),
      new LeoWalletAdapter(),
    ],
    []
  );

  return (
    <WalletProvider
      wallets={wallets}
      decryptPermission={DecryptPermission.UponRequest}
      network={Network.TESTNET}
      autoConnect
      programs={[PROGRAM_ID, "credits.aleo"]}
    >
      <WalletModalProvider>{children}</WalletModalProvider>
    </WalletProvider>
  );
};
