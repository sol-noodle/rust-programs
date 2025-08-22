#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("EyZiTPLwas3qNsrXSuxSSQEkb5VFEQFEp1kSKc2q3teL");

#[program]
pub mod crud {

    use super::*;

    pub fn create_journal_entry(
        ctx: Context<CreateJournalEntry>,
        title: String,
        message: String,  
    ) -> Result<()> {
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.owner = *ctx.accounts.owner.key;
        journal_entry.title = title;
        journal_entry.message = message;
        Ok(())
    }

    pub fn update_journal_entry(
        ctx: Context<UpdateJournalEntry>,
        _title: String,
        message: String
    ) -> Result<()> {
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.message = message;
        Ok(())
    }

    pub fn delete_journal_entry(_ctx: Context<DeleteJournalEntry>, title: String) -> Result<()> {
        msg!("Journal Entry title {} deleted", title);
        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct JournalEntryState {
    pub owner: Pubkey,
    #[max_len(50)]
    pub title: String,
    #[max_len(1000)]
    pub message: String,
}


#[derive(Accounts)]
#[instruction(title:String, message:String)]
pub struct CreateJournalEntry<'info> {
     #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        seeds = [title.as_bytes(), owner.key().as_ref()], 
        bump, 
        payer = owner, 
        space =  8 + JournalEntryState::INIT_SPACE
    )]
    pub journal_entry: Account<'info, JournalEntryState>,
   
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title:String, message: String)]
pub struct UpdateJournalEntry<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        realloc = 8 + JournalEntryState::INIT_SPACE,
        realloc::payer = owner,
        realloc::zero = true
    )]
    pub journal_entry: Account<'info, JournalEntryState>,
    pub system_program: Program<'info, System>
}


#[derive(Accounts)]
#[instruction(title:String)]
pub struct DeleteJournalEntry<'info>{
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds=[title.as_bytes(), owner.key().as_ref()],
        bump,
        close=owner
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

    pub system_program: Program<'info, System>
}
