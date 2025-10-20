# Slash Commands

> Updated from Anthropic's official documentation
> Source: https://docs.anthropic.com/en/docs/claude-code/slash-commands
> Last updated: 2025-10-13T09:10:31.721281

[Claude Docs home page![light logo](https://mintcdn.com/anthropic-claude-docs/DcI2Ybid7ZEnFaf0/logo/light.svg?fit=max&auto=format&n=DcI2Ybid7ZEnFaf0&q=85&s=c877c45432515ee69194cb19e9f983a2)![dark logo](https://mintcdn.com/anthropic-claude-docs/DcI2Ybid7ZEnFaf0/logo/dark.svg?fit=max&auto=format&n=DcI2Ybid7ZEnFaf0&q=85&s=f5bb877be0cb3cba86cf6d7c88185216)](/)

![US](https://d3gk2c5xim1je2.cloudfront.net/flags/US.svg)

English

Search...

⌘K

* [Console](https://console.anthropic.com/login)
* [Support](https://support.claude.com/)
* [Discord](https://www.anthropic.com/discord)
* [Sign up](https://console.anthropic.com/login)
* [Sign up](https://console.anthropic.com/login)

Search...

Navigation

Reference

Slash commands

[Welcome](/en/home)[Claude Developer Platform](/en/docs/intro)[Claude Code](/en/docs/claude-code/overview)[Model Context Protocol (MCP)](/en/docs/mcp)[API Reference](/en/api/messages)[Resources](/en/resources/overview)[Release Notes](/en/release-notes/overview)

##### Getting started

* [Overview](/en/docs/claude-code/overview)
* [Quickstart](/en/docs/claude-code/quickstart)
* [Common workflows](/en/docs/claude-code/common-workflows)

##### Build with Claude Code

* [Subagents](/en/docs/claude-code/sub-agents)
* [Plugins](/en/docs/claude-code/plugins)
* [Output styles](/en/docs/claude-code/output-styles)
* [Hooks](/en/docs/claude-code/hooks-guide)
* [Headless mode](/en/docs/claude-code/headless)
* [GitHub Actions](/en/docs/claude-code/github-actions)
* [GitLab CI/CD](/en/docs/claude-code/gitlab-ci-cd)
* [Model Context Protocol (MCP)](/en/docs/claude-code/mcp)
* [Troubleshooting](/en/docs/claude-code/troubleshooting)

##### Claude Code SDK

* [Migrate to Claude Agent SDK](/en/docs/claude-code/sdk/migration-guide)

##### Deployment

* [Overview](/en/docs/claude-code/third-party-integrations)
* [Amazon Bedrock](/en/docs/claude-code/amazon-bedrock)
* [Google Vertex AI](/en/docs/claude-code/google-vertex-ai)
* [Network configuration](/en/docs/claude-code/network-config)
* [LLM gateway](/en/docs/claude-code/llm-gateway)
* [Development containers](/en/docs/claude-code/devcontainer)

##### Administration

* [Advanced installation](/en/docs/claude-code/setup)
* [Identity and Access Management](/en/docs/claude-code/iam)
* [Security](/en/docs/claude-code/security)
* [Data usage](/en/docs/claude-code/data-usage)
* [Monitoring](/en/docs/claude-code/monitoring-usage)
* [Costs](/en/docs/claude-code/costs)
* [Analytics](/en/docs/claude-code/analytics)
* [Plugin marketplaces](/en/docs/claude-code/plugin-marketplaces)

##### Configuration

* [Settings](/en/docs/claude-code/settings)
* [Visual Studio Code](/en/docs/claude-code/vs-code)
* [JetBrains IDEs](/en/docs/claude-code/jetbrains)
* [Terminal configuration](/en/docs/claude-code/terminal-config)
* [Model configuration](/en/docs/claude-code/model-config)
* [Memory management](/en/docs/claude-code/memory)
* [Status line configuration](/en/docs/claude-code/statusline)

##### Reference

* [CLI reference](/en/docs/claude-code/cli-reference)
* [Interactive mode](/en/docs/claude-code/interactive-mode)
* [Slash commands](/en/docs/claude-code/slash-commands)
* [Checkpointing](/en/docs/claude-code/checkpointing)
* [Hooks reference](/en/docs/claude-code/hooks)
* [Plugins reference](/en/docs/claude-code/plugins-reference)

##### Resources

* [Legal and compliance](/en/docs/claude-code/legal-and-compliance)

On this page

* [Built-in slash commands](#built-in-slash-commands)
* [Custom slash commands](#custom-slash-commands)
* [Syntax](#syntax)
* [Parameters](#parameters)
* [Command types](#command-types)
* [Project commands](#project-commands)
* [Personal commands](#personal-commands)
* [Features](#features)
* [Namespacing](#namespacing)
* [Arguments](#arguments)
* [Bash command execution](#bash-command-execution)
* [File references](#file-references)
* [Thinking mode](#thinking-mode)
* [Frontmatter](#frontmatter)
* [Plugin commands](#plugin-commands)
* [How plugin commands work](#how-plugin-commands-work)
* [Plugin command structure](#plugin-command-structure)
* [Invocation patterns](#invocation-patterns)
* [MCP slash commands](#mcp-slash-commands)
* [Command format](#command-format)
* [Features](#features-2)
* [Dynamic discovery](#dynamic-discovery)
* [Arguments](#arguments-2)
* [Naming conventions](#naming-conventions)
* [Managing MCP connections](#managing-mcp-connections)
* [MCP permissions and wildcards](#mcp-permissions-and-wildcards)
* [SlashCommand tool](#slashcommand-tool)
* [SlashCommand tool supported commands](#slashcommand-tool-supported-commands)
* [Disable SlashCommand tool](#disable-slashcommand-tool)
* [Disable specific commands only](#disable-specific-commands-only)
* [SlashCommand permission rules](#slashcommand-permission-rules)
* [Character budget limit](#character-budget-limit)
* [See also](#see-also)

Reference

Slash commands
==============

Copy page

Control Claude’s behavior during an interactive session with slash commands.

Copy page

[​](#built-in-slash-commands) Built-in slash commands
-----------------------------------------------------

| Command | Purpose |
| --- | --- |
| `/add-dir` | Add additional working directories |
| `/agents` | Manage custom AI subagents for specialized tasks |
| `/bug` | Report bugs (sends conversation to Anthropic) |
| `/clear` | Clear conversation history |
| `/compact [instructions]` | Compact conversation with optional focus instructions |
| `/config` | Open the Settings interface (Config tab) |
| `/cost` | Show token usage statistics (see [cost tracking guide](/en/docs/claude-code/costs#using-the-cost-command) for subscription-specific details) |
| `/doctor` | Checks the health of your Claude Code installation |
| `/help` | Get usage help |
| `/init` | Initialize project with CLAUDE.md guide |
| `/login` | Switch Anthropic accounts |
| `/logout` | Sign out from your Anthropic account |
| `/mcp` | Manage MCP server connections and OAuth authentication |
| `/memory` | Edit CLAUDE.md memory files |
| `/model` | Select or change the AI model |
| `/permissions` | View or update [permissions](/en/docs/claude-code/iam#configuring-permissions) |
| `/pr_comments` | View pull request comments |
| `/review` | Request code review |
| `/rewind` | Rewind the conversation and/or code |
| `/status` | Open the Settings interface (Status tab) showing version, model, account, and connectivity |
| `/terminal-setup` | Install Shift+Enter key binding for newlines (iTerm2 and VSCode only) |
| `/usage` | Show plan usage limits and rate limit status (subscription plans only) |
| `/vim` | Enter vim mode for alternating insert and command modes |

[​](#custom-slash-commands) Custom slash commands
-------------------------------------------------

Custom slash commands allow you to define frequently-used prompts as Markdown files that Claude Code can execute. Commands are organized by scope (project-specific or personal) and support namespacing through directory structures.

### [​](#syntax) Syntax

Copy

```
/<command-name> [arguments]
```

#### [​](#parameters) Parameters

| Parameter | Description |
| --- | --- |
| `<command-name>` | Name derived from the Markdown filename (without `.md` extension) |
| `[arguments]` | Optional arguments passed to the command |

### [​](#command-types) Command types

#### [​](#project-commands) Project commands

Commands stored in your repository and shared with your team. When listed in `/help`, these commands show “(project)” after their description.
**Location**: `.claude/commands/`
In the following example, we create the `/optimize` command:

Copy

```
# Create a project command
mkdir -p .claude/commands
echo "Analyze this code for performance issues and suggest optimizations:" > .claude/commands/optimize.md
```

#### [​](#personal-commands) Personal commands

Commands available across all your projects. When listed in `/help`, these commands show “(user)” after their description.
**Location**: `~/.claude/commands/`
In the following example, we create the `/security-review` command:

Copy

```
# Create a personal command
mkdir -p ~/.claude/commands
echo "Review this code for security vulnerabilities:" > ~/.claude/commands/security-review.md
```

### [​](#features) Features

#### [​](#namespacing) Namespacing

Organize commands in subdirectories. The subdirectories are used for organization and appear in the command description, but they do not affect the command name itself. The description will show whether the command comes from the project directory (`.claude/commands`) or the user-level directory (`~/.claude/commands`), along with the subdirectory name.
Conflicts between user and project level commands are not supported. Otherwise, multiple commands with the same base file name can coexist.
For example, a file at `.claude/commands/frontend/component.md` creates the command `/component` with description showing “(project:frontend)”.
Meanwhile, a file at `~/.claude/commands/component.md` creates the command `/component` with description showing “(user)”.

#### [​](#arguments) Arguments

Pass dynamic values to commands using argument placeholders:

##### All arguments with `$ARGUMENTS`

The `$ARGUMENTS` placeholder captures all arguments passed to the command:

Copy

```
# Command definition
echo 'Fix issue #$ARGUMENTS following our coding standards' > .claude/commands/fix-issue.md

# Usage
> /fix-issue 123 high-priority
# $ARGUMENTS becomes: "123 high-priority"
```

##### Individual arguments with `$1`, `$2`, etc.

Access specific arguments individually using positional parameters (similar to shell scripts):

Copy

```
# Command definition  
echo 'Review PR #$1 with priority $2 and assign to $3' > .claude/commands/review-pr.md

# Usage
> /review-pr 456 high alice
# $1 becomes "456", $2 becomes "high", $3 becomes "alice"
```

Use positional arguments when you need to:

* Access arguments individually in different parts of your command
* Provide defaults for missing arguments
* Build more structured commands with specific parameter roles

#### [​](#bash-command-execution) Bash command execution

Execute bash commands before the slash command runs using the `!` prefix. The output is included in the command context. You *must* include `allowed-tools` with the `Bash` tool, but you can choose the specific bash commands to allow.
For example:

Copy

```
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
description: Create a git commit
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

## Your task

Based on the above changes, create a single git commit.
```

#### [​](#file-references) File references

Include file contents in commands using the `@` prefix to [reference files](/en/docs/claude-code/common-workflows#reference-files-and-directories).
For example:

Copy

```
# Reference a specific file

Review the implementation in @src/utils/helpers.js

# Reference multiple files

Compare @src/old-version.js with @src/new-version.js
```

#### [​](#thinking-mode) Thinking mode

Slash commands can trigger extended thinking by including [extended thinking keywords](/en/docs/claude-code/common-workflows#use-extended-thinking).

### [​](#frontmatter) Frontmatter

Command files support frontmatter, useful for specifying metadata about the command:

| Frontmatter | Purpose | Default |
| --- | --- | --- |
| `allowed-tools` | List of tools the command can use | Inherits from the conversation |
| `argument-hint` | The arguments expected for the slash command. Example: `argument-hint: add [tagId] | remove [tagId] | list`. This hint is shown to the user when auto-completing the slash command. | None |
| `description` | Brief description of the command | Uses the first line from the prompt |
| `model` | Specific model string (see [Models overview](/en/docs/about-claude/models/overview)) | Inherits from the conversation |
| `disable-model-invocation` | Whether to prevent `SlashCommand` tool from calling this command | false |

For example:

Copy

```
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
argument-hint: [message]
description: Create a git commit
model: claude-3-5-haiku-20241022
---

Create a git commit with message: $ARGUMENTS
```

Example using positional arguments:

Copy

```
---
argument-hint: [pr-number] [priority] [assignee]
description: Review pull request
---

Review PR #$1 with priority $2 and assign to $3.
Focus on security, performance, and code style.
```

[​](#plugin-commands) Plugin commands
-------------------------------------

[Plugins](/en/docs/claude-code/plugins) can provide custom slash commands that integrate seamlessly with Claude Code. Plugin commands work exactly like user-defined commands but are distributed through [plugin marketplaces](/en/docs/claude-code/plugin-marketplaces).

### [​](#how-plugin-commands-work) How plugin commands work

Plugin commands are:

* **Namespaced**: Commands can use the format `/plugin-name:command-name` to avoid conflicts (plugin prefix is optional unless there are name collisions)
* **Automatically available**: Once a plugin is installed and enabled, its commands appear in `/help`
* **Fully integrated**: Support all command features (arguments, frontmatter, bash execution, file references)

### [​](#plugin-command-structure) Plugin command structure

**Location**: `commands/` directory in plugin root
**File format**: Markdown files with frontmatter
**Basic command structure**:

Copy

```
---
description: Brief description of what the command does
---

# Command Name

Detailed instructions for Claude on how to execute this command.
Include specific guidance on parameters, expected outcomes, and any special considerations.
```

**Advanced command features**:

* **Arguments**: Use placeholders like `{arg1}` in command descriptions
* **Subdirectories**: Organize commands in subdirectories for namespacing
* **Bash integration**: Commands can execute shell scripts and programs
* **File references**: Commands can reference and modify project files

### [​](#invocation-patterns) Invocation patterns

Direct command (when no conflicts)

Copy

```
/command-name
```

Plugin-prefixed (when needed for disambiguation)

Copy

```
/plugin-name:command-name
```

With arguments (if command supports them)

Copy

```
/command-name arg1 arg2
```

[​](#mcp-slash-commands) MCP slash commands
-------------------------------------------

MCP servers can expose prompts as slash commands that become available in Claude Code. These commands are dynamically discovered from connected MCP servers.

### [​](#command-format) Command format

MCP commands follow the pattern:

Copy

```
/mcp__<server-name>__<prompt-name> [arguments]
```

### [​](#features-2) Features

#### [​](#dynamic-discovery) Dynamic discovery

MCP commands are automatically available when:

* An MCP server is connected and active
* The server exposes prompts through the MCP protocol
* The prompts are successfully retrieved during connection

#### [​](#arguments-2) Arguments

MCP prompts can accept arguments defined by the server:

Copy

```
# Without arguments
> /mcp__github__list_prs

# With arguments
> /mcp__github__pr_review 456
> /mcp__jira__create_issue "Bug title" high
```

#### [​](#naming-conventions) Naming conventions

* Server and prompt names are normalized
* Spaces and special characters become underscores
* Names are lowercased for consistency

### [​](#managing-mcp-connections) Managing MCP connections

Use the `/mcp` command to:

* View all configured MCP servers
* Check connection status
* Authenticate with OAuth-enabled servers
* Clear authentication tokens
* View available tools and prompts from each server

### [​](#mcp-permissions-and-wildcards) MCP permissions and wildcards

When configuring [permissions for MCP tools](/en/docs/claude-code/iam#tool-specific-permission-rules), note that **wildcards are not supported**:

* ✅ **Correct**: `mcp__github` (approves ALL tools from the github server)
* ✅ **Correct**: `mcp__github__get_issue` (approves specific tool)
* ❌ **Incorrect**: `mcp__github__*` (wildcards not supported)

To approve all tools from an MCP server, use just the server name: `mcp__servername`. To approve specific tools only, list each tool individually.

[​](#slashcommand-tool) `SlashCommand` tool
-------------------------------------------

The `SlashCommand` tool allows Claude to execute [custom slash commands](/en/docs/claude-code/slash-commands#custom-slash-commands) programmatically
during a conversation. This gives Claude the ability to invoke custom commands
on your behalf when appropriate.
To encourage Claude to trigger `SlashCommand` tool, your instructions (prompts,
CLAUDE.md, etc.) generally need to reference the command by name with its slash.
Example:

Copy

```
> Run /write-unit-test when you are about to start writing tests.
```

This tool puts each available custom slash command’s metadata into context up to the
character budget limit. You can use `/context` to monitor token usage and follow
the operations below to manage context.

### [​](#slashcommand-tool-supported-commands) `SlashCommand` tool supported commands

`SlashCommand` tool only supports custom slash commands that:

* Are user-defined. Built-in commands like `/compact` and `/init` are *not* supported.
* Have the `description` frontmatter field populated. We use the `description` in the context.

For Claude Code versions >= 1.0.124, you can see which custom slash commands
`SlashCommand` tool can invoke by running `claude --debug` and triggering a query.

### [​](#disable-slashcommand-tool) Disable `SlashCommand` tool

To prevent Claude from executing any slash commands via the tool:

Copy

```
/permissions
# Add to deny rules: SlashCommand
```

This will also remove SlashCommand tool (and the slash command descriptions) from context.

### [​](#disable-specific-commands-only) Disable specific commands only

To prevent a specific slash command from becoming available, add
`disable-model-invocation: true` to the slash command’s frontmatter.
This will also remove the command’s metadata from context.

### [​](#slashcommand-permission-rules) `SlashCommand` permission rules

The permission rules support:

* **Exact match**: `SlashCommand:/commit` (allows only `/commit` with no arguments)
* **Prefix match**: `SlashCommand:/review-pr:*` (allows `/review-pr` with any arguments)

### [​](#character-budget-limit) Character budget limit

The `SlashCommand` tool includes a character budget to limit the size of command
descriptions shown to Claude. This prevents token overflow when many commands
are available.
The budget includes each custom slash command’s name, args, and description.

* **Default limit**: 15,000 characters
* **Custom limit**: Set via `SLASH_COMMAND_TOOL_CHAR_BUDGET` environment variable

When the character budget is exceeded, Claude will see only a subset of the
available commands. In `/context`, a warning will show with “M of N commands”.

[​](#see-also) See also
-----------------------

* [Plugins](/en/docs/claude-code/plugins) - Extend Claude Code with custom commands through plugins
* [Identity and Access Management](/en/docs/claude-code/iam) - Complete guide to permissions, including MCP tool permissions
* [Interactive mode](/en/docs/claude-code/interactive-mode) - Shortcuts, input modes, and interactive features
* [CLI reference](/en/docs/claude-code/cli-reference) - Command-line flags and options
* [Settings](/en/docs/claude-code/settings) - Configuration options
* [Memory management](/en/docs/claude-code/memory) - Managing Claude’s memory across sessions

Was this page helpful?

YesNo

[Interactive mode](/en/docs/claude-code/interactive-mode)[Checkpointing](/en/docs/claude-code/checkpointing)

Assistant

Responses are generated using AI and may contain mistakes.

[Claude Docs home page![light logo](https://mintcdn.com/anthropic-claude-docs/DcI2Ybid7ZEnFaf0/logo/light.svg?fit=max&auto=format&n=DcI2Ybid7ZEnFaf0&q=85&s=c877c45432515ee69194cb19e9f983a2)![dark logo](https://mintcdn.com/anthropic-claude-docs/DcI2Ybid7ZEnFaf0/logo/dark.svg?fit=max&auto=format&n=DcI2Ybid7ZEnFaf0&q=85&s=f5bb877be0cb3cba86cf6d7c88185216)](/)

[x](https://x.com/AnthropicAI)[linkedin](https://www.linkedin.com/company/anthropicresearch)

Company

[Anthropic](https://www.anthropic.com/company)[Careers](https://www.anthropic.com/careers)[Economic Futures](https://www.anthropic.com/economic-futures)[Research](https://www.anthropic.com/research)[News](https://www.anthropic.com/news)[Trust center](https://trust.anthropic.com/)[Transparency](https://www.anthropic.com/transparency)

Help and security

[Availability](https://www.anthropic.com/supported-countries)[Status](https://status.anthropic.com/)[Support center](https://support.claude.com/)

Learn

[Courses](https://www.anthropic.com/learn)[MCP connectors](https://claude.com/partners/mcp)[Customer stories](https://www.claude.com/customers)[Engineering blog](https://www.anthropic.com/engineering)[Events](https://www.anthropic.com/events)[Powered by Claude](https://claude.com/partners/powered-by-claude)[Service partners](https://claude.com/partners/services)[Startups program](https://claude.com/programs/startups)

Terms and policies

[Privacy policy](https://www.anthropic.com/legal/privacy)[Disclosure policy](https://www.anthropic.com/responsible-disclosure-policy)[Usage policy](https://www.anthropic.com/legal/aup)[Commercial terms](https://www.anthropic.com/legal/commercial-terms)[Consumer terms](https://www.anthropic.com/legal/consumer-terms)