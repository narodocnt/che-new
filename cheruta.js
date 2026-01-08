function initRutaUI() {
    const banner = document.querySelector('.ruta-container');
    if (!banner) return;

    const oldUI = document.getElementById('ruta-interface');
    if (oldUI) oldUI.remove();

    const uiHtml = `
    <div id="ruta-interface" style="position: absolute; bottom: 0; left: 0; width: 100%; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%); padding: 12px 0; display: flex; align-items: center; justify-content: space-between; z-index: 10000;">
        <div style="padding-left: 15px;"><button onclick="window.open('ruta-2026_polozhennia.pdf', '_blank')" class="r-btn btn-sec">ПОЛОЖЕННЯ</button></div>
        <div id="ruta-timer" style="display: flex; align-items: center; gap: 5px; color: white; font-family: monospace;">
            <span id="d-val" style="color: #f1c40f; font-size: 24px; font-weight: 900; text-shadow: 2px 2px 3px #000;">00</span>
            <div style="display: flex; align-items: center; background: transparent;">
                <span id="h-val" class="time-num">00</span><span class="dots">:</span>
                <span id="m-val" class="time-num">00</span><span class="dots">:</span>
                <span id="s-val" class="time-num">00</span>
            </div>
        </div>
        <div style="padding-right: 15px;"><button id="ruta-force-btn" class="r-btn btn-prim">ЗАЯВКА</button></div>
    </div>
    <style>
        .r-btn { padding: 10px 18px; border-radius: 6px; font-weight: 800; font-size: 11px; cursor: pointer; border: none; text-transform: uppercase; box-shadow: 0 4px 12px rgba(0,0,0,0.5); pointer-events: auto !important; }
        .btn-sec { background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); }
        .btn-prim { background: #ff4500; color: white; }
        .time-num { color: #f1c40f; font-size: 24px; font-weight: 900; min-width: 28px; text-align: center; text-shadow: 2px 2px 3px #000; }
        .dots { color: #fff; font-size: 20px; font-weight: bold; margin: 0 2px; animation: blink 1s infinite; }
        @keyframes blink { 50% { opacity: 0.3; } }
    </style>`;

    banner.style.position = 'relative';
    banner.insertAdjacentHTML('beforeend', uiHtml);

    // Функція перевірки авторизації
    const isLogged = () => {
        return localStorage.getItem('isLoggedIn') === 'true' || 
               sessionStorage.getItem('isLoggedIn') === 'true' ||
               (document.querySelector('.header-btn') && document.querySelector('.header-btn').textContent.toLowerCase().includes('вийти'));
    };

    document.getElementById('ruta-force-btn').onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (isLogged()) {
            // Якщо вже в системі — миттєвий перехід
            window.location.replace('register.html');
        } else {
            // Якщо ні — відкриваємо логін, АЛЕ підміняємо логіку переходу
            if (typeof goToForm === 'function') {
                // Викликаємо вікно входу
                goToForm();
                
                // Створюємо "пастку": як тільки статус зміниться на успішний, 
                // ми перехопимо керування ДО того, як спрацює редирект на n8
                const trap = setInterval(() => {
                    if (isLogged()) {
                        clearInterval(trap);
                        window.location.replace('register.html');
                    }
                }, 500);
                setTimeout(() => clearInterval(trap), 60000); // Тайм-аут 1 хв
            }
        }
    };

    // Таймер (без змін)
    const targetDate = new Date("March 21, 2026 09:00:00").getTime();
    function updateTimer() {
        const now = new Date().getTime();
        const diff = targetDate - now;
        if (diff < 0) return;
        document.getElementById("d-val").innerText = Math.floor(diff / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
        document.getElementById("h-val").innerText = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
        document.getElementById("m-val").innerText = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        document.getElementById("s-val").innerText = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
    }
    setInterval(updateTimer, 1000);
    updateTimer();
}

window.addEventListener('load', initRutaUI);
