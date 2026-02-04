/**
 * map-collectives.js - Відображення загальної кількості колективів по громадах
 */
window.renderCollectivesMode = function(layerGroup) {
    console.log("🛠️ Початок малювання колективів...");
    
    // 1. Перевірка наявності даних у системі
    const geoJSON = window.hromadasGeoJSON;
    const list = window.collectivesList;

    if (!geoJSON || !list) {
        console.error("❌ Помилка: База громад (GeoJSON) або список колективів (list) не знайдені!", { 
            geoJSON: !!geoJSON, 
            list: !!list 
        });
        return;
    }

    // 2. Безпечне очищення шару (перевіряємо, чи це група Leaflet)
    if (layerGroup && typeof layerGroup.clearLayers === 'function') {
        layerGroup.clearLayers();
    } else {
        console.error("❌ Помилка: Переданий layerGroup не підтримує clearLayers. Перевірте ініціалізацію в map-bitva.js");
        return;
    }

    let drawn = 0;

    // 3. Проходимо по кожній громаді з гео-даних
    geoJSON.features.forEach(hromada => {
        // Очищаємо назву громади для точного пошуку (малі літери, без зайвих пробілів)
        const name = hromada.name.trim().toLowerCase();
        
        // Шукаємо масив колективів для цієї громади у вашому списку
        const collectives = list[name] || [];
        const count = collectives.length;

        if (count > 0) {
            // Розрахунок координат: Y віднімаємо від висоти картинки (736)
            const lat = 736 - hromada.y;
            const lng = hromada.x;

            // Створюємо іконку з цифрою (кількість колективів)
            const icon = L.divIcon({
                className: 'custom-icon-collectives',
                html: `
                    <div style="
                        background: #e67e22; 
                        width: 28px; 
                        height: 28px; 
                        border-radius: 50%; 
                        border: 2px solid white; 
                        color: white; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        font-weight: bold; 
                        box-shadow: 0 2px 5px rgba(0,0,0,0.3); 
                        font-size: 12px;
                        cursor: pointer;
                    ">
                        ${count}
                    </div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });

            // Формуємо вміст спливаючого вікна (Popup)
            const popupContent = `
                <div style="min-width:200px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <b style="color:#d35400; font-size: 14px;">📍 ${hromada.name}</b>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 8px 0;">
                    <div style="max-height:150px; overflow-y:auto; font-size:12px; color: #333;">
                        <ul style="margin: 0; padding: 0 0 0 15px;">
                            ${collectives.map(c => `<li style="padding: 3px 0;">${c}</li>`).join('')}
                        </ul>
                    </div>
                    <div style="margin-top: 10px; font-size: 10px; color: #999; text-align: right;">
                        Всього: ${count}
                    </div>
                </div>`;

            // Створюємо маркер і додаємо його до групи
            L.marker([lat, lng], { icon: icon })
                .bindPopup(popupContent)
                .addTo(layerGroup);
            
            drawn++;
        }
    });

    console.log(`✅ Мапа оновлена: відображено ${drawn} громад.`);
};
