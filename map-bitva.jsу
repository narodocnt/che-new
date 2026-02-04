/**
 * bitva-map.js - Фінальна стабільна версія
 */
window.renderBitvaMode = function() {
    console.log("⚔️ Запуск режиму Битви...");

    // 1. Автоматичний пошук справжнього об'єкта карти
    let realMap = null;
    if (window.map && window.map instanceof L.Map) {
        realMap = window.map;
    } else {
        // Шукаємо серед усіх глобальних змінних ту, що є картою
        for (let key in window) {
            try {
                if (window[key] instanceof L.Map) {
                    realMap = window[key];
                    console.log("📍 Знайдено карту під назвою:", key);
                    break;
                }
            } catch(e) {}
        }
    }

    if (!realMap) {
        console.error("❌ Помилка: Об'єкт карти Leaflet не знайдено.");
        return;
    }

    // 2. Визначаємо шар для маркерів (щоб не видалити саму карту-картинку)
    let targetLayer = window.mainLayerGroup || window.layerGroup || realMap;

    // Очищаємо лише маркери, якщо це група шарів
    if (targetLayer !== realMap && targetLayer.clearLayers) {
        targetLayer.clearLayers();
    }

    // 3. Завантажуємо дані
    fetch("https://n8n.narodocnt.online/webhook/get-ranking")
        .then(res => res.json())
        .then(rawData => {
            const db = window.collectivesDatabase;
            const geoJSON = window.hromadasGeoJSON;
            const resultsMap = {};

            if (!db || !geoJSON) return;

            // Логіка рейтингу
            rawData.forEach(item => {
                const tableText = (item.text || "").toLowerCase();
                const totalScore = (parseInt(item.likes) || 0) + (parseInt(item.comments) || 0) + (parseInt(item.shares) || 0);
                
                for (let id in db) {
                    if (tableText.includes(db[id].location.toLowerCase().substring(0, 5))) {
                        if (!resultsMap[id] || totalScore > resultsMap[id].total) {
                            resultsMap[id] = { ...db[id], total: totalScore, url: item.facebookUrl };
                        }
                    }
                }
            });

            const sorted = Object.values(resultsMap).sort((a, b) => b.total - a.total);

            // 4. Малюємо 6 кружечків
            sorted.forEach((el, index) => {
                const rank = index + 1;
                const hromada = geoJSON.features.find(f => f.name.toLowerCase().includes(el.location.toLowerCase().substring(0, 5)));

                if (hromada) {
                    // Твоя формула: Y віднімаємо від висоти картинки (736)
                    const lat = 736 - hromada.y;
                    const lng = hromada.x;
                    const color = rank === 1 ? "#FFD700" : (rank === 2 ? "#C0C0C0" : (rank === 3 ? "#CD7F32" : "#e67e22"));

                    const icon = L.divIcon({
                        className: 'map-rank-marker',
                        html: `<div style="background:${color}; width:32px; height:32px; border-radius:50%; border:2px solid white; color:black; display:flex; align-items:center; justify-content:center; font-weight:900; box-shadow:0 2px 8px rgba(0,0,0,0.4); font-size:14px; cursor:pointer;">${rank}</div>`,
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    });

                    const marker = L.marker([lat, lng], { icon: icon });
                    
                    marker.bindPopup(`
                        <div style="min-width:180px; text-align:center;">
                            <b style="color:${color}; font-size:16px;">🏆 №${rank}</b><br>
                            <strong style="font-size:14px;">${el.name}</strong><br>
                            <div style="margin:8px 0; background:#fdf7f2; padding:5px; font-weight:bold;">Балів: ${el.total}</div>
                            <a href="${el.url}" target="_blank" style="display:block; background:#e67e22; color:white; padding:10px; border-radius:5px; text-decoration:none; font-weight:bold; font-size:10px; text-transform:uppercase;">Голосувати</a>
                        </div>
                    `);

                    marker.addTo(targetLayer);
                }
            });
        })
        .catch(err => console.error("Помилка Битви:", err));
};
