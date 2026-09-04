import {
    Connection,
    PublicKey,
    Transaction
} from "https://esm.sh/@solana/web3.js@1.98.4";

import {
    createAssociatedTokenAccountInstruction,
    createTransferCheckedInstruction,
    getAccount,
    getAssociatedTokenAddress
} from "https://esm.sh/@solana/spl-token@0.4.15";

// ==========================================
// JAWPE CONFIG
// ==========================================

const RPC_URL = "https://api.devnet.solana.com";

const JAWPE_MINT =
    "5fuTCXiggJAhBfD8jnZfnSNRxVecMHMrBP6T6YoqyeW7";

const JAWPE_DECIMALS = 9;

const connection =
    new Connection(RPC_URL, "confirmed");

// ==========================================
// ELEMENTS
// ==========================================

const receiverInput =
    document.getElementById("receiverAddress");

const amountInput =
    document.getElementById("sendAmount");

const sendButton =
    document.getElementById("sendJawpeButton");

const statusBox =
    document.getElementById("sendJawpeStatus");

// ==========================================
// PHANTOM
// ==========================================

function getPhantomProvider() {

    if (
        window.phantom &&
        window.phantom.solana
    ) {
        return window.phantom.solana;
    }

    if (
        window.solana &&
        window.solana.isPhantom
    ) {
        return window.solana;
    }

    return null;
}

// ==========================================
// STATUS
// ==========================================

function setStatus(message, type = "") {

    if (!statusBox) {
        return;
    }

    statusBox.textContent = message;

    statusBox.className =
        "send-jawpe-status";

    if (type) {
        statusBox.classList.add(type);
    }
}

// ==========================================
// AMOUNT PARSER
// ==========================================

function parseTokenAmount(value) {

    const text =
        String(value).trim();

    if (!text) {
        throw new Error(
            "Amount is required."
        );
    }

    if (
        !/^\d+(\.\d+)?$/.test(text)
    ) {
        throw new Error(
            "Invalid JAWPE amount."
        );
    }

    const parts =
        text.split(".");

    const whole =
        parts[0];

    const fraction =
        parts[1] || "";

    if (
        fraction.length >
        JAWPE_DECIMALS
    ) {
        throw new Error(
            `Maximum ${JAWPE_DECIMALS} decimal places allowed.`
        );
    }

    const paddedFraction =
        fraction.padEnd(
            JAWPE_DECIMALS,
            "0"
        );

    const rawAmount =
        BigInt(
            whole + paddedFraction
        );

    if (rawAmount <= 0n) {
        throw new Error(
            "Amount must be greater than zero."
        );
    }

    return rawAmount;
}

// ==========================================
// GET WALLET
// ==========================================

async function getWalletPublicKey(provider) {

    if (!provider) {
        throw new Error(
            "Phantom Wallet was not detected."
        );
    }

    if (!provider.publicKey) {
        await provider.connect();
    }

    if (!provider.publicKey) {
        throw new Error(
            "Phantom wallet is not connected."
        );
    }

    return new PublicKey(
        provider.publicKey.toString()
    );
}

// ==========================================
// CONFIRM TRANSACTION
// ==========================================

async function confirmTransaction(
    signature,
    blockhash,
    lastValidBlockHeight
) {

    setStatus(
        "Transaction broadcasted. Confirming on Devnet...",
        "loading"
    );

    console.log(
        "JAWPE waiting confirmation:",
        signature
    );

    try {

        const confirmation =
            await connection.confirmTransaction(
                {
                    signature,
                    blockhash,
                    lastValidBlockHeight
                },
                "confirmed"
            );

        if (
            confirmation.value &&
            confirmation.value.err
        ) {
            throw new Error(
                "Transaction failed on Solana Devnet."
            );
        }

        console.log(
            "JAWPE transaction confirmed:",
            signature
        );

        return true;

    } catch (error) {

        console.error(
            "Confirmation error:",
            error
        );

        // Check directly whether the transaction landed.
        const status =
            await connection.getSignatureStatuses(
                [signature],
                {
                    searchTransactionHistory: true
                }
            );

        const transactionStatus =
            status.value[0];

        if (transactionStatus) {

            if (
                transactionStatus.err
            ) {
                throw new Error(
                    "Transaction failed on Solana Devnet."
                );
            }

            if (
                transactionStatus.confirmationStatus ===
                    "confirmed" ||
                transactionStatus.confirmationStatus ===
                    "finalized"
            ) {
                return true;
            }
        }

        throw error;
    }
}

// ==========================================
// SEND JAWPE
// ==========================================

async function sendJawpe() {

    const provider =
        getPhantomProvider();

    if (!provider) {

        setStatus(
            "Phantom Wallet tidak ditemukan.",
            "error"
        );

        return;
    }

    if (
        !receiverInput ||
        !amountInput ||
        !sendButton
    ) {

        console.error(
            "JAWPE transfer elements tidak ditemukan."
        );

        return;
    }

    sendButton.disabled = true;

    try {

        // ======================================
        // WALLET
        // ======================================

        setStatus(
            "Checking Phantom wallet...",
            "loading"
        );

        const senderPublicKey =
            await getWalletPublicKey(
                provider
            );

        console.log(
            "Sender:",
            senderPublicKey.toString()
        );

        // ======================================
        // RECEIVER
        // ======================================

        const receiverValue =
            receiverInput.value.trim();

        if (!receiverValue) {
            throw new Error(
                "Receiver address is required."
            );
        }

        let receiverPublicKey;

        try {

            receiverPublicKey =
                new PublicKey(
                    receiverValue
                );

        } catch {

            throw new Error(
                "Receiver address is invalid."
            );
        }

        console.log(
            "Receiver:",
            receiverPublicKey.toString()
        );

        // ======================================
        // SELF TRANSFER
        // ======================================

        if (
            senderPublicKey.equals(
                receiverPublicKey
            )
        ) {

            throw new Error(
                "Receiver cannot be the same as sender."
            );
        }

        // ======================================
        // AMOUNT
        // ======================================

        const rawAmount =
            parseTokenAmount(
                amountInput.value
            );

        console.log(
            "Raw JAWPE amount:",
            rawAmount.toString()
        );

        // ======================================
        // MINT
        // ======================================

        const mintPublicKey =
            new PublicKey(
                JAWPE_MINT
            );

        // ======================================
        // TOKEN ACCOUNTS
        // ======================================

        setStatus(
            "Checking JAWPE token accounts...",
            "loading"
        );

        const senderTokenAccount =
            await getAssociatedTokenAddress(
                mintPublicKey,
                senderPublicKey
            );

        const receiverTokenAccount =
            await getAssociatedTokenAddress(
                mintPublicKey,
                receiverPublicKey
            );

        console.log(
            "Sender ATA:",
            senderTokenAccount.toString()
        );

        console.log(
            "Receiver ATA:",
            receiverTokenAccount.toString()
        );

        // ======================================
        // SENDER ACCOUNT
        // ======================================

        let senderAccount;

        try {

            senderAccount =
                await getAccount(
                    connection,
                    senderTokenAccount
                );

        } catch {

            throw new Error(
                "Your connected wallet does not have a JAWPE token account."
            );
        }

        // ======================================
        // BALANCE
        // ======================================

        console.log(
            "Sender JAWPE balance:",
            senderAccount.amount.toString()
        );

        if (
            senderAccount.amount <
            rawAmount
        ) {

            throw new Error(
                "Insufficient JAWPE balance."
            );
        }

        // ======================================
        // TRANSACTION
        // ======================================

        const transaction =
            new Transaction();

        // ======================================
        // RECEIVER ATA
        // ======================================

        let receiverExists = true;

        try {

            await getAccount(
                connection,
                receiverTokenAccount
            );

        } catch {

            receiverExists = false;
        }

        // ======================================
        // CREATE RECEIVER ATA
        // ======================================

        if (!receiverExists) {

            setStatus(
                "Creating receiver JAWPE token account...",
                "loading"
            );

            transaction.add(
                createAssociatedTokenAccountInstruction(
                    senderPublicKey,
                    receiverTokenAccount,
                    receiverPublicKey,
                    mintPublicKey
                )
            );

            console.log(
                "Receiver ATA does not exist. Creating it."
            );

        } else {

            console.log(
                "Receiver ATA already exists."
            );
        }

        // ======================================
        // TRANSFER CHECKED
        // ======================================

        transaction.add(
            createTransferCheckedInstruction(
                senderTokenAccount,
                mintPublicKey,
                receiverTokenAccount,
                senderPublicKey,
                rawAmount,
                JAWPE_DECIMALS
            )
        );

        // ======================================
        // FRESH BLOCKHASH
        // ======================================

        setStatus(
            "Preparing Devnet transaction...",
            "loading"
        );

        const latestBlockhash =
            await connection.getLatestBlockhash(
                "confirmed"
            );

        transaction.recentBlockhash =
            latestBlockhash.blockhash;

        transaction.lastValidBlockHeight =
            latestBlockhash.lastValidBlockHeight;

        transaction.feePayer =
            senderPublicKey;

        console.log(
            "Blockhash:",
            latestBlockhash.blockhash
        );

        console.log(
            "Last valid block height:",
            latestBlockhash.lastValidBlockHeight
        );

        // ======================================
        // SIMULATE BEFORE SIGNING
        // ======================================

        setStatus(
            "Checking transaction simulation...",
            "loading"
        );

        const simulation =
            await connection.simulateTransaction(
                transaction
            );

        if (
            simulation.value.err
        ) {

            console.error(
                "Simulation error:",
                simulation.value.err
            );

            console.error(
                "Simulation logs:",
                simulation.value.logs
            );

            throw new Error(
                "Transaction simulation failed. Check browser Console for details."
            );
        }

        console.log(
            "JAWPE transaction simulation: SUCCESS"
        );

        // ======================================
        // PHANTOM SIGN
        // ======================================

        setStatus(
            "Approve the transaction in Phantom...",
            "loading"
        );

        if (
            typeof provider.signTransaction !==
            "function"
        ) {

            throw new Error(
                "This Phantom version does not support signTransaction()."
            );
        }

        const signedTransaction =
            await provider.signTransaction(
                transaction
            );

        if (!signedTransaction) {

            throw new Error(
                "Phantom did not return a signed transaction."
            );
        }

        console.log(
            "JAWPE transaction signed by Phantom."
        );

        // ======================================
        // SERIALIZE
        // ======================================

        const rawTransaction =
            signedTransaction.serialize();

        console.log(
            "Serialized transaction size:",
            rawTransaction.length,
            "bytes"
        );

        // ======================================
        // SEND RAW TRANSACTION
        // ======================================

        setStatus(
            "Broadcasting JAWPE transaction to Solana Devnet...",
            "loading"
        );

        const signature =
            await connection.sendRawTransaction(
                rawTransaction,
                {
                    skipPreflight: false,
                    preflightCommitment: "confirmed",
                    maxRetries: 5
                }
            );

        console.log(
            "JAWPE transaction signature:",
            signature
        );

        // ======================================
        // EXPLORER
        // ======================================

        const explorerUrl =
            `https://explorer.solana.com/tx/${signature}?cluster=devnet`;

        console.log(
            "JAWPE Explorer:",
            explorerUrl
        );

        // ======================================
        // CONFIRM
        // ======================================

        await confirmTransaction(
            signature,
            latestBlockhash.blockhash,
            latestBlockhash.lastValidBlockHeight
        );

        // ======================================
        // SUCCESS
        // ======================================

        if (statusBox) {

            statusBox.innerHTML = `
                <span>
                    ✅ JAWPE sent successfully.
                </span>
                <br>
                <a
                    href="${explorerUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View transaction ↗
                </a>
            `;

            statusBox.className =
                "send-jawpe-status success";
        }

        // ======================================
        // CLEAR
        // ======================================

        amountInput.value = "";

        // ======================================
        // REFRESH BALANCE
        // ======================================

        window.dispatchEvent(
            new CustomEvent(
                "jawpeTransferSuccess"
            )
        );

        console.log(
            "===================================="
        );

        console.log(
            "JAWPE TRANSFER SUCCESS"
        );

        console.log(
            "Signature:",
            signature
        );

        console.log(
            "===================================="
        );

    } catch (error) {

        console.error(
            "===================================="
        );

        console.error(
            "JAWPE TRANSFER ERROR"
        );

        console.error(
            error
        );

        console.error(
            "===================================="
        );

        let message =
            error?.message ||
            "Transaction failed.";

        const lowerMessage =
            message.toLowerCase();

        if (
            lowerMessage.includes(
                "user rejected"
            ) ||
            lowerMessage.includes(
                "user denied"
            ) ||
            lowerMessage.includes(
                "rejected the request"
            )
        ) {

            message =
                "Transaction cancelled in Phantom.";
        }

        setStatus(
            `❌ ${message}`,
            "error"
        );

    } finally {

        sendButton.disabled =
            false;
    }
}

// ==========================================
// BUTTON
// ==========================================

function setupSendButton() {

    if (!sendButton) {

        console.error(
            "sendJawpeButton tidak ditemukan!"
        );

        return;
    }

    sendButton.addEventListener(
        "click",
        sendJawpe
    );
}

// ==========================================
// ENTER KEY
// ==========================================

function setupFormKeyboard() {

    if (amountInput) {

        amountInput.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    sendJawpe();
                }
            }
        );
    }

    if (receiverInput) {

        receiverInput.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    if (amountInput) {

                        amountInput.focus();
                    }
                }
            }
        );
    }
}

// ==========================================
// INIT
// ==========================================

function initSendJawpe() {

    console.log(
        "===================================="
    );

    console.log(
        "JAWPE Send Module Loaded"
    );

    console.log(
        "Network: Solana Devnet"
    );

    console.log(
        "Mint:",
        JAWPE_MINT
    );

    console.log(
        "Decimals:",
        JAWPE_DECIMALS
    );

    console.log(
        "===================================="
    );

    setupSendButton();
    setupFormKeyboard();
}

// ==========================================
// START
// ==========================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initSendJawpe
    );

} else {

    initSendJawpe();
}