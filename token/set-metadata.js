const fs = require("fs");

const {
    createUmi
} = require("@metaplex-foundation/umi-bundle-defaults");

const {
    keypairIdentity,
    publicKey,
    createSignerFromKeypair
} = require("@metaplex-foundation/umi");

const {
    mplTokenMetadata,
    findMetadataPda,
    createMetadataAccountV3
} = require("@metaplex-foundation/mpl-token-metadata");

const MINT_ADDRESS =
    "5fuTCXiggJAhBfD8jnZfnSNRxVecMHMrBP6T6YoqyeW7";

const RPC_URL =
    "https://api.devnet.solana.com";

const METADATA_URI =
    "https://raw.githubusercontent.com/Niizar-ux/JAWPE/main/metadata.json";

async function main() {

    console.log("🔥 JAWPE METADATA SETUP");
    console.log("========================");

    const walletData = JSON.parse(
        fs.readFileSync("./devnet-wallet.json", "utf8")
    );

    const secretKey =
        Uint8Array.from(walletData.secretKey);

    const umi =
        createUmi(RPC_URL).use(mplTokenMetadata());

    const keypair =
        umi.eddsa.createKeypairFromSecretKey(secretKey);

    const signer =
        createSignerFromKeypair(umi, keypair);

    umi.use(
        keypairIdentity(signer)
    );

    const mint =
        publicKey(MINT_ADDRESS);

    const metadataPda =
        findMetadataPda(umi, { mint });

    console.log("Wallet:");
    console.log(signer.publicKey);

    console.log("\nMint:");
    console.log(MINT_ADDRESS);

    console.log("\nMetadata PDA:");
    console.log(metadataPda[0]);

    console.log("\nMetadata URI:");
    console.log(METADATA_URI);

    console.log(
        "\nMengirim transaksi ke Solana Devnet..."
    );

    const result =
        await createMetadataAccountV3(umi, {

            metadata: metadataPda,

            mint: mint,

            mintAuthority: signer,

            payer: signer,

            updateAuthority: signer.publicKey,

            data: {

                name: "JAWPE",

                symbol: "JAWPE",

                uri: METADATA_URI,

                sellerFeeBasisPoints: 0,

                creators: null,

                collection: null,

                uses: null
            },

            isMutable: true,

            collectionDetails: null

        }).sendAndConfirm(umi);

    console.log(
        "\n✅ METADATA BERHASIL DIPASANG!"
    );

    console.log(
        "=============================="
    );

    console.log("\nMint:");
    console.log(MINT_ADDRESS);

    console.log("\nMetadata PDA:");
    console.log(metadataPda[0]);

    console.log("\nTransaction Signature:");
    console.log(result.signature);

    console.log("\n🌐 Network: Solana Devnet");
}

main().catch((error) => {

    console.error("\n❌ GAGAL:");

    console.error(error);

    process.exit(1);
});