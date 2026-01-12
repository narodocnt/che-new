/**
 * contest.js - Дизайн: Музична Варта (День ЗСУ Edition)
 * Формула: ❤️ Вподобайки + 🔄 Поширення
 */

let currentData = [];

async function loadRanking() {
    const N8N_GET_RANKING_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    
    try {
        const response = await fetch(N8N_GET_RANKING_URL);
        const rawData = await response.json();
        const groups = {};

        rawData.forEach(item => {
            let fullText = (item.pageName || "").trim();
            // Фільтр сміття
            if (fullText.includes("undefined") || fullText.includes("$json") || parseInt(item.likes) > 1000) return;

            let name = fullText.includes("Назва Колективу:") ? fullText.split("Назва Колективу:")[1].trim() : fullText;
            let groupKey = name.toLowerCase().replace(/[^a-zа-яіїєґ0-9]/gi, '').trim();

            // Об'єднання дублікатів (основні колективи)
            if (groupKey.includes("тальн") || groupKey.includes("сурми")) { name = "Оркестр «Сурми Тальнівщини»"; groupKey = "talne"; }
            else if (groupKey.includes("сміл") || groupKey.includes("божидар")) { name = "Оркестр «Божидар» (м. Сміла)"; groupKey = "smila"; }
            else if (groupKey.includes("кам")) { name = "Духовий оркестр м. Кам’янка"; groupKey = "kamyanka"; }
            else if (groupKey.includes("звенигород")) { name = "Оркестр духових інструментів (м. Звенигородка)"; groupKey = "zveni"; }

            if (groups[groupKey]) {
                groups[groupKey].likes += parseInt(item.likes) || 0;
                groups[groupKey].shares += parseInt(item.shares) || 0;
            } else {
                groups[groupKey] = {
                    pageName: name,
                    likes: parseInt(item.likes) || 0,
                    shares: parseInt(item.shares) || 0,
                    url: item.url,
                    media: item.media || 'фото_для_боту.png'
                };
            }
        });

        // 1. ОНОВЛЕННЯ ЗАГОЛОВКА (Два рядки + Сніжинка)
        const headerContainer = document.getElementById('festival-header-container');
        if (headerContainer) {
            headerContainer.innerHTML = `
                <div style="text-align: center; margin: 20px 0; line-height: 1.2;">
                    <h2 style="font-family: 'Lobster', cursive; color: #b33939; font-size: 28px; margin-bottom: 5px;">
                        Обласний фестиваль «Музична варта»
                    </h2>
                    <h3 style="font-family: 'Lobster', cursive; color: #2c3e50; font-size: 22px; margin-top: 0;">
                        до Дня Збройних Сил України 
                        <span id="info-star" style="cursor: pointer; color: #2980b9; font-size: 30px; font-weight: bold; vertical-align: middle;">*</span>
                    </h3>
                </div>
            `;
            
            document.getElementById('info-star').onclick = () => {
                alert("ℹ️ ПРАВИЛА РЕЙТИНГУ:\nУ розрахунку враховується сума:\n❤️ Вподобайки + 🔄 Поширення\n\nСлава Україні! 🇺🇦");
            };
        }

        currentData = Object.values(groups)
            .sort((a, b) => (b.likes + b.shares) - (a.likes + a.shares))
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
    
    const maxVal = Math.max(...currentData.map(item => item.likes + item.shares)) || 1;
    // Кольорова палітра для карток (фони)
    const cardColors = ['#fff9db', '#f1f2f6', '#ffeadb', '#e3f2fd', '#f3e5f5', '#e8f5e9'];
    // Кольори акцентів
    const accentColors = ['#f1c40f', '#95a5a6', '#e67e22', '#3498db', '#9b59b6', '#2ecc71'];

    currentData.forEach((item, index) => {
        const total = item.likes + item.shares;
        const percentage = (total / maxVal) * 100;
        const mainColor = accentColors[index] || '#2c3e50';
        const bgColor = cardColors[index] || '#ffffff';

        list.innerHTML += `
            <a href="${item.url}" target="_blank" style="text-decoration: none; display: block; margin: 15px auto; width: 95%; max-width: 550px;">
                <div style="display: flex; background: ${bgColor}; border-radius: 15px; overflow: hidden; box-shadow: 0 6px 15px rgba(0,0,0,0.25); height: 110px; border: 2px solid ${mainColor}; position: relative;">
                    
                    <div style="width: 55px; min-width: 55px; background: ${mainColor}; color: white; font-family: 'Lobster', cursive; font-size: 32px; display: flex; align-items: center; justify-content: center; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                        ${index + 1}
                    </div>
                    
                    <div style="width: 120px; min-width: 120px; height: 100%; border-right: 1px solid ${mainColor};">
                        <img src="${item.media}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    
                    <div style="flex-grow: 1; padding: 10px 15px; display: flex; flex-direction: column; justify-content: space-between; min-width: 0;">
                        <div style="font-weight: 900; font-size: 16px; color: #000; line-height: 1.2; overflow: hidden; text-overflow: ellipsis;">
                            ${item.pageName}
                        </div>
                        
                        <div style="font-size: 15px; font-weight: bold; color: #2c3e50; display: flex; align-items: center; gap: 5px;">
                            <span>❤️ ${item.likes}</span> 
                            <span style="color: #7f8c8d;">+</span> 
                            <span>🔄 ${item.shares}</span> 
                            <span style="color: #7f8c8d;">=</span> 
                            <span style="color: ${mainColor}; font-size: 22px; font-weight: 900; font-family: 'Lobster', cursive; margin-left: 5px;">${total}</span>
                        </div>
                        
                        <div style="font-size: 10px; color: ${mainColor}; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                            ▶ Перейти до відео
                        </div>
                    </div>

                    <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 8px; background: rgba(0,0,0,0.05);">
                        <div style="width: ${percentage}%; height: 100%; background: ${mainColor}; transition: width 1s ease-in-out;"></div>
                    </div>
                </div>
            </a>`;
    });
}

document.addEventListener('DOMContentLoaded', loadRanking);
