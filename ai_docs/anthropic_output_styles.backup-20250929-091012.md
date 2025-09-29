# Output Styles

> Updated from Anthropic's official documentation
> Source: https://docs.anthropic.com/en/docs/claude-code/output-styles
> Last updated: 2025-09-22T09:10:20.596621

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

Build with Claude Code

Output styles

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

* [Built-in output styles](#built-in-output-styles)
* [How output styles work](#how-output-styles-work)
* [Change your output style](#change-your-output-style)
* [Create a custom output style](#create-a-custom-output-style)
* [Comparisons to related features](#comparisons-to-related-features)
* [Output Styles vs. CLAUDE.md vs. —append-system-prompt](#output-styles-vs-claude-md-vs-%E2%80%94append-system-prompt)
* [Output Styles vs. Agents](#output-styles-vs-agents)
* [Output Styles vs. Custom Slash Commands](#output-styles-vs-custom-slash-commands)

Build with Claude Code

Output styles
=============

Copy page

Adapt Claude Code for uses beyond software engineering

Copy page

Output styles allow you to use Claude Code as any type of agent while keeping
its core capabilities, such as running local scripts, reading/writing files, and
tracking TODOs.

[​](#built-in-output-styles) Built-in output styles
---------------------------------------------------

Claude Code’s **Default** output style is the existing system prompt, designed
to help you complete software engineering tasks efficiently.
There are two additional built-in output styles focused on teaching you the
codebase and how Claude operates:

* **Explanatory**: Provides educational “Insights” in between helping you
  complete software engineering tasks. Helps you understand implementation
  choices and codebase patterns.
* **Learning**: Collaborative, learn-by-doing mode where Claude will not only
  share “Insights” while coding, but also ask you to contribute small, strategic
  pieces of code yourself. Claude Code will add `TODO(human)` markers in your
  code for you to implement.

[​](#how-output-styles-work) How output styles work
---------------------------------------------------

Output styles directly modify Claude Code’s system prompt.

* Non-default output styles exclude instructions specific to code generation and
  efficient output normally built into Claude Code (such as responding concisely
  and verifying code with tests).
* Instead, these output styles have their own custom instructions added to the
  system prompt.

[​](#change-your-output-style) Change your output style
-------------------------------------------------------

You can either:

* Run `/output-style` to access the menu and select your output style (this can
  also be accessed from the `/config` menu)
* Run `/output-style [style]`, such as `/output-style explanatory`, to directly
  switch to a style

These changes apply to the [local project level](/en/docs/claude-code/settings)
and are saved in `.claude/settings.local.json`.

[​](#create-a-custom-output-style) Create a custom output style
---------------------------------------------------------------

To set up a new output style with Claude’s help, run
`/output-style:new I want an output style that ...`
By default, output styles created through `/output-style:new` are saved as
markdown files at the user level in `~/.claude/output-styles` and can be used
across projects. They have the following structure:

Copy

```
---
name: My Custom Style
description:
  A brief description of what this style does, to be displayed to the user
---

# Custom Style Instructions

You are an interactive CLI tool that helps users with software engineering
tasks. [Your custom instructions here...]

## Specific Behaviors

[Define how the assistant should behave in this style...]
```

You can also create your own output style Markdown files and save them either at
the user level (`~/.claude/output-styles`) or the project level
(`.claude/output-styles`).

[​](#comparisons-to-related-features) Comparisons to related features
---------------------------------------------------------------------

### [​](#output-styles-vs-claude-md-vs-%E2%80%94append-system-prompt) Output Styles vs. CLAUDE.md vs. —append-system-prompt

Output styles completely “turn off” the parts of Claude Code’s default system
prompt specific to software engineering. Neither CLAUDE.md nor
`--append-system-prompt` edit Claude Code’s default system prompt. CLAUDE.md
adds the contents as a user message *following* Claude Code’s default system
prompt. `--append-system-prompt` appends the content to the system prompt.

### [​](#output-styles-vs-agents) Output Styles vs. [Agents](/en/docs/claude-code/sub-agents)

Output styles directly affect the main agent loop and only affect the system
prompt. Agents are invoked to handle specific tasks and can include additional
settings like the model to use, the tools they have available, and some context
about when to use the agent.

### [​](#output-styles-vs-custom-slash-commands) Output Styles vs. [Custom Slash Commands](/en/docs/claude-code/slash-commands)

You can think of output styles as “stored system prompts” and custom slash
commands as “stored prompts”.

Was this page helpful?

YesNo

[Subagents](/en/docs/claude-code/sub-agents)[Hooks](/en/docs/claude-code/hooks-guide)

[x](https://x.com/AnthropicAI)[linkedin](https://www.linkedin.com/company/anthropicresearch)

Assistant

Responses are generated using AI and may contain mistakes.