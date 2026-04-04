# AGENTS.md - Synkra AIOX (Codex CLI)

Este arquivo define as instrucoes do projeto para o Codex CLI.

<!-- AIOX-MANAGED-START: core -->
## Core Rules

1. Siga a Constitution em `.aiox-core/constitution.md`
2. Priorize `CLI First -> Observability Second -> UI Third`
3. Trabalhe por stories em `docs/stories/`
4. Nao invente requisitos fora dos artefatos existentes
<!-- AIOX-MANAGED-END: core -->

<!-- AIOX-MANAGED-START: quality -->
## Quality Gates

- Rode `npm run lint`
- Rode `npm run typecheck`
- Rode `npm test`
- Atualize checklist e file list da story antes de concluir
<!-- AIOX-MANAGED-END: quality -->

<!-- AIOX-MANAGED-START: codebase -->
## Project Map

- Core framework: `.aiox-core/`
- CLI entrypoints: `bin/`
- Shared packages: `packages/`
- Tests: `tests/`
- Docs: `docs/`
<!-- AIOX-MANAGED-END: codebase -->

<!-- AIOX-MANAGED-START: commands -->
## Common Commands

- `npm run sync:ide`
- `npm run sync:ide:check`
- `npm run sync:skills:codex`
- `npm run sync:skills:codex:global` (opcional; neste repo o padrao e local-first)
- `npm run validate:structure`
- `npm run validate:agents`
<!-- AIOX-MANAGED-END: commands -->

<!-- AIOX-MANAGED-START: shortcuts -->
## Agent Shortcuts

Preferencia de ativacao no Codex CLI:
1. Use `/skills` e selecione `aiox-<agent-id>` vindo de `.codex/skills` (ex.: `aiox-architect`)
2. Se preferir, use os atalhos abaixo (`@architect`, `/architect`, etc.)

Interprete os atalhos abaixo carregando o arquivo correspondente em `.aiox-core/development/agents/` (fallback: `.codex/agents/`), renderize o greeting via `generate-greeting.js` e assuma a persona ate `*exit`:

- `@architect`, `/architect`, `/architect.md` -> `.aiox-core/development/agents/architect.md`
- `@dev`, `/dev`, `/dev.md` -> `.aiox-core/development/agents/dev.md`
- `@qa`, `/qa`, `/qa.md` -> `.aiox-core/development/agents/qa.md`
- `@pm`, `/pm`, `/pm.md` -> `.aiox-core/development/agents/pm.md`
- `@po`, `/po`, `/po.md` -> `.aiox-core/development/agents/po.md`
- `@sm`, `/sm`, `/sm.md` -> `.aiox-core/development/agents/sm.md`
- `@analyst`, `/analyst`, `/analyst.md` -> `.aiox-core/development/agents/analyst.md`
- `@devops`, `/devops`, `/devops.md` -> `.aiox-core/development/agents/devops.md`
- `@data-engineer`, `/data-engineer`, `/data-engineer.md` -> `.aiox-core/development/agents/data-engineer.md`
- `@ux-design-expert`, `/ux-design-expert`, `/ux-design-expert.md` -> `.aiox-core/development/agents/ux-design-expert.md`
- `@squad-creator`, `/squad-creator`, `/squad-creator.md` -> `.aiox-core/development/agents/squad-creator.md`
- `@aiox-master`, `/aiox-master`, `/aiox-master.md` -> `.aiox-core/development/agents/aiox-master.md`

### Apex Design Squad (ApexDesign-Squad)
- `@apex-lead` -> `.aiox-core/development/agents/apex-lead.md`
- `@css-eng` -> `.aiox-core/development/agents/css-eng.md`
- `@react-eng` -> `.aiox-core/development/agents/react-eng.md`
- `@interaction-dsgn` -> `.aiox-core/development/agents/interaction-dsgn.md`
- `@perf-eng` -> `.aiox-core/development/agents/perf-eng.md`
- `@a11y-eng` -> `.aiox-core/development/agents/a11y-eng.md`
- `@motion-eng` -> `.aiox-core/development/agents/motion-eng.md`
- `@frontend-arch` -> `.aiox-core/development/agents/frontend-arch.md`
- `@mobile-eng` -> `.aiox-core/development/agents/mobile-eng.md`
- `@spatial-eng` -> `.aiox-core/development/agents/spatial-eng.md`
- `@cross-plat-eng` -> `.aiox-core/development/agents/cross-plat-eng.md`
- `@qa-visual` -> `.aiox-core/development/agents/qa-visual.md`
- `@qa-xplatform` -> `.aiox-core/development/agents/qa-xplatform.md`

### Brand Strategy Squad (brand-squad)
- `@brand-chief` -> `.aiox-core/development/agents/brand-chief.md`
- `@marty-neumeier` -> `.aiox-core/development/agents/marty-neumeier.md`
- `@april-dunford` -> `.aiox-core/development/agents/april-dunford.md`
- `@sagi-haviv` -> `.aiox-core/development/agents/sagi-haviv.md`
- `@alexandra-watkins` -> `.aiox-core/development/agents/alexandra-watkins.md`
- `@emily-heyward` -> `.aiox-core/development/agents/emily-heyward.md`
- `@michael-johnson` -> `.aiox-core/development/agents/michael-johnson.md`
- `@thiago_finch` -> `.aiox-core/development/agents/thiago_finch.md`
- `@pedro-valerio` -> `.aiox-core/development/agents/pedro-valerio.md`
- `@squad-chief` -> `.aiox-core/development/agents/squad-chief.md`
- `@web-intel` -> `.aiox-core/development/agents/web-intel.md`
<!-- AIOX-MANAGED-END: shortcuts -->
