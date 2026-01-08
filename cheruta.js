function initRutaUI() {
    const banner = document.querySelector('.ruta-container');
    if (!banner) return;
    const oldUI = document.getElementById('ruta-interface');
    if (oldUI) oldUI.remove();

    // ПЕРЕВІРКА: Якщо ми повернулися з n8n з міткою source=ruta
    if (window.location.search.includes('source=ruta')) {
        window.location.href = 'register.html';
        return;
    }

    const uiHtml = `
    <div id="ruta-interface" style="position: absolute; bottom: 0; left: 0; width: 100%; background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%); padding: 12px 0; display: flex; align-items: center; justify-content: space-between; z-index: 999999;">
        <div style="padding-left: 15px;"><button id="ruta-docs-btn" class="r-btn btn-sec">ПОЛОЖЕННЯ</button></div>
        <div id="ruta-timer" style="display: flex; align-items: center; gap: 5px; color: white; font-family: monospace; pointer-events: none;">
            <span id="d-val" style="color: #f1c40f; font-size: 24px; font-weight: 900; text-shadow: 2px 2px 3px #000;">00</span>
            <span style="color: #f1c40f; font-size: 18px; margin-right: 5px;">:</span>
            <span id="h-val" class="time-num">00</span><span class="dots">:</span>
            <span id="m-val" class="time-num">00</span><span class="dots">:</span>
            <span id="s-val" class="time-num">00</span>
        </div>
        <div style="padding-right: 15px;"><button id="ruta-final-btn" class="r-btn btn-prim">ЗАЯВКА</button></div>
    </div>
    <style>
        .r-btn { padding: 10px 18px; border-radius: 6px; font-weight: 800; font-size: 11px; cursor: pointer; border: none; text-transform: uppercase; pointer-events: auto !important; }
        .btn-sec { background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); }
        .btn-prim { background: #ff4500 !important; color: white !important; }
        .time-num { color: #f1c40f; font-size: 24px; font-weight: 900; min-width: 28px; text-align: center; text-shadow: 2px 2px 3px #000; }
        .dots { color: #fff; font-size: 20px; font-weight: bold; margin: 0 2px; animation: blink 1s infinite; }
        @keyframes blink { 50% { opacity: 0.3; } }
    </style>`;

    banner.style.position = 'relative';
    banner.insertAdjacentHTML('beforeend', uiHtml);

    document.getElementById('ruta-docs-btn').onclick = () => window.open('ruta-2026_polozhennia.pdf', '_blank');

    document.getElementById('ruta-final-btn').onclick = function() {
        const isLoggedIn = document.querySelector('.header-btn') && document.querySelector('.header-btn').textContent.includes('ВИЙТИ');
        
        if (isLoggedIn) {
            window.location.href = 'register.html';
        } else {
            // ЗАПАМ'ЯТОВУЄМО, що хочемо на Руту
            sessionStorage.setItem('redirect_to', 'ruta');
            if (typeof window.goToForm === 'function') {
                window.goToForm();
            } else {
                document.querySelector('.header-btn').click();
            }
        }
    };

    const targetDate = new Date("March 21, 2026 09:00:00").getTime();
    setInterval(() => {
        const now = new Date().getTime();
        const diff = targetDate - now;
        if (diff < 0) return;
        document.getElementById("d-val").innerText = Math.floor(diff / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
        document.getElementById("h-val").innerText = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
        document.getElementById("m-val").innerText = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        document.getElementById("s-val").innerText = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
    }, 1000);
}
window.addEventListener('load', initRutaUI);
