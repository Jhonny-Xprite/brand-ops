# Testing Reality

## Test Coverage Status

**Test Files Found:** 28 .test.ts(x) files across codebase  
**Framework:** Jest + React Testing Library  
**Coverage:** Unknown (requires `npm test -- --coverage`)

## Test Organization

Tests are **colocated** with components:
```
src/components/atoms/__tests__/theme-toggle.test.tsx
src/components/CreativeLibrary/__tests__/creative-library.integration.test.ts
src/store/creativeLibrary/__tests__/metadata.slice.test.ts
src/lib/__tests__/fileUtils.test.ts
```

## Test File Inventory

| Area | Found | Examples |
|------|-------|----------|
| **Component Tests** | ~12 | theme-toggle.test.tsx, copy-card.test.tsx, branding-form.test.tsx |
| **Integration Tests** | ~4 | creative-library.integration.test.ts |
| **Utility Tests** | ~8 | fileUtils, metadataEditor, versionHistory |
| **Hook Tests** | ~2 | useOnlineStatus, useProjects |
| **Store Tests** | ~2 | Redux slices |

## Jest Configuration

**Config File:** `jest.config.js`  
**Environments:** jsdom (browser environment)  
**Extensions:** .ts, .tsx, .js  
**Setup Files:** Configured for jest-dom matchers

## Running Tests

```bash
npm test                    # Run all tests
npm test -- --coverage     # With coverage report
npm test -- --watch       # Watch mode
```

---
