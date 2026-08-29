const fs = require("fs");

const {
    Connection,
    Keypair,
    clusterApiUrl
} = require("@solana/web3.js");

const {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo
} = require("@solana/spl-token");

const walletData = JSON.parse(
    fs.readFileSync("devnet-wallet.json", "utf8")
);

const wallet = Keypair.fromSecretKey(
    Uint8Array.from(walletData.secretKey)
);

const connection = new Connection(
    clusterApiUrl("devnet"),
    "confirmed"
);

async function main() {
    console.log("🔥 JAWPE TOKEN CREATOR");
    console.log("======================");

    console.log("Wallet:", wallet.publicKey.toBase58());

    const balance = await connection.getBalance(wallet.publicKey);

    console.log(
        "Saldo:",
        balance / 1_000_000_000,
        "SOL"
    );

    console.log("\nMembuat Mint JAWPE...");

    const mint = await createMint(
        connection,
        wallet,
        wallet.publicKey,
        wallet.publicKey,
        9
    );

    console.log("\n✅ MINT JAWPE BERHASIL!");
    console.log("Mint Address:", mint.toBase58());

    const tokenAccount =
        await getOrCreateAssociatedTokenAccount(
            connection,
            wallet,
            mint,
            wallet.publicKey
        );

    console.log(
        "Token Account:",
        tokenAccount.address.toBase58()
    );

    const supply = 1_000_000_000;

    await mintTo(
        connection,
        wallet,
        mint,
        tokenAccount.address,
        wallet,
        supply * 1_000_000_000
    );

    console.log("\n🔥 1,000,000,000 JAWPE berhasil dibuat!");
    console.log("Decimals: 9");
    console.log("Network: Solana Devnet");
}

main().catch((error) => {
    console.error("\n❌ ERROR:");
    console.error(error);
});