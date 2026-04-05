# EPIC 0: Multi-Project Foundation, Design-System Reconciliation, and Product Integration

**Status:** Done  
**Owner:** @pm (Morgan)  
**Timeline:** 6 weeks + 3-week corrective extension  
**Total Effort:** 208 hours  
**Last Updated:** 2026-04-04

---

## Purpose

Epic 0 established the desktop MVP foundation for Brand-Ops:
- PT-BR localization
- multi-project navigation
- project shell and core routes
- brand configuration baseline
- initial area scaffolding for dashboard, strategy/media, and social/copy

After implementation drift and a new wireframe cycle, Epic 0 also incorporated a corrective extension to reconcile:
- the wireframe and product architecture
- the existing Creative Library
- the actual reusable design-system assets already in the repo
- the current project-area surfaces that had diverged from the approved baseline

The legacy stories and the corrective extension are now closed against the same corrected baseline.

---

## Story Overview

### Story 0.1: Setup i18n e Localizacao PT-BR (8h)
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [0.1.setup-i18n-pt-br.md](0.1.setup-i18n-pt-br.md)

### Story 0.2: Tela de Selecao de Projetos (Home Global) (10h)
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [0.2.home-selecao-projetos.md](0.2.home-selecao-projetos.md)

### Story 0.3: Layout de Navegacao Multi-Contexto (12h)
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [0.3.layout-navegacao-multi-contexto.md](0.3.layout-navegacao-multi-contexto.md)

### Story 0.4: Configuracao da Marca no Sistema Compartilhado (8h)
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [0.4.configuracoes-marca.md](0.4.configuracoes-marca.md)

### Story 0.5: Dashboard do Projeto na Superficie Canonica (10h)
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [0.5.dashboard-metricas.md](0.5.dashboard-metricas.md)

### Story 0.6: Strategy Workspace e Integracao de Media Compartilhada (15h)
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [0.6.strategy-media-library.md](0.6.strategy-media-library.md)

### Story 0.7: Estrutura da Social Assets e Copy Messaging (15h)
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [0.7.social-copy-library.md](0.7.social-copy-library.md)

---

## Corrective Extension

### Story 0.8: Reconciliacao entre Wireframe, Codigo e Superficies Reais (8h)
**Owner:** @po  
**Quality Gate:** @architect  
**Status:** Done  
**Link:** [0.8.reconciliacao-wireframe-codigo.md](0.8.reconciliacao-wireframe-codigo.md)

### Story 0.9: Completar a Fundacao CSS Semantica Compartilhada (8h)
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [0.9.fundacao-css-semantica-compartilhada.md](0.9.fundacao-css-semantica-compartilhada.md)

### Story 0.10: Unificacao de Navegacao e Estado de Projeto (10h)
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [0.10.unificacao-navegacao-estado-projeto.md](0.10.unificacao-navegacao-estado-projeto.md)

### Story 0.11: Integracao da Creative Library a Arquitetura do Produto (12h)
**Owner:** @architect  
**Quality Gate:** @po  
**Status:** Done  
**Link:** [0.11.integracao-creative-library-arquitetura-produto.md](0.11.integracao-creative-library-arquitetura-produto.md)

### Story 0.12: Migracao das Superficies de Projeto para o Design-System Real (14h)
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [0.12.migracao-superficies-projeto-design-system.md](0.12.migracao-superficies-projeto-design-system.md)

### Story 0.13: Harmonizacao de Config, Upload e Fechamento de Qualidade (10h)
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [0.13.harmonizacao-config-upload-quality-closure.md](0.13.harmonizacao-config-upload-quality-closure.md)

### Story 0.14: Creative Library por Projeto e Navbar Lateral (12h)
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [0.14.project-scoped-creative-library-shell.md](0.14.project-scoped-creative-library-shell.md)

### Story 0.15: Renomeacao de Projeto e Dark/Light Mode (8h)
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [0.15.project-rename-and-theme-modes.md](0.15.project-rename-and-theme-modes.md)

### Story 0.16: Paridade Visual da Media Library e Menu Explicito de Config (8h)
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [0.16.media-library-parity-and-project-config-nav.md](0.16.media-library-parity-and-project-config-nav.md)

### Story 0.17: Localizacao da Media Library e Resiliencia do Storage Local (6h)
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [0.17.media-library-localization-and-storage-resilience.md](0.17.media-library-localization-and-storage-resilience.md)

---

## Final Execution Sequence

1. Story 0.1
2. Story 0.2
3. Story 0.3
4. Story 0.8
5. Story 0.9
6. Story 0.10
7. Story 0.11
8. Story 0.12
9. Story 0.13
10. Story 0.4
11. Story 0.5
12. Story 0.6
13. Story 0.7
14. Story 0.14
15. Story 0.15
16. Story 0.16
17. Story 0.17

---

## Final Epic Assessment

- The multi-project workspace baseline is in place and localized in PT-BR
- Home, project shell, navigation, config, dashboard, strategy/media, social, and copy now share the corrected product architecture
- The corrective extension removed the previous drift between wireframe, Creative Library, and reusable design-system assets
- The remaining backlog inconsistencies from legacy stories were normalized and closed without reopening obsolete requirements
- Each project now owns its Creative Library experience and the project shell now follows the lateral Creative Library language
- The product now supports project rename in settings and persistent dark/light mode
- Media Library parity was corrected and the project shell now exposes explicit CONFIG navigation
- Media Library localization and resilient local storage are now closed

---

## AIOX Governance Checklist

- [x] Stories use the repo's operational structure
- [x] Existing implemented work remains traceable
- [x] Corrective work is split into executor-owned stories
- [x] Architecture decisions are separated from implementation where needed
- [x] Quality gates are attached to every story
- [x] The extension is grounded in current repo artifacts
- [x] Legacy backlog and final implementation are now semantically aligned

---

## Deliverables Checklist

- [x] PT-BR localization baseline
- [x] project hub baseline
- [x] project shell baseline
- [x] wireframe-to-code reconciliation matrix
- [x] shared semantic CSS completion
- [x] unified project navigation/state flow
- [x] Creative Library integration decision and execution path
- [x] project-area migration onto the approved shared system
- [x] config/upload harmonization and quality closure
- [x] canonical project dashboard delivery
- [x] strategy workspace plus shared media integration
- [x] social assets and copy deposit delivery
- [x] project-scoped Creative Library delivery
- [x] project rename and theme-mode support
- [x] media library parity and explicit config navigation
- [x] media library localization and resilient local storage

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-04-04 | 4.3 | Executed Story 0.17, localized the Media Library main surfaces, and replaced the hard dependency on the `E:` storage drive with resilient local storage resolution | Codex |
| 2026-04-04 | 4.2 | Opened Story 0.17 to finish PT-BR localization in the Media Library and remove the hard dependency on the `E:` storage drive | Codex |
| 2026-04-04 | 4.1 | Executed Story 0.16, fixed Media Library layout parity against the approved reference, and restored explicit CONFIG in the project shell | Codex |
| 2026-04-04 | 4.0 | Opened Story 0.16 to correct Media Library parity against the approved reference and restore explicit CONFIG in the project shell | Codex |
| 2026-04-04 | 3.9 | Added and executed Stories 0.14 and 0.15 for project-scoped Creative Library, lateral shell navigation, project rename, and dark/light mode | Codex |
| 2026-04-04 | 3.8 | Closed the remaining legacy stories, normalized final QA evidence, and marked Epic 0 as done | Codex |
| 2026-04-04 | 3.7 | Re-scoped legacy Stories 0.4-0.6 to the corrected product architecture and updated the epic index for final backlog closeout planning | Codex |
| 2026-04-04 | 3.6 | Executed Story 0.13, harmonized config and upload decisions, and closed the corrective extension quality gates with zero warnings | Codex |
| 2026-04-04 | 3.5 | Executed Story 0.12, migrated Home and project shell surfaces onto the shared semantic system, and advanced the corrective extension to Story 0.13 | Codex |
| 2026-04-04 | 3.4 | Executed Story 0.11, approved the canonical Creative Library integration path, and advanced the corrective extension to Story 0.12 | Codex |
| 2026-04-04 | 3.3 | Executed Story 0.10, unified project navigation and state flow, and advanced the corrective extension to Story 0.11 | Codex |
| 2026-04-04 | 3.2 | Executed Story 0.9, completed the shared semantic CSS foundation, and advanced the corrective extension to Story 0.10 | Codex |
| 2026-04-04 | 3.1 | Executed Story 0.8, published the wireframe-to-code reconciliation guide, and moved the corrective extension to Story 0.9 | Codex |
| 2026-04-04 | 3.0 | Rebuilt the Epic 0 index around the real multi-project story set and added the corrective reconciliation extension Stories 0.8-0.13 | Codex |
| 2026-04-04 | 2.0 | Expanded Epic 0 to multi-project navigation and PT-BR operational foundation | @pm (Morgan) |
| 2026-04-04 | 1.0 | Initial index version | Project Team |

---

**Epic 0 Owner:** @pm (Morgan)  
**Status:** Done  
**Next Action:** Hand off Epic 0 outputs to the next planning and delivery cycle
