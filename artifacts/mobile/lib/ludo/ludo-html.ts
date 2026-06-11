// Auto-generated from leludo-main source via esbuild bundle
// Entry point: leludo-main/index.html → components/index.js + scripts/index.js
export const LUDO_GAME_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
<meta name="apple-mobile-web-app-capable" content="yes"/>
<meta name="theme-color" content="#080808"/>
<title>Ludo</title>
<script>
(function(){var t=localStorage.getItem('theme');document.documentElement.classList.add(t==='light'?'light':'dark');})();
</script>
<style>


/* ============================================================
   Design tokens
   ============================================================ */

:root {
    /* === Main App Design System — Dark Theme ===
       Colors match artifacts/mobile/constants/colors.ts exactly */
    --color-bg: #080808;
    --color-fg: #ffffff;
    --color-surface: rgba(255, 255, 255, 0.06);
    --color-surface-hover: rgba(255, 255, 255, 0.10);
    --color-border: rgba(255, 255, 255, 0.10);
    --color-board-cell: rgba(255, 255, 255, 0.04);
    --color-board-border: rgba(255, 255, 255, 0.12);
    --color-safe: rgba(124, 58, 237, 0.15);

    /* CTA — purple primary to match app (#7C3AED) */
    --cta-bg: #7C3AED;
    --cta-fg: #ffffff;

    /* Player palettes — base swatches (kept as raw HSL triplets so they
       can be remapped at runtime via --player-N = var(--base-color-X)).
       Game logic depends on these — do NOT change. */
    --base-color-0: 10 63% 55%;
    --base-color-1: 152 38% 45%;
    --base-color-2: 43 75% 55%;
    --base-color-3: 223 54% 55%;
    --base-color-0-light: 10 40% 20%;
    --base-color-1-light: 152 30% 18%;
    --base-color-2-light: 43 40% 18%;
    --base-color-3-light: 223 35% 20%;

    --player-0: var(--base-color-0);
    --player-1: var(--base-color-1);
    --player-2: var(--base-color-2);
    --player-3: var(--base-color-3);
    --player-0-light: var(--base-color-0-light);
    --player-1-light: var(--base-color-1-light);
    --player-2-light: var(--base-color-2-light);
    --player-3-light: var(--base-color-3-light);
    --player-0-path: 10 30% 25%;
    --player-1-path: 148 20% 22%;
    --player-2-path: 43 30% 22%;
    --player-3-path: 223 25% 25%;

    /* Spacing scale (4px base) */
    --space-1: 4px;
    --space-2: 8px;
    --space-3: 12px;
    --space-4: 16px;
    --space-5: 20px;
    --space-6: 24px;
    --space-8: 32px;
    --space-10: 40px;
    --space-12: 48px;

    /* Radii — match app (20px cards, 14px buttons) */
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
    --radius-xl: 16px;
    --radius-2xl: 20px;
    --radius-pill: 9999px;

    /* Fonts — Inter to match main app typography */
    --font-display: "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    --font-sans: "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    --font-mono: "JetBrains Mono", "SF Mono", ui-monospace, monospace;

    /* Layout */
    --frame-max-w: 384px;
    --frame-min-h: calc(100dvh - 16px);
    --frame-fixed-h: 820px;
    --frame-fixed-max-h: calc(100dvh - 32px);

    /* Controls */
    --icon-btn-size: 38px;
    --cta-h: 60px;
    --cta-h-sm: 48px;
}

.dark {
    --color-bg: #080808;
    --color-fg: #ffffff;
    --color-surface: rgba(255, 255, 255, 0.06);
    --color-surface-hover: rgba(255, 255, 255, 0.10);
    --color-border: rgba(255, 255, 255, 0.10);
    --color-board-cell: rgba(255, 255, 255, 0.04);
    --color-board-border: rgba(255, 255, 255, 0.12);
    --color-safe: rgba(124, 58, 237, 0.15);

    --cta-bg: #7C3AED;
    --cta-fg: #ffffff;

    --base-color-0: 10 63% 55%;
    --base-color-1: 152 38% 45%;
    --base-color-2: 43 75% 55%;
    --base-color-3: 223 54% 55%;
    --base-color-0-light: 10 40% 20%;
    --base-color-1-light: 152 30% 18%;
    --base-color-2-light: 43 40% 18%;
    --base-color-3-light: 223 35% 20%;

    --player-0-path: 10 30% 25%;
    --player-1-path: 148 20% 22%;
    --player-2-path: 43 30% 22%;
    --player-3-path: 223 25% 25%;
}

.light {
    --color-bg: #F5F5F7;
    --color-fg: #0A0A0A;
    --color-surface: rgba(0, 0, 0, 0.05);
    --color-surface-hover: rgba(0, 0, 0, 0.08);
    --color-border: rgba(0, 0, 0, 0.10);
    --color-board-cell: rgba(0, 0, 0, 0.03);
    --color-board-border: rgba(0, 0, 0, 0.10);
    --color-safe: rgba(124, 58, 237, 0.12);

    --cta-bg: #7C3AED;
    --cta-fg: #ffffff;

    --base-color-0: 10 63% 48%;
    --base-color-1: 152 38% 38%;
    --base-color-2: 43 75% 48%;
    --base-color-3: 223 54% 48%;
    --base-color-0-light: 10 40% 28%;
    --base-color-1-light: 152 30% 25%;
    --base-color-2-light: 43 40% 25%;
    --base-color-3-light: 223 35% 28%;

    --player-0-path: 10 28% 38%;
    --player-1-path: 148 22% 32%;
    --player-2-path: 43 32% 32%;
    --player-3-path: 223 28% 36%;
}

/* ============================================================
   Reset + base typography
   ============================================================ */

*, *::before, *::after {
    box-sizing: border-box;
    border: 0 solid var(--color-border);
}

html, body {
    height: 100%;
    margin: 0;
    padding: 0;
}

html {
    background: var(--color-bg);
    color: var(--color-fg);
    /* Kill the default blue/grey tap-highlight overlay shown on touch
       devices (and the equivalent flash on click) — buttons style their
       own hover/active states. Guards the gear-icon "blue block" bug. */
    -webkit-tap-highlight-color: transparent;
}

body {
    font-family: var(--font-sans);
    font-weight: 400;
    line-height: 1.5;
    display: flex;
    flex-direction: column;
}

body,
#pause-menu,
#settings-overlay {
    background-image:
        radial-gradient(ellipse 80% 70% at 50% 50%,
            rgba(124, 58, 237, 0.18) 0%,
            rgba(15, 3, 32, 0.55) 50%,
            transparent 90%);
    background-attachment: fixed;
}

.dark body,
.dark #pause-menu,
.dark #settings-overlay {
    background-image:
        radial-gradient(ellipse 80% 70% at 50% 50%,
            rgba(124, 58, 237, 0.18) 0%,
            rgba(15, 3, 32, 0.55) 50%,
            transparent 90%);
}

.light body,
.light #pause-menu,
.light #settings-overlay {
    background-image:
        radial-gradient(ellipse 80% 70% at 50% 50%,
            rgba(124, 58, 237, 0.07) 0%,
            rgba(245, 245, 247, 0.2) 50%,
            transparent 90%);
}

button {
    font: inherit;
    color: inherit;
    background: transparent;
    border: 0;
    padding: 0;
    cursor: pointer;
}

input {
    font: inherit;
    color: inherit;
}

a {
    color: inherit;
    text-decoration: none;
}

table td {
    font-variant-numeric: tabular-nums;
}

/* ============================================================
   Utility classes (kept minimal — only the ones JS depends on)
   ============================================================ */

.hidden {
    display: none !important;
}

/* ============================================================
   Layout primitives — used by home, setup, settings, pause, board,
   changelog, privacy. Outer page frame + top icon row + CTAs.
   ============================================================ */

.page {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: var(--space-2);
}

@media (min-width: 640px) {
    .page {
        align-items: center;
    }
}

.frame {
    width: 100%;
    max-width: var(--frame-max-w);
    display: flex;
    flex-direction: column;
    min-height: var(--frame-min-h);
}

@media (min-width: 640px) {
    .frame {
        min-height: 0;
        height: var(--frame-fixed-h);
        max-height: var(--frame-fixed-max-h);
    }
}

.frame-overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: var(--color-bg);
    overflow-y: auto;
    display: none;
    align-items: flex-start;
    justify-content: center;
    padding: var(--space-2);
}

.frame-overlay:not(.hidden) {
    display: flex;
}

@media (min-width: 640px) {
    .frame-overlay:not(.hidden) {
        align-items: center;
    }
}

.top-bar {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding-top: var(--space-1);
    padding-bottom: var(--space-6);
}

wc-settings { display: none !important; }
#settings-icon { display: none !important; }
#g-settings-btn { display: none !important; }

.top-bar-title {
    flex: 1;
    text-align: center;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    opacity: 0.5;
}

.icon-btn {
    width: var(--icon-btn-size);
    height: var(--icon-btn-size);
    border-radius: var(--radius-pill);
    background: var(--color-surface);
    border: 1px solid color-mix(in srgb, var(--color-fg) 12%, transparent);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 150ms ease;
    color: inherit;
    padding: 0;
    text-decoration: none;
}

.icon-btn:hover {
    background: var(--color-surface-hover);
}

.icon-btn-spacer {
    width: var(--icon-btn-size);
}

.frame-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.frame-footer {
    padding-top: var(--space-4);
    padding-bottom: var(--space-2);
    display: flex;
    flex-direction: column;
    gap: 10px;
}

/* CTAs */

.cta-primary {
    width: 100%;
    height: 56px;
    border-radius: 28px;
    background: var(--cta-bg);
    color: var(--cta-fg);
    font-weight: 600;
    font-size: 17px;
    letter-spacing: 0.01em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    box-shadow: 0 8px 22px -8px rgba(124, 58, 237, 0.5);
    transition: opacity 150ms ease;
}

.cta-primary:hover {
    opacity: 0.92;
}

.cta-primary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.cta-green {
    width: 100%;
    height: 56px;
    border-radius: 28px;
    background: #16a34a;
    color: #ffffff;
    font-weight: 600;
    font-size: 17px;
    letter-spacing: 0.01em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border: none;
    box-shadow: 0 8px 22px -8px rgba(22, 163, 74, 0.5);
    transition: opacity 150ms ease;
}
.cta-green:hover { opacity: 0.92; }
.cta-green:active { opacity: 0.85; }

.cta-red {
    width: 100%;
    height: 56px;
    border-radius: 28px;
    background: #dc2626;
    color: #ffffff;
    font-weight: 600;
    font-size: 17px;
    letter-spacing: 0.01em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border: none;
    box-shadow: 0 8px 22px -8px rgba(220, 38, 38, 0.5);
    transition: opacity 150ms ease;
}
.cta-red:hover { opacity: 0.92; }
.cta-red:active { opacity: 0.85; }

/* ── Offline Friend Pass-and-Play Popup ───────────────── */
.ofp-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.72);
    backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999; padding: 24px;
}
.ofp-card {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 24px; padding: 28px 20px 20px;
    width: 100%; max-width: 320px;
    display: flex; flex-direction: column; gap: 10px;
}
.ofp-title { font-size: 22px; font-weight: 700; color: var(--color-fg); text-align: center; margin: 0; }
.ofp-sub   { font-size: 12px; color: var(--color-fg); opacity: 0.5; text-align: center; margin: 0 0 4px; }
.ofp-row   { display: flex; gap: 8px; }
.ofp-btn {
    flex: 1; height: 88px; border-radius: 16px;
    border: 2px solid var(--color-border);
    background: var(--color-surface); color: var(--color-fg);
    cursor: pointer; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 3px;
    transition: all 150ms ease;
}
.ofp-btn:hover  { border-color: #dc2626; background: rgba(220,38,38,0.12); transform: translateY(-2px); }
.ofp-btn:active { transform: translateY(0); }
.ofp-num  { font-size: 30px; font-weight: 800; color: #dc2626; line-height: 1; display: block; }
.ofp-lbl  { font-size: 10px; font-weight: 600; opacity: 0.6; letter-spacing: 0.6px; display: block; }
.ofp-dots { display: flex; gap: 4px; margin-top: 3px; }
.ofp-dot  { width: 7px; height: 7px; border-radius: 50%; }
.ofp-cancel {
    width: 100%; height: 46px; border-radius: 23px;
    border: 1.5px solid var(--color-border); background: transparent;
    color: var(--color-fg); font-size: 14px; font-weight: 600;
    cursor: pointer; opacity: 0.55; transition: opacity 150ms ease; margin-top: 4px;
}
.ofp-cancel:hover { opacity: 1; }

.cta-secondary {
    width: 100%;
    height: 54px;
    border-radius: 27px;
    background: transparent;
    color: var(--color-fg);
    font-weight: 500;
    font-size: 15px;
    border: 1px solid color-mix(in srgb, var(--color-fg) 20%, transparent);
    cursor: pointer;
    transition: background-color 150ms ease;
}

.cta-secondary:hover {
    background: color-mix(in srgb, var(--color-fg) 5%, transparent);
}

/* Display text + section labels */

.display-title {
    font-family: var(--font-display);
    font-size: 40px;
    line-height: 1;
    letter-spacing: -0.025em;
    padding: var(--space-2) var(--space-1);
    margin: 0;
}

.body-helper {
    font-size: 14px;
    opacity: 0.5;
    padding: var(--space-2) var(--space-1) var(--space-4);
    max-width: 320px;
    margin: 0;
}

.section-label {
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    opacity: 0.4;
    font-weight: 500;
}

.section-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.surface-card {
    background: var(--color-surface);
    border-radius: var(--radius-2xl);
    border: 1px solid color-mix(in srgb, var(--color-fg) 10%, transparent);
}

.surface-card-padded {
    padding: 14px;
}

/* ============================================================
   Player color helpers
   (player-N variables are remapped at runtime — see scripts/render-logic.js)
   ============================================================ */

.player-bg-0 { background-color: hsl(var(--player-0)); }
.player-bg-1 { background-color: hsl(var(--player-1)); }
.player-bg-2 { background-color: hsl(var(--player-2)); }
.player-bg-3 { background-color: hsl(var(--player-3)); }

.player-bg-soft-0 { background-color: hsl(var(--player-0-light)); }
.player-bg-soft-1 { background-color: hsl(var(--player-1-light)); }
.player-bg-soft-2 { background-color: hsl(var(--player-2-light)); }
.player-bg-soft-3 { background-color: hsl(var(--player-3-light)); }

.player-bg-path-0 { background-color: hsl(var(--player-0-path)); }
.player-bg-path-1 { background-color: hsl(var(--player-1-path)); }
.player-bg-path-2 { background-color: hsl(var(--player-2-path)); }
.player-bg-path-3 { background-color: hsl(var(--player-3-path)); }

.player-fg-0 { color: hsl(var(--player-0)); }
.player-fg-1 { color: hsl(var(--player-1)); }
.player-fg-2 { color: hsl(var(--player-2)); }
.player-fg-3 { color: hsl(var(--player-3)); }

.player-border-0 { border-color: hsl(var(--player-0)); }
.player-border-1 { border-color: hsl(var(--player-1)); }
.player-border-2 { border-color: hsl(var(--player-2)); }
.player-border-3 { border-color: hsl(var(--player-3)); }

.player-fill-0 { fill: hsl(var(--player-0)); }
.player-fill-1 { fill: hsl(var(--player-1)); }
.player-fill-2 { fill: hsl(var(--player-2)); }
.player-fill-3 { fill: hsl(var(--player-3)); }

/* ============================================================
   Keyframes + animation utility classes
   (utility class names are queried by JS — preserve them)
   ============================================================ */

@keyframes dice-ripple {
    0% { width: 80%; height: 80%; opacity: 0.5; }
    100% { width: 220%; height: 220%; opacity: 0; }
}

.dice-ripple {
    animation: dice-ripple 1.8s ease-out infinite;
    pointer-events: none;
}

@keyframes dice-shake {
    0% { transform: scale(1) rotate(0deg); }
    20% { transform: scale(0.92) rotate(-5deg); }
    40% { transform: scale(0.95) rotate(3deg); }
    60% { transform: scale(1.04) rotate(-2deg); }
    80% { transform: scale(1.02) rotate(1deg); }
    100% { transform: scale(1) rotate(0deg); }
}

.dice-rolling {
    animation: dice-shake 0.45s ease-in-out;
}

@keyframes home-arrive {
    0%   { transform: scale(0.55); opacity: 0; }
    60%  { transform: scale(1.08); opacity: 1; }
    100% { transform: scale(1);    opacity: 1; }
}

wc-token.token-arriving {
    animation: home-arrive 280ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    transform-origin: center;
}

@keyframes active-dice-pulse {
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 12px 24px -8px var(--pulse-color), inset 0 -2px 0 rgba(0,0,0,0.12), 0 0 0 0 var(--pulse-color);
    }
    50% {
        transform: scale(1.05);
        box-shadow: 0 14px 28px -8px var(--pulse-color), inset 0 -2px 0 rgba(0,0,0,0.12), 0 0 0 10px transparent;
    }
}

.active-dice-pulse {
    animation: active-dice-pulse 1.6s ease-in-out infinite;
}

@keyframes token-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20%); }
}

.animate-bounce {
    animation: token-bounce 1s infinite;
}

/* ============================================================
   Touch defaults for interactive game elements
   ============================================================ */

wc-token, wc-dice {
    touch-action: manipulation;
}

wc-quick-start, wc-board {
    display: block;
}

wc-token .animate-bounce {
    filter: drop-shadow(0 0 4px currentColor);
}
/* ============================================================
   wc-board — game board screen
   ============================================================ */

wc-board .board-frame {
    display: flex;
    flex-direction: column;
    min-height: var(--frame-min-h);
}

@media (min-width: 640px) {
    wc-board .board-frame {
        min-height: 0;
        height: var(--frame-fixed-h);
        max-height: var(--frame-fixed-max-h);
    }
}

wc-board .board-topbar {
    display: flex;
    align-items: center;
    padding-top: var(--space-1);
    padding-bottom: var(--space-6);
    gap: var(--space-2);
}

wc-board .turn-counter {
    font-size: 12px;
    opacity: 0.5;
    letter-spacing: 0.16em;
    text-transform: uppercase;
}

wc-board .board-spacer {
    flex: 1;
}

wc-board .board-corner-row {
    display: flex;
    align-items: flex-start;
    padding: 0 var(--space-3);
    padding-top: var(--space-2);
    gap: var(--space-2);
    min-height: 56px;
}

wc-board .board-corner-row--bottom {
    align-items: flex-end;
    padding-top: var(--space-3);
    padding-bottom: var(--space-2);
}

/* Each anchor owns half the row and hugs its own side. Without this a
   row with a single occupied corner (2-/3-player games) would collapse
   the lone widget to flex-start — the bottom-right human pill rendered
   at bottom-left instead of staying under its quadrant. */
wc-board .board-corner-row > div {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
}

wc-board #b0,
wc-board #b3 {
    justify-content: flex-start;
}

wc-board #b1,
wc-board #b2 {
    justify-content: flex-end;
}

wc-board .board-area {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-3);
    padding-bottom: 0;
    padding-top: var(--space-3);
}

wc-board .board-wrap {
    position: relative;
    width: 100%;
}

wc-board .board-grid {
    display: grid;
    grid-template-rows: repeat(5, 1fr);
    grid-template-columns: repeat(5, 1fr);
    gap: 0;
    border-radius: var(--radius-lg);
    aspect-ratio: 1 / 1;
    width: 100%;
    box-shadow:
        0 14px 40px -10px rgba(0, 0, 0, 0.55),
        0 2px 6px rgba(0, 0, 0, 0.3),
        inset 0 0 0 1px rgba(255, 255, 255, 0.06);
    /* Intentionally NOT overflow:hidden — tokens use animate-bounce
       (translateY -20%) and drop-shadow on the edge cells (e.g. m11)
       that need to render beyond the board's bounding box. The home
       quads supply their own corner radii. */
}

/* ----- Home quadrants ----- */

wc-board .home-quad {
    grid-row: span 2;
    grid-column: span 2;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    min-height: 0;
}

wc-board .home-quad--tl { border-top-left-radius: var(--radius-lg); }
wc-board .home-quad--tr { border-top-right-radius: var(--radius-lg); }
wc-board .home-quad--bl { border-bottom-left-radius: var(--radius-lg); }
wc-board .home-quad--br { border-bottom-right-radius: var(--radius-lg); }

wc-board .home-quad-slots {
    width: 66.6667%;
    height: 66.6667%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    border-radius: var(--radius-md);
    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid color-mix(in srgb, var(--color-board-border) 30%, transparent);
}

wc-board .home-slot-cell {
    display: flex;
    align-items: center;
    justify-content: center;
}

wc-board .home-slot-dot {
    width: 50%;
    height: 50%;
    border-radius: 50%;
    background: var(--color-bg);
    border-width: 2px;
    border-style: solid;
}

/* Home quadrant solid backgrounds gain subtle radial highlight */
wc-board .home-quad.player-bg-0,
wc-board .home-quad.player-bg-1,
wc-board .home-quad.player-bg-2,
wc-board .home-quad.player-bg-3 {
    background-image: radial-gradient(circle at center, rgba(255, 255, 255, 0.08) 0%, transparent 65%);
}

/* ----- Path arms (the cross arms of the board) ----- */

wc-board .path-arm-v {
    grid-row: span 2;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(6, 1fr);
    min-width: 0;
    min-height: 0;
}

wc-board .path-arm-h {
    grid-column: span 2;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(3, 1fr);
    min-width: 0;
    min-height: 0;
}

wc-board .path-arm-h > .path-cell,
wc-board .path-arm-v > .path-cell {
    outline: 1px solid color-mix(in srgb, var(--color-board-border) 40%, transparent);
    outline-offset: -1px;
}

/* Layout-only rule keeps full specificity (every cell is positioned).
   \`min-width: 0; min-height: 0\` overrides the default \`min-content\`
   floor for grid items so token children (intrinsic 1:1 via SVG
   viewBox) don't stretch their row/column track. Without this, rows
   that contain a token grow taller than rows that don't, breaking
   board uniformity. */
wc-board .path-cell {
    position: relative;
    min-width: 0;
    min-height: 0;
}

/* Default background uses :where() so the wc-board prefix doesn't
   raise specificity above the global .player-bg-path-N helpers
   (base.css). Without this, tinted home-stretch cells render as
   board-cell color. */
wc-board :where(.path-cell) {
    background-color: var(--color-board-cell);
}

/* Player-tinted path cells gain a subtle directional gloss. */
wc-board .path-cell.player-bg-path-0,
wc-board .path-cell.player-bg-path-1,
wc-board .path-cell.player-bg-path-2,
wc-board .path-cell.player-bg-path-3 {
    background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.12), transparent);
}

/* Safe cells (m8, m21, m34, m47) keep the plain board-cell background
   inherited from \`:where(.path-cell)\` and signal "safe" purely through
   the player-colored star SVG drawn inside. Don't add a background
   tint here — see test/e2e/board-styles.spec.js. */
wc-board .path-cell--safe {
    display: flex;
    align-items: center;
    justify-content: center;
}

wc-board .path-cell--entry {
    display: flex;
    align-items: center;
    justify-content: center;
}

wc-board .path-cell-entry-svg {
    width: 68%;
    height: 68%;
    pointer-events: none;
    position: absolute;
    inset: 0;
    margin: auto;
    opacity: 0.7;
}

wc-board .path-cell-safe-svg {
    width: 72%;
    height: 72%;
    pointer-events: none;
    position: absolute;
    inset: 0;
    margin: auto;
}

wc-board .path-cell-safe-svg path {
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.15));
    opacity: 0.85;
}

/* ----- Center finish zone (4 triangles meeting at center) ----- */

wc-board .finish-zone {
    position: relative;
    overflow: clip;
    background: var(--color-board-cell);
    min-width: 0;
    min-height: 0;
}

wc-board .finish-tri {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0.9;
}

wc-board .finish-tri--tl { clip-path: polygon(0 0, 0 100%, 50% 50%); }
wc-board .finish-tri--tr { clip-path: polygon(0 0, 100% 0, 50% 50%); }
wc-board .finish-tri--br { clip-path: polygon(0 100%, 100% 100%, 50% 50%); }
wc-board .finish-tri--bl { clip-path: polygon(100% 0, 100% 100%, 50% 50%); }

/* ----- Dice in dice-home (hidden parent before corner pickup) ----- */

wc-board #dice-home.hidden {
    display: none;
}

/* ----- Dice container inside the dark-mode game (cosmetic) ----- */

.dark .die {
    background: linear-gradient(145deg, #3a3835, #2d2b28) !important;
    box-shadow:
        3px 3px 8px rgba(0, 0, 0, 0.5),
        -1px -1px 3px rgba(255, 255, 255, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
    border-color: rgba(255, 255, 255, 0.06) !important;
}

.dark .die .dice-dot {
    background: radial-gradient(circle at 40% 35%, #eee, #bbb) !important;
    box-shadow:
        inset 0 1px 2px rgba(255, 255, 255, 0.3),
        0 0.5px 0 rgba(0, 0, 0, 0.3) !important;
}

.light .die {
    background: linear-gradient(145deg, #f0eeeb, #e3e0da) !important;
    box-shadow:
        3px 3px 8px rgba(0, 0, 0, 0.12),
        -1px -1px 3px rgba(255, 255, 255, 0.9),
        inset 0 1px 0 rgba(255, 255, 255, 0.95) !important;
    border-color: rgba(0, 0, 0, 0.06) !important;
}

.light .die .dice-dot {
    background: radial-gradient(circle at 40% 35%, #333, #111) !important;
    box-shadow:
        inset 0 1px 2px rgba(0, 0, 0, 0.15),
        0 0.5px 0 rgba(255, 255, 255, 0.5) !important;
}

/* ----- Stack badge for >4 tokens on a cell ----- */

wc-board .stack-badge {
    position: absolute;
    bottom: -6%;
    right: -6%;
    min-width: 46%;
    height: 46%;
    padding: 0 4px;
    border-radius: 50%;
    background: var(--color-fg);
    color: var(--color-bg);
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    z-index: 3;
}
/* ============================================================
   wc-quick-start — home + setup screens
   ============================================================ */

wc-quick-start {
    display: block;
}

/* ----- Home (merged: calm hero + resume card + brand chip header) ----- */

wc-quick-start .home-frame {
    position: relative;
}

wc-quick-start .home-brand-chip {
    line-height: 0;
    padding: 0;
}

wc-quick-start .home-hero {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 var(--space-6);
    transition: padding-bottom 200ms ease;
}

wc-quick-start .home-frame--in-progress .home-hero {
    padding-bottom: var(--space-6);
}

wc-quick-start .home-die {
    line-height: 0;
    margin-bottom: var(--space-5);
    padding: 8px;
    border-radius: 14px;
    background-color: hsl(var(--player-0));
    --pulse-color: hsl(var(--player-0) / 0.55);
    animation: home-die-pulse 2s ease-in-out infinite;
    transition: background-color 0.45s ease-in-out;
}

wc-quick-start .home-die-inner {
    display: inline-block;
    line-height: 0;
}

@keyframes home-die-pulse {
    0%, 100% { box-shadow: 0 0 0 0  var(--pulse-color); }
    50%      { box-shadow: 0 0 0 12px transparent; }
}

@media (prefers-reduced-motion: reduce) {
    wc-quick-start .home-die { animation: none; }
}

wc-quick-start .home-title {
    font-family: var(--font-display);
    font-weight: 700;
    line-height: 0.92;
    letter-spacing: -0.02em;
    font-size: clamp(72px, 22vw, 86px);
    margin: 0;
}

wc-quick-start .home-tagline {
    margin: var(--space-4) 0 0;
    font-size: 14.5px;
    line-height: 1.5;
    opacity: 0.6;
    max-width: 250px;
}

/* ----- Resume card ----- */

wc-quick-start .home-resume-row {
    padding: 0 0 var(--space-3);
}

wc-quick-start .resume-eyebrow {
    font-size: 10px;
    letter-spacing: 0.2em;
    font-weight: 600;
    opacity: 0.4;
    padding: 0 10px var(--space-2);
}

wc-quick-start .resume-card {
    width: 100%;
    text-align: left;
    background: color-mix(in srgb, var(--color-surface) 70%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-fg) 10%, transparent);
    border-radius: 18px;
    padding: 14px;
    color: var(--color-fg);
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
    font: inherit;
    transition: background-color 150ms ease;
}

wc-quick-start .resume-card:hover {
    background: var(--color-surface);
}

wc-quick-start .resume-mini-board {
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    line-height: 0;
}

wc-quick-start .resume-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
}

wc-quick-start .resume-title {
    font-size: 15px;
    font-weight: 600;
    line-height: 1.2;
}

wc-quick-start .resume-sub {
    font-size: 12px;
    opacity: 0.6;
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

wc-quick-start .resume-dots {
    display: flex;
    gap: 5px;
    margin-top: 8px;
}

wc-quick-start .resume-dot {
    width: 8px;
    height: 8px;
    border-radius: 4px;
}

wc-quick-start .resume-play {
    width: 36px;
    height: 36px;
    border-radius: 18px;
    background: var(--color-fg);
    color: var(--color-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

/* ----- Footer + CTAs ----- */

/* Resume-card play button mirrors the primary CTA palette so the
   two share the same espresso/cream pair. */
wc-quick-start .resume-play {
    background: var(--cta-bg);
    color: var(--cta-fg);
}

wc-quick-start .home-version {
    font-size: 11px;
    opacity: 0.35;
    letter-spacing: 0.08em;
}

/* ----- Setup ----- */

wc-quick-start .setup-body {
    text-align: center;
}

wc-quick-start .setup-body .display-title {
    text-align: center;
}

wc-quick-start .setup-helper {
    font-size: 14px;
    opacity: 0.5;
    padding: var(--space-2) var(--space-1) var(--space-8);
    margin: 0 auto;
}

wc-quick-start .seat-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

wc-quick-start .seat-row {
    background: var(--color-surface);
    border-radius: var(--radius-2xl);
    padding: var(--space-3) 14px;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    border: 1px solid color-mix(in srgb, var(--color-fg) 10%, transparent);
    transition: opacity 150ms ease;
    flex-wrap: nowrap;
}

wc-quick-start .seat-row-empty {
    background: color-mix(in srgb, var(--color-surface) 40%, transparent);
    border-radius: var(--radius-2xl);
    padding: var(--space-3) 14px;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    border: 1px dashed color-mix(in srgb, var(--color-fg) 15%, transparent);
    cursor: pointer;
}

wc-quick-start .seat-color-cycle {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0;
    border: 0;
}

wc-quick-start .seat-pawn {
    width: 78%;
    height: 78%;
}

wc-quick-start .seat-pawn-ghost {
    opacity: 0.4;
}

wc-quick-start .seat-empty-color {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-md);
    border: 2px dashed color-mix(in srgb, var(--color-fg) 20%, transparent);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

wc-quick-start .seat-body {
    flex: 1;
    min-width: 0;
}

wc-quick-start .seat-empty-title {
    font-size: 15px;
    font-weight: 500;
    opacity: 0.6;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

wc-quick-start .seat-empty-sub {
    font-size: 12px;
    opacity: 0.5;
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

wc-quick-start .seat-name-wrap {
    display: flex;
    width: 100%;
    align-items: center;
    gap: var(--space-2);
    cursor: text;
    min-width: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--color-fg) 12%, transparent);
    transition: border-color 150ms ease, border-width 150ms ease;
    padding-bottom: 2px;
}

wc-quick-start .seat-name {
    flex: 1;
    width: 100%;
    background: transparent;
    border: 0;
    outline: 0 !important;
    box-shadow: none !important;
    -webkit-tap-highlight-color: transparent;
    color: var(--color-fg);
    font-size: 15px;
    font-weight: 500;
    padding: 0;
    margin: 0;
    min-width: 0;
    appearance: none;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}

wc-quick-start .seat-name:focus,
wc-quick-start .seat-name:focus-visible {
    outline: 0 !important;
    box-shadow: none !important;
}

wc-quick-start .seat-name::selection {
    background: color-mix(in srgb, var(--color-fg) 12%, transparent);
    color: inherit;
}

wc-quick-start .seat-name-pencil {
    opacity: 0.3;
    line-height: 0;
    flex-shrink: 0;
    transition: opacity 150ms ease;
}

wc-quick-start .seat-name-wrap:hover .seat-name-pencil {
    opacity: 0.7;
}

wc-quick-start .seat-name-pencil.hide-on-focus {
    display: none;
}

wc-quick-start .seat-char-count {
    font-size: 11px;
    font-family: var(--font-mono);
    flex-shrink: 0;
}

wc-quick-start .seat-pill {
    display: inline-flex;
    flex-wrap: nowrap;
    border-radius: var(--radius-pill);
    background: color-mix(in srgb, var(--color-fg) 5%, transparent);
    padding: 3px;
    font-size: 12px;
    font-weight: 500;
    flex-shrink: 0;
    border: 1px solid color-mix(in srgb, var(--color-fg) 8%, transparent);
}

wc-quick-start .seat-half,
wc-quick-start .seat-add {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: var(--radius-pill);
    border: 0;
    cursor: pointer;
    transition: opacity 150ms ease, background-color 150ms ease, color 150ms ease;
}

wc-quick-start .seat-half--inactive,
wc-quick-start .seat-add {
    background: transparent;
    opacity: 0.55;
}

wc-quick-start .seat-half--inactive:hover,
wc-quick-start .seat-add:hover {
    opacity: 0.9;
}

wc-quick-start .seat-remove {
    cursor: pointer;
    background: transparent;
    border: 0;
    padding: 4px;
    opacity: 0.3;
    transition: opacity 150ms ease;
    flex-shrink: 0;
}

wc-quick-start .seat-remove:hover {
    opacity: 0.6;
}
/* ============================================================
   wc-settings — settings overlay + settings icon trigger
   ============================================================ */

#settings-overlay .settings-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

#settings-overlay .settings-title-wrap {
    padding: var(--space-2) var(--space-3) 0;
    text-align: center;
}

#settings-overlay .settings-title {
    font-family: var(--font-display);
    font-size: 40px;
    line-height: 1;
    letter-spacing: -0.025em;
    margin: 0;
}

#settings-overlay .settings-groups {
    padding: var(--space-4) var(--space-2);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
}

#settings-overlay .settings-group-card {
    padding: 0 14px;
}

#settings-overlay .settings-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
}

#settings-overlay .settings-row--bordered {
    border-bottom: 1px solid color-mix(in srgb, var(--color-fg) 5%, transparent);
}

#settings-overlay .settings-row-label {
    font-size: 14px;
    cursor: pointer;
}

/* Toggle switch — wired via :has() / :checked + sibling */
#settings-overlay .toggle-input {
    display: none;
}

#settings-overlay .toggle-track {
    width: 40px;
    height: 22px;
    background: color-mix(in srgb, var(--color-fg) 20%, transparent);
    border-radius: var(--radius-pill);
    display: flex;
    align-items: center;
    padding: 2px;
    cursor: pointer;
    transition: background-color 150ms ease, justify-content 150ms ease;
}

#settings-overlay .toggle-input:checked + .toggle-track {
    background: var(--color-fg);
    justify-content: flex-end;
}

#settings-overlay .toggle-knob {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--color-bg);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Theme picker tiles */
#settings-overlay .theme-row {
    display: flex;
    gap: 10px;
    padding: 10px 0;
}

#settings-overlay .theme-tile-wrap {
    flex: 1;
    cursor: pointer;
}

#settings-overlay .theme-tile-input {
    display: none;
}

#settings-overlay .theme-tile {
    aspect-ratio: 1.4 / 1;
    border-radius: var(--radius-lg);
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border: 1.5px solid transparent;
    transition: border-color 150ms ease;
}

#settings-overlay .theme-tile-input:checked + .theme-tile {
    border-color: var(--color-fg);
}

#settings-overlay .theme-tile-glyph {
    font-family: var(--font-display);
    font-size: 20px;
    line-height: 1;
}

#settings-overlay .theme-tile-label {
    font-size: 11px;
}

/* Bot vibe picker */
#settings-overlay .bot-pool-list {
    display: flex;
    flex-direction: column;
}

#settings-overlay .bot-pool-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    cursor: pointer;
}

#settings-overlay .bot-pool-row + .bot-pool-row {
    border-top: 1px solid color-mix(in srgb, var(--color-fg) 5%, transparent);
}

#settings-overlay .bot-pool-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    padding-right: var(--space-3);
}

#settings-overlay .bot-pool-name {
    font-size: 14px;
}

#settings-overlay .bot-pool-sample {
    font-size: 11px;
    opacity: 0.5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

#settings-overlay .bot-pool-dot {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1.5px solid color-mix(in srgb, var(--color-fg) 30%, transparent);
    flex-shrink: 0;
    transition: background-color 150ms ease, border-color 150ms ease;
}

#settings-overlay .bot-pool-input:checked + .bot-pool-dot {
    border-color: var(--color-fg);
    background: var(--color-fg);
}

/* God mode hint (debug section, localhost-only) */
#settings-overlay .god-mode-hint {
    font-size: 11px;
    opacity: 0.55;
    padding: 0 0 10px;
    line-height: 1.4;
}

/* About rows */
#settings-overlay .about-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: 10px 0;
}

#settings-overlay .about-row {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
}

#settings-overlay .about-row--separator {
    border-top: 1px solid color-mix(in srgb, var(--color-fg) 5%, transparent);
    padding-top: var(--space-2);
    margin-top: var(--space-1);
}

#settings-overlay .about-key {
    opacity: 0.5;
}

#settings-overlay .about-value-mono {
    font-family: var(--font-mono);
}

#settings-overlay .about-link {
    opacity: 0.7;
    transition: opacity 150ms ease;
}

#settings-overlay .about-link:hover {
    opacity: 1;
}
/* ============================================================
   wc-game-end — V2 Highlights Reel
   Scoped end-screen tokens (independent of app's --color-bg so
   the end screen can keep its own warm dark/light palette).
   ============================================================ */

wc-game-end .ge-screen {
    --ge-bg: #ede4d3;
    --ge-fg: #1f1a14;
    --ge-fg-mute: rgba(31, 26, 20, 0.62);
    --ge-fg-faint: rgba(31, 26, 20, 0.42);
    --ge-ring: rgba(31, 26, 20, 0.20);
    --ge-surface: rgba(255, 250, 240, 0.55);
    --ge-surface-border: rgba(31, 26, 20, 0.08);
    --ge-cta-bg: #1a1410;
    --ge-cta-fg: #ede4d3;
    --ge-glow-tint: rgba(217, 148, 84, 0.24);

    position: fixed;
    inset: 0;
    z-index: 50;
    background: var(--ge-bg);
    color: var(--ge-fg);
    font-family: var(--font-sans);
    overflow: hidden;
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
    display: flex;
    flex-direction: column;
}

.dark wc-game-end .ge-screen {
    --ge-bg: #1a1410;
    --ge-fg: #ebe3d6;
    --ge-fg-mute: rgba(235, 227, 214, 0.62);
    --ge-fg-faint: rgba(235, 227, 214, 0.40);
    --ge-ring: rgba(235, 227, 214, 0.18);
    --ge-surface: rgba(235, 227, 214, 0.05);
    --ge-surface-border: rgba(235, 227, 214, 0.10);
    --ge-cta-bg: #ecdfd0;
    --ge-cta-fg: #1a1410;
    --ge-glow-tint: rgba(217, 118, 68, 0.22);
}

wc-game-end .ge-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(70% 50% at 50% 30%, var(--ge-glow-tint), transparent 70%);
    pointer-events: none;
    z-index: 0;
    animation: geGlowPulse 3s ease-in-out infinite;
}

wc-game-end .ge-confetti {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 1;
}

wc-game-end .ge-confetti-piece {
    position: absolute;
    top: 0;
    will-change: transform, opacity;
    animation-name: geConfettiFall;
    animation-timing-function: cubic-bezier(0.3, 0.05, 0.7, 1);
    animation-iteration-count: infinite;
}

wc-game-end .ge-inner {
    position: relative;
    z-index: 2;
    flex: 1;
    width: 100%;
    max-width: var(--frame-max-w);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    min-height: 100%;
}

/* ---------- Header (Home pill + Share icon) ---------- */

wc-game-end .ge-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 16px 0;
}

wc-game-end .ge-home-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px 8px 10px;
    border-radius: 999px;
    background: transparent;
    border: 1px solid var(--ge-ring);
    color: var(--ge-fg);
    font-family: inherit;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    height: 36px;
    transition: transform 120ms ease, background-color 120ms ease;
}

wc-game-end .ge-home-pill:hover {
    transform: translateY(-1px);
    background: color-mix(in srgb, var(--ge-fg) 4%, transparent);
}

wc-game-end .ge-home-pill:active {
    transform: translateY(0);
}

wc-game-end .ge-icon-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: transparent;
    border: 1px solid var(--ge-ring);
    color: var(--ge-fg-mute);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    transition: transform 120ms ease, background-color 120ms ease;
}

wc-game-end .ge-icon-btn:hover {
    transform: translateY(-1px);
    background: color-mix(in srgb, var(--ge-fg) 4%, transparent);
}

wc-game-end .ge-icon-btn:active {
    transform: translateY(0);
}

wc-game-end .ge-icon-btn.ge-busy {
    opacity: 0.5;
    cursor: progress;
}

/* ---------- Hero (compact pawn + eyebrow + headline) ---------- */

wc-game-end .ge-hero {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 24px 22px 6px;
}

wc-game-end .ge-hero-pawn {
    position: relative;
    width: 78px;
    height: 92px;
    flex-shrink: 0;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}

wc-game-end .ge-pawn-shadow {
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 56px;
    height: 6px;
    background: rgba(0, 0, 0, 0.55);
    border-radius: 50%;
    filter: blur(5px);
    transform-origin: center;
    animation: gePawnShadowPulse 2.6s ease-in-out infinite;
}

wc-game-end .ge-pawn-bob {
    position: relative;
    transform-origin: center bottom;
    animation: gePawnBob 2.6s ease-in-out infinite;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.25));
}

wc-game-end .ge-hero-text {
    min-width: 0;
}

wc-game-end .ge-eyebrow {
    font-size: 10.5px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ge-fg-faint);
    font-weight: 600;
}

wc-game-end .ge-headline {
    margin-top: 4px;
    font-family: var(--font-display);
    font-size: 36px;
    line-height: 1;
    letter-spacing: -0.01em;
    color: var(--ge-fg);
    font-weight: 400;
}

/* ---------- Highlight cards ---------- */

wc-game-end .ge-cards {
    padding: 14px 14px 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

wc-game-end .ge-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: var(--ge-surface);
    border: 1px solid var(--ge-surface-border);
    border-left-width: 3px;
    border-radius: 14px;
}

/* Border-left color picks up the player seat color. Specificity beats
   the generic \`wc-game-end .ge-card\` border-left shorthand above. */
wc-game-end .ge-card.player-border-0 { border-left-color: hsl(var(--player-0)); }
wc-game-end .ge-card.player-border-1 { border-left-color: hsl(var(--player-1)); }
wc-game-end .ge-card.player-border-2 { border-left-color: hsl(var(--player-2)); }
wc-game-end .ge-card.player-border-3 { border-left-color: hsl(var(--player-3)); }

wc-game-end .ge-card-icon {
    width: 30px;
    height: 30px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

wc-game-end .ge-card-text {
    flex: 1;
    min-width: 0;
}

wc-game-end .ge-card-title {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--ge-fg);
    line-height: 1.2;
}

wc-game-end .ge-card-body {
    margin-top: 2px;
    font-size: 12px;
    line-height: 1.35;
    color: var(--ge-fg-mute);
    overflow: hidden;
    text-overflow: ellipsis;
}

wc-game-end .ge-card-stat {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 400;
    letter-spacing: -0.01em;
    color: var(--ge-fg);
    font-variant-numeric: tabular-nums;
    line-height: 1;
    flex-shrink: 0;
}

/* ---------- Play Store nudge (Android only) ---------- */

wc-game-end .ge-store {
    margin: 12px 14px 0;
    display: flex;
    align-items: center;
    gap: 12px;
    width: calc(100% - 28px);
    padding: 12px 14px;
    text-align: left;
    background: color-mix(in srgb, hsl(22 67% 56%) 12%, transparent);
    border: 1px solid color-mix(in srgb, hsl(22 67% 56%) 32%, transparent);
    border-radius: 14px;
    cursor: pointer;
    font-family: inherit;
    color: var(--ge-fg);
    transition: transform 120ms ease, background 120ms ease;
}

wc-game-end .ge-store:hover {
    transform: translateY(-1px);
    background: color-mix(in srgb, hsl(22 67% 56%) 18%, transparent);
}

wc-game-end .ge-store:active {
    transform: translateY(0);
}

wc-game-end .ge-store-icon {
    width: 30px;
    height: 30px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: hsl(22 72% 48%);
    background: color-mix(in srgb, hsl(22 67% 56%) 18%, transparent);
}

wc-game-end .ge-store-text {
    flex: 1;
    min-width: 0;
}

wc-game-end .ge-store-title {
    display: block;
    font-size: 13.5px;
    font-weight: 600;
    line-height: 1.2;
}

wc-game-end .ge-store-body {
    display: block;
    margin-top: 2px;
    font-size: 12px;
    line-height: 1.35;
    color: var(--ge-fg-mute);
}

wc-game-end .ge-store-action {
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 600;
    color: hsl(22 72% 48%);
}

/* ---------- Footer + CTA ---------- */

wc-game-end .ge-spacer {
    flex: 1;
}

wc-game-end .ge-footer {
    padding: 14px 14px 18px;
}

wc-game-end .ge-cta {
    width: 100%;
    height: 54px;
    border-radius: 27px;
    border: 0;
    background: var(--ge-cta-bg);
    color: var(--ge-cta-fg);
    font-family: inherit;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 120ms ease, opacity 120ms ease;
}

wc-game-end .ge-cta:hover {
    transform: translateY(-1px);
    opacity: 0.95;
}

wc-game-end .ge-cta:active {
    transform: translateY(0);
}

/* ---------- Keyframes ---------- */

@keyframes geConfettiFall {
    0%   { transform: translate3d(0, -10vh, 0) rotate(var(--ge-rot0, 0deg)); opacity: 0; }
    8%   { opacity: 1; }
    100% { transform: translate3d(var(--ge-drift, 20px), 110vh, 0) rotate(var(--ge-rot1, 540deg)); opacity: 1; }
}

@keyframes gePawnBob {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-8px); }
}

@keyframes gePawnShadowPulse {
    0%, 100% { transform: translateX(-50%) scaleX(1);   opacity: 0.5; }
    50%      { transform: translateX(-50%) scaleX(0.78); opacity: 0.32; }
}

@keyframes geGlowPulse {
    0%, 100% { opacity: 0.5; }
    50%      { opacity: 0.9; }
}

@media (prefers-reduced-motion: reduce) {
    wc-game-end .ge-confetti-piece,
    wc-game-end .ge-pawn-bob,
    wc-game-end .ge-pawn-shadow,
    wc-game-end .ge-glow {
        animation: none !important;
    }
}
/* ============================================================
   wc-dice — the dice element (lives in the active player's corner)
   ============================================================ */

wc-dice {
    display: block;
}

/* .die is the shared dice visual — used by the live wc-dice (id="dice") and
   by the faded last-roll copies rendered in idle corners (see
   wc-pause-menu.css .corner-dice--rolled). Class-based so both pick up the
   same light/dark theming. */
.die {
    width: 100%;
    height: 100%;
    border-radius: var(--radius-lg);
    aspect-ratio: 1 / 1;
    cursor: pointer;
    transition: all 200ms ease;
    overflow: hidden;
    background: linear-gradient(145deg, #faf8f5, #e8e4df);
    box-shadow:
        3px 3px 8px rgba(0, 0, 0, 0.25),
        -1px -1px 4px rgba(255, 255, 255, 0.8),
        inset 0 1px 0 rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(0, 0, 0, 0.08);
    padding: 14%;
}

.die .dice-face {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 10%;
}

.die .dice-face.hidden {
    display: none;
}

.die .dice-dot {
    border-radius: 50%;
    background: radial-gradient(circle at 40% 35%, #333, #111);
    box-shadow:
        inset 0 1px 2px rgba(0, 0, 0, 0.6),
        0 0.5px 0 rgba(255, 255, 255, 0.15);
}
/* ============================================================
   wc-token — single token (svg pawn) on the board
   ============================================================ */

/* The wc-token element is what scripts/render-logic.js
   updateTokenContainer animates with \`style.transform = translate(...)\`
   between cell positions, so this duration drives per-step movement
   speed. Match the pre-refactor Tailwind \`transition-transform\`
   utility (150ms, cubic-bezier(0.4, 0, 0.2, 1)) — anything longer
   makes the dice-to-cell hopping feel sluggish. */
wc-token {
    display: block;
    transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* The inner SVG keeps the old 300ms ease-out transition the markup
   used to declare directly — it isn't animated by render-logic today,
   but the slower curve is what the prior visual treatment expected
   for any future direct SVG transforms. */
wc-token svg {
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
    min-width: 100%;
    transition: transform 300ms ease-out;
    filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
}

/* God mode (debug, localhost-only) — selected pawn awaiting a target cell */
@keyframes god-selected-pulse {
    0%, 100% { filter: drop-shadow(0 0 4px #ff00ff) drop-shadow(0 0 8px #ff00ff); }
    50%      { filter: drop-shadow(0 0 10px #ff00ff) drop-shadow(0 0 16px #ff00ff); }
}
wc-token .god-selected {
    animation: god-selected-pulse 0.9s ease-in-out infinite;
}
/* ============================================================
   #pause-menu — overlay defined in index.html, populated by
   scripts/render-logic.js (renderPauseScoreboard).
   ============================================================ */

#pause-menu .pause-body {
    text-align: center;
}

#pause-menu .pause-body .body-helper {
    margin: 0 auto;
    max-width: none;
    padding-bottom: var(--space-8);
}

#pause-menu .pause-body .pause-scoreboard,
#pause-menu .pause-body .section-label,
#pause-menu .pause-body #pm-turn-count {
    text-align: left;
}

#pause-menu .pause-scoreboard {
    padding: 0 14px;
}

#pause-menu .pm-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) 0;
}

#pause-menu .pm-row + .pm-row {
    border-top: 1px solid color-mix(in srgb, var(--color-fg) 5%, transparent);
}

#pause-menu .pm-pawn {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
}

#pause-menu .pm-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

#pause-menu .pm-name-row {
    display: flex;
    align-items: center;
    min-width: 0;
}

#pause-menu .pm-name {
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

#pause-menu .pm-upnext {
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 500;
    opacity: 0.6;
    margin-left: 6px;
}

#pause-menu .pm-type {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: color-mix(in srgb, var(--color-fg) 60%, transparent);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 500;
    align-self: flex-start;
}

#pause-menu .pm-finish {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
}

#pause-menu .pm-finish-count {
    font-size: 14px;
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
}

#pause-menu .pm-finish-count-total {
    opacity: 0.4;
}

#pause-menu .pm-finish-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
}

#pause-menu .pm-finish-dot--idle {
    background: color-mix(in srgb, var(--color-fg) 15%, transparent);
}

/* ============================================================
   Corner widgets — pill + dice slot per active player
   (rendered by scripts/render-logic.js updateCornerWidgets)
   ============================================================ */

.corner-widget {
    display: flex;
    align-items: center;
    gap: var(--space-2);
}

.corner-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    border-radius: var(--radius-pill);
    padding: 7px 11px;
    height: 32px;
    box-sizing: border-box;
    border: 1px solid color-mix(in srgb, var(--color-fg) 10%, transparent);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Idle pill takes neutral surface colors. Background lives behind a
   :not() guard so .corner-pill--active + .player-bg-N can win without
   needing !important (both selectors share specificity 0,1,0). */
.corner-pill:not(.corner-pill--active) {
    background: var(--color-surface);
    color: var(--color-fg);
}

.corner-pill--active {
    color: #fff;
    border-color: transparent;
}

.corner-pill-glyph {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    opacity: 0.85;
}

.corner-pill-name {
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    max-width: 120px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.corner-dice {
    width: 56px;
    height: 56px;
    box-sizing: border-box;
    border-radius: var(--radius-2xl);
    display: flex;
    align-items: center;
    justify-content: center;
}

.corner-dice--idle {
    opacity: 0.4;
}

.corner-dice--active {
    padding: 6px;
}

/* Idle corner showing the player's last roll. The inner .die carries the
   exact live-dice visual (light + dark themes); this wrapper fades it and
   adds a player-colored ring (muted by the wrapper opacity) so a quick
   forfeit / no-move turn still leaves the last roll readable and you can
   tell whose it is. padding + border match the active die's footprint so
   the faded die isn't visually larger (active uses 6px padding;
   here 4px padding + 2px border = same 44px inner die). */
.corner-dice--rolled {
    opacity: 0.5;
    padding: 4px;
    /* width/style only — color comes from player-border-N. Using the \`border\`
       shorthand here would reset border-color to currentColor and clobber it. */
    border-width: 2px;
    border-style: solid;
}

.corner-dice--rolled .die {
    cursor: default;
}

/* ── Inactive player slot (2-player / 3-player modes) ── */
.corner-widget--inactive {
    pointer-events: none;
    opacity: 1;
}

.corner-dice--not-playing {
    width: 56px;
    height: 56px;
    box-sizing: border-box;
    border-radius: var(--radius-2xl);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.22;
}

.corner-pill--not-playing {
    display: flex;
    align-items: center;
    gap: 5px;
    border-radius: var(--radius-pill);
    padding: 7px 10px;
    height: 32px;
    box-sizing: border-box;
    background: transparent;
    border: 1px dashed color-mix(in srgb, var(--color-fg) 20%, transparent);
    opacity: 0.55;
}

.corner-pill-not-playing-icon {
    font-size: 11px;
    line-height: 1;
    opacity: 0.7;
}

.corner-pill-not-playing-text {
    font-size: 11px;
    font-weight: 500;
    line-height: 1;
    color: var(--color-fg);
    opacity: 0.65;
    white-space: nowrap;
}

html,body{height:100%;margin:0;padding:0;overflow:hidden;}
#root{height:100dvh;overflow:auto;}

/* ============================================================
   ENTRY SCREEN PREMIUM UI OVERRIDES
   Only visual/layout — zero logic changes
   ============================================================ */

/* ── Home hero: more breathable spacing ── */
wc-quick-start .home-frame {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 100%;
}

wc-quick-start .home-hero {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 12px var(--space-6) var(--space-6);
    gap: 0;
}

/* ── Dice icon: premium floating glow ── */
wc-quick-start .home-die {
    padding: 18px;
    border-radius: 28px;
    background: rgba(124, 58, 237, 0.12);
    border: 1.5px solid rgba(167, 139, 250, 0.4);
    --pulse-color: rgba(124, 58, 237, 0.4);
    margin-bottom: var(--space-6);
    box-shadow:
        0 0 50px rgba(124, 58, 237, 0.4),
        0 20px 70px rgba(124, 58, 237, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
    animation: home-float 3.2s ease-in-out infinite, home-die-glow 3.2s ease-in-out infinite;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

@keyframes home-die-pulse {
    0%,100% { box-shadow: 0 0 50px rgba(124,58,237,0.4), 0 20px 70px rgba(124,58,237,0.25); }
    50%      { box-shadow: 0 0 70px rgba(124,58,237,0.65), 0 24px 90px rgba(124,58,237,0.45); }
}

@keyframes home-float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-9px); }
}

@keyframes home-die-glow {
    0%, 100% {
        box-shadow: 0 0 50px rgba(124,58,237,0.4), 0 20px 70px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.12);
    }
    50% {
        box-shadow: 0 0 75px rgba(124,58,237,0.68), 0 28px 90px rgba(124,58,237,0.48), inset 0 1px 0 rgba(255,255,255,0.2);
    }
}

/* ── Title: premium glowing gradient ── */
wc-quick-start .home-title {
    font-size: clamp(64px, 20vw, 82px);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 0.9;
    margin: 0;
    background: linear-gradient(150deg, #ffffff 0%, #EDE9FE 45%, #C4B5FD 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 32px rgba(167, 139, 250, 0.6));
}

/* ── Tagline: a touch more visible ── */
wc-quick-start .home-tagline {
    margin: var(--space-4) 0 0;
    font-size: 15px;
    line-height: 1.55;
    opacity: 0.55;
    max-width: 240px;
    font-weight: 400;
}

/* ── Brand chip: purple-tinted glass ── */
wc-quick-start .home-brand-chip {
    background: rgba(124, 58, 237, 0.12);
    border: 1px solid rgba(124, 58, 237, 0.25);
    border-radius: var(--radius-pill);
}

/* ── Resume card: glass + purple left accent ── */
wc-quick-start .resume-card {
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.10);
    background: rgba(255,255,255,0.05);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding: 16px;
    gap: 14px;
    border-left: 3px solid rgba(124, 58, 237, 0.6);
    box-shadow: 0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06);
    transition: background 150ms ease, box-shadow 150ms ease;
}

wc-quick-start .resume-card:hover {
    background: rgba(255,255,255,0.08);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
}

wc-quick-start .resume-eyebrow {
    font-size: 10px;
    letter-spacing: 0.18em;
    font-weight: 700;
    opacity: 0;
    height: 0;
    overflow: hidden;
    padding: 0;
}

wc-quick-start .resume-title {
    font-size: 15px;
    font-weight: 600;
}

wc-quick-start .resume-sub {
    font-size: 12.5px;
    opacity: 0.5;
    margin-top: 3px;
}

/* ── Resume row + version: cleaner spacing ── */
wc-quick-start .home-resume-row {
    padding: 0 0 var(--space-2);
}

wc-quick-start .home-version {
    font-size: 11px;
    opacity: 0.25;
    letter-spacing: 0.1em;
    margin-top: 4px;
}

/* ── Frame footer: more breathing room ── */
.frame-footer {
    padding-top: var(--space-5);
    padding-bottom: var(--space-4);
    gap: 12px;
}

/* ── CTA primary: slightly taller, stronger presence ── */
.cta-primary {
    height: 58px;
    border-radius: 30px;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.02em;
    box-shadow:
        0 10px 28px -6px rgba(124,58,237,0.55),
        inset 0 1px 0 rgba(255,255,255,0.15);
    transition: opacity 150ms ease, box-shadow 150ms ease, transform 100ms ease;
}

.cta-primary:active {
    transform: scale(0.98);
    box-shadow:
        0 4px 14px -4px rgba(124,58,237,0.4),
        inset 0 1px 0 rgba(255,255,255,0.1);
}

/* ── Setup screen: "Who's playing?" ── */
wc-quick-start .setup-body {
    text-align: center;
    padding-top: var(--space-2);
}

wc-quick-start .setup-body .display-title {
    text-align: center;
    font-size: 34px;
    letter-spacing: -0.025em;
    background: linear-gradient(150deg, #ffffff 30%, #C4B5FD 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

wc-quick-start .setup-helper {
    font-size: 13.5px;
    opacity: 0.45;
    padding: var(--space-2) var(--space-2) var(--space-6);
    line-height: 1.5;
}

/* ── Seat rows: glass cards with subtle left accent ── */
wc-quick-start .seat-list {
    gap: 10px;
}

wc-quick-start .seat-row {
    background: rgba(255,255,255,0.055);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 18px;
    padding: 12px 14px;
    gap: 12px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06);
    transition: opacity 150ms ease, background 150ms ease;
}

wc-quick-start .seat-row-empty {
    background: rgba(255,255,255,0.02);
    border: 1px dashed rgba(124,58,237,0.25);
    border-radius: 18px;
    padding: 12px 14px;
    gap: 12px;
    transition: background 150ms ease, border-color 150ms ease;
}

wc-quick-start .seat-row-empty:hover {
    background: rgba(124,58,237,0.06);
    border-color: rgba(124,58,237,0.45);
}

/* ── Seat pawn avatar: more prominent ── */
wc-quick-start .seat-color-cycle {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

/* ── Player type pill: Human/Bot toggle ── */
wc-quick-start .seat-pill {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: var(--radius-pill);
    padding: 3px;
    gap: 0;
}

wc-quick-start .seat-half {
    border-radius: var(--radius-pill);
    font-size: 11.5px;
    font-weight: 600;
    padding: 5px 11px;
    letter-spacing: 0.01em;
}

wc-quick-start .seat-half--inactive {
    opacity: 0.45;
    background: transparent;
}

/* Active seat half: purple tint */
wc-quick-start .seat-half:not(.seat-half--inactive) {
    background: rgba(124,58,237,0.22);
    color: #C4B5FD;
    opacity: 1;
}

wc-quick-start .seat-empty-title {
    font-size: 15px;
    font-weight: 500;
    opacity: 0.5;
}

wc-quick-start .seat-empty-sub {
    font-size: 12px;
    opacity: 0.35;
    margin-top: 2px;
}

/* ── Seat name input: cleaner underline ── */
wc-quick-start .seat-name-wrap {
    border-bottom: 1px solid rgba(255,255,255,0.10);
}

wc-quick-start .seat-name-wrap:focus-within {
    border-bottom-color: rgba(124,58,237,0.6);
    border-bottom-width: 2px;
}

wc-quick-start .seat-name {
    font-size: 15px;
    font-weight: 500;
}

/* ── Remove button: cleaner ── */
wc-quick-start .seat-remove {
    opacity: 0.25;
    border-radius: 50%;
    transition: opacity 150ms ease, background 150ms ease;
}

wc-quick-start .seat-remove:hover {
    opacity: 0.7;
    background: rgba(255,80,80,0.12);
}

/* ── Section divider in footer ── */
wc-quick-start .home-version {
    text-align: center;
}

/* ============================================================
   GLASSMORPHISM OVERRIDES — Main App Design System
   ============================================================ */
.dark {
    --color-bg: #080808;
    --color-fg: #ffffff;
    --color-surface: rgba(255, 255, 255, 0.06);
    --color-surface-hover: rgba(255, 255, 255, 0.10);
    --color-border: rgba(255, 255, 255, 0.10);
    --color-board-cell: rgba(255, 255, 255, 0.04);
    --color-board-border: rgba(255, 255, 255, 0.12);
    --color-safe: rgba(124, 58, 237, 0.12);
    --cta-bg: #7C3AED;
    --cta-fg: #ffffff;
}
.dark body,
.dark #pause-menu,
.dark #settings-overlay {
    background-image:
        radial-gradient(ellipse 90% 55% at 50% 0%,
            rgba(124, 58, 237, 0.32) 0%,
            rgba(109, 40, 217, 0.16) 40%,
            transparent 72%),
        radial-gradient(ellipse 60% 35% at 80% 90%,
            rgba(16, 185, 129, 0.10) 0%,
            transparent 65%),
        radial-gradient(ellipse 50% 30% at 15% 75%,
            rgba(220, 38, 38, 0.07) 0%,
            transparent 60%);
}
.cta-primary {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: opacity 150ms ease, transform 150ms ease;
}
.dark .cta-primary {
    background: linear-gradient(135deg, rgba(124, 58, 237, 0.18) 0%, rgba(91, 33, 182, 0.24) 100%);
    border: 1.5px solid rgba(167, 139, 250, 0.55);
    box-shadow:
        0 0 24px rgba(124, 58, 237, 0.45),
        0 8px 40px rgba(124, 58, 237, 0.32),
        inset 0 1px 0 rgba(255, 255, 255, 0.18),
        inset 0 -1px 0 rgba(124, 58, 237, 0.2);
    color: #ffffff;
    text-shadow: 0 0 18px rgba(196, 181, 253, 0.75);
    animation: btn-glow-purple 3s ease-in-out infinite;
}
.cta-primary:hover { transform: translateY(-1px); }
.cta-primary:active { transform: translateY(0); }
.cta-primary:disabled { transform: none; }
.cta-secondary {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transition: background-color 150ms ease, transform 150ms ease;
}
.dark .cta-secondary {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #ffffff;
}
.cta-secondary:hover { transform: translateY(-1px); }
.cta-secondary:active { transform: translateY(0); }
.dark .cta-green {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.20) 100%);
    border: 1.5px solid rgba(52, 211, 153, 0.55);
    box-shadow:
        0 0 24px rgba(16, 185, 129, 0.45),
        0 8px 40px rgba(16, 185, 129, 0.28),
        inset 0 1px 0 rgba(255, 255, 255, 0.14),
        inset 0 -1px 0 rgba(16, 185, 129, 0.2);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    text-shadow: 0 0 18px rgba(52, 211, 153, 0.8);
    animation: btn-glow-green 3s ease-in-out infinite;
}
.dark .cta-red {
    background: linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(185, 28, 28, 0.20) 100%);
    border: 1.5px solid rgba(252, 165, 165, 0.5);
    box-shadow:
        0 0 24px rgba(220, 38, 38, 0.45),
        0 8px 40px rgba(220, 38, 38, 0.28),
        inset 0 1px 0 rgba(255, 255, 255, 0.14),
        inset 0 -1px 0 rgba(220, 38, 38, 0.2);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    text-shadow: 0 0 18px rgba(252, 165, 165, 0.75);
    animation: btn-glow-red 3s ease-in-out infinite;
}
/* ── Neon glow pulse keyframes ── */
@keyframes btn-glow-purple {
    0%,100% { box-shadow: 0 0 24px rgba(124,58,237,0.45), 0 8px 40px rgba(124,58,237,0.32), inset 0 1px 0 rgba(255,255,255,0.18); }
    50%      { box-shadow: 0 0 40px rgba(124,58,237,0.7),  0 8px 55px rgba(124,58,237,0.5),  inset 0 1px 0 rgba(255,255,255,0.24); }
}
@keyframes btn-glow-green {
    0%,100% { box-shadow: 0 0 24px rgba(16,185,129,0.45), 0 8px 40px rgba(16,185,129,0.28), inset 0 1px 0 rgba(255,255,255,0.14); }
    50%      { box-shadow: 0 0 40px rgba(16,185,129,0.7),  0 8px 55px rgba(16,185,129,0.45), inset 0 1px 0 rgba(255,255,255,0.22); }
}
@keyframes btn-glow-red {
    0%,100% { box-shadow: 0 0 24px rgba(220,38,38,0.45), 0 8px 40px rgba(220,38,38,0.28), inset 0 1px 0 rgba(255,255,255,0.14); }
    50%      { box-shadow: 0 0 40px rgba(220,38,38,0.7),  0 8px 55px rgba(220,38,38,0.45), inset 0 1px 0 rgba(255,255,255,0.22); }
}
/* ── Dark button hover/press animations ── */
.dark .cta-primary:hover {
    box-shadow: 0 0 44px rgba(124,58,237,0.7), 0 12px 56px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.22);
    transform: translateY(-2px);
    animation: none;
}
.dark .cta-primary:active {
    transform: scale(0.96) translateY(0);
    box-shadow: 0 0 20px rgba(124,58,237,0.5), 0 4px 22px rgba(124,58,237,0.35);
    animation: none;
}
.dark .cta-green:hover {
    box-shadow: 0 0 44px rgba(16,185,129,0.7), 0 12px 56px rgba(16,185,129,0.5), inset 0 1px 0 rgba(255,255,255,0.20);
    transform: translateY(-2px);
    animation: none;
}
.dark .cta-green:active {
    transform: scale(0.96) translateY(0);
    box-shadow: 0 0 20px rgba(16,185,129,0.5), 0 4px 22px rgba(16,185,129,0.35);
    animation: none;
}
.dark .cta-red:hover {
    box-shadow: 0 0 44px rgba(220,38,38,0.7), 0 12px 56px rgba(220,38,38,0.5), inset 0 1px 0 rgba(255,255,255,0.20);
    transform: translateY(-2px);
    animation: none;
}
.dark .cta-red:active {
    transform: scale(0.96) translateY(0);
    box-shadow: 0 0 20px rgba(220,38,38,0.5), 0 4px 22px rgba(220,38,38,0.35);
    animation: none;
}
.icon-btn {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transition: background-color 150ms ease, transform 150ms ease;
}
.dark .icon-btn {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.10);
}
.icon-btn:hover { transform: translateY(-1px); }
.icon-btn:active { transform: translateY(0); }
.surface-card {
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
}
.dark .surface-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.10);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
.dark .frame-overlay {
    background: rgba(8, 8, 8, 0.88);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
}
.dark wc-quick-start .seat-row {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.10);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
.dark wc-quick-start .seat-row-empty {
    background: rgba(255, 255, 255, 0.02);
    border: 1px dashed rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
}
.dark wc-quick-start .resume-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.10);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
.dark wc-quick-start .resume-play {
    background: rgba(124, 58, 237, 0.85);
    border: 1px solid rgba(167, 139, 250, 0.30);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
}
.dark .corner-pill:not(.corner-pill--active) {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.10);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
}
.dark wc-game-end .ge-screen {
    --ge-bg: #080808;
    --ge-fg: #ffffff;
    --ge-fg-mute: rgba(255, 255, 255, 0.62);
    --ge-fg-faint: rgba(255, 255, 255, 0.40);
    --ge-ring: rgba(255, 255, 255, 0.12);
    --ge-surface: rgba(255, 255, 255, 0.05);
    --ge-surface-border: rgba(255, 255, 255, 0.10);
    --ge-cta-bg: #7C3AED;
    --ge-cta-fg: #ffffff;
    --ge-glow-tint: rgba(124, 58, 237, 0.28);
    background-image: radial-gradient(ellipse 90% 55% at 50% 5%,
        rgba(124, 58, 237, 0.22) 0%,
        rgba(109, 40, 217, 0.08) 50%,
        transparent 80%);
}
.dark wc-game-end .ge-card {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
}
.dark wc-game-end .ge-cta {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.92) 0%, rgba(109, 40, 217, 0.96) 100%);
    border: 1px solid rgba(167, 139, 250, 0.30);
    box-shadow: 0 8px 32px rgba(124, 58, 237, 0.45), 0 1px 0 rgba(255, 255, 255, 0.14) inset;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}
.dark wc-game-end .ge-home-pill {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    background: rgba(255, 255, 255, 0.05);
}
.dark wc-game-end .ge-icon-btn {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    background: rgba(255, 255, 255, 0.05);
}
</style>
</head>
<body>
<div id="root" class="page">
  <div id="game-container" style="width:100%;max-width:var(--frame-max-w);">
    <wc-quick-start id="main-menu"></wc-quick-start>
    <wc-board id="game" class="hidden"></wc-board>
  </div>
</div>
<div id="pause-menu" class="frame-overlay hidden">
  <div class="frame">
    <div class="top-bar">
      <div class="icon-btn-spacer"></div>
      <div class="top-bar-title"></div>
      <div class="icon-btn-spacer"></div>
    </div>
    <div class="frame-body pause-body">
      <h2 class="display-title">Take a breather</h2>
      <p class="body-helper">The board's right where you left it.<br>Resume when you're ready, or bow out to the menu.</p>
      <div style="padding:16px 0;display:flex;flex-direction:column;gap:24px;">
        <div>
          <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:8px;">
            <div class="section-label">Standings</div>
            <div id="pm-turn-count" class="section-label">Turn 0</div>
          </div>
          <div id="pm-scoreboard" class="surface-card pause-scoreboard"></div>
        </div>
      </div>
    </div>
    <div class="frame-footer">
      <button id="pm-resume" class="cta-primary">Resume</button>
      <button class="restart-game cta-secondary">Exit to menu</button>
    </div>
  </div>
</div>
<script type="module">
// attached_assets/leludo-main/leludo-main/version.js
var VERSION = "0.19.1";

// attached_assets/leludo-main/leludo-main/components/utils.js
function htmlToElement(html) {
  const element = document.createElement("template");
  element.innerHTML = html;
  return element.content;
}

// attached_assets/leludo-main/leludo-main/scripts/game-logic.js
var SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];
var HUMAN_PREFERRED_POSITIONS = [2, 0, 1, 3];
function isTokenMovable(tokenPosition, diceRoll) {
  if (diceRoll === 6 && tokenPosition === -1) {
    return true;
  }
  return tokenPosition >= 0 && tokenPosition + diceRoll <= 56;
}
function getMarkIndex(playerIndex, tokenPosition) {
  if (tokenPosition === -1 || tokenPosition > 50) {
    return void 0;
  }
  return (tokenPosition + 13 * playerIndex) % 52;
}
function isSafePosition(tokenPosition) {
  return SAFE_SQUARES.includes(tokenPosition) || tokenPosition > 50;
}
var __hackNextDice = null;
function generateDiceRoll(randomFn = Math.random) {
  if (__hackNextDice !== null && __hackNextDice !== undefined) {
    var __v = __hackNextDice;
    __hackNextDice = null;
    return __v;
  }
  const weights = [1, 2, 2, 1, 2, 2];
  const cumulativeWeights = weights.map(/* @__PURE__ */ ((sum) => (value) => sum += value)(0));
  const maxWeight = cumulativeWeights[cumulativeWeights.length - 1];
  const randomValue = randomFn() * maxWeight;
  return cumulativeWeights.findIndex((cw) => randomValue < cw) + 1;
}
function getTokenNewPosition(currentPosition, diceRoll) {
  if (currentPosition === -1) {
    return 0;
  }
  return currentPosition + diceRoll;
}
function findCapturedOpponents(playerIndex, tokenPosition, tokenPositions) {
  if (isSafePosition(tokenPosition)) {
    return [];
  }
  const tokenMarkIndex = getMarkIndex(playerIndex, tokenPosition);
  const otherPlayerTokensOnThatMarkIndex = new Array(4);
  for (let pi = 0; pi < tokenPositions.length; pi++) {
    const ptp = tokenPositions[pi];
    otherPlayerTokensOnThatMarkIndex[pi] = [];
    if (ptp && pi !== playerIndex) {
      for (let ti = 0; ti < ptp.length; ti++) {
        const tp = ptp[ti];
        const tMarkIndex = getMarkIndex(pi, tp);
        if (tokenMarkIndex === tMarkIndex) {
          otherPlayerTokensOnThatMarkIndex[pi].push(ti);
        }
      }
    }
  }
  for (let pi = 0; pi < otherPlayerTokensOnThatMarkIndex.length; pi++) {
    const pt = otherPlayerTokensOnThatMarkIndex[pi];
    if (pt.length === 2) {
      otherPlayerTokensOnThatMarkIndex[pi] = [];
    }
  }
  return otherPlayerTokensOnThatMarkIndex;
}
function isTripComplete(tokenPosition) {
  return tokenPosition === 56;
}
function getPlayerTypes(quickStartId) {
  const parts = quickStartId.split(",");
  const humanCount = +parts[1];
  const botCount = +parts[2];
  if (humanCount === 4) {
    return {
      playerTypes: ["PLAYER", "PLAYER", "PLAYER", "PLAYER"],
      colorMap: [0, 1, 2, 3]
    };
  }
  const humanColors = parts.slice(3, 3 + humanCount).filter((s) => s !== "").map(Number);
  const botColors = parts.slice(3 + humanCount, 3 + humanCount + botCount).filter((s) => s !== "").map(Number);
  const preferredPositions = HUMAN_PREFERRED_POSITIONS;
  const playerTypes2 = new Array(4).fill(void 0);
  const colorMap = new Array(4).fill(-1);
  const usedColors = /* @__PURE__ */ new Set();
  const usedPositions = /* @__PURE__ */ new Set();
  humanColors.forEach((color, i) => {
    const pos = preferredPositions[i];
    playerTypes2[pos] = "PLAYER";
    colorMap[pos] = color;
    usedColors.add(color);
    usedPositions.add(pos);
  });
  const haveBotColors = botColors.length === botCount && botCount > 0;
  const remainingColors = [0, 1, 2, 3].filter((c) => !usedColors.has(c));
  let botIdx = 0;
  let leftoverIdx = 0;
  for (let pos = 0; pos < 4 && botIdx < botCount; pos++) {
    if (!usedPositions.has(pos)) {
      playerTypes2[pos] = "BOT";
      const color = haveBotColors ? botColors[botIdx] : remainingColors[leftoverIdx++];
      colorMap[pos] = color;
      usedColors.add(color);
      usedPositions.add(pos);
      botIdx++;
    }
  }
  const fillColors = [0, 1, 2, 3].filter((c) => !usedColors.has(c));
  let fillIdx = 0;
  for (let pos = 0; pos < 4; pos++) {
    if (colorMap[pos] === -1) {
      colorMap[pos] = fillColors[fillIdx++];
    }
  }
  return { playerTypes: playerTypes2, colorMap };
}
function getUniqueTokenPositions(playerIndex, movableTokenIndexes, playerTokenPositions) {
  const tokenIndexPositions = movableTokenIndexes.map((movableTokenIndex) => {
    return playerTokenPositions[playerIndex][movableTokenIndex];
  });
  return new Set(tokenIndexPositions);
}

// attached_assets/leludo-main/leludo-main/scripts/turn-rules.js
function isPlayerFinished(tokenPositions) {
  return tokenPositions.every((tp) => tp === 56);
}
function allTokensInHome(tokenPositions) {
  return tokenPositions.every((p) => p === -1);
}
function getFinishedCount(tokenPositions) {
  if (!tokenPositions) return 0;
  return tokenPositions.filter((p) => p === 56).length;
}
function selectStartingPlayer(playerTypes2) {
  return playerTypes2.includes("PLAYER") ? 2 : playerTypes2.findIndex((t) => t !== void 0);
}
function getNextPlayerIndex(currentIndex, playerTypes2, playerTokenPositions) {
  for (let k = 1; k <= 4; k++) {
    const j = (currentIndex + k) % 4;
    if (playerTypes2[j] === void 0) continue;
    if (!playerTokenPositions[j]) continue;
    if (isPlayerFinished(playerTokenPositions[j])) continue;
    return j;
  }
  return -1;
}
function shouldEndGame(playerTypes2, playerTokenPositions) {
  let numberOfRemainingPlayers = 0;
  let remainingHumans = 0;
  let hasAnyHuman = false;
  playerTypes2.forEach((playerType, playerIndex) => {
    if (!playerType) return;
    if (playerType === "PLAYER") hasAnyHuman = true;
    if (!playerTokenPositions[playerIndex] || !isPlayerFinished(playerTokenPositions[playerIndex])) {
      numberOfRemainingPlayers++;
      if (playerType === "PLAYER") remainingHumans++;
    }
  });
  const allHumansDoneVsBots = hasAnyHuman && remainingHumans === 0 && numberOfRemainingPlayers > 0;
  return numberOfRemainingPlayers <= 1 || allHumansDoneVsBots;
}
function computeLeftoverRankOrder(playerTypes2, playerTokenPositions, playerRanks2) {
  const leftover = [];
  playerTypes2.forEach((playerType, playerIndex) => {
    if (playerType && playerRanks2[playerIndex] === 0) leftover.push(playerIndex);
  });
  leftover.sort((a, b) => {
    const fa = getFinishedCount(playerTokenPositions[a]);
    const fb = getFinishedCount(playerTokenPositions[b]);
    if (fb !== fa) return fb - fa;
    const sa = playerTokenPositions[a].reduce((s, p) => s + (p < 0 ? 0 : p), 0);
    const sb = playerTokenPositions[b].reduce((s, p) => s + (p < 0 ? 0 : p), 0);
    return sb - sa;
  });
  return leftover;
}
function serializeGameState({
  quickStartId,
  playerNames: playerNames2,
  playerTypes: playerTypes2,
  botPersonalities: botPersonalities2,
  playerTokenPositions,
  currentPlayerIndex,
  currentDiceRoll,
  consecutiveSixesCount,
  playerCaptures: playerCaptures2,
  playerRanks: playerRanks2,
  playerTimes: playerTimes2,
  lastRank,
  gameStartedAt,
  turnCount: turnCount2
}) {
  return {
    quickStartId,
    playerNamesArr: playerNames2.slice(),
    playerTypesArr: playerTypes2.slice(),
    botPersonalitiesArr: botPersonalities2.slice(),
    positions: playerTokenPositions.map((p) => p ? p.slice() : null),
    currentPlayerIndex,
    currentDiceRoll,
    consecutiveSixesCount,
    capturesArr: playerCaptures2.slice(),
    ranksArr: playerRanks2.slice(),
    timesArr: playerTimes2.slice(),
    lastRank,
    gameStartedAt,
    turnCount: Number.isFinite(turnCount2) ? turnCount2 : 0
  };
}
function deserializeGameState(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (!Array.isArray(parsed.positions)) return null;
    return parsed;
  } catch {
    return null;
  }
}

// attached_assets/leludo-main/leludo-main/scripts/audio.js
var SOUND_MUTED_KEY = "sound-muted";
var _soundMuted = localStorage.getItem(SOUND_MUTED_KEY) === "true";
function isSoundMuted() {
  return _soundMuted;
}
function setSoundMuted(muted) {
  _soundMuted = !!muted;
  localStorage.setItem(SOUND_MUTED_KEY, _soundMuted);
}
var audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}
function playBeep({ startFreq, endFreq, startGain, duration }) {
  if (_soundMuted) return;
  const ctx = getAudioCtx();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(startFreq, t);
  if (endFreq !== void 0) {
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration * 0.8);
  }
  gain.gain.setValueAtTime(startGain, t);
  gain.gain.exponentialRampToValueAtTime(1e-3, t + duration);
  osc.start(t);
  osc.stop(t + duration);
}
function playTone({ startFreq, endFreq, startGain, duration, delay = 0, type = "sine" }) {
  if (_soundMuted) return;
  const ctx = getAudioCtx();
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(startFreq, t);
  if (endFreq !== void 0) {
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration * 0.9);
  }
  gain.gain.setValueAtTime(1e-4, t);
  gain.gain.exponentialRampToValueAtTime(startGain, t + Math.min(0.02, duration * 0.3));
  gain.gain.exponentialRampToValueAtTime(1e-4, t + duration);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}
function playVoice({
  startFreq,
  endFreq,
  startGain,
  duration,
  delay = 0,
  type = "triangle",
  detune = 8,
  attack = 0.012,
  lpStart,
  lpEnd,
  vibratoRate = 0,
  vibratoDepth = 0
}) {
  if (_soundMuted) return;
  const ctx = getAudioCtx();
  const t = ctx.currentTime + delay;
  const end = t + duration;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(1e-4, t);
  gain.gain.exponentialRampToValueAtTime(startGain, t + attack);
  gain.gain.exponentialRampToValueAtTime(1e-4, end);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.Q.value = 0.7;
  lp.frequency.setValueAtTime(lpStart || Math.max(startFreq * 3, 1200), t);
  if (lpEnd !== void 0) {
    lp.frequency.exponentialRampToValueAtTime(lpEnd, end);
  }
  lp.connect(gain);
  gain.connect(ctx.destination);
  let lfo, lfoGain;
  if (vibratoRate > 0 && vibratoDepth > 0) {
    lfo = ctx.createOscillator();
    lfoGain = ctx.createGain();
    lfo.frequency.value = vibratoRate;
    lfoGain.gain.value = vibratoDepth;
    lfo.connect(lfoGain);
  }
  for (const cents of [-detune, detune]) {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.detune.value = cents;
    osc.frequency.setValueAtTime(startFreq, t);
    if (endFreq !== void 0) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, end - 0.01);
    }
    if (lfoGain) lfoGain.connect(osc.frequency);
    osc.connect(lp);
    osc.start(t);
    osc.stop(end + 0.02);
  }
  if (lfo) {
    lfo.start(t);
    lfo.stop(end + 0.02);
  }
}
function playNoise({ duration, startGain, delay = 0, lpStart, lpEnd, hpFreq = 300, Q = 0.6 }) {
  if (_soundMuted) return;
  const ctx = getAudioCtx();
  const t = ctx.currentTime + delay;
  const end = t + duration;
  const len = Math.ceil(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = hpFreq;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.Q.value = Q;
  lp.frequency.setValueAtTime(lpStart, t);
  if (lpEnd !== void 0) lp.frequency.exponentialRampToValueAtTime(lpEnd, end);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(1e-4, t);
  gain.gain.exponentialRampToValueAtTime(startGain, t + duration * 0.25);
  gain.gain.exponentialRampToValueAtTime(1e-4, end);
  src.connect(hp);
  hp.connect(lp);
  lp.connect(gain);
  gain.connect(ctx.destination);
  src.start(t);
  src.stop(end + 0.02);
}
function playClickSound() {
  playBeep({ startFreq: 1200, endFreq: 800, startGain: 0.06, duration: 0.05 });
}
function playLaunchSound() {
  if (_soundMuted) return;
  playVoice({
    startFreq: 230,
    endFreq: 150,
    startGain: 0.1,
    duration: 0.09,
    type: "triangle",
    detune: 5,
    attack: 4e-3,
    lpStart: 900,
    lpEnd: 500
  });
  playVoice({
    startFreq: 360,
    endFreq: 1180,
    startGain: 0.09,
    duration: 0.2,
    delay: 0.03,
    type: "triangle",
    detune: 8,
    attack: 0.01,
    lpStart: 1400,
    lpEnd: 4200
  });
  playTone({ startFreq: 1760, startGain: 0.06, duration: 0.22, delay: 0.18, type: "sine" });
}
function playFinishSound() {
  if (_soundMuted) return;
  playVoice({
    startFreq: 130.81,
    startGain: 0.1,
    duration: 0.5,
    type: "sawtooth",
    detune: 6,
    lpStart: 400,
    lpEnd: 900
  });
  const chord = [
    { f: 523.25, d: 0 },
    // C5
    { f: 659.25, d: 0.08 },
    // E5
    { f: 783.99, d: 0.16 },
    // G5
    { f: 1046.5, d: 0.3 }
    // C6 — the lift
  ];
  chord.forEach(({ f, d }) => {
    playVoice({
      startFreq: f,
      startGain: 0.085,
      duration: 0.55 - d,
      delay: d,
      type: "triangle",
      detune: 9,
      lpStart: f * 2,
      lpEnd: f * 5
    });
  });
  playNoise({ duration: 0.5, startGain: 0.035, delay: 0.28, lpStart: 6e3, lpEnd: 9e3, hpFreq: 4e3, Q: 0.4 });
  [2093, 1568, 1318.5].forEach((f, i) => {
    playTone({ startFreq: f, startGain: 0.05, duration: 0.3, delay: 0.34 + i * 0.07, type: "sine" });
  });
}
function playStepSound() {
  playBeep({ startFreq: 600, startGain: 0.08, duration: 0.06 });
}
var captureBuffer = null;
var captureBufferLoading = null;
var CAPTURE_URL = (() => { try { return new URL("../assets/sounds/capture.m4a", import.meta.url).href; } catch { return ""; } })();
function loadCaptureBuffer() {
  if (captureBuffer) return Promise.resolve(captureBuffer);
  if (captureBufferLoading) return captureBufferLoading;
  if (!CAPTURE_URL) return Promise.resolve(null);
  const ctx = getAudioCtx();
  captureBufferLoading = fetch(CAPTURE_URL).then((r) => r.arrayBuffer()).then((buf) => ctx.decodeAudioData(buf)).then((decoded) => {
    captureBuffer = decoded;
    return decoded;
  });
  return captureBufferLoading;
}
function playCaptureSound() {
  if (_soundMuted) return;
  const ctx = getAudioCtx();
  loadCaptureBuffer().then((buffer) => {
    if (_soundMuted) return;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = 0.3;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  });
}
function playDiceSound() {
  if (_soundMuted) return;
  const ctx = getAudioCtx();
  const t = ctx.currentTime;
  const bufferLen = Math.ceil(ctx.sampleRate * 0.06);
  const noiseBuffer = ctx.createBuffer(1, bufferLen, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferLen; i++) data[i] = Math.random() * 2 - 1;
  const burstCount = 7 + Math.floor(Math.random() * 5);
  let offset = 0;
  let amp = 0.12;
  for (let i = 0; i < burstCount; i++) {
    const duration = 3e-3 + Math.random() * 5e-3;
    const startTime = t + offset;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(3e3 + Math.random() * 2e3, startTime);
    lp.Q.setValueAtTime(0.1, startTime);
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.setValueAtTime(300 + Math.random() * 200, startTime);
    hp.Q.setValueAtTime(0.1, startTime);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(amp, startTime);
    gain.gain.exponentialRampToValueAtTime(1e-3, startTime + duration);
    noise.connect(hp);
    hp.connect(lp);
    lp.connect(gain);
    gain.connect(ctx.destination);
    noise.start(startTime);
    noise.stop(startTime + duration);
    offset += 0.01 + Math.random() * 0.025;
    amp *= 0.7 + Math.random() * 0.15;
  }
}

// attached_assets/leludo-main/leludo-main/scripts/platform.js
var ANDROID_APP_ID = "com.leludo.ludo";
var PLAY_STORE_WEB_URL = \`https://play.google.com/store/apps/details?id=\${ANDROID_APP_ID}\`;
var PLAY_STORE_MARKET_URL = \`market://details?id=\${ANDROID_APP_ID}\`;
function isCapacitorNative() {
  try {
    return !!window.Capacitor?.isNativePlatform?.();
  } catch {
    return false;
  }
}
function isAndroidDevice() {
  try {
    return /android/i.test(navigator.userAgent || "");
  } catch {
    return false;
  }
}
function shouldShowStoreNudge() {
  return isCapacitorNative() || isAndroidDevice();
}
function openPlayStore() {
  const url = isCapacitorNative() ? PLAY_STORE_MARKET_URL : PLAY_STORE_WEB_URL;
  try {
    const win = window.open(url, "_blank", "noopener");
    if (!win && isCapacitorNative()) window.location.href = PLAY_STORE_WEB_URL;
  } catch {
    window.location.href = PLAY_STORE_WEB_URL;
  }
}

// attached_assets/leludo-main/leludo-main/scripts/analytics.js
var GA_MEASUREMENT_ID = "G-SY4NN1BV58";
var _enabled = false;
var _initialized = false;
function isLocalhost() {
  const h = location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}
function isAnalyticsEnabled() {
  if (typeof window === "undefined") return false;
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID.includes("XXXX")) return false;
  if (isLocalhost() && !isCapacitorNative()) return false;
  return true;
}
function gtag() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(arguments);
}
function initAnalytics() {
  if (_initialized) return;
  _initialized = true;
  if (!isAnalyticsEnabled()) return;
  _enabled = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = \`https://www.googletagmanager.com/gtag/js?id=\${GA_MEASUREMENT_ID}\`;
  document.head.appendChild(s);
  window.gtag = gtag;
  gtag("js", /* @__PURE__ */ new Date());
  gtag("config", GA_MEASUREMENT_ID, {
    send_page_view: false,
    app_version: VERSION,
    platform: isCapacitorNative() ? "android" : "web",
    transport_type: "beacon"
  });
}
function trackScreen(name) {
  if (!_enabled) return;
  gtag("event", "page_view", {
    page_title: name,
    page_path: \`/\${name}\`,
    page_location: \`\${location.origin}/\${name}\`,
    app_version: VERSION
  });
}
function trackEvent(name, params) {
  if (!_enabled) return;
  gtag("event", name, { app_version: VERSION, ...params || {} });
}

// attached_assets/leludo-main/leludo-main/scripts/nav-history.js
var _handlers = /* @__PURE__ */ new Map();
var _currentScreen = "home";
var _initialized2 = false;
function notifyNativeScreen(screen) {
  try {
    var msg = JSON.stringify({ type: "screenChange", screen: screen });
    if (window.ReactNativeWebView) { window.ReactNativeWebView.postMessage(msg); }
    else if (window.parent !== window) { window.parent.postMessage(msg, "*"); }
  } catch(e) {}
}
function registerScreenHandler(screen, fn) {
  _handlers.set(screen, fn);
}
function initNavHistory() {
  if (_initialized2) return;
  _initialized2 = true;
  try {
    history.replaceState({ screen: "home" }, "");
  } catch {
  }
  _currentScreen = "home";
  window.addEventListener("popstate", handlePopState);
  installAndroidBackHandler();
  trackScreen(_currentScreen);
  notifyNativeScreen(_currentScreen);
}
function goTo(screen) {
  if (_currentScreen === screen) return;
  try {
    history.pushState({ screen }, "");
  } catch {
  }
  _currentScreen = screen;
  trackScreen(screen);
  notifyNativeScreen(screen);
}
function replaceTo(screen) {
  const changed = _currentScreen !== screen;
  try {
    history.replaceState({ screen }, "");
  } catch {
  }
  _currentScreen = screen;
  if (changed) { trackScreen(screen); notifyNativeScreen(screen); }
}
function back() {
  history.back();
}
function handlePopState(event) {
  const previous = _currentScreen;
  const target = event.state?.screen ?? "home";
  _currentScreen = target;
  if (previous === "game") {
    try {
      history.pushState({ screen: "game" }, "");
    } catch {
    }
    _currentScreen = "game";
    trackScreen("pause");
    notifyNativeScreen("pause");
    const onGameBack = _handlers.get("__game_back__");
    if (onGameBack) onGameBack();
    return;
  }
  trackScreen(target);
  notifyNativeScreen(target);
  const closer = _handlers.get(previous);
  if (closer) closer(target);
}
function installAndroidBackHandler() {
  const cap = window.Capacitor;
  if (!cap?.isNativePlatform?.()) return;
  const App = cap.Plugins?.App;
  if (!App?.addListener) {
    console.warn("Capacitor App plugin missing \u2014 install @capacitor/app and re-sync");
    return;
  }
  App.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      App.exitApp();
    }
  });
}

// attached_assets/leludo-main/leludo-main/scripts/pawn-shape.js
var PAWN_BODY = "M32 85 Q30 70 36 55 Q40 45 42 38 L58 38 Q60 45 64 55 Q70 70 68 85 Z";
var _gradUid = 0;
function pawnSVG(color, size, svgClass, uidPrefix) {
  const uid = uidPrefix + ++_gradUid;
  return '<svg class="' + svgClass + '" viewBox="0 0 100 100" width="' + size + '" height="' + size + '"><defs><linearGradient id="' + uid + 'b" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0%" stop-color="white" stop-opacity="0.35"/><stop offset="100%" stop-color="black" stop-opacity="0.12"/></linearGradient><radialGradient id="' + uid + 'h" cx="0.4" cy="0.35" r="0.5"><stop offset="0%" stop-color="white" stop-opacity="0.45"/><stop offset="100%" stop-color="white" stop-opacity="0"/></radialGradient></defs><ellipse cx="50" cy="88" rx="30" ry="8" fill="' + color + '"/><ellipse cx="50" cy="88" rx="30" ry="8" fill="black" opacity="0.1"/><path d="' + PAWN_BODY + '" fill="' + color + '" stroke="white" stroke-width="1.5" stroke-opacity="0.5"/><path d="' + PAWN_BODY + '" fill="url(#' + uid + 'b)"/><ellipse cx="50" cy="38" rx="13" ry="4" fill="' + color + '"/><ellipse cx="50" cy="38" rx="13" ry="4" fill="white" opacity="0.15"/><circle cx="50" cy="24" r="16" fill="' + color + '" stroke="white" stroke-width="1.5" stroke-opacity="0.5"/><circle cx="50" cy="24" r="16" fill="url(#' + uid + 'h)"/><ellipse cx="44" cy="18" rx="5" ry="3.5" fill="white" opacity="0.4" transform="rotate(-20 44 18)"/></svg>';
}

// attached_assets/leludo-main/leludo-main/scripts/ko-capture.js
var STYLE_ID = "kocap-styles";
function injectCSS() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = \`
      .kocap-root {
        position: absolute; inset: 0;
        pointer-events: none;
        z-index: 1000;
        overflow: visible;
      }
      .kocap-layer { position: absolute; left: 0; top: 0; }
      /* Outer wrap owns translate + spin + the start\u2192end size scale; origin
         center keeps the pawn centered on its target as it scales, so its
         final frame lands exactly on the real token's box. */
      .kocap-pawn-wrap { position: absolute; transform-origin: center center; }
      /* Inner element owns the punch squash; origin at the feet (token base
         sits at y=88/100 in the square viewBox). */
      .kocap-pawn-squash { transform-origin: center 86%; }
      .kocap-pawn-svg { display: block; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.45)); }

      .kocap-pow { position: absolute; transform-origin: center; }
      .kocap-pow svg { display: block; width: 100%; height: 100%; overflow: visible; }
      .kocap-pow text {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-weight: 800; letter-spacing: 1.5px;
        text-anchor: middle; dominant-baseline: central;
        fill: #fff;
        paint-order: stroke;
        stroke: rgba(0,0,0,0.35);
        stroke-width: 0.8;
      }

      .kocap-speed-line {
        position: absolute;
        height: 2px;
        background: rgba(235,227,214,0.9);
        border-radius: 2px;
        opacity: 0;
      }

      .kocap-star {
        position: absolute;
        width: 10px; height: 10px;
        clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
        opacity: 0;
      }

      @keyframes kocap-shake {
        0%, 100% { transform: translate(0, 0); }
        10% { transform: translate(-3px, 2px); }
        20% { transform: translate(3px, -2px); }
        30% { transform: translate(-2px, 1px); }
        40% { transform: translate(2px, -1px); }
        50% { transform: translate(-1px, 1px); }
        60% { transform: translate(1px, 0); }
      }
      .kocap-board-shake { animation: kocap-shake 320ms ease-out; }
    \`;
  document.head.appendChild(style);
}
function powSVG(attackerColor) {
  return '<svg viewBox="0 0 120 120"><polygon points="60,4 70,28 95,18 88,44 116,50 92,64 110,86 84,82 88,110 65,94 60,116 55,94 32,110 36,82 10,86 28,64 4,50 32,44 25,18 50,28" fill="' + attackerColor + '" stroke="#ebe3d6" stroke-width="2.5" stroke-linejoin="round" /><text x="60" y="62" font-size="22" transform="rotate(-8 60 62)">POW!</text></svg>';
}
function arcKeyframes(dx, dy, spins, endScale) {
  const N = 28;
  const peak = Math.max(120, Math.abs(dx) * 0.5, Math.abs(dy) * 0.4);
  const frames = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = dx * t;
    const y = dy * t - peak * 4 * t * (1 - t);
    const rot = spins * 360 * t;
    const s = 1 + (endScale - 1) * t;
    frames.push({
      transform: "translate(" + x.toFixed(1) + "px, " + y.toFixed(1) + "px) rotate(" + rot.toFixed(0) + "deg) scale(" + s.toFixed(3) + ")",
      offset: t
    });
  }
  return frames;
}
function playKOCapture(opts) {
  if (!opts || !opts.container || !opts.capture) {
    throw new Error("playKOCapture: container and capture are required");
  }
  injectCSS();
  const container = opts.container;
  const cap = opts.capture;
  const attackerColor = opts.attackerColor || "#cf4a3a";
  const defenderColor = opts.defenderColor || "#2f9456";
  const pawnSize = opts.pawnSize || 48;
  const endScale = opts.endScale != null ? opts.endScale : 1;
  const duration = opts.duration || 1100;
  const attackFrom = opts.attackFrom || "left";
  const shakeBoard = opts.shakeBoard !== false;
  const onComplete = opts.onComplete || function() {
  };
  const dirVec = {
    left: { x: 1, y: -1 },
    right: { x: -1, y: -1 },
    top: { x: 1, y: 1 },
    bottom: { x: 1, y: -1 }
  }[attackFrom] || { x: 1, y: -1 };
  const home = opts.homeBase || {
    x: cap.x + dirVec.x * 320,
    y: cap.y + dirVec.y * 240
  };
  const root = document.createElement("div");
  root.className = "kocap-root";
  container.appendChild(root);
  const pow = document.createElement("div");
  pow.className = "kocap-pow";
  const powSize = pawnSize * 2.2;
  pow.style.cssText = "left:" + (cap.x - powSize / 2) + "px;top:" + (cap.y - powSize / 2) + "px;width:" + powSize + "px;height:" + powSize + "px;";
  pow.innerHTML = powSVG(attackerColor);
  root.appendChild(pow);
  pow.animate(
    [
      { opacity: 0, transform: "scale(0.2) rotate(-15deg)", offset: 0 },
      { opacity: 1, transform: "scale(1.18) rotate(-5deg)", offset: 0.18 },
      { opacity: 1, transform: "scale(1.00) rotate(2deg)", offset: 0.45 },
      { opacity: 1, transform: "scale(1.00) rotate(2deg)", offset: 0.75 },
      { opacity: 0, transform: "scale(0.95) rotate(2deg)", offset: 1 }
    ],
    { duration: Math.round(duration * 0.7), easing: "cubic-bezier(.2,1.5,.3,1)", fill: "forwards" }
  );
  const lineAngle = { left: 0, right: 180, top: 90, bottom: 270 }[attackFrom] || 0;
  for (let i = 0; i < 4; i++) {
    const line = document.createElement("div");
    line.className = "kocap-speed-line";
    const len = 30 + Math.random() * 30;
    const offset = -30 + i * 18;
    line.style.cssText = "left:" + (cap.x + 18) + "px;top:" + (cap.y + offset) + "px;width:" + len + "px;transform-origin: 0 50%;transform: rotate(" + lineAngle + "deg);";
    root.appendChild(line);
    line.animate(
      [
        { opacity: 0, transform: "rotate(" + lineAngle + "deg) translateX(-30px)" },
        { opacity: 1, transform: "rotate(" + lineAngle + "deg) translateX(0)", offset: 0.4 },
        { opacity: 0, transform: "rotate(" + lineAngle + "deg) translateX(60px)" }
      ],
      { duration: Math.round(duration * 0.45), delay: i * 40, fill: "forwards" }
    );
  }
  const traj = document.createElement("div");
  traj.className = "kocap-pawn-wrap";
  traj.style.cssText = "left:" + (cap.x - pawnSize / 2) + "px;top:" + (cap.y - pawnSize / 2) + "px;width:" + pawnSize + "px;height:" + pawnSize + "px;";
  const squash = document.createElement("div");
  squash.className = "kocap-pawn-squash";
  squash.innerHTML = pawnSVG(defenderColor, pawnSize, "kocap-pawn-svg", "kocap-grad-");
  traj.appendChild(squash);
  root.appendChild(traj);
  squash.animate(
    [
      { transform: "scale(1, 1)", offset: 0 },
      { transform: "scale(1.25, 0.7)", offset: 0.08 },
      { transform: "scale(0.9, 1.1)", offset: 0.18 },
      { transform: "scale(1, 1)", offset: 0.3 },
      { transform: "scale(1, 1)", offset: 1 }
    ],
    { duration, easing: "cubic-bezier(.3, 1.6, .4, 1)", fill: "forwards" }
  );
  const dx = home.x - cap.x;
  const dy = home.y - cap.y;
  traj.animate(arcKeyframes(dx, dy, dy < 0 ? 2 : -2, endScale), {
    duration,
    easing: "cubic-bezier(.4, 0, .3, 1)",
    fill: "forwards"
  });
  const starOffsets = [
    { x: 60, y: -90, d: 60 },
    { x: 90, y: -60, d: 90 },
    { x: 40, y: -120, d: 120 }
  ];
  starOffsets.forEach(function(o) {
    const star = document.createElement("div");
    star.className = "kocap-star";
    star.style.cssText = "left:" + (cap.x - 5) + "px;top:" + (cap.y - 5) + "px;background:" + attackerColor + ";";
    root.appendChild(star);
    const sx = ({ left: 1, right: -1, top: 1, bottom: 1 }[attackFrom] || 1) * o.x;
    const sy = ({ top: 1, bottom: -1, left: 1, right: 1 }[attackFrom] || 1) * o.y;
    star.animate(
      [
        { opacity: 0, transform: "translate(0,0) scale(0.4) rotate(0)", offset: 0 },
        { opacity: 1, transform: "translate(" + sx * 0.4 + "px," + sy * 0.4 + "px) scale(1) rotate(120deg)", offset: 0.4 },
        { opacity: 0, transform: "translate(" + sx + "px," + sy + "px) scale(0.6) rotate(360deg)", offset: 1 }
      ],
      { duration: Math.round(duration * 0.55), delay: o.d, fill: "forwards" }
    );
  });
  if (shakeBoard) {
    container.classList.remove("kocap-board-shake");
    void container.offsetWidth;
    container.classList.add("kocap-board-shake");
    setTimeout(function() {
      container.classList.remove("kocap-board-shake");
    }, 360);
  }
  return new Promise(function(resolve) {
    setTimeout(function() {
      if (root.parentNode) root.parentNode.removeChild(root);
      onComplete();
      resolve();
    }, duration + 80);
  });
}

// attached_assets/leludo-main/leludo-main/scripts/home-arrival.js
var STYLE_ID2 = "hmarr-styles";
function injectCSS2() {
  if (document.getElementById(STYLE_ID2)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID2;
  style.textContent = \`
      .hmarr-root {
        position: absolute; inset: 0;
        pointer-events: none;
        z-index: 1000;
        overflow: visible;
      }
      /* Outer wrap owns translate + the start\u2192end size scale; origin
         center keeps the pawn centered on its slot as it shrinks. */
      .hmarr-pawn-wrap { position: absolute; transform-origin: center center; }
      /* Inner element owns the settle squash; origin at the feet (the token
         base sits at y=88/100 in the square viewBox). */
      .hmarr-pawn-squash { transform-origin: center 86%; }
      .hmarr-pawn-svg  { display: block; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.45)); }

      .hmarr-ring {
        position: absolute;
        border-radius: 50%;
        border: 3px solid currentColor;
        opacity: 0;
        pointer-events: none;
      }

      .hmarr-confetti {
        position: absolute;
        width: 8px; height: 12px;
        border-radius: 1px;
        opacity: 0;
        transform-origin: center;
      }

      .hmarr-label {
        position: absolute;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-weight: 800; letter-spacing: 2px;
        text-align: center;
        opacity: 0;
        transform-origin: center;
        white-space: nowrap;
        pointer-events: none;
      }
      .hmarr-label .hmarr-label-chip {
        display: inline-block;
        padding: 7px 16px;
        border-radius: 999px;
        background: currentColor;
        color: #1a1410;
        box-shadow: 0 6px 18px rgba(0,0,0,0.35);
      }

      .hmarr-flash {
        position: absolute; inset: 0;
        background: currentColor;
        opacity: 0;
        border-radius: inherit;
        pointer-events: none;
        mix-blend-mode: screen;
      }
    \`;
  document.head.appendChild(style);
}
function el(cls, css) {
  const d = document.createElement("div");
  d.className = cls;
  if (css) d.style.cssText = css;
  return d;
}
function playHomeArrival(opts) {
  if (!opts || !opts.container || !opts.home) {
    throw new Error("playHomeArrival: container and home are required");
  }
  injectCSS2();
  const container = opts.container;
  const home = opts.home;
  const source = opts.source || null;
  const color = opts.color || "#d97644";
  const pawnSize = opts.pawnSize || 48;
  const burstSize = opts.burstSize || pawnSize;
  const duration = opts.duration || 1400;
  const flashBoard = opts.flashBoard === true;
  const label = opts.label || "HOME!";
  const onComplete = opts.onComplete || function() {
  };
  const endScale = opts.endScale != null ? opts.endScale : 1;
  const root = el("hmarr-root");
  container.appendChild(root);
  const startX = source ? source.x : home.x;
  const startY = source ? source.y : home.y;
  const traj = el(
    "hmarr-pawn-wrap",
    "left:" + (startX - pawnSize / 2) + "px;top:" + (startY - pawnSize / 2) + "px;width:" + pawnSize + "px;height:" + pawnSize + "px;"
  );
  const squash = el("hmarr-pawn-squash");
  squash.innerHTML = pawnSVG(color, pawnSize, "hmarr-pawn-svg", "hmarr-grad-");
  traj.appendChild(squash);
  root.appendChild(traj);
  const travelMs = source ? Math.round(duration * 0.4) : 0;
  const dx = home.x - startX;
  const dy = home.y - startY;
  const midScale = 1 + (endScale - 1) * 0.5;
  if (source) {
    traj.animate(
      [
        { transform: "translate(0,0) scale(1)" },
        { transform: "translate(" + (dx * 0.5).toFixed(1) + "px," + (dy * 0.5 - 18).toFixed(1) + "px) scale(" + midScale.toFixed(3) + ")", offset: 0.5 },
        { transform: "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px) scale(" + endScale.toFixed(3) + ")" }
      ],
      { duration: travelMs, easing: "cubic-bezier(.4, 0, .25, 1)", fill: "forwards" }
    );
  } else {
    traj.style.transform = "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px) scale(" + endScale.toFixed(3) + ")";
  }
  setTimeout(function() {
    squash.animate(
      [
        { transform: "scale(1, 1)" },
        { transform: "scale(1.08, 0.86)", offset: 0.25 },
        { transform: "scale(0.94, 1.08)", offset: 0.55 },
        { transform: "scale(1, 1)" }
      ],
      { duration: 480, easing: "cubic-bezier(.3, 1.6, .4, 1)", fill: "forwards" }
    );
  }, travelMs);
  setTimeout(function() {
    playBurst(root, home, color, label, duration - travelMs, burstSize);
    if (flashBoard) playBoardFlash(root, color);
  }, travelMs);
  return new Promise(function(resolve) {
    setTimeout(function() {
      if (root.parentNode) root.parentNode.removeChild(root);
      onComplete();
      resolve();
    }, duration + 80);
  });
}
function playBurst(root, home, color, label, ms, burstSize) {
  const r = el(
    "hmarr-ring",
    "left:" + (home.x - 6) + "px;top:" + (home.y - 6) + "px;width:12px;height:12px;color:" + color + ";"
  );
  root.appendChild(r);
  r.animate(
    [
      { opacity: 0, transform: "scale(0.4)" },
      { opacity: 0.9, transform: "scale(1.0)", offset: 0.08 },
      { opacity: 0, transform: "scale(8)" }
    ],
    { duration: Math.round(ms * 0.5), easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" }
  );
  const palette = [color, color, color, "#ebe3d6", "#1a1410", "#f3c969"];
  const N = 32;
  for (let i = 0; i < N; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4;
    const speed = burstSize * (1.4 + Math.random() * 1.4);
    const tx = Math.cos(a) * speed;
    const ty = Math.sin(a) * speed * 0.9 + burstSize * 0.4;
    const w = burstSize * 0.1 + Math.random() * burstSize * 0.1;
    const h = burstSize * 0.16 + Math.random() * burstSize * 0.14;
    const rot = (Math.random() - 0.5) * 720;
    const c = palette[i % palette.length];
    const conf = el(
      "hmarr-confetti",
      "left:" + (home.x - w / 2) + "px;top:" + (home.y - h / 2) + "px;width:" + w + "px; height:" + h + "px;background:" + c + ";"
    );
    root.appendChild(conf);
    conf.animate(
      [
        { opacity: 0, transform: "translate(0,0) rotate(0)" },
        { opacity: 1, transform: "translate(" + (tx * 0.5).toFixed(1) + "px," + (ty * 0.4 - 18).toFixed(1) + "px) rotate(" + (rot * 0.5).toFixed(0) + "deg)", offset: 0.3 },
        { opacity: 1, transform: "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px) rotate(" + rot.toFixed(0) + "deg)", offset: 0.85 },
        { opacity: 0, transform: "translate(" + (tx * 1.05).toFixed(1) + "px," + (ty + 18).toFixed(1) + "px) rotate(" + (rot * 1.1).toFixed(0) + "deg)" }
      ],
      { duration: Math.round(ms * 0.85), delay: Math.round(Math.random() * 120), easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" }
    );
  }
  const labelEl = el(
    "hmarr-label",
    "left: 0; right: 0;top:" + (home.y - burstSize * 0.9) + "px;font-size:" + Math.round(burstSize * 0.22) + "px;color:" + color + ";"
  );
  labelEl.innerHTML = '<span class="hmarr-label-chip">' + label + "</span>";
  root.appendChild(labelEl);
  labelEl.animate(
    [
      { opacity: 0, transform: "translateY(8px) scale(0.6) rotate(-4deg)" },
      { opacity: 1, transform: "translateY(0) scale(1.1) rotate(-2deg)", offset: 0.25 },
      { opacity: 1, transform: "translateY(0) scale(1)   rotate(0)", offset: 0.4 },
      { opacity: 1, transform: "translateY(-2px) scale(1) rotate(0)", offset: 0.85 },
      { opacity: 0, transform: "translateY(-10px) scale(0.95) rotate(0)" }
    ],
    { duration: Math.round(ms * 0.9), delay: 80, easing: "cubic-bezier(.2,1.6,.3,1)", fill: "forwards" }
  );
}
function playBoardFlash(root, color) {
  const flash = el("hmarr-flash", "color:" + color + ";");
  root.appendChild(flash);
  flash.animate(
    [
      { opacity: 0 },
      { opacity: 0.55, offset: 0.12 },
      { opacity: 0.35, offset: 0.4 },
      { opacity: 0 }
    ],
    { duration: 520, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" }
  );
}

// attached_assets/leludo-main/leludo-main/scripts/pawn-launch.js
var STYLE_ID3 = "plnch-styles";
var CHIP_DELAY_MS = 60;
var CHIP_VISIBLE_MS = 1100;
function injectCSS3() {
  if (document.getElementById(STYLE_ID3)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID3;
  style.textContent = \`
      .plnch-root {
        position: absolute; inset: 0;
        pointer-events: none;
        z-index: 1000;
        overflow: visible;
      }
      .plnch-pawn-wrap {
        position: absolute;
        transform-origin: center 86%;
        will-change: transform;
      }
      .plnch-pawn-svg  {
        display: block;
        filter: drop-shadow(0 4px 10px rgba(0,0,0,0.45));
      }
      .plnch-trail-wrap {
        position: absolute;
        transform-origin: center 86%;
        opacity: 0;
        will-change: transform, opacity;
      }
      .plnch-trail-svg  { display: block; }

      .plnch-halo {
        position: absolute;
        border-radius: 50%;
        background: radial-gradient(
          circle,
          currentColor 0%,
          currentColor 40%,
          transparent 72%
        );
        opacity: 0;
        pointer-events: none;
        mix-blend-mode: screen;
      }

      .plnch-ring {
        position: absolute;
        border-radius: 50%;
        border: 3px solid currentColor;
        opacity: 0;
        pointer-events: none;
      }

      .plnch-spark {
        position: absolute;
        border-radius: 999px;
        opacity: 0;
        pointer-events: none;
      }

      .plnch-dust {
        position: absolute;
        border-radius: 50%;
        opacity: 0;
        pointer-events: none;
      }

      .plnch-label {
        position: absolute;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-weight: 800; letter-spacing: 2px;
        text-align: center;
        opacity: 0;
        transform-origin: center;
        white-space: nowrap;
        pointer-events: none;
      }
      .plnch-label .plnch-label-chip {
        display: inline-block;
        padding: 6px 14px;
        border-radius: 999px;
        /* var() chain: --plnch-chip-bg flows down from the inline style on
         * .plnch-label (set in playLandingFX). Using currentColor here was
         * wrong \u2014 it resolves against the chip's OWN color (#1a1410), not
         * the parent's color, so the pill rendered as a dark "rounded
         * square" instead of the player color. */
        background: var(--plnch-chip-bg, currentColor);
        color: #1a1410;
        box-shadow: 0 6px 18px rgba(0,0,0,0.35);
      }
    \`;
  document.head.appendChild(style);
}
function ghostSVG(color, size) {
  return '<svg class="plnch-trail-svg" viewBox="0 0 100 100" width="' + size + '" height="' + size + '"><ellipse cx="50" cy="88" rx="30" ry="8" fill="' + color + '"/><path d="' + PAWN_BODY + '" fill="' + color + '"/><circle cx="50" cy="24" r="16" fill="' + color + '"/></svg>';
}
function el2(cls, css) {
  const d = document.createElement("div");
  d.className = cls;
  if (css) d.style.cssText = css;
  return d;
}
function arcAt(yard, entry, p, arcH) {
  const x = yard.x + (entry.x - yard.x) * p;
  const y = yard.y + (entry.y - yard.y) * p - arcH * 4 * p * (1 - p);
  return { x, y };
}
function arcAngle(yard, entry, p, arcH) {
  const dx = entry.x - yard.x;
  const dy = entry.y - yard.y - arcH * 4 * (1 - 2 * p);
  return Math.atan2(dy, dx);
}
function playPawnLaunch(opts) {
  if (!opts || !opts.container || !opts.yard || !opts.entry) {
    throw new Error("playPawnLaunch: container, yard and entry are required");
  }
  injectCSS3();
  const container = opts.container;
  const yard = opts.yard;
  const entry = opts.entry;
  const color = opts.color || "#d97644";
  const pawnSize = opts.pawnSize || 48;
  const duration = opts.duration || 1500;
  const trail = opts.trail !== false;
  const label = opts.label != null ? opts.label : "GO!";
  const onComplete = opts.onComplete || function() {
  };
  const dist = Math.hypot(entry.x - yard.x, entry.y - yard.y);
  const arcH = opts.arcHeight != null ? opts.arcHeight : Math.max(dist * 0.32, pawnSize * 1.4);
  const root = el2("plnch-root");
  container.appendChild(root);
  const T_anticipation = Math.round(duration * 0.28);
  const T_crouch = Math.round(duration * 0.12);
  const T_leap = Math.round(duration * 0.38);
  const T_land = Math.round(duration * 0.22);
  const t_charge = T_anticipation;
  const t_leap = t_charge + T_crouch;
  const t_land = t_leap + T_leap;
  const baseY = pawnSize * 0.36;
  const haloSize = pawnSize * 1.8;
  const halo = el2(
    "plnch-halo",
    "left:" + (yard.x - haloSize / 2) + "px;top:" + (yard.y - haloSize / 2 + baseY) + "px;width:" + haloSize + "px; height:" + haloSize + "px;color:" + color + ";"
  );
  root.appendChild(halo);
  halo.animate(
    [
      { opacity: 0, transform: "scale(0.4)" },
      { opacity: 0.55, transform: "scale(0.85)", offset: 0.35 },
      { opacity: 0.85, transform: "scale(1.0)", offset: 0.7 },
      { opacity: 0, transform: "scale(1.25)" }
    ],
    { duration: T_anticipation + T_crouch + 60, easing: "cubic-bezier(.4,.0,.5,1)", fill: "forwards" }
  );
  const N_SPARK = 8;
  for (let i = 0; i < N_SPARK; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
    const r0 = pawnSize * 0.45;
    const r1 = pawnSize * (0.9 + Math.random() * 0.6);
    const x0 = yard.x + Math.cos(angle) * r0;
    const y0 = yard.y + Math.sin(angle) * r0 + baseY;
    const x1 = yard.x + Math.cos(angle) * r1;
    const y1 = yard.y + Math.sin(angle) * r1 + baseY - pawnSize * 0.3;
    const sz = 3 + Math.random() * 3;
    const sp = el2(
      "plnch-spark",
      "left:" + x0 + "px; top:" + y0 + "px;width:" + sz + "px; height:" + sz + "px;background:" + color + ";box-shadow: 0 0 6px " + color + ";"
    );
    root.appendChild(sp);
    sp.animate(
      [
        { opacity: 0, transform: "translate(0,0) scale(0.6)" },
        { opacity: 1, transform: "translate(0,0) scale(1)", offset: 0.15 },
        { opacity: 1, transform: "translate(" + (x1 - x0).toFixed(1) + "px," + (y1 - y0).toFixed(1) + "px) scale(0.7)", offset: 0.75 },
        { opacity: 0, transform: "translate(" + (x1 - x0).toFixed(1) + "px," + (y1 - y0 - 6).toFixed(1) + "px) scale(0.4)" }
      ],
      { duration: T_anticipation + T_crouch, delay: Math.round(Math.random() * 120), easing: "ease-out", fill: "forwards" }
    );
  }
  if (trail) {
    const N_TRAIL = 5;
    for (let i = 0; i < N_TRAIL; i++) {
      const p = (i + 1) / (N_TRAIL + 1);
      const pt = arcAt(yard, entry, p, arcH);
      const tw = el2(
        "plnch-trail-wrap",
        "left:" + (pt.x - pawnSize / 2) + "px;top:" + (pt.y - pawnSize / 2) + "px;width:" + pawnSize + "px; height:" + pawnSize + "px;"
      );
      tw.innerHTML = ghostSVG(color, pawnSize);
      root.appendChild(tw);
      const ang = arcAngle(yard, entry, p, arcH);
      const tilt = ang * 180 / Math.PI * 0.18;
      tw.animate(
        [
          { opacity: 0, transform: "scale(0.85) rotate(" + tilt + "deg)" },
          { opacity: 0.45 - i * 0.07, transform: "scale(1) rotate(" + tilt + "deg)", offset: 0.4 },
          { opacity: 0, transform: "scale(0.9) rotate(" + tilt + "deg)" }
        ],
        {
          duration: Math.round(T_leap * 0.85),
          delay: t_leap + Math.round(T_leap * p * 0.5),
          easing: "ease-out",
          fill: "forwards"
        }
      );
    }
  }
  const pawn = el2(
    "plnch-pawn-wrap",
    "left:" + (yard.x - pawnSize / 2) + "px;top:" + (yard.y - pawnSize / 2) + "px;width:" + pawnSize + "px; height:" + pawnSize + "px;"
  );
  pawn.innerHTML = pawnSVG(color, pawnSize, "plnch-pawn-svg", "plnch-grad-");
  root.appendChild(pawn);
  pawn.animate(
    [
      { transform: "translate(0,0) scale(1, 1)" },
      { transform: "translate(0,-" + (pawnSize * 0.1).toFixed(1) + "px) scale(0.98, 1.04)", offset: 0.3 },
      { transform: "translate(0,0) scale(1, 1)", offset: 0.55 },
      { transform: "translate(0,-" + (pawnSize * 0.14).toFixed(1) + "px) scale(0.97, 1.05)", offset: 0.82 },
      { transform: "translate(0,0) scale(1, 1)" }
    ],
    { duration: T_anticipation, easing: "cubic-bezier(.4,0,.6,1)", fill: "forwards" }
  );
  setTimeout(function() {
    pawn.animate(
      [
        { transform: "translate(0,0) scale(1, 1)" },
        { transform: "translate(0," + (pawnSize * 0.1).toFixed(1) + "px) scale(1.15, 0.78)" }
      ],
      { duration: T_crouch, easing: "cubic-bezier(.5,0,.7,.4)", fill: "forwards" }
    );
  }, t_charge);
  setTimeout(function() {
    const STEPS = 12;
    const keyframes = [];
    for (let i = 0; i <= STEPS; i++) {
      const p = i / STEPS;
      const pt = arcAt(yard, entry, p, arcH);
      const ang = arcAngle(yard, entry, p, arcH);
      const tilt = ang * 180 / Math.PI * 0.22;
      const tx = pt.x - yard.x;
      const ty = pt.y - yard.y;
      const ay = -Math.cos(p * Math.PI);
      const sx = 1 - ay * 0.04;
      const sy = 1 + ay * 0.06;
      keyframes.push({
        transform: "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px) rotate(" + tilt.toFixed(1) + "deg) scale(" + sx.toFixed(3) + "," + sy.toFixed(3) + ")",
        offset: p
      });
    }
    pawn.animate(keyframes, {
      duration: T_leap,
      easing: "cubic-bezier(.45,.05,.55,.95)",
      fill: "forwards"
    });
  }, t_leap);
  setTimeout(function() {
    const tx = entry.x - yard.x;
    const ty = entry.y - yard.y;
    pawn.animate(
      [
        { transform: "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px) scale(1,1)" },
        { transform: "translate(" + tx.toFixed(1) + "px," + (ty + 4).toFixed(1) + "px) scale(1.18, 0.74)", offset: 0.25 },
        { transform: "translate(" + tx.toFixed(1) + "px," + (ty - 6).toFixed(1) + "px) scale(0.92, 1.10)", offset: 0.6 },
        { transform: "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px) scale(1, 1)" }
      ],
      { duration: T_land, easing: "cubic-bezier(.3,1.6,.4,1)", fill: "forwards" }
    );
    playLandingFX(root, entry, color, pawnSize, label);
  }, t_land);
  const chipEndMs = label ? t_land + CHIP_DELAY_MS + CHIP_VISIBLE_MS : 0;
  const cleanupMs = Math.max(duration + 80, chipEndMs + 80);
  return new Promise(function(resolve) {
    setTimeout(function() {
      if (root.parentNode) root.parentNode.removeChild(root);
      onComplete();
      resolve();
    }, cleanupMs);
  });
}
function playLandingFX(root, entry, color, pawnSize, label) {
  const r = el2(
    "plnch-ring",
    "left:" + (entry.x - 6) + "px;top:" + (entry.y - 6) + "px;width:12px; height:12px;color:" + color + ";"
  );
  root.appendChild(r);
  r.animate(
    [
      { opacity: 0, transform: "scale(0.4)" },
      { opacity: 0.95, transform: "scale(1.0)", offset: 0.12 },
      { opacity: 0, transform: "scale(6.5)" }
    ],
    { duration: 520, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" }
  );
  const N_DUST = 6;
  for (let i = 0; i < N_DUST; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.6;
    const r1 = pawnSize * (0.5 + Math.random() * 0.5);
    const dx = Math.cos(a) * r1;
    const dy = Math.sin(a) * r1 * 0.6;
    const sz = 6 + Math.random() * 8;
    const d = el2(
      "plnch-dust",
      "left:" + (entry.x - sz / 2) + "px;top:" + (entry.y - sz / 2 + pawnSize * 0.36) + "px;width:" + sz + "px; height:" + sz + "px;background: rgba(235,227,214,0.55);"
    );
    root.appendChild(d);
    d.animate(
      [
        { opacity: 0, transform: "translate(0,0) scale(0.4)" },
        { opacity: 0.85, transform: "translate(" + (dx * 0.4).toFixed(1) + "px," + (dy * 0.4).toFixed(1) + "px) scale(0.85)", offset: 0.3 },
        { opacity: 0, transform: "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px) scale(1.1)" }
      ],
      { duration: 480, delay: Math.round(Math.random() * 60), easing: "ease-out", fill: "forwards" }
    );
  }
  if (label) {
    const labelEl = el2(
      "plnch-label",
      "left: 0; right: 0;top:" + (entry.y - pawnSize * 1.45) + "px;font-size:" + Math.round(pawnSize * 0.3) + "px;color:" + color + ";--plnch-chip-bg:" + color + ";"
    );
    labelEl.innerHTML = '<span class="plnch-label-chip">' + label + "</span>";
    root.appendChild(labelEl);
    labelEl.animate(
      [
        { opacity: 0, transform: "translateY(6px) scale(0.7) rotate(-3deg)" },
        { opacity: 1, transform: "translateY(0)   scale(1.1) rotate(-1deg)", offset: 0.12 },
        { opacity: 1, transform: "translateY(0)   scale(1)   rotate(0)", offset: 0.22 },
        { opacity: 1, transform: "translateY(-2px) scale(1)  rotate(0)", offset: 0.88 },
        { opacity: 0, transform: "translateY(-9px) scale(0.95) rotate(0)" }
      ],
      { duration: CHIP_VISIBLE_MS, delay: CHIP_DELAY_MS, easing: "cubic-bezier(.2,1.6,.3,1)", fill: "forwards" }
    );
  }
}

// attached_assets/leludo-main/leludo-main/scripts/render-logic.js
var FINISH_CELL_ID_RE = /^p\ds6$/;
function getTokenContainerId(playerIndex, tokenIndex, tokenPosition) {
  if (tokenPosition === -1) {
    return \`h-\${playerIndex}-\${tokenIndex}\`;
  }
  if (tokenPosition > 50) {
    const safeIndex = tokenPosition % 50;
    return \`p\${playerIndex}s\${safeIndex}\`;
  }
  const markIndex2 = getMarkIndex(playerIndex, tokenPosition);
  return \`m\${markIndex2}\`;
}
function getTokenElementId(playerIndex, tokenIndex) {
  return \`p-\${playerIndex}-\${tokenIndex}\`;
}
var _tokenElementCache = /* @__PURE__ */ new Map();
function getTokenElement(playerIndex, tokenIndex) {
  const key = playerIndex * 4 + tokenIndex;
  const cached = _tokenElementCache.get(key);
  if (cached && cached.isConnected) return cached;
  const el3 = document.getElementById(getTokenElementId(playerIndex, tokenIndex));
  if (el3) _tokenElementCache.set(key, el3);
  return el3;
}
function clearTokenElementCache() {
  _tokenElementCache.clear();
  _bouncingTokens.clear();
}
function updateDiceFace(lastDiceRoll, diceRoll) {
  document.getElementById(\`d\${lastDiceRoll}\`).classList.add("hidden");
  document.getElementById(\`d\${diceRoll}\`).classList.remove("hidden");
}
function animateDiceRoll(currentDiceRoll) {
  playDiceSound();
  const diceContainer = document.getElementById("dice");
  if (!diceContainer) {
    return Promise.resolve();
  }
  diceContainer.classList.add("dice-rolling");
  diceContainer.addEventListener("animationend", () => {
    diceContainer.classList.remove("dice-rolling");
  }, { once: true });
  return new Promise((resolve) => {
    var _resolved = false;
    function _done(lastRoll) {
      if (_resolved) return;
      _resolved = true;
      try { updateDiceFace(lastRoll, currentDiceRoll); } catch(e) {}
      resolve();
    }
    var _timeoutId = setTimeout(function() { _done(currentDiceRoll); }, 1500);
    let diceRoll = currentDiceRoll;
    let counter = 0;
    const delays = [40, 40, 40, 50, 60, 80, 100, 140];
    let lastTime = 0;
    function tick(timestamp) {
      if (_resolved) return;
      if (!lastTime) lastTime = timestamp;
      if (timestamp - lastTime < delays[counter]) {
        requestAnimationFrame(tick);
        return;
      }
      lastTime = timestamp;
      const lastDiceRoll = diceRoll;
      if (counter === 8) {
        clearTimeout(_timeoutId);
        _done(lastDiceRoll);
        return;
      }
      diceRoll = diceRoll % 6 + 1;
      updateDiceFace(lastDiceRoll, diceRoll);
      counter++;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}
function getContainerPath(playerIndex, tokenIndex, currentPosition, newPosition) {
  if ([-1, 0].includes(newPosition)) {
    return [getTokenContainerId(playerIndex, tokenIndex, newPosition)];
  }
  const path = [];
  for (let pos = currentPosition + 1; pos <= newPosition; pos++) {
    path.push(getTokenContainerId(playerIndex, tokenIndex, pos));
  }
  return path;
}
function pinTokenForCapture(element) {
  const cell = element.parentElement;
  if (!cell) return;
  const cellRect = cell.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  cell.style.position = "relative";
  element.style.position = "absolute";
  element.style.top = \`\${rect.top - cellRect.top}px\`;
  element.style.left = \`\${rect.left - cellRect.left}px\`;
  element.style.width = \`\${rect.width}px\`;
  element.style.height = \`\${rect.height}px\`;
  element.dataset.moving = "true";
}
function clearStackStyles(t) {
  t.style.removeProperty("position");
  t.style.removeProperty("width");
  t.style.removeProperty("height");
  t.style.removeProperty("top");
  t.style.removeProperty("left");
  t.style.removeProperty("right");
  t.style.removeProperty("bottom");
  t.style.removeProperty("z-index");
  t.style.removeProperty("display");
  t.style.removeProperty("margin-left");
}
function applyFinishStacking(cell, tokens) {
  const n = tokens.length;
  if (n === 0) return;
  const playerIdx = parseInt(cell.id[1], 10);
  const edge = 4;
  function place(t, alongPct, depthPct, sizePct) {
    let top, left;
    switch (playerIdx) {
      case 0:
        left = depthPct;
        top = alongPct;
        break;
      case 1:
        left = alongPct;
        top = depthPct;
        break;
      case 2:
        left = 100 - depthPct - sizePct;
        top = alongPct;
        break;
      case 3:
        left = alongPct;
        top = 100 - depthPct - sizePct;
        break;
    }
    t.style.cssText = \`position:absolute;top:\${top}%;left:\${left}%;width:\${sizePct}%;height:\${sizePct}%;\`;
  }
  if (n <= 3) {
    const sizeMap = [22, 22, 22, 17];
    const gapMap = [0, 0, 4, 3];
    const s2 = sizeMap[n];
    const g2 = gapMap[n];
    const totalLen = n * s2 + (n - 1) * g2;
    const startAlong2 = (100 - totalLen) / 2;
    tokens.forEach((t, i) => place(t, startAlong2 + i * (s2 + g2), edge, s2));
    return;
  }
  const s = 17;
  const g = 3;
  const lineLen = 3 * s + 2 * g;
  const startAlong = (100 - lineLen) / 2;
  for (let i = 0; i < 3; i++) {
    place(tokens[i], startAlong + i * (s + g), edge, s);
  }
  place(tokens[3], (100 - s) / 2, edge + s + g, s);
}
function updateCellStacking(cell) {
  if (!cell) return;
  const allTokens = Array.from(cell.querySelectorAll(":scope > wc-token"));
  const tokens = allTokens.filter((t) => t.dataset.moving !== "true");
  tokens.forEach(clearStackStyles);
  const n = tokens.length;
  const badge = cell.querySelector(".stack-badge");
  if (badge) badge.remove();
  if (FINISH_CELL_ID_RE.test(cell.id)) {
    applyFinishStacking(cell, tokens);
    return;
  }
  if (n <= 1) return;
  cell.style.position = "relative";
  if (n === 2) {
    tokens[0].style.cssText += ";position:absolute;top:4%;left:4%;width:64%;height:64%;z-index:1;";
    tokens[1].style.cssText += ";position:absolute;bottom:4%;right:4%;width:64%;height:64%;z-index:2;";
  } else if (n === 3) {
    tokens[0].style.cssText += ";position:absolute;top:2%;left:50%;width:52%;height:52%;z-index:3;margin-left:-26%;";
    tokens[1].style.cssText += ";position:absolute;bottom:4%;left:0%;width:52%;height:52%;z-index:2;";
    tokens[2].style.cssText += ";position:absolute;bottom:4%;right:0%;width:52%;height:52%;z-index:2;";
  } else if (n === 4) {
    tokens[0].style.cssText += ";position:absolute;top:4%;left:4%;width:46%;height:46%;z-index:1;";
    tokens[1].style.cssText += ";position:absolute;top:4%;right:4%;width:46%;height:46%;z-index:1;";
    tokens[2].style.cssText += ";position:absolute;bottom:4%;left:4%;width:46%;height:46%;z-index:1;";
    tokens[3].style.cssText += ";position:absolute;bottom:4%;right:4%;width:46%;height:46%;z-index:1;";
  } else {
    tokens.forEach((t, i) => {
      if (i > 0) t.style.display = "none";
    });
    tokens[0].style.cssText += ";position:absolute;inset:8%;width:84%;height:84%;z-index:1;";
    const badgeEl = document.createElement("div");
    badgeEl.className = "stack-badge";
    badgeEl.textContent = \`\xD7\${n}\`;
    cell.appendChild(badgeEl);
  }
}
function waitForTransitionEnd(el3, onSettle, fallbackMs = 400) {
  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    clearTimeout(fallbackTimer);
    onSettle();
  };
  el3.addEventListener("transitionend", settle, { once: true });
  const fallbackTimer = setTimeout(settle, fallbackMs);
}
function rectCenter(rect, origin) {
  return {
    x: rect.left + rect.width / 2 - origin.left,
    y: rect.top + rect.height / 2 - origin.top
  };
}
function deriveAttackFrom(prevCell, capCell) {
  if (!prevCell || !capCell) return "left";
  const a = prevCell.getBoundingClientRect();
  const b = capCell.getBoundingClientRect();
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? "left" : "right";
  return dy >= 0 ? "top" : "bottom";
}
function readTokenColor(playerIndex, tokenIndex, fallback) {
  const el3 = getTokenElement(playerIndex, tokenIndex);
  if (!el3) return fallback;
  const styled = el3.querySelector(\`[class*="player-fg-\${playerIndex}"]\`) || el3;
  const c = getComputedStyle(styled).color;
  return c && c !== "rgba(0, 0, 0, 0)" ? c : fallback;
}
function animateCaptureToHome(playerIndex, tokenIndex, attack) {
  const element = getTokenElement(playerIndex, tokenIndex);
  if (!element) return Promise.resolve();
  const sourceCell = element.parentElement;
  const homeCell = document.getElementById(getTokenContainerId(playerIndex, tokenIndex, -1));
  if (!homeCell) return Promise.resolve();
  const container = sourceCell ? sourceCell.closest(".board-wrap") : null;
  if (!container) return Promise.resolve();
  const attackerPlayerIndex = attack && attack.attackerPlayerIndex;
  const attackerTokenIndex = attack && attack.attackerTokenIndex;
  const prevCell = attack && attack.prevCellId ? document.getElementById(attack.prevCellId) : null;
  const containerRect = container.getBoundingClientRect();
  const startRect = element.getBoundingClientRect();
  const startSize = startRect.width;
  const capturePx = rectCenter(startRect, containerRect);
  const attackFrom = deriveAttackFrom(prevCell, sourceCell);
  const attackerColor = attackerPlayerIndex != null ? readTokenColor(attackerPlayerIndex, attackerTokenIndex || 0, "#cf4a3a") : "#cf4a3a";
  const defenderColor = readTokenColor(playerIndex, tokenIndex, "#2f9456");
  const prevVisibility = element.style.visibility;
  element.style.visibility = "hidden";
  clearStackStyles(element);
  delete element.dataset.moving;
  homeCell.appendChild(element);
  if (sourceCell && sourceCell !== homeCell) updateCellStacking(sourceCell);
  updateCellStacking(homeCell);
  const homeRect = element.getBoundingClientRect();
  const homeBasePx = rectCenter(homeRect, containerRect);
  const endScale = startSize ? homeRect.width / startSize : 1;
  return playKOCapture({
    container,
    capture: capturePx,
    homeBase: homeBasePx,
    attackerColor,
    defenderColor,
    attackFrom,
    // Fly at the victim's on-board size, then scale to the real token's
    // exact home-seat footprint so the overlay's final frame matches the
    // settled token — the flight IS the arrival, so no extra scale-in.
    pawnSize: startSize,
    endScale,
    duration: 900,
    shakeBoard: true
  }).then(() => {
    element.style.visibility = prevVisibility;
  });
}
function playFinishArrival(playerIndex, tokenIndex, sourceRect) {
  const element = getTokenElement(playerIndex, tokenIndex);
  if (!element) return Promise.resolve();
  const boardWrap = element.closest(".board-wrap");
  if (!boardWrap) return Promise.resolve();
  const finalRect = element.getBoundingClientRect();
  const containerRect = boardWrap.getBoundingClientRect();
  const cellSize = containerRect.width / 15;
  const src = sourceRect || finalRect;
  const sourceCenter = {
    x: src.left + src.width / 2 - containerRect.left,
    y: src.top + src.height / 2 - containerRect.top
  };
  const homeCenter = {
    x: finalRect.left + finalRect.width / 2 - containerRect.left,
    y: finalRect.top + finalRect.height / 2 - containerRect.top
  };
  const color = readTokenColor(playerIndex, tokenIndex, "#d97644");
  const finishCell = element.parentElement;
  const settledCount = finishCell ? finishCell.querySelectorAll(":scope > wc-token").length : 1;
  const isLastPawn = settledCount >= 4;
  element.style.visibility = "hidden";
  playFinishSound();
  return playHomeArrival({
    container: boardWrap,
    home: homeCenter,
    source: sourceCenter,
    color,
    // Match the real token at both ends: start at the pre-move size
    // (~one cell), then shrink to the finish slot's settled size. The
    // finish cell stacks tokens far smaller than a cell, so endScale
    // carries the pawn down to the live token's final footprint.
    pawnSize: src.width,
    endScale: finalRect.width / src.width,
    // Confetti/ring/label spread is independent of the (tiny) finish-slot
    // pawn so the burst flies out across the board, not a small cluster.
    burstSize: cellSize * 2.5,
    duration: 1400,
    flashBoard: isLastPawn
  }).then(() => {
    element.style.visibility = "";
  });
}
function playYardLaunch(playerIndex, tokenIndex, entryCellId) {
  const element = getTokenElement(playerIndex, tokenIndex);
  if (!element) return Promise.resolve();
  const finalContainer = document.getElementById(entryCellId);
  if (!finalContainer) return Promise.resolve();
  const boardWrap = element.closest(".board-wrap");
  if (!boardWrap) return Promise.resolve();
  const sourceCell = element.parentElement;
  const containerRect = boardWrap.getBoundingClientRect();
  const yardRect = element.getBoundingClientRect();
  const entryRect = finalContainer.getBoundingClientRect();
  const cellSize = containerRect.width / 15;
  const yardCenter = {
    x: yardRect.left + yardRect.width / 2 - containerRect.left,
    y: yardRect.top + yardRect.height / 2 - containerRect.top
  };
  const entryCenter = {
    x: entryRect.left + entryRect.width / 2 - containerRect.left,
    y: entryRect.top + entryRect.height / 2 - containerRect.top
  };
  const color = readTokenColor(playerIndex, tokenIndex, "#d97644");
  element.dataset.moving = "true";
  element.style.visibility = "hidden";
  playLaunchSound();
  return playPawnLaunch({
    container: boardWrap,
    yard: yardCenter,
    entry: entryCenter,
    color,
    // Match the real on-board token: a wc-token fills one cell (square),
    // so the launch pawn is cellSize too — same shape, size and centered
    // position as the live token at both the yard and entry endpoints.
    pawnSize: cellSize,
    duration: 1200,
    // No 'GO!' chip — the leap + shockwave + dust already read as
    // "this pawn just launched" and the chip stole focus from the
    // pawn settling on its entry cell.
    label: ""
  }).then(() => {
    clearStackStyles(element);
    delete element.dataset.moving;
    finalContainer.appendChild(element);
    if (sourceCell && sourceCell !== finalContainer) {
      updateCellStacking(sourceCell);
    }
    updateCellStacking(finalContainer);
    element.style.visibility = "";
  });
}
function updateTokenContainer(playerIndex, tokenIndex, currentTokenPosition, newTokenPosition) {
  const path = getContainerPath(playerIndex, tokenIndex, currentTokenPosition, newTokenPosition);
  const element = getTokenElement(playerIndex, tokenIndex);
  if (currentTokenPosition === -1 && newTokenPosition === 0) {
    return playYardLaunch(playerIndex, tokenIndex, path[path.length - 1]);
  }
  return new Promise((resolve) => {
    if (path.length === 0) {
      resolve();
      return;
    }
    const finalContainer = document.getElementById(path[path.length - 1]);
    const sourceCell = element.parentElement;
    element.dataset.moving = "true";
    const visualRect = element.getBoundingClientRect();
    clearStackStyles(element);
    updateCellStacking(sourceCell);
    element.style.willChange = "transform";
    element.style.position = "relative";
    element.style.zIndex = "50";
    const originRect = element.getBoundingClientRect();
    const compDx = visualRect.left - originRect.left;
    const compDy = visualRect.top - originRect.top;
    if (Math.abs(compDx) > 0.5 || Math.abs(compDy) > 0.5) {
      element.style.transition = "none";
      element.style.transform = \`translate(\${compDx}px, \${compDy}px)\`;
      void element.offsetWidth;
      element.style.transition = "";
    }
    const fallbackMs = 400;
    let stepIndex = 0;
    function step() {
      if (stepIndex >= path.length) {
        element.style.willChange = "";
        element.style.position = "";
        element.style.zIndex = "";
        element.style.transition = "";
        element.style.removeProperty("transform");
        finalContainer.appendChild(element);
        delete element.dataset.moving;
        updateCellStacking(finalContainer);
        resolve();
        return;
      }
      playStepSound();
      const isFinalStep = stepIndex === path.length - 1;
      const targetId = path[stepIndex];
      const isFinishCell = FINISH_CELL_ID_RE.test(targetId);
      if (isFinalStep && isFinishCell) {
        const targetContainer2 = document.getElementById(targetId);
        const preRect = element.getBoundingClientRect();
        element.style.transition = "none";
        element.style.transform = "";
        element.style.position = "";
        element.style.zIndex = "";
        element.style.willChange = "";
        targetContainer2.appendChild(element);
        delete element.dataset.moving;
        updateCellStacking(targetContainer2);
        playFinishArrival(playerIndex, tokenIndex, preRect).then(resolve);
        return;
      }
      const targetContainer = document.getElementById(targetId);
      const targetRect = targetContainer.getBoundingClientRect();
      const offsetX = targetRect.left - originRect.left;
      const offsetY = targetRect.top - originRect.top;
      element.style.transform = \`translate(\${offsetX}px, \${offsetY}px)\`;
      waitForTransitionEnd(element, () => {
        stepIndex++;
        requestAnimationFrame(step);
      }, fallbackMs);
    }
    requestAnimationFrame(step);
  });
}
var _bouncingTokens = /* @__PURE__ */ new Set();
function activateToken(currentPlayerIndex, tokenIndex) {
  const tokenElement = getTokenElement(currentPlayerIndex, tokenIndex);
  const inner = tokenElement.children[0];
  inner.classList.add("animate-bounce");
  inner.style.zIndex = "20";
  _bouncingTokens.add(inner);
}
function inactiveTokens() {
  _bouncingTokens.forEach((element) => {
    element.classList.remove("animate-bounce");
    element.style.removeProperty("z-index");
  });
  _bouncingTokens.clear();
}
function activateDice() {
  document.getElementById("wc-dice").dataset.active = "true";
}
function inactiveDice() {
  document.getElementById("wc-dice").dataset.active = "false";
}
var _wakeLock = null;
var _wakeWanted = false;
var _wakeListenerAttached = false;
async function _acquireWakeLock() {
  if (!("wakeLock" in navigator)) return;
  if (_wakeLock || document.visibilityState !== "visible") return;
  try {
    _wakeLock = await navigator.wakeLock.request("screen");
    _wakeLock.addEventListener("release", () => {
      _wakeLock = null;
    });
  } catch (e) {
  }
}
function requestWakeLock() {
  _wakeWanted = true;
  if (!_wakeListenerAttached) {
    document.addEventListener("visibilitychange", () => {
      if (_wakeWanted && document.visibilityState === "visible") _acquireWakeLock();
    });
    _wakeListenerAttached = true;
  }
  _acquireWakeLock();
}
function releaseWakeLock() {
  _wakeWanted = false;
  if (_wakeLock) {
    _wakeLock.release().catch(() => {
    });
    _wakeLock = null;
  }
}
function showGame() {
  document.getElementById("main-menu").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
  replaceTo("game");
  requestWakeLock();
}
var PAWN_SVG_MINI = (playerIndex) => \`
    <svg viewBox="0 0 32 32" class="player-fg-\${playerIndex}" style="width:100%;height:100%;filter:drop-shadow(0 1px 1px rgba(0,0,0,0.22));">
        <ellipse cx="16" cy="28" rx="8" ry="1.5" fill="rgba(0,0,0,0.18)"/>
        <path d="M16 4c3.2 0 5.5 2.4 5.5 5.2 0 1.8-1 3.2-2.4 4 1.7.7 2.9 1.8 3.6 3.4l1.1 2.6c.4 1 .1 2-.7 2.4-.2.1-.4.1-.6.1H9.5c-.9 0-1.6-.7-1.6-1.6 0-.3.1-.6.2-.9l1.1-2.6c.7-1.6 1.9-2.7 3.6-3.4-1.4-.8-2.4-2.2-2.4-4C10.4 6.4 12.8 4 16 4z" fill="currentColor"/>
        <rect x="7.5" y="22" width="17" height="3.5" rx="1.4" fill="currentColor"/>
    </svg>\`;
var botGlyph = (size) => \`<svg width="\${size}" height="\${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>\`;
var humanGlyph = (size) => \`<svg width="\${size}" height="\${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>\`;
var playerTypeGlyph = (type, size) => type === "BOT" ? botGlyph(size) : humanGlyph(size);
var playerTypeLabel = (type) => type === "BOT" ? "Bot" : "Human";
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
function renderPauseScoreboard() {
  const board = document.getElementById("pm-scoreboard");
  if (!board) return;
  if (!_playerTypes) {
    board.innerHTML = "";
    return;
  }
  const currentIdx = _getCurrentPlayerIndex ? _getCurrentPlayerIndex() : -1;
  const rows = [];
  _playerTypes.forEach((type, idx) => {
    if (!type) return;
    const finished = _getFinishedCount ? _getFinishedCount(idx) : 0;
    const name = playerDisplayName(idx);
    const isActive = idx === currentIdx;
    const dotCls = isActive ? \`player-bg-\${idx}\` : "pm-finish-dot--idle";
    const tag = isActive ? \`<span class="pm-upnext">Up next</span>\` : "";
    const typeBadge = \`
            <span class="pm-type">
                \${playerTypeGlyph(type, 12)}
                \${playerTypeLabel(type)}
            </span>\`;
    rows.push(\`
            <div class="pm-row">
                <div class="pm-pawn">\${PAWN_SVG_MINI(idx)}</div>
                <div class="pm-body">
                    <div class="pm-name-row">
                        <span class="pm-name">\${escapeHtml(name)}</span>
                        \${tag}
                    </div>
                    \${typeBadge}
                </div>
                <div class="pm-finish">
                    <span class="pm-finish-count">\${finished}<span class="pm-finish-count-total">/4</span></span>
                    <span class="pm-finish-dot \${dotCls}"></span>
                </div>
            </div>\`);
  });
  board.innerHTML = rows.join("");
}
function showPauseMenu() {
  const overlay = document.getElementById("pause-menu");
  const turnEl = overlay.querySelector("#pm-turn-count");
  if (turnEl) turnEl.textContent = \`Turn \${turnCount}\`;
  renderPauseScoreboard();
  overlay.classList.remove("hidden");
  releaseWakeLock();
}
function resumeGame() {
  const overlay = document.getElementById("pause-menu");
  overlay.classList.add("hidden");
  requestWakeLock();
}
function applyColorMap(colorMap) {
  const root = document.documentElement;
  colorMap.forEach((originalColor, position) => {
    root.style.setProperty(\`--player-\${position}\`, \`var(--base-color-\${originalColor})\`);
    root.style.setProperty(\`--player-\${position}-light\`, \`var(--base-color-\${originalColor}-light)\`);
    root.style.setProperty(\`--player-\${position}-path\`, \`var(--base-color-\${originalColor}-light)\`);
  });
}
var turnCount = 0;
var _playerTypes = null;
var _playerNames = ["", "", "", ""];
function playerDisplayName(idx) {
  return _playerNames[idx] && String(_playerNames[idx]).trim() || \`P\${idx + 1}\`;
}
var _getCurrentPlayerIndex = null;
var _getFinishedCount = null;
var _lastRollByPlayer = [null, null, null, null];
function setLastRoll(playerIndex, value) {
  if (playerIndex >= 0 && playerIndex < 4) _lastRollByPlayer[playerIndex] = value;
}
function resetLastRolls() {
  _lastRollByPlayer = [null, null, null, null];
}
var DIE_PIPS = {
  1: [[2, 2]],
  2: [[1, 1], [3, 3]],
  3: [[1, 1], [2, 2], [3, 3]],
  4: [[1, 1], [1, 3], [3, 1], [3, 3]],
  5: [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]],
  6: [[1, 1], [1, 3], [2, 1], [2, 3], [3, 1], [3, 3]]
};
function staticDieMarkup(value) {
  const pips = (DIE_PIPS[value] || []).map(([r, c]) => \`<div class="dice-dot" style="grid-row:\${r};grid-column:\${c};"></div>\`).join("");
  return \`<div class="die"><div class="dice-face">\${pips}</div></div>\`;
}
function initRailDeps(pt, getCpi, getFC) {
  _playerTypes = pt;
  _getCurrentPlayerIndex = getCpi;
  _getFinishedCount = getFC;
}
function setPlayerNames(names) {
  _playerNames = Array.isArray(names) ? names.slice(0, 4) : ["", "", "", ""];
}
var CORNER_CFG = [
  { anchor: "b0", layout: "DT" },
  // top-left   (dice on left toward home)
  { anchor: "b1", layout: "TD" },
  // top-right  (dice on right toward home)
  { anchor: "b2", layout: "TD" },
  // bottom-right
  { anchor: "b3", layout: "DT" }
  // bottom-left
];
function pillMarkup(idx, finished, active) {
  const type = _playerTypes ? _playerTypes[idx] : null;
  const glyph = \`<span class="corner-pill-glyph">\${playerTypeGlyph(type, 14)}</span>\`;
  const cls = active ? \`corner-pill corner-pill--active player-bg-\${idx}\` : \`corner-pill\`;
  const name = playerDisplayName(idx);
  const safe = escapeHtml(name);
  return \`
        <div class="\${cls}">
            \${glyph}
            <div class="corner-pill-name">\${safe}</div>
        </div>\`;
}
function updateCornerWidgets() {
  if (!_playerTypes) return;
  const pi = _getCurrentPlayerIndex();
  const dice = document.getElementById("wc-dice");
  if (dice && dice.parentElement) dice.parentElement.removeChild(dice);
  CORNER_CFG.forEach(({ anchor, layout }, idx) => {
    const el3 = document.getElementById(anchor);
    if (!el3) return;
    el3.innerHTML = "";
    const wrap = document.createElement("div");
    if (!_playerTypes[idx]) {
      // ── Inactive slot: show greyed-out "Not Playing" widget ──
      wrap.className = "corner-widget corner-widget--inactive";
      const diceSlot = document.createElement("div");
      diceSlot.className = \`corner-dice corner-dice--not-playing player-bg-\${idx}\`;
      diceSlot.innerHTML = \`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>\`;
      const pillEl = document.createElement("div");
      pillEl.className = "corner-pill corner-pill--not-playing";
      pillEl.innerHTML = \`<span class="corner-pill-not-playing-icon">✕</span><span class="corner-pill-not-playing-text">Not Playing</span>\`;
      if (layout === "TD") {
        wrap.appendChild(pillEl);
        wrap.appendChild(diceSlot);
      } else {
        wrap.appendChild(diceSlot);
        wrap.appendChild(pillEl);
      }
      el3.appendChild(wrap);
      return;
    }
    const isActive = idx === pi;
    const finished = _getFinishedCount(idx);
    wrap.className = "corner-widget";
    const pill = document.createElement("div");
    pill.innerHTML = pillMarkup(idx, finished, isActive);
    const pillEl = pill.firstElementChild;
    const diceBtn = document.createElement("div");
    if (isActive) {
      var _mpWaiting = _mp.enabled && idx !== _mp.myPlayerIndex;
      if (_mpWaiting) {
        diceBtn.className = \`corner-dice corner-dice--active player-bg-\${idx} active-dice-pulse\`;
        diceBtn.style.setProperty("--pulse-color", \`hsl(var(--player-\${idx}) / 0.55)\`);
        diceBtn.style.opacity = "0.72";
        diceBtn.title = "Opponent rolling…";
        if (dice) {
          dice.style.cssText = "width:100%;height:100%;pointer-events:none;";
          dice.className = "";
          dice.dataset.active = "false";
          diceBtn.appendChild(dice);
        }
      } else {
        diceBtn.className = \`corner-dice corner-dice--active player-bg-\${idx} active-dice-pulse\`;
        diceBtn.style.setProperty("--pulse-color", \`hsl(var(--player-\${idx}) / 0.55)\`);
        if (dice) {
          dice.style.cssText = "width:100%;height:100%;";
          dice.className = "";
          dice.dataset.active = "true";
          diceBtn.appendChild(dice);
        }
      }
    } else {
      const lastRoll = _lastRollByPlayer[idx];
      if (lastRoll) {
        diceBtn.className = \`corner-dice corner-dice--rolled player-border-\${idx}\`;
        diceBtn.innerHTML = staticDieMarkup(lastRoll);
      } else {
        diceBtn.className = \`corner-dice corner-dice--idle player-bg-\${idx}\`;
      }
    }
    if (layout === "TD") {
      wrap.appendChild(pillEl);
      wrap.appendChild(diceBtn);
    } else {
      wrap.appendChild(diceBtn);
      wrap.appendChild(pillEl);
    }
    el3.appendChild(wrap);
  });
}
function updateTurnCounter() {
  turnCount++;
  const el3 = document.getElementById("turn-counter");
  if (el3) el3.textContent = \`Turn \${turnCount}\`;
}
function resetTurnCount() {
  turnCount = 0;
}
function getTurnCount() {
  return turnCount;
}
function setTurnCount(n) {
  turnCount = Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}
function moveDice() {
  updateCornerWidgets();
}

// attached_assets/leludo-main/leludo-main/scripts/game-state.js
var PHASES = Object.freeze({
  AWAITING_ROLL: "AWAITING_ROLL",
  ROLLING: "ROLLING",
  AWAITING_SELECTION: "AWAITING_SELECTION",
  ANIMATING: "ANIMATING",
  TURN_TRANSITION: "TURN_TRANSITION",
  GAME_ENDED: "GAME_ENDED"
});
function initialGameState() {
  return {
    quickStartId: null,
    playerNames: new Array(4).fill(""),
    playerTypes: new Array(4),
    botPersonalities: new Array(4).fill(null),
    playerTokenPositions: new Array(4),
    currentPlayerIndex: 2,
    currentDiceRoll: 1,
    consecutiveSixesCount: 0,
    playerRanks: new Array(4).fill(0),
    playerTimes: new Array(4).fill(0),
    playerCaptures: new Array(4).fill(0),
    lastRank: 0,
    // Per-game stats feeding the end-of-game highlight reel
    // (wc-game-end). All reset on GAME_STARTED/RESTARTED.
    sentHomeCount: new Array(4).fill(0),
    firstHomeStretchTurn: new Array(4).fill(-1),
    firstFinishTurn: new Array(4).fill(-1),
    distanceTraveled: new Array(4).fill(0),
    pawnsAtBaseAtTurn20: new Array(4).fill(-1),
    bestDiceStreak: new Array(4).fill(null),
    currentDiceStreak: null,
    gameStartedAt: 0,
    turnCount: 0,
    winnerIndex: -1,
    assistFlags: {
      autoRollDice: false,
      autoMoveSingleOption: false,
      autoMoveOutOfHome: true
    },
    phase: PHASES.AWAITING_ROLL,
    movableTokenIndexes: []
  };
}
var state = initialGameState();
var playerTypes = state.playerTypes;
var playerRanks = state.playerRanks;
var playerTimes = state.playerTimes;
var playerCaptures = state.playerCaptures;
var playerNames = state.playerNames;
var botPersonalities = state.botPersonalities;
var sentHomeCount = state.sentHomeCount;
var firstHomeStretchTurn = state.firstHomeStretchTurn;
var firstFinishTurn = state.firstFinishTurn;
var distanceTraveled = state.distanceTraveled;
var pawnsAtBaseAtTurn20 = state.pawnsAtBaseAtTurn20;
var bestDiceStreak = state.bestDiceStreak;

// attached_assets/leludo-main/leludo-main/scripts/game-reducer.js
var EVENTS = Object.freeze({
  GAME_STARTED: "GAME_STARTED",
  GAME_RESUMED: "GAME_RESUMED",
  GAME_RESTARTED: "GAME_RESTARTED",
  DICE_ROLLED: "DICE_ROLLED",
  THREE_SIXES_LOST: "THREE_SIXES_LOST",
  MOVABLE_TOKENS_DETERMINED: "MOVABLE_TOKENS_DETERMINED",
  TOKEN_MOVED: "TOKEN_MOVED",
  TOKEN_CAPTURED: "TOKEN_CAPTURED",
  PLAYER_FINISHED: "PLAYER_FINISHED",
  LEFTOVER_RANKED: "LEFTOVER_RANKED",
  GAME_ENDED: "GAME_ENDED",
  TURN_ADVANCED: "TURN_ADVANCED",
  TURN_REPEATS: "TURN_REPEATS",
  ASSIST_FLAG_CHANGED: "ASSIST_FLAG_CHANGED",
  GAME_PAUSED: "GAME_PAUSED",
  GAME_RESUMED_FROM_PAUSE: "GAME_RESUMED_FROM_PAUSE",
  DICE_ROLL_STARTED: "DICE_ROLL_STARTED",
  GOD_TELEPORTED: "GOD_TELEPORTED"
});
function resetArraysInPlace(state2) {
  for (let i = 0; i < 4; i++) {
    state2.playerNames[i] = "";
    state2.playerTypes[i] = void 0;
    state2.botPersonalities[i] = null;
    state2.playerTokenPositions[i] = void 0;
    state2.playerRanks[i] = 0;
    state2.playerTimes[i] = 0;
    state2.playerCaptures[i] = 0;
    state2.sentHomeCount[i] = 0;
    state2.firstHomeStretchTurn[i] = -1;
    state2.firstFinishTurn[i] = -1;
    state2.distanceTraveled[i] = 0;
    state2.pawnsAtBaseAtTurn20[i] = -1;
    state2.bestDiceStreak[i] = null;
  }
  state2.currentDiceStreak = null;
}
function reducer(state2, event) {
  switch (event.type) {
    case EVENTS.GAME_STARTED: {
      state2.quickStartId = event.quickStartId;
      state2.gameStartedAt = event.gameStartedAt;
      state2.lastRank = 0;
      state2.consecutiveSixesCount = 0;
      state2.currentDiceRoll = 1;
      state2.turnCount = 0;
      state2.winnerIndex = -1;
      state2.phase = PHASES.AWAITING_ROLL;
      for (let i = 0; i < 4; i++) {
        state2.playerTypes[i] = event.playerTypes[i];
        state2.botPersonalities[i] = event.botPersonalities[i] ?? null;
        state2.playerNames[i] = event.playerNames[i] || "";
        state2.playerRanks[i] = 0;
        state2.playerTimes[i] = 0;
        state2.playerCaptures[i] = 0;
        state2.sentHomeCount[i] = 0;
        state2.firstHomeStretchTurn[i] = -1;
        state2.firstFinishTurn[i] = -1;
        state2.distanceTraveled[i] = 0;
        state2.pawnsAtBaseAtTurn20[i] = -1;
        state2.bestDiceStreak[i] = null;
        state2.playerTokenPositions[i] = event.playerTokenPositions[i] ? event.playerTokenPositions[i].slice() : void 0;
      }
      state2.currentDiceStreak = null;
      state2.currentPlayerIndex = event.currentPlayerIndex;
      return state2;
    }
    case EVENTS.GAME_RESUMED: {
      state2.quickStartId = event.quickStartId;
      state2.gameStartedAt = event.gameStartedAt;
      state2.lastRank = event.lastRank;
      state2.consecutiveSixesCount = event.consecutiveSixesCount;
      state2.currentDiceRoll = event.currentDiceRoll;
      state2.turnCount = event.turnCount || 0;
      state2.currentPlayerIndex = event.currentPlayerIndex;
      state2.winnerIndex = -1;
      state2.phase = PHASES.AWAITING_ROLL;
      for (let i = 0; i < 4; i++) {
        state2.playerTypes[i] = event.playerTypes[i];
        state2.botPersonalities[i] = event.botPersonalities[i] ?? null;
        state2.playerNames[i] = event.playerNames[i] || "";
        state2.playerRanks[i] = event.playerRanks[i] ?? 0;
        state2.playerTimes[i] = event.playerTimes[i] ?? 0;
        state2.playerCaptures[i] = event.playerCaptures[i] ?? 0;
        state2.sentHomeCount[i] = 0;
        state2.firstHomeStretchTurn[i] = -1;
        state2.firstFinishTurn[i] = -1;
        state2.distanceTraveled[i] = 0;
        state2.pawnsAtBaseAtTurn20[i] = -1;
        state2.bestDiceStreak[i] = null;
        state2.playerTokenPositions[i] = event.playerTokenPositions[i] ? event.playerTokenPositions[i].slice() : void 0;
      }
      state2.currentDiceStreak = null;
      return state2;
    }
    case EVENTS.GAME_RESTARTED: {
      resetArraysInPlace(state2);
      state2.quickStartId = null;
      state2.lastRank = 0;
      state2.consecutiveSixesCount = 0;
      state2.currentDiceRoll = 1;
      state2.turnCount = 0;
      state2.winnerIndex = -1;
      state2.phase = PHASES.AWAITING_ROLL;
      return state2;
    }
    case EVENTS.DICE_ROLL_STARTED: {
      state2.phase = PHASES.ROLLING;
      return state2;
    }
    case EVENTS.DICE_ROLLED: {
      state2.currentDiceRoll = event.value;
      if (event.value === 6) state2.consecutiveSixesCount++;
      else state2.consecutiveSixesCount = 0;
      const pi = state2.currentPlayerIndex;
      const prev = state2.currentDiceStreak;
      if (prev && prev.playerIndex === pi && prev.value === event.value) {
        prev.length++;
      } else {
        state2.currentDiceStreak = {
          playerIndex: pi,
          value: event.value,
          length: 1,
          atTurn: state2.turnCount
        };
      }
      const cur = state2.currentDiceStreak;
      const best = state2.bestDiceStreak[pi];
      if (!best || cur.length > best.length) {
        state2.bestDiceStreak[pi] = {
          value: cur.value,
          length: cur.length,
          atTurn: cur.atTurn
        };
      }
      return state2;
    }
    case EVENTS.THREE_SIXES_LOST: {
      state2.consecutiveSixesCount = 0;
      return state2;
    }
    case EVENTS.TOKEN_MOVED: {
      state2.playerTokenPositions[event.playerIndex][event.tokenIndex] = event.toPosition;
      state2.phase = PHASES.ANIMATING;
      const pi = event.playerIndex;
      if (event.fromPosition >= 0 && event.toPosition >= 0) {
        state2.distanceTraveled[pi] += event.toPosition - event.fromPosition;
      } else if (event.fromPosition === -1 && event.toPosition >= 0) {
        state2.distanceTraveled[pi] += 1;
      }
      if (event.fromPosition < 51 && event.toPosition >= 51 && event.toPosition <= 56) {
        if (state2.firstHomeStretchTurn[pi] === -1) {
          state2.firstHomeStretchTurn[pi] = state2.turnCount;
        }
      }
      if (event.toPosition === 56 && state2.firstFinishTurn[pi] === -1) {
        state2.firstFinishTurn[pi] = state2.turnCount;
      }
      return state2;
    }
    case EVENTS.TOKEN_CAPTURED: {
      state2.playerTokenPositions[event.capturedPlayerIndex][event.capturedTokenIndex] = -1;
      state2.playerCaptures[event.byPlayerIndex]++;
      state2.sentHomeCount[event.capturedPlayerIndex]++;
      return state2;
    }
    case EVENTS.PLAYER_FINISHED: {
      state2.playerRanks[event.playerIndex] = event.rank;
      state2.playerTimes[event.playerIndex] = event.time;
      state2.lastRank = event.rank;
      if (state2.winnerIndex === -1) state2.winnerIndex = event.playerIndex;
      return state2;
    }
    case EVENTS.LEFTOVER_RANKED: {
      state2.playerRanks[event.playerIndex] = event.rank;
      state2.playerTimes[event.playerIndex] = event.time;
      state2.lastRank = event.rank;
      return state2;
    }
    case EVENTS.GAME_ENDED: {
      if (event.winnerIndex !== void 0 && state2.winnerIndex === -1) {
        state2.winnerIndex = event.winnerIndex;
      }
      state2.phase = PHASES.GAME_ENDED;
      return state2;
    }
    case EVENTS.TURN_ADVANCED: {
      state2.currentPlayerIndex = event.nextPlayerIndex;
      state2.consecutiveSixesCount = 0;
      state2.phase = PHASES.AWAITING_ROLL;
      state2.movableTokenIndexes = [];
      state2.turnCount++;
      state2.currentDiceStreak = null;
      if (state2.turnCount === 20) {
        for (let i = 0; i < 4; i++) {
          if (state2.pawnsAtBaseAtTurn20[i] !== -1) continue;
          if (!state2.playerTypes[i] || !state2.playerTokenPositions[i]) continue;
          state2.pawnsAtBaseAtTurn20[i] = state2.playerTokenPositions[i].filter((p) => p === -1).length;
        }
      }
      return state2;
    }
    case EVENTS.TURN_REPEATS: {
      state2.phase = PHASES.AWAITING_ROLL;
      state2.movableTokenIndexes = [];
      return state2;
    }
    case EVENTS.MOVABLE_TOKENS_DETERMINED: {
      state2.movableTokenIndexes = event.tokenIndexes.slice();
      state2.phase = PHASES.AWAITING_SELECTION;
      return state2;
    }
    // Pause/resume MUST NOT touch state.phase. Pausing is enforced
    // entirely by the scheduler's _paused flag + the isGameLogicPaused()
    // guards in rollDice/selectToken. phase always reflects the TRUE game
    // state so that resumeAutoplay (in bot-listener) can re-derive the
    // pending action from it on resume.
    //
    // The old code stashed phase and swapped it to 'PAUSED', then restored
    // it on resume. That clobbered legitimate phase advances made by
    // in-flight animations that complete DURING the pause (their .then
    // chains emit MOVABLE_TOKENS_DETERMINED / TURN_ADVANCED, which advance
    // phase past the stale snapshot). Restoring the snapshot rewound phase
    // to ROLLING/ANIMATING, which resumeAutoplay can't act on — the bot
    // froze and the game got stuck. These events are now reducer no-ops.
    case EVENTS.GAME_PAUSED:
    case EVENTS.GAME_RESUMED_FROM_PAUSE:
      return state2;
    case EVENTS.ASSIST_FLAG_CHANGED: {
      state2.assistFlags[event.flag] = event.value;
      return state2;
    }
    case EVENTS.GOD_TELEPORTED: {
      const row = state2.playerTokenPositions[event.playerIndex];
      if (row) row[event.tokenIndex] = event.toPosition;
      return state2;
    }
    default:
      return state2;
  }
}

// attached_assets/leludo-main/leludo-main/scripts/game-store.js
var listeners = /* @__PURE__ */ new Set();
var commandHandler = null;
function setCommandHandler(handler) {
  commandHandler = handler;
}
function emit(event) {
  reducer(state, event);
  for (const l of listeners) {
    try {
      l(event, state);
    } catch (e) {
      console.error("listener threw", e);
    }
  }
}
function dispatch(command) {
  if (!commandHandler) {
    throw new Error("No command handler registered");
  }
  const result = commandHandler(state, command, {}, emit);
  if (result && typeof result.then === "function") {
    return result;
  }
}
function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// attached_assets/leludo-main/leludo-main/scripts/bot-ai.js
var SAFE_SQUARES2 = new Set(SAFE_SQUARES);
var DICE_PROB = [0, 1 / 9, 2 / 9, 2 / 9, 1 / 9, 2 / 9, 2 / 9];
var DISCOUNT = 0.7;
var PERSONALITIES = {
  balanced: { home: 0, finished: 60, progress: 0.5, safe: 3, stack: 4, threat: 4, captureBonus: 10 },
  aggressive: { home: 0, finished: 50, progress: 0.7, safe: 1, stack: 2, threat: 1, captureBonus: 18 },
  defensive: { home: 0, finished: 60, progress: 0.3, safe: 6, stack: 7, threat: 8, captureBonus: 5 },
  rusher: { home: 0, finished: 80, progress: 1, safe: 1, stack: 1, threat: 2, captureBonus: 6 }
};
var PERSONALITY_KEYS = Object.keys(PERSONALITIES);
function randomPersonality() {
  return PERSONALITY_KEYS[Math.floor(Math.random() * PERSONALITY_KEYS.length)];
}
function countAt(arr, pos) {
  let n = 0;
  for (let i = 0; i < arr.length; i++) if (arr[i] === pos) n++;
  return n;
}
function markIndex(playerIndex, tokenPosition) {
  return (tokenPosition + 13 * playerIndex) % 52;
}
function threatCount(myPi, myTi, positions) {
  const p = positions[myPi][myTi];
  if (p < 0 || p > 50 || SAFE_SQUARES2.has(p)) return 0;
  const myMark = markIndex(myPi, p);
  let n = 0;
  for (let pi = 0; pi < 4; pi++) {
    if (!positions[pi] || pi === myPi) continue;
    for (let ti = 0; ti < 4; ti++) {
      const op = positions[pi][ti];
      if (op < 0 || op > 50) continue;
      const d = (myMark - markIndex(pi, op) + 52) % 52;
      if (d >= 1 && d <= 6) n++;
    }
  }
  return n;
}
function evalState(playerIndex, positions, w) {
  let score = 0;
  for (let pi = 0; pi < 4; pi++) {
    if (!positions[pi]) continue;
    const sign = pi === playerIndex ? 1 : -1;
    for (let ti = 0; ti < 4; ti++) {
      const p = positions[pi][ti];
      if (p === -1) {
        score += sign * w.home;
        continue;
      }
      if (p === 56) {
        score += sign * w.finished;
        continue;
      }
      score += sign * w.progress * p;
      if (p > 50 || SAFE_SQUARES2.has(p)) score += sign * w.safe;
      if (pi === playerIndex && countAt(positions[pi], p) >= 2) score += w.stack;
      if (sign === 1) score -= w.threat * threatCount(pi, ti, positions);
    }
  }
  return score;
}
function applyMove(playerIndex, tokenIndex, dice, positions) {
  const next = new Array(4);
  for (let i = 0; i < 4; i++) next[i] = positions[i] ? positions[i].slice() : positions[i];
  const cur = next[playerIndex][tokenIndex];
  const np = cur === -1 ? 0 : cur + dice;
  next[playerIndex][tokenIndex] = np;
  let caps = 0;
  if (np <= 50 && !SAFE_SQUARES2.has(np)) {
    const myMark = markIndex(playerIndex, np);
    for (let pi = 0; pi < 4; pi++) {
      if (!next[pi] || pi === playerIndex) continue;
      const hits = [];
      for (let ti = 0; ti < 4; ti++) {
        const op = next[pi][ti];
        if (op < 0 || op > 50) continue;
        if (markIndex(pi, op) === myMark) hits.push(ti);
      }
      if (hits.length === 1) {
        next[pi][hits[0]] = -1;
        caps++;
      }
    }
  }
  return { next, caps };
}
function legalMoves(playerIndex, dice, positions) {
  const moves = [];
  const seen = /* @__PURE__ */ new Set();
  for (let ti = 0; ti < 4; ti++) {
    const p = positions[playerIndex][ti];
    if (dice === 6 && p === -1) {
      if (!seen.has(-1)) {
        seen.add(-1);
        moves.push(ti);
      }
      continue;
    }
    if (p >= 0 && p + dice <= 56 && !seen.has(p)) {
      seen.add(p);
      moves.push(ti);
    }
  }
  return moves;
}
function nextActivePlayerIndex(pi, positions) {
  for (let k = 1; k <= 4; k++) {
    const j = (pi + k) % 4;
    if (positions[j] && positions[j].some((p) => p !== 56)) return j;
  }
  return -1;
}
function expectiOpponent(myIndex, positions, w) {
  const opp = nextActivePlayerIndex(myIndex, positions);
  if (opp === -1) return evalState(myIndex, positions, w);
  let exp = 0;
  for (let d = 1; d <= 6; d++) {
    const moves = legalMoves(opp, d, positions);
    let worstForMe;
    if (moves.length === 0) {
      worstForMe = evalState(myIndex, positions, w);
    } else {
      worstForMe = Infinity;
      for (const ti of moves) {
        const { next: np, caps } = applyMove(opp, ti, d, positions);
        const s = evalState(myIndex, np, w) - (w.captureBonus || 0) * caps;
        if (s < worstForMe) worstForMe = s;
      }
    }
    exp += DICE_PROB[d] * worstForMe;
  }
  return exp;
}
function pickBestMove(playerIndex, dice, positions, weights, depth = 1) {
  const moves = legalMoves(playerIndex, dice, positions);
  if (moves.length === 0) return -1;
  if (moves.length === 1) return moves[0];
  let bestScore = -Infinity;
  let best = moves[0];
  for (const ti of moves) {
    const { next, caps } = applyMove(playerIndex, ti, dice, positions);
    let s;
    if (depth > 0) {
      s = DISCOUNT * expectiOpponent(playerIndex, next, weights);
    } else {
      s = evalState(playerIndex, next, weights);
    }
    s += (weights.captureBonus || 0) * caps;
    if (s > bestScore) {
      bestScore = s;
      best = ti;
    }
  }
  return best;
}

// attached_assets/leludo-main/leludo-main/scripts/scheduler.js
var _paused = false;
var _pendingResume = null;
var _pendingTimers = /* @__PURE__ */ new Map();
function isGameLogicPaused() {
  return _paused;
}
function scheduleTurn(fn, delay) {
  if (_paused) {
    _pendingResume = fn;
    return;
  }
  const id = setTimeout(() => {
    _pendingTimers.delete(id);
    if (_paused) {
      _pendingResume = fn;
      return;
    }
    fn();
  }, delay);
  _pendingTimers.set(id, fn);
}
function pauseGameLogic() {
  _paused = true;
  for (const [id, fn] of _pendingTimers) {
    clearTimeout(id);
    _pendingResume = fn;
  }
  _pendingTimers.clear();
}
function resumeGameLogic() {
  _paused = false;
  const fn = _pendingResume;
  _pendingResume = null;
  if (fn) fn();
}

// attached_assets/leludo-main/leludo-main/scripts/command-handler.js
var COMMANDS = Object.freeze({
  START_GAME: "START_GAME",
  RESUME_SAVED_GAME: "RESUME_SAVED_GAME",
  ROLL_DICE: "ROLL_DICE",
  SELECT_TOKEN: "SELECT_TOKEN",
  PAUSE: "PAUSE",
  RESUME: "RESUME",
  RESTART_GAME: "RESTART_GAME",
  EXIT_TO_HOME: "EXIT_TO_HOME",
  SET_ASSIST_FLAG: "SET_ASSIST_FLAG",
  GOD_TELEPORT: "GOD_TELEPORT"
});
function canRoll() {
  return state.phase === PHASES.AWAITING_ROLL;
}
function canSelectToken(tokenIndex) {
  return state.phase === PHASES.AWAITING_SELECTION && state.movableTokenIndexes.includes(tokenIndex);
}
function isPlayerFinished2(playerIndex) {
  return isPlayerFinished(state.playerTokenPositions[playerIndex]);
}
function removeGameTokens() {
  const gameEnd = document.querySelector("wc-game-end");
  if (gameEnd) gameEnd.remove();
  document.querySelectorAll("wc-token").forEach((t) => t.remove());
  clearTokenElementCache();
}
function resetThemeChrome() {
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute("content", "#080808");
  document.body.style.background = "";
}
function resetGameDom() {
  removeGameTokens();
  resetLastRolls();
  const turnEl = document.getElementById("turn-counter");
  if (turnEl) turnEl.textContent = "Turn 0";
  const dice = document.getElementById("wc-dice");
  const diceHome = document.getElementById("dice-home");
  if (dice && diceHome && dice.parentElement !== diceHome) {
    diceHome.appendChild(dice);
  }
}
function startGame(quickStartId, namesByPlayerIndex, emit2) {
  resetGameDom();
  resetTurnCount();
  initRailDeps(state.playerTypes, getCurrentPlayerIndex, getFinishedCount2);
  const playerTypesResult = getPlayerTypes(quickStartId);
  const playerTypes2 = new Array(4);
  const botPersonalities2 = new Array(4).fill(null);
  const playerTokenPositions = new Array(4);
  playerTypesResult.playerTypes.forEach((pt, i) => {
    playerTypes2[i] = pt;
    botPersonalities2[i] = pt === "BOT" ? randomPersonality() : null;
    playerTokenPositions[i] = pt ? new Array(4).fill(-1) : void 0;
  });
  applyColorMap(playerTypesResult.colorMap);
  const playerNames2 = new Array(4).fill("");
  for (let i = 0; i < 4; i++) {
    playerNames2[i] = namesByPlayerIndex && namesByPlayerIndex[i] || "";
  }
  const startingPlayerIndex = selectStartingPlayer(playerTypes2);
  const params = new URLSearchParams(window.location.search);
  const initPositions = params.get("positions")?.split(",");
  if (initPositions) {
    for (let pi = 0; pi < 4; pi++) {
      if (!playerTokenPositions[pi]) continue;
      for (let ti = 0; ti < 4; ti++) {
        const v = initPositions[pi * 4 + ti];
        if (v !== void 0 && v !== "") playerTokenPositions[pi][ti] = +v;
      }
    }
  }
  const playerOverride = params.get("player");
  const currentPlayerIndex = playerOverride != null ? +playerOverride : startingPlayerIndex;
  emit2({
    type: EVENTS.GAME_STARTED,
    quickStartId,
    gameStartedAt: (/* @__PURE__ */ new Date()).getTime(),
    playerTypes: playerTypes2,
    botPersonalities: botPersonalities2,
    playerNames: playerNames2,
    playerTokenPositions,
    currentPlayerIndex
  });
  setPlayerNames(state.playerNames);
  showGame();
  const containersToRestack = /* @__PURE__ */ new Set();
  state.playerTypes.forEach((playerType, playerIndex) => {
    if (!playerType) return;
    state.playerTokenPositions[playerIndex].forEach((pos, tokenIndex) => {
      const token = document.createElement("wc-token");
      token.setAttribute("id", getTokenElementId(playerIndex, tokenIndex));
      const containerId = getTokenContainerId(playerIndex, tokenIndex, pos);
      const targetContainer = document.getElementById(containerId);
      if (targetContainer) {
        targetContainer.appendChild(token);
        containersToRestack.add(targetContainer);
      }
    });
  });
  containersToRestack.forEach((cell) => updateCellStacking(cell));
  moveDice(state.currentPlayerIndex);
}
function resumeSavedGame(emit2) {
  const saved = deserializeGameState(localStorage.getItem("ludo-save"));
  if (!saved) return;
  const playerTypes2 = saved.playerTypesArr.slice();
  const botPersonalities2 = saved.botPersonalitiesArr ? saved.botPersonalitiesArr.map((p) => p || null) : playerTypes2.map((t) => t === "BOT" ? randomPersonality() : null);
  const playerNames2 = (saved.playerNamesArr || []).map((n) => n || "");
  while (playerNames2.length < 4) playerNames2.push("");
  initRailDeps(state.playerTypes, getCurrentPlayerIndex, getFinishedCount2);
  const playerTypesResult = getPlayerTypes(saved.quickStartId);
  applyColorMap(playerTypesResult.colorMap);
  emit2({
    type: EVENTS.GAME_RESUMED,
    quickStartId: saved.quickStartId,
    gameStartedAt: saved.gameStartedAt,
    lastRank: saved.lastRank,
    consecutiveSixesCount: saved.consecutiveSixesCount,
    currentDiceRoll: saved.currentDiceRoll,
    turnCount: saved.turnCount,
    currentPlayerIndex: saved.currentPlayerIndex,
    playerTypes: playerTypes2,
    botPersonalities: botPersonalities2,
    playerNames: playerNames2,
    playerTokenPositions: saved.positions,
    playerRanks: saved.ranksArr,
    playerTimes: saved.timesArr,
    playerCaptures: saved.capturesArr
  });
  setTurnCount(state.turnCount);
  setPlayerNames(state.playerNames);
  showGame();
  const containersToRestack = /* @__PURE__ */ new Set();
  state.playerTypes.forEach((playerType, playerIndex) => {
    if (!playerType || !state.playerTokenPositions[playerIndex]) return;
    state.playerTokenPositions[playerIndex].forEach((pos, tokenIndex) => {
      const token = document.createElement("wc-token");
      token.setAttribute("id", getTokenElementId(playerIndex, tokenIndex));
      const containerId = getTokenContainerId(playerIndex, tokenIndex, pos);
      const container = document.getElementById(containerId);
      if (container) {
        container.appendChild(token);
        containersToRestack.add(container);
      }
    });
  });
  containersToRestack.forEach((cell) => updateCellStacking(cell));
  if (shouldEndGame(state.playerTypes, state.playerTokenPositions)) {
    document.getElementById("game-container").appendChild(document.createElement("wc-game-end"));
    document.getElementById("game").classList.add("hidden");
    releaseWakeLock();
    goTo("game-end");
    return;
  }
  if (isPlayerFinished(state.playerTokenPositions[state.currentPlayerIndex])) {
    advanceToNextPlayer(emit2);
  }
  moveDice(state.currentPlayerIndex);
}
function rollDice(emit2) {
  if (isGameLogicPaused()) return;
  if (!canRoll()) return;
  emit2({ type: EVENTS.DICE_ROLL_STARTED });
  return animateDiceRoll(state.currentDiceRoll).then(() => {
    const lastDiceRoll = state.currentDiceRoll;
    // _externalDiceValue is set by the multiplayer bridge for remote-player dice results.
    const newRoll = (_externalDiceValue !== null && _externalDiceValue !== undefined)
      ? +_externalDiceValue
      : generateDiceRoll();
    _externalDiceValue = null;
    emit2({ type: EVENTS.DICE_ROLLED, value: newRoll });
    updateDiceFace(lastDiceRoll, state.currentDiceRoll);
    setLastRoll(state.currentPlayerIndex, state.currentDiceRoll);
    handleAfterDiceRoll(emit2);
  });
}
function handleAfterDiceRoll(emit2) {
  if (state.consecutiveSixesCount === 3) {
    emit2({ type: EVENTS.THREE_SIXES_LOST });
    advanceToNextPlayer(emit2);
    return;
  }
  const movableTokenIndexes = [];
  state.playerTokenPositions[state.currentPlayerIndex].forEach((tokenPosition, tokenIndex) => {
    if (isTokenMovable(tokenPosition, state.currentDiceRoll)) {
      activateToken(state.currentPlayerIndex, tokenIndex);
      movableTokenIndexes.push(tokenIndex);
    }
  });
  if (movableTokenIndexes.length === 0) {
    advanceToNextPlayer(emit2);
    return;
  }
  inactiveDice();
  emit2({
    type: EVENTS.MOVABLE_TOKENS_DETERMINED,
    playerIndex: state.currentPlayerIndex,
    tokenIndexes: movableTokenIndexes
  });
}
async function selectToken(playerIndex, tokenIndex, emit2) {
  if (isGameLogicPaused()) return;
  if (!canSelectToken(tokenIndex)) return;
  inactiveTokens();
  const tokenOldPosition = state.playerTokenPositions[state.currentPlayerIndex][tokenIndex];
  const tokenNewPosition = getTokenNewPosition(tokenOldPosition, state.currentDiceRoll);
  emit2({
    type: EVENTS.TOKEN_MOVED,
    playerIndex: state.currentPlayerIndex,
    tokenIndex,
    fromPosition: tokenOldPosition,
    toPosition: tokenNewPosition
  });
  const tripComplete = isTripComplete(tokenNewPosition);
  const otherPlayerTokensOnThatMarkIndex = findCapturedOpponents(playerIndex, tokenNewPosition, state.playerTokenPositions);
  for (const [pi, pt] of otherPlayerTokensOnThatMarkIndex.entries()) {
    for (const ti of pt) {
      const t = getTokenElement(pi, ti);
      if (t) pinTokenForCapture(t);
    }
  }
  await updateTokenContainer(playerIndex, tokenIndex, tokenOldPosition, tokenNewPosition);
  const prevPos = tokenNewPosition > 0 ? tokenNewPosition - 1 : tokenNewPosition;
  const attack = {
    attackerPlayerIndex: state.currentPlayerIndex,
    attackerTokenIndex: tokenIndex,
    prevCellId: getTokenContainerId(state.currentPlayerIndex, tokenIndex, prevPos)
  };
  let captureCount = 0;
  for (const [pi, pt] of otherPlayerTokensOnThatMarkIndex.entries()) {
    for (const ti of pt) {
      emit2({
        type: EVENTS.TOKEN_CAPTURED,
        byPlayerIndex: state.currentPlayerIndex,
        capturedPlayerIndex: pi,
        capturedTokenIndex: ti
      });
      await animateCaptureToHome(pi, ti, attack);
      captureCount++;
    }
  }
  handleAfterTokenMove(tripComplete, captureCount, emit2);
}
function handleAfterTokenMove(tripComplete, captureCount, emit2) {
  let isGameDone = false;
  if (tripComplete && isPlayerFinished2(state.currentPlayerIndex)) {
    const finishTime = (/* @__PURE__ */ new Date()).getTime() - state.gameStartedAt;
    emit2({
      type: EVENTS.PLAYER_FINISHED,
      playerIndex: state.currentPlayerIndex,
      rank: state.lastRank + 1,
      time: finishTime
    });
    if (shouldEndGame(state.playerTypes, state.playerTokenPositions)) {
      const now = (/* @__PURE__ */ new Date()).getTime();
      const leftover = computeLeftoverRankOrder(state.playerTypes, state.playerTokenPositions, state.playerRanks);
      for (const pi of leftover) {
        emit2({
          type: EVENTS.LEFTOVER_RANKED,
          playerIndex: pi,
          rank: state.lastRank + 1,
          time: now - state.gameStartedAt
        });
      }
      emit2({ type: EVENTS.GAME_ENDED, winnerIndex: state.winnerIndex });
      document.getElementById("game-container").appendChild(document.createElement("wc-game-end"));
      document.getElementById("game").classList.add("hidden");
      releaseWakeLock();
      goTo("game-end");
      isGameDone = true;
    }
  }
  if (isGameDone) return;
  activateDice();
  const grantsRepeat = (tripComplete || captureCount > 0 || state.currentDiceRoll === 6) && !isPlayerFinished2(state.currentPlayerIndex);
  if (grantsRepeat) {
    emit2({ type: EVENTS.TURN_REPEATS, playerIndex: state.currentPlayerIndex });
  } else {
    advanceToNextPlayer(emit2);
  }
}
function advanceToNextPlayer(emit2) {
  const next = getNextPlayerIndex(state.currentPlayerIndex, state.playerTypes, state.playerTokenPositions);
  if (next !== -1) {
    emit2({ type: EVENTS.TURN_ADVANCED, nextPlayerIndex: next });
  }
  updateTurnCounter();
  moveDice(state.currentPlayerIndex);
}
function restartGame(emit2) {
  const quickStartId = state.quickStartId;
  if (!quickStartId) return;
  const namesByPlayerIndex = Array.from(state.playerNames);
  removeGameTokens();
  document.getElementById("game").classList.remove("hidden");
  resetThemeChrome();
  replaceTo("game");
  startGame(quickStartId, namesByPlayerIndex, emit2);
}
function exitToHome(emit2) {
  pauseGameLogic();
  removeGameTokens();
  applyColorMap([0, 1, 2, 3]);
  resetThemeChrome();
  document.getElementById("game").classList.add("hidden");
  const pauseMenu = document.getElementById("pause-menu");
  if (pauseMenu) pauseMenu.classList.add("hidden");
  const settingsOverlay = document.getElementById("settings-overlay");
  if (settingsOverlay) settingsOverlay.classList.add("hidden");
  releaseWakeLock();
  emit2({ type: EVENTS.GAME_RESTARTED });
  document.getElementById("main-menu").classList.remove("hidden");
  const quickStart = document.querySelector("wc-quick-start");
  if (quickStart && typeof quickStart.showHomeScreen === "function") {
    quickStart.showHomeScreen();
  }
  replaceTo("home");
  resumeGameLogic();
}
async function godTeleport(playerIndex, tokenIndex, toPosition, emit2) {
  const token = getTokenElement(playerIndex, tokenIndex);
  if (!token) return;
  const sourceCell = token.parentElement;
  const targetCellId = getTokenContainerId(playerIndex, tokenIndex, toPosition);
  const targetCell = document.getElementById(targetCellId);
  if (!targetCell) return;
  const yardCellId = getTokenContainerId(playerIndex, tokenIndex, -1);
  if (toPosition === 0 && sourceCell && sourceCell.id === yardCellId) {
    emit2({ type: EVENTS.GOD_TELEPORTED, playerIndex, tokenIndex, toPosition });
    await playYardLaunch(playerIndex, tokenIndex, targetCellId);
    return;
  }
  const capturedByPlayer = findCapturedOpponents(playerIndex, toPosition, state.playerTokenPositions);
  for (const [pi, tis] of capturedByPlayer.entries()) {
    for (const ti of tis) {
      const t = getTokenElement(pi, ti);
      if (t) pinTokenForCapture(t);
    }
  }
  const preTeleportRect = toPosition === 56 ? token.getBoundingClientRect() : null;
  token.style.cssText = "";
  delete token.dataset.moving;
  targetCell.appendChild(token);
  emit2({ type: EVENTS.GOD_TELEPORTED, playerIndex, tokenIndex, toPosition });
  if (sourceCell && sourceCell !== targetCell) updateCellStacking(sourceCell);
  updateCellStacking(targetCell);
  if (preTeleportRect) {
    await playFinishArrival(playerIndex, tokenIndex, preTeleportRect);
  }
  for (const [pi, tis] of capturedByPlayer.entries()) {
    for (const ti of tis) {
      emit2({
        type: EVENTS.TOKEN_CAPTURED,
        byPlayerIndex: playerIndex,
        capturedPlayerIndex: pi,
        capturedTokenIndex: ti
      });
      await animateCaptureToHome(pi, ti);
    }
  }
}
var _pauseCloseHandler = null;
function handleGamePause(emit2) {
  if (isGameLogicPaused()) return;
  pauseGameLogic();
  emit2({ type: EVENTS.GAME_PAUSED });
  showPauseMenu();
  goTo("pause");
  const overlay = document.getElementById("pause-menu");
  const resumeBtn = document.getElementById("pm-resume");
  const exitBtns = Array.from(document.querySelectorAll(".restart-game"));
  const cleanup = () => {
    resumeBtn.removeEventListener("click", onResumeClick);
    document.removeEventListener("keydown", onKey);
    overlay.removeEventListener("click", onBackdrop);
    exitBtns.forEach((el3) => el3.removeEventListener("click", onExitClick));
  };
  const closeAndResume = () => {
    cleanup();
    _pauseCloseHandler = null;
    resumeGame();
    resumeGameLogic();
    emit2({ type: EVENTS.GAME_RESUMED_FROM_PAUSE });
  };
  const onResumeClick = () => {
    playClickSound();
    back();
  };
  const onKey = (e) => {
    if (e.key === "Escape") {
      playClickSound();
      back();
    }
  };
  const onBackdrop = (e) => {
    if (e.target === overlay) {
      playClickSound();
      back();
    }
  };
  const onExitClick = () => {
    playClickSound();
    cleanup();
    _pauseCloseHandler = null;
    exitToHome(emit2);
  };
  _pauseCloseHandler = closeAndResume;
  resumeBtn.addEventListener("click", onResumeClick);
  document.addEventListener("keydown", onKey);
  overlay.addEventListener("click", onBackdrop);
  exitBtns.forEach((el3) => el3.addEventListener("click", onExitClick));
}
registerScreenHandler("pause", () => {
  if (_pauseCloseHandler) _pauseCloseHandler();
});
registerScreenHandler("game-end", () => {
  dispatch({ type: COMMANDS.EXIT_TO_HOME });
});
registerScreenHandler("__game_back__", () => {
  dispatch({ type: COMMANDS.PAUSE });
});
function getCurrentPlayerIndex() {
  return state.currentPlayerIndex;
}
function getFinishedCount2(playerIndex) {
  return getFinishedCount(state.playerTokenPositions[playerIndex]);
}
function commandHandler2(currentState, command, services, emit2) {
  switch (command.type) {
    case COMMANDS.START_GAME:
      return startGame(command.quickStartId, command.namesByPlayerIndex, emit2);
    case COMMANDS.RESUME_SAVED_GAME:
      return resumeSavedGame(emit2);
    case COMMANDS.ROLL_DICE:
      return rollDice(emit2);
    case COMMANDS.SELECT_TOKEN:
      return selectToken(command.playerIndex, command.tokenIndex, emit2);
    case COMMANDS.PAUSE:
      return handleGamePause(emit2);
    case COMMANDS.RESUME:
      resumeGameLogic();
      emit2({ type: EVENTS.GAME_RESUMED_FROM_PAUSE });
      return;
    case COMMANDS.RESTART_GAME:
      return restartGame(emit2);
    case COMMANDS.EXIT_TO_HOME:
      return exitToHome(emit2);
    case COMMANDS.SET_ASSIST_FLAG:
      return emit2({ type: EVENTS.ASSIST_FLAG_CHANGED, flag: command.flag, value: command.value });
    case COMMANDS.GOD_TELEPORT:
      return godTeleport(command.playerIndex, command.tokenIndex, command.toPosition, emit2);
    default:
      console.warn("Unknown command:", command.type);
      return;
  }
}

// attached_assets/leludo-main/leludo-main/scripts/god-mode.js
var STORAGE_KEY = "debug-god-mode";
var _enabled2 = false;
var _selection = null;
function isGodModeAvailable() {
  if (typeof window !== "undefined" && isCapacitorNative()) {
    return false;
  }
  return location.hostname === "localhost" || location.hostname === "127.0.0.1";
}
if (isGodModeAvailable()) {
  _enabled2 = localStorage.getItem(STORAGE_KEY) === "true";
}
function isGodModeEnabled() {
  return _enabled2 && isGodModeAvailable();
}
function setGodModeEnabled(value) {
  if (!isGodModeAvailable()) return;
  _enabled2 = !!value;
  localStorage.setItem(STORAGE_KEY, String(_enabled2));
  if (!_enabled2) clearGodSelection();
}
function getGodSelection() {
  return _selection;
}
function setGodSelection(playerIndex, tokenIndex) {
  clearGodSelection();
  _selection = { playerIndex, tokenIndex };
  const el3 = getTokenElement(playerIndex, tokenIndex);
  if (el3 && el3.children[0]) el3.children[0].classList.add("god-selected");
}
function clearGodSelection() {
  if (!_selection) return;
  const { playerIndex, tokenIndex } = _selection;
  const el3 = getTokenElement(playerIndex, tokenIndex);
  if (el3 && el3.children[0]) el3.children[0].classList.remove("god-selected");
  _selection = null;
}
function cellIdToPosition(cellId, playerIndex) {
  if (/^h-\d-\d$/.test(cellId)) return -1;
  const markMatch = cellId.match(/^m(\d+)$/);
  if (markMatch) {
    const mark = parseInt(markMatch[1], 10);
    const pos = (mark - 13 * playerIndex + 52) % 52;
    if (pos > 50) return null;
    return pos;
  }
  const stretchMatch = cellId.match(/^p\ds([1-6])$/);
  if (stretchMatch) {
    return 50 + parseInt(stretchMatch[1], 10);
  }
  return null;
}

// attached_assets/leludo-main/leludo-main/scripts/end-highlights.js
var COUNT_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
function countWord(n) {
  return n >= 0 && n < COUNT_WORDS.length ? COUNT_WORDS[n] : String(n);
}
function nameOf(seats, i) {
  const seat = seats && seats[i];
  if (seat && seat.name && String(seat.name).trim()) return String(seat.name).trim();
  if (seat && seat.type === "PLAYER") return "You";
  return "Bot";
}
function pickKnockoutKing(stats, seats, winnerIndex) {
  let max = 0;
  let pi = -1;
  for (let i = 0; i < 4; i++) {
    const c = stats.playerCaptures[i] || 0;
    if (c > max || c === max && i === winnerIndex) {
      if (c >= max) {
        max = c;
        pi = i;
      }
    }
  }
  if (max < 2 || pi === -1) return null;
  return {
    playerIndex: pi,
    type: "ko",
    title: "Knockout king",
    body: \`\${nameOf(seats, pi)} sent rivals home\`,
    stat: \`\${max}\xD7\`
  };
}
function pickHotDice(stats, seats) {
  let best = null;
  let bestPi = -1;
  for (let i = 0; i < 4; i++) {
    const s = stats.bestDiceStreak[i];
    if (!s || s.length < 3) continue;
    if (!best || s.length > best.length) {
      best = s;
      bestPi = i;
    }
  }
  if (!best) return null;
  const word = countWord(best.length);
  const repeated = String(best.value).repeat(Math.min(best.length, 4));
  return {
    playerIndex: bestPi,
    type: "dice",
    title: "Hot dice",
    body: \`\${nameOf(seats, bestPi)} rolled \${word} \${best.value}s in a row on turn \${best.atTurn}\`,
    stat: repeated
  };
}
function pickFirstHome(stats, seats) {
  let best = -1;
  let pi = -1;
  for (let i = 0; i < 4; i++) {
    const t = stats.firstFinishTurn[i];
    if (t < 0) continue;
    if (pi === -1 || t < best) {
      best = t;
      pi = i;
    }
  }
  if (pi === -1) return null;
  return {
    playerIndex: pi,
    type: "home",
    title: "First home",
    body: \`\${nameOf(seats, pi)} got the first pawn home\`,
    stat: \`T-\${best}\`
  };
}
function pickRoughDay(stats, seats) {
  let max = 0;
  let pi = -1;
  for (let i = 0; i < 4; i++) {
    const c = stats.sentHomeCount[i] || 0;
    if (c > max) {
      max = c;
      pi = i;
    }
  }
  if (max < 3 || pi === -1) return null;
  return {
    playerIndex: pi,
    type: "send",
    title: "Rough day",
    body: \`\${nameOf(seats, pi)} was sent home\`,
    stat: \`\${max}\xD7\`
  };
}
function pickLongRoad(stats, seats, skipPi) {
  let max = -1;
  let pi = -1;
  for (let i = 0; i < 4; i++) {
    if (i === skipPi) continue;
    const t = stats.firstHomeStretchTurn[i];
    if (t < 0) continue;
    if (t > max) {
      max = t;
      pi = i;
    }
  }
  if (pi === -1 || max < 15) return null;
  return {
    playerIndex: pi,
    type: "bolt",
    title: "Long road",
    body: \`\${nameOf(seats, pi)} crossed the finish at turn \${max}\`,
    stat: \`T-\${max}\`
  };
}
function pickSlowStart(stats, seats) {
  let max = 0;
  let pi = -1;
  for (let i = 0; i < 4; i++) {
    const n = stats.pawnsAtBaseAtTurn20[i];
    if (n >= 3 && n > max) {
      max = n;
      pi = i;
    }
  }
  if (pi === -1) return null;
  return {
    playerIndex: pi,
    type: "bolt",
    title: "Slow start",
    body: \`\${nameOf(seats, pi)} took a while to leave home\`,
    stat: "T-20"
  };
}
function pickChampion(stats, seats, winnerIndex) {
  return {
    playerIndex: winnerIndex,
    type: "crown",
    title: "Champion",
    body: \`\${nameOf(seats, winnerIndex)} crossed the finish first\`,
    stat: "1st"
  };
}
function pickDistanceLeader(stats, seats, skipPi) {
  let max = 0;
  let pi = -1;
  for (let i = 0; i < 4; i++) {
    if (i === skipPi) continue;
    const d = stats.distanceTraveled[i] || 0;
    if (d > max) {
      max = d;
      pi = i;
    }
  }
  if (pi === -1) return null;
  return {
    playerIndex: pi,
    type: "bolt",
    title: "Distance run",
    body: \`\${nameOf(seats, pi)} clocked the most steps\`,
    stat: \`\${max}\`
  };
}
function selectHighlights({ stats, seats, winnerIndex }) {
  const candidates = [];
  const ko = pickKnockoutKing(stats, seats, winnerIndex);
  if (ko) candidates.push(ko);
  const hd = pickHotDice(stats, seats);
  if (hd) candidates.push(hd);
  const rd = pickRoughDay(stats, seats);
  if (rd) candidates.push(rd);
  const fh = pickFirstHome(stats, seats);
  if (fh) candidates.push(fh);
  const lr = pickLongRoad(stats, seats, fh ? fh.playerIndex : -1);
  if (lr) candidates.push(lr);
  const ss = pickSlowStart(stats, seats);
  if (ss) candidates.push(ss);
  let cards = candidates.slice(0, 4);
  const hasWinner = cards.some((c) => c.playerIndex === winnerIndex);
  if (!hasWinner) {
    const champ = pickChampion(stats, seats, winnerIndex);
    if (cards.length < 4) cards.unshift(champ);
    else {
      cards.pop();
      cards.unshift(champ);
    }
  }
  if (cards.length < 3) {
    const skip = new Set(cards.map((c) => c.playerIndex));
    const dl = pickDistanceLeader(stats, seats, -1);
    if (dl && !skip.has(dl.playerIndex)) cards.push(dl);
  }
  if (cards.length < 3) {
    cards.push(pickChampion(stats, seats, winnerIndex));
  }
  while (cards.length < 3) {
    cards.push({
      playerIndex: winnerIndex,
      type: "crown",
      title: "Match wrap",
      body: \`\${nameOf(seats, winnerIndex)} closed it out\`,
      stat: \`T-\${stats.turnCount || 0}\`
    });
  }
  return cards.slice(0, 4);
}

// attached_assets/leludo-main/leludo-main/scripts/listeners/persistence-listener.js
var SAVE_AFTER = /* @__PURE__ */ new Set([
  EVENTS.GAME_STARTED,
  EVENTS.GAME_RESUMED,
  EVENTS.DICE_ROLLED,
  EVENTS.THREE_SIXES_LOST,
  EVENTS.MOVABLE_TOKENS_DETERMINED,
  EVENTS.TOKEN_MOVED,
  EVENTS.TOKEN_CAPTURED,
  EVENTS.TURN_ADVANCED,
  EVENTS.TURN_REPEATS,
  EVENTS.PLAYER_FINISHED,
  EVENTS.GOD_TELEPORTED
]);
function save() {
  if (!state.quickStartId) return;
  try {
    const serialized = serializeGameState({
      quickStartId: state.quickStartId,
      playerNames: state.playerNames,
      playerTypes: state.playerTypes,
      botPersonalities: state.botPersonalities,
      playerTokenPositions: state.playerTokenPositions,
      currentPlayerIndex: state.currentPlayerIndex,
      currentDiceRoll: state.currentDiceRoll,
      consecutiveSixesCount: state.consecutiveSixesCount,
      playerCaptures: state.playerCaptures,
      playerRanks: state.playerRanks,
      playerTimes: state.playerTimes,
      lastRank: state.lastRank,
      gameStartedAt: state.gameStartedAt,
      turnCount: getTurnCount()
    });
    localStorage.setItem("ludo-save", JSON.stringify(serialized));
  } catch (e) {
    console.warn("persistence-listener: save failed", e);
  }
}
function clear() {
  try {
    localStorage.removeItem("ludo-save");
  } catch (e) {
    console.warn("persistence-listener: clear failed", e);
  }
}
function installPersistenceListener() {
  subscribe((event) => {
    if (event.type === EVENTS.GAME_ENDED || event.type === EVENTS.GAME_RESTARTED) {
      clear();
      return;
    }
    if (SAVE_AFTER.has(event.type)) save();
  });
}

// attached_assets/leludo-main/leludo-main/scripts/listeners/audio-listener.js
function installAudioListener() {
  subscribe((event) => {
    if (event.type === EVENTS.TOKEN_CAPTURED) playCaptureSound();
  });
}

// attached_assets/leludo-main/leludo-main/scripts/listeners/bot-listener.js
var DICE_ROLL_DELAY = 600;
var BOT_TOKEN_SELECT_DELAY = 400;
var ASSIST_TOKEN_SELECT_DELAY = 300;
function isCurrentPlayerBot() {
  return state.playerTypes[state.currentPlayerIndex] === "BOT";
}
function isAutoplay() {
  return state.assistFlags.autoRollDice || isCurrentPlayerBot();
}
function maybeAutoRoll() {
  if (isGameLogicPaused()) return;
  if (!isAutoplay()) return;
  scheduleTurn(() => dispatch({ type: COMMANDS.ROLL_DICE }), DICE_ROLL_DELAY);
}
function pickBotToken(movableTokenIndexes) {
  const unique = getUniqueTokenPositions(
    state.currentPlayerIndex,
    movableTokenIndexes,
    state.playerTokenPositions
  );
  if (unique.size === 1) return movableTokenIndexes[0];
  const weights = PERSONALITIES[state.botPersonalities[state.currentPlayerIndex]] || PERSONALITIES.balanced;
  const bestIndex = pickBestMove(
    state.currentPlayerIndex,
    state.currentDiceRoll,
    state.playerTokenPositions,
    weights,
    1
  );
  return bestIndex >= 0 ? bestIndex : movableTokenIndexes[0];
}
function maybeAutoSelect(movableTokenIndexes) {
  if (isGameLogicPaused()) return;
  if (isCurrentPlayerBot()) {
    scheduleTurn(() => {
      const tokenIndex = pickBotToken(movableTokenIndexes);
      dispatch({
        type: COMMANDS.SELECT_TOKEN,
        playerIndex: state.currentPlayerIndex,
        tokenIndex
      });
    }, BOT_TOKEN_SELECT_DELAY);
    return;
  }
  const unique = getUniqueTokenPositions(
    state.currentPlayerIndex,
    movableTokenIndexes,
    state.playerTokenPositions
  );
  const singleOption = unique.size === 1;
  const onlyHomeOut = allTokensInHome(state.playerTokenPositions[state.currentPlayerIndex]) && state.currentDiceRoll === 6;
  if (state.assistFlags.autoMoveSingleOption && singleOption || state.assistFlags.autoMoveOutOfHome && onlyHomeOut) {
    scheduleTurn(() => dispatch({
      type: COMMANDS.SELECT_TOKEN,
      playerIndex: state.currentPlayerIndex,
      tokenIndex: movableTokenIndexes[0]
    }), ASSIST_TOKEN_SELECT_DELAY);
  }
}
function resumeAutoplay() {
  if (isGameLogicPaused()) return;
  if (state.phase === PHASES.AWAITING_ROLL) {
    maybeAutoRoll();
  } else if (state.phase === PHASES.AWAITING_SELECTION) {
    maybeAutoSelect(state.movableTokenIndexes);
  }
}
function installBotListener() {
  subscribe((event) => {
    switch (event.type) {
      case EVENTS.GAME_STARTED:
      case EVENTS.GAME_RESUMED:
      case EVENTS.TURN_ADVANCED:
      case EVENTS.TURN_REPEATS:
        maybeAutoRoll();
        break;
      case EVENTS.MOVABLE_TOKENS_DETERMINED:
        maybeAutoSelect(event.tokenIndexes);
        break;
      case EVENTS.GAME_RESUMED_FROM_PAUSE:
        resumeAutoplay();
        break;
    }
  });
}

// attached_assets/leludo-main/leludo-main/scripts/listeners/analytics-listener.js
function installAnalyticsListener() {
  subscribe((event, state2) => {
    switch (event.type) {
      case EVENTS.GAME_STARTED: {
        const active = event.playerTypes.filter(Boolean);
        const bots = active.filter((t) => t === "BOT").length;
        trackEvent("game_start", {
          player_count: active.length,
          human_count: active.length - bots,
          bot_count: bots,
          bot_personalities: (event.botPersonalities || []).filter(Boolean).join(","),
          quick_start_id: event.quickStartId || ""
        });
        break;
      }
      case EVENTS.GAME_ENDED: {
        const durationMs = state2.gameStartedAt ? Date.now() - state2.gameStartedAt : 0;
        const winnerType = state2.playerTypes[state2.winnerIndex] || "";
        trackEvent("game_end", {
          winner_index: state2.winnerIndex,
          winner_type: winnerType,
          duration_ms: durationMs,
          duration_s: Math.round(durationMs / 1e3),
          turn_count: state2.turnCount,
          ranks: state2.playerRanks.slice(0, 4).join(",")
        });
        break;
      }
      case EVENTS.TOKEN_CAPTURED: {
        trackEvent("capture", {
          by_player: event.byPlayerIndex,
          captured_player: event.capturedPlayerIndex,
          captured_token: event.capturedTokenIndex,
          turn: state2.turnCount
        });
        break;
      }
      case EVENTS.PLAYER_FINISHED: {
        trackEvent("player_finished", {
          player_index: event.playerIndex,
          rank: event.rank,
          turn: state2.turnCount,
          player_type: state2.playerTypes[event.playerIndex] || ""
        });
        break;
      }
    }
  });
}

// attached_assets/leludo-main/leludo-main/scripts/index.js
setCommandHandler(commandHandler2);
installPersistenceListener();
installAudioListener();
installBotListener();
installAnalyticsListener();
initAnalytics();
initNavHistory();

// attached_assets/leludo-main/leludo-main/components/wc-dice.js
var DICE_HTML = (
  /*html*/
  \`
<div id="dice" class="die">
    <div id="d1" class="dice-face">
        <div class="dice-dot" style="grid-row:2;grid-column:2;"></div>
    </div>
    <div id="d2" class="dice-face hidden">
        <div class="dice-dot"></div>
        <div class="dice-dot" style="grid-row:3;grid-column:3;"></div>
    </div>
    <div id="d3" class="dice-face hidden">
        <div class="dice-dot"></div>
        <div class="dice-dot" style="grid-row:2;grid-column:2;"></div>
        <div class="dice-dot" style="grid-row:3;grid-column:3;"></div>
    </div>
    <div id="d4" class="dice-face hidden">
        <div class="dice-dot"></div>
        <div class="dice-dot" style="grid-column:3;"></div>
        <div class="dice-dot" style="grid-row:3;"></div>
        <div class="dice-dot" style="grid-row:3;grid-column:3;"></div>
    </div>
    <div id="d5" class="dice-face hidden">
        <div class="dice-dot"></div>
        <div class="dice-dot" style="grid-column:3;"></div>
        <div class="dice-dot" style="grid-row:2;grid-column:2;"></div>
        <div class="dice-dot" style="grid-row:3;"></div>
        <div class="dice-dot" style="grid-row:3;grid-column:3;"></div>
    </div>
    <div id="d6" class="dice-face hidden">
        <div class="dice-dot"></div>
        <div class="dice-dot" style="grid-column:3;"></div>
        <div class="dice-dot" style="grid-row:2;"></div>
        <div class="dice-dot" style="grid-row:2;grid-column:3;"></div>
        <div class="dice-dot" style="grid-row:3;"></div>
        <div class="dice-dot" style="grid-row:3;grid-column:3;"></div>
    </div>
</div>
\`
);
var Dice = class extends HTMLElement {
  constructor() {
    super();
    this.dataset.active = "true";
    const diceElement = htmlToElement(DICE_HTML);
    this.appendChild(diceElement);
    this.addEventListener("click", () => {
      this.handleDiceClick();
    });
    document.addEventListener("keyup", ($event) => {
      if ($event.key === " ") {
        this.handleDiceClick();
      }
    });
  }
  handleDiceClick() {
    if (this.dataset.active === "true") {
      dispatch({ type: COMMANDS.ROLL_DICE });
    }
  }
};
window.customElements.define("wc-dice", Dice);

// attached_assets/leludo-main/leludo-main/components/wc-token.js
var TOKEN_HTML = (playerIndex) => (
  /*html*/
  \`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"
         class="player-fg-\${playerIndex}">
        <defs>
            <linearGradient id="pb\${playerIndex}" x1="0.2" y1="0" x2="0.8" y2="1">
                <stop offset="0%" stop-color="white" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="black" stop-opacity="0.12"/>
            </linearGradient>
            <radialGradient id="ph\${playerIndex}" cx="0.4" cy="0.35" r="0.5">
                <stop offset="0%" stop-color="white" stop-opacity="0.45"/>
                <stop offset="100%" stop-color="white" stop-opacity="0"/>
            </radialGradient>
        </defs>
        <ellipse cx="50" cy="88" rx="30" ry="8" fill="currentColor"/>
        <ellipse cx="50" cy="88" rx="30" ry="8" fill="black" opacity="0.1"/>
        <path d="M32 85 Q30 70 36 55 Q40 45 42 38 L58 38 Q60 45 64 55 Q70 70 68 85 Z" fill="currentColor" stroke="white" stroke-width="1.5" stroke-opacity="0.5"/>
        <path d="M32 85 Q30 70 36 55 Q40 45 42 38 L58 38 Q60 45 64 55 Q70 70 68 85 Z" fill="url(#pb\${playerIndex})"/>
        <ellipse cx="50" cy="38" rx="13" ry="4" fill="currentColor"/>
        <ellipse cx="50" cy="38" rx="13" ry="4" fill="white" opacity="0.15"/>
        <circle cx="50" cy="24" r="16" fill="currentColor" stroke="white" stroke-width="1.5" stroke-opacity="0.5"/>
        <circle cx="50" cy="24" r="16" fill="url(#ph\${playerIndex})"/>
        <ellipse cx="44" cy="18" rx="5" ry="3.5" fill="white" opacity="0.4" transform="rotate(-20 44 18)"/>
    </svg>
\`
);
var Token = class extends HTMLElement {
  static observedAttributes = ["id"];
  constructor() {
    super();
  }
  /**
   *
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "id") {
      const id = newValue;
      const idTokens = id.split("-");
      const playerIndex = +idTokens[1];
      const tokenIndex = +idTokens[2];
      let tokenHTML = TOKEN_HTML(playerIndex);
      const tokenElement = htmlToElement(tokenHTML);
      this.appendChild(tokenElement);
      document.addEventListener("keyup", ($event) => {
        if ($event.key === (+tokenIndex + 1).toString()) {
          this.handleTokenClick(playerIndex, tokenIndex);
        }
      });
    }
  }
  /**
   *
   * @param {number} playerIndex
   * @param {number} tokenIndex
   */
  handleTokenClick(playerIndex, tokenIndex) {
    const isTokenActive = this.children[0].classList.contains("animate-bounce");
    if (isTokenActive) {
      dispatch({ type: COMMANDS.SELECT_TOKEN, playerIndex, tokenIndex });
    }
  }
};
window.customElements.define("wc-token", Token);

// attached_assets/leludo-main/leludo-main/scripts/bot-names.js
var BOT_NAME_POOLS = {
  english: [
    "Capt Obv",
    "Whiffs",
    "Boomer",
    "Karen",
    "Reply Guy",
    "Speedrun",
    "Tilt Tim",
    "Salty Sam",
    "AFK Andy",
    "Lag Larry",
    "McBotface",
    "Mid Skill",
    "Sweatlord",
    "Mid Boss",
    "Side Qst",
    "Toaster",
    "NPC Vibe",
    "Backseat",
    "Loot Gob",
    "Edge Lord",
    "Sir Yeets",
    "Grass Up",
    "GG Gary",
    "Goblin",
    "Cope Lord",
    "Doomscrl",
    "Sketchy",
    "Cringe",
    "Vibechk",
    "Bonk Bot",
    "Tiltpilot",
    "Misclicks",
    "Side Eye",
    "Pog Champ",
    "Patchnote",
    "Dial-up",
    "TouchStrm",
    "Whoopsie",
    "Cope Hard",
    "Ratio'd",
    "WiFi Wal",
    "404 Brian",
    "CacheMiss",
    "Stacktrc",
    "Null Ptr",
    "Off-By-1",
    "Hard F5",
    "ForceQuit"
  ],
  hindi: [
    "Pappu",
    "Bantai",
    "Chacha",
    "Chatur",
    "Bhidu",
    "Munna",
    "Ghonchu",
    "Gabbar",
    "Lukkha",
    "Topibaaz",
    "Jugaadu",
    "Fattu",
    "Dabangg",
    "Chamcha",
    "Chhotu",
    "Lallu",
    "Bewakoof",
    "Chillar",
    "Champak",
    "Hawabaaz",
    "Pheku",
    "Tubelight",
    "Tharki",
    "Jhakaas",
    "Bhau",
    "Mota Bhai",
    "DaruSingh",
    "Gappu",
    "Tingu",
    "Sachin No",
    "Sasta SRK",
    "Free WiFi",
    "Ctrl+Bhej",
    "404 Bhai",
    "Auto Raja",
    "Panmasala",
    "Fwd2All",
    "ChaiSutta",
    "Maggi 2m",
    "FltrCofi",
    "AdrakLasi",
    "InstaReel",
    "DJ Babu",
    "No Helmet",
    "Rikshaw",
    "WA Status",
    "Fwd Karo",
    "Net Khtm",
    "Buffer"
  ]
};
var BOT_POOL_LABELS = {
  english: "English",
  hindi: "Hindi / Hinglish"
};
var POOL_KEY = "bot-name-pool";
function getActivePoolKey() {
  const stored = localStorage.getItem(POOL_KEY);
  if (stored && BOT_NAME_POOLS[stored]) return stored;
  return "english";
}
function setActivePoolKey(key) {
  if (!BOT_NAME_POOLS[key]) return;
  localStorage.setItem(POOL_KEY, key);
  document.dispatchEvent(new CustomEvent("bot-name-pool-changed", { detail: { key } }));
}
function randomBotName(used = []) {
  const pool = BOT_NAME_POOLS[getActivePoolKey()];
  const available = pool.filter((n) => !used.includes(n));
  const source = available.length ? available : pool;
  return source[Math.floor(Math.random() * source.length)];
}
function isDefaultBotName(name) {
  return Object.values(BOT_NAME_POOLS).some((pool) => pool.includes(name));
}
var SEAT_NAME_KEY = "seat-names";
function readSeatNameMap() {
  try {
    const raw = localStorage.getItem(SEAT_NAME_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function getSavedSeatName(type, seatIndex) {
  const map = readSeatNameMap();
  return map[\`\${type}.\${seatIndex}\`] || "";
}
function setSavedSeatName(type, seatIndex, name) {
  const map = readSeatNameMap();
  const key = \`\${type}.\${seatIndex}\`;
  if (name) map[key] = name;
  else delete map[key];
  localStorage.setItem(SEAT_NAME_KEY, JSON.stringify(map));
}

// attached_assets/leludo-main/leludo-main/components/wc-quick-start.js
var DICE_SVG = (value, size = 56) => {
  const PIP_LAYOUTS = {
    1: [[1, 1]],
    2: [[0, 0], [2, 2]],
    3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [0, 2], [2, 0], [2, 2]],
    5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
    6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]]
  };
  const pad = size * 0.2;
  const pip = size * 0.15;
  const cell = (size - pad * 2) / 2;
  const pips = PIP_LAYOUTS[value] || PIP_LAYOUTS[1];
  const pipSvgs = pips.map(
    ([gr, gc]) => \`<circle cx="\${pad + gc * cell}" cy="\${pad + gr * cell}" r="\${pip / 2}" fill="var(--color-fg)"/>\`
  ).join("");
  return \`<svg width="\${size}" height="\${size}" viewBox="0 0 \${size} \${size}">
        <rect x="0.5" y="0.5" width="\${size - 1}" height="\${size - 1}" rx="\${size * 0.22}" fill="var(--color-surface)" stroke="var(--color-border)" stroke-width="1"/>
        \${pipSvgs}
    </svg>\`;
};
var QUAD_CHIP_SVG = (size = 26) => MINI_BOARD_SVG(size);
var PLAY_ICON_SVG = (size = 14) => \`<svg width="\${size}" height="\${size}" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>\`;
var MINI_BOARD_SVG = (size = 52) => {
  return \`<svg width="\${size}" height="\${size}" viewBox="0 0 60 60" style="border-radius:7px;overflow:hidden;display:block;">
        <rect x="0"  y="0"  width="30" height="30" fill="hsl(var(--player-1))"/>
        <rect x="30" y="0"  width="30" height="30" fill="hsl(var(--player-2))"/>
        <rect x="0"  y="30" width="30" height="30" fill="hsl(var(--player-3))"/>
        <rect x="30" y="30" width="30" height="30" fill="hsl(var(--player-0))"/>
        <!-- 1/3-thick dark cross (matches mockup's tinted lanes) -->
        <rect x="0"  y="20" width="60" height="20" fill="rgba(20,15,10,0.22)"/>
        <rect x="20" y="0"  width="20" height="60" fill="rgba(20,15,10,0.22)"/>
        <!-- center diamond -->
        <rect x="-3.4" y="-3.4" width="6.8" height="6.8"
              transform="translate(30 30) rotate(45)"
              fill="rgba(255,250,240,0.78)"/>
    </svg>\`;
};
var PAWN_SVG = (playerIndex) => \`
    <svg viewBox="0 0 32 32" class="player-fg-\${playerIndex}" style="width:100%;height:100%;filter:drop-shadow(0 1.2px 1.5px rgba(0,0,0,0.28));">
        <ellipse cx="16" cy="28" rx="8" ry="1.5" fill="rgba(0,0,0,0.18)"/>
        <path d="M16 4c3.2 0 5.5 2.4 5.5 5.2 0 1.8-1 3.2-2.4 4 1.7.7 2.9 1.8 3.6 3.4l1.1 2.6c.4 1 .1 2-.7 2.4-.2.1-.4.1-.6.1H9.5c-.9 0-1.6-.7-1.6-1.6 0-.3.1-.6.2-.9l1.1-2.6c.7-1.6 1.9-2.7 3.6-3.4-1.4-.8-2.4-2.2-2.4-4C10.4 6.4 12.8 4 16 4z" fill="currentColor"/>
        <path d="M16 4c3.2 0 5.5 2.4 5.5 5.2 0 1.8-1 3.2-2.4 4-.6-.3-1.3-.5-2-.5h-2.2c-.7 0-1.4.2-2 .5-1.4-.8-2.4-2.2-2.4-4C10.4 6.4 12.8 4 16 4z" fill="rgba(255,255,255,0.24)"/>
        <rect x="7.5" y="22" width="17" height="3.5" rx="1.4" fill="currentColor"/>
        <rect x="7.5" y="22" width="17" height="1.2" rx="0.6" fill="rgba(255,255,255,0.38)"/>
    </svg>\`;
var ICON_BACK = \`<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>\`;
var ICON_CLOSE = \`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>\`;
var ICON_USER = \`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0"/></svg>\`;
var ICON_BOT = \`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v3M8 7h8a3 3 0 013 3v7a3 3 0 01-3 3H8a3 3 0 01-3-3v-7a3 3 0 013-3zM9 13h.01M15 13h.01M9 17h6"/></svg>\`;
var ICON_PENCIL = \`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>\`;
var QuickStart = class extends HTMLElement {
  constructor() {
    super();
    const slots = [
      { type: "PLAYER", colorIndex: 0 },
      { type: "BOT", colorIndex: 1 },
      { type: "BOT", colorIndex: 2 },
      { type: "BOT", colorIndex: 3 }
    ];
    const botNames = [];
    this.seats = slots.map((slot, i) => {
      const saved = getSavedSeatName(slot.type, i);
      let name;
      if (slot.type === "PLAYER") {
        name = saved || \`Player \${i + 1}\`;
      } else if (saved && !botNames.includes(saved)) {
        name = saved;
        botNames.push(name);
      } else {
        name = randomBotName(botNames);
        botNames.push(name);
      }
      return { active: true, type: slot.type, colorIndex: slot.colorIndex, name };
    });
    this._focusedSeatIndex = null;
  }
  _defaultName(seat, seatIndex) {
    const saved = getSavedSeatName(seat.type, seatIndex);
    if (seat.type !== "BOT") return saved || \`Player \${seatIndex + 1}\`;
    const used = this.seats.filter((s) => s !== seat && s.active && s.type === "BOT").map((s) => s.name);
    if (saved && !used.includes(saved)) return saved;
    return randomBotName(used);
  }
  _applyFocusUI() {
    const focused = this._focusedSeatIndex;
    this.querySelectorAll(".seat-row").forEach((row) => {
      const idx = +row.dataset.seatIdx;
      row.style.opacity = focused !== null && focused !== idx ? "0.35" : "";
    });
    const helper = this.querySelector("#setup-helper");
    if (helper) helper.innerHTML = focused !== null ? helper.dataset.edit : helper.dataset.default;
  }
  connectedCallback() {
    this.showHomeScreen();
    document.addEventListener("bot-name-pool-changed", () => this._reshuffleBotNames());
    registerScreenHandler("setup", () => this.showHomeScreen());
  }
  _reshuffleBotNames() {
    const used = [];
    this.seats.forEach((seat, idx) => {
      if (!seat.active || seat.type !== "BOT") return;
      if (getSavedSeatName("BOT", idx)) return;
      if (!isDefaultBotName(seat.name)) return;
      seat.name = randomBotName(used);
      used.push(seat.name);
    });
    if (this.querySelector("#seat-list")) this._renderSeats();
  }
  showHomeScreen() {
    this.innerHTML = "";
    const saved = this._readSavedGame();
    const html = (
      /*html*/
      \`
            <div class="frame home-frame\${saved ? " home-frame--in-progress" : ""}">
                <div class="top-bar">
                    <div class="top-bar-title"></div>
                </div>

                <div class="home-hero">
                    <div class="home-die"><div class="home-die-inner">\${DICE_SVG(6, 48)}</div></div>
                    <h1 class="home-title">Ludo</h1>
                </div>

                \${saved ? this._resumeCardHtml(saved) : ""}

                <div class="frame-footer">
                    \${saved ? \`<button class="new-game-btn cta-primary">Start a new game</button>\` : \`<button class="new-game-btn cta-primary">New game</button>\`}
                    <button class="online-friend-btn cta-green">Online friend</button>
                    <button class="offline-friend-btn cta-red">Offline friend</button>
                </div>
            </div>
        \`
    );
    const el3 = htmlToElement(html);
    el3.querySelector(".new-game-btn").addEventListener("click", () => {
      playClickSound();
      this.showSetupScreen();
      goTo("setup");
    });
    el3.querySelector(".online-friend-btn").addEventListener("click", () => {
      playClickSound();
      var _msg = JSON.stringify({ type: 'action', action: 'onlineFriend' });
      if (window.ReactNativeWebView) { window.ReactNativeWebView.postMessage(_msg); }
      else { window.parent.postMessage(_msg, '*'); }
    });
    el3.querySelector(".offline-friend-btn").addEventListener("click", () => {
      playClickSound();
      (function showOfflineFriendPopup() {
        var existing = document.getElementById('offline-friend-popup');
        if (existing) existing.remove();
        var configs = {
          2: { qid: 'qs,2,0,2,0',   names: ['Player 2', '', 'Player 1', ''],               dots: ['hsl(10 63% 55%)','hsl(43 75% 55%)'] },
          3: { qid: 'qs,3,0,2,0,1', names: ['Player 2', 'Player 3', 'Player 1', ''],        dots: ['hsl(10 63% 55%)','hsl(43 75% 55%)','hsl(152 38% 45%)'] },
          4: { qid: 'qs,4,0',       names: ['Player 1', 'Player 2', 'Player 3', 'Player 4'], dots: ['hsl(10 63% 55%)','hsl(152 38% 45%)','hsl(43 75% 55%)','hsl(223 54% 55%)'] }
        };
        function makeBtn(n) {
          var cfg = configs[n];
          var dots = cfg.dots.map(function(c){ return '<div class="ofp-dot" style="background:'+c+'"></div>'; }).join('');
          return '<button class="ofp-btn" data-n="'+n+'"><span class="ofp-num">'+n+'</span><span class="ofp-lbl">PLAYERS</span><div class="ofp-dots">'+dots+'</div></button>';
        }
        var bd = document.createElement('div');
        bd.id = 'offline-friend-popup';
        bd.className = 'ofp-backdrop';
        bd.innerHTML =
          '<div class="ofp-card">' +
            '<p class="ofp-title">Pass &amp; Play</p>' +
            '<p class="ofp-sub">Players take turns on this device</p>' +
            '<div class="ofp-row">'+makeBtn(2)+makeBtn(3)+makeBtn(4)+'</div>' +
            '<button class="ofp-cancel">Cancel</button>' +
          '</div>';
        document.body.appendChild(bd);
        bd.querySelectorAll('.ofp-btn').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var n = parseInt(btn.getAttribute('data-n'), 10);
            var cfg = configs[n];
            playClickSound();
            bd.remove();
            try {
              var fn = window._ludoDispatch || dispatch;
              fn({ type: 'START_GAME', quickStartId: cfg.qid, namesByPlayerIndex: cfg.names });
            } catch(e) { console.warn('[OFP] dispatch failed', String(e)); }
          });
        });
        bd.querySelector('.ofp-cancel').addEventListener('click', function() { playClickSound(); bd.remove(); });
        bd.addEventListener('click', function(e) { if (e.target === bd) bd.remove(); });
      })();
    });
    const resumeEl = el3.querySelector(".resume-card");
    if (resumeEl) {
      resumeEl.addEventListener("click", () => {
        playClickSound();
        dispatch({ type: COMMANDS.RESUME_SAVED_GAME });
      });
    }
    this.appendChild(el3);
    this._startHomeDieCycle();
  }
  _startHomeDieCycle() {
    this._stopHomeDieCycle();
    const die = this.querySelector(".home-die");
    const inner = this.querySelector(".home-die-inner");
    if (!die || !inner) return;
    let colorIdx = 0;
    let face = 6;
    const cycle = () => {
      colorIdx = (colorIdx + 1) % 4;
      die.style.backgroundColor = \`hsl(var(--player-\${colorIdx}))\`;
      die.style.setProperty("--pulse-color", \`hsl(var(--player-\${colorIdx}) / 0.55)\`);
      inner.classList.remove("dice-rolling");
      void inner.offsetWidth;
      inner.classList.add("dice-rolling");
      let n = 0;
      const rollId = setInterval(() => {
        if (n >= 5) {
          face = Math.floor(Math.random() * 6) + 1;
          inner.innerHTML = DICE_SVG(face, 48);
          clearInterval(rollId);
          return;
        }
        face = face % 6 + 1;
        inner.innerHTML = DICE_SVG(face, 48);
        n++;
      }, 70);
      this._homeDieRollId = rollId;
    };
    this._homeDieInterval = setInterval(cycle, 2200);
  }
  _stopHomeDieCycle() {
    if (this._homeDieInterval) clearInterval(this._homeDieInterval);
    if (this._homeDieRollId) clearInterval(this._homeDieRollId);
    this._homeDieInterval = null;
    this._homeDieRollId = null;
  }
  disconnectedCallback() {
    this._stopHomeDieCycle();
  }
  _readSavedGame() {
    try {
      const raw = localStorage.getItem("ludo-save");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.positions)) return null;
      return parsed;
    } catch {
      return null;
    }
  }
  _resumeCardHtml(saved) {
    const types = saved.playerTypesArr || [];
    const names = saved.playerNamesArr || [];
    const cpi = saved.currentPlayerIndex ?? 0;
    const turn = Number.isFinite(saved.turnCount) && saved.turnCount > 0 ? saved.turnCount : 1;
    const activeIdx = [0, 1, 2, 3].filter((i) => types[i]);
    const currentIsHuman = types[cpi] === "PLAYER";
    const currentName = (names[cpi] || "").trim() || \`Player \${cpi + 1}\`;
    const turnLine = currentIsHuman ? \`Turn \${turn} \xB7 your move\` : \`Turn \${turn} \xB7 \${currentName}'s move\`;
    const opponents = activeIdx.filter((i) => i !== cpi).map((i) => (names[i] || "").trim() || \`P\${i + 1}\`).join(", ");
    const dots = activeIdx.map(
      (i) => \`<span class="resume-dot" style="background:hsl(var(--player-\${i}));"></span>\`
    ).join("");
    return (
      /*html*/
      \`
            <div class="home-resume-row">
                <div class="resume-eyebrow">IN&nbsp;PROGRESS</div>
                <button class="resume-card" type="button">
                    <span class="resume-mini-board">\${MINI_BOARD_SVG(52)}</span>
                    <span class="resume-body">
                        <span class="resume-title">\${escapeHtml(turnLine)}</span>
                        <span class="resume-sub">vs \${escapeHtml(opponents)}</span>
                        <span class="resume-dots">\${dots}</span>
                    </span>
                    <span class="resume-play">\${PLAY_ICON_SVG(14)}</span>
                </button>
            </div>\`
    );
  }
  showSetupScreen() {
    this._stopHomeDieCycle();
    this.innerHTML = "";
    const html = (
      /*html*/
      \`
            <div class="frame">
                <div class="top-bar">
                    <button class="back-btn icon-btn">\${ICON_BACK}</button>
                    <div class="top-bar-title"></div>
                </div>

                <div class="frame-body setup-body">
                    <h2 class="display-title">Who&rsquo;s playing?</h2>
                    <p id="setup-helper" class="setup-helper" data-default="Each seat is either a person on this phone or a bot.<br>Tap the pill to switch." data-edit="Rename your seat. Tap return when you&rsquo;re done.">Each seat is either a person on this phone or a bot.<br>Tap the pill to switch.</p>

                    <div id="seat-list" class="seat-list"></div>
                </div>

                <div class="frame-footer">
                    <button class="start-btn cta-primary">Start game</button>
                </div>
            </div>
        \`
    );
    const el3 = htmlToElement(html);
    el3.querySelector(".back-btn").addEventListener("click", () => {
      playClickSound();
      back();
    });
    el3.querySelector(".start-btn").addEventListener("click", () => {
      playClickSound();
      this._startGame();
    });
    this.appendChild(el3);
    this._renderSeats();
  }
  _renderSeats() {
    const container = this.querySelector("#seat-list");
    if (!container) return;
    container.innerHTML = "";
    this.seats.forEach((seat, i) => {
      const filled = seat.active;
      if (filled) {
        const isPlayer = seat.type === "PLAYER";
        const NAME_MAX = 9;
        if (!seat.name) seat.name = this._defaultName(seat, i);
        const colorVar = \`hsl(var(--player-\${i}))\`;
        const playerActiveStyle = isPlayer ? \`style="background:\${colorVar};color:#fff;"\` : "";
        const botActiveStyle = !isPlayer ? \`style="background:\${colorVar};color:#fff;"\` : "";
        const dimmed = this._focusedSeatIndex !== null && this._focusedSeatIndex !== i;
        const rowDimStyle = dimmed ? "opacity:0.35;" : "";
        const charLen = (seat.name || "").length;
        const seatHtml = (
          /*html*/
          \`
                    <div class="seat-row" data-seat-idx="\${i}" style="\${rowDimStyle}">
                        <div class="seat-color-cycle" style="background:\${colorVar};">
                            <div class="seat-pawn">\${PAWN_SVG(i)}</div>
                        </div>
                        <div class="seat-body">
                            <label class="seat-name-wrap">
                                <input class="seat-name" type="text" name="ludo-seat-\${i}" autocomplete="off" autocorrect="off" autocapitalize="words" data-form-type="other" data-lpignore="true" data-1p-ignore="true" style="caret-color:\${colorVar};" value="\${(seat.name || "").replace(/"/g, "&quot;")}" maxlength="\${NAME_MAX}" spellcheck="false" />
                                <span class="seat-name-pencil">\${ICON_PENCIL}</span>
                                <span class="seat-char-count hidden" style="color:\${colorVar};">\${charLen}/\${NAME_MAX}</span>
                            </label>
                        </div>
                        <div class="seat-pill">
                            <button data-half="PLAYER" class="seat-half \${isPlayer ? "" : "seat-half--inactive"}" \${playerActiveStyle}>\${ICON_USER}<span>Human</span></button>
                            <button data-half="BOT" class="seat-half \${!isPlayer ? "" : "seat-half--inactive"}" \${botActiveStyle}>\${ICON_BOT}<span>Bot</span></button>
                        </div>
                        <button class="remove-seat seat-remove">\${ICON_CLOSE}</button>
                    </div>\`
        );
        const seatEl = htmlToElement(seatHtml);
        seatEl.querySelectorAll(".seat-half").forEach((btn) => {
          btn.addEventListener("click", () => {
            const target = btn.dataset.half;
            if (target === seat.type) return;
            playClickSound();
            seat.type = target;
            seat.name = this._defaultName({ ...seat, type: target }, i);
            this._renderSeats();
          });
        });
        const nameInput = seatEl.querySelector(".seat-name");
        const nameWrap = seatEl.querySelector(".seat-name-wrap");
        const charCount = seatEl.querySelector(".seat-char-count");
        const pencil = seatEl.querySelector(".seat-name-pencil");
        if (nameInput) {
          const updateCount = () => {
            if (charCount) charCount.textContent = \`\${(nameInput.value || "").length}/\${nameInput.maxLength}\`;
          };
          nameInput.addEventListener("input", () => {
            seat.name = nameInput.value;
            seat._edited = true;
            updateCount();
          });
          nameInput.addEventListener("focus", () => {
            this._focusedSeatIndex = i;
            if (nameWrap) {
              nameWrap.style.borderBottomColor = colorVar;
              nameWrap.style.borderBottomWidth = "1.5px";
            }
            if (charCount) charCount.classList.remove("hidden");
            if (pencil) pencil.classList.add("hide-on-focus");
            this._applyFocusUI();
            const len = nameInput.value.length;
            nameInput.setSelectionRange(len, len);
          });
          nameInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              nameInput.blur();
            }
          });
          nameInput.addEventListener("blur", () => {
            const trimmed = (nameInput.value || "").trim();
            if (seat._edited) {
              setSavedSeatName(seat.type, i, trimmed);
            }
            seat.name = trimmed || this._defaultName(seat, i);
            seat._edited = false;
            nameInput.value = seat.name;
            if (nameWrap) {
              nameWrap.style.borderBottomColor = "";
              nameWrap.style.borderBottomWidth = "";
            }
            if (charCount) charCount.classList.add("hidden");
            if (pencil) pencil.classList.remove("hide-on-focus");
            this._focusedSeatIndex = null;
            this._applyFocusUI();
          });
        }
        seatEl.querySelector(".remove-seat").addEventListener("click", () => {
          playClickSound();
          seat.active = false;
          seat.colorIndex = null;
          this._renderSeats();
        });
        container.appendChild(seatEl);
      } else {
        const ghostVar = \`hsl(var(--player-\${i}))\`;
        const emptyHtml = (
          /*html*/
          \`
                    <div class="seat-row-empty">
                        <div class="seat-empty-color" style="border-color:color-mix(in srgb, \${ghostVar} 55%, transparent);background:color-mix(in srgb, \${ghostVar} 14%, transparent);">
                            <div class="seat-pawn seat-pawn-ghost">\${PAWN_SVG(i)}</div>
                        </div>
                        <div class="seat-body">
                            <div class="seat-empty-title">Empty seat</div>
                            <div class="seat-empty-sub">Tap a side to fill</div>
                        </div>
                        <div class="seat-pill">
                            <button data-add="PLAYER" class="seat-add">\${ICON_USER}<span>Human</span></button>
                            <button data-add="BOT" class="seat-add">\${ICON_BOT}<span>Bot</span></button>
                        </div>
                    </div>\`
        );
        const emptyEl = htmlToElement(emptyHtml);
        const rowEl = emptyEl.firstElementChild;
        const fillSeat = (target) => {
          playClickSound();
          seat.active = true;
          seat.type = target;
          seat.colorIndex = i;
          seat.name = this._defaultName({ ...seat, type: target, colorIndex: i }, i);
          this._renderSeats();
        };
        rowEl.querySelectorAll(".seat-add").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            fillSeat(btn.dataset.add);
          });
        });
        rowEl.addEventListener("click", () => fillSeat("PLAYER"));
        container.appendChild(emptyEl);
      }
    });
    const activeCount = this.seats.filter((s) => s.active).length;
    const startBtn = this.querySelector(".start-btn");
    if (startBtn) {
      startBtn.disabled = activeCount < 2;
    }
  }
  _startGame() {
    const activeSeats = this.seats.filter((s) => s.active);
    if (activeSeats.length < 2) return;
    const humans = activeSeats.filter((s) => s.type === "PLAYER");
    const bots = activeSeats.filter((s) => s.type === "BOT");
    const humanCount = humans.length;
    const botCount = bots.length;
    const humanColors = humans.map((s) => s.colorIndex);
    const botColors = bots.map((s) => s.colorIndex);
    const namesByPlayerIndex = new Array(4).fill("");
    if (humanCount === 4) {
      humans.forEach((s, idx) => {
        namesByPlayerIndex[idx] = s.name;
      });
    } else {
      const preferredPositions = HUMAN_PREFERRED_POSITIONS;
      const usedPositions = /* @__PURE__ */ new Set();
      humans.forEach((s, idx) => {
        const pos = preferredPositions[idx];
        namesByPlayerIndex[pos] = s.name;
        usedPositions.add(pos);
      });
      let botIdx = 0;
      for (let pos = 0; pos < 4 && botIdx < botCount; pos++) {
        if (!usedPositions.has(pos)) {
          namesByPlayerIndex[pos] = bots[botIdx].name;
          botIdx++;
        }
      }
    }
    const quickStartId = \`qs,\${humanCount},\${botCount},\${[...humanColors, ...botColors].join(",")}\`;
    dispatch({ type: COMMANDS.START_GAME, quickStartId, namesByPlayerIndex });
  }
};
window.customElements.define("wc-quick-start", QuickStart);

// attached_assets/leludo-main/leludo-main/components/wc-board.js
var STAR_D = "M12 2.2l2.8 6.3 6.8.5-5.2 4.4 1.6 6.6L12 16.6l-6 3.4 1.6-6.6L2.4 9l6.8-.5z";
var CORNER_RIGHT_DOWN = \`<polyline points="10 15 15 20 20 15"/><path d="M4 4h7a4 4 0 0 1 4 4v12"/>\`;
var CORNER_UP_RIGHT = \`<polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/>\`;
var CORNER_DOWN_LEFT = \`<polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>\`;
var CORNER_LEFT_UP = \`<polyline points="14 9 9 4 4 9"/><path d="M20 20h-7a4 4 0 0 1-4-4V4"/>\`;
var entryCellSvg = (playerIndex, cornerInner) => \`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="path-cell-entry-svg player-fg-\${playerIndex}">\${cornerInner}</svg>\`;
var safeCellSvg = (playerIndex) => \`
    <svg viewBox="0 0 24 24" class="path-cell-safe-svg"><path d="\${STAR_D}" class="player-fill-\${playerIndex}" opacity="0.85"/></svg>\`;
var BOARD_HTML = (
  /*html*/
  \`
    <div class="board-frame">
        <!-- Top bar -->
        <div class="board-topbar">
            <button id="g-pause-btn" class="icon-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            </button>
            <div style="flex:1"></div>
            <div id="turn-counter" class="turn-counter">Turn 0</div>
            <div style="flex:1"></div>
        </div>

        <!-- Spacer pushes board to bottom -->
        <div class="board-spacer"></div>

        <!-- Hidden home for wc-dice when no active corner has it yet -->
        <div id="dice-home" class="hidden"><wc-dice id="wc-dice"></wc-dice></div>

        <!-- Top corner row (seats 0/1) -->
        <div id="corner-row-top" class="board-corner-row">
            <div id="b0"></div>
            <div id="b1"></div>
        </div>

        <!-- Board -->
        <div class="board-area">
            <div class="board-wrap">
                <div class="board-grid">

                    <div class="home-quad home-quad--tl player-bg-0">
                        <div class="home-quad-slots player-bg-soft-0">
                            <div class="home-slot-cell"><div id="h-0-0" class="home-slot-dot player-border-0"></div></div>
                            <div class="home-slot-cell"><div id="h-0-1" class="home-slot-dot player-border-0"></div></div>
                            <div class="home-slot-cell"><div id="h-0-2" class="home-slot-dot player-border-0"></div></div>
                            <div class="home-slot-cell"><div id="h-0-3" class="home-slot-dot player-border-0"></div></div>
                        </div>
                    </div>

                    <div class="path-arm-v">
                        <div id="m10" class="path-cell"></div>
                        <div id="m11" class="path-cell path-cell--entry">\${entryCellSvg(1, CORNER_RIGHT_DOWN)}</div>
                        <div id="m12" class="path-cell"></div>
                        <div id="m9" class="path-cell"></div>
                        <div id="p1s1" class="path-cell player-bg-path-1"></div>
                        <div id="m13" class="path-cell player-bg-path-1"></div>
                        <div id="m8" class="path-cell path-cell--safe">\${safeCellSvg(1)}</div>
                        <div id="p1s2" class="path-cell player-bg-path-1"></div>
                        <div id="m14" class="path-cell"></div>
                        <div id="m7" class="path-cell"></div>
                        <div id="p1s3" class="path-cell player-bg-path-1"></div>
                        <div id="m15" class="path-cell"></div>
                        <div id="m6" class="path-cell"></div>
                        <div id="p1s4" class="path-cell player-bg-path-1"></div>
                        <div id="m16" class="path-cell"></div>
                        <div id="m5" class="path-cell"></div>
                        <div id="p1s5" class="path-cell player-bg-path-1"></div>
                        <div id="m17" class="path-cell"></div>
                    </div>

                    <div class="home-quad home-quad--tr player-bg-1">
                        <div class="home-quad-slots player-bg-soft-1">
                            <div class="home-slot-cell"><div id="h-1-0" class="home-slot-dot player-border-1"></div></div>
                            <div class="home-slot-cell"><div id="h-1-1" class="home-slot-dot player-border-1"></div></div>
                            <div class="home-slot-cell"><div id="h-1-2" class="home-slot-dot player-border-1"></div></div>
                            <div class="home-slot-cell"><div id="h-1-3" class="home-slot-dot player-border-1"></div></div>
                        </div>
                    </div>

                    <div class="path-arm-h">
                        <div id="m51" class="path-cell"></div>
                        <div id="m0" class="path-cell player-bg-path-0"></div>
                        <div id="m1" class="path-cell"></div>
                        <div id="m2" class="path-cell"></div>
                        <div id="m3" class="path-cell"></div>
                        <div id="m4" class="path-cell"></div>
                        <div id="m50" class="path-cell path-cell--entry">\${entryCellSvg(0, CORNER_UP_RIGHT)}</div>
                        <div id="p0s1" class="path-cell player-bg-path-0"></div>
                        <div id="p0s2" class="path-cell player-bg-path-0"></div>
                        <div id="p0s3" class="path-cell player-bg-path-0"></div>
                        <div id="p0s4" class="path-cell player-bg-path-0"></div>
                        <div id="p0s5" class="path-cell player-bg-path-0"></div>
                        <div id="m49" class="path-cell"></div>
                        <div id="m48" class="path-cell"></div>
                        <div id="m47" class="path-cell path-cell--safe">\${safeCellSvg(0)}</div>
                        <div id="m46" class="path-cell"></div>
                        <div id="m45" class="path-cell"></div>
                        <div id="m44" class="path-cell"></div>
                    </div>

                    <div class="finish-zone">
                        <div id="p0s6" class="finish-tri finish-tri--tl player-bg-path-0"></div>
                        <div id="p1s6" class="finish-tri finish-tri--tr player-bg-path-1"></div>
                        <div id="p3s6" class="finish-tri finish-tri--br player-bg-path-3"></div>
                        <div id="p2s6" class="finish-tri finish-tri--bl player-bg-path-2"></div>
                    </div>

                    <div class="path-arm-h">
                        <div id="m18" class="path-cell"></div>
                        <div id="m19" class="path-cell"></div>
                        <div id="m20" class="path-cell"></div>
                        <div id="m21" class="path-cell path-cell--safe">\${safeCellSvg(2)}</div>
                        <div id="m22" class="path-cell"></div>
                        <div id="m23" class="path-cell"></div>
                        <div id="p2s5" class="path-cell player-bg-path-2"></div>
                        <div id="p2s4" class="path-cell player-bg-path-2"></div>
                        <div id="p2s3" class="path-cell player-bg-path-2"></div>
                        <div id="p2s2" class="path-cell player-bg-path-2"></div>
                        <div id="p2s1" class="path-cell player-bg-path-2"></div>
                        <div id="m24" class="path-cell path-cell--entry">\${entryCellSvg(2, CORNER_DOWN_LEFT)}</div>
                        <div id="m30" class="path-cell"></div>
                        <div id="m29" class="path-cell"></div>
                        <div id="m28" class="path-cell"></div>
                        <div id="m27" class="path-cell"></div>
                        <div id="m26" class="path-cell player-bg-path-2"></div>
                        <div id="m25" class="path-cell"></div>
                    </div>

                    <div class="home-quad home-quad--bl player-bg-3">
                        <div class="home-quad-slots player-bg-soft-3">
                            <div class="home-slot-cell"><div id="h-3-0" class="home-slot-dot player-border-3"></div></div>
                            <div class="home-slot-cell"><div id="h-3-1" class="home-slot-dot player-border-3"></div></div>
                            <div class="home-slot-cell"><div id="h-3-2" class="home-slot-dot player-border-3"></div></div>
                            <div class="home-slot-cell"><div id="h-3-3" class="home-slot-dot player-border-3"></div></div>
                        </div>
                    </div>

                    <div class="path-arm-v">
                        <div id="m43" class="path-cell"></div>
                        <div id="p3s5" class="path-cell player-bg-path-3"></div>
                        <div id="m31" class="path-cell"></div>
                        <div id="m42" class="path-cell"></div>
                        <div id="p3s4" class="path-cell player-bg-path-3"></div>
                        <div id="m32" class="path-cell"></div>
                        <div id="m41" class="path-cell"></div>
                        <div id="p3s3" class="path-cell player-bg-path-3"></div>
                        <div id="m33" class="path-cell"></div>
                        <div id="m40" class="path-cell"></div>
                        <div id="p3s2" class="path-cell player-bg-path-3"></div>
                        <div id="m34" class="path-cell path-cell--safe">\${safeCellSvg(3)}</div>
                        <div id="m39" class="path-cell player-bg-path-3"></div>
                        <div id="p3s1" class="path-cell player-bg-path-3"></div>
                        <div id="m35" class="path-cell"></div>
                        <div id="m38" class="path-cell"></div>
                        <div id="m37" class="path-cell path-cell--entry">\${entryCellSvg(3, CORNER_LEFT_UP)}</div>
                        <div id="m36" class="path-cell"></div>
                    </div>

                    <div class="home-quad home-quad--br player-bg-2">
                        <div class="home-quad-slots player-bg-soft-2">
                            <div class="home-slot-cell"><div id="h-2-0" class="home-slot-dot player-border-2"></div></div>
                            <div class="home-slot-cell"><div id="h-2-1" class="home-slot-dot player-border-2"></div></div>
                            <div class="home-slot-cell"><div id="h-2-2" class="home-slot-dot player-border-2"></div></div>
                            <div class="home-slot-cell"><div id="h-2-3" class="home-slot-dot player-border-2"></div></div>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <!-- Bottom corner row (seats 3/2) -->
        <div id="corner-row-bottom" class="board-corner-row board-corner-row--bottom">
            <div id="b3"></div>
            <div id="b2"></div>
        </div>

        <!-- Spacer balances the top one so the board sits vertically centered -->
        <div class="board-spacer"></div>
    </div>
\`
);
var Board = class extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    const boardElement = htmlToElement(BOARD_HTML);
    boardElement.querySelector("#g-pause-btn").addEventListener("click", () => {
      playClickSound();
      dispatch({ type: COMMANDS.PAUSE });
    });
    const cellIdPattern = /^(h-\d-\d|m\d+|p\ds[1-6])$/;
    boardElement.querySelectorAll('[id^="h-"], [id^="m"], [id^="p"][id*="s"]').forEach((cell) => {
      if (!cellIdPattern.test(cell.id)) return;
      cell.addEventListener("click", () => {
        if (isGodModeEnabled()) {
          const selection = getGodSelection();
          if (selection) {
            const pos = cellIdToPosition(cell.id, selection.playerIndex);
            if (pos === null) return;
            playClickSound();
            dispatch({
              type: COMMANDS.GOD_TELEPORT,
              playerIndex: selection.playerIndex,
              tokenIndex: selection.tokenIndex,
              toPosition: pos
            });
            clearGodSelection();
            return;
          }
          const token2 = cell.querySelector(":scope > wc-token");
          if (!token2) return;
          const parts2 = token2.id.split("-");
          playClickSound();
          setGodSelection(+parts2[1], +parts2[2]);
          return;
        }
        const activeInner = cell.querySelector(":scope > wc-token > .animate-bounce");
        if (!activeInner) return;
        const token = activeInner.parentElement;
        const parts = token.id.split("-");
        const playerIndex = +parts[1];
        const tokenIndex = +parts[2];
        playClickSound();
        dispatch({ type: COMMANDS.SELECT_TOKEN, playerIndex, tokenIndex });
      });
    });
    this.appendChild(boardElement);
  }
};
window.customElements.define("wc-board", Board);

// attached_assets/leludo-main/leludo-main/components/wc-game-end.js
var CONFETTI_COLORS = ["var(--base-color-0)", "var(--base-color-1)", "var(--base-color-2)", "var(--base-color-3)"];
var CONFETTI_COUNT = 18;
function confettiPieces() {
  const out = [];
  for (let i = 0; i < CONFETTI_COUNT; i++) {
    const seed = (i * 9301 + 49297) % 233280;
    const r = seed / 233280;
    const r2 = seed * 7 % 233280 / 233280;
    const r3 = seed * 13 % 233280 / 233280;
    const left = (r * 100).toFixed(2);
    const size = 5 + Math.floor(r2 * 7);
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const delay = -(r * 7).toFixed(2);
    const duration = (5 + r2 * 5).toFixed(2);
    const drift = Math.floor((r3 - 0.5) * 80);
    const rot0 = Math.floor(r * 360);
    const rot1 = Math.floor(540 + r2 * 720);
    const isRect = r > 0.5;
    const w = isRect ? size : size + 2;
    const h = isRect ? Math.round(size * 1.4) : size + 2;
    const radius = isRect ? 1 : 50;
    out.push(\`<div class="ge-confetti-piece" style="
            left:\${left}%;
            width:\${w}px;
            height:\${h}px;
            background:hsl(\${color});
            border-radius:\${radius}\${isRect ? "px" : "%"};
            animation-delay:\${delay}s;
            animation-duration:\${duration}s;
            --ge-drift:\${drift}px;
            --ge-rot0:\${rot0}deg;
            --ge-rot1:\${rot1}deg;
        "></div>\`);
  }
  return out.join("");
}
function pawnSvg(playerIndex, size) {
  return \`<svg viewBox="0 0 32 32" class="player-fg-\${playerIndex}" style="width:\${size}px;height:\${size}px;">
        <path d="M16 4c3.2 0 5.5 2.4 5.5 5.2 0 1.8-1 3.2-2.4 4 1.7.7 2.9 1.8 3.6 3.4l1.1 2.6c.4 1 .1 2-.7 2.4-.2.1-.4.1-.6.1H9.5c-.9 0-1.6-.7-1.6-1.6 0-.3.1-.6.2-.9l1.1-2.6c.7-1.6 1.9-2.7 3.6-3.4-1.4-.8-2.4-2.2-2.4-4C10.4 6.4 12.8 4 16 4z" fill="currentColor"/>
        <path d="M16 4c3.2 0 5.5 2.4 5.5 5.2 0 1.8-1 3.2-2.4 4-.6-.3-1.3-.5-2-.5h-2.2c-.7 0-1.4.2-2 .5-1.4-.8-2.4-2.2-2.4-4C10.4 6.4 12.8 4 16 4z" fill="rgba(255,255,255,0.24)"/>
        <rect x="7.5" y="22" width="17" height="3.5" rx="1.4" fill="currentColor"/>
        <rect x="7.5" y="22" width="17" height="1.2" rx="0.6" fill="rgba(255,255,255,0.38)"/>
    </svg>\`;
}
var ICON_STAR = \`<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.6 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z"/></svg>\`;
var ICON_DOWNLOAD = \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>\`;
var ICON_BACK2 = \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M15 6l-6 6 6 6"/></svg>\`;
var ICON_SHARE = \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M12 4v12"/><path d="M7 9l5-5 5 5"/><path d="M5 20h14"/></svg>\`;
var CARD_ICONS = {
  ko: \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14"><circle cx="12" cy="12" r="7"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg>\`,
  dice: \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.3" fill="currentColor"/><circle cx="15" cy="15" r="1.3" fill="currentColor"/><circle cx="15" cy="9" r="1.3" fill="currentColor"/><circle cx="9" cy="15" r="1.3" fill="currentColor"/></svg>\`,
  bolt: \`<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg>\`,
  send: \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>\`,
  home: \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>\`,
  crown: \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M3 7l4 5 5-7 5 7 4-5v11H3z"/></svg>\`
};
function storeNudgeHtml() {
  if (!shouldShowStoreNudge()) return "";
  const native = isCapacitorNative();
  const icon = native ? ICON_STAR : ICON_DOWNLOAD;
  const title = native ? "Enjoying Leludo?" : "Get the Leludo app";
  const body = native ? "A quick Play Store rating helps a ton." : "Free on the Play Store \u2014 play offline, no ads.";
  const action = native ? "Rate us" : "Get the app";
  return \`
        <button id="ge-store" class="ge-store" data-native="\${native ? "1" : "0"}">
            <span class="ge-store-icon">\${icon}</span>
            <span class="ge-store-text">
                <span class="ge-store-title">\${title}</span>
                <span class="ge-store-body">\${body}</span>
            </span>
            <span class="ge-store-action">\${action}</span>
        </button>\`;
}
function nameFor(pi) {
  const raw = playerNames[pi] && String(playerNames[pi]).trim();
  if (raw) return raw;
  return playerTypes[pi] === "PLAYER" ? "You" : "Bot";
}
function buildSeats() {
  const seats = new Array(4).fill(null);
  for (let i = 0; i < 4; i++) {
    if (!playerTypes[i]) continue;
    seats[i] = { name: nameFor(i), type: playerTypes[i] };
  }
  return seats;
}
function buildStats() {
  return {
    playerCaptures: Array.from(playerCaptures),
    sentHomeCount: Array.from(sentHomeCount),
    bestDiceStreak: Array.from(bestDiceStreak),
    firstFinishTurn: Array.from(firstFinishTurn),
    firstHomeStretchTurn: Array.from(firstHomeStretchTurn),
    distanceTraveled: Array.from(distanceTraveled),
    pawnsAtBaseAtTurn20: Array.from(pawnsAtBaseAtTurn20),
    turnCount: state.turnCount || 0
  };
}
function playerHsl(playerIndex) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(\`--player-\${playerIndex}\`).trim();
  return raw ? \`hsl(\${raw})\` : "#888";
}
function pawnSvgString(playerIndex) {
  const fill = playerHsl(playerIndex);
  return \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="320" height="320">
        <ellipse cx="16" cy="28" rx="8" ry="1.5" fill="rgba(0,0,0,0.25)"/>
        <path d="M16 4c3.2 0 5.5 2.4 5.5 5.2 0 1.8-1 3.2-2.4 4 1.7.7 2.9 1.8 3.6 3.4l1.1 2.6c.4 1 .1 2-.7 2.4-.2.1-.4.1-.6.1H9.5c-.9 0-1.6-.7-1.6-1.6 0-.3.1-.6.2-.9l1.1-2.6c.7-1.6 1.9-2.7 3.6-3.4-1.4-.8-2.4-2.2-2.4-4C10.4 6.4 12.8 4 16 4z" fill="\${fill}"/>
        <path d="M16 4c3.2 0 5.5 2.4 5.5 5.2 0 1.8-1 3.2-2.4 4-.6-.3-1.3-.5-2-.5h-2.2c-.7 0-1.4.2-2 .5-1.4-.8-2.4-2.2-2.4-4C10.4 6.4 12.8 4 16 4z" fill="rgba(255,255,255,0.24)"/>
        <rect x="7.5" y="22" width="17" height="3.5" rx="1.4" fill="\${fill}"/>
        <rect x="7.5" y="22" width="17" height="1.2" rx="0.6" fill="rgba(255,255,255,0.38)"/>
    </svg>\`;
}
function loadSvgImage(svgString) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
async function buildShareImage(winnerIndex, winText, highlights) {
  const W = 1080, H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#1a1410";
  ctx.fillRect(0, 0, W, H);
  const grad = ctx.createRadialGradient(W / 2, H * 0.3, 0, W / 2, H * 0.3, W * 0.5);
  grad.addColorStop(0, "rgba(217,118,68,0.22)");
  grad.addColorStop(1, "rgba(217,118,68,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  const confettiHsls = [playerHsl(0), playerHsl(1), playerHsl(2), playerHsl(3)];
  ctx.save();
  ctx.globalAlpha = 0.7;
  for (let i = 0; i < 40; i++) {
    const x = i * 37 % 100 / 100 * W;
    const y = i * 53 % 100 / 100 * (H * 0.55);
    const w = (4 + i % 4 * 2) * 2.2;
    const h = (8 + i % 5) * 2.2;
    const rot = i * 31 % 360 * Math.PI / 180;
    ctx.fillStyle = confettiHsls[i % 4];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }
  ctx.restore();
  const pawnImg = await loadSvgImage(pawnSvgString(winnerIndex));
  const pawnSize = 240;
  ctx.drawImage(pawnImg, 80, 80, pawnSize, pawnSize);
  ctx.fillStyle = "rgba(235,227,214,0.55)";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = '600 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(winText.toUpperCase(), 340, 170);
  ctx.fillStyle = "#ebe3d6";
  ctx.font = '400 96px "Instrument Serif", Georgia, serif';
  ctx.fillText("The recap.", 340, 280);
  const cardX = 80, cardW = W - 160;
  const cardH = 130;
  const startY = 380;
  const gap = 18;
  highlights.forEach((h, idx) => {
    const y = startY + idx * (cardH + gap);
    const seatColor = playerHsl(h.playerIndex);
    ctx.fillStyle = "rgba(235,227,214,0.05)";
    roundRect(ctx, cardX, y, cardW, cardH, 24);
    ctx.fill();
    ctx.strokeStyle = "rgba(235,227,214,0.1)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = seatColor;
    roundRect(ctx, cardX, y, 8, cardH, 4);
    ctx.fill();
    ctx.fillStyle = "#ebe3d6";
    ctx.textAlign = "left";
    ctx.font = '600 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(h.title, cardX + 50, y + 50);
    ctx.fillStyle = "rgba(235,227,214,0.62)";
    ctx.font = '400 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(h.body, cardX + 50, y + 90);
    ctx.fillStyle = "#ebe3d6";
    ctx.font = '400 56px "Instrument Serif", Georgia, serif';
    ctx.textAlign = "right";
    ctx.fillText(h.stat, cardX + cardW - 30, y + 80);
  });
  ctx.fillStyle = "rgba(235,227,214,0.4)";
  ctx.textAlign = "center";
  ctx.font = '600 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText("Leludo", W / 2, H - 60);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}
async function shareGameEnd(winnerIndex, winText, highlights) {
  const shareText = \`\${winText} The recap from my Leludo game.\`;
  const shareUrl = window.location.origin;
  let blob = null;
  try {
    blob = await buildShareImage(winnerIndex, winText, highlights);
  } catch (e) {
  }
  if (blob && navigator.canShare) {
    const file = new File([blob], "leludo-result.png", { type: "image/png" });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Leludo", text: shareText });
        return;
      } catch (e) {
        if (e && e.name === "AbortError") return;
      }
    }
  }
  if (navigator.share) {
    try {
      await navigator.share({ title: "Leludo", text: shareText, url: shareUrl });
      return;
    } catch (e) {
      if (e && e.name === "AbortError") return;
    }
  }
  if (blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leludo-result.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1e3);
  }
}
var GameEnd = class extends HTMLElement {
  connectedCallback() {
    let winnerIndex = 0;
    for (let pi = 0; pi < playerRanks.length; pi++) {
      if (playerRanks[pi] === 1) {
        winnerIndex = pi;
        break;
      }
    }
    const isHumanWinner = playerTypes[winnerIndex] === "PLAYER";
    const winnerName = nameFor(winnerIndex);
    const eyebrow = isHumanWinner ? "Game over \xB7 You won" : \`Game over \xB7 \${winnerName} won\`;
    const winText = isHumanWinner ? "You won." : \`\${winnerName} won.\`;
    const seats = buildSeats();
    const stats = buildStats();
    const highlights = selectHighlights({ stats, seats, winnerIndex });
    const cardsHTML = highlights.map((h) => \`
            <div class="ge-card player-border-\${h.playerIndex}">
                <div class="ge-card-icon player-fg-\${h.playerIndex}"
                     style="background-color: hsl(var(--player-\${h.playerIndex}) / 0.13);">
                    \${CARD_ICONS[h.type] || CARD_ICONS.crown}
                </div>
                <div class="ge-card-text">
                    <div class="ge-card-title">\${escapeHtml(h.title)}</div>
                    <div class="ge-card-body">\${escapeHtml(h.body)}</div>
                </div>
                <div class="ge-card-stat">\${escapeHtml(h.stat)}</div>
            </div>\`).join("");
    const html = \`
            <div class="ge-screen">
                <div class="ge-glow"></div>
                <div class="ge-confetti">\${confettiPieces()}</div>

                <div class="ge-inner">
                    <div class="ge-header">
                        <button id="ge-home" class="ge-home-pill" aria-label="Home">
                            \${ICON_BACK2} Home
                        </button>
                        <button id="ge-share" class="ge-icon-btn" aria-label="Share">
                            \${ICON_SHARE}
                        </button>
                    </div>

                    <div class="ge-hero">
                        <div class="ge-hero-pawn">
                            <div class="ge-pawn-shadow"></div>
                            <div class="ge-pawn-bob">\${pawnSvg(winnerIndex, 78)}</div>
                        </div>
                        <div class="ge-hero-text">
                            <div class="ge-eyebrow">\${escapeHtml(eyebrow)}</div>
                            <div class="ge-headline">The recap</div>
                        </div>
                    </div>

                    <div class="ge-cards">\${cardsHTML}</div>

                    \${storeNudgeHtml()}

                    <div class="ge-spacer"></div>

                    <div class="ge-footer">
                        <button id="ge-play-again" class="ge-cta">Play again</button>
                    </div>
                </div>
            </div>\`;
    const el3 = htmlToElement(html);
    el3.querySelector("#ge-home").addEventListener("click", () => {
      playClickSound();
      dispatch({ type: COMMANDS.EXIT_TO_HOME });
    });
    el3.querySelector("#ge-play-again").addEventListener("click", () => {
      playClickSound();
      dispatch({ type: COMMANDS.RESTART_GAME });
    });
    const storeBtn = el3.querySelector("#ge-store");
    if (storeBtn) {
      storeBtn.addEventListener("click", () => {
        playClickSound();
        trackEvent("store_nudge_click", {
          surface: "game_end",
          native: storeBtn.dataset.native === "1"
        });
        openPlayStore();
      });
    }
    el3.querySelector("#ge-share").addEventListener("click", async (ev) => {
      playClickSound();
      const btn = ev.currentTarget;
      if (btn.dataset.busy === "1") return;
      btn.dataset.busy = "1";
      btn.classList.add("ge-busy");
      try {
        await shareGameEnd(winnerIndex, winText, highlights);
      } finally {
        btn.dataset.busy = "";
        btn.classList.remove("ge-busy");
      }
    });
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      this._prevThemeColor = themeMeta.getAttribute("content");
      themeMeta.setAttribute(
        "content",
        "#080808"
      );
    }
    this.appendChild(el3);
  }
};
window.customElements.define("wc-game-end", GameEnd);

// attached_assets/leludo-main/leludo-main/components/wc-settings.js
function setAssistFlag(flag, value) {
  dispatch({ type: COMMANDS.SET_ASSIST_FLAG, flag, value });
}
var ASSIST_TOGGLES = [
  { id: "s-auto-roll", flag: "autoRollDice", label: "Auto-roll dice", storageKey: "assist-auto-roll", default: false },
  { id: "s-auto-single", flag: "autoMoveSingleOption", label: "Auto-move when only one option", storageKey: "assist-auto-single", default: false },
  { id: "s-auto-home-out", flag: "autoMoveOutOfHome", label: "Auto-move out of home", storageKey: "assist-auto-home-out", default: true }
];
function readAssistPref(t) {
  const v = localStorage.getItem(t.storageKey);
  if (v === null) return t.default;
  return v === "true";
}
var ICON_BACK3 = \`<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>\`;
var SETTINGS_HTML = (
  /*html*/
  \`
<button id="settings-icon" class="icon-btn">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="17" height="17">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
</button>
\`
);
function toggleHtml(id, label, checked = false, withBorder = true) {
  return \`<div class="settings-row\${withBorder ? " settings-row--bordered" : ""}">
        <label for="\${id}" class="settings-row-label">\${label}</label>
        <input type="checkbox" id="\${id}" class="toggle-input" \${checked ? "checked" : ""} />
        <label for="\${id}" class="toggle-track">
            <div class="toggle-knob"></div>
        </label>
    </div>\`;
}
function settingsGroup(label, content) {
  return \`<div>
        <div class="section-label" style="margin-bottom:8px;">\${label}</div>
        <div class="surface-card settings-group-card">\${content}</div>
    </div>\`;
}
function buildSettingsOverlay() {
  return \`<div id="settings-overlay" class="frame-overlay hidden">
        <div class="frame">
            <div class="top-bar">
                <button id="settings-back" class="icon-btn">\${ICON_BACK3}</button>
                <div class="top-bar-title"></div>
                <div class="icon-btn-spacer"></div>
            </div>

            <div class="settings-body">
                <div class="settings-title-wrap">
                    <h2 class="settings-title">Preferences</h2>
                </div>

                <div class="settings-groups">
                \${settingsGroup("Theme", \`
                    <div class="theme-row">
                        <label class="theme-tile-wrap">
                            <input type="radio" name="s-theme" value="light" class="theme-tile-input" />
                            <div class="theme-tile" style="background:#EFE9DC;color:#1F1B14;">
                                <div class="theme-tile-glyph">Aa</div>
                                <div class="theme-tile-label">Paper</div>
                            </div>
                        </label>
                        <label class="theme-tile-wrap">
                            <input type="radio" name="s-theme" value="dark" class="theme-tile-input" />
                            <div class="theme-tile" style="background:#1F1B14;color:#F2EDE3;">
                                <div class="theme-tile-glyph">Aa</div>
                                <div class="theme-tile-label">Dusk</div>
                            </div>
                        </label>
                        <label class="theme-tile-wrap">
                            <input type="radio" name="s-theme" value="system" class="theme-tile-input" />
                            <div class="theme-tile" style="background:#0d0d0d;color:#fff;">
                                <div class="theme-tile-glyph">Aa</div>
                                <div class="theme-tile-label">System</div>
                            </div>
                        </label>
                    </div>
                \`)}

                \${settingsGroup("Sound", toggleHtml("s-sound", "Sound effects", !isSoundMuted(), false))}

                \${settingsGroup("Assist", ASSIST_TOGGLES.map((t, idx, arr) => toggleHtml(t.id, t.label, readAssistPref(t), idx < arr.length - 1)).join(""))}

                \${settingsGroup("Bot vibe", \`
                    <div class="bot-pool-list">
                        \${Object.keys(BOT_NAME_POOLS).map((key) => {
    const sample = BOT_NAME_POOLS[key].slice(0, 3).join(" \xB7 ");
    return \`<label class="bot-pool-row">
                                <div class="bot-pool-body">
                                    <span class="bot-pool-name">\${BOT_POOL_LABELS[key]}</span>
                                    <span class="bot-pool-sample">\${sample}</span>
                                </div>
                                <input type="radio" name="s-bot-pool" value="\${key}" class="bot-pool-input hidden" />
                                <span class="bot-pool-dot"></span>
                            </label>\`;
  }).join("")}
                    </div>
                \`)}

                \${isGodModeAvailable() ? settingsGroup("Debug (localhost only)", \`
                    \${toggleHtml("s-god-mode", "God mode (teleport pawn)", isGodModeEnabled(), false)}
                    <div class="god-mode-hint">Click a pawn, then click any cell to teleport it. Bypasses dice and turn order.</div>
                \`) : ""}

                \${settingsGroup("About", \`
                    <div class="about-list">
                        <div class="about-row">
                            <span class="about-key">Version</span>
                            <span class="about-value-mono">\${VERSION}</span>
                        </div>
                        <div class="about-row about-row--separator">
                            <span class="about-key">Source</span>
                            <a href="https://github.com/LeludoOrg/leludo" class="about-value-mono about-link">github.com/LeludoOrg/leludo</a>
                        </div>
                        <div class="about-row about-row--separator">
                            <span class="about-key">Privacy</span>
                            <a href="privacy.html" class="about-link">Read policy</a>
                        </div>
                    </div>
                \`)}
                </div>
            </div>
        </div>
    </div>\`;
}
function updateTheme(theme) {
  const rootElement = window.document.documentElement;
  rootElement.classList.remove("dark", "light", "system");
  const themeToApply = theme === "system" ? window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : theme;
  rootElement.classList.add(themeToApply);
  const headerEl = rootElement.querySelector("#header");
  if (headerEl) {
    const navElementStyles = getComputedStyle(headerEl);
    document.querySelector('meta[name="theme-color"]').setAttribute("content", navElementStyles.backgroundColor);
  }
  localStorage.setItem("theme", theme);
}
// ── Multiplayer Bridge ────────────────────────────────────────────────────────
// Lets React Native assign player ownership and relay actions via Firebase.

var _externalDiceValue = null;
var _mp = { enabled: false, myPlayerIndex: -1, applyingRemote: false, lastSentSeq: 0 };
var _restoringState = false;

// Wrap dispatch: block actions when not my turn / not my token, emit actions to React Native.
var _origDispatch = dispatch;
function _mpDispatch(command) {
  // Always reset MP state when a new game starts so a previous online session
  // never bleeds into an offline or subsequent online game.
  // Online games re-activate multiplayer via _initMultiplayer (injected by
  // React Native 800 ms after START_GAME).
  if (command.type === 'START_GAME') {
    _mp.enabled = false;
    _mp.myPlayerIndex = -1;
    _mp.applyingRemote = false;
    _mp.lastSentSeq = 0;
    if (_applyingRemoteSafetyTimer) { clearTimeout(_applyingRemoteSafetyTimer); _applyingRemoteSafetyTimer = null; }
    return _origDispatch(command);
  }

  if (!_mp.enabled || _mp.applyingRemote) return _origDispatch(command);

  if (command.type === 'ROLL_DICE') {
    // ── Turn ownership: only the player whose turn it is can roll ──
    if (state.currentPlayerIndex !== _mp.myPlayerIndex) return;
    // ── Guard: only send mpAction when the engine will actually accept it ──
    // Without this check, rapid tapping sends multiple ROLL_DICE events to
    // Firebase while the local dice animation is still running (phase=ROLLING).
    // The remote device then applies all of them, desynchronising state.
    if (!canRoll()) return;
    // Pre-generate the dice value and broadcast it to Firebase BEFORE the
    // animation starts. This guarantees all devices get the same value and
    // eliminates the race where SELECT_TOKEN could arrive at Firebase before
    // ROLL_DICE (since animation takes ~1-2s but token click is immediate).
    var preRoll = generateDiceRoll();
    _externalDiceValue = preRoll;
    _mp.lastSentSeq++;
    var rollMsg = JSON.stringify({
      type: 'mpAction',
      action: 'ROLL_DICE',
      diceValue: preRoll,
      playerIndex: state.currentPlayerIndex,
      seq: _mp.lastSentSeq,
    });
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(rollMsg);
    return _origDispatch(command);
  }

  if (command.type === 'SELECT_TOKEN') {
    // ── Dual ownership check ──────────────────────────────────────────────
    // IMPORTANT: the game engine processes SELECT_TOKEN using
    // state.currentPlayerIndex (not command.playerIndex). So even if a player
    // clicks their own correctly-coloured token, the engine will move the
    // CURRENT TURN player's token. We must therefore gate on BOTH:
    //   1. It is my turn  (state.currentPlayerIndex === myPlayerIndex)
    //   2. The token I clicked belongs to me  (command.playerIndex === myPlayerIndex)
    // Checking only #2 (as before) causes cross-color token control.
    // ─────────────────────────────────────────────────────────────────────
    if (state.currentPlayerIndex !== _mp.myPlayerIndex) return; // Not my turn
    if (command.playerIndex !== _mp.myPlayerIndex) return;       // Not my token
    // ── Guard: only send when engine is in AWAITING_SELECTION and token is movable ──
    // Prevents duplicate SELECT_TOKEN events from rapid tapping or stale clicks.
    if (!canSelectToken(command.tokenIndex)) return;

    // Include dice value + positions so remote devices can apply the move
    // correctly even if their ROLL_DICE animation hasn't resolved yet.
    var _selTokenPos = (state.playerTokenPositions[command.playerIndex] || [])[command.tokenIndex];
    var _selNewPos;
    try { _selNewPos = getTokenNewPosition(_selTokenPos, state.currentDiceRoll); } catch(e) { _selNewPos = undefined; }
    _mp.lastSentSeq++;
    var selMsg = JSON.stringify({
      type: 'mpAction',
      action: 'SELECT_TOKEN',
      playerIndex: command.playerIndex,
      tokenIndex: command.tokenIndex,
      diceValue: state.currentDiceRoll,
      fromPosition: _selTokenPos,
      toPosition: _selNewPos,
      seq: _mp.lastSentSeq,
    });
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(selMsg);
    return _origDispatch(command);
  }

  return _origDispatch(command);
}
dispatch = _mpDispatch;

// Subscribe to events: report turn changes to React Native.
// NOTE: DICE_ROLLED is no longer broadcast here — the value is pre-generated
// and sent in _mpDispatch(ROLL_DICE) before the animation starts, so all
// devices always receive the dice value before any SELECT_TOKEN can arrive.
subscribe(function(event) {
  if (!_mp.enabled || _mp.applyingRemote || _restoringState) return;
  if (event.type === 'TURN_ADVANCED' || event.type === 'TURN_REPEATS' || event.type === 'GAME_STARTED') {
    var turnMsg = JSON.stringify({ type: 'mpTurn', currentPlayerIndex: state.currentPlayerIndex });
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(turnMsg);
  }
  if (event.type === 'TURN_ADVANCED') {
    var posSnap = state.playerTokenPositions.map(function(p) { return p ? p.slice() : null; });
    var gsMsg = JSON.stringify({ type: 'mpGameState', tokenPositions: posSnap, currentPlayerIndex: state.currentPlayerIndex, phase: state.phase });
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(gsMsg);
  }
  // Emit move log for the LOCAL player's token moves so React Native shows history.
  if (event.type === 'TOKEN_MOVED') {
    var localMoveLog = JSON.stringify({
      type: 'mpMoveLog',
      playerIndex: event.playerIndex,
      tokenIndex: event.tokenIndex,
      diceValue: state.currentDiceRoll,
      fromPosition: event.fromPosition,
      toPosition: event.toPosition,
    });
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(localMoveLog);
  }
});

// Safety: if applyingRemote ever gets stuck true, reset after 10 seconds.
var _applyingRemoteSafetyTimer = null;
function _setApplyingRemote(val) {
  _mp.applyingRemote = val;
  if (_applyingRemoteSafetyTimer) { clearTimeout(_applyingRemoteSafetyTimer); _applyingRemoteSafetyTimer = null; }
  if (val) {
    _applyingRemoteSafetyTimer = setTimeout(function() {
      console.warn('[MP] applyingRemote safety reset fired — was stuck true');
      _mp.applyingRemote = false;
      _applyingRemoteSafetyTimer = null;
    }, 10000);
  }
}

// Called by React Native to apply a remote player's action without re-broadcasting.
window._applyRemoteAction = function(action) {
  _setApplyingRemote(true);
  try {
    if (action.action === 'ROLL_DICE') {
      // ── Auto-heal state drift ─────────────────────────────────────────────
      // If currentPlayerIndex is out of sync (e.g. missed TURN_ADVANCED, reconnect),
      // force-correct it so canRoll() passes. This makes Firebase the source of truth.
      if (typeof action.playerIndex === 'number') {
        if (state.currentPlayerIndex !== action.playerIndex) {
          console.warn('[MP] Remote ROLL_DICE: correcting currentPlayerIndex from ' + state.currentPlayerIndex + ' to ' + action.playerIndex);
          state.currentPlayerIndex = action.playerIndex;
        }
        if (state.phase !== 'AWAITING_ROLL') {
          console.warn('[MP] Remote ROLL_DICE: correcting phase from ' + state.phase + ' to AWAITING_ROLL');
          state.phase = 'AWAITING_ROLL';
        }
      }
      _externalDiceValue = (action.diceValue !== undefined && action.diceValue !== null) ? +action.diceValue : null;
      var rollResult = _origDispatch({ type: 'ROLL_DICE' });
      // rollDice returns a Promise (animation). Keep applyingRemote=true until it
      // resolves so the local subscribe listener does NOT post mpTurn to React Native
      // (the actor's device already wrote the turn to Firebase — we must not race it).
      if (rollResult && typeof rollResult.then === 'function') {
        rollResult.then(function() {
          _setApplyingRemote(false);
          var doneMsg = JSON.stringify({ type: 'mpActionDone' });
          if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(doneMsg);
        }).catch(function() {
          _setApplyingRemote(false);
          var doneMsg = JSON.stringify({ type: 'mpActionDone' });
          if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(doneMsg);
        });
      } else {
        // If rollDice returned undefined (canRoll still failed), apply value directly.
        if (_externalDiceValue !== null) {
          var forcedValue = _externalDiceValue;
          _externalDiceValue = null;
          try {
            state.currentDiceRoll = forcedValue;
            state.phase = 'AWAITING_SELECTION';
            updateDiceFace(state.currentDiceRoll, forcedValue);
            handleAfterDiceRoll(emit);
          } catch(e2) { console.warn('[MP] forced dice apply error', String(e2)); }
        }
        _setApplyingRemote(false);
        var doneMsg = JSON.stringify({ type: 'mpActionDone' });
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(doneMsg);
      }
    } else if (action.action === 'SELECT_TOKEN') {
      // ── Auto-heal for token move ──────────────────────────────────────────
      if (typeof action.playerIndex === 'number' && action.playerIndex !== state.currentPlayerIndex) {
        console.warn('[MP] Remote SELECT_TOKEN: correcting currentPlayerIndex from ' + state.currentPlayerIndex + ' to ' + action.playerIndex);
        state.currentPlayerIndex = action.playerIndex;
      }
      // ── Fix race condition: sync dice value before token selection ─────────
      // If the ROLL_DICE animation hasn't resolved yet on this device, the
      // state.currentDiceRoll will be stale. Overwrite it from the action so
      // the token moves the correct distance on ALL devices.
      if (typeof action.diceValue === 'number') {
        if (state.currentDiceRoll !== action.diceValue) {
          console.warn('[MP] Remote SELECT_TOKEN: correcting currentDiceRoll from ' + state.currentDiceRoll + ' to ' + action.diceValue);
          state.currentDiceRoll = action.diceValue;
        }
        _externalDiceValue = null; // cancel any pending ROLL_DICE in-flight
      }
      // ── Ensure correct phase so canSelectToken() passes ─────────────────
      if (state.phase !== 'AWAITING_SELECTION') {
        state.phase = 'AWAITING_SELECTION';
        if (typeof action.tokenIndex === 'number') {
          try { state.movableTokenIndexes = [action.tokenIndex]; } catch(e) {}
        }
      }
      var selResult = _origDispatch({ type: 'SELECT_TOKEN', playerIndex: action.playerIndex, tokenIndex: action.tokenIndex });
      // selectToken is async (animation). Keep applyingRemote=true until it resolves
      // so the subscribe listener does NOT post mpTurn from this (non-actor) device.
      if (selResult && typeof selResult.then === 'function') {
        selResult.then(function() {
          _setApplyingRemote(false);
          var doneMsg = JSON.stringify({ type: 'mpActionDone' });
          if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(doneMsg);
        }).catch(function() {
          _setApplyingRemote(false);
          var doneMsg = JSON.stringify({ type: 'mpActionDone' });
          if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(doneMsg);
        });
      } else {
        _setApplyingRemote(false);
        var doneMsg = JSON.stringify({ type: 'mpActionDone' });
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(doneMsg);
      }
      // Emit move log so React Native can display the history entry.
      var moveLogMsg = JSON.stringify({
        type: 'mpMoveLog',
        playerIndex: action.playerIndex,
        tokenIndex: action.tokenIndex,
        diceValue: action.diceValue,
        fromPosition: action.fromPosition,
        toPosition: action.toPosition,
      });
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(moveLogMsg);
    } else {
      _setApplyingRemote(false);
    }
  } catch(e) {
    console.warn('[MP] applyRemoteAction error', String(e));
    _setApplyingRemote(false);
  }
};

// Called by React Native to force-sync the current turn player when Firebase
// reports a different currentTurnPlayerIndex than what the local engine has.
window._setTurnPlayer = function(playerIndex) {
  if (typeof playerIndex !== 'number') return;
  // Skip during remote action animation — the action's TURN_ADVANCED will advance the turn.
  // Injecting _setTurnPlayer mid-animation causes premature UI updates (moveDice /
  // updateCornerWidgets) that visually conflict with the running animation, producing
  // jitter and cut-short effects.
  if (_mp.applyingRemote) return;
  try {
    if (state.currentPlayerIndex !== playerIndex) {
      console.warn('[MP] _setTurnPlayer: correcting currentPlayerIndex from ' + state.currentPlayerIndex + ' to ' + playerIndex);
      // Direct state mutation — DO NOT emit TURN_ADVANCED here.
      state.currentPlayerIndex = playerIndex;
      state.phase = 'AWAITING_ROLL';
      state.movableTokenIndexes = [];
      try { moveDice(); } catch(e) {}
      try { updateCornerWidgets(); } catch(e2) {}
      // Post mpTurnSync (not mpTurn) so React Native updates local turn tracking
      // WITHOUT writing back to Firebase — this turn value came FROM Firebase already.
      // Using mpTurn here caused a double-write: B received Firebase turn → _setTurnPlayer
      // → mpTurn → writeCurrentTurn → 2nd Firebase write → 2nd snapshot → flicker loop.
      var msg = JSON.stringify({ type: 'mpTurnSync', currentPlayerIndex: playerIndex });
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(msg);
    }
  } catch(e) { console.warn('[MP] _setTurnPlayer error', String(e)); }
};

// Called by React Native after START_GAME to activate player-ownership enforcement.
window._initMultiplayer = function(myPlayerIndex) {
  _mp.enabled = true;
  _mp.myPlayerIndex = myPlayerIndex;
  // Disable auto-roll only — humans tap the dice in online play.
  // autoMoveOutOfHome and autoMoveSingleOption are kept enabled so:
  //   • rolling a 6 with all tokens at home auto-releases a token (same as offline)
  //   • having only one movable token auto-selects it (quality-of-life)
  // Both flags route through _mpDispatch which enforces turn ownership and
  // sends the SELECT_TOKEN action to Firestore — remote players see the move.
  try {
    _origDispatch({ type: 'SET_ASSIST_FLAG', flag: 'autoRollDice', value: false });
  } catch(e) {}

  // ── Board orientation fix ─────────────────────────────────────────────────
  // Each player sees their own home quadrant at the bottom by rotating only the
  // visual board grid (CSS transform). Game state, token positions, dice results
  // and Firebase sync are completely unaffected.
  //
  // Board quadrant layout (fixed in HTML):
  //   Player 0 (Yellow) → Top-Left     → rotate 180°
  //   Player 1 (Green)  → Top-Right    → rotate  90° CW
  //   Player 2 (Red)    → Bottom-Right → rotate   0° (no rotation)
  //   Player 3 (Blue)   → Bottom-Left  → rotate -90° CW
  var BOARD_ROTATION_DEG = [180, 90, 0, -90];
  var _boardDeg = (typeof BOARD_ROTATION_DEG[myPlayerIndex] === 'number') ? BOARD_ROTATION_DEG[myPlayerIndex] : 0;
  var _applyBoardRotation = function() {
    var grid = document.querySelector('#game .board-grid');
    if (!grid) grid = document.querySelector('.board-grid');
    if (!grid) return;
    grid.style.webkitTransform = 'rotate(' + _boardDeg + 'deg)';
    grid.style.transform = 'rotate(' + _boardDeg + 'deg)';
    grid.style.webkitTransition = 'transform 0.45s cubic-bezier(0.4,0,0.2,1)';
    grid.style.transition = 'transform 0.45s cubic-bezier(0.4,0,0.2,1)';
  };
  _applyBoardRotation();
  setTimeout(_applyBoardRotation, 200);
  setTimeout(_applyBoardRotation, 600);
  setTimeout(_applyBoardRotation, 1200);
  // ── End board orientation fix ─────────────────────────────────────────────

  // ── Corner panel layout synchronization ───────────────────────────────────
  // The board-grid rotation only moves board cells. The corner anchor divs
  // (#b0-#b3) live in #corner-row-top / #corner-row-bottom and do NOT move
  // with the board. We fix this by physically reordering the anchor divs into
  // the correct corner rows to match the rotated board layout, then
  // counter-rotating each anchor's rendered content so text stays readable.
  //
  // The game engine always renders: P0→#b0, P1→#b1, P2→#b2, P3→#b3.
  // Original DOM: #corner-row-top=[#b0(L), #b1(R)], #corner-row-bottom=[#b3(L), #b2(R)]
  //
  // After CW rotation by _boardDeg, quadrant positions shift as follows:
  //   deg=  0 → top:[b0(L) b1(R)]  bot:[b3(L) b2(R)]  (no change — Red already BR)
  //   deg= 90 → top:[b3(L) b0(R)]  bot:[b2(L) b1(R)]  (Green/b1 → bottom-right)
  //   deg=180 → top:[b2(L) b3(R)]  bot:[b1(L) b0(R)]  (Yellow/b0 → bottom-right)
  //   deg=-90 → top:[b1(L) b2(R)]  bot:[b0(L) b3(R)]  (Blue/b3 → bottom-right)
  //
  // Each sub-array: [anchorId, 'start'|'end'] — justifyContent within the half-row.
  var _CORNER_LAYOUTS = {};
  _CORNER_LAYOUTS[0]   = [['b0','start'],['b1','end'],['b3','start'],['b2','end']];
  _CORNER_LAYOUTS[90]  = [['b3','start'],['b0','end'],['b2','start'],['b1','end']];
  _CORNER_LAYOUTS[180] = [['b2','start'],['b3','end'],['b1','start'],['b0','end']];
  _CORNER_LAYOUTS[-90] = [['b1','start'],['b2','end'],['b0','start'],['b3','end']];

  var _applyCornerLayout = function() {
    var topRow = document.getElementById('corner-row-top');
    var botRow = document.getElementById('corner-row-bottom');
    if (!topRow || !botRow) return;
    var layout = _CORNER_LAYOUTS[_boardDeg];
    if (!layout) return;
    var tl = layout[0], tr = layout[1], bl = layout[2], br = layout[3];
    var tlEl = document.getElementById(tl[0]);
    var trEl = document.getElementById(tr[0]);
    var blEl = document.getElementById(bl[0]);
    var brEl = document.getElementById(br[0]);
    if (!tlEl || !trEl || !blEl || !brEl) return;

    // Reorder anchors into correct rows.
    // appendChild / insertBefore auto-detach from the old parent first.
    tlEl.style.justifyContent = 'flex-' + tl[1];
    topRow.insertBefore(tlEl, topRow.firstChild);
    trEl.style.justifyContent = 'flex-' + tr[1];
    topRow.appendChild(trEl);
    blEl.style.justifyContent = 'flex-' + bl[1];
    botRow.insertBefore(blEl, botRow.firstChild);
    brEl.style.justifyContent = 'flex-' + br[1];
    botRow.appendChild(brEl);

    // Allow overflow so corner widgets aren't clipped by the row bounds.
    topRow.style.overflow = 'visible';
    botRow.style.overflow = 'visible';

    // ── NO rotation applied to #b0-#b3 ──────────────────────────────────────
    // The corner anchor divs live OUTSIDE .board-grid, so they do NOT inherit
    // the board's CSS transform. Applying rotate(-_boardDeg) to them would
    // INTRODUCE a spurious rotation that makes player names and dice appear
    // upside-down or sideways. We explicitly reset any stale transform so
    // re-runs of this function never leave a dangling rotate() on the elements.
    ['b0','b1','b2','b3'].forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.style.webkitTransform = 'none';
      el.style.transform       = 'none';
      el.style.webkitTransition = '';
      el.style.transition       = '';
      el.style.transformOrigin  = '';
    });
  };

  _applyCornerLayout();
  setTimeout(_applyCornerLayout, 250);
  setTimeout(_applyCornerLayout, 700);
  setTimeout(_applyCornerLayout, 1500);
  // ── End corner panel layout synchronization ────────────────────────────────

  // Intercept token clicks (used for game logic).
  document.body.addEventListener('click', function(e) {
    var el = e.target;
    for (var depth = 0; depth < 6 && el && el !== document.body; depth++, el = el.parentElement) {
      var m = el.id && el.id.match(/^p-(\d+)-(\d+)$/);
      if (m) {
        break;
      }
    }
  }, true);
  var readyMsg = JSON.stringify({ type: 'mpReady', myPlayerIndex: myPlayerIndex, currentPlayerIndex: state.currentPlayerIndex });
  if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(readyMsg);
};

window._getGameState = function() {
  return {
    currentPlayerIndex: state.currentPlayerIndex,
    phase: state.phase,
    tokenPositions: state.playerTokenPositions.map(function(p) { return p ? p.slice() : null; }),
  };
};

window._restoreGameState = function(savedState) {
  try {
    if (!savedState || !savedState.tokenPositions) return;
    _restoringState = true;
    var positions = savedState.tokenPositions;
    var targetPlayerIndex = typeof savedState.currentPlayerIndex === 'number' ? savedState.currentPlayerIndex : 0;
    var delay = 0;
    for (var pi = 0; pi < 4; pi++) {
      if (!positions[pi] || !state.playerTokenPositions[pi]) continue;
      for (var ti = 0; ti < 4; ti++) {
        var pos = positions[pi][ti];
        if (typeof pos === 'number' && pos !== -1) {
          (function(p, t, ppos) {
            setTimeout(function() {
              try { _origDispatch({ type: 'GOD_TELEPORT', playerIndex: p, tokenIndex: t, toPosition: ppos }); } catch(e3) {}
            }, delay);
          })(pi, ti, pos);
          delay += 40;
        }
      }
    }
    setTimeout(function() {
      try {
        // Direct state mutation — DO NOT emit TURN_ADVANCED here.
        // The TURN_ADVANCED reducer uses event.nextPlayerIndex, not event.currentPlayerIndex.
        // Emitting TURN_ADVANCED with the wrong field name sets state.currentPlayerIndex = undefined,
        // permanently blocking all dice rolls.
        state.currentPlayerIndex = targetPlayerIndex;
        state.phase = 'AWAITING_ROLL';
        state.movableTokenIndexes = [];
        try { moveDice(); } catch(emd) {}
        try { updateCornerWidgets(); } catch(euc) {}
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mpRestored', currentPlayerIndex: targetPlayerIndex }));
        }
      } catch(e2) { console.warn('[MP] restoreCurrentPlayer error', String(e2)); }
      _restoringState = false;
    }, delay + 300);
  } catch(e) { console.warn('[MP] restoreGameState error', String(e)); }
};
// ── End Multiplayer Bridge ────────────────────────────────────────────────────

// Expose dispatch on window so React Native injectJavaScript can call it reliably.
window._ludoDispatch = _mpDispatch;
window.addEventListener("message", function(event) {
  try {
    var data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
    if (data && data.type === "setTheme" && (data.theme === "dark" || data.theme === "light")) {
      updateTheme(data.theme);
      var radio = document.querySelector('input[name="s-theme"][value="' + data.theme + '"]');
      if (radio) radio.checked = true;
    }
    if (data && data.type === "START_GAME" && data.quickStartId) {
      dispatch({ type: "START_GAME", quickStartId: data.quickStartId, namesByPlayerIndex: data.namesByPlayerIndex || [] });
    }
  } catch (e) {}
});
var _overlayInitialized = false;
var _pausedBySettings = false;
function openSettings() {
  ensureOverlay();
  const overlay = document.getElementById("settings-overlay");
  if (!overlay.classList.contains("hidden")) return;
  const gameEl = document.getElementById("game");
  const gameVisible = gameEl && !gameEl.classList.contains("hidden");
  if (gameVisible && !isGameLogicPaused()) {
    pauseGameLogic();
    _pausedBySettings = true;
  }
  overlay.classList.remove("hidden");
  goTo("settings");
}
function closeSettings() {
  const overlay = document.getElementById("settings-overlay");
  if (overlay) overlay.classList.add("hidden");
  if (_pausedBySettings) {
    dispatch({ type: COMMANDS.RESUME });
    _pausedBySettings = false;
  }
}
function ensureOverlay() {
  if (_overlayInitialized) return;
  _overlayInitialized = true;
  document.body.insertAdjacentHTML("beforeend", buildSettingsOverlay());
  const overlay = document.getElementById("settings-overlay");
  overlay.querySelector("#settings-back").addEventListener("click", () => back());
  registerScreenHandler("settings", closeSettings);
  const defaultTheme = localStorage.getItem("theme") || "dark";
  updateTheme(defaultTheme);
  const themeRadio = overlay.querySelector(\`input[name="s-theme"][value="\${defaultTheme}"]\`);
  if (themeRadio) themeRadio.checked = true;
  overlay.querySelectorAll("input[name='s-theme']").forEach((el3) => {
    el3.addEventListener("change", ($event) => {
      updateTheme($event.target.value);
    });
  });
  const soundEl = overlay.querySelector("#s-sound");
  soundEl.checked = !isSoundMuted();
  soundEl.addEventListener("change", ($event) => {
    setSoundMuted(!$event.target.checked);
  });
  ASSIST_TOGGLES.forEach((t) => {
    const value = readAssistPref(t);
    const el3 = overlay.querySelector(\`#\${t.id}\`);
    el3.checked = value;
    setAssistFlag(t.flag, value);
    el3.addEventListener("change", ($event) => {
      const next = $event.target.checked;
      localStorage.setItem(t.storageKey, next);
      setAssistFlag(t.flag, next);
    });
  });
  if (isGodModeAvailable()) {
    const godEl = overlay.querySelector("#s-god-mode");
    if (godEl) {
      godEl.checked = isGodModeEnabled();
      godEl.addEventListener("change", ($event) => {
        setGodModeEnabled($event.target.checked);
      });
    }
  }
  const activePool = getActivePoolKey();
  const poolRadio = overlay.querySelector(\`input[name="s-bot-pool"][value="\${activePool}"]\`);
  if (poolRadio) poolRadio.checked = true;
  overlay.querySelectorAll("input[name='s-bot-pool']").forEach((el3) => {
    el3.addEventListener("change", ($event) => {
      setActivePoolKey($event.target.value);
    });
  });
}
document.addEventListener("click", (e) => {
  if (e.target.id === "g-settings-btn" || e.target.closest("#g-settings-btn")) {
    openSettings();
  }
});
var Header = class extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    ensureOverlay();
    const settingsElement = htmlToElement(SETTINGS_HTML);
    settingsElement.querySelector("#settings-icon").addEventListener("click", openSettings);
    this.appendChild(settingsElement);
  }
};
window.customElements.define("wc-settings", Header);
window.__hackSetNextDice = function(val) {
  __hackNextDice = (val >= 1 && val <= 6) ? val : null;
};
window._playClickSound = function() {
  try {
    if (typeof playClickSound === "function") {
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume().then(function() { playClickSound(); }).catch(function() { playClickSound(); });
      } else {
        playClickSound();
      }
    }
  } catch(e) {}
};
document.addEventListener("touchstart", function() {
  if (audioCtx && audioCtx.state === "suspended") { try { audioCtx.resume(); } catch(e) {} }
}, { passive: true });
</script>
</body>
</html>`;
