let currentData = [];

async function loadRanking() {
    const list = document.getElementById('rankingList');
    const N8N_GET_RANKING_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    
    if (list) {
        list.innerHTML = `<div style="text-align:center; padding:40px;"><p>Оновлення рейтингу...</p></div>`;
    }

    // Очікуємо базу, якщо вона ще не підвантажилась
    let db = window.collectivesDatabase;
    if (!db) {
        await new Promise(r => setTimeout(r, 500));
        db = window.collectivesDatabase;
    }

    if (!db) {
        console.error("База даних не знайдена!");
        return;
    }

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
                        breakdown: { 
                            l: parseInt(item.likes) || 0, 
                            s: parseInt(item.shares) || 0, 
                            c: parseInt(item.comments) || 0 
                        },
                        media: item.media || 'narodocnt.jpg'
                    };
                }
            }
        });

        currentData = Object.values(groups).sort((a, b) => b.score - a.score).slice(0, 6);
        renderList();

    } catch (e) { 
        console.error("Помилка завантаження:", e);
    }
}

function renderList() {
    const list = document.getElementById('rankingList');
    if (!list) return;
    list.innerHTML = '';
    
    const maxVal = Math.max(...currentData.map(item => item.score)) || 1;
    const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#2980b9', '#8e44ad', '#27ae60'];

    currentData.forEach((item, index) => {
        const color = colors[index] || '#2c3e50';
        const percentage = (item.score / maxVal) * 100;

        list.innerHTML += `
            <div style="margin: 15px auto; max-width: 600px; width: 95%; border: 2px solid ${color}; border-radius: 15px; overflow: hidden; background: white; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                <div style="display: flex; height: 110px;">
                    <div style="width: 50px; background: ${color}; color: white; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold;">${index + 1}</div>
                    <div style="width: 120px;"><img src="${item.media}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='narodocnt.jpg'"></div>
                    <div style="flex: 1; padding: 10px; display: flex; flex-direction: column; justify-content: center; min-width: 0;">
                        <div style="font-weight: 900; font-size: 14px; color: #2c3e50; line-height: 1.2;">${item.name}</div>
                        <div style="font-size: 11px; color: #555; margin: 3px 0;">Керівник: <b>${item.leader}</b></div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                            <div style="font-size: 12px; font-weight: bold; color: #7f8c8d;">👍 ${item.breakdown.l} &nbsp; 🔄 ${item.breakdown.s} &nbsp; 💬 ${item.breakdown.c}</div>
                            <div style="font-size: 20px; font-weight: 900; color: ${color};">${item.score}</div>
                        </div>
                    </div>
                </div>
                <div style="height: 6px; background: #eee; width: 100%;"><div style="width: ${percentage}%; background: ${color}; height: 100%; transition: width 1s;"></div></div>
            </div>`;
    });
}

document.addEventListener('DOMContentLoaded', loadRanking);
