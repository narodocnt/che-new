document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("google-login-btn");

    if (!btn) {
        console.error("❌ Кнопка Google не знайдена");
        return;
    }

    const GOOGLE_CLIENT_ID = "734541752522-bqp7ljgjq27k8psn3pv6g3c3rcp16fhi.apps.googleusercontent.com";
    const REDIRECT_URI = "https://narodocnt.online/oauth2callback.html";

    btn.addEventListener("click", () => {
        console.log("Кнопка Google натиснута");

        // Формуємо URL для OAuth редиректу
        const authUrl =
            "https://accounts.google.com/o/oauth2/v2/auth" +
            "?client_id=" + encodeURIComponent(GOOGLE_CLIENT_ID) +
            "&redirect_uri=" + encodeURIComponent(REDIRECT_URI) +
            "&response_type=token id_token" +   // важливо, щоб отримати id_token
            "&scope=" + encodeURIComponent("openid email profile") +
            "&prompt=select_account";

        // Відкриваємо нове вікно для авторизації
        const authWindow = window.open(authUrl, "_blank", "width=500,height=600");

        // Перевіряємо, коли користувач повертається
        const interval = setInterval(() => {
            try {
                if (!authWindow || authWindow.closed) {
                    clearInterval(interval);
                    console.log("Авторизація завершена або вікно закрите");
                } else {
                    const url = authWindow.location.href;
                    if (url.includes("access_token") || url.includes("id_token")) {
                        const params = new URL(url).hash.substring(1);
                        const token = new URLSearchParams(params).get("id_token");
                        if (token) {
                            console.log("Отримано id_token:", token);

                            // Надсилаємо токен на n8n вебхук
                            fetch("https://n8n.narodocnt.online/webhook/google-login", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id_token: token })
                            })
                            .then(res => res.json())
                            .then(data => {
                                if (data.success) {
                                    window.location.href = "/dashboard.html";
                                } else {
                                    alert("Помилка входу. Спробуйте ще раз.");
                                }
                            })
                            .catch(err => {
                                console.error(err);
                                alert("Сталася помилка під час авторизації.");
                            });

                            authWindow.close();
                            clearInterval(interval);
                        }
                    }
                }
            } catch(e) {
                // Якщо домени різні, буде помилка, просто ігноруємо поки не редирект
            }
        }, 500);
    });
});
