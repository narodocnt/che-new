// login.js

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("googleLoginBtn");

    if (!btn) {
        console.error("❌ Кнопка googleLoginBtn не знайдена в DOM");
        return;
    }

    console.log("✅ Google login button loaded");

    const GOOGLE_CLIENT_ID =
        "734541752522-bqp7ljgjq27k8psn3pv6g3c3rcp16fhi.apps.googleusercontent.com";

    const REDIRECT_URI =
        "https://narodocnt.online/oauth2callback.html";

    btn.style.display = "block";

    btn.addEventListener("click", () => {
        const url =
            "https://accounts.google.com/o/oauth2/v2/auth" +
            "?client_id=" + encodeURIComponent(GOOGLE_CLIENT_ID) +
            "&redirect_uri=" + encodeURIComponent(REDIRECT_URI) +
            "&response_type=code" +
            "&scope=" + encodeURIComponent("openid email profile") +
            "&access_type=online" +
            "&prompt=select_account";

        window.location.href = url;
    });
});
