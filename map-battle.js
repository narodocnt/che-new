/**
 * map-battle.js
 * Логіка виведення статистики "Битви вподобайків"
 */

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
