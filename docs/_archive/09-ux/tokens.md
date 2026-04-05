# Design Tokens: O Sistema de Especialização Tática

**Estrategista**: Uma (Sally + Brad Frost Hybrid)  
**Status**: Tokens de Soberania Extraídos  
**Objetivo**: Zero Hardcoded Values

---

## 🎨 Paleta de Soberania (Midnight Purple & Amber)

Nossos tokens de cor são baseados na psicologia da **Ação e Mistério**.

| Token | Valor (HEX) | Uso Funcional | Emoção Estratégica |
| :--- | :--- | :--- | :--- |
| **`brand-primary`** | `#9333EA` | Ação principal, bordas de foco. | Alquimia de Dados. |
| **`brand-accent`** | `#FBBF24` | Alertas críticos, contrastes de elite. | Urgência Criativa. |
| **`surface-canvas`** | `#0F172A` | Fundo principal da interface. | Estabilidade e Profundidade. |
| **`surface-panel`** | `#1A1F35` | Painéis, modais e containers. | Contexto e Proteção. |
| **`text-sovereign`** | `#F1F5F9` | Títulos e textos de alta importância. | Clareza e Comando. |
| **`text-subtle`** | `#94A3B8` | Metadados e textos de apoio. | Neutralidade Técnica. |

---

## ✍️ Tipografia de Comando

| Escala | Token | Font Family | Estilo | Uso |
| :--- | :--- | :--- | :--- | :--- |
| **H1 - Grandeza** | `text-4xl` | **Sora** | Bold, tracking -0.02em | Títulos de Cockpit. |
| **H2 - Seção** | `text-2xl` | **Sora** | Semi-bold | Títulos de Organismos. |
| **P - Corpo** | `text-base` | **Inter** | Regular | Descrição de Criativos. |
| **Code - Dados** | `text-xs` | **Fira Code** | Monospaced | Nomenclatura e IDs. |

---

## 📏 Espaçamento e Bordas (Tactical Grid)

Baseados no sistema de 4px (Base 4).

- **`radius-sovereign`**: `1.5rem` (24px) — Curvas agressivas para suavizar a rigidez técnica.
- **`spacing-command`**: `2rem` (32px) — Respiro necessário entre grandes componentes de UI.
- **`spacing-tight`**: `0.5rem` (8px) — Distância mínima entre átomos em uma molécula.

---

> [!IMPORTANT]
> **Extensão Técnica**: Estes tokens devem ser consumidos via **Tailwind CSS** ou **CSS Variables**. No Brand-Ops, nunca use `color: #ffffff`. Use sempre `color: var(--text-sovereign)`.

---

— Uma, desenhando com empatia e precisão 🛡️
