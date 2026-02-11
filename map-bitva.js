/**
 * map-bitva.js - ПОВНА ВЕРСІЯ: КОЛЕКТИВИ + БИТВА + СПІНЕР
 */

if (typeof map === 'undefined') { var map; }
if (typeof markersLayer === 'undefined') { window.markersLayer = L.layerGroup(); }

// Додаємо стилі спінера та кружечків
if (!document.getElementById('map-styles')) {
    const style = document.createElement('style');
    style.id = 'map-styles';
    style.innerHTML = `
        .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #e67e22; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .hromada-count-icon, .map-rank-marker div { transition: all 0.2s; cursor: pointer; }
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

// 1. РЕЖИМ КОЛЕКТИВІВ
window.renderCollectivesMode = function() {
    if (!ensureMapReady()) return;
    showSpinner();
    window.markersLayer.clearLayers();

    const listData = window.collectivesList;
    const geoJSON = window.hromadasGeoJSON;

    setTimeout(() => {
        if (!listData || !geoJSON) { hideSpinner(); return; }

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
                    html: `<div class="hromada-count-icon" style="background:#3498db; color:white; width:${iconSize}px; height:${iconSize}px; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:${iconSize/2.2}px; box-shadow:0 2px 6px rgba(0,0,0,0.4);">${count}</div>`,
                    iconSize: [iconSize, iconSize],
                    iconAnchor: [iconSize/2, iconSize/2]
                });

                const marker = L.marker([lat, lng], { icon: icon }).addTo(window.markersLayer);
                marker.on('click', () => {
                    let listHtml = `<div style="padding:10px; color:black;"><h3>${key.toUpperCase()}</h3><hr><ul style="text-align:left; max-height:350px; overflow-y:auto; padding-left:0; list-style:none;">`;
                    listData[key].forEach(item => { listHtml += `<li style="padding:8px 0; border-bottom:1px solid #eee; font-size:13px;">${item}</li>`; });
                    listHtml += "</ul></div>";
                    if (typeof showModal === 'function') showModal(listHtml);
                });
                marker.bindTooltip(`<b>${key}</b>`, { direction: 'top', offset: [0, -10] });
            }
        });
        hideSpinner();
    }, 200);
};

// 2. РЕЖИМ БИТВИ
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
                const lks = parseInt(item.likes) || 0;
                const cms = parseInt(item.comments) || 0; 
                const shr = parseInt(item.shares) || 0;
                const totalScore = lks + cms + shr;

                for (let id in db) {
                    const locSearch = db[id].location.toLowerCase().substring(0, 5);
                    if (tableText.includes(locSearch)) {
                        if (!resultsMap[id] || totalScore > resultsMap[id].total) {
                            resultsMap[id] = { ...db[id], total: totalScore, likes: lks, comments: cms, shares: shr, url: item.facebookUrl };
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
                        <div style="width:190px; font-family:sans-serif; padding:5px; text-align:center; color: black;">
                            <div style="color:${color}; font-weight:900; font-size:14px; margin-bottom:5px;">🏆 РЕЙТИНГ №${rank}</div>
                            <div style="font-weight:bold; font-size:12px; margin-bottom:8px; line-height:1.2;">${el.name}</div>
                            <div style="display:flex; justify-content:space-around; background:#fdf7f2; padding:5px; border-radius:6px; margin-bottom:8px; border:1px solid #eee;">
                                <div style="font-size:10px;">👍<br><b>${el.likes}</b></div>
                                <div style="font-size:10px; border-left:1px solid #ddd; border-right:1px solid #ddd; padding:0 8px;">💬<br><b>${el.comments}</b></div>
                                <div style="font-size:10px;">🔄<br><b>${el.shares}</b></div>
                            </div>
                            <div style="background:#fff4eb; padding:6px; border-radius:6px; margin-bottom:10px; border:1px dashed #e67e22; font-weight:bold; font-size:14px; color:#e67e22;">
                                ${el.total} БАЛІВ
                            </div>
                            <a href="${el.url}" target="_blank" style="display:block; background:#e67e22; color:white; text-decoration:none; padding:8px; border-radius:6px; font-weight:bold; font-size:10px; text-transform:uppercase;">Голосувати</a>
                        </div>`;

                    L.marker([lat, lng], { icon: icon }).addTo(window.markersLayer).bindPopup(popupContent);
                }
            });
            hideSpinner();
        })
        .catch(() => hideSpinner());
};

// ПЕРЕМИКАЧ
window.updateMode = function(mode) {
    if (mode === 'battle') window.renderBitvaMode();
    else window.renderCollectivesMode();
};

// ЗАПУСК
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { window.renderCollectivesMode(); }, 500);
});
