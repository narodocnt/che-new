document.addEventListener('DOMContentLoaded', () => {
    // Елементи панелі
    const barTextField = document.getElementById('bandura-text-field');
    const banduraImg = document.getElementById('bandura-image');
    const loader = document.getElementById('bandura-bar-loader');
    
    // Елементи модалки
    const modal = document.getElementById('result-modal');
    const modalText = document.getElementById('modal-text');
    const voiceBtn = document.getElementById('btn-voice');
    const closeBtn = document.querySelector('.close-modal');

    let lastResult = "";
    let isSpeaking = false;

    // 1. АВТОМАТИЧНІ ПІДКАЗКИ (зміна placeholder)
    const idlePhrases = ["Питання є?", "Хто шукає, той находить!"];
    let phraseIdx = 0;
    setInterval(() => {
        if (!barTextField.value || idlePhrases.includes(barTextField.value)) {
            phraseIdx = (phraseIdx + 1) % idlePhrases.length;
            barTextField.placeholder = idlePhrases[phraseIdx];
            barTextField.value = ""; 
        }
    }, 8000);

    // 2. ФУНКЦІЯ ВІДКРИТТЯ МОДАЛКИ
    function openModal(text) {
        lastResult = text;
        modalText.innerText = text;
        modal.style.display = 'flex';
        document.body.classList.add('modal-open'); // Блокуємо скрол сайту
    }

    // 3. ФУНКЦІЯ ЗАКРИТТЯ МОДАЛКИ
    function closeModalFunc() {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open'); // Повертаємо скрол
        window.speechSynthesis.cancel();
        isSpeaking = false;
        if (voiceBtn) voiceBtn.innerText = "🔊 Слухати повністю";
    }

    // 4. ГОЛОВНА ФУНКЦІЯ ПОШУКУ
    async function performSearch(query) {
        if (!query || query === "Слухаю...") return;

        // Бандура "думає"
        banduraImg.src = 'bandura-thinking.png';
        barTextField.value = `Шукаю ${query.toLowerCase()}...`;
        loader.style.display = 'block';

        try {
            const response = await fetch('https://n8n.narodocnt.online/webhook/search-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query })
            });

            const data = await response.json();
            const result = data.output || "Вибачте, нічого не знайшла...";

            // Бандура "знайшла"
            banduraImg.src = 'bandura-pointing.png';
            barTextField.value = "Знайшла!";
            loader.style.display = 'none';

            // Відкриваємо результат
            setTimeout(() => {
                openModal(result);
                
                // Через 3 секунди повертаємо Бандуру в режим очікування
                setTimeout(() => {
                    banduraImg.src = 'bandura-idle.png';
                    barTextField.value = "";
                }, 3000);
            }, 800);

        } catch (e) {
            console.error(e);
            barTextField.value = "Помилка зв'язку...";
            banduraImg.src = 'bandura-idle.png';
            loader.style.display = 'none';
        }
    }

    // 5. ГОЛОСОВЕ КЕРУВАННЯ (МІКРОФОН)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'uk-UA';

        document.getElementById('btn-mic').onclick = () => {
            recognition.start();
            banduraImg.src = 'bandura-listening.png';
            barTextField.value = "Слухаю...";
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            performSearch(transcript);
        };

        recognition.onend = () => {
            if (barTextField.value === "Слухаю...") {
                banduraImg.src = 'bandura-idle.png';
                barTextField.value = "";
            }
        };
    }

    // 6. КНОПКА ЛУПИ
    document.getElementById('btn-search').onclick = () => {
        const q = barTextField.value;
        if (q && !q.startsWith("Шукаю") && q !== "Слухаю...") {
            performSearch(q);
        }
    };

    // 7. КЕРУВАННЯ МОДАЛКОЮ (Закриття та Озвучка)
    if (closeBtn) closeBtn.onclick = closeModalFunc;

    window.onclick = (event) => {
        if (event.target == modal) closeModalFunc();
    };

    if (voiceBtn) {
        voiceBtn.onclick = () => {
            if (isSpeaking) {
                window.speechSynthesis.cancel();
                isSpeaking = false;
                voiceBtn.innerText = "🔊 Слухати повністю";
            } else {
                const ut = new SpeechSynthesisUtterance(lastResult);
                ut.lang = 'uk-UA';
                ut.onend = () => { 
                    isSpeaking = false; 
                    voiceBtn.innerText = "🔊 Слухати повністю"; 
                };
                window.speechSynthesis.speak(ut);
                isSpeaking = true;
                voiceBtn.innerText = "⏹ Зупинити";
            }
        };
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const textField = document.getElementById('bandura-text-field');
    const banduraImg = document.getElementById('bandura-image');
    const banduraWrapper = document.querySelector('.bandura-standalone-avatar');
    
    // 1. АВТОМАТИЧНІ ПІДКАЗКИ
    const idlePhrases = ["Питання є?", "Хто шукає, той находить!"];
    let phraseIdx = 0;
    setInterval(() => {
        // Змінюємо placeholder, якщо поле порожнє
        if (!textField.value) {
            phraseIdx = (phraseIdx + 1) % idlePhrases.length;
            textField.placeholder = idlePhrases[phraseIdx];
        }
    }, 8000);

    // 2. ФУНКЦІЯ ЗМІНИ ЕМОЦІЙ (Вони повернулися!)
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

    // 3. ОСНОВНА ФУНКЦІЯ ПОШУКУ
    async function performSearch(query) {
        if (!query || query === "Слухаю...") return;

        // Бандура "думає"
        setEmotion('thinking');
        const originalQuery = query; // зберігаємо чистий запит

        // Підставляємо фрази "Шукаю [запит]..."
        textField.value = `Шукаю ${originalQuery.toLowerCase()}...`;
        textField.blur(); // Прибираємо фокус з поля

        try {
            const response = await fetch('https://n8n.narodocnt.online/webhook/search-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: originalQuery })
            });

            const data = await response.json();
            const result = data.output || "Вибачте, нічого не знайшла...";

            // Бандура "знайшла"
            setEmotion('pointing');
            textField.value = "Знайшла!";
            
            // Стрибок окремої Бандури
            banduraWrapper.classList.add('jump-bar-animation');

            // Відкриваємо модалку (openModal - функція має бути в цьому файлі)
            setTimeout(() => {
                banduraWrapper.classList.remove('jump-bar-animation');
                openModal(result);
                
                // Через 3 секунди повертаємо Бандуру в режим очікування
                setTimeout(() => {
                    setEmotion('idle');
                    textField.value = ""; // Очищаємо поле
                }, 3000);
            }, 2000);

        } catch (e) {
            setEmotion('idle');
            textField.value = "Помилка зв'язку";
        }
    }

    // 4. МІКРОФОН (Слухає -> Шукає)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'uk-UA';

        document.getElementById('btn-mic').onclick = () => {
            recognition.start();
            setEmotion('listening');
            textField.value = "Слухаю...";
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            performSearch(transcript); // Текст автоматично потрапить у фразу "Шукаю..."
        };
        
        recognition.onend = () => { if(textField.value === "Слухаю...") { setEmotion('idle'); textField.value = ""; } };
    }

    // 5. ПОШУК ЧЕРЕЗ ЛУПУ АБО ENTER
    function startManualSearch() {
        const q = textField.value.trim();
        // Перевіряємо, що це не системні фрази
        if (q && !q.startsWith("Шукаю") && q !== "Слухаю...") {
            performSearch(q);
        }
    }

    document.getElementById('btn-search').onclick = startManualSearch;

    textField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') startManualSearch();
    });
});

// !!! Також переконайтеся, що у вас в JS файлі є функції 
// openModal() та closeModalFunc(), які ми обговорювали раніше.
