import { PublicKey } from '@solana/web3.js';

export interface UserConfig {
  user: PublicKey;
  xMint: PublicKey;
  userTokenAccount: PublicKey;
  solanaPrice: number;
  tokenPerPurchase: number;
  bump: number;
}

export interface Organizer {
  authority: PublicKey;
  reputationScore: number;
  totalEventHosted: number;
  bump: number;
}

export interface EventAccount {
  name: string;
  organizer: PublicKey;
  eventId: number;
  ticketPrice: number;
  maxTicket: number;
  ticketSold: number;
  eventMetadata: string;
  bump: number;
}

export interface CustomerProfile {
  customer: PublicKey;
  userTokenAccount: PublicKey;
  loyalityPoints: number;
  bump: number;
}

export interface TicketRecord {
  event: PublicKey;
  commitment: number[];
  isUsed: boolean;
  bump: number;
}

export interface ZkNullifierRegistry {
  nullifierHash: number[];
  claimedAt: number;
  bump: number;
}

// Parsed event with metadata from IPFS
export interface ParsedEvent {
  publicKey: PublicKey;
  account: EventAccount;
  metadata?: EventMetadata;
}

export interface EventMetadata {
  name: string;
  description: string;
  image: string;
  rawImage?: string;
  date?: string;
  location?: string;
  category?: string;
}
