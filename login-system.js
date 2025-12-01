/* 
  login-system.js
  Єдиний файл, який додає:
  - сучасну кнопку Log in ▾
  - dropdown
  - модалки логіну, email реєстрації
  - Google OAuth
  - Facebook OAuth
  - передавання всього у n8n
*/

/* ====== CONFIG ====== */
const N8N_WEBHOOK = 'https://n8n.narodocnt.online/webhook/register';
const GOOGLE_CLIENT_ID = '225496350184-4q6j2iqu5n9hkjt8u4age31bd4nkmedo.apps.googleusercontent.com';

/* ====== INSERT HTML + CSS INTO PAGE ====== */
document.addEventListener("DOMContentLoaded", () => {
  
  // --- CSS ---
  const css = `
    .login-container { position: fixed; top: 14px; right: 20px; z-index: 1200; }
    .login-btn {
      display:inline-flex; align-items:center; gap:10px;
      padding:10px 16px; background:#2563eb; color:#fff; border-radius:10px; font-weight:600;
      border:none; cursor:pointer; box-shadow:0 6px 18px rgba(37,99,235,0.25);
    }
    .login-btn:active{ transform:translateY(1px); }
    .dropdown {
      position:absolute; right:0; top:52px; width:240px; background:#fff; border-radius:12px;
      box-shadow:0 12px 36px rgba(0,0,0,0.18); overflow:hidden; display:none; flex-direction:column;
    }
    .dropdown a{ display:flex; gap:10px; align-items:center; padding:12px 14px; color:#111; text-decoration:none; cursor:pointer; font-size:15px;}
    .dropdown a:hover{ background:#f6f8fb; }

    .backdrop{ display:none; position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:1400; justify-content:center; align-items:center; padding:20px; }
    .modal {
      width:100%; max-width:440px; background:#fff; border-radius:16px; padding:26px; box-shadow:0 18px 48px rgba(2,6,23,0.3);
    }
    .modal h2{ margin:0 0 12px 0; font-size:22px; }
    .form-row{ margin-bottom:12px; }
    .form-row label{ display:block; font-size:13px; color:#444; margin-bottom:6px; }
    .form-row input{ width:100%; padding:11px 12px; border-radius:10px; border:1px solid #e5e7eb; font-size:15px; }
    .actions{ display:flex; gap:10px; margin-top:18px; }
    .btn { flex:1; padding:12px 14px; border-radius:10px; border:none; font-weight:600; cursor:pointer; }
    .btn.cancel{ background:#f3f4f6; color:#111; }
    .btn.ok{ background:#10b981; color:#fff; box-shadow:0 6px 18px rgba(16,185,129,0.18); }

    .social-row{ display:flex; gap:10px; margin-top:12px; }
    .social-btn{ flex:1; padding:10px; border-radius:10px; border:1px solid #e6e7ee; display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; background:#fff; }
    .social-google{ border-color:#dbeafe; }
    .social-fb{ border-color:#e8f0ff; }

    @media (max-width:520px){
      .login-btn{ padding:9px 12px; font-size:14px; border-radius:9px; }
      .dropdown{ width:200px; top:48px; }
      .modal{ padding:18px; border-radius:12px; }
    }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // --- GOOGLE SCRIPT ---
  const g = document.createElement("script");
  g.src = "https://accounts.google.com/gsi/client";
  g.async = true;
  g.defer = true;
  document.head.appendChild(g);

  // --- HTML BLOCK ---
  document.body.insertAdjacentHTML("beforeend", `
    <div class="login-container">
      <button id="loginBtn" class="login-btn">Log in ▾</button>
      <div id="loginDropdown" class="dropdown">
        <a id="menuLogin">Увійти</a>
        <a id="menuEmail">через e-mail</a>
        <a id="menuGoogle">через Google</a>
        <a id="menuFacebook">через Facebook</a>
      </div>
    </div>

    <div id="modalLogin" class="backdrop">
      <div class="modal">
        <h2>Увійти</h2>
        <div class="form-row"><label>Логін</label><input id="login_login" type="text"/></div>
        <div class="form-row"><label>Пароль</label><input id="login_pass" type="password"/></div>
        <div class="actions">
          <button class="btn cancel" onclick="closeAll()">Cancel</button>
          <button class="btn ok" onclick="submitLogin()">OK</button>
        </div>
      </div>
    </div>

    <div id="modalEmail" class="backdrop">
      <div class="modal">
        <h2>Реєстрація через e-mail</h2>
        <div class="form-row"><label>Прізвище</label><input id="reg_lastname" type="text"/></div>
        <div class="form-row"><label>Ім'я</label><input id="reg_firstname" type="text"/></div>
        <div class="form-row"><label>По-батькові</label><input id="reg_patronymic" type="text"/></div>
        <div class="form-row"><label>E-mail</label><input id="reg_email" type="email"/></div>
        <div class="form-row"><label>Пароль</label><input id="reg_password" type="password"/></div>

        <div class="social-row">
          <button class="social-btn social-google" id="regGoogle">Sign up with Google</button>
          <button class="social-btn social-fb" id="regFb">Sign up with Facebook</button>
        </div>

        <div class="actions">
          <button class="btn cancel" onclick="closeAll()">Cancel</button>
          <button class="btn ok" onclick="submitEmail()">OK</button>
        </div>
      </div>
    </div>
  `);

  /* ==== JS LOGIC ==== */
  const loginBtn = document.getElementById("loginBtn");
  const loginDropdown = document.getElementById("loginDropdown");

  loginBtn.addEventListener("mouseenter", ()=> loginDropdown.style.display = "flex");
  loginBtn.addEventListener("mouseleave", ()=> loginDropdown.style.display = "none");
  loginDropdown.addEventListener("mouseenter", ()=> loginDropdown.style.display = "flex");
  loginDropdown.addEventListener("mouseleave", ()=> loginDropdown.style.display = "none");

  document.getElementById("menuLogin").addEventListener("click", ()=> openModal("modalLogin"));
  document.getElementById("menuEmail").addEventListener("click", ()=> openModal("modalEmail"));
  document.getElementById("menuGoogle").addEventListener("click", ()=> startGoogleSignIn());
  document.getElementById("menuFacebook").addEventListener("click", ()=> startFacebookOAuth());
  document.addEventListener("DOMContentLoaded", () => {
  // інші обробники
  document.getElementById("menuGoogle").addEventListener("click", () => startGoogleSignIn());
  document.getElementById("menuFacebook").addEventListener("click", () => startFacebookOAuth());
});


});

/* ==== FUNCTIONS ==== */
function openModal(id){ document.getElementById(id).style.display = "flex"; }
function closeAll(){
  document.getElementById("modalLogin").style.display = "none";
  document.getElementById("modalEmail").style.display = "none";
}

async function submitLogin(){
  const payload = {
    type: "login",
    login: document.getElementById("login_login").value.trim(),
    password: document.getElementById("login_pass").value.trim(),
    ts: new Date().toISOString()
  };
  await postToN8N(payload);
  closeAll();
  alert("Запит на вхід відправлено.");
}

async function submitEmail(){
  const payload = {
    type: "register_email",
    lastname: document.getElementById("reg_lastname").value.trim(),
    firstname: document.getElementById("reg_firstname").value.trim(),
    patronymic: document.getElementById("reg_patronymic").value.trim(),
    email: document.getElementById("reg_email").value.trim(),
    password: document.getElementById("reg_password").value.trim(),
    ts: new Date().toISOString()
  };
  await postToN8N(payload);
  closeAll();
  alert("Дані реєстрації відправлено.");
}

async function postToN8N(payload){
  try{
    await fetch(N8N_WEBHOOK, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });
  }catch(err){
    console.error("n8n error:", err);
  }
}

function startGoogleSignIn(){
  const redirectUri = window.location.origin + "/oauth2callback";
  const url =
    "https://accounts.google.com/o/oauth2/v2/auth?client_id=" +
    GOOGLE_CLIENT_ID +
    "&redirect_uri=" + encodeURIComponent(redirectUri) +
    "&response_type=token&scope=openid%20email%20profile&prompt=select_account";
  window.location.href = url;
}

function startFacebookOAuth(){
  const fbId = "YOUR_FB_APP_ID";
  const fbRedirect = window.location.origin + "/fb_oauth_callback";
  const url =
    `https://www.facebook.com/v16.0/dialog/oauth?client_id=${fbId}&redirect_uri=${encodeURIComponent(fbRedirect)}&response_type=token&scope=email`;
  window.location.href = url;
}
