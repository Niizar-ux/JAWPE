const JAWPE_MINT =
    "5fuTCXiggJAhBfD8jnZfnSNRxVecMHMrBP6T6YoqyeW7";

const RPC_URL =
    "https://api.devnet.solana.com";


// ==========================================
// PHANTOM PROVIDER
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
// RPC REQUEST
// ==========================================

async function rpcRequest(
    method,
    params = []
) {

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
                    method: method,
                    params: params
                })
            }
        );


    if (!response.ok) {
        throw new Error(
            `RPC HTTP error: ${response.status}`
        );
    }


    const data =
        await response.json();


    if (data.error) {

        throw new Error(
            data.error.message
        );

    }


    return data.result;
}


// ==========================================
// DEVNET STATUS
// ==========================================

async function updateDevnetStatus() {

    const status =
        document.getElementById(
            "devnetStatus"
        );


    const message =
        document.getElementById(
            "devnetMessage"
        );


    const dot =
        document.getElementById(
            "devnetDot"
        );


    if (!status) {
        return;
    }


    try {

        const result =
            await rpcRequest(
                "getHealth"
            );


        if (result === "ok") {

            status.textContent =
                "LIVE DEVNET";


            if (message) {

                message.textContent =
                    "Connected to Solana Devnet.";

            }


            if (dot) {

                dot.classList.remove(
                    "offline"
                );

                dot.classList.add(
                    "online"
                );

            }

        } else {

            status.textContent =
                "DEVNET ERROR";


            if (message) {

                message.textContent =
                    "Solana Devnet returned an unexpected health status.";

            }


            if (dot) {

                dot.classList.remove(
                    "online"
                );

                dot.classList.add(
                    "offline"
                );

            }

        }

    } catch (error) {

        console.error(
            "Devnet error:",
            error
        );


        status.textContent =
            "DEVNET OFFLINE";


        if (message) {

            message.textContent =
                "Unable to connect to Solana Devnet.";

        }


        if (dot) {

            dot.classList.remove(
                "online"
            );

            dot.classList.add(
                "offline"
            );

        }

    }

}


// ==========================================
// TOKEN SUPPLY
// ==========================================

async function updateTokenSupply() {

    const element =
        document.getElementById(
            "tokenSupply"
        );


    if (!element) {
        return;
    }


    try {

        const result =
            await rpcRequest(
                "getTokenSupply",
                [
                    JAWPE_MINT
                ]
            );


        const supply =
            result.value.uiAmount;


        element.textContent =
            Number(
                supply
            ).toLocaleString(
                "en-US"
            );


    } catch (error) {

        console.error(
            "Supply error:",
            error
        );


        element.textContent =
            "1,000,000,000";

    }

}


// ==========================================
// AUTHORITY STATUS
// ==========================================

async function updateAuthorityStatus() {

    const mintElement =
        document.getElementById(
            "mintAuthorityStatus"
        );


    const freezeElement =
        document.getElementById(
            "freezeAuthorityStatus"
        );


    try {

        const result =
            await rpcRequest(
                "getAccountInfo",
                [
                    JAWPE_MINT,
                    {
                        encoding: "jsonParsed"
                    }
                ]
            );


        if (
            !result ||
            !result.value
        ) {

            if (mintElement) {

                mintElement.textContent =
                    "ERROR";

            }


            if (freezeElement) {

                freezeElement.textContent =
                    "ERROR";

            }


            return;
        }


        const info =
            result
                .value
                .data
                .parsed
                .info;


        const mintAuthority =
            info.mintAuthority;


        const freezeAuthority =
            info.freezeAuthority;


        // --------------------------------
        // MINT AUTHORITY
        // --------------------------------

        if (mintElement) {

            if (mintAuthority) {

                mintElement.textContent =
                    "ACTIVE";


                mintElement.classList.add(
                    "authority-active"
                );


                mintElement.classList.remove(
                    "authority-renounced"
                );

            } else {

                mintElement.textContent =
                    "REVOKED";


                mintElement.classList.remove(
                    "authority-active"
                );


                mintElement.classList.add(
                    "authority-renounced"
                );

            }

        }


        // --------------------------------
        // FREEZE AUTHORITY
        // --------------------------------

        if (freezeElement) {

            if (freezeAuthority) {

                freezeElement.textContent =
                    "ACTIVE";


                freezeElement.classList.add(
                    "authority-active"
                );


                freezeElement.classList.remove(
                    "authority-renounced"
                );

            } else {

                freezeElement.textContent =
                    "REVOKED";


                freezeElement.classList.remove(
                    "authority-active"
                );


                freezeElement.classList.add(
                    "authority-renounced"
                );

            }

        }

    } catch (error) {

        console.error(
            "Authority error:",
            error
        );


        if (mintElement) {

            mintElement.textContent =
                "ERROR";

        }


        if (freezeElement) {

            freezeElement.textContent =
                "ERROR";

        }

    }

}


// ==========================================
// JAWPE BALANCE
// ==========================================

async function getJawpeBalance(
    walletAddress
) {

    try {

        const result =
            await rpcRequest(
                "getTokenAccountsByOwner",
                [
                    walletAddress,

                    {
                        mint:
                            JAWPE_MINT
                    },

                    {
                        encoding:
                            "jsonParsed",

                        commitment:
                            "confirmed"
                    }
                ]
            );


        if (
            !result ||
            !result.value ||
            result.value.length === 0
        ) {

            return 0;

        }


        let total = 0;


        for (
            const account
            of result.value
        ) {

            const amount =
                account
                    .account
                    .data
                    .parsed
                    .info
                    .tokenAmount
                    .uiAmount || 0;


            total += Number(
                amount
            );

        }


        return total;

    } catch (error) {

        console.error(
            "Balance error:",
            error
        );


        return 0;

    }

}


// ==========================================
// UPDATE WALLET UI
// ==========================================

async function updateWalletUI(
    address
) {

    const walletAddress =
        document.getElementById(
            "walletAddress"
        );


    const jawpeBalance =
        document.getElementById(
            "jawpeBalance"
        );


    if (walletAddress) {

        walletAddress.textContent =
            address.substring(
                0,
                6
            ) +
            "..." +
            address.substring(
                address.length - 6
            );

    }


    if (jawpeBalance) {

        jawpeBalance.textContent =
            "Loading...";


        const balance =
            await getJawpeBalance(
                address
            );


        jawpeBalance.textContent =
            Number(
                balance
            ).toLocaleString(
                "en-US"
            ) +
            " JAWPE";

    }

}


// ==========================================
// CONNECT PHANTOM
// ==========================================

async function connectPhantom() {

    console.log(
        "CONNECT PHANTOM"
    );


    const provider =
        getPhantomProvider();


    if (!provider) {

        alert(
            "Phantom Wallet tidak ditemukan."
        );

        return;

    }


    try {

        const response =
            await provider.connect();


        const publicKey =
            response.publicKey ||
            provider.publicKey;


        if (!publicKey) {

            throw new Error(
                "Public key tidak ditemukan."
            );

        }


        const address =
            publicKey.toString();


        console.log(
            "Phantom connected:",
            address
        );


        await updateWalletUI(
            address
        );


        const button =
            document.getElementById(
                "connectWallet"
            );


        if (button) {

            button.textContent =
                "Disconnect Phantom";


            button.classList.add(
                "connected"
            );

        }

    } catch (error) {

        console.error(
            "Phantom connection error:",
            error
        );


        if (
            error &&
            error.code === 4001
        ) {

            alert(
                "Koneksi Phantom dibatalkan."
            );

        } else {

            alert(
                "Gagal connect Phantom:\n\n" +
                error.message
            );

        }

    }

}


// ==========================================
// DISCONNECT
// ==========================================

async function disconnectPhantom() {

    const provider =
        getPhantomProvider();


    if (!provider) {
        return;
    }


    try {

        await provider.disconnect();

    } catch (error) {

        console.error(
            "Disconnect error:",
            error
        );

    }


    resetWalletUI();

}


// ==========================================
// RESET WALLET
// ==========================================

function resetWalletUI() {

    const walletAddress =
        document.getElementById(
            "walletAddress"
        );


    const jawpeBalance =
        document.getElementById(
            "jawpeBalance"
        );


    const button =
        document.getElementById(
            "connectWallet"
        );


    if (walletAddress) {

        walletAddress.textContent =
            "Not connected";

    }


    if (jawpeBalance) {

        jawpeBalance.textContent =
            "0 JAWPE";

    }


    if (button) {

        button.textContent =
            "Connect Phantom";


        button.classList.remove(
            "connected"
        );

    }

}


// ==========================================
// WALLET BUTTON
// ==========================================

function setupWalletButton() {

    const button =
        document.getElementById(
            "connectWallet"
        );


    if (!button) {

        console.error(
            "connectWallet tidak ditemukan!"
        );

        return;

    }


    button.addEventListener(
        "click",
        async function () {

            const provider =
                getPhantomProvider();


            if (
                provider &&
                provider.isConnected
            ) {

                await disconnectPhantom();

            } else {

                await connectPhantom();

            }

        }
    );

}


// ==========================================
// COPY MINT
// ==========================================

function setupCopyMint() {

    const button =
        document.getElementById(
            "copyMintButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        async function () {

            try {

                await navigator.clipboard.writeText(
                    JAWPE_MINT
                );


                const oldText =
                    button.textContent;


                button.textContent =
                    "Copied!";


                setTimeout(
                    function () {

                        button.textContent =
                            oldText;

                    },
                    1500
                );


            } catch (error) {

                console.error(
                    "Copy error:",
                    error
                );

            }

        }
    );

}


// ==========================================
// EXISTING CONNECTION
// ==========================================

async function checkExistingConnection() {

    const provider =
        getPhantomProvider();


    if (!provider) {

        console.log(
            "Phantom provider belum ditemukan."
        );

        return;

    }


    try {

        if (
            provider.isConnected &&
            provider.publicKey
        ) {

            const address =
                provider.publicKey.toString();


            await updateWalletUI(
                address
            );


            const button =
                document.getElementById(
                    "connectWallet"
                );


            if (button) {

                button.textContent =
                    "Disconnect Phantom";


                button.classList.add(
                    "connected"
                );

            }

        }

    } catch (error) {

        console.error(
            "Existing connection error:",
            error
        );

    }

}


// ==========================================
// ACCOUNT CHANGED
// ==========================================

function setupAccountChanged() {

    const provider =
        getPhantomProvider();


    if (!provider) {
        return;
    }


    if (
        typeof provider.on !==
        "function"
    ) {

        return;

    }


    provider.on(
        "accountChanged",
        async function (
            publicKey
        ) {

            if (!publicKey) {

                resetWalletUI();

                return;

            }


            const address =
                publicKey.toString();


            await updateWalletUI(
                address
            );

        }
    );

}


// ==========================================
// TRANSFER SUCCESS EVENT
// ==========================================

function setupTransferListener() {

    window.addEventListener(
        "jawpeTransferSuccess",
        async function () {

            const provider =
                getPhantomProvider();


            if (
                provider &&
                provider.publicKey
            ) {

                const address =
                    provider.publicKey.toString();


                await updateWalletUI(
                    address
                );

            }

        }
    );

}


// ==========================================
// INIT
// ==========================================

async function initJAWPE() {

    console.log(
        "================================"
    );


    console.log(
        "JAWPE WEBSITE"
    );


    console.log(
        "Network: Solana Devnet"
    );


    console.log(
        "Mint:",
        JAWPE_MINT
    );


    console.log(
        "================================"
    );


    await updateDevnetStatus();


    await updateTokenSupply();


    await updateAuthorityStatus();


    setupWalletButton();


    setupCopyMint();


    setupAccountChanged();


    setupTransferListener();


    await checkExistingConnection();

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
        initJAWPE
    );

} else {

    initJAWPE();

}