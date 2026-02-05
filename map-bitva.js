/**
 * renderBitvaMode - Малює ТОП-6 рейтингу на мапі
 */
window.renderBitvaMode = function() {
    console.log("⚔️ Запуск режиму Битви...");

    // Перевіряємо наявність шару та даних
    if (!window.markersLayer || !window.collectivesDatabase || !window.hromadasGeoJSON) {
        console.error("❌ Помилка: Необхідні дані або шар markersLayer не знайдені.");
        return;
    }

    // Очищаємо шар перед малюванням (про всяк випадок)
    window.markersLayer.clearLayers();

    fetch("https://n8n.narodocnt.online/webhook/get-ranking")
        .then(res => res.json())
        .then(rawData => {
            const db = window.collectivesDatabase;
            const geoJSON = window.hromadasGeoJSON;
            const resultsMap = {};

            // 1. Обробка даних з n8n
            rawData.forEach(item => {
                const tableText = (item.text || "").toLowerCase();
                const totalScore = (parseInt(item.likes) || 0) + (parseInt(item.comments) || 0) + (parseInt(item.shares) || 0);

                for (let id in db) {
                    const locSearch = db[id].location.toLowerCase().substring(0, 5);
                    if (tableText.includes(locSearch)) {
                        if (!resultsMap[id] || totalScore > resultsMap[id].total) {
                            resultsMap[id] = { ...db[id], total: totalScore, url: item.facebookUrl };
                        }
                    }
                }
            });

            const sorted = Object.values(resultsMap).sort((a, b) => b.total - a.total).slice(0, 6);

            // 2. Малювання маркерів Битви
            sorted.forEach((el, index) => {
                const rank = index + 1;
                // Шукаємо громаду в GeoJSON
                const hromada = geoJSON.features.find(f => 
                    f.name.toLowerCase().includes(el.location.toLowerCase().substring(0, 5))
                );

                if (hromada) {
                    // ТА Ж САМА ФОРМУЛА, що і в колективах
                    const lat = 736 - hromada.y;
                    const lng = hromada.x;
                    
                    const color = rank === 1 ? "#FFD700" : (rank === 2 ? "#C0C0C0" : (rank === 3 ? "#CD7F32" : "#e67e22"));

                    const icon = L.divIcon({
                        className: 'map-rank-marker',
                        html: `<div style="background:${color}; width:32px; height:32px; border-radius:50%; border:2px solid white; color:black; display:flex; align-items:center; justify-content:center; font-weight:900; box-shadow:0 2px 8px rgba(0,0,0,0.4); font-size:14px; cursor:pointer;">${rank}</div>`,
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    });

                    // Додаємо маркер саме у window.markersLayer
                    L.marker([lat, lng], { icon: icon })
                        .addTo(window.markersLayer)
                        .bindPopup(`
                            <div style="min-width:180px; text-align:center;">
                                <b style="color:${color}; font-size:16px;">🏆 РЕЙТИНГ: №${rank}</b><br>
                                <strong style="font-size:14px;">${el.name}</strong><br>
                                <div style="margin:8px 0; background:#fdf7f2; padding:5px; font-weight:bold; border-radius:4px;">Балів: ${el.total}</div>
                                <a href="${el.url}" target="_blank" style="display:block; background:#e67e22; color:white; padding:10px; border-radius:5px; text-decoration:none; font-weight:bold; font-size:10px; text-transform:uppercase;">Голосувати</a>
                            </div>
                        `);
                }
            });
            console.log("✅ Маркери Битви успішно додані.");
        })
        .catch(err => console.error("Помилка Битви:", err));
};
