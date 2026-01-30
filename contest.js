/**
 * contest.js - Фінальна версія з виправленими підписами
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
            const fbUrl = String(item.url || "").toLowerCase();
            let id = null;

            // --- ВАЖЛИВО: ТОЧНЕ ПРИВ'ЯЗУВАННЯ ID ДО ПОСТІВ ---
            // Ми беремо ID з вашого collectives-bitva.js і чіпляємо до postId з Facebook
            if (pId === "1393924596111813") id = "10"; // Божидар (Сміла)
            else if (pId === "1395880485916224") id = "14"; // Звенигородка
            else if (pId === "1382677543903185") id = "11"; // Кам'янка
            else if (pId === "1395890575915215") id = "20"; // Тальне
            else if (pId === "1384574163713523") id = "17"; // Христинівка
            else if (pId === "1390245389813067") id = "12"; // Водограй

            if (id && db[id]) {
                const l = parseInt(item.likes) || 0;
                const c = parseInt(item.comments) || 0;
                const s = parseInt(item.shares) || 0;
                const total = l + c + s;
                
                if (!groups[id] || total > groups[id].score) {
                    groups[id] = { 
                        ...db[id], 
                        score: total,
                        likes: l, comments: c, shares: s,
                        fbUrl: item.url,
                        thumb: item.media || db[id].media 
                    };
                }
            }
        });

        // Сортуємо: хто має більше балів — той вище
        const sorted = Object.values(groups).sort((a, b) => b.score - a.score);
        renderRanking(sorted);

    } catch (e) {
        console.error("Помилка:", e);
    }
}

function renderRanking(data) {
    const listElement = document.getElementById('rankingList');
    if (!listElement) return;

    listElement.innerHTML = data.map((item, index) => `
        <div style="background: white; margin: 15px 0; padding: 15px; border-radius: 12px; display: flex; align-items: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-left: 6px solid ${index === 0 ? '#f1c40f' : '#e67e22'};">
            
            <a href="${item.fbUrl}" target="_blank" style="display: block; width: 85px; height: 85px; flex-shrink: 0; overflow: hidden; border-radius: 8px; margin-right: 15px; border: 1px solid #eee;">
                <img src="${item.thumb}" style="width: 100%; height: 100%; object-fit: cover;">
            </a>

            <div style="flex-grow: 1; text-align: left;">
                <div style="font-weight: 800; color: #d35400; font-size: 0.8rem;">#${index + 1} МІСЦЕ</div>
                <div style="font-weight: bold; font-size: 1.1rem; color: #2c3e50; line-height: 1.2;">${item.name}</div>
                <div style="font-size: 0.85rem; color: #7f8c8d; margin-bottom: 8px;">${item.location} громада</div>
                
                <div style="font-size: 0.9rem; color: #444; background: #fdf2e9; padding: 5px 10px; border-radius: 8px; width: fit-content; display: flex; gap: 6px; align-items: center; border: 1px solid #fad7b5;">
                    <i class="fa-regular fa-thumbs-up"></i> ${item.likes} + 
                    <i class="fa-regular fa-comment"></i> ${item.comments} + 
                    <i class="fa-solid fa-share"></i> ${item.shares} = 
                    <strong style="color: #e67e22; font-size: 1.1rem;">${item.score}</strong>
                </div>
            </div>

            <a href="${item.fbUrl}" target="_blank" style="background: #e67e22; color: white; padding: 12px 18px; border-radius: 10px; text-decoration: none; font-size: 0.85rem; font-weight: bold; margin-left: 10px;">
                ГОЛОСУВАТИ
            </a>
        </div>
    `).join('');
}

// Зірочка з правилами
document.addEventListener('mouseover', function(e) {
    if (e.target && e.target.id === 'rulesStar') {
        let tooltip = document.getElementById('battle-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'battle-tooltip';
            tooltip.innerHTML = "<strong>Формула балів:</strong><br>Лайк + Коментар + Поширення";
            tooltip.style = "position:absolute; background:white; border:2px solid #e67e22; padding:10px; border-radius:10px; z-index:10000; font-size:12px; box-shadow:0 10px 20px rgba(0,0,0,0.2); width:180px;";
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
