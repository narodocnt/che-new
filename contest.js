let currentData = [];

async function loadRanking() {
    const list = document.getElementById('rankingList');
    const N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";

    // Чекаємо базу до 1 секунди (якщо вона ще не завантажилась)
    let attempts = 0;
    while (!window.collectivesDatabase && attempts < 10) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
    }

    const db = window.collectivesDatabase;

    if (!db) {
        console.error("КРИТИЧНА ПОМИЛКА: База даних collectivesDatabase не знайдена!");
        if (list) list.innerHTML = "<p style='color:white; text-align:center;'>Помилка завантаження бази учасників.</p>";
        return;
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

            if (key && db[key]) {
                let total = (parseInt(item.likes)||0) + (parseInt(item.shares)||0) + (parseInt(item.comments)||0);
                if (!groups[key] || total > groups[key].score) {
                    groups[key] = {
                        ...db[key],
                        score: total,
                        breakdown: { l: parseInt(item.likes)||0, s: parseInt(item.shares)||0, c: parseInt(item.comments)||0 },
                        media: item.media || 'narodocnt.jpg'
                    };
                }
            }
        });

        currentData = Object.values(groups).sort((a, b) => b.score - a.score);

        if (list) renderList(); // Малюємо список в index.html
        
    } catch (e) {
        console.error("Помилка завантаження:", e);
    }
}

function renderList() {
    const list = document.getElementById('rankingList');
    if (!list) return;
    list.innerHTML = '';
    
    currentData.forEach((item, index) => {
        const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#2980b9', '#8e44ad', '#27ae60'];
        const color = colors[index] || '#2c3e50';

        list.innerHTML += `
            <div style="margin: 10px auto; max-width: 550px; background: white; border-radius: 12px; display: flex; border: 2.5px solid ${color}; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                <div style="width: 50px; background: ${color}; color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">${index + 1}</div>
                <div style="width: 100px;"><img src="${item.media}" style="width: 100%; height: 80px; object-fit: cover;"></div>
                <div style="flex: 1; padding: 10px;">
                    <div style="font-weight: bold; font-size: 14px;">${item.name}</div>
                    <div style="font-size: 11px; color: #666;">Керівник: ${item.leader}</div>
                    <div style="text-align: right; font-size: 20px; font-weight: 900; color: ${color}; margin-top: -10px;">${item.score}</div>
                </div>
            </div>`;
    });
}

document.addEventListener('DOMContentLoaded', loadRanking);
