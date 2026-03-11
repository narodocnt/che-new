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
                <a href="${el.url}" target="_blank" class="bitva-card-link">
                    <div class="bitva-card">
                        <div class="card-left">
                            <img src="${el.finalMedia}" onerror="this.src='narodocnt.jpg'">
                            <div class="rank-badge">${medal}</div>
                        </div>
                        <div class="card-right">
                            <div class="card-top">
                                <span class="location-label">📍 ${el.location} громада</span>
                                <h3 class="collective-name">${el.name}</h3>
                                <p class="leader-name">Керівник: ${el.leader}</p>
                            </div>
                            
                            <div class="stats-formula">
                                <span class="stat-unit">👍 ${el.likes}</span>
                                <span class="math-sign">+</span>
                                <span class="stat-unit">💬 ${el.comments}</span>
                                <span class="math-sign">+</span>
                                <span class="stat-unit">🔁 ${el.shares}</span>
                                <span class="math-sign">=</span>
                                
                                <div class="star-rating-container">
                                    <div class="octagon-star"></div>
                                    <span class="total-score-value">${el.total}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>`;
            }).join('');
        })
        .catch(err => console.error("Помилка:", err));
}

window.addEventListener('load', loadBattleRanking);
