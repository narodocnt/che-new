/**
 * map-bitva.js - ЦЕНТРАЛЬНИЙ МОЗОК ПРОЄКТУ
 */

// Глобальні змінні
var map;
var markersLayer;
window.currentData = []; 
window.currentBattleData = {};
var currentMapMode = 'collectives'; 

// 1. ІНІЦІАЛІЗАЦІЯ КАРТИ
function initMap() {
    // Перевірка чи завантажився Leaflet
    if (typeof L === 'undefined') {
        console.error("Помилка: Бібліотека Leaflet не знайдена в системі!");
        return;
    }

    // Захист від повторної ініціалізації
    if (window.map) return;

    console.log("Leaflet готовий! Створюємо карту...");

    const imgW = 900;
    const imgH = 736;

    window.map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -1,
        maxZoom: 2
    });

    const bounds = [[0, 0], [imgH, imgW]];
    L.imageOverlay('map.jpg', bounds).addTo(window.map);
    window.map.fitBounds(bounds);

    window.markersLayer = L.layerGroup().addTo(window.map);
    
    // Встановлюємо початковий режим (Громади)
    window.setMode('collectives');
    
    // Відразу запускаємо фонове завантаження балів з n8n
    loadBattleRanking();
}

// 2. ФУНКЦІЯ ПЕРЕМИКАННЯ (Для кнопок в HTML)
window.setMode = function(mode) {
    console.log("Зміна режиму на:", mode);
    renderMarkers(mode);
};

// Синонім для сумісності з твоїм updateMode в HTML
window.setMapMode = window.setMode;

// 3. МАЛЮВАННЯ МАРКЕРІВ (КОЛЕКТИВИ АБО БИТВА)
function renderMarkers(mode) {
    if (!window.markersLayer || typeof hromadasGeoJSON === 'undefined') {
        console.warn("Дані hromadas-data.js ще не завантажені або шар карти відсутній");
        return;
    }
    
    window.markersLayer.clearLayers();
    currentMapMode = mode;

    hromadasGeoJSON.features.forEach(function(h) {
        var gName = h.name.trim().toLowerCase();
        var key = "";

        // Визначаємо ключ громади для пошуку в даних битви
        if (gName.includes("сміл")) key = "смілянська";
        else if (gName.includes("звениг")) key = "звенигородська";
        else if (gName.includes("кам")) key = "кам’янська";
        else if (gName.includes("тальн")) key = "тальнівська";
        else if (gName.includes("христин")) key = "христинівська";
        else if (gName.includes("золот")) key = "золотоніська";
        else if (gName.includes("чорноб")) key = "чорнобаївська";

        if (mode === 'battle') {
            // --- РЕЖИМ БИТВА ---
            if (window.currentBattleData && window.currentBattleData[key]) {
                var d = window.currentBattleData[key];
                
                // Оновлюємо порожню картку в списку (bitva-cards.js)
                var card = document.getElementById('card-' + gName);
                if (card) {
                    var rankEl = card.querySelector('.card-rank');
                    var scoreEl = card.querySelector('.score-val');
                    if (rankEl) rankEl.innerText = d.rank;
                    if (scoreEl) scoreEl.innerText = d.score;
                    card.classList.add('active-battle-card');
                }

                var iconB = L.divIcon({ 
                    className: 'count-icon', 
                    html: '<span>' + d.rank + '</span>', 
                    iconSize: [30, 30] 
                });
                
                L.marker([736 - h.y, h.x], { icon: iconB })
                 .bindPopup('<b>' + d.name + '</b><br>Місце в битві: ' + d.rank + '<br>Балів: ' + d.score)
                 .addTo(window.markersLayer);
            }
        } else {
            // --- РЕЖИМ КОЛЕКТИВИ ---
            var list = (typeof collectivesList !== 'undefined' && collectivesList[gName]) || [];
            var label = list.length > 0 ? list.length : "•";
            
            var iconC = L.divIcon({ 
                className: 'count-icon', 
                html: '<span>' + label + '</span>', 
                iconSize: [30, 30] 
            });
            
            var popupContent = '<h3>' + h.name + '</h3>' + (list.length > 0 ? list.join('<br>') : "Дані відсутні");
            
            L.marker([736 - h.y, h.x], { icon: iconC })
             .bindPopup(popupContent)
             .addTo(window.markersLayer);
        }
    });
}

// 4. ЗАВАНТАЖЕННЯ ДАНИХ З N8N ТА ПОРІВНЯННЯ
async function loadBattleRanking() {
    var N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    try {
        console.log("Запитуємо дані з n8n...");
        var response = await fetch(N8N_URL);
        var rawData = await response.json();
        var processedItems = [];
        window.currentBattleData = {}; 

        rawData.forEach(function(item) {
            var fullText = (item.message || item.text || item.pageName || "").trim();
            if (!fullText) return;

            var t = fullText.toLowerCase();
            var foundId = null;

            // Шукаємо збіг у базі collectivesDatabase
            if (window.collectivesDatabase) {
                for (var id in window.collectivesDatabase) {
                    var dbItem = window.collectivesDatabase[id];
                    if (t.includes(dbItem.location.toLowerCase()) || 
                        t.includes(dbItem.key.toLowerCase())) {
                        foundId = id;
                        break;
                    }
                }
            }

            if (foundId) {
                var official = window.collectivesDatabase[foundId];
                var score = (parseInt(item.likes) || 0) + (parseInt(item.shares) || 0) + (parseInt(item.comments) || 0);

                processedItems.push({
                    id: foundId,
                    name: official.name,
                    score: score,
                    url: item.url || "#",
                    hromada: official.location.toLowerCase()
                });
            }
        });

        // Сортуємо за балами
        processedItems.sort(function(a, b) { return b.score - a.score; });

        // Призначаємо ранги
        processedItems.forEach(function(item, index) {
            item.rank = index + 1;
            var locKey = item.hromada;
            if (!window.currentBattleData[locKey] || item.score > window.currentBattleData[locKey].score) {
                window.currentBattleData[locKey] = item;
            }
        });

        console.log("Дані оброблено. Оновлюємо інтерфейс...");
        // Перемальовуємо, якщо зараз вибрано режим Битва
        if (currentMapMode === 'battle') renderMarkers('battle');

    } catch (e) {
        console.error("Помилка завантаження рейтингу:", e);
    }
}

// 5. БЕЗПЕЧНИЙ СТАРТ
// Чекаємо, поки завантажаться всі скрипти (Leaflet, дані тощо)
window.addEventListener('load', function() {
    initMap();
});
