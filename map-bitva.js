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
        
        // РЕЖИМ БИТВА
        if (mode === 'battle') {
            var key = getBattleKey(gName);
            // ПОМИЛКА БУЛА ТУТ: Малюємо маркер ТІЛЬКИ якщо громада є в базі битви (6 штук)
            if (key && window.currentBattleData && window.currentBattleData[key]) {
                var d = window.currentBattleData[key];
                L.marker([736 - h.y, h.x], {
                    icon: L.divIcon({ className: 'count-icon', html: '<span>' + d.rank + '</span>', iconSize: [30, 30] })
                }).bindPopup("<b>" + d.name + "</b><br>Місце: " + d.rank).addTo(window.markersLayer);
            }
        } 
        // РЕЖИМ КОЛЕКТИВИ
        else {
            var list = (typeof collectivesList !== 'undefined' && collectivesList[gName]) || [];
            var label = list.length > 0 ? list.length : "•";
            
            var m = L.marker([736 - h.y, h.x], {
                icon: L.divIcon({ className: 'count-icon', html: '<span>' + label + '</span>', iconSize: [30, 30] })
            });

            // Додаємо клік, який відкриває твоє модальне вікно
            m.on('click', function() {
                if (list.length > 0) {
                    showCollectivesList(h.name, list);
                }
            });
            m.addTo(window.markersLayer);
        }
    });
}

// Допоміжна функція для зв'язку імен громад
function getBattleKey(gName) {
    if (gName.includes("сміл")) return "смілянська";
    if (gName.includes("звениг")) return "звенигородська";
    if (gName.includes("кам")) return "кам’янська";
    if (gName.includes("тальн")) return "тальнівська";
    if (gName.includes("христин")) return "христинівська";
    if (gName.includes("золот")) return "золотоніська";
    if (gName.includes("чорноб")) return "чорнобаївська";
    return null;
}

// Функція для показу списку у модалці
function showCollectivesList(name, list) {
    const modal = document.getElementById('listModal');
    const body = document.getElementById('modalBody');
    if (!modal || !body) return;

    body.innerHTML = '<h2>' + name + '</h2><ul>' + list.map(i => '<li>' + i + '</li>').join('') + '</ul>';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
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

document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('rankingList');
    if (!container) return;

    // Список учасників (Рівно 6)
    const participants = [
        { id: 'смілянська', name: 'Смілянська громада', leader: 'Н. Шварцман', photo: 'smila.jpg' },
        { id: 'звенигородська', name: 'Звенигородська громада', leader: 'О. Бойко', photo: 'zven.jpg' },
        { id: 'кам’янська', name: 'Кам’янська громада', leader: 'О. Петрова', photo: 'kam.jpg' },
        { id: 'тальнівська', name: 'Тальнівська громада', leader: 'І. Сидоренко', photo: 'talne.jpg' },
        { id: 'христинівська', name: 'Христинівська громада', leader: 'М. Іванова', photo: 'hrist.jpg' },
        { id: 'золотоніська', name: 'Золотоніська громада', leader: 'В. Ткаченко', photo: 'zoloto.jpg' }
    ];

    // Використовуємо .innerHTML, щоб видалити старе і поставити тільки ці 6 карток
    container.innerHTML = participants.map(p => `
        <div class="rank-card" id="card-${p.id}">
            <div class="medal"><span class="card-rank">?</span></div>
            <img src="${p.photo}" class="rank-photo" onerror="this.src='narodocnt.jpg'">
            <div class="rank-details">
                <span class="rank-name">${p.name}</span>
                <span class="rank-leader">${p.leader}</span>
                <div class="progress-wrapper"><div class="progress-fill" id="fill-${p.id}" style="width: 0%"></div></div>
            </div>
            <div class="rank-score"><span id="score-${p.id}">0</span> 🔥</div>
        </div>
    `).join('');
});
// СТАРТ
window.onload = initMap;
