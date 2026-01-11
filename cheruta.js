function initRutaUI() {
    const banner = document.querySelector('.ruta-container');
    if (!banner) return;

    const oldUI = document.getElementById('ruta-ui-layer');
    if (oldUI) oldUI.remove();

    const uiHtml = `
    <div id="ruta-ui-layer" style="position: absolute; bottom: 0; left: 0; width: 100%; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%); display: flex; align-items: center; justify-content: space-between; padding: 5px 12px; box-sizing: border-box; z-index: 999;">
        <div style="flex: 1; display: flex; justify-content: flex-start;">
            <button onclick="window.open('https://narodocnt.online/polozhennya.pdf', '_blank')" 
                style="background: rgba(255,255,255,0.2); border: 1px solid white; color: white; padding: 6px 10px; border-radius: 6px; font-size: 10px; font-weight: bold; cursor: pointer; text-transform: uppercase;">
                ПОЛОЖЕННЯ
            </button>
        </div>

        <div id="ruta-timer-display" style="display: flex; gap: 4px; color: #f1c40f; flex: 1; justify-content: center; font-family: monospace; font-size: 18px; font-weight: bold; text-shadow: 1px 1px 2px black;">
            <span id="d-val">00</span>:<span id="h-val">00</span>:<span id="m-val">00</span>:<span id="s-val">00</span>
        </div>

        <div style="flex: 1; display: flex; justify-content: flex-end;">
            <button onclick="goToGeneralForm('cheruta')" 
                style="background: #ff4500; border: none; color: white; padding: 7px 12px; border-radius: 6px; font-size: 10px; font-weight: bold; cursor: pointer; text-transform: uppercase; box-shadow: 0 0 10px rgba(255,69,0,0.3);">
                ЗАЯВКА
            </button>
        </div>
    </div>`;

    banner.style.position = 'relative';
    banner.insertAdjacentHTML('beforeend', uiHtml);

    const target = new Date("March 21, 2026 09:00:00").getTime();
    const update = () => {
        const now = new Date().getTime();
        const diff = target - now;
        if (diff < 0) {
            if (document.getElementById("ruta-timer-display")) document.getElementById("ruta-timer-display").innerHTML = "РОЗПОЧАТО";
            return;
        }
        const d = Math.floor(diff / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');

        if (document.getElementById("d-val")) document.getElementById("d-val").innerText = d;
        if (document.getElementById("h-val")) document.getElementById("h-val").innerText = h;
        if (document.getElementById("m-val")) document.getElementById("m-val").innerText = m;
        if (document.getElementById("s-val")) document.getElementById("s-val").innerText = s;
    };
    setInterval(update, 1000);
    update();
}

function goToGeneralForm(type = 'main') {
    const user = localStorage.getItem('user');

    if (!user) {
        alert("🔒 Авторизуйтесь, будь ласка, через Google!");
        if (typeof handleAuthClick === 'function') handleAuthClick();
        return;
    }

    const userName = encodeURIComponent(user);
    let url = "";

    if (type === 'cheruta') {
        // Посилання для банера "Червона Рута"
        url = `https://n8n.narodocnt.online/webhook/cheruta/n8n-form?name=${userName}`;
    } else {
        // Посилання для верхньої жовтої кнопки (Загальна заявка)
        url = `https://n8n.narodocnt.online/webhook/ruta-zajavka/n8n-form?name=${userName}`;
    }

    window.open(url, '_blank');
}

if (document.readyState === 'loading') window.addEventListener('load', initRutaUI);
else initRutaUI();
