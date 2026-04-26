document.addEventListener('DOMContentLoaded', () => {
    const banduraImg = document.getElementById('bandura-image');
    const textArea = document.getElementById('bandura-text-area');
    const container = document.getElementById('bandura-container');
    const modal = document.getElementById('result-modal');
    const modalText = document.getElementById('modal-text');
    const voiceBtn = document.getElementById('btn-voice');

    let lastResult = "";
    let isSpeaking = false;

    // Функція зміни емоцій
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

    // Функція пошуку
    async function performSearch() {
        const query = textArea.value.trim();
        if (!query || query.startsWith("Шукаю")) return;

        setEmotion('thinking');
        const userQuery = query; // зберігаємо чистий запит
        textArea.value = `Шукаю ${userQuery.toLowerCase()}...`;
        
        // Авто-розмір віконця
        textArea.style.height = 'auto';
        textArea.style.height = textArea.scrollHeight + 'px';

        try {
            const response = await fetch('https://n8n.narodocnt.online/webhook/search-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userQuery })
            });

            const data = await response.json();
            lastResult = data.output || "Нічого не знайшла...";

            textArea.value = "Знайшла!";
            setEmotion('pointing');
            container.classList.add('jump-animation');

            setTimeout(() => {
                container.classList.remove('jump-animation');
                modalText.innerText = lastResult;
                modal.style.display = 'flex'; // ПОКАЗУЄМО ВІКНО
                
                setTimeout(() => {
                    setEmotion('idle');
                    textArea.value = "";
                    textArea.style.height = 'auto';
                }, 3000);
            }, 2000);

        } catch (e) {
            textArea.value = "Помилка мережі";
            setEmotion('idle');
        }
    }

    // Мікрофон
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'uk-UA';

        document.getElementById('btn-mic').onclick = () => {
            recognition.start();
            setEmotion('listening');
            textArea.value = "Слухаю...";
        };

        recognition.onresult = (event) => {
            textArea.value = event.results[0][0].transcript;
            performSearch();
        };
        
        recognition.onend = () => { if(textArea.value === "Слухаю...") setEmotion('idle'); };
    }

    // Кнопка пошуку (лупа)
    document.getElementById('btn-search').onclick = performSearch;

    // Закриття модалки
    document.querySelector('.close-modal').onclick = () => {
        modal.style.display = 'none';
        window.speechSynthesis.cancel();
    };

    // Озвучка (Toggle)
    voiceBtn.onclick = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            isSpeaking = false;
            voiceBtn.innerText = "🔊 Слухати";
        } else {
            const ut = new SpeechSynthesisUtterance(lastResult);
            ut.lang = 'uk-UA';
            ut.onend = () => { isSpeaking = false; voiceBtn.innerText = "🔊 Слухати"; };
            window.speechSynthesis.speak(ut);
            isSpeaking = true;
            voiceBtn.innerText = "⏹ Зупинити";
        }
    };
});

// Функція відкриття модалки
function openModal(text) {
    const modal = document.getElementById('result-modal');
    document.getElementById('modal-text').innerText = text;
    modal.style.display = 'flex';
    document.body.classList.add('modal-open'); // Блокуємо скрол сайту
}

// Функція закриття модалки
function closeModalFunc() {
    const modal = document.getElementById('result-modal');
    modal.style.display = 'none';
    document.body.classList.remove('modal-open'); // Повертаємо скрол сайту
    window.speechSynthesis.cancel();
}

// Закриття по хрестику
document.querySelector('.close-modal').onclick = closeModalFunc;

// ЗАКРИТТЯ ПРИ КЛІКУ ПОЗА ВІКНОМ
window.onclick = function(event) {
    const modal = document.getElementById('result-modal');
    if (event.target == modal) {
        closeModalFunc();
    }
};

// Оновіть вашу функцію performSearch, щоб вона використовувала openModal:
// Замість modal.style.display = 'flex'; напишіть:
// openModal(lastResultText);
document.addEventListener('DOMContentLoaded', () => {
    const barTextField = document.getElementById('bandura-text-field');
    const banduraImg = document.getElementById('bandura-image');
    const loader = document.getElementById('bandura-bar-loader');
    
    // Фрази-заглушки
    const idlePhrases = ["Питання є?", "Хто шукає, той находить!"];
    let phraseIdx = 0;
    setInterval(() => {
        if (!barTextField.value || idlePhrases.includes(barTextField.value)) {
            phraseIdx = (phraseIdx + 1) % idlePhrases.length;
            barTextField.placeholder = idlePhrases[phraseIdx];
            barTextField.value = ""; // очищаємо, щоб було видно placeholder
        }
    }, 10000);

    async function performSearch(query) {
        if (!query) return;

        // Зміна емоції на "думає"
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
            
            // Стан "Знайшла"
            banduraImg.src = 'bandura-pointing.png';
            barTextField.value = "Знайшла!";
            loader.style.display = 'none';

            // Відкриваємо ваше модальне вікно (воно вже налаштоване)
            setTimeout(() => {
                openModal(data.output || "Нічого не знайдено");
                // Повернення до норми
                setTimeout(() => {
                    banduraImg.src = 'bandura-idle.png';
                    barTextField.value = "";
                }, 3000);
            }, 1000);

        } catch (e) {
            barTextField.value = "Помилка зв'язку...";
            banduraImg.src = 'bandura-idle.png';
            loader.style.display = 'none';
        }
    }

    // Мікрофон
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
            performSearch(transcript); // Відправляємо розпізнаний текст у пошук
        };
    }

    // Кнопка лупи
    document.getElementById('btn-search').onclick = () => {
        // Якщо користувач вписав щось вручну (якщо прибрати readonly) або просто клікнув
        const q = barTextField.value;
        if (q && q !== "Слухаю...") performSearch(q);
    };
});
