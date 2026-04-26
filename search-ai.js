// 1. ФУНКЦІЇ МОДАЛКИ (Винесені назовні, щоб усі їх бачили)
let lastResultText = ""; 
let isSpeaking = false;

function openModal(text) {
    const modal = document.getElementById('result-modal');
    const modalText = document.getElementById('modal-text');
    if (modal && modalText) {
        lastResultText = text;
        modalText.innerText = text;
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    }
}

function closeModalFunc() {
    const modal = document.getElementById('result-modal');
    const voiceBtn = document.getElementById('btn-voice');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        window.speechSynthesis.cancel();
        isSpeaking = false;
        if (voiceBtn) voiceBtn.innerText = "🔊 Слухати повністю";
    }
}

// 2. ГОЛОВНИЙ СКРИПТ ПАНЕЛІ ТА БАНДУРИ
document.addEventListener('DOMContentLoaded', () => {
    const textField = document.getElementById('bandura-text-field');
    const banduraImg = document.getElementById('bandura-image');
    const banduraWrapper = document.querySelector('.bandura-standalone-avatar');
    const voiceBtn = document.getElementById('btn-voice');
    const closeBtn = document.querySelector('.close-modal');

    // Автоматичні підказки
    const idlePhrases = ["Питання є?", "Хто шукає, той находить!"];
    let phraseIdx = 0;
    setInterval(() => {
        if (textField && !textField.value) {
            phraseIdx = (phraseIdx + 1) % idlePhrases.length;
            textField.placeholder = idlePhrases[phraseIdx];
        }
    }, 8000);

    // Зміна емоцій
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
        if (!query || query === "Слухаю...") return;

        setEmotion('thinking');
        const originalQuery = query;
        textField.value = `Шукаю ${originalQuery.toLowerCase()}...`;
        textField.blur();

        try {
            const response = await fetch('https://n8n.narodocnt.online/webhook/search-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: originalQuery })
            });

            const data = await response.json();
            const result = data.output || "Вибачте, нічого не знайшла...";

            setEmotion('pointing');
            textField.value = "Знайшла!";
            
            if (banduraWrapper) banduraWrapper.classList.add('jump-bar-animation');

            setTimeout(() => {
                if (banduraWrapper) banduraWrapper.classList.remove('jump-bar-animation');
                openModal(result); // ТЕПЕР ЦЯ ФУНКЦІЯ ПРАЦЮЄ

                setTimeout(() => {
                    setEmotion('idle');
                    textField.value = "";
                }, 3000);
            }, 2000);

        } catch (e) {
            console.error(e);
            setEmotion('idle');
            textField.value = "Помилка зв'язку";
        }
    }

    // Мікрофон
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'uk-UA';

        const micBtn = document.getElementById('btn-mic');
        if (micBtn) {
            micBtn.onclick = () => {
                recognition.start();
                setEmotion('listening');
                textField.value = "Слухаю...";
            };
        }

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            performSearch(transcript);
        };
        
        recognition.onend = () => { 
            if(textField.value === "Слухаю...") { 
                setEmotion('idle'); 
                textField.value = ""; 
            } 
        };
    }

    // Кнопка лупи та Enter
    const searchBtn = document.getElementById('btn-search');
    if (searchBtn) {
        searchBtn.onclick = () => {
            const q = textField.value.trim();
            if (q && !q.startsWith("Шукаю") && q !== "Слухаю...") performSearch(q);
        };
    }

    textField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const q = textField.value.trim();
            if (q && !q.startsWith("Шукаю")) performSearch(q);
        }
    });

    // Керування модалкою (Закриття та Озвучка)
    if (closeBtn) closeBtn.onclick = closeModalFunc;
    
    window.onclick = (event) => {
        const modal = document.getElementById('result-modal');
        if (event.target == modal) closeModalFunc();
    };

    if (voiceBtn) {
        voiceBtn.onclick = () => {
            if (isSpeaking) {
                window.speechSynthesis.cancel();
                isSpeaking = false;
                voiceBtn.innerText = "🔊 Слухати повністю";
            } else {
                const ut = new SpeechSynthesisUtterance(lastResultText);
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
