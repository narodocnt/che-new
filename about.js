(function() {
    function initAbout() {
        try {
            // 1. Додаємо стилі
            const style = document.createElement('style');
            style.innerHTML = `
                .logo-animated {
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
                    cursor: pointer !important;
                    display: inline-block !important;
                }
                .logo-animated:hover {
                    transform: translateY(-10px) scale(1.05) !important;
                    filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8)) !important;
                }
                .modal-overlay {
                    display: none; position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(5px);
                    z-index: 10000; justify-content: center; align-items: center;
                }
                .modal-content {
                    background: #fff; padding: 30px; border-radius: 20px;
                    max-width: 550px; width: 90%; position: relative;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    border: 3px solid #f39c12; animation: slideInAbout 0.4s ease;
                    font-family: sans-serif; color: #333;
                }
                @keyframes slideInAbout {
                    from { transform: scale(0.7); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .close-modal {
                    position: absolute; top: 10px; right: 15px;
                    font-size: 28px; cursor: pointer; color: #999;
                }
                .modal-header { font-size: 24px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                .genre-list { margin: 15px 0; padding-left: 20px; list-style-type: '✨ '; }
            `;
            document.head.appendChild(style);

            // 2. Додаємо HTML
            const modalHTML = `
                <div id="aboutModal" class="modal-overlay">
                    <div class="modal-content">
                        <span class="close-modal" id="closeAboutBtn">&times;</span>
                        <div class="modal-header">Про нас</div>
                        <div class="modal-body">
                            <p><b>Відділ народної творчості</b> — ключовий підрозділ Черкаського ОЦНТ.</p>
                            <ul class="genre-list">
                                <li><b>Хореографічний жанр</b></li>
                                <li><b>Вокально-хоровий жанр</b></li>
                                <li><b>Музично-інструментальний жанр</b></li>
                                <li><b>Театральний жанр</b></li>
                            </ul>
                            <p>Ми зберігаємо національний код Черкащини!</p>
                        </div>
                    </div>
                </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // 3. Логіка
            const modal = document.getElementById('aboutModal');
            
            window.openAbout = function() {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            };

            window.closeAbout = function() {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            };

            document.getElementById('closeAboutBtn').onclick = window.closeAbout;
            modal.onclick = function(e) { if (e.target == modal) window.closeAbout(); };

        } catch (e) {
            console.error("Помилка в about.js: ", e);
        }
    }

    // Чекаємо завантаження DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAbout);
    } else {
        initAbout();
    }
})();
