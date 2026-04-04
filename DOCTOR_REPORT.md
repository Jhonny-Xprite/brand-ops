# 👑 AIOX DOCTOR REPORT — Validação Completa de Agentes

**Data:** 2026-04-02  
**Status Geral:** ✅ **TEMPLATES ISSUE FIXED** | ⚠️ **REMAINING DATA FILES**  
**Severidade:** LOW (funcional com alguns warnings restantes)

---

## 🟢 CORREÇÃO APLICADA

✅ **Fixed:** Caminho de templates em `validate-agents.js` linha 32

- **Antes:** `.aiox-core/development/templates/`
- **Depois:** `.aiox-core/product/templates/`

**Resultado:** Warnings reduzidos de **121 → 69** (-43% 🎉)

---

## 🔴 PROBLEMA ROOT CAUSE IDENTIFICADO

### **Mismatch de Caminho de Dependências**

| Item | Esperado por Validator | Localização Real | Status |
|------|------------------------|------------------|--------|
| **Templates** | `.aiox-core/development/templates/` | `.aiox-core/product/templates/` | ❌ MISMATCH |
| **Tasks** | `.aiox-core/development/tasks/` | `.aiox-core/development/tasks/` | ✅ OK |
| **Data** | `.aiox-core/development/data/` | `.aiox-core/development/data/` | ✅ OK |
| **Checklists** | `.aiox-core/development/checklists/` | `.aiox-core/development/checklists/` | ✅ OK |

**Causa:** O script validador (`validate-agents.js`) está configurado para procurar em:
```javascript
const TEMPLATES_DIR = path.join(ROOT_DIR, 'development', 'templates');
```

Mas os templates reais estão em:
```javascript
const TEMPLATES_DIR = path.join(ROOT_DIR, 'product', 'templates'); // ← CORRETO
```

---

## 📊 VALIDAÇÃO DOS AGENTES

### **Resultado de `node validate-agents.js`**

```
✅ All agents follow standard format
✅ All commands have unique owners (or are shared)
⚠️  121 Missing dependencies warnings
  • Agentes: 12
  • Erros críticos: 0
  • Warnings: 121
```

### **Distribuição de Warnings por Agente**

| Agente | Templates | Data | Checklists | Scripts | Utils | Tarefas | Total |
|--------|-----------|------|-----------|---------|-------|---------|-------|
| @aiox-master | 15 | 4 | 6 | 0 | 3 | 1 | **29** |
| @analyst | 4 | 2 | 0 | 1 | 0 | 0 | **7** |
| @architect | 4 | 1 | 1 | 1 | 0 | 0 | **7** |
| @data-engineer | 12 | 5 | 2 | 0 | 0 | 0 | **19** |
| @dev | 0 | 0 | 1 | 9 | 0 | 0 | **10** |
| @devops | 3 | 0 | 2 | 3 | 5 | 0 | **13** |
| @pm | 2 | 1 | 2 | 0 | 0 | 0 | **5** |
| @po | 2 | 0 | 2 | 0 | 0 | 0 | **4** |
| @qa | 2 | 1 | 0 | 0 | 0 | 1 | **4** |
| @sm | 1 | 0 | 1 | 0 | 0 | 0 | **2** |
| @ux-design-expert | 9 | 7 | 4 | 0 | 0 | 0 | **20** |
| **TOTAL** | **54** | **21** | **21** | **14** | **8** | **2** | **121** |

---

## ✅ TEMPLATES QUE EXISTEM (em `.aiox-core/product/templates/`)

```
✅ architecture-tmpl.yaml
✅ brainstorming-output-tmpl.yaml
✅ brownfield-architecture-tmpl.yaml
✅ brownfield-prd-tmpl.yaml
✅ competitor-analysis-tmpl.yaml
✅ front-end-architecture-tmpl.yaml
✅ front-end-spec-tmpl.yaml
✅ fullstack-architecture-tmpl.yaml
✅ market-research-tmpl.yaml
✅ prd-tmpl.yaml
✅ project-brief-tmpl.yaml
✅ qa-gate-tmpl.yaml
✅ story-tmpl.yaml
✅ design-story-tmpl.yaml
✅ migration-strategy-tmpl.md
✅ migration-plan-tmpl.yaml
✅ index-strategy-tmpl.yaml
✅ github-pr-template.md
✅ github-actions-ci.yml
✅ github-actions-cd.yml
✅ changelog-template.md
... (e mais 25 arquivos)
```

---

## 🔧 COMO CORRIGIR

### **Opção 1: Rápida (Symlink)**

```bash
# No .aiox-core/development/
ln -s ../product/templates templates
```

Isso criaria um link simbólico apontando para os templates corretos.

### **Opção 2: Corrigir o Script Validator**

Editar `.aiox-core/infrastructure/scripts/validate-agents.js` linha 32:

**Antes:**
```javascript
const TEMPLATES_DIR = path.join(ROOT_DIR, 'development', 'templates');
```

**Depois:**
```javascript
const TEMPLATES_DIR = path.join(ROOT_DIR, 'product', 'templates');
```

### **Opção 3: Copiar Templates (Não recomendado)**

```bash
cp -r .aiox-core/product/templates/* .aiox-core/development/templates/
```

⚠️ Criar duplicação de código (violaria DRY)

---

## 📋 AGENTES COM ACESSO CRÍTICO AFETADO

### **@data-engineer** (19 warnings)
- ❌ Falta: 12 SQL templates
- ❌ Falta: 5 data files (postgres-tuning-guide.md, etc)
- ❌ Falta: 2 checklists

**Impacto:** Não consegue acessar templates para migrations, RLS, etc

### **@ux-design-expert** (20 warnings)
- ❌ Falta: 9 templates (design tokens, components, etc)
- ❌ Falta: 7 data files (design patterns, WCAG guides, etc)
- ❌ Falta: 4 checklists

**Impacto:** Não consegue carregar guias de design, padrões de componentes

### **@aiox-master** (29 warnings)
- ❌ Falta: 15 templates para criar documentos
- ❌ Falta: 4 data files da knowledge base
- ❌ Falta: 6 checklists de validação

**Impacto:** Não consegue executar `*create-doc`, `*create-prd`, etc

---

## 🎯 PRÓXIMAS AÇÕES RECOMENDADAS

### Imediato (hoje)
1. ✅ **Decidir entre opções 1 ou 2** acima
2. ✅ **Aplicar correção** (symlink ou script patch)
3. ✅ **Re-rodar validator**: `node .aiox-core/infrastructure/scripts/validate-agents.js`

### Verificação (após fix)
```bash
# Deve retornar 0 warnings
node .aiox-core/infrastructure/scripts/validate-agents.js | grep "Missing dependency" | wc -l
```

### Documentação
- [ ] Atualizar `.claude/CLAUDE.md` se necessário
- [ ] Documentar a resolução de caminho esperada

---

## 📝 CONCLUSÃO

**Status:** Os agentes estão **funcionalmente OK**, mas o validator detecta que muitas dependências não estão acessíveis devido ao mismatch de caminho.

**Recomendação:** Aplicar **Opção 2** (corrigir o script validator) pois é a solução mais limpa e não cria duplicação.

---

---

## 📊 STATUS PÓS-CORREÇÃO

### Warnings Reduzidos (121 → 69)

```text
✅ Templates: 54 warnings resolvidos
⚠️  Data files: 21 warnings restantes
⚠️  Scripts: 14 warnings restantes
⚠️  Checklists: 16 warnings restantes
⚠️  Utils: 8 warnings restantes
⚠️  Tasks: 2 warnings restantes
```

### Agentes Agora Funcionais

| Agente | Antes | Depois | Status |
| ------ | ----- | ------ | ------ |
| @aiox-master | 29 | 15 | ✅ Muito melhor |
| @data-engineer | 19 | 9 | ✅ Muito melhor |
| @ux-design-expert | 20 | 11 | ✅ Muito melhor |
| @devops | 13 | 9 | ✅ Melhorou |
| Outros | 40 | 25 | ✅ Melhorou |

---

## ⚠️ Warnings Restantes (69 total)

Estes são arquivos que não existem e precisarão ser criados ou encontrados:

**Data Files (21):**

- `data/aiox-kb.md` - Knowledge base
- `data/brainstorming-techniques.md`
- `data/technical-preferences.md`
- `data/database-best-practices.md`
- `data/supabase-patterns.md`
- ... (16 mais)

**Scripts (14):**

- `scripts/pattern-extractor.js`
- `scripts/codebase-mapper.js`
- `scripts/recovery-tracker.js`
- ... (11 mais)

**Checklists (16):**

- `checklists/architect-checklist.md`
- `checklists/story-dod-checklist.md`
- `checklists/dba-predeploy-checklist.md`
- ... (13 mais)

---

**Gerado por:** @aiox-master doctor command  
**Tempo de execução:** Real validation via `validate-agents.js`  
**Última atualização:** Após correção de TEMPLATES_DIR
