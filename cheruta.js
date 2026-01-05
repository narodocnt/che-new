document.addEventListener("DOMContentLoaded", function() {
    // 1. Шукаємо блок "about" для заміни
    const aboutSection = document.getElementById('about');

    if (aboutSection) {
        // Створюємо контейнер банера
        const newBanner = document.createElement('div');
        newBanner.className = 'cheruta-banner-container';
        newBanner.style.cssText = `
            position: relative;
            width: 100%;
            max-width: 900px;
            margin: 30px auto;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            line-height: 0;
        `;

        // Вставляємо картинку та кнопки поверх неї
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
                <a href="URL_ПОЛОЖЕННЯ" target="_blank" class="cheruta-btn btn-left">
                    ЧИТАТИ ПОЛОЖЕННЯ
                </a>

                <button id="openFormBtn" class="cheruta-btn btn-right">
                    ПОДАТИ ЗАЯВКУ
                </button>
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
                    cursor: pointer;
                    border: none;
                }
                .btn-left {
                    background-color: rgba(255, 255, 255, 0.15);
                    color: #ffffff;
                    border: 2px solid #ffffff !important;
                    backdrop-filter: blur(5px);
                }
                .btn-left:hover { background-color: #ffffff; color: #000000; }
                
                .btn-right {
                    background-color: #ff4500;
                    color: white;
                    border: 2px solid #ff4500 !important;
                }
                .btn-right:hover {
                    background-color: #e63e00;
                    transform: translateY(-2px);
                }
                @media (max-width: 480px) {
                    .cheruta-btn { font-size: 10px; padding: 8px 5px; }
                }
            </style>
        `;

        // Замінюємо старий блок новим
        aboutSection.parentNode.replaceChild(newBanner, aboutSection);

        // 2. Створюємо модальне вікно (додаємо в кінець body)
        const modal = document.createElement('div');
        modal.id = 'rutaModal';
        modal.style.cssText = `
            display: none; 
            position: fixed; 
            z-index: 99999; 
            left: 0; 
            top: 0; 
            width: 100%; 
            height: 100%; 
            background: rgba(0,0,0,0.85); 
            overflow-y: auto; 
            padding: 20px; 
            box-sizing: border-box;
        `;

        modal.innerHTML = `
            <div style="background: #fff; margin: 20px auto; padding: 30px; border-radius: 12px; max-width: 600px; position: relative; font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
                <span id="closeModal" style="position: absolute; right: 20px; top: 10px; font-size: 35px; cursor: pointer; color: #999;">&times;</span>
                <h2 style="text-align: center; color: #ff4500; margin-top: 0;">АНКЕТА УЧАСНИКА - 2026</h2>
                <p style="font-size: 12px; text-align: center; margin-bottom: 20px; color: #666;">Усі поля є обов’язковими для заповнення</p>
                
                <form id="rutaEntryForm">
                    <label style="font-weight:bold; display:block; margin-bottom:5px;">01. Жанр музики:</label>
                    <select name="genre" required style="width: 100%; padding: 12px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 6px;">
                        <option value="фольклор">Фольклор</option>
                        <option value="поп-музика">Поп-музика</option>
                        <option value="танцювальна">Танцювальна</option>
                        <option value="акустична">Акустична</option>
                        <option value="рок-музика">Рок-музика</option>
                        <option value="інша">Інша музика</option>
                    </select>

                    <label style="font-weight:bold; display:block; margin-bottom:5px;">03. Прізвище, ім’я соліста / Назва гурту:</label>
                    <input type="text" name="participant_name" required style="width: 100%; padding: 12px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 6px;">

                    <label style="font-weight:bold; display:block; margin-bottom:5px;">04. Володіння інструментами / Склад гурту:</label>
                    <textarea name="instruments" required style="width: 100%; padding: 12px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 6px; height: 60px;"></textarea>

                    <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 200px;">
                            <label style="font-weight:bold; display:block; margin-bottom:5px;">05. Номер мобільного:</label>
                            <input type="tel" name="phone" placeholder="+380..." required style="width: 100%; padding: 12px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 6px;">
                        </div>
                        <div style="flex: 1; min-width: 200px;">
                            <label style="font-weight:bold; display:block; margin-bottom:5px;">Email:</label>
                            <input type="email" name="email" required style="width: 100%; padding: 12px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 6px;">
                        </div>
                    </div>

                    <label style="font-weight:bold; display:block; margin-bottom:5px;">10. Конкурсний репертуар (Назви пісень та автори):</label>
                    <textarea name="repertoire" required style="width: 100%; padding: 12px; margin-bottom: 25px; border: 1px solid #ccc; border-radius: 6px; height: 80px;" placeholder="1 пісня: Назва - Автор..."></textarea>

                    <button type="submit" id="submitBtn" style="width: 100%; padding: 16px; background: #ff4500; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 16px; transition: 0.3s;">ВІДПРАВИТИ ЗАЯВКУ</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        // Логіка відкриття/закриття
        const openBtn = document.getElementById('openFormBtn');
        const closeBtn = document.getElementById('closeModal');
        const form = document.getElementById('rutaEntryForm');

        openBtn.addEventListener('click', function() {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Заборона прокрутки фону
        });

        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });

        // Відправка в n8n
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.innerText = 'ВІДПРАВКА...';
            submitBtn.disabled = true;

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('https://n8n.narodocnt.online/webhook/ruta-zayavka', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    alert('Дякуємо! Ваша заявка прийнята.');
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    form.reset();
                } else {
                    throw new Error();
                }
            } catch (err) {
                alert('Помилка відправки. Перевірте з’єднання.');
            } finally {
                submitBtn.innerText = 'ВІДПРАВИТИ ЗАЯВКУ';
                submitBtn.disabled = false;
            }
        });
    }
});
