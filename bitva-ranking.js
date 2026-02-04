/**
 * bitva-ranking.js - Фінальна версія з фільтрацією дублікатів
 */
function loadBattleRanking() {
    const container = document.getElementById('rankingList');
    if (!container || !window.collectivesDatabase) return;

    fetch("https://n8n.narodocnt.online/webhook/get-ranking")
        .then(res => res.json())
        .then(rawData => {
            const db = window.collectivesDatabase;
            const resultsMap = {}; // Тут ми будемо зберігати тільки унікальні записи

            rawData.forEach(item => {
                const fbUrl = item.facebookUrl || "";
                let foundId = null;

                // Шукаємо, якому ID з бази належить цей пост
                for (let id in db) {
                    if (fbUrl.includes(id)) {
                        foundId = id;
                        break;
                    }
                }

                if (foundId) {
                    const likes = parseInt(item.likes) || 0;
                    const comments = parseInt(item.comments) || 0;
                    const shares = parseInt(item.shares) || 0;
                    const total = likes + comments + shares;

                    // Якщо ми вже бачили цей ID, беремо той запис, де більше балів (про всяк випадок)
                    if (!resultsMap[foundId] || total > resultsMap[foundId].total) {
                        resultsMap[foundId] = {
                            ...db[foundId],
                            likes,
                            comments,
                            shares,
                            total,
                            url: fbUrl
                        };
                    }
                }
            });

            // Перетворюємо об'єкт назад у масив для сортування
            let processed = Object.values(resultsMap);

            // Сортуємо за рейтингом
            processed.sort((a, b) => b.total - a.total);

            if (processed.length === 0) {
                container.innerHTML = "<p style='text-align:center; padding:20px; color:white;'>Дані оновлюються...</p>";
                return;
            }

            // Виводимо картки (тепер кожна громада буде лише один раз)
            container.innerHTML = processed.map((el, index) => {
                const rank = index + 1;
                let medal = rank;
                if (rank === 1) medal = "🥇";
                if (rank === 2) medal = "🥈";
                if (rank === 3) medal = "🥉";

                return `
                <div class="battle-card">
                    <div class="card-left">
                        <img src="${el.media}" onerror="this.src='narodocnt.jpg'">
                        <div class="rank-badge">${medal}</div>
                    </div>
                    <div class="card-right">
                        <div class="card-top">
                            <span class="location-label">📍 ${el.location}</span>
                            <h3 class="collective-name">${el.name}</h3>
                            <p class="leader-name">Керівник: ${el.leader}</p>
                        </div>
                        <div class="stats-grid">
                            <div class="stat">👍 ${el.likes}</div>
                            <div class="stat">💬 ${el.comments}</div>
                            <div class="stat">🔁 ${el.shares}</div>
                            <div class="stat-total">БАЛИ: ${el.total}</div>
                        </div>
                    </div>
                    <a href="${el.url}" target="_blank" class="vote-link">ГОЛОС</a>
                </div>`;
            }).join('');
            
            if (window.renderMarkers) window.renderMarkers('battle');
        })
        .catch(err => console.error("Помилка рейтингу:", err));
}

window.addEventListener('load', loadBattleRanking);
