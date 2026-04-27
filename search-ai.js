document.addEventListener('DOMContentLoaded', () => {
    const textField = document.getElementById('bandura-text-field');
    const banduraImg = document.getElementById('bandura-image');
    const modal = document.getElementById('result-modal');
    const modalText = document.getElementById('modal-text');
    const banduraWrapper = document.querySelector('.bandura-standalone-avatar');

    let lastResult = "";

    // 1. Функція пошуку
    async function performSearch() {
        const query = textField.value.trim();
        if (!query || query === "Шукаю..." || query === "Слухаю...") return;

        console.log("Запуск пошуку для:", query);
        banduraImg.src = 'bandura-thinking.png';
        const originalText = textField.value;
        textField.value = "Шукаю...";

        try {
            const response = await fetch('https://n8n.narodocnt.online/webhook/search-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query })
            });

            const data = await response.json();
            const result = data.text || data.output || "Вибачте, сталася помилка при отриманні відповіді.";
            
            lastResult = result;
            banduraImg.src = 'bandura-pointing.png';
            if (banduraWrapper) banduraWrapper.classList.add('jump-bar-animation');

            setTimeout(() => {
                modalText.innerText = result;
                modal.style.display = 'flex';
                document.body.classList.add('modal-open');
                banduraImg.src = 'bandura-idle.png';
                textField.value = "";
                if (banduraWrapper) banduraWrapper.classList.remove('jump-bar-animation');
            }, 1000);

        } catch (error) {
            console.error("Помилка:", error);
            textField.value = "Помилка зв'язку";
            banduraImg.src = 'bandura-idle.png';
            setTimeout(() => { textField.value = ""; }, 2000);
        }
    }

    // 2. Обробка натискань
    document.getElementById('btn-search').addEventListener('click', (e) => {
        e.preventDefault();
        performSearch();
    });

    textField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });

    // 3. Мікрофон
    const micBtn = document.getElementById('btn-mic');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (micBtn && SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'uk-UA';
        micBtn.onclick = () => {
            recognition.start();
            banduraImg.src = 'bandura-listening.png';
            textField.value = "Слухаю...";
        };
        recognition.onresult = (e) => {
            textField.value = e.results[0][0].transcript;
            performSearch();
        };
    }

    // 4. Закриття модалки
    document.getElementById('modal-close-btn').onclick = () => {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        window.speechSynthesis.cancel();
    };

    window.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
            window.speechSynthesis.cancel();
        }
    };
});
// --- ФУНКЦІЇ ДЛЯ МЕНЮ (Колективи) ---

// 1. Функція відкриття/закриття випадаючого списку
function toggleDropdown(id) {
    const dropdown = document.getElementById(id);
    if (dropdown) {
        // Закриваємо інші відкриті меню, якщо вони є
        document.querySelectorAll('.dropdown-content').forEach(content => {
            if (content.id !== id) content.style.display = 'none';
        });
        
        // Перемикаємо поточне
        const isVisible = dropdown.style.display === 'block';
        dropdown.style.display = isVisible ? 'none' : 'block';
    }
}

// 2. Функція фільтрації (те, що ви просили повернути)
function filterCollectives(category) {
    console.log("Вибрано категорію з меню:", category);
    
    // Закриваємо меню після кліку
    const menu = document.getElementById('collectivesMenu');
    if (menu) menu.style.display = 'none';

    // Отримуємо поле пошуку
    const textField = document.getElementById('bandura-text-field');
    
    if (textField) {
        // Створюємо зрозумілий запит для ШІ залежно від вибору
        const queries = {
            'vocal': 'Вокальні колективи',
            'instrumental': 'Інструментальні колективи',
            'choreographic': 'Хореографічні колективи',
            'theatrical': 'Театральні колективи'
        };

        const searchQuery = queries[category] || category;
        textField.value = searchQuery;

        // Автоматично запускаємо пошук Бандурою
        if (typeof performSearch === 'function') {
            performSearch(searchQuery);
        }
    }
}

// Закриття меню, якщо клікнули в іншому місці сайту
window.addEventListener('click', function(e) {
    if (!e.target.matches('.dropdown-toggle')) {
        document.querySelectorAll('.dropdown-content').forEach(content => {
            content.style.display = 'none';
        });
    }
});
