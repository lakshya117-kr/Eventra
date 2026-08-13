import { PublicKey } from "@solana/web3.js";
const programId = new PublicKey("82Tzgv6JU15FD6jQH1hLwuvBDj8VjQ2Dz1SdnonU3ciA");
const [vault] = PublicKey.findProgramAddressSync([Buffer.from("sol_vault")], programId);
console.log(vault.toBase58());
