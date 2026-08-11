/**
 * Client-side ZK commitment and nullifier utilities.
 * Uses Web Crypto API (SHA-256) for commitment generation.
 */

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

/**
 * Generate mock Groth16 proof bytes for demo purposes.
 * In production, this would use a real ZK proving system (e.g., snarkjs).
 */
export function generateMockProof(): {
  proofA: number[];
  proofB: number[];
  proofC: number[];
} {
  return {
    proofA: Array.from(crypto.getRandomValues(new Uint8Array(64))),
    proofB: Array.from(crypto.getRandomValues(new Uint8Array(128))),
    proofC: Array.from(crypto.getRandomValues(new Uint8Array(64))),
  };
}

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
