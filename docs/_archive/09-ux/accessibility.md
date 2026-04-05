# Acessibilidade de Elite: Manual de Alcance de Comando

**Estrategista**: Uma (Sally + Brad Frost Hybrid)  
**Status**: Conformidade WCAG AA Nativa  
**Objetivo**: Soberania Inclusiva

---

## ♿ Princípios da Inclusão Tática

Brand-Ops não é apenas para quem vê; é para quem **comanda**. Um sistema de elite deve estar disponível para todos os guerreiros, independente de suas capacidades sensoriais.

### 1. Percepção Robusta (Contrast & Color)
- **Contraste Mínimo (4.5:1)**: O texto soberano sobre o fundo Midnight Navy deve sempre atingir 7:1 (nível AAA quando possível).
- **Não Confie Apenas na Cor**: Erros, sucessos e avisos de sistema devem ser acompanhados de ícones e mensagens de texto claras. Ninguém deve adivinhar o comando.

### 2. Navegação por Foco (Sovereign Keyboard)
O cockpit deve ser operável 100% via teclado.
- **Shortcuts de Elite**: 
    - `Alt + 1`: Foco na Busca.
    - `Alt + 2`: Foco na Galeria.
    - `Esc`: Limpa comandos e fecha modais.
- **Visible Focus**: Todo componente focado deve ter o anel de destaque em `brand-primary` (#9333EA).

### 3. Semântica de Comando (ARIA Roles)
Use o HTML semântico como fundação.
- **Botões**: Devem ser `<button type="button">`, nunca `<div>`.
- **Regiões**: Use `<main>`, `<nav>`, `<section>` e `<aside>` para que leitores de tela entendam a arquitetura atômica instantaneamente.
- **Labels**: Inputs devem ter `<label>` explícitos ou `aria-label` descritivos.

---

## 📋 Checklist de Qualidade UX

Antes de considerar um componente como "Pronto para Comando", ele deve passar por:

- [ ] Contraste verificado (AA).
- [ ] Operável com teclado (Tab, Enter, Space).
- [ ] Leitor de tela anuncia o estado (Expanded, Selected, Disabled).
- [ ] Animações não causam náusea (Motion-safe).

---

> [!TIP]
> **Dica de Uma**: "Acessibilidade não é um 'check' no final do projeto. É a garantia de que o comando nunca falhará por falta de clareza."

---

— Uma, desenhando com empatia e alcance 💝
