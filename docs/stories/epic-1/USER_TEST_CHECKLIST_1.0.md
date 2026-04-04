# 👤 USER TEST CHECKLIST - Story 1.0

**Status:** Ready to test after @dev completes implementation  
**Estimated Test Time:** 10-15 minutes  
**Goal:** Validate that upload → edit → persist → reload workflow works perfectly

---

## 📋 PRE-TEST SETUP

Before starting, ensure:
- [ ] Story 1.0 code is deployed locally
- [ ] App is running: `npm run dev` (or `yarn dev`)
- [ ] Browser: Open http://localhost:3000
- [ ] Storage folder exists: `E:\BRAND-OPS-STORAGE\`
- [ ] You have a test file ready (image, video, or PDF)

---

## 🧪 TEST FLOW - DO THIS IN ORDER

### Phase 1: Upload File (2-3 min)

**Before upload:**
- [ ] Open Browser DevTools (F12)
- [ ] Go to Console tab
- [ ] Look for **red errors** (you should see NONE)

**Upload action:**
- [ ] Click "Choose File" button
- [ ] Select 1 image/video/document from your PC
- [ ] Click "Upload"
- [ ] **Expected:** File appears in list within 1 second ⏱️
- [ ] **Check DevTools:** Still no red errors

**Verification:**
- [ ] File appears in the file browser list
- [ ] Filename is correct
- [ ] Type field shows auto-detected type (e.g., "image" for .jpg)
- [ ] Status field is empty (user hasn't set it yet)

---

### Phase 2: Edit Metadata - Type (2-3 min)

**Action:**
- [ ] Click on the uploaded file in the list
- [ ] Right sidebar opens with metadata form
- [ ] Type dropdown shows: image, video, carousel, document, other
- [ ] Select the correct type for your file (should be pre-selected)
- [ ] **NOTE:** If it's already correct, change it to something else to test
- [ ] Click [Save] button

**Expected Results:**
- [ ] Sidebar shows "Saving..." message (loading state)
- [ ] File list updates immediately (type column shows new value)
- [ ] Sidebar closes or shows success message
- [ ] No console errors

---

### Phase 3: Edit Metadata - Status (2-3 min)

**Action:**
- [ ] Click on the same file again
- [ ] Sidebar opens (should remember your Type from last edit)
- [ ] Status dropdown shows: Draft, In Review, Approved, Done
- [ ] Select **Draft**
- [ ] Click [Save]

**Expected Results:**
- [ ] Sidebar updates with "Saving..."
- [ ] File list shows Status = "Draft"
- [ ] No console errors

---

### Phase 4: Edit Metadata - Tags (2-3 min)

**Action:**
- [ ] Click file again
- [ ] In Tags field, type: `campaign, facebook, 2026-q1`
- [ ] Click [Save]

**Expected Results:**
- [ ] Tags appear in form
- [ ] File list shows tags (or preview of tags)
- [ ] Can click file again and tags are still there
- [ ] No console errors

---

### Phase 5: Edit Metadata - Notes (2-3 min)

**Action:**
- [ ] Click file again
- [ ] In Notes textarea, type: `This is a test note for the hero image`
- [ ] Notice the character counter at bottom (should show "~42/500")
- [ ] Click [Save]

**Expected Results:**
- [ ] Notes are saved
- [ ] Character counter updated correctly
- [ ] Can click file again and notes still visible
- [ ] No console errors

---

### Phase 6: THE BIG TEST - Close & Reopen App (3-5 min)

**This is the critical validation:**

**Action:**
- [ ] Close the app completely:
  - [ ] Stop the dev server: Press `Ctrl+C` in terminal
  - [ ] Close the browser tab/window
  - [ ] Wait 2 seconds

**Verification (with app closed):**
- [ ] Check `E:\BRAND-OPS-STORAGE\` folder
- [ ] Your uploaded file should be there ✅

**Action:**
- [ ] Restart the app:
  - [ ] Run `npm run dev` again in terminal
  - [ ] Open http://localhost:3000 in browser
  - [ ] Navigate to Creative Library page
  - [ ] Wait for file list to load (should be instant)

**THE MOMENT OF TRUTH:**
- [ ] **File appears in list** ✅
- [ ] **Click file → sidebar opens**
- [ ] **Type = what you saved** ✅
- [ ] **Status = "Draft"** ✅
- [ ] **Tags = "campaign, facebook, 2026-q1"** ✅
- [ ] **Notes = "This is a test note..."** ✅
- [ ] **DevTools Console = NO RED ERRORS** ✅

If ALL of above are ✅, then **Story 1.0 PASSES VALIDATION** 🎉

---

## 🧪 BONUS: Error Handling Tests (Optional)

If you have extra time, test error cases:

### Try to Save Without Type
- [ ] Click file
- [ ] Clear the Type field (make it empty)
- [ ] Click [Save]
- [ ] **Expected:** Error message appears: "Type is required"
- [ ] **Expected:** Save button is disabled

### Try to Save Without Status
- [ ] Fill in Type again
- [ ] Clear Status field
- [ ] Click [Save]
- [ ] **Expected:** Error message: "Status is required"

### Try to Add Too Many Characters in Notes
- [ ] Click file
- [ ] In Notes, paste a really long text (copy-paste 600+ characters)
- [ ] **Expected:** Character counter shows red or error message
- [ ] **Expected:** Notes field shows: "Max 500 characters"

---

## 📊 TEST RESULTS SUMMARY

After you complete all tests, fill this in:

| Test | Result | Notes |
|------|--------|-------|
| Upload → appears in list | ✅ / ❌ | |
| Edit Type → saves | ✅ / ❌ | |
| Edit Status → saves | ✅ / ❌ | |
| Edit Tags → saves | ✅ / ❌ | |
| Edit Notes → saves | ✅ / ❌ | |
| App restart → data persists | ✅ / ❌ | |
| No console errors | ✅ / ❌ | |
| File in storage folder | ✅ / ❌ | |

---

## 🐛 If Something Fails

**Don't panic!** Report what failed:

Example format:
```
Test: "Edit Type → saves"
Status: ❌ FAILED
Issue: Type dropdown closes without saving
Error in console: "TypeError: Cannot read property 'id' of undefined"
Steps to reproduce:
  1. Upload file
  2. Click file
  3. Select Type = "image"
  4. Click Save
  5. Type doesn't change in list
Expected: Type should show "image" in file list
```

**Send this to @dev with screenshot if possible.**

---

## ✅ CHECKLIST - Ready to Report Back

- [ ] All Phase 1-6 tests completed
- [ ] Results filled in the table above
- [ ] DevTools checked for errors
- [ ] File verified in E:\BRAND-OPS-STORAGE\
- [ ] Bonus error tests attempted (optional)
- [ ] Ready to give feedback to @dev

---

**When you complete testing, give feedback format:**

```
Story 1.0 Validation Status: ✅ PASS / ❌ FAIL
Tests passed: 8/8
Tests failed: 0/8
Blockers: None / [List if any]
Ready for Story 1.1a: YES / NO

Notes:
[Any observations, suggestions, or issues]
```

---

**You're the Product Owner now** 👑 Your validation is what determines if we move forward!
