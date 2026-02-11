/**
 * map-bitva.js - Оновлено під структуру collectivesList
 */

if (typeof map === 'undefined') { var map; }
if (typeof markersLayer === 'undefined') { window.markersLayer = L.layerGroup(); }

// Функції спінера
function showSpinner() {
    const mapCont = document.getElementById('map');
    if (!document.getElementById('map-loader')) {
        const loader = document.createElement('div');
        loader.id = 'map-loader';
        loader.innerHTML = '<div class="spinner"></div>';
        loader.style = "position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); z-index:2000; background:rgba(255,255,255,0.8); padding:15px; border-radius:10px; box-shadow: 0 0 10px rgba(0,0,0,0.2);";
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
        map = L.map('map', { crs: L.CRS.Simple, minZoom: -1, maxZoom: 2, zoomSnap: 0.1 });
        const bounds = [[0, 0], [736, 900]];
        L.imageOverlay('map.jpg', bounds).addTo(map);
        map.fitBounds(bounds);
        window.markersLayer.addTo(map);

        // Динамічний розмір при зумі
        map.on('zoomend', () => {
            const currentZoom = map.getZoom();
            const newSize = 16 + (currentZoom + 1) * 12;
            document.querySelectorAll('.hromada-count-icon').forEach(el => {
                el.style.width = newSize + 'px';
                el.style.height = newSize + 'px';
                el.style.fontSize = (newSize / 2.2) + 'px';
            });
        });
    }
    return true;
}

// РЕЖИМ КОЛЕКТИВІВ (Використовує ваш новий список)
window.renderCollectivesMode = function() {
    if (!ensureMapReady()) return;
    showSpinner();
    window.markersLayer.clearLayers();

    const listData = window.collectivesList; // Ваш новий файл
    const geoJSON = window.hromadasGeoJSON;

    setTimeout(() => {
        geoJSON.features.forEach(f => {
            const hName = f.name.toLowerCase().trim();
            // Шукаємо громаду в списку (по першим 5 буквам для точності)
            const key = Object.keys(listData).find(k => k.toLowerCase().includes(hName.substring(0, 5)));
            
            if (key && listData[key]) {
                const count = listData[key].length;
                const lat = 736 - f.y;
                const lng = f.x;

                const iconSize = 20 + (map.getZoom() + 1) * 6;
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
                        listHtml += `<li style="padding: 8px 0; border-bottom: 1px solid #eee; font-size: 13px;">${item}</li>`;
                    });
                    
                    listHtml += "</ul></div>";
                    if (typeof showModal === 'function') showModal(listHtml);
                });

                marker.bindTooltip(`<b>${key}</b>`, { direction: 'top', offset: [0, -10] });
            }
        });
        hideSpinner();
    }, 400);
};

// РЕЖИМ БИТВИ
window.renderBitvaMode = function() {
    if (!ensureMapReady()) return;
    showSpinner();
    window.markersLayer.clearLayers();

    const url = "https://n8n.narodocnt.online/webhook/get-ranking?t=" + new Date().getTime();

    fetch(url)
        .then(res => res.json())
        .then(rawData => {
            const db = window.collectivesBitvaDatabase || window.collectivesDatabase;
            const geoJSON = window.hromadasGeoJSON;
            const resultsMap = {};

            rawData.forEach(item => {
                const tableText = (item.text || "").toLowerCase();
                const totalScore = (parseInt(item.likes) || 0) + (parseInt(item.comments) || 0) + (parseInt(item.shares) || 0);

                for (let id in db) {
                    const locSearch = db[id].location.toLowerCase().substring(0, 5);
                    if (tableText.includes(locSearch)) {
                        if (!resultsMap[id] || totalScore > resultsMap[id].total) {
                            resultsMap[id] = { ...db[id], total: totalScore, likes: item.likes, comments: item.comments, shares: item.shares, url: item.facebookUrl };
                        }
                    }
                }
            });

            const sorted = Object.values(resultsMap).sort((a, b) => b.total - a.total).slice(0, 6);

            sorted.forEach((el, index) => {
                const rank = index + 1;
                const hromada = geoJSON.features.find(f => f.name.toLowerCase().includes(el.location.toLowerCase().substring(0, 5)));

                if (hromada) {
                    const lat = 736 - hromada.y;
                    const lng = hromada.x;
                    const color = rank === 1 ? "#FFD700" : (rank === 2 ? "#C0C0C0" : (rank === 3 ? "#CD7F32" : "#e67e22"));

                    const icon = L.divIcon({
                        className: 'map-rank-marker',
                        html: `<div style="background:${color}; width:35px; height:35px; border-radius:50%; border:2px solid white; color:black; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:16px; box-shadow: 0 0 15px rgba(0,0,0,0.4);">${rank}</div>`,
                        iconSize: [35, 35],
                        iconAnchor: [17, 17]
                    });

                    const popupContent = `
                        <div style="width:200px; text-align:center; color: black; padding:5px;">
                            <b style="color:${color}; font-size:1.2em;">🏆 №${rank}</b><br>
                            <b>${el.name}</b><hr>
                            <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.9em;">
                                <span>👍 ${el.likes}</span><span>💬 ${el.comments}</span><span>🔄 ${el.shares}</span>
                            </div>
                            <div style="background:#e67e22; color:white; padding:5px; border-radius:5px; font-weight:bold;">${el.total} БАЛІВ</div>
                            <a href="${el.url}" target="_blank" style="display:inline-block; margin-top:10px; padding:7px 15px; background:#2980b9; color:white; text-decoration:none; border-radius:4px; font-size:0.8em;">ГОЛОСУВАТИ</a>
                        </div>`;

                    L.marker([lat, lng], { icon: icon }).addTo(window.markersLayer).bindPopup(popupContent);
                }
            });
            hideSpinner();
        })
        .catch(() => hideSpinner());
};
