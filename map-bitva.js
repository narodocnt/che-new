/**
 * map-bitva.js - Повна версія: Карта + Кнопки + Битва
 */
let map;
window.markersLayer = L.layerGroup(); 

document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // 1. Створення об'єкта карти
    map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -1,
        maxZoom: 2,
        zoomSnap: 0.1
    });

    // 2. Налаштування меж (Висота 736, Ширина 900)
    const bounds = [[0, 0], [736, 900]]; 
    L.imageOverlay('map.jpg', bounds).addTo(map);
    map.fitBounds(bounds);

    // 3. Додавання шару для точок на карту
    window.markersLayer.addTo(map);
    
    // 4. Початковий запуск (показуємо колективи)
    if (typeof updateMode === 'function') {
        updateMode('collectives');
    }
});

// ФУНКЦІЯ ПЕРЕМИКАННЯ РЕЖИМІВ
window.updateMode = function(mode) {
    console.log("🔄 Режим змінено на:", mode);

    const btnCol = document.getElementById('btn-col');
    const btnBat = document.getElementById('btn-bat');

    if (btnCol && btnBat) {
        btnCol.style.background = (mode === 'collectives') ? '#e67e22' : '#2f3640';
        btnBat.style.background = (mode === 'battle') ? '#e67e22' : '#2f3640';
    }

    if (window.markersLayer) {
        window.markersLayer.clearLayers();
    }

    if (mode === 'battle') {
        window.renderBitvaMode(); // Викликаємо функцію Битви
    } else {
        if (typeof window.renderCollectivesMode === 'function') {
            window.renderCollectivesMode(window.markersLayer);
        }
    }
};

// ФУНКЦІЯ МАЛЮВАННЯ БИТВИ (РЕЙТИНГ) З КЕРІВНИКОМ ТА КНОПКОЮ
window.renderBitvaMode = function() {
    console.log("⚔️ Запуск режиму Битви...");

    fetch("https://n8n.narodocnt.online/webhook/get-ranking")
        .then(res => res.json())
        .then(rawData => {
            const db = window.collectivesDatabase;
            const geoJSON = window.hromadasGeoJSON;
            const resultsMap = {};

            if (!db || !geoJSON) return;

          rawData.forEach(item => {
    const tableText = (item.text || "").toLowerCase();
    
    // ПРАВИЛЬНИЙ ПІДРАХУНОК:
    // Ми беремо саме ті назви полів, які приходять від Apify
    const likes = Number(item.likes) || 0;
    const comments = Number(item.commentsCount) || Number(item.comments) || 0; 
    const shares = Number(item.shares) || 0;

    // Рахуємо загальний бал
    const totalScore = likes + comments + shares;

    for (let id in db) {
        const locSearch = db[id].location.toLowerCase().substring(0, 5);
        if (tableText.includes(locSearch)) {
            if (!resultsMap[id] || totalScore > resultsMap[id].total) {
                resultsMap[id] = { 
                    ...db[id], 
                    total: totalScore,
                    likes: likes,       // Тепер ці дані потраплять у ваш Popup
                    comments: comments, // Тепер тут буде реальна цифра (напр. 1 або 3)
                    shares: shares,
                    url: item.facebookUrl,
                    leader: db[id].leader 
                };
            }
        }
    }
});

            const sorted = Object.values(resultsMap).sort((a, b) => b.total - a.total).slice(0, 6);

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
                        html: `<div style="background:${color}; width:32px; height:32px; border-radius:50%; border:2px solid white; color:black; display:flex; align-items:center; justify-content:center; font-weight:900; box-shadow:0 2px 8px rgba(0,0,0,0.4); font-size:14px; cursor:pointer;">${rank}</div>`,
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    });

                    // Оновлений Popup з керівником та кнопкою
                   const popupContent = `
    <div style="min-width:200px; text-align:center; font-family: sans-serif;">
        <div style="color:${color}; font-weight:900; font-size:16px; margin-bottom:5px;">🏆 РЕЙТИНГ №${rank}</div>
        <strong style="font-size:14px; display:block; line-height:1.2; margin-bottom:4px;">${el.name}</strong>
        <div style="font-size:11px; color:#666; margin-bottom:8px;">Керівник: <b>${el.leader || 'Не вказано'}</b></div>
        
        <div style="background:#fdf7f2; padding:8px; border-radius:6px; margin-bottom:10px; border:1px solid #eee; display:flex; justify-content:space-around; align-items:center;">
            <div style="font-size:10px; line-height:1.2;">👍<br><b>${el.likes || 0}</b></div>
            <div style="font-size:10px; line-height:1.2;">💬<br><b>${el.comments || 0}</b></div>
            <div style="font-size:10px; line-height:1.2;">🔄<br><b>${el.shares || 0}</b></div>
        </div>

        <div style="background:#fff4eb; padding:6px; border-radius:6px; margin-bottom:10px; border:1px dashed #e67e22;">
            <span style="font-weight:bold; font-size:14px; color:#333;">${el.total} балів</span>
        </div>
        
        <a href="${el.url}" target="_blank" style="
            display:block; 
            background:#e67e22; 
            color:white; 
            text-decoration:none; 
            padding:10px; 
            border-radius:6px; 
            font-weight:bold; 
            font-size:11px; 
            text-transform:uppercase;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">👍 ГОЛОСУВАТИ НА FACEBOOK</a>
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
