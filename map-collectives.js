/**
 * map-collectives.js - Логіка відображення кількості колективів на мапі
 */

// Функція для створення маркерів колективів
window.renderCollectivesMode = function(layerGroup) {
    if (!layerGroup || !window.hromadasGeoJSON || !window.collectivesList) {
        console.error("Помилка: Відсутні дані для мапи (hromadasGeoJSON або collectivesList)");
        return;
    }

    layerGroup.clearLayers();

    window.hromadasGeoJSON.features.forEach(function(hromada) {
        // Очищаємо назву громади для пошуку в списку (нижній регістр)
        const nameKey = hromada.name.trim().toLowerCase();
        const list = window.collectivesList[nameKey] || [];
        const count = list.length;

        // Малюємо маркер тільки якщо в громаді є колективи
        if (count > 0) {
            // Створюємо іконку з цифрою
            const icon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div class="marker-pin-collectives">${count}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            // Формуємо текст таблички (Popup)
            let popupContent = `<div class="map-popup-content">
                <strong>📍 ${hromada.name} громада</strong><br>
                <small>Кількість колективів: ${count}</small><br><br>
                <div class="popup-scroll-list">
                    ${list.map(item => `<div class="popup-item">${item}</div>`).join('')}
                </div>
            </div>`;

            // Створюємо маркер
            const marker = L.marker([736 - hromada.y, hromada.x], { icon: icon });
            
            // Додаємо табличку, яка відкривається при кліку
            marker.bindPopup(popupContent, {
                maxWidth: 350,
                className: 'custom-popup-style'
            });

            marker.addTo(layerGroup);
        }
    });
};
