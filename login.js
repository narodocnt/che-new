document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("google-login-btn");
    if (!btn) return console.error("❌ Кнопка Google не знайдена");

    const GOOGLE_CLIENT_ID = "734541752522-bqp7ljgjq27k8psn3pv6g3c3rcp16fhi.apps.googleusercontent.com";
    const REDIRECT_URI = "https://narodocnt.online/oauth2callback.html";

    btn.addEventListener("click", () => {
        const authUrl =
            "https://accounts.google.com/o/oauth2/v2/auth" +
            "?client_id=" + encodeURIComponent(GOOGLE_CLIENT_ID) +
            "&redirect_uri=" + encodeURIComponent(REDIRECT_URI) +
            "&response_type=id_token token" +   // ⚡ Implicit Flow для фронтенду
            "&scope=" + encodeURIComponent("openid email profile") +
            "&prompt=select_account";

        window.location.href = authUrl;
    });
});
