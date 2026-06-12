import { Router } from "express";

const router = Router();

const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

function buildProfileHtml(userId: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="theme-color" content="#0d0d20" />
  <meta name="robots" content="noindex" />

  <!-- Open Graph -->
  <meta property="og:type" content="profile" />
  <meta property="og:title" content="LeLudo Player Profile" />
  <meta property="og:description" content="View this player's public LeLudo profile — no login required." />
  <meta property="og:site_name" content="LeLudo" />

  <title>LeLudo Profile</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #080818;
      --bg2: #0d0d20;
      --card: #12122a;
      --card2: #16163a;
      --border: rgba(124,58,237,0.22);
      --border2: rgba(124,58,237,0.12);
      --purple: #7C3AED;
      --purple2: #6D28D9;
      --purple-light: #A855F7;
      --cyan: #06B6D4;
      --text: #ffffff;
      --text2: rgba(255,255,255,0.85);
      --muted: rgba(255,255,255,0.45);
      --muted2: rgba(255,255,255,0.28);
    }

    html, body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      min-height: 100dvh;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    /* ─── Pulse animation ─── */
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
    @keyframes spin   { to{transform:rotate(360deg)} }
    @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

    /* ─── Loading ─── */
    #loading {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 100dvh; gap: 20px;
    }
    .spinner {
      width: 46px; height: 46px;
      border: 3px solid rgba(124,58,237,0.18);
      border-top-color: var(--purple-light);
      border-radius: 50%;
      animation: spin .8s linear infinite;
    }
    .loading-logo { font-size: 32px; margin-bottom: 4px; }
    .loading-text { color: var(--muted); font-size: 13px; animation: pulse 1.6s ease infinite; }

    /* ─── Error ─── */
    #error {
      display: none; flex-direction: column; align-items: center;
      justify-content: center; min-height: 100dvh; gap: 14px;
      padding: 40px 32px; text-align: center;
    }
    #error .err-icon { font-size: 54px; }
    #error h2 { font-size: 22px; font-weight: 700; }
    #error p { color: var(--muted); font-size: 14px; line-height: 1.7; max-width: 280px; }

    /* ─── Page ─── */
    #page {
      display: none;
      max-width: 480px;
      margin: 0 auto;
      padding-bottom: 48px;
      animation: fadeUp .4s ease both;
    }

    /* ─── Hero ─── */
    .hero {
      position: relative;
      background: linear-gradient(160deg, #1c0640 0%, #0d0d20 55%, #071830 100%);
      padding: 44px 24px 88px;
      overflow: hidden;
    }
    .hero-glow1 {
      position: absolute; top: -60px; right: -50px;
      width: 220px; height: 220px; border-radius: 50%;
      background: radial-gradient(circle, rgba(124,58,237,.4) 0%, transparent 68%);
      pointer-events: none;
    }
    .hero-glow2 {
      position: absolute; bottom: -40px; left: -40px;
      width: 180px; height: 180px; border-radius: 50%;
      background: radial-gradient(circle, rgba(6,182,212,.22) 0%, transparent 68%);
      pointer-events: none;
    }
    .hero-glow3 {
      position: absolute; bottom: 20px; right: 10%;
      width: 120px; height: 120px; border-radius: 50%;
      background: radial-gradient(circle, rgba(168,85,247,.15) 0%, transparent 68%);
      pointer-events: none;
    }

    /* ─── Branding bar ─── */
    .brand-bar {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 28px; position: relative; z-index: 1;
    }
    .brand-left { display: flex; align-items: center; gap: 8px; }
    .brand-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--purple-light); }
    .brand-name {
      font-size: 14px; font-weight: 800; letter-spacing: 2.5px;
      text-transform: uppercase; color: rgba(255,255,255,.7);
    }
    .public-badge {
      background: rgba(34,197,94,.15); border: 1px solid rgba(34,197,94,.3);
      color: #4ade80; font-size: 10px; font-weight: 700;
      letter-spacing: .8px; text-transform: uppercase;
      padding: 4px 10px; border-radius: 20px;
      display: flex; align-items: center; gap: 5px;
    }
    .public-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #4ade80; }

    /* ─── Avatar ─── */
    .avatar-wrap {
      display: flex; justify-content: center; margin-bottom: 18px;
      position: relative; z-index: 1;
    }
    .avatar-ring {
      position: relative;
      padding: 3px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--purple-light), var(--cyan));
    }
    .avatar-ring::before {
      content: '';
      position: absolute; inset: -4px; border-radius: 50%;
      background: radial-gradient(circle, rgba(124,58,237,.45) 0%, transparent 70%);
    }
    .avatar {
      width: 100px; height: 100px; border-radius: 50%;
      background: var(--card); object-fit: cover;
      border: 3px solid var(--bg2); display: block;
    }
    .avatar-placeholder {
      width: 100px; height: 100px; border-radius: 50%;
      background: linear-gradient(135deg, #1a053a, #2d1b69);
      border: 3px solid var(--bg2);
      display: flex; align-items: center; justify-content: center;
      font-size: 40px; font-weight: 800; color: var(--purple-light);
      letter-spacing: -1px;
    }

    /* ─── Name row ─── */
    .name-block { text-align: center; position: relative; z-index: 1; }
    .display-name { font-size: 26px; font-weight: 800; line-height: 1.15; margin-bottom: 5px; }
    .username { color: var(--muted); font-size: 14px; margin-bottom: 16px; }

    /* ─── Chips ─── */
    .chips { display: flex; justify-content: center; flex-wrap: wrap; gap: 7px; }
    .chip {
      background: rgba(124,58,237,.18); border: 1px solid var(--border);
      border-radius: 20px; padding: 5px 13px;
      font-size: 12px; color: rgba(255,255,255,.7);
      display: flex; align-items: center; gap: 5px;
    }
    .chip.green { background: rgba(34,197,94,.12); border-color: rgba(34,197,94,.25); color: #86efac; }

    /* ─── Action buttons ─── */
    .actions-wrap {
      padding: 0 18px;
      transform: translateY(-36px);
      margin-bottom: -18px;
      position: relative; z-index: 10;
      display: flex; flex-direction: column; gap: 10px;
    }

    .btn-primary {
      display: flex; align-items: center; justify-content: center; gap: 11px;
      width: 100%; padding: 17px 22px; border-radius: 16px;
      background: linear-gradient(135deg, var(--purple) 0%, var(--purple-light) 100%);
      color: #fff; border: none; cursor: pointer;
      font-size: 16px; font-weight: 700;
      box-shadow: 0 10px 28px rgba(124,58,237,.45);
      transition: opacity .15s, transform .15s;
      text-decoration: none;
    }
    .btn-primary:active { opacity: .85; transform: scale(.98); }
    .btn-primary .btn-sub { font-size: 11px; opacity: .7; font-weight: 400; margin-top: 1px; }
    .btn-primary .btn-content { display: flex; flex-direction: column; align-items: flex-start; }

    .btn-secondary {
      display: flex; align-items: center; justify-content: center; gap: 11px;
      width: 100%; padding: 15px 22px; border-radius: 16px;
      background: rgba(124,58,237,.15);
      border: 1.5px solid rgba(124,58,237,.4);
      color: var(--purple-light); cursor: pointer;
      font-size: 15px; font-weight: 700;
      transition: opacity .15s, transform .15s, background .15s;
      text-decoration: none;
    }
    .btn-secondary:active { opacity: .85; transform: scale(.98); background: rgba(124,58,237,.25); }

    /* ─── Sections ─── */
    .section { padding: 0 18px; margin-top: 26px; }

    .section-title {
      font-size: 10px; font-weight: 800; letter-spacing: 2px;
      text-transform: uppercase; color: var(--purple-light);
      margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
    }
    .section-title::after { content:''; flex:1; height:1px; background:var(--border); }

    /* ─── Bio ─── */
    .bio-card {
      background: var(--card); border: 1px solid var(--border2);
      border-radius: 16px; padding: 18px 16px;
      font-size: 14px; color: var(--text2); line-height: 1.75;
    }

    /* ─── Info card ─── */
    .info-card {
      background: var(--card); border: 1px solid var(--border2); border-radius: 16px; overflow: hidden;
    }
    .info-row {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 16px;
      border-bottom: 1px solid rgba(124,58,237,.09);
    }
    .info-row:last-child { border-bottom: none; }
    .info-icon { font-size: 19px; flex-shrink: 0; width: 30px; text-align: center; }
    .info-label { font-size: 10px; color: var(--muted2); text-transform: uppercase; letter-spacing: .9px; margin-bottom: 3px; }
    .info-value { font-size: 14px; font-weight: 600; color: var(--text2); }

    /* ─── Stats row ─── */
    .stats-row {
      display: grid; grid-template-columns: repeat(3, 1fr);
      background: var(--card); border: 1px solid var(--border2); border-radius: 16px; overflow: hidden;
    }
    .stat-item {
      display: flex; flex-direction: column; align-items: center;
      padding: 18px 12px; gap: 4px;
    }
    .stat-item:not(:last-child) { border-right: 1px solid rgba(124,58,237,.09); }
    .stat-val { font-size: 22px; font-weight: 800; color: var(--purple-light); }
    .stat-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: .8px; text-align: center; }

    /* ─── Photo grid ─── */
    .photo-grid {
      display: grid; grid-template-columns: repeat(3,1fr);
      gap: 3px; border-radius: 16px; overflow: hidden;
    }
    .photo-item {
      aspect-ratio: 1; overflow: hidden; background: var(--card);
      cursor: pointer; position: relative;
    }
    .photo-item img { width:100%; height:100%; object-fit:cover; transition: transform .25s; display:block; }
    .photo-item:hover img { transform: scale(1.07); }
    .photo-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(transparent 55%, rgba(0,0,0,.7));
      opacity: 0; transition: opacity .2s;
    }
    .photo-item:hover .photo-overlay { opacity: 1; }
    .photo-caption {
      position: absolute; bottom: 0; left: 0; right: 0;
      padding: 6px 7px;
      font-size: 10px; color: rgba(255,255,255,.8);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .empty-state {
      background: var(--card); border: 1px solid var(--border2);
      border-radius: 16px; padding: 36px; text-align: center;
      color: var(--muted); font-size: 14px;
    }
    .empty-state .empty-icon { font-size: 36px; margin-bottom: 10px; }

    /* ─── Download section ─── */
    .download-section {
      margin: 28px 18px 0;
      background: linear-gradient(135deg, rgba(124,58,237,.14) 0%, rgba(6,182,212,.08) 100%);
      border: 1px solid rgba(124,58,237,.25);
      border-radius: 20px; padding: 22px;
    }
    .download-title {
      font-size: 16px; font-weight: 800; margin-bottom: 4px; text-align: center;
    }
    .download-sub {
      font-size: 13px; color: var(--muted); text-align: center; margin-bottom: 16px; line-height: 1.5;
    }
    .store-btn {
      display: flex; align-items: center; gap: 12px;
      background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12);
      border-radius: 14px; padding: 13px 18px;
      color: var(--text); text-decoration: none;
      cursor: pointer; width: 100%; font-size: 14px; font-weight: 600;
      transition: background .15s;
      margin-bottom: 8px;
    }
    .store-btn:last-child { margin-bottom: 0; }
    .store-btn:hover { background: rgba(255,255,255,.12); }
    .store-btn .store-label { font-size: 10px; color: var(--muted); font-weight: 400; display: block; margin-bottom: 1px; }
    .store-btn svg { flex-shrink: 0; }

    /* ─── Footer ─── */
    .footer { text-align: center; padding: 28px 24px 12px; color: var(--muted2); font-size: 12px; line-height: 1.8; }

    /* ─── Lightbox ─── */
    #lightbox {
      display: none; position: fixed; inset: 0; z-index: 1000;
      background: rgba(0,0,0,.94); padding: 20px;
      align-items: center; justify-content: center;
    }
    #lightbox.open { display: flex; }
    #lightbox img { max-width:100%; max-height:82vh; border-radius:12px; object-fit:contain; }
    #lightbox-close {
      position: absolute; top: 18px; right: 18px;
      width: 40px; height: 40px; border-radius: 50%;
      background: rgba(255,255,255,.15); backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,.15);
      color: #fff; font-size: 18px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    }
    #lightbox-cap {
      position: absolute; bottom: 28px; left: 20px; right: 20px;
      text-align: center; color: rgba(255,255,255,.6); font-size: 13px;
    }

    /* ─── Toast ─── */
    #toast {
      position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(80px);
      background: var(--card2); border: 1px solid var(--border);
      border-radius: 14px; padding: 12px 20px;
      color: var(--text); font-size: 13px; font-weight: 600;
      white-space: nowrap; z-index: 2000;
      transition: transform .3s cubic-bezier(.34,1.56,.64,1);
      box-shadow: 0 8px 24px rgba(0,0,0,.5);
    }
    #toast.show { transform: translateX(-50%) translateY(0); }

    @media (prefers-color-scheme: light) {
      /* Keep dark theme even in light mode — it's branded */
      html, body { background: var(--bg); }
    }
  </style>
</head>
<body>

<!-- Loading -->
<div id="loading">
  <div class="loading-logo">🎲</div>
  <div class="spinner"></div>
  <p class="loading-text">Loading profile…</p>
</div>

<!-- Error -->
<div id="error">
  <div class="err-icon">🎲</div>
  <h2>Profile Not Found</h2>
  <p>This player's profile doesn't exist or may have been removed from LeLudo.</p>
</div>

<!-- Main page -->
<div id="page">

  <!-- Hero -->
  <div class="hero">
    <div class="hero-glow1"></div>
    <div class="hero-glow2"></div>
    <div class="hero-glow3"></div>

    <!-- Branding bar -->
    <div class="brand-bar">
      <div class="brand-left">
        <div class="brand-dot"></div>
        <span class="brand-name">LeLudo</span>
      </div>
      <div class="public-badge">Public Profile</div>
    </div>

    <!-- Avatar -->
    <div class="avatar-wrap">
      <div class="avatar-ring" id="avatar-ring">
        <div id="avatar-el" class="avatar-placeholder">?</div>
      </div>
    </div>

    <!-- Name -->
    <div class="name-block">
      <div id="display-name" class="display-name">—</div>
      <div id="username-el" class="username">@—</div>
      <div class="chips" id="chips-row">
        <span class="chip">🎲 Ludo Player</span>
      </div>
    </div>
  </div>

  <!-- Action buttons -->
  <div class="actions-wrap">
    <!-- Add Friend / Contact -->
    <button class="btn-secondary" onclick="contactUser()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <line x1="19" y1="8" x2="19" y2="14"/>
        <line x1="22" y1="11" x2="16" y2="11"/>
      </svg>
      Add as Friend on LeLudo
    </button>

    <!-- Open / Download App -->
    <button class="btn-primary" onclick="openApp()">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      <div class="btn-content">
        <div>Open in LeLudo</div>
        <div class="btn-sub">Play Ludo · Chat · Compete</div>
      </div>
    </button>
  </div>

  <!-- Stats -->
  <div class="section">
    <div class="section-title">Activity</div>
    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-val" id="stat-photos">—</div>
        <div class="stat-label">Photos</div>
      </div>
      <div class="stat-item">
        <div class="stat-val" id="stat-joined">—</div>
        <div class="stat-label">Member</div>
      </div>
      <div class="stat-item">
        <div class="stat-val">🎲</div>
        <div class="stat-label">Ludo Pro</div>
      </div>
    </div>
  </div>

  <!-- Bio -->
  <div id="bio-section" class="section" style="display:none">
    <div class="section-title">About</div>
    <div id="bio-card" class="bio-card"></div>
  </div>

  <!-- Profile Info -->
  <div class="section">
    <div class="section-title">Profile Details</div>
    <div class="info-card" id="info-card"></div>
  </div>

  <!-- Photos -->
  <div id="photos-section" class="section">
    <div class="section-title">Photos</div>
    <div id="photos-container"></div>
  </div>

  <!-- Download / Store -->
  <div class="download-section">
    <div class="download-title">🎲 Play LeLudo</div>
    <div class="download-sub">Download the app to play Ludo, add friends, and chat in real time.</div>
    <button class="store-btn" onclick="openAndroid()">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3.18 23.16a1 1 0 0 0 1.38.38l11.56-6.67-2.84-2.84L3.18 23.16z" fill="#4ade80"/>
        <path d="M21.67 10.2a1.88 1.88 0 0 0 0-3.26L18.44 5.1l-3.12 3.12 3.12 3.13 3.23-1.15z" fill="#FBBC04"/>
        <path d="M2.06 1.84a1 1 0 0 0-.56.89v18.54c0 .38.21.72.56.89l.1.06L13.6 12.28v-.3L2.16 1.78l-.1.06z" fill="#4285F4"/>
        <path d="M16.12 15.55 13 12.43l-10.84 6.25.1.06a1 1 0 0 0 1 0l12.86-7.19z" fill="#EA4335"/>
      </svg>
      <div>
        <span class="store-label">Get it on</span>
        Google Play
      </div>
    </button>
    <button class="store-btn" onclick="openIOS()">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.19 1.28-2.17 3.8.03 3.02 2.65 4.03 2.68 4.04l-.06.28zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
      <div>
        <span class="store-label">Download on the</span>
        App Store
      </div>
    </button>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>🎲 LeLudo · Social Ludo Gaming</p>
    <p>Scan QR codes to connect &amp; play with friends</p>
  </div>
</div>

<!-- Lightbox -->
<div id="lightbox" onclick="closeLightbox()">
  <button id="lightbox-close" onclick="closeLightbox()">✕</button>
  <img id="lightbox-img" src="" alt="" />
  <div id="lightbox-cap"></div>
</div>

<!-- Toast -->
<div id="toast"></div>

<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
  import { getFirestore, doc, getDoc, collection, query, where, orderBy, limit, getDocs }
    from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

  const firebaseConfig = ${JSON.stringify(FIREBASE_CONFIG)};
  const userId = ${JSON.stringify(userId)};

  // Use a unique app name to avoid conflicts if the main app is open in same session
  const fbApp = initializeApp(firebaseConfig, "public-profile-view-" + userId);
  const db    = getFirestore(fbApp);

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g,"&amp;").replace(/</g,"&lt;")
      .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function fmtMonth(ts) {
    if (!ts) return null;
    return new Date(ts).toLocaleDateString("en-US", { year:"numeric", month:"short" });
  }
  function fmtYear(ts) {
    if (!ts) return null;
    return new Date(ts).getFullYear().toString();
  }

  async function run() {
    try {
      const snap = await getDoc(doc(db, "users", userId));
      if (!snap.exists()) { showError(); return; }
      const p = snap.data();

      // ── Avatar ──────────────────────────────────────────────
      const ring = document.getElementById("avatar-ring");
      if (p.photo) {
        ring.innerHTML = \`<img class="avatar" src="\${esc(p.photo)}" alt="\${esc(p.name)}" />\`;
      } else {
        const initials = ((p.name || p.username || "?")[0]).toUpperCase();
        ring.innerHTML = \`<div class="avatar-placeholder">\${esc(initials)}</div>\`;
      }

      // ── Name ────────────────────────────────────────────────
      const dispName = p.name || p.username || "LeLudo Player";
      document.getElementById("display-name").textContent = dispName;
      document.getElementById("username-el").textContent  = p.username ? "@" + p.username : "";
      document.title = dispName + " · LeLudo";

      // ── Chips / badges ───────────────────────────────────────
      const chips = [];
      chips.push('<span class="chip">🎲 Ludo Player</span>');
      if (p.createdAt) chips.push(\`<span class="chip green">📅 Since \${fmtYear(p.createdAt)}</span>\`);
      if (p.country)   chips.push(\`<span class="chip">🌍 \${esc(p.country)}</span>\`);
      document.getElementById("chips-row").innerHTML = chips.join("");

      // ── Bio ─────────────────────────────────────────────────
      if (p.bio?.trim()) {
        document.getElementById("bio-section").style.display = "block";
        document.getElementById("bio-card").textContent = p.bio.trim();
      }

      // ── Info rows ────────────────────────────────────────────
      const rows = [];
      if (dispName)         rows.push({ icon:"👤", label:"Display Name",  val: dispName });
      if (p.username)       rows.push({ icon:"🎮", label:"Username",      val: "@" + p.username });
      if (p.country) {
        const loc = [p.city, p.state, p.country].filter(Boolean).join(", ");
        rows.push({ icon:"🌍", label:"Location", val: loc });
      }
      if (p.gender && p.gender !== "") {
        rows.push({ icon:"✨", label:"Gender", val: p.gender.charAt(0).toUpperCase() + p.gender.slice(1) });
      }
      if (p.createdAt) rows.push({ icon:"📅", label:"Member Since", val: fmtMonth(p.createdAt) });

      const infoCard = document.getElementById("info-card");
      infoCard.innerHTML = rows.length
        ? rows.map(r => \`
            <div class="info-row">
              <div class="info-icon">\${r.icon}</div>
              <div>
                <div class="info-label">\${esc(r.label)}</div>
                <div class="info-value">\${esc(r.val)}</div>
              </div>
            </div>\`).join("")
        : \`<div class="info-row"><div class="info-value" style="color:var(--muted)">No profile info yet</div></div>\`;

      // ── Stat: joined year ────────────────────────────────────
      if (p.createdAt) {
        document.getElementById("stat-joined").textContent = fmtYear(p.createdAt);
      }

      // ── Photos ───────────────────────────────────────────────
      await loadPhotos();

      // ── Show page ────────────────────────────────────────────
      document.getElementById("loading").style.display = "none";
      document.getElementById("page").style.display    = "block";

    } catch (err) {
      console.error("[profile]", err);
      showError();
    }
  }

  async function loadPhotos() {
    try {
      const q = query(
        collection(db, "content"),
        where("userId", "==", userId),
        where("type",   "==", "image"),
        orderBy("timestamp", "desc"),
        limit(12)
      );
      const snaps = await getDocs(q);
      const container = document.getElementById("photos-container");

      document.getElementById("stat-photos").textContent =
        snaps.size > 0 ? String(snaps.size) : "0";

      if (snaps.empty) {
        container.innerHTML = \`
          <div class="empty-state">
            <div class="empty-icon">📷</div>
            No public photos yet
          </div>\`;
        return;
      }

      const items = snaps.docs.map(d => d.data());
      container.innerHTML = \`<div class="photo-grid">\` +
        items.map(item => \`
          <div class="photo-item" onclick="openLightbox('\${esc(item.url)}', '\${esc(item.caption||'')}')">
            <img src="\${esc(item.url)}" alt="\${esc(item.caption||'')}" loading="lazy" />
            <div class="photo-overlay"></div>
            \${item.caption ? \`<div class="photo-caption">\${esc(item.caption)}</div>\` : ""}
          </div>\`).join("") +
        \`</div>\`;
    } catch {
      document.getElementById("photos-container").innerHTML =
        \`<div class="empty-state"><div class="empty-icon">📷</div>No public photos yet</div>\`;
    }
  }

  function showError() {
    document.getElementById("loading").style.display = "none";
    document.getElementById("error").style.display   = "flex";
  }

  run();
</script>

<script>
  const USER_ID    = ${JSON.stringify(userId)};
  const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.leludo.app";
  const APP_STORE  = "https://apps.apple.com/app/leludo/id000000000";
  const DEEP_USER  = "leludo://user/"  + USER_ID;
  const DEEP_HOME  = "leludo://";

  function isAndroid() { return /android/i.test(navigator.userAgent); }
  function isIOS()     { return /iphone|ipad|ipod/i.test(navigator.userAgent); }
  function isMobile()  { return isAndroid() || isIOS(); }

  function showToast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2800);
  }

  function tryDeepLink(link, fallbackUrl) {
    const start = Date.now();
    window.location.href = link;
    setTimeout(() => {
      if (document.visibilityState !== "hidden" && Date.now() - start < 2400) {
        window.location.href = fallbackUrl;
      }
    }, 1800);
  }

  function contactUser() {
    if (isMobile()) {
      showToast("Opening LeLudo…");
      tryDeepLink(DEEP_USER, isIOS() ? APP_STORE : PLAY_STORE);
    } else {
      showToast("Get LeLudo on your phone to add friends!");
    }
  }

  function openApp() {
    if (isMobile()) {
      showToast("Opening LeLudo…");
      tryDeepLink(DEEP_HOME, isIOS() ? APP_STORE : PLAY_STORE);
    } else {
      window.open(PLAY_STORE, "_blank");
    }
  }

  function openAndroid() {
    showToast("Redirecting to Google Play…");
    setTimeout(() => window.open(PLAY_STORE, "_blank"), 400);
  }

  function openIOS() {
    showToast("Redirecting to App Store…");
    setTimeout(() => window.open(APP_STORE, "_blank"), 400);
  }

  function openLightbox(url, cap) {
    document.getElementById("lightbox-img").src = url;
    document.getElementById("lightbox-cap").textContent = cap || "";
    document.getElementById("lightbox").classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    document.getElementById("lightbox").classList.remove("open");
    document.getElementById("lightbox-img").src = "";
    document.body.style.overflow = "";
  }

  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });
  document.getElementById("lightbox").addEventListener("click", function(e) {
    if (e.target === this) closeLightbox();
  });
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
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.send(buildProfileHtml(userId));
});

export default router;
