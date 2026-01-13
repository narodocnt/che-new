/**
 * contest.js - ВЕРСІЯ: ТОЧНА МАТЕМАТИКА + СНІЖИНКА У ЗАГОЛОВКУ
 */

let currentData = [];

async function loadRanking() {
    const N8N_GET_RANKING_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    
    try {
        const response = await fetch(N8N_GET_RANKING_URL);
        const rawData = await response.json();
        
        // 1. УНИКАЛЬНІСТЬ: Фільтруємо за URL, щоб не було множення цифр
        const uniquePosts = Array.from(new Map(rawData.map(item => [item.url, item])).values());

        const groups = {};
        let detectedFestivalTitle = "";

        uniquePosts.forEach(item => {
            let fullText = (item.pageName || "").trim();
            if (fullText.includes("undefined") || fullText.includes("$json")) return;

            // Витягуємо назву фестивалю для шапки
            if (!detectedFestivalTitle && fullText.includes("Назва Колективу:")) {
                detectedFestivalTitle = fullText.split("Назва Колективу:")[0]
                    .replace(/Назва Фестивалю:/i, "").replace(/[#*]/g, "").trim();
            }

            // Очищення назви колективу
            let name = fullText.includes("Назва Колективу:") ? fullText.split("Назва Колективу:")[1].trim() : fullText;
            let groupKey = name.toLowerCase().replace(/[^a-zа-яіїєґ0-9]/gi, '').trim();

            // Об'єднання дублікатів за ключовими словами
            if (groupKey.includes("сміл") || groupKey.includes("божидар")) { name = "Оркестр «Божидар» (Сміла)"; groupKey = "smila"; }
            else if (groupKey.includes("тальн") || groupKey.includes("сурми")) { name = "Оркестр «Сурми Тальнівщини»"; groupKey = "talne"; }
            else if (groupKey.includes("кам")) { name = "Оркестр м. Кам’янка"; groupKey = "kamyanka"; }
            else if (groupKey.includes("христин")) { name = "Оркестр Великосевастянівського БК"; groupKey = "hrist"; }

            let l = parseInt(item.likes) || 0;
            let s = parseInt(item.shares) || 0;
            let c = parseInt(item.comments) || 0;
            let total = l + s + c;

            if (groups[groupKey]) {
                groups[groupKey].score += total;
                groups[groupKey].breakdown.l += l;
                groups[groupKey].breakdown.s += s;
                groups[groupKey].breakdown.c += c;
            } else {
                groups[groupKey] = {
                    pageName: name,
                    score: total,
                    breakdown: { l: l, s: s, c: c },
                    url: item.url,
                    media: item.media || 'фото_для_боту.png'
                };
            }
        });

        // ОНОВЛЕННЯ ЗАГОЛОВКА: Сніжинка замість зірочки
        const titleElement = document.getElementById('festival-title');
        if (titleElement) {
            titleElement.innerHTML = `❄️ ${detectedFestivalTitle || "Битва вподобайків"} ❄️`;
            titleElement.style.fontFamily = "'Lobster', cursive";
            titleElement.style.color = "#d35400";
        }

        currentData = Object.values(groups)
            .sort((a, b) => b.score - a.score)
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
    
    const maxVal = Math.max(...currentData.map(item => item.score)) || 1;
    const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#2980b9', '#8e44ad', '#27ae60'];

    currentData.forEach((item, index) => {
        const percentage = (item.score / maxVal) * 100;
        const color = colors[index] || '#2c3e50';

        list.innerHTML += `
            <a href="${item.url}" target="_blank" style="text-decoration: none; display: block; margin: 10px auto; max-width: 550px; width: 95%;">
                <div style="display: flex; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15); height: 95px; border: 2.5px solid ${color};">
                    <div style="width: 50px; min-width: 50px; background: ${color}; color: white; font-family: 'Lobster', cursive; font-size: 24px; display: flex; align-items: center; justify-content: center;">
                        ${index + 1}
                    </div>
                    
                    <div style="width: 110px; min-width: 110px; height: 100%;">
                        <img src="${item.media}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='фото_для_боту.png'">
                    </div>
                    
                    <div style="flex-grow: 1; padding: 8px 12px; display: flex; flex-direction: column; justify-content: center; min-width: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                            <span style="font-family: 'Lobster', cursive; font-size: 15px; color: #2c3e50; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex-shrink: 1;">${item.pageName}</span>
                            <span style="font-weight: 900; color: ${color}; font-size: 20px; margin-left: 5px;">${item.score}</span>
                        </div>
                        <div style="font-size: 11px; color: #7f8c8d; margin-bottom: 5px; font-weight: bold;">
                             👍 ${item.breakdown.l} &nbsp; 🔄 ${item.breakdown.s} &nbsp; 💬 ${item.breakdown.c}
                        </div>
                        <div style="background: #eee; height: 8px; border-radius: 4px; overflow: hidden; border: 1px solid #ddd;">
                            <div style="width: ${percentage}%; background: ${color}; height: 100%;"></div>
                        </div>
                    </div>
                </div>
            </a>`;
    });
}

document.addEventListener('DOMContentLoaded', loadRanking);
