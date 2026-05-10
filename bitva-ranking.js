function loadBattleRanking() {
    const container = document.getElementById('rankingList');
    if (!container || !window.collectivesDatabase) return;

    container.innerHTML = '<p style="text-align:center; color:white; padding:20px;">Оновлення рейтингу...</p>';

    fetch("https://n8n.narodocnt.online/webhook/get-ranking")
        .then(res => res.json())
        .then(rawData => {
            const db = window.collectivesDatabase;
            const resultsMap = {};

            rawData.forEach(item => {
                const tableText = (item.text || "").toLowerCase();
                const likes = parseInt(item.likes) || 0;
                const comments = parseInt(item.comments) || 0;
                const shares = parseInt(item.shares) || 0;
                const totalScore = likes + comments + shares;

                let foundId = null;
                for (let id in db) {
                    const locSearch = db[id].location.toLowerCase().substring(0, 5);
                    const keySearch = db[id].key.toLowerCase();
                    if (tableText.includes(locSearch) || tableText.includes(keySearch)) {
                        foundId = id;
                        break;
                    }
                }

                if (foundId) {
                    if (!resultsMap[foundId] || totalScore > resultsMap[foundId].total) {
                        resultsMap[foundId] = {
                            ...db[foundId],
                            likes, comments, shares,
                            total: totalScore,
                            finalMedia: db[foundId].media || "https://narodocnt.online/img/bitva/bitva-general.jpg",
                            url: item.facebookUrl
                        };
                    }
                }
            });

            const sorted = Object.values(resultsMap).sort((a, b) => b.total - a.total);

            if (sorted.length === 0) {
                container.innerHTML = '<p style="text-align:center; color:white;">Дані для рейтингу поки відсутні</p>';
                return;
            }

            container.innerHTML = sorted.map((el, index) => {
                const rank = index + 1;
                return `
<a href="${el.url}" target="_blank" class="battle-link">
    <div class="battle-card">
        <div class="rank-number">${rank}</div>
        <div class="card-left">
            <img src="${el.finalMedia}" onerror="this.src='https://narodocnt.online/img/bitva/bitva-general.jpg'">
        </div>
        <div class="card-right">
            <div class="card-info-text">
                <span class="location-label">📍 ${el.location} громада</span>
                <h3 class="collective-name">${el.name}</h3>
                <p class="leader-name">Керівник: ${el.leader}</p>
            </div>
            <div class="stats-formula">
                <span>👍 ${el.likes} + 💬 ${el.comments} + 🔁 ${el.shares}</span>
                <span class="total-score-value">= ${el.total}</span>
            </div>
        </div>
    </div>
</a>`;
            }).join('');
        })
        .catch(err => {
            console.error("Помилка:", err);
            container.innerHTML = '<p style="text-align:center; color:white;">Помилка завантаження даних.</p>';
        });
}

document.addEventListener('DOMContentLoaded', loadBattleRanking);
