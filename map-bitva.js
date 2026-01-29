/**
 * map-bitva.js - Логіка інтерактивної карти
 */

const mapW = 900;
const mapH = 736;

// Ініціалізація карти
const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -1,
    maxZoom: 2
});

const bounds = [[0, 0], [mapH, mapW]];
L.imageOverlay('map.jpg', bounds).addTo(map);
map.fitBounds(bounds);

const markersLayer = L.layerGroup().addTo(map);
let currentBattleData = {};

/**
 * Завантаження даних битви та зіставлення з базою
 */
async function loadBattleRanking() {
    const N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    try {
        const response = await fetch(N8N_URL);
        const rawData = await response.json();
        
        // Використовуємо базу з window (яку ми вставили в HTML)
        const db = window.collectivesDatabase;
        if (!db) {
            console.error("Помилка: collectivesDatabase не знайдено!");
            return false;
        }

        const groups = {};
        rawData.forEach(item => {
            const url = (item.url || "").toLowerCase();
            let key = "";

            // Пошук ключа за посиланням
            if (url.includes("smila") || url.includes("bozhidar")) key = "smila";
            else if (url.includes("zveny") || url.includes("dzet")) key = "zveny";
            else if (url.includes("kamyan") || url.includes("kravets")) key = "kamyanka";
            else if (url.includes("talne") || url.includes("surmy")) key = "talne";
            else if (url.includes("hrist") || url.includes("sverb")) key = "hrist";
            else if (url.includes("vodo") || url.includes("lesch")) key = "vodogray";

            if (key && db[key]) {
                const l = parseInt(item.likes) || 0;
                const s = parseInt(item.shares) || 0;
                const c = parseInt(item.comments) || 0;
                const total = l + s + c;

                if (!groups[key] || total > groups[key].score) {
                    groups[key] = {
                        ...db[key],
                        score: total,
                        url: item.url
                    };
                }
            }
        });

        // Сортування для визначення місць
        const sorted = Object.values(groups).sort((a, b) => b.score - a.score);
        sorted.forEach((item, index) => {
            item.rank = index + 1;
        });

        // Прив'язка до карти за назвою громади (location)
        currentBattleData = {};
        Object.values(groups).forEach(item => {
            // Використовуємо поле location як ключ для зіставлення з hromadasGeoJSON
            const locKey = item.location.trim().toLowerCase();
            currentBattleData[locKey] = item;
        });

        return true;
    } catch (e) {
        console.error("Карта: Помилка завантаження даних", e);
        return false;
    }
}

/**
 * Відображення маркерів на карті
 */
function renderMarkers(mode) {
    markersLayer.clearLayers();
    
    if (typeof hromadasGeoJSON === 'undefined') {
        console.error("Дані громад hromadasGeoJSON не знайдені!");
        return;
    }

    hromadasGeoJSON.features.forEach(h => {
        const hName = h.name.trim().toLowerCase();
        let show = false;
        let label = "";
        let content = `<div style="text-align:center;"><strong>${h.name} громада</strong></div><hr style="margin:5px 0;">`;

        if (mode === 'collectives') {
            // Режим звичайних колективів (з collectives-list.js)
            const list = (typeof collectivesList !== 'undefined') ? collectivesList[hName] : null;
            if (list && list.length > 0) {
                label = list.length;
                content += `<div style="max-height:100px; overflow-y:auto; font-size:12px;">${list.join('<br>')}</div>`;
                show = true;
            }
        } else if (mode === 'battle') {
            // Режим "Битва Громад"
            const b = currentBattleData[hName];
            if (b) {
                label = b.rank;
                content += `
                    <div style="min-width:160px; font-family: sans-serif;">
                        <div style="color:#e67e22; font-weight:bold; font-size:14px; margin-bottom:4px;">🏆 Місце: №${b.rank}</div>
                        <div style="font-size:13px; font-weight:bold; line-height:1.2;">${b.name}</div>
                        <div style="font-size:11px; color:#555; margin:4px 0;">👤 ${b.leader}</div>
                        <div style="background:#f1f1f1; padding:4px; border-radius:4px; font-weight:bold; font-size:13px; margin-top:5px; text-align:center;">
                            Балів: ${b.score}
                        </div>
                        <a href="${b.url}" target="_blank" style="display:block; text-align:center; background:#e67e22; color:white; padding:6px; border-radius:5px; text-decoration:none; margin-top:8px; font-size:11px; font-weight:bold;">ПЕРЕЙТИ ДО ГОЛОСУВАННЯ</a>
                    </div>`;
                show = true;
            }
        }

        if (show) {
            const icon = L.divIcon({
                className: 'count-icon',
                html: `<span>${label}</span>`,
                iconSize: [30, 30]
            });

            L.marker([mapH - h.y, h.x], { icon: icon })
                .bindPopup(content)
                .addTo(markersLayer);
        }
    });
}

/**
 * Перемикання режимів
 */
async function setMapMode(mode) {
    const btnCol = document.getElementById('btn-col');
    const btnBat = document.getElementById('btn-bat');
    
    if (btnCol) btnCol.className = (mode === 'collectives') ? 'map-btn active-btn' : 'map-btn inactive-btn';
    if (btnBat) btnBat.className = (mode === 'battle') ? 'map-btn active-btn' : 'map-btn inactive-btn';

    if (mode === 'battle') {
        const success = await loadBattleRanking();
        if (success) renderMarkers('battle');
    } else {
        renderMarkers('collectives');
    }
}

// Запуск за замовчуванням
window.onload = () => {
    setMapMode('collectives');
};
