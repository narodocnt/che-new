/**
 * bitva-map.js - Відображення рейтингу на карті у вигляді кружечків
 */
function initBitvaMap(map, clusters) {
    if (!window.collectivesDatabase) return;

    fetch("https://n8n.narodocnt.online/webhook/get-ranking")
        .then(res => res.json())
        .then(rawData => {
            const db = window.collectivesDatabase;
            const resultsMap = {};

            // 1. Обробка даних (так само як у списку)
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

            // 2. Сортуємо, щоб отримати порядкові номери
            const sorted = Object.values(resultsMap).sort((a, b) => b.total - a.total);

            // 3. Малюємо на карті
            sorted.forEach((el, index) => {
                const rank = index + 1;
                // Знаходимо координати громади в основній базі (якщо вони там є)
                // Якщо координати прив'язані до назви громади в Leaflet:
                
                // Створюємо іконку-кружечок з номером
                const color = rank === 1 ? "#FFD700" : (rank === 2 ? "#C0C0C0" : (rank === 3 ? "#CD7F32" : "#e67e22"));
                
                const bitvaIcon = L.divIcon({
                    className: 'bitva-marker',
                    html: `<div class="rank-circle" style="background:${color}">${rank}</div>`,
                    iconSize: [30, 30]
                });

                // Припустимо, у нас є доступ до координат громад через назву
                // Тут логіка пошуку маркера на карті за назвою el.location
                map.eachLayer(layer => {
                    if (layer.options && layer.options.title === el.location) {
                        layer.setIcon(bitvaIcon);
                        
                        // Додаємо табличку (Popup)
                        layer.bindPopup(`
                            <div class="map-bitva-popup">
                                <strong style="color:#e67e22">Мiсце №${rank}</strong>
                                <h3>${el.name}</h3>
                                <p>👤 ${el.leader}</p>
                                <p>📊 Балів: ${el.total}</p>
                                <a href="${el.url}" target="_blank" class="map-vote-btn">ГОЛОСУВАТИ</a>
                            </div>
                        `);
                    }
                });
            });
        });
}
