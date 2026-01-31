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
            var t = fullText.toLowerCase(); // Використовуємо t для пошуку
            
            // ПРИВ'ЯЗКА ГРОМАД ДО ТЕКСТУ
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
                    var lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 2);
                    
                    var nameMatch = fullText.match(/«([^»]+)»/g);
                    var collectiveName = (nameMatch && nameMatch.length > 1) 
                        ? nameMatch[1].replace(/[«»]/g, "") 
                        : (lines[1] || "Колектив");

                    var leaderName = "Не вказано";
                    lines.forEach(line => {
                        if (line.toLowerCase().includes("керівник")) {
                            leaderName = line.split(/[—:-]/).pop().trim();
                        }
                    });

                    groups[key] = {
                        name: collectiveName, 
                        leader: leaderName,
                        score: total,
                        url: item.facebookUrl || item.url,
                        media: item.media || 'narodocnt.jpg'
                    };
                }
            }
        });

        var sortedKeys = Object.keys(groups).sort((a, b) => groups[b].score - groups[a].score);
        sortedKeys.forEach((k, index) => { groups[k].rank = index + 1; });
        
        currentBattleData = groups;
        renderMarkers('battle');
        
        // Передаємо дані в contest.js
        if (typeof renderList === 'function') {
            window.currentData = Object.values(groups).sort((a,b) => b.score - a.score);
            renderList();
        }
    } catch (e) { 
        console.error("Помилка завантаження битви:", e); 
    }
}

function renderMarkers(mode) {
    if (!markersLayer) return;
    markersLayer.clearLayers();
    if (typeof hromadasGeoJSON === 'undefined') return;

    hromadasGeoJSON.features.forEach(function(h) {
        var gName = h.name.trim().toLowerCase(); // Тут gName працює, бо ми в циклі карти
        var key = "";
        
        if (gName.includes("сміл")) key = "смілянська";
        else if (gName.includes("звениг")) key = "звенигородська";
        else if (gName.includes("кам")) key = "кам’янська";
        else if (gName.includes("тальн")) key = "тальнівська";
        else if (gName.includes("христин")) key = "христинівська";
        else if (gName.includes("золот")) key = "золотоніська";
        else if (gName.includes("чорноб")) key = "чорнобаївська";

        var show = false, label = "", content = `<h3>${h.name}</h3>`;

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
                            <a href="${d.url}" target="_blank" style="color:red; font-weight:bold;">Голосувати</a>`;
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

document.addEventListener('DOMContentLoaded', function() {
    initMap();
    renderMarkers('collectives');
    loadBattleRanking();
});
