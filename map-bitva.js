/**
 * map-bitva.js
 */
let map; 
window.markersLayer = L.layerGroup(); // Створюємо групу шарів як глобальний об'єкт

document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -1,
        maxZoom: 2
    });

    const bounds = [[0, 0], [736, 1147]];
    L.imageOverlay('map.jpg', bounds).addTo(map);
    map.fitBounds(bounds);

    // Додаємо групу шарів на карту
    window.markersLayer.addTo(map);
    
    // Початковий запуск
    updateMode('collectives');
});

window.updateMode = function(mode) {
    console.log("🔄 Режим змінено на:", mode);

    // Очищаємо шари ПЕРЕД викликом функцій
    if (window.markersLayer) {
        window.markersLayer.clearLayers();
    }

    if (mode === 'battle') {
        renderBitvaMode();
    } else {
        if (typeof window.renderCollectivesMode === 'function') {
            // Передаємо саме markersLayer
            window.renderCollectivesMode(window.markersLayer);
        }
    }
};
// 3. Логіка Битви (ваш код з виправленнями)
function renderBitvaMode() {
    console.log("⚔️ Малюємо маркери Битви...");
    
    fetch("https://n8n.narodocnt.online/webhook/get-ranking")
        .then(res => res.json())
        .then(rawData => {
            const db = window.collectivesDatabase;
            const geoJSON = window.hromadasGeoJSON;
            const resultsMap = {};

            if (!db || !geoJSON) {
                console.error("Відсутня база даних або GeoJSON!");
                return;
            }

            rawData.forEach(item => {
                const tableText = (item.text || "").toLowerCase();
                const totalScore = (parseInt(item.likes) || 0) + (parseInt(item.comments) || 0) + (parseInt(item.shares) || 0);

                for (let id in db) {
                    const loc = db[id].location.toLowerCase().substring(0, 5);
                    if (tableText.includes(loc)) {
                        if (!resultsMap[id] || totalScore > resultsMap[id].total) {
                            resultsMap[id] = { ...db[id], total: totalScore, url: item.facebookUrl };
                        }
                    }
                }
            });

            const sorted = Object.values(resultsMap).sort((a, b) => b.total - a.total);

            sorted.forEach((el, index) => {
                const rank = index + 1;
                const hromada = geoJSON.features.find(f => f.name.toLowerCase().includes(el.location.toLowerCase().substring(0, 5)));

                if (hromada) {
                    const lat = 736 - hromada.y;
                    const lng = hromada.x;
                    
                    const color = rank === 1 ? "#FFD700" : (rank === 2 ? "#C0C0C0" : (rank === 3 ? "#CD7F32" : "#e67e22"));

                    const icon = L.divIcon({
                        className: 'map-rank-marker',
                        html: `<div style="background:${color}; width:32px; height:32px; border-radius:50%; border:2px solid white; color:black; display:flex; align-items:center; justify-content:center; font-weight:900; box-shadow:0 2px 8px rgba(0,0,0,0.4); font-size:14px; cursor:pointer;">${rank}</div>`,
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    });

                    L.marker([lat, lng], { icon: icon })
                        .addTo(markersLayer)
                        .bindPopup(`
                            <div style="min-width:180px; text-align:center; font-family:sans-serif;">
                                <b style="color:#e67e22; font-size:16px;">🏆 РЕЙТИНГ: №${rank}</b><br>
                                <strong style="font-size:14px; display:block; margin:5px 0;">${el.name}</strong>
                                <div style="background:#fdf7f2; padding:5px; font-weight:bold; border-radius:4px;">Балів: ${el.total}</div>
                                <a href="${el.url}" target="_blank" style="display:block; background:#e67e22; color:white; padding:8px; margin-top:10px; border-radius:4px; text-decoration:none; font-size:11px; font-weight:bold;">ПЕРЕЙТИ ДО ПОСТУ</a>
                            </div>
                        `);
                }
            });
        })
        .catch(err => console.error("Помилка завантаження даних для мапи:", err));
}
