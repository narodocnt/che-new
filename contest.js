/**
 * contest.js - Тільки для виводу рейтингу під картою
 */
var currentData = [];

async function loadRanking() {
    var list = document.getElementById('rankingList');
    var N8N_GET_RANKING_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    
    if (list) {
        list.innerHTML = `<div style="text-align:center; padding:20px;">Оновлення рейтингу...</div>`;
    }

    try {
        var response = await fetch(N8N_GET_RANKING_URL);
        var rawData = await response.json();
        var groups = {};

        rawData.forEach(function(item) {
            var fullText = (item.pageName || "").trim();
            if (!fullText || fullText.includes("undefined")) return;

            // Визначаємо громаду для групування
            var key = "";
            var t = fullText.toLowerCase();
            if (t.includes("сміл")) key = "smila";
            else if (t.includes("тальн")) key = "talne";
            else if (t.includes("кам")) key = "kamyanka";
            else if (t.includes("христин")) key = "hrist";
            else if (t.includes("золотоніс")) key = "vodogray";
            else if (t.includes("звенигород")) key = "zveny";

            if (key) {
                var l = parseInt(item.likes) || 0;
                var s = parseInt(item.shares) || 0;
                var c = parseInt(item.comments) || 0;
                var total = l + s + c;

                if (!groups[key] || total > groups[key].score) {
                    // Витягуємо назву та керівника прямо з тексту таблиці
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
                        breakdown: { l: l, s: s, c: c },
                        url: item.url,
                        media: item.media || 'narodocnt.jpg'
                    };
                }
            }
        });

        currentData = Object.values(groups).sort(function(a, b) { return b.score - a.score; });
        renderList();

    } catch (e) {
        console.error("Помилка рейтингу:", e);
    }
}

function renderList() {
    const list = document.getElementById('rankingList');
    if (!list || !currentData.length) return;
    
    list.innerHTML = '';
    
    // Знаходимо максимальний бал для прогрес-бару
    const maxScore = Math.max(...currentData.map(item => item.score)) || 1;

    currentData.forEach((item, index) => {
        // Визначаємо емодзі або медаль
        let medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1);
        
        // Розрахунок відсотка для прогрес-бару
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
                        Керівник: ${item.leader || 'Не вказано'}
                    </div>
                </div>

                <a href="${item.url}" class="btn-watch" target="_blank">Голосувати</a>
            </div>
        `;
    });
}

window.toggleRules = function(e) {
    // Зупиняємо розповсюдження кліку, щоб вікно не закрилося миттєво
    e.stopPropagation();

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
            pointer-events: none;
        `;
        box.innerHTML = `
            <div style="font-weight: bold; color: #e67e22; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                📏 Правила рейтингу
            </div>
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <div>👍 Лайк — <b>1 бал</b></div>
                <div>💬 Коментар — <b>1 бал</b></div>
                <div>🔄 Репост — <b>1 бал</b></div>
            </div>
            <div style="margin-top: 10px; font-size: 11px; color: #999; font-style: italic;">
                *Дані оновлюються автоматично
            </div>
        `;
        document.body.appendChild(box);
    }

    // Позиціонування біля курсору
    box.style.display = 'block';
    box.style.left = (e.pageX + 10) + 'px';
    box.style.top = (e.pageY + 10) + 'px';

    // Закриття при кліку в будь-якому місці екрана
    const closeRules = () => {
        box.style.display = 'none';
        document.removeEventListener('click', closeRules);
    };
    document.addEventListener('click', closeRules);
};

document.addEventListener('DOMContentLoaded', loadRanking);
