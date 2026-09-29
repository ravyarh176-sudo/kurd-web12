
/* =========================================================
   STOREAI — PHASE 1
   Builder UI + Preview + Theme + Navigation
   ========================================================= */

"use strict";

/* =========================================================
   CONFIG
   ========================================================= */

const CONFIG = {
  ADMIN_EMAIL: "ravyarhasan023@gmail.com",

  STORAGE_KEYS: {
    theme: "storeai_theme",
    prompt: "storeai_prompt",
    generatedStore: "storeai_generated_store",
    currentUser: "storeai_current_user"
  }
};


/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];

const safeText = (value) =>
  String(value ?? "").replace(/[<>]/g, "");


/* =========================================================
   APP STATE
   ========================================================= */

const state = {
  currentPage: "builder",

  theme: localStorage.getItem(
    CONFIG.STORAGE_KEYS.theme
  ) || "dark",

  prompt:
    localStorage.getItem(
      CONFIG.STORAGE_KEYS.prompt
    ) || "",

  currentUser:
    JSON.parse(
      localStorage.getItem(
        CONFIG.STORAGE_KEYS.currentUser
      ) || "null"
    ),

  generatedStore:
    localStorage.getItem(
      CONFIG.STORAGE_KEYS.generatedStore
    ) || null,

  previewDevice: "desktop",

  isGenerating: false
};


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initializeTheme();

  initializeNavigation();

  initializePrompt();

  initializeQuickPrompts();

  initializePreviewControls();

  initializeThemeButton();

  initializeMobileSidebar();

  initializeAuthButton();

  initializeLogout();

  restoreGeneratedStore();

  updateUserInterface();

  showInitialPage();
});


/* =========================================================
   THEME
   ========================================================= */

function initializeTheme() {
  document.body.classList.toggle(
    "light",
    state.theme === "light"
  );

  updateThemeIcon();
}


function initializeThemeButton() {
  const button =
    $("[data-action='theme']") ||
    $("#themeToggle") ||
    $(".theme-toggle");

  if (!button) return;

  button.addEventListener("click", toggleTheme);
}


function toggleTheme() {
  state.theme =
    state.theme === "dark"
      ? "light"
      : "dark";

  document.body.classList.toggle(
    "light",
    state.theme === "light"
  );

  localStorage.setItem(
    CONFIG.STORAGE_KEYS.theme,
    state.theme
  );

  updateThemeIcon();

  showToast(
    state.theme === "light"
      ? "ڕووکاری ڕوون چالاک کرا"
      : "ڕووکاری تاریک چالاک کرا"
  );
}


function updateThemeIcon() {
  const button =
    $("[data-action='theme']") ||
    $("#themeToggle") ||
    $(".theme-toggle");

  if (!button) return;

  const icon = button.querySelector(
    "[data-theme-icon]"
  );

  if (icon) {
    icon.textContent =
      state.theme === "dark"
        ? "☀️"
        : "🌙";
  }
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function initializeNavigation() {
  const navItems =
    $$(".nav-item");

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const page =
        item.dataset.page ||
        item.dataset.target;

      if (!page) return;

      navigateTo(page);
    });
  });
}


function navigateTo(page) {
  state.currentPage = page;

  const pages =
    $$(".page");

  pages.forEach((section) => {
    const pageName =
      section.dataset.page ||
      section.id;

    section.classList.toggle(
      "hidden",
      pageName !== page
    );
  });

  $$(".nav-item").forEach((item) => {
    const target =
      item.dataset.page ||
      item.dataset.target;

    item.classList.toggle(
      "active",
      target === page
    );
  });

  closeMobileSidebar();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


function showInitialPage() {
  navigateTo(
    state.currentPage || "builder"
  );
}


/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */

function initializeMobileSidebar() {
  const menuButton =
    $("[data-action='menu']") ||
    $("#menuButton") ||
    $(".menu-button");

  const sidebar =
    $(".sidebar");

  if (!menuButton || !sidebar) return;

  menuButton.addEventListener(
    "click",
    () => {
      sidebar.classList.toggle("open");
    }
  );

  document.addEventListener(
    "click",
    (event) => {
      if (
        window.innerWidth >= 1024
      ) {
        return;
      }

      const clickedInside =
        sidebar.contains(event.target) ||
        menuButton.contains(event.target);

      if (!clickedInside) {
        closeMobileSidebar();
      }
    }
  );
}


function closeMobileSidebar() {
  const sidebar =
    $(".sidebar");

  if (!sidebar) return;

  sidebar.classList.remove("open");
}


/* =========================================================
   PROMPT
   ========================================================= */

function initializePrompt() {
  const textarea =
    $("#storePrompt") ||
    $("#promptInput") ||
    $("textarea");

  if (!textarea) return;

  textarea.value = state.prompt;

  updatePromptCounter(
    textarea.value
  );

  textarea.addEventListener(
    "input",
    () => {
      const value =
        textarea.value.trim();

      state.prompt = value;

      localStorage.setItem(
        CONFIG.STORAGE_KEYS.prompt,
        value
      );

      updatePromptCounter(
        textarea.value
      );
    }
  );

  textarea.addEventListener(
    "keydown",
    (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "Enter"
      ) {
        event.preventDefault();

        generateStore();
      }
    }
  );

  const generateButton =
    $("#generateButton") ||
    $("[data-action='generate']") ||
    $(".generate-button");

  if (generateButton) {
    generateButton.addEventListener(
      "click",
      generateStore
    );
  }
}


function updatePromptCounter(value) {
  const counter =
    $("#promptCounter") ||
    $("[data-prompt-counter]");

  if (!counter) return;

  counter.textContent =
    `${value.length} / 4000`;
}


/* =========================================================
   QUICK PROMPTS
   ========================================================= */

function initializeQuickPrompts() {
  const cards =
    $$(".quick-card");

  cards.forEach((card) => {
    card.addEventListener(
      "click",
      () => {
        const prompt =
          card.dataset.prompt ||
          card.getAttribute("data-text");

        if (!prompt) return;

        const textarea =
          $("#storePrompt") ||
          $("#promptInput") ||
          $("textarea");

        if (!textarea) return;

        textarea.value = prompt;

        state.prompt = prompt;

        localStorage.setItem(
          CONFIG.STORAGE_KEYS.prompt,
          prompt
        );

        updatePromptCounter(prompt);

        textarea.focus();

        showToast(
          "داواکارییەکە بۆت ئامادە کرا"
        );
      }
    );
  });
}


/* =========================================================
   GENERATE STORE
   ========================================================= */

async function generateStore() {
  if (state.isGenerating) {
    return;
  }

  const textarea =
    $("#storePrompt") ||
    $("#promptInput") ||
    $("textarea");

  if (!textarea) return;

  const prompt =
    textarea.value.trim();

  if (!prompt) {
    showToast(
      "تکایە پێناسەی ئەو فرۆشگایە بنووسە کە دەتەوێت دروستی بکەیت"
    );

    textarea.focus();

    return;
  }

  if (prompt.length < 10) {
    showToast(
      "تکایە وردەکاری زیاتر بنووسە"
    );

    textarea.focus();

    return;
  }

  if (prompt.length > 4000) {
    showToast(
      "داواکارییەکە زۆر درێژە. تکایە کورتتری بکە"
    );

    return;
  }

  state.isGenerating = true;

  setGenerateLoading(true);

  try {
    /*
      PHASE 1 DEMO

      لە Phase 1 ـدا backend ـی Gemini هێشتا
      نییە. بۆیە preview ـێکی demo دروست دەکەین.

      لە Phase 1 ـی backend دواتر ئەمە دەبێتە:

      POST /api/generate

      {
        prompt: "..."
      }

      و Gemini لە Worker ـەکە بانگ دەکرێت.
    */

    await sleep(900);

    const generated =
      createDemoStore(prompt);

    state.generatedStore =
      generated;

    localStorage.setItem(
      CONFIG.STORAGE_KEYS.generatedStore,
      generated
    );

    renderPreview(generated);

    showToast(
      "وێبگەکە بە سەرکەوتوویی دروست کرا ✨"
    );

  } catch (error) {

    console.error(
      "Generation error:",
      error
    );

    showToast(
      "کێشەیەک ڕوویدا. تکایە دووبارە هەوڵ بدەرەوە"
    );

  } finally {

    state.isGenerating = false;

    setGenerateLoading(false);
  }
}


/* =========================================================
   GENERATE BUTTON STATE
   ========================================================= */

function setGenerateLoading(loading) {
  const button =
    $("#generateButton") ||
    $("[data-action='generate']") ||
    $(".generate-button");

  if (!button) return;

  if (loading) {

    button.disabled = true;

    button.dataset.originalText =
      button.innerHTML;

    button.innerHTML = `
      <span class="sparkle">◌</span>
      <span>دروستکردن...</span>
    `;

  } else {

    button.disabled = false;

    if (button.dataset.originalText) {
      button.innerHTML =
        button.dataset.originalText;
    }
  }
}


/* =========================================================
   DEMO STORE GENERATOR
   ========================================================= */

function createDemoStore(prompt) {

  const lower =
    prompt.toLowerCase();

  let storeType =
    "فرۆشگای ئۆنلاین";

  if (
    lower.includes("جل") ||
    lower.includes("کراس") ||
    lower.includes("clothing") ||
    lower.includes("fashion")
  ) {
    storeType =
      "فرۆشگای جل و بەرگ";
  }

  if (
    lower.includes("مۆبایل") ||
    lower.includes("mobile") ||
    lower.includes("phone")
  ) {
    storeType =
      "فرۆشگای مۆبایل";
  }

  if (
    lower.includes("کۆمپیوتەر") ||
    lower.includes("computer") ||
    lower.includes("laptop")
  ) {
    storeType =
      "فرۆشگای کۆمپیوتەر";
  }

  if (
    lower.includes("ئەلیکترۆنی") ||
    lower.includes("electronics")
  ) {
    storeType =
      "فرۆشگای ئەلیکترۆنیات";
  }

  const products = [
    {
      name: "بەرهەمی یەکەم",
      price: "$29"
    },
    {
      name: "بەرهەمی دووەم",
      price: "$45"
    },
    {
      name: "بەرهەمی سێیەم",
      price: "$59"
    }
  ];

  const productHTML =
    products
      .map(
        (product) => `
          <article class="demo-product">
            <div class="demo-product-image">
              <span>✦</span>
            </div>

            <div class="demo-product-info">
              <strong>
                ${safeText(product.name)}
              </strong>

              <span>
                ${safeText(product.price)}
              </span>
            </div>
          </article>
        `
      )
      .join("");

  return `
<!DOCTYPE html>

<html lang="ku" dir="rtl">

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1"
/>

<title>
  ${safeText(storeType)}
</title>

<style>

* {
  box-sizing: border-box;
}

body {
  margin: 0;

  font-family:
    Tahoma,
    Arial,
    sans-serif;

  color: #111827;

  background:
    linear-gradient(
      135deg,
      #ffffff,
      #f5f3ff
    );
}

.demo-header {
  padding: 20px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  border-bottom:
    1px solid #e5e7eb;

  background: white;
}

.demo-logo {
  font-weight: 800;

  color: #6d5dfc;

  font-size: 18px;
}

.demo-cart {
  width: 35px;
  height: 35px;

  display: grid;
  place-items: center;

  border-radius: 10px;

  background: #f3f1ff;
}

.demo-hero {
  padding: 28px 20px;

  background:
    linear-gradient(
      135deg,
      #f4f1ff,
      #eef5ff
    );
}

.demo-hero span {
  display: block;

  margin-bottom: 5px;

  color: #6d5dfc;

  font-size: 10px;

  font-weight: 700;
}

.demo-hero h1 {
  margin: 0;

  font-size: 25px;

  line-height: 1.4;
}

.demo-hero p {
  margin: 8px 0 0;

  color: #64748b;

  font-size: 11px;

  line-height: 1.8;
}

.demo-products {
  padding: 18px;

  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 9px;
}

.demo-product {
  overflow: hidden;

  border:
    1px solid #e5e7eb;

  border-radius: 12px;

  background: white;
}

.demo-product-image {
  aspect-ratio: 1;

  display: grid;
  place-items: center;

  background:
    linear-gradient(
      135deg,
      #eeeaff,
      #e6f1ff
    );

  color: #7c6df4;

  font-size: 22px;
}

.demo-product-info {
  padding: 9px;

  display: flex;

  flex-direction: column;

  gap: 3px;
}

.demo-product-info strong {
  font-size: 9px;
}

.demo-product-info span {
  color: #6d5dfc;

  font-size: 9px;

  font-weight: 800;
}

</style>

</head>

<body>

<header class="demo-header">

  <div class="demo-logo">
    ${safeText(storeType)}
  </div>

  <div class="demo-cart">
    🛒
  </div>

</header>

<section class="demo-hero">

  <span>
    بەخێربێیت
  </span>

  <h1>
    ${safeText(storeType)}
  </h1>

  <p>
    ئەمە preview ـی سەرەتاییە.
    لە وەشانی کۆتایی Gemini بەرهەمەکان،
    دیزاین و تایبەتمەندییەکان دروست دەکات.
  </p>

</section>

<section class="demo-products">

  ${productHTML}

</section>

</body>

</html>
`;
}


/* =========================================================
   PREVIEW
   ========================================================= */

function initializePreviewControls() {

  const buttons =
    $$(".preview-device");

  buttons.forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        const device =
          button.dataset.device;

        if (!device) return;

        state.previewDevice =
          device;

        buttons.forEach(
          (item) =>
            item.classList.toggle(
              "active",
              item === button
            )
        );

        updatePreviewSize();
      }
    );
  });
}


function updatePreviewSize() {

  const body =
    $(".preview-body");

  if (!body) return;

  if (
    state.previewDevice === "mobile"
  ) {

    body.style.width =
      "390px";

    body.style.maxWidth =
      "100%";

    body.style.margin =
      "0 auto";

  } else {

    body.style.width =
      "100%";

    body.style.maxWidth =
      "none";

    body.style.margin =
      "0";
  }
}


/* =========================================================
   RENDER PREVIEW
   ========================================================= */

function renderPreview(html) {

  const preview =
    $("#previewFrame") ||
    $(".preview-body iframe");

  if (preview) {

    /*
      srcdoc is used only for the local
      generated preview.

      The final deployed store will be
      sanitized on the backend.
    */

    preview.srcdoc = html;

    return;
  }

  const container =
    $(".preview-body");

  if (!container) return;

  container.innerHTML = `
    <iframe
      id="previewFrame"
      title="Store Preview"
      style="
        width:100%;
        height:100%;
        min-height:520px;
        border:0;
        display:block;
        background:white;
      "
      sandbox="allow-forms allow-same-origin"
    ></iframe>
  `;

  const frame =
    $("#previewFrame");

  if (frame) {
    frame.srcdoc = html;
  }
}


/* =========================================================
   RESTORE PREVIEW
   ========================================================= */

function restoreGeneratedStore() {

  if (!state.generatedStore) {
    return;
  }

  renderPreview(
    state.generatedStore
  );
}


/* =========================================================
   AUTH — PHASE 1 DEMO
   ========================================================= */

function initializeAuthButton() {

  const buttons = [
    ...$$(".google-login"),
    ...$$("[data-action='login']"),
    ...$$("#googleLogin")
  ];

  buttons.forEach((button) => {

    button.addEventListener(
      "click",
      startGoogleLogin
    );
  });
}


function startGoogleLogin() {

  /*
    IMPORTANT:

    This is only Phase 1.

    Google OAuth will NOT be simulated
    in production.

    In the real system this button will
    redirect to our backend:

        /auth/google

    Backend will handle OAuth securely.
  */

  showToast(
    "Google Login لە Phase 2 ـدا بە OAuth ـی ڕاستەقینە زیاد دەکرێت"
  );

  /*
    Demo user for UI testing.
  */

  const demoUser = {
    id: "demo-user",
    name: "بەکارهێنەری تاقیکردنەوە",
    email: "demo@example.com"
  };

  state.currentUser =
    demoUser;

  localStorage.setItem(
    CONFIG.STORAGE_KEYS.currentUser,
    JSON.stringify(demoUser)
  );

  updateUserInterface();
}


/* =========================================================
   USER UI
   ========================================================= */

function updateUserInterface() {

  const user =
    state.currentUser;

  if (!user) {
    return;
  }

  const nameElements =
    $$("[data-user-name]");

  const emailElements =
    $$("[data-user-email]");

  nameElements.forEach(
    (element) => {
      element.textContent =
        safeText(user.name);
    }
  );

  emailElements.forEach(
    (element) => {
      element.textContent =
        safeText(user.email);
    }
  );

  const admin =
    isAdmin(user.email);

  $$("[data-admin-only]")
    .forEach((element) => {
      element.classList.toggle(
        "hidden",
        !admin
      );
    });
}


function isAdmin(email) {

  return (
    String(email)
      .toLowerCase()
      .trim() ===
    CONFIG.ADMIN_EMAIL
      .toLowerCase()
  );
}


/* =========================================================
   LOGOUT
   ========================================================= */

function initializeLogout() {

  const buttons =
    $$(".logout-button");

  buttons.forEach((button) => {

    button.addEventListener(
      "click",
      logout
    );
  });
}


function logout() {

  state.currentUser =
    null;

  localStorage.removeItem(
    CONFIG.STORAGE_KEYS.currentUser
  );

  showToast(
    "بە سەرکەوتوویی چوویتە دەرەوە"
  );

  setTimeout(() => {

    /*
      لە وەشانی production:
      لێرە session ـی backend
      و Google OAuth ـیش پاک دەکرێتەوە.
    */

    window.location.reload();

  }, 500);
}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimer = null;

function showToast(message) {

  let toast =
    $(".toast");

  if (!toast) {

    toast =
      document.createElement(
        "div"
      );

    toast.className =
      "toast";

    document.body.appendChild(
      toast
    );
  }

  toast.textContent =
    safeText(message);

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 3200);
}


/* =========================================================
   UTILITIES
   ========================================================= */

function sleep(ms) {

  return new Promise(
    (resolve) =>
      setTimeout(resolve, ms)
  );
}


/* =========================================================
   GLOBAL ERROR HANDLING
   ========================================================= */

window.addEventListener(
  "error",
  (event) => {

    console.error(
      "StoreAI error:",
      event.error
    );
  }
);

window.addEventListener(
  "unhandledrejection",
  (event) => {

    console.error(
      "StoreAI promise error:",
      event.reason
    );
  }
);


/* =========================================================
   DEBUG API
   =========================================================

   تەنها بۆ تاقیکردنەوەی Phase 1 ـە.

   لە Console ـی browser:

     StoreAI.navigate("admin")
     StoreAI.generate()
     StoreAI.theme()
     StoreAI.logout()

   ========================================================= */

window.StoreAI = {

  navigate: navigateTo,

  generate: generateStore,

  theme: toggleTheme,

  logout: logout,

  state
};

چۆنیەتی دانانی فایلەکە

لە GitHub ـەکەت ئەم structure ـەت هەبێت:

AI-Store-Builder/
│
├── index.html
│
├── styles.css
│
└── app.js

لە کۆتایی "index.html" ـدا پێش "</body>" ئەمە هەبێت:

<script src="app.js"></script>

ئێستا Phase 1 ـەکەمان تەنها Frontend ـە. Gemini ـی ڕاستەقینە، Google OAuth، Supabase OAuth، دروستکردنی database و Netlify publish هێشتا تێدا نییە؛ ئەوان بە ڕیز لە Phase 2–4 زیاد دەکرێن.

تاقیکردنەوەی Phase 1

1. هەرسێ فایلەکە لە GitHub دابنێ.
2. "index.html" بکەرەوە.
3. Dark/Light تاقی بکەرەوە.
4. Quick Prompt هەڵبژێرە.
5. Prompt بنووسە و دروستکردن دابگرە.
6. Preview ـەکە دەبێت store ـێکی demo پیشان بدات.
7. Mobile/Desktop preview تاقی بکەرەوە.
8. Browser ـەکە reload بکە؛ prompt و preview دەبێت لە "localStorage" بمێنن.

کاتێک ئەمانە بە سەرکەوتوویی کارکردن، Phase 1 تەواوە. دواتر دەچینە Phase 2: Backend + Gemini API + model discovery + retry/fallback + Google OAuth + Supabase OAuth و دروستکردنی project/database/RLS.
