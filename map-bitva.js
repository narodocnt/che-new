// Налаштування картинки
const mapW = 900;
const mapH = 736;

// Ініціалізація карти (ТІЛЬКИ ТУТ)
const map = L.map('map', { 
    crs: L.CRS.Simple, 
    minZoom: -1, 
    maxZoom: 2 
});

const bounds = [[0, 0], [mapH, mapW]];
L.imageOverlay('map.jpg', bounds).addTo(map);
map.fitBounds(bounds);

const markersLayer = L.layerGroup().addTo(map);
let currentBattleData = {};

// Функція завантаження рейтингу з n8n
async function loadBattleRanking() {
    const N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    try {
        const response = await fetch(N8N_URL);
        const rawData = await response.json();
        const uniquePosts = Array.from(new Map(rawData.map(item => [item.url, item])).values());
        
        const groups = {};
        uniquePosts.forEach(item => {
            let fullText = (item.pageName || "").trim();
            if (fullText.includes("undefined") || fullText.includes("$json")) return;

            let groupKey = "";
            let t = fullText.toLowerCase();
            if (t.includes("сміл")) groupKey = "смілянська";
            else if (t.includes("тальн")) groupKey = "тальнівська";
            else if (t.includes("кам")) groupKey = "кам’янська";
            else if (t.includes("христин")) groupKey = "христинівська";
            else if (t.includes("золотоніс")) groupKey = "золотоніська";
            else if (t.includes("звенигород")) groupKey = "звенигородська";

            if (groupKey) {
                let total = (parseInt(item.likes) || 0) + (parseInt(item.shares) || 0) + (parseInt(item.comments) || 0);
                if (!groups[groupKey] || total > groups[groupKey].score) {
                    groups[groupKey] = {
                        collective: fullText.includes("Назва Колективу:") ? fullText.split("Назва Колективу:")[1].split("\n")[0].trim() : "Колектив",
                        leader: fullText.includes("Керівник:") ? fullText.split("Керівник:")[1].split("\n")[0].trim() : "Не вказано",
                        score: total,
                        url: item.url
                    };
                }
            }
        });

        const sorted = Object.values(groups).sort((a, b) => b.score - a.score);
        sorted.forEach((item, index) => { item.rank = index + 1; });
        currentBattleData = groups;
    } catch (e) { console.error("Помилка n8n:", e); }
}

// Головна функція рендеру маркерів
function renderMarkers(mode) {
    markersLayer.clearLayers();
    if (typeof hromadasGeoJSON === 'undefined') return;

    hromadasGeoJSON.features.forEach(h => {
        const nameKey = h.name.trim().toLowerCase();
        let label = "";
        let content = `<h3>${h.name}</h3><hr>`;
        let show = false;

        if (mode === 'collectives') {
            const list = collectivesList[nameKey] || [];
            if (list.length > 0) {
                label = list.length;
                content += `<b>Колективів: ${label}</b><br><div style="max-height:150px; overflow-y:auto;">${list.join('<br>')}</div>`;
                show = true;
            }
        } else {
            const b = currentBattleData[nameKey];
            if (b) {
                label = b.rank;
                content += `<p style="color:#e67e22; font-weight:bold;">🏆 Місце: №${b.rank}</p>
                            <p>🎵 <b>${b.collective}</b></p>
                            <p>👤 Керівник: ${b.leader}</p>
                            <p>❤️ Балів: ${b.score}</p>
                            <a href="${b.url}" target="_blank" style="display:block;text-align:center;background:#e74c3c;color:white;padding:5px;border-radius:5px;text-decoration:none;">Голосувати</a>`;
                show = true;
            }
        }

        if (show) {
            const icon = L.divIcon({ className: 'count-icon', html: `<span>${label}</span>`, iconSize: [30, 30] });
            L.marker([mapH - h.y, h.x], { icon: icon }).bindPopup(content).addTo(markersLayer);
        }
    });
}

// Функція перемикання (setMapMode)
async function setMapMode(mode) {
    document.getElementById('btn-col').className = mode === 'collectives' ? 'map-btn active-btn' : 'map-btn inactive-btn';
    document.getElementById('btn-bat').className = mode === 'battle' ? 'map-btn active-btn' : 'map-btn inactive-btn';
    
    if (mode === 'battle') {
        await loadBattleRanking(); // Чекаємо завантаження свіжих даних
    }
    renderMarkers(mode);
    map.closePopup();
}

// Запуск при завантаженні
window.onload = () => setMapMode('collectives');
