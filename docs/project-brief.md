# Brand-Ops Project Brief

> **EN** | PT (Portuguese) | ES (Spanish)

---

**Project Name:** Brand-Ops  
**Type:** Internal Operations Platform (Marketing Ops)  
**Version:** 1.0.0  
**Last Updated:** 2025-04-02  
**Status:** Discovery Phase (Ready for PRD)  
**Created By:** Atlas (Analyst)  
**Owner:** @pm (Morgan)

---

## Table of Contents

- [Overview](#overview)
- [Executive Summary](#executive-summary)
- [Vision & Objectives](#vision--objectives)
- [Problem & Context](#problem--context)
- [Target Audiences](#target-audiences)
- [Product Scope](#product-scope)
- [Architecture & Data Model](#architecture--data-model)
- [Success Metrics](#success-metrics)
- [MVP Scope](#mvp-scope-refined)
- [Technical Considerations](#technical-considerations)
- [Storage & Infrastructure](#storage--infrastructure)
- [Open Questions (Resolved)](#questões-em-aberto-respondidas)
- [Research Recommendations](#pesquisas-recomendadas)
- [Related Documents](#related-documents)

---

## Overview

**Brand-Ops** é uma plataforma centralizada para operações de marketing — organiza estratégia, identidade, mídia, criativos e copys em um único lugar com armazenamento local (E:\BRAND-OPS-STORAGE\) + backup automático no Google Drive (2TB Google One).

**Core Value Proposition:** Eliminar dispersão de informação, retrabalho e desconexão entre estratégia e execução.

---

## 📋 Executive Summary

**Brand-Ops** é uma plataforma centralizada para organizar toda a operação de marketing — desde estratégia até criação e entrega de campanhas. Resolve o problema de dispersão de informação, falta de versionamento e desconexão entre estratégia e execução.

**Core Promise:** "Organizar tudo que sua operação de marketing produz em um único lugar, com contexto estratégico e versionamento inteligente."

---

## 🎯 Visão & Objetivos Principais

### Visão
Ser a **fonte única de verdade** para todas as operações de marketing — conectando estratégia com execução, eliminar retrabalho e garantir consistência.

### Objetivos Primários
1. **Centralizar** toda informação estratégica (produtos, ofertas, públicos, funis, campanhas)
2. **Organizar** todos os materiais (identidade, banco de mídia, criativos, textos)
3. **Conectar** criação com estratégia (cada criativo sabe seu contexto)
4. **Versionar** tudo sem perder histórico
5. **Acelerar** o workflow de produção eliminando buscas e confirmações

---

## 🔍 Problema Principal

### Situação Atual
- ❌ Arquivos espalhados em múltiplas plataformas (Google Drive, Dropbox, Figma, etc.)
- ❌ Versões desorganizadas e conflitantes
- ❌ Retrabalho por falta de contexto (designer não sabe pra qual campanha é)
- ❌ Criadores sem clareza sobre estratégia (pra quem estão falando)
- ❌ Manual de marca ignorado (não centralizado)
- ❌ Sem rastreamento de status (qual criativo está aprovado?)

### Impacto
- 🕐 **Tempo perdido:** Búsca e confirmação de informação
- 💰 **Custo alto:** Retrabalho desnecessário
- 📉 **Qualidade:** Inconsistência visual e de mensagem
- 😤 **Frustração:** Equipes desorientadas

---

## 👥 Públicos-Alvo

### Primary Users
**Gestores de Marketing & Operações**
- Necessidade: Visão centralizada de toda produção
- Papel: Supervisor, aprovador
- Dor: Não saber o que está em andamento

**Designers & Criadores**
- Necessidade: Acesso rápido a materiais e contexto
- Papel: Executor
- Dor: Perder tempo procurando referências e contexto

**Product Owners & Estrategistas**
- Necessidade: Vincular criação com estratégia
- Papel: Planejador, direcionador
- Dor: Criadores não entenderem estratégia

### Secondary Users
- **Stakeholders:** Acompanhar status de campanhas
- **Clientes Externos:** Acessar e aprovar materiais (permissões limitadas)

---

## 📊 Escopo do Produto

### 🧠 STRATEGY LIBRARY (Cérebro Estratégico)
Seção informacional (sem arquivos) que define a estratégia e contexto:

| Componente | O que é | Exemplo |
|-----------|---------|---------|
| **Produtos** | O que o cliente vende | Mentoria Elite |
| **Ofertas** | Forma de empacotar pra vender | Black Friday 50% OFF |
| **Públicos** | Pra quem falar | Empresários 30-45 |
| **Funis** | Caminho até compra | Anúncio → Landing → VSL → Checkout |
| **Campanhas** | Ação de marketing que junta tudo | Black Friday Mentoria 2026 |

**Regra:** Estratégia é o **roteiro do filme** — sem ela, o ator não sabe o que fazer.

---

### 📦 BRAND CORE (Identidade da Marca)
Materiais visuais de referência (estáticos, raramente mudam):

| Componente | Descrição | Formato |
|-----------|-----------|---------|
| **Logotipos** | Todas as versões (H, V, claro, escuro) | PNG/SVG |
| **Tipografia** | Fontes primárias e secundárias | Arquivo + especificações |
| **Paleta de Cores** | Primárias, secundárias, neutras | Hex/RGB codes |
| **Elementos Visuais** | Patterns, shapes, ícones | PNG/SVG |
| **Manual de Marca** | Diretrizes oficiais | PDF/Link |

**Regra:** Isso é **referência**, não execução.

---

### 📂 MEDIA LIBRARY (Banco de Mídia Bruta)
Fotos e vídeos crus que servem de matéria-prima:

| Tipo | Exemplos |
|------|----------|
| **Fotos** | Ensaios, eventos, bastidores, lifestyle, depoimentos |
| **Vídeos** | Gravações de eventos, depoimentos, conteúdo espontâneo, material longo |

**Regra:** Aqui é **ingrediente cru**, não peça final.

---

### 🌐 SOCIAL ASSETS (Presença Digital Institucional)
Materiais fixos das redes sociais do cliente:

| Componente | Descrição |
|-----------|-----------|
| **Fotos de Perfil** | Todas as redes |
| **Capas** | YouTube, Facebook, LinkedIn |
| **Destaques** | Capas de destaques do Instagram |

**Regra:** Isso é a **vitrine da loja**, não campanha.

---

### 🎬 CREATIVE PRODUCTION (Criativos de Marketing)
Peças prontas — o que vai pro mundo:

| Tipo | Descrição |
|------|-----------|
| **Estáticos** | Posts, banners, thumbnails |
| **Vídeos** | Ads, reels |
| **Carrosséis** | Sequência de imagens |
| **VSLs** | Vídeos longos de venda |
| **Lives** | Gravações de lives |
| **Apresentações** | PDFs, PowerPoints |

**Cada criativo:** Nome padronizado + status + versão + arquivo editável + arquivo final + vínculo estratégico

---

### ✍️ COPY & MESSAGING (Comunicação Escrita)
Toda comunicação escrita, segmentada por contexto:

| Tipo | Descrição |
|------|-----------|
| **Copys de Anúncios** | Textos para ads |
| **Headlines** | Títulos e chamadas |
| **Scripts/Roteiros** | Roteiro de vídeo, VSL, live |
| **Notificações** | WhatsApp, email, push |
| **Big Ideas** | Promessas centrais e ângulos |

**Cada copy:** Segmentada por ângulo + oferta + público

---

## 📐 Arquitetura Conceitual

```
PROJETO (Cliente)
│
├── 🧠 STRATEGY LIBRARY
│   ├── Produtos
│   ├── Ofertas
│   ├── Públicos
│   ├── Funis
│   └── Campanhas
│
├── 📦 BRAND CORE
│   ├── Logotipos
│   ├── Tipografia
│   ├── Paleta de Cores
│   ├── Elementos Visuais
│   └── Manual de Marca
│
├── 📂 MEDIA LIBRARY
│   ├── Fotos
│   └── Vídeos
│
├── 🌐 SOCIAL ASSETS
│   ├── Fotos de Perfil
│   ├── Capas
│   └── Destaques
│
├── 🎬 CREATIVE PRODUCTION
│   ├── Estáticos
│   ├── Vídeos
│   ├── Carrosséis
│   ├── VSLs
│   └── Lives
│
└── ✍️ COPY & MESSAGING
    ├── Copys de Anúncios
    ├── Headlines
    ├── Scripts/Roteiros
    ├── Notificações
    └── Big Ideas
```

### Diretriz Visual do MVP

- O MVP adota uma interface funcional, minimalista e desktop-first
- O design-system existe para acelerar implementacao e consistencia
- O MVP nao inclui reposicionamento premium, linguagem luxury, ou expansao para mobile/tablet
- Dark mode pode ser suportado futuramente pela stack, mas nao define a direcao visual do MVP

---

## 🎯 Formatos Padrão

| Nome | Proporção | Pixels | Uso |
|------|-----------|--------|-----|
| **Quadrado** | 1:1 | 1080×1080 | Feed Instagram/Facebook |
| **Retrato** | 4:5 | 1080×1350 | Feed otimizado |
| **Reels/Stories** | 9:16 | 1080×1920 | Reels, Stories, TikTok |
| **Paisagem** | 1.91:1 | 1200×628 | Ads Facebook/Google |
| **Widescreen** | 16:9 | 1920×1080 | YouTube |

---

## ✅ Regras Fundamentais do Sistema

| Regra | Aplicação |
|-------|-----------|
| Todo vídeo precisa de thumbnail | Qualquer seção |
| Nunca sobrescrever — sempre nova versão | Qualquer seção |
| Todo arquivo precisa de editável OU final | Qualquer seção |
| Editável online (Figma/Canva) → guardar link | Qualquer seção |
| Identidade é referência, não execução | Brand Core |
| Banco de Mídia é matéria-prima crua | Media Library |
| Social Assets é institucional, não campanha | Social Assets |
| Copy segmentada por ângulo+oferta+público | Copy & Messaging |
| Oferta vinculada a produto | Strategy Library |
| Criativo vinculado a campanha | Creative Production |

---

## 🚀 Oportunidades de Mercado

### Market Fit
- **TAM:** Agências de marketing, times internos de marketing, produtoras de conteúdo
- **Pain Point:** Dispersão de informação, retrabalho, falta de contexto
- **Solução:** Centralizar + versionar + conectar

### Diferencial
1. **Conexão estratégia-execução** (competitors separam)
2. **Versionamento inteligente** (histórico sem perder)
3. **Organização por contexto** (não só por formato)

### Early Adopters
- Agências de marketing (30-100 pessoas)
- Produtoras de conteúdo
- Departamentos de marketing em SaaS

---

## 🔄 Estrutura de Dados (Relações)

```
PROJETO
├── PRODUTO
│   └── OFERTA
│       └── CAMPANHA
│           └── CRIATIVO
│               ├── Arquivo editável
│               ├── Arquivo final
│               ├── Status
│               └── Versão
│
├── PÚBLICO
│   └── (contexto para CAMPANHA)
│
└── MÍDIA BRUTA
    └── (matéria-prima para CRIATIVO)
```

---

## 📈 Métricas de Sucesso

### Adoção
- % de conteúdo produzido vinculado a campanha
- Tempo médio de busca por material

### Qualidade
- Consistência visual (% criativos dentro das guidelines)
- Taxa de retrabalho (criações rejeitadas por contexto incompleto)

### Eficiência
- Tempo até criativo aprovado
- % de materiais com versão anterior reutilizável

---

## 🎯 Fase Inicial (MVP)

### Features Essenciais (Phase 1)
1. **Strategy Library:** CRUD de produtos, ofertas, públicos, funis, campanhas
2. **Brand Core:** Upload e organização de identidade
3. **Creative Production:** Upload de criativos com metadados e vinculação estratégica
4. **Basic Search:** Busca por campanha, tipo, status

### Features Futuras (Phase 2+)
- Media Library com IA de reconhecimento
- Copy Management com IA de sugestões
- Social Assets com agendamento
- Approval Workflow avançado
- Analytics de ROI por campanha

---

## 👥 Stakeholders

| Stakeholder | Interesse | Prioridade |
|-------------|-----------|-----------|
| **Gestor de Marketing** | Visão centralizada, status | Alta |
| **Designer** | Acesso a materiais, contexto | Alta |
| **Estrategista** | Vinculação estratégia-execução | Alta |
| **Cliente Final** | Aprovação, histórico | Média |
| **Stakeholder Executivo** | ROI, produtividade | Média |

---

## 📝 Recomendações de Pesquisa

### Próximas Etapas
1. **Validação com Usuários:** Entrevistas com gestores de marketing
2. **Análise Competitiva:** Frame.io, Dropbox, Airtable integrations
3. **Prototipagem:** Mockups de Strategy Library e Creative Production
4. **Estimativa Técnica:** Arquitetura, infraestrutura, timeline

### Questões em Aberto (RESPONDIDAS)

- [x] **Será multi-tenant ou single-tenant inicial?**
  - ✅ **Single-tenant** — Uma instância para a empresa (não multi-usuário compartilhado por enquanto)
  - Implicação: UI simplificada, sem gestão de times/permissões complexa

- [x] **Qual será a estratégia de monetização?**
  - ✅ **Nenhuma — Ferramenta interna**
  - Escopo: Uso exclusivo da empresa, sem venda ou exposição pública
  - Implicação: Não precisa de onboarding, pricing tiers, ou marketing

- [x] **Integração com Figma, Canva, Adobe Cloud?**
  - ✅ **Não no momento**
  - MVP: Upload direto de arquivos (editável + final)
  - Futura: Links externos para Figma/Canva (nice-to-have Phase 2)

- [x] **Permissões e colaboração em tempo real?**
  - ✅ **Não no momento**
  - MVP: Ferramenta de organização pessoal (sem workflow de aprovação multiusuário)
  - Futura: Permissões e colaboração (Phase 2)

---

## 🏗️ Implicações Arquiteturais (com base nas decisões)

### Single-Tenant PESSOAL (Uso Exclusivo)
```
Implicação                          | Impacto no Design
------------------------------------|------------------------------------------
Sem multi-tenancy                   | Banco de dados simples (SQLite local)
Sem autenticação SSO/OAuth          | Login local OU skip (pessoal)
Sem RBAC complexo                   | Zero permissões (acesso total pessoal)
Sem analytics compartilhado          | Apenas dados da pessoa
Sem onboarding                      | Self-service, documentação mínima
```

### Storage LOCAL + GOOGLE DRIVE SYNC ✨ (NOVO!)
```
Implicação                          | Impacto no Design
------------------------------------|------------------------------------------
Storage principal                   | E:\BRAND-OPS-STORAGE (HD local)
Backup automático                   | Google Drive (Google One 2TB)
Sincronização                       | 2-way sync (local ↔ Drive automático)
Versionamento                       | Google Drive versioning nativo
Modo offline                        | ✅ SIM! Roda 100% offline com SQLite
Sem dependência cloud               | MVP completamente autossuficiente
```

**Arquitetura de Storage Refinada:**
```
┌─ LOCAL (Principal) ─────────────────────────┐
│ E:\BRAND-OPS-STORAGE\                       │
│ ├── brand-core/                             │
│ ├── media-library/                          │
│ ├── creative-production/                    │
│ ├── social-assets/                          │
│ ├── copy-messaging/                         │
│ ├── database.db (SQLite - local)            │
│ └── .sync-metadata/ (timestamps, hashes)    │
└─────────────────────────────────────────────┘
         ↓ AUTO-SYNC (rclone ou similar)
┌─ GOOGLE DRIVE (Backup) ─────────────────────┐
│ /Brand-Ops-Backup/                          │
│ (Google One: 2TB disponível)                │
│ ├── brand-core/                             │
│ ├── media-library/                          │
│ ├── creative-production/                    │
│ ├── social-assets/                          │
│ ├── copy-messaging/                         │
│ └── database-backups/ (snapshots diários)   │
└─────────────────────────────────────────────┘
```

**Estratégia de Sync:**
- ✅ Automático a cada mudança (ou scheduled 1x/dia)
- ✅ 2-way (local é source, Drive é backup)
- ✅ rclone ou Google Drive para Desktop
- ✅ Versionamento automático pelo Google Drive

### Integrações com Google Drive (NOVO!)
```
Implicação                          | Implementação
------------------------------------|------------------------------------------
Upload de arquivos local            | Direto em E:\BRAND-OPS-STORAGE (rápido)
Sync com Google Drive               | rclone daemon (automático 1x/dia)
Versionamento                       | Google Drive historical versions
Backup redundante                   | 2TB Google One = seguro
Sem vendor lock-in                  | Arquivos em formatos abertos
```

**Ferramentas Recomendadas:**
- **rclone** (open-source, bidirecional, agendável)
- **Google Drive para Desktop** (official, simples, mais lento)
- **Recomendação:** rclone com cron job para máxima velocidade e controle

### Sem Colaboração Tempo Real (MVP)
```
Implicação                          | Impacto no Design
------------------------------------|------------------------------------------
Sem workflow de aprovação           | Status simples (Draft/Approved/Archived)
Sem comments/discussion             | Notas de texto em metadados (JSON)
Sem locks de edição                 | Tracking local apenas
Sem notificações push               | Nenhuma necessária (pessoal)
```

### Ser Ferramenta Pessoal 100% (Uso Exclusivo)
```
Implicação                          | Impacto no Design
------------------------------------|------------------------------------------
Sem UI/UX premium                   | Design funcional, minimalista
Sem mobile-first                    | Desktop-only (acesso local)
✅ MODO OFFLINE                     | Sim! SQLite roda 100% offline
Sem rate limiting                   | Sem limites (pessoal)
Sem SLA de uptime crítico           | Best effort, sem garantias
```

---

## 📋 MVP Scope Refinado (Com Storage LOCAL + Google Drive)

### Incluso (Phase 1) ✨
✅ **Storage Local:** E:\BRAND-OPS-STORAGE com SQLite  
✅ **Google Drive Sync:** Automático via rclone (1x/dia)  
✅ **Modo Offline:** Funciona 100% sem internet  
✅ Strategy Library CRUD (5 entidades)  
✅ Brand Core upload e organização  
✅ Creative Production com metadados  
✅ Media Library com busca básica (full-text search local)  
✅ Copy Management estruturado  
✅ Social Assets upload  
✅ Status simples (Draft/Approved/Archived)  
✅ Versionamento de arquivos (historico em Google Drive)  
✅ Search e filtros básicos (SQLite FTS)  
✅ **Backup Automático:** Google One 2TB  

### NÃO Incluso (Phase 2+)
❌ Multi-tenancy  
❌ Autenticação SSO/OAuth  
❌ Permissões complexas  
❌ Integrações Figma/Canva/Adobe (apenas links)  
❌ Colaboração tempo real entre pessoas  
❌ Workflow de aprovação com notificações  
❌ Notificações push  
❌ Mobile app / Web cloud  
❌ Sincronização bidirecional complexa (source = local)  

---

## 🎯 Estimativa Simplificada (Internal Tool)

| Componente | Complexidade | Timeline |
|-----------|-------------|----------|
| **Strategy Library** | Baixa | 1-2 semanas |
| **Brand Core** | Média | 2-3 semanas |
| **Creative Production** | Alta | 3-4 semanas |
| **Media Library** | Média | 2-3 semanas |
| **Copy Management** | Baixa | 1-2 semanas |
| **Search & Filters** | Média | 2 semanas |
| **Deploy & Testing** | Média | 1-2 semanas |
| **TOTAL MVP** | - | **12-17 semanas** |

---

## 🔗 Conexões Estratégicas

### Conecta com
- **Product:** Para criar PRD detalhado com escopo refinado
- **Architecture:** Para design técnico simplificado (sem multi-tenancy)
- **Dev:** Para prototipagem rápida (single-tenant = menos complexidade)

### Próxima Fase
**PHASE 1.2:** @pm criará o PRD com requisitos funcionais detalhados baseado nesse brief refinado

---

---

## Related Documents

- [Deep Research Report](./deep-research-report.md) — Competitive analysis, market research, technical feasibility
- [Storage & Sync Strategy](./storage-sync-strategy.md) — Local storage architecture + Google Drive backup
- [AIOX Constitution](./.aiox-core/constitution.md) — Framework principles and gates
- [Project GitHub](https://github.com/Jhonny-Xprite/brand-ops) — Repository

---

_Prepared by: Atlas (Analyst)_  
_Document Version: 1.0.0_  
_Date Created: 2025-04-02_  
_Last Updated: 2025-04-02_  
_Status: ✅ READY FOR PRD CREATION_  
_Next Phase: @pm creates Product Requirements Document_
