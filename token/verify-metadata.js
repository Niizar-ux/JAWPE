const {
    createUmi
} = require("@metaplex-foundation/umi-bundle-defaults");

const {
    publicKey
} = require("@metaplex-foundation/umi");

const {
    mplTokenMetadata,
    findMetadataPda,
    fetchMetadata
} = require("@metaplex-foundation/mpl-token-metadata");

const MINT_ADDRESS =
    "5fuTCXiggJAhBfD8jnZfnSNRxVecMHMrBP6T6YoqyeW7";

const RPC_URL =
    "https://api.devnet.solana.com";

async function main() {

    console.log("================================");
    console.log("🔍 VERIFY JAWPE METADATA");
    console.log("================================");

    const umi =
        createUmi(RPC_URL).use(mplTokenMetadata());

    const mint =
        publicKey(MINT_ADDRESS);

    console.log("\nMint:");
    console.log(MINT_ADDRESS);

    const metadataPda =
        findMetadataPda(umi, { mint });

    console.log("\nMetadata PDA:");
    console.log(metadataPda[0]);

    console.log("\nMembaca metadata dari Solana Devnet...");

    const metadata =
        await fetchMetadata(umi, metadataPda);

    console.log("\n📦 METADATA ON-CHAIN");
    console.log("------------------------------");
    console.log("Name   :", metadata.name);
    console.log("Symbol :", metadata.symbol);
    console.log("URI    :", metadata.uri);

    console.log("\n------------------------------");
    console.log("✅ METADATA BERHASIL DIVERIFIKASI");
    console.log("------------------------------");
}

main().catch((error) => {

    console.error("\n❌ VERIFY GAGAL:");
    console.error(error);

});