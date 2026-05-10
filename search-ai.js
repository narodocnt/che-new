/**
 * Файл: search-ai.js
 * Інтерактивний пошук з асистентом-Бандурою
 */

// 1. Конфігурація зображень
const BANDURA_IMAGES = {
    idle: 'bandura-idle.png',
    listening: 'bandura-listening.png',
    pointing: 'bandura-pointing.png'
};

window.performSearch = null;

// 2. Алгоритм Левенштейна (покращений для кращого розпізнавання)
function levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
            else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
        }
    }
    return matrix[b.length][a.length];
}

// Функція підбору найкращого збігу
function findBestMatch(input, list) {
    let bestWord = null;
    let minDistance = 4; // Збільшено поріг для кращого розловлення довгих слів (як Панзюк)
    const uniqueList = [...new Set(list)];
    
    for (let word of uniqueList) {
        let cleanWord = word.toLowerCase().trim();
        let cleanInput = input.toLowerCase().trim();
        let distance = levenshteinDistance(cleanInput, cleanWord);
        
        if (distance < minDistance) {
            minDistance = distance;
            bestWord = word;
        }
    }
    return bestWord;
}

// 3. Анімація виїзду пошуку
window.toggleBanduraSearch = function() {
    const wrapper = document.getElementById('search-wrapper');
    const field = document.getElementById('bandura-text-field');
    const img = document.getElementById('bandura-image');
    
    if (!wrapper) return;

    if (wrapper.style.width === "0px" || wrapper.style.width === "0" || !wrapper.style.width) {
        wrapper.style.width = "280px"; 
        wrapper.style.border = "1px solid #ccc";
        img.src = BANDURA_IMAGES.pointing;
        setTimeout(() => field.focus(), 500);
    } else {
        wrapper.style.width = "0";
        wrapper.style.border = "none";
        img.src = BANDURA_IMAGES.idle;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const textField = document.getElementById('bandura-text-field');
    const micBtn = document.getElementById('btn-mic');
    const searchBtn = document.getElementById('btn-execute-search');
    const banduraImg = document.getElementById('bandura-image');
    const modal = document.getElementById('result-modal');
    const modalText = document.getElementById('modal-text');
    const voiceBtn = document.getElementById('btn-voice');

    // Додаємо стилі анімації коливання (Shake)
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes banduraShake {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(4deg); }
            50% { transform: rotate(0deg); }
            75% { transform: rotate(-4deg); }
            100% { transform: rotate(0deg); }
        }
        .shaking { animation: banduraShake 0.3s infinite; }
        .mic-active { color: red !important; text-shadow: 0 0 5px rgba(255,0,0,0.5); }
    `;
    document.head.appendChild(style);

   // Функції модального вікна
    const closeModal = () => {
        if (modal) modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        window.speechSynthesis.cancel();
    };

    const showModal = (html) => {
        if (!modal || !modalText) return;
        modalText.innerHTML = html;
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
        
        // Закриття кліком на фон
        modal.onclick = (e) => { if (e.target === modal) closeModal(); };
    };

    // БЕЗПЕЧНА ПРИВ'ЯЗКА КНОПКИ ЗАКРИТТЯ
    if (closeBtn) {
        closeBtn.onclick = closeModal;
    }

    // --- ГОЛОВНА ФУНКЦІЯ ПОШУКУ ---
    window.performSearch = function(query) {
        if (!query || query.trim() === "") return;

        // Видаляємо латиницю, залишаємо тільки кирилицю та пробіли
        let q = query.replace(/[a-zA-Z]/g, '').toLowerCase().trim();
        
        if (q === "") {
            textField.value = "Тільки кирилиця!";
            return;
        }

        textField.value = "Шукаю: " + q + "...";
        banduraImg.classList.add('shaking');
        banduraImg.src = BANDURA_IMAGES.pointing;

        let foundResults = "";
        let count = 0;
        let suggestionsBase = [];

        if (typeof collectivesData !== 'undefined') {
            for (let key in collectivesData) {
                let div = document.createElement('div');
                div.innerHTML = collectivesData[key];
                let items = div.getElementsByTagName('li');

                for (let item of items) {
                    let txt = item.innerText;
                    if (txt.toLowerCase().includes(q)) {
                        count++;
                        foundResults += `<li style="margin-bottom:12px;">${item.innerHTML}</li>`;
                    }
                    // Розбиваємо текст на слова для бази виправлень
                    txt.split(/[—\s,.]/).forEach(p => {
                        let clean = p.trim().replace(/[a-zA-Z]/g, '');
                        if (clean.length > 3) suggestionsBase.push(clean);
                    });
                }
            }
        }

        setTimeout(() => {
            banduraImg.classList.remove('shaking');
            banduraImg.src = BANDURA_IMAGES.idle;

            if (foundResults !== "") {
                textField.value = q;
                showModal(`<div style="margin-bottom:10px; border-bottom:1px solid #eee;">Знайдено: <b>${count}</b></div><ul style="list-style:none; padding:0;">${foundResults}</ul>`);
            } else {
                let suggestion = findBestMatch(q, suggestionsBase);
                if (suggestion) {
                    textField.value = "Мається на увазі: " + suggestion + "?";
                    let errorHtml = `
                        <div style="text-align:center; padding:20px;">
                            Нічого не знайдено за запитом "<b>${q}</b>".<br><br>
                            <strong>Можливо, ви мали на увазі:</strong><br>
                            <span style="color:red; font-weight:bold; cursor:pointer; text-decoration:underline; font-size:1.2em;" 
                            onclick="window.performSearch('${suggestion.replace(/'/g, "\\'")}')">${suggestion}</span>
                        </div>`;
                    showModal(errorHtml);
                } else {
                    textField.value = "Нічого не знайдено";
                    showModal(`<div style="text-align:center; padding:20px;">За запитом "${q}" нічого не знайдено.</div>`);
                }
            }
        }, 800);
    };

    // Кнопка Лупа
    if (searchBtn) searchBtn.onclick = () => window.performSearch(textField.value);

    // Кнопка Прослухати в модалці
    if (voiceBtn) {
        voiceBtn.onclick = () => {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
                voiceBtn.innerHTML = "🔊 Прослухати";
            } else {
                const utterance = new SpeechSynthesisUtterance(modalText.innerText);
                utterance.lang = 'uk-UA';
                utterance.onstart = () => voiceBtn.innerHTML = "🔇 Зупинити";
                utterance.onend = () => voiceBtn.innerHTML = "🔊 Прослухати";
                window.speechSynthesis.speak(utterance);
            }
        };
    }

    // --- ЛОГІКА МІКРОФОНУ ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (micBtn && SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'uk-UA';
        recognition.interimResults = false;

        micBtn.onclick = () => {
            textField.value = "Слухаю...";
            micBtn.classList.add('mic-active');
            banduraImg.src = BANDURA_IMAGES.listening;
            recognition.start();
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            textField.value = transcript;
            window.performSearch(transcript);
        };

        recognition.onend = () => {
            micBtn.classList.remove('mic-active');
            if (banduraImg.src.includes('listening')) banduraImg.src = BANDURA_IMAGES.idle;
        };
        
        recognition.onerror = () => {
            micBtn.classList.remove('mic-active');
            banduraImg.src = BANDURA_IMAGES.idle;
            textField.value = "Помилка мікрофону";
        };
    }

    if (textField) {
        textField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') window.performSearch(textField.value);
        });
    }
});
