/**
 * Dev proxy: forwards all requests from port 5000.
 * - /api/* → API server on port 8000
 * - everything else → Expo web dev server on port 18115
 */
const http = require('http');

const EXPO_PORT = 18115;
const API_PORT = 8000;
const PROXY_PORT = 5000;
const MAX_RETRIES = 30;
const RETRY_INTERVAL = 2000;

function waitForTarget(retries, cb) {
  const req = http.get({ hostname: 'localhost', port: EXPO_PORT, path: '/' }, () => {
    cb();
  });
  req.on('error', () => {
    if (retries <= 0) { cb(); return; }
    setTimeout(() => waitForTarget(retries - 1, cb), RETRY_INTERVAL);
  });
  req.setTimeout(1500, () => { req.destroy(); });
}

function proxyTo(req, res, targetPort) {
  const options = {
    hostname: 'localhost',
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `localhost:${targetPort}` },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', () => {
    if (!res.headersSent) res.writeHead(502);
    res.end(`Proxy error: target port ${targetPort} not reachable.`);
  });

  req.pipe(proxyReq, { end: true });
}

const server = http.createServer((req, res) => {
  if (req.url && req.url.startsWith('/api')) {
    proxyTo(req, res, API_PORT);
  } else {
    proxyTo(req, res, EXPO_PORT);
  }
});

console.log(`[proxy] Waiting for Expo dev server on port ${EXPO_PORT}...`);
waitForTarget(MAX_RETRIES, () => {
  server.listen(PROXY_PORT, '0.0.0.0', () => {
    console.log(`[proxy] Ready — /api → :${API_PORT} | everything else → :${EXPO_PORT}`);
  });
});
