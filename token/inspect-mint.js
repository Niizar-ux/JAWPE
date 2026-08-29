const {
    Connection,
    PublicKey,
    clusterApiUrl
} = require("@solana/web3.js");

const {
    getMint
} = require("@solana/spl-token");

const MINT_ADDRESS =
    "5gZFtvwZqFWGk4K1FpwUUSVgaNQYDYbTetfthirKU7R";

async function main() {

    console.log("🔥 JAWPE MINT SECURITY CHECK");
    console.log("============================");

    const connection = new Connection(
        clusterApiUrl("devnet"),
        "confirmed"
    );

    const mint = new PublicKey(MINT_ADDRESS);

    const info = await getMint(
        connection,
        mint,
        "confirmed"
    );

    console.log("\nMint Address:");
    console.log(mint.toBase58());

    console.log("\nSupply:");
    console.log(
        Number(info.supply) / 1_000_000_000
    );

    console.log("\nDecimals:");
    console.log(info.decimals);

    console.log("\nMint Authority:");

    if (info.mintAuthority) {
        console.log(
            info.mintAuthority.toBase58()
        );
    } else {
        console.log("REVOKED / NONE");
    }

    console.log("\nFreeze Authority:");

    if (info.freezeAuthority) {
        console.log(
            info.freezeAuthority.toBase58()
        );
    } else {
        console.log("REVOKED / NONE");
    }

    console.log("\n============================");
    console.log("Security check selesai.");
}

main().catch((error) => {

    console.error("\n❌ ERROR:");
    console.error(error.message);

});