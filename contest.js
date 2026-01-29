let currentData = [];

async function loadRanking() {
    const list = document.getElementById('rankingList');
    const N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    
    if (list) list.innerHTML = `<div style="text-align:center; padding:20px;">Оновлення рейтингу...</div>`;

    const db = window.collectivesDatabase;
    if (!db) return;

    try {
        const response = await fetch(N8N_URL);
        const rawData = await response.json();
        const groups = {};

        rawData.forEach(item => {
            const url = (item.url || "").toLowerCase();
            let key = "";
            if (url.includes("smila") || url.includes("bozhidar")) key = "smila";
            else if (url.includes("zveny") || url.includes("dzet")) key = "zveny";
            else if (url.includes("kamyan")) key = "kamyanka";
            else if (url.includes("talne") || url.includes("surmy")) key = "talne";
            else if (url.includes("hrist") || url.includes("sverb")) key = "hrist";
            else if (url.includes("vodo") || url.includes("lesch")) key = "vodogray";

            if (key && db[key]) {
                const total = (parseInt(item.likes) || 0) + (parseInt(item.shares) || 0) + (parseInt(item.comments) || 0);
                if (!groups[key] || total > groups[key].score) {
                    groups[key] = {
                        ...db[key],
                        score: total,
                        url: item.url,
                        media: item.media || 'narodocnt.jpg'
                    };
                }
            }
        });

        currentData = Object.values(groups).sort((a, b) => b.score - a.score).slice(0, 6);
        renderList();
    } catch (e) {
        console.error("Помилка:", e);
    }
}

function renderList() {
    const list = document.getElementById('rankingList');
    if (!list) return;
    list.innerHTML = currentData.map((item, i) => `
        <div style="margin:10px; padding:10px; border-left:5px solid #e67e22; background:#f9f9f9; border-radius:8px;">
            <div style="font-weight:bold;">${i+1}. ${item.name}</div>
            <div style="font-size:12px;">Громада: ${item.location} | Керівник: ${item.leader}</div>
            <div style="color:#e67e22; font-weight:bold; font-size:18px;">${item.score}</div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', loadRanking);
