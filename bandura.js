// Використовуємо var для сумісності та уникнення помилок дублювання
var banduraElem = document.querySelector('.bandura-standalone-avatar');
var banduraInputField = document.getElementById('bandura-text-field');
var banduraImg = document.getElementById('bandura-image');

// --- ЛОГІКА ПЕРЕТЯГУВАННЯ (Тільки рух) ---
var isDragging = false;
var xOffset = 0, yOffset = 0;
var initialX, initialY;

if (banduraElem) {
    banduraElem.addEventListener("mousedown", dragStart);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", dragEnd);

    banduraElem.addEventListener("touchstart", dragStart, { passive: false });
    document.addEventListener("touchmove", drag, { passive: false });
    document.addEventListener("touchend", dragEnd);
}

function dragStart(e) {
    if (e.target === banduraInputField || e.target.closest('.bar-action-btns')) return;
    var clientX = (e.type === "touchstart") ? e.touches[0].clientX : e.clientX;
    var clientY = (e.type === "touchstart") ? e.touches[0].clientY : e.clientY;
    initialX = clientX - xOffset;
    initialY = clientY - yOffset;
    isDragging = true;
}

function drag(e) {
    if (isDragging) {
        e.preventDefault();
        var clientX = (e.type === "touchmove") ? e.touches[0].clientX : e.clientX;
        var clientY = (e.type === "touchmove") ? e.touches[0].clientY : e.clientY;
        xOffset = clientX - initialX;
        yOffset = clientY - initialY;
        banduraElem.style.transform = "translate3d(" + xOffset + "px, " + yOffset + "px, 0)";
    }
}
function dragEnd() { isDragging = false; }

// --- РЕАКЦІЯ НА ГОЛОС (Передача в search-ai.js) ---
window.startVoiceSearch = function() {
    var Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return alert("Браузер не підтримує голос");

    var rec = new Recognition();
    rec.lang = 'uk-UA';
    
    rec.onstart = function() {
        banduraElem.classList.add('thinking-music');
        if (banduraImg) banduraImg.src = "bandura-thinking.png"; // Стає веселою
        banduraInputField.placeholder = "Слухаю...";
    };

    rec.onresult = function(e) {
        var transcript = e.results[0][0].transcript;
        banduraInputField.value = transcript; // Вписуємо текст
        
        // Викликаємо функцію пошуку з файлу search-ai.js
        if (window.performSearch) {
            window.performSearch(transcript); 
        } else if (window.processFullSearch) {
            window.processFullSearch(transcript);
        }
    };

    rec.onend = function() {
        banduraElem.classList.remove('thinking-music');
        if (banduraImg) banduraImg.src = "bandura-idle.png"; // Повертається в спокій
        banduraInputField.placeholder = "Питання є?";
    };

    rec.start();
};
