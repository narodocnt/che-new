/**
 * contest.js - Автоматичний рейтинг із правильним зіставленням
 */
var currentData = [];

async function loadRanking() {
    const N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    const listElement = document.getElementById('rankingList');
    
    if (!listElement) return;

    try {
        const response = await fetch(N8N_URL);
        const data = await response.json();
        const db = window.collectivesDatabase;

        if (!db) return;

        let groups = {};

        data.forEach(item => {
            const fbUrl = String(item.url || "").toLowerCase();
            const pId = String(item.postId || "");
            let id = null;

            // АВТОМАТИЧНЕ ВИЗНАЧЕННЯ: Шукаємо унікальні мітки в посиланнях
            // Вам потрібно лише ОДИН РАЗ перевірити, чи ці слова є в посиланнях на FB
            if (fbUrl.includes("bozhidar") || pId === "1395890575915215") id = 10; 
            else if (fbUrl.includes("smila") || pId === "1393924596111813") id = 11;
            else if (fbUrl.includes("zveny") || pId === "1395880485916224") id = 12;
            else if (fbUrl.includes("kamyan") || pId === "1382677543903185") id = 14;
            else if (fbUrl.includes("hrist") || pId === "1384574163713523") id = 17;
            else if (fbUrl.includes("vodo") || pId === "1390245389813067") id = 20;

            if (id && db[id]) {
                const l = parseInt(item.likes) || 0;
                const c = parseInt(item.comments) || 0;
                const s = parseInt(item.shares) || 0;
                const total = l + c + s;
                
                // Зберігаємо дані під правильним ID
                if (!groups[id] || total > groups[id].score) {
                    groups[id] = { 
                        ...db[id], 
                        score: total,
                        likes: l, comments: c, shares: s,
                        fbUrl: item.url,
                        thumb: item.media || ""
                    };
                }
            }
        });

        // САМЕ ЦЕЙ РЯДОК РОБИТЬ АВТОМАТИЧНЕ СОРТУВАННЯ ЗА РЕЙТИНГОМ
        const sorted = Object.values(groups).sort((a, b) => b.score - a.score);
        
        renderRanking(sorted);

    } catch (e) {
        console.error("Помилка рейтингу:", e);
    }
}

function renderRanking(data) {
    const listElement = document.getElementById('rankingList');
    if (!listElement) return;

    listElement.innerHTML = data.map((item, index) => `
        <div style="background: white; margin: 15px 0; padding: 15px; border-radius: 12px; display: flex; align-items: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-left: 6px solid ${index === 0 ? '#f1c40f' : '#e67e22'};">
            
            <a href="${item.fbUrl}" target="_blank" style="display: block; width: 80px; height: 80px; flex-shrink: 0; overflow: hidden; border-radius: 8px; margin-right: 15px;">
                <img src="${item.thumb}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://via.placeholder.com/80?text=FB'">
            </a>

            <div style="flex-grow: 1; text-align: left;">
                <div style="font-weight: 800; color: #d35400; font-size: 0.8rem;">#${index + 1} МІСЦЕ</div>
                <div style="font-weight: bold; font-size: 1.1rem; color: #2c3e50;">${item.name}</div>
                <div style="font-size: 0.85rem; color: #7f8c8d; margin-bottom: 5px;">${item.location} громада</div>
                
                <div style="font-size: 0.9rem; color: #555; background: #f9f9f9; padding: 4px 8px; border-radius: 6px; width: fit-content; display: flex; gap: 8px; align-items: center;">
                    <span>👍 ${item.likes}</span> + <span>💬 ${item.comments}</span> + <span>↗️ ${item.shares}</span> = 
                    <strong style="color: #e67e22;">${item.score}</strong>
                </div>
            </div>

            <a href="${item.fbUrl}" target="_blank" style="background: #e67e22; color: white; padding: 10px 15px; border-radius: 8px; text-decoration: none; font-size: 0.8rem; font-weight: bold; margin-left: 10px;">
                ГОЛОСУВАТИ
            </a>
        </div>
    `).join('');
}

// Код для зірочки (інфо-віконце)
document.addEventListener('mouseover', function(e) {
    if (e.target && e.target.id === 'rulesStar') {
        let tooltip = document.getElementById('battle-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'battle-tooltip';
            tooltip.innerHTML = "<strong>Бали:</strong><br>Лайк = 1<br>Коментар = 1<br>Поширення = 1";
            tooltip.style = "position:absolute; background:white; border:2px solid #e67e22; padding:8px; border-radius:8px; z-index:1000; font-size:12px; box-shadow:0 4px 10px rgba(0,0,0,0.2);";
            document.body.appendChild(tooltip);
        }
        e.target.onmousemove = (m) => {
            tooltip.style.left = (m.pageX + 15) + 'px';
            tooltip.style.top = (m.pageY + 15) + 'px';
        };
    }
});
document.addEventListener('mouseout', function(e) {
    if (e.target && e.target.id === 'rulesStar') {
        const tip = document.getElementById('battle-tooltip');
        if (tip) tip.remove();
    }
});

window.addEventListener('load', () => setTimeout(loadRanking, 1000));
