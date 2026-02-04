/**
 * map-bitva.js - ПЕРЕВІРЕНА ВЕРСІЯ (координати 900x736)
 */
let map;
window.markersLayer = L.layerGroup(); 

document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // 1. Ініціалізація карти (Використовуємо CRS.Simple для координат картинки)
    map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -1,
        maxZoom: 2,
        zoomSnap: 0.1
    });

    // 2. ВАЖЛИВО: Ваші межі [Висота, Ширина]
    // Якщо картинка 900x736, то межі мають бути саме такими:
    const bounds = [[0, 0], [736, 900]]; 

    // Додаємо картинку на карту
    L.imageOverlay('map.jpg', bounds).addTo(map);

    // Центруємо карту по межах картинки
    map.fitBounds(bounds);

    // Додаємо шар для маркерів
    window.markersLayer.addTo(map);
    
    // Запускаємо початковий режим
    updateMode('collectives');
});

window.updateMode = function(mode) {
    console.log("🔄 Перемикання на:", mode);

    const btnCol = document.getElementById('btn-col');
    const btnBat = document.getElementById('btn-bat');

    if (btnCol && btnBat) {
        btnCol.style.background = (mode === 'collectives') ? '#e67e22' : '#2f3640';
        btnBat.style.background = (mode === 'battle') ? '#e67e22' : '#2f3640';
    }

    // Очищаємо всі маркери перед зміною режиму
    window.markersLayer.clearLayers();

    if (mode === 'battle') {
        if (typeof renderBitvaMode === 'function') {
            renderBitvaMode();
        }
    } else {
        if (typeof window.renderCollectivesMode === 'function') {
            // Передаємо нашу групу шарів у функцію колективів
            window.renderCollectivesMode(window.markersLayer);
        }
    }
};
