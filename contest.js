/**
 * contest.js - Фінальна версія з розумним очікуванням бази
 */
let currentData = [];

// Функція, яка чекає, поки з'явиться об'єкт collectivesDatabase
function waitForDatabase() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const interval = setInterval(() => {
            if (typeof window.collectivesDatabase !== 'undefined' || typeof collectivesDatabase !== 'undefined') {
                clearInterval(interval);
                resolve(window.collectivesDatabase || collectivesDatabase);
            }
            attempts++;
            if (attempts > 30) { // Якщо чекаємо більше 3 секунд - зупиняємося
                clearInterval(interval);
                reject("База даних collectivesDatabase не знайдена після 3 секунд очікування");
            }
        }, 100);
    });
}

async function loadRanking() {
    const list = document.getElementById('rankingList');
    const N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";

    if (list) list.innerHTML = '<div style="color:white; text-align:center; padding:20px;">Завантаження...</div>';

    try {
        // ЧЕКАЄМО БАЗУ ПЕРЕД ЗАПИТОМ
        const db = await waitForDatabase();
        console.log("База знайдена, завантажуємо бали з n8n...");

        const response = await fetch(N8N_URL);
        const rawData = await response.json();
        const groups = {};

        rawData.forEach(item => {
            const url = (item.url || "").toLowerCase();
            let key = "";

            // Визначаємо ключ колективу
            if (url.includes("smila") || url.includes("bozhidar")) key = "smila";
            else if (url.includes("zveny") || url.includes("dzet")) key = "zveny";
            else if (url.includes("kamyan")) key = "kamyanka";
            else if (url.includes("talne") || url.includes("surmy")) key = "talne";
            else if (url.includes("hrist") || url.includes("sverb")) key = "hrist";
            else if (url.includes("vodo") || url.includes("lesch")) key = "vodogray";

            if (key && db[key]) {
                let total = (parseInt(item.likes) || 0) + (parseInt(item.shares) || 0) + (parseInt(item.comments) || 0);
                
                if (!groups[key] || total > groups[key].score) {
                    groups[key] = {
                        ...db[key],
                        score: total,
                        breakdown: { l: parseInt(item.likes)||0, s: parseInt(item.shares)||0, c: parseInt(item.comments)||0 },
                        url: item.url,
                        media: item.media || 'narodocnt.jpg'
                    };
                }
            }
        });

        currentData = Object.values(groups).sort((a, b) => b.score - a.score);

        // Малюємо рейтинг, якщо ми в index.html
        if (list) renderRanking();

        // Оновлюємо мапу, якщо ми в map.html і функція існує
        if (typeof updateMapIcons === 'function') {
            updateMapIcons(currentData);
        }

    } catch (e) {
        console.error("Помилка:", e);
        if (list) list.innerHTML = `<div style="color:red;">Помилка: ${e}</div>`;
    }
}

function renderRanking() {
    const list = document.getElementById('rankingList');
    if (!list) return;
    list.innerHTML = '';
    
    currentData.forEach((item, index) => {
        const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#2980b9', '#8e44ad', '#27ae60'];
        const color = colors[index] || '#2c3e50';

        list.innerHTML += `
            <div style="margin: 10px auto; max-width: 550px; background: white; border-radius: 12px; display: flex; border: 2.5px solid ${color}; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                <div style="width: 50px; background: ${color}; color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">${index + 1}</div>
                <div style="width: 100px; height: 80px;"><img src="${item.media}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='narodocnt.jpg'"></div>
                <div style="flex: 1; padding: 10px;">
                    <div style="font-weight: bold; font-size: 14px; color: #2c3e50;">${item.name}</div>
                    <div style="font-size: 11px; color: #7f8c8d;">Керівник: ${item.leader}</div>
                    <div style="text-align: right; font-size: 22px; font-weight: 900; color: ${color}; margin-top: -15px;">${item.score}</div>
                    <div style="font-size: 12px; margin-top: 5px;">👍 ${item.breakdown.l} &nbsp; 🔄 ${item.breakdown.s} &nbsp; 💬 ${item.breakdown.c}</div>
                </div>
            </div>`;
    });
}

document.addEventListener('DOMContentLoaded', loadRanking);
