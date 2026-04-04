# Protocolo de Nomenclatura: A Lei da Ordem

**Estrategista**: Michael Johnson (@michael-johnson) & Morgan (PM)  
**Status**: Protocolo Ativo  
**Alinhamento**: PRD v1.0.0 (Epic 6: Database Schema)

---

## 🔱 O Fim da Anarquia

Arquivos sem nome são ativos sem dono. No Brand-Ops, cada caractere no nome de um arquivo deve servir ao **Comando Estratégico**. Banimos o "final_v2", o "logo_copia" e o "criativo_teste".

### A Fórmula de Comando (O Zag)
Todos os ativos devem seguir rigorosamente esta estrutura sintática:

`[DATA]_[PRODUTO]_[CAMPANHA]_[PUBLICO]_[FORMATO]_[STATUS]_[VERSAO].[ext]`

---

## 🧩 Detalhamento dos Componentes (Mapping PRD)

| Componente | Regra de Nomeação | Exemplo | Mapping DB (Epic 6) |
| :--- | :--- | :--- | :--- |
| **DATA** | `YYMMDD` (Data de criação/major update) | `260404` | `createdAt` |
| **PRODUTO** | Code-name curto do Produto (3-5 letras) | `MENTOR` | `Strategy Table: Product` |
| **CAMPANHA** | Identificador da Campanha (sem espaços) | `BF26` | `Metadata: campaign` |
| **PÚBLICO** | Sigla do Público-alvo (Briefing) | `EMP45` | `Metadata: targetAudience` |
| **FORMATO** | Nome padrão do PRD (Brief, página 248) | `REELS` | `Metadata: format` |
| **STATUS** | `DR` (Draft), `AP` (Approved), `DO` (Done) | `AP` | `Creative: status` |
| **VERSÃO** | `v` + 2 dígitos | `v01` | `Version: versionNumber` |

---

## 🚫 Exemplos: Anarquia vs. Comando

| O Caos (Como era) | O Comando (Como deve ser) |
| :--- | :--- |
| `video_vsl_final_2.mp4` | `260404_MENTOR_BF26_EMP45_WIDE_DO_v02.mp4` |
| `post_insta_mentoria.jpg` | `260404_MENTOR_INSTA_EMP30_SQUARE_AP_v01.jpg` |
| `logo_preto_transparente.png` | `260404_BRAND_CORE_LOGO_H_DARK_DO_v01.png` |

---

## 📐 Regras de Integridade (Protocolo de Segurança)

1.  **Sem Espaços**: Use apenas `_` (underscore). O sistema não aceita vácuo estratégico.
2.  **Case Sensitive**: Use sempre **MAIÚSCULAS** para os identificadores estratégicos.
3.  **Proibições**:
    *   ❌ Proibido usar "FINAL", "CADASTRADO", "OK".
    *   ❌ Proibido usar caracteres especiais (ç, á, é, etc).
4.  **Extensões**: Devem ser mantidas conforme o arquivo original (materiais editáveis x materiais finais).

---

## 🛠️ Guia de Migração (Anarchy -> Order)

Se você encontrar um arquivo no "Caos", siga este checklist antes de ingeri-lo no Brand-Ops:
1.  Identifique o **Produto** e a **Oferta** no `Strategy Library`.
2.  Verifique a **Campanha** ativa no PRD.
3.  Renomeie localmente seguindo a **Fórmula de Comando**.
4.  Arraste para o cockpit do Brand-Ops.

---

> [!CAUTION]
> **Punição de Sistema**: Arquivos que não seguirem este protocolo devem ser recusados pela @qa (Quinn) e retornados para o executivo. No Brand-Ops, a ordem não é uma sugestão; é o sistema operacional da marca.
