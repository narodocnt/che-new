/* auth-google.js — PKCE для GitHub Pages + n8n */

const GOOGLE_CLIENT_ID = "225496350184-8ppjonps7e592h69eltuh2t7gk71bhl8.apps.googleusercontent.com";
const REDIRECT_URI = "https://narodocnt.online/oauth2callback.html"; // точно збігається з GitHub Pages
const N8N_WEBHOOK = "https://narodocnt.online:5678/webhook/google-signup";

// Генерація випадкового рядка
function randomString(length = 64) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~';
    let result = '';
    for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
}

// SHA256 для PKCE
async function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Початок Google OAuth
async function startGoogleSignIn() {
    const codeVerifier = randomString();
    const codeChallenge = await sha256(codeVerifier);

    localStorage.setItem("google_code_verifier", codeVerifier);

    const authUrl =
        "https://accounts.google.com/o/oauth2/v2/auth" +
        "?client_id=" + GOOGLE_CLIENT_ID +
        "&redirect_uri=" + REDIRECT_URI +
        "&response_type=code" +
        "&scope=" + encodeURIComponent("openid email profile") +
        "&code_challenge=" + codeChallenge +
        "&code_challenge_method=S256" +
        "&prompt=select_account";

    window.location.href = authUrl;
}

// Обробка редіректу після входу
async function handleGoogleRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (!code) return;

    const codeVerifier = localStorage.getItem("google_code_verifier");

    const body = new URLSearchParams();
    body.append("client_id", GOOGLE_CLIENT_ID);
    body.append("code", code);
    body.append("code_verifier", codeVerifier);
    body.append("grant_type", "authorization_code");
    body.append("redirect_uri", encodeURIComponent(REDIRECT_URI));

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString()
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
        alert("Помилка Google OAuth: " + tokenData.error_description);
        return;
    }

    const idToken = tokenData.id_token;

    // Надсилаємо у n8n
    await fetch(N8N_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            type: "google",
            id_token: idToken,
            ts: new Date().toISOString()
        })
    });

    alert("Вхід через Google успішний!");

    // Чистимо URL
    window.history.replaceState({}, document.title, "/");
}

// Автоматична обробка редіректу
if (window.location.pathname === "/oauth2callback.html") {
    handleGoogleRedirect();
}

/* --- Меню кнопки з таймером --- */
document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("registerBtn");
    const menu = document.getElementById("registerMenu");
    let timeout;

    if (!button || !menu) return;

    const showMenu = () => {
        clearTimeout(timeout);
        menu.style.display = "block";
    };
    const hideMenu = () => {
        timeout = setTimeout(() => {
            menu.style.display = "none";
        }, 300); // 300ms затримка
    };

    button.addEventListener("mouseenter", showMenu);
    button.addEventListener("mouseleave", hideMenu);
    menu.addEventListener("mouseenter", showMenu);
    menu.addEventListener("mouseleave", hideMenu);
});
