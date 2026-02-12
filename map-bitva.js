/**
 * map-bitva.js - ПОВНА ВЕРСІЯ: КОЛЕКТИВИ + БИТВА (З МЕДІА ТА ПІДКАЗКАМИ)
 */

if (typeof map === 'undefined') { var map; }
if (typeof markersLayer === 'undefined') { window.markersLayer = L.layerGroup(); }

// Стилі для карток та анімацій
if (!document.getElementById('map-styles')) {
    const style = document.createElement('style');
    style.id = 'map-styles';
    style.innerHTML = `
        .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #e67e22; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .hromada-count-icon, .map-rank-marker div { transition: all 0.2s; cursor: pointer; }
        .hromada-count-icon:hover, .map-rank-marker div:hover { transform: scale(1.15); filter: brightness(1.1); }
        .video-preview { width: 100%; height: 100px; object-fit: cover; border-radius: 6px; margin-bottom: 8px; cursor: pointer; border: 1px solid #ddd; }
        .video-preview:hover { opacity: 0.9; }
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
    }
    return true;
}

// 1. РЕЖИМ КОЛЕКТИВІВ (з підказками)
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
                marker.bindTooltip(`<b>${key} ГРОМАДА</b>`, { direction: 'top', offset: [0, -10] });
            }
        });
        hideSpinner();
    }, 200);
};

// 2. РЕЖИМ БИТВИ (З ФОТО ТА КЕРІВНИКОМ)
window.renderBitvaMode = function() {
    if (!ensureMapReady()) return;
    showSpinner();
    window.markersLayer.clearLayers();

    const url = "https://n8n.narodocnt.online/webhook/get-ranking?t=" + new Date().getTime();

    fetch(url)
        .then(res => res.json())
        .then(rawData => {
            const db = window.collectivesDatabase;
            const geoJSON = window.hromadasGeoJSON;
            const resultsMap = {};

            rawData.forEach(item => {
                const tableText = (item.text || "").toLowerCase();
                const totalScore = (parseInt(item.likes) || 0) + (parseInt(item.comments) || 0) + (parseInt(item.shares) || 0);

                for (let id in db) {
                    const locSearch = db[id].location.toLowerCase().substring(0, 5);
                    if (tableText.includes(locSearch)) {
                        if (!resultsMap[id] || totalScore > resultsMap[id].total) {
                            resultsMap[id] = { 
                                ...db[id], 
                                total: totalScore, 
                                likes: item.likes, 
                                comments: item.comments, 
                                shares: item.shares, 
                                url: item.facebookUrl 
                            };
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
                        html: `<div style="background:${color}; width:38px; height:38px; border-radius:50%; border:2px solid white; color:black; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:18px; box-shadow: 0 0 15px rgba(0,0,0,0.4);">${rank}</div>`,
                        iconSize: [38, 38],
                        iconAnchor: [19, 19]
                    });

                    // КАРТКА З ВІДЕО ЗВЕРХУ (Як ви просили)
                    const popupContent = `
                        <div style="width:230px; font-family: 'Montserrat', sans-serif; color: black; padding: 0;">
                            <div style="position: relative; width: 100%; height: 130px; background: #000; border-radius: 8px 8px 0 0; overflow: hidden;">
                                <a href="${el.url}" target="_blank" style="display: block; width: 100%; height: 100%;">
                                    <img src="${el.media}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://via.placeholder.com/230x130?text=Facebook+Video'">
                                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(230, 126, 34, 0.9); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);">
                                        <div style="width: 0; height: 0; border-top: 8px solid transparent; border-bottom: 8px solid transparent; border-left: 12px solid white; margin-left: 3px;"></div>
                                    </div>
                                    <div style="position: absolute; top: 8px; left: 8px; background: ${color}; color: #000; font-weight: 900; font-size: 10px; padding: 3px 8px; border-radius: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
                                        №${rank} У РЕЙТИНГУ
                                    </div>
                                </a>
                            </div>

                            <div style="padding: 10px; background: #fff; border-radius: 0 0 8px 8px; border: 1px solid #eee; border-top: none;">
                                <div style="font-size: 10px; color: #e67e22; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">📍 ${el.location} громада</div>
                                <div style="font-weight: 800; font-size: 12px; line-height: 1.2; margin-bottom: 3px; min-height: 28px;">${el.name}</div>
                                <div style="font-size: 10px; color: #666; margin-bottom: 10px;">Керівник: <b>${el.leader}</b></div>

                                <div style="display: flex; justify-content: space-between; align-items: center; background: #fdf7f2; padding: 6px 10px; border-radius: 6px; border: 1px solid #f9e8d9; margin-bottom: 10px;">
                                    <div style="font-size: 11px;">👍 ${el.likes}  💬 ${el.comments}  🔄 ${el.shares}</div>
                                    <div style="background: #FFD700; color: #000; padding: 2px 8px; border-radius: 10px; font-weight: 900; font-size: 13px;">${el.total}</div>
                                </div>

                                <a href="${el.url}" target="_blank" style="display: block; background: #e67e22; color: white; text-decoration: none; text-align: center; padding: 10px; border-radius: 6px; font-weight: bold; font-size: 11px; text-transform: uppercase; transition: background 0.3s;">
                                    Підтримати у Facebook
                                </a>
                            </div>
                        </div>
                    `;

                    const marker = L.marker([lat, lng], { icon: icon }).addTo(window.markersLayer);
                    marker.bindPopup(popupContent);
                    marker.bindTooltip(`<b>${el.location.toUpperCase()}</b>`, { direction: 'top', offset: [0, -15] });
                }
            });
            hideSpinner();
        })
        .catch(() => hideSpinner());
};

window.updateMode = function(mode) {
    if (mode === 'battle') window.renderBitvaMode();
    else window.renderCollectivesMode();
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { window.renderCollectivesMode(); }, 500);
});
