/**
 * Dev proxy: forwards all requests from port 5000 to the Expo web dev server
 * on port 18115. This lets Replit's preview pane (port 5000) display the app.
 */
const http = require('http');

const TARGET_PORT = 18115;
const PROXY_PORT = 5000;
const MAX_RETRIES = 30;
const RETRY_INTERVAL = 2000;

function waitForTarget(retries, cb) {
  const req = http.get({ hostname: 'localhost', port: TARGET_PORT, path: '/' }, () => {
    cb();
  });
  req.on('error', () => {
    if (retries <= 0) { cb(); return; }
    setTimeout(() => waitForTarget(retries - 1, cb), RETRY_INTERVAL);
  });
  req.setTimeout(1500, () => { req.destroy(); });
}

const server = http.createServer((req, res) => {
  const options = {
    hostname: 'localhost',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `localhost:${TARGET_PORT}` },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', () => {
    if (!res.headersSent) res.writeHead(502);
    res.end('Expo dev server not ready yet. Please wait a moment and refresh.');
  });

  req.pipe(proxyReq, { end: true });
});

console.log(`[proxy] Waiting for Expo dev server on port ${TARGET_PORT}...`);
waitForTarget(MAX_RETRIES, () => {
  server.listen(PROXY_PORT, '0.0.0.0', () => {
    console.log(`[proxy] Ready — forwarding :${PROXY_PORT} → :${TARGET_PORT}`);
  });
});
