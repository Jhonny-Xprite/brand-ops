# EPIC 2: Project Workspace Domain Expansion

**Status:** Done  
**Owner:** @pm (Morgan)  
**Timeline:** 4 weeks  
**Total Effort:** 96 hours  
**Last Updated:** 2026-04-04

---

## Purpose

Expand the project workspace so each client project supports:
- onboarding with business context
- distinct `BRAND CORE` and `CONFIGS` areas
- a richer dashboard with project profile and social links
- real domain libraries for strategy, brand identity, social assets, creative production, and copy
- continued project-scoped `MEDIA LIBRARY` without changing URL or storage identity contracts

This epic intentionally preserves:
- URL pattern `/projeto/[id]/...`
- project storage root by `projectId`
- the Creative Library design language as the visual baseline for the project shell

---

## Story Overview

### Story 2.1: Expandir Modelo de Projeto e Onboarding Inicial
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [2.1.expandir-modelo-projeto-onboarding.md](2.1.expandir-modelo-projeto-onboarding.md)

### Story 2.2: Reordenar Navegacao e Separar Brand Core de Configs
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [2.2.navegacao-brand-core-configs.md](2.2.navegacao-brand-core-configs.md)

### Story 2.3: Transformar Configs em Configuracao Geral do Projeto
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [2.3.configs-gerais-projeto.md](2.3.configs-gerais-projeto.md)

### Story 2.4: Criar Brand Core como Biblioteca de Identidade
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [2.4.brand-core-biblioteca-identidade.md](2.4.brand-core-biblioteca-identidade.md)

### Story 2.5: Expandir Dashboard com Ficha do Projeto
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [2.5.dashboard-ficha-projeto.md](2.5.dashboard-ficha-projeto.md)

### Story 2.6: Reestruturar Strategy Library por Categoria
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [2.6.strategy-library-categorias.md](2.6.strategy-library-categorias.md)

### Story 2.7: Consolidar Media Library como Midia Bruta Categorizada
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [2.7.media-library-fotos-videos.md](2.7.media-library-fotos-videos.md)

### Story 2.8: Implementar Social Assets como Biblioteca Institucional
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [2.8.social-assets-biblioteca.md](2.8.social-assets-biblioteca.md)

### Story 2.9: Implementar Creative Production como Biblioteca de Marketing
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [2.9.creative-production-biblioteca.md](2.9.creative-production-biblioteca.md)

### Story 2.10: Implementar Copy and Messaging como Biblioteca Editorial
**Owner:** @dev  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [2.10.copy-messaging-biblioteca.md](2.10.copy-messaging-biblioteca.md)

### Story 2.11: QA Transversal e Alinhamento Final do Workspace
**Owner:** @qa  
**Quality Gate:** @qa  
**Status:** Done  
**Link:** [2.11.qa-transversal-workspace.md](2.11.qa-transversal-workspace.md)

---

## Execution Notes

- This epic is tracked as `epic-2` because `epic-1` is already reserved for the Creative Library/versioning initiative in the repository
- The implementation reuses a shared domain-library contract instead of creating separate persistence models for every project area
- `BRAND CORE` becomes the canonical source of project identity assets
- `CONFIGS` becomes the canonical source of project general settings and social profile metadata

---

## Change Log

| Date | Version | Author | Description |
|------|---------|--------|-------------|
| 2026-04-04 | 1.0 | Codex | Opened and executed the project workspace domain expansion epic with onboarding, split navigation, domain libraries, and QA closure |
