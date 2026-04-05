# Brand-Ops MVP — Product Requirements Document

**Versão:** 1.0.0  
**Status:** Ready for Development  
**Autor:** Morgan (Product Manager)  
**Data:** 2026-04-02  
**Linguagem:** Português (Brasil)

---

## 📋 Executive Summary

Brand-Ops é uma **plataforma de operações de marca single-user, offline-first, orientada por dados de produção criativa**. Consolida 7 áreas críticas (strategy, brand core, media library, social assets, creative production, copy & messaging, database) em um repositório local versionado com sincronização automática para Google Drive.

**MVP Scope:** Criar foundation sólida para gerenciamento de criativos com metadata avançada, versionamento automático Git-like, search por filtros, timeline visual de produção, e exportação em múltiplos formatos — tudo rodando offline-first em desktop com <500ms de latência.

**Launch Timeline:** ~120-150 dias (depende de equipe/dedicação)

**Investimento Estimado:** 900-1200 horas dev

---

## 🎯 Objetivos MVP

| # | Objetivo | Métrica de Sucesso |
|----|----------|------------------|
| 1 | **Creative Production** como espinha dorsal | Todos os criativos organizados, versionados, pesquisáveis em <500ms |
| 2 | **Metadata avançada** (tipo, data, status, tags) | Filtros combinados funcionam para 100% das queries |
| 3 | **Versionamento automático Git-like** | Histórico completo de mudanças, rollback instant |
| 4 | **Timeline visual** de criação/aprovação | Dashboard mostra trend de criação por tipo/período |
| 5 | **Offline-first** com sync automático | App funciona sem internet, sync quando online |
| 6 | **Exportação multi-formato** | ZIP + CSV + JSON, importável em outras tools |
| 7 | **Single-user otimizado** | Sem complexidade de permissões/multi-tenant, <1K files MVP |

---

## 👤 Persona Primária

**Você (Gestor de Operações de Brand)**

- Centraliza todas as decisões de brand
- Manage criativos, copia, estratégia de um único lugar
- Quer histórico completo (por quê mudou? quando?)
- Trabalha offline frequentemente
- Exporta dados para apresentações/backups

---

## 📦 Escopo do Produto

### In-Scope (MVP)

#### 1. Creative Production (PRIORIDADE #1)
- **Armazena:** Imagens (estáticos), vídeos (ads, reels, VSLs), carrosséis, lives
- **Metadata:** tipo, tags, status (Draft/Approved/Done), created_at, modified_at, criador, notes
- **Versionamento:** Automático a cada mudança, com histórico navegável
- **Search:** Filtros por tipo, data range, status, tags; busca full-text por nome/notes
- **Timeline:** Visualiza criação de criativos ao longo do tempo (chart por tipo/mês)

#### 2. Strategy Library
- **Armazena:** JSON com products, offers, audiences, funnels, campaigns metadata
- **Ligação:** Criativos pode referenciar strategy (ex: creative v2 → offer ID 42)
- **Versionamento:** Automático igual creative production
- **Sem integração com Airtable/Notion MVP** (pode vir Phase 2)

#### 3. Brand Core Assets
- **Armazena:** Logos, typography (fonts.json), colors (palette.json), elements, manual PDF
- **Read-only structure** no MVP (variações não esperadas)
- **Versionamento:** Tracking de mudanças quando ocorrem

#### 4. Media Library Organizado
- **Armazena:** Photos (ensaios, eventos, lifestyle), vídeos brutos
- **Metadata:** Source, date, crew notes
- **Search:** Por tipo de conteúdo, data range
- **Versionamento:** Sim

#### 5. Copy & Messaging Archive
- **Armazena:** ads-copy.json, headlines.json, scripts.json, notifications.json
- **Versionamento:** Automático
- **Search:** Por ângulo, público-alvo

#### 6. Social Assets
- **Armazena:** Instagram (profile, highlights, story templates), Facebook, YouTube, LinkedIn assets
- **Metadata:** Platform, last_updated, format
- **Versionamento:** Sim

#### 7. Database + Backups
- **Sistema:** SQLite local (brand-ops.db)
- **Backups:** Diários via rclone → Google Drive (2TB Google One)
- **Restore:** 1-click rollback via versioning
- **Sem snapshots manuais MVP** (rclone + Drive history é suficiente)

### Out-of-Scope (Phase 2+)

- ❌ Multi-user / permissões / collaboration
- ❌ API para outras plataformas
- ❌ Integração bidirecional com Airtable/Notion
- ❌ Mobile app (desktop offline-first suficiente MVP)
- ❌ Cloud-first (local-first MVP)
- ❌ Real-time sync de múltiplos devices
- ❌ Webhooks / automação externa
- ❌ Advanced IA/NLP search (basic metadata filtering sufficient)
- ❌ Comments/collaboration no MVP

---

## 🏗️ Arquitetura Técnica (Alto Nível)

```
┌─────────────────────────────────────────────────────┐
│ BRAND-OPS FRONTEND (Next.js 14+)                    │
│ - Desktop app (Electron ou web local)               │
│ - Offline-first UI                                  │
│ - Timeline/Charts dashboard                         │
│ - File browser + metadata editor                    │
│ - Export multi-formato                              │
└────────┬────────────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────────────┐
│ LOCAL STATE MANAGEMENT + SQLite                     │
│ - Redux/Context para UI state                       │
│ - SQLite (brand-ops.db) para entity data           │
│ - IndexedDB para cache offline                      │
│ - File system watcher (chokidar)                    │
└────────┬────────────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────────────┐
│ STORAGE LAYER (Local E:\BRAND-OPS-STORAGE\)        │
│ - Filesystem + Git (versionamento)                  │
│ - .sync-metadata/ para tracking                     │
│ - rclone daemon para Google Drive sync              │
└────────┬────────────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────────────┐
│ BACKUP TIER (Google Drive /Brand-Ops-Backup/)      │
│ - Daily sync via rclone                             │
│ - Native version history (Google Drive)             │
│ - 2TB Google One allocation                         │
└─────────────────────────────────────────────────────┘
```

### Tech Stack MVP

| Componente | Tecnologia | Justificativa |
|-----------|-----------|--------------|
| **Frontend** | Next.js 14 + React 18 | SSR + offline capabilities |
| **State** | Redux Toolkit + RTK Query | Offline-first patterns proven |
| **DB Local** | SQLite + Prisma ORM | Single-file, zero server, reliable |
| **Versioning** | Git (local) | Versionamento automático, 0 cost |
| **Sync** | rclone daemon | Sync automático, agnostic a cloud |
| **File Watch** | chokidar | Detect changes em tempo real |
| **UI Components** | shadcn/ui | Accessible, dark mode native |
| **Charts** | Recharts | Timeline + analytics |
| **Export** | node-zip + json2csv | ZIP, JSON, CSV export |
| **Desktop** | Electron (optional) | Se quiser standalone app |

### UI Direction for MVP

- Interface direction: functional, minimal, desktop-first
- Design system supports implementation consistency, not premium brand repositioning
- Mobile and tablet specs are outside MVP acceptance criteria
- shadcn/ui and Tailwind should be used with semantic tokens, not aesthetic-only palettes

### Performance Targets (Agressivos ✓)

| Métrica | Target | Nota |
|---------|--------|------|
| Load app | <2s | Electron cold start |
| Search filtrado | <500ms | 1K-10K files range |
| File upload | <1s (por 50MB) | Local FS write |
| Filter combo | <300ms | 3+ metadata filters |
| Timeline render | <400ms | 100+ pontos de dados |
| Export 1K files | <5s | ZIP compression |

---

## 📊 Decisões de Elicitação PRE-FLIGHT

### Block 1: Prioridades & Volume

| Decisão | Valor |
|---------|-------|
| **Creative Production First?** | ✓ Sim, MVP #1 |
| **Volume estimado** | 1K-10K files |
| **Format enforcement** | Alert on variation, allow |

### Block 2: User Experience & Integration

| Decisão | Valor |
|---------|-------|
| **Usuário primário** | Você pessoalmente |
| **Designer integration** | URLs only (manual copy) |
| **Manager workflow** | Simple status (Draft/Approved/Done) |

### Block 3: Essencialidades Técnicas

| Decisão | Valor |
|---------|-------|
| **Search complexity** | Avançado (metadata filters) |
| **Versionamento** | Automático (Git-like) |
| **Colaboração MVP** | Zero (single-user) |
| **Backup strategy** | Só rclone + Google Drive history |

### Block 4: Visualização & Performance

| Decisão | Valor |
|---------|-------|
| **Dashboard** | Avançado (timeline + charts) |
| **Integrações externas** | Zero (isolado completamente) |
| **Performance SLA** | Agressivo (<500ms, 1GB+ files) |

### Block 5: Escalabilidade & Outputs

| Decisão | Valor |
|---------|-------|
| **Mobile & offline** | Offline-first (desktop) |
| **Exportações** | Múltiplos formatos (ZIP+CSV+JSON) |
| **Growth timeline** | Fase 1 (<1K files, 6+ months pessoal) |

---

## 🔧 Funcionalidades MVP (Estruturado por Épica)

### Epic 1: Creative Production Foundation
**Status:** Core MVP, Prioridade #1

- [x] File browser com drag-drop
- [x] Metadata editor (tipo, tags, status, notes)
- [x] Git-based versionamento automático
- [x] View histórico de versões
- [x] Rollback instant para versão anterior
- [x] Bulk tagging por pasta/regex

### Epic 2: Search & Filtering
**Status:** MVP

- [x] Filtro por tipo (image/video/carousel)
- [x] Filtro por status (Draft/Approved/Done)
- [x] Filtro por date range (created/modified)
- [x] Filtro por tags (multi-select OR)
- [x] Full-text search em names + notes
- [x] Combinação de filtros (AND logic)
- [x] Save search presets (5 slots)

### Epic 3: Timeline & Analytics Dashboard
**Status:** MVP

- [x] Timeline visual (creative creation rate)
- [x] Charts por tipo (stacked bar)
- [x] Charts por status (funnel view)
- [x] Summary cards (total count, last modified)
- [x] Filter dashboard by date range

### Epic 4: Sync & Versioning
**Status:** Core MVP

- [x] rclone daemon setup (Windows Task Scheduler)
- [x] .sync-metadata tracking (SHA256, file-ids)
- [x] Conflict resolution (local wins always)
- [x] Manual backup trigger
- [x] Restore from Google Drive version

### Epic 5: Exports Multi-Formato
**Status:** MVP

- [x] Export as ZIP (all files + metadata)
- [x] Export as CSV (metadata spreadsheet)
- [x] Export as JSON (structured data)
- [x] Bulk export selecionado files
- [x] Scheduled exports (daily backup ZIPs)

### Epic 6: Database Schema & Metadata
**Status:** Core MVP

- [x] SQLite schema (entities, versions, sync metadata)
- [x] Prisma ORM setup
- [x] Migration tools
- [x] Data validation rules

### Epic 7: Offline-First Architecture
**Status:** Core MVP

- [x] IndexedDB cache para queries
- [x] Service Worker para asset serving
- [x] Background sync queue (when online)
- [x] Sync status indicator (online/offline)

---

## 📈 Success Metrics (MVP)

| Métrica | Baseline | Target |
|---------|----------|--------|
| **Time to search 1K files** | N/A | <500ms |
| **Availability offline** | N/A | 100% for creation/editing |
| **Backup integrity** | N/A | 100% files synced daily |
| **Version restore time** | N/A | <2s |
| **App startup time** | N/A | <2s cold, <500ms warm |
| **File upload success** | N/A | 99.9% (local FS) |
| **User satisfaction** | N/A | "Tudo que eu preciso em um lugar" |

---

## 🚀 Roadmap Futuro (Phase 2-3)

### Phase 2 (Meses 7-12, se aprovado)
- [ ] Integração leitura com Airtable/Notion (pull strategy)
- [ ] IA semantic search (embeddings)
- [ ] Mobile app (React Native)
- [ ] Comment/annotation on criativos
- [ ] Read-only share links (para gerentes/clients)
- [ ] Automated social posting (preview)

### Phase 3 (Mês 13+, Enterprise)
- [ ] Multi-user com RLS (fine-grain permissions)
- [ ] API REST for external tools
- [ ] Real-time collaboration (CRDT)
- [ ] Advanced IA (recomendações de copy/visual)
- [ ] Integração bidirecional (push para social)
- [ ] Cloud option (AWS S3 backup além rclone)

---

## 🔐 Considerações Técnicas

### Segurança

- ✓ Sem autenticação MVP (single-user, desktop local)
- ✓ Local file permissions (Windows ACLs)
- ✓ Google Drive 2FA (user's account)
- ✓ Git commits sem PII (use generic "Brand-Ops" author)
- ⚠️ Nenhum secrets em .env committed (gitignore rigoroso)

### Data Privacy

- ✓ Nenhum dado enviado a servidores de terceiros (exceto Google Drive)
- ✓ Offline-first = zero dependência de cloud
- ✓ Backups Google One são pessoais (você controla 100%)
- ⚠️ Phase 2+: considere GDPR/compliance se multi-user

### Escalabilidade (Phase 1 only)

- **<1K files:** SQLite handles 10K+ sem problema
- **Espaço disco:** ~50GB-200GB (depende de vídeos)
- **Google One:** 2TB é suficiente (1 ano de backups daily)
- **Phase 2 Planning:** Se >50K files, considerar PostgreSQL

---

## 📅 Estimativa Desenvolvimento

### Breakdown por Epic

| Epic | Esforço | Notas |
|------|---------|-------|
| **1. Creative Foundation** | 120h | Core priority |
| **2. Search & Filtering** | 80h | Metadata indexing |
| **3. Timeline & Dashboard** | 60h | Recharts integration |
| **4. Sync & Versioning** | 90h | Git + rclone setup |
| **5. Exports** | 50h | ZIP/CSV/JSON libs |
| **6. Database Schema** | 70h | Prisma + migrations |
| **7. Offline-First** | 100h | Service Worker + IDB |
| **Testing & QA** | 200h | Comprehensive |
| **Docs & Training** | 50h | Internal + code docs |
| **Buffer (15%)** | 180h | Unknowns |
| **TOTAL** | ~1000h | ~5-6 months @ 40h/week |

---

## ✅ Acceptance Criteria MVP (Go/No-Go Decision)

**MVP é "Done" quando:**

- [ ] Todos 7 epics implementados e QA pass
- [ ] Search retorna results em <500ms (test com 1K+ files)
- [ ] Timeline chart renderiza <400ms
- [ ] Sync completo funciona 10x consecutivas sem erro
- [ ] Offline mode funciona 8+ horas sem internet
- [ ] Exportação ZIP/CSV/JSON preserva 100% metadata
- [ ] Git history completo + rollback instantâneo
- [ ] Documentação interna + README completo
- [ ] Usuário (você) consegue usar sem suporte

**Se falhar em ANY critério: retornar para @dev para fixes, não fazer go/no-go**

---

## 📞 Próximas Etapas

1. **@po (Pax)** valida PRD (10-point checklist)
2. **@architect (Aria)** cria technical spec + implementation plan
3. **@sm (River)** cria epics 1-7 como stories no backlog
4. **@dev (Dex)** implementa stories em waves paralelas
5. **@qa (Quinn)** gatekeeps cada epic antes de consolidação

---

## 📎 Documentos Relacionados

- [Project Brief](../project-brief.md) — Visão geral do problema/contexto
- [Deep Research Report](../deep-research-report.md) — Market validation, tech stack analysis
- [Storage & Sync Strategy](../storage-sync-strategy.md) — Implementação detalhada local + Google Drive
- [Environment Report](.aiox/environment-report.json) — Setup verificado

---

**Escrito por:** Morgan (Product Manager)  
**Aprovado por:** -  
**Data:** 2026-04-02  
**Versão:** 1.0.0 DRAFT → Ready for @po validation
