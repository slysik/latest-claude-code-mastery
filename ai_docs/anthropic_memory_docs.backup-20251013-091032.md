# Memory

> Updated from Anthropic's official documentation
> Source: https://docs.anthropic.com/en/docs/claude-code/memory
> Last updated: 2025-09-29T09:10:13.345804

[Claude Docs home page![light logo](https://mintcdn.com/anthropic-claude-docs/DcI2Ybid7ZEnFaf0/logo/light.svg?fit=max&auto=format&n=DcI2Ybid7ZEnFaf0&q=85&s=c877c45432515ee69194cb19e9f983a2)![dark logo](https://mintcdn.com/anthropic-claude-docs/DcI2Ybid7ZEnFaf0/logo/dark.svg?fit=max&auto=format&n=DcI2Ybid7ZEnFaf0&q=85&s=f5bb877be0cb3cba86cf6d7c88185216)](/)

![US](https://d3gk2c5xim1je2.cloudfront.net/flags/US.svg)

English

Search...

⌘K

* [Console](https://console.anthropic.com/login)
* [Support](https://support.claude.com/)
* [Research](https://www.anthropic.com/research)
* [Discord](https://www.anthropic.com/discord)
* [Sign up](https://console.anthropic.com/login)
* [Sign up](https://console.anthropic.com/login)

Search...

Navigation

Configuration

Manage Claude's memory

[Welcome](/en/home)[Claude Developer Platform](/en/docs/intro)[Claude Code](/en/docs/claude-code/overview)[Model Context Protocol (MCP)](/en/docs/mcp)[API Reference](/en/api/messages)[Resources](/en/resources/overview)[Release Notes](/en/release-notes/overview)

##### Getting started

* [Overview](/en/docs/claude-code/overview)
* [Quickstart](/en/docs/claude-code/quickstart)
* [Common workflows](/en/docs/claude-code/common-workflows)

##### Build with Claude Code

* [Subagents](/en/docs/claude-code/sub-agents)
* [Output styles](/en/docs/claude-code/output-styles)
* [Hooks](/en/docs/claude-code/hooks-guide)
* [GitHub Actions](/en/docs/claude-code/github-actions)
* [GitLab CI/CD](/en/docs/claude-code/gitlab-ci-cd)
* [Model Context Protocol (MCP)](/en/docs/claude-code/mcp)
* [Troubleshooting](/en/docs/claude-code/troubleshooting)

##### Claude Code SDK

* [Overview](/en/docs/claude-code/sdk/sdk-overview)
* [TypeScript SDK reference](/en/docs/claude-code/sdk/sdk-typescript)
* [Python SDK reference](/en/docs/claude-code/sdk/sdk-python)
* [Headless mode](/en/docs/claude-code/sdk/sdk-headless)
* Guides

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

##### Configuration

* [Settings](/en/docs/claude-code/settings)
* [Add Claude Code to your IDE](/en/docs/claude-code/ide-integrations)
* [Terminal configuration](/en/docs/claude-code/terminal-config)
* [Model configuration](/en/docs/claude-code/model-config)
* [Memory management](/en/docs/claude-code/memory)
* [Status line configuration](/en/docs/claude-code/statusline)

##### Reference

* [CLI reference](/en/docs/claude-code/cli-reference)
* [Interactive mode](/en/docs/claude-code/interactive-mode)
* [Slash commands](/en/docs/claude-code/slash-commands)
* [Hooks reference](/en/docs/claude-code/hooks)

##### Resources

* [Legal and compliance](/en/docs/claude-code/legal-and-compliance)

On this page

* [Determine memory type](#determine-memory-type)
* [CLAUDE.md imports](#claude-md-imports)
* [How Claude looks up memories](#how-claude-looks-up-memories)
* [Quickly add memories with the # shortcut](#quickly-add-memories-with-the-%23-shortcut)
* [Directly edit memories with /memory](#directly-edit-memories-with-%2Fmemory)
* [Set up project memory](#set-up-project-memory)
* [Organization-level memory management](#organization-level-memory-management)
* [Memory best practices](#memory-best-practices)

Configuration

Manage Claude's memory
======================

Copy page

Learn how to manage Claude Code’s memory across sessions with different memory locations and best practices.

Copy page

Claude Code can remember your preferences across sessions, like style guidelines and common commands in your workflow.

[​](#determine-memory-type) Determine memory type
-------------------------------------------------

Claude Code offers four memory locations in a hierarchical structure, each serving a different purpose:

| Memory Type | Location | Purpose | Use Case Examples | Shared With |
| --- | --- | --- | --- | --- |
| **Enterprise policy** | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md` Linux: `/etc/claude-code/CLAUDE.md` Windows: `C:\ProgramData\ClaudeCode\CLAUDE.md` | Organization-wide instructions managed by IT/DevOps | Company coding standards, security policies, compliance requirements | All users in organization |
| **Project memory** | `./CLAUDE.md` or `./.claude/CLAUDE.md` | Team-shared instructions for the project | Project architecture, coding standards, common workflows | Team members via source control |
| **User memory** | `~/.claude/CLAUDE.md` | Personal preferences for all projects | Code styling preferences, personal tooling shortcuts | Just you (all projects) |
| **Project memory (local)** | `./CLAUDE.local.md` | Personal project-specific preferences | *(Deprecated, see below)* Your sandbox URLs, preferred test data | Just you (current project) |

All memory files are automatically loaded into Claude Code’s context when launched. Files higher in the hierarchy take precedence and are loaded first, providing a foundation that more specific memories build upon.

[​](#claude-md-imports) CLAUDE.md imports
-----------------------------------------

CLAUDE.md files can import additional files using `@path/to/import` syntax. The following example imports 3 files:

Copy

```
See @README for project overview and @package.json for available npm commands for this project.

# Additional Instructions
- git workflow @docs/git-instructions.md
```

Both relative and absolute paths are allowed. In particular, importing files in user’s home dir is a convenient way for your team members to provide individual instructions that are not checked into the repository. Previously CLAUDE.local.md served a similar purpose, but is now deprecated in favor of imports since they work better across multiple git worktrees.

Copy

```
# Individual Preferences
- @~/.claude/my-project-instructions.md
```

To avoid potential collisions, imports are not evaluated inside markdown code spans and code blocks.

Copy

```
This code span will not be treated as an import: `@anthropic-ai/claude-code`
```

Imported files can recursively import additional files, with a max-depth of 5 hops. You can see what memory files are loaded by running `/memory` command.

[​](#how-claude-looks-up-memories) How Claude looks up memories
---------------------------------------------------------------

Claude Code reads memories recursively: starting in the cwd, Claude Code recurses up to (but not including) the root directory */* and reads any CLAUDE.md or CLAUDE.local.md files it finds. This is especially convenient when working in large repositories where you run Claude Code in *foo/bar/*, and have memories in both *foo/CLAUDE.md* and *foo/bar/CLAUDE.md*.
Claude will also discover CLAUDE.md nested in subtrees under your current working directory. Instead of loading them at launch, they are only included when Claude reads files in those subtrees.

[​](#quickly-add-memories-with-the-%23-shortcut) Quickly add memories with the `#` shortcut
-------------------------------------------------------------------------------------------

The fastest way to add a memory is to start your input with the `#` character:

Copy

```
# Always use descriptive variable names
```

You’ll be prompted to select which memory file to store this in.

[​](#directly-edit-memories-with-%2Fmemory) Directly edit memories with `/memory`
---------------------------------------------------------------------------------

Use the `/memory` slash command during a session to open any memory file in your system editor for more extensive additions or organization.

[​](#set-up-project-memory) Set up project memory
-------------------------------------------------

Suppose you want to set up a CLAUDE.md file to store important project information, conventions, and frequently used commands. Project memory can be stored in either `./CLAUDE.md` or `./.claude/CLAUDE.md`.
Bootstrap a CLAUDE.md for your codebase with the following command:

Copy

```
> /init
```

Tips:

* Include frequently used commands (build, test, lint) to avoid repeated searches
* Document code style preferences and naming conventions
* Add important architectural patterns specific to your project
* CLAUDE.md memories can be used for both instructions shared with your team and for your individual preferences.

[​](#organization-level-memory-management) Organization-level memory management
-------------------------------------------------------------------------------

Enterprise organizations can deploy centrally managed CLAUDE.md files that apply to all users.
To set up organization-level memory management:

1. Create the enterprise memory file in the appropriate location for your operating system:

* macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`
* Linux/WSL: `/etc/claude-code/CLAUDE.md`
* Windows: `C:\ProgramData\ClaudeCode\CLAUDE.md`

2. Deploy via your configuration management system (MDM, Group Policy, Ansible, etc.) to ensure consistent distribution across all developer machines.

[​](#memory-best-practices) Memory best practices
-------------------------------------------------

* **Be specific**: “Use 2-space indentation” is better than “Format code properly”.
* **Use structure to organize**: Format each individual memory as a bullet point and group related memories under descriptive markdown headings.
* **Review periodically**: Update memories as your project evolves to ensure Claude is always using the most up to date information and context.

Was this page helpful?

YesNo

[Model configuration](/en/docs/claude-code/model-config)[Status line configuration](/en/docs/claude-code/statusline)

[x](https://x.com/AnthropicAI)[linkedin](https://www.linkedin.com/company/anthropicresearch)

Assistant

Responses are generated using AI and may contain mistakes.