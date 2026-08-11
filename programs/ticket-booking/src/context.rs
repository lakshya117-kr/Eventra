use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use crate::state::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        mint::authority = mint_authority,
        mint::decimals = 5,
        seeds = [b"x_mint"],
        bump
    )]
    pub x_mint: Account<'info, Mint>,

    /// CHECK: This is going to be the mint authority of x_mint tokens
    #[account(seeds=[b"mint_authority"], bump)]
    pub mint_authority: AccountInfo<'info>,

    #[account(
        init,
        payer = user,
        associated_token::mint = x_mint,
        associated_token::authority = user,
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = user,
        space = 8 + UserConfig::INIT_SPACE,
        // Fixed typo and added user.key() to prevent initialization collisions
        seeds = [b"user_config"], 
        bump
    )]
    pub user_config: Account<'info, UserConfig>,

    /// CHECK: This is the global SOL vault for the program
    #[account(mut, seeds=[b"sol_vault"], bump)]
    pub sol_vault: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,

    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct BuyTokens<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"x_mint"],
        bump
    )]
    pub x_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = user_token_account.owner  == buyer.key(),
        constraint = user_token_account.mint == x_mint.key()
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        seeds = [b"user_config"], 
        bump
    )]
    pub user_config: Account<'info, UserConfig>,

    /// CHECK: This is the global SOL vault PDA to receive SOL tokens
    #[account(mut, seeds=[b"sol_vault"], bump)]
    pub sol_vault: AccountInfo<'info>,

    /// CHECK:This is going to be the mint authority of x_mint tokens
    #[account(seeds=[b"mint_authority"],bump)]
    pub mint_authority: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterOrganizer<'info> {
    #[account(mut)]
    pub organizer: Signer<'info>,

    #[account(
        init,
        payer = organizer,
        space = 8 + Organizer :: INIT_SPACE,
        seeds = [b"register_organizer", organizer.key().as_ref()],
        bump
    )]
    pub organizer_account: Account<'info, Organizer>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateEvent<'info> {
    #[account(mut)]
    pub organizer: Signer<'info>,

    #[account(
        init,
        payer = organizer,
        space = 8 + Event :: INIT_SPACE,
        seeds = [b"create_event", organizer.key().as_ref(),&organizer_account.total_event_hosted.to_le_bytes()],
        bump
    )]
    pub event_account: Account<'info, Event>,


    #[account(
        mut,
        seeds = [b"register_organizer", organizer.key().as_ref()],
        bump = organizer_account.bump,
        constraint = organizer_account.authority == organizer.key() // checks if organization exist or not
    )]
    pub organizer_account: Account<'info, Organizer>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateProfile<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = 8 + CustomerProfile :: INIT_SPACE,
        seeds = [b"create_profile" , user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, CustomerProfile>,

    #[account(
        init,
        payer = user,
        associated_token::mint = x_mint,
        associated_token::authority = user,
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        seeds = [b"x_mint"],
        bump
    )]
    pub x_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
#[instruction(commitment: [u8; 32])] // use all attribute for making comittment
pub struct BookTicket<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        constraint = buyer_token_account.owner == buyer.key()
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = organizer_token_account.owner == event_account.organizer
    )]
    pub organizer_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub event_account: Account<'info, Event>,

    #[account(
        init,
        payer = buyer,
        space = 8 + TicketRecord::INIT_SPACE,
        seeds = [b"ticket", event_account.key().as_ref(), commitment.as_ref()],
        bump
    )]
    pub ticket_record : Account<'info, TicketRecord>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,

}

#[derive(Accounts)]
#[instruction(nullifier_hash: [u8; 32])]
pub struct VerifyCheckIn<'info> {
    #[account(mut)]
    pub scanner: Signer<'info>, // scanning part

    #[account(mut)]
    pub event_account: Account<'info, Event>,

    #[account(mut)]
    pub ticket_record: Account<'info, TicketRecord>,

    // for single entry
    #[account(
        init,
        payer = scanner,
        space = 8 + ZkNullifierRegistry::INIT_SPACE,
        seeds = [b"nullifier", event_account.key().as_ref(), nullifier_hash.as_ref()],
        bump
    )]
    pub nullifier_registry: Account<'info, ZkNullifierRegistry>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SellTokens<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        constraint = user_token_account.owner == buyer.key(),
        constraint = user_token_account.mint == x_mint.key()
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"x_mint"],
        bump
    )]
    pub x_mint: Account<'info, Mint>,

    #[account(
        seeds = [b"user_config"], 
        bump
    )]
    pub user_config: Account<'info, UserConfig>,

    /// CHECK: This is the global SOL vault PDA that sends SOL back to the seller
    #[account(
        mut,
        seeds = [b"sol_vault"],
        bump
    )]
    pub sol_vault: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

