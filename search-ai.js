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
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        window.speechSynthesis.cancel();
        isSpeaking = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const textField = document.getElementById('bandura-text-field');
    const banduraImg = document.getElementById('bandura-image');
    const banduraWrapper = document.querySelector('.bandura-standalone-avatar');

    async function performSearch(query) {
        if (!query) return;
        banduraImg.src = 'bandura-thinking.png';
        textField.value = "Шукаю...";

        try {
            const res = await fetch('https://n8n.narodocnt.online/webhook/search-ai', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ query: query })
            });
            const data = await res.json();
            const result = data.output || data.text || "Нічого не знайдено";

            banduraImg.src = 'bandura-pointing.png';
            banduraWrapper.classList.add('jump-bar-animation');
            
            setTimeout(() => {
                banduraWrapper.classList.remove('jump-bar-animation');
                openModal(result);
                banduraImg.src = 'bandura-idle.png';
                textField.value = "";
            }, 1200);
        } catch (e) {
            banduraImg.src = 'bandura-idle.png';
            textField.value = "Помилка мережі";
        }
    }

    // Кнопки
    document.getElementById('btn-search').onclick = () => performSearch(textField.value);
    textField.onkeypress = (e) => { if(e.key === 'Enter') performSearch(textField.value); };

    // Закриття
    document.querySelector('.close-modal').onclick = closeModalFunc;
    window.onclick = (e) => { if(e.target.id === 'result-modal') closeModalFunc(); };

    // Голос
    document.getElementById('btn-voice').onclick = () => {
        if (isSpeaking) { window.speechSynthesis.cancel(); isSpeaking = false; }
        else {
            const ut = new SpeechSynthesisUtterance(lastResultText);
            ut.lang = 'uk-UA';
            window.speechSynthesis.speak(ut);
            isSpeaking = true;
        }
    };
});
