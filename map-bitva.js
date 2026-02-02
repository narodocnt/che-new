/**
 * map-bitva.js - Тільки логіка карти
 */
var map;
var markersLayer;

function initMap() {
    if (map) return;
    // Використовуємо ваші робочі налаштування
    map = L.map('map', { crs: L.CRS.Simple, minZoom: -1, maxZoom: 2 });
    const bounds = [[0, 0], [736, 900]];
    L.imageOverlay('map.jpg', bounds).addTo(map);
    map.fitBounds(bounds);
    markersLayer = L.layerGroup().addTo(map);
    renderMarkers('collectives'); 
}

window.renderMarkers = function(mode) {
    if (!markersLayer || !window.hromadasGeoJSON) return;
    markersLayer.clearLayers();

    window.hromadasGeoJSON.features.forEach(h => {
        const gName = h.name.trim().toLowerCase();
        
        if (mode === 'battle') {
            // Шукаємо дані в глобальному рейтингу, який підготував bitva-ranking.js
            const battleItem = (window.currentBattleRanking || []).find(item => 
                gName.includes(item.location.toLowerCase().substring(0, 5))
            );

            if (battleItem) {
                const icon = L.divIcon({ 
                    className: 'count-icon battle-icon', 
                    html: `<span>${battleItem.score}</span>`, 
                    iconSize: [30, 30] 
                });
                L.marker([736 - h.y, h.x], { icon: icon })
                 .bindPopup(`<b>${battleItem.name}</b><br>Балів: ${battleItem.score}`)
                 .addTo(markersLayer);
            }
        } else {
            // Звичайний режим колективів
            const list = (window.collectivesList && window.collectivesList[gName]) || [];
            if (list.length > 0) {
                const icon = L.divIcon({ 
                    className: 'count-icon', 
                    html: `<span>${list.length}</span>`, 
                    iconSize: [30, 30] 
                });
                L.marker([736 - h.y, h.x], { icon: icon })
                 .bindPopup(`<div style="max-height:150px; overflow-y:auto;"><b>${h.name}</b><br>${list.join('<br>')}</div>`)
                 .addTo(markersLayer);
            }
        }
    });
};

window.setMapMode = function(mode) { window.renderMarkers(mode); };

// Чекаємо, поки Leaflet завантажиться повністю
window.addEventListener('load', initMap);
