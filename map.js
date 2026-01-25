// 1. Налаштування розмірів вашої картинки
const imgW = 900;
const imgH = 736;

// 2. Ініціалізація карти в системі CRS.Simple (пікселі)
const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -1,
    maxZoom: 2,
    zoomSnap: 0.1
});

// 3. Встановлюємо межі та накладаємо map.jpg
const bounds = [[0, 0], [imgH, imgW]];
L.imageOverlay('map.jpg', bounds).addTo(map);
map.fitBounds(bounds);

let currentMode = 'collectives';
let markersLayer = L.layerGroup().addTo(map);

// 4. Функція виведення цифр
function renderMarkers() {
    markersLayer.clearLayers();

    // Перевірка наявності даних
    if (typeof hromadasGeoJSON === 'undefined' || typeof collectivesList === 'undefined') {
        console.error("Помилка: Дані hromadas-data.js або collectives-list.js не завантажені.");
        return;
    }

    hromadasGeoJSON.features.forEach(hromada => {
        const nameKey = hromada.name.trim().toLowerCase();
        
        // Отримуємо список колективів для цієї громади
        const list = collectivesList[nameKey] || [];
        const count = list.length;

        // Виводимо цифру, якщо в громаді є хоча б один колектив
        if (count > 0) {
            const icon = L.divIcon({
                className: 'count-icon',
                html: `<span>${count}</span>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            // Використовуємо ваші точні координати x та y
            // imgH - hromada.y робить перерахунок, щоб 0 був угорі (як у малюнку)
            const marker = L.marker([imgH - hromada.y, hromada.x], { icon: icon });

            // Формуємо табличку (попап)
            let popupContent = `
                <div style="min-width:200px;">
                    <h3 style="margin:0; color:#2c3e50;">${hromada.name}</h3>
                    <hr>
                    <b>Колективів: ${count}</b>
                    <div style="max-height:150px; overflow-y:auto; font-size:12px; margin-top:10px;">
                        ${list.join('<br>')}
                    </div>
                </div>`;

            marker.bindPopup(popupContent);
            markersLayer.addLayer(marker);
        }
    });
}

// Функція перемикання режимів (для кнопок)
function setMode(mode) {
    currentMode = mode;
    // Оновлення вигляду кнопок
    const btnCol = document.getElementById('btn-collectives');
    const btnBat = document.getElementById('btn-battle');
    if(btnCol) btnCol.className = mode === 'collectives' ? 'map-btn active-btn' : 'map-btn inactive-btn';
    if(btnBat) btnBat.className = mode === 'battle' ? 'map-btn active-btn' : 'map-btn inactive-btn';
    
    // Тут можна додати виклик функції для Битви, коли вона буде готова
    renderMarkers();
}

// Запуск при завантаженні
renderMarkers();
