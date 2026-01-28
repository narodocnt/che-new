/**
 * contest.js - Універсальний завантажувач для списку та мапи
 */
let currentData = [];

async function loadRanking() {
    const list = document.getElementById('rankingList'); // Це для index.html
    const N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";

    try {
        // 1. Чекаємо базу даних (вона має бути підключена в обох HTML)
        if (typeof collectivesDatabase === 'undefined') {
            console.warn("Чекаємо базу даних...");
            await new Promise(r => setTimeout(r, 500));
        }

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

            if (key && collectivesDatabase[key]) {
                let total = (parseInt(item.likes) || 0) + (parseInt(item.shares) || 0) + (parseInt(item.comments) || 0);
                if (!groups[key] || total > groups[key].score) {
                    groups[key] = {
                        ...collectivesDatabase[key],
                        score: total,
                        breakdown: { l: parseInt(item.likes)||0, s: parseInt(item.shares)||0, c: parseInt(item.comments)||0 },
                        url: item.url,
                        media: item.media || 'narodocnt.jpg'
                    };
                }
            }
        });

        currentData = Object.values(groups).sort((a, b) => b.score - a.score);

        // 2. Якщо ми на сторінці зі списком (index.html) - малюємо список
        if (list) renderRanking();

        // 3. Якщо ми на сторінці з мапою (map.html) - передаємо дані мапі
        // Функція updateMapData має бути у вашому map-bitva.js
        if (typeof updateMapData === 'function') {
            updateMapData(currentData);
        }

    } catch (e) {
        console.error("Помилка завантаження балів:", e);
    }
}

// Функція малювання карток (як ми робили раніше)
function renderRanking() {
    const list = document.getElementById('rankingList');
    if (!list) return;
    list.innerHTML = '';
    currentData.forEach((item, index) => {
        const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#2980b9', '#8e44ad', '#27ae60'];
        const color = colors[index] || '#2c3e50';
        list.innerHTML += `
            <div style="margin: 10px auto; max-width: 500px; display: flex; border: 2px solid ${color}; border-radius: 10px; overflow: hidden; background: white;">
                <div style="width: 40px; background: ${color}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">${index+1}</div>
                <div style="padding: 10px; flex: 1;">
                    <div style="font-weight: bold;">${item.name}</div>
                    <div style="font-size: 11px;">Керівник: ${item.leader}</div>
                    <div style="text-align: right; font-weight: 900; color: ${color}; font-size: 20px;">${item.score}</div>
                </div>
            </div>`;
    });
}

document.addEventListener('DOMContentLoaded', loadRanking);
