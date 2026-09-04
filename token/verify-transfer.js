const fs = require("fs");

const {
    Connection,
    PublicKey
} = require("@solana/web3.js");

const RPC_URL =
    "https://api.devnet.solana.com";

const MINT_ADDRESS =
    "5fuTCXiggJAhBfD8jnZfnSNRxVecMHMrBP6T6YoqyeW7";

const RECEIVER_ADDRESS =
    "FQguDk8KLUY6Hoz35NqGgvCa24DdEcN9vFtUUsdReddX";

const EXPECTED_TRANSFER =
    100;

const DECIMALS =
    9;

async function getBalance(connection, owner) {

    const result =
        await connection.getParsedTokenAccountsByOwner(
            new PublicKey(owner),
            {
                mint: new PublicKey(MINT_ADDRESS)
            }
        );

    if (result.value.length === 0) {
        return {
            account: null,
            balance: 0
        };
    }

    const account =
        result.value[0];

    const info =
        account.account.data.parsed.info;

    return {
        account: account.pubkey.toBase58(),
        balance: Number(
            info.tokenAmount.uiAmount || 0
        )
    };
}

async function main() {

    console.log("================================");
    console.log("JAWPE TRANSFER VERIFICATION");
    console.log("================================");

    const walletData =
        JSON.parse(
            fs.readFileSync(
                "./devnet-wallet.json",
                "utf8"
            )
        );

    const sender =
        new PublicKey(
            KeypairFromSecretKey(
                walletData.secretKey
            )
        );

    const receiver =
        new PublicKey(
            RECEIVER_ADDRESS
        );

    const connection =
        new Connection(
            RPC_URL,
            "confirmed"
        );

    console.log("\nNetwork:");
    console.log("Solana Devnet");

    console.log("\nSender:");
    console.log(
        sender.toBase58()
    );

    console.log("\nReceiver:");
    console.log(
        receiver.toBase58()
    );

    console.log("\nChecking balances...");

    const senderData =
        await getBalance(
            connection,
            sender
        );

    const receiverData =
        await getBalance(
            connection,
            receiver
        );

    console.log("\n================================");
    console.log("SENDER");
    console.log("================================");

    console.log(
        "Token Account:",
        senderData.account || "NONE"
    );

    console.log(
        "Balance:",
        senderData.balance.toLocaleString(),
        "JAWPE"
    );

    console.log("\n================================");
    console.log("RECEIVER");
    console.log("================================");

    console.log(
        "Token Account:",
        receiverData.account || "NONE"
    );

    console.log(
        "Balance:",
        receiverData.balance.toLocaleString(),
        "JAWPE"
    );

    console.log("\n================================");
    console.log("VERIFICATION");
    console.log("================================");

    if (
        receiverData.balance >=
        EXPECTED_TRANSFER
    ) {

        console.log(
            "✅ RECEIVER MENERIMA 100 JAWPE"
        );

    } else {

        console.log(
            "❌ 100 JAWPE BELUM TERDETEKSI"
        );
    }

    console.log("\n================================");
    console.log("SELESAI");
    console.log("================================");
}

function KeypairFromSecretKey(secretKey) {

    const {
        Keypair
    } = require("@solana/web3.js");

    return Keypair
        .fromSecretKey(
            Uint8Array.from(secretKey)
        )
        .publicKey
        .toBytes();
}

main().catch(
    (error) => {

        console.error(
            "\nVERIFICATION GAGAL:"
        );

        console.error(
            error
        );

    }
);