const mapW = 900;
const mapH = 736;

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

async function loadBattleRanking() {
    const N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    try {
        const response = await fetch(N8N_URL);
        const rawData = await response.json();
        
        // Беремо базу з collectives-bitva.js
        const db = window.collectivesDatabase || {};

        const groups = {};
        rawData.forEach(item => {
            const url = (item.url || "").toLowerCase();
            let key = "";

            // Визначаємо ключ як у contest.js
            if (url.includes("smila") || url.includes("bozhidar")) key = "smila";
            else if (url.includes("zveny") || url.includes("dzet")) key = "zveny";
            else if (url.includes("kamyan")) key = "kamyanka";
            else if (url.includes("talne") || url.includes("surmy")) key = "talne";
            else if (url.includes("hrist") || url.includes("sverb")) key = "hrist";
            else if (url.includes("vodo") || url.includes("lesch")) key = "vodogray";

            if (key && db[key]) {
                let total = (parseInt(item.likes)||0) + (parseInt(item.shares)||0) + (parseInt(item.comments)||0);
                if (!groups[key] || total > groups[key].score) {
                    groups[key] = {
                        ...db[key], // Тут name та leader з бази
                        score: total,
                        url: item.url,
                        breakdown: { l: parseInt(item.likes)||0, s: parseInt(item.shares)||0, c: parseInt(item.comments)||0 }
                    };
                }
            }
        });

        const sorted = Object.values(groups).sort((a, b) => b.score - a.score);
        sorted.forEach((item, index) => { item.rank = index + 1; });

        // Прив'язка до імен громад у hromadas-data.js
        currentBattleData = {
            "смілянська": groups["smila"],
            "звенигородська": groups["zveny"],
            "кам’янська": groups["kamyanka"],
            "тальнівська": groups["talne"],
            "христинівська": groups["hrist"],
            "золотоніська": groups["vodogray"]
        };
        
        return true; 
    } catch (e) { 
        console.error("Карта: Помилка завантаження", e); 
        return false;
    }
}

function renderMarkers(mode) {
    markersLayer.clearLayers();
    if (typeof hromadasGeoJSON === 'undefined') return;

    hromadasGeoJSON.features.forEach(h => {
        const nameKey = h.name.trim().toLowerCase();
        let label = "", content = `<h3>${h.name}</h3><hr>`, show = false;

        if (mode === 'collectives') {
            const list = collectivesList[nameKey] || [];
            if (list.length > 0) {
                label = list.length;
                content += `<div style="max-height:120px; overflow-y:auto;">${list.join('<br>')}</div>`;
                show = true;
            }
        } else {
            const b = currentBattleData[nameKey];
            if (b) {
                label = b.rank;
                content += `
                    <p style="color:#d35400; font-weight:bold; margin:0;">🏆 Місце: №${b.rank}</p>
                    <p style="margin:5px 0;">🎵 <b>${b.name}</b></p>
                    <p style="margin:0; font-size:12px;">👤 Керівник: ${b.leader}</p>
                    <p style="margin:5px 0; font-weight:bold;">❤️ Балів: ${b.score}</p>
                    <a href="${b.url}" target="_blank" style="display:block; text-align:center; background:#e67e22; color:white; padding:6px; border-radius:6px; text-decoration:none; margin-top:8px; font-size:11px;">ПІДТРИМАТИ</a>`;
                show = true;
            }
        }

        if (show) {
            const icon = L.divIcon({ className: 'count-icon', html: `<span>${label}</span>`, iconSize: [30, 30] });
            L.marker([mapH - h.y, h.x], { icon: icon }).bindPopup(content).addTo(markersLayer);
        }
    });
}

async function setMapMode(mode) {
    document.getElementById('btn-col').className = mode === 'collectives' ? 'map-btn active-btn' : 'map-btn inactive-btn';
    document.getElementById('btn-bat').className = mode === 'battle' ? 'map-btn active-btn' : 'map-btn inactive-btn';
    
    if (mode === 'battle') {
        const success = await loadBattleRanking();
        if (!success) return;
    }
    renderMarkers(mode);
}

// Стартовий запуск
window.onload = () => setMapMode('collectives');
