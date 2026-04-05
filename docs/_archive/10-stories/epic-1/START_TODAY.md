# 🚀 START TODAY - STORY 1.0 EXECUTION

**Date:** 2026-04-04 (Now)  
**Deadline:** This Week (8 hours)  
**Owner:** @dev (Dex)

---

## ✅ READY TO START?

You have everything you need:

- ✅ Story 1.0 formal definition: `docs/stories/epic-1/1.0.mvp-foundation.md`
- ✅ User test checklist: `docs/stories/epic-1/USER_TEST_CHECKLIST_1.0.md`
- ✅ Epic 1 revised plan: `docs/stories/epic-1/EPIC_1_REVISED_PLAN.md`
- ✅ Database schema (from PRE-1.1): Prisma models ready
- ✅ Dependencies met: Stories 0.1-0.4 + PRE-1.1-1.5 all DONE ✅

---

## 🎯 YOUR TASKS (IN ORDER)

### 1. Read the Story (15 min)
- [ ] Open `docs/stories/epic-1/1.0.mvp-foundation.md`
- [ ] Read **Acceptance Criteria** (sections 1-12)
- [ ] Read **Technical Scope** (what to build)
- [ ] Read **Tasks** (4 tasks, 2h each)
- [ ] Ask questions if unclear ← **DO THIS BEFORE CODING**

### 2. Code Story 1.0 (7 hours, 45 min)

**Task 1: Setup Upload Endpoint (2h)**
```
→ Create pages/api/files/upload.ts
→ Validate file, write to E:\BRAND-OPS-STORAGE\
→ Create CreativeFile in SQLite
→ Return { id, path, filename, type }
```

**Task 2: Build File Browser UI (2h)**
```
→ Create components/CreativeLibrary/FileList.tsx
→ Create components/CreativeLibrary/FileUploadInput.tsx
→ Fetch files on mount, render list
```

**Task 3: Build Metadata Form (2h)**
```
→ Create components/CreativeLibrary/MetadataForm.tsx
→ Form with: Type, Status, Tags, Notes
→ Validation, Save, Cancel buttons
```

**Task 4: Integration & Test (1h 45min)**
```
→ Create pages/creative-library.tsx (main page)
→ Wire components together
→ Write integration test: upload → edit → reload → verify
```

### 3. Validate Your Code (30 min)

Before marking Story 1.0 done:
```bash
npm run lint        # Must pass
npm run typecheck   # Must pass
npm test            # Must pass
npm run build       # Must pass
```

If any fail → fix it before proceeding

### 4. Notify for QA Review (5 min)

Send message:
```
Story 1.0 Implementation Complete ✅

Code ready for QA review.
Files modified:
  - pages/api/files/upload.ts
  - pages/api/files.ts
  - components/CreativeLibrary/*
  - pages/creative-library.tsx
  - src/store/creativeLibrary/*
  - __tests__/

Ready for @qa to begin testing.
```

---

## 📋 STORY 1.0 CHECKLIST

### Before Coding
- [ ] Story 1.0 fully read and understood
- [ ] No blockers or questions remaining
- [ ] PRE-1.1 database schema verified (Prisma models exist)
- [ ] Storage folder exists: `E:\BRAND-OPS-STORAGE\`

### During Coding
- [ ] Commit early + often (every task completion)
- [ ] Test as you build (don't wait until end)
- [ ] Follow existing code patterns in the project
- [ ] No console errors during manual testing
- [ ] Use approved error messages from PRE-1.3 specs

### Code Quality Gates
- [ ] [ ] Zero lint errors: `npm run lint`
- [ ] [ ] Zero type errors: `npm run typecheck`
- [ ] [ ] All tests pass: `npm test -- --runInBand`
- [ ] [ ] Build succeeds: `npm run build`
- [ ] [ ] >70% test coverage on new files

### Files to Create/Modify

**Create:**
```
pages/api/files/upload.ts
pages/api/files.ts
components/CreativeLibrary/FileUploadInput.tsx
components/CreativeLibrary/FileList.tsx
components/CreativeLibrary/MetadataForm.tsx
pages/creative-library.tsx
src/store/creativeLibrary/files.slice.ts
src/store/creativeLibrary/metadata.slice.ts
src/lib/fileUtils.ts
__tests__/integration/creative-library.test.ts
__tests__/components/MetadataForm.test.tsx
```

**Modify:**
```
prisma/schema.prisma  (verify CreativeFile, FileMetadata models exist)
pages/index.tsx or nav (add link to /creative-library)
```

---

## 🧪 AFTER CODING - USER TESTING

Once your code is done and QA reviews:

### User will:
1. Open app → navigate to Creative Library
2. Upload 1 file
3. Edit metadata (Type, Status, Tags, Notes)
4. **Close app completely**
5. Reopen app
6. Verify all data persisted ✅

### User will report:
```
Story 1.0 Validation: ✅ PASS / ❌ FAIL

Tests passed: 8/8
Tests failed: 0/8
Blockers: None

Ready for Story 1.1a: YES
```

If ✅ PASS → Proceed to 1.1a  
If ❌ FAIL → Fix issues, retry

---

## 💬 COMMUNICATION PLAN

### Now (before coding)
```
@dev: "Starting Story 1.0, have questions about acceptance criteria"
→ Me: Answer any blockers
```

### After 2h (Task 1 done)
```
@dev: "Task 1 (Upload endpoint) complete, pushing code"
→ Me: Review + approve
```

### After 4h (Tasks 1-2 done)
```
@dev: "Tasks 1-2 complete, UI basic shell working"
→ Me: Verify UI structure looks right
```

### After 6h (Tasks 1-3 done)
```
@dev: "Tasks 1-3 complete, form validation working"
→ Me: Quick check on error handling
```

### End of day (All tasks done)
```
@dev: "Story 1.0 implementation complete, ready for QA"
→ Me: "Handing off to @qa for review"
→ @qa: Tests user checklist
```

### After user testing
```
User: "Story 1.0 validation: ✅ PASS"
→ Me: "Excellent! Proceeding to Story 1.1a"
```

---

## ⚙️ TECHNICAL DETAILS

### Storage Location
```
E:\BRAND-OPS-STORAGE\  ← All files go here
  ├─ image1.jpg
  ├─ video1.mp4
  └─ document.pdf
```

### Type Auto-Detection
```javascript
const typeMap = {
  jpg: 'image', png: 'image', gif: 'image',
  mp4: 'video', mov: 'video', avi: 'video',
  pdf: 'document', doc: 'document', docx: 'document',
  default: 'other'
};
```

### Database Models (from PRE-1.1)
```prisma
model CreativeFile {
  id        String   @id @default(cuid())
  path      String   @unique
  filename  String
  createdAt DateTime @default(now())
  metadata  FileMetadata?
}

model FileMetadata {
  id          String   @id @default(cuid())
  fileId      String   @unique
  type        String?   // image, video, carousel, document, other
  status      String?   // Draft, In Review, Approved, Done
  tags        String[]  // ["tag1", "tag2"]
  notes       String?   @db.VarChar(500)
  updatedAt   DateTime @updatedAt
}
```

### API Endpoints to Create
```
POST /api/files/upload
  → Upload file, create CreativeFile
  
GET /api/files
  → List all CreativeFile[]
  
PATCH /api/files/{id}
  → Update FileMetadata
```

### Error Messages (from PRE-1.3)
```
Upload too large: "File is too large (max 100MB)"
Type required: "Type is required"
Status required: "Status is required"
Notes too long: "Max 500 characters"
Save failed: "Failed to save metadata. Retry?"
```

---

## 🎯 SUCCESS = ?

Story 1.0 is **DONE** when:

- [ ] All 12 Acceptance Criteria met ✅
- [ ] Code passes lint, typecheck, tests, build ✅
- [ ] User can: upload → edit → reload → verify ✅
- [ ] Zero console errors during testing ✅
- [ ] Test checklist all ✅ marks ✅

---

## 🚨 IF YOU GET STUCK

**Problem:** Prisma schema doesn't have CreativeFile/FileMetadata

**Solution:**
```bash
# Check if they exist:
cat prisma/schema.prisma | grep "model CreativeFile"

# If not, they should be from PRE-1.1 blocker story
# Ask: "Did PRE-1.1 database migration complete?"
```

**Problem:** E:\BRAND-OPS-STORAGE\ doesn't exist

**Solution:**
```bash
# Create it:
mkdir E:\BRAND-OPS-STORAGE\
# Or via Windows Explorer, create folder
```

**Problem:** Upload endpoint works but can't find file afterwards

**Solution:**
```
Check:
1. Is file actually written to disk? (check folder)
2. Is CreativeFile record created in DB? (query SQLite)
3. Is GET /api/files returning the record?
4. Are you reading from same path you wrote to?
```

**For any blocker:** Ask immediately, don't spend >30min stuck

---

## 📞 CONTACT

**Questions about Story 1.0?** → Ask me  
**Code review needed?** → Push to branch, ask for review  
**Stuck on something?** → Don't wait, ask immediately  
**Ready for next story?** → Tell me, we'll start 1.1a

---

## 🎬 LET'S GO!

**You have:**
- ✅ Clear story definition
- ✅ 4 concrete tasks
- ✅ Acceptance criteria
- ✅ Test checklist
- ✅ 8 hours budget
- ✅ Support when needed

**Next step:** Read the story, ask any questions, start coding

**Target:** ✅ DONE by end of this week

**Then:** User validates, we proceed to 1.1a

---

**Ready? Start with:** `docs/stories/epic-1/1.0.mvp-foundation.md`

Let's build this! 🚀
