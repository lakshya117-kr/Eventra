import { PublicKey } from '@solana/web3.js';

export const PROGRAM_ID = new PublicKey('E4mfiMWpSeubf7Vu6RmxDGEvcsM2X8tD5shQRFDTgR26');
export const RPC_ENDPOINT = import.meta.env.VITE_RPC_ENDPOINT || 'https://api.devnet.solana.com';
export const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || '';
export const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud';

// PDA seeds matching context.rs
export const SEEDS = {
  X_MINT: Buffer.from('x_mint'),
  MINT_AUTHORITY: Buffer.from('mint_authority'),
  USER_CONFIG: Buffer.from('user_config'),
  SOL_VAULT: Buffer.from('sol_vault'),
  REGISTER_ORGANIZER: Buffer.from('register_organizer'),
  CREATE_EVENT: Buffer.from('create_event'),
  CREATE_PROFILE: Buffer.from('create_profile'),
  TICKET: Buffer.from('ticket'),
  NULLIFIER: Buffer.from('nullifier'),
} as const;

export const TOKEN_DECIMALS = 5;
