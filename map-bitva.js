/**
 * map-bitva.js - ПОВНА ВЕРСІЯ: КАРТА + СПІНЕР + КОЛЕКТИВИ
 */

// Глобальні змінні
if (typeof map === 'undefined') { var map; }
if (typeof markersLayer === 'undefined') { window.markersLayer = L.layerGroup(); }

// Додаємо стилі спінера безпосередньо в документ
if (!document.getElementById('map-styles')) {
    const style = document.createElement('style');
    style.id = 'map-styles';
    style.innerHTML = `
        .spinner { 
            width: 40px; height: 40px; 
            border: 4px solid #f3f3f3; 
            border-top: 4px solid #e67e22; 
            border-radius: 50%; 
            animation: spin 1s linear infinite; 
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .hromada-count-icon { transition: all 0.2s ease-in-out; }
        .hromada-count-icon:hover { transform: scale(1.1); filter: brightness(1.1); }
    `;
    document.head.appendChild(style);
}

function showSpinner() {
    const mapCont = document.getElementById('map');
    if (mapCont && !document.getElementById('map-loader')) {
        const loader = document.createElement('div');
        loader.id = 'map-loader';
        loader.innerHTML = '<div class="spinner"></div>';
        loader.style = "position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); z-index:2000; background:rgba(255,255,255,0.8); padding:15px; border-radius:10px;";
        mapCont.appendChild(loader);
    }
}

function hideSpinner() {
    const loader = document.getElementById('map-loader');
    if (loader) loader.remove();
}

function ensureMapReady() {
    const container = document.getElementById('map');
    if (!container) return false;
    if (!map) {
        console.log("🗺️ Ініціалізація карти...");
        map = L.map('map', { crs: L.CRS.Simple, minZoom: -1, maxZoom: 2, zoomSnap: 0.1 });
        const bounds = [[0, 0], [736, 900]];
        L.imageOverlay('map.jpg', bounds).addTo(map);
        map.fitBounds(bounds);
        window.markersLayer.addTo(map);

        map.on('zoomend', () => {
            const currentZoom = map.getZoom();
            const newSize = 18 + (currentZoom + 1) * 12;
            document.querySelectorAll('.hromada-count-icon').forEach(el => {
                el.style.width = newSize + 'px';
                el.style.height = newSize + 'px';
                el.style.fontSize = (newSize / 2.2) + 'px';
            });
        });
    }
    return true;
}

window.renderCollectivesMode = function() {
    if (!ensureMapReady()) return;
    showSpinner();
    window.markersLayer.clearLayers();

    const listData = window.collectivesList;
    const geoJSON = window.hromadasGeoJSON;

    // Невелика затримка для стабільності та візуального ефекту спінера
    setTimeout(() => {
        if (!listData || !geoJSON) {
            console.error("Дані не завантажені!");
            hideSpinner();
            return;
        }

        geoJSON.features.forEach(f => {
            const hName = f.name.toLowerCase().trim();
            const key = Object.keys(listData).find(k => k.toLowerCase().includes(hName.substring(0, 5)));
            
            if (key && listData[key]) {
                const count = listData[key].length;
                const lat = 736 - f.y;
                const lng = f.x;
                const iconSize = 22 + (map.getZoom() + 1) * 6;

                const icon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div class="hromada-count-icon" style="background:#3498db; color:white; width:${iconSize}px; height:${iconSize}px; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:${iconSize/2.2}px; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,0.4);">${count}</div>`,
                    iconSize: [iconSize, iconSize],
                    iconAnchor: [iconSize/2, iconSize/2]
                });

                const marker = L.marker([lat, lng], { icon: icon }).addTo(window.markersLayer);

                marker.on('click', () => {
                    let listHtml = `<div style="padding:10px; font-family: sans-serif; color: black;">
                        <h3 style="color:#2c3e50; margin-top:0;">${key.toUpperCase()}</h3>
                        <p style="font-size: 0.9em; color: #7f8c8d;">Всього колективів: ${count}</p>
                        <hr>
                        <ul style="text-align:left; max-height:350px; overflow-y:auto; padding-left:0; list-style:none;">`;
                    
                    listData[key].forEach(item => {
                        listHtml += `<li style="padding: 8px 0; border-bottom: 1px solid #eee; font-size: 13px; color: black;">${item}</li>`;
                    });
                    
                    listHtml += "</ul></div>";
                    if (typeof showModal === 'function') showModal(listHtml);
                });
                marker.bindTooltip(`<b>${key}</b>`, { direction: 'top', offset: [0, -10] });
            }
        });
        hideSpinner();
    }, 300);
};

// --- ФУНКЦІЯ БИТВИ (Додана, щоб не зникала) ---
window.renderBitvaMode = function() {
    if (!ensureMapReady()) return;
    showSpinner();
    window.markersLayer.clearLayers();
    // Тут ваш код fetch з n8n...
    // Після отримання даних - hideSpinner();
};

// ГОЛОВНИЙ ЗАПУСК
document.addEventListener('DOMContentLoaded', () => {
    // Чекаємо, поки всі дані підвантажаться
    setTimeout(() => {
        window.renderCollectivesMode();
    }, 500);
});
