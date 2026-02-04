/**
 * bitva-ranking.js - Фінальна версія: 6 карток, повна статистика
 */
function loadBattleRanking() {
    const container = document.getElementById('rankingList');
    if (!container || !window.collectivesDatabase) return;

    fetch("https://n8n.narodocnt.online/webhook/get-ranking")
        .then(res => res.json())
        .then(rawData => {
            let processed = [];
            const db = window.collectivesDatabase;

            // Обробляємо дані з n8n
            rawData.forEach(item => {
                const fbUrl = item.facebookUrl || "";
                let foundEntry = null;

                // Шукаємо збіг по ID (10, 11, 12, 14, 17, 20) в URL
                for (let id in db) {
                    if (fbUrl.includes(id)) {
                        foundEntry = JSON.parse(JSON.stringify(db[id])); // Клонуємо об'єкт
                        break;
                    }
                }

                if (foundEntry) {
                    const likes = parseInt(item.likes) || 0;
                    const comments = parseInt(item.comments) || 0;
                    const shares = parseInt(item.shares) || 0;
                    
                    processed.push({
                        ...foundEntry,
                        likes: likes,
                        comments: comments,
                        shares: shares,
                        total: likes + comments + shares,
                        url: fbUrl
                    });
                }
            });

            // Сортуємо: хто набрав більше балів — той вище
            processed.sort((a, b) => b.total - a.total);

            // Якщо даних менше 6 (наприклад, сервер ще вантажить), додаємо пусті або виводимо що є
            if (processed.length === 0) {
                container.innerHTML = "<p style='text-align:center; color:white;'>Отримання даних з Facebook...</p>";
                return;
            }

            // Малюємо рівно 6 карток
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
                            <div class="stat"><span class="icon">👍</span> ${el.likes}</div>
                            <div class="stat"><span class="icon">💬</span> ${el.comments}</div>
                            <div class="stat"><span class="icon">🔁</span> ${el.shares}</div>
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
