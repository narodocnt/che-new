// Фінальна версія about.js
(function() {
    function injectAboutModule() {
        if (document.getElementById('aboutModal')) return;

        const style = document.createElement('style');
        style.innerHTML = `
            .logo-animated {
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
                cursor: pointer !important;
            }
            .logo-animated:hover {
                transform: translateY(-10px) scale(1.03) !important;
                filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.9)) !important;
            }
            .modal-overlay {
                display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(10px);
                z-index: 999999; justify-content: center; align-items: center;
            }
            .modal-content {
                background: #fff; padding: 40px; border-radius: 25px;
                max-width: 550px; width: 90%; position: relative;
                box-shadow: 0 20px 60px rgba(0,0,0,0.6);
                border: 4px solid #f39c12; animation: slideInAbout 0.5s ease;
                font-family: 'Segoe UI', Tahoma, sans-serif; color: #333;
            }
            @keyframes slideInAbout {
                from { transform: translateY(100px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .close-modal-btn {
                position: absolute; top: 15px; right: 20px;
                font-size: 35px; cursor: pointer; color: #ccc; line-height: 1;
            }
            .close-modal-btn:hover { color: #e74c3c; }
            .modal-header { font-size: 26px; font-weight: bold; margin-bottom: 20px; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; color: #2c3e50; text-align: center; }
            .genre-list { margin: 20px 0; padding-left: 25px; list-style: none; }
            .genre-list li { margin-bottom: 12px; font-size: 18px; position: relative; }
            .genre-list li::before { content: '✨'; position: absolute; left: -30px; }
        `;
        document.head.appendChild(style);

        const modalHTML = `
            <div id="aboutModal" class="modal-overlay">
                <div class="modal-content">
                    <span class="close-modal-btn" onclick="window.closeAbout()">&times;</span>
                    <div class="modal-header">Про нас</div>
                    <div class="modal-body">
                        <p><b>Відділ народної творчості</b> — методичний та творчий центр Черкаського ОЦНТ.</p>
                        <p>Ми опікуємося культурою Черкащини у таких жанрах:</p>
                        <ul class="genre-list">
                            <li><b>Хореографічний</b></li>
                            <li><b>Вокально-хоровий</b></li>
                            <li><b>Музично-інструментальний</b></li>
                            <li><b>Театральний</b></li>
                        </ul>
                        <p style="text-align: center; font-style: italic; margin-top: 25px; color: #7f8c8d;">Зберігаємо код нації — творимо майбутнє!</p>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // РЕЄСТРУЄМО ФУНКЦІЇ ГЛОБАЛЬНО
    window.openAbout = function() {
        const modal = document.getElementById('aboutModal');
        if (!modal) injectAboutModule();
        document.getElementById('aboutModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    window.closeAbout = function() {
        const modal = document.getElementById('aboutModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };

    // Закриття кліком по фону
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('aboutModal');
        if (e.target === modal) window.closeAbout();
    });

    // Ініціалізація відразу
    if (document.readyState === 'complete') {
        injectAboutModule();
    } else {
        window.addEventListener('load', injectAboutModule);
    }
})();
