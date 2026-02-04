/**
 * bitva-map.js - Автономний скрипт для мапи Битви
 */
window.renderBitvaMode = function(layerGroup) {
    // Перевіряємо чи є база даних, щоб не "ляснув" весь скрипт
    if (!window.hromadasGeoJSON || !window.collectivesDatabase) {
        console.warn("Дані для карти Битви ще не завантажені.");
        return;
    }

    const geoJSON = window.hromadasGeoJSON;
    const db = window.collectivesDatabase;

    // Очищаємо шар перед малюванням, щоб не було дублів
    layerGroup.clearLayers();

    fetch("https://n8n.narodocnt.online/webhook/get-ranking")
        .then(res => res.json())
        .then(rawData => {
            const resultsMap = {};

            // Розрахунок рейтингу (точно як у вашому робочому ранкінгу)
            rawData.forEach(item => {
                const tableText = (item.text || "").toLowerCase();
                const totalScore = (parseInt(item.likes) || 0) + (parseInt(item.comments) || 0) + (parseInt(item.shares) || 0);

                for (let id in db) {
                    const locRoot = db[id].location.toLowerCase().substring(0, 5);
                    if (tableText.includes(locRoot)) {
                        if (!resultsMap[id] || totalScore > resultsMap[id].total) {
                            resultsMap[id] = { 
                                ...db[id], 
                                total: totalScore, 
                                url: item.facebookUrl 
                            };
                        }
                    }
                }
            });

            const sorted = Object.values(resultsMap).sort((a, b) => b.total - a.total);

            // Малюємо маркери
            sorted.forEach((el, index) => {
                const rank = index + 1;
                
                // Пошук громади в GeoJSON для координат
                const hromada = geoJSON.features.find(f => 
                    f.name.toLowerCase().includes(el.location.toLowerCase().substring(0, 5))
                );

                if (hromada) {
                    // Ваша точна піксельна формула
                    const lat = 736 - hromada.y;
                    const lng = hromada.x;

                    const color = rank === 1 ? "#FFD700" : (rank === 2 ? "#C0C0C0" : (rank === 3 ? "#CD7F32" : "#e67e22"));

                    const icon = L.divIcon({
                        className: 'map-rank-marker',
                        html: `<div style="background:${color}; width:30px; height:30px; border-radius:50%; border:2px solid white; color:black; display:flex; align-items:center; justify-content:center; font-weight:900; box-shadow:0 2px 6px rgba(0,0,0,0.3); font-size:13px;">${rank}</div>`,
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    });

                    const popup = `
                        <div style="min-width:180px; font-family:sans-serif;">
                            <div style="color:${color}; font-weight:bold; font-size:13px;">🏆 Місце №${rank}</div>
                            <h3 style="margin:5px 0; font-size:14px;">${el.name}</h3>
                            <p style="margin:2px 0; font-size:11px;">📍 ${el.location} громада</p>
                            <p style="margin:2px 0; font-size:11px;">👤 ${el.leader}</p>
                            <div style="margin:8px 0; font-weight:bold; font-size:12px; background:#fdf7f2; padding:4px;">Балів: ${el.total}</div>
                            <a href="${el.url}" target="_blank" style="display:block; background:#e67e22; color:white; text-align:center; padding:8px; border-radius:4px; text-decoration:none; font-weight:bold; font-size:10px; text-transform:uppercase;">Голосувати</a>
                        </div>`;

                    L.marker([lat, lng], { icon: icon }).bindPopup(popup).addTo(layerGroup);
                }
            });
        })
        .catch(err => console.error("Помилка синхронізації мапи Битви:", err));
};
