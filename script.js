/* =========================================================
   1. GLOBAL CONFIG & UTILS
   ========================================================= */
// const CONFIG = {
//   // Ensure this URL is correct from your Google App Script deployment
//   API_URL:
//     "https://script.google.com/macros/s/AKfycbwVwgG7FwRdnWreskYuZTuVODvAU_W8cr9h5XZjRpIeSVx2_DsUUVhtlQPCeukze2Zavg/exec",
// };

const CONFIG = {
  API_URL:
    "https://script.google.com/macros/s/AKfycbxZazqr-9BJyra_JwQpGtU6exC8ff2mALoibc006HHILdNMU6qLPQqFB4hdSu6xjJqluA/exec",
};

const els = {
  hero: document.getElementById("heroSection"),
  home: document.getElementById("homeSection"),
  screens: document.querySelectorAll(".screen"),
  triggers: document.querySelectorAll(".section-trigger"),
  closeBtns: document.querySelectorAll("[data-close]"),
  shareBox: document.getElementById("shareBox"),
  shareInput: document.getElementById("shareLink"),
  copyBtn: document.getElementById("copyBtn"),
  fireworks: document.getElementById("fireworks"),
  bubbleContainer: document.getElementById("bubble-container"),
};

// INJECT STYLES (Hearts & WhatsApp)
const style = document.createElement("style");
style.innerHTML = `
  .heart-drop {
    position: fixed;
    top: -10vh;
    font-size: 24px;
    animation: fallDown linear forwards;
    z-index: 6000;
    pointer-events: none;
  }
  @keyframes fallDown {
    to { transform: translateY(110vh) rotate(360deg); }
  }
  .wa-btn {
    display: block; width: 100%; margin-top: 10px; padding: 10px;
    background: #25D366; color: white; text-align: center;
    border-radius: 12px; text-decoration: none; font-weight: bold;
    font-size: 14px; border: 1px solid rgba(255,255,255,0.2);
    transition: transform 0.2s;
  }
  .wa-btn:hover { transform: scale(1.02); background: #1ebe57; }
`;
document.head.appendChild(style);

/* =========================================================
   2. SOUND ENGINE
   ========================================================= */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (audioCtx.state === "suspended") audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (type === "hover") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.05);
  } else if (type === "click") {
    osc.type = "square";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === "success") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.3);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  }
}

document
  .querySelectorAll('button, input[type="submit"], .box')
  .forEach((btn) => {
    btn.addEventListener("mouseenter", () => playSound("hover"));
    btn.addEventListener("click", () => playSound("click"));
  });

/* =========================================================
   3. RAINBOW CURSOR TRAIL
   ========================================================= */
document.addEventListener("mousemove", (e) => {
  if (!els.bubbleContainer) return;

  const b = document.createElement("div");
  b.classList.add("bubble");

  // Random Rainbow Color Logic
  const hue = Math.floor(Math.random() * 360);
  b.style.background = `radial-gradient(circle, hsla(${hue}, 100%, 75%, 1), hsla(${hue}, 100%, 50%, 0.4))`;
  b.style.boxShadow = `0 0 6px hsla(${hue}, 100%, 50%, 0.6)`;

  const size = Math.random() * 12 + 6;
  b.style.width = size + "px";
  b.style.height = size + "px";
  b.style.left = e.clientX + "px";
  b.style.top = e.clientY + "px";

  els.bubbleContainer.appendChild(b);

  // Removes after 1.5s (Matches updated CSS)
  setTimeout(() => b.remove(), 1500);
});

/* =========================================================
   5. INITIALIZATION
   ========================================================= */
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  const key = params.get("key");

  if (mode === "secure" && key) {
    try {
      els.hero.style.display = "none";
      els.home.classList.add("hidden");

      const data = JSON.parse(atob(key));

      if (data.name && data.type) {
        renderWish(data.type, data.name, data.message);

        document.body.addEventListener(
          "click",
          () => {
            speakWish(data.type, data.name);
            playSound("success");
          },
          { once: true }
        );
        speakWish(data.type, data.name);
      }
    } catch (e) {
      console.error("Link corrupted", e);
      showHome();
    }
  } else {
    showHome();
  }
});

function showHome() {
  els.hero.style.display = "flex";
  els.home.classList.remove("hidden");
}

/* =========================================================
   6. VISUAL EFFECTS (Fireworks, Hearts, Glitch)
   ========================================================= */

// 1. FIREWORKS
function triggerFireworks() {
  for (let i = 0; i < 40; i++) {
    const spark = document.createElement("div");
    spark.classList.add("spark");
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    spark.style.left = cx + "px";
    spark.style.top = cy + "px";
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 250 + 50;
    spark.style.setProperty("--x", Math.cos(angle) * dist + "px");
    spark.style.setProperty("--y", Math.sin(angle) * dist + "px");
    els.fireworks.appendChild(spark);
    setTimeout(() => spark.remove(), 1000);
  }
}

// 2. HEART RAIN
function triggerHearts() {
  const heart = document.createElement("div");
  heart.classList.add("heart-drop");
  heart.innerText = Math.random() > 0.5 ? "❤️" : "💞";
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.animationDuration = Math.random() * 2 + 3 + "s";
  heart.style.fontSize = Math.random() * 20 + 20 + "px";
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 5000);
}

// 3. GLITCH TEXT EFFECT
function glitchText(elementId, finalText) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%^&*";
  let iterations = 0;

  const interval = setInterval(() => {
    element.innerText = finalText
      .split("")
      .map((letter, index) => {
        if (index < iterations) return finalText[index];
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join("");

    if (iterations >= finalText.length) clearInterval(interval);
    iterations += 1 / 2;
  }, 40);
}

// 4. TYPEWRITER EFFECT
let typeInterval;
function typeMessage(elementId, text) {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.innerHTML = "";
  let i = 0;
  if (typeInterval) clearInterval(typeInterval);
  typeInterval = setInterval(() => {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
    } else {
      clearInterval(typeInterval);
    }
  }, 30);
}

function speakWish(type, name) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const msg =
    type === "birthday"
      ? `Happy Birthday ${name}!`
      : `Happy Anniversary ${name}!`;
  const u = new SpeechSynthesisUtterance(msg);
  u.rate = 0.9;
  u.pitch = 1.1;
  u.volume = 1;
  window.speechSynthesis.speak(u);
}

/* =========================================================
   7. CORE RENDER LOGIC
   ========================================================= */
function hideAllScreens() {
  els.screens.forEach((s) => (s.style.display = "none"));
  els.shareBox.style.display = "none";
}

let animationInterval;

function renderWish(type, name, message) {
  hideAllScreens();
  els.hero.style.display = "none";
  els.home.classList.add("hidden");

  if (animationInterval) clearInterval(animationInterval);

  const defaultBMsg =
    "Your birthday reactor is online. May your year be full of power-ups, crit hits, and legendary drops in real life.";
  const defaultAMsg =
    "Your bond just cleared another level. Here's to more XP, more quests, and a story that keeps unlocking new chapters.";

  let finalMsg = "";
  let nameElId = "";
  let msgElId = "";

  if (type === "birthday") {
    document.getElementById("birthdayWishScreen").style.display = "block";
    nameElId = "wishName";
    msgElId = "bWishOutput";
    finalMsg = message && message.trim() !== "" ? message : defaultBMsg;
    triggerFireworks();
    animationInterval = setInterval(triggerFireworks, 2500);
  } else if (type === "anniversary") {
    document.getElementById("anniversaryWishScreen").style.display = "block";
    nameElId = "awishName";
    msgElId = "aWishOutput";
    finalMsg = message && message.trim() !== "" ? message : defaultAMsg;
    animationInterval = setInterval(triggerHearts, 300);
  }

  glitchText(nameElId, name);
  typeMessage(msgElId, finalMsg);
  playSound("success");
}

/* =========================================================
   8. FORM HANDLING & SHEET LOGGING
   ========================================================= */
els.triggers.forEach((btn) => {
  btn.addEventListener("click", () => {
    hideAllScreens();
    els.hero.style.display = "none";
    els.home.classList.add("hidden");
    const target = document.getElementById(btn.dataset.target);
    if (target) target.style.display = "block";
  });
});

els.closeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    window.location.href = window.location.origin + window.location.pathname;
  });
});

function handleFormSubmit(e, type, nameInputId, wishInputId) {
  e.preventDefault();
  const nameInput = document.getElementById(nameInputId);
  const wishInput = document.getElementById(wishInputId);
  const name = nameInput.value.trim().toUpperCase();
  const message = wishInput ? wishInput.value.trim() : "";

  if (!name) return;

  renderWish(type, name, message);
  speakWish(type, name);

  const base = window.location.origin + window.location.pathname;
  const payload = btoa(JSON.stringify({ type, name, message }));
  const finalLink = `${base}?mode=secure&key=${payload}`;

  els.shareBox.style.display = "block";
  els.shareInput.value = finalLink;

  let waBtn = document.getElementById("dynamicWaBtn");
  if (!waBtn) {
    waBtn = document.createElement("a");
    waBtn.id = "dynamicWaBtn";
    waBtn.className = "wa-btn";
    waBtn.target = "_blank";
    waBtn.innerText = "Share on WhatsApp 💬";
    els.shareBox.appendChild(waBtn);
  }
  const waText = `Check out this special neon wish I made for you: ${finalLink}`;
  waBtn.href = `https://wa.me/?text=${encodeURIComponent(waText)}`;

  // LOG TO SHEET
  fetch(CONFIG.API_URL, {
    method: "POST",
    body: JSON.stringify({ type, name, message }),
    headers: { "Content-Type": "text/plain;charset=utf-8" },
  })
    .then((response) => {
      if (response.ok) {
        console.log("SUCCESS: Data sent to Sheet!");
      } else {
        console.error("ERROR: Sheet returned status", response.status);
      }
    })
    .catch((err) => console.error("FETCH ERROR:", err));
}

document.getElementById("bForm").addEventListener("submit", (e) => {
  handleFormSubmit(e, "birthday", "bName", "bWishText");
});

document.getElementById("aForm").addEventListener("submit", (e) => {
  handleFormSubmit(e, "anniversary", "aName", "aWishText");
});

/* =========================================================
   9. COPY FUNCTION
   ========================================================= */
els.copyBtn.addEventListener("click", () => {
  els.shareInput.select();
  els.shareInput.setSelectionRange(0, 99999);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(els.shareInput.value).then(flashCopyMsg);
  } else {
    document.execCommand("copy");
    flashCopyMsg();
  }
});

function flashCopyMsg() {
  playSound("success");
  const original = els.copyBtn.innerText;
  els.copyBtn.innerText = "LINK COPIED!";
  els.copyBtn.style.background = "var(--neon-pink)";
  els.copyBtn.style.color = "#fff";
  setTimeout(() => {
    els.copyBtn.innerText = original;
    els.copyBtn.style.background = "";
    els.copyBtn.style.color = "";
  }, 2000);
}
