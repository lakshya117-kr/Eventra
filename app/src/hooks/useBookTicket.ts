import { useState, useCallback } from 'react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { useProgram } from './useProgram';
import { SEEDS } from '../utils/constants';
import { generateSecret, computeCommitment, storeTicketSecret, toHex } from '../utils/zk';
import toast from 'react-hot-toast';

export function useBookTicket() {
  const { program, wallet } = useProgram();
  const [loading, setLoading] = useState(false);

  const bookTicket = useCallback(async (eventPublicKey: PublicKey, organizerKey: PublicKey) => {
    if (!program || !wallet.publicKey) return;
    setLoading(true);
    try {
      // 1. Generate ZK commitment
      const secret = generateSecret();
      const commitment = await computeCommitment(secret);
      const commitmentArray = Array.from(commitment);

      // 2. Derive PDAs
      const [xMint] = PublicKey.findProgramAddressSync([SEEDS.X_MINT], program.programId);
      const buyerTokenAccount = await getAssociatedTokenAddress(xMint, wallet.publicKey);
      const organizerTokenAccount = await getAssociatedTokenAddress(xMint, organizerKey);

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
  }, [program, wallet.publicKey]);

  return { bookTicket, loading };
}
