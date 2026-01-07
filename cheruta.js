function initRutaUI() {
    const banner = document.querySelector('.ruta-container');
    if (!banner) return;

    const oldUI = document.getElementById('ruta-interface');
    if (oldUI) oldUI.remove();

    const uiHtml = `
    <div id="ruta-interface" style="
        position: absolute; 
        bottom: 0; 
        left: 0; 
        width: 100%; 
        background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%);
        padding: 12px 0;
        display: flex;
        align-items: center; 
        justify-content: space-between; 
        z-index: 10000;
    ">
        <div style="padding-left: 15px;">
            <button onclick="window.open('ruta-2026_polozhennia.pdf', '_blank')" class="r-btn btn-sec">ПОЛОЖЕННЯ</button>
        </div>

        <div id="ruta-timer" style="display: flex; align-items: center; gap: 5px; color: white; font-family: monospace;">
            <span id="d-val" style="color: #f1c40f; font-size: 22px; font-weight: 900; margin-right: 5px;">00</span>
            <div style="display: flex; align-items: center; background: rgba(0,0,0,0.6); padding: 4px 10px; border-radius: 5px; border: 1px solid rgba(241,196,15,0.4);">
                <span id="h-val" class="time-num">00</span>
                <span class="dots">:</span>
                <span id="m-val" class="time-num">00</span>
                <span class="dots">:</span>
                <span id="s-val" class="time-num">00</span>
            </div>
        </div>

        <div style="padding-right: 15px;">
            <button id="final-auth-btn" class="r-btn btn-prim">ЗАЯВКА</button>
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
            box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            pointer-events: auto !important;
            display: inline-block;
        }
        .btn-sec { background: rgba(255,255,255,0.25); color: white; border: 1px solid rgba(255,255,255,0.4); }
        .btn-prim { background: #ff4500; color: white; }
        .time-num { color: #f1c40f; font-size: 22px; font-weight: 900; min-width: 26px; text-align: center; }
        .dots { color: #fff; font-size: 20px; font-weight: bold; margin: 0 2px; animation: blink 1s infinite; }
        @keyframes blink { 50% { opacity: 0.3; } }
        @media (max-width: 480px) {
            .r-btn { padding: 8px 10px; font-size: 9px; }
            .time-num, #d-val { font-size: 17px; min-width: 20px; }
        }
    </style>`;

    banner.style.position = 'relative';
    banner.insertAdjacentHTML('beforeend', uiHtml);

    // Гарантована активація авторизації
    document.getElementById('final-auth-btn').addEventListener('click', function() {
        console.log("Спроба викликати авторизацію...");
        
        // 1. Прямий виклик через вікно
        if (typeof window.goToForm === 'function') {
            window.goToForm();
        } 
        // 2. Пошук будь-якої кнопки на сайті, яка запускає goToForm
        else {
            const hiddenBtn = document.querySelector('[onclick*="goToForm"]');
            if (hiddenBtn) {
                hiddenBtn.click();
            } else {
                // 3. Якщо нічого не спрацювало — просто перехід на реєстрацію
                window.location.href = 'register.html';
            }
        }
    });

    const targetDate = new Date("March 21, 2026 09:00:00").getTime();
    function updateTimer() {
        const now = new Date().getTime();
        const diff = targetDate - now;
        if (diff < 0) return;

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        const elD = document.getElementById("d-val");
        const elH = document.getElementById("h-val");
        const elM = document.getElementById("m-val");
        const elS = document.getElementById("s-val");

        if(elD) elD.innerText = d.toString().padStart(2, '0');
        if(elH) elH.innerText = h.toString().padStart(2, '0');
        if(elM) elM.innerText = m.toString().padStart(2, '0');
        if(elS) elS.innerText = s.toString().padStart(2, '0');
    }
    setInterval(updateTimer, 1000);
    updateTimer();
}

// Коректний запуск
if (document.readyState === 'complete') {
    initRutaUI();
} else {
    window.addEventListener('load', initRutaUI);
}
