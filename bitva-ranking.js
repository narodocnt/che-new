/**
 * bitva-ranking.js - Професійний рейтинг з точними даними
 */
function loadBattleRanking() {
    console.log("🚀 Пошук збігів Битви розпочато...");
    const container = document.getElementById('rankingList');
    if (!container) return;

    // Перевіряємо наявність нашої бази
    const db = window.collectivesDatabase;
    if (!db) {
        container.innerHTML = "<p style='text-align:center; color:white;'>Помилка: База учасників не завантажена.</p>";
        return;
    }

    fetch("https://n8n.narodocnt.online/webhook/get-ranking")
        .then(res => res.json())
        .then(rawData => {
            let processed = [];

            rawData.forEach(item => {
                // Витягуємо ID поста з URL Фейсбуку або шукаємо в тексті ключове слово
                const fbUrl = item.facebookUrl || "";
                const message = (item.message || "").toLowerCase();
                
                let foundEntry = null;
                let foundId = null;

                // 1. Спробуємо знайти через ID поста в URL (найнадійніше)
                for (let id in db) {
                    if (fbUrl.includes(id)) {
                        foundEntry = db[id];
                        foundId = id;
                        break;
                    }
                }

                // 2. Якщо не знайшли по ID, шукаємо по ключовому слову (key) в тексті
                if (!foundEntry) {
                    for (let id in db) {
                        if (message.includes(db[id].key.toLowerCase())) {
                            foundEntry = db[id];
                            foundId = id;
                            break;
                        }
                    }
                }

                if (foundEntry) {
                    const likes = parseInt(item.likes) || 0;
                    const comments = parseInt(item.comments) || 0;
                    const shares = parseInt(item.shares) || 0;

                    processed.push({
                        ...foundEntry,
                        likes,
                        comments,
                        shares,
                        totalScore: likes + comments + shares,
                        url: fbUrl
                    });
                }
            });

            // Сортування за загальним балом
            processed.sort((a, b) => b.totalScore - a.totalScore);

            // Видаляємо дублікати, якщо один і той же учасник прийшов двічі
            const uniqueResults = [];
            const seenIds = new Set();
            processed.forEach(el => {
                if (!seenIds.has(el.key)) {
                    seenIds.add(el.key);
                    uniqueResults.push(el);
                }
            });

            if (uniqueResults.length === 0) {
                container.innerHTML = "<p style='text-align:center; color:#ccc;'>Дані оновлюються...</p>";
                return;
            }

            // Рендеринг карток
            container.innerHTML = uniqueResults.map((el, index) => {
                const rank = index + 1;
                let badge = `<span class="rank-number">${rank}</span>`;
                if (rank === 1) badge = `<span class="rank-number gold">🥇</span>`;
                if (rank === 2) badge = `<span class="rank-number silver">🥈</span>`;
                if (rank === 3) badge = `<span class="rank-number bronze">🥉</span>`;

                return `
                <div class="battle-card">
                    <div class="card-image-box">
                        <img src="${el.media}" alt="${el.name}" onerror="this.src='narodocnt.jpg'">
                        ${badge}
                    </div>
                    <div class="card-info">
                        <div class="card-header">
                            <h3>${el.name}</h3>
                            <p class="location-tag">📍 ${el.location} громада</p>
                        </div>
                        <p class="institution-text">${el.institution}</p>
                        <div class="stats-row">
                            <div class="stat-item" title="Вподобайки">👍 <span>${el.likes}</span></div>
                            <div class="stat-item" title="Коментарі">💬 <span>${el.comments}</span></div>
                            <div class="stat-item" title="Поширення">🔁 <span>${el.shares}</span></div>
                            <div class="stat-total">РАЗОМ: <span>${el.totalScore}</span></div>
                        </div>
                    </div>
                    <a href="${el.url}" target="_blank" class="vote-btn">ГОЛОСУВАТИ</a>
                </div>
                `;
            }).join('');

            // Оновлюємо карту, якщо функція доступна
            if (window.renderMarkers) window.renderMarkers('battle');
        })
        .catch(err => console.error("Помилка завантаження рейтингу:", err));
}

window.addEventListener('load', loadBattleRanking);
