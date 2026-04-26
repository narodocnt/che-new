// Глобальні змінні для озвучки
let lastResultText = ""; 
let isSpeaking = false;

// --- ФУНКЦІЇ КЕРУВАННЯ МОДАЛКОЮ ---
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
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        window.speechSynthesis.cancel();
        isSpeaking = false;
        const voiceBtn = document.getElementById('btn-voice');
        if (voiceBtn) voiceBtn.innerText = "🔊 Слухати повністю";
    }
}

// --- ГОЛОВНИЙ СКРИПТ ПАНЕЛІ ---
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
        if (!query || query === "" || query === "Слухаю...") return;
        
        setEmotion('thinking');
        textField.value = `Шукаю ${query.toLowerCase()}...`;

        try {
            const response = await fetch('https://n8n.narodocnt.online/webhook/search-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query })
            });
            const data = await response.json();
            const result = data.output || data.text || "Нічого не знайдено";

            setEmotion('pointing');
            textField.value = "Знайшла!";
            if (banduraWrapper) banduraWrapper.classList.add('jump-bar-animation');

            setTimeout(() => {
                if (banduraWrapper) banduraWrapper.classList.remove('jump-bar-animation');
                
                openModal(result); // ТЕПЕР МОДАЛКА ВИКЛИКАЄТЬСЯ ТУТ

                setTimeout(() => {
                    setEmotion('idle');
                    textField.value = "";
                }, 3000);
            }, 1200);
        } catch (e) {
            setEmotion('idle');
            textField.value = "Помилка зв'язку";
        }
    }

    // Події кнопок пошуку
    document.getElementById('btn-search').onclick = () => performSearch(textField.value.trim());
    textField.onkeypress = (e) => { if (e.key === 'Enter') performSearch(textField.value.trim()); };

    // Подія мікрофона
    const micBtn = document.getElementById('btn-mic');
    if (micBtn) {
        const rec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (rec) {
            const recognition = new rec();
            recognition.lang = 'uk-UA';
            micBtn.onclick = () => { recognition.start(); setEmotion('listening'); textField.value = "Слухаю..."; };
            recognition.onresult = (e) => performSearch(e.results[0][0].transcript);
        }
    }

    // Події закриття модалки
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) closeBtn.onclick = closeModalFunc;

    window.onclick = (e) => {
        if (e.target == document.getElementById('result-modal')) closeModalFunc();
    };

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
});
