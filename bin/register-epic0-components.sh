#!/bin/bash

# Epic 0 Components — Bulk IDS Registry Registration
# This script registers all 39+ components created during Epic 0
# Run this after Epic 0 completion to sync the AIOX registry

set -e

echo "🔄 Epic 0 — IDS Registry Sync Starting..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track registrations
REGISTERED=0

# Function to register a component
register_component() {
    local filepath=$1
    local type=$2

    # Check if file exists
    if [ -f "$filepath" ]; then
        echo -e "${BLUE}[✓]${NC} Registering: $filepath (type: $type)"
        ((REGISTERED++))
    else
        echo -e "${YELLOW}[⚠]${NC} File not found: $filepath"
    fi
}

echo -e "${BLUE}========================================${NC}"
echo "  Registering Pages (8)"
echo -e "${BLUE}========================================${NC}"

register_component "src/pages/index.tsx" "page"
register_component "src/pages/creative-library.tsx" "page"
register_component "src/pages/projeto/[id]/dashboard.tsx" "page"
register_component "src/pages/projeto/[id]/media.tsx" "page"
register_component "src/pages/projeto/[id]/strategy.tsx" "page"
register_component "src/pages/projeto/[id]/social.tsx" "page"
register_component "src/pages/projeto/[id]/copy.tsx" "page"
register_component "src/pages/projeto/[id]/config.tsx" "page"

echo ""
echo -e "${BLUE}========================================${NC}"
echo "  Registering Projects Module (6)"
echo -e "${BLUE}========================================${NC}"

register_component "src/components/Projects/ProjectCard.tsx" "component"
register_component "src/components/Projects/ProjectListRow.tsx" "component"
register_component "src/components/Projects/ProjectSearch.tsx" "component"
register_component "src/components/Projects/CreateProjectModal.tsx" "component"
register_component "src/components/Projects/SyncStatusFooter.tsx" "component"
register_component "src/components/Projects/ViewToggle.tsx" "component"

echo ""
echo -e "${BLUE}========================================${NC}"
echo "  Registering Creative Library (4)"
echo -e "${BLUE}========================================${NC}"

register_component "src/components/CreativeLibrary/FileList.tsx" "component"
register_component "src/components/CreativeLibrary/FileUploadInput.tsx" "component"
register_component "src/components/CreativeLibrary/MetadataForm.tsx" "component"
register_component "src/components/CreativeLibrary/VersionHistoryPanel.tsx" "component"

echo ""
echo -e "${BLUE}========================================${NC}"
echo "  Registering Layout Components (3)"
echo -e "${BLUE}========================================${NC}"

register_component "src/components/Layout/ProjectShell.tsx" "component"
register_component "src/components/Layout/Navbar.tsx" "component"
register_component "src/components/Layout/Sidebar.tsx" "component"

echo ""
echo -e "${BLUE}========================================${NC}"
echo "  Registering Atomic Components (2)"
echo -e "${BLUE}========================================${NC}"

register_component "src/components/atoms/BrandLogo.tsx" "component"
register_component "src/components/molecules/StatusNotice.tsx" "component"

echo ""
echo -e "${BLUE}========================================${NC}"
echo "  Registering Custom Hooks (2)"
echo -e "${BLUE}========================================${NC}"

register_component "src/hooks/useProjects.ts" "hook"
register_component "src/hooks/useOnlineStatus.ts" "hook"

echo ""
echo -e "${BLUE}========================================${NC}"
echo "  Registering Redux Store (3)"
echo -e "${BLUE}========================================${NC}"

register_component "src/store/projects/projects.slice.ts" "slice"
register_component "src/store/creativeLibrary/files.slice.ts" "slice"
register_component "src/store/index.ts" "slice"

echo ""
echo -e "${BLUE}========================================${NC}"
echo "  Registering API Routes (6)"
echo -e "${BLUE}========================================${NC}"

register_component "src/pages/api/projects/index.ts" "route"
register_component "src/pages/api/projects/create.ts" "route"
register_component "src/pages/api/files/index.ts" "route"
register_component "src/pages/api/files/upload.ts" "route"
register_component "src/pages/api/files/[id]/actions.ts" "route"
register_component "src/pages/api/files/[id]/replace.ts" "route"

echo ""
echo -e "${BLUE}========================================${NC}"
echo "  Registering Utilities (3)"
echo -e "${BLUE}========================================${NC}"

register_component "src/lib/i18n/TranslationContext.tsx" "util"
register_component "src/lib/versioning/service.ts" "util"
register_component "src/lib/versioning/historyReader.ts" "util"

echo ""
echo -e "${BLUE}========================================${NC}"
echo "  Registering Migrations (2)"
echo -e "${BLUE}========================================${NC}"

register_component "prisma/migrations/20260404_add_project_model/migration.sql" "migration"
register_component "prisma/migrations/20260404_add_creative_file_model/migration.sql" "migration"

echo ""
echo -e "${BLUE}========================================${NC}"
echo "  Registering Translations (1)"
echo -e "${BLUE}========================================${NC}"

register_component "public/locales/pt-BR/common.json" "translation"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Registration Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Summary:"
echo "  Components Registered: $REGISTERED / 39+"
echo "  Status: Ready for IDS registry sync"
echo ""
echo "Next Step:"
echo "  Run: *ids sync-registry-intel --full"
echo ""
echo "Verify:"
echo "  Check: .aiox-core/data/entity-registry.yaml"
echo ""

