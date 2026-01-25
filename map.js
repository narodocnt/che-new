/**
 * map.js - Інтеграція рейтингу з таблиці та вивід колективів
 */

// Ця функція імітує отримання даних, які ви використовуєте для банера.
// Вона має бути синхронізована з вашим h8n/Mistral ланцюжком.
async function fetchBattleData() {
    try {
        // Тут має бути URL вашого API або шлях до json, який генерує n8n
        const response = await fetch('battle-rating.json'); 
        const data = await response.json();
        return data; 
    } catch (e) {
        console.error("Помилка отримання рейтингу:", e);
        // Запасні дані, якщо таблиця недоступна (для тесту)
        return [
            { hromada: "Кам’янська", collective: "Народний ансамбль 'Забава'", leader: "Іван Іванов", votes: 1250, rank: 1 },
            { hromada: "Смілянська", collective: "Хореографічний колектив 'Сонце'", leader: "Марія Петренко", votes: 1120, rank: 2 },
            { hromada: "Уманська", collective: "Вокальний гурт 'Мелодія'", leader: "Олена Сидоренко", votes: 980, rank: 3 },
            { hromada: "Золотоніська", collective: "Танцювальний клуб 'Арт'", leader: "Петро Миколаєнко", votes: 850, rank: 4 },
            { hromada: "Черкаська", collective: "Театральна студія 'Маска'", leader: "Анна Вікторівна", votes: 700, rank: 5 },
            { hromada: "Чигиринська", collective: "Фольклорний ансамбль 'Джерело'", leader: "Василь Степанович", votes: 450, rank: 6 }
        ];
    }
}

// Налаштування піксельної карти (як ми домовилися раніше)
const imgW = 900;
const imgH = 736;

const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -1,
    maxZoom: 2
});

const bounds = [[0, 0], [imgH, imgW]];
L.imageOverlay('map.jpg', bounds).addTo(map);
map.fitBounds(bounds);

let currentMode = 'collectives';
let markersLayer = L.layerGroup().addTo(map);

async function renderMarkers() {
    markersLayer.clearLayers();
    const battleData = await fetchBattleData();

    hromadasGeoJSON.features.forEach(hromada => {
        const name = hromada.name.trim();
        const nameLower = name.toLowerCase();
        
        if (currentMode === 'collectives') {
            const list = collectivesList[nameLower] || [];
            if (list.length > 0) {
                addMarker(hromada, list.length, `<b>Колективів: ${list.length}</b><br>${list.join('<br>')}`);
            }
        } else {
            // Режим БИТВИ: шукаємо громаду в даних з таблиці
            const participant = battleData.find(p => p.hromada === name);
            if (participant) {
                const content = `
                    <div style="text-align:center; min-width:200px;">
                        <h3 style="margin:5px 0;">${participant.hromada}</h3>
                        <p style="color:#e67e22; font-weight:bold; font-size:16px;">🏆 Місце: №${participant.rank}</p>
                        <hr>
                        <p style="text-align:left;"><b>Колектив:</b> ${participant.collective}</p>
                        <p style="text-align:left;"><b>Керівник:</b> ${participant.leader}</p>
                        <p style="text-align:left;"><b>Голосів:</b> ${participant.votes}</p>
                        <button style="background:#e74c3c; color:white; border:none; padding:8px; border-radius:5px; width:100%; cursor:pointer;">Голосувати ❤️</button>
                    </div>`;
                // Виводимо цифру РЕЙТИНГУ (rank) на карту
                addMarker(hromada, participant.rank, content, true);
            }
        }
    });
}

function addMarker(hromada, label, popupContent, isBattle = false) {
    const iconClass = isBattle ? 'count-icon battle-style' : 'count-icon';
    const icon = L.divIcon({
        className: iconClass,
        html: `<span>${label}</span>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    const marker = L.marker([imgH - hromada.y, hromada.x], { icon: icon });
    marker.bindPopup(popupContent);
    markersLayer.addLayer(marker);
}

function setMode(mode) {
    currentMode = mode;
    document.getElementById('btn-collectives').className = mode === 'collectives' ? 'map-btn active-btn' : 'map-btn inactive-btn';
    document.getElementById('btn-battle').className = mode === 'battle' ? 'map-btn active-btn' : 'map-btn inactive-btn';
    renderMarkers();
}

// Перший запуск
renderMarkers();
