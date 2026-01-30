var map;
var markersLayer;
var currentBattleData = {};

// 1. Ініціалізація карти (з захистом від повтору)
function initMap() {
    if (map) return; 
    map = L.map('map', { crs: L.CRS.Simple, minZoom: -1, maxZoom: 2 });
    var bounds = [[0, 0], [736, 900]];
    L.imageOverlay('map.jpg', bounds).addTo(map);
    map.fitBounds(bounds);
    markersLayer = L.layerGroup().addTo(map);
}

// 2. Завантаження даних
async function loadBattleRanking() {
    var N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    try {
        var response = await fetch(N8N_URL);
        var rawData = await response.json();
        var groups = {};

        rawData.forEach(function(item) {
            // Беремо будь-яке поле, де може бути текст
            var fullText = (item.pageName || item.text || item.caption || "").trim();
            if (!fullText) return;

            var key = "";
            var t = fullText.toLowerCase();
            
            // Спрощений пошук громади
            if (t.includes("сміл")) key = "смілянська";
            else if (t.includes("тальн")) key = "тальнівська";
            else if (t.includes("кам")) key = "кам’янська";
            else if (t.includes("христин")) key = "христинівська";
            else if (t.includes("золотоніс")) key = "золотоніська";
            else if (t.includes("звенигород")) key = "звенигородська";

            if (key) {
                var total = (parseInt(item.likes) || 0) + (parseInt(item.shares) || 0) + (parseInt(item.comments) || 0);
                if (!groups[key] || total > groups[key].score) {
                    groups[key] = {
                        name: fullText.split("\n")[0].replace(/[#*]/g, "").trim(),
                        score: total,
                        url: item.url
                    };
                }
            }
        });

        // Визначаємо місця
        var sorted = Object.keys(groups).sort((a, b) => groups[b].score - groups[a].score);
        sorted.forEach((k, index) => { groups[k].rank = index + 1; });
        
        currentBattleData = groups;
        renderMarkers('battle');
    } catch (e) { console.error("Помилка даних:", e); }
}

// 3. Малювання маркерів
function renderMarkers(mode) {
    if (!markersLayer) return;
    markersLayer.clearLayers();
    
    // Перевірка наявності hromadasGeoJSON
    if (typeof hromadasGeoJSON === 'undefined') return;

    hromadasGeoJSON.features.forEach(function(h) {
        var gName = h.name.trim().toLowerCase();
        var label = "";
        var content = `<h3>${h.name}</h3>`;
        var show = false;

        if (mode === 'collectives') {
            var list = (typeof collectivesList !== 'undefined' && collectivesList[gName]) || [];
            if (list.length > 0) {
                label = list.length;
                content += list.join('<br>');
                show = true;
            }
        } else {
            var key = "";
            if (gName.includes("сміл")) key = "смілянська";
            else if (gName.includes("звенигород")) key = "звенигородська";
            else if (gName.includes("кам")) key = "кам’янська";
            else if (gName.includes("тальн")) key = "тальнівська";
            else if (gName.includes("христин")) key = "христинівська";
            else if (gName.includes("золотоніс")) key = "золотоніська";

            if (currentBattleData[key]) {
                var d = currentBattleData[key];
                label = d.rank;
                content += `<p>🏆 Місце: №${d.rank}</p><p>Балів: ${d.score}</p>`;
                show = true;
            }
        }

        if (show) {
            var icon = L.divIcon({ className: 'count-icon', html: `<span>${label}</span>`, iconSize: [30, 30] });
            L.marker([736 - h.y, h.x], { icon: icon }).bindPopup(content).addTo(markersLayer);
        }
    });
}

// Глобальна функція для кнопок
window.setMapMode = function(mode) {
    if (mode === 'battle') loadBattleRanking();
    else renderMarkers('collectives');
};

// Автозапуск при завантаженні
initMap();
renderMarkers('collectives');
