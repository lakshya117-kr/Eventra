/**
 * Client-side ZK commitment, nullifier, and Noir proof utilities.
 * Uses Web Crypto API (SHA-256) for commitment/nullifier generation
 * and @noir-lang/noir_js + @aztec/bb.js for ZK proof generation.
 */

import { Noir } from '@noir-lang/noir_js';
import { UltraHonkBackend } from '@noir-lang/backend_barretenberg';
import circuit from './circuit.json';

// ===================== TYPES =====================

export interface ZKProofResult {
  proof: Uint8Array;
  publicInputs: string[];
  verified: boolean;
}

// ===================== CRYPTO PRIMITIVES =====================

/** Generate a random 32-byte secret */
export function generateSecret(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

/** Compute SHA-256 commitment from a secret */
export async function computeCommitment(secret: Uint8Array): Promise<Uint8Array> {
  const hash = await crypto.subtle.digest('SHA-256', secret as BufferSource);
  return new Uint8Array(hash);
}

/** Compute nullifier hash = SHA-256(secret || eventPubkey) */
export async function computeNullifierHash(
  secret: Uint8Array,
  eventPubkeyBytes: Uint8Array
): Promise<Uint8Array> {
  const combined = new Uint8Array(secret.length + eventPubkeyBytes.length);
  combined.set(secret, 0);
  combined.set(eventPubkeyBytes, secret.length);
  const hash = await crypto.subtle.digest('SHA-256', combined as BufferSource);
  return new Uint8Array(hash);
}

// ===================== NOIR ZK PROOF GENERATION =====================

let _noir: Noir | null = null;
let _backend: UltraHonkBackend | null = null;

/**
 * Lazy-initialize the Noir circuit and backend.
 * These are heavy WASM objects so we only create them once.
 */
async function getNoirInstances(): Promise<{ noir: Noir; backend: UltraHonkBackend }> {
  if (!_noir || !_backend) {
    // @ts-ignore - circuit.json is a compiled Noir artifact
    _backend = new UltraHonkBackend(circuit);
    // @ts-ignore
    _noir = new Noir(circuit);
  }
  return { noir: _noir, backend: _backend };
}

/**
 * Generate a real ZK proof using the Noir circuit.
 *
 * Proves: "I know a secret whose SHA-256 equals the on-chain commitment,
 * and I can compute the correct nullifier for this event"
 * WITHOUT revealing the secret itself.
 *
 * @param secret - The private 32-byte ticket secret
 * @param commitment - SHA-256(secret) stored on-chain
 * @param nullifierHash - SHA-256(secret || event_key)
 * @param eventKeyBytes - The event's public key (32 bytes)
 */
export async function generateZKProof(
  secret: Uint8Array,
  commitment: Uint8Array,
  nullifierHash: Uint8Array,
  eventKeyBytes: Uint8Array,
): Promise<ZKProofResult> {
  const { noir, backend } = await getNoirInstances();

  // Convert byte arrays to the format Noir expects (hex strings for each byte)
  const inputs = {
    secret: Array.from(secret).map((b) => '0x' + b.toString(16).padStart(2, '0')),
    commitment: Array.from(commitment).map((b) => '0x' + b.toString(16).padStart(2, '0')),
    nullifier_hash: Array.from(nullifierHash).map((b) => '0x' + b.toString(16).padStart(2, '0')),
    event_key: Array.from(eventKeyBytes).map((b) => '0x' + b.toString(16).padStart(2, '0')),
  };

  console.log('[ZK] Executing Noir circuit to generate witness...');
  const { witness } = await noir.execute(inputs);

  console.log('[ZK] Generating UltraHonk proof...');
  const proof = await backend.generateProof(witness);

  console.log('[ZK] Verifying proof locally...');
  const verified = await backend.verifyProof(proof);
  console.log('[ZK] Proof verification result:', verified);

  return {
    proof: proof.proof,
    publicInputs: proof.publicInputs,
    verified,
  };
}

/**
 * Generate mock Groth16-format proof bytes for the smart contract.
 * The actual ZK verification happens client-side via Noir/UltraHonk.
 * These bytes are passed to the contract to maintain the correct
 * instruction signature (proof_a, proof_b, proof_c).
 */
export function formatProofForContract(): {
  proofA: number[];
  proofB: number[];
  proofC: number[];
} {
  // The on-chain Groth16 verification is currently disabled (commented out).
  // We fill the proof fields with zeros to maintain the correct tx structure.
  return {
    proofA: new Array(64).fill(0),
    proofB: new Array(128).fill(0),
    proofC: new Array(64).fill(0),
  };
}

// ===================== STORAGE =====================

/** Store ticket secret in localStorage for later check-in */
export function storeTicketSecret(eventKey: string, commitmentHex: string, secret: Uint8Array) {
  const tickets = JSON.parse(localStorage.getItem('zk_tickets') || '{}');
  tickets[`${eventKey}_${commitmentHex}`] = Array.from(secret);
  localStorage.setItem('zk_tickets', JSON.stringify(tickets));
}

/** Retrieve a stored ticket secret */
export function getTicketSecret(eventKey: string, commitmentHex: string): Uint8Array | null {
  const tickets = JSON.parse(localStorage.getItem('zk_tickets') || '{}');
  const secret = tickets[`${eventKey}_${commitmentHex}`];
  return secret ? new Uint8Array(secret) : null;
}

/** Convert Uint8Array to hex string */
export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}
