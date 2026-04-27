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
