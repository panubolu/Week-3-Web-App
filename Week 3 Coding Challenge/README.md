# FirstStep

A guided conversation that helps new Tech Fleet members find a confident first step, using only approved content, with a real person one click away.

## Run it on your computer

You need Node.js 24 or newer.

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:3000>.

## Settings

Copy `.env.example` to `.env.local` and fill in your values. Never commit `.env.local`.

## Check your work

```bash
npm run lint
```

```bash
npm run build
```

## Where things live

| Folder | What it holds |
|---|---|
| `src/app` | Pages and API routes |
| `src/components` | Screen pieces built with Material UI |
| `src/actions` | One script per thing a person can do |
| `src/domain` | Business rules. Imports nothing from other folders. |
| `src/data` | The only code that touches Supabase |
| `src/adapters` | The only code that talks to Claude |
| `src/theme.ts` | Colors, type and spacing |
| `content` | Approved opportunities and the coordinator contact |
| `supabase/migrations` | The history of the database |
| `docs` | Architecture and decisions |
