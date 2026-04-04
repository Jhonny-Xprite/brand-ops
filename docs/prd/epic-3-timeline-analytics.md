# Epic 3: Timeline & Analytics Dashboard

**Status:** MVP  
**Esforço Estimado:** 60 horas  
**Owner:** @dev (Dex)  
**Data:** 2026-04-03  

---

## 🎯 Overview

Visual dashboard showing creative production trends over time. Timeline chart, status funnel, summary cards. Helps user understand output volume, approval rates, and activity patterns at a glance.

---

## 📦 Features

### Feature 3.1: Timeline Chart
- **Chart type:** Line or bar chart over time
- **X-axis:** Date (daily or weekly)
- **Y-axis:** Count of creatives created
- **Grouping:** By type (image, video, carousel, etc)
- **Database:** SQL GROUP BY date, type
- **Performance:** <400ms render for 365 days

**Acceptance Criteria:**
- [ ] Chart renders in <400ms
- [ ] Hover → show exact count + type
- [ ] Zoom/pan with mouse wheel
- [ ] Toggle type on/off by clicking legend
- [ ] Export chart as PNG

---

### Feature 3.2: Status Funnel
- **View:** How many files at each stage (Draft → Approved → Done)
- **Chart type:** Funnel or stacked bar
- **Data:** Count per status
- [ ] Show percentages (e.g., "45% Draft, 30% Approved, 25% Done")
- [ ] Click → drill down to files at that status

**Acceptance Criteria:**
- [ ] Render in <300ms
- [ ] Click funnel stage → filter to that status
- [ ] Show count and percentage
- [ ] Color-code by status (Violet for Draft, Gold for Done)

---

### Feature 3.3: Summary Cards
- **Cards:** Total creatives, Last modified, This month count
- **Design:** Simple cards with large numbers + sparkline
- **Update:** Real-time as files change
- **Clickable:** Click card → apply filter

**Acceptance Criteria:**
- [ ] 3-4 cards visible at top of dashboard
- [ ] Show current counts
- [ ] Sparkline shows trend over last 30 days
- [ ] Click card → filter to that metric

---

### Feature 3.4: Date Range Filter (Dashboard)
- **Input:** Date picker (start, end)
- **Scope:** Filters all dashboard charts
- **Presets:** "Today", "This week", "This month", "All time"
- **Database:** Filter on created_at

**Acceptance Criteria:**
- [ ] Change date range → all charts update
- [ ] <500ms chart refresh
- [ ] Presets shown as quick buttons
- [ ] Show result count in chart title

---

## 🔄 Success Criteria (Story Acceptance)

**Developer Signs Off When:**
- [ ] All 4 features implemented + acceptance criteria pass
- [ ] Charts render in <400ms (Recharts optimized)
- [ ] Real-time updates as files change
- [ ] Dark mode compatible
- [ ] Responsive (works on smaller screens)
- [ ] Unit tests for chart data aggregation
- [ ] Integration tests with database queries

---

**Epic Owner:** @dev (Dex)  
**QA Gate:** @qa (Quinn)  
**Related:** Epic 1, 2 (data sources), Epic 4 (sync triggers updates)
