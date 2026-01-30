// Захист від повторного оголошення
if (typeof currentData === 'undefined') {
    var currentData = [];
}

async function loadRanking() {
    const N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    
    try {
        const db = window.collectivesDatabase;
        if (!db) return console.error("База collectivesDatabase не знайдена!");

        const response = await fetch(N8N_URL);
        const rawData = await response.json();
        const groups = {};

        rawData.forEach(item => {
            const fbId = String(item.id || item.row_number); // Беремо ID
            if (db[fbId]) {
                const l = parseInt(item.likes) || 0;
                const s = parseInt(item.shares) || 0;
                const c = parseInt(item.comments) || 0;
                groups[fbId] = { ...db[fbId], score: l + s + c, breakdown: { l, s, c } };
            }
        });

        window.currentData = Object.values(groups).sort((a, b) => b.score - a.score);
        
        // Оновлюємо список
        const list = document.getElementById('rankingList');
        if (list) renderRanking(list);

        // ПЕРЕДАЧА НА МАПУ
        window.currentBattleData = {};
        window.currentData.forEach(item => {
            window.currentBattleData[item.location] = item;
        });

        // Якщо мапа вже завантажена, просимо її перемалювати маркери
        if (typeof renderMarkers === 'function') renderMarkers('battle');

    } catch (e) { console.error("Помилка:", e); }
}

function renderRanking(container) {
    container.innerHTML = window.currentData.map((item, i) => `
        <div style="border:2px solid gold; margin:5px; padding:10px; background:white; border-radius:10px; display:flex; justify-content:space-between;">
            <span><b>${i+1}. ${item.name}</b></span>
            <span style="color:red; font-weight:bold;">${item.score}</span>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', loadRanking);
// Про всяк випадок запускаємо ще раз через 2 секунди, якщо мапа завантажується довго
setTimeout(loadRanking, 2000);
