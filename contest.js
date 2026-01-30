/**
 * contest.js - Фінальна версія (Робота по ID)
 */
let currentData = [];

async function loadRanking() {
    const list = document.getElementById('rankingList');
    const N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";

    if (list) list.innerHTML = '<div style="color:white;text-align:center;padding:20px;">Оновлення рейтингу...</div>';

    try {
        // Чекаємо базу даних collectivesDatabase
        let attempts = 0;
        while (!window.collectivesDatabase && attempts < 20) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }

        const db = window.collectivesDatabase;
        if (!db) return console.error("База не знайдена!");

        const response = await fetch(N8N_URL);
        const rawData = await response.json();
        const groups = {};

        rawData.forEach(item => {
            const fbId = String(item.id); 
            
            if (db[fbId]) {
                const l = parseInt(item.likes) || 0;
                const s = parseInt(item.shares) || 0;
                const c = parseInt(item.comments) || 0;
                const total = l + s + c;

                if (!groups[fbId] || total > groups[fbId].score) {
                    groups[fbId] = {
                        ...db[fbId],
                        score: total,
                        breakdown: { l, s, c }
                    };
                }
            }
        });

        currentData = Object.values(groups).sort((a, b) => b.score - a.score);
        
        // Відображаємо список (для головної сторінки)
        if (list) renderRanking(list);

        // Передаємо дані мапі (якщо вона відкрита)
        if (typeof window.currentBattleData !== 'undefined' || typeof renderMarkers === 'function') {
            currentData.forEach(item => {
                if (window.currentBattleData) {
                    window.currentBattleData[item.location] = item;
                }
            });
            if (typeof renderMarkers === 'function') renderMarkers('battle');
        }

    } catch (e) {
        console.error("Помилка:", e);
        if (list) list.innerHTML = "<p style='color:red;'>Помилка зв'язку з сервером</p>";
    }
}

function renderRanking(container) {
    container.innerHTML = '';
    const maxScore = currentData[0]?.score || 1;

    currentData.forEach((item, index) => {
        const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#2980b9', '#8e44ad', '#27ae60'];
        const color = colors[index] || '#2c3e50';
        const progress = (item.score / maxScore) * 100;

        container.innerHTML += `
            <div style="margin: 15px auto; max-width: 550px; background: white; border-radius: 15px; display: flex; border: 3px solid ${color}; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.3); transition: 0.3s;">
                <div style="width: 50px; background: ${color}; color: white; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 900;">${index + 1}</div>
                <div style="width: 120px; height: 100px;"><img src="${item.media}" style="width: 100%; height: 100%; object-fit: cover;"></div>
                <div style="flex: 1; padding: 12px; position: relative; min-width: 0;">
                    <div style="font-weight: 900; font-size: 14px; color: #b33939; text-transform: uppercase; line-height: 1.1;">${item.name}</div>
                    <div style="font-size: 12px; margin: 4px 0;">Керівник: <b>${item.leader}</b></div>
                    <div style="font-size: 11px; color: #7f8c8d; font-style: italic;">${item.institution}</div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                        <div style="font-size: 12px; font-weight: bold; color: #34495e;">👍 ${item.breakdown.l} &nbsp; 🔄 ${item.breakdown.s} &nbsp; 💬 ${item.breakdown.c}</div>
                        <div style="font-size: 24px; font-weight: 900; color: ${color};">${item.score}</div>
                    </div>
                    <div style="position: absolute; bottom: 0; left: 0; height: 4px; background: ${color}; width: ${progress}%; opacity: 0.6;"></div>
                </div>
            </div>`;
    });
}

// Запуск при завантаженні
document.addEventListener('DOMContentLoaded', loadRanking);
