/**
 * cheruta.js - ФІНАЛЬНА ВЕРСІЯ (Кнопки по кутах + Центрований таймер)
 */

function buildRutaInterface() {
    const banner = document.querySelector('.ruta-container');
    
    // Якщо банер ще не завантажився, спробувати знову через 200мс
    if (!banner) {
        setTimeout(buildRutaInterface, 200);
        return;
    }

    // Перевіряємо, чи ми вже не додали інтерфейс раніше
    if (document.getElementById('ruta-interface')) return;

    const uiHtml = `
    <div id="ruta-interface" style="
        position: absolute; 
        bottom: 0; 
        left: 0; 
        width: 100%; 
        background: linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.3), transparent);
        padding: 15px 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 9999;
    ">
        <div style="padding-left: 15px;">
            <button onclick="window.open('https://narodocnt.online/polozhennya', '_blank')" class="r-btn btn-sec">ПОЛОЖЕННЯ</button>
        </div>

        <div id="ruta-timer" style="display: flex; gap: 10px; color: white;">
            <div class="t-box"><span id="d-val">00</span><small>дн</small></div>
            <div class="t-box"><span id="h-val">00</span><small>год</small></div>
            <div class="t-box"><span id="m-val">00</span><small>хв</small></div>
            <div class="t-box"><span id="s-val">00</span><small>сек</small></div>
        </div>

        <div style="padding-right: 15px;">
            <button onclick="window.location.href='https://narodocnt.online/form'" class="r-btn btn-prim">ЗАЯВКА</button>
        </div>
    </div>

    <style>
        .r-btn {
            padding: 10px 15px;
            border-radius: 8px;
            font-weight: 900;
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
        
        .t-box { text-align: center; min-width: 35px; }
        .t-box span { display: block; font-size: 20px; font-weight: 900; color: #f1c40f; line-height: 1; }
        .t-box small { font-size: 8px; text-transform: uppercase; opacity: 0.9; }

        @media (max-width: 500px) {
            .r-btn { padding: 8px 10px; font-size: 9px; }
            .t-box span { font-size: 16px; }
            .t-box { min-width: 28px; }
            #ruta-interface { padding: 8px 0; }
        }
    </style>
    `;

    banner.style.position = 'relative'; // Обов'язково для роботи absolute
    banner.insertAdjacentHTML('beforeend', uiHtml);

    // Логіка відліку
    const target = new Date("March 21, 2026 09:00:00").getTime();
    const update = () => {
        const now = new Date().getTime();
        const diff = target - now;
        if (diff < 0) return;

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById("d-val").innerText = d.toString().padStart(2, '0');
        document.getElementById("h-val").innerText = h.toString().padStart(2, '0');
        document.getElementById("m-val").innerText = m.toString().padStart(2, '0');
        document.getElementById("s-val").innerText = s.toString().padStart(2, '0');
    };
    setInterval(update, 1000);
    update();
}

// Запускаємо відразу
buildRutaInterface();
