// Використовуємо var щоб не було помилки "already declared"
var banduraElem = document.querySelector('.bandura-standalone-avatar');
var banduraInputField = document.getElementById('bandura-text-field');

var isDragging = false;
var currentX = 0, currentY = 0, initialX = 0, initialY = 0;
var xOffset = 0, yOffset = 0;

// ПЕРЕТЯГУВАННЯ
if (banduraElem) {
    banduraElem.addEventListener("mousedown", dragStart);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", dragEnd);

    banduraElem.addEventListener("touchstart", dragStart, { passive: false });
    document.addEventListener("touchmove", drag, { passive: false });
    document.addEventListener("touchend", dragEnd);
}

function dragStart(e) {
    if (e.target === banduraInputField) return;
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
        currentX = clientX - initialX;
        currentY = clientY - initialY;
        xOffset = currentX;
        yOffset = currentY;
        banduraElem.style.transform = "translate3d(" + currentX + "px, " + currentY + "px, 0)";
    }
}

function dragEnd() { isDragging = false; }

// ГОЛОСОВИЙ ПОШУК
window.startVoiceSearch = function() {
    console.log("Мікрофон активовано");
    var Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return alert("Браузер не підтримує голос");

    var rec = new Recognition();
    rec.lang = 'uk-UA';
    rec.onstart = function() { banduraElem.classList.add('thinking-music'); };
    rec.onresult = function(e) {
        var text = e.results[0][0].transcript;
        banduraInputField.value = text;
        window.processFullSearch(text);
    };
    rec.onerror = function() { banduraElem.classList.remove('thinking-music'); };
    rec.start();
};

// ПОШУК
window.processFullSearch = async function(query) {
    if (!query) return;
    console.log("Шукаю:", query);
    banduraElem.classList.add('thinking-music');
    
    try {
        const response = await fetch('https://n8n.narodocnt.online/webhook/search-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query })
        });
        const data = await response.json();
        // Виклик модалки
        if (window.showModal) window.showModal(data.output || "Знайдено результати");
        else alert(data.output);
    } catch (e) {
        console.error(e);
    } finally {
        banduraElem.classList.remove('thinking-music');
    }
};

// ENTER
if (banduraInputField) {
    banduraInputField.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') window.processFullSearch(this.value);
    });
}
