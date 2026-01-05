document.addEventListener("DOMContentLoaded", function() {
    // 1. Шукаємо конкретний блок за ID "about", який ми видаляємо
    const aboutSection = document.getElementById('about');

    if (aboutSection) {
        // Створюємо новий контейнер для картинки та кнопок
        const newBanner = document.createElement('div');
        newBanner.className = 'cheruta-banner-container';
        newBanner.style.cssText = `
            position: relative;
            width: 100%;
            max-width: 800px;
            margin: 30px auto;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            line-height: 0;
        `;

        // Вставляємо картинку та кнопки
        newBanner.innerHTML = `
            <img src="cheruta.jpg" alt="Червона Рута 2026" style="width: 100%; height: auto; display: block;">
            
            <div style="
                position: absolute; 
                bottom: 15px; 
                left: 0; 
                right: 0; 
                display: flex; 
                justify-content: space-between; 
                padding: 0 20px;
                gap: 15px;
            ">
                <a href="ПОСИЛАННЯ_НА_ПОЛОЖЕННЯ" target="_blank" class="cheruta-btn btn-left">
                    ЧИТАТИ ПОЛОЖЕННЯ
                </a>

                <a href="ПОСИЛАННЯ_НА_ЗАЯВКУ" target="_blank" class="cheruta-btn btn-right">
                    ПОДАТИ ЗАЯВКУ
                </a>
            </div>

            <style>
                .cheruta-btn {
                    flex: 1;
                    padding: 12px 10px;
                    text-align: center;
                    text-decoration: none;
                    font-family: 'Arial', sans-serif;
                    font-size: 14px;
                    font-weight: bold;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                    line-height: 1.2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-transform: uppercase;
                }
                .btn-left {
                    background-color: rgba(255, 255, 255, 0.15);
                    color: #ffffff;
                    border: 2px solid #ffffff;
                    backdrop-filter: blur(5px);
                }
                .btn-left:hover {
                    background-color: #ffffff;
                    color: #000000;
                }
                .btn-right {
                    background-color: #ff4500; /* Помаранчевий під колір "Рути" */
                    color: white;
                    border: 2px solid #ff4500;
                }
                .btn-right:hover {
                    background-color: #e63e00;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(255, 69, 0, 0.5);
                }
                /* Адаптація для мобільних */
                @media (max-width: 480px) {
                    .cheruta-btn { font-size: 10px; padding: 8px 5px; }
                    .cheruta-banner-container { margin: 15px auto; }
                }
            </style>
        `;

        // Замінюємо старий блок новим
        aboutSection.parentNode.replaceChild(newBanner, aboutSection);
    }
});
