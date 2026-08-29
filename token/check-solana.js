const { Connection, clusterApiUrl } = require("@solana/web3.js");

const connection = new Connection(
    clusterApiUrl("devnet"),
    "confirmed"
);

async function main() {
    const version = await connection.getVersion();

    console.log("🔥 JAWPE");
    console.log("Solana Devnet terhubung!");
    console.log("Solana version:", version["solana-core"]);
}

main().catch(console.error);