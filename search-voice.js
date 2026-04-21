document.addEventListener('DOMContentLoaded', () => {
    const micBtn = document.getElementById('mic-btn');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const status = document.getElementById('search-status');

    // Перевірка підтримки браузером Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'uk-UA'; // Встановлюємо українську мову
        recognition.interimResults = false;

        micBtn.onclick = () => {
            recognition.start();
            micBtn.classList.add('mic-active');
            status.style.display = 'block';
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            searchInput.value = transcript; // Текст з'являється в полі
            micBtn.classList.remove('mic-active');
            status.style.display = 'none';
        };

        recognition.onerror = () => {
            micBtn.classList.remove('mic-active');
            status.style.display = 'none';
            alert("Помилка розпізнавання. Перевірте доступ до мікрофона.");
        };

        recognition.onend = () => {
            micBtn.classList.remove('mic-active');
            status.style.display = 'none';
        };
    } else {
        micBtn.style.display = 'none';
        console.log("Ваш браузер не підтримує голосове розпізнавання.");
    }

    // Функція самого пошуку
    function performSearch() {
        const query = searchInput.value.trim();
        if (query) {
            // Найпростіший варіант - пошук через Google по вашому сайту
            // Або ви можете замінити це на вашу внутрішню логіку пошуку
            const searchUrl = `https://www.google.com/search?q=site:narodocnt.online+${encodeURIComponent(query)}`;
            window.open(searchUrl, '_blank');
        }
    }

    searchBtn.onclick = performSearch;

    // Пошук при натисканні Enter
    searchInput.onkeypress = (e) => {
        if (e.key === 'Enter') performSearch();
    };
});
