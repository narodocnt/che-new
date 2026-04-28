window.SHEET_URL = "https://docs.google.com/spreadsheets/d/ВАШ_ID_ТАБЛИЦІ/gviz/tq?tqx=out:json";

document.addEventListener('DOMContentLoaded', () => {
    const textField = document.getElementById('bandura-text-field');
    const banduraImg = document.getElementById('bandura-image');
    const modal = document.getElementById('result-modal');
    const modalText = document.getElementById('modal-text');

    // ОСНОВНА ФУНКЦІЯ ПОШУКУ
   async function performSearch(query) {
    const searchText = (query || textField.value).trim().toLowerCase();
    if (searchText.length < 2) return;

    banduraImg.src = 'bandura-thinking.png';
    textField.value = "Шукаю у базі...";

    try {
        const response = await fetch('https://n8n.narodocnt.online/webhook/search-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: searchText })
        });

        // ПЕРЕВІРКА: чи не порожня відповідь?
        const textData = await response.text(); 
        if (!textData) {
            throw new Error("Сервер n8n прислав порожню відповідь. Перевірте вузол 'Respond to Webhook'");
        }

        const data = JSON.parse(textData); 
        
        // Фільтрація (якщо n8n присилає весь список)
        const filtered = data.filter(row => {
            return Object.values(row).some(val => 
                String(val).toLowerCase().includes(searchText)
            );
        });

        if (filtered.length > 0) {
            displayResults(filtered);
        } else {
            showModal(`За запитом "${searchText}" нічого не знайдено.`);
        }

    } catch (error) {
        console.error("Помилка:", error);
        textField.value = "Помилка бази";
        banduraImg.src = 'bandura-idle.png';
        // Показуємо модалку навіть при помилці, щоб ви бачили, що вона працює
        showModal("Сталася помилка при пошуку. Спробуйте ще раз пізніше.");
    }
}
    
    function displayResults(items) {
        banduraImg.src = 'bandura-pointing.png';
        let content = `<h3>Знайдено колективів: ${items.length}</h3><hr>`;
        
        items.forEach(item => {
            // Використовуйте назви стовпчиків з вашої таблиці
            const name = item['назва'] || item['Назва'] || "Без назви";
            const leader = item['керівник'] || item['Керівник'] || "Не вказано";
            const hromada = item['громада'] || item['Громада'] || "";

            content += `
                <div style="margin-bottom: 20px; border-left: 4px solid #ffd700; padding-left: 10px;">
                    <strong style="font-size: 1.1em;">${name}</strong><br>
                    <span>👥 Керівник: ${leader}</span><br>
                    <span>📍 Громада: ${hromada}</span>
                </div>`;
        });

        showModal(content);
    }

    function showModal(html) {
        modalText.innerHTML = html;
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
        banduraImg.src = 'bandura-idle.png';
        textField.value = "";
    }

    // Прив'язка кнопок
    const searchBtn = document.getElementById('btn-search');
    if (searchBtn) searchBtn.onclick = () => performSearch();
    
    textField.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });

    // Повертаємо функцію для МЕНЮ
    window.filterCollectives = (type) => {
        const types = {
            'vocal': 'вокальний',
            'choreographic': 'хореографічний',
            'instrumental': 'інструментальний',
            'theatrical': 'театральний'
        };
        performSearch(types[type] || type);
    };
});

const micBtn = document.getElementById('btn-mic');
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (micBtn && SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'uk-UA';

    micBtn.onclick = () => {
        try {
            recognition.start();
            banduraImg.src = 'bandura-listening.png';
            textField.value = "Слухаю вас...";
        } catch (e) { console.error("Мікрофон вже працює"); }
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        textField.value = transcript;
        performSearch(transcript); // Відразу шукаємо
    };

    recognition.onend = () => {
        if (banduraImg.src.includes('listening')) banduraImg.src = 'bandura-idle.png';
    };
}
