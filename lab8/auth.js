const API_KEY_STORAGE = "api_key";

function getApiKey() {
  const key = localStorage.getItem(API_KEY_STORAGE);
  return (key || "").trim() || null;
}

function setApiKey(key) {
  const v = String(key || "").trim();
  if (!v) return false;
  localStorage.setItem(API_KEY_STORAGE, v);
  return true;
}

function ensureAuthModal() {
  if (document.getElementById("auth-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "auth-overlay";
  overlay.className = "auth-overlay";

  const box = document.createElement("div");
  box.className = "auth-modal";

  const title = document.createElement("h3");
  title.className = "auth-modal__title";
  title.textContent = "Авторизация";

  const text = document.createElement("p");
  text.className = "auth-modal__text";
  text.textContent = "Введите персональный API Key для доступа к меню и оформлению заказа.";

  const form = document.createElement("form");
  form.className = "auth-modal__form";

  const input = document.createElement("input");
  input.type = "text";
  input.name = "api_key";
  input.placeholder = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";
  input.autocomplete = "off";
  input.required = true;

  const actions = document.createElement("div");
  actions.className = "auth-modal__actions";

  const saveBtn = document.createElement("button");
  saveBtn.type = "submit";
  saveBtn.className = "btn btn-submit";
  saveBtn.textContent = "Сохранить";

  const clearBtn = document.createElement("button");
  clearBtn.type = "button";
  clearBtn.className = "btn btn-reset";
  clearBtn.textContent = "Очистить";

  clearBtn.addEventListener("click", () => {
    localStorage.removeItem(API_KEY_STORAGE);
    input.value = "";
    input.focus();
  });

  actions.append(clearBtn, saveBtn);
  form.append(input, actions);

  box.append(title, text, form);
  overlay.append(box);
  document.body.append(overlay);
}

function showAuthModal(message) {
  ensureAuthModal();
  const overlay = document.getElementById("auth-overlay");
  const text = overlay.querySelector(".auth-modal__text");
  const input = overlay.querySelector("input[name=api_key]");

  if (text && message) text.textContent = message;
  overlay.classList.remove("hidden");

  const existing = getApiKey();
  input.value = existing || "";
  setTimeout(() => input.focus(), 0);
}

function hideAuthModal() {
  const overlay = document.getElementById("auth-overlay");
  if (!overlay) return;
  overlay.classList.add("hidden");
}

function requireApiKey() {
  return new Promise((resolve) => {
    ensureAuthModal();

    const overlay = document.getElementById("auth-overlay");
    const form = overlay.querySelector("form");
    const input = overlay.querySelector("input[name=api_key]");

    const done = () => {
      hideAuthModal();
      resolve(getApiKey());
    };

    const handler = (e) => {
      e.preventDefault();
      const ok = setApiKey(input.value);
      if (!ok) return;
      form.removeEventListener("submit", handler);
      done();
    };

    form.addEventListener("submit", handler);

    if (!getApiKey()) {
      showAuthModal();
    } else {
      resolve(getApiKey());
    }
  });
}

function withApiKey(url) {
  const key = getApiKey();
  const u = new URL(url, window.location.href);
  if (key) u.searchParams.set("api_key", key);
  return u.toString();
}

async function apiFetch(url, options) {
  const key = getApiKey();
  if (!key) {
    await requireApiKey();
  }

  const res = await fetch(withApiKey(url), options);

  let json = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      json = await res.clone().json();
    } catch {
      json = null;
    }
  }

  if (json && json.error && String(json.error).includes("API Key")) {
    showAuthModal(String(json.error));
    throw new Error(String(json.error));
  }

  return res;
}
