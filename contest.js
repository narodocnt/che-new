/**
 * contest.js - Рейтинг за формулою: Лайки + Коментарі + Поширення
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
            const pId = String(item.postId || "");
            let id = null;

            // --- ПРИВ'ЯЗКА ПОСТІВ ДО ID КОЛЕКТИВІВ ---
            // Тут ви можете змінити цифри ID відповідно до вашої бази
            if (pId === "1395890575915215") id = 10; // Наприклад, Божий Дар (був лідером)
            else if (pId === "1393924596111813") id = 11; 
            else if (pId === "1395880485916224") id = 12; 
            else if (pId === "1382677543903185") id = 14; 
            else if (pId === "1384574163713523") id = 17; 
            else if (pId === "1390245389813067") id = 20; 

            if (id && db[id]) {
                // ФОРМУЛА: Лайки + Коментарі + Поширення
                const l = parseInt(item.likes) || 0;
                const c = parseInt(item.comments) || 0;
                const s = parseInt(item.shares) || 0;
                const total = l + c + s;
                
                if (!groups[id] || total > groups[id].score) {
                    groups[id] = { ...db[id], score: total };
                }
            }
        });

        const sorted = Object.values(groups).sort((a, b) => b.score - a.score);
        renderRanking(sorted);

    } catch (e) {
        console.error("Помилка завантаження:", e);
    }
}

function renderRanking(data) {
    const listElement = document.getElementById('rankingList');
    if (!listElement) return;

    listElement.innerHTML = data.map((item, index) => `
        <div style="background: white; margin: 10px 0; padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border-left: 6px solid ${index === 0 ? '#f1c40f' : '#e67e22'};">
            <div style="text-align: left; display: flex; align-items: center;">
                <span style="font-weight: 800; font-size: 1.3rem; color: ${index === 0 ? '#f1c40f' : '#bdc3c7'}; min-width: 40px;">#${index + 1}</span>
                <div>
                    <div style="font-weight: bold; font-size: 1.1rem;">${item.name}</div>
                    <div style="font-size: 0.85rem; color: #7f8c8d;">${item.location} громада</div>
                </div>
            </div>
            <div style="background: #fdf2e9; padding: 8px 18px; border-radius: 25px; font-weight: bold; color: #e67e22; font-size: 1.2rem;">
                ${item.score} 🔥
            </div>
        </div>
    `).join('');
}

// --- ПРАВИЛА БИТВИ (ЗІРОЧКА) ---
document.addEventListener('mouseover', function(e) {
    if (e.target && e.target.id === 'rulesStar') {
        let tooltip = document.getElementById('battle-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'battle-tooltip';
            tooltip.innerHTML = `
                <div style="font-weight:bold; margin-bottom:5px; color:#e67e22;">Правила битви:</div>
                1 вподобайка = 1 бал<br>
                1 коментар = 1 бал<br>
                1 поширення = 1 бал
            `;
            tooltip.style = "position:absolute; background:white; border:2px solid #e67e22; padding:10px; border-radius:8px; z-index:1000; font-size:12px; box-shadow:0 4px 15px rgba(0,0,0,0.2); width:180px; pointer-events:none;";
            document.body.appendChild(tooltip);
        }
        
        const moveHandler = (m) => {
            tooltip.style.left = (m.pageX + 15) + 'px';
            tooltip.style.top = (m.pageY + 15) + 'px';
        };
        e.target.addEventListener('mousemove', moveHandler);
        e.target._moveHandler = moveHandler;
    }
});

document.addEventListener('mouseout', function(e) {
    if (e.target && e.target.id === 'rulesStar') {
        const tooltip = document.getElementById('battle-tooltip');
        if (tooltip) tooltip.remove();
        e.target.removeEventListener('mousemove', e.target._moveHandler);
    }
});

window.addEventListener('load', () => setTimeout(loadRanking, 1000));
