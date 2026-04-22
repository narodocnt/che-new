/**
 * Розумний пошук для сайту народної творчості ОЦНТ
 */

// Оголошуємо функцію ПОЗА межами DOMContentLoaded, щоб вона була доступна всюди
async function performSearch() {
    const searchInput = document.getElementById('search-input');
    const status = document.getElementById('search-status');
    const query = searchInput.value.trim();
    
    if (!query) return;

    // Показуємо статус завантаження
    if (status) {
        status.innerText = "ШІ аналізує запит...";
        status.style.display = "block";
    }

    try {
        const response = await fetch('https://n8n.narodocnt.online/webhook/search-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                query: query,
                context: window.collectivesList // Передаємо базу громад
            })
        });

        if (!response.ok) throw new Error('Помилка мережі');

        const data = await response.json();
        
        // Виводимо відповідь (data.output має повернути n8n)
        alert("🤖 Відповідь ШІ:\n\n" + (data.output || "Інформацію знайдено."));

    } catch (error) {
        console.error("Помилка ШІ:", error);
        // Якщо n8n не відповідає, робимо пошук в Google по сайту
        const googleQuery = `site:narodocnt.online "${query}"`;
        window.open(`https://www.google.com/search?q=${encodeURIComponent(googleQuery)}`, '_blank');
    } finally {
        if (status) status.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const micBtn = document.getElementById('mic-btn');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    // Прив'язуємо клік на лінзу
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    // Прив'язуємо натискання Enter в полі введення
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }

    // НАЛАШТУВАННЯ ГОЛОСОВОГО ПОШУКУ
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && micBtn) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'uk-UA';

        micBtn.onclick = () => {
            recognition.start();
            micBtn.style.color = 'red';
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            searchInput.value = transcript;
            performSearch(); // Запускаємо пошук автоматично після голосу
        };

        recognition.onend = () => {
            micBtn.style.color = '';
        };
    }
});
