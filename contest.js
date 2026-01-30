/**
 * contest.js - Фінальна версія з розширеною логікою зіставлення
 */
var currentData = [];

async function loadRanking() {
    const N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    const listElement = document.getElementById('rankingList');
    
    if (!listElement) return;

    try {
        console.log("Запит до n8n...");
        const response = await fetch(N8N_URL);
        const data = await response.json();
        
        // ПЕРЕВІРКА БАЗИ
        const db = window.collectivesDatabase;
        console.log("Стан бази collectivesDatabase:", db);

        if (!db) {
            console.error("Помилка: База collectivesDatabase відсутня в пам'яті!");
            listElement.innerHTML = "Помилка конфігурації бази.";
            return;
        }

        let groups = {};

        data.forEach(item => {
            const fbUrl = (item.url || "").toLowerCase();
            let key = "";

            // Більш гнучкий пошук ключів (додав більше варіантів)
            if (fbUrl.includes("smila") || fbUrl.includes("bozhidar") || fbUrl.includes("2030897574364185")) key = "smila";
            else if (fbUrl.includes("zveny") || fbUrl.includes("dzet") || fbUrl.includes("1472787384850228")) key = "zveny";
            else if (fbUrl.includes("kamyan") || fbUrl.includes("kravets") || fbUrl.includes("846728421312742")) key = "kamyanka";
            else if (fbUrl.includes("talne") || fbUrl.includes("surmy") || fbUrl.includes("1317445256737431")) key = "talne";
            else if (fbUrl.includes("hrist") || fbUrl.includes("sverb") || fbUrl.includes("1260839919431949")) key = "hrist";
            else if (fbUrl.includes("vodo") || fbUrl.includes("lesch") || fbUrl.includes("4422636818000921")) key = "vodogray";

            if (key && db[key]) {
                const total = (parseInt(item.likes) || 0) + (parseInt(item.shares) || 0) + (parseInt(item.comments) || 0);
                
                if (!groups[key] || total > groups[key].score) {
                    groups[key] = {
                        ...db[key],
                        score: total
                    };
                }
            }
        });

        const sorted = Object.values(groups).sort((a, b) => b.score - a.score);
        console.log("Оброблений рейтинг для виводу:", sorted);

        if (sorted.length > 0) {
            renderRanking(sorted);
        } else {
            listElement.innerHTML = "Рейтинг формується (немає збігів з базою)...";
        }

    } catch (e) {
        console.error("Помилка завантаження рейтингу:", e);
    }
}

function renderRanking(data) {
    const listElement = document.getElementById('rankingList');
    if (!listElement) return;

    listElement.innerHTML = data.map((item, index) => `
        <div style="background: white; margin: 10px 0; padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 6px solid ${index === 0 ? '#FFD700' : '#e67e22'};">
            <div style="text-align: left;">
                <span style="font-weight: bold; font-size: 1.2rem; color: #d35400;">#${index + 1}</span>
                <span style="margin-left: 10px; font-weight: bold;">${item.name}</span>
                <div style="font-size: 0.8rem; color: #666; margin-left: 38px;">${item.location} громада</div>
            </div>
            <div style="background: #fdf2e9; padding: 8px 15px; border-radius: 20px; font-weight: bold; color: #e67e22; font-size: 1.1rem;">
                ${item.score} 🔥
            </div>
        </div>
    `).join('');
}

// Запуск
window.addEventListener('load', () => {
    setTimeout(loadRanking, 1000);
});
