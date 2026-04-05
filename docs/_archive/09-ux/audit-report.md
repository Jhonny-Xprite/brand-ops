# Relatório de Auditoria de UI: O Show de Horrores (Shock Report)

**Auditor**: Brad (Design System Architect)  
**Status**: Auditoria Crítica Concluída  
**Alvo**: `./src`

---

## 📊 Métricas de Caos (The Redundancy Factor)

| Categoria | Achados | Redundância | Status |
| :--- | :--- | :--- | :--- |
| **Botões** | 28 instâncias | **28x** | 🔴 Crítico |
| **Cores (Hex)** | 7 valores únicos | **3.5x** | 🟡 Pixel Drift |
| **Arquitetura** | 20 TSX / 1 CSS | **1.2x** | 🟢 Estável |

---

## 🔍 Descobertas Críticas (Os "Gargalos" de Soberania)

### 1. Desconexão Componente-CSS (Morte Súbita)
- **O Problema**: O novo átomo `MotionButton.tsx` e componentes como `MetadataForm.tsx` tentam usar a classe `btn-primary`.
- **A Realidade**: No `globals.css`, a classe foi renomeada para `btn-premium-primary`.
- **Resultado**: Os botões principais do sistema estão perdendo a estilização estratégica de "Comando".

### 2. O Fenômeno do "Pixel Drift" (Deriva de Cor)
Encontramos cores "fantasmas" que não pertencem ao Brand Core:
- `#7E22CE` (Purple-700) e `#D97706` (Amber-700) estão hardcoded no CSS mas não estão mapeados no `tokens.md`.
- O sistema está usando variáveis CSS (`--background`) mas redeclara `@apply bg-[#0F172A]` logo abaixo. Isso gera conflito de manutenção.

### 3. Terminology Debt (Dívida de Linguagem)
- Encontramos `FileUploadInput.tsx` e referências a "upload" no UI text.
- **Protocolo de Comando**: Devemos migrar para **"Ingestão"** ou **"Comando de Ativos"**.

---

## 🛠️ Recomendações de Brad

1.  **Sincronização Imediata**: Renomear `.btn-premium-primary` para `.btn-primary` (e o mesmo para accent) para reativar o `MotionButton`.
2.  **Migração Atômica**: Substituir todas as 28 instâncias de `<button>` e `className="btn-..."` pelo componente `<MotionButton />`.
3.  **Purge de Hex**: Mover todos os hexes do `globals.css` para as variáveis do `:root` e usar apenas as referências de variável.

---

> [!CAUTION]
> **Risco de Escala**: Continuar a implementação com esta redundância de 28x nos botões fará com que qualquer mudança de design (ex: arredondar bordas) leve horas em vez de segundos. A Lei da Ordem está sendo violada.
