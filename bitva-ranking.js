/**
 * bitva-ranking.js - Оновлена версія
 */
async function loadAndRenderRanking() {
    const N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    const container = document.getElementById('rankingList');
    
    try {
        const response = await fetch(N8N_URL);
        const rawData = await response.json();
        let processed = [];

        rawData.forEach(item => {
            const text = (item.message || item.text || "").toLowerCase();
            let foundId = null;

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
                processed.push({ ...official, score, url: item.facebookUrl || item.url || "#", id: foundId });
            }
        });

        processed.sort((a, b) => b.score - a.score);
        
        // Видаляємо дублікати та беремо ТОП-6
        const uniqueTop6 = [];
        const seen = new Set();
        processed.forEach(item => {
            if (!seen.has(item.id) && uniqueTop6.length < 6) {
                seen.add(item.id);
                uniqueTop6.push(item);
            }
        });

        // Записуємо в ГЛОБАЛЬНУ змінну для карти
        window.currentBattleRanking = uniqueTop6;

        // Вивід карток
        if (container) {
            container.innerHTML = uniqueTop6.map((item, i) => `
                <div class="rank-card">
                    <div class="medal">${i < 3 ? ['🥇','🥈','🥉'][i] : i+1}</div>
                    <img src="${item.media}" class="rank-photo" onerror="this.src='narodocnt.jpg'">
                    <div class="rank-details">
                        <div class="rank-header">
                            <span class="rank-name">${item.name}</span>
                            <span class="metric-info">${item.score} балів</span>
                        </div>
                        <div class="progress-wrapper"><div class="progress-fill" style="width:${(item.score/uniqueTop6[0].score)*100}%"></div></div>
                        <div style="font-size:12px; color:#666; margin-top:5px;">Громада: ${item.location} | Керівник: ${item.leader}</div>
                    </div>
                    <a href="${item.url}" class="btn-watch" target="_blank">Голосувати</a>
                </div>
            `).join('');
        }

        // ВАЖЛИВО: Оновлюємо карту, якщо вона вже ініціалізована
        if (typeof window.renderMarkers === 'function') {
            window.renderMarkers(window.currentMapMode || 'collectives');
        }

    } catch (e) {
        console.error("Помилка рейтингу:", e);
    }
}

document.addEventListener('DOMContentLoaded', loadAndRenderRanking);
