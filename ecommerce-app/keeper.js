const axios = require('axios');
const http = require('http');

console.log("🟢 [DEBUG] keeper.js script loaded into memory");

// This script keeps your Render free tier web service awake by pinging it periodically.
// It also starts a simple HTTP server to satisfy Render's requirement for a web service to bind to a port.

const SITE_URL = process.env.SITE_URL || "https://www.asaliswad.shop";
const KEEPER_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 4000}`;
const PING_INTERVAL = 20000; // 20 seconds
const PORT = process.env.PORT || 4000;

// 1. Create a simple server to keep the Keeper service itself awake
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Keeper is awake and active\n');
}).listen(PORT, () => {
  console.log(`🚀 Keeper server is running on port ${PORT}`);
});

// 2. Function to ping the website(s)
function reloadWebsite() {
  // Ping the main site
  axios.get(SITE_URL)
    .then(() => {
      console.log(`✅ [${new Date().toLocaleTimeString()}] Ping successful: ${SITE_URL}`);
    })
    .catch((error) => {
      console.error(`❌ [${new Date().toLocaleTimeString()}] Ping failed for ${SITE_URL}: ${error.message}`);
    });

  // Also ping itself to keep the keeper awake
  if (process.env.RENDER_EXTERNAL_URL) {
    axios.get(process.env.RENDER_EXTERNAL_URL)
      .then(() => {
        console.log(`✅ [${new Date().toLocaleTimeString()}] Self-ping successful`);
      })
      .catch((err) => {
        console.error(`❌ Self-ping failed: ${err.message}`);
      });
  }
}

// 3. Start pinging
setInterval(reloadWebsite, PING_INTERVAL);

console.log(`🔄 [SYSTEM] Keeper started - target: ${SITE_URL}`);
console.log(`🕒 [SYSTEM] Ping interval: ${PING_INTERVAL / 1000} seconds`);

// Initial ping immediately on startup
reloadWebsite();
