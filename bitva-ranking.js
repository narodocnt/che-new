/**
 * bitva-ranking.js - Стабільна версія
 */
async function loadAndRenderRanking() {
    var container = document.getElementById('rankingList');
    if (!container) return;

    try {
        var response = await fetch("https://n8n.narodocnt.online/webhook/get-ranking");
        var rawData = await response.json();
        var processed = [];

        for (var i = 0; i < rawData.length; i++) {
            var item = rawData[i];
            var text = (item.message || item.text || "").toLowerCase();
            
            if (window.collectivesDatabase) {
                for (var id in window.collectivesDatabase) {
                    var db = window.collectivesDatabase[id];
                    if (text.indexOf(db.location.toLowerCase()) !== -1 || text.indexOf(db.key.toLowerCase()) !== -1) {
                        processed.push({
                            id: id,
                            name: db.name,
                            location: db.location,
                            media: db.media,
                            score: (parseInt(item.likes) || 0) + (parseInt(item.comments) || 0) + (parseInt(item.shares) || 0),
                            url: item.facebookUrl || item.url || "#"
                        });
                        break;
                    }
                }
            }
        }

        processed.sort(function(a, b) { return b.score - a.score; });
        
        var uniqueTop6 = [];
        var seen = {};
        for (var j = 0; j < processed.length; j++) {
            if (!seen[processed[j].id] && uniqueTop6.length < 6) {
                seen[processed[j].id] = true;
                uniqueTop6.push(processed[j]);
            }
        }

        window.currentBattleRanking = uniqueTop6;

        var html = "";
        for (var k = 0; k < uniqueTop6.length; k++) {
            var el = uniqueTop6[k];
            var medal = (k === 0) ? "🥇" : (k === 1) ? "🥈" : (k === 2) ? "🥉" : (k + 1);
            var barWidth = (el.score / (uniqueTop6[0].score || 1)) * 100;

            html += '<div class="rank-card">' +
                '<div class="medal">' + medal + '</div>' +
                '<img src="' + el.media + '" class="rank-photo" onerror="this.src=\'narodocnt.jpg\'">' +
                '<div class="rank-details">' +
                    '<div class="rank-header"><span class="rank-name">' + el.name + '</span>' +
                    '<span class="metric-info">' + el.score + ' балів</span></div>' +
                    '<div class="progress-wrapper"><div class="progress-fill" style="width:' + barWidth + '%"></div></div>' +
                    '<div style="font-size:12px; color:#7f8c8d; margin-top:5px;">' + el.location + '</div>' +
                '</div>' +
                '<a href="' + el.url + '" class="btn-watch" target="_blank">Голосувати</a>' +
            '</div>';
        }
        container.innerHTML = html;

        if (window.renderMarkers) window.renderMarkers(window.currentMapMode || 'collectives');
    } catch (err) {
        console.error("Ranking error:", err);
    }
}
document.addEventListener('DOMContentLoaded', loadAndRenderRanking);
