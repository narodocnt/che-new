/**
 * map-bitva.js - ПОВНА ВЕРСІЯ: КАРТА + КОЛЕКТИВИ + БИТВА
 */

// 1. Ініціалізація карти (якщо вона ще не створена)
if (typeof map === 'undefined') { var map; }
if (typeof markersLayer === 'undefined') { window.markersLayer = L.layerGroup(); }

function ensureMapReady() {
    const container = document.getElementById('map');
    if (!container) return false;
    if (!map) {
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
    }
    return true;
}

// Функція для показу списку колективів громади (те, що було раніше)
window.showHromadaCollectives = function(hromadaName) {
    const db = window.collectivesDatabase; // Беремо з collectives-list.js
    let listHtml = `<h3>Колективи: ${hromadaName}</h3><ul style="text-align:left; max-height:300px; overflow-y:auto;">`;
    let found = false;

    for (let id in db) {
        if (db[id].location.toLowerCase().includes(hromadaName.toLowerCase().substring(0, 5))) {
            listHtml += `<li style="margin-bottom:10px;"><b>${db[id].name}</b><br><small>Керівник: ${db[id].leader || '—'}</small></li>`;
            found = true;
        }
    }
    listHtml += "</ul>";
    
    if (!found) listHtml = "<h3>Колективи</h3><p>Інформація оновлюється...</p>";
    
    // Викликаємо ваше модальне вікно (функція showModal вже є в index.html)
    if (typeof showModal === 'function') {
        showModal(listHtml);
    } else {
        alert("Дані громади: " + hromadaName);
    }
};

// 2. РЕЖИМ КОЛЕКТИВІВ (Кружечки громад)
window.renderCollectivesMode = function() {
    if (!ensureMapReady()) return;
    window.markersLayer.clearLayers();
    const geoJSON = window.hromadasGeoJSON;

    geoJSON.features.forEach(f => {
        const lat = 736 - f.y;
        const lng = f.x;
        
        // Малюємо сині кружечки громад
        const marker = L.circleMarker([lat, lng], {
            radius: 8,
            fillColor: "#3498db",
            color: "#fff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(window.markersLayer);

        // Клік відкриває список колективів
        marker.on('click', () => {
            window.showHromadaCollectives(f.name);
        });
        
        marker.bindTooltip(f.name, { direction: 'top', offset: [0, -5] });
    });
};

// 3. РЕЖИМ БИТВИ (Топ-6 лідерів)
window.renderBitvaMode = function() {
    if (!ensureMapReady()) return;
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
                        html: `<div style="background:${color}; width:32px; height:32px; border-radius:50%; border:2px solid white; color:black; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:14px; box-shadow: 0 0 10px rgba(0,0,0,0.5);">${rank}</div>`,
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
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
                        </div>
                    `;

                    L.marker([lat, lng], { icon: icon }).addTo(window.markersLayer).bindPopup(popupContent);
                }
            });
        })
        .catch(err => console.error("❌ Помилка Битви:", err));
};

// 4. ПЕРЕМИКАЧ РЕЖИМІВ (щоб кнопки в index.html працювали)
window.updateMode = function(mode) {
    if (mode === 'battle') {
        window.renderBitvaMode();
    } else {
        window.renderCollectivesMode();
    }
};

// Запуск при старті
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { window.renderCollectivesMode(); }, 200);
});
