/**
 * Скрипт завантаження рейтингу "Битва вподобайків"
 * Адаптовано під структуру стовпчиків Apify
 */

// ПРЯМЕ ПОСИЛАННЯ НА ТАБЛИЦЮ (експорт у CSV)
// Замініть ID на ваш реальний ID Google Таблиці
const SHEET_ID = '1AOQRx5X3GiFcQ1Oz1gnpRKCKkXKtiFRMvexUy2xSM3Q'; 
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

async function loadRanking() {
    const listContainer = document.getElementById('rankingList');
    const titleContainer = document.getElementById('festival-title');
    if (!listContainer) return;

    try {
        const response = await fetch(CSV_URL);
        const data = await response.text();
        
        // Розбиваємо CSV на рядки
        const rows = data.split('\n');
        if (rows.length < 2) return;

        // Отримуємо заголовки, щоб знайти індекси потрібних стовпчиків
        const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        const idxName = headers.indexOf('pageName');
        const idxLikes = headers.indexOf('reactionLikeCount'); // або 'topReactionsCount'
        const idxUrl = headers.indexOf('url');
        const idxFestTitle = headers.indexOf('festival_title');

        // Обробляємо дані
        let participants = rows.slice(1).map(row => {
            // Регулярний вираз для коректного поділу CSV з комами всередині лапок
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/"/g, ''));
            
            // Встановлюємо назву фестивалю, якщо вона є в рядку
            if (idxFestTitle !== -1 && cols[idxFestTitle] && titleContainer) {
                titleContainer.innerText = "🏆 " + cols[idxFestTitle];
            }

            return {
                name: cols[idxName] || 'Без назви',
                votes: parseInt(cols[idxLikes]) || 0,
                link: cols[idxUrl] || '#'
            };
        });

        // Фільтруємо порожні та сортуємо за вподобайками (від більшого до меншого)
        participants = participants.filter(p => p.name !== 'Без назви');
        participants.sort((a, b) => b.votes - a.votes);

        // Виведення на сторінку
        listContainer.innerHTML = '';

        participants.forEach((p, index) => {
            const item = document.createElement('div');
            item.className = 'ranking-item';
            item.style = "display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #eee; background: white; margin-bottom: 8px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);";
            
            item.innerHTML = `
                <div style="display:flex; align-items:center; gap:12px;">
                    <span style="font-weight:bold; color:#e67e22; font-size: 1.2rem;">${index + 1}</span>
                    <div>
                        <div style="font-weight:bold; color:#2f3640;">${p.name}</div>
                        <div style="font-size:0.9rem; color:#27ae60; font-weight:bold;">${p.votes} ❤️ вподобайків</div>
                    </div>
                </div>
                <button class="vote-btn" 
                        onclick="window.open('${p.link}', '_blank')" 
                        style="background:#3b5998; color:white; border:none; padding:8px 15px; border-radius:20px; cursor:pointer; font-weight:bold; font-size:0.8rem;">
                    ГЛОСУВАТИ
                </button>
            `;
            listContainer.appendChild(item);
        });

    } catch (error) {
        console.error('Помилка:', error);
        listContainer.innerHTML = '<p>Оновлюємо дані рейтингу...</p>';
    }
}

// Запуск
document.addEventListener('DOMContentLoaded', loadRanking);
