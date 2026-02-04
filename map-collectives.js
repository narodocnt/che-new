window.renderCollectivesMode = function(layerGroup) {
    console.log("🛠️ Функція renderCollectivesMode запущена");
    if (!layerGroup || !window.hromadasGeoJSON || !window.collectivesList) {
        console.error("❌ Дані не завантажені!");
        return;
    }

    layerGroup.clearLayers();
    let drawnCount = 0;

    window.hromadasGeoJSON.features.forEach(hromada => {
        // Очищаємо назву: тільки корінь (перші 5 літер), щоб "Бабанська" збіглася з "бабанська"
        const nameKey = hromada.name.trim().toLowerCase().substring(0, 5);
        
        // Шукаємо в списку collectivesList
        let foundKey = Object.keys(window.collectivesList).find(k => k.toLowerCase().includes(nameKey));
        const list = foundKey ? window.collectivesList[foundKey] : [];
        const count = list.length;

        if (count > 0) {
            const icon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div class="marker-pin-collectives" style="background:#3498db; width:30px; height:30px; border-radius:50%; border:2px solid white; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; box-shadow:0 2px 5px rgba(0,0,0,0.3);">${count}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            const popupContent = `
                <div style="min-width:200px;">
                    <strong style="color:#2c3e50;">📍 ${hromada.name}</strong><br>
                    <small>Колективів: ${count}</small><hr>
                    <div style="max-height:150px; overflow-y:auto; font-size:12px;">
                        ${list.map(item => `<div style="padding:3px 0; border-bottom:1px solid #eee;">${item}</div>`).join('')}
                    </div>
                </div>`;

            const marker = L.marker([736 - hromada.y, hromada.x], { icon: icon });
            marker.bindPopup(popupContent);
            marker.addTo(layerGroup);
            drawnCount++;
        }
    });
    console.log(`✅ Намальовано кружечків: ${drawnCount}`);
};
