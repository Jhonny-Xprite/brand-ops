# AIOX Brand Operations

Synkra AIOX — Sistema Orquestrado por IA para Desenvolvimento Full Stack

## 🚀 Início Rápido

### Estrutura do Projeto

```
brand-ops/
├── .aiox-core/          # Framework AIOX (não modificar L1-L2)
├── .claude/             # Configuração Claude Code
├── docs/                # Documentação do projeto
│   ├── stories/         # User stories (Story Development Cycle)
│   ├── prd/             # Product Requirement Documents
│   ├── architecture/    # Arquitetura técnica
│   └── guides/          # Guias de uso
├── packages/            # Pacotes e módulos do projeto
├── squads/              # Equipes e organização
├── tests/               # Testes automatizados
├── qa/                  # Relatórios QA
└── .env                 # Variáveis de ambiente
```

## 🎯 Comandos Essenciais

### Validar Ambiente

```bash
node bin/aiox.js doctor     # Diagnóstico completo
node bin/aiox.js validate   # Validar estrutura
```

### Agentes Disponíveis

| Agente | Persona | Função |
|--------|---------|--------|
| `@aiox-master` | Orion | Orquestrador - Usa para meta-operações |
| `@dev` | Dex | Implementação de código |
| `@qa` | Quinn | Testes e qualidade |
| `@architect` | Aria | Arquitetura e design |
| `@pm` | Morgan | Product Management |
| `@po` | Pax | Product Owner |
| `@sm` | River | Scrum Master |
| `@analyst` | Alex | Pesquisa e análise |
| `@data-engineer` | Dara | Design de banco de dados |
| `@devops` | Gage | CI/CD e git push (EXCLUSIVO) |

### Workflow Padrão

1. **Criar Story** → `@sm` ou `@pm` com `*create-story`
2. **Validar Story** → `@po` com `*validate-story-draft`
3. **Implementar** → `@dev` com `*develop`
4. **QA Gate** → `@qa` com `*qa-gate`
5. **Push** → `@devops` com `*push`

## 📋 Princípios AIOX

### Constitution (Inegociável)

| Artigo | Princípio | Severidade |
|--------|-----------|------------|
| I | CLI First | NON-NEGOTIABLE |
| II | Agent Authority | NON-NEGOTIABLE |
| III | Story-Driven Development | MUST |
| IV | No Invention | MUST |
| V | Quality First | MUST |
| VI | Absolute Imports | SHOULD |

### Authority Matrix

**Operações Exclusivas:**

- `git push` → **@devops ONLY**
- `gh pr create` → **@devops ONLY**
- Story creation → **@sm, @po**
- Architecture decisions → **@architect**
- Quality verdicts → **@qa**

## 📚 Documentação

- **Framework**: `.aiox-core/constitution.md`
- **Regras**: `.claude/rules/`
- **Agentes**: `.aiox-core/development/agents/`
- **Tasks**: `.aiox-core/development/tasks/` (204 tasks disponíveis)
- **Workflows**: `.aiox-core/development/workflows/` (15 workflows)
- **Templates**: `.aiox-core/development/templates/` (11 templates)

## 🔧 Configuração

### .env

Arquivo de configuração com:
- Credenciais Supabase
- API Keys (Anthropic, OpenAI, Google, etc.)
- Servidores MCP
- Tokens GitHub, Plane, etc.

```bash
# Carregar variáveis
source .env
```

### .claude/CLAUDE.md

Instruções específicas do projeto para Claude Code. Segue a Constitution.

### .claude/rules/

Regras contextuais carregadas automaticamente pelo Claude Code.

## 🏗️ Estrutura de Camadas

**L1 - Framework Core** (NEVER modify)
- `.aiox-core/core/`
- `.aiox-core/constitution.md`
- `bin/aiox.js`, `bin/aiox-init.js`

**L2 - Framework Templates** (NEVER modify - extend-only)
- `.aiox-core/development/tasks/`
- `.aiox-core/development/templates/`
- `.aiox-core/development/checklists/`
- `.aiox-core/development/workflows/`

**L3 - Project Config** (Mutable com allow rules)
- `.aiox-core/data/`
- `agents/*/MEMORY.md`
- `core-config.yaml`

**L4 - Project Runtime** (ALWAYS modify)
- `docs/stories/`
- `packages/`
- `squads/`
- `tests/`

## 📞 Suporte

Para ajuda com Claude Code:
- `/help` - Ajuda do Claude Code
- `*help` - Ajuda do agente ativo
- `*guide` - Guia completo do agente

Para reporte de bugs:
- GitHub: https://github.com/anthropics/claude-code/issues

---

**Version**: 2.0.0  
**Last Updated**: 2025-04-02  
**Framework**: Synkra AIOX v2.0.0
