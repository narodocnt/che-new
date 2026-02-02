// Створюємо порожній список карток при завантаженні
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('rankingList');
    if (!container) return;

    // Список 6 громад-учасників
    const participants = [
        { id: 'смілянська', name: 'Смілянська громада', leader: 'Керівник: Надія Шварцман', photo: 'smila.jpg' },
        { id: 'звенигородська', name: 'Звенигородська громада', leader: 'Керівник: Олександр Бойко', photo: 'zven.jpg' },
        { id: 'кам’янська', name: 'Кам’янська громада', leader: 'Керівник: Олена Петрова', photo: 'kam.jpg' },
        { id: 'тальнівська', name: 'Тальнівська громада', leader: 'Керівник: Іван Сидоренко', photo: 'talne.jpg' },
        { id: 'христинівська', name: 'Христинівська громада', leader: 'Керівник: Марія Іванова', photo: 'hrist.jpg' },
        { id: 'золотоніська', name: 'Золотоніська громада', leader: 'Керівник: Віктор Ткаченко', photo: 'zoloto.jpg' }
    ];

    container.innerHTML = participants.map(p => `
        <div class="rank-card" id="card-${p.id}">
            <div class="medal"><span class="card-rank">?</span></div>
            <img src="${p.photo}" class="rank-photo" onerror="this.src='narodocnt.jpg'">
            <div class="rank-details">
                <span class="rank-name">${p.name}</span>
                <span class="rank-leader" style="font-size: 0.8em; color: #666;">${p.leader}</span>
                <div class="progress-wrapper"><div class="progress-fill" style="width: 0%"></div></div>
            </div>
            <div class="rank-score"><span class="score-val">0</span> 🔥</div>
        </div>
    `).join('');
});
