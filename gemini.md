# GEMINI.md - PokerMastery

**AI Development Guide for Gemini**

This document serves as the primary guide for Gemini AI to understand, maintain, and develop the PokerMastery project efficiently. It is based on `CLAUDE.md` and reflects the current state of the project.

---

## Recent Updates & Status (2025-01-13)

### Current Phase: MVP Release Preparation
The project is currently in the **MVP Release** phase, focusing on the **Hand Replayer**.

**Status:** 🟢 95% Complete
**Blocking Items:** Dashboard improvements, Hand Calculator polish.

### Key Achievements
- **Rebranding:** Complete rebranding from "PokerMastery" to "PokerMastery".
- **Parsers:** GGPoker parser ~90% coverage.
- **Testing:** Comprehensive test suite framework created.
- **Visuals:** Player positioning layout implemented and validated.
- **Assets:** Logo updated.

**See**: [`MVP_RELEASE_CHECKLIST.md`](./MVP_RELEASE_CHECKLIST.md) for detailed status.

---

## Table of Contents

- [Recent Updates & Status](#recent-updates--status-2025-01-13)
- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Key Files Reference](#key-files-reference)
- [Common Commands](#common-commands)
- [Coding Conventions](#coding-conventions)
- [Testing Guidelines](#testing-guidelines)
- [Deployment](#deployment)

---

## Project Overview

### Mission
**PokerMastery** is a comprehensive ecosystem for poker players and teams, providing tools for bankroll management, GTO study, hand analysis, and coaching.

### Two-Pronged Approach
1. **B2C Mobile App** - Player-focused tools (bankroll, GTO, study lab, marketplace)
2. **B2B Web Platform (Team Pro)** - Team management for coaches and managers

---

## Technology Stack

### Backend (NestJS)
- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL 14+
- **ORM:** Prisma
- **Auth:** JWT (Access + Refresh Tokens)
- **Validation:** class-validator
- **Testing:** Jest

### Frontend Mobile (React Native) - *Future*
- **Framework:** React Native + TypeScript
- **State:** Zustand
- **Navigation:** React Navigation
- **Styling:** NativeWind (Tailwind for RN)

### Frontend Web (Next.js)
- **Framework:** Next.js 14+ (TypeScript)
- **Rendering:** SSR + SSG
- **State:** React Context + Zustand
- **Styling:** Tailwind CSS

---

## Project Structure

```
poker-grinders-edge/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── modules/           # Feature modules (auth, sessions, hand-history-sessions, users)
│   │   ├── common/            # Shared code (decorators, guards, pipes)
│   │   ├── database/          # Prisma service
│   │   └── main.ts           # Application entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── migrations/       # Migration history
│   └── test/                 # E2E tests
│
├── mobile/                    # React Native app (future)
│
├── web/                      # Next.js web app
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   ├── lib/            # Utilities (parsers, etc.)
│   │   └── locales/        # i18n translation files
│
└── Docs/                     # Documentation
    ├── PRD - PokerMastery.md
    ├── ARCHITECTURE.md
    ├── TROUBLESHOOTING.md
    ├── TESTING_STRATEGY.md
    ├── API_REFERENCE.md
    └── DATABASE_SCHEMA.md
```

---

## Development Workflow

### 1. Planning
- Check **PRD**, **ARCHITECTURE.md**, and **DATABASE_SCHEMA.md**.
- For new features, understand business requirements and design patterns.

### 2. Development Process
- **TDD** is mandatory for: Financial calculations, Hand history parsing, Side pot calculations, Authentication logic.
- **Design Patterns:**
    - **Strategy Pattern:** For Hand History Parsers (`IPokerSiteParser`).
    - **Repository Pattern:** For database interactions via `PrismaService`.
    - **Dependency Injection:** Throughout NestJS backend.

### 3. Code Review Checklist
- [ ] Tests pass (`npm test`)
- [ ] Code follows conventions
- [ ] No TypeScript errors
- [ ] Documentation updated

---

## Key Files Reference

### Essential Files
- **Auth:** `backend/src/modules/auth/auth.service.ts`, `backend/src/common/guards/jwt-auth.guard.ts`
- **Sessions:** `backend/src/modules/sessions/sessions.service.ts`, `backend/prisma/schema.prisma`
- **Hand History:** `backend/src/modules/hand-history-sessions/hand-history-sessions.service.ts`
- **Parsers:** `web/src/lib/parsers/`

### Configuration
- `backend/.env` (Environment variables)
- `backend/prisma/schema.prisma` (Database schema)

---

## Common Commands

### Backend
```bash
cd backend
npm run start:dev             # Start dev server
npx prisma migrate dev        # Create new migration
npm test                      # Run unit tests
```

### Web
```bash
cd web
npm run dev                   # Start dev server
npm test                      # Run tests
```

---

## Coding Conventions

- **File Naming:** `kebab-case` (e.g., `sessions.service.ts`).
- **Classes:** `PascalCase` (e.g., `SessionsService`).
- **Interfaces:** `IPrefix` for backend (e.g., `IPokerSiteParser`).
- **Variables/Methods:** `camelCase`.
- **Constants:** `UPPER_SNAKE_CASE`.

---

## Testing Guidelines

- **Coverage:** 80% minimum overall. 100% for financial logic.
- **Structure:** Use `describe` and `it` blocks.
- **Tools:** Jest for backend and web logic.

---

## Next Actions (Immediate)

1.  **Visual Validation of Layouts:** Check `/test-layouts` on the web app.
2.  **Logo Creation:** Create and place `pokermastery-logo.png` in `/web/public/assets/images/`.
3.  **Collect Hand Histories:** Gather real hand histories for PokerStars and add to tests.

---

**Last Updated:** 2025-01-13 (Gemini Initialization)
