/**
 * bitva-map.js - Логіка для кнопки "Битва" на карті
 */
window.renderBitvaMode = function(layerGroup) {
    // 1. ПЕРЕВІРКА: чи готова карта та база даних
    if (!window.hromadasGeoJSON || !window.collectivesDatabase) {
        console.warn("Дані ще завантажуються...");
        return;
    }

    const geoJSON = window.hromadasGeoJSON;
    const db = window.collectivesDatabase;

    // Очищаємо шар від звичайних міток перед малюванням Битви
    layerGroup.clearLayers();

    // 2. ЗАПИТ ДО ТАБЛИЦІ (N8N)
    fetch("https://n8n.narodocnt.online/webhook/get-ranking")
        .then(res => res.json())
        .then(rawData => {
            const resultsMap = {};

            // Розрахунок рейтингу (ідентично ранкінгу)
            rawData.forEach(item => {
                const tableText = (item.text || "").toLowerCase();
                const totalScore = (parseInt(item.likes) || 0) + (parseInt(item.comments) || 0) + (parseInt(item.shares) || 0);

                for (let id in db) {
                    const locRoot = db[id].location.toLowerCase().substring(0, 5);
                    if (tableText.includes(locRoot)) {
                        if (!resultsMap[id] || totalScore > resultsMap[id].total) {
                            resultsMap[id] = { ...db[id], total: totalScore, url: item.facebookUrl };
                        }
                    }
                }
            });

            const sorted = Object.values(resultsMap).sort((a, b) => b.total - a.total);

            // 3. МАЛЮВАННЯ 6 КРУЖЕЧКІВ БИТВИ
            sorted.forEach((el, index) => {
                const rank = index + 1;
                
                // Пошук громади в GeoJSON для отримання координат x, y
                const hromada = geoJSON.features.find(f => 
                    f.name.toLowerCase().includes(el.location.toLowerCase().substring(0, 5))
                );

                if (hromada) {
                    // Твоя робоча формула перерахунку координат
                    const lat = 736 - hromada.y;
                    const lng = hromada.x;

                    // Колір залежно від місця в рейтингу
                    const color = rank === 1 ? "#FFD700" : (rank === 2 ? "#C0C0C0" : (rank === 3 ? "#CD7F32" : "#e67e22"));

                    const icon = L.divIcon({
                        className: 'bitva-marker-icon',
                        html: `<div style="background:${color}; width:32px; height:32px; border-radius:50%; border:2px solid white; color:black; display:flex; align-items:center; justify-content:center; font-weight:900; box-shadow:0 2px 8px rgba(0,0,0,0.4); font-size:14px; cursor:pointer;">${rank}</div>`,
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    });

                    // Popup вікно з точною інформацією
                    const popupContent = `
                        <div style="min-width:200px; font-family: 'Montserrat', sans-serif; padding:5px;">
                            <div style="color:${color}; font-weight:bold; font-size:14px; text-transform:uppercase;">🏆 Місце №${rank}</div>
                            <h3 style="margin:8px 0; font-size:15px; border-bottom:1px solid #eee; padding-bottom:5px;">${el.name}</h3>
                            <p style="margin:4px 0; font-size:12px;"><b>📍 Громада:</b> ${el.location}</p>
                            <p style="margin:4px 0; font-size:12px;"><b>👤 Керівник:</b> ${el.leader}</p>
                            <div style="margin:10px 0; font-weight:bold; font-size:14px; background:#fdf7f2; padding:6px; border-radius:4px; text-align:center;">Балів: ${el.total}</div>
                            <a href="${el.url}" target="_blank" 
                               style="display:block; background:#e67e22; color:white !important; text-align:center; padding:10px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:11px; text-transform:uppercase; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                               Голосувати у Facebook
                            </a>
                        </div>`;

                    L.marker([lat, lng], { icon: icon })
                        .bindPopup(popupContent)
                        .addTo(layerGroup);
                }
            });
            console.log("✅ Карта Битви успішно оновлена");
        })
        .catch(err => {
            console.error("❌ Помилка завантаження Битви:", err);
        });
};
