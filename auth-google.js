/* auth-google.js — PKCE VERSION (2025) */
/* Працює на статичному сайті + n8n */

const GOOGLE_CLIENT_ID = "225496350184-4q6j2iqu5n9hkjt8u4age31bd4nkmedo.apps.googleusercontent.com";
const REDIRECT_URI = "https://narodocnt.online/oauth2callback.html";
const N8N_WEBHOOK = "https://narodocnt.online:5678/webhook/google-signup";

// Генерація випадкового рядка
function randomString(length = 64) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~';
    let result = '';
    for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
}

// Створення SHA256 для PKCE
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

    // Зберігаємо verifier щоб використати після redirect
    localStorage.setItem("google_code_verifier", codeVerifier);

    const authUrl =
        "https://accounts.google.com/o/oauth2/v2/auth" +
        "?client_id=" + GOOGLE_CLIENT_ID +
        "&redirect_uri=" + encodeURIComponent(REDIRECT_URI) +
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

    // Обмін коду на токен
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:
            "client_id=" + encodeURIComponent(GOOGLE_CLIENT_ID) +
            "&code=" + encodeURIComponent(code) +
            "&code_verifier=" + encodeURIComponent(codeVerifier) +
            "&grant_type=authorization_code" +
            "&redirect_uri=" + encodeURIComponent(REDIRECT_URI)
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
        alert("Помилка Google OAuth: " + tokenData.error_description);
        return;
    }

    const idToken = tokenData.id_token;

    // Відправляємо дані у твоє n8n
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

if (window.location.pathname === "/oauth2callback") {
    handleGoogleRedirect();
}
