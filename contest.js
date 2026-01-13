/**
 * contest.js - ВЕРСІЯ: ТОЧНА МАТЕМАТИКА + СНІЖИНКА
 */

let currentData = [];

async function loadRanking() {
    const N8N_GET_RANKING_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    
    try {
        const response = await fetch(N8N_GET_RANKING_URL);
        const rawData = await response.json();
        
        // 1. ПЕРШИЙ КРОК: ВИДАЛЯЄМО ДУБЛІКАТИ ПОСИЛАНЬ (щоб не множити лайки)
        // Створюємо Map, де ключем є URL. Це гарантує, що кожне відео врахується лише ОДИН раз.
        const uniquePosts = Array.from(new Map(rawData.map(item => [item.url, item])).values());

        const groups = {};

        uniquePosts.forEach(item => {
            let fullText = (item.pageName || "").trim();
            if (fullText.includes("undefined") || fullText.includes("$json")) return;

            // Чистимо назву
            let name = fullText.includes("Назва Колективу:") ? fullText.split("Назва Колективу:")[1].trim() : fullText;
            let groupKey = name.toLowerCase().replace(/[^a-zа-яіїєґ0-9]/gi, '').trim();

            // Об'єднання колективів за ключовими словами
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
            <a href="${item.url}" target="_blank" style="text-decoration: none; display: block; margin: 12px auto; max-width: 550px; width: 95%;">
                <div style="display: flex; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.2); height: 105px; border: 2px solid ${color}; position: relative;">
                    
                    <div style="width: 55px; background: ${color}; color: white; font-family: 'Lobster', cursive; font-size: 28px; display: flex; align-items: center; justify-content: center; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">
                        ${index + 1}
                    </div>
                    
                    <div style="width: 130px; position: relative;">
                        <img src="${item.media}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='фото_для_боту.png'">
                    </div>
                    
                    <div style="flex-grow: 1; padding: 10px 15px; display: flex; flex-direction: column; justify-content: center; min-width: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                            <span style="font-family: 'Lobster', cursive; font-size: 16px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.pageName}</span>
                            <span style="font-weight: 900; color: ${color}; font-size: 24px; display: flex; align-items: center;">
                                <span style="font-size: 18px; margin-right: 4px;">❄️</span>${item.score}
                            </span>
                        </div>
                        
                        <div style="font-size: 11px; color: #7f8c8d; margin-bottom: 6px; font-weight: bold; letter-spacing: 0.5px;">
                             👍 ${item.breakdown.l} &nbsp; 🔄 ${item.breakdown.s} &nbsp; 💬 ${item.breakdown.c}
                        </div>
                        
                        <div style="background: #eee; height: 10px; border-radius: 5px; overflow: hidden; border: 1px solid #ddd;">
                            <div style="width: ${percentage}%; background: ${color}; height: 100%; transition: width 0.8s ease-out;"></div>
                        </div>
                    </div>
                </div>
            </a>`;
    });
}

document.addEventListener('DOMContentLoaded', loadRanking);
