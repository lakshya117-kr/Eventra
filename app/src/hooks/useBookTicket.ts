import { useState, useCallback } from 'react';
import { PublicKey, SystemProgram, ComputeBudgetProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { useProgram } from './useProgram';
import { SEEDS, TOKEN_DECIMALS } from '../utils/constants';
import { generateSecret, computeCommitment, storeTicketSecret, toHex } from '../utils/zk';
import toast from 'react-hot-toast';

export function useBookTicket() {
  const { program, wallet, connection } = useProgram();
  const [loading, setLoading] = useState(false);

  const bookTicket = useCallback(async (eventPublicKey: PublicKey, organizerKey: PublicKey, ticketPriceRaw: number) => {
    if (!program || !wallet.publicKey || !connection) return;
    setLoading(true);
    try {
      // 0. Pre-flight checks
      // Prevent self-booking (buyer is the organizer — transfer goes to yourself)
      if (wallet.publicKey.equals(organizerKey)) {
        toast.error('You cannot buy a ticket to your own event!');
        return;
      }

      // Check buyer has enough XTKN
      const [xMint] = PublicKey.findProgramAddressSync([SEEDS.X_MINT], program.programId);
      const buyerTokenAccount = await getAssociatedTokenAddress(xMint, wallet.publicKey);

      try {
        const balInfo = await connection.getTokenAccountBalance(buyerTokenAccount);
        const rawBalance = Number(balInfo.value.amount);
        if (rawBalance < ticketPriceRaw) {
          const needed = ticketPriceRaw / 10 ** TOKEN_DECIMALS;
          const have = rawBalance / 10 ** TOKEN_DECIMALS;
          toast.error(`Insufficient XTKN! Need ${needed} but you have ${have}. Buy more tokens first.`);
          return;
        }
      } catch {
        toast.error('You don\'t have a token account. Please create your profile first!');
        return;
      }

      // Check organizer has a token account to receive
      const organizerTokenAccount = await getAssociatedTokenAddress(xMint, organizerKey);
      try {
        await connection.getTokenAccountBalance(organizerTokenAccount);
      } catch {
        toast.error('The event organizer has not set up their token account yet. Contact the organizer.');
        return;
      }

      // 1. Generate ZK commitment
      const secret = generateSecret();
      const commitment = await computeCommitment(secret);
      const commitmentArray = Array.from(commitment);

      // 2. Derive ticket record PDA
      const [ticketRecord] = PublicKey.findProgramAddressSync(
        [SEEDS.TICKET, eventPublicKey.toBuffer(), Buffer.from(commitment)],
        program.programId
      );

      // 3. Send transaction
      const tx = await program.methods
        .bookTicket(commitmentArray)
        .accounts({
          buyer: wallet.publicKey,
          buyerTokenAccount,
          organizerTokenAccount,
          eventAccount: eventPublicKey,
          ticketRecord,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .preInstructions([ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100_000 })])
        .rpc();

      // 4. Store secret for later check-in
      storeTicketSecret(eventPublicKey.toString(), toHex(commitment), secret);

      toast.success('Ticket booked! ZK commitment stored securely.');
      return { tx, commitment: toHex(commitment), ticketRecord };
    } catch (e: any) {
      toast.error(e.message || 'Booking failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey, connection]);

  return { bookTicket, loading };
}
