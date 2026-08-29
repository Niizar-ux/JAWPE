const { Keypair } = require("@solana/web3.js");
const fs = require("fs");

const wallet = Keypair.generate();

const walletData = {
    publicKey: wallet.publicKey.toBase58(),
    secretKey: Array.from(wallet.secretKey)
};

fs.writeFileSync(
    "devnet-wallet.json",
    JSON.stringify(walletData, null, 2)
);

console.log("🔥 JAWPE DEVNET WALLET");
console.log("Public Key:", wallet.publicKey.toBase58());
console.log("Wallet tersimpan di: devnet-wallet.json");