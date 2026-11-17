# Badini Translate

Run locally (Node 18+):

    npm install
    ANTHROPIC_API_KEY=sk-ant-... npm start
    # open http://localhost:3000

Deploy on Render.com: push this folder to GitHub, create a Web Service from the repo,
Build command `npm install`, Start command `npm start`, add the env var ANTHROPIC_API_KEY.
Get a key at https://console.anthropic.com. Usage is billed to your key; the server rate-limits each IP (default 20 requests/min).
