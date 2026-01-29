const mapW = 900, mapH = 736;
const map = L.map('map', { crs: L.CRS.Simple, minZoom: -1, maxZoom: 2 });
const bounds = [[0, 0], [mapH, mapW]];
L.imageOverlay('map.jpg', bounds).addTo(map);
map.fitBounds(bounds);

const markersLayer = L.layerGroup().addTo(map);
let currentBattleData = {};

async function loadBattleRanking() {
    const N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    try {
        const response = await fetch(N8N_URL);
        const rawData = await response.json();
        
        // Перевірка наявності бази даних
        const db = window.collectivesDatabase || collectivesDatabase;
        if (!db) {
            console.error("База collectivesDatabase не знайдена!");
            return false;
        }

        const groups = {};
        rawData.forEach(item => {
            const url = (item.url || "").toLowerCase();
            let key = "";
            if (url.includes("smila") || url.includes("bozhidar")) key = "smila";
            else if (url.includes("zveny") || url.includes("dzet")) key = "zveny";
            else if (url.includes("kamyan")) key = "kamyanka";
            else if (url.includes("talne") || url.includes("surmy")) key = "talne";
            else if (url.includes("hrist") || url.includes("sverb")) key = "hrist";
            else if (url.includes("vodo") || url.includes("lesch")) key = "vodogray";

            if (key && db[key]) {
                const total = (parseInt(item.likes)||0) + (parseInt(item.shares)||0) + (parseInt(item.comments)||0);
                if (!groups[key] || total > groups[key].score) {
                    groups[key] = { 
                        ...db[key], 
                        score: total, 
                        likes: parseInt(item.likes)||0,
                        shares: parseInt(item.shares)||0,
                        comments: parseInt(item.comments)||0
                    };
                }
            }
        });

        // Сортування для визначення місць
        const sorted = Object.values(groups).sort((a, b) => b.score - a.score);
        sorted.forEach((item, index) => { item.rank = index + 1; });

        // Прив'язка до імен з hromadas-data.js
        currentBattleData = {};
        Object.keys(groups).forEach(key => {
            let hName = "";
            if (key === "smila") hName = "смілянська";
            if (key === "zveny") hName = "звенигородська";
            if (key === "kamyanka") hName = "кам’янська";
            if (key === "talne") hName = "тальнівська";
            if (key === "hrist") hName = "христинівська";
            if (key === "vodogray") hName = "золотоніська"; // Для Чорнобаївської ТГ, якщо на мапі вона як Золотоніська
            
            if (hName) currentBattleData[hName] = groups[key];
        });

        return true;
    } catch (e) { 
        console.error("Помилка завантаження битви:", e); 
        return false; 
    }
}

function renderMarkers(mode) {
    markersLayer.clearLayers();
    if (typeof hromadasGeoJSON === 'undefined') return;

    hromadasGeoJSON.features.forEach(h => {
        const nameKey = h.name.trim().toLowerCase();
        let label = "", content = `<div style="text-align:center;"><b>${h.name.toUpperCase()} ГРОМАДА</b></div><hr style="margin:5px 0;">`, show = false;

        if (mode === 'collectives') {
            const list = collectivesList[nameKey] || [];
            if (list.length > 0) {
                label = list.length;
                content += `<div style="max-height:150px; overflow-y:auto; font-size:12px;">${list.join('<br>• ')}</div>`;
                show = true;
            }
        } else {
            const b = currentBattleData[nameKey];
            if (b) {
                label = b.rank; // Показуємо місце в рейтингу на іконці
                content += `
                    <div style="min-width:180px;">
                        <div style="color:#d35400; font-weight:bold; font-size:14px; margin-bottom:5px;">🏆 Місце: №${b.rank}</div>
                        <div style="font-weight:bold; font-size:13px; line-height:1.2;">${b.name}</div>
                        <div style="font-size:11px; color:#555; margin:3px 0;">${b.institution}</div>
                        <div style="font-size:12px;">Керівник: <b>${b.leader}</b></div>
                        <hr style="margin:5px 0;">
                        <div style="display:flex; justify-content:space-between; font-weight:bold;">
                            <span>❤️ Балів:</span>
                            <span style="color:#d35400; font-size:16px;">${b.score}</span>
                        </div>
                        <div style="font-size:10px; color:#7f8c8d; margin-top:3px;">👍 ${b.likes} | 🔄 ${b.shares} | 💬 ${b.comments}</div>
                    </div>`;
                show = true;
            }
        }

        if (show) {
            const icon = L.divIcon({ 
                className: 'count-icon', 
                html: `<span>${label}</span>`, 
                iconSize: [30, 30] 
            });
            L.marker([mapH - h.y, h.x], { icon: icon }).bindPopup(content).addTo(markersLayer);
        }
    });
}

function setMapMode(mode) {
    const btnCol = document.getElementById('btn-col');
    const btnBat = document.getElementById('btn-bat');
    if(btnCol) btnCol.className = mode === 'collectives' ? 'map-btn active-btn' : 'map-btn inactive-btn';
    if(btnBat) btnBat.className = mode === 'battle' ? 'map-btn active-btn' : 'map-btn inactive-btn';

    if (mode === 'battle') {
        loadBattleRanking().then(success => {
            if (success) renderMarkers('battle');
        });
    } else {
        renderMarkers('collectives');
    }
}

// Ініціалізація при завантаженні
window.onload = () => {
    // Даємо мікропаузу, щоб всі JS-файли встигли ініціалізуватися
    setTimeout(() => {
        setMapMode('collectives');
    }, 100);
};
