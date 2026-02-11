/**
 * map-bitva.js - Повна робоча версія: Карта + Виправлені картки
 */
let map;
window.markersLayer = L.layerGroup(); 

// 1. ІНІЦІАЛІЗАЦІЯ КАРТИ (Повертаємо її на місце)
document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Створюємо карту
    map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -1,
        maxZoom: 2,
        zoomSnap: 0.1
    });

    // Налаштування меж (Висота 736, Ширина 900 - як було раніше)
    const bounds = [[0, 0], [736, 900]]; 
    L.imageOverlay('map.jpg', bounds).addTo(map);
    map.fitBounds(bounds);

    // Додаємо шар для точок
    window.markersLayer.addTo(map);
    
    // Запускаємо початковий режим
    if (typeof updateMode === 'function') {
        updateMode('collectives');
    }
});

// 2. ФУНКЦІЯ РЕНДЕРУ БИТВИ (З виправленими картками)
window.renderBitvaMode = function() {
    console.log("⚔️ Запуск режиму Битви...");

    const url = "https://n8n.narodocnt.online/webhook/get-ranking?t=" + new Date().getTime();

    fetch(url)
        .then(res => res.json())
        .then(rawData => {
            const db = window.collectivesBitvaDatabase || window.collectivesDatabase;
            const geoJSON = window.hromadasGeoJSON;
            const resultsMap = {};

            if (!db || !geoJSON) return;

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
                            resultsMap[id] = { 
                                ...db[id], 
                                total: totalScore, 
                                likes: lks, 
                                comments: cms, 
                                shr: shr, 
                                url: item.facebookUrl 
                            };
                        }
                    }
                }
            });

            const sorted = Object.values(resultsMap).sort((a, b) => b.total - a.total).slice(0, 6);
            
            if (window.markersLayer) {
                window.markersLayer.clearLayers();
            }

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
                        html: `<div style="background:${color}; width:30px; height:30px; border-radius:50%; border:2px solid white; color:black; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:12px; box-shadow: 0 0 10px rgba(0,0,0,0.5);">${rank}</div>`,
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    });

                    // ВИПРАВЛЕНИЙ HTML ПOПAПУ (Компактний і рівний)
                    const popupContent = `
                        <div style="width:190px; font-family:sans-serif; padding:5px; text-align:center; color: black;">
                            <div style="color:${color}; font-weight:900; font-size:14px; margin-bottom:5px;">🏆 РЕЙТИНГ №${rank}</div>
                            <div style="font-weight:bold; font-size:12px; margin-bottom:8px; line-height:1.2;">${el.name}</div>
                            
                            <div style="display:flex; justify-content:space-around; background:#fdf7f2; padding:5px; border-radius:6px; margin-bottom:8px; border:1px solid #eee;">
                                <div style="font-size:10px;">👍<br><b>${el.likes}</b></div>
                                <div style="font-size:10px; border-left:1px solid #ddd; border-right:1px solid #ddd; padding:0 8px;">💬<br><b>${el.comments}</b></div>
                                <div style="font-size:10px;">🔄<br><b>${el.shr}</b></div>
                            </div>

                            <div style="background:#fff4eb; padding:6px; border-radius:6px; margin-bottom:10px; border:1px dashed #e67e22; font-weight:bold; font-size:14px; color:#e67e22;">
                                ${el.total} БАЛІВ
                            </div>
                            
                            <a href="${el.url}" target="_blank" style="display:block; background:#e67e22; color:white; text-decoration:none; padding:8px; border-radius:6px; font-weight:bold; font-size:10px; text-transform:uppercase;">Голосувати</a>
                        </div>
                    `;

                    L.marker([lat, lng], { icon: icon })
                        .addTo(window.markersLayer)
                        .bindPopup(popupContent);
                }
            });
        })
        .catch(err => console.error("Помилка Битви:", err));
};
