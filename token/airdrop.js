const {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    clusterApiUrl
} = require("@solana/web3.js");

const fs = require("fs");

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
    console.log("🔥 JAWPE DEVNET");
    console.log("Wallet:", wallet.publicKey.toBase58());

    const balanceBefore = await connection.getBalance(wallet.publicKey);

    console.log(
        "Saldo sebelum:",
        balanceBefore / LAMPORTS_PER_SOL,
        "SOL"
    );

    const signature = await connection.requestAirdrop(
        wallet.publicKey,
        1 * LAMPORTS_PER_SOL
    );

    await connection.confirmTransaction(signature);

    const balanceAfter = await connection.getBalance(wallet.publicKey);

    console.log(
        "Saldo sesudah:",
        balanceAfter / LAMPORTS_PER_SOL,
        "SOL"
    );

    console.log("Airdrop berhasil ✅");
}

main().catch(console.error);