// -------------------------
// 1. Старт Google OAuth
// -------------------------
async function startGoogleOAuth() {
    const clientId = "225496350184-m83n5351r571i33mn4pk86u93aed6jnc.apps.googleusercontent.com";
    const redirectUri = "https://narodocnt.online/google-signup";

    // 1. Генеруємо code_verifier
    const codeVerifier = generateRandomString(64);
    localStorage.setItem("code_verifier", codeVerifier);

    // 2. Генеруємо code_challenge
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // 3. Формуємо URL
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        access_type: "offline",
        prompt: "consent"
    });

    // 4. Редірект на Google
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}



// -------------------------
// 2. Обробка redirect сторінки
// -------------------------
async function handleGoogleRedirect() {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    const codeVerifier = localStorage.getItem("code_verifier");

    console.log("=== PAGE LOADED ===");
    console.log("Code:", code);
    console.log("code_verifier:", codeVerifier);

    if (!code) {
        document.body.innerHTML = "❌ Помилка: Google не повернув code";
        return;
    }

    if (!codeVerifier) {
        document.body.innerHTML = "❌ code_verifier відсутній! Запустіть авторизацію знову.";
        return;
    }

    // Відправляємо в n8n
    await fetch("https://narodocnt.online:5678/webhook-test/google-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            code,
            code_verifier: codeVerifier,
            redirect_uri: "https://narodocnt.online/google-signup"
        })
    });

    document.body.innerHTML = "Успішно! Очікуйте завершення...";
}



// -------------------------------
// Допоміжні функції
// -------------------------------
function generateRandomString(length) {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
        result += charset[array[i] % charset.length];
    }
    return result;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}



// -------------------------------
// Автоматичний запуск на сторінці редіректу
// -------------------------------
if (location.pathname.includes("/google-signup")) {
    handleGoogleRedirect();
}
