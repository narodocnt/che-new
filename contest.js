/**
 * contest.js - ВЕРСІЯ: ТОЧНА МАТЕМАТИКА (FACEBOOK-STYLE)
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

            // 1. Очищення імені
            let name = fullText.includes("Назва Колективу:") ? fullText.split("Назва Колективу:")[1].trim() : fullText;
            let groupKey = name.toLowerCase().replace(/[^a-zа-яіїєґ0-9]/gi, '').trim();

            // 2. Фільтр дублів (об'єднуємо Тальне, Смілу тощо)
            if (groupKey.includes("сміл") || groupKey.includes("божидар")) { name = "Оркестр «Божидар» (м. Сміла)"; groupKey = "smila"; }
            else if (groupKey.includes("тальн") || groupKey.includes("сурми")) { name = "Оркестр «Сурми Тальнівщини»"; groupKey = "talne"; }
            else if (groupKey.includes("христин")) { name = "Оркестр Великосевастянівського БК"; groupKey = "hrist"; }
            else if (groupKey.includes("кам")) { name = "Духовий оркестр м. Кам’янка"; groupKey = "kamyanka"; }

            // 3. МАТЕМАТИКА (Беремо дані як у FB на скріншоті)
            let likes = parseInt(item.likes) || 0;
            let shares = parseInt(item.shares) || 0;
            let comments = parseInt(item.comments) || 0;

            // Сума = Лайки + Поширення + Коментарі (17 + 9 + 3 = 29)
            let totalPoints = likes + shares + comments;

            if (groups[groupKey]) {
                groups[groupKey].score += totalPoints;
                groups[groupKey].breakdown.l += likes;
                groups[groupKey].breakdown.s += shares;
                groups[groupKey].breakdown.c += comments;
            } else {
                groups[groupKey] = {
                    pageName: name,
                    score: totalPoints,
                    breakdown: { l: likes, s: shares, c: comments },
                    url: item.url,
                    media: item.media || 'фото_для_боту.png'
                };
            }
        });

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
                <div style="display: flex; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15); height: 100px; border: 2.5px solid ${color};">
                    <div style="width: 50px; background: ${color}; color: white; font-family: 'Lobster', cursive; font-size: 24px; display: flex; align-items: center; justify-content: center;">
                        ${index + 1}
                    </div>
                    <div style="width: 120px;">
                        <img src="${item.media}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div style="flex-grow: 1; padding: 10px 15px; display: flex; flex-direction: column; justify-content: center;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                            <span style="font-weight: 800; font-size: 14px; color: #2c3e50; font-family: 'Lobster', cursive;">${item.pageName}</span>
                            <span style="font-weight: 900; color: ${color}; font-size: 24px;">${item.score}</span>
                        </div>
                        <div style="font-size: 11px; color: #7f8c8d; margin-bottom: 5px; font-weight: bold;">
                             👍 ${item.breakdown.l} + 🔄 ${item.breakdown.s} + 💬 ${item.breakdown.c}
                        </div>
                        <div style="background: #eee; height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="width: ${percentage}%; background: ${color}; height: 100%;"></div>
                        </div>
                    </div>
                </div>
            </a>`;
    });
}

document.addEventListener('DOMContentLoaded', loadRanking);
