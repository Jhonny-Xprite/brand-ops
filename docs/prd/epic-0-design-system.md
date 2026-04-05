# Epic 0: Multi-Project Foundation and Design-System Reconciliation

**Status:** In Progress  
**Priority:** P0 - Critical Foundation  
**Owner:** @pm (Morgan)  
**Estimated Effort:** 200+ hours  
**Target:** Weeks 1-9  
**Date Created:** 2026-04-04  
**Last Updated:** 2026-04-04

---

## Overview

Epic 0 is no longer just a design-system setup epic. In the current project reality, it owns the combined foundation for:
- PT-BR localization
- multi-project navigation
- project shell and initial area routes
- brand configuration baseline
- the first product-wide design-system correction pass

This scope expansion is necessary because the implemented product now contains:
- a project-centered flow in `/` and `/projeto/[id]/*`
- a more mature Creative Library in `/creative-library`
- a partially adopted repo-native design-system
- a new wireframe direction that did not fully account for already implemented surfaces

---

## Objectives

| # | Objective | Success Metric | Type |
|---|-----------|----------------|------|
| 1 | PT-BR Product Baseline | Core user-facing surfaces ship in Portuguese with consistent terminology. | MVP |
| 2 | Multi-Project Navigation | Home, project shell, and context switching work coherently without state loss. | MVP |
| 3 | Canonical Product Architecture | The project hub, project shell, and Creative Library are reconciled into one explicit navigation model. | MVP |
| 4 | Shared Semantic Foundation | Existing UI surfaces use the approved semantic tokens, shared classes, and repo-native reusable components. | MVP |
| 5 | Refactor Readiness | Future stories no longer need to guess whether to follow wireframes, placeholders, or implemented surfaces. | MVP |

---

## Current-State Problems This Epic Must Resolve

1. The wireframe and the implemented product do not fully agree on which surfaces are canonical.
2. The Creative Library is already a mature operational surface, but it is not integrated into the main project flow.
3. The project hub and project shell have drifted away from the semantic design-system baseline.
4. Shared CSS primitives used by the app are not fully defined in `globals.css`.
5. Some flows bypass Redux state patterns already available in the repo.

---

## In Scope

### Feature 0.1: Localization and Multi-Project Foundation
- PT-BR localization infrastructure
- Home Global project selection
- project context persistence
- top bar and horizontal project navigation

### Feature 0.2: Project Shell and Area Scaffolding
- Dashboard route
- Strategy route
- Media route
- Social route
- Copy route
- Config route

### Feature 0.3: Shared Design-System Reconciliation
- semantic token alignment
- shared CSS component primitives
- repo-native component reuse
- reduction of duplicate visual systems in project hub and project shell

### Feature 0.4: Creative Library Product Integration
- formal decision on how the Creative Library belongs inside the product IA
- avoidance of duplicate “media library” implementations
- reuse of already implemented creative operations flows where appropriate

### Feature 0.5: Config and Quality Closure
- config flow harmonization
- upload and feedback pattern consistency
- dependency manifest and lint/test/build closure for touched surfaces

---

## Out of Scope

- Mobile/tablet optimization
- Multi-user auth and permissions
- External integrations beyond existing local-first placeholders
- Rebuilding the Creative Library from scratch
- Inventing new future-facing product areas not already represented in the repo

---

## Story Map

### Existing Foundation Stories
- 0.1 Setup i18n e Localização PT-BR
- 0.2 Tela de Seleção de Projetos
- 0.3 Layout de Navegação Multi-Contexto
- 0.4 Página de Configurações da Marca
- 0.5 Dashboard e Métricas do Projeto
- 0.6 Estrutura da Strategy e Media Library
- 0.7 Estrutura da Social Assets e Copy Messaging

### Corrective Extension Stories
- 0.8 Reconciliação entre Wireframe, Código e Superfícies Reais
- 0.9 Completar a Fundação CSS Semântica Compartilhada
- 0.10 Unificação de Navegação e Estado de Projeto
- 0.11 Integração da Creative Library à Arquitetura do Produto
- 0.12 Migração das Superfícies de Projeto para o Design-System Real
- 0.13 Harmonização de Config, Upload e Fechamento de Qualidade

---

## Corrective Principles

1. Implemented product surfaces have priority over speculative wireframe interpretation until reconciled explicitly.
2. The Creative Library must be treated as an implemented asset, not a disposable experiment.
3. No new UI should duplicate an already working operational flow.
4. Architecture decisions must precede large-scale visual refactors.
5. The repo is the source of truth for the design-system, not disconnected mockups.

---

## Success Criteria

- [ ] Project selection and project navigation work without full reloads or state loss.
- [ ] A single canonical IA exists for project hub, project shell, and Creative Library.
- [ ] Shared semantic classes used by the app are defined and stable.
- [ ] Project hub and project shell no longer operate with a parallel visual language disconnected from the repo-native design-system.
- [ ] Config and upload flows follow the same reusable feedback and interaction patterns used elsewhere in the product.
- [ ] Quality gates pass on the corrected surfaces with no unresolved blocking drift.

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-04-04 | 3.0 | Reframed Epic 0 around the real project state and added the corrective reconciliation extension | Codex |
| 2026-04-04 | 2.0 | Expanded Epic 0 to multi-project and PT-BR foundation | @pm (Morgan) |
| 2026-04-04 | 1.0 | Initial design-system foundation framing | Project Team |

---

**Epic 0 Owner:** @pm (Morgan)  
**Framework:** AIOX Story-Driven  
**Next Action:** Execute Story 0.8 and treat its reconciliation output as the architecture gate for the rest of the corrective extension
