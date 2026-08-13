import { useState, useCallback } from 'react';
import { PublicKey, SystemProgram, ComputeBudgetProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { useProgram } from './useProgram';
import { SEEDS } from '../utils/constants';
import { CustomerProfile } from '../types';
import toast from 'react-hot-toast';

export function useProfile() {
  const { program, wallet } = useProgram();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!program || !wallet.publicKey) return;
    try {
      const [pda] = PublicKey.findProgramAddressSync(
        [SEEDS.CREATE_PROFILE, wallet.publicKey.toBuffer()],
        program.programId
      );
      const account = await (program.account as any).customerProfile.fetch(pda);
      setProfile({
        customer: account.customer as PublicKey,
        userTokenAccount: account.userTokenAccount as PublicKey,
        loyalityPoints: Number(account.loyalityPoints),
        bump: account.bump,
      });
    } catch (e: any) {
      if (e.message && e.message.includes('Account does not exist')) {
        setProfile(null);
      } else {
        toast.error('Failed to load profile. Network issue?');
        // Keep the previous profile state or null
      }
    }
  }, [program, wallet.publicKey]);

  const createProfile = useCallback(async () => {
    if (!program || !wallet.publicKey) return;
    setLoading(true);
    try {
      const [userAccount] = PublicKey.findProgramAddressSync(
        [SEEDS.CREATE_PROFILE, wallet.publicKey.toBuffer()],
        program.programId
      );
      const [xMint] = PublicKey.findProgramAddressSync([SEEDS.X_MINT], program.programId);
      const userTokenAccount = await getAssociatedTokenAddress(xMint, wallet.publicKey);

      await program.methods
        .createProfile()
        .accounts({
          user: wallet.publicKey,
          userAccount,
          userTokenAccount,
          xMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .preInstructions([ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100_000 })])
        .rpc();

      toast.success('Profile created!');
      await fetchProfile();
    } catch (e: any) {
      toast.error(e.message || 'Profile creation failed');
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey, fetchProfile]);

  return { profile, fetchProfile, createProfile, loading };
}
