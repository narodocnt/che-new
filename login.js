document.addEventListener("DOMContentLoaded", () => {

    const GOOGLE_CLIENT_ID = "225496350184-4q6j2iqu5n9hkjt8u4age31bd4nkmedo.apps.googleusercontent.com";
    const GOOGLE_REDIRECT_URI = "https://narodocnt.site/oauth2callback.html";
    const N8N_LOGIN_WEBHOOK = "https://n8n.narodocnt.online/webhook/google-login";

    const btn = document.getElementById("googleLoginBtn");
    if (!btn) {
        console.warn("❗ Кнопка googleLoginBtn не знайдена");
        return;
    }

    btn.style.display = "inline-block";

    btn.addEventListener("click", () => {
        const authUrl =
            "https://accounts.google.com/o/oauth2/v2/auth" +
            "?client_id=" + encodeURIComponent(GOOGLE_CLIENT_ID) +
            "&redirect_uri=" + encodeURIComponent(GOOGLE_REDIRECT_URI) +
            "&response_type=token" +
            "&scope=" + encodeURIComponent("openid email profile") +
            "&prompt=select_account";

        window.location.href = authUrl;
    });

});
