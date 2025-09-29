# Quick Start

> Updated from Anthropic's official documentation
> Source: https://docs.anthropic.com/en/docs/claude-code/quickstart
> Last updated: 2025-09-22T09:10:20.943161

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

Getting started

Quickstart

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

* [Before you begin](#before-you-begin)
* [Step 1: Install Claude Code](#step-1%3A-install-claude-code)
* [NPM Install](#npm-install)
* [Native Install](#native-install)
* [Step 2: Log in to your account](#step-2%3A-log-in-to-your-account)
* [Step 3: Start your first session](#step-3%3A-start-your-first-session)
* [Step 4: Ask your first question](#step-4%3A-ask-your-first-question)
* [Step 5: Make your first code change](#step-5%3A-make-your-first-code-change)
* [Step 6: Use Git with Claude Code](#step-6%3A-use-git-with-claude-code)
* [Step 7: Fix a bug or add a feature](#step-7%3A-fix-a-bug-or-add-a-feature)
* [Step 8: Test out other common workflows](#step-8%3A-test-out-other-common-workflows)
* [Essential commands](#essential-commands)
* [Pro tips for beginners](#pro-tips-for-beginners)
* [What’s next?](#what%E2%80%99s-next%3F)
* [Getting help](#getting-help)

Getting started

Quickstart
==========

Copy page

Welcome to Claude Code!

Copy page

This quickstart guide will have you using AI-powered coding assistance in just a few minutes. By the end, you’ll understand how to use Claude Code for common development tasks.

[​](#before-you-begin) Before you begin
---------------------------------------

Make sure you have:

* A terminal or command prompt open
* A code project to work with
* A [Claude.ai](https://claude.ai) (recommended) or [Claude Console](https://console.anthropic.com/) account

[​](#step-1%3A-install-claude-code) Step 1: Install Claude Code
---------------------------------------------------------------

### [​](#npm-install) NPM Install

If you have [Node.js 18 or newer installed](https://nodejs.org/en/download/):

Copy

```
npm install -g @anthropic-ai/claude-code
```

### [​](#native-install) Native Install

Alternatively, try our new native install, now in beta.

**macOS, Linux, WSL:**

Copy

```
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows PowerShell:**

Copy

```
irm https://claude.ai/install.ps1 | iex
```

**Windows CMD:**

Copy

```
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

[​](#step-2%3A-log-in-to-your-account) Step 2: Log in to your account
---------------------------------------------------------------------

Claude Code requires an account to use. When you start an interactive session with the `claude` command, you’ll need to log in:

Copy

```
claude
# You'll be prompted to log in on first use
```

Copy

```
/login
# Follow the prompts to log in with your account
```

You can log in using either account type:

* [Claude.ai](https://claude.ai) (subscription plans - recommended)
* [Claude Console](https://console.anthropic.com/) (API access with pre-paid credits)

Once logged in, your credentials are stored and you won’t need to log in again.

When you first authenticate Claude Code with your Claude Console account, a workspace called “Claude Code” is automatically created for you. This workspace provides centralized cost tracking and management for all Claude Code usage in your organization.

You can have both account types under the same email address. If you need to log in again or switch accounts, use the `/login` command within Claude Code.

[​](#step-3%3A-start-your-first-session) Step 3: Start your first session
-------------------------------------------------------------------------

Open your terminal in any project directory and start Claude Code:

Copy

```
cd /path/to/your/project
claude
```

You’ll see the Claude Code prompt inside a new interactive session:

Copy

```
✻ Welcome to Claude Code!

...

> Try "create a util logging.py that..."
```

After logging in (Step 2), your credentials are stored on your system. Learn more in [Credential Management](/en/docs/claude-code/iam#credential-management).

[​](#step-4%3A-ask-your-first-question) Step 4: Ask your first question
-----------------------------------------------------------------------

Let’s start with understanding your codebase. Try one of these commands:

Copy

```
> what does this project do?
```

Claude will analyze your files and provide a summary. You can also ask more specific questions:

Copy

```
> what technologies does this project use?
```

Copy

```
> where is the main entry point?
```

Copy

```
> explain the folder structure
```

You can also ask Claude about its own capabilities:

Copy

```
> what can Claude Code do?
```

Copy

```
> how do I use slash commands in Claude Code?
```

Copy

```
> can Claude Code work with Docker?
```

Claude Code reads your files as needed - you don’t have to manually add context. Claude also has access to its own documentation and can answer questions about its features and capabilities.

[​](#step-5%3A-make-your-first-code-change) Step 5: Make your first code change
-------------------------------------------------------------------------------

Now let’s make Claude Code do some actual coding. Try a simple task:

Copy

```
> add a hello world function to the main file
```

Claude Code will:

1. Find the appropriate file
2. Show you the proposed changes
3. Ask for your approval
4. Make the edit

Claude Code always asks for permission before modifying files. You can approve individual changes or enable “Accept all” mode for a session.

[​](#step-6%3A-use-git-with-claude-code) Step 6: Use Git with Claude Code
-------------------------------------------------------------------------

Claude Code makes Git operations conversational:

Copy

```
> what files have I changed?
```

Copy

```
> commit my changes with a descriptive message
```

You can also prompt for more complex Git operations:

Copy

```
> create a new branch called feature/quickstart
```

Copy

```
> show me the last 5 commits
```

Copy

```
> help me resolve merge conflicts
```

[​](#step-7%3A-fix-a-bug-or-add-a-feature) Step 7: Fix a bug or add a feature
-----------------------------------------------------------------------------

Claude is proficient at debugging and feature implementation.
Describe what you want in natural language:

Copy

```
> add input validation to the user registration form
```

Or fix existing issues:

Copy

```
> there's a bug where users can submit empty forms - fix it
```

Claude Code will:

* Locate the relevant code
* Understand the context
* Implement a solution
* Run tests if available

[​](#step-8%3A-test-out-other-common-workflows) Step 8: Test out other common workflows
---------------------------------------------------------------------------------------

There are a number of ways to work with Claude:
**Refactor code**

Copy

```
> refactor the authentication module to use async/await instead of callbacks
```

**Write tests**

Copy

```
> write unit tests for the calculator functions
```

**Update documentation**

Copy

```
> update the README with installation instructions
```

**Code review**

Copy

```
> review my changes and suggest improvements
```

**Remember**: Claude Code is your AI pair programmer. Talk to it like you would a helpful colleague - describe what you want to achieve, and it will help you get there.

[​](#essential-commands) Essential commands
-------------------------------------------

Here are the most important commands for daily use:

| Command | What it does | Example |
| --- | --- | --- |
| `claude` | Start interactive mode | `claude` |
| `claude "task"` | Run a one-time task | `claude "fix the build error"` |
| `claude -p "query"` | Run one-off query, then exit | `claude -p "explain this function"` |
| `claude -c` | Continue most recent conversation | `claude -c` |
| `claude -r` | Resume a previous conversation | `claude -r` |
| `claude commit` | Create a Git commit | `claude commit` |
| `/clear` | Clear conversation history | `> /clear` |
| `/help` | Show available commands | `> /help` |
| `exit` or Ctrl+C | Exit Claude Code | `> exit` |

See the [CLI reference](/en/docs/claude-code/cli-reference) for a complete list of commands.

[​](#pro-tips-for-beginners) Pro tips for beginners
---------------------------------------------------

Be specific with your requests

Instead of: “fix the bug”Try: “fix the login bug where users see a blank screen after entering wrong credentials”

Use step-by-step instructions

Break complex tasks into steps:

Copy

```
> 1. create a new database table for user profiles
```

Copy

```
> 2. create an API endpoint to get and update user profiles
```

Copy

```
> 3. build a webpage that allows users to see and edit their information
```

Let Claude explore first

Before making changes, let Claude understand your code:

Copy

```
> analyze the database schema
```

Copy

```
> build a dashboard showing products that are most frequently returned by our UK customers
```

Save time with shortcuts

* Use Tab for command completion
* Press ↑ for command history
* Type `/` to see all slash commands

[​](#what%E2%80%99s-next%3F) What’s next?
-----------------------------------------

Now that you’ve learned the basics, explore more advanced features:

[Common workflows
----------------

Step-by-step guides for common tasks](/en/docs/claude-code/common-workflows)[CLI reference
-------------

Master all commands and options](/en/docs/claude-code/cli-reference)[Configuration
-------------

Customize Claude Code for your workflow](/en/docs/claude-code/settings)

[​](#getting-help) Getting help
-------------------------------

* **In Claude Code**: Type `/help` or ask “how do I…”
* **Documentation**: You’re here! Browse other guides
* **Community**: Join our [Discord](https://www.anthropic.com/discord) for tips and support

Was this page helpful?

YesNo

[Overview](/en/docs/claude-code/overview)[Common workflows](/en/docs/claude-code/common-workflows)

[x](https://x.com/AnthropicAI)[linkedin](https://www.linkedin.com/company/anthropicresearch)

Assistant

Responses are generated using AI and may contain mistakes.