export const PROGRAM_ID =
  process.env.NEXT_PUBLIC_PROGRAM_ID ?? "trialchain_v1.aleo";

export const NETWORK = process.env.NEXT_PUBLIC_NETWORK ?? "testnet";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.explorer.provable.com/v1";

export const USDCX_PROGRAM =
  process.env.NEXT_PUBLIC_USDCX_PROGRAM ?? "test_usdcx_stablecoin.aleo";

export const EXPLORER_URL =
  process.env.NEXT_PUBLIC_EXPLORER_URL ??
  "https://testnet.explorer.provable.com";

export const DEPLOYED_PROGRAM_ID = PROGRAM_ID;

// Aleo BLS12-377 scalar field modulus
export const FIELD_MODULUS = BigInt(
  "8444461749428370424248824938781546531375899335154063827935233455917409239040"
);
