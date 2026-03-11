/**
 * bitva-ranking.js - Оновлена версія: клікабельна картка, без кнопки, адаптивні класи
 */
function loadBattleRanking() {
    const container = document.getElementById('rankingList');
    if (!container || !window.collectivesDatabase) return;

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
                            finalMedia: item.media || db[foundId].media,
                            url: item.facebookUrl
                        };
                    }
                }
            });

            const sorted = Object.values(resultsMap).sort((a, b) => b.total - a.total);

            container.innerHTML = sorted.map((el, index) => {
                const rank = index + 1;
                const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank;

                // Повертаємо всю картку, обгорнуту в посилання <a>
                return `
                <a href="${el.url}" target="_blank" class="battle-card-link">
    <div class="battle-card">
        <div class="card-left">
            <img src="${el.finalMedia}" onerror="this.src='narodocnt.jpg'">
            <div class="rank-badge">${medal}</div>
        </div>
        <div class="card-right" style="padding: 15px; flex-grow: 1; text-align: left;">
            <span class="location-label" style="color: #e67e22; font-weight: bold;">📍 ${el.location} громада</span>
            <h3 class="collective-name" style="margin: 5px 0; color: #2c3e50;">${el.name}</h3>
            <p class="leader-name" style="color: #7f8c8d; margin: 0;">Керівник: ${el.leader}</p>
            
            <div class="stats-formula" style="margin-top: 12px; display: flex; align-items: center; background: #f8f9fa; padding: 8px; border-radius: 8px;">
                <span style="font-size: 0.9em;">👍 ${el.likes} + 💬 ${el.comments} + 🔁 ${el.shares}</span>
                <b style="margin-left: auto; font-size: 1.2em; color: #2c3e50;">= ${el.total}</b>
            </div>
        </div>
    </div>
</a>`;
        })
        .catch(err => console.error("Помилка:", err));
}

window.addEventListener('load', loadBattleRanking);
