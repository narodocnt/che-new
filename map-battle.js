/**
 * map-battle.js
 * Логіка виведення статистики "Битви вподобайків"
 */
/**
 * map-battle.js
 */
const battleData = {
    title: "Битва вподобайків 🏆",
    leaders: [
        { name: "Кам’янська", votes: 1250, color: "#f1c40f" },
        { name: "Смілянська", votes: 1120, color: "#e67e22" },
        { name: "Уманська", votes: 980, color: "#e74c3c" }
        // Додайте решту 3 колективів сюди точно за назвами з hromadas-data.js
    ]
};

// Функція, яку викликає кнопка з HTML
function renderBattleMarkers() {
    battleData.leaders.forEach((leader, index) => {
        // Шукаємо координати громади в hromadasGeoJSON
        const hromada = hromadasGeoJSON.features.find(h => h.name.trim() === leader.name);
        
        if (hromada) {
            const battleIcon = L.divIcon({
                className: 'count-icon',
                html: index + 1, // Номер рейтингу
                iconSize: [30, 30]
            });

            // Стилізуємо іконку прямо тут, щоб вона відрізнялася (золота для лідерів)
            battleIcon.options.className += ' battle-marker'; 

            const marker = L.marker([mapH - hromada.y, hromada.x], { icon: battleIcon });
            marker.bindPopup(`
                <div style="text-align:center;">
                    <b style="font-size:14px;">${leader.name}</b><br>
                    <span style="color:#e67e22; font-weight:bold;">🏆 Місце №${index + 1}</span><hr>
                    Голосів: <b>${leader.votes}</b>
                </div>
            `);
            markersLayer.addLayer(marker);
        }
    });
    
    // Також можна вивести бічну панель, якщо потрібно
    showBattlePanel();
}

function showBattlePanel() {
    // Якщо панель вже є — видаляємо
    const oldPanel = document.querySelector('.battle-info-panel');
    if (oldPanel) oldPanel.remove();

    const div = document.createElement('div');
    div.className = 'battle-info-panel';
    div.style = "position:absolute; bottom:20px; right:20px; background:white; padding:15px; border-radius:10px; z-index:1000; box-shadow:0 0 10px rgba(0,0,0,0.5);";
    
    let html = `<h4 style="margin:0 0 10px 0;">${battleData.title}</h4>`;
    battleData.leaders.forEach((l, i) => {
        html += `<div style="font-size:12px;">${i+1}. ${l.name}: <b>${l.votes}</b></div>`;
    });
    
    div.innerHTML = html;
    document.body.appendChild(div);
}

// При зміні режиму на "колективи", видаляємо панель
document.getElementById('btn-col').addEventListener('click', () => {
    const panel = document.querySelector('.battle-info-panel');
    if (panel) panel.remove();
});
const battleStats = {
    enabled: true,
    title: "Битва вподобайків 🏆",
    // Тут ви можете оновлювати дані
    leaders: [
        { name: "Кам’янська громада", votes: 1250, color: "#f1c40f" },
        { name: "Смілянська громада", votes: 1120, color: "#e67e22" },
        { name: "Уманська громада", votes: 980, color: "#e74c3c" }
    ]
};

// Додаємо панель статистики на мапу
const infoPanel = L.control({ position: 'topright' });

infoPanel.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'battle-info');
    div.style.background = 'white';
    div.style.padding = '15px';
    div.style.borderRadius = '8px';
    div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
    div.style.fontFamily = 'Arial, sans-serif';
    
    let content = `<h4 style="margin: 0 0 10px 0; text-align: center;">${battleStats.title}</h4>`;
    
    battleStats.leaders.forEach((item, index) => {
        content += `
            <div style="margin-bottom: 8px;">
                <span style="font-weight: bold;">${index + 1}. ${item.name}</span>
                <div style="background: #eee; border-radius: 4px; height: 10px; width: 150px; margin-top: 3px;">
                    <div style="background: ${item.color}; height: 100%; border-radius: 4px; width: ${(item.votes / 1500) * 100}%"></div>
                </div>
                <small>Голосів: ${item.votes}</small>
            </div>`;
    });
    
    div.innerHTML = content;
    return div;
};

// Додаємо панель до існуючої мапи
infoPanel.addTo(map);
