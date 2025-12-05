/* auth-google.js — Google OAuth PKCE через n8n backend */

const GOOGLE_CLIENT_ID = "225496350184-m83n5351r571i33mn4pk86u93aed6jnc.apps.googleusercontent.com";
const REDIRECT_URI = "[https://narodocnt.online/oauth2callback.html](https://narodocnt.online/oauth2callback.html)"; // має збігатися з Google Cloud Console
const N8N_WEBHOOK = "[https://narodocnt.online/api/google-signup](https://narodocnt.online/api/google-signup)"; // proxy до n8n

// Генератор випадкового рядка
function randomString(length = 64) {
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~';
let result = '';
for (let i = 0; i < length; i++) {
result += chars.charAt(Math.floor(Math.random() * chars.length));
}
return result;
}

// SHA256 → Base64 URL Safe
async function sha256(plain) {
const encoder = new TextEncoder();
const data = encoder.encode(plain);
const hash = await crypto.subtle.digest("SHA-256", data);
return btoa(String.fromCharCode(...new Uint8Array(hash)))
.replace(/+/g, '-')
.replace(///g, '_')
.replace(/=+$/, '');
}

// Step 1 — Старт Google OAuth
async function startGoogleSignIn() {
const codeVerifier = randomString();
const codeChallenge = await sha256(codeVerifier);

```
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
```

}

// Step 2 — Обробка редиректу і відправка коду на n8n
async function handleGoogleRedirect() {
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get("code");
if (!code) return;

```
const codeVerifier = localStorage.getItem("google_code_verifier");
if (!codeVerifier) {
    alert("Code verifier missing!");
    return;
}

// Надсилаємо дані до n8n (n8n обмінює code → tokens)
try {
    const res = await fetch(N8N_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            code,
            code_verifier: codeVerifier,
            redirect_uri: REDIRECT_URI
        })
    });

    const data = await res.json();

    if (data.error) {
        alert("Помилка Google OAuth: " + data.error);
        return;
    }

    // Успішний вхід
    alert("Вхід через Google успішний!");
    window.history.replaceState({}, document.title, "/");

} catch (err) {
    console.error("Google OAuth fetch error:", err);
    alert("Помилка при підключенні до n8n");
}
```

}

// Автоматична обробка при завантаженні callback
if (window.location.pathname === "/oauth2callback.html") {
handleGoogleRedirect();
}
