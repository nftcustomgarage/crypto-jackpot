window.onload = function () {
    const spinButton = document.getElementById("spin-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const buyCoinButton = document.getElementById("buy-coin-button");
    const walletAddressDisplay = document.getElementById("wallet-address");

    let playerBalance = 20; // Oyuncunun başlangıç bakiyesi
    let temporaryBalance = 0; // Kazançların geçici bakiyesi
    let spins = 0; // Toplam spin sayısı
    const coinPrice = 0.000005775; // Coin fiyatı
    const houseWallet = "57HY1trTTWrSDTonyhveXKdUDh2qH6HLWzkBnu3MGGQK";

    const icons = [
        'https://i.imgur.com/Xpf9bil.png',
        'https://i.imgur.com/toIiHGF.png',
        'https://i.imgur.com/tuXO9tn.png',
        'https://i.imgur.com/7XZCiRx.png',
        'https://i.imgur.com/7N2Lyw9.png', // Kazanma ikonu
        'https://i.imgur.com/OazBXaj.png',
        'https://i.imgur.com/bIBTHd0.png',
        'https://i.imgur.com/PTrhXRa.png',
        'https://i.imgur.com/cAkESML.png'
    ];

    // BUY Coin butonu için sayfayı açma
    buyCoinButton.addEventListener("click", function () {
        window.open("https://photon-sol.tinyastro.io/en/lp/H6pB2VhBHxHZ3jpmkBb1WTTpnnktTgjDv2osLJEU1dX9", "_blank");
    });

    // Phantom Wallet bağlantısı
    async function connectPhantomWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                const walletAddress = response.publicKey.toString();
                walletAddressDisplay.textContent = `Connected Wallet: ${walletAddress}`;
                return walletAddress;
            } catch (error) {
                alert("Phantom Wallet connection failed. Please try again.");
                return null;
            }
        } else {
            alert("Phantom Wallet is not detected. Please install Phantom Wallet.");
            return null;
        }
    }

    // Phantom Wallet üzerinden coin çekme işlemi
    async function withdrawCoins() {
        const walletAddress = await connectPhantomWallet();
        if (walletAddress && temporaryBalance > 0) {
            try {
                const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'), 'confirmed');
                const transaction = new solanaWeb3.Transaction().add(
                    solanaWeb3.SystemProgram.transfer({
                        fromPubkey: new solanaWeb3.PublicKey(houseWallet),
                        toPubkey: new solanaWeb3.PublicKey(walletAddress),
                        lamports: temporaryBalance * solanaWeb3.LAMPORTS_PER_SOL,
                    })
                );

                // İşlemi imzala ve gönder
                const signature = await solanaWeb3.sendAndConfirmTransaction(connection, transaction, []);
                alert(`Success! Transaction ID: ${signature}`);
                temporaryBalance = 0;
                updateBalances();
            } catch (error) {
                console.error("Transaction failed:", error);
                alert("Transaction failed. Please try again.");
            }
        } else {
            alert("No rewards to withdraw or wallet not connected.");
        }
    }

    // Coin çekme butonu
    withdrawButton.addEventListener("click", withdrawCoins);

    // Spin butonu
    spinButton.addEventListener("click", spin);

    function spin() {
        if (playerBalance <= 0) {
            showMessage("Insufficient coins! Please buy more.");
            return;
        }

        spinButton.disabled = true;
        clearMessage();
        playerBalance -= 1;
        spins++;

        const slots = document.querySelectorAll('.slot');
        let spinResults = [];

        slots.forEach(slot => slot.classList.remove('flash-effect'));
        slots.forEach((slot, index) => {
            let totalSpins = icons.length * 8;
            let currentSpin = 0;

            function animateSpin() {
                if (currentSpin < totalSpins) {
                    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
                    slot.style.backgroundImage = `url(${randomIcon})`;
                    currentSpin++;
                    setTimeout(animateSpin, 50);
                } else {
                    const finalIcon = icons[Math.floor(Math.random() * icons.length)];
                    slot.style.backgroundImage = `url(${finalIcon})`;
                    spinResults.push({ icon: finalIcon, element: slot });
                    if (spinResults.length === 3) checkResults(spinResults);
                }
            }
            animateSpin();
        });
    }

    function checkResults(spinResults) {
        const winIcon = 'https://i.imgur.com/7N2Lyw9.png';
        const winCount = spinResults.filter(result => result.icon === winIcon).length;
        let winAmount = winCount === 1 ? 1 : winCount === 2 ? 5 : winCount === 3 ? 100 : 0;

        if (winAmount > 0) {
            playerBalance += winAmount; // Kazanılan miktar playerBalance'a ekleniyor
            showMessage(`Congratulations! You won ${winAmount} 2JZ Coin!`);
            spinResults.filter(result => result.icon === winIcon).forEach(result => result.element.classList.add('flash-effect'));
        } else {
            showMessage("Try again!");
        }

        updateBalances();
        spinButton.disabled = false;

        if (playerBalance <= 0) {
            spinButton.disabled = true;
            showMessage("Game Over! Please buy more coins.");
        }
    }

    function updateBalances() {
        const playerValueInUSD = (playerBalance * coinPrice).toFixed(6);
        document.getElementById('player-balance').innerHTML = `Your Balance: ${playerBalance} Coins ($${playerValueInUSD})`;
        document.getElementById('spin-counter').innerHTML = `Spins: ${spins}`;
    }

    function showMessage(message) {
        const resultMessage = document.getElementById('result-message');
        resultMessage.textContent = message;
    }

    function clearMessage() {
        const resultMessage = document.getElementById('result-message');
        resultMessage.textContent = "";
    }
};