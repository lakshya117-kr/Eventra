import { PublicKey } from '@solana/web3.js';

export const PROGRAM_ID = new PublicKey('CRGSNcfeaJ5cFHyZTuwU1A15HxABMK6p5EAcFhU1tcUc');
export const RPC_ENDPOINT = import.meta.env.VITE_RPC_ENDPOINT || 'https://api.devnet.solana.com';
export const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || '';
export const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud';

// PDA seeds matching context.rs
// Use TextEncoder instead of Buffer.from to avoid polyfill race conditions
const _e = new TextEncoder();
export const SEEDS = {
  X_MINT: _e.encode('x_mint'),
  MINT_AUTHORITY: _e.encode('mint_authority'),
  USER_CONFIG: _e.encode('user_config'),
  SOL_VAULT: _e.encode('sol_vault'),
  REGISTER_ORGANIZER: _e.encode('register_organizer'),
  CREATE_EVENT: _e.encode('create_event'),
  CREATE_PROFILE: _e.encode('create_profile'),
  TICKET: _e.encode('ticket'),
  NULLIFIER: _e.encode('nullifier'),
} as const;

export const TOKEN_DECIMALS = 5;
