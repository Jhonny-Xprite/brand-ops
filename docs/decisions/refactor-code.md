# Plano Revisado: Reconciliação do Wireframe com o Código Real

## Objetivo

Corrigir o desalinhamento entre:
- o **wireframe novo**
- o **estado real do código**
- o **design-system já existente**
- as **superfícies já implementadas**, especialmente a **Creative Library**

Este plano substitui a abordagem anterior de "trocar classes e reaproveitar componentes" por uma abordagem mais segura:
1. validar a arquitetura real do produto,
2. definir a superfície canônica de cada fluxo,
3. só então executar a refatoração visual e de reuso.

---

## Diagnóstico Validado no Repositório

### 1. O problema não é só visual; é arquitetural

Hoje existem **dois fluxos principais desconectados**:
- a área de **Projetos** em [index.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/pages/index.tsx) e [ProjectLayout.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/components/Layout/ProjectLayout.tsx)
- a **Creative Library** em [creative-library.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/pages/creative-library.tsx)

A Creative Library já é uma das superfícies mais maduras do sistema, mas o wireframe e a navegação nova não a incorporam como parte natural do fluxo por projeto.

### 2. A home atual divergiu do baseline do Epic 0

A home em [index.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/pages/index.tsx) voltou para um padrão claro e ad hoc:
- `bg-white`, `bg-gray-50`, `border-gray-200`, `text-gray-*`
- botão manual azul
- erro manual vermelho
- navegação por `window.location.href`

Isso contradiz a baseline semântica já usada em [creative-library.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/pages/creative-library.tsx) e o objetivo do Epic 0.

### 3. O design-system existe, mas está parcialmente órfão

Os artefatos e componentes de design-system já existem, mas estão subutilizados:
- [BrandLogo.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/components/atoms/BrandLogo.tsx)
- [MotionButton.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/components/atoms/MotionButton.tsx)
- [FadeIn.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/components/atoms/FadeIn.tsx)
- [Skeleton.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/components/atoms/Skeleton.tsx)
- [StatusNotice.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/components/molecules/StatusNotice.tsx)
- [DialogShell.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/components/organisms/DialogShell.tsx)

Na prática:
- `BrandLogo`, `FadeIn`, `Skeleton` e `StatusNotice` aparecem principalmente na Creative Library ou no laboratório
- `MotionButton` e parte do sistema visual aparecem em [design-system.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/pages/design-system.tsx), mas quase não foram absorvidos pelas telas de produto
- `DialogShell` ainda não está integrado ao fluxo de projetos

### 4. O CSS semântico está incompleto para o volume de classes já em uso

[globals.css](/D:/MINI-PROJETOS-AIOX/brand-ops/src/styles/globals.css) hoje define:
- tokens base
- `btn-primary`, `btn-secondary`, `btn-ghost`
- poucos utilitários customizados

Mas várias classes já usadas no app **não estão definidas ali**, como:
- `panel-shell`
- `glass-l1`, `glass-l2`, `glass-l3`
- `dialog-overlay`, `dialog-card`, `dialog-header`, `dialog-actions`
- `eyebrow-label`
- `field-label`, `input-field`, `select-field`, `textarea-field`
- `status-badge`
- `segmented-control`
- `desktop-app-shell`, `desktop-sidebar`, `desktop-workspace`, `desktop-detail-panel`

Ou seja: há componentes escritos como se o design-system já estivesse 100% operacional, mas a camada CSS compartilhada ainda não acompanha isso.

### 5. O plano antigo acerta parte do problema, mas ignora a principal superfície já pronta

O plano anterior estava certo ao identificar:
- ausência de reuso real
- duplicação de modal/upload/status
- home fora do padrão
- layout de projeto fora do design-system

Mas ele falha em um ponto maior:
- trata a Creative Library como um detalhe lateral, quando ela já é a superfície mais madura e deveria orientar a refatoração do restante

### 6. A navegação e o contexto de projeto estão incompletos

[ProjectLayout.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/components/Layout/ProjectLayout.tsx) já sincroniza `activeProjectId` com Redux, mas:
- a home não usa `router.push` + `setActiveProjectId`
- a rota [creative-library.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/pages/creative-library.tsx) não participa do contexto por projeto
- as páginas de projeto como [media.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/pages/projeto/[id]/media.tsx) ainda são placeholders, mesmo existindo uma biblioteca real separada

### 7. O modal de criação de projeto duplica fluxo que já existe no Redux

[CreateProjectModal.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/components/Projects/CreateProjectModal.tsx) faz `fetch('/api/projects/create')` diretamente, apesar de já existir:
- hook [useProjects.ts](/D:/MINI-PROJETOS-AIOX/brand-ops/src/hooks/useProjects.ts)
- thunk `createProject` em [projects.slice.ts](/D:/MINI-PROJETOS-AIOX/brand-ops/src/store/projects/projects.slice.ts)

Isso cria bypass de estado e redundância operacional.

### 8. O plano antigo não considerava a realidade atual dos quality gates

Estado atual validado:
- `npm run typecheck`: PASS
- `npm run build`: PASS
- `npm run lint`: PASS com **16 warnings**

Logo, o critério correto não é "zero errors" apenas. O plano revisado precisa incluir **zerar warnings relevantes** das superfícies refatoradas.

### 9. Há drift de manifesto em dependências visuais

Os átomos de motion usam `framer-motion`, por exemplo:
- [MotionButton.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/components/atoms/MotionButton.tsx)
- [FadeIn.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/components/atoms/FadeIn.tsx)
- [BrandLogo.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/components/atoms/BrandLogo.tsx)

Mas essa dependência não aparece no [package.json](/D:/MINI-PROJETOS-AIOX/brand-ops/package.json), embora exista instalada no lockfile/node_modules. Isso é um problema de consistência do projeto e deve entrar no plano.

---

## Falhas do Plano Antigo

### Falha 1: começa pela troca visual antes de resolver a IA

Antes de mexer em `ProjectCard`, `ViewToggle` e `GlobalTopBar`, é preciso decidir:
- qual é a superfície canônica da biblioteca de mídia?
- a Creative Library continuará em `/creative-library`?
- ou ela será absorvida em `/projeto/[id]/media`?
- ou haverá um componente compartilhado que atende os dois contextos?

Sem isso, o time pode refatorar componentes do fluxo de projeto e continuar com a biblioteca principal fora da arquitetura.

### Falha 2: não diferencia “reuso de componente” de “reuso de fluxo”

Reusar `DialogShell` e `StatusNotice` é bom, mas o maior reaproveitamento ignorado é:
- a própria **estrutura funcional da Creative Library**
- seus padrões de loading, erro, painel lateral, filtros, indicadores e upload

### Falha 3: trata a home como centro do produto, mas ela hoje é só um hub incompleto

A home atual virou um seletor de projetos, enquanto:
- a Creative Library está madura
- as páginas por projeto ainda são majoritariamente placeholders

Então o plano precisa fortalecer o **fluxo entre hub -> projeto -> biblioteca**, não apenas redesenhar a home isoladamente.

### Falha 4: assume que todos os componentes “existentes” estão prontos para adoção ampla

Nem todos estão prontos:
- alguns dependem de classes globais ainda não definidas
- alguns vivem só no laboratório visual
- alguns ainda não foram absorvidos no fluxo real

### Falha 5: não tem uma etapa formal de reconciliação wireframe x código

Esse é hoje o principal gap de processo. O wireframe novo foi criado sem considerar superfícies já implementadas. O plano precisa obrigatoriamente começar por essa reconciliação.

---

## Princípios para o Plano Novo

1. **O código real tem precedência sobre o wireframe novo**, até que a divergência seja explicitamente resolvida.
2. **A Creative Library deve ser tratada como ativo estratégico já implementado**, não como inspiração visual.
3. **Nenhuma refatoração de UI deve duplicar um fluxo já funcional.**
4. **Primeiro resolver arquitetura e contexto; depois padronizar visual.**
5. **Design-system repo-first:** classes semânticas, atoms, molecules e organisms devem ser absorvidos pelas telas reais, não só pelo laboratório.

---

## Plano Revisado

## Fase 0 - Reconciliação Wireframe x Código

### Objetivo
Criar uma verdade operacional única entre o wireframe novo e o que já existe implementado.

### Entregas
- matriz `wireframe -> rota atual -> componente atual -> decisão`
- definição da superfície canônica para:
  - hub de projetos
  - shell de projeto
  - biblioteca de mídia
  - config de marca
  - estados de sync/feedback

### Decisões que precisam sair desta fase
- se [creative-library.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/pages/creative-library.tsx) continua como rota independente
- ou se a biblioteca será internalizada em `/projeto/[id]/media`
- ou se criaremos um `CreativeLibraryWorkspace` compartilhado entre ambas

### Critério de saída
Nenhuma refatoração visual começa antes da decisão de IA e ownership da Creative Library.

---

## Fase 1 - Restaurar a fundação do design-system

### Objetivo
Fazer o CSS semântico acompanhar as classes já usadas no app.

### Ações
- completar [globals.css](/D:/MINI-PROJETOS-AIOX/brand-ops/src/styles/globals.css) com as classes semânticas que o app já usa
- revisar aliases de [tailwind.config.js](/D:/MINI-PROJETOS-AIOX/brand-ops/tailwind.config.js)
- adicionar variáveis faltantes como `--surface-subtle`
- validar se classes do laboratório visual devem continuar como padrão real ou ficar restritas ao pattern lab

### Observação
Aqui o plano antigo estava correto, mas precisa ser ampliado para cobrir também:
- `desktop-*`
- `workspace-*`
- `summary-pill`
- classes de glass usadas em [design-system.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/pages/design-system.tsx) e [creative-library.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/pages/creative-library.tsx)

---

## Fase 2 - Corrigir o fluxo de projeto e navegação

### Objetivo
Eliminar quebras funcionais antes do restyling.

### Ações P0
- trocar `window.location.href` por `router.push` + `setActiveProjectId` em [index.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/pages/index.tsx)
- alinhar [CreateProjectModal.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/components/Projects/CreateProjectModal.tsx) com `useProjects().createProject`
- remover `fetchProjects()` redundante no `onSuccess` da home se o thunk já atualizar o state
- verificar se a troca de projeto em [GlobalTopBar.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/components/Layout/GlobalTopBar.tsx) mantém contexto de forma coerente

### Critério de saída
- navegação sem reload
- Redux preservado
- criação de projeto fluindo pelo mesmo canal de estado

---

## Fase 3 - Integrar a Creative Library ao produto, não só ao design-system

### Objetivo
Parar de tratar a biblioteca como rota paralela e torná-la parte do fluxo oficial do produto.

### Ações
- decidir a arquitetura final entre:
  - `A` manter `/creative-library` como workspace global
  - `B` mover a experiência para `/projeto/[id]/media`
  - `C` extrair `CreativeLibraryWorkspace` e usar em ambos os contextos com shell apropriado

### Recomendação
Adotar **C**:
- extrair a composição principal da biblioteca para um componente compartilhado
- deixar `/creative-library` como ambiente global/técnico se ainda for necessário
- fazer `/projeto/[id]/media` consumir a mesma experiência em contexto de projeto

### Por quê
Isso preserva o que já foi construído sem duplicar UI e permite o wireframe novo conversar com a realidade do app.

---

## Fase 4 - Migrar a área de Projetos para o design-system real

### Objetivo
Levar a home e o shell de projeto para a mesma linguagem semântica já usada nas superfícies maduras.

### Escopo prioritário
- [index.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/pages/index.tsx)
- [ProjectCard.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/components/Projects/ProjectCard.tsx)
- [ProjectListRow.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/components/Projects/ProjectListRow.tsx)
- [ViewToggle.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/components/Projects/ViewToggle.tsx)
- [ProjectSearch.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/components/Projects/ProjectSearch.tsx)
- [GlobalTopBar.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/components/Layout/GlobalTopBar.tsx)
- [ProjectNavbar.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/components/Layout/ProjectNavbar.tsx)
- [ProjectLayout.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/components/Layout/ProjectLayout.tsx)
- [SyncStatusFooter.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/components/Projects/SyncStatusFooter.tsx)

### Reuso obrigatório
- `BrandLogo`
- `MotionButton`
- `StatusNotice`
- `DialogShell`
- `FadeIn` onde a motion fizer sentido real

### Regra
Reuso não é obrigatório por vaidade. Só aplicar motion e wrappers quando melhorarem consistência real e não criem mais complexidade do que resolvem.

---

## Fase 5 - Trazer Config e Upload para o mesmo sistema

### Objetivo
Eliminar a sensação de subproduto nas telas de configuração.

### Escopo
- [BrandingForm.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/components/Config/BrandingForm.tsx)
- [config.tsx](/D:/MINI-PROJETOS-AIOX/brand-ops/src/pages/projeto/[id]/config.tsx)

### Ações
- substituir inputs ad hoc por classes semânticas
- reaproveitar `FileUploadInput` apenas se o comportamento servir ao caso de branding
- usar `StatusNotice` para feedback
- usar `Skeleton` para loading real

### Observação
Não forçar `FileUploadInput` se a ergonomia de upload de branding for diferente da ingestão da Creative Library. Primeiro validar aderência de fluxo.

---

## Fase 6 - Fechar drift de manifesto e qualidade

### Ações
- declarar formalmente `framer-motion` em [package.json](/D:/MINI-PROJETOS-AIOX/brand-ops/package.json) se ele continuar fazendo parte do design-system real
- revisar warnings atuais de lint nas superfícies tocadas
- garantir que design-system, home, projeto e creative library compartilhem a mesma base semântica

### Gates
1. `npm run typecheck`
2. `npm run lint`
3. `npm run build`
4. `npm test`

### Meta de qualidade revisada
- zero errors
- warnings aceitáveis apenas se documentados e fora do escopo tocado

---

## Ordem de Execução Revisada

1. **Fase 0** - Reconciliação wireframe x código
2. **Fase 1** - Completar foundation CSS/tokens
3. **Fase 2** - Corrigir navegação e modal de projeto
4. **Fase 3** - Integrar Creative Library à arquitetura do produto
5. **Fase 4** - Migrar hub e shell de projeto para o design-system
6. **Fase 5** - Harmonizar Config e upload
7. **Fase 6** - Fechar manifesto, lint e validação final

---

## Itens que Devem Entrar no Backlog e Não Estavam no Plano Antigo

### P0
- Reconciliação formal entre wireframe novo e rotas já implementadas
- Decisão arquitetural sobre a Creative Library
- Correção de `window.location.href`
- Eliminação do bypass do thunk em `CreateProjectModal`
- Completar classes semânticas realmente usadas no app

### P1
- Migrar hub de projetos para o design-system
- Migrar layout de projeto para tokens semânticos
- Reutilizar `StatusNotice`, `DialogShell`, `BrandLogo`, `MotionButton`
- Conectar a biblioteca real ao contexto de projeto

### P2
- Harmonizar config e forms
- Limpar warnings de lint
- Revisar pattern lab para separar experimento de padrão oficial

---

## Conclusão Operacional

O plano antigo estava correto em apontar duplicação e drift visual, mas estava **incompleto** porque tratava a refatoração como cosmética. O problema real é maior:

- a **Creative Library já existe e é forte**, mas está fora da arquitetura principal do produto
- a **home nova** e o **wireframe novo** não foram reconciliados com o que já existe
- o **design-system repo-first** ainda não foi absorvido pelas superfícies de projeto

Portanto, o plano correto é:
- **primeiro reconciliar arquitetura e superfícies reais**
- **depois padronizar reuso e visual**

Sem isso, qualquer refactor corre o risco de deixar o projeto "bonito", mas ainda inconsistente.
