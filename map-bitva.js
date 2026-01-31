var map;
var markersLayer;
var currentBattleData = {};

function initMap() {
    if (map) return; 
    map = L.map('map', { crs: L.CRS.Simple, minZoom: -1, maxZoom: 2 });
    var bounds = [[0, 0], [736, 900]];
    L.imageOverlay('map.jpg', bounds).addTo(map);
    map.fitBounds(bounds);
    markersLayer = L.layerGroup().addTo(map);
}

async function loadBattleRanking() {
    var N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    try {
        var response = await fetch(N8N_URL);
        var rawData = await response.json();
        var groups = {};

        rawData.forEach(function(item) {
    var fullText = (item.message || item.text || item.pageName || "").trim();
    if (!fullText) return;

    var key = "";
    var t = fullText.toLowerCase();
    
    // ПРИВ'ЯЗКА ГРОМАД
    if (t.includes("сміл")) key = "смілянська";
    else if (t.includes("тальн")) key = "тальнівська";
    else if (t.includes("кам")) key = "кам’янська";
    else if (t.includes("христин")) key = "христинівська";
    else if (t.includes("золот")) key = "золотоніська";
    else if (t.includes("чорноб") || t.includes("водогр")) key = "чорнобаївська"; 
    else if (t.includes("звениг")) key = "звенигородська";

    if (key) {
        var total = (parseInt(item.likes) || 0) + (parseInt(item.shares) || 0) + (parseInt(item.comments) || 0);
        
        if (!groups[key] || total > groups[key].score) {
            // РОЗБИВАЄМО НА РЯДКИ ТА ЧИСТИМО ПОРОЖНІ
            var lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 2);
            
            // ЛОГІКА ПОШУКУ НАЗВИ:
            // Шукаємо рядок, де є «лапки», але НЕМАЄ слова "фестиваль"
            var collectiveName = "Колектив";
            var nameLine = lines.find(l => l.includes('«') && !l.toLowerCase().includes("фестиваль"));
            
            if (nameLine) {
                // Витягуємо текст між «»
                var match = nameLine.match(/«([^»]+)»/);
                collectiveName = match ? match[1] : nameLine;
            } else {
                // Якщо лапок немає, беремо перший рядок, який не про фестиваль і не вступ
                collectiveName = lines.find(l => l.length > 10 && !l.toLowerCase().includes("фестиваль")) || "Учасник";
            }

            // ЛОГІКА ПОШУКУ КЕРІВНИКА:
            var leaderName = "Не вказано";
            var leaderLine = lines.find(l => l.toLowerCase().includes("керівник"));
            if (leaderLine) {
                leaderName = leaderLine.split(/[—:-]/).pop().trim();
            }

            groups[key] = {
                name: collectiveName.substring(0, 70), // Обмежуємо довжину
                leader: leaderName,
                score: total,
                url: item.facebookUrl || item.url,
                media: item.media || 'narodocnt.jpg'
            };
        }
    }
});

        var sorted = Object.keys(groups).sort(function(a, b) { return groups[b].score - groups[a].score; });
        sorted.forEach(function(k, index) { groups[k].rank = index + 1; });
        
        currentBattleData = groups;
        
        // ВАЖЛИВО: Оновлюємо відображення, якщо ми в режимі битви
        renderMarkers('battle');
        
        // Оновлюємо список у contest.js, якщо функція існує
        if (typeof renderList === 'function') {
            window.currentData = Object.values(groups).sort((a,b) => b.score - a.score);
            renderList();
        }

    } catch (e) { console.error("Помилка завантаження битви:", e); }
}

function renderMarkers(mode) {
    if (!markersLayer) return;
    markersLayer.clearLayers();
    
    if (typeof hromadasGeoJSON === 'undefined') return;

    hromadasGeoJSON.features.forEach(function(h) {
        var gName = h.name.trim().toLowerCase();
        var show = false, label = "", content = `<h3>${h.name}</h3>`;

        // Визначаємо ключ для порівняння
        var key = "";
        if (gName.includes("сміл")) key = "смілянська";
        else if (gName.includes("звениг")) key = "звенигородська";
        else if (gName.includes("кам")) key = "кам’янська";
        else if (gName.includes("тальн")) key = "тальнівська";
        else if (gName.includes("христин")) key = "христинівська";
        else if (gName.includes("золот")) key = "золотоніська";

        if (mode === 'collectives') {
            var list = (typeof collectivesList !== 'undefined' && collectivesList[gName]) || [];
            if (list.length > 0) {
                label = list.length;
                content += list.join('<br>');
                show = true;
            }
        } else {
            if (currentBattleData[key]) {
                var d = currentBattleData[key];
                label = d.rank;
                content += `<p style="color:orange;font-weight:bold;">🏆 Місце: №${d.rank}</p>
                            <p><b>${d.name}</b></p>
                            <p>Балів: ${d.score}</p>
                            <a href="${d.url}" target="_blank" style="color:red;">Голосувати</a>`;
                show = true;
            }
        }

        if (show) {
            var icon = L.divIcon({ className: 'count-icon', html: `<span>${label}</span>`, iconSize: [30, 30] });
            L.marker([736 - h.y, h.x], { icon: icon }).bindPopup(content).addTo(markersLayer);
        }
    });
}

window.setMapMode = function(mode) {
    if (mode === 'battle') loadBattleRanking();
    else renderMarkers('collectives');
};

// АВТОЗАПУСК: спочатку карта, потім завантаження битви
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    renderMarkers('collectives'); // Спочатку показуємо цифри колективів
    loadBattleRanking(); // У фоні завантажуємо битву
});
