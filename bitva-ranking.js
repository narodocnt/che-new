async function loadAndRenderRanking() {
    var container = document.getElementById('rankingList');
    if (!container) return;

    try {
        var response = await fetch("https://n8n.narodocnt.online/webhook/get-ranking");
        var rawData = await response.json();
        var processed = [];

        rawData.forEach(item => {
            var text = (item.message || "").toLowerCase();
            if (window.collectivesDatabase) {
                for (var id in window.collectivesDatabase) {
                    var db = window.collectivesDatabase[id];
                    if (text.includes(db.location.toLowerCase())) {
                        processed.push({
                            id: id,
                            name: db.name,
                            location: db.location,
                            // ВИПРАВЛЕННЯ: якщо картинки немає в репозиторії, ставимо логотип
                            media: "narodocnt.jpg", 
                            score: (parseInt(item.likes) || 0) + (parseInt(item.comments) || 0),
                            url: item.facebookUrl || "#"
                        });
                        break;
                    }
                }
            }
        });

        processed.sort((a, b) => b.score - a.score);
        var uniqueTop6 = processed.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i).slice(0, 6);
        window.currentBattleRanking = uniqueTop6;

        container.innerHTML = uniqueTop6.map((el, k) => `
            <div class="rank-card">
                <div class="medal">${k + 1}</div>
                <img src="${el.media}" class="rank-photo">
                <div class="rank-details">
                    <div class="rank-header"><span>${el.name}</span><strong>${el.score} 🔥</strong></div>
                </div>
                <a href="${el.url}" class="btn-watch" target="_blank">Голос</a>
            </div>
        `).join('');

        if (window.renderMarkers) window.renderMarkers('battle');
    } catch (e) {
        console.error("Помилка завантаження рейтингу:", e);
    }
}
window.onload = loadAndRenderRanking;
