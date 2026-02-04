window.renderCollectivesMode = function(layerGroup) {
    console.log("🛠️ Початок малювання колективів...");
    
    // Беремо дані прямо з window
    const geoJSON = window.hromadasGeoJSON;
    const list = window.collectivesList;

    if (!layerGroup || !geoJSON || !list) {
        console.error("❌ Помилка: Дані не знайдені у window!", { geoJSON: !!geoJSON, list: !!list });
        return;
    }

    layerGroup.clearLayers();
    let drawn = 0;

    geoJSON.features.forEach(hromada => {
        // Очищаємо назву громади для пошуку
        const name = hromada.name.trim().toLowerCase();
        
        // Шукаємо в списку (враховуючи, що в списку ключі можуть бути без слова "громада")
        const collectives = list[name] || [];
        const count = collectives.length;

        if (count > 0) {
            // Малюємо маркер (Leaflet використовує [lat, lng], тому 736 - y)
            const lat = 736 - hromada.y;
            const lng = hromada.x;

            const icon = L.divIcon({
                className: 'custom-icon',
                html: `<div style="background:#e67e22; width:28px; height:28px; border-radius:50%; border:2px solid white; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; box-shadow:0 2px 5px rgba(0,0,0,0.3); font-size:12px;">${count}</div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });

            const popup = `
                <div style="min-width:200px; font-family: sans-serif;">
                    <b style="color:#d35400;">📍 ${hromada.name}</b><hr>
                    <div style="max-height:150px; overflow-y:auto; font-size:11px;">
                        ${collectives.map(c => `<div style="padding:3px 0; border-bottom:1px solid #eee;">${c}</div>`).join('')}
                    </div>
                </div>`;

          L.marker([lat, lng], { icon: icon }).bindPopup(popup).addTo(layerGroup);
            drawn++;
        }
    });

    console.log(`✅ Успішно додано ${drawn} громад на мапу.`);
};
