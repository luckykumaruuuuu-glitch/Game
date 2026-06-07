#!/usr/bin/env node
/**
 * Bundle the entire LeLudo vanilla JS game into a single self-contained HTML.
 * This is needed because React Native WebView cannot serve multi-file ES module
 * apps via file:// protocol. We inline all JS (via esbuild) and CSS, then write
 * the result to assets/ludo-game.html which is loaded by the WebView screen.
 */

import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dir, '../../attached_assets/leludo-main/leludo-main');
const OUT_DIR = resolve(__dir, '../assets');
const OUT_FILE = resolve(OUT_DIR, 'ludo-game.html');

async function bundle() {
  // Bundle both JS entry points into a single file
  const jsResult = await build({
    entryPoints: [
      resolve(SRC, 'components/index.js'),
      resolve(SRC, 'scripts/index.js'),
    ],
    bundle: true,
    format: 'esm',
    write: false,
    minify: false,
    platform: 'browser',
    // Suppress service worker / capacitor plugin imports gracefully
    external: [],
    define: {
      'import.meta.env': '{"MODE":"production"}',
    },
    plugins: [
      {
        name: 'ignore-missing',
        setup(build) {
          build.onResolve({ filter: /\.(mp3|wav|ogg|svg|png|ico)$/ }, () => ({
            path: 'empty', namespace: 'empty',
          }));
          build.onLoad({ filter: /.*/, namespace: 'empty' }, () => ({
            contents: 'export default ""',
            loader: 'js',
          }));
        },
      },
    ],
  });

  const jsCode = jsResult.outputFiles
    .map(f => f.text)
    .join('\n');

  // Read all CSS files
  const cssFiles = [
    'styles/base.css',
    'components/wc-board.css',
    'components/wc-quick-start.css',
    'components/wc-settings.css',
    'components/wc-game-end.css',
    'components/wc-dice.css',
    'components/wc-token.css',
    'components/wc-pause-menu.css',
  ];

  const cssChunks = await Promise.all(
    cssFiles.map(f => readFile(resolve(SRC, f), 'utf8').catch(() => ''))
  );
  // Remove Google Fonts @import (won't load in WebView offline) — replace with system fonts
  const css = cssChunks
    .join('\n')
    .replace(/@import url\([^)]+\);?/g, '')
    .replace(/--font-display:[^;]+;/, '--font-display: Georgia, serif;')
    .replace(/--font-sans:[^;]+;/, '--font-sans: -apple-system, sans-serif;')
    .replace(/--font-mono:[^;]+;/, '--font-mono: monospace;');

  // Build the HTML string — exact copy of index.html body, everything inlined
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
<meta name="mobile-web-app-capable" content="yes"/>
<meta name="apple-mobile-web-app-capable" content="yes"/>
<title>Ludo</title>
<style>
${css}
/* Mobile safe-area and full-screen fixes */
html, body { height: 100%; margin: 0; padding: 0; overflow: hidden; }
#root { height: 100dvh; overflow: auto; }
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
      <div style="padding:16px 0; display:flex; flex-direction:column; gap:24px;">
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
${jsCode}
</script>
</body>
</html>`;

  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, html, 'utf8');
  const sizeKb = Math.round(html.length / 1024);
  console.log(`✅ Bundled LeLudo → assets/ludo-game.html (${sizeKb} KB)`);
}

bundle().catch(err => {
  console.error('Bundle failed:', err.message);
  process.exit(1);
});
