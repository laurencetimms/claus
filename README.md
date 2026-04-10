# Team Dynamics Coach — MVP

Standalone web app for longitudinal team dynamics coaching.

## Quick Start

```bash
cd mvp
npm install
cp server/.env.example server/.env
npm run dev
```

Open http://localhost:5173, enter your Anthropic API key, and start coaching.

## Development

Two processes run concurrently:
- **Express server** on port 3001 — handles `/chat` API calls, loads `server/skill.md`
- **Vite dev server** on port 5173 — proxies `/chat` to Express

```bash
npm run dev          # both together
npm run dev:server   # Express only
npm run dev:client   # Vite only
```

## Production Build

```bash
npm run build   # builds client to client/dist
npm start       # serves everything from Express on port 3001
```

## Deployment (Railway)

1. Push to GitHub
2. New Railway project → Deploy from GitHub repo
3. Set root directory to `mvp/`
4. Railway detects `package.json` and runs `npm start`
5. No environment variables needed (API key comes from the coach's browser)

## Skill

The coaching skill lives in `server/skill.md`. It is loaded fresh on each request
in development (so edits take effect immediately) and at startup in production.

To update the skill, edit `server/skill.md` and redeploy.

## Privacy

- Team state documents are never stored server-side
- API keys are held in `sessionStorage` only — cleared when the browser tab closes
- Anthropic API usage does not train models

## File Structure

```
mvp/
├── package.json                    # root scripts
├── server/
│   ├── index.js                    # Express server + /chat endpoint
│   ├── skill.md                    # Team dynamics coaching skill
│   └── .env.example
└── client/
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── constants/
        │   └── events.js           # Event types and info box prompts
        └── components/
            ├── ApiKeyInput.jsx
            ├── ChatPanel.jsx
            ├── EventSelector.jsx   # Dropdown + info box
            └── StatePanel.jsx
```
