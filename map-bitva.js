var map;
var markersLayer;
var currentBattleData = {};

function initMap() {
    // Перевірка: якщо карта вже є — не створюємо її знову
    if (map) return; 

    var mapW = 900;
    var mapH = 736;
    map = L.map('map', { crs: L.CRS.Simple, minZoom: -1, maxZoom: 2 });
    var bounds = [[0, 0], [mapH, mapW]];
    L.imageOverlay('map.jpg', bounds).addTo(map);
    map.fitBounds(bounds);
    markersLayer = L.layerGroup().addTo(map);
}

async function loadBattleRanking() {
    var N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    console.log("--- СТАРТ ЗАВАНТАЖЕННЯ БИТВИ ---");
    
    try {
        var response = await fetch(N8N_URL);
        var rawData = await response.json();
        var groups = {};

        rawData.forEach(function(item) {
            // ПЕРЕВІРКА ВСІХ МОЖЛИВИХ ПОЛІВ ТЕКСТУ
            var fullText = (item.pageName || item.text || item.caption || "").trim();
            
            if (!fullText) return;

            var key = "";
            var t = fullText.toLowerCase();
            
            // Спрощена логіка пошуку ключа
            if (t.includes("сміл") || t.includes("божидар")) key = "смілянська";
            else if (t.includes("тальн") || t.includes("сурми")) key = "тальнівська";
            else if (t.includes("кам")) key = "кам’янська";
            else if (t.includes("христин")) key = "христинівська";
            else if (t.includes("золотоніс") || t.includes("водограй")) key = "золотоніська";
            else if (t.includes("звенигород") || t.includes("дзет")) key = "звенигородська";

            if (key) {
                var total = (parseInt(item.likes) || 0) + (parseInt(item.shares) || 0) + (parseInt(item.comments) || 0);
                if (!groups[key] || total > groups[key].score) {
                    var collective = fullText.includes("Назва Колективу:") ? fullText.split("Назва Колективу:")[1].split("\n")[0].trim() : fullText.split("\n")[0].trim();
                    var leader = fullText.includes("Керівник:") ? fullText.split("Керівник:")[1].split("\n")[0].trim() : "Не вказано";

                    groups[key] = {
                        name: collective.replace(/[#*]/g, ""),
                        leader: leader.replace(/[#*]/g, ""),
                        score: total,
                        url: item.url
                    };
                }
            }
        });

        var sorted = Object.keys(groups).map(k => ({ key: k, score: groups[k].score })).sort((a, b) => b.score - a.score);
        sorted.forEach((item, index) => { groups[item.key].rank = index + 1; });
        currentBattleData = groups;
        
        renderMarkers('battle');
    } catch (e) { console.error("Помилка:", e); }
}

function renderMarkers(mode) {
    if (!markersLayer) return;
    markersLayer.clearLayers();
    
    hromadasGeoJSON.features.forEach(function(h) {
        var gName = h.name.trim().toLowerCase();
        var show = false, label = "", content = `<h3>${h.name}</h3><hr>`;

        if (mode === 'collectives') {
            var list = collectivesList[gName] || [];
            if (list.length > 0) { label = list.length; content += list.join('<br>'); show = true; }
        } else {
            var key = "";
            if (gName.includes("сміл")) key = "смілянська";
            else if (gName.includes("звенигород")) key = "звенигородська";
            else if (gName.includes("кам")) key = "кам’янська";
            else if (gName.includes("тальн")) key = "тальнівська";
            else if (gName.includes("христин")) key = "христинівська";
            else if (gName.includes("золотоніс")) key = "золотоніська";

            var b = currentBattleData[key];
            if (b) {
                label = b.rank;
                content += `<p>🏆 Місце: №${b.rank}</p><p><b>${b.name}</b></p><p>Керівник: ${b.leader}</p><p>Балів: ${b.score}</p>`;
                show = true;
            }
        }
        if (show) {
            var icon = L.divIcon({ className: 'count-icon', html: `<span>${label}</span>`, iconSize: [30, 30] });
            L.marker([736 - h.y, h.x], { icon: icon }).bindPopup(content).addTo(markersLayer);
        }
    });
}

// ПРИВ'ЯЗУЄМО ФУНКЦІЮ ДО WINDOW, ЩОБ HTML ЇЇ БАЧИВ
window.setMapMode = function(mode) {
    if (mode === 'battle') loadBattleRanking();
    else renderMarkers('collectives');
};

// ЗАПУСК
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    setMapMode('collectives');
});
