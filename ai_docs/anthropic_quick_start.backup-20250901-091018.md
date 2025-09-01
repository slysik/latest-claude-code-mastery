# Quick Start

> Updated from Anthropic's official documentation
> Source: https://docs.anthropic.com/en/docs/claude-code/quickstart
> Last updated: 2025-08-25T09:10:09.826849

[Anthropic home page![light logo](https://mintlify.s3.us-west-1.amazonaws.com/anthropic/logo/light.svg)![dark logo](https://mintlify.s3.us-west-1.amazonaws.com/anthropic/logo/dark.svg)](/)

English

Search...

* [Research](https://www.anthropic.com/research)
* [Login](https://console.anthropic.com/login)
* [Support](https://support.anthropic.com/)
* [Discord](https://www.anthropic.com/discord)
* [Sign up](https://console.anthropic.com/login)
* [Sign up](https://console.anthropic.com/login)

Search...

Navigation

Getting started

Quickstart

[Welcome](/en/home)[Developer Platform](/en/docs/intro)[Claude Code](/en/docs/claude-code/overview)[Model Context Protocol (MCP)](/en/docs/mcp)[API Reference](/en/api/messages)[Resources](/en/resources/overview)[Release Notes](/en/release-notes/overview)

##### Getting started

* [Overview](/en/docs/claude-code/overview)
* [Quickstart](/en/docs/claude-code/quickstart)
* [Common workflows](/en/docs/claude-code/common-workflows)

##### Build with Claude Code

* [Claude Code SDK](/en/docs/claude-code/sdk)
* [Subagents](/en/docs/claude-code/sub-agents)
* [Output styles](/en/docs/claude-code/output-styles)
* [Claude Code hooks](/en/docs/claude-code/hooks-guide)
* [GitHub Actions](/en/docs/claude-code/github-actions)
* [Model Context Protocol (MCP)](/en/docs/claude-code/mcp)
* [Troubleshooting](/en/docs/claude-code/troubleshooting)

##### Deployment

* [Overview](/en/docs/claude-code/third-party-integrations)
* [Amazon Bedrock](/en/docs/claude-code/amazon-bedrock)
* [Google Vertex AI](/en/docs/claude-code/google-vertex-ai)
* [Corporate proxy](/en/docs/claude-code/corporate-proxy)
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
* [Memory management](/en/docs/claude-code/memory)
* [Status line configuration](/en/docs/claude-code/statusline)

##### Reference

* [CLI reference](/en/docs/claude-code/cli-reference)
* [Interactive mode](/en/docs/claude-code/interactive-mode)
* [Slash commands](/en/docs/claude-code/slash-commands)
* [Hooks reference](/en/docs/claude-code/hooks)

##### Resources

* [Legal and compliance](/en/docs/claude-code/legal-and-compliance)

Getting started

Quickstart
==========

Copy page

Welcome to Claude Code!

This quickstart guide will have you using AI-powered coding assistance in just a few minutes. By the end, you’ll understand how to use Claude Code for common development tasks.

[​](#before-you-begin) Before you begin
---------------------------------------

Make sure you have:

* A terminal or command prompt open
* A code project to work with

[​](#step-1%3A-install-claude-code) Step 1: Install Claude Code
---------------------------------------------------------------

### [​](#npm-install) NPM Install

If you have [Node.js 18 or newer installed](https://nodejs.org/en/download/):

```
npm install -g @anthropic-ai/claude-code
```

### [​](#native-install) Native Install

Alternatively, try our new native install, now in beta.

**macOS, Linux, WSL:**

```
curl -fsSL claude.ai/install.sh | bash
```

**Windows PowerShell:**

```
irm https://claude.ai/install.ps1 | iex
```

[​](#step-2%3A-start-your-first-session) Step 2: Start your first session
-------------------------------------------------------------------------

Open your terminal in any project directory and start Claude Code:

```
cd /path/to/your/project
claude
```

You’ll see the Claude Code prompt inside a new interactive session:

```
✻ Welcome to Claude Code!

...

> Try "create a util logging.py that..."
```

Your credentials are securely stored on your system. Learn more in [Credential Management](/en/docs/claude-code/iam#credential-management).

[​](#step-3%3A-ask-your-first-question) Step 3: Ask your first question
-----------------------------------------------------------------------

Let’s start with understanding your codebase. Try one of these commands:

```
> what does this project do?
```

Claude will analyze your files and provide a summary. You can also ask more specific questions:

```
> what technologies does this project use?
```

```
> where is the main entry point?
```

```
> explain the folder structure
```

You can also ask Claude about its own capabilities:

```
> what can Claude Code do?
```

```
> how do I use slash commands in Claude Code?
```

```
> can Claude Code work with Docker?
```

Claude Code reads your files as needed - you don’t have to manually add context. Claude also has access to its own documentation and can answer questions about its features and capabilities.

[​](#step-4%3A-make-your-first-code-change) Step 4: Make your first code change
-------------------------------------------------------------------------------

Now let’s make Claude Code do some actual coding. Try a simple task:

```
> add a hello world function to the main file
```

Claude Code will:

1. Find the appropriate file
2. Show you the proposed changes
3. Ask for your approval
4. Make the edit

Claude Code always asks for permission before modifying files. You can approve individual changes or enable “Accept all” mode for a session.

[​](#step-5%3A-use-git-with-claude-code) Step 5: Use Git with Claude Code
-------------------------------------------------------------------------

Claude Code makes Git operations conversational:

```
> what files have I changed?
```

```
> commit my changes with a descriptive message
```

You can also prompt for more complex Git operations:

```
> create a new branch called feature/quickstart
```

```
> show me the last 5 commits
```

```
> help me resolve merge conflicts
```

[​](#step-6%3A-fix-a-bug-or-add-a-feature) Step 6: Fix a bug or add a feature
-----------------------------------------------------------------------------

Claude is proficient at debugging and feature implementation.

Describe what you want in natural language:

```
> add input validation to the user registration form
```

Or fix existing issues:

```
> there's a bug where users can submit empty forms - fix it
```

Claude Code will:

* Locate the relevant code
* Understand the context
* Implement a solution
* Run tests if available

[​](#step-7%3A-test-out-other-common-workflows) Step 7: Test out other common workflows
---------------------------------------------------------------------------------------

There are a number of ways to work with Claude:

**Refactor code**

```
> refactor the authentication module to use async/await instead of callbacks
```

**Write tests**

```
> write unit tests for the calculator functions
```

**Update documentation**

```
> update the README with installation instructions
```

**Code review**

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

Instead of: “fix the bug”

Try: “fix the login bug where users see a blank screen after entering wrong credentials”

Use step-by-step instructions

Break complex tasks into steps:

```
> 1. create a new database table for user profiles
```

```
> 2. create an API endpoint to get and update user profiles
```

```
> 3. build a webpage that allows users to see and edit their information
```

Let Claude explore first

Before making changes, let Claude understand your code:

```
> analyze the database schema
```

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

On this page

* [Before you begin](#before-you-begin)
* [Step 1: Install Claude Code](#step-1%3A-install-claude-code)
* [NPM Install](#npm-install)
* [Native Install](#native-install)
* [Step 2: Start your first session](#step-2%3A-start-your-first-session)
* [Step 3: Ask your first question](#step-3%3A-ask-your-first-question)
* [Step 4: Make your first code change](#step-4%3A-make-your-first-code-change)
* [Step 5: Use Git with Claude Code](#step-5%3A-use-git-with-claude-code)
* [Step 6: Fix a bug or add a feature](#step-6%3A-fix-a-bug-or-add-a-feature)
* [Step 7: Test out other common workflows](#step-7%3A-test-out-other-common-workflows)
* [Essential commands](#essential-commands)
* [Pro tips for beginners](#pro-tips-for-beginners)
* [What’s next?](#what%E2%80%99s-next%3F)
* [Getting help](#getting-help)