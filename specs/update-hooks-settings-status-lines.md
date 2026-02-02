# Plan: Update Claude Code Hooks, Settings, and Status Lines to Latest Version

## Task Description

Update the claude-code-hooks-mastery codebase to showcase the latest version of Claude Code hooks, including all new features from the documentation. Create 5 new status line versions, update all Python hook files to support new input/output schemas, update settings.json with new patterns, and update the README documentation.

## Objective

Bring the codebase fully up-to-date with the latest Claude Code hooks documentation, demonstrating all available features including:
- Prompt-based hooks (LLM evaluation)
- Notification matchers (permission_prompt, idle_prompt, auth_success, elicitation_dialog)
- PreCompact/SessionStart matchers
- New input fields (model, agent_type, agent_transcript_path)
- updatedInput for modifying tool inputs
- additionalContext for PreToolUse
- 5 new status line variations

## Problem Statement

The current hooks implementation is missing several new features documented in the latest Claude Code hooks reference:
1. Prompt-based hooks (`type: "prompt"`) for intelligent LLM-based decisions
2. Notification type matchers for filtering by notification type
3. New matchers for PreCompact (`manual`/`auto`) and SessionStart (`startup`/`resume`/`clear`/`compact`)
4. New input schema fields (model, agent_type, agent_transcript_path)
5. updatedInput capability for PreToolUse and PermissionRequest
6. additionalContext for PreToolUse hooks
7. Status lines need expansion with 5 new creative versions

## Solution Approach

Use a team-based builder/validator approach where each hook gets a dedicated builder/validator pair. Organize work into parallel groups where possible, with final documentation updates after all hooks are updated.

## Relevant Files

### Hook Files to Update
- `.claude/hooks/user_prompt_submit.py` - Add validation for new input schema
- `.claude/hooks/pre_tool_use.py` - Add updatedInput and additionalContext support
- `.claude/hooks/post_tool_use.py` - Verify current implementation matches latest docs
- `.claude/hooks/post_tool_use_failure.py` - Verify implementation
- `.claude/hooks/notification.py` - Add notification_type handling and matchers
- `.claude/hooks/stop.py` - Verify current implementation
- `.claude/hooks/subagent_stop.py` - Add agent_transcript_path handling
- `.claude/hooks/subagent_start.py` - Verify current implementation
- `.claude/hooks/pre_compact.py` - Add trigger matcher support (manual/auto)
- `.claude/hooks/session_start.py` - Add model, agent_type, compact matcher support
- `.claude/hooks/session_end.py` - Verify implementation
- `.claude/hooks/permission_request.py` - Add updatedInput support
- `.claude/hooks/setup.py` - Verify implementation
- `.claude/settings.json` - Update hook configurations with matchers

### New Status Line Files to Create
- `.claude/status_lines/status_line_v10.py` - API response time tracker
- `.claude/status_lines/status_line_v11.py` - Tool usage statistics
- `.claude/status_lines/status_line_v12.py` - Multi-segment emoji style
- `.claude/status_lines/status_line_v13.py` - Compact single-line with sparklines
- `.claude/status_lines/status_line_v14.py` - AI workload indicator with activity pulse

### Documentation to Update
- `README.md` - Add new features, update hook descriptions, add new status lines

### Reference Files
- `ai_docs/claude_code_hooks_docs.md` - Latest hooks documentation
- `ai_docs/claude_code_status_lines_docs.md` - Status line schema reference

## Implementation Phases

### Phase 1: Foundation - Update Core Hooks (Parallel Group 1)
Update hooks that have significant new features: notification, pre_compact, session_start, pre_tool_use, permission_request, subagent_stop

### Phase 2: Verification - Verify Remaining Hooks (Parallel Group 2)
Verify and update remaining hooks to ensure compliance: user_prompt_submit, post_tool_use, post_tool_use_failure, stop, session_end, setup, subagent_start

### Phase 3: Settings and Matchers
Update .claude/settings.json with new matcher patterns for notifications and other hook types

### Phase 4: Status Lines
Create 5 new status line versions (v10-v14) with creative displays

### Phase 5: Documentation
Update README.md with all new features and status line descriptions

## Team Orchestration

- You operate as the team lead and orchestrate the team to execute the plan.
- You're responsible for deploying the right team members with the right context to execute the plan.
- IMPORTANT: You NEVER operate directly on the codebase. You use `Task` and `Task*` tools to deploy team members to to the building, validating, testing, deploying, and other tasks.
- Take note of the session id of each team member. This is how you'll reference them.

### Team Members

- Builder
  - Name: notification-hook-builder
  - Role: Update notification.py to handle notification_type and matchers
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: pre-compact-hook-builder
  - Role: Update pre_compact.py to support manual/auto trigger matchers
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: session-start-hook-builder
  - Role: Update session_start.py to support model, agent_type, compact matcher
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: pre-tool-use-hook-builder
  - Role: Update pre_tool_use.py to support updatedInput and additionalContext
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: permission-request-hook-builder
  - Role: Update permission_request.py to support updatedInput
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: subagent-stop-hook-builder
  - Role: Update subagent_stop.py to handle agent_transcript_path
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: remaining-hooks-builder
  - Role: Verify and update all remaining hooks (user_prompt_submit, post_tool_use, post_tool_use_failure, stop, session_end, setup, subagent_start)
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: settings-builder
  - Role: Update .claude/settings.json with new matchers and configurations
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: status-lines-builder
  - Role: Create 5 new status line versions (v10-v14)
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: documentation-builder
  - Role: Update README.md with all new features and status lines
  - Agent Type: builder
  - Resume: true

- Validator
  - Name: hooks-validator
  - Role: Validate all hook updates work correctly by running claude -p tests
  - Agent Type: validator
  - Resume: true

- Validator
  - Name: status-lines-validator
  - Role: Validate all status line versions work correctly
  - Agent Type: validator
  - Resume: true

- Validator
  - Name: documentation-validator
  - Role: Validate README.md is comprehensive and accurate
  - Agent Type: validator
  - Resume: true

## Step by Step Tasks

### 1. Update Notification Hook
- **Task ID**: update-notification-hook
- **Depends On**: none
- **Assigned To**: notification-hook-builder
- **Agent Type**: builder
- **Parallel**: true
- Update `.claude/hooks/notification.py` to handle `notification_type` field from input
- Add support for filtering by notification type (permission_prompt, idle_prompt, auth_success, elicitation_dialog)
- Add verbose logging to show notification type in logs
- Test by running `claude -p "test"` and checking logs/notification.json

### 2. Update PreCompact Hook
- **Task ID**: update-pre-compact-hook
- **Depends On**: none
- **Assigned To**: pre-compact-hook-builder
- **Agent Type**: builder
- **Parallel**: true
- Update `.claude/hooks/pre_compact.py` to log `trigger` field (manual/auto)
- Add different behavior for manual vs auto compaction
- Ensure verbose feedback for manual compaction as documented

### 3. Update SessionStart Hook
- **Task ID**: update-session-start-hook
- **Depends On**: none
- **Assigned To**: session-start-hook-builder
- **Agent Type**: builder
- **Parallel**: true
- Update `.claude/hooks/session_start.py` to handle new fields: `model`, `agent_type`
- Add support for `compact` source type
- Log model information when available
- Log agent_type when Claude Code started with `claude --agent <name>`

### 4. Update PreToolUse Hook
- **Task ID**: update-pre-tool-use-hook
- **Depends On**: none
- **Assigned To**: pre-tool-use-hook-builder
- **Agent Type**: builder
- **Parallel**: true
- Update `.claude/hooks/pre_tool_use.py` to support JSON output with `updatedInput`
- Add `additionalContext` support in hookSpecificOutput
- Update from deprecated `decision`/`reason` to `permissionDecision`/`permissionDecisionReason`
- Add example of modifying tool inputs before execution

### 5. Update PermissionRequest Hook
- **Task ID**: update-permission-request-hook
- **Depends On**: none
- **Assigned To**: permission-request-hook-builder
- **Agent Type**: builder
- **Parallel**: true
- Update `.claude/hooks/permission_request.py` to support `updatedInput` in allow decisions
- Add support for `message` and `interrupt` fields in deny decisions
- Update JSON output schema to match latest docs

### 6. Update SubagentStop Hook
- **Task ID**: update-subagent-stop-hook
- **Depends On**: none
- **Assigned To**: subagent-stop-hook-builder
- **Agent Type**: builder
- **Parallel**: true
- Update `.claude/hooks/subagent_stop.py` to handle `agent_transcript_path` field
- Log subagent transcript path in addition to main transcript
- Add `agent_id` to logged data

### 7. Verify and Update Remaining Hooks
- **Task ID**: update-remaining-hooks
- **Depends On**: none
- **Assigned To**: remaining-hooks-builder
- **Agent Type**: builder
- **Parallel**: true
- Review and update `user_prompt_submit.py` - verify decision/block output format
- Review and update `post_tool_use.py` - verify additionalContext in hookSpecificOutput
- Review and update `post_tool_use_failure.py` - verify error object handling
- Review and update `stop.py` - verify decision/reason output format
- Review and update `session_end.py` - verify reason field handling (clear, logout, prompt_input_exit, other)
- Review and update `setup.py` - verify CLAUDE_ENV_FILE support
- Review and update `subagent_start.py` - verify agent_id and agent_type handling

### 8. Update Settings Configuration
- **Task ID**: update-settings
- **Depends On**: update-notification-hook, update-pre-compact-hook, update-session-start-hook
- **Assigned To**: settings-builder
- **Agent Type**: builder
- **Parallel**: false
- Update `.claude/settings.json` to add notification type matchers
- Add PreCompact matchers for manual/auto
- Add SessionStart matchers for startup/resume/clear/compact
- Ensure all hooks have proper matcher configurations

### 9. Create Status Line v10 - API Response Time
- **Task ID**: create-status-line-v10
- **Depends On**: none
- **Assigned To**: status-lines-builder
- **Agent Type**: builder
- **Parallel**: true
- Create `.claude/status_lines/status_line_v10.py`
- Display: Model | API duration (ms) | Total duration | Cost
- Use cost.total_api_duration_ms and cost.total_duration_ms from input
- Color code API response time (green < 1s, yellow < 3s, red > 3s)

### 10. Create Status Line v11 - Tool Usage Stats
- **Task ID**: create-status-line-v11
- **Depends On**: none
- **Assigned To**: status-lines-builder
- **Agent Type**: builder
- **Parallel**: true
- Create `.claude/status_lines/status_line_v11.py`
- Display: Model | Lines added/removed | Cost | Output Style
- Use cost.total_lines_added, cost.total_lines_removed, output_style.name
- Show net change with + or - indicator

### 11. Create Status Line v12 - Emoji Segments
- **Task ID**: create-status-line-v12
- **Depends On**: none
- **Assigned To**: status-lines-builder
- **Agent Type**: builder
- **Parallel**: true
- Create `.claude/status_lines/status_line_v12.py`
- Display: 🤖 Model | 📁 Directory | 🌿 Branch | 💰 Cost | 📊 Context%
- Use emojis for visual segmentation
- Clean, colorful design with rounded separators

### 12. Create Status Line v13 - Compact with Sparklines
- **Task ID**: create-status-line-v13
- **Depends On**: none
- **Assigned To**: status-lines-builder
- **Agent Type**: builder
- **Parallel**: true
- Create `.claude/status_lines/status_line_v13.py`
- Display: [Model] dir branch ▁▂▃▅▇ cost
- Use Unicode block characters for context usage "sparkline"
- Extremely compact, information dense

### 13. Create Status Line v14 - Activity Pulse
- **Task ID**: create-status-line-v14
- **Depends On**: none
- **Assigned To**: status-lines-builder
- **Agent Type**: builder
- **Parallel**: true
- Create `.claude/status_lines/status_line_v14.py`
- Display: [Model] ● Active | 45% ████░░░░ | $0.12 | 2m 34s
- Show filled circle indicator for active sessions
- Progress bar for context window
- Session duration timer

### 14. Validate All Hooks
- **Task ID**: validate-hooks
- **Depends On**: update-notification-hook, update-pre-compact-hook, update-session-start-hook, update-pre-tool-use-hook, update-permission-request-hook, update-subagent-stop-hook, update-remaining-hooks, update-settings
- **Assigned To**: hooks-validator
- **Agent Type**: validator
- **Parallel**: false
- Run `claude -p "list files in current directory"` to trigger hooks
- Check logs/user_prompt_submit.json for correct logging
- Check logs/pre_tool_use.json for correct logging
- Check logs/post_tool_use.json for correct logging
- Check logs/notification.json for notification_type
- Verify hooks execute without errors

### 15. Validate Status Lines
- **Task ID**: validate-status-lines
- **Depends On**: create-status-line-v10, create-status-line-v11, create-status-line-v12, create-status-line-v13, create-status-line-v14
- **Assigned To**: status-lines-validator
- **Agent Type**: validator
- **Parallel**: false
- Test each status line by piping sample JSON input
- Verify v10 shows API duration correctly
- Verify v11 shows lines added/removed correctly
- Verify v12 displays emojis correctly
- Verify v13 shows sparkline correctly
- Verify v14 shows progress bar and timer correctly
- Update settings.json to test each status line briefly

### 16. Update README Documentation
- **Task ID**: update-readme
- **Depends On**: validate-hooks, validate-status-lines
- **Assigned To**: documentation-builder
- **Agent Type**: builder
- **Parallel**: false
- Update Hook Lifecycle Overview section with any new hooks/features
- Add Prompt-Based Hooks section explaining LLM evaluation
- Update each hook description with new fields and capabilities
- Add new status line descriptions (v10-v14) to the status lines table
- Update Key Files section with any new files
- Ensure mermaid diagram is still accurate

### 17. Validate Documentation
- **Task ID**: validate-documentation
- **Depends On**: update-readme
- **Assigned To**: documentation-validator
- **Agent Type**: validator
- **Parallel**: false
- Verify README.md is comprehensive
- Check all hook descriptions match actual implementation
- Verify status line table includes v10-v14
- Check all file paths in Key Files are accurate
- Verify links work correctly

## Acceptance Criteria

1. All 13 hooks support their full input/output schemas as documented
2. Notification hook properly handles notification_type field
3. PreCompact hook properly handles manual/auto trigger
4. SessionStart hook properly handles model, agent_type, and compact source
5. PreToolUse hook supports updatedInput and additionalContext
6. PermissionRequest hook supports updatedInput and message/interrupt
7. SubagentStop hook handles agent_transcript_path
8. Settings.json has appropriate matchers for all hook types
9. 5 new status lines (v10-v14) are created and functional
10. README.md documents all new features accurately
11. All hooks can be validated by running `claude -p "test"` commands
12. Log files are generated correctly for each hook type

## Validation Commands

Execute these commands to validate the task is complete:

- `uv run python -m py_compile .claude/hooks/*.py` - Verify all hook files compile
- `uv run python -m py_compile .claude/status_lines/*.py` - Verify all status line files compile
- `claude -p "list files"` - Trigger hooks and verify logs are created
- `echo '{"model":{"display_name":"Opus"},"workspace":{"current_dir":"/test"},"context_window":{"used_percentage":45},"cost":{"total_cost_usd":0.12,"total_api_duration_ms":1500,"total_duration_ms":45000,"total_lines_added":100,"total_lines_removed":20},"output_style":{"name":"default"}}' | uv run .claude/status_lines/status_line_v10.py` - Test status line v10
- `echo '{"model":{"display_name":"Opus"},"workspace":{"current_dir":"/test"},"context_window":{"used_percentage":45},"cost":{"total_cost_usd":0.12,"total_lines_added":100,"total_lines_removed":20},"output_style":{"name":"default"}}' | uv run .claude/status_lines/status_line_v11.py` - Test status line v11
- `cat logs/notification.json | jq '.[-1].notification_type'` - Verify notification type is logged
- `cat logs/session_start.json | jq '.[-1].model'` - Verify model is logged

## Notes

- All hooks use UV single-file scripts with embedded dependency declarations
- Hooks should fail gracefully and not block Claude Code operation
- Exit code 2 is used for blocking errors that feed back to Claude
- JSON output with `hookSpecificOutput` provides structured control
- Use `$CLAUDE_PROJECT_DIR` for absolute path references in settings.json
- Test hooks by running `claude -p "prompt"` and checking log files in `logs/` directory
