<script>
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("google-login-btn");

    if (!btn) {
        console.error("❌ Кнопка Google не знайдена");
        return;
    }

    // ✅ FRONTEND CLIENT ID (Web application)
    const GOOGLE_CLIENT_ID = "734541752522-bqp7ljgjq27k8psn3pv6g3c3rcp16fhi.apps.googleusercontent.com";

    // ✅ ЄДИНИЙ redirect
    const REDIRECT_URI = "https://narodocnt.online/oauth2callback.html";

    btn.addEventListener("click", () => {
        const authUrl =
         //   "https://accounts.google.com/o/oauth2/v2/auth" +
         //   "?client_id=" + encodeURIComponent(GOOGLE_CLIENT_ID) +
         //   "&redirect_uri=" + encodeURIComponent(REDIRECT_URI) +
        //   "&response_type=code" +
         //   "&scope=" + encodeURIComponent("openid email profile") +
         //   "&access_type=online" +
        //    "&prompt=select_account";

    btn.addEventListener("click", () => {
    console.log("Кнопка натиснута"); // перевірка
    const authUrl = "https://accounts.google.com/o/oauth2/v2/auth" +
        "?client_id=" + encodeURIComponent(GOOGLE_CLIENT_ID) +
        "&redirect_uri=" + encodeURIComponent(REDIRECT_URI) +
        "&response_type=code" +
        "&scope=" + encodeURIComponent("openid email profile") +
        "&access_type=online" +
        "&prompt=select_account";

    window.location.href = authUrl;
});


        window.location.href = authUrl;
    });
});
</script>
