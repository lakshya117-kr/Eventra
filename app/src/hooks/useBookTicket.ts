import { useState, useCallback } from 'react';
import { PublicKey, SystemProgram, ComputeBudgetProgram, Keypair, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useProgram } from './useProgram';
import { SEEDS, TOKEN_DECIMALS, TOKEN_METADATA_PROGRAM_ID } from '../utils/constants';
import { generateSecret, computeCommitment, storeTicketSecret, toHex } from '../utils/zk';
import { uploadMetadataToPinata } from '../utils/pinata';
import toast from 'react-hot-toast';

export function useBookTicket() {
  const { program, wallet, connection } = useProgram();
  const [loading, setLoading] = useState(false);

  const bookTicket = useCallback(async (
    eventPublicKey: PublicKey,
    organizerKey: PublicKey,
    ticketPriceRaw: number,
    eventName: string,
    eventDescription?: string,
  ) => {
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

      // 3. Generate a fresh keypair for the NFT mint
      const nftMint = Keypair.generate();

      // 4. Derive the buyer's ATA for the NFT mint (destination)
      const destination = await getAssociatedTokenAddress(
        nftMint.publicKey,
        wallet.publicKey
      );

      // 5. Derive Metaplex metadata PDA
      const [metadata] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          nftMint.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      // 6. Derive Metaplex master edition PDA
      const [masterEdition] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          nftMint.publicKey.toBuffer(),
          Buffer.from('edition'),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      // 7. Upload NFT metadata JSON to IPFS via Pinata
      toast.loading('Uploading NFT metadata to IPFS...', { id: 'nft-upload' });
      const nftMetadataJson = {
        name: `${eventName} — Ticket NFT`,
        symbol: 'EVTK',
        description: eventDescription || `NFT ticket for ${eventName}`,
        image: '', // Could be event image if available
        attributes: [
          { trait_type: 'Event', value: eventName },
          { trait_type: 'Ticket Type', value: 'General Admission' },
          { trait_type: 'Minted At', value: new Date().toISOString() },
        ],
        properties: {
          category: 'ticket',
          creators: [{ address: wallet.publicKey.toString(), share: 100 }],
        },
      };

      let metadataUri = '';
      try {
        const metadataCid = await uploadMetadataToPinata(nftMetadataJson);
        metadataUri = `https://gateway.pinata.cloud/ipfs/${metadataCid}`;
      } catch {
        // Fallback: use a placeholder URI if Pinata is not configured
        metadataUri = '';
        console.warn('Pinata upload failed, using empty URI');
      }
      toast.dismiss('nft-upload');

      // 8. Build NFT params for the contract
      const nftParams = {
        name: `${eventName} Ticket`,
        symbol: 'EVTK',
        uri: metadataUri,
      };

      // 9. Send transaction
      const tx = await program.methods
        .bookTicket(commitmentArray, nftParams)
        .accounts({
          buyer: wallet.publicKey,
          buyerTokenAccount,
          organizerTokenAccount,
          eventAccount: eventPublicKey,
          ticketRecord,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          nftMint: nftMint.publicKey,
          destination,
          metadata,
          masterEdition,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([nftMint])
        .preInstructions([ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100_000 })])
        .rpc();

      // 10. Store secret for later check-in
      storeTicketSecret(eventPublicKey.toString(), toHex(commitment), secret);

      // 11. Store NFT mint address in localStorage for the Profile page
      const nftMints = JSON.parse(localStorage.getItem('nft_mints') || '[]');
      nftMints.push({
        mint: nftMint.publicKey.toString(),
        eventKey: eventPublicKey.toString(),
        eventName,
        bookedAt: new Date().toISOString(),
      });
      localStorage.setItem('nft_mints', JSON.stringify(nftMints));

      toast.success('🎉 Ticket booked & NFT minted to your wallet!');
      return {
        tx,
        commitment: toHex(commitment),
        ticketRecord,
        nftMint: nftMint.publicKey.toString(),
      };
    } catch (e: any) {
      toast.dismiss('nft-upload');
      toast.error(e.message || 'Booking failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey, connection]);

  return { bookTicket, loading };
}
