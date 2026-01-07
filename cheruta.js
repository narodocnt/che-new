/**
 * cheruta.js - Компактні кнопки та таймер зворотного відліку
 */

function initRutaSection() {
    // Шукаємо контейнер банера
    const banner = document.querySelector('.ruta-container') || document.querySelector('.ruta-banner-section');
    
    if (!banner) return;

    // Прибираємо старі елементи, якщо вони були створені раніше
    const existingInterface = document.getElementById('ruta-dynamic-interface');
    if (existingInterface) existingInterface.remove();

    // Створюємо нову панель
    const interfaceHtml = `
        <div id="ruta-dynamic-interface" class="ruta-ui-panel">
            <div class="ruta-buttons">
                <button onclick="window.open('ПОСИЛАННЯ_НА_ПОЛОЖЕННЯ', '_blank')" class="ruta-btn btn-glass">ПОЛОЖЕННЯ</button>
                <button onclick="goToForm()" class="ruta-btn btn-glow">ЗАЯВКА</button>
            </div>
            <div id="ruta-countdown" class="ruta-timer">
                <div class="t-block"><span id="r-days">00</span><small>дн</small></div>
                <div class="t-block"><span id="r-hours">00</span><small>год</small></div>
                <div class="t-block"><span id="r-mins">00</span><small>хв</small></div>
                <div class="t-block"><span id="r-secs">00</span><small>сек</small></div>
            </div>
        </div>

        <style>
            .ruta-ui-panel {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 10px 0;
                gap: 8px;
                border-bottom-left-radius: 15px;
                border-bottom-right-radius: 15px;
            }
            .ruta-buttons {
                display: flex;
                gap: 15px;
            }
            .ruta-btn {
                padding: 6px 15px;
                border: none;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                cursor: pointer;
                transition: 0.3s;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .btn-glass {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.3);
            }
            .btn-glass:hover { background: rgba(255, 255, 255, 0.4); }
            
            .btn-glow {
                background: #ffbc00;
                color: #000;
                box-shadow: 0 0 10px rgba(255, 188, 0, 0.5);
            }
            .btn-glow:hover {
                background: #ffd700;
                box-shadow: 0 0 15px rgba(255, 188, 0, 0.8);
            }

            .ruta-timer {
                display: flex;
                gap: 10px;
                color: white;
            }
            .t-block { text-align: center; min-width: 30px; }
            .t-block span { display: block; font-size: 16px; font-weight: bold; color: #ffbc00; }
            .t-block small { font-size: 8px; text-transform: uppercase; opacity: 0.7; }

            /* Масштабування для мобільних */
            @media (max-width: 600px) {
                .ruta-btn { padding: 4px 10px; font-size: 10px; }
                .t-block span { font-size: 14px; }
                .t-block small { font-size: 7px; }
            }
        </style>
    `;

    banner.style.position = 'relative'; 
    banner.insertAdjacentHTML('beforeend', interfaceHtml);

    // Логіка таймера
    const targetDate = new Date("March 21, 2026 09:00:00").getTime();

    const timerInterval = setInterval(function() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            clearInterval(timerInterval);
            document.getElementById("ruta-countdown").innerHTML = "<span style='font-size:12px'>КОНКУРС РОЗПОЧАТО</span>";
            return;
        }

        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("r-days").innerText = d.toString().padStart(2, '0');
        document.getElementById("r-hours").innerText = h.toString().padStart(2, '0');
        document.getElementById("r-mins").innerText = m.toString().padStart(2, '0');
        document.getElementById("r-secs").innerText = s.toString().padStart(2, '0');
    }, 1000);
}

// Запуск при завантаженні
document.addEventListener('DOMContentLoaded', initRutaSection);
