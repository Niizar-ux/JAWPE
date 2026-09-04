const fs = require("fs");

const {
    Connection,
    PublicKey
} = require("@solana/web3.js");

const RPC_URL =
    "https://api.devnet.solana.com";

const MINT_ADDRESS =
    "5fuTCXiggJAhBfD8jnZfnSNRxVecMHMrBP6T6YoqyeW7";

const EXPECTED_SUPPLY =
    1_000_000_000;

const DECIMALS =
    9;

async function main() {

    console.log("================================");
    console.log("JAWPE TOKEN SECURITY AUDIT");
    console.log("================================");

    const walletData =
        JSON.parse(
            fs.readFileSync(
                "./devnet-wallet.json",
                "utf8"
            )
        );

    const {
        Keypair
    } = require("@solana/web3.js");

    const wallet =
        Keypair.fromSecretKey(
            Uint8Array.from(
                walletData.secretKey
            )
        ).publicKey;

    const connection =
        new Connection(
            RPC_URL,
            "confirmed"
        );

    const mint =
        new PublicKey(
            MINT_ADDRESS
        );

    console.log("\nNETWORK");
    console.log("------------------------------");
    console.log("Solana Devnet");

    console.log("\nWALLET");
    console.log("------------------------------");
    console.log(wallet.toBase58());

    console.log("\nMINT");
    console.log("------------------------------");
    console.log(MINT_ADDRESS);

    console.log("\nReading mint account...");

    const mintInfo =
        await connection.getParsedAccountInfo(
            mint
        );

    if (!mintInfo.value) {
        throw new Error(
            "Mint account tidak ditemukan."
        );
    }

    const parsed =
        mintInfo.value.data.parsed.info;

    const decimals =
        parsed.decimals;

    const rawSupply =
        BigInt(parsed.supply);

    const supply =
        Number(rawSupply) /
        10 ** decimals;

    const mintAuthority =
        parsed.mintAuthority;

    const freezeAuthority =
        parsed.freezeAuthority;

    console.log("\n================================");
    console.log("TOKEN INFO");
    console.log("================================");

    console.log(
        "Decimals:",
        decimals
    );

    console.log(
        "Supply:",
        supply.toLocaleString(),
        "JAWPE"
    );

    console.log(
        "Raw Supply:",
        rawSupply.toString()
    );

    console.log("\n================================");
    console.log("AUTHORITY CHECK");
    console.log("================================");

    console.log(
        "Mint Authority:",
        mintAuthority || "NONE"
    );

    console.log(
        "Freeze Authority:",
        freezeAuthority || "NONE"
    );

    console.log("\n================================");
    console.log("SECURITY ANALYSIS");
    console.log("================================");

    if (
        decimals === DECIMALS
    ) {
        console.log(
            "✅ Decimals sesuai: 9"
        );
    } else {
        console.log(
            "⚠️ Decimals tidak sesuai"
        );
    }

    if (
        supply === EXPECTED_SUPPLY
    ) {
        console.log(
            "✅ Supply sesuai: 1,000,000,000 JAWPE"
        );
    } else {
        console.log(
            "⚠️ Supply berbeda dari target"
        );
    }

    if (
        mintAuthority
    ) {
        console.log(
            "⚠️ Mint Authority MASIH AKTIF"
        );
        console.log(
            "   Token masih bisa dibuat tambahan oleh authority."
        );
    } else {
        console.log(
            "✅ Mint Authority sudah dicabut"
        );
    }

    if (
        freezeAuthority
    ) {
        console.log(
            "⚠️ Freeze Authority MASIH AKTIF"
        );
        console.log(
            "   Token account masih secara teknis dapat dibekukan oleh authority."
        );
    } else {
        console.log(
            "✅ Freeze Authority sudah dicabut"
        );
    }

    console.log("\n================================");
    console.log("AUDIT SELESAI");
    console.log("================================");

    console.log("\nCATATAN:");
    console.log(
        "Audit ini READ-ONLY. Tidak ada perubahan blockchain."
    );
}

main().catch(
    (error) => {

        console.error(
            "\nAUDIT GAGAL:"
        );

        console.error(
            error
        );

    }
);