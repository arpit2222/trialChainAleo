// TrialChain: Privacy-First Clinical Trial Protocol
// Wave 5 Submission — Aleo Privacy Buildathon
// Deploy on Aleo Testnet

// ============================================================
// CONSTANTS
// ============================================================
const PROTOCOL_ADMIN: address = aleo1ge7dxl5uagnce3durfvcpa5sj3zzd34usfy83gclqenkx7ah9qzqqczmg2;
const MAX_PATIENTS_PER_TRIAL: u32 = 10000u32;

// ============================================================
// PROGRAM
// ============================================================

program trialchain_v1.aleo {

    // ========================================================
    // STRUCTS (inside program block for final-block access)
    // ========================================================

    struct TrialData {
        sponsor_hash: field,
        title_hash: field,
        protocol_hash: field,
        min_age: u8,
        max_age: u8,
        required_condition_hash: field,
        max_enrollment: u32,
        compensation_usdc: u64,
        result_deadline_block: u32,
        status: u8,
    }

    struct NullifierInput {
        patient: address,
        trial_id: field,
    }

    struct ResultInput {
        result_hash: field,
        salt: field,
    }

    // ========================================================
    // RECORDS (private — encrypted, only owner can read)
    // ========================================================

    record PatientCredential {
        owner: address,
        issuer_hash: field,
        age: u8,
        condition_hash: field,
        lab_value: u64,
        credential_id: field,
    }

    record EnrollmentReceipt {
        owner: address,
        trial_id: field,
        nullifier: field,
        compensation_usdc: u64,
    }

    record SponsorKey {
        owner: address,
        trial_id: field,
        salt: field,
    }

    // ========================================================
    // MAPPINGS (public on-chain — aggregates only, no PII)
    // ========================================================

    mapping trial_registry: field => TrialData;
    mapping enrollment_counts: field => u32;
    mapping result_commitments: field => field;
    mapping revealed_results: field => field;
    mapping used_nullifiers: field => bool;
    mapping sponsor_trial_count: field => u32;
    mapping trial_status: field => u8;

    // ========================================================
    // 1. register_trial
    // ========================================================
    fn register_trial(
        public trial_id: field,
        public title_hash: field,
        public protocol_hash: field,
        public min_age: u8,
        public max_age: u8,
        public required_condition_hash: field,
        public max_enrollment: u32,
        public compensation_usdc: u64,
        public result_deadline_block: u32,
        private result_commitment_salt: field,
        private pre_committed_result_hash: field,
    ) -> (SponsorKey, Final) {
        assert(min_age < max_age);
        assert(max_enrollment > 0u32);
        assert(max_enrollment <= MAX_PATIENTS_PER_TRIAL);
        assert(compensation_usdc >= 1000000u64);

        let sponsor_hash: field = BHP256::hash_to_field(self.signer);

        let ri: ResultInput = ResultInput {
            result_hash: pre_committed_result_hash,
            salt: result_commitment_salt,
        };
        let commitment: field = BHP256::hash_to_field(ri);

        let trial_data: TrialData = TrialData {
            sponsor_hash: sponsor_hash,
            title_hash: title_hash,
            protocol_hash: protocol_hash,
            min_age: min_age,
            max_age: max_age,
            required_condition_hash: required_condition_hash,
            max_enrollment: max_enrollment,
            compensation_usdc: compensation_usdc,
            result_deadline_block: result_deadline_block,
            status: 0u8,
        };

        let sponsor_key: SponsorKey = SponsorKey {
            owner: self.signer,
            trial_id: trial_id,
            salt: result_commitment_salt,
        };

        return (sponsor_key, final {
            assert(!trial_registry.contains(trial_id));
            assert(result_deadline_block > block.height);
            trial_registry.set(trial_id, trial_data);
            enrollment_counts.set(trial_id, 0u32);
            result_commitments.set(trial_id, commitment);
            trial_status.set(trial_id, 0u8);
            let c: u32 = sponsor_trial_count.get_or_use(sponsor_hash, 0u32);
            sponsor_trial_count.set(sponsor_hash, c + 1u32);
        });
    }

    // ========================================================
    // 2. issue_credential
    // ========================================================
    fn issue_credential(
        public patient: address,
        private age: u8,
        private condition_hash: field,
        private lab_value: u64,
        public credential_id: field,
    ) -> PatientCredential {
        let issuer_hash: field = BHP256::hash_to_field(self.signer);
        assert(age >= 18u8);
        assert(age <= 120u8);

        return PatientCredential {
            owner: patient,
            issuer_hash: issuer_hash,
            age: age,
            condition_hash: condition_hash,
            lab_value: lab_value,
            credential_id: credential_id,
        };
    }

    // ========================================================
    // 3. enroll_patient — CORE ZK INNOVATION
    // ========================================================
    fn enroll_patient(
        private credential: PatientCredential,
        public trial_id: field,
        public expected_min_age: u8,
        public expected_max_age: u8,
        public expected_condition_hash: field,
        public expected_compensation: u64,
    ) -> (EnrollmentReceipt, Final) {
        assert(credential.owner == self.signer);

        // ZK ELIGIBILITY — runs inside the proof circuit
        assert(credential.age >= expected_min_age);
        assert(credential.age <= expected_max_age);
        assert(credential.condition_hash == expected_condition_hash);

        let ni: NullifierInput = NullifierInput {
            patient: self.signer,
            trial_id: trial_id,
        };
        let nullifier: field = BHP256::hash_to_field(ni);

        let receipt: EnrollmentReceipt = EnrollmentReceipt {
            owner: self.signer,
            trial_id: trial_id,
            nullifier: nullifier,
            compensation_usdc: expected_compensation,
        };

        return (receipt, final {
            // Verify public inputs match on-chain trial data
            let trial: TrialData = trial_registry.get(trial_id);
            assert(trial.min_age == expected_min_age);
            assert(trial.max_age == expected_max_age);
            assert(trial.required_condition_hash == expected_condition_hash);
            assert(trial.compensation_usdc == expected_compensation);

            let status: u8 = trial_status.get_or_use(trial_id, 0u8);
            assert(status == 0u8);

            // Anti-replay
            assert(!used_nullifiers.get_or_use(nullifier, false));
            used_nullifiers.set(nullifier, true);

            // Increment enrollment
            let count: u32 = enrollment_counts.get_or_use(trial_id, 0u32);
            assert(count < trial.max_enrollment);
            enrollment_counts.set(trial_id, count + 1u32);

            // Auto-close when full
            if (count + 1u32 == trial.max_enrollment) {
                trial_status.set(trial_id, 1u8);
            }
        });
    }

    // ========================================================
    // 4. commit_results
    // ========================================================
    fn commit_results(
        private sponsor_key: SponsorKey,
        public trial_id: field,
        public result_hash: field,
    ) -> Final {
        assert(sponsor_key.trial_id == trial_id);
        assert(sponsor_key.owner == self.signer);

        let ri: ResultInput = ResultInput {
            result_hash: result_hash,
            salt: sponsor_key.salt,
        };
        let recomputed: field = BHP256::hash_to_field(ri);

        return final {
            let status: u8 = trial_status.get_or_use(trial_id, 0u8);
            assert(status != 2u8);
            assert(status != 3u8);

            let stored: field = result_commitments.get(trial_id);
            assert(stored == recomputed);

            revealed_results.set(trial_id, result_hash);
            trial_status.set(trial_id, 2u8);
        };
    }

    // ========================================================
    // 5. verify_enrollment
    // ========================================================
    fn verify_enrollment(
        private receipt: EnrollmentReceipt,
        public trial_id: field,
    ) -> field {
        assert(receipt.owner == self.signer);
        assert(receipt.trial_id == trial_id);
        return BHP256::hash_to_field(receipt.nullifier);
    }
}
