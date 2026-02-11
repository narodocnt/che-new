/**
 * map-bitva.js - ЧИСТА ВЕРСІЯ
 */
let map;
window.markersLayer = L.layerGroup(); 

document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -1,
        maxZoom: 2,
        zoomSnap: 0.1
    });

    const bounds = [[0, 0], [736, 900]]; 
    L.imageOverlay('map.jpg', bounds).addTo(map);
    map.fitBounds(bounds);
    window.markersLayer.addTo(map);
    
    if (typeof updateMode === 'function') {
        updateMode('collectives');
    }
});

window.updateMode = function(mode) {
    const btnCol = document.getElementById('btn-col');
    const btnBat = document.getElementById('btn-bat');
    if (btnCol && btnBat) {
        btnCol.style.background = (mode === 'collectives') ? '#e67e22' : '#2f3640';
        btnBat.style.background = (mode === 'battle') ? '#e67e22' : '#2f3640';
    }
    if (window.markersLayer) window.markersLayer.clearLayers();
    if (mode === 'battle') {
        window.renderBitvaMode(); 
    } else {
        if (typeof window.renderCollectivesMode === 'function') {
            window.renderCollectivesMode(window.markersLayer);
        }
    }
};

window.renderBitvaMode = function() {
    // Додаємо випадкове число до URL, щоб n8n не кешував дані
    const url = `https://n8n.narodocnt.online/webhook/get-ranking?nocache=${Math.random()}`;

    fetch(url)
        .then(res => res.json())
        .then(rawData => {
            const db = window.collectivesDatabase;
            const geoJSON = window.hromadasGeoJSON;
            const resultsMap = {};

            rawData.forEach(item => {
                const tableText = (item.text || "").toLowerCase();
                // ВАЖЛИВО: Отримуємо цифри саме з тих полів, які приходять
                const lks = parseInt(item.likes) || 0;
                const cms = parseInt(item.comments) || 0; 
                const shr = parseInt(item.shares) || 0;
                const totalScore = lks + cms + shr;

                for (let id in db) {
                    const locSearch = db[id].location.toLowerCase().substring(0, 5);
                    if (tableText.includes(locSearch)) {
                        if (!resultsMap[id] || totalScore > resultsMap[id].total) {
                            resultsMap[id] = { 
                                ...db[id], 
                                total: totalScore,
                                likes: lks,
                                comments: cms, 
                                shares: shr,
                                url: item.facebookUrl
                            };
                        }
                    }
                }
            });

            const sorted = Object.values(resultsMap).sort((a, b) => b.total - a.total).slice(0, 6);
            if (window.markersLayer) window.markersLayer.clearLayers();

            sorted.forEach((el, index) => {
                const rank = index + 1;
                const hromada = geoJSON.features.find(f => 
                    f.name.toLowerCase().includes(el.location.toLowerCase().substring(0, 5))
                );

                if (hromada) {
                    const lat = 736 - hromada.y;
                    const lng = hromada.x;
                    const color = rank === 1 ? "#FFD700" : (rank === 2 ? "#C0C0C0" : (rank === 3 ? "#CD7F32" : "#e67e22"));

                    const icon = L.divIcon({
                        className: 'map-rank-marker',
                        html: `<div style="background:${color}; width:32px; height:32px; border-radius:50%; border:2px solid white; color:black; display:flex; align-items:center; justify-content:center; font-weight:900; box-shadow:0 2px 8px rgba(0,0,0,0.4); font-size:14px;">${rank}</div>`,
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    });

                    // КОМПАКТНИЙ HTML БЕЗ ДУБЛІВ (це виправить розтягування)
                    const popupContent = `
                        <div style="width:200px; font-family: sans-serif; padding: 5px; background: white;">
                            <div style="text-align:center; color:${color}; font-weight:900; font-size:16px; margin-bottom:5px;">🏆 РЕЙТИНГ №${rank}</div>
                            <div style="text-align:center; font-weight:bold; font-size:13px; margin-bottom:8px; line-height:1.2; color: #333;">${el.name}</div>
                            
                            <div style="display:flex; justify-content:space-between; background:#fdf7f2; padding:8px; border-radius:6px; margin-bottom:10px; border:1px solid #eee; text-align:center;">
                                <div style="flex:1; font-size:10px;">👍<br><b>${el.likes}</b></div>
                                <div style="flex:1; font-size:10px; border-left:1px solid #ddd; border-right:1px solid #ddd;">💬<br><b>${el.comments}</b></div>
                                <div style="flex:1; font-size:10px;">🔄<br><b>${el.shares}</b></div>
                            </div>

                            <div style="background:#fff4eb; text-align:center; padding:6px; border-radius:6px; margin-bottom:10px; border:1px dashed #e67e22;">
                                <span style="font-weight:bold; font-size:15px; color:#333;">${el.total} БАЛІВ</span>
                            </div>
                            
                            <a href="${el.url}" target="_blank" style="display:block; background:#e67e22; color:white; text-decoration:none; padding:10px; border-radius:6px; font-weight:bold; font-size:11px; text-transform:uppercase; text-align:center;">👍 ГОЛОСУВАТИ</a>
                        </div>
                    `;

                    L.marker([lat, lng], { icon: icon }).addTo(window.markersLayer).bindPopup(popupContent);
                }
            });
        })
        .catch(err => console.error("Помилка:", err));
};
