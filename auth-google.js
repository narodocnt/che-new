// -------------------------
// 1. Старт Google OAuth
// -------------------------
async function startGoogleOAuth() {
    const clientId = "225496350184-m83n5351r571i33mn4pk86u93aed6jnc.apps.googleusercontent.com";
    const redirectUri = "https://narodocnt.online/oauth2callback.html";

    // 1. Генеруємо code_verifier
    const codeVerifier = generateRandomString(64);
    localStorage.setItem("code_verifier", codeVerifier);

    // 2. Генеруємо code_challenge
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // 3. Створюємо URL Google
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        access_type: "offline"
    });

    window.location.href = "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString();
}



// -------------------------
// 2. Обробка редіректу Google
// -------------------------
async function handleGoogleRedirect() {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    const codeVerifier = localStorage.getItem("code_verifier");

    console.log("=== PAGE LOADED ===");
    console.log("CODE:", code);
    console.log("code_verifier:", codeVerifier);

    if (!code) {
        document.body.innerHTML = "❌ Google не повернув code";
        return;
    }

    if (!codeVerifier) {
        document.body.innerHTML = "❌ Помилка: code_verifier відсутній! Запустіть авторизацію знову.";
        return;
    }

    // Надсилаємо в n8n
    await fetch("https://narodocnt.online:5678/webhook-test/google-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            code,
            code_verifier: codeVerifier,
            redirect_uri: "https://narodocnt.online/oauth2callback.html"
        })
    });

    document.body.innerHTML = "Google авторизація успішна! 🎉";
}



// -------------------------------
// Допоміжні функції
// -------------------------------
function generateRandomString(len) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const array = new Uint32Array(len);
    crypto.getRandomValues(array);
    return Array.from(array, x => chars[x % chars.length]).join('');
}

async function generateCodeChallenge(verifier) {
    const data = new TextEncoder().encode(verifier);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}



// -------------------------------
// Автозапуск callback
// -------------------------------
if (location.pathname.includes("oauth2callback.html")) {
    handleGoogleRedirect();
}
