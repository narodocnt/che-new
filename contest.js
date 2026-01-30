/**
 * contest.js - Рейтинг із мініатюрами, формулою балів та посиланнями
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
            const fbUrl = String(item.url || "");
            const mediaUrl = item.media || ""; // URL мініатюри
            let id = null;

            // --- ПРИВ'ЯЗКА ПОСТІВ ДО ID КОЛЕКТИВІВ ---
            if (pId === "1395890575915215") id = 14; 
            else if (pId === "1393924596111813") id = 11; 
            else if (pId === "1395880485916224") id = 10; 
            else if (pId === "1382677543903185") id = 17; 
            else if (pId === "1384574163713523") id = 12; 
            else if (pId === "1390245389813067") id = 20; 

            if (id && db[id]) {
                const l = parseInt(item.likes) || 0;
                const c = parseInt(item.comments) || 0;
                const s = parseInt(item.shares) || 0;
                const total = l + c + s;
                
                if (!groups[id] || total > groups[id].score) {
                    groups[id] = { 
                        ...db[id], 
                        score: total,
                        likes: l,
                        comments: c,
                        shares: s,
                        fbUrl: fbUrl,
                        thumb: mediaUrl
                    };
                }
            }
        });

        const sorted = Object.values(groups).sort((a, b) => b.score - a.score);
        renderRanking(sorted);

    } catch (e) {
        console.error("Помилка завантаження рейтингу:", e);
    }
}

function renderRanking(data) {
    const listElement = document.getElementById('rankingList');
    if (!listElement) return;

    listElement.innerHTML = data.map((item, index) => `
        <div style="background: white; margin: 15px 0; padding: 15px; border-radius: 12px; display: flex; align-items: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-left: 6px solid ${index === 0 ? '#f1c40f' : '#e67e22'}; position: relative;">
            
            <a href="${item.fbUrl}" target="_blank" style="display: block; width: 80px; height: 80px; flex-shrink: 0; overflow: hidden; border-radius: 8px; border: 1px solid #ddd; margin-right: 15px;">
                <img src="${item.thumb}" alt="FB Video" style="width: 100%; height: 100%; object-fit: cover;">
            </a>

            <div style="flex-grow: 1; text-align: left;">
                <div style="font-weight: 800; color: #d35400; font-size: 0.9rem; margin-bottom: 2px;">#${index + 1} МІСЦЕ</div>
                <div style="font-weight: bold; font-size: 1.1rem; color: #2c3e50; line-height: 1.2;">${item.name}</div>
                <div style="font-size: 0.85rem; color: #7f8c8d; margin-bottom: 8px;">${item.location} громада</div>
                
                <div style="font-size: 0.9rem; display: flex; align-items: center; gap: 5px; color: #555; background: #f9f9f9; padding: 4px 8px; border-radius: 6px; width: fit-content;">
                    <i class="fa-regular fa-thumbs-up"></i> ${item.likes} + 
                    <i class="fa-regular fa-comment"></i> ${item.comments} + 
                    <i class="fa-solid fa-share"></i> ${item.shares} = 
                    <strong style="color: #e67e22;">${item.score}</strong>
                </div>
            </div>

            <a href="${item.fbUrl}" target="_blank" style="background: #e67e22; color: white; padding: 8px 12px; border-radius: 8px; text-decoration: none; font-size: 0.8rem; font-weight: bold; text-align: center; transition: 0.3s; margin-left: 10px;">
                ГОЛОСУВАТИ
            </a>
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
                <div style="font-weight:bold; margin-bottom:5px; color:#e67e22; border-bottom:1px solid #eee; padding-bottom:3px;">Правила нарахування балів:</div>
                <div style="display:grid; grid-template-columns: 1fr auto; gap: 5px;">
                    <span>Вподобайки:</span> <strong>1 бал</strong>
                    <span>Коментарі:</span> <strong>1 бал</strong>
                    <span>Поширення:</span> <strong>1 бал</strong>
                </div>
                <div style="margin-top:8px; font-style:italic; font-size:10px; color:#666;">Тисніть на фото або кнопку "Голосувати", щоб підтримати колектив!</div>
            `;
            tooltip.style = "position:absolute; background:white; border:2px solid #e67e22; padding:12px; border-radius:10px; z-index:10000; font-size:12px; box-shadow:0 8px 25px rgba(0,0,0,0.3); width:220px; pointer-events:none; font-family:sans-serif; color:#333;";
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
