const fs = require("fs");

const {
    Connection,
    Keypair,
    PublicKey,
    sendAndConfirmTransaction,
    Transaction
} = require("@solana/web3.js");

const {
    getOrCreateAssociatedTokenAccount,
    createTransferInstruction
} = require("@solana/spl-token");

const RPC_URL =
    "https://api.devnet.solana.com";

const MINT_ADDRESS =
    "5fuTCXiggJAhBfD8jnZfnSNRxVecMHMrBP6T6YoqyeW7";

const RECEIVER_ADDRESS =
    "7AtrreNLTV96emrNWdumkFrPgWufTbQRsaXpV9ziEuoY";
 

const AMOUNT =
    100;

const DECIMALS =
    9;

async function main() {

    console.log("================================");
    console.log("JAWPE DEVNET TRANSFER TEST");
    console.log("================================");

    const walletData =
        JSON.parse(
            fs.readFileSync(
                "./devnet-wallet.json",
                "utf8"
            )
        );

    const sender =
        Keypair.fromSecretKey(
            Uint8Array.from(walletData.secretKey)
        );

    const receiver =
        new PublicKey(
            RECEIVER_ADDRESS
        );

    const mint =
        new PublicKey(
            MINT_ADDRESS
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
        sender.publicKey.toBase58()
    );

    console.log("\nReceiver:");
    console.log(
        receiver.toBase58()
    );

    console.log("\nAmount:");
    console.log(
        AMOUNT,
        "JAWPE"
    );

    console.log("\nChecking sender balance...");

    const senderTokenAccount =
        await getOrCreateAssociatedTokenAccount(
            connection,
            sender,
            mint,
            sender.publicKey
        );

    const senderBalance =
        Number(
            senderTokenAccount.amount
        ) / 10 ** DECIMALS;

    console.log(
        "Sender balance:",
        senderBalance.toLocaleString(),
        "JAWPE"
    );

    if (senderBalance < AMOUNT) {

        throw new Error(
            "Saldo JAWPE tidak cukup."
        );

    }

    console.log(
        "\nPreparing receiver token account..."
    );

    const receiverTokenAccount =
        await getOrCreateAssociatedTokenAccount(
            connection,
            sender,
            mint,
            receiver
        );

    console.log(
        "Receiver token account:"
    );

    console.log(
        receiverTokenAccount.address.toBase58()
    );

    const rawAmount =
        BigInt(
            AMOUNT
        ) *
        BigInt(
            10 ** DECIMALS
        );

    console.log(
        "\nRaw transfer amount:",
        rawAmount.toString()
    );

    const instruction =
        createTransferInstruction(
            senderTokenAccount.address,
            receiverTokenAccount.address,
            sender.publicKey,
            rawAmount
        );

    const transaction =
        new Transaction().add(
            instruction
        );

    console.log(
        "\nSending transaction..."
    );

    const signature =
        await sendAndConfirmTransaction(
            connection,
            transaction,
            [sender],
            {
                commitment: "confirmed"
            }
        );

    console.log("\n================================");
    console.log("TRANSFER BERHASIL");
    console.log("================================");

    console.log(
        "Amount:",
        AMOUNT,
        "JAWPE"
    );

    console.log(
        "Signature:"
    );

    console.log(
        signature
    );

    console.log("\nExplorer:");
    console.log(
        `https://explorer.solana.com/tx/${signature}?cluster=devnet`
    );

    console.log("\n================================");
}

main().catch(
    (error) => {

        console.error(
            "\nTRANSFER GAGAL:"
        );

        console.error(
            error
        );

    }
);