import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";
import BN from "bn.js";

// Read IDL from utils
import { IDL } from "../src/utils/idl";

async function main() {
  // Use local keypair
  const keypairPath = path.join(process.env.HOME || "", ".config", "solana", "id.json");
  const keypairFile = fs.readFileSync(keypairPath, "utf-8");
  const keypair = anchor.web3.Keypair.fromSecretKey(Buffer.from(JSON.parse(keypairFile)));

  // Setup connection to Devnet
  const rpcUrl = process.env.VITE_RPC_ENDPOINT || "https://api.devnet.solana.com";
  const connection = new anchor.web3.Connection(rpcUrl, "confirmed");
  const wallet = new anchor.Wallet(keypair);
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
  anchor.setProvider(provider);

  const programId = new PublicKey("82Tzgv6JU15FD6jQH1hLwuvBDj8VjQ2Dz1SdnonU3ciA");
  const program = new Program(IDL as any, provider);

  // Find PDAs
  const [xMint] = PublicKey.findProgramAddressSync([Buffer.from("x_mint")], programId);
  const [mintAuthority] = PublicKey.findProgramAddressSync([Buffer.from("mint_authority")], programId);
  const [userConfig] = PublicKey.findProgramAddressSync([Buffer.from("user_config")], programId);
  const [solVault] = PublicKey.findProgramAddressSync([Buffer.from("sol_vault")], programId);

  // Get Associated Token Account for user
  const [userTokenAccount] = PublicKey.findProgramAddressSync(
    [wallet.publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), xMint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  console.log("Initializing Program on Devnet...");
  console.log("User:", wallet.publicKey.toBase58());
  console.log("xMint PDA:", xMint.toBase58());
  console.log("UserConfig PDA:", userConfig.toBase58());
  console.log("SolVault PDA:", solVault.toBase58());

  try {
    const tx = await program.methods
      .initialize(new BN(100)) // sol_pri
      .accounts({
        user: wallet.publicKey,
        xMint,
        mintAuthority,
        userTokenAccount,
        userConfig,
        solVault,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("Initialization successful!");
    console.log("Transaction signature:", tx);
  } catch (error) {
    console.error("Failed to initialize. The program might already be initialized or an error occurred.");
    console.error(error);
  }
}

main();
