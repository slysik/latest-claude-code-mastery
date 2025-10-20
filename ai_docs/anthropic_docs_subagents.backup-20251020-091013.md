# Subagents

> Updated from Anthropic's official documentation
> Source: https://docs.anthropic.com/en/docs/claude-code/subagents
> Last updated: 2025-10-13T09:10:31.344126

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

Build with Claude Code

Subagents

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

* [What are subagents?](#what-are-subagents%3F)
* [Key benefits](#key-benefits)
* [Quick start](#quick-start)
* [Subagent configuration](#subagent-configuration)
* [File locations](#file-locations)
* [Plugin agents](#plugin-agents)
* [CLI-based configuration](#cli-based-configuration)
* [File format](#file-format)
* [Configuration fields](#configuration-fields)
* [Model selection](#model-selection)
* [Available tools](#available-tools)
* [Managing subagents](#managing-subagents)
* [Using the /agents command (Recommended)](#using-the-%2Fagents-command-recommended)
* [Direct file management](#direct-file-management)
* [Using subagents effectively](#using-subagents-effectively)
* [Automatic delegation](#automatic-delegation)
* [Explicit invocation](#explicit-invocation)
* [Example subagents](#example-subagents)
* [Code reviewer](#code-reviewer)
* [Debugger](#debugger)
* [Data scientist](#data-scientist)
* [Best practices](#best-practices)
* [Advanced usage](#advanced-usage)
* [Chaining subagents](#chaining-subagents)
* [Dynamic subagent selection](#dynamic-subagent-selection)
* [Performance considerations](#performance-considerations)
* [Related documentation](#related-documentation)

Build with Claude Code

Subagents
=========

Copy page

Create and use specialized AI subagents in Claude Code for task-specific workflows and improved context management.

Copy page

Custom subagents in Claude Code are specialized AI assistants that can be invoked to handle specific types of tasks. They enable more efficient problem-solving by providing task-specific configurations with customized system prompts, tools and a separate context window.

[​](#what-are-subagents%3F) What are subagents?
-----------------------------------------------

Subagents are pre-configured AI personalities that Claude Code can delegate tasks to. Each subagent:

* Has a specific purpose and expertise area
* Uses its own context window separate from the main conversation
* Can be configured with specific tools it’s allowed to use
* Includes a custom system prompt that guides its behavior

When Claude Code encounters a task that matches a subagent’s expertise, it can delegate that task to the specialized subagent, which works independently and returns results.

[​](#key-benefits) Key benefits
-------------------------------

Context preservation
--------------------

Each subagent operates in its own context, preventing pollution of the main conversation and keeping it focused on high-level objectives.

Specialized expertise
---------------------

Subagents can be fine-tuned with detailed instructions for specific domains, leading to higher success rates on designated tasks.

Reusability
-----------

Once created, subagents can be used across different projects and shared with your team for consistent workflows.

Flexible permissions
--------------------

Each subagent can have different tool access levels, allowing you to limit powerful tools to specific subagent types.

[​](#quick-start) Quick start
-----------------------------

To create your first subagent:

1

Open the subagents interface

Run the following command:

Copy

```
/agents
```

2

Select 'Create New Agent'

Choose whether to create a project-level or user-level subagent

3

Define the subagent

* **Recommended**: Generate with Claude first, then customize to make it yours
* Describe your subagent in detail and when it should be used
* Select the tools you want to grant access to (or leave blank to inherit all tools)
* The interface shows all available tools, making selection easy
* If you’re generating with Claude, you can also edit the system prompt in your own editor by pressing `e`

4

Save and use

Your subagent is now available! Claude will use it automatically when appropriate, or you can invoke it explicitly:

Copy

```
> Use the code-reviewer subagent to check my recent changes
```

[​](#subagent-configuration) Subagent configuration
---------------------------------------------------

### [​](#file-locations) File locations

Subagents are stored as Markdown files with YAML frontmatter in two possible locations:

| Type | Location | Scope | Priority |
| --- | --- | --- | --- |
| **Project subagents** | `.claude/agents/` | Available in current project | Highest |
| **User subagents** | `~/.claude/agents/` | Available across all projects | Lower |

When subagent names conflict, project-level subagents take precedence over user-level subagents.

### [​](#plugin-agents) Plugin agents

[Plugins](/en/docs/claude-code/plugins) can provide custom subagents that integrate seamlessly with Claude Code. Plugin agents work identically to user-defined agents and appear in the `/agents` interface.
**Plugin agent locations**: Plugins include agents in their `agents/` directory (or custom paths specified in the plugin manifest).
**Using plugin agents**:

* Plugin agents appear in `/agents` alongside your custom agents
* Can be invoked explicitly: “Use the code-reviewer agent from the security-plugin”
* Can be invoked automatically by Claude when appropriate
* Can be managed (viewed, inspected) through `/agents` interface

See the [plugin components reference](/en/docs/claude-code/plugins-reference#agents) for details on creating plugin agents.

### [​](#cli-based-configuration) CLI-based configuration

You can also define subagents dynamically using the `--agents` CLI flag, which accepts a JSON object:

Copy

```
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer. Use proactively after code changes.",
    "prompt": "You are a senior code reviewer. Focus on code quality, security, and best practices.",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  }
}'
```

**Priority**: CLI-defined subagents have lower priority than project-level subagents but higher priority than user-level subagents.
**Use case**: This approach is useful for:

* Quick testing of subagent configurations
* Session-specific subagents that don’t need to be saved
* Automation scripts that need custom subagents
* Sharing subagent definitions in documentation or scripts

For detailed information about the JSON format and all available options, see the [CLI reference documentation](/en/docs/claude-code/cli-reference#agents-flag-format).

### [​](#file-format) File format

Each subagent is defined in a Markdown file with this structure:

Copy

```
---
name: your-sub-agent-name
description: Description of when this subagent should be invoked
tools: tool1, tool2, tool3  # Optional - inherits all tools if omitted
model: sonnet  # Optional - specify model alias or 'inherit'
---

Your subagent's system prompt goes here. This can be multiple paragraphs
and should clearly define the subagent's role, capabilities, and approach
to solving problems.

Include specific instructions, best practices, and any constraints
the subagent should follow.
```

#### [​](#configuration-fields) Configuration fields

| Field | Required | Description |
| --- | --- | --- |
| `name` | Yes | Unique identifier using lowercase letters and hyphens |
| `description` | Yes | Natural language description of the subagent’s purpose |
| `tools` | No | Comma-separated list of specific tools. If omitted, inherits all tools from the main thread |
| `model` | No | Model to use for this subagent. Can be a model alias (`sonnet`, `opus`, `haiku`) or `'inherit'` to use the main conversation’s model. If omitted, defaults to the [configured subagent model](/en/docs/claude-code/model-config) |

### [​](#model-selection) Model selection

The `model` field allows you to control which [AI model](/en/docs/claude-code/model-config) the subagent uses:

* **Model alias**: Use one of the available aliases: `sonnet`, `opus`, or `haiku`
* **`'inherit'`**: Use the same model as the main conversation (useful for consistency)
* **Omitted**: If not specified, uses the default model configured for subagents (`sonnet`)

Using `'inherit'` is particularly useful when you want your subagents to adapt to the model choice of the main conversation, ensuring consistent capabilities and response style throughout your session.

### [​](#available-tools) Available tools

Subagents can be granted access to any of Claude Code’s internal tools. See the [tools documentation](/en/docs/claude-code/settings#tools-available-to-claude) for a complete list of available tools.

**Recommended:** Use the `/agents` command to modify tool access - it provides an interactive interface that lists all available tools, including any connected MCP server tools, making it easier to select the ones you need.

You have two options for configuring tools:

* **Omit the `tools` field** to inherit all tools from the main thread (default), including MCP tools
* **Specify individual tools** as a comma-separated list for more granular control (can be edited manually or via `/agents`)

**MCP Tools**: Subagents can access MCP tools from configured MCP servers. When the `tools` field is omitted, subagents inherit all MCP tools available to the main thread.

[​](#managing-subagents) Managing subagents
-------------------------------------------

### [​](#using-the-%2Fagents-command-recommended) Using the /agents command (Recommended)

The `/agents` command provides a comprehensive interface for subagent management:

Copy

```
/agents
```

This opens an interactive menu where you can:

* View all available subagents (built-in, user, and project)
* Create new subagents with guided setup
* Edit existing custom subagents, including their tool access
* Delete custom subagents
* See which subagents are active when duplicates exist
* **Easily manage tool permissions** with a complete list of available tools

### [​](#direct-file-management) Direct file management

You can also manage subagents by working directly with their files:

Copy

```
# Create a project subagent
mkdir -p .claude/agents
echo '---
name: test-runner
description: Use proactively to run tests and fix failures
---

You are a test automation expert. When you see code changes, proactively run the appropriate tests. If tests fail, analyze the failures and fix them while preserving the original test intent.' > .claude/agents/test-runner.md

# Create a user subagent
mkdir -p ~/.claude/agents
# ... create subagent file
```

[​](#using-subagents-effectively) Using subagents effectively
-------------------------------------------------------------

### [​](#automatic-delegation) Automatic delegation

Claude Code proactively delegates tasks based on:

* The task description in your request
* The `description` field in subagent configurations
* Current context and available tools

To encourage more proactive subagent use, include phrases like “use PROACTIVELY” or “MUST BE USED” in your `description` field.

### [​](#explicit-invocation) Explicit invocation

Request a specific subagent by mentioning it in your command:

Copy

```
> Use the test-runner subagent to fix failing tests
> Have the code-reviewer subagent look at my recent changes
> Ask the debugger subagent to investigate this error
```

[​](#example-subagents) Example subagents
-----------------------------------------

### [​](#code-reviewer) Code reviewer

Copy

```
---
name: code-reviewer
description: Expert code review specialist. Proactively reviews code for quality, security, and maintainability. Use immediately after writing or modifying code.
tools: Read, Grep, Glob, Bash
model: inherit
---

You are a senior code reviewer ensuring high standards of code quality and security.

When invoked:
1. Run git diff to see recent changes
2. Focus on modified files
3. Begin review immediately

Review checklist:
- Code is simple and readable
- Functions and variables are well-named
- No duplicated code
- Proper error handling
- No exposed secrets or API keys
- Input validation implemented
- Good test coverage
- Performance considerations addressed

Provide feedback organized by priority:
- Critical issues (must fix)
- Warnings (should fix)
- Suggestions (consider improving)

Include specific examples of how to fix issues.
```

### [​](#debugger) Debugger

Copy

```
---
name: debugger
description: Debugging specialist for errors, test failures, and unexpected behavior. Use proactively when encountering any issues.
tools: Read, Edit, Bash, Grep, Glob
---

You are an expert debugger specializing in root cause analysis.

When invoked:
1. Capture error message and stack trace
2. Identify reproduction steps
3. Isolate the failure location
4. Implement minimal fix
5. Verify solution works

Debugging process:
- Analyze error messages and logs
- Check recent code changes
- Form and test hypotheses
- Add strategic debug logging
- Inspect variable states

For each issue, provide:
- Root cause explanation
- Evidence supporting the diagnosis
- Specific code fix
- Testing approach
- Prevention recommendations

Focus on fixing the underlying issue, not just symptoms.
```

### [​](#data-scientist) Data scientist

Copy

```
---
name: data-scientist
description: Data analysis expert for SQL queries, BigQuery operations, and data insights. Use proactively for data analysis tasks and queries.
tools: Bash, Read, Write
model: sonnet
---

You are a data scientist specializing in SQL and BigQuery analysis.

When invoked:
1. Understand the data analysis requirement
2. Write efficient SQL queries
3. Use BigQuery command line tools (bq) when appropriate
4. Analyze and summarize results
5. Present findings clearly

Key practices:
- Write optimized SQL queries with proper filters
- Use appropriate aggregations and joins
- Include comments explaining complex logic
- Format results for readability
- Provide data-driven recommendations

For each analysis:
- Explain the query approach
- Document any assumptions
- Highlight key findings
- Suggest next steps based on data

Always ensure queries are efficient and cost-effective.
```

[​](#best-practices) Best practices
-----------------------------------

* **Start with Claude-generated agents**: We highly recommend generating your initial subagent with Claude and then iterating on it to make it personally yours. This approach gives you the best results - a solid foundation that you can customize to your specific needs.
* **Design focused subagents**: Create subagents with single, clear responsibilities rather than trying to make one subagent do everything. This improves performance and makes subagents more predictable.
* **Write detailed prompts**: Include specific instructions, examples, and constraints in your system prompts. The more guidance you provide, the better the subagent will perform.
* **Limit tool access**: Only grant tools that are necessary for the subagent’s purpose. This improves security and helps the subagent focus on relevant actions.
* **Version control**: Check project subagents into version control so your team can benefit from and improve them collaboratively.

[​](#advanced-usage) Advanced usage
-----------------------------------

### [​](#chaining-subagents) Chaining subagents

For complex workflows, you can chain multiple subagents:

Copy

```
> First use the code-analyzer subagent to find performance issues, then use the optimizer subagent to fix them
```

### [​](#dynamic-subagent-selection) Dynamic subagent selection

Claude Code intelligently selects subagents based on context. Make your `description` fields specific and action-oriented for best results.

[​](#performance-considerations) Performance considerations
-----------------------------------------------------------

* **Context efficiency**: Agents help preserve main context, enabling longer overall sessions
* **Latency**: Subagents start off with a clean slate each time they are invoked and may add latency as they gather context that they require to do their job effectively.

[​](#related-documentation) Related documentation
-------------------------------------------------

* [Plugins](/en/docs/claude-code/plugins) - Extend Claude Code with custom agents through plugins
* [Slash commands](/en/docs/claude-code/slash-commands) - Learn about other built-in commands
* [Settings](/en/docs/claude-code/settings) - Configure Claude Code behavior
* [Hooks](/en/docs/claude-code/hooks) - Automate workflows with event handlers

Was this page helpful?

YesNo

[Common workflows](/en/docs/claude-code/common-workflows)[Plugins](/en/docs/claude-code/plugins)

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