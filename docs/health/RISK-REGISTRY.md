# Risk Registry

**Project:** Brand-Ops
**Last Review:** 2026-04-04

---

## 🚨 Active Risks

| ID | Risk Description | Impact | Probability | Mitigation Strategy |
|----|------------------|--------|-------------|---------------------|
| R-001 | SQLite write latency on large metadata sets (>10K) | High | Medium | Implement FTS5 and indexing. |
| R-002 | Git repo size bloat with binary assets | High | High | Use Git LFS or separate repos for binary versions. |
| R-003 | Clock skew causing sync conflict errors | Medium | Low | Use UTC timestamps exclusively in metadata. |
| R-004 | Local disk space exhaustion in the Vault | Critical | Medium | Implement automated storage cleanup scripts. |

---

**Reviewer:** @aiox-master (Orion)
