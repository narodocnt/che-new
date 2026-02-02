/**
 * bitva-ranking.js - Фінальна версія
 */
async function loadAndRenderRanking() {
    var container = document.getElementById('rankingList');
    if (!container) return;

    try {
        var response = await fetch("https://n8n.narodocnt.online/webhook/get-ranking");
        var rawData = await response.json();
        var processed = [];

        // Використовуємо звичайні цикли для надійності
        for (var i = 0; i < rawData.length; i++) {
            var item = rawData[i];
            var text = (item.message || item.text || "").toLowerCase();
            
            for (var id in window.collectivesDatabase) {
                var db = window.collectivesDatabase[id];
                if (text.indexOf(db.location.toLowerCase()) !== -1 || text.indexOf(db.key.toLowerCase()) !== -1) {
                    processed.push({
                        id: id,
                        name: db.name,
                        location: db.location,
                        leader: db.leader,
                        media: db.media,
                        score: (parseInt(item.likes) || 0) + (parseInt(item.comments) || 0) + (parseInt(item.shares) || 0),
                        url: item.facebookUrl || item.url || "#"
                    });
                    break;
                }
            }
        }

        processed.sort(function(a, b) { return b.score - a.score; });
        
        var uniqueTop6 = [];
        var seen = {};
        for (var j = 0; j < processed.length; j++) {
            var pItem = processed[j];
            if (!seen[pItem.id] && uniqueTop6.length < 6) {
                seen[pItem.id] = true;
                uniqueTop6.push(pItem);
            }
        }

        window.currentBattleRanking = uniqueTop6;

        var html = "";
        for (var k = 0; k < uniqueTop6.length; k++) {
            var finalItem = uniqueTop6[k];
            var medals = ['🥇', '🥈', '🥉'];
            var medal = k < 3 ? medals[k] : (k + 1);
            var maxScore = uniqueTop6[0].score || 1;
            var percent = (finalItem.score / maxScore) * 100;

            html += '<div class="rank-card">' +
                '<div class="medal">' + medal + '</div>' +
                '<img src="' + finalItem.media + '" class="rank-photo" onerror="this.src=\'narodocnt.jpg\'">' +
                '<div class="rank-details">' +
                    '<div class="rank-header">' +
                        '<span class="rank-name">' + finalItem.name + '</span>' +
                        '<span class="metric-info">' + finalItem.score + ' балів</span>' +
                    '</div>' +
                    '<div class="progress-wrapper"><div class="progress-fill" style="width:' + percent + '%"></div></div>' +
                    '<div style="font-size:12px; color:#7f8c8d; margin-top:5px;">Громада: ' + finalItem.location + '</div>' +
                '</div>' +
                '<a href="' + finalItem.url + '" class="btn-watch" target="_blank">Голосувати</a>' +
            '</div>';
        }

        container.innerHTML = html;

        if (window.renderMarkers) {
            window.renderMarkers(window.currentMapMode || 'collectives');
        }
    } catch (e) {
        console.error("Ranking error:", e);
    }
}

document.addEventListener('DOMContentLoaded', loadAndRenderRanking);
