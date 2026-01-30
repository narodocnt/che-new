/**
 * map-bitva.js - Логіка інтерактивної карти
 */

// 1. Використовуємо існуючі налаштування або задаємо нові через var (щоб не було SyntaxError)
var mapW = typeof mapW !== 'undefined' ? mapW : 900;
var mapH = typeof mapH !== 'undefined' ? mapH : 736;
var bounds = [[0, 0], [mapH, mapW]];

// 2. БЕЗПЕЧНА ІНІЦІАЛІЗАЦІЯ КАРТИ
// Перевіряємо, чи карта вже створена файлом map.js
if (typeof map === 'undefined' || map === null) {
    var map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -1,
        maxZoom: 2
    });
    L.imageOverlay('map.jpg', bounds).addTo(map);
    map.fitBounds(bounds);
}

// 3. Створюємо шар для маркерів, якщо його немає
if (typeof markersLayer === 'undefined') {
    var markersLayer = L.layerGroup().addTo(map);
}

var currentBattleData = {};

/**
 * Завантаження даних битви
 */
async function loadBattleRanking() {
    var N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    try {
        var response = await fetch(N8N_URL);
        var rawData = await response.json();
        
        var db = window.collectivesDatabase;
        if (!db) {
            console.error("Помилка: collectivesDatabase не знайдено!");
            return false;
        }

        var groups = {};
        rawData.forEach(item => {
            var url = (item.url || "").toLowerCase();
            let key = "";

            if (url.includes("smila") || url.includes("bozhidar")) key = "smila";
            else if (url.includes("zveny") || url.includes("dzet")) key = "zveny";
            else if (url.includes("kamyan") || url.includes("kravets")) key = "kamyanka";
            else if (url.includes("talne") || url.includes("surmy")) key = "talne";
            else if (url.includes("hrist") || url.includes("sverb")) key = "hrist";
            else if (url.includes("vodo") || url.includes("lesch")) key = "vodogray";

            if (key && db[key]) {
                var l = parseInt(item.likes) || 0;
                var s = parseInt(item.shares) || 0;
                var c = parseInt(item.comments) || 0;
                var total = l + s + c;

                if (!groups[key] || total > groups[key].score) {
                    groups[key] = {
                        ...db[key],
                        score: total,
                        url: item.url
                    };
                }
            }
        });

        var sorted = Object.values(groups).sort((a, b) => b.score - a.score);
        sorted.forEach((item, index) => { item.rank = index + 1; });

        currentBattleData = {};
        Object.values(groups).forEach(item => {
            const locKey = item.location.trim().toLowerCase();
            currentBattleData[locKey] = item;
        });

        return true;
    } catch (e) {
        console.error("Карта: Помилка завантаження", e);
        return false;
    }
}

/**
 * Відображення маркерів
 */
function renderMarkers(mode) {
    if (!markersLayer) return;
    markersLayer.clearLayers();
    
    if (typeof hromadasGeoJSON === 'undefined') {
        console.error("hromadasGeoJSON не знайдено!");
        return;
    }

    hromadasGeoJSON.features.forEach(h => {
        var hName = h.name.trim().toLowerCase();
        var show = false;
        var label = "";
        var content = `<div style="text-align:center;"><strong>${h.name} громада</strong></div><hr style="margin:5px 0;">`;

        if (mode === 'collectives') {
            var list = (typeof collectivesList !== 'undefined') ? collectivesList[hName] : null;
            if (list && list.length > 0) {
                label = list.length;
                content += `<div style="max-height:100px; overflow-y:auto; font-size:12px;">${list.join('<br>')}</div>`;
                show = true;
            }
        } else if (mode === 'battle') {
            var b = currentBattleData[hName];
            if (b) {
                label = b.rank;
                content += `
                    <div style="min-width:160px; font-family: sans-serif;">
                        <div style="color:#e67e22; font-weight:bold; font-size:14px; margin-bottom:4px;">🏆 Місце: №${b.rank}</div>
                        <div style="font-size:13px; font-weight:bold; line-height:1.2;">${b.name}</div>
                        <div style="font-size:11px; color:#555; margin:4px 0;">👤 ${b.leader}</div>
                        <div style="background:#f1f1f1; padding:4px; border-radius:4px; font-weight:bold; font-size:13px; margin-top:5px; text-align:center;">Балів: ${b.score}</div>
                        <a href="${b.url}" target="_blank" style="display:block; text-align:center; background:#e67e22; color:white; padding:6px; border-radius:5px; text-decoration:none; margin-top:8px; font-size:11px; font-weight:bold;">ГОЛОСУВАТИ</a>
                    </div>`;
                show = true;
            }
        }

        if (show) {
            var icon = L.divIcon({
                className: 'count-icon',
                html: `<span>${label}</span>`,
                iconSize: [30, 30]
            });
            L.marker([mapH - h.y, h.x], { icon: icon }).bindPopup(content).addTo(markersLayer);
        }
    });
}

/**
 * Перемикання режимів
 */
async function setMapMode(mode) {
    if (mode === 'battle') {
        const success = await loadBattleRanking();
        if (success) renderMarkers('battle');
    } else {
        renderMarkers('collectives');
    }
}

// Запуск при завантаженні (з невеликою затримкою, щоб мапа встигла створитися)
setTimeout(() => {
    setMapMode('battle'); 
    if (typeof loadRanking === 'function') loadRanking(); // Штовхаємо список у contest.js
}, 1000);
