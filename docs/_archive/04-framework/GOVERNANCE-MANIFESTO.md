# Project Governance Manifesto

**Project:** Brand-Ops
**Version:** 1.0.0

---

## 👑 Decision Authority Matrix

| Domain | Primary Owner | Quality Gate | Conflict Resolver |
|--------|---------------|--------------|-------------------|
| **Product & Scope** | @po (Pax) | @sm (River) | @aiox-master |
| **Architecture & DB** | @architect (Aria) | @dev (Dex) | @aiox-master |
| **UI/UX & Design** | @ux-design-expert (Uma) | @po (Pax) | @aiox-master |
| **Infra & DevOps** | @devops (Dax) | @architect (Aria) | @aiox-master |
| **Code Quality** | @dev (Dex) | @qa (Quinn) | @architect |

---

## 📜 Core Principles

1. **Offline-First Priority:** Any feature that breaks offline capability is rejected by default.
2. **Deterministic Sync:** Local data wins on conflict unless metadata proves otherwise.
3. **Performance Budget:** UI must remain interactive during heavy SQLite writes.
4. **Agent Autonomy:** Agents are authorized to fix bugs in their domain but must open ADRs for architectural changes.

---

**Last Review:** 2026-04-04
**Maintainer:** @sm (River)
