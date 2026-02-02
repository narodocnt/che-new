/**
 * map-bitva.js - ОСТАТОЧНА РОБОЧА ВЕРСІЯ
 * Карта + Інтелектуальний рейтинг + Колективи
 */

// Глобальні змінні
var map;
var markersLayer;
window.currentData = []; 
window.currentBattleData = {};
var currentMapMode = 'collectives'; 

// Розміри зображення карти
const imgW = 900;
const imgH = 736;

// 1. ІНІЦІАЛІЗАЦІЯ КАРТИ (Взято з робочої версії)
function initMap() {
    console.log("🚀 Запуск ініціалізації карти...");
    if (map) return;

    try {
        map = L.map('map', {
            crs: L.CRS.Simple,
            minZoom: -1,
            maxZoom: 2,
            zoomSnap: 0.1
        });

        const bounds = [[0, 0], [imgH, imgW]];
        L.imageOverlay('map.jpg', bounds).addTo(map);
        map.fitBounds(bounds);
        
        markersLayer = L.layerGroup().addTo(map);
        console.log("✅ Карта готова, шари створені");
    } catch (e) {
        console.error("❌ Помилка ініціалізації карти:", e);
    }
}

// 2. ЗАВАНТАЖЕННЯ ДАНИХ ТА ПОРІВНЯННЯ (Твоя нова логіка)
async function loadBattleRanking() {
    console.log("📊 Завантаження рейтингу з n8n...");
    var N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    try {
        var response = await fetch(N8N_URL);
        var rawData = await response.json();
        var processedItems = [];
        window.currentBattleData = {}; 

        rawData.forEach(function(item) {
            var fullText = (item.message || item.text || "").trim();
            if (!fullText || fullText.length < 10) return;

            var t = fullText.toLowerCase();
            var foundId = null;

            // ПОРІВНЯННЯ з реєстром collectivesDatabase
            for (var id in window.collectivesDatabase) {
                var dbItem = window.collectivesDatabase[id];
                if (t.includes(dbItem.location.toLowerCase()) || 
                    t.includes(dbItem.key.toLowerCase()) || 
                    (dbItem.name && t.includes(dbItem.name.toLowerCase().substring(0, 10)))) {
                    foundId = id;
                    break;
                }
            }

            if (foundId) {
                var official = window.collectivesDatabase[foundId];
                var score = (parseInt(item.likes) || 0) + (parseInt(item.shares) || 0) + (parseInt(item.comments) || 0);

                processedItems.push({
                    id: foundId,
                    name: official.name,
                    score: score,
                    url: item.facebookUrl || item.url || "#",
                    media: official.media,
                    leader: official.leader,
                    hromada: official.location.toLowerCase()
                });
            }
        });

        processedItems.sort(function(a, b) { return b.score - a.score; });

        processedItems.forEach(function(item, index) {
            item.rank = index + 1;
            var locKey = item.hromada;
            if (!window.currentBattleData[locKey] || item.score > window.currentBattleData[locKey].score) {
                window.currentBattleData[locKey] = item;
            }
        });

        window.currentData = processedItems;

        if (typeof renderList === 'function') renderList();
        if (currentMapMode === 'battle') renderMarkers('battle');

    } catch (e) {
        console.error("❌ Помилка рейтингу:", e);
    }
}

// 3. МАЛЮВАННЯ МАРКЕРІВ (Поєднана логіка)
function renderMarkers(mode) {
    if (!markersLayer || typeof hromadasGeoJSON === 'undefined') {
        console.error("Очікування даних для малювання...");
        return;
    }
    markersLayer.clearLayers();
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
            if (window.currentBattleData[key]) {
                var d = window.currentBattleData[key];
                var iconB = L.divIcon({ 
                    className: 'count-icon', 
                    html: '<span>' + d.rank + '</span>', 
                    iconSize: [30, 30] 
                });
                L.marker([imgH - h.y, h.x], { icon: iconB })
                 .bindPopup('<b>' + d.name + '</b><br>Місце: ' + d.rank + '<br>Балів: ' + d.score)
                 .addTo(markersLayer);
            }
        } else {
            var list = (typeof collectivesList !== 'undefined' && collectivesList[gName]) || [];
            if (list.length > 0) {
                var iconC = L.divIcon({ 
                    className: 'count-icon', 
                    html: '<span>' + list.length + '</span>', 
                    iconSize: [30, 30] 
                });
                L.marker([imgH - h.y, h.x], { icon: iconC })
                 .bindPopup('<h3>' + h.name + '</h3>' + list.join('<br>'))
                 .addTo(markersLayer);
            }
        }
    });
}

// 4. ПЕРЕМИКАЧ РЕЖИМІВ (Для твоїх кнопок)
window.setMapMode = function(mode) {
    console.log("🔄 Зміна режиму на:", mode);
    renderMarkers(mode);
};

// 5. ЗАПУСК
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    renderMarkers('collectives');
    loadBattleRanking();
});
