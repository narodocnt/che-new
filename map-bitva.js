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
        const db = window.collectivesDatabase; // База тепер точно є в window

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
                    groups[key] = { ...db[key], score: total, url: item.url };
                }
            }
        });

        const sorted = Object.values(groups).sort((a, b) => b.score - a.score);
        sorted.forEach((item, index) => { item.rank = index + 1; });

        // ПРИВ'ЯЗКА ДО НАЗВ ГРОМАД (важливо для hromadas-data.js)
        currentBattleData = {};
        Object.keys(groups).forEach(key => {
            let hName = "";
            if (key === "smila") hName = "смілянська";
            if (key === "zveny") hName = "звенигородська";
            if (key === "kamyanka") hName = "кам’янська";
            if (key === "talne") hName = "тальнівська";
            if (key === "hrist") hName = "христинівська";
            if (key === "vodogray") hName = "золотоніська";
            
            if (hName) currentBattleData[hName] = groups[key];
        });

        console.log("Дані для карти завантажено:", currentBattleData);
        return true;
    } catch (e) { console.error("Помилка:", e); return false; }
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
                content += list.join('<br>');
                show = true;
            }
        } else {
            const b = currentBattleData[nameKey];
            if (b) {
                label = b.rank; // Цифра місця на синьому кружечку
                content += `<b>🏆 Місце: №${b.rank}</b><br>🎵 ${b.name}<br>👤 ${b.leader}<br>❤️ Балів: ${b.score}`;
                show = true;
            }
        }

        if (show) {
            const icon = L.divIcon({ className: 'count-icon', html: label, iconSize: [28, 28] });
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
        loadBattleRanking().then(() => renderMarkers('battle'));
    } else {
        renderMarkers('collectives');
    }
}

window.onload = () => setMapMode('collectives');
