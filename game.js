window.onload = function () {
    const spinButton = document.getElementById("spin-button");
    const withdrawButton = document.getElementById("withdraw-button");
    const transferButton = document.getElementById("transfer-button");
    const buyCoinButton = document.getElementById("buy-coin-button");
    const resultMessage = document.getElementById("result-message");
    const playerBalanceDisplay = document.getElementById("player-balance");
    const earnedCoinsDisplay = document.getElementById("earned-coins");
    const spinCounterDisplay = document.getElementById("spin-counter");

    let playerBalance = 20;
    let temporaryBalance = 0; // Kazanılan coinler
    let spins = 0;
    const coinPrice = 0.000005775;

    const icons = [ // Slot makinesi ikonları
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

    const leaderboard = []; // Liderlik tablosu verisi

    // Liderlik tablosunu güncelleyen fonksiyon
    function updateLeaderboard(playerName = "Guest") {
        const player = leaderboard.find(p => p.name === playerName);

        if (player) {
            player.spins += 1; // Oyuncunun spin sayısını artır
        } else {
            leaderboard.push({ name: playerName, spins: 1 }); // Yeni oyuncu ekle
        }

        leaderboard.sort((a, b) => b.spins - a.spins); // Spin sayılarına göre sıralama
        displayLeaderboard();
    }

    // Liderlik tablosunu HTML'de gösteren fonksiyon
    function displayLeaderboard() {
        const firstSpin = leaderboard[0]?.spins || 0;
        const secondSpin = leaderboard[1]?.spins || 0;
        const thirdSpin = leaderboard[2]?.spins || 0;

        document.getElementById("first-spin-count").textContent = firstSpin;
        document.getElementById("second-spin-count").textContent = secondSpin;
        document.getElementById("third-spin-count").textContent = thirdSpin;
    }

    function updateBalances() {
        playerBalanceDisplay.textContent = `Your Balance: ${playerBalance} Coins ($${(playerBalance * coinPrice).toFixed(6)})`;
        earnedCoinsDisplay.textContent = `Earned Coins: ${temporaryBalance} Coins ($${(temporaryBalance * coinPrice).toFixed(6)})`;
        spinCounterDisplay.textContent = `Spins: ${spins}`;
    }

    function spin() {
        if (playerBalance <= 0) {
            resultMessage.textContent = "Insufficient coins! Transfer or buy more coins.";
            return;
        }

        spinButton.disabled = true; // Spin butonunu geçici olarak devre dışı bırak
        resultMessage.textContent = ""; // Mesajı temizle
        playerBalance--; // Bakiyeden 1 düş
        spins++; // Spin sayısını artır

        const slots = document.querySelectorAll('.slot');
        let spinResults = [];
        let animationCompleteCount = 0;

        // Slot animasyonlarını başlat
        slots.forEach(slot => slot.classList.remove('flash-effect'));
        slots.forEach((slot, index) => {
            let totalSpins = icons.length * 8; // Her slot için toplam dönüş sayısı
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
                    animationCompleteCount++;

                    // Tüm animasyonlar tamamlandığında sonuçları kontrol et
                    if (animationCompleteCount === slots.length) {
                        checkResults(spinResults);
                        updateLeaderboard("Guest"); // Liderlik tablosunu güncelle
                        spinButton.disabled = false; // Spin butonunu tekrar aktif et
                    }
                }
            }
            animateSpin();
        });

        updateBalances();
    }

    function checkResults(spinResults) {
        const winIcon = 'https://i.imgur.com/7N2Lyw9.png'; // Kazanan ikon
        const winCount = spinResults.filter(result => result.icon === winIcon).length; // Kazanılan ikon sayısı
        let winAmount = winCount === 1 ? 1 : winCount === 2 ? 5 : winCount === 3 ? 100 : 0; // Kazanılan miktar

        if (winAmount > 0) {
            temporaryBalance += winAmount; // Kazanılan coinler geçici bakiyeye eklenir
            resultMessage.textContent = `💰 Congratulations! You won ${winAmount} coins! 💰`;
            spinResults
                .filter(result => result.icon === winIcon)
                .forEach(result => result.element.classList.add('flash-effect')); // Flash efekt eklenir
        } else {
            resultMessage.textContent = "Try again! No coins won this time.";
        }

        updateBalances();
    }

    transferButton.addEventListener("click", () => {
        if (temporaryBalance > 0) {
            playerBalance += temporaryBalance;
            temporaryBalance = 0;
            resultMessage.textContent = "Coins transferred to your main balance!";
            updateBalances();
        } else {
            resultMessage.textContent = "No coins to transfer!";
        }
    });

    spinButton.addEventListener("click", spin);
};
