function initRutaUI() {
    const banner = document.querySelector('.ruta-container');
    if (!banner) return;

    const oldUI = document.getElementById('ruta-interface');
    if (oldUI) oldUI.remove();

    // ПЕРЕВІРКА: Чи ми повернулися з n8n?
    if (window.location.search.includes('auth=success')) {
        window.location.href = 'register.html';
        return;
    }

    const uiHtml = `
    <div id="ruta-interface" style="position: absolute; bottom: 0; left: 0; width: 100%; background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%); padding: 12px 0; display: flex; align-items: center; justify-content: space-between; z-index: 999999;">
        
        <div style="padding-left: 15px;">
            <button id="ruta-docs-btn" class="r-btn btn-sec">ПОЛОЖЕННЯ</button>
        </div>
        
        <div id="ruta-timer" style="display: flex; align-items: center; gap: 5px; color: white; font-family: monospace; pointer-events: none;">
            <span id="d-val" style="color: #f1c40f; font-size: 24px; font-weight: 900; text-shadow: 2px 2px 3px #000;">00</span>
            <span style="color: #f1c40f; font-size: 18px; margin-right: 5px;">:</span>
            <span id="h-val" class="time-num">00</span><span class="dots">:</span>
            <span id="m-val" class="time-num">00</span><span class="dots">:</span>
            <span id="s-val" class="time-num">00</span>
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
            pointer-events: auto !important;
            display: block;
        }
        .btn-sec { background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); }
        .btn-prim { background: #ff4500 !important; color: white !important; }
        .time-num { color: #f1c40f; font-size: 24px; font-weight: 900; min-width: 28px; text-align: center; text-shadow: 2px 2px 3px #000; }
        .dots { color: #fff; font-size: 20px; font-weight: bold; margin: 0 2px; animation: blink 1s infinite; }
        @keyframes blink { 50% { opacity: 0.3; } }
        @media (max-width: 480px) { 
            .r-btn { padding: 8px 10px; font-size: 9px; } 
            .time-num, #d-val { font-size: 18px; } 
        }
    </style>`;

    banner.style.position = 'relative';
    banner.insertAdjacentHTML('beforeend', uiHtml);

    // 1. КНОПКА ПОЛОЖЕННЯ
    document.getElementById('ruta-docs-btn').addEventListener('click', function(e) {
        e.preventDefault();
        window.open('ruta-2026_polozhennia.pdf', '_blank');
    });

    // 2. КНОПКА ЗАЯВКА (З ПОКРАЩЕНОЮ РЕАКЦІЄЮ)
    document.getElementById('ruta-final-btn').addEventListener('click', function(e) {
        e.preventDefault();
        
        const menuBtn = document.querySelector('.header-btn');
        const isLoggedIn = (menuBtn && menuBtn.textContent.toLowerCase().includes('вийти')) || 
                           localStorage.getItem('isLoggedIn') === 'true';

        if (isLoggedIn) {
            // Якщо увійшли - зразу на форму
            window.location.href = 'register.html';
        } else {
            // Якщо ні - намагаємося відкрити вікно входу будь-яким способом
            if (typeof window.goToForm === 'function') {
                window.goToForm();
            } else if (menuBtn) {
                menuBtn.click(); // Просто тиснемо на кнопку "Увійти" в меню
            } else {
                // Крайній випадок: якщо нічого не спрацювало, просто показуємо напис
                alert("Будь ласка, натисніть 'Увійти' у верхньому меню сайту.");
            }
        }
    });

    // 3. ТАЙМЕР
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

// Запуск при будь-якому стані завантаження
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRutaUI);
} else {
    initRutaUI();
}
