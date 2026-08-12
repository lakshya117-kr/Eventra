use sha256::digest;

// ZK Ticket Verification Circuit
//
// Privacy Goal: Prove "I own a valid ticket" without revealing WHO bought it.
//
// Private inputs (known only to the prover / ticket holder):
//   - secret: The 32-byte random value generated at booking time
//
// Public inputs (visible on-chain / to the verifier):
//   - commitment: SHA-256(secret) -- stored on-chain in the TicketRecord
//   - nullifier_hash: SHA-256(secret || event_key) -- prevents double check-in
//   - event_key: The event public key bytes (32 bytes)

fn main(
    // Private input -- the ticket holder's secret
    secret: [u8; 32],
    // Public inputs -- verifiable by anyone
    commitment: pub [u8; 32],
    nullifier_hash: pub [u8; 32],
    event_key: pub [u8; 32],
) {
    // Constraint 1: Verify the commitment matches SHA-256(secret)
    let computed_commitment: [u8; 32] = digest(secret);
    assert(computed_commitment == commitment, "Commitment mismatch: SHA-256(secret) != commitment");

    // Constraint 2: Verify the nullifier hash matches SHA-256(secret || event_key)
    let mut nullifier_preimage: [u8; 64] = [0; 64];
    for i in 0..32 {
        nullifier_preimage[i] = secret[i];
    }
    for i in 0..32 {
        nullifier_preimage[32 + i] = event_key[i];
    }

    let computed_nullifier: [u8; 32] = digest(nullifier_preimage);
    assert(
        computed_nullifier == nullifier_hash,
        "Nullifier mismatch: SHA-256(secret || event_key) != nullifier_hash",
    );
}

// ===================== TESTS =====================

#[test]
fn test_valid_ticket() {
    let secret: [u8; 32] = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
        25, 26, 27, 28, 29, 30, 31, 32,
    ];

    let event_key: [u8; 32] = [
        100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117,
        118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131,
    ];

    let commitment: [u8; 32] = digest(secret);

    let mut nullifier_preimage: [u8; 64] = [0; 64];
    for i in 0..32 {
        nullifier_preimage[i] = secret[i];
    }
    for i in 0..32 {
        nullifier_preimage[32 + i] = event_key[i];
    }
    let nullifier_hash: [u8; 32] = digest(nullifier_preimage);

    // This should pass -- correct secret provided
    main(secret, commitment, nullifier_hash, event_key);
}

#[test(should_fail_with = "Commitment mismatch")]
fn test_wrong_secret_fails() {
    let real_secret: [u8; 32] = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
        25, 26, 27, 28, 29, 30, 31, 32,
    ];
    let fake_secret: [u8; 32] = [
        99, 99, 99, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
        24, 25, 26, 27, 28, 29, 30, 31, 32,
    ];
    let event_key: [u8; 32] = [
        100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117,
        118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131,
    ];

    let commitment: [u8; 32] = digest(real_secret);

    let mut nullifier_preimage: [u8; 64] = [0; 64];
    for i in 0..32 {
        nullifier_preimage[i] = real_secret[i];
    }
    for i in 0..32 {
        nullifier_preimage[32 + i] = event_key[i];
    }
    let nullifier_hash: [u8; 32] = digest(nullifier_preimage);

    // Try with fake secret -- should fail at commitment check
    main(fake_secret, commitment, nullifier_hash, event_key);
}
