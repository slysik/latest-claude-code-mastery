# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **production-ready reference implementation** for mastering Claude Code Hooks and advanced AI agent orchestration. It demonstrates all 13 Claude Code lifecycle hooks with working examples, team-based agent workflows (Builder/Validator pattern), and custom status lines.

## Commands

### Python (Hooks & Utilities)
```bash
# Run individual hook scripts (UV single-file scripts with embedded PEP 723 dependencies)
uv run .claude/hooks/<hook_name>.py

# Lint Python code
ruff check .
ruff check .claude/hooks/

# Type check Python code
uv run ty check
```

### Task Manager App (Bun + TypeScript)
```bash
cd apps/task-manager
bun run start          # Run the CLI task manager
```

## Architecture

### Hook System (`.claude/hooks/`)

All 13 hooks are **UV single-file scripts** with PEP 723 inline dependencies. Each script is self-contained with its own dependency declarations—no virtual environment needed.

**Lifecycle Flow:**
```
SessionStart → UserPromptSubmit → [PreToolUse → PostToolUse]* → Stop → SessionEnd
                                      ↓
                              PreCompact (on context overflow)
                                      ↓
                              SubagentStart → SubagentStop (for spawned agents)
```

**Communication Pattern:**
- Hooks receive JSON via stdin (event payload)
- Exit codes: `0` = success, `2` = block operation
- JSON output on stdout for structured responses (blocking, messages, etc.)

### Key Hooks

| Hook | Purpose |
|------|---------|
| `user_prompt_submit.py` | Session tracking, agent naming via LLM, context injection |
| `pre_tool_use.py` | Security blocking (rm -rf, sensitive files, destructive commands) |
| `post_tool_use.py` | Logging, transcript conversion |
| `stop.py` | AI-generated completion messages with TTS |
| `subagent_stop.py` | Async task summarization for sub-agents |
| `pre_compact.py` | Transcript backup before context compaction |
| `setup.py` | Repository context injection |

### Utilities (`.claude/hooks/utils/`)

**TTS Providers** (`utils/tts/`): Queue-based audio with ElevenLabs, OpenAI, and pyttsx3 support.

**LLM Integrations** (`utils/llm/`): Ollama (local) → Anthropic → OpenAI priority chain for agent naming and task summarization.

**Validators** (`utils/validators/`): Ruff and Ty integration for code quality enforcement on file changes.

### Sub-Agents (`.claude/agents/`)

**Team Agents:**
- `team/builder.md` - Implementation agent with all tools
- `team/validator.md` - Read-only validation agent

**Meta-Agent** (`meta-agent.md`): Generates new agent configurations from descriptions.

**Crypto Agents** (`crypto/`): 15 specialized agents for market analysis across haiku/sonnet/opus models.

### Custom Slash Commands (`.claude/commands/`)

Key commands:
- `/prime` - Load project context
- `/plan_w_team` - Team-based build/validate workflow
- `/cook` - Advanced task orchestration
- `/crypto_research` - Cryptocurrency analysis workflow

### Status Lines (`.claude/status_lines/`)

14 versions from basic (git info) to advanced (activity pulse, cost tracking, context window bars, sparklines). Currently using v6 (context window usage).

## Configuration

**`.claude/settings.json`**: Main configuration for hooks, permissions, and status line selection.

**Hook Flags**: Each hook can receive flags like `--log-only`, `--notify`, `--verbose` configured in settings.json.

**Environment Variables**: Copy `.env.sample` to `.env` for API keys (ElevenLabs, OpenAI, Anthropic, Ollama).

## Key Patterns

### Security Model
- `pre_tool_use.py` blocks dangerous patterns before execution
- `permission_request.py` audits and auto-allows read-only operations
- Validators enforce Ruff/Ty checks before completion

### LLM Provider Priority
Ollama (local) → Anthropic → OpenAI → fallback. Graceful degradation if services unavailable.

### Logging
All hook events logged as JSON to `logs/` directory for audit trail.

## Tech Stack

- **Python 3.11+** with UV for hooks
- **Bun + TypeScript** for task-manager app
- **Ruff** for Python linting
- **Ty** for Python type checking
