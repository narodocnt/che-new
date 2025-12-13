// login.js
const CLIENT_ID = "ТВОЇ_GOOGLE_CLIENT_ID"; // встав свій Client ID
const REDIRECT_URI = "https://narodocnt.online/oauth2callback.html"; // твій callback

document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("googleLoginBtn");

    loginButton.addEventListener("click", () => {
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${CLIENT_ID}` +
            `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
            `&response_type=token` +
            `&scope=openid%20email%20profile` +
            `&prompt=select_account`;

        // Відкриваємо OAuth у новому вікні
        const width = 500;
        const height = 600;
        const left = (screen.width - width) / 2;
        const top = (screen.height - height) / 2;

        window.open(
            authUrl,
            "GoogleLogin",
            `width=${width},height=${height},top=${top},left=${left}`
        );
    });
});
