/**
 * bitva-ranking.js - Розумне порівняння та вивід точних даних
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
                // Беремо "брудний" текст із таблиці для пошуку
                const tableText = (item.text || "").toLowerCase();
                
                // Статистика з таблиці
                const likes = parseInt(item.likes) || 0;
                const comments = parseInt(item.comments) || 0;
                const shares = parseInt(item.shares) || 0;
                const totalScore = likes + comments + shares;

                let foundId = null;

                // ШУКАЄМО ВІДПОВІДНІСТЬ
                for (let id in db) {
                    const entry = db[id];
                    // Шукаємо за локацією (напр. "смілянська") або ключем (напр. "smila")
                    const locSearch = entry.location.toLowerCase().substring(0, 5);
                    const keySearch = entry.key.toLowerCase();

                    if (tableText.includes(locSearch) || tableText.includes(keySearch)) {
                        foundId = id;
                        break;
                    }
                }

                if (foundId) {
                    // Якщо знайшли збіг, зберігаємо дані. 
                    // Якщо одна громада зустрічається двічі — залишаємо ту, де вищий бал.
                    if (!resultsMap[foundId] || totalScore > resultsMap[foundId].total) {
                        resultsMap[foundId] = {
                            // Беремо ВСІ ТОЧНІ ДАНІ з твого файлу (name, leader, institution, location)
                            ...db[foundId], 
                            // Додаємо цифри з таблиці
                            likes,
                            comments,
                            shares,
                            total: totalScore,
                            // Пріоритет медіа: якщо в таблиці є пряме посилання — беремо його, якщо ні — з файлу
                            finalMedia: item.media || db[foundId].media,
                            url: item.facebookUrl
                        };
                    }
                }
            });

            // Сортуємо: лідери зверху
            const sorted = Object.values(resultsMap).sort((a, b) => b.total - a.total);

            if (sorted.length === 0) {
                container.innerHTML = "<p style='text-align:center; color:white; padding:20px;'>Опрацювання даних Битви...</p>";
                return;
            }

            // Рендеринг карток з ТОЧНИМИ назвами
            container.innerHTML = sorted.map((el, index) => {
                const rank = index + 1;
                const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank;

                return `
                <div class="battle-card">
                    <div class="card-left">
                        <img src="${el.finalMedia}" onerror="this.src='narodocnt.jpg'">
                        <div class="rank-badge">${medal}</div>
                    </div>
                    <div class="card-right">
                        <div class="card-top">
                            <span class="location-label">📍 ${el.location} громада</span>
                            <h3 class="collective-name">${el.name}</h3>
                            <p class="leader-name">Керівник: <b>${el.leader}</b></p>
                            <p class="institution-text">${el.institution}</p>
                        </div>
                        <div class="stats-grid">
                            <div class="stat">👍 ${el.likes}</div>
                            <div class="stat">💬 ${el.comments}</div>
                            <div class="stat">🔁 ${el.shares}</div>
                            <div class="stat-total">РАЗОМ: ${el.total}</div>
                        </div>
                    </div>
                    <a href="${el.url}" target="_blank" class="vote-link">ГОЛОСУВАТИ</a>
                </div>`;
            }).join('');
        })
        .catch(err => console.error("Помилка завантаження рейтингу:", err));
}

window.addEventListener('load', loadBattleRanking);
