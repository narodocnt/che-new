document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("registerBtn");
    const menu = document.getElementById("registerMenu");
    let timeout;

    if (button && menu) {
        const showMenu = () => {
            clearTimeout(timeout);
            menu.style.display = "block";
        };
        const hideMenu = () => {
            timeout = setTimeout(() => {
                menu.style.display = "none";
            }, 300); // таймер 300ms
        };

        button.addEventListener("mouseenter", showMenu);
        button.addEventListener("mouseleave", hideMenu);
        menu.addEventListener("mouseenter", showMenu);
        menu.addEventListener("mouseleave", hideMenu);
    }

    // Підключаємо Google OAuth до кнопки в меню
    const googleBtn = document.getElementById("googleSignIn");
    if (googleBtn) {
        googleBtn.addEventListener("click", (e) => {
            e.preventDefault();
            startGoogleSignIn(); // функція з auth-google.js
        });
    }
});
