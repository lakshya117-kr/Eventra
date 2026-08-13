import { useState, useCallback } from 'react';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { BN } from '@coral-xyz/anchor';
import { useProgram } from './useProgram';
import { SEEDS } from '../utils/constants';
import toast from 'react-hot-toast';

export function useTokenEconomy() {
  const { program, wallet, connection } = useProgram();
  const [loading, setLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [solBalance, setSolBalance] = useState<number>(0);

  const refreshBalances = useCallback(async () => {
    if (!wallet.publicKey || !connection || !program) return;
    try {
      const sol = await connection.getBalance(wallet.publicKey);
      setSolBalance(sol / LAMPORTS_PER_SOL);

      const [xMint] = PublicKey.findProgramAddressSync([SEEDS.X_MINT], program.programId);
      const ata = await getAssociatedTokenAddress(xMint, wallet.publicKey);
      try {
        const info = await connection.getTokenAccountBalance(ata);
        // 1 unit of purchase in the contract = 100,000,000 raw tokens
        // Since decimals is 5, 1 unit purchase = 1,000 uiAmount (XTKN)
        // We show the raw uiAmount to avoid user confusion!
        setTokenBalance(Number(info.value.uiAmount || 0));
      } catch {
        setTokenBalance(0);
      }
    } catch (e) {
      console.error('Balance refresh failed:', e);
    }
  }, [wallet.publicKey, connection, program]);

  const buyTokens = useCallback(async (amount: number) => {
    if (!program || !wallet.publicKey) return;
    setLoading(true);
    try {
      const [xMint] = PublicKey.findProgramAddressSync([SEEDS.X_MINT], program.programId);
      const [mintAuthority] = PublicKey.findProgramAddressSync([SEEDS.MINT_AUTHORITY], program.programId);
      const [userConfig] = PublicKey.findProgramAddressSync([SEEDS.USER_CONFIG], program.programId);
      const [solVault] = PublicKey.findProgramAddressSync([SEEDS.SOL_VAULT], program.programId);
      const userTokenAccount = await getAssociatedTokenAddress(xMint, wallet.publicKey);

      const tx = await program.methods
        .buyToken(new BN(amount))
        .accounts({
          buyer: wallet.publicKey,
          xMint,
          userTokenAccount,
          userConfig,
          solVault,
          mintAuthority,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      toast.success(`Bought ${amount} token unit(s)!`);
      await refreshBalances();
      return tx;
    } catch (e: any) {
      if (e.message?.includes('AccountNotInitialized')) {
        toast.error('Please create your profile first!');
      } else {
        toast.error(e.message || 'Buy failed');
      }
      throw e;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey, refreshBalances]);

  const sellTokens = useCallback(async (amount: number) => {
    if (!program || !wallet.publicKey) return;
    setLoading(true);
    try {
      const [xMint] = PublicKey.findProgramAddressSync([SEEDS.X_MINT], program.programId);
      const [userConfig] = PublicKey.findProgramAddressSync([SEEDS.USER_CONFIG], program.programId);
      const [solVault] = PublicKey.findProgramAddressSync([SEEDS.SOL_VAULT], program.programId);
      const userTokenAccount = await getAssociatedTokenAddress(xMint, wallet.publicKey);

      const tx = await program.methods
        .sellToken(new BN(amount))
        .accounts({
          buyer: wallet.publicKey,
          userTokenAccount,
          xMint,
          userConfig,
          solVault,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      toast.success(`Sold ${amount} token unit(s)!`);
      await refreshBalances();
      return tx;
    } catch (e: any) {
      if (e.message?.includes('AccountNotInitialized')) {
        toast.error('Please create your profile first!');
      } else {
        toast.error(e.message || 'Sell failed');
      }
      throw e;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey, refreshBalances]);

  return { buyTokens, sellTokens, refreshBalances, tokenBalance, solBalance, loading };
}
