/**
 * cheruta.js - Фінальна версія: кнопки працюють ідентично меню
 */

function initRutaUI() {
    const banner = document.querySelector('.ruta-container');
    if (!banner) return;

    // Видаляємо старий інтерфейс
    const oldUI = document.getElementById('ruta-interface');
    if (oldUI) oldUI.remove();

    const uiHtml = `
    <div id="ruta-interface" style="
        position: absolute; 
        bottom: 0; 
        left: 0; 
        width: 100%; 
        background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%);
        padding: 10px 0;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        z-index: 9999;
    ">
        <div style="padding-left: 15px; padding-bottom: 10px;">
            <button onclick="window.open('/polozhennya.pdf', '_blank')" class="r-btn btn-sec">ПОЛОЖЕННЯ</button>
        </div>

        <div id="ruta-timer" style="display: flex; gap: 8px; color: white; padding-bottom: 10px;">
            <div class="t-box"><span id="d-val">00</span><small>дн</small></div>
            <div class="t-box"><span id="h-val">00</span><small>год</small></div>
            <div class="t-box"><span id="m-val">00</span><small>хв</small></div>
            <div class="t-box"><span id="s-val">00</span><small>сек</small></div>
        </div>

        <div style="padding-right: 15px; padding-bottom: 10px;">
            <button id="ruta-submit-btn" class="r-btn btn-prim">ЗАЯВКА</button>
        </div>
    </div>

    <style>
        .r-btn {
            padding: 10px 18px;
            border-radius: 8px;
            font-weight: 800;
            font-size: 11px;
            cursor: pointer;
            border: none;
            text-transform: uppercase;
            box-shadow: 0 4px 15px rgba(0,0,0,0.7);
            transition: all 0.2s;
            pointer-events: auto !important;
        }
        .btn-sec { background: rgba(255,255,255,0.25); color: white; border: 1px solid rgba(255,255,255,0.4); backdrop-filter: blur(5px); }
        .btn-prim { background: #ff4500; color: white; box-shadow: 0 0 15px rgba(255, 69, 0, 0.4); }
        .r-btn:hover { transform: translateY(-2px); filter: brightness(1.2); }
        
        .t-box { text-align: center; min-width: 32px; }
        .t-box span { display: block; font-size: 19px; font-weight: 900; color: #f1c40f; line-height: 1; text-shadow: 0 2px 5px #000; }
        .t-box small { font-size: 7px; text-transform: uppercase; opacity: 1; font-weight: bold; color: #fff; }

        @media (max-width: 480px) {
            .r-btn { padding: 8px 10px; font-size: 10px; }
            .t-box span { font-size: 15px; }
            .t-box { min-width: 26px; }
        }
    </style>
    `;

    banner.style.position = 'relative';
    banner.insertAdjacentHTML('beforeend', uiHtml);

    // ПРИВ'ЯЗКА КНОПКИ ДО ФУНКЦІЇ МЕНЮ
    const submitBtn = document.getElementById('ruta-submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            // Викликаємо ту саму функцію, що і в меню "ПОДАТИ ЗАЯВКУ"
            if (typeof goToForm === 'function') {
                goToForm();
            } else {
                // Якщо функція не знайдена, пробуємо відкрити посилання прямо
                window.location.href = '/podaty-zayavku';
            }
        });
    }

    // ТАЙМЕР
    const target = new Date("March 21, 2026 09:00:00").getTime();
    const update = () => {
        const now = new Date().getTime();
        const diff = target - now;
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
    };
    setInterval(update, 1000);
    update();
}

document.addEventListener('DOMContentLoaded', initRutaUI);
