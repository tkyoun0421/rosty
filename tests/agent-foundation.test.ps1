$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

$requiredFiles = @(
    ".editorconfig",
    ".gitattributes",
    "AGENTS.md",
    "tsconfig.json",
    "vitest.config.ts",
    "src/app/_providers/QueryClientProvider.client.tsx",
    "src/shared/constants/queryKeys.ts",
    "docs/prd.md",
    "docs/work-log.md",
    "docs/agents/agent-charter.md",
    "docs/agents/workflow-spec.md",
    "docs/agents/specialist-contracts.md",
    "docs/agents/task-templates.md",
    "docs/development/structure.md",
    "docs/development/naming.md",
    "docs/development/boundaries.md",
    "docs/development/quality.md",
    "docs/agents/roles/lead.md",
    "docs/agents/roles/research.md",
    "docs/agents/roles/implementation.md",
    "docs/agents/roles/review.md"
)

$requiredDirectories = @(
    "src/app",
    "src/app/_providers",
    "src/flows",
    "src/shared"
)

foreach ($relativePath in $requiredFiles) {
    $fullPath = Join-Path $repoRoot $relativePath
    if (-not (Test-Path -LiteralPath $fullPath)) {
        throw "Missing required file: $relativePath"
    }
}

foreach ($relativePath in $requiredDirectories) {
    $fullPath = Join-Path $repoRoot $relativePath
    if (-not (Test-Path -LiteralPath $fullPath)) {
        throw "Missing required directory: $relativePath"
    }
}

$requiredContent = @{
    ".editorconfig" = @(
        "root = true",
        "charset = utf-8",
        "end_of_line = lf",
        "insert_final_newline = true",
        "[*.ps1]",
        "charset = utf-8-bom"
    )
    ".gitattributes" = @(
        "* text=auto eol=lf",
        "*.md text eol=lf",
        "*.ps1 text eol=lf"
    )
    "AGENTS.md" = @(
        "# Project Agents",
        "## Development Baseline",
        "### Runtime",
        "Next.js 16",
        "React 19",
        "TypeScript 5",
        "pnpm 10",
        "### Core Libraries",
        "TanStack Query 5",
        "Zustand 5",
        "Supabase JS 2",
        "shadcn/ui",
        "Tailwind CSS 4",
        "### State And Data Rules",
        "Do not solve the same problem with both",
        "Manage query keys through shared key factories",
        "Do not inline query key arrays",
        "Keep `components` folders dumb",
        "### Auth Baseline",
        "Supabase Auth + Google OAuth",
        "Do not add email/password auth unless the user explicitly asks for it.",
        "### Form And Validation",
        "react-hook-form 7",
        "zod 3",
        "### Testing Baseline",
        "Vitest",
        "React Testing Library",
        "Playwright",
        "### Text Encoding",
        "All docs and text-based config files must be stored as",
        "-Encoding UTF8",
        "UTF-8 BOM",
        "## Required Documents",
        "docs/development/structure.md",
        "Before code changes, read the development rules first."
    )
    "tsconfig.json" = @(
        '"#app/*"',
        '"./src/app/*"',
        '"#flows/*"',
        '"./src/flows/*"',
        '"#shared/*"',
        '"./src/shared/*"'
    )
    "vitest.config.ts" = @(
        '"src/app"',
        '"src/flows"',
        '"src/shared"'
    )
    "src/shared/constants/queryKeys.ts" = @(
        "export const queryKeys",
        "scheduleRequests",
        "employeeList"
    )
    "docs/prd.md" = @(
        "## 개발 진행 관리",
        "### 진행 상태 관리 기준",
        "⚪ 시작전",
        "🟡 진행중",
        "🟢 완료",
        "🔴 블록",
        "⏸ 보류",
        "### 현재 개발 포커스",
        "Release 1 - 스케줄 MVP",
        "docs/work-log.md"
    )
    "docs/work-log.md" = @(
        "# Work Log",
        "## Purpose",
        "## Update Rules",
        "## Current Handoff",
        "Last In Progress",
        "Next Up",
        "Related Commit"
    )
    "docs/agents/agent-charter.md" = @(
        "# Agent Charter",
        "## Non-Negotiable Rules",
        "## Escalation Rules",
        "## Completion Contract"
    )
    "docs/agents/workflow-spec.md" = @(
        "# Workflow Spec",
        "## Explore",
        "## Plan",
        "## Implement",
        "## Report"
    )
    "docs/agents/specialist-contracts.md" = @(
        "# Specialist Contracts",
        "## Lead Agent",
        "## Research Specialist",
        "## Implementation Specialist",
        "## Review Specialist"
    )
    "docs/agents/task-templates.md" = @(
        "# Task Templates",
        "## Bugfix",
        "## Feature",
        "## Refactor",
        "## Docs"
    )
    "docs/development/structure.md" = @(
        "# Development Structure Rules",
        "## Top-Level Layers",
        "src/app / src/flows / src/mutations / src/queries / src/shared",
        "## Layer Shapes",
        "src/app/_providers",
        "flows/<usecase>/hooks + components + types + schemas + utils + lib",
        "mutations/<domain>/actions + hooks + components + types + schemas + dal + constants + utils + lib",
        "queries/<domain>/hooks + components? + types + schemas + dal + constants + utils + lib",
        "shared/utils and shared/lib are the default homes.",
        "mutations and queries do not import each other directly"
    )
    "docs/development/naming.md" = @(
        "# Naming Rules",
        "## UI Component Files",
        "Name.server.tsx",
        "Name.client.tsx",
        "## Types, Schemas, and Dal Files",
        "types",
        "schemas",
        "dal",
        "## Action, Utility, and Lib Files",
        "createReservation.ts",
        "buildReservationPayload.ts",
        "reservationMutationClient.ts"
    )
    "docs/development/boundaries.md" = @(
        "# Boundary Rules",
        "## Layer Ownership",
        "## Form Ownership",
        "mutations = input/submit",
        "flows = step/flow state",
        "## Subfolder Ownership",
        "actions = execution core",
        "hooks = UI binding",
        "dal = data access layer",
        "components = dummy UI only",
        "TanStack Query keys must come from a shared query key factory",
        "Do not inline query key arrays in hooks or mutation invalidation",
        "utils = pure functions",
        "lib = third-party or runtime adapters",
        "## UI Safety",
        "import 'server-only'",
        "'use client'"
    )
    "docs/development/quality.md" = @(
        "# Quality Rules",
        "## Text Encoding Rules",
        "UTF-8",
        "-Encoding UTF8",
        "UTF-8 BOM",
        "## Structural Review Checks",
        "## UI Safety Checks",
        "absolute imports only",
        "cycle imports are not allowed",
        "actions must stay React-free",
        "utils must stay pure",
        "components should stay dumb and prop-driven",
        "Do not call useQuery, useMutation, useForm, or fetch directly inside components folders."
    )
    "docs/agents/roles/lead.md" = @(
        "# Lead Agent Rules",
        "## Purpose",
        "## Allowed",
        "## Must Not",
        "## Outputs",
        "## Failure Mode"
    )
    "docs/agents/roles/research.md" = @(
        "# Research Specialist Rules",
        "## Purpose",
        "## Inputs",
        "## Outputs",
        "## Handoff",
        "## Failure Mode"
    )
    "docs/agents/roles/implementation.md" = @(
        "# Implementation Specialist Rules",
        "## Purpose",
        "## Allowed",
        "## Inputs",
        "## Handoff",
        "## Failure Mode"
    )
    "docs/agents/roles/review.md" = @(
        "# Review Specialist Rules",
        "## Purpose",
        "## Must Not",
        "## Outputs",
        "## Handoff",
        "## Failure Mode"
    )
}

$utf8Strict = New-Object System.Text.UTF8Encoding($false, $true)

function Get-Utf8Text {
    param([string]$Path)

    return $utf8Strict.GetString([System.IO.File]::ReadAllBytes($Path))
}

foreach ($relativePath in $requiredContent.Keys) {
    $content = Get-Utf8Text -Path (Join-Path $repoRoot $relativePath)
    foreach ($pattern in $requiredContent[$relativePath]) {
        if ($content -notmatch [regex]::Escape($pattern)) {
            throw "Missing content '$pattern' in $relativePath"
        }
    }
}

$forbiddenContent = @{
    "docs/development/structure.md" = @(
        "models/dto",
        "models/dal",
        "models/form"
    )
    "docs/development/naming.md" = @(
        "DTO type names use the `Dto` suffix",
        "DAL type names use the `Dal` suffix",
        "models/form"
    )
}

foreach ($relativePath in $forbiddenContent.Keys) {
    $content = Get-Utf8Text -Path (Join-Path $repoRoot $relativePath)
    foreach ($pattern in $forbiddenContent[$relativePath]) {
        if ($content -match [regex]::Escape($pattern)) {
            throw "Forbidden content '$pattern' found in $relativePath"
        }
    }
}

$textFiles = Get-ChildItem -Path $repoRoot -Recurse -File | Where-Object {
    $_.FullName -notlike "*\.git\*" -and
    $_.FullName -notlike "*\.next\*" -and
    $_.FullName -notlike "*\node_modules\*" -and (
        $_.Name -in @('.editorconfig', '.gitattributes', '.env', '.env.example') -or
        $_.Extension -in @('.md', '.ps1', '.ts', '.tsx', '.json', '.mjs', '.yml', '.yaml')
    )
}

foreach ($file in $textFiles) {
    try {
        $null = $utf8Strict.GetString([System.IO.File]::ReadAllBytes($file.FullName))
    }
    catch {
        throw "Invalid UTF-8 encoding: $($file.FullName)"
    }
}

Write-Output "PASS agent foundation contract"