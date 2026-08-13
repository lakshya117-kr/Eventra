use anchor_lang::prelude::*;
pub mod context;
mod state;
pub use context::*;

declare_id!("CRGSNcfeaJ5cFHyZTuwU1A15HxABMK6p5EAcFhU1tcUc");
pub use anchor_lang::system_program;
use anchor_spl::token::{mint_to, MintTo, Transfer};
pub const VERIFYING_KEY: &[u8] = &[];

#[program]
mod ticket_Booking {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, sol_pri: u64) -> Result<()> {
        let user_config_account = &mut ctx.accounts.user_config;
        user_config_account.user = ctx.accounts.user.key();
        user_config_account.x_mint = ctx.accounts.x_mint.key();
        user_config_account.user_token_account = ctx.accounts.user_token_account.key();
        user_config_account.solana_price = sol_pri;
        user_config_account.token_per_purchase = 1000 * 100_000;
        user_config_account.bump = ctx.bumps.user_config;
        Ok(())
    }

    pub fn buy_token(ctx: Context<BuyTokens>,amount: u64) -> Result<()> {
        // let user_config_account = &mut ctx.accounts.user_config;
        let sol = ctx.accounts.user_config.solana_price;

        let base_tokens_per_unit = ctx.accounts.user_config.token_per_purchase;

        let total_sol_cost = sol.checked_mul(amount).ok_or(ErrorCode::MathError)?;
        let total_token_amount = base_tokens_per_unit.checked_mul(amount).ok_or(ErrorCode::MathError)?;


        let transfer_ix = system_program::Transfer {
            from: ctx.accounts.buyer.to_account_info(),
            to: ctx.accounts.sol_vault.to_account_info(),
        };

        system_program::transfer(
            CpiContext::new(ctx.accounts.system_program.to_account_info(), transfer_ix),
            total_sol_cost,
        )?;

        let mint_authority_seeds = &[b"mint_authority".as_ref(), &[ctx.bumps.mint_authority]];
        let signer_seeds = &[&mint_authority_seeds[..]];

        let cpi_account = MintTo {
            mint: ctx.accounts.x_mint.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_account,
            signer_seeds,
        );
        mint_to(cpi_ctx, total_token_amount)?;

        Ok(())
    }

    pub fn create_organization(ctx: Context<RegisterOrganizer>) -> Result<()> {
        let organizer_account = &mut ctx.accounts.organizer_account;
        organizer_account.authority = ctx.accounts.organizer.key();
        organizer_account.reputation_score = 0;
        organizer_account.total_event_hosted = 0;
        organizer_account.bump = ctx.bumps.organizer_account;
        Ok(())
    }

    pub fn create_event(
        ctx: Context<CreateEvent>,
        ticket_price: u64,
        max_ticket: u64,
        event_metadata: String,
        event_name : String,
    ) -> Result<()> {
        let event_account = &mut ctx.accounts.event_account;
        let organizer_account = &mut ctx.accounts.organizer_account;
        event_account.organizer = ctx.accounts.organizer.key();
        event_account.event_id = organizer_account.total_event_hosted + 1;
        organizer_account.total_event_hosted = organizer_account.total_event_hosted + 1;
        event_account.ticket_price = ticket_price;
        event_account.max_ticket = max_ticket;
        event_account.ticket_sold = 0;
        event_account.event_metadata = event_metadata;
        event_account.name = event_name;
        event_account.bump = ctx.bumps.event_account;
        Ok(())
    }

    pub fn create_profile(ctx: Context<CreateProfile>) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        // let organizer_account = &mut ctx.accounts.organizer_account;
        user_account.customer = ctx.accounts.user.key();
        user_account.user_token_account = ctx.accounts.user_token_account.key();
        user_account.loyality_points = 0;
        user_account.bump = ctx.bumps.user_account;

        Ok(())
    }

    pub fn book_ticket(ctx: Context<BookTicket>,commitment: [u8; 32]) -> Result<()> {
        let event_account = &mut ctx.accounts.event_account;
        let ticket_record = &mut ctx.accounts.ticket_record;

        // 1. Prevent overselling
        require!(
            event_account.ticket_sold < event_account.max_ticket, 
            ErrorCode::EventSoldOut
        );

        let cpi_accounts = Transfer {
            from: ctx.accounts.buyer_token_account.to_account_info(),
            to: ctx.accounts.organizer_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(), 
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        anchor_spl::token::transfer(cpi_ctx, event_account.ticket_price)?;

        ticket_record.event = event_account.key();
        ticket_record.commitment = commitment;
        ticket_record.is_used = false;
        ticket_record.bump = ctx.bumps.ticket_record;
        event_account.ticket_sold += 1;

        Ok(())
    }

    pub fn verify_check_in(
        ctx: Context<VerifyCheckIn>,
        nullifier_hash: [u8; 32],
        proof_a: [u8; 64], 
        proof_b: [u8; 128],
        proof_c: [u8; 64],
    ) -> Result<()> {
        let ticket = &mut ctx.accounts.ticket_record;
        let nullifier_registry = &mut ctx.accounts.nullifier_registry;

        require!(ticket.is_used==false, ErrorCode :: TicketAlreadyScanned);

        // TODO: Integrate ZK Proof verification once the Circom circuit is generated.
        // let mut public_inputs = Vec::new();
        // public_inputs.extend_from_slice(&ticket.commitment);
        // public_inputs.extend_from_slice(&nullifier_hash);    
        // let mut verifier = groth16_solana::groth16::Groth16Verifier::new(
        //     &proof_a,
        //     &proof_b,
        //     &proof_c,
        //     &[&ticket.commitment, &nullifier_hash],
        //     &VERIFYING_KEY, 
        // ).map_err(|_| ErrorCode::InvalidProofFormat)?;
        // require!(
        //     verifier.verify().map_err(|_| ErrorCode::MathError)?, 
        //     ErrorCode::InvalidZKProof
        // );

        ticket.is_used = true;

        nullifier_registry.nullifier_hash = nullifier_hash;
        nullifier_registry.claimed_at = Clock::get()?.unix_timestamp;
        nullifier_registry.bump = ctx.bumps.nullifier_registry;

        Ok(())
    }

    pub fn sell_token(ctx: Context<SellTokens>, amount: u64) -> Result<()> {
        let sol_price_per_unit = ctx.accounts.user_config.solana_price;
        let base_tokens_per_unit = ctx.accounts.user_config.token_per_purchase;

        let total_token_amount = base_tokens_per_unit.checked_mul(amount).ok_or(ErrorCode::MathError)?;
        let total_sol_payout = sol_price_per_unit.checked_mul(amount).ok_or(ErrorCode::MathError)?;

        let burn_accounts = anchor_spl::token::Burn {
            mint: ctx.accounts.x_mint.to_account_info(),
            from: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        
        anchor_spl::token::burn(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), burn_accounts),
            total_token_amount,
        )?;

        let sol_vault_seeds = &[b"sol_vault".as_ref(), &[ctx.bumps.sol_vault]];
        let signer_seeds = &[&sol_vault_seeds[..]];

        let transfer_sol_ix = system_program::Transfer {
            from: ctx.accounts.sol_vault.to_account_info(),
            to: ctx.accounts.buyer.to_account_info(),
        };

        system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                transfer_sol_ix,
                signer_seeds,
            ),
            total_sol_payout,
        )?;

        Ok(())
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("This event is completely sold out!")]
    EventSoldOut,
    #[msg("This ticket has already been scanned at the gate.")]
    TicketAlreadyScanned,
    #[msg("The proof format is invalid.")]
    InvalidProofFormat,
    #[msg("Internal math error during pairing check.")]
    MathError,
    #[msg("The Zero-Knowledge Proof is mathematically invalid!")]
    InvalidZKProof,
}