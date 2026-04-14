# TrialChain — Privacy-First Clinical Trials on Aleo

**TrialChain** is a zero-knowledge clinical trial platform built on [Aleo](https://aleo.org). It enables patients to prove eligibility for trials without exposing medical data, sponsors to commit and reveal results tamper-proof, and compensation to flow privately — all verifiable on-chain.

> Aleo Privacy Buildathon Submission

---

## Why Privacy Matters in Clinical Trials

Clinical trials require sensitive medical data: age, diagnoses, lab results, enrollment status. Today, this data flows through centralized systems where it can be leaked, manipulated, or used to suppress unfavorable results.

TrialChain solves this with **zero-knowledge proofs**:

- **Patients** prove they meet eligibility criteria (age, condition, lab values) without revealing the actual data
- **Sponsors** commit to results before they're known, preventing suppression via a commit-reveal scheme
- **Compensation** flows privately via USDCx — no identity linkage
- **Auditors** can verify enrollment and results on-chain using nullifiers, without accessing patient records

---

## Live Deployment

| Resource | Link |
|---|---|
| **Program on Explorer** | [trialchain_v1.aleo](https://testnet.explorer.provable.com/program/trialchain_v1.aleo) |
| **Deployment Transaction** | [at1pzava35fz69v86dew66p9skxlzpuksfggwatwqlc8tr2jxkgfugqc6ad2q](https://testnet.explorer.provable.com/transaction/at1pzava35fz69v86dew66p9skxlzpuksfggwatwqlc8tr2jxkgfugqc6ad2q) |
| **Deployer Wallet** | [aleo1df5lzy...f268n](https://testnet.explorer.provable.com/address/aleo1df5lzyms2jrv2rehc6pv8wjcs3syq642fcxf5e5528c84vxdavpqtf268n) |
| **Network** | Aleo Testnet |
| **Program ID** | `trialchain_v1.aleo` |

---

## Features

### For Patients
- **ZK Enrollment** — Prove eligibility (age, condition, lab values) without revealing data
- **Private Compensation** — Receive USDCx payments with no identity linkage
- **Selective Disclosure** — Prove enrollment to regulators without revealing identity

### For Sponsors
- **Trial Registration** — Define eligibility criteria, compensation, enrollment caps on-chain
- **Commit-Reveal Results** — Pre-commit a result hash; reveal later. Prevents suppression
- **Sponsor Keys** — Private records for managing trials

### For Auditors / Public
- **On-Chain Verification** — Query trial data, enrollment counts, result commitments
- **Nullifier Checks** — Verify enrollment uniqueness without accessing patient data
- **Result Transparency** — Verify committed vs. revealed results

---

## Smart Contract Architecture

The Leo program `trialchain_v1.aleo` implements 5 core transitions:

| Transition | Description | Privacy |
|---|---|---|
| `register_trial` | Sponsor registers a trial with eligibility criteria, compensation, and a pre-committed result hash | Trial params public; sponsor key + salt private |
| `issue_credential` | Hospital/IRB issues a `PatientCredential` record to a patient | Credential data private to patient |
| `enroll_patient` | Patient proves eligibility via ZK proof and enrolls | Medical data never leaves the device |
| `commit_results` | Sponsor reveals results, verified against pre-committed hash | Salt private; result hash public |
| `verify_enrollment` | Patient proves enrollment for selective disclosure | Nullifier hash output only |

### Records (Private)
- **PatientCredential** — `owner`, `issuer_hash`, `age`, `condition_hash`, `lab_value`, `credential_id`
- **EnrollmentReceipt** — `owner`, `trial_id`, `nullifier`, `compensation_usdc`
- **SponsorKey** — `owner`, `trial_id`, `salt`

### Mappings (Public)
- `trial_registry` — Trial metadata (eligibility, compensation, deadline)
- `enrollment_counts` — Per-trial enrollment count
- `result_commitments` — Pre-committed result hashes
- `revealed_results` — Revealed result hashes
- `used_nullifiers` — Anti-replay nullifier tracking
- `trial_status` — Trial lifecycle state
- `sponsor_trial_count` — Trials per sponsor

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Smart Contract** | [Leo](https://developer.aleo.org/leo/) on Aleo |
| **Frontend** | Next.js 14 (App Router) |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Wallet** | [Shield Wallet](https://aleo.org/shield/) (primary) + Leo Wallet |
| **Wallet Adapter** | `@provablehq/aleo-wallet-adaptor-*` |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |

---

## Project Structure

```
trialvaultAleo/
├── programs/trialchain_v1/
│   └── src/main.leo            # Leo smart contract
├── app/
│   ├── page.tsx                # Landing page
│   ├── sponsor/page.tsx        # Register trials
│   ├── patient/page.tsx        # View credentials & receipts
│   ├── trials/page.tsx         # Browse & enroll in trials
│   ├── results/page.tsx        # Commit trial results
│   └── verify/page.tsx         # Public on-chain verification
├── components/
│   ├── WalletProvider.tsx      # Shield + Leo wallet setup
│   ├── Navbar.tsx              # Navigation with wallet button
│   ├── EnrollModal.tsx         # ZK enrollment dialog
│   ├── TxStatus.tsx            # Transaction status tracker
│   └── ui/                     # shadcn/ui components
├── hooks/
│   ├── useTrialChain.ts        # Contract interaction hook
│   ├── usePolling.ts           # Wallet tx status polling
│   └── useWalletRecords.ts     # Fetch & categorize wallet records
├── lib/
│   ├── aleo.ts                 # Aleo utilities (field inputs, block height)
│   ├── api.ts                  # Explorer API queries (mappings, status)
│   └── crypto.ts               # SHA-256 hashing, random field generation
├── constants/program.ts        # Program ID, API URLs, explorer URL
├── types/index.ts              # TypeScript interfaces matching Leo records
└── .env                        # Environment variables (not committed)
```

---

## On-Chain Demo Transactions

| Transaction | Type | Explorer Link |
|-------------|------|---------------|
| **Program Deployment** | Deploy | [at1pzava35fz69v86dew66p9skxlzpuksfggwatwqlc8tr2jxkgfugqc6ad2q](https://testnet.explorer.provable.com/transaction/at1pzava35fz69v86dew66p9skxlzpuksfggwatwqlc8tr2jxkgfugqc6ad2q) |
| **Trial 1 Registration** | `register_trial` | [at19wua7xkr3ky0df9zaz2j9dvu4gswd96gk93w8nwg8mcq0pzgqgzqhqkzme](https://testnet.explorer.provable.com/transactions?q=at19wua7xkr3ky0df9zaz2j9dvu4gswd96gk93w8nwg8mcq0pzgqgzqhqkzme&t=transactions-table) |
| **Trial 2 Registration** | `register_trial` | [at1tat94rrd86ue27927hx4vy6ej92a5fvu7lhh5klwqhwx2c0kdyqqc69wwa](https://testnet.explorer.provable.com/transactions?q=at1tat94rrd86ue27927hx4vy6ej92a5fvu7lhh5klwqhwx2c0kdyqqc69wwa&t=transactions-table) |
| **Credential Issuance** | `issue_credential` | [at16utqvunrevgw7fglgzrxtcutsltjgr3xcwug9rnkzs6wyx0xhu9qmusx9g](https://testnet.explorer.provable.com/transaction/at16utqvunrevgw7fglgzrxtcutsltjgr3xcwug9rnkzs6wyx0xhu9qmusx9g) |

**Trial IDs:**
- Trial 1: `1975990926371624392613934817234498750441115264165644470795261778214522639715`
- Trial 2: `2584780927310332760886810506057148741907627745285309466315042444442406030880`

---

## Getting Started

### Prerequisites
- Node.js 18+
- [Shield Wallet](https://aleo.org/shield/) browser extension
- Aleo testnet credits (get from [faucet](https://faucet.aleo.org))

### Installation

```bash
git clone https://github.com/arpit2222/trialvaultAleo.git
cd trialvaultAleo
npm install
```

### Environment Setup

Create a `.env` file:

```env
NEXT_PUBLIC_PROGRAM_ID=trialchain_v1.aleo
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_API_URL=https://api.explorer.provable.com/v1
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

---

## How to Use

### 1. Connect Wallet
Click **Select Wallet** in the navbar and connect with Shield Wallet or Leo Wallet.

### 2. Register a Trial (Sponsor)
Navigate to **Sponsor** → fill in trial details (title, disease code, age range, compensation, deadline) → click **Register Trial On-Chain**. This creates a `SponsorKey` record in your wallet and registers the trial publicly.

### 3. Issue Credential (Hospital/IRB)
A trusted issuer calls `issue_credential` with the patient's address and medical data. The patient receives a private `PatientCredential` record.

### 4. Enroll in a Trial (Patient)
Navigate to **Browse Trials** → select a trial → click **Enroll with ZK Proof**. The ZK proof verifies eligibility without revealing medical data. You receive an `EnrollmentReceipt` with compensation info.

### 5. Commit Results (Sponsor)
Navigate to **Results** → upload a results file → the SHA-256 hash is computed client-side and committed on-chain against the pre-committed hash.

### 6. Verify (Public)
Navigate to **Verify** → query any trial ID to see registration data, enrollment counts, result commitments, and nullifier status — all without accessing private patient data.

---

## Privacy Model

```
┌─────────────────────────────────────────────────────────┐
│                    ON-CHAIN (Public)                     │
│  trial_registry, enrollment_counts, result_commitments  │
│  used_nullifiers, trial_status                          │
└──────────────────────┬──────────────────────────────────┘
                       │ ZK Proofs Only
┌──────────────────────┴──────────────────────────────────┐
│                   OFF-CHAIN (Private)                    │
│  PatientCredential (age, condition, lab values)          │
│  EnrollmentReceipt (compensation, nullifier)             │
│  SponsorKey (salt for commit-reveal)                     │
└─────────────────────────────────────────────────────────┘
```

- **Patient data** never leaves the device — only ZK proofs are submitted
- **Nullifiers** prevent double-enrollment without revealing patient identity
- **Commit-reveal** ensures sponsors cannot suppress unfavorable results
- **Records** are encrypted and owned by the respective parties

---

## Verification URLs

After transactions confirm, verify on-chain state:

```bash
# Check if program is deployed
curl https://api.explorer.provable.com/v1/testnet/program/trialchain_v1.aleo

# Query a trial's data (replace TRIAL_ID with the field value)
curl https://api.explorer.provable.com/v1/testnet/program/trialchain_v1.aleo/mapping/trial_registry/TRIAL_IDfield

# Check enrollment count
curl https://api.explorer.provable.com/v1/testnet/program/trialchain_v1.aleo/mapping/enrollment_counts/TRIAL_IDfield

# Check if a nullifier has been used
curl https://api.explorer.provable.com/v1/testnet/program/trialchain_v1.aleo/mapping/used_nullifiers/NULLIFIERfield

# Check trial status
curl https://api.explorer.provable.com/v1/testnet/program/trialchain_v1.aleo/mapping/trial_status/TRIAL_IDfield
```

---

## Transaction Timing

Aleo transactions typically take **3–10 minutes** on testnet:
1. **ZK Proof Generation** (~1-3 min) — computed locally in the browser via Shield Wallet
2. **Network Broadcast + Finalization** (~2-7 min) — included in a block and confirmed

---

## Buildathon Compliance

| Requirement | Status |
|---|---|
| Functional frontend | ✅ Next.js app with full UI |
| Non-trivial Leo code deployed on Testnet | ✅ 5 transitions, 7 mappings, 3 record types |
| Shield Wallet integration | ✅ Primary wallet adapter |
| Privacy usage (40% weight) | ✅ ZK eligibility proofs, private records, nullifier anti-replay, commit-reveal |
| Working demo | ✅ Register trials, enroll patients, commit results, verify on-chain |

---

## License

MIT
