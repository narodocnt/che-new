/**
 * map-bitva.js - Фінальна версія
 */
var map;
var markersLayer;
window.currentMapMode = 'collectives';

function initMap() {
    // Перевірка, чи завантажена бібліотека Leaflet
    if (typeof L === 'undefined') {
        console.error("Leaflet (L) не знайдено. Чекаємо...");
        return;
    }

    var mapContainer = document.getElementById('map');
    if (!mapContainer || map) return;

    try {
        map = L.map('map', { crs: L.CRS.Simple, minZoom: -1, maxZoom: 2 });
        var bounds = [[0, 0], [736, 900]];
        L.imageOverlay('map.jpg', bounds).addTo(map);
        map.fitBounds(bounds);
        markersLayer = L.layerGroup().addTo(map);
        
        renderMarkers('collectives');
        console.log("Карта ініціалізована успішно");
    } catch (e) {
        console.error("Map init error:", e);
    }
}

window.renderMarkers = function(mode) {
    if (!markersLayer || !window.hromadasGeoJSON) return;
    markersLayer.clearLayers();
    window.currentMapMode = mode;

    window.hromadasGeoJSON.features.forEach(function(h) {
        var gName = h.name.trim().toLowerCase();
        
        if (mode === 'battle') {
            var bRanking = window.currentBattleRanking || [];
            var bItem = null;
            for (var i = 0; i < bRanking.length; i++) {
                if (gName.indexOf(bRanking[i].location.toLowerCase().substring(0, 5)) !== -1) {
                    bItem = bRanking[i];
                    break;
                }
            }

            if (bItem) {
                var iconB = L.divIcon({ 
                    className: 'count-icon', 
                    html: '<span style="background:#e67e22; color:white; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; border:2px solid white;">' + bItem.score + '</span>', 
                    iconSize: [30, 30] 
                });
                L.marker([736 - h.y, h.x], { icon: iconB })
                 .bindPopup('<b>' + bItem.name + '</b><br>Балів: ' + bItem.score)
                 .addTo(markersLayer);
            }
        } else {
            var list = (window.collectivesList && window.collectivesList[gName]) || [];
            if (list.length > 0) {
                var iconC = L.divIcon({ 
                    className: 'count-icon', 
                    html: '<span style="background:#3498db; color:white; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; border:2px solid white;">' + list.length + '</span>', 
                    iconSize: [30, 30] 
                });
                L.marker([736 - h.y, h.x], { icon: iconC })
                 .bindPopup('<div style="max-height:120px; overflow-y:auto;"><b>' + h.name + '</b><br>' + list.join('<br>') + '</div>')
                 .addTo(markersLayer);
            }
        }
    });
};

window.setMapMode = function(mode) { 
    window.renderMarkers(mode); 
};

// Запуск при повному завантаженні всіх ресурсів
window.addEventListener('load', initMap);
