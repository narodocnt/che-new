/**
 * bitva-cards.js - Відображення карток рейтингу (Тільки ТОП-6)
 */
function renderList() {
    var list = document.getElementById('rankingList');
    if (!list) return;
    
    // ОЧИЩУЄМО список перед кожним малюванням, щоб не було 40+ карток
    list.innerHTML = '';
    
    if (!window.currentData || window.currentData.length === 0) {
        list.innerHTML = '<p style="text-align:center;">Дані оновлюються...</p>';
        return;
    }

    // Беремо тільки перші 6 колективів
    var top6 = window.currentData.slice(0, 6);
    
    var maxScore = 1;
    top6.forEach(function(i) { if(i.score > maxScore) maxScore = i.score; });

    top6.forEach(function(item, index) {
        var medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1);
        var progressWidth = (item.score / maxScore) * 100;

        var card = document.createElement('div');
        card.className = 'rank-card';
        card.innerHTML = 
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
            '<a href="' + item.url + '" class="btn-watch" target="_blank">Голосувати</a>';
        
        list.appendChild(card);
    });
}
