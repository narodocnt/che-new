let currentData = [];

async function loadRanking() {
    const list = document.getElementById('rankingList');
    const N8N_GET_RANKING_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    
    if (list) {
        list.innerHTML = `<div style="text-align:center; padding:20px;"><p>Оновлення даних...</p></div>`;
    }

    // Чекаємо базу в HTML
    let db = window.collectivesDatabase;
    if (!db) {
        await new Promise(r => setTimeout(r, 500));
        db = window.collectivesDatabase;
    }

    if (!db) return;

    try {
        const response = await fetch(N8N_GET_RANKING_URL);
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
                        name: db[key].name,
                        leader: db[key].leader,
                        score: total,
                        url: item.url,
                        breakdown: { l: parseInt(item.likes)||0, s: parseInt(item.shares)||0, c: parseInt(item.comments)||0 },
                        media: item.media || 'narodocnt.jpg'
                    };
                }
            }
        });

        currentData = Object.values(groups).sort((a, b) => b.score - a.score).slice(0, 6);
        renderList();
    } catch (e) {
        console.error("Помилка завантаження рейтингу:", e);
    }
}

function renderList() {
    const list = document.getElementById('rankingList');
    if (!list || currentData.length === 0) return;
    list.innerHTML = '';
    
    const maxVal = Math.max(...currentData.map(item => item.score)) || 1;
    currentData.forEach((item, index) => {
        const percentage = (item.score / maxVal) * 100;
        list.innerHTML += `
            <div style="margin: 10px auto; max-width: 600px; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; background: white;">
                <div style="display: flex; align-items: center; padding: 10px;">
                    <div style="width: 30px; font-weight: bold;">${index + 1}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; font-size: 14px;">${item.name}</div>
                        <div style="font-size: 12px; color: #666;">${item.leader}</div>
                    </div>
                    <div style="font-weight: bold; color: #e67e22;">${item.score}</div>
                </div>
                <div style="height: 4px; background: #eee;"><div style="width: ${percentage}%; background: #e67e22; height: 100%;"></div></div>
            </div>`;
    });
}

document.addEventListener('DOMContentLoaded', loadRanking);
