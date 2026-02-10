# Plan: URL Shortener CLI Utility

## Task Description
Build a self-contained URL shortener CLI utility using Bun + TypeScript. This is a **benchmark plan** designed to test build orchestration quality — it has enough complexity to stress-test context management while being fully deterministic and measurable.

## Objective
Create a working CLI tool at `apps/url-shortener/` that can shorten URLs, resolve short codes, list stored mappings, and delete entries. All data persists to a local JSON file.

## Problem Statement
We need a medium-complexity, self-contained project to benchmark `/build` vs `/build_v2` orchestration strategies. The URL shortener provides enough file I/O, logic, and validation to exercise worker context meaningfully.

## Solution Approach
TypeScript CLI with 4 modules: core logic, storage, CLI interface, and validation. Uses Bun for runtime. No external dependencies beyond Bun built-ins.

## Relevant Files

Use these files to complete the task:

- `apps/task-manager/` - Reference for project structure conventions (package.json, tsconfig patterns)
- `apps/task-manager/src/index.ts` - Reference for CLI entry point pattern
- `apps/task-manager/tsconfig.json` - Reference for TypeScript config

### New Files
- `apps/url-shortener/package.json` - Project config
- `apps/url-shortener/tsconfig.json` - TypeScript config
- `apps/url-shortener/src/index.ts` - CLI entry point with command routing
- `apps/url-shortener/src/types.ts` - Type definitions
- `apps/url-shortener/src/core/hasher.ts` - URL hashing/shortcode generation
- `apps/url-shortener/src/core/resolver.ts` - Shortcode resolution logic
- `apps/url-shortener/src/storage/json-store.ts` - JSON file persistence layer
- `apps/url-shortener/src/commands/shorten.ts` - Shorten command
- `apps/url-shortener/src/commands/resolve.ts` - Resolve command
- `apps/url-shortener/src/commands/list.ts` - List command
- `apps/url-shortener/src/commands/delete.ts` - Delete command
- `apps/url-shortener/src/commands/stats.ts` - Stats command
- `apps/url-shortener/src/utils/validation.ts` - URL validation utilities
- `apps/url-shortener/src/utils/formatter.ts` - Output formatting

## Implementation Phases

### Phase 1: Foundation
- Project scaffolding (package.json, tsconfig.json, directory structure)
- Type definitions
- Storage layer with JSON file persistence

### Phase 2: Core Implementation
- URL hashing with collision detection
- All 5 CLI commands (shorten, resolve, list, delete, stats)
- Input validation (URL format, shortcode existence)

### Phase 3: Integration & Polish
- CLI entry point with argument parsing and command routing
- Error handling with user-friendly messages
- Output formatting (table display for list, colored output for errors)

## Team Orchestration

- You operate as the team lead and orchestrate the team to execute the plan.
- You're responsible for deploying the right team members with the right context to execute the plan.
- IMPORTANT: You NEVER operate directly on the codebase. You use `Task` and `Task*` tools to deploy team members to do the building, validating, testing, deploying, and other tasks.

### Team Members

- Builder
  - Name: builder-foundation
  - Role: Project scaffolding, types, and storage layer
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-core
  - Role: Core logic (hasher, resolver) and all CLI commands
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-integration
  - Role: CLI entry point, error handling, output formatting
  - Agent Type: builder
  - Resume: true

- Validator
  - Name: validator-final
  - Role: Verify all acceptance criteria and run validation commands
  - Agent Type: validator
  - Resume: false

## Step by Step Tasks

### 1. Project Scaffolding
- **Task ID**: setup-project
- **Depends On**: none
- **Assigned To**: builder-foundation
- **Agent Type**: builder
- **Parallel**: false
- Create `apps/url-shortener/` directory structure
- Create `package.json` with name `url-shortener`, bun as runtime, start script pointing to `src/index.ts`
- Create `tsconfig.json` matching the task-manager's config pattern (strict mode, ES2022 target)
- Create `src/types.ts` with interfaces: `UrlMapping` (id, originalUrl, shortCode, createdAt, accessCount), `UrlStore` (mappings record, metadata with totalShortenedCount and totalAccessCount)
- Create `src/storage/json-store.ts` with class `JsonStore`: constructor(filePath), load(), save(), getAll(), getByShortCode(), getByUrl(), add(mapping), delete(shortCode), updateAccessCount(shortCode)
- Storage file location: `apps/url-shortener/data/urls.json` (auto-create directory if missing)

### 2. Core Hashing and Resolution
- **Task ID**: core-logic
- **Depends On**: setup-project
- **Assigned To**: builder-core
- **Agent Type**: builder
- **Parallel**: false
- Create `src/core/hasher.ts`: function `generateShortCode(url: string, length?: number): string` — uses first 6 chars of base62-encoded hash of URL. If collision detected (passed as param), append incrementing suffix
- Create `src/core/resolver.ts`: function `resolveShortCode(shortCode: string, store: JsonStore): UrlMapping | null` — looks up shortcode, increments access count, returns mapping or null
- Create `src/utils/validation.ts`: function `isValidUrl(url: string): boolean` — checks URL format (must have protocol http/https, valid domain), function `isValidShortCode(code: string): boolean` — alphanumeric only, 4-10 chars

### 3. CLI Commands
- **Task ID**: cli-commands
- **Depends On**: core-logic
- **Assigned To**: builder-core
- **Agent Type**: builder
- **Parallel**: false
- Create `src/commands/shorten.ts`: takes URL argument, validates URL, checks for existing mapping (return existing if found), generates shortcode, saves to store, prints result
- Create `src/commands/resolve.ts`: takes shortcode argument, looks up mapping, prints original URL or "not found" error
- Create `src/commands/list.ts`: no arguments, loads all mappings, prints formatted table (shortCode, originalUrl, accessCount, createdAt)
- Create `src/commands/delete.ts`: takes shortcode argument, validates existence, removes from store, prints confirmation
- Create `src/commands/stats.ts`: prints total URLs shortened, total accesses, most accessed URL, least accessed URL

### 4. CLI Entry Point and Formatting
- **Task ID**: cli-integration
- **Depends On**: cli-commands
- **Assigned To**: builder-integration
- **Agent Type**: builder
- **Parallel**: false
- Create `src/utils/formatter.ts`: function `formatTable(mappings: UrlMapping[]): string` — aligned columns with headers, function `formatError(message: string): string` — prefixed with "Error: ", function `formatSuccess(message: string): string` — prefixed with checkmark
- Create `src/index.ts`: parse process.argv for command (shorten|resolve|list|delete|stats|help), route to correct command handler, handle unknown commands with help text, wrap all commands in try/catch with formatted error output
- Help text should show: usage line, available commands with descriptions, examples

### 5. Final Validation
- **Task ID**: validate-all
- **Depends On**: setup-project, core-logic, cli-commands, cli-integration
- **Assigned To**: validator-final
- **Agent Type**: validator
- **Parallel**: false
- Run all validation commands listed below
- Verify each acceptance criterion
- Report pass/fail for each check

## Acceptance Criteria

1. `apps/url-shortener/package.json` exists with correct name and start script
2. `apps/url-shortener/tsconfig.json` exists with strict mode enabled
3. All 14 new files listed in "New Files" section exist
4. `bun run --cwd apps/url-shortener start shorten https://example.com` produces a shortcode output
5. `bun run --cwd apps/url-shortener start resolve <shortcode>` returns the original URL
6. `bun run --cwd apps/url-shortener start list` displays a formatted table
7. `bun run --cwd apps/url-shortener start delete <shortcode>` removes the entry
8. `bun run --cwd apps/url-shortener start stats` displays statistics
9. `bun run --cwd apps/url-shortener start help` displays usage information
10. TypeScript compiles without errors: `cd apps/url-shortener && bunx tsc --noEmit`
11. Invalid URL input produces a user-friendly error message
12. Shortening the same URL twice returns the same shortcode (idempotent)

## Validation Commands

Execute these commands to validate the task is complete:

- `ls apps/url-shortener/src/` - Verify directory structure exists
- `ls apps/url-shortener/src/core/ apps/url-shortener/src/commands/ apps/url-shortener/src/storage/ apps/url-shortener/src/utils/` - Verify all subdirectories
- `cd apps/url-shortener && bunx tsc --noEmit` - TypeScript compiles clean
- `bun run --cwd apps/url-shortener start help` - Help command works
- `bun run --cwd apps/url-shortener start shorten https://example.com` - Shorten works
- `bun run --cwd apps/url-shortener start list` - List works
- `bun run --cwd apps/url-shortener start stats` - Stats works
- `bun run --cwd apps/url-shortener start shorten https://example.com` - Idempotent check (same shortcode)

## Notes
- No external dependencies needed — Bun built-ins cover hashing (Bun.hash or crypto), file I/O, and process args
- The benchmark measures orchestration quality, not code complexity
- Both `/build` and `/build_v2` should produce identical functional output — the difference is HOW they get there
