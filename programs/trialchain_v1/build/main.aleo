program trialchain_v1.aleo;

record PatientCredential:
    owner as address.private;
    issuer_hash as field.private;
    age as u8.private;
    condition_hash as field.private;
    lab_value as u64.private;
    credential_id as field.private;

record EnrollmentReceipt:
    owner as address.private;
    trial_id as field.private;
    nullifier as field.private;
    compensation_usdc as u64.private;

record SponsorKey:
    owner as address.private;
    trial_id as field.private;
    salt as field.private;

struct TrialData:
    sponsor_hash as field;
    title_hash as field;
    protocol_hash as field;
    min_age as u8;
    max_age as u8;
    required_condition_hash as field;
    max_enrollment as u32;
    compensation_usdc as u64;
    result_deadline_block as u32;
    status as u8;

struct NullifierInput:
    patient as address;
    trial_id as field;

struct ResultInput:
    result_hash as field;
    salt as field;

mapping trial_registry:
    key as field.public;
    value as TrialData.public;

mapping enrollment_counts:
    key as field.public;
    value as u32.public;

mapping result_commitments:
    key as field.public;
    value as field.public;

mapping revealed_results:
    key as field.public;
    value as field.public;

mapping used_nullifiers:
    key as field.public;
    value as boolean.public;

mapping sponsor_trial_count:
    key as field.public;
    value as u32.public;

mapping trial_status:
    key as field.public;
    value as u8.public;

function register_trial:
    input r0 as field.public;
    input r1 as field.public;
    input r2 as field.public;
    input r3 as u8.public;
    input r4 as u8.public;
    input r5 as field.public;
    input r6 as u32.public;
    input r7 as u64.public;
    input r8 as u32.public;
    input r9 as field.private;
    input r10 as field.private;
    lt r3 r4 into r11;
    assert.eq r11 true;
    gt r6 0u32 into r12;
    assert.eq r12 true;
    lte r6 10000u32 into r13;
    assert.eq r13 true;
    gte r7 1000000u64 into r14;
    assert.eq r14 true;
    hash.bhp256 self.signer into r15 as field;
    cast r10 r9 into r16 as ResultInput;
    hash.bhp256 r16 into r17 as field;
    cast r15 r1 r2 r3 r4 r5 r6 r7 r8 0u8 into r18 as TrialData;
    cast self.signer r0 r9 into r19 as SponsorKey.record;
    async register_trial r0 r8 r18 r17 r15 into r20;
    output r19 as SponsorKey.record;
    output r20 as trialchain_v1.aleo/register_trial.future;

finalize register_trial:
    input r0 as field.public;
    input r1 as u32.public;
    input r2 as TrialData.public;
    input r3 as field.public;
    input r4 as field.public;
    contains trial_registry[r0] into r5;
    not r5 into r6;
    assert.eq r6 true;
    gt r1 block.height into r7;
    assert.eq r7 true;
    set r2 into trial_registry[r0];
    set 0u32 into enrollment_counts[r0];
    set r3 into result_commitments[r0];
    set 0u8 into trial_status[r0];
    get.or_use sponsor_trial_count[r4] 0u32 into r8;
    add r8 1u32 into r9;
    set r9 into sponsor_trial_count[r4];

function issue_credential:
    input r0 as address.public;
    input r1 as u8.private;
    input r2 as field.private;
    input r3 as u64.private;
    input r4 as field.public;
    hash.bhp256 self.signer into r5 as field;
    gte r1 18u8 into r6;
    assert.eq r6 true;
    lte r1 120u8 into r7;
    assert.eq r7 true;
    cast r0 r5 r1 r2 r3 r4 into r8 as PatientCredential.record;
    output r8 as PatientCredential.record;

function enroll_patient:
    input r0 as PatientCredential.record;
    input r1 as field.public;
    input r2 as u8.public;
    input r3 as u8.public;
    input r4 as field.public;
    input r5 as u64.public;
    is.eq r0.owner self.signer into r6;
    assert.eq r6 true;
    gte r0.age r2 into r7;
    assert.eq r7 true;
    lte r0.age r3 into r8;
    assert.eq r8 true;
    is.eq r0.condition_hash r4 into r9;
    assert.eq r9 true;
    cast self.signer r1 into r10 as NullifierInput;
    hash.bhp256 r10 into r11 as field;
    cast self.signer r1 r11 r5 into r12 as EnrollmentReceipt.record;
    async enroll_patient r1 r2 r3 r4 r5 r11 into r13;
    output r12 as EnrollmentReceipt.record;
    output r13 as trialchain_v1.aleo/enroll_patient.future;

finalize enroll_patient:
    input r0 as field.public;
    input r1 as u8.public;
    input r2 as u8.public;
    input r3 as field.public;
    input r4 as u64.public;
    input r5 as field.public;
    get trial_registry[r0] into r6;
    is.eq r6.min_age r1 into r7;
    assert.eq r7 true;
    is.eq r6.max_age r2 into r8;
    assert.eq r8 true;
    is.eq r6.required_condition_hash r3 into r9;
    assert.eq r9 true;
    is.eq r6.compensation_usdc r4 into r10;
    assert.eq r10 true;
    get.or_use trial_status[r0] 0u8 into r11;
    is.eq r11 0u8 into r12;
    assert.eq r12 true;
    get.or_use used_nullifiers[r5] false into r13;
    not r13 into r14;
    assert.eq r14 true;
    set true into used_nullifiers[r5];
    get.or_use enrollment_counts[r0] 0u32 into r15;
    lt r15 r6.max_enrollment into r16;
    assert.eq r16 true;
    add r15 1u32 into r17;
    set r17 into enrollment_counts[r0];
    is.eq r17 r6.max_enrollment into r18;
    branch.eq r18 false to end_then_0_0;
    set 1u8 into trial_status[r0];
    branch.eq true true to end_otherwise_0_1;
    position end_then_0_0;
    position end_otherwise_0_1;

function commit_results:
    input r0 as SponsorKey.record;
    input r1 as field.public;
    input r2 as field.public;
    is.eq r0.trial_id r1 into r3;
    assert.eq r3 true;
    is.eq r0.owner self.signer into r4;
    assert.eq r4 true;
    cast r2 r0.salt into r5 as ResultInput;
    hash.bhp256 r5 into r6 as field;
    async commit_results r1 r6 r2 into r7;
    output r7 as trialchain_v1.aleo/commit_results.future;

finalize commit_results:
    input r0 as field.public;
    input r1 as field.public;
    input r2 as field.public;
    get.or_use trial_status[r0] 0u8 into r3;
    is.neq r3 2u8 into r4;
    assert.eq r4 true;
    is.neq r3 3u8 into r5;
    assert.eq r5 true;
    get result_commitments[r0] into r6;
    is.eq r6 r1 into r7;
    assert.eq r7 true;
    set r2 into revealed_results[r0];
    set 2u8 into trial_status[r0];

function verify_enrollment:
    input r0 as EnrollmentReceipt.record;
    input r1 as field.public;
    is.eq r0.owner self.signer into r2;
    assert.eq r2 true;
    is.eq r0.trial_id r1 into r3;
    assert.eq r3 true;
    hash.bhp256 r0.nullifier into r4 as field;
    output r4 as field.private;
