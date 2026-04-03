---
template:
  id: story-template-v2
  version: 2.0
  
metadata:
  epic: 1
  story_num: "PRE-1.5"
  title: "Concurrent Editing Strategy & Lock Mechanism"
  priority: P0
  effort_minutes: 240
  blocker: true
  blocks: ["1.2", "1.3", "1.5"]
  
---

# Story PRE-1.5: Concurrent Editing Strategy & Lock Mechanism

## Status
Draft

## Executor Assignment

```yaml
executor: "@architect"
quality_gate: "@dev"
quality_gate_tools:
  - Documentation review
  - Implementation feasibility analysis
```

## Story

**As an** architect,  
**I want** to design a concurrent editing strategy that prevents data corruption,  
**so that** @dev can handle simultaneous file edits + auto-commits without conflicts

---

## Acceptance Criteria

- [ ] Concurrent editing problem documented (race conditions, data corruption scenarios)
- [ ] Solution strategy chosen: File locking vs optimistic locking vs event-based
- [ ] Lock mechanism detailed: How locks acquired, held, released
- [ ] Timeout strategy documented: Wait time, retry logic, user feedback
- [ ] Conflict resolution strategy defined: What happens if edits overlap
- [ ] UI feedback designed: "Saving..." spinner, "File locked, wait..." message
- [ ] Error scenarios handled: Lock acquisition timeout, lock release failure
- [ ] Testing strategy sketched: How to test concurrent editing scenarios
- [ ] Documentation: `docs/concurrent-editing-strategy.md` created
- [ ] Implementation pseudocode drafted: Lock manager module

---

## 🤖 CodeRabbit Integration

### Story Type Analysis
**Primary Type:** Architecture (Concurrency Design)  
**Secondary Types:** Error Handling, Performance  
**Complexity:** High (complex concurrency patterns, edge cases)

### Specialized Agent Assignment
**Primary Agents:**
- @architect (concurrency design, lock mechanism)
- @dev (implementation feasibility validation)

**Supporting Agents:**
- @qa (testing strategy for concurrent scenarios)

### Quality Gate Tasks
- [ ] Design review: Lock mechanism is sound, deadlock-proof
- [ ] Feasibility check: @dev confirms implementation is possible
- [ ] Testing strategy: @qa can write concurrent tests based on design

### CodeRabbit Focus Areas
**Primary Focus:**
- Concurrency correctness (deadlock-free, race condition prevention)
- Timeout strategy (prevents indefinite waiting)
- Error handling (lock timeout, release failures)

---

## Tasks / Subtasks

- [ ] Analyze Concurrency Problems
  - [ ] Document race conditions (metadata edit + git commit, simultaneous uploads)
  - [ ] Identify critical sections (git operations, SQLite writes)
  - [ ] Prioritize: Which scenarios are most likely?
  - [ ] Impact assessment: What data could be corrupted?

- [ ] Choose Lock Mechanism
  - [ ] Evaluate Option 1: File-based locks (.git/index.lock detection)
  - [ ] Evaluate Option 2: In-memory locks (per file, in Redux store)
  - [ ] Evaluate Option 3: Optimistic locking (version numbers, retry on conflict)
  - [ ] Recommend: File-based + in-memory hybrid
  - [ ] Rationale: Simple, reliable, leverages git's existing lock

- [ ] Design Lock Manager
  - [ ] Lock states: UNLOCKED, ACQUIRING, LOCKED, RELEASING
  - [ ] Lock data: { fileId, acquiredAt, owner, timeout }
  - [ ] Functions: `acquireLock()`, `releaseLock()`, `waitForLock()`, `checkTimeout()`
  - [ ] Timeout: 5 seconds (git ops should complete in <500ms, 5s is buffer)
  - [ ] Retry logic: If lock held >5s, release forcefully (assume deadlock)

- [ ] Design UI Feedback
  - [ ] During commit: Show "Saving version..." spinner (non-blocking)
  - [ ] If user edits during commit: Show "File is updating. Wait or try again."
  - [ ] Buttons disabled during commit: Prevent conflicting edits
  - [ ] Timeout feedback: "Update taking longer than expected. Check disk/permissions."
  - [ ] Accessibility: Status messages announced to screen readers

- [ ] Define Conflict Resolution
  - [ ] Metadata edit + git commit overlap → Metadata change queued, committed after git finishes
  - [ ] Dual file uploads → Queue second upload, process sequentially
  - [ ] Philosophy: FIFO (first-in-first-out) with clear ordering
  - [ ] User visibility: Show queue status ("2 uploads pending")

- [ ] Design Test Scenarios
  - [ ] Unit tests: Lock acquire/release, timeout handling
  - [ ] Integration tests: Concurrent metadata edits, concurrent uploads
  - [ ] Stress test: 10 simultaneous uploads (should queue correctly)
  - [ ] Stress test: 100 rapid metadata changes (should batch correctly)
  - [ ] Chaos test: Forcefully kill git process → lock not released → timeout should recover

- [ ] Document Implementation
  - [ ] Lock manager pseudocode (class structure, methods)
  - [ ] Usage examples: How to acquire lock before critical operation
  - [ ] Error handling: What to do if lock acquisition fails
  - [ ] Logging: Log all lock events for debugging

---

## Lock Manager Pseudocode (Reference)

```typescript
class LockManager {
  private locks: Map<string, Lock> = new Map();
  private readonly LOCK_TIMEOUT = 5000; // 5 seconds

  async acquireLock(fileId: string, owner: string): Promise<Lock> {
    const timeout = Date.now() + this.LOCK_TIMEOUT;
    
    while (true) {
      if (!this.locks.has(fileId)) {
        const lock = { fileId, owner, acquiredAt: Date.now() };
        this.locks.set(fileId, lock);
        return lock;
      }
      
      if (Date.now() > timeout) {
        this.locks.delete(fileId); // Force release on timeout
        return this.acquireLock(fileId, owner);
      }
      
      await sleep(50);
    }
  }

  releaseLock(fileId: string): void {
    this.locks.delete(fileId);
  }

  isLocked(fileId: string): boolean {
    return this.locks.has(fileId);
  }
}
```

---

## Success Criteria

✅ @dev has clear strategy to prevent data corruption  
✅ Concurrent operations handled safely  
✅ Users understand what's happening (UI feedback)  
✅ Test scenarios defined for QA

---

## Blockers

This story **blocks** Epic 1 features: 1.2, 1.3, 1.5

---

**Created:** 2026-04-03  
**Modified:** 2026-04-03 (Formal template v2.0)  
**Depends On:** PRE-1.4 complete  
**Blocks:** Stories 1.2-1.3-1.5
