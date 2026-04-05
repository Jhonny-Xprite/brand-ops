# Technical Debt and Known Issues

## 1. **Prisma Custom Serialization (Workaround)**
**Severity:** MEDIUM  
**Location:** `src/store/index.ts`, `src/lib/types/models.ts`

**Issue:** Redux requires serializable state. Prisma models include Date objects and BigInt.

**Workaround:**
- Custom `isReduxSerializable()` function handles Date, BigInt, and plain objects
- Warned after 128 levels of immutability checks (performance tradeoff)

**Recommendation:** Consider RTK Query for cleaner async data handling, or migrate to a REST API layer that handles serialization.

## 2. **SQLite JSON Storage for Tags**
**Severity:** LOW  
**Location:** `src/lib/types/models.ts`, `prisma/schema.prisma`

**Issue:** SQLite doesn't have native JSON array support; tags stored as JSON-encoded string.

**Workaround:**
- Parse/serialize JSON strings on app side
- `parseFileMetadataTags()` and `serializeFileMetadataTags()` handle conversion

**Note:** This is acceptable for current scale; revisit if tags become heavily used.

## 3. **File Path as Unique Identifier**
**Severity:** LOW  
**Location:** `prisma/schema.prisma`, `src/pages/api/files/[id].ts`

**Issue:** File paths stored uniquely; if filesystem structure changes, lookups fail.

**Current Handling:** Files read directly from disk using stored path.

**Risk:** Moving files externally breaks references. No path normalization across OSes (Windows vs Linux).

**Recommendation:** Consider file content hash or UUID-based storage instead of file paths.

## 4. **No Error Boundaries**
**Severity:** MEDIUM  
**Location:** `src/pages/_app.tsx`, components/

**Issue:** No React error boundaries; component errors crash entire app.

**Recommendation:** Implement Error Boundary component for graceful error handling.

## 5. **File Upload Validation**
**Severity:** MEDIUM  
**Location:** `src/pages/api/files/` 

**Issue:** File type and size validation could be more comprehensive.

**Current:** Validates notes (500 char), tags (20 max), but file size limits unclear.

**Recommendation:** Add explicit file size limits and MIME type whitelist.

## 6. **Version Control Integration (simple-git)**
**Severity:** LOW  
**Location:** `src/lib/versioning/`, versioningService

**Issue:** Uses simple-git to track version metadata. Git operations add latency.

**Current Behavior:** Version numbers and commit hashes tracked in database, actual commits might not exist.

**Recommendation:** Clarify if full git history is maintained or just metadata.

## 7. **Missing Environment Variables Documentation**
**Severity:** MEDIUM  
**Location:** `.env.example`

**Issue:** `.env.example` minimal; unclear which variables are required vs optional.

**Recommendation:** Document all environment variables with defaults and examples.

## 8. **Type Safety in API Routes**
**Severity:** LOW  
**Location:** `src/pages/api/`

**Issue:** Some API routes have manual type checking (`typeof id !== 'string'`) instead of validation schema.

**Better Pattern:** Use AJV + schema validation for consistency.

## 9. **No Centralized Logging**
**Severity:** LOW  
**Location:** Various files

**Issue:** `console.error()` used directly; no structured logging or error tracking.

**Recommendation:** Implement centralized logger for debugging and monitoring.

## 10. **CSS-in-JS vs Tailwind Mixing**
**Severity:** LOW  
**Location:** `src/components/`

**Issue:** Both Tailwind classes and Framer Motion inline styles used.

**Recommendation:** Standardize on Tailwind for consistency; use CSS variables for dynamic theming.

---
