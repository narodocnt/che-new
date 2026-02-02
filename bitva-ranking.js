/**
 * bitva-ranking.js - Логіка карток та підготовка даних
 */
async function loadAndRenderRanking() {
    const container = document.getElementById('rankingList');
    if (!container) return;

    try {
        console.log("Завантаження даних з n8n...");
        const response = await fetch("https://n8n.narodocnt.online/webhook/get-ranking");
        const rawData = await response.json();
        let processed = [];

        // Зв'язуємо дані n8n з вашою базою учасників
        rawData.forEach(item => {
            const text = (item.message || item.text || "").toLowerCase();
            for (let id in window.collectivesDatabase) {
                const db = window.collectivesDatabase[id];
                if (text.includes(db.location.toLowerCase()) || text.includes(db.key.toLowerCase())) {
                    processed.push({ 
                        ...db, 
                        score: (parseInt(item.likes)||0) + (parseInt(item.comments)||0) + (parseInt(item.shares)||0), 
                        url: item.facebookUrl || item.url || "#", 
                        id: id 
                    });
                    break;
                }
            }
        });

        // Сортування та унікальність
        processed.sort((a, b) => b.score - a.score);
        const uniqueTop6 = [];
        const seen = new Set();
        processed.forEach(item => {
            if (!seen.has(item.id) && uniqueTop6.length < 6) {
                seen.add(item.id);
                uniqueTop6.push(item);
            }
        });

        window.currentBattleRanking = uniqueTop6; // Дані для карти

        // Вивід карток
        container.innerHTML = uniqueTop6.map((item, i) => `
            <div class="rank-card">
                <div class="medal">${i < 3 ? ['🥇','🥈','🥉'][i] : i+1}</div>
                <img src="${item.media}" class="rank-photo" onerror="this.src='narodocnt.jpg'">
                <div class="rank-details">
                    <div class="rank-header">
                        <span class="rank-name">${item.name}</span>
                        <span class="metric-info">${item.score} балів</span>
                    </div>
                    <div class="progress-wrapper">
                        <div class="progress-fill" style="width:${(item.score/uniqueTop6[0].score)*100}%"></div>
                    </div>
                    <div style="font-size:12px; color: #7f8c8d; margin-top:5px;">
                        Громада: ${item.location} | Керівник: ${item.leader}
                    </div>
                </div>
                <a href="${item.url}" class="btn-watch" target="_blank">Голосувати</a>
            </div>
        `).join('');

        // Після того, як картки готові, кажемо карті оновитися
        if (window.renderMarkers) {
            window.renderMarkers(window.currentMapMode || 'collectives');
        }

    } catch (e) {
        console.error("Помилка завантаження рейтингу:", e);
        container.innerHTML = "<p style='text-align:center'>Тимчасова помилка оновлення даних...</p>";
    }
}

// Запускаємо, коли документ готовий
document.addEventListener('DOMContentLoaded', loadAndRenderRanking);
