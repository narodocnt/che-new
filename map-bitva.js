/**
 * map-bitva.js - Стабільна карта
 */
var map;
var markersLayer;
window.currentMapMode = 'collectives';

function initMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl || map) return;

    map = L.map('map', { crs: L.CRS.Simple, minZoom: -1, maxZoom: 2 });
    const bounds = [[0, 0], [736, 900]];
    L.imageOverlay('map.jpg', bounds).addTo(map);
    map.fitBounds(bounds);
    markersLayer = L.layerGroup().addTo(map);
    
    // Показуємо колективи відразу
    setTimeout(() => renderMarkers('collectives'), 300);
}

window.renderMarkers = function(mode) {
    if (!markersLayer || !window.hromadasGeoJSON) return;
    markersLayer.clearLayers();
    window.currentMapMode = mode;

    window.hromadasGeoJSON.features.forEach(h => {
        const gName = h.name.trim().toLowerCase();
        
        if (mode === 'battle') {
            const bItem = (window.currentBattleRanking || []).find(item => 
                item.location.toLowerCase().includes(gName.substring(0, 5)) || 
                gName.includes(item.location.toLowerCase().substring(0, 5))
            );

            if (bItem) {
                const icon = L.divIcon({ 
                    className: 'count-icon', 
                    html: `<span style="background:#e67e22; color:white; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; border:2px solid white;">${bItem.score}</span>`, 
                    iconSize: [30, 30] 
                });
                L.marker([736 - h.y, h.x], { icon: icon })
                 .bindPopup(`<b>${bItem.name}</b><br>Балів: ${bItem.score}`)
                 .addTo(markersLayer);
            }
        } else {
            const list = (window.collectivesList && window.collectivesList[gName]) || [];
            if (list.length > 0) {
                const icon = L.divIcon({ 
                    className: 'count-icon', 
                    html: `<span style="background:#3498db; color:white; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; border:2px solid white;">${list.length}</span>`, 
                    iconSize: [30, 30] 
                });
                L.marker([736 - h.y, h.x], { icon: icon })
                 .bindPopup(`<div style="max-height:120px; overflow-y:auto;"><b>${h.name}</b><br>${list.join('<br>')}</div>`)
                 .addTo(markersLayer);
            }
        }
    });
};

window.setMapMode = function(mode) { window.renderMarkers(mode); };

// Чекаємо повної готовності сторінки
window.addEventListener('load', initMap);
