async function loadRanking() {
    const N8N_GET_RANKING_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    
    try {
        const response = await fetch(N8N_GET_RANKING_URL);
        const rawData = await response.json();
        const groups = {};

        rawData.forEach(item => {
            let fullText = (item.pageName || "").trim();
            
            // 1. ЖОРСТКИЙ ФІЛЬТР ТЕХНІЧНОГО СМІТТЯ
            if (fullText.includes("undefined") || 
                fullText.includes("$json") || 
                fullText.includes("message.content") ||
                (parseInt(item.likes) > 500 && fullText.includes("Колектив"))) {
                return; // Пропускаємо цей запис, не додаючи його в рейтинг
            }

            // 2. УНІВЕРСАЛЬНА ЧИСТКА НАЗВИ
            let cleanName = fullText
                .replace(/Назва Фестивалю:.*?Назва Колективу:/i, "") // Прибираємо технічний заголовок
                .replace(/Колектив \(пост №.*?\)/i, "Невідомий колектив")
                .trim();

            // 3. СПЕЦІАЛЬНЕ ОБ'ЄДНАННЯ ДЛЯ КАМ'ЯНКИ
            // Якщо в тексті є слово "Кам'янк" або посилання веде на їхній пост
            let groupKey = cleanName.toLowerCase();
            if (groupKey.includes("кам'ян") || groupKey.includes("камянк")) {
                cleanName = "Духовий оркестр м. Кам’янка";
                groupKey = "kamyanka_orchestra";
            }

            // 4. ГРУПУВАННЯ
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

        // Сортуємо: Сміла з 30-40 лайками тепер стане на своє чесне місце
        let combinedArray = Object.values(groups).sort((a, b) => {
            return (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares);
        });

        // Залишаємо ТОП-6 реальних колективів
        currentData = combinedArray.slice(0, 6);
        renderList('total'); 
    } catch (error) {
        console.error("Помилка:", error);
    }
}
