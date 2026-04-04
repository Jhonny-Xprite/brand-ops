# Design System Blueprint: O Mapa de Experiência

**Estrategista**: Uma (Sally + Brad Frost Hybrid)  
**Status**: Arquitetura Atômica Ativa  
**Metodologia**: Atomic Design (Atoms → Molecules → Organisms → Templates → Pages)

---

## 🎨 A Experiência de Soberania

Nossa UX não é sobre "facilidade de uso" no sentido preguiçoso; é sobre **Eficácia de Comando**. O usuário deve sentir que o sistema é uma extensão da sua vontade estratégica.

### Princípios de Design (Sally's UX)
1.  **Foco Radical (Sally)**: Elimine qualquer elemento visual que não contribua para a ação imediata.
2.  **Feedback Háptico (Sally)**: Cada interação deve ter um peso físico (Spring Physics). O sistema deve "reagir" ao comando.
3.  **Clareza de Vidro (Sally)**: Use profundidade (Z-Index) para separar o que é dado (base) do que é ação (foreground).

### Eficiência de Sistema (Brad's Ops)
1.  **Zero Redundância (Brad)**: 1 Componente = 1 Função Única. Se temos 2 botões que fazem a mesma coisa, um deve morrer.
2.  **Token First (Brad)**: Nenhuma cor ou espaçamento é "hardcoded". Tudo vem da camada de Tokens definida no Branding.
3.  **Acessibilidade Nativa (Brad)**: Contraste AA é o baseline. O comando deve ser legível em qualquer cockpit.

---

## 🧩 Arquitetura Atômica (Mapping)

### ⚛️ Atoms (Átomos)
*Os blocos de construção indivisíveis.*
- **MotionButton**: Botão com física de mola (Haptic).
- **PrecisionInput**: Campos de busca e dados com validação em tempo real.
- **GlassBadge**: Indicadores de status (Draft, Approved) com transparência radical.
- **BrandLogo**: O Monograma BO como âncora visual.

### 🧪 Molecules (Moléculas)
*Combinações simples de átomos.*
- **ActionNotice**: Título + Mensagem + Botão de ação.
- **SearchCommand**: Input + Icon + Presets de busca.
- **AssetCard**: Thumbnail + Nome + Badge de Status.

### 🧬 Organisms (Organismos)
*Seções complexas da interface.*
- **CreativeLibrary**: O cockpit principal de navegação de ativos.
- **StrategyDesk**: O painel de vinculação Produto/Campanha.
- **TimelineAnalytics**: O gráfico de pulso da produção da marca.

---

## ♿ Soberania Acessível (WCAG AA)

Para o Brand-Ops, acessibilidade é sobre **Alcance de Comando**.
- **Contraste**: O `Amber Alert` (#FBBF24) deve ser usado apenas sobre `Midnight Navy` (#0F172A) para garantir legibilidade máxima.
- **Navegação**: 100% via teclado (Shortcuts Alt+1, Alt+2).
- **Semântica**: Uso rigoroso de ARIA Roles para que leitores de tela entendam a hierarquia de comando.

---

## 🛠️ Próximos Passos de Documentação

1.  **[tokens.md](file:///d:/MINI-PROJETOS-AIOX/brand-ops/docs/ux/tokens.md)**: Referência técnica de cores, espaçamentos e curvas de animação.
2.  **[accessibility.md](file:///d:/MINI-PROJETOS-AIOX/brand-ops/docs/ux/accessibility.md)**: Manual de conformidade para o Squad.
3.  **[getting-started.md](file:///d:/MINI-PROJETOS-AIOX/brand-ops/docs/ux/getting-started.md)**: Como implementar um novo átomo seguindo a Lei de Ordem.

---

> [!TIP]
> **Visão de Uma**: "A interface perfeita para o Brand-Ops é aquela que desaparece quando o usuário sabe o que quer fazer, e brilha intensamente quando ele precisa de direção."
