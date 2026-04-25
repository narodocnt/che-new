/**
 * Оновлений інтелектуальний помічник "Бандура"
 */

document.addEventListener('DOMContentLoaded', () => {
    // Елементи інтерфейсу
    const banduraContainer = document.getElementById('bandura-container');
    const textArea = document.getElementById('bandura-text-area');
    const micBtn = document.getElementById('btn-mic');
    const searchBtn = document.getElementById('btn-search');
    const modal = document.getElementById('result-modal');
    const modalText = document.getElementById('modal-text');
    const closeModal = document.querySelector('.close-modal');
    const voiceBtn = document.getElementById('btn-voice');

    let lastResultText = "";
    let isSpeaking = false;
    const synth = window.speechSynthesis;

    // 1. Авто-збільшення віконця при вводі
    textArea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // 2. Циклічні фрази (Питання є? / Питань нема?)
    const placeholderPhrases = ["Питання є?", "Питань нема?"];
    let phraseIndex = 0;
    setInterval(() => {
        if (textArea.value.trim() === "") {
            phraseIndex = (phraseIndex + 1) % placeholderPhrases.length;
            textArea.placeholder = placeholderPhrases[phraseIndex];
        }
    }, 30000);

    // 3. Функція озвучки (On/Off)
    function toggleSpeech(text) {
        if (isSpeaking) {
            synth.cancel();
            isSpeaking = false;
            if(voiceBtn) voiceBtn.innerText = "🔊 Слухати";
        } else {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'uk-UA';
            utterance.onend = () => {
                isSpeaking = false;
                if(voiceBtn) voiceBtn.innerText = "🔊 Слухати";
            };
            synth.speak(utterance);
            isSpeaking = true;
            if(voiceBtn) voiceBtn.innerText = "⏹ Зупинити";
        }
    }

    if(voiceBtn) {
        voiceBtn.onclick = () => toggleSpeech(lastResultText);
    }

    // 4. Основна функція пошуку (Зв'язок з n8n)
    async function performSearch() {
        const query = textArea.value.trim();
        if (!query || query === "Шукаю..." || query === "Слухаю...") return;

        // Статус: Шукаю
        textArea.value = "Шукаю...";
        
        try {
            const response = await fetch('https://n8n.narodocnt.online/webhook/search-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query })
            });

            if (!response.ok) throw new Error('Помилка сервера');

            const data = await response.json();
            lastResultText = data.output || "Вибачте, нічого не знайшла.";

            // Статус: Знайшла + Стрибок
            textArea.value = "Знайшла!";
            banduraContainer.classList.add('jump-animation');

            setTimeout(() => {
                banduraContainer.classList.remove('jump-animation');
                // Відкриваємо модалку з результатом
                modalText.innerText = lastResultText;
                modal.style.display = 'flex';
            }, 2000);

        } catch (error) {
            console.error("Помилка:", error);
            textArea.value = "Ой, помилка зв'язку...";
            setTimeout(() => { textArea.value = ""; }, 3000);
        }
    }

    searchBtn.addEventListener('click', performSearch);
    
    // Пошук по Enter
    textArea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            performSearch();
        }
    });

    // 5. Голосове введення
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'uk-UA';

        micBtn.onclick = () => {
            recognition.start();
            textArea.value = "Слухаю...";
            micBtn.classList.add('mic-active');
        };

        recognition.onresult = (event) => {
            textArea.value = event.results[0][0].transcript;
            performSearch();
        };

        recognition.onend = () => {
            micBtn.classList.remove('mic-active');
        };
    }

    // Закриття модалки
    if(closeModal) {
        closeModal.onclick = () => {
            modal.style.display = 'none';
            synth.cancel(); // Зупиняємо голос при закритті
            isSpeaking = false;
            if(voiceBtn) voiceBtn.innerText = "🔊 Слухати";
        };
    }
});
