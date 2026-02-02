/**
 * map-bitva.js - Оновлена версія
 */
console.log("map-bitva.js завантажено");

const imgW = 900;
const imgH = 736;

// Видаляємо стару карту, якщо вона була ініціалізована раніше іншим скриптом
if (window.map && typeof window.map.remove === 'function') {
    window.map.remove();
}

// Створюємо карту та записуємо її у глобальну змінну window.map
window.map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -1,
    maxZoom: 2
});

const bounds = [[0, 0], [imgH, imgW]];
L.imageOverlay('map.jpg', bounds).addTo(window.map);
window.map.fitBounds(bounds);

// Змінні стану
let currentMode = 'collectives';
let currentBattleData = {};
let markersLayer = L.layerGroup().addTo(window.map);

// ФУНКЦІЯ МАЛЮВАННЯ (RENDER)
function renderMarkers() {
    console.log("Малюємо маркери. Режим:", currentMode);
    markersLayer.clearLayers();

    if (typeof hromadasGeoJSON === 'undefined') {
        console.error("КРИТИЧНО: Дані громад (hromadas-data.js) не знайдено!");
        return;
    }

    hromadasGeoJSON.features.forEach(hromada => {
        const nameKey = hromada.name.trim().toLowerCase();
        let label = "";
        let content = `<h3>${hromada.name}</h3><hr>`;
        let show = false;

        if (currentMode === 'collectives') {
            const list = (typeof collectivesList !== 'undefined' && collectivesList[nameKey]) ? collectivesList[nameKey] : [];
            label = list.length;
            content += `<b>Колективів: ${label}</b>`;
            if (label > 0) content += `<br><div style="max-height:100px;overflow-y:auto;">${list.join('<br>')}</div>`;
            show = true; // Показуємо всі громади
        } else {
            const b = currentBattleData[nameKey];
            if (b) {
                label = b.rank;
                content += `<p style="color:#e67e22;font-weight:bold;">🏆 Місце: №${b.rank}</p>
                            <p>🎵 <b>${b.collective}</b></p>
                            <p>❤️ Балів: ${b.score}</p>
                            <a href="${b.url}" target="_blank" style="display:block;text-align:center;background:#e74c3c;color:white;padding:5px;border-radius:5px;text-decoration:none;">Голосувати</a>`;
                show = true;
            }
        }

        if (show && hromada.x && hromada.y) {
            const icon = L.divIcon({ 
                className: 'count-icon', 
                html: `<span>${label}</span>`, 
                iconSize: [30, 30] 
            });
            L.marker([imgH - hromada.y, hromada.x], { icon: icon }).bindPopup(content).addTo(markersLayer);
        }
    });
}

// ФУНКЦІЯ ПЕРЕМИКАННЯ
window.setMode = function(mode) {
    console.log("Зміна режиму на:", mode);
    currentMode = mode;
    
    const bc = document.getElementById('btn-collectives');
    const bb = document.getElementById('btn-battle');
    if(bc) bc.className = mode === 'collectives' ? 'map-btn active-btn' : 'map-btn inactive-btn';
    if(bb) bb.className = mode === 'battle' ? 'map-btn active-btn' : 'map-btn inactive-btn';
    
    if (mode === 'battle') {
        loadRankingForMap();
    } else {
        renderMarkers();
    }
};

// ЗАВАНТАЖЕННЯ ДАНИХ БИТВИ
async function loadRankingForMap() {
    const N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    try {
        const response = await fetch(N8N_URL);
        const rawData = await response.json();
        
        // Обробка даних (спрощено для надійності)
        const groups = {};
        rawData.forEach(item => {
            let fullText = (item.pageName || "").toLowerCase();
            let key = "";
            if (fullText.includes("сміл")) key = "смілянська";
            else if (fullText.includes("тальн")) key = "тальнівська";
            else if (fullText.includes("кам")) key = "кам’янська";
            else if (fullText.includes("христин")) key = "христинівська";
            else if (fullText.includes("золотоніс")) key = "золотоніська";
            else if (fullText.includes("звенигород")) key = "звенигородська";

            if (key) {
                let total = (parseInt(item.likes)||0) + (parseInt(item.shares)||0) + (parseInt(item.comments)||0);
                if (!groups[key] || total > groups[key].score) {
                    groups[key] = {
                        collective: item.pageName,
                        score: total,
                        url: item.url
                    };
                }
            }
        });

        const sorted = Object.values(groups).sort((a,b) => b.score - a.score);
        sorted.forEach((item, i) => item.rank = i + 1);
        
        currentBattleData = groups;
        if (currentMode === 'battle') renderMarkers();
    } catch (e) {
        console.error("Помилка N8N:", e);
    }
}

// ЗАПУСК ПРИ ЗАВАНТАЖЕННІ
setTimeout(() => {
    console.log("Таймер спрацював, запускаємо ініціалізацію");
    renderMarkers(); 
    loadRankingForMap(); 
}, 1000);

// Автоматичний запуск карти при завантаженні
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Спроба запуску карти...");
    if (typeof initMap === 'function') {
        initMap();
    } else {
        console.error("Помилка: Функція initMap не знайдена в map-bitva.js");
    }
});

let currentMode = 'collectives';

function initMap() {
    console.log("✅ Leaflet знайдено! Створюємо карту Черкащини...");

    // Твій специфічний CRS для координат на картинці
    window.map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -1,
        maxZoom: 2,
        zoomSnap: 0.1,
        attributionControl: false
    });

    // Розміри твоєї карти-картинки (як було в оригіналі)
    const bounds = [[0, 0], [736, 1140]]; 
    
    // Якщо у тебе є файл фонової карти, він підтягнеться сюди
    // L.imageOverlay('map-bg.png', bounds).addTo(window.map);

    window.map.fitBounds(bounds);

    // Створюємо шар для точок
    window.markersLayer = L.layerGroup().addTo(window.map);

    if (typeof loadHromadas === 'function') {
        loadHromadas();
    }
}

function loadHromadas() {
    if (typeof hromadasGeoJSON === 'undefined') {
        console.error("Помилка: hromadasGeoJSON не знайдено!");
        return;
    }
    renderMarkers(currentMode);
}

function renderMarkers(mode) {
    if (!window.markersLayer) return;
    window.markersLayer.clearLayers();

    hromadasGeoJSON.features.forEach(function(h) {
        const gName = h.name.trim().toLowerCase();
        
        if (mode === 'battle') {
            const bKey = getBattleKey(gName);
            if (bKey) {
                // Малюємо 6 точок для битви
                L.marker([736 - h.y, h.x], {
                    icon: L.divIcon({ 
                        className: 'count-icon', 
                        html: `<span>${window.currentBattleData?.[bKey]?.rank || '!'}</span>`, 
                        iconSize: [30, 30] 
                    })
                }).addTo(window.markersLayer);
            }
        } else {
            // Режим колективів
            const list = (typeof collectivesList !== 'undefined' && collectivesList[gName]) || [];
            if (list.length > 0) {
                L.marker([736 - h.y, h.x], {
                    icon: L.divIcon({ 
                        className: 'count-icon', 
                        html: `<span>${list.length}</span>`, 
                        iconSize: [30, 30] 
                    })
                }).on('click', () => showCollectivesList(h.name, list))
                  .addTo(window.markersLayer);
            }
        }
    });
}

function getBattleKey(gName) {
    if (gName.includes("сміл")) return "смілянська";
    if (gName.includes("звениг")) return "звенигородська";
    if (gName.includes("кам")) return "кам’янська";
    if (gName.includes("тальн")) return "тальнівська";
    if (gName.includes("христин")) return "христинівська";
    if (gName.includes("золот")) return "золотоніська";
    return null;
}

function setMode(mode) {
    currentMode = mode;
    renderMarkers(mode);
}

// Функція для кнопок в HTML
window.updateMode = function(mode) {
    const btnCol = document.getElementById('btn-col');
    const btnBat = document.getElementById('btn-bat');
    if(btnCol) btnCol.style.background = (mode === 'collectives' ? '#e67e22' : '#2f3640');
    if(btnBat) btnBat.style.background = (mode === 'battle' ? '#e67e22' : '#2f3640');
    setMode(mode);
}
