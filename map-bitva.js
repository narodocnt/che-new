/**
 * map-bitva.js - Об'єднаний та відмовостійкий код (Карта + Рейтинг + Зірочка)
 */
var map;
var markersLayer;
window.currentData = []; // Глобальні дані для карток
var currentBattleData = {}; // Дані для мапи

// 1. ІНІЦІАЛІЗАЦІЯ КАРТИ (запускається одразу)
function initMap() {
    if (map) return;
    try {
        map = L.map('map', { crs: L.CRS.Simple, minZoom: -1, maxZoom: 2 });
        var bounds = [[0, 0], [736, 900]];
        L.imageOverlay('map.jpg', bounds).addTo(map);
        map.fitBounds(bounds);
        markersLayer = L.layerGroup().addTo(map);
        console.log("✅ Карта готова");
    } catch (e) {
        console.error("❌ Помилка ініціалізації карти:", e);
    }
}

// 2. ЗІРОЧКА ПРАВИЛ (toggleRules)
window.toggleRules = function(e) {
    if (e) e.stopPropagation();
    let box = document.getElementById('rating-rules-popup');
    
    if (!box) {
        box = document.createElement('div');
        box.id = 'rating-rules-popup';
        box.style.cssText = `
            position: absolute;
            background: #fff;
            border: 2px solid #f1c40f;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 9999;
            width: 220px;
            font-size: 14px;
            color: #333;
            display: none;
        `;
        box.innerHTML = `
            <div style="font-weight: bold; color: #e67e22; margin-bottom: 8px; border-bottom: 1px solid #eee;">📏 Правила рейтингу</div>
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <div>👍 Лайк — <b>1 бал</b></div>
                <div>💬 Коментар — <b>1 бал</b></div>
                <div>🔄 Репост — <b>1 бал</b></div>
            </div>
        `;
        document.body.appendChild(box);
    }

    const isVisible = box.style.display === 'block';
    box.style.display = isVisible ? 'none' : 'block';

    if (e && !isVisible) {
        box.style.left = (e.pageX + 10) + 'px';
        box.style.top = (e.pageY + 10) + 'px';
    }

    const closeRules = () => {
        box.style.display = 'none';
        document.removeEventListener('click', closeRules);
    };
    if (!isVisible) setTimeout(() => document.addEventListener('click', closeRules), 10);
};

// 3. ЗАВАНТАЖЕННЯ ДАНИХ (Битва)
async function loadBattleRanking() {
    const listContainer = document.getElementById('rankingList');
    if (listContainer) {
        listContainer.innerHTML = '<div style="text-align:center; padding:20px; color:#666;">Завантаження результатів битви...</div>';
    }

    const N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    
    try {
        const response = await fetch(N8N_URL);
        if (!response.ok) throw new Error("Сервер не відповідає");
        
        const rawData = await response.json();
        const groups = {};

        rawData.forEach(item => {
            const fullText = (item.message || item.text || item.pageName || "").trim();
            if (!fullText) return;

            let key = "";
            const t = fullText.toLowerCase();
            if (t.includes("сміл")) key = "смілянська";
            else if (t.includes("тальн")) key = "тальнівська";
            else if (t.includes("кам")) key = "кам’янська";
            else if (t.includes("христин")) key = "христинівська";
            else if (t.includes("золот")) key = "золотоніська";
            else if (t.includes("чорноб") || t.includes("водогр")) key = "чорнобаївська";
            else if (t.includes("звениг")) key = "звенигородська";

            if (key) {
                const total = (parseInt(item.likes) || 0) + (parseInt(item.shares) || 0) + (parseInt(item.comments) || 0);
                if (!groups[key] || total > groups[key].score) {
                    const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 2);
                    
                    // Покращений пошук назви
                    let collectiveName = "Учасник";
                    const nameLine = lines.find(l => l.includes('«') && !l.toLowerCase().includes("фестиваль"));
                    if (nameLine) {
                        const match = nameLine.match(/«([^»]+)»/);
                        collectiveName = match ? match[1] : nameLine;
                    } else {
                        collectiveName = lines[1] || "Колектив";
                    }

                    groups[key] = {
                        name: collectiveName.replace(/[#*«»]/g, ""),
                        score: total,
                        url: item.facebookUrl || item.url,
                        media: item.media || 'narodocnt.jpg',
                        leader: lines.find(l => l.toLowerCase().includes("керівник"))?.split(/[—:-]/).pop().trim() || "Вказано у пості"
                    };
                }
            }
        });

        window.currentData = Object.values(groups).sort((a, b) => b.score - a.score);
        window.currentData.forEach((item, index) => { item.rank = index + 1; });
        currentBattleData = groups;

        renderList();
        renderMarkers('battle');

    } catch (e) {
        console.error("❌ Помилка завантаження даних:", e);
        if (listContainer) {
            listContainer.innerHTML = '<div style="text-align:center; padding:20px; color:red;">Рейтинг тимчасово недоступний, але ви можете голосувати на сторінці Facebook.</div>';
        }
    }
}

// 4. ВИНЕСЕННЯ КАРТОК У СПИСОК
function renderList() {
    const list = document.getElementById('rankingList');
    if (!list || !window.currentData.length) return;
    
    list.innerHTML = '';
    const maxScore = Math.max(...window.currentData.map(i => i.score)) || 1;

    window.currentData.forEach((item, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1);
        const progressWidth = (item.score / maxScore) * 100;

        list.innerHTML += `
            <div class="rank-card top-${index}">
                <div class="medal">${medal}</div>
                <img src="${item.media}" class="rank-photo" onerror="this.src='narodocnt.jpg'">
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

// 5. МАРКЕРИ НА КАРТІ
function renderMarkers(mode) {
    if (!markersLayer || typeof hromadasGeoJSON === 'undefined') return;
    markersLayer.clearLayers();

    hromadasGeoJSON.features.forEach(function(h) {
        const gName = h.name.trim().toLowerCase();
        let key = "";
        if (gName.includes("сміл")) key = "смілянська";
        else if (gName.includes("звениг")) key = "звенигородська";
        else if (gName.includes("кам")) key = "кам’янська";
        else if (gName.includes("тальн")) key = "тальнівська";
        else if (gName.includes("христин")) key = "христинівська";
        else if (gName.includes("золот")) key = "золотоніська";
        else if (gName.includes("чорноб")) key = "чорнобаївська";

        if (mode === 'battle' && currentBattleData[key]) {
            const d = currentBattleData[key];
            const icon = L.divIcon({ className: 'count-icon', html: `<span>${d.rank}</span>`, iconSize: [30, 30] });
            L.marker([736 - h.y, h.x], { icon: icon })
             .bindPopup(`<b>${d.name}</b><br>Місце: ${d.rank}<br>Балів: ${d.score}`)
             .addTo(markersLayer);
        } else if (mode === 'collectives') {
            const list = (typeof collectivesList !== 'undefined' && collectivesList[gName]) || [];
            if (list.length > 0) {
                const icon = L.divIcon({ className: 'count-icon', html: `<span>${list.length}</span>`, iconSize: [30, 30] });
                L.marker([736 - h.y, h.x], { icon: icon }).bindPopup(`<h3>${h.name}</h3>` + list.join('<br>')).addTo(markersLayer);
            }
        }
    });
}

// ПЕРЕМИКАЧ РЕЖИМІВ
window.setMapMode = function(mode) {
    if (mode === 'battle') loadBattleRanking();
    else renderMarkers('collectives');
};

// СТАРТ
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    renderMarkers('collectives'); // Спочатку цифри громад
    loadBattleRanking(); // Потім завантажуємо битву
});
