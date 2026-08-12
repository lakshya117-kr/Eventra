import { useState, useCallback } from 'react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useProgram } from './useProgram';
import { SEEDS } from '../utils/constants';
import { computeNullifierHash, generateZKProof, formatProofForContract, getTicketSecret, computeCommitment } from '../utils/zk';
import toast from 'react-hot-toast';

export function useVerifyCheckIn() {
  const { program, wallet } = useProgram();
  const [loading, setLoading] = useState(false);

  const verifyCheckIn = useCallback(async (
    eventPublicKey: PublicKey,
    ticketRecordKey: PublicKey,
    commitmentHex: string,
  ) => {
    if (!program || !wallet.publicKey) return;
    setLoading(true);
    try {
      // 1. Retrieve the stored secret
      const secret = getTicketSecret(eventPublicKey.toString(), commitmentHex);
      if (!secret) throw new Error('Ticket secret not found. Was the ticket booked from this device?');

      // 2. Compute commitment and nullifier hash
      const commitment = await computeCommitment(secret);
      const nullifierHash = await computeNullifierHash(secret, eventPublicKey.toBytes());
      const nullifierArray = Array.from(nullifierHash);

      // 3. Generate REAL ZK proof using Noir circuit
      toast.loading('Generating ZK proof...', { id: 'zk-proof' });
      const zkResult = await generateZKProof(
        secret,
        commitment,
        nullifierHash,
        new Uint8Array(eventPublicKey.toBytes()),
      );
      toast.dismiss('zk-proof');

      if (!zkResult.verified) {
        throw new Error('ZK proof verification failed locally. Cannot proceed with check-in.');
      }

      toast.success('ZK proof generated and verified!');

      // 4. Format proof bytes for the smart contract
      // (on-chain Groth16 verification is not yet enabled, but we maintain the tx structure)
      const { proofA, proofB, proofC } = formatProofForContract();

      // 5. Derive nullifier registry PDA
      const [nullifierRegistry] = PublicKey.findProgramAddressSync(
        [SEEDS.NULLIFIER, eventPublicKey.toBuffer(), Buffer.from(nullifierHash)],
        program.programId
      );

      // 6. Send verify_check_in transaction
      const tx = await program.methods
        .verifyCheckIn(nullifierArray, proofA, proofB, proofC)
        .accounts({
          scanner: wallet.publicKey,
          eventAccount: eventPublicKey,
          ticketRecord: ticketRecordKey,
          nullifierRegistry,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success('Check-in verified! Welcome to the event.');
      return tx;
    } catch (e: any) {
      toast.dismiss('zk-proof');
      toast.error(e.message || 'Check-in verification failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey]);

  return { verifyCheckIn, loading };
}
