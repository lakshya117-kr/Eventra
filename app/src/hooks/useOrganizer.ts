import { useState, useCallback } from 'react';
import { PublicKey, SystemProgram, ComputeBudgetProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { useProgram } from './useProgram';
import { SEEDS } from '../utils/constants';
import { Organizer } from '../types';
import toast from 'react-hot-toast';

export function useOrganizer() {
  const { program, wallet } = useProgram();
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchOrganizer = useCallback(async () => {
    if (!program || !wallet.publicKey) return;
    try {
      const [pda] = PublicKey.findProgramAddressSync(
        [SEEDS.REGISTER_ORGANIZER, wallet.publicKey.toBuffer()],
        program.programId
      );
      const account = await (program.account as any).organizer.fetch(pda);
      setOrganizer({
        authority: account.authority as PublicKey,
        name: account.name as string,
        reputationScore: Number(account.reputationScore),
        totalEventHosted: Number(account.totalEventHosted),
        bump: account.bump,
      });
    } catch (e: any) {
      if (e.message && e.message.includes('Account does not exist')) {
        setOrganizer(null);
      } else {
        toast.error('Failed to load organizer. Network issue?');
      }
    }
  }, [program, wallet.publicKey]);

  const registerOrganizer = useCallback(async (name: string) => {
    if (!program || !wallet.publicKey) return;
    setLoading(true);
    try {
      const [organizerAccount] = PublicKey.findProgramAddressSync(
        [SEEDS.REGISTER_ORGANIZER, wallet.publicKey.toBuffer()],
        program.programId
      );
      await program.methods
        .createOrganization(name)
        .accounts({
          organizer: wallet.publicKey,
          organizerAccount,
          systemProgram: SystemProgram.programId,
        })
        .preInstructions([ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100_000 })])
        .rpc();

      toast.success('Registered as organizer!');
      await fetchOrganizer();
    } catch (e: any) {
      toast.error(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey, fetchOrganizer]);

  const createEvent = useCallback(async (
    ticketPrice: number,
    maxTicket: number,
    eventMetadata: string,
    eventName: string,
  ) => {
    if (!program || !wallet.publicKey || !organizer) return;
    setLoading(true);
    try {
      const [organizerAccount] = PublicKey.findProgramAddressSync(
        [SEEDS.REGISTER_ORGANIZER, wallet.publicKey.toBuffer()],
        program.programId
      );

      const eventIdBytes = new BN(organizer.totalEventHosted).toArrayLike(Buffer, 'le', 8);
      const [eventAccount] = PublicKey.findProgramAddressSync(
        [SEEDS.CREATE_EVENT, wallet.publicKey.toBuffer(), eventIdBytes],
        program.programId
      );

      await program.methods
        .createEvent(new BN(ticketPrice), new BN(maxTicket), eventMetadata, eventName)
        .accounts({
          organizer: wallet.publicKey,
          eventAccount,
          organizerAccount,
          systemProgram: SystemProgram.programId,
        })
        .preInstructions([ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100_000 })])
        .rpc();

      toast.success('Event created!');
      await fetchOrganizer();
    } catch (e: any) {
      toast.error(e.message || 'Event creation failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey, organizer, fetchOrganizer]);

  return { organizer, fetchOrganizer, registerOrganizer, createEvent, loading };
}
