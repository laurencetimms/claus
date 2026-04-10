# Team Dynamics Coach — MVP

## What This Is

A standalone web app for the Team Dynamics Coach skill. Coaches use it to track team health over time using a persistent markdown state document. The app calls the Anthropic API directly using a coach-provided API key.

## Architecture

- **Frontend**: React (Vite), served as static files
- **Backend**: Express.js, single `/chat` endpoint
- **No database**: team state lives on the coach's disk as `team-state.md`
- **API key**: provided by the coach at runtime, never stored server-side

## Core User Flow

1. Coach opens the app
2. Coach enters their Anthropic API key (stored in sessionStorage only)
3. Coach optionally uploads a `team-state.md` from a previous session
4. Coach optionally selects a team event from a dropdown
5. An info box appears above the input suggesting useful context to provide
6. Coach types their session notes and sends
7. App calls backend `/chat` endpoint with key + state + message
8. Backend injects SKILL.md as system prompt, calls Anthropic API
9. Response is displayed; updated team state is extracted and shown in right panel
10. Coach copies state to clipboard or downloads it for next session

## Layout

Two-panel layout:
- **Left panel (chat)**: messages, event selector, info box, input area, upload button
- **Right panel (state)**: rendered team state markdown, copy/download button

Same dark aesthetic as the existing wrapper:
- Background: #141210
- Surface: #1c1917
- Accent: #c4873a
- Text: #e8e0d5
- Font: DM Mono (monospace), Georgia/serif for headings

## Key Constraints

- Coach-provided API key — never stored beyond the session
- Team state never stored server-side — in/out of API call only
- No skill editing UI in MVP — SKILL.md loaded from server/skill.md at runtime
- No user accounts, no database
- Privacy: team state goes coach's disk → API → coach's disk only

## Event Selector

Dropdown above the input. Selecting an event shows an info box with coaching prompts.
Defined in `client/src/constants/events.js`.

Events: Daily Sync, Refinement, Demo, 1:1, Retrospective, Planning, Post-mortem.

## File Structure

```
mvp/
├── CLAUDE.md
├── package.json                    # root — scripts to run both
├── server/
│   ├── index.js                    # Express server
│   ├── skill.md                    # Team dynamics skill (loaded at runtime)
│   └── .env.example                # PORT and ANTHROPIC not needed — key comes from client
├── client/
│   ├── vite.config.js              # proxy /chat to express in dev
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                  # root component, state management
│       ├── constants/
│       │   └── events.js           # event definitions and info box copy
│       └── components/
│           ├── ApiKeyInput.jsx     # key entry, stored in sessionStorage
│           ├── ChatPanel.jsx       # messages, event selector, input
│           ├── EventSelector.jsx   # dropdown
│           ├── EventInfoBox.jsx    # contextual prompt display
│           └── StatePanel.jsx      # state doc display, copy/download
└── README.md
```

## API

### POST /chat

Request body:
```json
{
  "apiKey": "sk-ant-...",
  "teamState": "# Team State: ...",
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "userMessage": "Latest message from coach"
}
```

Response:
```json
{
  "reply": "Coach response text",
  "updatedState": "# Team State: ...",
  "rawResponse": "Full response including state block"
}
```

The backend:
1. Loads skill.md from disk
2. Builds the messages array (prepending state doc to first message if present)
3. Calls Anthropic API with skill as system prompt
4. Extracts state from between `---BEGIN TEAM STATE---` and `---END TEAM STATE---`
5. Returns reply and extracted state separately

### State Extraction

```javascript
function extractState(text) {
  const start = text.indexOf("---BEGIN TEAM STATE---");
  const end = text.indexOf("---END TEAM STATE---");
  if (start !== -1 && end !== -1) {
    return {
      reply: text.slice(0, start).trim(),
      updatedState: text.slice(start + "---BEGIN TEAM STATE---".length, end).trim()
    };
  }
  return { reply: text, updatedState: null };
}
```

## Deployment (Railway)

- Root `package.json` has a `start` script that runs the Express server
- Express serves the Vite build from `client/dist` in production
- Single service, single port
- Environment variable: none required (API key comes from client)

## Build Scripts (root package.json)

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && node --watch index.js",
    "dev:client": "cd client && vite",
    "build": "cd client && vite build",
    "start": "node server/index.js"
  }
}
```

## Styling Approach

- Inline styles in React components using the established color palette
- No CSS framework — keep it consistent with existing wrapper
- DM Mono from Google Fonts
- Responsive is not a priority for MVP — optimise for desktop coach use
