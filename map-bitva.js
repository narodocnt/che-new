var map;
var markersLayer;
var currentBattleData = {};

// 1. Функція ініціалізації карти з перевіркою
function initMap() {
    if (map) return; // Якщо карта вже створена, нічого не робимо
    
    map = L.map('map', { crs: L.CRS.Simple, minZoom: -1, maxZoom: 2 });
    var bounds = [[0, 0], [736, 900]];
    L.imageOverlay('map.jpg', bounds).addTo(map);
    map.fitBounds(bounds);
    markersLayer = L.layerGroup().addTo(map);
    console.log("✅ Карта ініціалізована");
}

// 2. Функція завантаження Битви
async function loadBattleRanking() {
    var N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    console.log("--- СТАРТ ЗАВАНТАЖЕННЯ БИТВИ ---");
    
    try {
        var response = await fetch(N8N_URL);
        var rawData = await response.json();
        console.log("Отримано записів:", rawData.length);
        
        var groups = {};

        rawData.forEach(function(item) {
            // ПЕРЕВІРКА ВСІХ МОЖЛИВИХ ПОЛІВ ТЕКСТУ (pageName, text, caption)
            var fullText = (item.pageName || item.text || item.caption || "").trim();
            
            // Якщо текст все одно порожній, спробуємо подивитися на структуру об'єкта
            if (!fullText) return;

            var key = "";
            var t = fullText.toLowerCase();
            
            if (t.includes("сміл") || t.includes("божидар")) key = "смілянська";
            else if (t.includes("тальн") || t.includes("сурми")) key = "тальнівська";
            else if (t.includes("кам")) key = "кам’янська";
            else if (t.includes("христин")) key = "христинівська";
            else if (t.includes("золотоніс") || t.includes("водограй")) key = "золотоніська";
            else if (t.includes("звенигород") || t.includes("дзет")) key = "звенигородська";

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

        var sorted = Object.keys(groups).sort(function(a, b) { return groups[b].score - groups[a].score; });
        sorted.forEach(function(k, index) { groups[k].rank = index + 1; });
        
        currentBattleData = groups;
        console.log("Підсумкові дані для Битви:", currentBattleData);
        renderMarkers('battle');
    } catch (e) {
        console.error("⛔️ Помилка Битви:", e);
    }
}

// 3. Функція малювання маркерів
function renderMarkers(mode) {
    if (!markersLayer) return;
    markersLayer.clearLayers();
    
    if (typeof hromadasGeoJSON === 'undefined') {
        console.error("Помилка: hromadasGeoJSON не знайдено!");
        return;
    }

    hromadasGeoJSON.features.forEach(function(h) {
        var gName = h.name.trim().toLowerCase();
        var show = false, label = "", content = `<h3>${h.name}</h3>`;

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

// 4. Глобальна функція для HTML кнопок
window.setMapMode = function(mode) {
    console.log("Зміна режиму на:", mode);
    if (mode === 'battle') {
        loadBattleRanking();
    } else {
        renderMarkers('collectives');
    }
};

// 5. Запуск при завантаженні (один раз)
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    renderMarkers('collectives');
    // Якщо хочеш автоматично завантажувати битву:
    // loadBattleRanking(); 
});
