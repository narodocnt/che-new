/**
 * bitva-ranking.js
 */
async function loadAndRenderRanking() {
    var container = document.getElementById('rankingList');
    if (!container) return;

    try {
        var response = await fetch("https://n8n.narodocnt.online/webhook/get-ranking");
        var rawData = await response.json();
        var processed = [];

        rawData.forEach(function(item) {
            var text = (item.message || item.text || "").toLowerCase();
            for (var id in window.collectivesDatabase) {
                var db = window.collectivesDatabase[id];
                if (text.includes(db.location.toLowerCase()) || text.includes(db.key.toLowerCase())) {
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
        });

        processed.sort(function(a, b) { return b.score - a.score; });
        
        var uniqueTop6 = [];
        var seen = {};
        processed.forEach(function(item) {
            if (!seen[item.id] && uniqueTop6.length < 6) {
                seen[item.id] = true;
                uniqueTop6.push(item);
            }
        });

        window.currentBattleRanking = uniqueTop6;

        var html = "";
        uniqueTop6.forEach(function(item, i) {
            var medals = ['🥇', '🥈', '🥉'];
            var medal = i < 3 ? medals[i] : (i + 1);
            var percent = (item.score / (uniqueTop6[0].score || 1)) * 100;

            html += '<div class="rank-card">' +
                '<div class="medal">' + medal + '</div>' +
                '<img src="' + item.media + '" class="rank-photo" onerror="this.src=\'narodocnt.jpg\'">' +
                '<div class="rank-details">' +
                    '<div class="rank-header">' +
                        '<span class="rank-name">' + item.name + '</span>' +
                        '<span class="metric-info">' + item.score + ' балів</span>' +
                    '</div>' +
                    '<div class="progress-wrapper"><div class="progress-fill" style="width:' + percent + '%"></div></div>' +
                    '<div style="font-size:12px; color:#7f8c8d; margin-top:5px;">Громада: ' + item.location + '</div>' +
                '</div>' +
                '<a href="' + item.url + '" class="btn-watch" target="_blank">Голосувати</a>' +
            '</div>';
        });

        container.innerHTML = html;

        if (window.renderMarkers) {
            window.renderMarkers(window.currentMapMode || 'collectives');
        }
    } catch (e) {
        console.error("Error loading ranking:", e);
    }
}

document.addEventListener('DOMContentLoaded', loadAndRenderRanking);
