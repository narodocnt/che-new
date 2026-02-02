/**
 * map-bitva.js - Тільки карта
 */
var map;
var markersLayer;
window.currentMapMode = 'collectives';

function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || map) return;

    map = L.map('map', { crs: L.CRS.Simple, minZoom: -1, maxZoom: 2 });
    const bounds = [[0, 0], [736, 900]];
    L.imageOverlay('map.jpg', bounds).addTo(map);
    map.fitBounds(bounds);
    markersLayer = L.layerGroup().addTo(map);
    
    // Малюємо звичайні кружечки громад відразу
    renderMarkers('collectives');
}

window.renderMarkers = function(mode) {
    if (!markersLayer || !window.hromadasGeoJSON) return;
    markersLayer.clearLayers();
    window.currentMapMode = mode;

    window.hromadasGeoJSON.features.forEach(h => {
        const gName = h.name.trim().toLowerCase();
        
        if (mode === 'battle') {
            // Шукаємо дані в рейтингу
            const bItem = (window.currentBattleRanking || []).find(item => 
                item.location.toLowerCase().includes(gName.substring(0, 5)) || 
                gName.includes(item.location.toLowerCase().substring(0, 5))
            );

            if (bItem) {
                const icon = L.divIcon({ 
                    className: 'count-icon battle-marker', 
                    html: `<span>${bItem.score}</span>`, 
                    iconSize: [30, 30] 
                });
                L.marker([736 - h.y, h.x], { icon: icon })
                 .bindPopup(`<b>${bItem.name}</b><br>Балів: ${bItem.score}`)
                 .addTo(markersLayer);
            }
        } else {
            // Звичайні кружечки
            const list = (window.collectivesList && window.collectivesList[gName]) || [];
            if (list.length > 0) {
                const icon = L.divIcon({ 
                    className: 'count-icon', 
                    html: `<span>${list.length}</span>`, 
                    iconSize: [30, 30] 
                });
                L.marker([736 - h.y, h.x], { icon: icon })
                 .bindPopup(`<b>${h.name}</b><br>${list.join('<br>')}`)
                 .addTo(markersLayer);
            }
        }
    });
};

window.setMapMode = function(mode) { window.renderMarkers(mode); };
window.addEventListener('load', initMap);
