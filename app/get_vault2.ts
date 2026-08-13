import { PublicKey } from "@solana/web3.js";
const p1 = new PublicKey("CRGSNcfeaJ5cFHyZTuwU1A15HxABMK6p5EAcFhU1tcUc");
const [v1] = PublicKey.findProgramAddressSync([Buffer.from("sol_vault")], p1);
console.log("old", v1.toBase58());
const p2 = new PublicKey("82Tzgv6JU15FD6jQH1hLwuvBDj8VjQ2Dz1SdnonU3ciA");
const [v2] = PublicKey.findProgramAddressSync([Buffer.from("sol_vault")], p2);
console.log("new", v2.toBase58());
