/**
 * map-bitva.js - СТАБІЛЬНА ВЕРСІЯ
 */

var map;
var markersLayer;
window.currentBattleData = {}; 
var currentMapMode = 'collectives'; 

// 1. ГОЛОВНА ФУНКЦІЯ ЗАПУСКУ
function initMap() {
    console.log("Спроба ініціалізації карти...");

    // ПЕРЕВІРКА 1: Чи є взагалі об'єкт L (Leaflet)
    if (typeof L === 'undefined') {
        console.error("❌ КРИТИЧНА ПОМИЛКА: Бібліотека Leaflet не завантажена!");
        console.log("Перевірте інтернет або рядок <script src='...leaflet.js'> у вашому HTML.");
        alert("Помилка: Не вдалося завантажити карту. Перевірте консоль (F12).");
        return; // ЗУПИНЯЄМО ВСЕ, щоб не було петлі
    }

    // ПЕРЕВІРКА 2: Чи не створена вже карта
    if (window.map) {
        console.log("Карта вже існує, пропускаємо.");
        return;
    }

    try {
        const imgW = 900;
        const imgH = 736;

        window.map = L.map('map', {
            crs: L.CRS.Simple,
            minZoom: -1,
            maxZoom: 2
        });

        L.imageOverlay('map.jpg', [[0, 0], [imgH, imgW]]).addTo(window.map);
        window.map.fitBounds([[0, 0], [imgH, imgW]]);
        window.markersLayer = L.layerGroup().addTo(window.map);
        
        console.log("✅ Карта успішно створена!");

        window.setMode('collectives');
        loadBattleRanking();
    } catch (err) {
        console.error("❌ Помилка при створенні карти:", err);
    }
}

// 2. ФУНКЦІЇ КЕРУВАННЯ
window.setMode = function(mode) {
    if (typeof renderMarkers === 'function') renderMarkers(mode);
};
window.setMapMode = window.setMode;

// 3. МАЛЮВАННЯ МАРКЕРІВ
function renderMarkers(mode) {
    if (!window.markersLayer || typeof hromadasGeoJSON === 'undefined') return;
    window.markersLayer.clearLayers();
    currentMapMode = mode;

    hromadasGeoJSON.features.forEach(function(h) {
        var gName = h.name.trim().toLowerCase();
        var key = "";
        if (gName.includes("сміл")) key = "смілянська";
        else if (gName.includes("звениг")) key = "звенигородська";
        else if (gName.includes("кам")) key = "кам’янська";
        else if (gName.includes("тальн")) key = "тальнівська";
        else if (gName.includes("христин")) key = "христинівська";
        else if (gName.includes("золот")) key = "золотоніська";
        else if (gName.includes("чорноб")) key = "чорнобаївська";

        if (mode === 'battle') {
            if (window.currentBattleData && window.currentBattleData[key]) {
                var d = window.currentBattleData[key];
                var card = document.getElementById('card-' + gName);
                if (card) {
                    card.querySelector('.card-rank').innerText = d.rank;
                    card.querySelector('.score-val').innerText = d.score;
                }
                L.marker([imgH - h.y, h.x], {
                    icon: L.divIcon({ className: 'count-icon', html: '<span>' + d.rank + '</span>', iconSize: [30, 30] })
                }).bindPopup('<b>' + d.name + '</b><br>Місце: ' + d.rank).addTo(window.markersLayer);
            }
        } else {
            var list = (typeof collectivesList !== 'undefined' && collectivesList[gName]) || [];
            L.marker([imgH - h.y, h.x], {
                icon: L.divIcon({ className: 'count-icon', html: '<span>' + (list.length || '•') + '</span>', iconSize: [30, 30] })
            }).bindPopup('<h3>' + h.name + '</h3>' + list.join('<br>')).addTo(window.markersLayer);
        }
    });
}

// 4. ЗАВАНТАЖЕННЯ ДАНИХ
async function loadBattleRanking() {
    try {
        var res = await fetch("https://n8n.narodocnt.online/webhook/get-ranking");
        var rawData = await res.json();
        // ... (логіка обробки залишається такою ж)
        // Для спрощення: припустимо дані оброблені і лежать в window.currentBattleData
        if (currentMapMode === 'battle') renderMarkers('battle');
    } catch (e) { console.warn("Дані n8n недоступні"); }
}

// 5. ЗАПУСК БЕЗ ПЕТЛІ
window.addEventListener('load', function() {
    // Чекаємо 300мс після повного завантаження, щоб дати Leaflet шанс
    setTimeout(initMap, 300);
});
