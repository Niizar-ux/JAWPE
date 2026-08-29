const fs = require("fs");

const {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL
} = require("@solana/web3.js");

const walletData = JSON.parse(
  fs.readFileSync("devnet-wallet.json", "utf8")
);

const wallet = Keypair.fromSecretKey(
  Uint8Array.from(walletData.secretKey)
);

const RPC = "https://api.devnet.solana.com";

const connection = new Connection(
  RPC,
  "confirmed"
);

async function main() {
  console.log("🔥 JAWPE DEVNET FAUCET");
  console.log("=====================");
  console.log("Wallet:", wallet.publicKey.toBase58());
  console.log("RPC:", RPC);

  const before = await connection.getBalance(
    wallet.publicKey
  );

  console.log(
    "Saldo sebelum:",
    before / LAMPORTS_PER_SOL,
    "SOL"
  );

  console.log("\nMeminta 1 SOL Devnet...");

  const signature = await connection.requestAirdrop(
    wallet.publicKey,
    1 * LAMPORTS_PER_SOL
  );

  console.log("Signature:", signature);

  await connection.confirmTransaction(
    signature,
    "confirmed"
  );

  const after = await connection.getBalance(
    wallet.publicKey
  );

  console.log("\n✅ Airdrop berhasil!");
  console.log(
    "Saldo sekarang:",
    after / LAMPORTS_PER_SOL,
    "SOL"
  );
}

main().catch((error) => {
  console.error("\n❌ Airdrop gagal:");
  console.error(error.message);
});