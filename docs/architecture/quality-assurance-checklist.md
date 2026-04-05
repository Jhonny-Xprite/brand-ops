# Quality Assurance Checklist

Before future enhancements, verify:

- [ ] TypeScript strict mode checks pass (`npm run typecheck`)
- [ ] ESLint passes without warnings (`npm run lint`)
- [ ] All tests pass (`npm test`)
- [ ] Test coverage > 50% for modified files
- [ ] No console.errors or warnings in dev console
- [ ] Prisma schema changes migrated (`npm run prisma:migrate`)
- [ ] File paths are OS-agnostic (use path module)
- [ ] API responses validated against types
- [ ] Error messages clear and actionable
- [ ] File uploads validated (type, size)
- [ ] Metadata tags and notes bounded
- [ ] Database transactions considered for multi-step operations

---
