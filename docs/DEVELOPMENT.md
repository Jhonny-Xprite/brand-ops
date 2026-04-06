# Development Guide

Guia completo de setup, configuração e fluxos de desenvolvimento para o projeto Brand Operations.

---

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Pre-Commit Hooks (Husky + lint-staged)](#pre-commit-hooks-husky--lint-staged)
3. [Development Commands](#development-commands)
4. [Troubleshooting](#troubleshooting)

---

## Initial Setup

### Prerequisites

- **Node.js** v24+ (check with `node --version`)
- **npm** v11+ (check with `npm --version`)
- **Git** (with bash support)
- **Git Bash** or WSL2 (for Windows users)

### Installation Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd brand-ops

# 2. Install dependencies
npm install

# 3. Initialize Husky hooks
npx husky install

# 4. Setup environment variables
cp .env.example .env  # If available
# Edit .env with your configuration

# 5. Verify setup
npm run typecheck   # TypeScript check
npm run lint        # ESLint check
npm test            # Run test suite
```

---

## Pre-Commit Hooks (Husky + lint-staged)

### Overview

This project uses **Husky** and **lint-staged** to automatically run quality checks before each commit:

- **Husky**: Git hooks management
- **lint-staged**: Runs tools only on staged files (fast!)
- **ESLint**: Code style and pattern validation
- **TypeScript**: Type safety verification

### How It Works

```
git commit -m "message"
    ↓
.husky/pre-commit hook triggers
    ↓
lint-staged processes staged files
    ↓
Runs on *.{ts,tsx} files:
├─ eslint --fix        (auto-fix style issues)
└─ tsc --noEmit        (type checking)
    ↓
Success? → Commit proceeds
Failure? → Commit blocked, errors shown
```

### Configuration

**File:** `package.json`

```json
{
  "devDependencies": {
    "husky": "^9.1.7",
    "lint-staged": "^16.4.0"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "tsc --noEmit"
    ]
  }
}
```

**File:** `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

### Testing the Hooks

#### Test 1: Code with Linting Errors

```bash
# Create a file with style issues
echo "const x=1;" > test.ts

# Try to commit
git add test.ts
git commit -m "test"

# Expected: ESLint error, commit blocked
# ESLint will auto-fix and you can retry
```

#### Test 2: Code with Type Errors

```bash
# Create a file with type issues
cat > test.ts << 'EOF'
const x: string = 123;  // Type mismatch
EOF

# Try to commit
git add test.ts
git commit -m "test"

# Expected: TypeScript error, commit blocked
# Fix the error and retry
```

#### Test 3: Valid Code

```bash
# Create valid TypeScript code
cat > test.ts << 'EOF'
const add = (a: number, b: number): number => a + b;
export default add;
EOF

# Try to commit
git add test.ts
git commit -m "feat: add utility function"

# Expected: All checks pass, commit succeeds
```

### When ESLint Auto-Fixes

ESLint can automatically fix many issues:

```bash
# ❌ Before (invalid)
const x=1;function test(){return x}

# ✅ After (auto-fixed by ESLint)
const x = 1;
function test() {
  return x;
}
```

If ESLint auto-fixes your code, the staged files are updated. You'll see:

```
[COMPLETED] eslint --fix
```

Retry the commit and it should pass.

### When TypeScript Blocks

TypeScript type-checking cannot auto-fix. You must manually fix type errors:

```bash
# ❌ Type error (TypeScript blocks)
const x: string = 123;

# ✅ Fixed manually
const x: string = "hello";
```

### Bypassing Hooks (Emergency Only)

**⚠️ WARNING:** Only use for critical hotfixes. Requires later review.

```bash
# Skip all hooks
git commit --no-verify -m "emergency: critical hotfix"

# ⚠️ This bypasses ALL quality checks
# ⚠️ Use sparingly and document in commit message
```

### Troubleshooting Hooks

#### "pre-commit script failed"

Hooks failed = quality checks found issues.

**Solution:** Fix the errors and retry

```bash
# See what failed
npm run lint      # Check ESLint issues
npm run typecheck # Check TypeScript issues

# Fix issues (many ESLint issues auto-fix)
npm run lint -- --fix

# Retry commit
git add .
git commit -m "message"
```

#### "Hooks not running"

If hooks don't run, verify setup:

```bash
# Check Husky is installed
ls -la .husky/

# Expected output:
# total X
# drwxr-xr-x  .
# -rwxr-xr-x  pre-commit
# drwxr-xr-x  _

# If missing, reinitialize
npx husky install
```

#### Windows/WSL Issues

**On Windows native (not WSL):**

```bash
# Verify git line endings
git config core.safecrlf false

# Or configure for your system
git config core.autocrlf true
```

**On WSL2:**

Hooks should work automatically. If not:

```bash
# Test hook directly
bash .husky/pre-commit

# Verify git config
git config core.hooksPath
# Should show: .husky
```

#### "CRLF will be replaced by LF" Warning

This is normal on Windows. The warning appears because:

- Hooks run in POSIX shell (LF line endings)
- Windows Git stores files with CRLF line endings
- Git auto-converts when needed

**This is fine.** It won't affect the commit.

---

## Development Commands

### Build & Serve

```bash
# Start development server
npm run dev
# Runs on http://localhost:3000

# Build for production
npm run build

# Start production server
npm run start
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- src/components/__tests__/Button.test.ts
```

### Code Quality

```bash
# Check linting (without auto-fix)
npm run lint

# Auto-fix linting issues
npm run lint -- --fix

# TypeScript type checking
npm run typecheck
```

### Database

```bash
# Generate Prisma client
npm run prisma:generate

# Create/run migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

### AIOX Commands

```bash
# Validate project structure
npm run validate:structure

# Validate all agents
npm run validate:agents

# Sync IDE settings
npm run sync:ide
```

---

## Troubleshooting

### npm install fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Tests fail

```bash
# Clear Jest cache
npm test -- --clearCache

# Rerun tests
npm test
```

### TypeScript errors after install

```bash
# Regenerate types
npm run prisma:generate
npm run typecheck
```

### Port 3000 already in use

```bash
# Find and kill process on port 3000
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On macOS/Linux:
lsof -i :3000
kill -9 <PID>

# Then restart dev server
npm run dev
```

---

## Editor Setup

### VS Code

**Recommended extensions:**

- ESLint
- Prettier (optional, ESLint handles formatting)
- TypeScript Vue Plugin
- Prisma

**settings.json:**

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": false,
  "[typescript]": {
    "editor.defaultFormatter": "dbaeumer.vscode-eslint"
  }
}
```

### WebStorm / IntelliJ IDEA

- Built-in ESLint support
- Built-in TypeScript support
- No additional setup needed

---

## Common Workflows

### Creating a New Feature

```bash
# 1. Create feature branch (optional)
git checkout -b feature/my-feature

# 2. Make changes
# Edit files...

# 3. Run tests
npm test

# 4. Check quality
npm run lint
npm run typecheck

# 5. Commit (hooks run automatically)
git add .
git commit -m "feat: add my feature"

# 6. Push to remote
git push origin feature/my-feature
```

### Fixing a Bug

```bash
# 1. Create bugfix branch
git checkout -b fix/bug-name

# 2. Write failing test first
# Add test in __tests__/...

# 3. Implement fix
# Edit source files...

# 4. Verify fix passes tests
npm test

# 5. Commit
git add .
git commit -m "fix: resolve bug description"

# 6. Create PR (via GitHub/CLI)
git push origin fix/bug-name
gh pr create --title "Fix: bug description"
```

---

## Resources

- **AIOX Framework**: `.aiox-core/constitution.md`
- **Story Development**: `docs/stories/`
- **Architecture**: `docs/architecture/`
- **Setup Script**: `bin/aiox-init.js`

---

**Last Updated:** 2026-04-06  
**Version:** 2.0.0  
**Framework:** Synkra AIOX
