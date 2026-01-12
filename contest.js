/**
 * contest.js - Оновлений дизайн: Великі мініатюри, Lobster шрифт та високий контраст
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

            // Розумне об'єднання
            if (groupKey.includes("кам") || groupKey.includes("камянк")) {
                name = "Духовий оркестр м. Кам’янка";
                groupKey = "kamyanka_final";
            } else if (groupKey.includes("сміл") || groupKey.includes("божидар")) {
                name = "Оркестр «Божидар» (м. Сміла)";
                groupKey = "smila_final";
            } else if (groupKey.includes("звенигород")) {
                name = "Оркестр духових інструментів (м. Звенигородка)";
                groupKey = "zveni_final";
            } else if (groupKey.includes("христин") || groupKey.includes("великосеваст")) {
                name = "Оркестр Великосевастянівського БК";
                groupKey = "hrist_final";
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
            titleElement.style.fontSize = "2.5rem";
            titleElement.style.color = "#2c3e50";
            titleElement.style.textShadow = "2px 2px 4px rgba(0,0,0,0.1)";
        }

        currentData = Object.values(groups)
            .sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares))
            .slice(0, 6);

        renderList('total'); 
    } catch (error) {
        console.error("Помилка:", error);
    }
}

function renderList(filter = 'total') {
    const list = document.getElementById('rankingList');
    if (!list) return;
    
    list.innerHTML = '';
    const maxVal = Math.max(...currentData.map(item => item.likes + item.comments + item.shares)) || 1;

    currentData.forEach((item, index) => {
        const score = item.likes + item.comments + item.shares;
        const percentage = (score / maxVal) * 100;
        const rankNumber = index + 1;

        // Створюємо картку як одне велике посилання
        list.innerHTML += `
            <a href="${item.url}" target="_blank" class="rank-card-link" style="text-decoration: none; color: inherit;">
                <div class="rank-card new-design" style="
                    display: flex; 
                    align-items: center; 
                    background: white; 
                    margin-bottom: 15px; 
                    border-radius: 12px; 
                    overflow: hidden; 
                    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
                    border: 1px solid #eee;
                    height: 120px;
                    transition: transform 0.2s;
                ">
                    <div class="rank-number-box" style="
                        width: 60px; 
                        text-align: center; 
                        font-family: 'Lobster', cursive; 
                        font-size: 2rem; 
                        color: #e67e22;
                        border-right: 2px solid #f1f1f1;
                    ">
                        ${rankNumber}
                    </div>
                    
                    <div class="photo-container" style="width: 120px; height: 100%;">
                        <img src="${item.media}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='фото_для_боту.png'">
                    </div>
                    
                    <div class="rank-details" style="flex-grow: 1; padding: 10px 15px; display: flex; flex-direction: column; justify-content: center;">
                        <div class="rank-header" style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                            <span class="rank-name" style="font-weight: 800; font-size: 1.1rem; color: #333; line-height: 1.2;">${item.pageName}</span>
                            <span class="metric-info" style="font-weight: 900; color: #27ae60; font-size: 1.2rem; margin-left: 10px;">${score}</span>
                        </div>
                        <div class="progress-wrapper" style="background: #eee; height: 10px; border-radius: 5px; overflow: hidden;">
                            <div class="progress-fill" style="width: ${percentage}%; background: linear-gradient(90deg, #e67e22, #f1c40f); height: 100%;"></div>
                        </div>
                        <div style="font-size: 0.8rem; color: #7f8c8d; margin-top: 5px;">Натисніть, щоб подивитись відео 🎥</div>
                    </div>
                </div>
            </a>`;
    });
}

document.addEventListener('DOMContentLoaded', loadRanking);
