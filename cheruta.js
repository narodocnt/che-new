/**
 * cheruta.js - Скрипт для банера "Червона Рута"
 * Додає таймер та кнопки поверх існуючого HTML-контейнера
 */

function initRutaUI() {
    // 1. Знаходимо ваш контейнер у HTML
    const banner = document.querySelector('.ruta-container');
    if (!banner) return;

    // 2. Створюємо інтерфейс кнопок та таймера
    const uiHtml = `
    <div id="ruta-interface" style="
        position: absolute; 
        bottom: 0; 
        left: 0; 
        width: 100%; 
        background: linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.4), transparent); 
        padding: 15px 0; 
        display: flex; 
        align-items: flex-end; 
        justify-content: space-between;
        z-index: 10;
    ">
        <div style="padding-left: 20px; padding-bottom: 5px;">
            <button onclick="window.open('ruta-2026_polozhennia.pdf', '_blank')" class="ruta-btn btn-secondary">
                ПОЛОЖЕННЯ
            </button>
        </div>

        <div id="ruta-timer-box" style="display: flex; gap: 12px; color: white; padding-bottom: 5px;">
            <div class="t-unit"><span id="d-val">00</span><small>дн</small></div>
            <div class="t-unit"><span id="h-val">00</span><small>год</small></div>
            <div class="t-unit"><span id="m-val">00</span><small>хв</small></div>
            <div class="t-unit"><span id="s-val">00</span><small>сек</small></div>
        </div>

        <div style="padding-right: 20px; padding-bottom: 5px;">
            <button onclick="goToRutaForm()" class="ruta-btn btn-primary">
                ЗАЯВКА
            </button>
        </div>
    </div>

    <style>
        .ruta-btn {
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 12px;
            cursor: pointer;
            border: none;
            text-transform: uppercase;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            transition: 0.3s;
        }
        .btn-secondary { background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.4); }
        .btn-primary { background: #ff4500; color: white; }
        .ruta-btn:hover { transform: scale(1.05); filter: brightness(1.1); }

        .t-unit { text-align: center; min-width: 35px; }
        .t-unit span { display: block; font-size: 22px; font-weight: 900; color: #f1c40f; line-height: 1; }
        .t-unit small { font-size: 9px; text-transform: uppercase; opacity: 0.8; }

        @media (max-width: 600px) {
            .ruta-btn { padding: 8px 12px; font-size: 10px; }
            .t-unit span { font-size: 16px; }
            .t-unit { min-width: 25px; gap: 5px; }
            #ruta-timer-box { gap: 8px; }
        }
    </style>
    `;

    // Вставляємо інтерфейс у ваш контейнер
    banner.insertAdjacentHTML('beforeend', uiHtml);

    // 3. Логіка таймера (Відлік до 21 березня 2026)
    const targetDate = new Date("March 21, 2026 09:00:00").getTime();

    const timerInterval = setInterval(() => {
        const now = new Date().getTime();
        const diff = targetDate - now;

        if (diff < 0) {
            clearInterval(timerInterval);
            document.getElementById("ruta-timer-box").innerHTML = "<b>КОНКУРС РОЗПОЧАТО!</b>";
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById("d-val").innerText = d.toString().padStart(2, '0');
        document.getElementById("h-val").innerText = h.toString().padStart(2, '0');
        document.getElementById("m-val").innerText = m.toString().padStart(2, '0');
        document.getElementById("s-val").innerText = s.toString().padStart(2, '0');
    }, 1000);
}

/**
 * Спеціальна функція для заявки Червона Рута
 * Перевіряє авторизацію через localStorage (як у вашому index.html)
 */
function goToRutaForm() {
    const user = localStorage.getItem('user');
    const RUTA_FORM_URL = "https://n8n.narodocnt.online/webhook/ruta-zayavka"; 

    if (!user) {
        alert("Будь ласка, авторизуйтесь для подачі заявки на Червону Руту.");
        // Викликаємо вашу функцію handleAuthClick з index.html
        if (typeof handleAuthClick === 'function') {
            handleAuthClick();
        }
    } else {
        window.location.href = RUTA_FORM_URL;
    }
}

// Запуск при завантаженні сторінки
document.addEventListener('DOMContentLoaded', initRutaUI);
