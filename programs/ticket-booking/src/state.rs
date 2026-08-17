use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct UserConfig {
    pub user: Pubkey,
    pub x_mint: Pubkey,
    pub user_token_account: Pubkey,
    pub solana_price: u64,
    pub token_per_purchase: u64,
    pub bump: u8,
}
#[account]
#[derive(InitSpace)]
pub struct Organizer {
    pub authority: Pubkey,
    #[max_len(32)]
    pub name: String,
    pub reputation_score: u64,
    pub total_event_hosted: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Event {
    #[max_len(50)]
    pub name : String,
    pub organizer: Pubkey,
    pub event_id: u64,
    pub ticket_price: u64,
    pub max_ticket: u64,
    pub ticket_sold: u64,

    #[max_len(100)]
    pub event_metadata: String,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct CustomerProfile {
    pub customer: Pubkey,
    pub user_token_account: Pubkey,
    pub loyality_points: u64,
    pub bump: u8,
}

// like we st ill have to make token for users we just made it for admin right nwo

// zkp part

#[account]
#[derive(InitSpace)]
pub struct TicketRecord {
    pub event: Pubkey,
    pub commitment: [u8; 32], // secret for ticket verification
    pub is_used: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct ZkNullifierRegistry {
    pub nullifier_hash: [u8; 32], // The one-time-use footprint to stop double-spending
    pub claimed_at: i64,          // Timestamp of entry
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct nftTokens{
    pub name : String,
    pub symbol : String,
    pub uri : String,
}

