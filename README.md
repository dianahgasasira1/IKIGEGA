# IKIGEGA

A Kinyarwanda voice-first business operating system for women running
micro and informal businesses in Rwanda.

## What it does

- **Voice ledger** — log sales, purchases, and expenses by speaking Kinyarwanda
- **Spoken business intelligence** — daily/weekly/monthly summaries read aloud
- **Credit-readiness graduation** — turn voice-logged history + MTN Mobile Money
  data into a verifiable business statement for SACCO submission
- **Ibimina** — digitised rotating savings group

## Stack

- **Frontend:** Next.js 14 PWA, Tailwind, TypeScript
- **Backend:** NestJS, PostgreSQL 15, JWT
- **Package manager:** pnpm (monorepo)
- **External services:** Kinyarwanda ASR (MBAZA-NLP), Kinyarwanda TTS,
  MTN MoMo Open API, Africa's Talking SMS

## Repo layout

```
ikigega/
├── apps/
│   ├── frontend/         # Next.js 14 PWA — voice capture, offline cache, UI
│   └── backend/          # NestJS API — auth, voice service, business logic, DB
├── docs/
│   └── srs.pdf           # Software Requirements Specification (Version 1.0)
├── .github/
│   └── workflows/        # CI pipelines (linting, tests, builds)
├── .gitignore
├── LICENSE
├── README.md
└── package.json          # pnpm workspace root
```

## Status

Version 1.0 (MVP) — in active development. See `docs/srs.pdf` for scope.

## Author

Dianah Shimwa Gasasira, African Leadership University (ALU)
