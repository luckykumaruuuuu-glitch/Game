import { Router } from "express";

const router = Router();

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCGf_8xBemNp8cEzecoW1RcVoK7iB0bltY",
  authDomain: "game-217ce.firebaseapp.com",
  projectId: "game-217ce",
  storageBucket: "game-217ce.firebasestorage.app",
  messagingSenderId: "25583360638",
  appId: "1:25583360638:web:941d312e9455d705a7562f",
};

function buildProfileHtml(userId: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <meta name="theme-color" content="#0d0d20" />
  <meta property="og:title" content="LeLudo Profile" />
  <meta property="og:description" content="View this player's LeLudo profile" />
  <title>LeLudo Profile</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0d0d20;
      --card: #13132a;
      --border: rgba(124,58,237,0.25);
      --purple: #7C3AED;
      --purple-light: #A855F7;
      --text: #ffffff;
      --muted: rgba(255,255,255,0.5);
      --subtle: rgba(255,255,255,0.08);
    }

    html, body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    /* ── Loading ── */
    #loading {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 100vh; gap: 16px;
    }
    .spinner {
      width: 44px; height: 44px;
      border: 3px solid rgba(124,58,237,0.2);
      border-top-color: var(--purple);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Error ── */
    #error {
      display: none; flex-direction: column; align-items: center;
      justify-content: center; min-height: 100vh; gap: 12px; padding: 32px;
      text-align: center;
    }
    #error .err-icon { font-size: 48px; }
    #error h2 { font-size: 20px; font-weight: 700; }
    #error p { color: var(--muted); font-size: 14px; line-height: 1.6; }

    /* ── Page wrapper ── */
    #page {
      display: none;
      max-width: 480px;
      margin: 0 auto;
      padding: 0 0 40px;
    }

    /* ── Hero banner ── */
    .hero {
      position: relative;
      background: linear-gradient(135deg, #1a053a 0%, #0d0d20 60%, #0d1a3a 100%);
      padding: 48px 24px 80px;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute; top: -40px; right: -40px;
      width: 180px; height: 180px; border-radius: 50%;
      background: radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%);
    }
    .hero::after {
      content: '';
      position: absolute; bottom: -30px; left: -30px;
      width: 140px; height: 140px; border-radius: 50%;
      background: radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%);
    }

    .brand-row {
      display: flex; align-items: center; gap: 8px; margin-bottom: 32px;
    }
    .brand-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--purple);
    }
    .brand-name {
      font-size: 13px; font-weight: 700; letter-spacing: 2px;
      text-transform: uppercase; color: rgba(255,255,255,0.6);
    }

    .avatar-wrap {
      display: flex; justify-content: center; margin-bottom: 16px;
      position: relative; z-index: 1;
    }
    .avatar-glow {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 110px; height: 110px; border-radius: 50%;
      background: radial-gradient(circle, rgba(124,58,237,0.5) 0%, transparent 70%);
    }
    .avatar {
      width: 96px; height: 96px; border-radius: 50%;
      border: 3px solid var(--purple);
      background: var(--card);
      object-fit: cover;
      position: relative; z-index: 1;
    }
    .avatar-placeholder {
      width: 96px; height: 96px; border-radius: 50%;
      border: 3px solid var(--purple);
      background: linear-gradient(135deg, #1a053a, #2d1b69);
      display: flex; align-items: center; justify-content: center;
      font-size: 38px; font-weight: 700; color: var(--purple-light);
      position: relative; z-index: 1;
    }

    .display-name {
      text-align: center; font-size: 24px; font-weight: 700;
      position: relative; z-index: 1; margin-bottom: 4px;
    }
    .username {
      text-align: center; color: var(--muted); font-size: 14px;
      position: relative; z-index: 1; margin-bottom: 12px;
    }

    .badge-row {
      display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;
      position: relative; z-index: 1;
    }
    .badge {
      background: rgba(124,58,237,0.2); border: 1px solid var(--border);
      border-radius: 20px; padding: 4px 12px;
      font-size: 12px; color: var(--purple-light);
      display: flex; align-items: center; gap: 5px;
    }

    /* ── Download button ── */
    .download-wrap {
      padding: 0 20px;
      transform: translateY(-28px);
      margin-bottom: -12px;
      position: relative; z-index: 10;
    }
    .download-btn {
      display: flex; align-items: center; justify-content: center; gap: 10px;
      width: 100%;
      background: linear-gradient(135deg, var(--purple) 0%, #A855F7 100%);
      color: #fff; text-decoration: none;
      padding: 16px 24px; border-radius: 16px;
      font-size: 16px; font-weight: 700;
      box-shadow: 0 8px 24px rgba(124,58,237,0.45);
      cursor: pointer; border: none;
      transition: opacity 0.15s, transform 0.15s;
    }
    .download-btn:active { opacity: 0.85; transform: scale(0.98); }
    .download-btn svg { flex-shrink: 0; }
    .download-btn .btn-sub {
      font-size: 11px; opacity: 0.75; font-weight: 400;
    }

    /* ── Sections ── */
    .section {
      padding: 0 20px; margin-top: 24px;
    }
    .section-title {
      font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
      text-transform: uppercase; color: var(--purple-light);
      margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
    }
    .section-title::after {
      content: ''; flex: 1; height: 1px; background: var(--border);
    }

    /* ── Info card ── */
    .info-card {
      background: var(--card); border: 1px solid var(--border);
      border-radius: 16px; overflow: hidden;
    }
    .info-row {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 16px;
      border-bottom: 1px solid rgba(124,58,237,0.12);
    }
    .info-row:last-child { border-bottom: none; }
    .info-icon {
      font-size: 18px; flex-shrink: 0; width: 28px; text-align: center;
    }
    .info-label {
      font-size: 11px; color: var(--muted); text-transform: uppercase;
      letter-spacing: 0.8px; margin-bottom: 2px;
    }
    .info-value { font-size: 14px; font-weight: 500; }

    /* ── Bio ── */
    .bio-card {
      background: var(--card); border: 1px solid var(--border);
      border-radius: 16px; padding: 16px;
      font-size: 14px; color: rgba(255,255,255,0.8); line-height: 1.7;
    }

    /* ── Photo grid ── */
    .photo-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 3px;
      border-radius: 16px; overflow: hidden;
    }
    .photo-item {
      aspect-ratio: 1; overflow: hidden; background: var(--card);
      cursor: pointer; position: relative;
    }
    .photo-item img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.2s;
    }
    .photo-item:hover img { transform: scale(1.05); }
    .photo-caption {
      position: absolute; bottom: 0; left: 0; right: 0;
      padding: 6px; background: linear-gradient(transparent, rgba(0,0,0,0.7));
      font-size: 10px; color: rgba(255,255,255,0.7);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .empty-photos {
      background: var(--card); border: 1px solid var(--border);
      border-radius: 16px; padding: 32px;
      text-align: center; color: var(--muted); font-size: 14px;
    }

    /* ── Lightbox ── */
    #lightbox {
      display: none; position: fixed; inset: 0; z-index: 1000;
      background: rgba(0,0,0,0.92);
      align-items: center; justify-content: center;
      padding: 20px;
    }
    #lightbox.open { display: flex; }
    #lightbox img {
      max-width: 100%; max-height: 80vh;
      border-radius: 12px; object-fit: contain;
    }
    #lightbox-close {
      position: absolute; top: 20px; right: 20px;
      width: 40px; height: 40px; border-radius: 50%;
      background: rgba(255,255,255,0.15);
      border: none; color: #fff; font-size: 20px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
    }

    /* ── Footer ── */
    .footer {
      text-align: center; padding: 32px 24px 16px;
      color: var(--muted); font-size: 12px;
    }
    .footer a { color: var(--purple-light); text-decoration: none; }

    @media (min-width: 480px) {
      .hero { padding-top: 56px; }
    }
  </style>
</head>
<body>

<div id="loading">
  <div class="spinner"></div>
  <p style="color:rgba(255,255,255,0.4);font-size:13px;">Loading profile…</p>
</div>

<div id="error">
  <div class="err-icon">🎲</div>
  <h2>Profile Not Found</h2>
  <p>This player's profile doesn't exist or may have been removed.</p>
</div>

<div id="page">
  <!-- Hero -->
  <div class="hero">
    <div class="brand-row">
      <div class="brand-dot"></div>
      <span class="brand-name">LeLudo</span>
      <div class="brand-dot"></div>
    </div>
    <div class="avatar-wrap">
      <div class="avatar-glow"></div>
      <div id="avatar-el" class="avatar-placeholder">?</div>
    </div>
    <div id="display-name" class="display-name">—</div>
    <div id="username" class="username">@—</div>
    <div class="badge-row">
      <span class="badge">🎲 Ludo Player</span>
      <span id="joined-badge" class="badge" style="display:none">📅 <span id="joined-text"></span></span>
    </div>
  </div>

  <!-- Download Button -->
  <div class="download-wrap">
    <button class="download-btn" onclick="openApp()">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
        <polygon points="10,8 16,12 10,16" fill="white" stroke="none"/>
      </svg>
      <div>
        <div>Open in LeLudo</div>
        <div class="btn-sub">Play Ludo • Add as Friend</div>
      </div>
    </button>
  </div>

  <!-- Bio -->
  <div id="bio-section" class="section" style="display:none">
    <div class="section-title">About</div>
    <div id="bio-card" class="bio-card"></div>
  </div>

  <!-- Info -->
  <div class="section">
    <div class="section-title">Profile Info</div>
    <div class="info-card" id="info-card">
    </div>
  </div>

  <!-- Photos -->
  <div id="photos-section" class="section">
    <div class="section-title">Photos</div>
    <div id="photos-container"></div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>🎲 LeLudo — Social Ludo Gaming</p>
    <p style="margin-top:6px">Scan QR codes to connect &amp; play</p>
  </div>
</div>

<!-- Lightbox -->
<div id="lightbox" onclick="closeLightbox()">
  <button id="lightbox-close" onclick="closeLightbox()">✕</button>
  <img id="lightbox-img" src="" alt="" />
</div>

<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
  import { getFirestore, doc, getDoc, collection, query, where, orderBy, limit, getDocs }
    from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

  const firebaseConfig = ${JSON.stringify(FIREBASE_CONFIG)};
  const userId = ${JSON.stringify(userId)};

  const app = initializeApp(firebaseConfig, "public-profile-${userId}");
  const db  = getFirestore(app);

  function esc(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g,"&amp;").replace(/</g,"&lt;")
      .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function formatDate(ts) {
    if (!ts) return null;
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", { year:"numeric", month:"long" });
  }

  async function loadProfile() {
    try {
      const snap = await getDoc(doc(db, "users", userId));
      if (!snap.exists()) {
        showError(); return;
      }
      const p = snap.data();

      // Avatar
      const avatarEl = document.getElementById("avatar-el");
      if (p.photo) {
        avatarEl.outerHTML = \`<img id="avatar-el" class="avatar" src="\${esc(p.photo)}" alt="\${esc(p.name)}" />\`;
      } else {
        avatarEl.textContent = (p.name || p.username || "?")[0].toUpperCase();
      }

      // Name / username
      document.getElementById("display-name").textContent = p.name || p.username || "Unknown Player";
      document.getElementById("username").textContent = p.username ? "@" + p.username : "";
      document.title = (p.name || p.username || "LeLudo") + " — LeLudo Profile";

      // Joined badge
      const joined = formatDate(p.createdAt);
      if (joined) {
        document.getElementById("joined-text").textContent = "Joined " + joined;
        document.getElementById("joined-badge").style.display = "flex";
      }

      // Bio
      if (p.bio && p.bio.trim()) {
        document.getElementById("bio-section").style.display = "block";
        document.getElementById("bio-card").textContent = p.bio.trim();
      }

      // Info rows
      const rows = [];
      if (p.name)     rows.push({ icon:"👤", label:"Name",      val: p.name });
      if (p.username) rows.push({ icon:"🎮", label:"Username",  val: "@" + p.username });
      if (p.country)  rows.push({ icon:"🌍", label:"Country",   val: [p.city, p.state, p.country].filter(Boolean).join(", ") });
      if (p.gender && p.gender !== "") rows.push({ icon:"✨", label:"Gender", val: p.gender.charAt(0).toUpperCase() + p.gender.slice(1) });
      if (p.createdAt) rows.push({ icon:"📅", label:"Member Since", val: formatDate(p.createdAt) });

      const infoCard = document.getElementById("info-card");
      if (rows.length) {
        infoCard.innerHTML = rows.map(r => \`
          <div class="info-row">
            <div class="info-icon">\${r.icon}</div>
            <div>
              <div class="info-label">\${esc(r.label)}</div>
              <div class="info-value">\${esc(r.val)}</div>
            </div>
          </div>
        \`).join("");
      } else {
        infoCard.innerHTML = \`<div class="info-row"><div style="color:rgba(255,255,255,0.4);font-size:14px;padding:4px">No info available</div></div>\`;
      }

      // Photos
      await loadPhotos();

      // Show page
      document.getElementById("loading").style.display = "none";
      document.getElementById("page").style.display = "block";

    } catch (e) {
      console.error(e);
      showError();
    }
  }

  async function loadPhotos() {
    try {
      const q = query(
        collection(db, "content"),
        where("userId", "==", userId),
        where("type", "==", "image"),
        orderBy("timestamp", "desc"),
        limit(12)
      );
      const snaps = await getDocs(q);
      const container = document.getElementById("photos-container");

      if (snaps.empty) {
        container.innerHTML = \`<div class="empty-photos">🎲 No public photos yet</div>\`;
        return;
      }

      const items = snaps.docs.map(d => d.data());
      container.innerHTML = \`<div class="photo-grid">\` +
        items.map(item => \`
          <div class="photo-item" onclick="openLightbox('\${esc(item.url)}')">
            <img src="\${esc(item.url)}" alt="" loading="lazy" />
            \${item.caption ? \`<div class="photo-caption">\${esc(item.caption)}</div>\` : ""}
          </div>
        \`).join("") +
        \`</div>\`;
    } catch (e) {
      document.getElementById("photos-container").innerHTML =
        \`<div class="empty-photos">🎲 No public photos yet</div>\`;
    }
  }

  function showError() {
    document.getElementById("loading").style.display = "none";
    document.getElementById("error").style.display = "flex";
  }

  loadProfile();
</script>

<script>
  const DEEP_LINK  = "leludo://profile/${userId}";
  const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.leludo.app";

  function openApp() {
    const ua = navigator.userAgent || "";
    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);

    if (isAndroid || isIOS) {
      // Try deep link; fallback to store after timeout
      const start = Date.now();
      window.location.href = DEEP_LINK;
      setTimeout(() => {
        if (Date.now() - start < 2500) {
          window.location.href = isIOS
            ? "https://apps.apple.com/app/leludo/id000000000"
            : PLAY_STORE;
        }
      }, 1800);
    } else {
      window.open(PLAY_STORE, "_blank");
    }
  }

  function openLightbox(url) {
    document.getElementById("lightbox-img").src = url;
    document.getElementById("lightbox").classList.add("open");
  }
  function closeLightbox() {
    document.getElementById("lightbox").classList.remove("open");
    document.getElementById("lightbox-img").src = "";
  }
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });
</script>
</body>
</html>`;
}

router.get("/profile/:userId", (req, res) => {
  const { userId } = req.params;
  if (!userId || !/^[a-zA-Z0-9_-]{1,128}$/.test(userId)) {
    res.status(400).send("Invalid profile ID");
    return;
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=60");
  res.send(buildProfileHtml(userId));
});

export default router;
