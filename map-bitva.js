/**
 * ОБ'ЄДНАНИЙ КОД: КАРТА + РЕЙТИНГ + ЗІРОЧКА
 */
var map;
var markersLayer;
var currentBattleData = {}; 
window.currentData = [];    

// 1. ІНІЦІАЛІЗАЦІЯ КАРТИ
function initMap() {
    if (map) return; 
    map = L.map('map', { crs: L.CRS.Simple, minZoom: -1, maxZoom: 2 });
    var bounds = [[0, 0], [736, 900]];
    L.imageOverlay('map.jpg', bounds).addTo(map);
    map.fitBounds(bounds);
    markersLayer = L.layerGroup().addTo(map);
}

// 2. ЗАВАНТАЖЕННЯ ДАНИХ ТА ПАРСИНГ
async function loadBattleRanking() {
    var N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    var listElement = document.getElementById('rankingList');
    if (listElement) listElement.innerHTML = '<div style="text-align:center;padding:20px;">Оновлення рейтингу...</div>';

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
        window.currentData = Object.values(groups).sort((a,b) => b.score - a.score);
        
        renderMarkers('battle');
        renderList(); 
        
    } catch (e) { console.error("Помилка:", e); }
}

// 3. МАЛЮВАННЯ СПИСКУ (РЕЙТИНГ)
function renderList() {
    const list = document.getElementById('rankingList');
    if (!list || !window.currentData.length) return;
    
    list.innerHTML = '';
    const maxScore = Math.max(...window.currentData.map(item => item.score)) || 1;

    window.currentData.forEach((item, index) => {
        let medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1);
        const progressWidth = (item.score / maxScore) * 100;

        list.innerHTML += `
            <div class="rank-card top-${index}">
                <div class="medal">${medal}</div>
                <img src="${item.media || 'narodocnt.jpg'}" class="rank-photo" onerror="this.src='narodocnt.jpg'">
                <div class="rank-details">
                    <div class="rank-header">
                        <span class="rank-name">${item.name}</span>
                        <span class="metric-info">${item.score} балів</span>
                    </div>
                    <div class="progress-wrapper">
                        <div class="progress-fill" style="width: ${progressWidth}%"></div>
                    </div>
                    <div style="margin-top: 5px; font-size: 12px; color: #7f8c8d;">
                        Керівник: ${item.leader}
                    </div>
                </div>
                <a href="${item.url}" class="btn-watch" target="_blank">Голосувати</a>
            </div>`;
    });
}

// 4. ПРАВИЛА (ЗІРОЧКА)
window.toggleRules = function(e) {
    e.stopPropagation();
    let box = document.getElementById('rating-rules-popup');
    if (!box) {
        box = document.createElement('div');
        box.id = 'rating-rules-popup';
        box.style.cssText = "position:absolute; background:#fff; border:2px solid #f1c40f; padding:15px; border-radius:10px; box-shadow:0 10px 25px rgba(0,0,0,0.2); z-index:9999; width:220px; font-size:14px; color:#333;";
        box.innerHTML = `<b>📏 Правила рейтингу</b><br>👍 Лайк — 1 бал<br>💬 Коментар — 1 бал<br>🔄 Репост — 1 бал`;
        document.body.appendChild(box);
    }
    box.style.display = 'block';
    box.style.left = (e.pageX + 10) + 'px';
    box.style.top = (e.pageY + 10) + 'px';
    const close = () => { box.style.display = 'none'; document.removeEventListener('click', close); };
    document.addEventListener('click', close);
};

// 5. МАРКЕРИ
function renderMarkers(mode) {
    if (!markersLayer) return;
    markersLayer.clearLayers();
    if (typeof hromadasGeoJSON === 'undefined') return;

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

        var show = false, label = "", content = `<h3>${h.name}</h3>`;
        if (mode === 'collectives') {
            var list = (typeof collectivesList !== 'undefined' && collectivesList[gName]) || [];
            if (list.length > 0) { label = list.length; content += list.join('<br>'); show = true; }
        } else if (currentBattleData[key]) {
            var d = currentBattleData[key];
            label = d.rank;
            content += `<p style="color:orange;font-weight:bold;">🏆 №${d.rank}</p><p><b>${d.name}</b></p><p>Балів: ${d.score}</p><a href="${d.url}" target="_blank" style="color:red;">Голосувати</a>`;
            show = true;
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
