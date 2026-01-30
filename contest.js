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
    var list = document.getElementById('rankingList');
    if (!list) return;
    list.innerHTML = '';
    
    var maxVal = Math.max(...currentData.map(function(i) { return i.score; })) || 1;
    var colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#2980b9', '#8e44ad', '#27ae60'];

    currentData.forEach(function(item, index) {
        var color = colors[index] || '#2c3e50';
        var percentage = (item.score / maxVal) * 100;

        list.innerHTML += `
            <div style="margin: 10px auto; max-width: 600px; border: 2px solid ${color}; border-radius: 10px; overflow: hidden; background: white;">
                <div style="display: flex; align-items: center;">
                    <div style="width: 40px; background: ${color}; color: white; text-align: center; font-weight: bold; font-size: 20px; padding: 10px;">${index + 1}</div>
                    <div style="flex: 1; padding: 10px;">
                        <div style="font-weight: bold; color: #2c3e50;">${item.name}</div>
                        <div style="font-size: 12px; color: #666;">Керівник: ${item.leader}</div>
                        <div style="font-size: 14px; font-weight: bold; color: ${color}; margin-top: 5px;">Балів: ${item.score}</div>
                    </div>
                    <a href="${item.url}" target="_blank" style="padding: 10px; background: #e74c3c; color: white; text-decoration: none; margin-right: 10px; border-radius: 5px; font-size: 12px;">Голосувати</a>
                </div>
            </div>`;
    });
}

document.addEventListener('DOMContentLoaded', loadRanking);
