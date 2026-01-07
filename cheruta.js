function startRutaCountdown() {
    // Дата проведення конкурсу
    const target = new Date("March 21, 2026 09:00:00").getTime();

    function update() {
        const now = new Date().getTime();
        const diff = target - now;

        if (diff < 0) {
            const timerContainer = document.getElementById("ruta-timer");
            if (timerContainer) timerContainer.innerHTML = "БЕРЕЗЕНЬ 2026";
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        // Оновлюємо цифри в існуючому HTML
        const dEl = document.getElementById("d-val");
        const hEl = document.getElementById("h-val");
        const mEl = document.getElementById("m-val");
        const sEl = document.getElementById("s-val");

        if (dEl) dEl.innerText = d.toString().padStart(2, '0');
        if (hEl) hEl.innerText = h.toString().padStart(2, '0');
        if (mEl) mEl.innerText = m.toString().padStart(2, '0');
        if (sEl) sEl.innerText = s.toString().padStart(2, '0');
    }

    setInterval(update, 1000);
    update();
}

document.addEventListener('DOMContentLoaded', startRutaCountdown);
