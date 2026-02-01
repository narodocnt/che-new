/**
 * map-bitva.js - ПОВНИЙ КОД
 * Логіка карти, інтелектуальне порівняння та малювання маркерів
 */
var map;
var markersLayer;
window.currentData = []; 
window.currentBattleData = {};
var currentMapMode = 'collectives'; 

// 1. ІНІЦІАЛІЗАЦІЯ КАРТИ
// 1. ЗАХИСТ ВІД ПОМИЛКИ ІНІЦІАЛІЗАЦІЇ
function initMap() {
    // Якщо Leaflet ще не завантажився, чекаємо 100мс і пробуємо знову
    if (typeof L === 'undefined') {
        console.warn("Leaflet ще не готовий, чекаю...");
        setTimeout(initMap, 100);
        return;
    }

    // Якщо карта вже ініціалізована, нічого не робимо
    if (window.map) return;

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
    
    // Запускаємо початковий режим
    setMode('collectives');
}

// 2. ФУНКЦІЯ ПЕРЕМИКАННЯ (window щоб бачили кнопки)
window.setMode = function(mode) {
    if (typeof renderMarkers === 'function') {
        renderMarkers(mode);
    }
};
// 2. ЗАВАНТАЖЕННЯ ДАНИХ ТА ПОРІВНЯННЯ З РЕЄСТРОМ
async function loadBattleRanking() {
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

            // ПОРІВНЯННЯ: Шукаємо збіг у collectivesDatabase (з файлу collectives-bitva.js)
            for (var id in window.collectivesDatabase) {
                var dbItem = window.collectivesDatabase[id];
                // Шукаємо за локацією, ключем або частиною назви
                if (t.includes(dbItem.location.toLowerCase()) || 
                    t.includes(dbItem.key.toLowerCase()) || 
                    (dbItem.name && t.includes(dbItem.name.toLowerCase().substring(0, 10)))) {
                    foundId = id;
                    break;
                }
            }

            // Якщо збіг знайдено в нашому офіційному реєстрі
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

        // СОРТУВАННЯ: Спочатку за балами
        processedItems.sort(function(a, b) { return b.score - a.score; });

        // ПРИЗНАЧЕННЯ РАНГІВ (МІСЦЬ) ТА ФІЛЬТРАЦІЯ ДЛЯ МАПИ
        processedItems.forEach(function(item, index) {
            item.rank = index + 1;
            
            // Для мапи беремо тільки один (кращий) пост для кожної громади
            var locKey = item.hromada;
            if (!window.currentBattleData[locKey] || item.score > window.currentBattleData[locKey].score) {
                window.currentBattleData[locKey] = item;
            }
        });

        window.currentData = processedItems;

        // Оновлюємо інтерфейс
        if (typeof renderList === 'function') renderList();
        if (currentMapMode === 'battle') renderMarkers('battle');

    } catch (e) {
        console.error("Помилка завантаження рейтингу:", e);
    }
}

// 3. МАЛЮВАННЯ МАРКЕРІВ (КОЛЕКТИВИ АБО БИТВА)
function renderMarkers(mode) {
    if (!markersLayer || typeof hromadasGeoJSON === 'undefined') return;
    markersLayer.clearLayers();
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
            // РЕЖИМ БИТВА: виводимо ранг (місце)
            if (window.currentBattleData && window.currentBattleData[key]) {
                var d = window.currentBattleData[key];
                
                // --- ЛОГІКА ДЛЯ КАРТОК (bitva-cards.js) ---
                // Шукаємо картку в списку за ID і оновлюємо її
                var card = document.getElementById('card-' + gName);
                if (card) {
                    var rankEl = card.querySelector('.card-rank');
                    var scoreEl = card.querySelector('.score-val');
                    if (rankEl) rankEl.innerText = d.rank;
                    if (scoreEl) scoreEl.innerText = d.score;
                    card.classList.add('active-battle-card'); // Можна додати стиль для підсвітки
                }
                // ------------------------------------------

                var iconB = L.divIcon({ 
                    className: 'count-icon', 
                    html: '<span>' + d.rank + '</span>', 
                    iconSize: [30, 30] 
                });
                L.marker([736 - h.y, h.x], { icon: iconB })
                 .bindPopup('<b>' + d.name + '</b><br>Місце в битві: ' + d.rank + '<br>Балів: ' + d.score)
                 .addTo(markersLayer);
            }
        } else {
            // РЕЖИМ КОЛЕКТИВИ: виводимо кількість колективів у громаді
            var list = (typeof collectivesList !== 'undefined' && collectivesList[gName]) || [];
            if (list.length > 0) {
                var iconC = L.divIcon({ 
                    className: 'count-icon', 
                    html: '<span>' + list.length + '</span>', 
                    iconSize: [30, 30] 
                });
                L.marker([736 - h.y, h.x], { icon: iconC })
                 .bindPopup('<h3>' + h.name + '</h3>' + list.join('<br>'))
                 .addTo(markersLayer);
            }
        }
    });
}

// ... (тут твоя функція renderMarkers)

// 4. ПЕРЕМИКАЧ РЕЖИМІВ
window.setMode = function(mode) {
    renderMarkers(mode);
};

// 5. ПОРЯДОК ЗАПУСКУ
function initMap() {
    if (typeof L === 'undefined') {
        console.warn("Leaflet ще не готовий, чекаю...");
        setTimeout(initMap, 100);
        return;
    }

    if (window.map) return;

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
    
    // ОСЬ ТУТ ВОНИ МАЮТЬ БУТИ:
    window.setMode('collectives'); // Малюємо громади відразу
    loadBattleRanking();           // Запускаємо фонове завантаження балів
}

// БЕЗПЕЧНИЙ СТАРТ
if (document.readyState === 'complete') {
    initMap();
} else {
    window.addEventListener('load', initMap);
}
