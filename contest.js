/**
 * contest.js - Фінальна версія з розумним об'єднанням
 */

let currentData = [];
let lastWinner = null;

async function loadRanking() {
    const N8N_GET_RANKING_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    
    try {
        const response = await fetch(N8N_GET_RANKING_URL);
        const rawData = await response.json();
        const groups = {};
        let detectedFestivalTitle = "";

        rawData.forEach(item => {
            let fullText = (item.pageName || "").trim();
            
            // 1. ФІЛЬТР СМІТТЯ
            if (fullText.includes("undefined") || fullText.includes("$json") || parseInt(item.likes) > 600) return;

            // 2. ВИТЯГУЄМО НАЗВУ ФЕСТИВАЛЮ
            if (!detectedFestivalTitle && fullText.includes("Назва Колективу:")) {
                detectedFestivalTitle = fullText.split("Назва Колективу:")[0].replace(/Назва Фестивалю:/i, "").replace(/[#*]/g, "").trim();
            }

            // 3. ОЧИЩЕННЯ НАЗВИ КОЛЕКТИВУ
            let name = fullText.includes("Назва Колективу:") ? fullText.split("Назва Колективу:")[1].trim() : fullText;
            
            // Видаляємо все зайве для порівняння (лапки, пробіли, крапки)
            let groupKey = name.toLowerCase()
                .replace(/["'«»„“]/g, '') // Видаляємо всі види лапок
                .replace(/духовий оркестр/gi, '') // Видаляємо спільні слова для кращого пошуку міста
                .replace(/[^a-zа-яіїєґ0-9]/gi, '') // Лишаємо тільки букви та цифри
                .trim();

            // 4. РУЧНЕ ПРАВИЛО ДЛЯ КАМ'ЯНКИ ТА СМІЛИ (гарантія результату)
            if (groupKey.includes("кам") || groupKey.includes("камянк")) {
                name = "Духовий оркестр м. Кам’янка";
                groupKey = "kamyanka_final";
            } else if (groupKey.includes("сміл") || groupKey.includes("божидар")) {
                name = "Духовий оркестр «Божидар» (м. Сміла)";
                groupKey = "smila_final";
            } else if (groupKey.includes("звенигород")) {
                name = "Оркестр духових інструментів (м. Звенигородка)";
                groupKey = "zveni_final";
            } else if (groupKey.includes("христин") || groupKey.includes("великосеваст")) {
                name = "Оркестр Великосевастянівського БК (Христинівка)";
                groupKey = "hrist_final";
            }

            // 5. ГРУПУВАННЯ
            if (groups[groupKey]) {
                groups[groupKey].likes += parseInt(item.likes) || 0;
                groups[groupKey].comments += parseInt(item.comments) || 0;
                groups[groupKey].shares += parseInt(item.shares) || 0;
            } else {
                groups[groupKey] = {
                    pageName: name,
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
        if (titleElement) titleElement.innerText = detectedFestivalTitle ? `🏆 ${detectedFestivalTitle}` : "🏆 Битва вподобайків";

        // СОРТУВАННЯ ТА ТОП-6
        currentData = Object.values(groups)
            .sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares))
            .slice(0, 6);

        renderList('total'); 
    } catch (error) {
        console.error("Помилка:", error);
    }
}

function renderList(filter = 'total') {
    const list = document.getElementById('rankingList');
    if (!list) return;
    
    let sorted = [...currentData]; // Дані вже відсортовані в loadRanking
    
    if (sorted.length > 0) {
        if (lastWinner && lastWinner !== sorted[0].pageName) celebrate();
        lastWinner = sorted[0].pageName;
    }

    list.innerHTML = '';
    const maxVal = Math.max(...sorted.map(item => item.likes + item.comments + item.shares)) || 1;

    sorted.forEach((item, index) => {
        const score = item.likes + item.comments + item.shares;
        const percentage = (score / maxVal) * 100;
        const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`;

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
            </div>`;
    });
}

function celebrate() {
    if (typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
}

document.addEventListener('DOMContentLoaded', loadRanking);
