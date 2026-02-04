/**
 * bitva-map.js - Рейтинг на карті з використанням координат GeoJSON
 */
window.renderBitvaMode = function(layerGroup) {
    console.log("⚔️ Запуск режиму Битва на карті...");
    
    const geoJSON = window.hromadasGeoJSON;
    const db = window.collectivesDatabase;

    if (!layerGroup || !geoJSON || !db) {
        console.error("❌ Помилка: Необхідні дані не знайдені!");
        return;
    }

    layerGroup.clearLayers();

    // 1. Отримуємо дані рейтингу з n8n
    fetch("https://n8n.narodocnt.online/webhook/get-ranking")
        .then(res => res.json())
        .then(rawData => {
            const resultsMap = {};

            // 2. Розрахунок рейтингу (точно як у bitva-ranking.js)
            rawData.forEach(item => {
                const tableText = (item.text || "").toLowerCase();
                const likes = parseInt(item.likes) || 0;
                const comments = parseInt(item.comments) || 0;
                const shares = parseInt(item.shares) || 0;
                const totalScore = likes + comments + shares;

                for (let id in db) {
                    const locSearch = db[id].location.toLowerCase().substring(0, 5);
                    if (tableText.includes(locSearch)) {
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

            // 3. Сортуємо для отримання місць (1, 2, 3...)
            const sorted = Object.values(resultsMap).sort((a, b) => b.total - a.total);

            // 4. Малюємо маркери на карті
            sorted.forEach((el, index) => {
                const rank = index + 1;
                
                // Шукаємо координати громади в GeoJSON за назвою локації
                const hromada = geoJSON.features.find(f => 
                    f.name.toLowerCase().includes(el.location.toLowerCase().substring(0, 5))
                );

                if (hromada) {
                    // Твоя формула перерахунку:
                    const lat = 736 - hromada.y;
                    const lng = hromada.x;

                    // Колір залежно від місця
                    const color = rank === 1 ? "#FFD700" : (rank === 2 ? "#C0C0C0" : (rank === 3 ? "#CD7F32" : "#e67e22"));

                    const icon = L.divIcon({
                        className: 'bitva-icon',
                        html: `<div style="background:${color}; width:32px; height:32px; border-radius:50%; border:2px solid white; color:black; display:flex; align-items:center; justify-content:center; font-weight:900; box-shadow:0 2px 8px rgba(0,0,0,0.4); font-size:14px;">${rank}</div>`,
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    });

                    // Створюємо Popup (точно як у картках)
                    const popupContent = `
                        <div class="map-bitva-popup" style="min-width:180px;">
                            <div style="color:${color}; font-weight:bold; font-size:14px;">🏆 Місце №${rank}</div>
                            <h3 style="margin:5px 0; font-size:14px; line-height:1.2;">${el.name}</h3>
                            <p style="margin:2px 0; font-size:11px;">📍 ${el.location} громада</p>
                            <p style="margin:2px 0; font-size:11px;">👤 ${el.leader}</p>
                            <div style="margin:8px 0; font-weight:bold; font-size:13px; background:#fdf7f2; padding:4px; border-radius:4px;">
                                Балів: ${el.total}
                            </div>
                            <a href="${el.url}" target="_blank" 
                               style="display:block; background:#e67e22; color:white; text-align:center; padding:8px; border-radius:4px; text-decoration:none; font-weight:bold; font-size:10px; text-transform:uppercase;">
                               Голосувати
                            </a>
                        </div>`;

                    L.marker([lat, lng], { icon: icon })
                        .bindPopup(popupContent)
                        .addTo(layerGroup);
                }
            });

            console.log(`✅ На мапу додано ${sorted.length} учасників Битви.`);
        })
        .catch(err => console.error("❌ Помилка завантаження рейтингу для карти:", err));
};
