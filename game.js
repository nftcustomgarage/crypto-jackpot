window.onload = function () {
    const spinButton = document.getElementById("spin-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const buyCoinButton = document.getElementById("buy-coin-button");
    const walletAddressDisplay = document.getElementById("wallet-address");

    let playerBalance = 20;
    let temporaryBalance = 0;
    let spins = 0;
    const coinPrice = 0.000005775;
    let houseBalance = 50000000;

    const icons = [
        'https://i.imgur.com/Xpf9bil.png',
        'https://i.imgur.com/toIiHGF.png',
        'https://i.imgur.com/tuXO9tn.png',
        'https://i.imgur.com/7XZCiRx.png',
        'https://i.imgur.com/7N2Lyw9.png',
        'https://i.imgur.com/OazBXaj.png',
        'https://i.imgur.com/bIBTHd0.png',
        'https://i.imgur.com/PTrhXRa.png',
        'https://i.imgur.com/cAkESML.png'
    ];

    // BUY Coin butonu için sayfayı açma
    buyCoinButton.addEventListener("click", function() {
        window.open("https://photon-sol.tinyastro.io/en/lp/H6pB2VhBHxHZ3jpmkBb1WTTpnnktTgjDv2osLJEU1dX9", "_blank");
    });

    // Phantom Wallet bağlantısı kontrolü ve bağlama
    async function connectPhantomWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                const walletAddress = response.publicKey.toString();
                walletAddressDisplay.textContent = `Connected Wallet: ${walletAddress}`;
                return walletAddress;
            } catch (error) {
                alert("Phantom Wallet connection failed. Please try again.");
            }
        } else {
            alert("Phantom Wallet is not detected. Please install Phantom Wallet and try again.");
        }
    }

    // Phantom Wallet’a bağlanma ve coin çekme işlemi
    async function withdrawCoins() {
        const walletAddress = await connectPhantomWallet();
        if (walletAddress && temporaryBalance > 0) {
            showMessage(`Success! ${temporaryBalance} coins transferred to your wallet!`);
            temporaryBalance = 0; // Kazançlar sıfırlanır
            updateBalances();
        } else if (!walletAddress) {
            showMessage("Wallet connection required.");
        } else {
            showMessage("No rewards to withdraw.");
        }
    }

    withdrawButton.addEventListener("click", withdrawCoins);
    spinButton.addEventListener("click", spin);

    function spin() {
        if (playerBalance <= 0) {
            showMessage("Insufficient coins!");
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
            playerBalance += winAmount; // Kazanılan coinler oyuncu bakiyesine ekleniyor
            temporaryBalance += winAmount; // Geçici bakiyeye de ekleniyor
            houseBalance -= winAmount; // House bakiyesi güncelleniyor
            showMessage(`Congratulations! You won ${winAmount} 2JZ Coin!`);
            spinResults.filter(result => result.icon === winIcon).forEach(result => result.element.classList.add('flash-effect'));
        } else {
            houseBalance += 0.2; // Eğer kazanamazsa house'a küçük bir artış
            showMessage("Spin again!");
        }

        updateBalances(); // Ekrandaki bakiyeleri güncelle
        spinButton.disabled = false;

        if (playerBalance <= 0) {
            spinButton.disabled = true;
            showMessage("Game Over! Buy more 2JZ coins.");
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
