// --- ФУНКЦІЇ МОДАЛКИ (Глобальні) ---
let lastResultText = ""; 
let isSpeaking = false;

function openModal(text) {
    console.log("Спроба відкрити модалку з текстом:", text); // Для відладки
    const modal = document.getElementById('result-modal');
    const modalText = document.getElementById('modal-text');
    
    if (!modal || !modalText) {
        console.error("Помилка: Не знайдено 'result-modal' або 'modal-text' в HTML!");
        alert("Помилка: Елементи модального вікна не знайдені!");
        return;
    }

    lastResultText = text;
    modalText.innerText = text;
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
}

function closeModalFunc() {
    const modal = document.getElementById('result-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        window.speechSynthesis.cancel();
        isSpeaking = false;
        const voiceBtn = document.getElementById('btn-voice');
        if (voiceBtn) voiceBtn.innerText = "🔊 Слухати повністю";
    }
}

// --- ГОЛОВНИЙ СКРИПТ ---
document.addEventListener('DOMContentLoaded', () => {
    const textField = document.getElementById('bandura-text-field');
    const banduraImg = document.getElementById('bandura-image');
    const banduraWrapper = document.querySelector('.bandura-standalone-avatar');

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

    async function performSearch(query) {
        if (!query || query === "Слухаю...") return;

        setEmotion('thinking');
        textField.value = `Шукаю ${query.toLowerCase()}...`;

        try {
            console.log("Відправка запиту до n8n...");
            const response = await fetch('https://n8n.narodocnt.online/webhook/search-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query })
            });

            const data = await response.json();
            const result = data.output || "Нічого не знайдено...";
            console.log("Отримано дані від n8n:", result);

            setEmotion('pointing');
            textField.value = "Знайшла!";
            
            if (banduraWrapper) banduraWrapper.classList.add('jump-bar-animation');

            // Затримка, щоб Бандура встигла "показати пальцем" і "стрибнути"
            setTimeout(() => {
                if (banduraWrapper) banduraWrapper.classList.remove('jump-bar-animation');
                
                openModal(result); // ВИКЛИК МОДАЛКИ

                setTimeout(() => {
                    setEmotion('idle');
                    textField.value = "";
                }, 3000);
            }, 1500);

        } catch (e) {
            console.error("Помилка під час fetch:", e);
            setEmotion('idle');
            textField.value = "Помилка зв'язку";
        }
    }

    // Події кнопок (Лупа, Мікрофон, Enter)
    const micBtn = document.getElementById('btn-mic');
    const searchBtn = document.getElementById('btn-search');

    if (micBtn) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'uk-UA';
            micBtn.onclick = () => { recognition.start(); setEmotion('listening'); textField.value = "Слухаю..."; };
            recognition.onresult = (e) => performSearch(e.results[0][0].transcript);
        }
    }

    if (searchBtn) {
        searchBtn.onclick = () => performSearch(textField.value.trim());
    }

    textField.onkeypress = (e) => { if (e.key === 'Enter') performSearch(textField.value.trim()); };

    // Озвучка в модалці
    const voiceBtn = document.getElementById('btn-voice');
    if (voiceBtn) {
        voiceBtn.onclick = () => {
            if (isSpeaking) {
                window.speechSynthesis.cancel();
                isSpeaking = false;
                voiceBtn.innerText = "🔊 Слухати повністю";
            } else {
                const ut = new SpeechSynthesisUtterance(lastResultText);
                ut.lang = 'uk-UA';
                ut.onend = () => { isSpeaking = false; voiceBtn.innerText = "🔊 Слухати повністю"; };
                window.speechSynthesis.speak(ut);
                isSpeaking = true;
                voiceBtn.innerText = "⏹ Зупинити";
            }
        };
    }

    // Закриття кліком по фону
    window.onclick = (e) => { if (e.target == document.getElementById('result-modal')) closeModalFunc(); };
});
