# Epic 10 — Tech Modernization & Quality

**Status:** In Planning  
**Created:** 2026-04-05  
**Owner:** @sm (River)

---

## Epic Overview

Critical improvements for project stability, code quality, testing coverage, and dependency management.

**Scope:** 6+ stories focusing on:
- Error handling & reliability (Error Boundaries, file validation)
- Testing & coverage (increase to 70%+)
- Code quality (schema validation, linting)
- Dependency management (security updates, compatibility)

---

## Priority Stories

### Critical Priority (Implement First)

| Story | Title | Effort | Impact | Status |
|-------|-------|--------|--------|--------|
| 10.1 | Add Error Boundaries | LOW | MEDIUM | 📝 Draft |
| 10.2 | Formalize File Upload Validation | LOW | MEDIUM | 📝 Draft |
| 10.3 | Document Environment Variables | TRIVIAL | LOW | 📝 Draft |

### High Priority (Next Sprint)

| Story | Title | Effort | Impact | Status |
|-------|-------|--------|--------|--------|
| 10.4 | Increase Test Coverage (Target 70%) | MEDIUM | HIGH | 📝 Draft |
| 10.5 | Introduce Schema Validation (Zod) | MEDIUM | MEDIUM | 📝 Draft |
| 10.6 | Setup Husky + Lint-Staged | LOW | MEDIUM | 📝 Draft |

### Medium Priority (Backlog)

| Story | Title | Effort | Impact | Status |
|-------|-------|--------|--------|--------|
| 10.7 | Extract API Client Layer | MEDIUM | MEDIUM | 📝 Backlog |
| 10.8 | Component Library Package | HIGH | MEDIUM | 📝 Backlog |

---

## Success Criteria

✅ All critical priority stories completed  
✅ Test coverage > 70%  
✅ No console errors in development  
✅ TypeScript strict mode passes  
✅ ESLint passes without warnings  

---

## Acceptance Criteria (Epic Level)

- [ ] Error Boundaries prevent full app crashes
- [ ] File uploads have size and type validation
- [ ] All environment variables documented
- [ ] Test coverage reaches 70%+ for critical paths
- [ ] Form validation uses Zod schemas
- [ ] Pre-commit hooks run linting automatically

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-04-05 | River | Initial epic created from Modernization Roadmap |

---

## Related Documentation

- **Modernization Roadmap:** `docs/MODERNIZATION_ROADMAP.md`
- **Architecture Reference:** `docs/brownfield-architecture.md`
- **Tech Stack:** `docs/architecture/technical-stack-current-versions.md`

---

## Next Steps

1. ✅ Epic created
2. ⏭️ Create detailed stories (10.1, 10.2, 10.3)
3. ⏭️ @po validates stories
4. ⏭️ @dev implements in order
5. ⏭️ @qa gates each story
