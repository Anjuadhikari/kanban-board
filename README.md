# Kanban Board

A Trello-style board where you can sign in with Google, make lists and cards, drag cards around, set due dates, and everything saves automatically.

**Live:** https://kanban-board-six-peach-25.vercel.app


## Tech stack

React, TypeScript, Vite, TanStack Query, dnd-kit, Supabase (Postgres + Auth), deployed on Vercel.

## Run it locally

\`\`\`bash
npm install
npm run dev
\`\`\`

Add a `.env` file with your own Supabase keys:

\`\`\`
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
\`\`\`