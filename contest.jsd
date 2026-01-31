/**
 * contest.js - Тільки для виводу рейтингу (візуалізація)
 */
var currentData = [];

function renderList() {
    const list = document.getElementById('rankingList');
    if (!list || !currentData.length) return;
    
    list.innerHTML = '';
    
    // Знаходимо максимальний бал для прогрес-бару
    const maxScore = Math.max(...currentData.map(item => item.score)) || 1;

    currentData.forEach((item, index) => {
        let medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1);
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

// Зірочку залишаємо тут, якщо вона працює
window.toggleRules = function(e) {
    e.stopPropagation();
    let box = document.getElementById('rating-rules-popup');
    if (!box) {
        box = document.createElement('div');
        box.id = 'rating-rules-popup';
        box.style.cssText = "position:absolute; background:#fff; border:2px solid #f1c40f; padding:15px; border-radius:10px; box-shadow:0 10px 25px rgba(0,0,0,0.2); z-index:9999; width:220px; font-size:14px; color:#333;";
        box.innerHTML = `
            <div style="font-weight: bold; color: #e67e22; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                📏 Правила рейтингу
            </div>
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <div>👍 Лайк — <b>1 бал</b></div>
                <div>💬 Коментар — <b>1 бал</b></div>
                <div>🔄 Репост — <b>1 бал</b></div>
            </div>`;
        document.body.appendChild(box);
    }
    box.style.display = 'block';
    box.style.left = (e.pageX + 10) + 'px';
    box.style.top = (e.pageY + 10) + 'px';
    const closeRules = () => { box.style.display = 'none'; document.removeEventListener('click', closeRules); };
    document.addEventListener('click', closeRules);
};
