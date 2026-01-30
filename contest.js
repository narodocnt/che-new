/**
 * contest.js - Логіка формування списку рейтингу "Битва вподобайків"
 */

// Глобальна змінна для зберігання даних
var currentData = [];

async function loadRanking() {
    const N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    const listElement = document.getElementById('rankingList');
    
    if (!listElement) return;

    try {
        console.log("Запит до n8n за рейтингом...");
        const response = await fetch(N8N_URL);
        
        // Перевірка, чи відповідь успішна
        if (!response.ok) throw new Error('Помилка мережі');

        const data = await response.json();
        
        // Перевірка, чи прийшов масив даних
        if (!Array.isArray(data) || data.length === 0) {
            console.warn("Сервер повернув порожній масив або невірний формат");
            listElement.innerHTML = "<p style='color:gray;'>Дані для рейтингу поки що відсутні</p>";
            return;
        }

        // Беремо базу колективів з window (з файлу collectives-bitva.js)
        const db = window.collectivesDatabase;
        if (!db) {
            console.error("База collectivesDatabase не знайдена!");
            return;
        }

        let groups = {};

        // Обробка даних від n8n
        data.forEach(item => {
            let url = (item.url || "").toLowerCase();
            let key = "";

            // Логіка зіставлення посилань з ключами в базі
            if (url.includes("smila") || url.includes("bozhidar")) key = "smila";
            else if (url.includes("zveny") || url.includes("dzet")) key = "zveny";
            else if (url.includes("kamyan") || url.includes("kravets")) key = "kamyanka";
            else if (url.includes("talne") || url.includes("surmy")) key = "talne";
            else if (url.includes("hrist") || url.includes("sverb")) key = "hrist";
            else if (url.includes("vodo") || url.includes("lesch")) key = "vodogray";

            if (key && db[key]) {
                // Рахуємо загальну суму балів
                let likes = parseInt(item.likes) || 0;
                let shares = parseInt(item.shares) || 0;
                let comments = parseInt(item.comments) || 0;
                let total = likes + shares + comments;

                // Якщо цей колектив вже є, беремо запис з найбільшою кількістю балів
                if (!groups[key] || total > groups[key].score) {
                    groups[key] = {
                        ...db[key],
                        score: total,
                        fbUrl: item.url
                    };
                }
            }
        });

        // Сортуємо: від найбільшого бала до найменшого
        window.currentData = Object.values(groups).sort((a, b) => b.score - a.score);
        
        // Викликаємо функцію малювання
        renderRanking(window.currentData);

    } catch (e) {
        console.error("Критична помилка contest.js:", e);
        if (listElement) {
            listElement.innerHTML = "<p style='color:red;'>Не вдалося завантажити рейтинг. Спробуйте оновити сторінку.</p>";
        }
    }
}

/**
 * Функція для малювання карток у HTML
 */
function renderRanking(data) {
    const listElement = document.getElementById('rankingList');
    if (!listElement) return;

    if (data.length === 0) {
        listElement.innerHTML = "<p>Наразі немає даних для відображення рейтингу.</p>";
        return;
    }

    listElement.innerHTML = data.map((item, index) => `
        <div class="ranking-item" style="
            background: white; 
            margin: 12px 0; 
            padding: 15px; 
            border-radius: 12px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            box-shadow: 0 4px 10px rgba(0,0,0,0.05); 
            border-left: 6px solid ${index === 0 ? '#f1c40f' : '#e67e22'};
        ">
            <div style="text-align: left; display: flex; align-items: center; gap: 15px;">
                <div style="
                    font-size: 1.4rem; 
                    font-weight: 800; 
                    color: ${index === 0 ? '#d4af37' : '#7f8c8d'};
                    min-width: 35px;
                ">#${index + 1}</div>
                <div>
                    <div style="font-weight: bold; font-size: 1.05rem; color: #2c3e50;">${item.name}</div>
                    <div style="font-size: 0.85rem; color: #7f8c8d;">${item.location} громада</div>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="
                    background: #fdf2e9; 
                    padding: 6px 15px; 
                    border-radius: 20px; 
                    font-weight: bold; 
                    color: #d35400;
                    font-size: 1.1rem;
                ">
                    ${item.score} <i class="fa-solid fa-fire" style="margin-left:5px;"></i>
                </div>
            </div>
        </div>
    `).join('');
}

// Запуск при повному завантаженні сторінки
window.addEventListener('load', () => {
    // Невелика затримка, щоб collectives-bitva.js встиг прогрузити базу в пам'ять
    setTimeout(loadRanking, 800);
});
