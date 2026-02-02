/**
 * bitva-ranking.js - Надійне завантаження
 */
async function loadAndRenderRanking() {
    const container = document.getElementById('rankingList');
    if (!container) return;

    try {
        const response = await fetch("https://n8n.narodocnt.online/webhook/get-ranking");
        const rawData = await response.json();
        let processed = [];

        // 1. Склеюємо з базою даних
        rawData.forEach(item => {
            const text = (item.message || item.text || "").toLowerCase();
            for (let id in window.collectivesDatabase) {
                const db = window.collectivesDatabase[id];
                if (text.includes(db.location.toLowerCase()) || text.includes(db.key.toLowerCase())) {
                    processed.push({ ...db, score: (parseInt(item.likes)||0) + (parseInt(item.comments)||0) + (parseInt(item.shares)||0), url: item.facebookUrl || item.url || "#", id: id });
                    break;
                }
            }
        });

        // 2. Сортуємо та фільтруємо унікальні
        processed.sort((a, b) => b.score - a.score);
        const uniqueTop6 = [];
        const seen = new Set();
        processed.forEach(item => {
            if (!seen.has(item.id) && uniqueTop6.length < 6) {
                seen.add(item.id);
                uniqueTop6.push(item);
            }
        });

        window.currentBattleRanking = uniqueTop6; // Зберігаємо для карти

        // 3. Малюємо картки
        container.innerHTML = uniqueTop6.map((item, i) => `
            <div class="rank-card" style="display: flex; align-items: center; background: #fff; margin-bottom: 10px; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
                <div style="font-size: 24px; margin-right: 15px;">${i < 3 ? ['🥇','🥈','🥉'][i] : i+1}</div>
                <img src="${item.media}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; margin-right: 15px;" onerror="this.src='narodocnt.jpg'">
                <div style="flex-grow: 1;">
                    <div style="font-weight: bold; font-size: 14px;">${item.name}</div>
                    <div style="font-size: 12px; color: #e67e22;">Балів: ${item.score}</div>
                </div>
                <a href="${item.url}" target="_blank" style="background: #3498db; color: #fff; padding: 5px 10px; border-radius: 4px; text-decoration: none; font-size: 12px;">Голосувати</a>
            </div>
        `).join('');

        // 4. Повідомляємо карту, що дані є
        console.log("Дані битви готові. Оновлюємо карту...");
        if (window.renderMarkers) window.renderMarkers(window.currentMapMode || 'collectives');

    } catch (e) {
        console.error("Помилка:", e);
        container.innerHTML = "Дані тимчасово недоступні.";
    }
}

// Запуск
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAndRenderRanking);
} else {
    loadAndRenderRanking();
}
