const mapW = 900;
const mapH = 736;

const map = L.map('map', { crs: L.CRS.Simple, minZoom: -1, maxZoom: 2 });
const bounds = [[0, 0], [mapH, mapW]];
L.imageOverlay('map.jpg', bounds).addTo(map);
map.fitBounds(bounds);

const markersLayer = L.layerGroup().addTo(map);
let currentBattleData = {};

async function loadBattleRanking() {
    const N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    try {
        const response = await fetch(N8N_URL);
        const rawData = await response.json();
        const groups = {};

        rawData.forEach(item => {
            // Беремо текст прямо з поля pageName (або text, якщо воно так називається в таблиці)
            let fullText = (item.pageName || "").trim();
            if (!fullText || fullText.includes("undefined")) return;

            // 1. ВИЗНАЧАЄМО ГРОМАДУ (КЛЮЧ) АВТОМАТИЧНО З ТЕКСТУ
            let groupKey = "";
            let t = fullText.toLowerCase();
            
            if (t.includes("сміл") || t.includes("божидар")) groupKey = "смілянська";
            else if (t.includes("тальн") || t.includes("сурми")) groupKey = "тальнівська";
            else if (t.includes("кам")) groupKey = "кам’янська";
            else if (t.includes("христин") || t.includes("севаст")) groupKey = "христинівська";
            else if (t.includes("золотоніс") || t.includes("водограй")) groupKey = "золотоніська";
            else if (t.includes("звенигород") || t.includes("дзет")) groupKey = "звенигородська";

            if (groupKey) {
                // Рахуємо бали
                let total = (parseInt(item.likes) || 0) + (parseInt(item.shares) || 0) + (parseInt(item.comments) || 0);

                // Якщо постів кілька (наприклад, два різних оркестри), беремо той, де більше вподобайок
                if (!groups[groupKey] || total > groups[groupKey].score) {
                    
                    // ВИТЯГУЄМО ЧИСТУ НАЗВУ ТА КЕРІВНИКА
                    // Припускаємо формат: "Назва Колективу: Оркестр. Керівник: Іванов"
                    let collective = "Колектив";
                    if (fullText.includes("Назва Колективу:")) {
                        collective = fullText.split("Назва Колективу:")[1].split(".")[0].split("\n")[0].trim();
                    } else {
                        // Якщо мітки немає, беремо перший рядок
                        collective = fullText.split("\n")[0].split(".")[0].trim();
                    }

                    let leader = "Не вказано";
                    if (fullText.includes("Керівник:")) {
                        leader = fullText.split("Керівник:")[1].split("\n")[0].replace(/[#*]/g, "").trim();
                    }

                    groups[groupKey] = {
                        name: collective,
                        leader: leader,
                        score: total,
                        url: item.url
                    };
                }
            }
        });

        // 2. АВТОМАТИЧНЕ ВИЗНАЧЕННЯ МІСЦЯ (Сортування)
        const sorted = Object.keys(groups)
            .map(k => ({ key: k, ...groups[k] }))
            .sort((a, b) => b.score - a.score);
        
        sorted.forEach((item, index) => {
            groups[item.key].rank = index + 1;
        });

        currentBattleData = groups;
    } catch (e) { console.error("Помилка обробки таблиці:", e); }
}

function renderMarkers(mode) {
    markersLayer.clearLayers();
    
    // Проходимо по геометрії громад
    hromadasGeoJSON.features.forEach(h => {
        const gName = h.name.trim().toLowerCase();
        let show = false, label = "", content = `<h3>${h.name}</h3><hr>`;

        if (mode === 'collectives') {
            const list = collectivesList[gName] || [];
            if (list.length > 0) { 
                label = list.length; 
                content += list.join('<br>'); 
                show = true; 
            }
        } else {
            // Шукаємо дані битви за ключовим словом назви громади в hromadas-data.js
            let key = "";
            if (gName.includes("сміл")) key = "смілянська";
            else if (gName.includes("звенигород")) key = "звенигородська";
            else if (gName.includes("кам")) key = "кам’янська";
            else if (gName.includes("тальн")) key = "тальнівська";
            else if (gName.includes("христин")) key = "христинівська";
            else if (gName.includes("золотоніс")) key = "золотоніська";

            const b = currentBattleData[key];
            if (b) {
                label = b.rank; // Номер місця на іконці
                content += `
                    <div style="font-family: sans-serif;">
                        <p style="color:#e67e22; font-weight:bold; font-size:16px; margin:0;">🏆 Місце: №${b.rank}</p>
                        <p style="margin:8px 0 4px 0;">🎵 <b>${b.name}</b></p>
                        <p style="margin:0 0 8px 0; color:#555;">👤 Керівник: <b>${b.leader}</b></p>
                        <p style="margin:4px 0; font-weight:bold;">❤️ Балів: ${b.score}</p>
                        <a href="${b.url}" target="_blank" style="display:block; text-align:center; background:#e74c3c; color:white; padding:6px; border-radius:5px; text-decoration:none; margin-top:10px; font-weight:bold;">ГОЛОСУВАТИ</a>
                    </div>`;
                show = true;
            }
        }

        if (show) {
            const icon = L.divIcon({ className: 'count-icon', html: `<span>${label}</span>`, iconSize: [30, 30] });
            L.marker([mapH - h.y, h.x], { icon: icon }).bindPopup(content).addTo(markersLayer);
        }
    });
}

async function setMapMode(mode) {
    // Стилізація кнопок
    const btnCol = document.getElementById('btn-col');
    const btnBat = document.getElementById('btn-bat');
    if (btnCol) btnCol.className = mode === 'collectives' ? 'map-btn active-btn' : 'map-btn inactive-btn';
    if (btnBat) btnBat.className = mode === 'battle' ? 'map-btn active-btn' : 'map-btn inactive-btn';

    if (mode === 'battle') await loadBattleRanking();
    renderMarkers(mode);
}

window.onload = () => setMapMode('collectives');
