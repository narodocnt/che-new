// --- ФУНКЦІЇ МОДАЛКИ (Глобальні) ---
let lastResultText = ""; 
let isSpeaking = false;

function openModal(text) {
    console.log("Спроба відкрити модалку з текстом:", text); 
    const modal = document.getElementById('result-modal');
    const modalText = document.getElementById('modal-text');
    
    if (!modal || !modalText) {
        console.error("Помилка: Елементи модального вікна не знайдені в HTML!");
        return;
    }

    lastResultText = text;
    modalText.innerText = text;
    
    // Показуємо модалку
    modal.style.display = 'flex';
    // Блокуємо скрол основного сайту (для вашого нового CSS)
    document.body.classList.add('modal-open');
}

function closeModalFunc() {
    const modal = document.getElementById('result-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        
        // Зупиняємо озвучку при закритті
        window.speechSynthesis.cancel();
        isSpeaking = false;
        const voiceBtn = document.getElementById('btn-voice');
        if (voiceBtn) voiceBtn.innerText = "🔊 Слухати повністю";
    }
}

// --- ГОЛОВНИЙ СКРИПТ (Чекаємо завантаження DOM) ---
document.addEventListener('DOMContentLoaded', () => {
    const textField = document.getElementById('bandura-text-field');
    const banduraImg = document.getElementById('bandura-image');
    const banduraWrapper = document.querySelector('.bandura-standalone-avatar');

    // Функція зміни емоцій Бандури
    function setEmotion(state) {
        if (!banduraImg) return;
        const emotions = {
            'listening': 'bandura-listening.png',
            'thinking': 'bandura-thinking.png',
            'pointing': 'bandura-pointing.png',
            'idle': 'bandura-idle.png'
        };
        banduraImg.src = emotions[state] || emotions['idle'];
    }

    // Основна функція пошуку
    async function performSearch(query) {
        if (!query || query === "" || query === "Слухаю...") return;

        setEmotion('thinking');
        const originalValue = textField.value;
        textField.value = `Шукаю ${query.toLowerCase()}...`;

        try {
            console.log("Відправка запиту до n8n...");
            const response = await fetch('https://n8n.narodocnt.online/webhook/search-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query })
            });

            const data = await response.json();
            
            // n8n може повертати результат у полі 'output' або 'text'
            const result = data.output || data.text || "На жаль, нічого не знайдено за вашим запитом.";
            console.log("Отримано дані від n8n:", result);

            setEmotion('pointing');
            textField.value = "Знайшла!";
            
            // Додаємо анімацію стрибка контейнеру Бандури
            if (banduraWrapper) banduraWrapper.classList.add('jump-bar-animation');

            // Невелика затримка для ефекту "стрибка" перед відкриттям модалки
            setTimeout(() => {
                if (banduraWrapper) banduraWrapper.classList.remove('jump-bar-animation');
                
                openModal(result); 

                setTimeout(() => {
                    setEmotion('idle');
                    textField.value = "";
                }, 3000);
            }, 1200);

        } catch (e) {
            console.error("Помилка зв'язку з сервером:", e);
            setEmotion('idle');
            textField.value = "Помилка мережі";
            setTimeout(() => { textField.value = ""; }, 3000);
        }
    }

    // --- ОБРОБКА ПОДІЙ ---

    // Кнопка Мікрофона
    const micBtn = document.getElementById('btn-mic');
    if (micBtn) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'uk-UA';
            
            micBtn.onclick = () => { 
                recognition.start(); 
                setEmotion('listening'); 
                textField.value = "Слухаю..."; 
            };
            
            recognition.onresult = (e) => {
                const transcript = e.results[0][0].transcript;
                performSearch(transcript);
            };

            recognition.onerror = () => {
                setEmotion('idle');
                textField.value = "Помилка мікрофона";
            };
        } else {
            micBtn.style.display = 'none'; // Ховаємо кнопку, якщо браузер не підтримує голос
        }
    }

    // Кнопка Лупи (Пошук)
    const searchBtn = document.getElementById('btn-search');
    if (searchBtn) {
        searchBtn.onclick = () => performSearch(textField.value.trim());
    }

    // Клавіша Enter в полі вводу
    if (textField) {
        textField.onkeypress = (e) => { 
            if (e.key === 'Enter') performSearch(textField.value.trim()); 
        };
    }

    // Кнопка Озвучки в модалці
    const voiceBtn = document.getElementById('btn-voice');
    if (voiceBtn) {
        voiceBtn.onclick = () => {
            if (isSpeaking) {
                window.speechSynthesis.cancel();
                isSpeaking = false;
                voiceBtn.innerText = "🔊 Слухати повністю";
            } else {
                if (!lastResultText) return;
                
                const ut = new SpeechSynthesisUtterance(lastResultText);
                ut.lang = 'uk-UA';
                
                ut.onstart = () => {
                    isSpeaking = true;
                    voiceBtn.innerText = "⏹ Зупинити";
                };
                
                ut.onend = () => {
                    isSpeaking = false;
                    voiceBtn.innerText = "🔊 Слухати повністю";
                };
                
                window.speechSynthesis.speak(ut);
            }
        };
    }

    // Закриття модалки при кліку на хрестик (якщо він є)
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.onclick = closeModalFunc;
    }

    // Закриття модалки при кліку на темний фон
    window.onclick = (e) => { 
        if (e.target == document.getElementById('result-modal')) {
            closeModalFunc();
        } 
    };
});
