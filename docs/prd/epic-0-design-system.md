# Epic 0: Desktop MVP Foundation & Multi-Project Navigation

**Status:** Ready for Story Creation (Validated by @po)  
**Priority:** P0 - Critical Foundation  
**Owner:** @pm (Morgan)  
**Estimated Effort:** 160-180 hours  
**Target:** Weeks 1-6  
**Date Created:** 2026-04-04  
**Last Updated:** 2026-04-04

---

## Overview

O Epic 0 agora define a **fundação do sistema de design e a arquitetura de navegação multi-projeto** para o Brand-Ops. O objetivo mudou de um simples repositório de arquivos para uma plataforma de gestão de ativos para múltiplos clientes/marcas, com localização total em **PT-BR**.

Este épico está alinhado a:
- `docs/front-end-spec.md` - IA de 7 áreas e interações desktop.
- `outputs/wireframes/brand-ops/lo-fi-wireframes.md` - Definição visual das telas.
- `research/market-research-award-winners.md` - Padrões de UX adotados.

---

## Objectives

| # | Objetivo | Métrica de Sucesso | Tipo |
|---|-----------|----------------|------|
| 1 | **Localização PT-BR** | 100% da interface traduzida e adaptada ao mercado brasileiro. | MVP |
| 2 | **Navegação Multi-Projeto** | Fluxo completo entre Home Global e Dashboard do Projeto funcional. | MVP |
| 3 | **Ecossistema de 7 Áreas** | Estrutura de navegação para as 7 áreas críticas (Strategy, Media, etc) implementada. | MVP |
| 4 | **Design System Foundation** | Tokens e componentes (shadcn/ui) configurados para o tema Violeta & Ouro. | MVP |
| 5 | **Smart UX Patterns** | Implementação de Smart Defaults e Progressive Disclosure conforme pesquisa. | MVP |

---

## In Scope

### Feature 0.1: Localização e Internacionalização (i18n)
**Objetivo:** Garantir que o app fale a língua do usuário.
- Configuração de `next-i18next` ou padrão similar.
- Dicionário de termos PT-BR para as 7 áreas.
- Formatação de data/hora e moeda (Real R$).

### Feature 0.2: Arquitetura de Navegação Dinâmica
**Objetivo:** Criar o fluxo de contexto de projeto.
- **Tela 0 (Home Global):** Seleção de projetos com visualização Grade/Lista.
- **TopBar Global:** Persistente com nome do projeto e atalhos de perfil.
- **Navbar Horizontal (Projeto):** 7 itens dinâmicos (Dashboard, Estratégia, Mídia, Social, Produção, Textos, Config).

### Feature 0.3: Componentes das 7 Áreas Fundamentais
**Objetivo:** Suporte visual para todo o ecossistema.
- **Dashboard:** Cards de métricas e gráfico de timeline.
- **Strategy:** Visualização de funis e blocos de oferta.
- **Media Library:** Navegação por pastas e preview de arquivos brutos.
- **Social Assets:** Grid adaptativo por proporções (1:1, 9:16).
- **Copy:** Interface de leitura/escrita limpa (FocusView).
- **Config:** Painel de tokens de marca (Cores/Logos).

### Feature 0.4: Design System (Tokens e Regras)
- Tokens semânticos: `action-primary` (Violeta), `status-accent` (Ouro).
- Tipografia: Sora (Títulos) e Inter (Corpo).
- Padrões de Feedback: Skeleton Loaders e Toasts de Undo (sem modais de confirmação chatos).

---

## Out of Scope
- Mobile/Tablet.
- Autenticação Multi-usuário (o app continua single-user).
- Integração externa real (Airtable/Notion) — apenas placeholders.

---

## Story Map (Proposta para o @sm)

- **0.1: Setup i18n e Localização PT-BR**
- **0.2: Tela de Seleção de Projetos (Home Global)**
- **0.3: Layout de Navegação Multi-Contexto (Navbar 7 áreas)**
- **0.4: Página de Configurações da Marca (Design System)**
- **0.5: Página de Dashboard e Métricas do Projeto**
- **0.6: Estrutura da Strategy e Media Library**
- **0.7: Estrutura da Social Assets e Copy Messaging**

---

## Success Criteria
- [ ] O usuário consegue alternar entre projetos em menos de 2 segundos.
- [ ] A interface não possui termos em inglês.
- [ ] O Design System reflete as cores Violeta e Ouro em 100% dos componentes.
- [ ] Todos os 7 menus da Navbar carregam suas respectivas rotas.

---

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-04-04 | 2.0 | Expansão para Multi-Projeto e PT-BR (7 áreas fundamentais) | @pm (Morgan) |
| 2026-04-04 | 1.2 | Stories de adoção e QA | Codex |

---
**Epic 0 Owner:** @pm (Morgan)  
**Framework:** AIOX Story-Driven  
**Next Action:** Enviar para validação do @po (Pax)
