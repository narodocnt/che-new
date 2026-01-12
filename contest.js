/**
 * contest.js - Прозорий рейтинг з розшифровкою та поясненням
 */

let currentData = [];

async function loadRanking() {
    const N8N_GET_RANKING_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    
    try {
        const response = await fetch(N8N_GET_RANKING_URL);
        const rawData = await response.json();
        const groups = {};
        let festivalTitle = "";

        rawData.forEach(item => {
            let fullText = (item.pageName || "").trim();
            if (fullText.includes("undefined") || fullText.includes("$json") || parseInt(item.likes) > 1000) return;

            if (!festivalTitle && fullText.includes("Назва Колективу:")) {
                festivalTitle = fullText.split("Назва Колективу:")[0].replace(/Назва Фестивалю:/i, "").replace(/[#*]/g, "").trim();
            }

            let name = fullText.includes("Назва Колективу:") ? fullText.split("Назва Колективу:")[1].trim() : fullText;
            let groupKey = name.toLowerCase().replace(/[^a-zа-яіїєґ0-9]/gi, '').trim();

            // Об'єднання дублікатів
            if (groupKey.includes("тальн") || groupKey.includes("сурми")) { name = "Оркестр «Сурми Тальнівщини»"; groupKey = "talne"; }
            else if (groupKey.includes("сміл") || groupKey.includes("божидар")) { name = "Оркестр «Божидар» (м. Сміла)"; groupKey = "smila"; }
            else if (groupKey.includes("кам")) { name = "Духовий оркестр м. Кам’янка"; groupKey = "kamyanka"; }

            if (groups[groupKey]) {
                groups[groupKey].views += parseInt(item.views) || 0;
                groups[groupKey].likes += parseInt(item.likes) || 0;
                groups[groupKey].shares += parseInt(item.shares) || 0;
            } else {
                groups[groupKey] = {
                    pageName: name,
                    views: parseInt(item.views) || 0,
                    likes: parseInt(item.likes) || 0,
                    shares: parseInt(item.shares) || 0,
                    url: item.url,
                    media: item.media || 'фото_для_боту.png'
                };
            }
        });

        // Створення Заголовка з зірочкою
        const headerContainer = document.getElementById('festival-header-container');
        if (headerContainer) {
            headerContainer.innerHTML = `
                <h2 style="font-family: 'Lobster', cursive; color: #d35400; text-align: center; margin-bottom: 5px; font-size: 32px;">
                    ${festivalTitle || "Битва вподобайків"} 
                    <span id="info-star" style="cursor: pointer; color: #f1c40f; font-size: 24px; vertical-align: middle;">⭐</span>
                </h2>
            `;
            document.getElementById('info-star').onclick = () => {
                alert("ℹ️ У розрахунку рейтингу колективів враховується сума кількості переглядів (👁️), вподобайок (❤️) та поширень (🔄).");
            };
        }

        currentData = Object.values(groups)
            .sort((a, b) => (b.views + b.likes + b.shares) - (a.views + a.likes + a.shares))
            .slice(0, 6);

        renderList(); 
    } catch (error) {
        console.error("Помилка:", error);
    }
}

function renderList() {
    const list = document.getElementById('rankingList');
    if (!list) return;
    list.innerHTML = '';
    
    const maxVal = Math.max(...currentData.map(item => item.views + item.likes + item.shares)) || 1;
    const colors = ['#FFD700', '#95a5a6', '#d35400', '#2980b9', '#8e44ad', '#27ae60'];

    currentData.forEach((item, index) => {
        const total = item.views + item.likes + item.shares;
        const percentage = (total / maxVal) * 100;
        const color = colors[index] || '#2c3e50';

        list.innerHTML += `
            <a href="${item.url}" target="_blank" style="text-decoration: none; display: block; margin: 12px auto; width: 95%; max-width: 500px;">
                <div style="display: flex; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.2); height: 100px; border: 1px solid #ddd; position: relative;">
                    
                    <div style="width: 45px; background: ${color}; color: white; font-family: 'Lobster', cursive; font-size: 24px; display: flex; align-items: center; justify-content: center;">
                        ${index + 1}
                    </div>
                    
                    <div style="width: 90px; height: 100%;">
                        <img src="${item.media}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    
                    <div style="flex-grow: 1; padding: 8px 12px; display: flex; flex-direction: column; justify-content: center; min-width: 0;">
                        <div style="font-weight: 800; font-size: 14px; color: #2c3e50; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${item.pageName}
                        </div>
                        
                        <div style="font-size: 13px; font-weight: bold; color: #555; display: flex; align-items: center; gap: 3px;">
                            <span>👁️ ${item.views}</span> + 
                            <span>❤️ ${item.likes}</span> + 
                            <span>🔄 ${item.shares}</span> = 
                            <span style="color: ${color}; font-size: 16px; font-weight: 900; margin-left: 5px;">${total}</span>
                        </div>
                    </div>

                    <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 6px; background: #eee;">
                        <div style="width: ${percentage}%; height: 100%; background: ${color}; transition: width 1s;"></div>
                    </div>
                </div>
            </a>`;
    });
}

document.addEventListener('DOMContentLoaded', loadRanking);
