// Глобальні змінні
var map;
var markersLayer;
window.currentData = [];
var currentBattleData = {};

// 1. Ініціалізація карти
function initMap() {
    if (map) return;
    try {
        map = L.map('map', { crs: L.CRS.Simple, minZoom: -1, maxZoom: 2 });
        var bounds = [[0, 0], [736, 900]];
        L.imageOverlay('map.jpg', bounds).addTo(map);
        map.fitBounds(bounds);
        markersLayer = L.layerGroup().addTo(map);
        console.log("Карта ініціалізована");
    } catch (e) {
        console.error("Помилка карти:", e);
    }
}

// 2. Функція для зірочки (toggleRules)
window.toggleRules = function(e) {
    if (e) e.stopPropagation();
    var box = document.getElementById('rating-rules-popup');
    if (!box) {
        box = document.createElement('div');
        box.id = 'rating-rules-popup';
        box.style.cssText = "position:absolute; background:#fff; border:2px solid #f1c40f; padding:15px; border-radius:10px; box-shadow:0 10px 25px rgba(0,0,0,0.2); z-index:9999; width:220px; font-size:14px; color:#333; display:none;";
        box.innerHTML = "<b>📏 Правила рейтингу</b><br>👍 Лайк — 1 бал<br>💬 Коментар — 1 бал<br>🔄 Репост — 1 бал";
        document.body.appendChild(box);
    }
    var isVisible = box.style.display === 'block';
    box.style.display = isVisible ? 'none' : 'block';
    if (e && !isVisible) {
        box.style.left = (e.pageX + 10) + 'px';
        box.style.top = (e.pageY + 10) + 'px';
    }
};

// 3. Завантаження даних
async function loadBattleRanking() {
    console.log("Починаю завантаження даних...");
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
                    var nameLine = lines.find(l => l.includes('«') && !l.toLowerCase().includes("фестиваль"));
                    var collectiveName = nameLine ? (nameLine.match(/«([^»]+)»/) ? nameLine.match(/«([^»]+)»/)[1] : nameLine) : (lines[1] || "Колектив");

                    groups[key] = {
                        name: collectiveName,
                        score: total,
                        url: item.facebookUrl || item.url,
                        leader: "Вказано у пості",
                        media: item.media || 'narodocnt.jpg'
                    };
                }
            }
        });

        window.currentData = Object.values(groups).sort((a, b) => b.score - a.score);
        window.currentData.forEach((item, index) => { item.rank = index + 1; });
        
        // Оновлюємо currentBattleData для карти
        currentBattleData = groups;

        console.log("Дані успішно оброблені:", window.currentData);
        renderList();
        renderMarkers('battle');
    } catch (e) {
        console.error("Помилка завантаження:", e);
    }
}

// 4. Рендер списку
function renderList() {
    var list = document.getElementById('rankingList');
    if (!list) return;
    list.innerHTML = '';
    window.currentData.forEach(function(item, index) {
        var medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1);
        list.innerHTML += `<div class="rank-card">
            <div class="medal">${medal}</div>
            <div class="rank-details">
                <b>${item.name}</b><br>
                <small>${item.score} балів</small>
            </div>
            <a href="${item.url}" target="_blank" class="btn-watch">Голосувати</a>
        </div>`;
    });
}

// 5. Маркери
function renderMarkers(mode) {
    if (!markersLayer || typeof hromadasGeoJSON === 'undefined') return;
    markersLayer.clearLayers();
    
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

        if (currentBattleData[key]) {
            var d = currentBattleData[key];
            var icon = L.divIcon({ className: 'count-icon', html: `<span>${d.rank}</span>`, iconSize: [30, 30] });
            L.marker([736 - h.y, h.x], { icon: icon }).bindPopup(`<b>${d.name}</b><br>Місце: ${d.rank}`).addTo(markersLayer);
        }
    });
}

// Запуск
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    loadBattleRanking();
});
