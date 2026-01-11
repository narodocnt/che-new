/**
 * contest.js - Живий бенчмарк для фестивалю "Музична Варта"
 */

let currentData = [];
let lastWinner = null;

// Функція завантаження даних із вашого n8n
async function loadRanking() {
    const N8N_GET_RANKING_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    
    try {
        const response = await fetch(N8N_GET_RANKING_URL);
        const rawData = await response.json();
        const groups = {};

        rawData.forEach(item => {
            let fullText = (item.pageName || "").trim();
            
            // УНІВЕРСАЛЬНИЙ ФІЛЬТР:
            // Шукаємо текст після фрази "Назва Колективу:" або просто чистимо назву
            let cleanName = fullText;
            if (fullText.includes("Назва Колективу:")) {
                cleanName = fullText.split("Назва Колективу:")[1].trim();
            } else if (fullText.includes("колектив")) {
                // Якщо приходить "Колектив (пост №...)", групуємо за номером, якщо назви немає
                cleanName = fullText;
            }

            // Якщо назва занадто довга, беремо перші 40 символів для ідентифікації
            // Це допоможе об'єднати пости, якщо в кінці назви є зайві пробіли або крапки
            let groupKey = cleanName.substring(0, 50).toLowerCase().trim();

            if (groups[groupKey]) {
                groups[groupKey].likes += parseInt(item.likes) || 0;
                groups[groupKey].comments += parseInt(item.comments) || 0;
                groups[groupKey].shares += parseInt(item.shares) || 0;
            } else {
                groups[groupKey] = {
                    pageName: cleanName, // Тут буде чиста назва без "Назва фестивалю"
                    likes: parseInt(item.likes) || 0,
                    comments: parseInt(item.comments) || 0,
                    shares: parseInt(item.shares) || 0,
                    url: item.url,
                    media: item.media || 'фото_для_боту.png'
                };
            }
        });

        // Сортуємо та обрізаємо до ТОП-6
        let combinedArray = Object.values(groups).sort((a, b) => {
            return (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares);
        });

        currentData = combinedArray.slice(0, 6);
        renderList('total'); 
    } catch (error) {
        console.error("Помилка:", error);
    }
}

// Функція запуску конфетті
function celebrate() {
    if (typeof confetti === 'function') {
        const duration = 3 * 1000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.7 },
                colors: ['#e67e22', '#f1c40f', '#1877f2']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.7 },
                colors: ['#e67e22', '#f1c40f', '#1877f2']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }
}

// Головна функція створення списку
function renderList(filter = 'total') {
    const list = document.getElementById('rankingList');
    if (!list) return;
    
    // Сортування залежно від обраного тригера
    let sorted = [...currentData].sort((a, b) => {
        const getScore = (item) => {
            if (filter === 'likes') return item.likes;
            if (filter === 'comments') return item.comments;
            if (filter === 'shares') return item.shares;
            return item.likes + item.comments + item.shares; // Режим "Total"
        };
        return getScore(b) - getScore(a);
    });

    // Перевірка на зміну абсолютного лідера (для конфетті)
    if (sorted.length > 0) {
        const currentWinner = sorted[0].url;
        if (lastWinner && lastWinner !== currentWinner) {
            celebrate();
        }
        lastWinner = currentWinner;
    }

    // Підсвічування активної кнопки
    document.querySelectorAll('.tab-btn').forEach(btn => {
        // Очищаємо всі активні класи
        btn.classList.remove('active');
        // Додаємо активний клас лише натиснутій кнопці
        if (btn.getAttribute('onclick').includes(`'${filter}'`)) {
            btn.classList.add('active');
        }
    });

    list.innerHTML = '';

    // Знаходимо максимальне значення для прогрес-бару (мінімум 1 щоб не ділити на 0)
    const maxVal = Math.max(...sorted.map(item => {
        if (filter === 'likes') return item.likes;
        if (filter === 'comments') return item.comments;
        if (filter === 'shares') return item.shares;
        return item.likes + item.comments + item.shares;
    })) || 1;

    sorted.forEach((item, index) => {
        const score = filter === 'likes' ? item.likes : 
                      filter === 'comments' ? item.comments : 
                      filter === 'shares' ? item.shares : 
                      (item.likes + item.comments + item.shares);
        
        const percentage = (score / maxVal) * 100;
        
        // Візуалізація медалей ТОП-3
        const medalIcons = ['🥇', '🥈', '🥉'];
        const medal = index < 3 ? medalIcons[index] : `#${index + 1}`;
        const topClass = index < 3 ? `top-${index}` : '';

        // Обробка назви: якщо pageName порожня в таблиці
        const nameText = item.pageName && item.pageName.trim() !== "" 
            ? item.pageName 
            : `Колектив (пост №${item.row_number})`;

        // Обробка мініатюри: якщо media порожня в таблиці
        const photoUrl = item.media && item.media.startsWith('http') 
            ? item.media 
            : 'фото_для_боту.png';

        list.innerHTML += `
            <div class="rank-card ${topClass}">
                <div class="medal">${medal}</div>
                <div class="photo-container">
                    <img src="${photoUrl}" 
                         class="rank-photo" 
                         onerror="this.src='фото_для_боту.png'" 
                         alt="thumbnail">
                </div>
                <div class="rank-details">
                    <div class="rank-header">
                        <span class="rank-name" title="${nameText}">${nameText}</span>
                        <span class="metric-info">
                            ${filter === 'total' ? `🔥 ${score}` : 
                              filter === 'likes' ? `❤️ ${item.likes}` : 
                              filter === 'comments' ? `💬 ${item.comments}` : `🔄 ${item.shares}`}
                        </span>
                    </div>
                    <div class="progress-wrapper">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <a href="${item.url}" target="_blank" class="btn-watch">Дивитись</a>
            </div>
        `;
    });
}

// Запуск при завантаженні сторінки
document.addEventListener('DOMContentLoaded', loadRanking);
