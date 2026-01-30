var mapW = 900;
var mapH = 736;
var map = L.map('map', { crs: L.CRS.Simple, minZoom: -1, maxZoom: 2 });
var bounds = [[0, 0], [mapH, mapW]];
L.imageOverlay('map.jpg', bounds).addTo(map);
map.fitBounds(bounds);

var markersLayer = L.layerGroup().addTo(map);
var currentBattleData = {};

async function loadBattleRanking() {
    var N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    console.log("--- СТАРТ ЗАВАНТАЖЕННЯ БИТВИ ---");
    
    try {
        var response = await fetch(N8N_URL);
        var rawData = await response.json();
        
        console.log("Дані з сервера отримано. Кількість записів:", rawData.length);
        
        var groups = {};

        rawData.forEach(function(item, index) {
            var fullText = (item.pageName || "").trim();
            
            // Перевірка 1: Чи не порожній текст
            if (!fullText) {
                console.warn("Запис #" + index + " порожній, пропускаю.");
                return;
            }

            // Перевірка 2: Визначення громади
            var key = "";
            var t = fullText.toLowerCase();
            
            if (t.includes("сміл")) key = "смілянська";
            else if (t.includes("тальн")) key = "тальнівська";
            else if (t.includes("кам")) key = "кам’янська";
            else if (t.includes("христин")) key = "христинівська";
            else if (t.includes("золотоніс")) key = "золотоніська";
            else if (t.includes("звенигород")) key = "звенигородська";

            if (!key) {
                console.log("❌ Не знайдено громаду в тексті: " + fullText.substring(0, 30) + "...");
                return;
            }

            console.log("✅ Знайдено громаду: " + key);

            var total = (parseInt(item.likes) || 0) + (parseInt(item.shares) || 0) + (parseInt(item.comments) || 0);

            if (!groups[key] || total > groups[key].score) {
                var collective = fullText.includes("Назва Колективу:") ? 
                    fullText.split("Назва Колективу:")[1].split("\n")[0].trim() : 
                    fullText.split("\n")[0].trim();
                
                var leader = fullText.includes("Керівник:") ? 
                    fullText.split("Керівник:")[1].split("\n")[0].trim() : 
                    "Не вказано";

                groups[key] = {
                    name: collective.replace(/[#*]/g, ""),
                    leader: leader.replace(/[#*]/g, ""),
                    score: total,
                    url: item.url
                };
            }
        });

        // Сортування для рейтингу
        var sorted = Object.keys(groups).map(k => ({ key: k, score: groups[k].score })).sort((a, b) => b.score - a.score);
        sorted.forEach((item, index) => { 
            groups[item.key].rank = index + 1; 
        });

        currentBattleData = groups;
        console.log("Підсумкові дані для карти:", currentBattleData);
        
        renderMarkers('battle');

    } catch (e) {
        console.error("⛔️ КРИТИЧНА ПОМИЛКА КАРТИ:", e);
    }
}

function renderMarkers(mode) {
    console.log("Малюю маркери для режиму: " + mode);
    markersLayer.clearLayers();
    
    if (!hromadasGeoJSON || !hromadasGeoJSON.features) {
        console.error("Помилка: hromadasGeoJSON не знайдено!");
        return;
    }

    var count = 0;
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
                count++;
            }
        }
        
        if (show) {
            var icon = L.divIcon({ className: 'count-icon', html: `<span>${label}</span>`, iconSize: [30, 30] });
            L.marker([mapH - h.y, h.x], { icon: icon }).bindPopup(content).addTo(markersLayer);
        }
    });
    console.log("Виведено маркерів на карту: " + count);
}

// Запуск при завантаженні сторінки
document.addEventListener('DOMContentLoaded', function() {
    loadBattleRanking();
});
