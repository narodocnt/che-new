function initRutaUI() {
    const banner = document.querySelector('.ruta-container');
    if (!banner) return;

    const oldUI = document.getElementById('ruta-interface');
    if (oldUI) oldUI.remove();

    // ПІДТРИМКА МАСШТАБУВАННЯ
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=yes');
    }

    const uiHtml = `
    <div id="ruta-interface" style="
        position: absolute; 
        bottom: 0; 
        left: 0; 
        width: 100%; 
        background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%);
        padding: 12px 0;
        display: flex;
        align-items: center; 
        justify-content: space-between; 
        z-index: 500; /* Знижено, щоб не заважати випадаючим меню */
    ">
        <div style="padding-left: 15px;">
            <button onclick="window.open('ruta-2026_polozhennia.pdf', '_blank')" class="r-btn btn-sec">ПОЛОЖЕННЯ</button>
        </div>

        <div id="ruta-timer" style="display: flex; align-items: center; gap: 5px; color: white; font-family: monospace;">
            <span id="d-val" style="color: #f1c40f; font-size: 24px; font-weight: 900; text-shadow: 2px 2px 3px #000;">00</span>
            <div style="display: flex; align-items: center; background: transparent;">
                <span id="h-val" class="time-num">00</span>
                <span class="dots">:</span>
                <span id="m-val" class="time-num">00</span>
                <span class="dots">:</span>
                <span id="s-val" class="time-num">00</span>
            </div>
        </div>

        <div style="padding-right: 15px;">
            <button id="ruta-final-btn" class="r-btn btn-prim">ЗАЯВКА</button>
        </div>
    </div>

    <style>
        .r-btn {
            padding: 10px 18px;
            border-radius: 6px;
            font-weight: 800;
            font-size: 11px;
            cursor: pointer;
            border: none;
            text-transform: uppercase;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            pointer-events: auto !important;
        }
        .btn-sec { background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); }
        .btn-prim { background: #ff4500; color: white; }
        .time-num { color: #f1c40f; font-size: 24px; font-weight: 900; min-width: 28px; text-align: center; text-shadow: 2px 2px 3px #000; }
        .dots { color: #fff; font-size: 20px; font-weight: bold; margin: 0 2px; animation: blink 1s infinite; }
        @keyframes blink { 50% { opacity: 0.3; } }
        @media (max-width: 480px) {
            .r-btn { padding: 8px 12px; font-size: 10px; }
            .time-num, #d-val { font-size: 18px; min-width: 22px; }
        }
    </style>`;

    banner.style.position = 'relative';
    banner.insertAdjacentHTML('beforeend', uiHtml);

    // НАЙБІЛЬШ СУМІСНИЙ ОБРОБНИК
    document.getElementById('ruta-final-btn').onclick = function() {
        // Замість виклику функції, просто шукаємо кнопку в HTML коді вашого сайту і тиснемо на неї
        const siteButtons = Array.from(document.querySelectorAll('a, button, span'));
        const masterBtn = siteButtons.find(el => el.textContent.includes('ЗАЯВКУ') && !el.id.includes('ruta'));
        
        if (masterBtn) {
            masterBtn.click();
        } else if (typeof goToForm === 'function') {
            goToForm();
        } else {
            window.location.href = 'register.html';
        }
    };

    // ТАЙМЕР
    const targetDate = new Date("March 21, 2026 09:00:00").getTime();
    function updateTimer() {
        const now = new Date().getTime();
        const diff = targetDate - now;
        if (diff < 0) return;

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        const dV = document.getElementById("d-val");
        const hV = document.getElementById("h-val");
        const mV = document.getElementById("m-val");
        const sV = document.getElementById("s-val");

        if(dV) dV.innerText = d.toString().padStart(2, '0');
        if(hV) hV.innerText = h.toString().padStart(2, '0');
        if(mV) mV.innerText = m.toString().padStart(2, '0');
        if(sV) sV.innerText = s.toString().padStart(2, '0');
    }
    setInterval(updateTimer, 1000);
    updateTimer();
}

// Запуск
if (document.readyState === 'complete') {
    initRutaUI();
} else {
    window.addEventListener('load', initRutaUI);
}
