import axios from "axios";

// Your production URL
const SITE_URL = process.env.SITE_URL || "https://your-site.onrender.com";
const PING_INTERVAL = 25000; // 25 seconds (Render sleeps after 15 min)

console.log(`🔄 Keeper started - pinging ${SITE_URL} every 25 seconds`);

setInterval(async () => {
  try {
    const response = await axios.get(`${SITE_URL}/api/health`, {
      timeout: 10000,
    });
    console.log(`✅ Ping successful at ${new Date().toISOString()}`);
  } catch (error) {
    console.error(
      `❌ Ping failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}, PING_INTERVAL);

// Keep the process alive
process.on("SIGTERM", () => {
  console.log("🛑 Keeper stopping gracefully");
  process.exit(0);
});
