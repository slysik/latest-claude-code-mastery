# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Production-ready reference implementation for Claude Code Hooks and agent orchestration. Demonstrates all 13 lifecycle hooks, team-based Builder/Validator workflows, custom status lines, and sub-agent patterns.

## Commands

```bash
# Run any hook script (UV single-file scripts with PEP 723 inline deps, no venv needed)
uv run .claude/hooks/<hook_name>.py

# Lint Python
ruff check .                          # All files
ruff check .claude/hooks/             # Hooks only

# Type check Python
uv run ty check

# Run validators independently
uv run .claude/hooks/validators/ruff_validator.py
uv run .claude/hooks/validators/ty_validator.py

# Task Manager App (Bun + TypeScript)
cd apps/task-manager && bun run start
```

## Architecture

### Hook System (`.claude/hooks/`)

All 13 hooks are **UV single-file scripts** — self-contained Python files with PEP 723 inline dependency declarations. No virtual environment needed; `uv run` handles everything.

**Lifecycle Flow:**
```
Setup → SessionStart → UserPromptSubmit → [PreToolUse → PermissionRequest → PostToolUse/PostToolUseFailure]* → Stop → SessionEnd
                                               ↑ SubagentStart → SubagentStop
                                               ↑ PreCompact (on context overflow)
                                               ↑ Notification (async, anytime)
```

**Hook Communication Protocol:**
- **Input**: JSON via stdin containing event payload (tool name, inputs, session info, etc.)
- **Output**: JSON on stdout for structured responses (`decision`, `reason`, `additionalContext`, `updatedInput`)
- **Exit codes**: `0` = success, `2` = block operation (stderr fed back to Claude), other = non-blocking error
- **Path convention**: Always use `$CLAUDE_PROJECT_DIR` prefix in settings.json hook commands

**Flow Control via JSON Output:**
- `PreToolUse`: Return `{"decision": "approve"|"block", "reason": "..."}` to control tool execution
- `PostToolUse`: Return `{"decision": "block", "reason": "..."}` to prompt Claude about issues
- `Stop/SubagentStop`: Return `{"decision": "block", "reason": "..."}` to prevent stopping (force continuation)
- All hooks: `{"continue": false, "stopReason": "..."}` takes highest priority

### All 13 Hooks

| Hook | File | Purpose | Can Block? |
|------|------|---------|------------|
| Setup | `setup.py` | Repo init, env persistence via `CLAUDE_ENV_FILE` | No |
| SessionStart | `session_start.py` | Dev context loading (git status, context files) | No |
| SessionEnd | `session_end.py` | Session cleanup and logging | No |
| UserPromptSubmit | `user_prompt_submit.py` | Session tracking, LLM agent naming, context injection | Yes (exit 2) |
| PreToolUse | `pre_tool_use.py` | Security: blocks rm -rf, .env access, destructive cmds | Yes |
| PermissionRequest | `permission_request.py` | Audits permissions, auto-allows read-only ops | Yes (approve/block) |
| PostToolUse | `post_tool_use.py` | Logging, JSONL transcript → readable JSON conversion | Post-hoc only |
| PostToolUseFailure | `post_tool_use_failure.py` | Structured error logging | No |
| Notification | `notification.py` | TTS alerts for permission/idle prompts | No |
| Stop | `stop.py` | AI-generated completion messages with TTS | Yes (force continue) |
| SubagentStart | `subagent_start.py` | Subagent spawn logging | No |
| SubagentStop | `subagent_stop.py` | Subagent completion TTS, task summarization | Yes (force continue) |
| PreCompact | `pre_compact.py` | Transcript backup before context compaction | No |

### Utilities (`.claude/hooks/utils/`)

- **`tts/`**: Queue-based audio providers — ElevenLabs → OpenAI → pyttsx3 fallback. `tts_queue.py` prevents overlapping audio.
- **`llm/`**: LLM provider chain — Ollama (local) → Anthropic → OpenAI → fallback. Used for agent naming and task summarization.
- **`validators/`**: PostToolUse validators that auto-run Ruff/Ty on `.py` file changes. Also includes `validate_new_file.py` and `validate_file_contains.py` for plan output validation.

### Sub-Agents (`.claude/agents/`)

- **`team/builder.md`**: Implementation agent with all tools. Has Ruff+Ty self-validation via embedded stop hooks.
- **`team/validator.md`**: Read-only verification agent (no Write/Edit tools).
- **`meta-agent.md`**: Agent that generates new agent configurations from natural language descriptions.
- **`crypto/`**: 15 market analysis agents across haiku/sonnet/opus model tiers.

Agent files use YAML frontmatter (`name`, `description`, `tools`, `model`) + markdown system prompt body. The `description` field controls when the primary agent delegates — include trigger phrases like "use proactively" or specific keywords.

### Slash Commands (`.claude/commands/`)

- `/prime` — Load project context and structure analysis
- `/plan_w_team` — Self-validating plan generation with team orchestration (uses embedded stop hooks + validators)
- `/build` — Execute a plan from `/plan_w_team`
- `/cook` — Advanced multi-agent task orchestration
- `/crypto_research` — Cryptocurrency analysis workflow

### Status Lines (`.claude/status_lines/`)

14 versions (`status_line.py` through `status_line_v14.py`). Currently active: **v6** (context window usage bar). Configured in `.claude/settings.json` under `statusLine`. Session data stored in `.claude/data/sessions/<session_id>.json`.

## Configuration

- **`.claude/settings.json`**: Hook registrations (with matchers and flags), permissions, status line selection
- **`ruff.toml`**: Targets Python 3.11+
- **`ty.toml`**: Sets `unresolved-import = "ignore"` because PEP 723 inline deps aren't visible to static analysis
- **`.env.sample`**: Template for API keys (`ELEVENLABS_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `OLLAMA_HOST`, `ENGINEER_NAME`)

## Key Patterns

- **Security layering**: `pre_tool_use.py` blocks dangerous commands → `permission_request.py` auto-allows read-only ops → validators enforce quality on completion
- **LLM provider priority**: Ollama (local) → Anthropic → OpenAI → hardcoded fallback. Graceful degradation.
- **Structured logging**: All hook events append JSON to `logs/<hook_name>.json`. `chat.json` is overwritten each session (not appended).
- **Stop hook safety**: Always check `stop_hook_active` flag to prevent infinite continuation loops
- **Builder/Validator pattern**: Increase trust by pairing implementation agents with read-only verification agents via TaskCreate/TaskUpdate orchestration
