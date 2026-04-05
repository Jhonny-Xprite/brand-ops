# Epic 2: Search & Filtering

**Status:** MVP  
**Esforço Estimado:** 80 horas  
**Owner:** @dev (Dex)  
**Data:** 2026-04-03  

---

## 🎯 Overview

Advanced search + multi-dimensional filtering. Users can find any creative in <500ms using type, status, date range, tags, and full-text search. Filter combinations use AND logic for precision.

---

## 📦 Features

### Feature 2.1: Type Filter
- **Options:** image, video, carousel, other
- **UI:** Chip selector in filter bar
- **Multi-select:** OR logic (image OR video OR carousel)
- **Database:** Indexed query on Creative.type

**Acceptance Criteria:**
- [ ] Filter updates results in <300ms (1K files)
- [ ] Chips show count (e.g., "image (234)")
- [ ] Clear all button resets type filter
- [ ] Keyboard: Tab through chips, Space to toggle

---

### Feature 2.2: Status Filter
- **Options:** Draft, Approved, Done
- **UI:** Dropdown or chips
- **AND logic:** Combine with type filter (image AND approved)
- **Database:** Indexed query on Creative.status

**Acceptance Criteria:**
- [ ] <300ms filter response
- [ ] Count shown per status
- [ ] Deselect all = show all statuses
- [ ] Presets saved: "Approved only", "Draft for review"

---

### Feature 2.3: Date Range Filter
- **Input:** Date picker (start, end)
- **Options:** "Today", "This week", "This month", "Custom"
- **Filter field:** created_at OR modified_at (user choice)
- **Database:** Indexed range query

**Acceptance Criteria:**
- [ ] <300ms filter for 1K+ files
- [ ] Preset buttons for quick access
- [ ] Calendar picker with keyboard nav
- [ ] Show result count ("234 files in range")

---

### Feature 2.4: Tags Filter
- **Input:** Multi-select autocomplete
- **OR logic:** "tag1 OR tag2"
- **Database:** SQLite JSON query (tags array)
- **Suggestions:** Popular tags shown first

**Acceptance Criteria:**
- [ ] Autocomplete shows matching tags
- [ ] <300ms filter response
- [ ] Remove tag: click X or Backspace
- [ ] "Clear tags" button

---

### Feature 2.5: Full-Text Search
- **Input:** Search box in top bar
- **Scope:** Searches name + notes + tags
- **Database:** SQLite FTS5 (Full-Text Search 5)
- **Performance:** <500ms for 1K+ files

**Acceptance Criteria:**
- [ ] Type "Instagram post" → finds all matching
- [ ] Results update as you type (debounced 300ms)
- [ ] Highlights matching terms in results
- [ ] Clear search: X button in box
- [ ] Keyboard: Escape = clear, Tab = focus first result

---

### Feature 2.6: Combined Filters
- **Logic:** (type AND status AND date AND tags AND full-text)
- **UI:** All filters visible, all active simultaneously
- **Result count:** Shows "123 results" with filter context
- **Performance:** <500ms with all filters

**Acceptance Criteria:**
- [ ] All 5 filters work together without cross-talk
- [ ] Results update when any filter changes
- [ ] <500ms response time (worst case)
- [ ] Show applied filters as clear summary

---

### Feature 2.7: Search Presets
- **Presets:** Save up to 5 filter combos
- **UI:** Dropdown "Load preset" + "Save preset" buttons
- **Storage:** Redux store + IndexedDB persistence
- **Names:** User-defined (e.g., "Ready to post", "In review")

**Acceptance Criteria:**
- [ ] Save current filter combo as preset
- [ ] Load preset button → restores all filters
- [ ] Edit preset name (rename)
- [ ] Delete preset with confirm
- [ ] Presets persistent across app restart

---

## 🔄 Success Criteria (Story Acceptance)

**Developer Signs Off When:**
- [ ] All 7 features implemented + acceptance criteria pass
- [ ] Search <500ms for 1K files (SQLite FTS5 indexed)
- [ ] Filter combo <300ms (indexed WHERE clause)
- [ ] Zero console errors, offline compatible
- [ ] Unit tests for filter logic
- [ ] Integration tests with database queries
- [ ] Performance benchmarks documented

---

**Epic Owner:** @dev (Dex)  
**QA Gate:** @qa (Quinn)  
**Related:** Epic 1 (Creative Production), Epic 3 (Dashboard)
