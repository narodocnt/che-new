/**
 * contest.js - ВЕРСІЯ: БЕЗ ДУБЛІКАТІВ + НОВИЙ КОНТРАСТНИЙ ДИЗАЙН
 */

let currentData = [];
let lastWinner = null;

async function loadRanking() {
    const N8N_GET_RANKING_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    
    try {
        const response = await fetch(N8N_GET_RANKING_URL);
        const rawData = await response.json();
        const groups = {};
        let detectedFestivalTitle = "";

        rawData.forEach(item => {
            let fullText = (item.pageName || "").trim();
            if (fullText.includes("undefined") || fullText.includes("$json") || parseInt(item.likes) > 600) return;

            if (!detectedFestivalTitle && fullText.includes("Назва Колективу:")) {
                detectedFestivalTitle = fullText.split("Назва Колективу:")[0].replace(/Назва Фестивалю:/i, "").replace(/[#*]/g, "").trim();
            }

            let name = fullText.includes("Назва Колективу:") ? fullText.split("Назва Колективу:")[1].trim() : fullText;
            let groupKey = name.toLowerCase().replace(/["'«»„“]/g, '').replace(/[^a-zа-яіїєґ0-9]/gi, '').trim();

            // --- СУПЕР-ОБ'ЄДНАННЯ ДЛЯ ПРИБИРАННЯ ПОВТОРІВ ---
            if (groupKey.includes("тальн") || groupKey.includes("сурми")) {
                name = "Духовий оркестр «Сурми Тальнівщини»";
                groupKey = "talne_final";
            } else if (groupKey.includes("сміл") || groupKey.includes("божидар")) {
                name = "Оркестр «Божидар» (м. Сміла)";
                groupKey = "smila_final";
            } else if (groupKey.includes("кам") || groupKey.includes("камянк")) {
                name = "Духовий оркестр м. Кам’янка";
                groupKey = "kamyanka_final";
            } else if (groupKey.includes("звенигород")) {
                name = "Оркестр духових інструментів (м. Звенигородка)";
                groupKey = "zveni_final";
            } else if (groupKey.includes("христин") || groupKey.includes("великосеваст")) {
                name = "Оркестр Великосевастянівського БК";
                groupKey = "hrist_final";
            } else if (groupKey.includes("водограй") || groupKey.includes("великоканів")) {
                name = "Ансамбль «Водограй» (Золотоніський р-н)";
                groupKey = "vodogray_final";
            }

            if (groups[groupKey]) {
                groups[groupKey].likes += parseInt(item.likes) || 0;
                groups[groupKey].comments += parseInt(item.comments) || 0;
                groups[groupKey].shares += parseInt(item.shares) || 0;
            } else {
                groups[groupKey] = {
                    pageName: name,
                    likes: parseInt(item.likes) || 0,
                    comments: parseInt(item.comments) || 0,
                    shares: parseInt(item.shares) || 0,
                    url: item.url,
                    media: item.media || 'фото_для_боту.png'
                };
            }
        });

        const titleElement = document.getElementById('festival-title');
        if (titleElement) {
            titleElement.innerText = detectedFestivalTitle || "Битва вподобайків";
            titleElement.style.fontFamily = "'Lobster', cursive";
        }

        currentData = Object.values(groups)
            .sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares))
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
    const maxVal = Math.max(...currentData.map(item => item.likes + item.comments + item.shares)) || 1;

    currentData.forEach((item, index) => {
        const score = item.likes + item.comments + item.shares;
        const percentage = (score / maxVal) * 100;

        list.innerHTML += `
            <a href="${item.url}" target="_blank" style="text-decoration: none; color: inherit; display: block; margin-bottom: 15px;">
                <div class="rank-card" style="
                    display: flex; 
                    align-items: center; 
                    background: white; 
                    border-radius: 15px; 
                    overflow: hidden; 
                    box-shadow: 0 6px 20px rgba(0,0,0,0.2); 
                    height: 130px; 
                    border: 2px solid #333;
                ">
                    <div style="
                        width: 70px; 
                        text-align: center; 
                        font-family: 'Lobster', cursive; 
                        font-size: 2.5rem; 
                        color: #2c3e50; 
                        background: #f8f9fa;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-right: 2px solid #333;
                    ">
                        ${index + 1}
                    </div>
                    
                    <div style="width: 140px; height: 100%;">
                        <img src="${item.media}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='фото_для_боту.png'">
                    </div>
                    
                    <div style="flex-grow: 1; padding: 10px 20px; display: flex; flex-direction: column; justify-content: center;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-weight: 800; font-size: 1.15rem; color: #000; line-height: 1.1;">${item.pageName}</span>
                            <span style="font-weight: 900; color: #d35400; font-size: 1.5rem;">${score}</span>
                        </div>
                        <div style="background: #dfe6e9; height: 12px; border-radius: 6px; overflow: hidden; border: 1px solid #b2bec3;">
                            <div style="width: ${percentage}%; background: linear-gradient(90deg, #f39c12, #e67e22); height: 100%;"></div>
                        </div>
                        <div style="font-size: 0.85rem; color: #636e72; margin-top: 8px; font-weight: bold;">▶ Клікніть, щоб дивитись відео</div>
                    </div>
                </div>
            </a>`;
    });
}

document.addEventListener('DOMContentLoaded', loadRanking);
