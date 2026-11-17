import express from "express";
const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "8mb" }));
app.use(express.static("public"));

const KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.MODEL || "claude-sonnet-5-5";
const LIMIT = +process.env.RATE_LIMIT_PER_MIN || 20;
const hits = new Map();
setInterval(() => hits.clear(), 60000);

app.post("/api/ask", async (req, res) => {
  if (!KEY) return res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY." });
  const n = (hits.get(req.ip) || 0) + 1;
  hits.set(req.ip, n);
  if (n > LIMIT) return res.status(429).json({ error: "Too many requests. Please wait a minute and try again." });
  const { prompt, image } = req.body || {};
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 14000)
    return res.status(400).json({ error: "Text is empty or too long." });
  const content = [];
  if (image) content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: image } });
  content.push({ type: "text", text: prompt });
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 4096, messages: [{ role: "user", content }] }),
    });
    const j = await r.json();
    if (!r.ok) return res.status(502).json({ error: j?.error?.message || "AI service error." });
    res.json({ text: (j.content || []).filter(b => b.type === "text").map(b => b.text).join("") });
  } catch (e) {
    res.status(502).json({ error: "Could not reach the AI service." });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Badini Translate is running"));
