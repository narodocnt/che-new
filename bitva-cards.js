window.renderList = function() {
    var list = document.getElementById('rankingList');
    if (!list) return;
    list.innerHTML = '';

    if (!window.currentData || window.currentData.length === 0) {
        list.innerHTML = '<p style="text-align:center;">Очікуємо дані з Facebook...</p>';
        return;
    }

    var uniqueList = [];
    var seenIds = {};

    // Фільтруємо, щоб кожен ID з твоєї таблиці був лише ОДИН раз
    for (var i = 0; i < window.currentData.length; i++) {
        var item = window.currentData[i];
        if (!seenIds[item.id]) {
            seenIds[item.id] = true;
            uniqueList.push(item);
        }
        if (uniqueList.length === 6) break;
    }

    var maxScore = uniqueList[0] ? uniqueList[0].score : 1;

    uniqueList.forEach(function(item, index) {
        var medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1);
        var progressWidth = (item.score / maxScore) * 100;

        list.innerHTML += 
            '<div class="rank-card">' +
                '<div class="medal">' + medal + '</div>' +
                '<img src="' + item.media + '" class="rank-photo" onerror="this.src=\'narodocnt.jpg\'">' +
                '<div class="rank-details">' +
                    '<div class="rank-header">' +
                        '<span class="rank-name">' + item.name + '</span>' +
                        '<span class="metric-info">' + item.score + ' балів</span>' +
                    '</div>' +
                    '<div class="progress-wrapper"><div class="progress-fill" style="width:' + progressWidth + '%"></div></div>' +
                    '<div style="margin-top:5px; font-size:12px; color:#7f8c8d;">Керівник: ' + item.leader + '</div>' +
                '</div>' +
                '<a href="' + item.url + '" class="btn-watch" target="_blank">Голосувати</a>' +
            '</div>';
    });
};
