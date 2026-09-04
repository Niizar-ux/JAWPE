const fs = require("fs");

const {
    createUmi
} = require("@metaplex-foundation/umi-bundle-defaults");

const {
    publicKey
} = require("@metaplex-foundation/umi");

const {
    mplTokenMetadata
} = require("@metaplex-foundation/mpl-token-metadata");

const {
    fetchMint
} = require("@metaplex-foundation/mpl-toolbox");

const MINT_ADDRESS =
    "5fuTCXiggJAhBfD8jnZfnSNRxVecMHMrBP6T6YoqyeW7";

const RPC_URL =
    "https://api.devnet.solana.com";

async function main() {

    console.log("================================");
    console.log("JAWPE TOKEN SECURITY CHECK");
    console.log("================================");

    const umi =
        createUmi(RPC_URL)
            .use(mplTokenMetadata());

    const walletData =
        JSON.parse(
            fs.readFileSync(
                "./devnet-wallet.json",
                "utf8"
            )
        );

    const secretKey =
        Uint8Array.from(
            walletData.secretKey
        );

    const keypair =
        umi.eddsa.createKeypairFromSecretKey(
            secretKey
        );

    const wallet =
        keypair.publicKey;

    const mint =
        publicKey(MINT_ADDRESS);

    console.log("\nNetwork:");
    console.log("Solana Devnet");

    console.log("\nWallet:");
    console.log(wallet.toString());

    console.log("\nMint:");
    console.log(MINT_ADDRESS);

    const mintAccount =
        await fetchMint(
            umi,
            mint
        );

    console.log("\nTOKEN INFO");
    console.log("------------------------------");

    console.log(
        "Decimals:",
        mintAccount.decimals
    );

    console.log(
        "Supply (raw):",
        mintAccount.supply
    );

    console.log(
        "Mint Authority:",
        mintAccount.mintAuthority
            ? mintAccount.mintAuthority.toString()
            : "NONE"
    );

    console.log(
        "Freeze Authority:",
        mintAccount.freezeAuthority
            ? mintAccount.freezeAuthority.toString()
            : "NONE"
    );

    console.log("\n================================");
    console.log("CHECK SELESAI");
    console.log("================================");
}

main().catch(
    (error) => {

        console.error(
            "\nCHECK GAGAL:"
        );

        console.error(error);

    }
);