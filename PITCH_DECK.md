# TrialChain — Pitch Deck Content

## Slide 1: Title
**TrialChain**  
*Privacy-First Clinical Trials on Aleo*

Built for Aleo Privacy Buildathon — Wave 5

---

## Slide 2: The Problem

### Clinical Trials Are Broken

| Pain Point | Impact |
|------------|--------|
| 🚨 **Privacy Leaks** | Patient data exposed to sponsors, CROs, hackers |
| 🐌 **Enrollment Barriers** | 80% of trials fail to meet timelines — patients won't share data |
| 🎭 **Result Manipulation** | Sponsors cherry-pick and suppress negative results |
| 💸 **Compensation Opacity** | No transparent tracking of patient payments |

**Example**: [Insert recent clinical trial data breach]

---

## Slide 3: Our Solution

### Zero-Knowledge Clinical Trials

```
┌──────────────────────────────────────────────────────────┐
│  PATIENT            ZK PROOF              ON-CHAIN       │
│    │                   │                       │            │
│    ├─ Age: 35 ──────►│  Prove: 18 ≤ age ≤ 65 │──► Trial  │
│    ├─ Condition: DM ►│  (without revealing)  │   Verified │
│    ├─ Lab: 120 ─────►│                       │            │
│    │                   │                       │            │
│    │  Medical data    │  Zero knowledge      │  Nullifier │
│    │  stays private   │  proof only          │  public    │
└──────────────────────────────────────────────────────────┘
```

**Key Innovation**: Patients prove eligibility without revealing medical data

---

## Slide 4: How It Works

### Three Core Functions

**1. Issue Credential** (Hospital → Patient)
- Encrypted medical record
- Only patient can use it
- Issuer hash for authenticity

**2. Enroll with ZK Proof** (Patient → Trial)
- Prove age in range without revealing age
- Prove condition matches without revealing diagnosis
- Get enrollment receipt

**3. Commit-Reveal Results** (Sponsor → Public)
- Pre-commit result hash at trial start
- Reveal actual result after trial ends
- Prevent suppression of negative outcomes

---

## Slide 5: Live Demo — Testnet Transactions

### Real On-Chain Activity

| Transaction | Type | Status |
|-------------|------|--------|
| **Program Deploy** | Deploy | ✅ Confirmed |
| **Register Trial 1** | `register_trial` | ✅ Confirmed |
| **Register Trial 2** | `register_trial` | ✅ Confirmed |
| **Issue Credential** | `issue_credential` | ✅ Confirmed |

**Explore**: https://testnet.explorer.provable.com/program/trialchain_v1.aleo

**Trial ID**: `1975990926371624392613934817234498750441115264165644470795261778214522639715`

---

## Slide 6: Technical Architecture

### Built on Aleo

```
┌─────────────────────────────────────┐
│         LAYER 1: PRIVACY            │
│     ┌──────────────────────┐       │
│     │  Aleo Blockchain     │       │
│     │  • ZK-SNARKs         │       │
│     │  • Private Records   │       │
│     │  • Public Mappings   │       │
│     └──────────────────────┘       │
│                                     │
│  LAYER 2: SMART CONTRACT (Leo)     │
│  ┌─────────┬─────────┬─────────┐  │
│  │register_│ enroll_ │ commit_ │  │
│  │  trial  │ patient │ results │  │
│  └─────────┴─────────┴─────────┘  │
│                                     │
│  LAYER 3: FRONTEND (Next.js)       │
│  ┌─────────┬─────────┬─────────┐  │
│  │ Sponsor │ Patient │ Browse  │  │
│  │  Page   │  Page   │ Trials  │  │
│  └─────────┴─────────┴─────────┘  │
└─────────────────────────────────────┘
```

**Stack**: Leo, Next.js, Tailwind, Shield Wallet, Leo Wallet

---

## Slide 7: ZK Proof Details

### What Gets Proven?

**Private Inputs** (encrypted):
- `age: u8` — actual patient age
- `condition_hash: field` — diagnosis hash
- `lab_value: u64` — lab result

**Public Outputs**:
- `nullifier: field` — unique enrollment ID
- `trial_id: field` — which trial
- `status: u8` — success/failure

**Circuit Constraints**:
```leo
assert(credential.age >= expected_min_age);
assert(credential.age <= expected_max_age);
assert(credential.condition_hash == expected_condition_hash);
assert(!used_nullifiers.contains(nullifier));
```

---

## Slide 8: Market Opportunity

### $50B+ Clinical Trial Market

| Segment | Size | Growth |
|---------|------|--------|
| Phase I-III Trials | $35B | 6% annually |
| CRO Services | $45B | 8% annually |
| Patient Recruitment | $5B | 12% annually |

**Target Customers**:
- Pharma sponsors (Pfizer, Roche, Novartis)
- CROs (IQVIA, Parexel, PRA Health)
- Hospitals & Research Institutions
- Regulatory Bodies (FDA, EMA)

**Pain Point**: 80% of trials fail to enroll on time → **$600K/day** in delay costs

---

## Slide 9: Competitive Advantage

### Only Privacy-Native Trial Platform

| Feature | TrialChain | Medidata | Veeva | CT.gov |
|---------|:----------:|:--------:|:-----:|:------:|
| ZK Proofs | ✅ | ❌ | ❌ | ❌ |
| Patient Data Private | ✅ | ❌ | ❌ | ❌ |
| Commit-Reveal Results | ✅ | ❌ | ❌ | ❌ |
| Open Source | ✅ | ❌ | ❌ | ✅ |
| On-Chain Verification | ✅ | ❌ | ❌ | ❌ |
| No PII on Blockchain | ✅ | ❌ | ❌ | ✅ |

**Differentiation**: We're the only platform where **zero medical data** touches any server or blockchain in plaintext.

---

## Slide 10: Business Model

### Revenue Streams

**Protocol Fees**:
- 0.1% of patient compensation per enrollment
- 0.5% of trial value for registration
- Example: $10M trial → $5K fee

**Premium Features** (SaaS):
- Multi-site trial dashboard: $5K/month
- Regulatory reporting API: $2K/month
- Advanced analytics (privacy-preserving): $3K/month

**API Access**:
- CRO integrations: $0.01 per API call
- Insurance verification: $0.05 per check

**Projected Revenue** (Year 3):
- 100 trials → $500K in fees
- 20 enterprise customers → $2M in SaaS

---

## Slide 11: Traction & Roadmap

### Current Status ✅
- ✅ Smart contract deployed on Aleo Testnet
- ✅ Working frontend with wallet integration
- ✅ 4+ confirmed on-chain transactions
- ✅ ZK enrollment flow functional (CLI)

### Roadmap

**Phase 1: MVP** (Now)
- Core ZK enrollment
- Trial registration
- Testnet deployment ✅

**Phase 2: Beta** (3 months)
- USDCx integration
- Mobile app
- Hospital EHR integrations

**Phase 3: Production** (6 months)
- Mainnet deployment
- FDA compliance certification
- Enterprise sponsorship portal

**Phase 4: Scale** (12 months)
- Global trial network
- DAO governance
- Insurance integrations

---

## Slide 12: Team

**Core Contributor**
- Full-stack Web3 developer
- Healthcare technology background
- Aleo ecosystem contributor

**Seeking**:
- Clinical trial operations expert (Advisor)
- Regulatory affairs specialist (Advisor)
- ZK cryptography researcher (Technical Advisor)

---

## Slide 13: Funding Ask

### Buildathon Grant: $XX,XXX

**Use of Funds**:
- 40% — Mainnet deployment & audits
- 30% — Hospital pilot partnerships
- 20% — Regulatory compliance (FDA, EMA)
- 10% — Community & documentation

**Milestones**:
1. Mainnet deployment (Month 2)
2. First hospital pilot (Month 4)
3. FDA pre-submission meeting (Month 6)

---

## Slide 14: Call to Action

### Join the Privacy-First Clinical Trial Revolution

**Try the Demo**: [Your URL]

**Explore Transactions**:  
https://testnet.explorer.provable.com/program/trialchain_v1.aleo

**GitHub**: [Your repo]

**Contact**: [Your email]

---

## Appendix: Demo Script (2 minutes)

**0:00-0:30 — Setup**
1. Open app at localhost:3000
2. Connect Leo Wallet
3. Show balance

**0:30-1:00 — Issue Credential**
1. Navigate to Patient page
2. Click "Issue Credential"
3. Set: Age 35, Condition E11.9, Lab 120
4. Submit transaction
5. Show confirmation on explorer

**1:00-1:30 — Browse & Enroll**
1. Navigate to Browse Trials
2. Click on-chain trial
3. Load credentials from wallet
4. Click "Enroll with ZK Proof"
5. Show transaction pending

**1:30-2:00 — Verify**
1. Show Transaction History page
2. Click explorer link
3. Show nullifier on-chain
4. Demonstrate: No medical data exposed!

---

## One-Page Summary

**TrialChain** enables privacy-preserving clinical trial enrollment using zero-knowledge proofs on Aleo.

**Problem**: Clinical trials require sensitive medical data, creating privacy risks and enrollment barriers. 80% of trials fail to meet timelines because patients won't share data.

**Solution**: Zero-knowledge proofs allow patients to prove eligibility (age range, diagnosis match, lab values) without revealing actual medical data.

**Technology**: Smart contracts in Leo (273 lines), deployed on Aleo Testnet with 4+ confirmed transactions.

**Market**: $50B+ clinical trial market growing 7% annually. Target: Pharma sponsors, CROs, hospitals.

**Differentiation**: Only platform with true ZK enrollment, commit-reveal for results, and 100% on-chain transparency without exposing PII.

**Status**: MVP complete with working demo. Seeking funding for mainnet deployment and hospital pilots.

---

## Key Talking Points

1. **Privacy is the Missing Piece**: Every other trial platform exposes patient data. We don't.

2. **ZK Proofs Are Real**: Not theoretical — working code on testnet right now.

3. **Commit-Reveal Prevents Fraud**: Historical problem of suppressed negative results solved.

4. **Regulatory Ready**: Built with GDPR, HIPAA, FDA compliance in mind.

5. **Open Source**: Full transparency, community auditable.

6. **Aleo is Perfect Fit**: Only L1 designed for privacy — not an afterthought.

---

**TrialChain — Proving Eligibility Without Exposing Identity**
