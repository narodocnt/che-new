/**
 * ПОВНИЙ ОБ'ЄДНАНИЙ КОД (ВЕРСІЯ З VAR)
 * Карта + Рейтинг + Зірочка
 */
var map;
var markersLayer;
window.currentData = []; 
var currentBattleData = {};

// 1. ІНІЦІАЛІЗАЦІЯ КАРТИ
function initMap() {
    if (map) return;
    try {
        map = L.map('map', { crs: L.CRS.Simple, minZoom: -1, maxZoom: 2 });
        var bounds = [[0, 0], [736, 900]];
        L.imageOverlay('map.jpg', bounds).addTo(map);
        map.fitBounds(bounds);
        markersLayer = L.layerGroup().addTo(map);
        console.log("Карта завантажена");
    } catch (e) {
        console.error("Помилка карти:", e);
    }
}

// 2. ЗІРОЧКА (ПРАВИЛА)
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
    var close = function() { box.style.display = 'none'; document.removeEventListener('click', close); };
    if (!isVisible) setTimeout(function() { document.addEventListener('click', close); }, 10);
};

// 3. ЗАВАНТАЖЕННЯ ДАНИХ ТА ПАРСИНГ
async function loadBattleRanking() {
    var listContainer = document.getElementById('rankingList');
    var N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    
    if (listContainer) listContainer.innerHTML = '<p style="text-align:center;">Оновлення битви...</p>';

    try {
        var response = await fetch(N8N_URL);
        var rawData = await response.json();
        var groups = {};
        window.currentData = []; 

        rawData.forEach(function(item) {
            var fullText = (item.message || item.text || "").trim();
            if (!fullText || fullText.length < 10) return;

            var t = fullText.toLowerCase();
            var lines = fullText.split('\n').map(function(l) { return l.trim(); });

            // Визначаємо громаду
            var key = "";
            if (t.includes("чорноб") || t.includes("водогр")) key = "чорнобаївська";
            else if (t.includes("сміл")) key = "смілянська";
            else if (t.includes("золот")) key = "золотоніська";
            else if (t.includes("звениг")) key = "звенигородська";
            else if (t.includes("кам")) key = "кам’янська";
            else if (t.includes("тальн")) key = "тальнівська";
            else if (t.includes("христин")) key = "христинівська";

            // Шукаємо назву (Водограй)
            var collectiveName = "Учасник";
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (line.includes('«') && !line.toLowerCase().includes("варта") && !line.toLowerCase().includes("фестиваль")) {
                    var match = line.match(/«([^»]+)»/);
                    collectiveName = match ? match[1] : line;
                    break; 
                }
            }

            // Шукаємо керівника
            var leader = "Не вказано";
            lines.forEach(function(l) {
                if (l.toLowerCase().includes("керівник")) {
                    leader = l.split(/[—:-]/).pop().trim();
                }
            });

            var score = (parseInt(item.likes) || 0) + (parseInt(item.shares) || 0) + (parseInt(item.comments) || 0);
            var postId = item.id || Math.random().toString(36).substr(2, 9);

            var entry = {
                name: collectiveName,
                score: score,
                url: item.facebookUrl || item.url || "#",
                media: item.media || 'narodocnt.jpg',
                leader: leader,
                hromada: key
            };

            window.currentData.push(entry);

            // Для карти беремо найкращого від громади
            if (key) {
                if (!currentBattleData[key] || score > currentBattleData[key].score) {
                    currentBattleData[key] = entry;
                }
            }
        });

        // Сортування
        window.currentData.sort(function(a, b) { return b.score - a.score; });
        window.currentData.forEach(function(item, index) { item.rank = index + 1; });

        renderList();
        renderMarkers('battle');

    } catch (e) {
        console.error("Помилка завантаження:", e);
        if (listContainer) listContainer.innerHTML = "Помилка зв'язку з сервером.";
    }
}

// 4. МАЛЮВАННЯ СПИСКУ
function renderList() {
    var list = document.getElementById('rankingList');
    if (!list || !window.currentData.length) return;
    
    list.innerHTML = '';
    var maxScore = 1;
    window.currentData.forEach(function(i) { if(i.score > maxScore) maxScore = i.score; });

    window.currentData.forEach(function(item, index) {
        var medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1);
        var progressWidth = (item.score / maxScore) * 100;

        list.innerHTML += 
            '<div class="rank-card">' +
                '<div class="medal">' + medal + '</div>' +
                '<img src="' + item.media + '" class="rank-photo" onerror="this.src=\'narodocnt.jpg\'">' +
                '<div class="rank-details">' +
                    '<div class="rank-header">' +
                        '<span class="rank-name">' + item.name + '</span>' +
                        '<span class="metric-info">' + item.score + ' балів</span>' +
                    '</div>' +
                    '<div class="progress-wrapper"><div class="progress-fill" style="width:' + progressWidth + '%"></div></div>' +
                    '<div style="margin-top:5px; font-size:12px; color:#7f8c8d;">Керівник: ' + item.leader + '</div>' +
                '</div>' +
                '<a href="' + item.url + '" class="btn-watch" target="_blank">Голосувати</a>' +
            '</div>';
    });
}

// 5. МАРКЕРИ НА КАРТІ
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

        if (mode === 'battle' && currentBattleData[key]) {
            var d = currentBattleData[key];
            var icon = L.divIcon({ className: 'count-icon', html: '<span>!</span>', iconSize: [30, 30] });
            L.marker([736 - h.y, h.x], { icon: icon })
             .bindPopup('<b>' + d.name + '</b><br>Балів: ' + d.score)
             .addTo(markersLayer);
        } else if (mode === 'collectives') {
            var list = (typeof collectivesList !== 'undefined' && collectivesList[gName]) || [];
            if (list.length > 0) {
                var iconC = L.divIcon({ className: 'count-icon', html: '<span>' + list.length + '</span>', iconSize: [30, 30] });
                L.marker([736 - h.y, h.x], { icon: iconC })
                 .bindPopup('<h3>' + h.name + '</h3>' + list.join('<br>'))
                 .addTo(markersLayer);
            }
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

// Зірочку залишаємо тут, якщо вона працює
window.toggleRules = function(e) {
    e.stopPropagation();
    let box = document.getElementById('rating-rules-popup');
    if (!box) {
        box = document.createElement('div');
        box.id = 'rating-rules-popup';
        box.style.cssText = "position:absolute; background:#fff; border:2px solid #f1c40f; padding:15px; border-radius:10px; box-shadow:0 10px 25px rgba(0,0,0,0.2); z-index:9999; width:220px; font-size:14px; color:#333;";
        box.innerHTML = `
            <div style="font-weight: bold; color: #e67e22; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                📏 Правила рейтингу
            </div>
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <div>👍 Лайк — <b>1 бал</b></div>
                <div>💬 Коментар — <b>1 бал</b></div>
                <div>🔄 Репост — <b>1 бал</b></div>
            </div>`;
        document.body.appendChild(box);
    }
    box.style.display = 'block';
    box.style.left = (e.pageX + 10) + 'px';
    box.style.top = (e.pageY + 10) + 'px';
    const closeRules = () => { box.style.display = 'none'; document.removeEventListener('click', closeRules); };
    document.addEventListener('click', closeRules);
};
