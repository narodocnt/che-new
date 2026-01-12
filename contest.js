/**
 * contest.js - Живий рейтинг фестивалів
 */

let currentData = [];
let lastWinner = null;

// Функція завантаження та обробки даних
async function loadRanking() {
    const N8N_GET_RANKING_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    
    try {
        const response = await fetch(N8N_GET_RANKING_URL);
        const rawData = await response.json();
        const groups = {};
        let detectedFestivalTitle = "";

        rawData.forEach(item => {
            let fullText = (item.pageName || "").trim();
            
            // 1. ВИТЯГУЄМО НАЗВУ ФЕСТИВАЛЮ
            if (!detectedFestivalTitle && fullText.includes("Назва Колективу:")) {
                detectedFestivalTitle = fullText.split("Назва Колективу:")[0]
                    .replace(/Назва Фестивалю:/i, "")
                    .replace(/[#*]/g, "")
                    .trim();
            }

            // 2. ФІЛЬТР ТЕХНІЧНОГО СМІТТЯ
            if (fullText.includes("undefined") || 
                fullText.includes("$json") || 
                fullText.includes("message.content") ||
                (parseInt(item.likes) > 600)) {
                return; 
            }

            // 3. ЧИСТКА НАЗВИ КОЛЕКТИВУ
            let cleanName = fullText;
            if (fullText.includes("Назва Колективу:")) {
                cleanName = fullText.split("Назва Колективу:")[1].trim();
            }

            // 4. СПЕЦІАЛЬНЕ ОБ'ЄДНАННЯ ДЛЯ КАМ'ЯНКИ
            let groupKey = cleanName.toLowerCase();
            if (groupKey.includes("кам'ян") || groupKey.includes("камянк")) {
                cleanName = "Духовий оркестр м. Кам’янка";
                groupKey = "kamyanka_orchestra";
            } else {
                groupKey = cleanName.substring(0, 50).toLowerCase().trim();
            }

            // 5. ГРУПУВАННЯ ЛАЙКІВ
            if (groups[groupKey]) {
                groups[groupKey].likes += parseInt(item.likes) || 0;
                groups[groupKey].comments += parseInt(item.comments) || 0;
                groups[groupKey].shares += parseInt(item.shares) || 0;
            } else {
                groups[groupKey] = {
                    pageName: cleanName,
                    likes: parseInt(item.likes) || 0,
                    comments: parseInt(item.comments) || 0,
                    shares: parseInt(item.shares) || 0,
                    url: item.url,
                    media: item.media || 'фото_для_боту.png'
                };
            }
        });

        // ОНОВЛЕННЯ ЗАГОЛОВКА
        const titleElement = document.getElementById('festival-title');
        if (titleElement) {
            titleElement.innerText = detectedFestivalTitle ? `🏆 ${detectedFestivalTitle}` : "🏆 Битва вподобайків";
        }

        // СОРТУВАННЯ ТА ТОП-6
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

// Функція малювання карток на сторінці
function renderList(filter = 'total') {
    const list = document.getElementById('rankingList');
    if (!list) return;
    
    // Сортування
    let sorted = [...currentData].sort((a, b) => {
        const getScore = (item) => {
            if (filter === 'likes') return item.likes;
            if (filter === 'comments') return item.comments;
            if (filter === 'shares') return item.shares;
            return item.likes + item.comments + item.shares;
        };
        return getScore(b) - getScore(a);
    });

    // Ефект конфетті при зміні лідера
    if (sorted.length > 0) {
        const currentWinner = sorted[0].pageName;
        if (lastWinner && lastWinner !== currentWinner) {
            celebrate();
        }
        lastWinner = currentWinner;
    }

    list.innerHTML = '';
    const maxVal = Math.max(...sorted.map(item => item.likes + item.comments + item.shares)) || 1;

    sorted.forEach((item, index) => {
        const score = filter === 'likes' ? item.likes : 
                      filter === 'comments' ? item.comments : 
                      filter === 'shares' ? item.shares : 
                      (item.likes + item.comments + item.shares);
        
        const percentage = (score / maxVal) * 100;
        const medalIcons = ['🥇', '🥈', '🥉'];
        const medal = index < 3 ? medalIcons[index] : `#${index + 1}`;

        list.innerHTML += `
            <div class="rank-card">
                <div class="medal">${medal}</div>
                <div class="photo-container">
                    <img src="${item.media}" class="rank-photo" onerror="this.src='фото_для_боту.png'">
                </div>
                <div class="rank-details">
                    <div class="rank-header">
                        <span class="rank-name">${item.pageName}</span>
                        <span class="metric-info">🔥 ${score}</span>
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

// Старт
document.addEventListener('DOMContentLoaded', loadRanking);
