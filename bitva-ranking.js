function loadBattleRanking() {
    console.log("🚀 Пошук збігів розпочато...");
    var container = document.getElementById('rankingList');
    if (!container || !window.collectivesDatabase) return;

    fetch("https://n8n.narodocnt.online/webhook/get-ranking")
        .then(res => res.json())
        .then(rawData => {
            var processed = [];
            var db = window.collectivesDatabase;

            rawData.forEach(item => {
                // Беремо текст повідомлення або URL, якщо тексту немає
                var text = (item.message || item.facebookUrl || "").toLowerCase();
                
                for (var key in db) {
                    var entry = db[key];
                    // Шукаємо за коротким коренем назви (наприклад, "золот")
                    var rootName = entry.location.toLowerCase().substring(0, 5);
                    
                    if (text.includes(rootName)) {
                        processed.push({
                            id: key,
                            name: entry.name,
                            location: entry.location,
                            media: "narodocnt.jpg",
                            score: (parseInt(item.likes) || 0) + (parseInt(item.comments) || 0),
                            url: item.facebookUrl || "#"
                        });
                        break; 
                    }
                }
            });

            // Сортування
            processed.sort((a, b) => b.score - a.score);

            // Видаляємо дублікати громад
            var uniqueTop6 = [];
            var seen = {};
            processed.forEach(item => {
                if (!seen[item.id] && uniqueTop6.length < 6) {
                    seen[item.id] = true;
                    uniqueTop6.push(item);
                }
            });

            console.log("📊 Знайдено збігів для громад:", uniqueTop6.length);

            if (uniqueTop6.length === 0) {
                container.innerHTML = "<p style='text-align:center; color:#bdc3c7;'>Рейтинг оновлюється. Збігів не знайдено.</p>";
                return;
            }

            container.innerHTML = uniqueTop6.map((el, i) => `
                <div class="rank-card" style="display:flex; align-items:center; background:rgba(255,255,255,0.1); margin-bottom:10px; padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.1); color:white;">
                    <div style="font-weight:bold; width:30px; font-size:18px; color:#f1c40f;">${i+1}</div>
                    <img src="${el.media}" style="width:60px; height:45px; object-fit:cover; margin-right:15px; border-radius:6px; border:1px solid #555;">
                    <div style="flex-grow:1;">
                        <div style="font-weight:bold; font-size:14px;">${el.name}</div>
                        <div style="font-size:12px; color:#bdc3c7;">${el.location} — <b style="color:#f1c40f;">${el.score} 🔥</b></div>
                    </div>
                    <a href="${el.url}" target="_blank" style="background:#e67e22; color:white; padding:8px 12px; text-decoration:none; border-radius:6px; font-size:12px; font-weight:bold;">ГОЛОС</a>
                </div>
            `).join('');
            
            if (window.renderMarkers) window.renderMarkers('battle');
        })
        .catch(err => console.error("Помилка fetch:", err));
}

window.addEventListener('load', loadBattleRanking);
