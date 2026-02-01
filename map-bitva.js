/**
 * map-bitva.js - ФІНАЛЬНА ВЕРСІЯ
 */

var map;
var markersLayer;
window.currentBattleData = {}; 
var currentMapMode = 'collectives'; 

// Функція запуску
function initMap() {
    // Якщо Leaflet ще немає, ми НЕ видаємо помилку відразу, а чекаємо ще трохи
    if (typeof L === 'undefined') {
        console.warn("Leaflet не знайдено, чекаємо завантаження бібліотеки...");
        setTimeout(initMap, 500); // Спробуємо через півсекунди
        return;
    }

    if (window.map) return;

    console.log("✅ Leaflet знайдено! Створюємо карту...");

    const imgW = 900;
    const imgH = 736;

    try {
        window.map = L.map('map', {
            crs: L.CRS.Simple,
            minZoom: -1,
            maxZoom: 2
        });

        L.imageOverlay('map.jpg', [[0, 0], [imgH, imgW]]).addTo(window.map);
        window.map.fitBounds([[0, 0], [imgH, imgW]]);
        window.markersLayer = L.layerGroup().addTo(window.map);

        window.setMode('collectives');
        loadBattleRanking();
    } catch (e) {
        console.error("Помилка при ініціалізації карти:", e);
    }
}

// Функції перемикання
window.setMode = function(mode) {
    if (typeof renderMarkers === 'function') renderMarkers(mode);
};
window.setMapMode = window.setMode;

// МАЛЮВАННЯ МАРКЕРІВ (з твоїми координатами)
function renderMarkers(mode) {
    if (!window.markersLayer || typeof hromadasGeoJSON === 'undefined') return;
    window.markersLayer.clearLayers();
    
    hromadasGeoJSON.features.forEach(function(h) {
        var gName = h.name.trim().toLowerCase();
        var label = "•";
        
        if (mode === 'battle') {
            // Пошук ключа для битви (смілянська і т.д.)
            var key = "";
            if (gName.includes("сміл")) key = "смілянська";
            else if (gName.includes("звениг")) key = "звенигородська";
            else if (gName.includes("кам")) key = "кам’янська";
            else if (gName.includes("тальн")) key = "тальнівська";
            else if (gName.includes("христин")) key = "христинівська";
            else if (gName.includes("золот")) key = "золотоніська";
            else if (gName.includes("чорноб")) key = "чорнобаївська";

            if (window.currentBattleData[key]) {
                label = window.currentBattleData[key].rank;
            }
        } else {
            var list = (typeof collectivesList !== 'undefined' && collectivesList[gName]) || [];
            label = list.length > 0 ? list.length : "•";
        }

        L.marker([736 - h.y, h.x], {
            icon: L.divIcon({ className: 'count-icon', html: '<span>' + label + '</span>', iconSize: [30, 30] })
        }).addTo(window.markersLayer);
    });
}

// ЗАВАНТАЖЕННЯ ДАНИХ
async function loadBattleRanking() {
    try {
        const response = await fetch("https://n8n.narodocnt.online/webhook/get-ranking");
        const data = await response.json();
        // Тут твоя логіка обробки даних...
        // window.currentBattleData = processed;
        if (currentMapMode === 'battle') renderMarkers('battle');
    } catch (e) {
        console.warn("Дані n8n недоступні");
    }
}

// СТАРТ
window.onload = initMap;
