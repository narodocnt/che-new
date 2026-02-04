/**
 * bitva-ranking.js - Пошук учасників за ключовими словами в тексті
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
                // Беремо текст поста з поля message
                const text = (item.message || "").toLowerCase();
                const fbUrl = item.facebookUrl || "";
                let foundId = null;

                // ШУКАЄМО ЗБІГ: Проходимо по кожному учаснику в базі
                for (let id in db) {
                    const entry = db[id];
                    // Шукаємо назву локації (напр. "смілянська") або ключ (напр. "smila") у тексті поста
                    const locationKeyword = entry.location.toLowerCase().replace("ська", ""); // беремо корінь
                    const keyKeyword = entry.key.toLowerCase();

                    if (text.includes(locationKeyword) || text.includes(keyKeyword)) {
                        foundId = id;
                        break;
                    }
                }

                if (foundId) {
                    // Якщо знайшли громаду в тексті — записуємо статистику
                    const likes = parseInt(item.likes) || 0;
                    const comments = parseInt(item.comments) || 0;
                    const shares = parseInt(item.shares) || 0;
                    const total = likes + comments + shares;

                    // Зберігаємо тільки унікальні (якщо постів кілька для однієї громади — беремо кращий)
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

            const processed = Object.values(resultsMap);
            processed.sort((a, b) => b.total - a.total);

            if (processed.length === 0) {
                container.innerHTML = "<p style='text-align:center; padding:20px; color:white;'>Громад не знайдено в тексті постів. Перевірте зміст повідомлень.</p>";
                return;
            }

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
                            <p class="leader-name">${el.leader}</p>
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
        })
        .catch(err => console.error("Помилка завантаження Битви:", err));
}

window.addEventListener('load', loadBattleRanking);
