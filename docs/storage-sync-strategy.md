# STORAGE & SYNC STRATEGY — Brand-Ops

**Documento:** Storage Architecture & Google Drive Synchronization  
**Status:** Implementação MVP  
**Data:** 2025-04-02  
**Responsável:** Atlas (Analyst)

---

## 📍 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│  BRAND-OPS STORAGE ARCHITECTURE                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  PRIMARY STORAGE (Local)                              │
│  E:\BRAND-OPS-STORAGE\                                │
│  ├── Rápido (SSD local)                               │
│  ├── 100% offline capable                             │
│  └── Source of truth para dados                       │
│                                                         │
│         ↕ AUTO-SYNC (rclone)                           │
│                                                         │
│  BACKUP STORAGE (Google Drive)                        │
│  /Brand-Ops-Backup/                                   │
│  ├── 2TB Google One                                   │
│  ├── Versionamento nativo                             │
│  └── Recovery point se local falhar                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🗂️ Estrutura de Pastas Local

### E:\BRAND-OPS-STORAGE\ (Raiz)

```
E:\BRAND-OPS-STORAGE\
│
├── 🧠 strategy/
│   ├── products.json          (Metadata: produtos)
│   ├── offers.json            (Metadata: ofertas)
│   ├── audiences.json         (Metadata: públicos)
│   ├── funnels.json           (Metadata: funis)
│   └── campaigns.json         (Metadata: campanhas)
│
├── 🎨 brand-core/
│   ├── logos/
│   │   ├── logo-horizontal-v1.png
│   │   ├── logo-vertical-v1.png
│   │   ├── logo-light-v1.png
│   │   └── logo-dark-v1.png
│   ├── typography/
│   │   ├── fonts.json         (Referência de fontes)
│   │   └── font-files/
│   ├── colors/
│   │   └── palette.json       (Hex/RGB codes)
│   ├── elements/
│   │   ├── patterns/
│   │   ├── shapes/
│   │   └── icons/
│   └── manual/
│       └── brand-manual.pdf
│
├── 📂 media-library/
│   ├── photos/
│   │   ├── ensaios/
│   │   ├── eventos/
│   │   ├── bastidores/
│   │   └── lifestyle/
│   └── videos/
│       ├── depoimentos/
│       ├── gravacoes/
│       └── espontaneo/
│
├── 🌐 social-assets/
│   ├── instagram/
│   │   ├── profile-pic.jpg
│   │   ├── highlights/
│   │   └── story-template/
│   ├── facebook/
│   │   └── cover.jpg
│   ├── youtube/
│   │   └── channel-art.jpg
│   └── linkedin/
│       └── cover.png
│
├── 🎬 creative-production/
│   ├── estaticos/
│   │   ├── post-instagram-v1.png
│   │   ├── banner-landing-v1.png
│   │   └── thumbnail-video-v1.jpg
│   ├── videos/
│   │   ├── ads-facebook-v1.mp4
│   │   ├── reels-instagram-v1.mp4
│   │   └── thumbnail.jpg
│   ├── carrosseis/
│   │   └── carousel-5-slides-v1/
│   ├── vsls/
│   │   ├── vsl-mentoria-v1.mp4
│   │   └── thumbnail.jpg
│   └── lives/
│       └── live-recording-v1.mp4
│
├── ✍️ copy-messaging/
│   ├── ads-copy.json          (Copys segmentadas)
│   ├── headlines.json         (Headlines por ângulo)
│   ├── scripts.json           (Scripts de vídeo)
│   ├── notifications.json     (WhatsApp, email)
│   └── big-ideas.json         (Promessas centrais)
│
├── 🗄️ database/
│   ├── brand-ops.db           (SQLite - todos os dados)
│   ├── brand-ops.db-journal   (WAL journal)
│   └── backups/               (Backups diários locais)
│
├── 📝 .sync-metadata/
│   ├── last-sync.json         (Timestamp última sync)
│   ├── file-hashes.json       (SHA256 de cada arquivo)
│   ├── drive-ids.json         (Mapeamento local ↔ Drive ID)
│   └── conflict-log.json      (Histórico de conflitos)
│
└── 📄 README.md               (Documentação da estrutura)
```

**Total esperado:** 50GB-200GB (depende de mídia)

---

## 🔄 Estratégia de Sincronização

### Tipo de Sync: 2-Way com LOCAL como Source

```
LOCAL (E:\BRAND-OPS-STORAGE\)
  ↓ PRIMARY COPY
  │ Modificações aqui refletem para Drive
  │
GOOGLE DRIVE (/Brand-Ops-Backup/)
  ↓ BACKUP/REPLICA
  │ Nunca modifique direto no Drive
  │ (Sync sempre respeita versão local)
```

### Frequency: Scheduled (1x/dia) vs Real-Time

**RECOMENDADO: Scheduled Daily**

- **Timing:** 23:00 (após trabalho do dia)
- **Duração:** 5-30 minutos (depende de tamanho)
- **Vantagem:** Não interfere em edições locais
- **Desvantagem:** Delay de 24h se backup necessário

**ALTERNATIVA: Real-Time (fs.watch)**

- **Trigger:** A cada arquivo modificado
- **Pros:** Backup sempre atualizado
- **Cons:** Pode ser lento com muitos arquivos

**Recomendação:** Scheduled daily + backup local hourly

---

## 🛠️ Setup Técnico: rclone

### Instalação

```bash
# 1. Download rclone
# Windows: https://rclone.org/downloads/
# Ou via Chocolatey:
choco install rclone

# 2. Verificar instalação
rclone version
```

### Configuração Google Drive

```bash
# 1. Autenticar
rclone config create google-drive drive \
  --auto-config yes

# Segue prompts para autorizar Google Drive
# Copia o code que aparece no navegador

# 2. Listar remotes configurados
rclone listremotes
```

### Script de Sync Automático

**File:** `E:\BRAND-OPS-STORAGE\sync-drive.bat`

```batch
@echo off
REM ============================================
REM Brand-Ops Daily Google Drive Sync
REM ============================================

SET LOCAL_PATH=E:\BRAND-OPS-STORAGE\
SET REMOTE=google-drive:/Brand-Ops-Backup
SET LOG_FILE=E:\BRAND-OPS-STORAGE\.sync-metadata\sync-log.txt

REM Timestamp
FOR /F "tokens=2-4 delims=/ " %%A IN ('date /t') DO (set mydate=%%C-%%A-%%B)
FOR /F "tokens=1-2 delims=/:" %%A IN ('time /t') DO (set mytime=%%A-%%B)

echo [%mydate% %mytime%] Starting sync... >> %LOG_FILE%

REM Executar sync
rclone sync %LOCAL_PATH% %REMOTE% \
  --progress \
  --log-file=%LOG_FILE% \
  --log-level INFO \
  --config C:\Users\%USERNAME%\.config\rclone\rclone.conf \
  --exclude ".sync-metadata/**"

echo [%mydate% %mytime%] Sync completed >> %LOG_FILE%
```

### Agendar via Windows Task Scheduler

```
Program: C:\Program Files\rclone.exe
Arguments: sync E:\BRAND-OPS-STORAGE\ google-drive:/Brand-Ops-Backup --progress
Schedule: Daily at 23:00
```

---

## 📊 Mapeamento: Local ↔ Google Drive

### Estrutura Google Drive

```
/Brand-Ops-Backup/
├── brand-core/              (replica de local)
├── media-library/
├── creative-production/
├── social-assets/
├── copy-messaging/
├── strategy/
├── database-backups/        (snapshots diários)
└── sync-metadata/           (controle de sync)
```

### Arquivo de Mapeamento

**File:** `.sync-metadata/drive-ids.json`

```json
{
  "local_path": "E:\\BRAND-OPS-STORAGE\\",
  "drive_folder_id": "1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT",
  "mappings": [
    {
      "local": "brand-core/logos/logo-v1.png",
      "drive_id": "file_id_12345",
      "last_sync": "2025-04-02T23:00:00Z",
      "hash": "sha256_hash_here"
    }
  ]
}
```

---

## 🔐 Estratégia de Versionamento

### Local: SQLite + JSON

```javascript
// Cada criativo tem histórico em JSON
{
  "id": "creative-001",
  "name": "Post Instagram V2",
  "versions": [
    {
      "version": 1,
      "created_at": "2025-03-01T10:00:00Z",
      "file_path": "creative-production/estaticos/post-v1.png",
      "status": "draft"
    },
    {
      "version": 2,
      "created_at": "2025-03-15T14:30:00Z",
      "file_path": "creative-production/estaticos/post-v2.png",
      "status": "approved",
      "notes": "Changed colors based on feedback"
    }
  ]
}
```

### Google Drive: Native Version History

- Google Drive mantém todas as versões automaticamente
- Você pode restaurar qualquer versão anterior
- Reclone não apaga versões antigas

**Benefit:** 2 camadas de versionamento
- Local: Controle fino (JSON)
- Drive: Backup automático com histórico completo

---

## ⚠️ Conflitos & Resolução

### Quando Podem Ocorrer Conflitos?

1. **Arquivo modificado localmente E no Drive** (não deve acontecer se source = local)
2. **Arquivo deletado localmente mas existe no Drive**
3. **Limite de cota do Google Drive atingido**

### Política de Resolução

```
REGRA: LOCAL sempre vence (é source of truth)

Cenário 1: Arquivo modificado localmente
  → Local vence, sobrescreve Drive
  
Cenário 2: Arquivo deletado localmente
  → Deletar do Drive também
  → Manter arquivo antigo em "trash-recovery"
  
Cenário 3: Arquivo novo apenas no Drive
  → Não sincronizar (viola "local é source")
  → Log de aviso para investigação
  
Cenário 4: Limite de cota atingido
  → Parar sync
  → Alertar usuário
  → Deletar backups antigos do Drive
```

### Log de Conflitos

**File:** `.sync-metadata/conflict-log.json`

```json
{
  "conflicts": [
    {
      "timestamp": "2025-04-02T15:30:00Z",
      "file_path": "creative-production/post-v3.png",
      "conflict_type": "modified_in_both",
      "resolution": "local_won",
      "notes": "Auto-resolved: local version used"
    }
  ]
}
```

---

## 📈 Monitoramento & Troubleshooting

### Health Check Script

**File:** `E:\BRAND-OPS-STORAGE\check-sync-health.bat`

```batch
@echo off
echo ============ BRAND-OPS SYNC HEALTH CHECK ============
echo.

REM 1. Verificar rclone
echo 1. Verificando rclone...
rclone version
echo.

REM 2. Listar últimas modificações locais
echo 2. Últimos 10 arquivos modificados (local)...
dir E:\BRAND-OPS-STORAGE /s /t:w | sort | tail -10
echo.

REM 3. Verificar Google Drive connection
echo 3. Testando conexão com Google Drive...
rclone lsd google-drive:/Brand-Ops-Backup
echo.

REM 4. Verificar espaço em disco
echo 4. Espaço em disco...
fsutil volume diskfree E:\
echo.

REM 5. Mostrar último log de sync
echo 5. Último sync log...
tail -20 E:\BRAND-OPS-STORAGE\.sync-metadata\sync-log.txt
echo.

echo ============ FIM DO HEALTH CHECK ============
pause
```

### Troubleshooting Comum

| Problema | Causa | Solução |
|----------|-------|---------|
| Sync lento | Muitos arquivos de vídeo | Aumentar timeout do rclone |
| Erro 404 | Pasta do Drive deletada | Recriar `/Brand-Ops-Backup/` |
| Cota cheia | 2TB do Google One lotou | Deletar backups antigos no Drive |
| Arquivos duplicados | Sync interrompido | Executar `rclone dedupe` |
| Permissão negada | Token expirado | Reautenticar: `rclone config` |

---

## 💾 Backup Strategy

### Backup LOCAL (Hourly)

**Script automático (Windows Task Scheduler):**

```batch
REM Backup local a cada hora
SET TIMESTAMP=%date:~-4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~5,2%
SET BACKUP_DIR=E:\BRAND-OPS-STORAGE\database\backups\local\backup_%TIMESTAMP%
mkdir %BACKUP_DIR%
xcopy E:\BRAND-OPS-STORAGE\database\brand-ops.db %BACKUP_DIR%\
```

### Backup GOOGLE DRIVE (Daily)

**Snapshot automático via rclone (23:00):**

```bash
# Executado após sync
# Google Drive mantém histórico automático
# Você pode restaurar qualquer versão
```

### Retenção

- **Local:** Manter últimos 30 dias (hourly)
- **Google Drive:** Manter 90 dias (histórico nativo)

---

## 🚀 Implementação Timeline

| Phase | Ação | Timeline |
|-------|------|----------|
| **1** | Setup rclone + autenticação | Day 1 |
| **2** | Criar estrutura de pastas | Day 1 |
| **3** | Test sync manual | Day 2 |
| **4** | Agendar sync diário | Day 2 |
| **5** | Monitorar por 1 semana | Week 1 |
| **6** | Ajustar conforme necessário | Week 1-2 |
| **7** | Go live | Week 2 |

---

## ✅ Checklist de Setup

- [ ] rclone instalado
- [ ] Google Drive autenticado
- [ ] Estrutura de pastas criada
- [ ] Sync script funcional
- [ ] Task Scheduler agendado
- [ ] Health check script pronto
- [ ] Documentação local atualizada
- [ ] Teste de recover de backup feito
- [ ] Equipe treinada no processo
- [ ] Monitoramento ativo

---

## 📞 Suporte & Escalation

**Se algo der errado:**

1. **Sync não funciona:** Verificar rclone config e logs
2. **Cota do Drive cheia:** Limpar backups antigos
3. **Arquivo corrompido:** Restaurar de backup anterior
4. **Perda total de dados:** Google Drive tem todos os backups

---

## 📚 Referências

- [rclone Google Drive Docs](https://rclone.org/drive/)
- [Google Drive API](https://developers.google.com/drive/api)
- [Google One Storage](https://one.google.com/)
- [Windows Task Scheduler Guide](https://docs.microsoft.com/windows/win32/taskschd/task-scheduler-start-page)

---

**End of Storage & Sync Strategy Document**

*Prepared by: Atlas (Analyst)*  
*Status: ✅ READY FOR IMPLEMENTATION*  
*Next: Setup rclone e testar sincronização*
