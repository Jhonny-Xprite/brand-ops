# Agent Onboarding Guide

**Welcome to Brand-Ops!**
This guide ensures you have the correct context and tools to operate effectively within the AIOX-CORE ecosystem.

---

## 🏁 Environment Setup

1.  **Work Directory:** `D:\MINI-PROJETOS-AIOX\brand-ops`
2.  **Vault Path:** `E:\BRAND-OPS-STORAGE\` (Primary asset storage)
3.  **Database:** `prisma/brand-ops.db` (SQLite)
4.  **Key Tools:**
    *   `npm run dev`: Start Next.js App.
    *   `npx prisma studio`: View database records.
    *   `rclone serve`: Start sync daemon.

---

## 📚 Essential Reading Order

1.  `docs/framework/PROJECT-DNA.md`: Understand our mission.
2.  `docs/framework/GLOSSARY.md`: Learn the project language.
3.  `docs/architecture/fullstack-architecture.md`: System design overview.
4.  `docs/decisions/ADR-INDEX.md`: See why we built it this way.

---

## 🛠️ Workflow Rules

*   **Story-Driven:** Never code without an active Story in `docs/stories/`.
*   **Surgical Edits:** Avoid refactoring outside your task scope.
*   **Validation:** Run `npm run typecheck` before closing any Story.

---

**Maintainer:** @aiox-master (Orion)
