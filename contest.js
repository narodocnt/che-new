/**
 * contest.js - ФІКС: ПРЯМЕ ПРИСВОЄННЯ РЕЙТИНГУ (БЕЗ НАКОПИЧЕННЯ)
 */

let currentData = [];

async function loadRanking() {
    // 1. Оголошуємо змінні спочатку
    const list = document.getElementById('rankingList');
    const N8N_GET_RANKING_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    
    // 2. ПОКАЗУЄМО ЛОАДЕР (тепер змінна list вже відома)
    if (list) {
        list.innerHTML = `
            <div id="loader-container" style="text-align: center; padding: 40px; color: #2c3e50;">
                <div class="spinner" style="
                    width: 40px; 
                    height: 40px; 
                    border: 4px solid #f3f3f3; 
                    border-top: 4px solid #d35400; 
                    border-radius: 50%; 
                    margin: 0 auto 15px;
                    animation: spin 1s linear infinite;">
                </div>
                <p style="font-family: 'Lobster', cursive; font-size: 18px;">
                    Завантажуємо свіжий рейтинг...
                </p>
                <style>
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                </style>
            </div>
        `;
    }

    try {
        const response = await fetch(N8N_GET_RANKING_URL);
        const textData = await response.text();

        // Захист від помилок сервера (якщо прийшов HTML замість JSON)
        if (textData.startsWith("<!DOCTYPE")) {
            console.error("Отримано HTML замість JSON");
            return;
        }

        const rawData = JSON.parse(textData);
        const groups = {};

        rawData.forEach(item => {
            let fullText = (item.pageName || "").trim();
            if (!fullText || fullText.includes("undefined")) return;

            // Витягуємо назву
            let name = fullText.includes("Назва Колективу:") ? fullText.split("Назва Колективу:")[1].trim() : fullText;
            let groupKey = name.toLowerCase().replace(/[^a-zа-яіїєґ0-9]/gi, '').trim();

            // Об'єднання за ключами
            if (groupKey.includes("сміл") || groupKey.includes("божидар")) { name = "Оркестр «Божидар» (Сміла)"; groupKey = "smila"; }
            else if (groupKey.includes("тальн") || groupKey.includes("сурми")) { name = "Оркестр «Сурми Тальнівщини»"; groupKey = "talne"; }
            else if (groupKey.includes("кам")) { name = "Оркестр м. Кам’янка"; groupKey = "kamyanka"; }
            else if (groupKey.includes("христин")) { name = "Оркестр Великосевастянівського БК"; groupKey = "hrist"; }
            else if (groupKey.includes("водограй")) { name = "Ансамбль «Водограй» (Золотоніський р-н)"; groupKey = "vodogray"; }

            let l = parseInt(item.likes) || 0;
            let s = parseInt(item.shares) || 0;
            let c = parseInt(item.comments) || 0;
            let total = l + s + c;

            // ФІКС: Беремо тільки максимальний результат для колективу
            if (groups[groupKey]) {
                if (total > groups[groupKey].score) {
                    groups[groupKey].score = total;
                    groups[groupKey].breakdown = { l: l, s: s, c: c };
                    groups[groupKey].url = item.url;
                }
            } else {
                groups[groupKey] = {
                    pageName: name,
                    score: total,
                    breakdown: { l: l, s: s, c: c },
                    url: item.url,
                    media: item.media || 'https://img.icons8.com/color/144/musical-notes.png'
                };
            }
        });

        // Відображення заголовка (Обласна Музична Варта)
        const headerContainer = document.getElementById('festival-header-container');
        if (headerContainer) {
            headerContainer.innerHTML = `
                <div style="text-align: center; margin: 20px 0; line-height: 1.2;">
                    <h2 style="font-family: 'Lobster', cursive; color: #b33939; font-size: 28px; margin-bottom: 5px;">
                        Обласний фестиваль «Музична варта»
                    </h2>
                    <h3 style="font-family: 'Lobster', cursive; color: #2c3e50; font-size: 22px; margin-top: 0;">
                        до Дня Збройних Сил України 
                        <span id="info-trigger" style="cursor: pointer; color: #2980b9; font-size: 30px; font-weight: bold; vertical-align: middle;">*</span>
                    </h3>
                </div>
            `;
            document.getElementById('info-trigger').onclick = showRules;
        }

        // Сортуємо та беремо ТОП-6 (або ТОП-10, якщо хочете більше)
        currentData = Object.values(groups)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        renderList(); 
    } catch (error) {
        console.error("Помилка:", error);
    }
}

function showRules() {
    alert("❄️ ПРАВИЛА РЕЙТИНГУ:\n--------------------------\n👍 1 вподобайка = 1 бал\n🔄 1 поширення = 1 бал\n💬 1 коментар = 1 бал\n\nДані оновлюються автоматично.");
}

function renderList() {
    const list = document.getElementById('rankingList');
    if (!list) return;
    list.innerHTML = '';
    
    const maxVal = Math.max(...currentData.map(item => item.score)) || 1;
    const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#2980b9', '#8e44ad', '#27ae60', '#e67e22', '#1abc9c', '#34495e', '#e74c3c'];

    currentData.forEach((item, index) => {
        const percentage = (item.score / maxVal) * 100;
        const color = colors[index] || '#2c3e50';

        list.innerHTML += `
            <a href="${item.url}" target="_blank" style="text-decoration: none; display: block; margin: 12px auto; width: 100%; max-width: 600px; margin-left: auto; margin-right: auto;">
                <div style="display: flex; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15); height: 100px; border: 2.5px solid ${color}; position: relative;">
                    <div style="width: 45px; background: ${color}; color: white; font-family: 'Lobster', cursive; font-size: 24px; display: flex; align-items: center; justify-content: center;">
                        ${index + 1}
                    </div>
                    <div style="width: 100px; min-width: 100px; height: 100%;">
                        <img src="${item.media}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://img.icons8.com/color/144/musical-notes.png'">
                    </div>
                    <div style="flex-grow: 1; padding: 8px 12px; display: flex; flex-direction: column; justify-content: space-between; min-width: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <span style="font-weight: 800; font-size: 14px; color: #000; line-height: 1.1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.pageName}</span>
                            <span style="font-weight: 900; color: ${color}; font-size: 20px; margin-left: 10px;">${item.score}</span>
                        </div>
                        <div style="font-size: 12px; color: #555; font-weight: bold;">
                             ❤️ ${item.breakdown.l} &nbsp; 🔄 ${item.breakdown.s} &nbsp; 💬 ${item.breakdown.c}
                        </div>
                        <div style="background: #eee; height: 8px; border-radius: 4px; overflow: hidden; width: 100%;">
                            <div style="width: ${percentage}%; background: ${color}; height: 100%; transition: width 0.5s;"></div>
                        </div>
                    </div>
                </div>
            </a>`;
    });
}

document.addEventListener('DOMContentLoaded', loadRanking);
