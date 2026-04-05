# Development Setup and Commands

## Required Environment Variables

```
DATABASE_URL="file:./prisma/dev.db"  # SQLite database path
NODE_ENV=development|production
```

## Local Development Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations (if needed)
npm run prisma:migrate

# Start development server
npm run dev

# Open http://localhost:3000
```

## Build and Production

```bash
npm run build              # Production build
npm run start              # Start production server
npm run typecheck          # Type checking
npm run lint               # Linting
```

## Database Management

```bash
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Create/run migrations
npm run prisma:studio     # Open Prisma Studio GUI
```

## Testing

```bash
npm test                   # Run all tests
npm test -- --coverage    # With coverage report
npm test -- --watch       # Watch mode
```

## Sync Tools (AIOX Framework)

```bash
npm run sync:ide          # Sync IDE configuration
npm run sync:skills:codex # Sync skills
npm run validate:structure # Validate project structure
npm run validate:agents   # Validate AIOX agents
```

---
