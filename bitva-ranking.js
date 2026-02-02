/**
 * bitva-ranking.js - Обробка рейтингу та вивід карток
 */
async function loadAndRenderRanking() {
    const N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    const container = document.getElementById('rankingList');
    
    try {
        const response = await fetch(N8N_URL);
        const rawData = await response.json();
        let processed = [];

        rawData.forEach(item => {
            const text = (item.message || "").toLowerCase();
            let foundId = null;

            // Порівняння з вашою базою даних
            for (let id in window.collectivesDatabase) {
                const db = window.collectivesDatabase[id];
                if (text.includes(db.location.toLowerCase()) || text.includes(db.key.toLowerCase())) {
                    foundId = id;
                    break;
                }
            }

            if (foundId) {
                const official = window.collectivesDatabase[foundId];
                const score = (parseInt(item.likes)||0) + (parseInt(item.comments)||0) + (parseInt(item.shares)||0);
                processed.push({
                    ...official,
                    score: score,
                    url: item.facebookUrl || item.url || "#"
                });
            }
        });

        // Сортуємо та прибираємо дублікати (залишаємо кращий результат колективу)
        processed.sort((a, b) => b.score - a.score);
        const uniqueTop6 = [];
        const seen = new Set();
        for (let item of processed) {
            if (!seen.has(item.name) && uniqueTop6.length < 6) {
                seen.add(item.name);
                uniqueTop6.push(item);
            }
        }

        // Рендеримо картки
        if (container) {
            container.innerHTML = uniqueTop6.map((item, i) => `
                <div class="rank-card">
                    <div class="medal">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</div>
                    <img src="${item.media}" class="rank-photo" onerror="this.src='narodocnt.jpg'">
                    <div class="rank-details">
                        <div class="rank-header">
                            <span class="rank-name">${item.name}</span>
                            <span class="metric-info">${item.score} балів</span>
                        </div>
                        <div class="progress-wrapper"><div class="progress-fill" style="width:${(item.score/(uniqueTop6[0].score||1))*100}%"></div></div>
                        <div style="font-size:12px; color:#7f8c8d; margin-top:5px;">Громада: ${item.location} | Керівник: ${item.leader}</div>
                    </div>
                    <a href="${item.url}" class="btn-watch" target="_blank">Голосувати</a>
                </div>
            `).join('');
        }
        
        // Передаємо дані в глобальну змінну для карти
        window.currentBattleRanking = uniqueTop6;
        // Оновлюємо карту, якщо вона вже завантажена
        if (window.renderMarkers) window.renderMarkers('battle');

    } catch (e) {
        console.error("Помилка ранкінгу:", e);
        if (container) container.innerHTML = "Помилка завантаження даних.";
    }
}

document.addEventListener('DOMContentLoaded', loadAndRenderRanking);
