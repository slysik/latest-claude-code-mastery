# Quick Start

> Updated from Anthropic's official documentation
> Source: https://docs.anthropic.com/en/docs/claude-code/quickstart
> Last updated: 2025-11-10T09:11:01.934586

[Skip to main content](#content-area)

[Claude Code Docs home page![light logo](https://mintcdn.com/claude-code/o69F7a6qoW9vboof/logo/light.svg?fit=max&auto=format&n=o69F7a6qoW9vboof&q=85&s=536eade682636e84231afce2577f9509)![dark logo](https://mintcdn.com/claude-code/o69F7a6qoW9vboof/logo/dark.svg?fit=max&auto=format&n=o69F7a6qoW9vboof&q=85&s=0766b3221061e80143e9f300733e640b)](/docs)

![US](https://d3gk2c5xim1je2.cloudfront.net/flags/US.svg)

English

Search...

⌘K

* [Claude Developer Platform](https://platform.claude.com/)
* [Claude Code on the Web](https://claude.ai/code)
* [Claude Code on the Web](https://claude.ai/code)

Search...

Navigation

Getting started

Quickstart

[Getting started](/docs/en/overview)[Build with Claude Code](/docs/en/sub-agents)[Deployment](/docs/en/third-party-integrations)[Administration](/docs/en/setup)[Configuration](/docs/en/settings)[Reference](/docs/en/cli-reference)[Resources](/docs/en/legal-and-compliance)

##### Getting started

* [Overview](/docs/en/overview)
* [Quickstart](/docs/en/quickstart)
* [Common workflows](/docs/en/common-workflows)
* [Claude Code on the web](/docs/en/claude-code-on-the-web)

On this page

* [Before you begin](#before-you-begin)
* [Step 1: Install Claude Code](#step-1%3A-install-claude-code)
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

To install Claude Code, use one of the following methods:

* Native Install (Recommended)
* NPM

**Homebrew (macOS, Linux):**

Copy

Ask AI

```
brew install --cask claude-code
```

**macOS, Linux, WSL:**

Copy

Ask AI

```
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows PowerShell:**

Copy

Ask AI

```
irm https://claude.ai/install.ps1 | iex
```

**Windows CMD:**

Copy

Ask AI

```
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

[​](#step-2%3A-log-in-to-your-account) Step 2: Log in to your account
---------------------------------------------------------------------

Claude Code requires an account to use. When you start an interactive session with the `claude` command, you’ll need to log in:

Copy

Ask AI

```
claude
# You'll be prompted to log in on first use
```

Copy

Ask AI

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

Ask AI

```
cd /path/to/your/project
claude
```

You’ll see the Claude Code welcome screen with your session information, recent conversations, and latest updates. Type `/help` for available commands or `/resume` to continue a previous conversation.

After logging in (Step 2), your credentials are stored on your system. Learn more in [Credential Management](/docs/en/iam#credential-management).

[​](#step-4%3A-ask-your-first-question) Step 4: Ask your first question
-----------------------------------------------------------------------

Let’s start with understanding your codebase. Try one of these commands:

Copy

Ask AI

```
> what does this project do?
```

Claude will analyze your files and provide a summary. You can also ask more specific questions:

Copy

Ask AI

```
> what technologies does this project use?
```

Copy

Ask AI

```
> where is the main entry point?
```

Copy

Ask AI

```
> explain the folder structure
```

You can also ask Claude about its own capabilities:

Copy

Ask AI

```
> what can Claude Code do?
```

Copy

Ask AI

```
> how do I use slash commands in Claude Code?
```

Copy

Ask AI

```
> can Claude Code work with Docker?
```

Claude Code reads your files as needed - you don’t have to manually add context. Claude also has access to its own documentation and can answer questions about its features and capabilities.

[​](#step-5%3A-make-your-first-code-change) Step 5: Make your first code change
-------------------------------------------------------------------------------

Now let’s make Claude Code do some actual coding. Try a simple task:

Copy

Ask AI

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

Ask AI

```
> what files have I changed?
```

Copy

Ask AI

```
> commit my changes with a descriptive message
```

You can also prompt for more complex Git operations:

Copy

Ask AI

```
> create a new branch called feature/quickstart
```

Copy

Ask AI

```
> show me the last 5 commits
```

Copy

Ask AI

```
> help me resolve merge conflicts
```

[​](#step-7%3A-fix-a-bug-or-add-a-feature) Step 7: Fix a bug or add a feature
-----------------------------------------------------------------------------

Claude is proficient at debugging and feature implementation.
Describe what you want in natural language:

Copy

Ask AI

```
> add input validation to the user registration form
```

Or fix existing issues:

Copy

Ask AI

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

Ask AI

```
> refactor the authentication module to use async/await instead of callbacks
```

**Write tests**

Copy

Ask AI

```
> write unit tests for the calculator functions
```

**Update documentation**

Copy

Ask AI

```
> update the README with installation instructions
```

**Code review**

Copy

Ask AI

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

See the [CLI reference](/docs/en/cli-reference) for a complete list of commands.

[​](#pro-tips-for-beginners) Pro tips for beginners
---------------------------------------------------

Be specific with your requests

Instead of: “fix the bug”Try: “fix the login bug where users see a blank screen after entering wrong credentials”

Use step-by-step instructions

Break complex tasks into steps:

Copy

Ask AI

```
> 1. create a new database table for user profiles
```

Copy

Ask AI

```
> 2. create an API endpoint to get and update user profiles
```

Copy

Ask AI

```
> 3. build a webpage that allows users to see and edit their information
```

Let Claude explore first

Before making changes, let Claude understand your code:

Copy

Ask AI

```
> analyze the database schema
```

Copy

Ask AI

```
> build a dashboard showing products that are most frequently returned by our UK customers
```

Save time with shortcuts

* Press `?` to see all available keyboard shortcuts
* Use Tab for command completion
* Press ↑ for command history
* Type `/` to see all slash commands

[​](#what%E2%80%99s-next%3F) What’s next?
-----------------------------------------

Now that you’ve learned the basics, explore more advanced features:

[Common workflows
----------------

Step-by-step guides for common tasks](/docs/en/common-workflows)[CLI reference
-------------

Master all commands and options](/docs/en/cli-reference)[Configuration
-------------

Customize Claude Code for your workflow](/docs/en/settings)[Claude Code on the web
----------------------

Run tasks asynchronously in the cloud](/docs/en/claude-code-on-the-web)

[​](#getting-help) Getting help
-------------------------------

* **In Claude Code**: Type `/help` or ask “how do I…”
* **Documentation**: You’re here! Browse other guides
* **Community**: Join our [Discord](https://www.anthropic.com/discord) for tips and support

[Overview](/docs/en/overview)[Common workflows](/docs/en/common-workflows)

⌘I

[Claude Code Docs home page![light logo](https://mintcdn.com/claude-code/o69F7a6qoW9vboof/logo/light.svg?fit=max&auto=format&n=o69F7a6qoW9vboof&q=85&s=536eade682636e84231afce2577f9509)![dark logo](https://mintcdn.com/claude-code/o69F7a6qoW9vboof/logo/dark.svg?fit=max&auto=format&n=o69F7a6qoW9vboof&q=85&s=0766b3221061e80143e9f300733e640b)](/docs)

[x](https://x.com/AnthropicAI)[linkedin](https://www.linkedin.com/company/anthropicresearch)

Company

[Anthropic](https://www.anthropic.com/company)[Careers](https://www.anthropic.com/careers)[Economic Futures](https://www.anthropic.com/economic-futures)[Research](https://www.anthropic.com/research)[News](https://www.anthropic.com/news)[Trust center](https://trust.anthropic.com/)[Transparency](https://www.anthropic.com/transparency)

Help and security

[Availability](https://www.anthropic.com/supported-countries)[Status](https://status.anthropic.com/)[Support center](https://support.claude.com/)

Learn

[Courses](https://www.anthropic.com/learn)[MCP connectors](https://claude.com/partners/mcp)[Customer stories](https://www.claude.com/customers)[Engineering blog](https://www.anthropic.com/engineering)[Events](https://www.anthropic.com/events)[Powered by Claude](https://claude.com/partners/powered-by-claude)[Service partners](https://claude.com/partners/services)[Startups program](https://claude.com/programs/startups)

Terms and policies

[Privacy policy](https://www.anthropic.com/legal/privacy)[Disclosure policy](https://www.anthropic.com/responsible-disclosure-policy)[Usage policy](https://www.anthropic.com/legal/aup)[Commercial terms](https://www.anthropic.com/legal/commercial-terms)[Consumer terms](https://www.anthropic.com/legal/consumer-terms)