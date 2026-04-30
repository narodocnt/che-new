const bandura = document.querySelector('.bandura-standalone-avatar');
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

const bandura = document.querySelector('.bandura-standalone-avatar');
const textField = document.getElementById('bandura-text-field');
const banduraImg = document.getElementById('bandura-image');

let isDragging = false;
let currentX, currentY, initialX, initialY;
let xOffset = 0, yOffset = 0;

// --- ЛОГІКА ПЕРЕТЯГУВАННЯ (Drag and Drop) ---

bandura.addEventListener("mousedown", dragStart);
document.addEventListener("mousemove", drag);
document.addEventListener("mouseup", dragEnd);

bandura.addEventListener("touchstart", dragStart, { passive: false });
document.addEventListener("touchmove", drag, { passive: false });
document.addEventListener("touchend", dragEnd);

function dragStart(e) {
    if (e.target === textField) return; // Не рухати, якщо клікнули в поле тексту

    if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
    } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
    }
    isDragging = true;
}

function drag(e) {
    if (isDragging) {
        e.preventDefault();
        if (e.type === "touchmove") {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }
        xOffset = currentX;
        yOffset = currentY;
        bandura.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    }
}

function dragEnd() {
    isDragging = false;
}

// --- ЛОГІКА ПОШУКУ ТА ГОЛОСУ ---

// Обробка натискання Enter
textField.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        processFullSearch(this.value);
    }
});

// Функція для візуальних станів Бандури
function setBanduraState(state) {
    bandura.classList.remove('thinking-music');
    if (state === 'listening') {
        textField.placeholder = "Слухаю вас...";
        bandura.classList.add('thinking-music');
    } else if (state === 'searching') {
        textField.placeholder = "Ось, знайшла!";
        bandura.classList.add('thinking-music');
    } else {
        textField.placeholder = "Запитайте мене про музику...";
    }
}

// Головна функція пошуку (з модалкою)
async function processFullSearch(query) {
    if (!query) return;

    setBanduraState('searching');
    
    try {
        const response = await fetch('https://n8n.narodocnt.online/webhook/search-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query })
        });
        const data = await response.json();
        
        // Виклик вашої модалки (припускаємо, що функція showModal існує)
        if (typeof showModal === "function") {
            showModal(data.output || data.text || "Ось що я знайшла за вашим запитом.");
        } else {
            alert(data.output || "Результат знайдено!");
        }

    } catch (error) {
        console.error("Помилка пошуку:", error);
    } finally {
        setBanduraState('idle');
    }
}

// --- РОБОТА З МІКРОФОНОМ ---

window.startVoiceSearch = function() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
        alert("Ваш браузер не підтримує розпізнавання голосу.");
        return;
    }

    const recognition = new Recognition();
    recognition.lang = 'uk-UA';

    recognition.onstart = () => setBanduraState('listening');

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        textField.value = transcript;
        processFullSearch(transcript);
    };

    recognition.onerror = () => setBanduraState('idle');
    recognition.onend = () => {};

    recognition.start();
};
