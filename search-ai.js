/**
 * Розумний помічник "Бандура" для ОЦНТ
 */

// 1. Налаштування коротких гуморних фраз
const banduraPhrases = [
    "Ось, що мені вдалося вибринькати!",
    "Дивись, які соловейки у нас є!",
    "Зараз розкажу, тільки струни підтягну...",
    "Ось що я знайшла в наших архівах!",
    "Тримай, це саме те, що ти шукав!",
    "Поглянь-но на ці таланти!"
];

let lastResultText = ""; // Змінна для зберігання повного тексту відповіді

// Функція для коротких реплік Бандури
function speakShort(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'uk-UA';
        utterance.pitch = 1.4; // Мультяшний голос
        window.speechSynthesis.speak(utterance);
    }
}

// Функція для повного озвучення (по кліку на динамік)
function speakFull(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'uk-UA';
        utterance.pitch = 1.0; // Більш природний голос
        window.speechSynthesis.speak(utterance);
    }
}

// 2. Керування станами Бандури
function changeBanduraState(state) {
    const bandura = document.getElementById('bandura-ai');
    const bubble = document.getElementById('ai-text-bubble');
    
    // Шляхи до файлів (якщо вони в корені, залиш порожньо або 'assets/')
    const path = ''; 

    switch(state) {
        case 'listening':
            if(bandura) bandura.src = `${path}bandura-listening.png`;
            if(bubble) bubble.innerText = "Слухаю...";
            break;
        case 'thinking':
            if(bandura) bandura.src = `${path}bandura-thinking.png`;
            if(bubble) bubble.innerText = "Шукаю...";
            break;
        case 'pointing':
            if(bandura) bandura.src = `${path}bandura-pointing.png`;
            if(bubble) bubble.innerText = "Є результат!";
            break;
        default:
            if(bandura) bandura.src = `${path}bandura-idle.png`;
            if(bubble) bubble.innerText = "Я тут!";
    }
}

// 3. Основна логіка пошуку
async function performSearch() {
    const searchInput = document.getElementById('search-input');
    const responseContainer = document.getElementById('ai-response-container');
    const responseText = document.getElementById('ai-response-text');

    const query = searchInput.value.trim();
    if (!query) return;

    // Починаємо пошук
    changeBanduraState('thinking');
    if(responseContainer) responseContainer.style.display = 'block';
    if(responseText) responseText.innerText = "Зараз знайду...";

    try {
        const response = await fetch('https://n8n.narodocnt.online/webhook/search-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query })
        });

        if (!response.ok) throw new Error('Помилка сервера');

        const data = await response.json();
        lastResultText = data.output || "Вибачте, нічого не знайшла.";

        // Виводимо результат у табличку/рамку
        if(responseText) responseText.innerText = lastResultText;
        
        // Бандура вказує на результат
        changeBanduraState('pointing');

        // Бандура каже смішну коротку фразу
        const randomPhrase = banduraPhrases[Math.floor(Math.random() * banduraPhrases.length)];
        speakShort(randomPhrase);

    } catch (error) {
        console.error("Помилка:", error);
        changeBanduraState('idle');
        if(responseText) responseText.innerText = "Ой, щось пішло не так. Спробуйте ще раз.";
    }
}

// 4. Ініціалізація та обробники
document.addEventListener('DOMContentLoaded', () => {
    const micBtn = document.getElementById('mic-btn');
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const speakBtn = document.getElementById('read-aloud-btn');

    // Встановлюємо початковий стан (Бандура idle)
    changeBanduraState('idle');

    // Кнопка пошуку
    if (searchBtn) searchBtn.addEventListener('click', performSearch);

    // Enter
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }

    // Динамік для повної озвучки
    if (speakBtn) {
        speakBtn.addEventListener('click', () => {
            if(lastResultText) speakFull(lastResultText);
        });
    }

    // Голосове введення
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && micBtn) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'uk-UA';

        micBtn.onclick = () => {
            recognition.start();
            changeBanduraState('listening');
            micBtn.style.color = 'red';
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if(searchInput) searchInput.value = transcript;
            performSearch();
        };

        recognition.onend = () => {
            micBtn.style.color = '';
        };
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const banduraAvatar = document.getElementById('bandura-avatar');
    const textArea = document.getElementById('bandura-text-area');
    const micBtn = document.getElementById('btn-mic');
    const searchBtn = document.getElementById('btn-search');
    
    let isSpeaking = false;
    const synth = window.speechSynthesis;

    // --- Логіка розумного віконця (Питання є? / Питань нема?) ---
    const placeholderPhrases = ["Питання є?", "Питань нема?"];
    let phraseIndex = 0;

    function cyclePlaceholders() {
        // Змінюємо фразу лише якщо користувач нічого не ввів
        if (textArea.value.trim() === "") {
            phraseIndex = (phraseIndex + 1) % placeholderPhrases.length;
            textArea.placeholder = placeholderPhrases[phraseIndex];
        }
    }
    // Запускаємо цикл кожні 30 секунд
    setInterval(cyclePlaceholders, 30000); 


    // --- Логіка пошуку та анімації ---
    function performSearch() {
        const query = textArea.value.trim();
        if (query === "") {
            textArea.placeholder = "Спочатку напишіть або скажіть щось...";
            return;
        }

        // Крок 1: Бандура каже, що шукає
        textArea.value = "Шукаю...";
        
        // Моделюємо час пошуку (наприклад, 2 секунди)
        setTimeout(() => {
            // Крок 2: Бандура каже, що знайшла
            textArea.value = "Знайшла!";
            
            // Крок 3: Запускаємо анімацію стрибка
            banduraAvatar.classList.add('jump-animation');
            
            // Прибираємо клас анімації після завершення, щоб можна було стрибнути знову
            setTimeout(() => {
                banduraAvatar.classList.remove('jump-animation');
                
                // --- Тут ваша логіка для відображення результатів ---
                // Наприклад: openModal("Ось що я знайшла за запитом: " + query);
                // textArea.value = ""; // Очищаємо поле після пошуку
            }, 2000); // Час анімації

        }, 2000); // Час "пошуку"
    }

    searchBtn.addEventListener('click', performSearch);


    // --- Логіка Мікрофона (Speech Recognition) ---
    // Перевірка, чи підтримує браузер розпізнавання мови
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'uk-UA'; // Українська мова

        micBtn.addEventListener('click', () => {
            recognition.start();
            textArea.value = "Слухаю..."; // Статус у віконці
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            textArea.value = transcript; // Текст з'являється у розумному віконці
        };

        recognition.onerror = (event) => {
            console.error("Помилка розпізнавання:", event.error);
            textArea.value = "Не почула, повторіть...";
        };
    } else {
        micBtn.style.display = 'none'; // Ховаємо кнопку, якщо браузер не підтримує
        console.log("Браузер не підтримує розпізнавання мови.");
    }
});
