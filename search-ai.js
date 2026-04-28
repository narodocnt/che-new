// 1. Оголошуємо глобальну назву функції, щоб вона була доступна всюди
window.performSearch = null; 

document.addEventListener('DOMContentLoaded', () => {
    // Елементи DOM
    const textField = document.getElementById('bandura-text-field');
    const banduraImg = document.getElementById('bandura-image');
    const modal = document.getElementById('result-modal');
    const modalText = document.getElementById('modal-text');
    const micBtn = document.getElementById('btn-mic');

    // ФУНКЦІЯ ЗАКРИТТЯ МОДАЛКИ (додайте, якщо її немає)
    const closeModal = () => {
        if (modal) modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    };

    // ФУНКЦІЯ ПОКАЗУ МОДАЛКИ
    const showModal = (html) => {
        if (!modal || !modalText) return;
        modalText.innerHTML = html;
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
        if (banduraImg) banduraImg.src = 'bandura-idle.png';
        if (textField) textField.value = "";
    };

    // ОСНОВНА ФУНКЦІЯ ПОШУКУ
    window.performSearch = async function(query) {
        const searchText = (query || textField.value).trim().toLowerCase();
        if (searchText.length < 2) return;

        if (banduraImg) banduraImg.src = 'bandura-thinking.png';
        if (textField) textField.value = "Шукаю у базі...";

        try {
            const response = await fetch('https://n8n.narodocnt.online/webhook/search-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchText })
            });

            const textData = await response.text(); 
            if (!textData || textData.trim() === "") {
                throw new Error("Сервер n8n прислав порожню відповідь.");
            }

            const data = JSON.parse(textData); 
            
            // Якщо n8n вже прислав відфільтровані дані, використовуємо їх, 
            // якщо ні — фільтруємо на місці (залежить від вашого workflow в n8n)
            const filtered = Array.isArray(data) ? data.filter(row => {
                return Object.values(row).some(val => 
                    String(val).toLowerCase().includes(searchText)
                );
            }) : [];

            if (filtered.length > 0) {
                displayResults(filtered);
            } else {
                showModal(`За запитом "<strong>${searchText}</strong>" нічого не знайдено.`);
            }

        } catch (error) {
            console.error("Помилка:", error);
            if (textField) textField.value = "Помилка бази";
            if (banduraImg) banduraImg.src = 'bandura-idle.png';
            showModal("Сталася помилка при зверненні до бази. Перевірте з'єднання або вузол Respond to Webhook в n8n.");
        }
    };

    function displayResults(items) {
        if (banduraImg) banduraImg.src = 'bandura-pointing.png';
        let content = `<h3>Знайдено колективів: ${items.length}</h3><hr>`;
        
        items.forEach(item => {
            const name = item['назва'] || item['Назва'] || "Без назви";
            const leader = item['керівник'] || item['Керівник'] || "Не вказано";
            const hromada = item['громада'] || item['Громада'] || "";

            content += `
                <div style="margin-bottom: 20px; border-left: 4px solid #ffd700; padding-left: 10px; text-align: left;">
                    <strong style="font-size: 1.1em;">${name}</strong><br>
                    <span>👥 Керівник: ${leader}</span><br>
                    <span>📍 Громада: ${hromada}</span>
                </div>`;
        });

        showModal(content);
    }

    // ЛОГІКА МІКРОФОНУ (всередині DOMContentLoaded)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (micBtn && SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'uk-UA';

        micBtn.onclick = () => {
            try {
                recognition.start();
                if (banduraImg) banduraImg.src = 'bandura-listening.png';
                if (textField) textField.value = "Слухаю вас...";
            } catch (e) { console.error("Мікрофон уже активний"); }
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (textField) textField.value = transcript;
            window.performSearch(transcript); // Викликаємо глобальну функцію
        };

        recognition.onend = () => {
            if (banduraImg && banduraImg.src.includes('listening')) {
                banduraImg.src = 'bandura-idle.png';
            }
        };
    }

    // Прив'язка кнопок пошуку
    const searchBtn = document.getElementById('btn-search');
    if (searchBtn) searchBtn.onclick = () => window.performSearch();
    
    if (textField) {
        textField.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') window.performSearch(); 
        });
    }

    // Для вибору категорій з меню
    window.filterCollectives = (type) => {
        const types = {
            'vocal': 'вокальний',
            'choreographic': 'хореографічний',
            'instrumental': 'інструментальний',
            'theatrical': 'театральний'
        };
        window.performSearch(types[type] || type);
    };
});
