import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { IDL } from '../utils/idl';
import { PROGRAM_ID } from '../utils/constants';

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo((): any | null => {
    if (!wallet.publicKey || !wallet.signTransaction) return null;
    const provider = new AnchorProvider(
      connection,
      wallet as any,
      { commitment: 'confirmed' }
    );
    return new Program(IDL as any, provider);
  }, [connection, wallet]);

  return { program, connection, wallet };
}
