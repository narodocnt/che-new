// Константи карти
const imgW = 900;
const imgH = 736;

// Глобальні змінні
window.currentMode = 'collectives';
window.currentBattleData = {};
let map, markersLayer;

// 1. ГОЛОВНА ФУНКЦІЯ (window. щоб кнопки її бачили)
window.setMode = function(mode) {
    window.currentMode = mode;
    console.log("Режим змінено на:", mode);
    
    // Оновлюємо вигляд кнопок
    const btnC = document.getElementById('btn-collectives');
    const btnB = document.getElementById('btn-battle');
    if (btnC) btnC.className = mode === 'collectives' ? 'map-btn active-btn' : 'map-btn inactive-btn';
    if (btnB) btnB.className = mode === 'battle' ? 'map-btn active-btn' : 'map-btn inactive-btn';

    renderMarkers();

    if (mode === 'battle') {
        loadBattleRanking();
    }
};

// 2. МАЛЮЄМО КАРТКИ (Завжди бере дані з локального файлу hromadas-data.js)
function renderMarkers() {
    if (!markersLayer) return;
    markersLayer.clearLayers();

    if (typeof hromadasGeoJSON === 'undefined') {
        console.error("Помилка: hromadas-data.js не завантажено!");
        return;
    }

    hromadasGeoJSON.features.forEach(hromada => {
        const nameKey = hromada.name.trim().toLowerCase();
        let label = "•"; 
        let content = `<h3>${hromada.name}</h3><hr>`;

        if (window.currentMode === 'collectives') {
            const list = (typeof collectivesList !== 'undefined') ? (collectivesList[nameKey] || []) : [];
            label = list.length || 0;
            content += `<b>Колективів: ${label}</b>`;
        } else {
            const b = window.currentBattleData[nameKey];
            if (b) {
                label = b.rank;
                content += `<p>🏆 Місце: №${b.rank}</p><p>❤️ Балів: ${b.score}</p>`;
            } else {
                label = "?";
                content += `<p>Очікуємо дані з n8n...</p>`;
            }
        }

        const icon = L.divIcon({
            className: 'count-icon',
            html: `<span>${label}</span>`,
            iconSize: [30, 30]
        });

        L.marker([imgH - hromada.y, hromada.x], { icon: icon }).bindPopup(content).addTo(markersLayer);
    });
}

// 3. ЗАВАНТАЖЕННЯ З N8N (Оновлює вже існуючі картки)
async function loadBattleRanking() {
    try {
        const res = await fetch("https://n8n.narodocnt.online/webhook/get-ranking");
        const rawData = await res.json();
        
        // Тут логіка обробки (спрощено)
        const groups = {};
        rawData.forEach(item => {
            let name = (item.pageName || "").toLowerCase();
            let key = "";
            if (name.includes("сміл")) key = "смілянська";
            // ... інші перевірки ...
            
            if (key) {
                let total = (parseInt(item.likes)||0) + (parseInt(item.shares)||0);
                groups[key] = { rank: 0, score: total };
            }
        });
        
        window.currentBattleData = groups;
        renderMarkers(); // Перемальовуємо з новими даними
    } catch (e) {
        console.warn("Битва поки недоступна, показуємо порожні картки.");
    }
}

// 4. ІНІЦІАЛІЗАЦІЯ ПРИ ЗАВАНТАЖЕННІ
function init() {
    if (typeof L === 'undefined') {
        setTimeout(init, 100);
        return;
    }

    map = L.map('map', { crs: L.CRS.Simple, minZoom: -1, maxZoom: 2 });
    const bounds = [[0, 0], [imgH, imgW]];
    L.imageOverlay('map.jpg', bounds).addTo(map);
    map.fitBounds(bounds);
    markersLayer = L.layerGroup().addTo(map);

    // ВІДРАЗУ МАЛЮЄМО ГРОМАДИ
    window.setMode('collectives');
}

document.addEventListener('DOMContentLoaded', init);
