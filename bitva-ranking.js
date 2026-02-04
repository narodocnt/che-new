/**
 * bitva-ranking.js - Фінальна стабільна версія
 */
function loadBattleRanking() {
    console.log("🚀 Скрипт рейтингу запущено");
    
    var container = document.getElementById('rankingList');
    if (!container) {
        console.error("❌ Помилка: Контейнер #rankingList не знайдено!");
        return;
    }

    // Перевіряємо, чи завантажена база даних громад
    if (!window.collectivesDatabase) {
        console.error("❌ Помилка: window.collectivesDatabase не знайдено. Перевірте файл collectives-bitva.js");
        container.innerHTML = "<p style='color:white; text-align:center;'>Помилка бази даних громад</p>";
        return;
    }

    fetch("https://n8n.narodocnt.online/webhook/get-ranking")
        .then(response => response.json())
        .then(rawData => {
            console.log("✅ Дані з n8n отримано:", rawData.length, "записів");
            
            var processed = [];
            var db = window.collectivesDatabase;

            rawData.forEach(item => {
                var text = (item.message || "").toLowerCase();
                
                // Шукаємо збіг у базі даних
                for (var key in db) {
                    var entry = db[key];
                    var locationMatch = text.includes(entry.location.toLowerCase());
                    var keyMatch = text.includes(entry.key.toLowerCase());

                    if (locationMatch || keyMatch) {
                        processed.push({
                            id: key,
                            name: entry.name,
                            location: entry.location,
                            media: "narodocnt.jpg", // Стабільне фото-заглушка
                            score: (parseInt(item.likes) || 0) + (parseInt(item.comments) || 0) + (parseInt(item.shares) || 0),
                            url: item.facebookUrl || item.url || "#"
                        });
                        break;
                    }
                }
            });

            // Сортування за балами
            processed.sort((a, b) => b.score - a.score);

            // Фільтрація дублікатів (тільки один запис для кожної громади)
            var uniqueTop6 = [];
            var seen = {};
            for (var i = 0; i < processed.length; i++) {
                if (!seen[processed[i].id] && uniqueTop6.length < 6) {
                    seen[processed[i].id] = true;
                    uniqueTop6.push(processed[i]);
                }
            }

            window.currentBattleRanking = uniqueTop6;

            if (uniqueTop6.length === 0) {
                container.innerHTML = "<p style='color:#bdc3c7; text-align:center;'>Дані збираються, голосуйте у Facebook!</p>";
                return;
            }

            // Рендеринг карток
            container.innerHTML = uniqueTop6.map((el, index) => {
                var medal = (index === 0) ? "🥇" : (index === 1) ? "🥈" : (index === 2) ? "🥉" : (index + 1);
                var maxScore = uniqueTop6[0].score || 1;
                var barWidth = (el.score / maxScore) * 100;

                return `
                    <div class="rank-card" style="display:flex; align-items:center; gap:15px; background:rgba(255,255,255,0.1); padding:12px; border-radius:12px; margin-bottom:10px; border: 1px solid rgba(255,255,255,0.1);">
                        <div style="font-size: 24px; width: 35px; text-align: center;">${medal}</div>
                        <img src="${el.media}" style="width:70px; height:50px; object-fit:cover; border-radius:6px; border: 1px solid #555;">
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                                <span style="font-weight:bold; color:white; font-size:14px;">${el.name}</span>
                                <span style="color:#f1c40f; font-weight:bold;">${el.score}</span>
                            </div>
                            <div style="background:rgba(255,255,255,0.2); height:6px; border-radius:3px; overflow:hidden;">
                                <div style="background:#e67e22; width:${barWidth}%; height:100%;"></div>
                            </div>
                            <div style="font-size:11px; color:#bdc3c7; margin-top:4px;">${el.location}</div>
                        </div>
                        <a href="${el.url}" target="_blank" style="background:#e67e22; color:white; text-decoration:none; padding:8px 12px; border-radius:6px; font-size:12px; font-weight:bold;">ГОЛОС</a>
                    </div>
                `;
            }).join('');

            console.log("✅ Рейтинг успішно виведено на екран");
            
            // Якщо карта підключена, оновлюємо маркери
            if (window.renderMarkers) {
                window.renderMarkers('battle');
            }
        })
        .catch(err => {
            console.error("❌ Помилка запиту n8n:", err);
            container.innerHTML = "<p style='color:#e74c3c; text-align:center;'>Сервер тимчасово недоступний</p>";
        });
}

// Запуск при завантаженні
window.addEventListener('load', loadBattleRanking);
