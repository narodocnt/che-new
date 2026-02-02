/**
 * cheruta.js - Логіка таймера та форми для банера "Червона Рута"
 */

function initRutaUI() {
    // Встановлюємо цільову дату
    const targetDate = new Date("March 21, 2026 09:00:00").getTime();

    const updateTimer = () => {
        const now = new Date().getTime();
        const diff = targetDate - now;

        // Пошук елементів (вони вже є в нашому HTML)
        const dEl = document.getElementById("d-val");
        const hEl = document.getElementById("h-val");
        const mEl = document.getElementById("m-val");
        const sEl = document.getElementById("s-val");

        // Якщо час вийшов
        if (diff < 0) {
            const display = document.getElementById("ruta-timer-display");
            if (display) display.innerHTML = "ФЕСТИВАЛЬ РОЗПОЧАТО!";
            return;
        }

        // Математика розрахунку часу
        const days = Math.floor(diff / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const secs = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');

        // Оновлення цифр на екрані
        if (dEl) dEl.innerText = days;
        if (hEl) hEl.innerText = hours;
        if (mEl) mEl.innerText = mins;
        if (sEl) sEl.innerText = secs;
    };

    // Запускаємо інтервал
    setInterval(updateTimer, 1000);
    updateTimer(); // Викликаємо один раз відразу
}

// Функція обробки натискання на кнопку "ЗАЯВКА"
function goToGeneralForm(type = 'main') {
    const user = localStorage.getItem('user');

    if (!user) {
        alert("🔒 Авторизуйтесь, будь ласка!");
        if (typeof handleAuthClick === 'function') handleAuthClick();
        return;
    }

    const userName = encodeURIComponent(user);
    let url = "";

    if (type === 'cheruta') {
        url = `https://n8n.narodocnt.online/webhook/cheruta/n8n-form?name=${userName}`;
    } else {
        url = `https://n8n.narodocnt.online/webhook/main-zajavka/n8n-form?name=${userName}`;
    }

    window.open(url, '_blank');
}

// Автозапуск при завантаженні
if (document.readyState === 'loading') {
    window.addEventListener('load', initRutaUI);
} else {
    initRutaUI();
}
