// 1. Налаштування піксельної карти (як було раніше)
const imgW = 900;
const imgH = 736;

const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -1,
    maxZoom: 2,
    zoomSnap: 0.1
});

const bounds = [[0, 0], [imgH, imgW]];
L.imageOverlay('map.jpg', bounds).addTo(map); // Використовуємо ваш файл map.jpg
map.fitBounds(bounds);

let currentMode = 'collectives'; 
let currentBattleData = {}; // Дані з n8n

// 2. ЗАВАНТАЖЕННЯ РЕЙТИНГУ З ВАШОГО n8n
async function loadRankingForMap() {
    const N8N_GET_RANKING_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    try {
        const response = await fetch(N8N_GET_RANKING_URL);
        const rawData = await response.json();
        
        // Фільтруємо унікальні пости
        const uniquePosts = Array.from(new Map(rawData.map(item => [item.url, item])).values());
        
        const groups = {};
        uniquePosts.forEach(item => {
            let fullText = (item.pageName || "").trim();
            if (fullText.includes("undefined") || fullText.includes("$json")) return;

            // Визначаємо громаду за текстом
            let groupKey = "";
            let textLower = fullText.toLowerCase();
            
            if (textLower.includes("сміл")) groupKey = "смілянська";
            else if (textLower.includes("тальн")) groupKey = "тальнівська";
            else if (textLower.includes("кам")) groupKey = "кам’янська";
            else if (textLower.includes("христин")) groupKey = "христинівська";
            else if (textLower.includes("золотоніс")) groupKey = "золотоніська";
            else if (textLower.includes("звенигород")) groupKey = "звенигородська";

            let total = (parseInt(item.likes) || 0) + (parseInt(item.shares) || 0) + (parseInt(item.comments) || 0);

            if (groupKey) {
                if (!groups[groupKey] || total > groups[groupKey].score) {
                    // Витягуємо назву колективу та керівника, якщо вони є в тексті
                    let collectiveName = fullText.includes("Назва Колективу:") ? fullText.split("Назва Колективу:")[1].split("\n")[0].trim() : "Колектив";
                    let leaderName = fullText.includes("Керівник:") ? fullText.split("Керівник:")[1].split("\n")[0].trim() : "Не вказано";

                    groups[groupKey] = {
                        collective: collectiveName,
                        leader: leaderName,
                        score: total,
                        url: item.url
                    };
                }
            }
        });

        // Визначаємо місця (Rank)
        const sorted = Object.values(groups).sort((a, b) => b.score - a.score);
        sorted.forEach((item, index) => { item.rank = index + 1; });

        currentBattleData = groups;
        renderMarkers(); // Оновлюємо цифри на карті
    } catch (error) {
        console.error("Помилка рейтингу:", error);
    }
}

let markersLayer = L.layerGroup().addTo(map);

// 3. ВИВЕДЕННЯ ЦИФР ТА ТАБЛИЧОК
function renderMarkers() {
    markersLayer.clearLayers();
    
    hromadasGeoJSON.features.forEach(hromada => {
        const nameKey = hromada.name.trim().toLowerCase();
        let label = "";
        let popupContent = `<h3>${hromada.name}</h3><hr>`;
        let shouldShow = false;

        if (currentMode === 'collectives') {
            const list = collectivesList[nameKey] || [];
            if (list.length > 0) {
                label = list.length;
                popupContent += `<b>Колективів: ${label}</b><br><div style="max-height:150px; overflow-y:auto;">${list.join('<br>')}</div>`;
                shouldShow = true;
            }
        } else {
            const battle = currentBattleData[nameKey];
            if (battle) {
                label = battle.rank; // Цифра МІСЦЯ на громаді
                popupContent += `
                    <div style="text-align:left;">
                        <p style="color:#e67e22; font-weight:bold; font-size:16px;">🏆 Місце: №${battle.rank}</p>
                        <p>🎵 <b>${battle.collective}</b></p>
                        <p>👤 Керівник: <b>${battle.leader}</b></p>
                        <p>❤️ Балів: <b>${battle.score}</b></p>
                        <a href="${battle.url}" target="_blank" style="display:block; text-align:center; padding:8px; background:#e74c3c; color:white; border-radius:5px; text-decoration:none; margin-top:10px;">Голосувати у Facebook</a>
                    </div>`;
                shouldShow = true;
            }
        }

        if (shouldShow) {
            const icon = L.divIcon({
                className: 'count-icon',
                html: `<span>${label}</span>`,
                iconSize: [30, 30]
            });
            const marker = L.marker([imgH - hromada.y, hromada.x], { icon: icon });
            marker.bindPopup(popupContent);
            markersLayer.addLayer(marker);
        }
    });
}

function setMode(mode) {
    currentMode = mode;
    document.getElementById('btn-collectives').className = mode === 'collectives' ? 'map-btn active-btn' : 'map-btn inactive-btn';
    document.getElementById('btn-battle').className = mode === 'battle' ? 'map-btn active-btn' : 'map-btn inactive-btn';
    if (mode === 'battle') loadRankingForMap();
    else renderMarkers();
    map.closePopup();
}

// Початкове завантаження
loadRankingForMap();
