/**
 * contest.js - Фінальна версія: Лайки + Поширення + Коментарі
 * Синхронізація ширини та мобільна оптимізація
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
            if (fullText.includes("undefined") || fullText.includes("$json")) return;

            let name = fullText.includes("Назва Колективу:") ? fullText.split("Назва Колективу:")[1].trim() : fullText;
            let groupKey = name.toLowerCase().replace(/[^a-zа-яіїєґ0-9]/gi, '').trim();

            // Об'єднання дублікатів (запобігає невірному нарахуванню)
            if (groupKey.includes("тальн") || groupKey.includes("сурми")) { name = "Оркестр «Сурми Тальнівщини»"; groupKey = "talne"; }
            else if (groupKey.includes("сміл") || groupKey.includes("божидар")) { name = "Оркестр «Божидар» (м. Сміла)"; groupKey = "smila"; }
            else if (groupKey.includes("кам")) { name = "Духовий оркестр м. Кам’янка"; groupKey = "kamyanka"; }

            if (groups[groupKey]) {
                groups[groupKey].likes += parseInt(item.likes) || 0;
                groups[groupKey].shares += parseInt(item.shares) || 0;
                groups[groupKey].comments += parseInt(item.comments) || 0; // Додано коментарі
            } else {
                groups[groupKey] = {
                    pageName: name,
                    likes: parseInt(item.likes) || 0,
                    shares: parseInt(item.shares) || 0,
                    comments: parseInt(item.comments) || 0, // Додано коментарі
                    url: item.url,
                    media: item.media || 'фото_для_боту.png'
                };
            }
        });

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
                alert("ℹ️ ПРАВИЛА РЕЙТИНГУ:\nСума: ❤️ Вподобайки + 🔄 Поширення + 💬 Коментарі\n\nСлава Україні! 🇺🇦");
            };
        }

        currentData = Object.values(groups)
            .sort((a, b) => (b.likes + b.shares + b.comments) - (a.likes + a.shares + a.comments))
            .slice(0, 10);

        renderList(); 
    } catch (error) {
        console.error("Помилка:", error);
    }
}

function renderList() {
    const list = document.getElementById('rankingList');
    if (!list) return;
    list.innerHTML = '';
    
    const maxVal = Math.max(...currentData.map(item => item.likes + item.shares + item.comments)) || 1;
    const accentColors = ['#f1c40f', '#95a5a6', '#e67e22', '#3498db', '#9b59b6', '#2ecc71', '#1abc9c', '#34495e', '#e74c3c', '#d35400'];

    currentData.forEach((item, index) => {
        const total = item.likes + item.shares + item.comments;
        const percentage = (total / maxVal) * 100;
        const mainColor = accentColors[index] || '#2c3e50';

        list.innerHTML += `
            <a href="${item.url}" target="_blank" style="text-decoration: none; display: block; margin: 10px auto; width: 100%; max-width: 600px;">
                <div style="display: flex; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.2); height: 100px; border: 2px solid ${mainColor}; position: relative;">
                    
                    <div style="width: 45px; min-width: 45px; background: ${mainColor}; color: white; font-family: 'Lobster', cursive; font-size: 24px; display: flex; align-items: center; justify-content: center;">
                        ${index + 1}
                    </div>
                    
                    <div style="width: 100px; min-width: 100px; height: 100%;">
                        <img src="${item.media}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    
                    <div style="flex-grow: 1; padding: 8px 12px; display: flex; flex-direction: column; justify-content: space-between; min-width: 0;">
                        <div style="font-weight: 800; font-size: 14px; color: #000; line-height: 1.1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                            ${item.pageName}
                        </div>
                        
                        <div style="font-size: 13px; font-weight: bold; color: #444; display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
                            <span>❤️ ${item.likes}</span> + <span>🔄 ${item.shares}</span> + <span>💬 ${item.comments}</span> 
                            <span style="color: ${mainColor}; font-size: 18px; font-weight: 900; margin-left: auto;">= ${total}</span>
                        </div>
                    </div>

                    <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 6px; background: #f0f0f0;">
                        <div style="width: ${percentage}%; height: 100%; background: ${mainColor};"></div>
                    </div>
                </div>
            </a>`;
    });
}

document.addEventListener('DOMContentLoaded', loadRanking);
