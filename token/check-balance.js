const fs = require("fs");

const {
    createUmi
} = require("@metaplex-foundation/umi-bundle-defaults");

const {
    publicKey
} = require("@metaplex-foundation/umi");

const MINT_ADDRESS =
    "5fuTCXiggJAhBfD8jnZfnSNRxVecMHMrBP6T6YoqyeW7";

const RPC_URL =
    "https://api.devnet.solana.com";

async function main() {

    console.log("================================");
    console.log("JAWPE BALANCE CHECK");
    console.log("================================");

    const walletData =
        JSON.parse(
            fs.readFileSync(
                "./devnet-wallet.json",
                "utf8"
            )
        );

    const umi =
        createUmi(RPC_URL);

    const secretKey =
        Uint8Array.from(
            walletData.secretKey
        );

    const keypair =
        umi.eddsa.createKeypairFromSecretKey(
            secretKey
        );

    const wallet =
        keypair.publicKey.toString();

    console.log("\nNetwork:");
    console.log("Solana Devnet");

    console.log("\nWallet:");
    console.log(wallet);

    console.log("\nMint:");
    console.log(MINT_ADDRESS);

    console.log("\nChecking JAWPE token accounts...");

    const response =
        await fetch(
            RPC_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: 1,
                    method: "getTokenAccountsByOwner",

                    params: [
                        wallet,
                        {
                            mint: MINT_ADDRESS
                        },
                        {
                            encoding: "jsonParsed"
                        }
                    ]
                })
            }
        );

    const data =
        await response.json();

    if (data.error) {
        throw new Error(
            JSON.stringify(data.error)
        );
    }

    const accounts =
        data.result.value;

    console.log("\n================================");
    console.log("JAWPE TOKEN ACCOUNT");
    console.log("================================");

    if (accounts.length === 0) {

        console.log(
            "Token Account : BELUM ADA"
        );

        console.log(
            "Balance       : 0 JAWPE"
        );

        console.log(
            "\nWallet ini belum memiliki token JAWPE."
        );

    } else {

        for (
            let i = 0;
            i < accounts.length;
            i++
        ) {

            const account =
                accounts[i];

            const info =
                account.account.data.parsed.info;

            const amount =
                info.tokenAmount.amount;

            const decimals =
                info.tokenAmount.decimals;

            const uiAmount =
                info.tokenAmount.uiAmount;

            console.log(
                "\nToken Account:",
                account.pubkey
            );

            console.log(
                "Raw Balance  :",
                amount
            );

            console.log(
                "Decimals     :",
                decimals
            );

            console.log(
                "JAWPE Balance:",
                uiAmount
            );
        }
    }

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