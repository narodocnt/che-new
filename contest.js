async function loadRanking() {
    const N8N_GET_RANKING_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    
    try {
        const response = await fetch(N8N_GET_RANKING_URL);
        const rawData = await response.json();
        const groups = {};
        let detectedFestivalTitle = "";

        rawData.forEach(item => {
            let fullText = (item.pageName || "").trim();
            
            // 1. ВИТЯГУЄМО НАЗВУ ФЕСТИВАЛЮ (Title)
            // Шукаємо текст до фрази "Назва Колективу:"
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

        // ОНОВЛЕННЯ ЗАГОЛОВКА НА САЙТІ
        const titleElement = document.getElementById('festival-title');
        if (titleElement) {
            // Якщо ШІ витягнув назву "Музична варта", ставимо її, інакше лишаємо стандарт
            titleElement.innerText = detectedFestivalTitle ? `🏆 ${detectedFestivalTitle}` : "🏆 Битва вподобайків";
        }

        // СОРТУВАННЯ ТА ВИСВІТЛЕННЯ ТОП-6
        let combinedArray = Object.values(groups).sort((a, b) => {
            return (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares);
        });

        currentData = combinedArray.slice(0, 6);
        renderList('total'); 
    } catch (error) {
        console.error("Помилка:", error);
    }
}

// Решта функцій (renderList, celebrate) залишаються без змін
