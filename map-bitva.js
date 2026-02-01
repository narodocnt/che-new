/**
 * map-bitva.js - Тільки логіка даних та карти
 */
var map;
var markersLayer;
window.currentData = []; 
var currentBattleData = {};

function initMap() {
    if (map) return;
    try {
        map = L.map('map', { crs: L.CRS.Simple, minZoom: -1, maxZoom: 2 });
        var bounds = [[0, 0], [736, 900]];
        L.imageOverlay('map.jpg', bounds).addTo(map);
        map.fitBounds(bounds);
        markersLayer = L.layerGroup().addTo(map);
        console.log("Карта завантажена");
    } catch (e) { console.error("Помилка карти:", e); }
}

async function loadBattleRanking() {
    var N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    try {
        var response = await fetch(N8N_URL);
        var rawData = await response.json();
        var processedItems = [];
        currentBattleData = {}; // Скидаємо перед оновленням

        rawData.forEach(function(item) {
            var fullText = (item.message || item.text || "").trim();
            if (!fullText || fullText.length < 10) return;

            var t = fullText.toLowerCase();
            var lines = fullText.split('\n').map(function(l) { return l.trim(); });

            var key = "";
            if (t.includes("чорноб") || t.includes("водогр")) key = "чорнобаївська";
            else if (t.includes("сміл")) key = "смілянська";
            else if (t.includes("золот")) key = "золотоніська";
            else if (t.includes("звениг")) key = "звенигородська";
            else if (t.includes("кам")) key = "кам’янська";
            else if (t.includes("тальн")) key = "тальнівська";
            else if (t.includes("христин")) key = "христинівська";

            var collectiveName = "Учасник";
            for (var i = 0; i < lines.length; i++) {
                if (lines[i].includes('«') && !lines[i].toLowerCase().includes("варта") && !lines[i].toLowerCase().includes("фестиваль")) {
                    var match = lines[i].match(/«([^»]+)»/);
                    collectiveName = match ? match[1] : lines[i];
                    break; 
                }
            }

            var leader = "Не вказано";
            lines.forEach(function(l) {
                if (l.toLowerCase().includes("керівник")) {
                    leader = l.split(/[—:-]/).pop().trim();
                }
            });

            var score = (parseInt(item.likes) || 0) + (parseInt(item.shares) || 0) + (parseInt(item.comments) || 0);
            
            var entry = {
                name: collectiveName,
                score: score,
                url: item.facebookUrl || item.url || "#",
                media: item.media || 'narodocnt.jpg',
                leader: leader,
                hromada: key
            };

            processedItems.push(entry);

            if (key) {
                if (!currentBattleData[key] || score > currentBattleData[key].score) {
                    currentBattleData[key] = entry;
                }
            }
        });

        processedItems.sort(function(a, b) { return b.score - a.score; });
        window.currentData = processedItems;

        if (typeof renderList === 'function') renderList();
        renderMarkers('battle');

    } catch (e) { console.error("Помилка:", e); }
}

function renderMarkers(mode) {
    if (!markersLayer) return;
    markersLayer.clearLayers();
    // ... (код маркерів залишається без змін)
    hromadasGeoJSON.features.forEach(function(h) {
        var gName = h.name.trim().toLowerCase();
        var key = "";
        if (gName.includes("сміл")) key = "смілянська";
        else if (gName.includes("звениг")) key = "звенигородська";
        else if (gName.includes("кам")) key = "кам’янська";
        else if (gName.includes("тальн")) key = "тальнівська";
        else if (gName.includes("христин")) key = "христинівська";
        else if (gName.includes("золот")) key = "золотоніська";
        else if (gName.includes("чорноб")) key = "чорнобаївська";

        if (mode === 'battle' && currentBattleData[key]) {
            var d = currentBattleData[key];
            var icon = L.divIcon({ className: 'count-icon', html: '<span>!</span>', iconSize: [30, 30] });
            L.marker([736 - h.y, h.x], { icon: icon }).bindPopup('<b>' + d.name + '</b><br>Балів: ' + d.score).addTo(markersLayer);
        }
    });
}

window.setMapMode = function(mode) {
    if (mode === 'battle') loadBattleRanking();
    else renderMarkers('collectives');
};

document.addEventListener('DOMContentLoaded', function() {
    initMap();
    loadBattleRanking();
});
