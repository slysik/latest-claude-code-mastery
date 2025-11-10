# Output Styles

> Updated from Anthropic's official documentation
> Source: https://docs.anthropic.com/en/docs/claude-code/output-styles
> Last updated: 2025-11-03T09:10:59.934705

Agent Skills are now available! [Learn more about extending Claude's capabilities with Agent Skills](/en/docs/agents-and-tools/agent-skills/overview).

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

Output styles

[Home](/en/home)[Developer Guide](/en/docs/intro)[API Reference](/en/api/overview)[Claude Code](/en/docs/claude-code/overview)[Model Context Protocol (MCP)](/en/docs/mcp)[Resources](/en/resources/overview)[Release Notes](/en/release-notes/overview)

##### Getting started

* [Overview](/en/docs/claude-code/overview)
* [Quickstart](/en/docs/claude-code/quickstart)
* [Common workflows](/en/docs/claude-code/common-workflows)
* [Claude Code on the web](/en/docs/claude-code/claude-code-on-the-web)

##### Build with Claude Code

* [Subagents](/en/docs/claude-code/sub-agents)
* [Plugins](/en/docs/claude-code/plugins)
* [Agent Skills](/en/docs/claude-code/skills)
* [Output styles](/en/docs/claude-code/output-styles)
* [Hooks](/en/docs/claude-code/hooks-guide)
* [Headless mode](/en/docs/claude-code/headless)
* [GitHub Actions](/en/docs/claude-code/github-actions)
* [GitLab CI/CD](/en/docs/claude-code/gitlab-ci-cd)
* [Model Context Protocol (MCP)](/en/docs/claude-code/mcp)
* [Troubleshooting](/en/docs/claude-code/troubleshooting)

##### Claude Agent SDK

* [Migrate to Claude Agent SDK](/en/docs/claude-code/sdk/migration-guide)

##### Deployment

* [Overview](/en/docs/claude-code/third-party-integrations)
* [Amazon Bedrock](/en/docs/claude-code/amazon-bedrock)
* [Google Vertex AI](/en/docs/claude-code/google-vertex-ai)
* [Network configuration](/en/docs/claude-code/network-config)
* [LLM gateway](/en/docs/claude-code/llm-gateway)
* [Development containers](/en/docs/claude-code/devcontainer)
* [Sandboxing](/en/docs/claude-code/sandboxing)

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

* [Deprecation timeline](#deprecation-timeline)
* [Alternative: Use plugins instead](#alternative%3A-use-plugins-instead)
* [Example: Explanatory Output Style Plugin](#example%3A-explanatory-output-style-plugin)
* [Installing a plugin](#installing-a-plugin)
* [Migration guide](#migration-guide)
* [Use SessionStart hooks for context injection](#use-sessionstart-hooks-for-context-injection)
* [Use Subagents for different system prompts](#use-subagents-for-different-system-prompts)
* [Reference: Original output styles documentation](#reference%3A-original-output-styles-documentation)
* [Built-in output styles](#built-in-output-styles)
* [How output styles work](#how-output-styles-work)
* [Change your output style](#change-your-output-style)
* [Comparisons to related features](#comparisons-to-related-features)
* [Output Styles vs. CLAUDE.md vs. —append-system-prompt](#output-styles-vs-claude-md-vs-%E2%80%94append-system-prompt)
* [Output Styles vs. Agents](#output-styles-vs-agents)
* [Output Styles vs. Custom Slash Commands](#output-styles-vs-custom-slash-commands)

Build with Claude Code

Output styles
=============

Copy page

[DEPRECATED] Adapt Claude Code for uses beyond software engineering

Copy page

Output styles are **DEPRECATED.** On **November 5, 2025** or later, we’ll
automatically convert your **user-level** output style files to plugins and
stop supporting the output styles feature. Use
[plugins](/en/docs/claude-code/plugins) instead. ([example
plugin](https://github.com/anthropics/claude-code/tree/main/plugins/explanatory-output-style)
for the built-in Explanatory output style)

[​](#deprecation-timeline) Deprecation timeline
-----------------------------------------------

As of **November 5, 2025**, Claude Code will:

* Automatically convert user-level output style files
  (`~/.claude/output-styles`) to plugins
* Stop supporting the output styles feature
* Remove the `/output-style` command and related functionality

**What you need to do:**

* Migrate to plugins before November 5, 2025 for a smoother transition
* Review the migration guide below to understand your options

[​](#alternative%3A-use-plugins-instead) Alternative: Use plugins instead
-------------------------------------------------------------------------

Plugins provide more powerful and flexible ways to customize Claude Code’s
behavior. The
[`explanatory-output-style` plugin](https://github.com/anthropics/claude-code/tree/main/plugins/explanatory-output-style)
recreates the deprecated Explanatory output style functionality.

### [​](#example%3A-explanatory-output-style-plugin) Example: Explanatory Output Style Plugin

The `explanatory-output-style` plugin uses a SessionStart hook to inject
additional context that encourages Claude to provide educational insights.
Here’s what it does:

* Provides educational insights about implementation choices
* Explains codebase patterns and decisions
* Balances task completion with learning opportunities

### [​](#installing-a-plugin) Installing a plugin

To install a plugin like `explanatory-output-style`:

Add the marketplace (if not already added)

Copy

```
/plugin marketplace add anthropics/claude-code
```

Install the plugin

Copy

```
/plugin install explanatory-output-style@claude-code-plugins
```

Restart Claude Code to activate the plugin

Copy

```
/exit
```

Disable the plugin

Copy

```
/plugin manage explanatory-output-style@claude-code-plugins

1. Press enter when you see claude-code-marketplace
2. Press space when you see explanatory-output-style to toggle enabled
3. Press down to "Apply changes", then press enter
    You should see "Disabled 1 plugin. Restart Claude Code to apply changes."

/exit
```

For more details on plugins, see the
[Plugins documentation](/en/docs/claude-code/plugins).

[​](#migration-guide) Migration guide
-------------------------------------

Output styles directly modified Claude Code’s system prompt. Here’s how to
achieve similar effects with hooks and subagents, both available through Claude
Code plugins:

### [​](#use-sessionstart-hooks-for-context-injection) Use SessionStart hooks for context injection

If you used output styles to add context at the start of sessions, use
[SessionStart hooks](/en/docs/claude-code/hooks#sessionstart) instead.
The hook’s output (stdout) is added to the conversation context. You can also:

* Run scripts that dynamically generate context
* Load project-specific information

SessionStart hooks, just like CLAUDE.md, do not change the system prompt.

### [​](#use-subagents-for-different-system-prompts) Use Subagents for different system prompts

If you used output styles to change Claude’s behavior for specific tasks, use
[Subagents](/en/docs/claude-code/sub-agents) instead.
Subagents are specialized AI assistants with:

* Custom system prompts (must be in a separate context window from main loop)
* Specific tool access permissions
* Optional model to use, if not the main loop model

---

[​](#reference%3A-original-output-styles-documentation) Reference: Original output styles documentation
-------------------------------------------------------------------------------------------------------

The content below is preserved for reference only. Output styles are
deprecated and will be removed on November 5, 2025. Please migrate to plugins,
hooks, or subagents.

Output styles allow you to use Claude Code as any type of agent while keeping
its core capabilities, such as running local scripts, reading/writing files, and
tracking TODOs.

### [​](#built-in-output-styles) Built-in output styles

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

### [​](#how-output-styles-work) How output styles work

Output styles directly modify Claude Code’s system prompt.

* Non-default output styles exclude instructions specific to code generation and
  efficient output normally built into Claude Code (such as responding concisely
  and verifying code with tests).
* Instead, these output styles have their own custom instructions added to the
  system prompt.

### [​](#change-your-output-style) Change your output style

You can either:

* Run `/output-style` to access the menu and select your output style (this can
  also be accessed from the `/config` menu)
* Run `/output-style [style]`, such as `/output-style explanatory`, to directly
  switch to a style

These changes apply to the [local project level](/en/docs/claude-code/settings)
and are saved in `.claude/settings.local.json`.
You can also create your own output style Markdown files and save them either at
the user level (`~/.claude/output-styles`) or the project level
(`.claude/output-styles`).

### [​](#comparisons-to-related-features) Comparisons to related features

#### [​](#output-styles-vs-claude-md-vs-%E2%80%94append-system-prompt) Output Styles vs. CLAUDE.md vs. —append-system-prompt

Output styles completely “turn off” the parts of Claude Code’s default system
prompt specific to software engineering. Neither CLAUDE.md nor
`--append-system-prompt` edit Claude Code’s default system prompt. CLAUDE.md
adds the contents as a user message *following* Claude Code’s default system
prompt. `--append-system-prompt` appends the content to the system prompt.

#### [​](#output-styles-vs-agents) Output Styles vs. [Agents](/en/docs/claude-code/sub-agents)

Output styles directly affect the main agent loop and only affect the system
prompt. Agents are invoked to handle specific tasks and can include additional
settings like the model to use, the tools they have available, and some context
about when to use the agent.

#### [​](#output-styles-vs-custom-slash-commands) Output Styles vs. [Custom Slash Commands](/en/docs/claude-code/slash-commands)

You can think of output styles as “stored system prompts” and custom slash
commands as “stored prompts”.

Was this page helpful?

YesNo

[Agent Skills](/en/docs/claude-code/skills)[Hooks](/en/docs/claude-code/hooks-guide)

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