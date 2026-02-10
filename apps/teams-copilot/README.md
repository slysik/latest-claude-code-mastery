# Gates Foundation Travel Policy Copilot

A Microsoft Teams bot that provides instant, AI-powered answers to employee questions about the Gates Foundation's India travel policy. Built with the Teams AI Library and a Retrieval-Augmented Generation (RAG) pipeline, it fetches the travel policy document from SharePoint (or a local fallback), chunks and embeds it into Azure AI Search, and uses Azure OpenAI GPT-4o to generate grounded, citation-backed responses.

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Microsoft  │────>│  Azure Bot       │────>│  Express Server   │
│  Teams      │<────│  Service         │<────│  (port 3978)      │
└─────────────┘     └──────────────────┘     └────────┬──────────┘
                                                       │
                    ┌──────────────────┐               │
                    │  SharePoint      │<──────────────┤
                    │  (Graph API)     │               │
                    └──────────────────┘     ┌─────────▼──────────┐
                                             │  Teams AI Library   │
                    ┌──────────────────┐     │  (ActionPlanner)    │
                    │  Azure OpenAI    │<────┤                     │
                    │  (GPT-4o +       │     └─────────┬──────────┘
                    │   Embeddings)    │               │
                    └──────────────────┘     ┌─────────▼──────────┐
                                             │  Azure AI Search    │
                    ┌──────────────────┐     │  (Vector Index)     │
                    │  Cosmos DB +     │<────┤                     │
                    │  App Insights    │     └────────────────────┘
                    └──────────────────┘
```

**Request flow:** A user asks a question in Teams. The Bot Framework adapter routes it to the Express server, which hands it to the Teams AI Library `ActionPlanner`. Before the LLM completion, the `BeforeCompletion` action generates a query embedding via Azure OpenAI, performs a hybrid (keyword + vector) search against Azure AI Search, and injects the top-k policy chunks into the prompt context. GPT-4o produces a grounded answer citing the relevant policy section. After completion, the interaction is logged to Cosmos DB and Application Insights.

## Prerequisites

- **Node.js 20+** (LTS recommended)
- **Azure subscription** with permissions to create resources
- **Teams admin access** for sideloading custom apps (or a Microsoft 365 Developer Program tenant)
- **ngrok** or **dev tunnels** for local Teams testing

## Azure Resource Setup

Complete these six steps to provision the required Azure services.

### 1. Azure OpenAI Service

1. Create an Azure OpenAI resource in a supported region.
2. Deploy two models:
   - **`text-embedding-3-small`** -- used by the ingestion script and query-time embedding.
   - **`gpt-4o`** -- the chat completion model for answering questions.
3. Note the **endpoint** and **API key** from the resource's Keys & Endpoint page.

### 2. Azure AI Search

1. Create an Azure AI Search service (Basic tier or higher for vector search).
2. Note the **endpoint** and **admin API key**.
3. You do **not** need to create an index manually -- the `npm run ingest` script creates the `travel-policy-index` automatically with the correct schema and HNSW vector search configuration.

### 3. Azure Cosmos DB

1. Create an Azure Cosmos DB account (NoSQL API).
2. Create a database named **`copilot-logs`**.
3. Create a container named **`interactions`** with partition key **`/userId`**.
4. Note the **endpoint** and **primary key**.

### 4. Azure App Registration (Microsoft Graph)

1. In Azure Active Directory, register a new application.
2. Add the following **Application** permissions under Microsoft Graph:
   - `Sites.Read.All`
   - `Files.Read.All`
3. Grant admin consent for your tenant.
4. Create a client secret and note the **Tenant ID**, **Client ID**, and **Client Secret**.
5. Find your SharePoint **Site ID** and **Drive ID** where the travel policy document is stored.

### 5. Azure Bot Service

1. Create an Azure Bot resource.
2. Set the messaging endpoint to `https://<your-domain>/api/messages`.
3. Enable the **Microsoft Teams** channel.
4. Note the **Bot ID** (Microsoft App ID) and **Bot Password** (client secret).

### 6. Application Insights

1. Create an Application Insights resource.
2. Note the **Instrumentation Key**.
3. The bot automatically reports custom events (`CopilotInteraction`) and metrics (`CopilotResponseTime`, `CopilotConfidenceScore`).

## Local Development Setup

### 1. Configure environment variables

```bash
cp .env.sample .env
```

Open `.env` and fill in all values from the Azure resources you provisioned above. See `.env.sample` for the full list of variables and their descriptions.

### 2. Install dependencies

```bash
npm install
```

### 3. Ingest the travel policy document

```bash
npm run ingest
```

This reads the travel policy from SharePoint (or falls back to `data/travel-policy-india.md`), chunks the document, generates embeddings with `text-embedding-3-small`, creates the Azure AI Search index, and uploads all vector documents. You only need to run this once (or again whenever the policy document changes).

### 4. Start the development server

```bash
npm run dev
```

This starts the Express server on port 3978 with hot reload via `tsx watch`. You will see:

```
Server listening on port 3978
Bot endpoint: http://localhost:3978/api/messages
Logs viewer: http://localhost:3978/api/logs
Health check: http://localhost:3978/health
```

### 5. Connect to Teams for local testing

1. Install [ngrok](https://ngrok.com/) and start a tunnel:
   ```bash
   ngrok http 3978
   ```
2. Copy the HTTPS forwarding URL (e.g., `https://abc123.ngrok.io`).
3. Update your Azure Bot Service messaging endpoint to `https://abc123.ngrok.io/api/messages`.
4. Alternatively, use the [Bot Framework Emulator](https://github.com/microsoft/BotFramework-Emulator) for quick local testing without Teams.

## Deployment to Azure App Service

1. Build the TypeScript project:
   ```bash
   npm run build
   ```
2. Create an Azure App Service (Node.js 20 LTS runtime).
3. Set all environment variables from `.env` in the App Service Configuration > Application Settings.
4. Deploy the `dist/` folder, `package.json`, and `node_modules/` (or run `npm install --production` on the server).
5. Set the startup command to `npm start`.
6. Update the Azure Bot Service messaging endpoint to `https://<your-app>.azurewebsites.net/api/messages`.

## Teams App Sideloading

### Package the app

```bash
npm run package
```

This creates `dist/teams-copilot.zip` from the `appPackage/` directory (which contains `manifest.json`, `color.png`, and `outline.png`).

### Install in Teams

- **For testing:** In Teams, go to Apps > Manage your apps > Upload a custom app, and select the zip file.
- **For organization-wide deployment:** Upload the zip to the Teams Admin Center under Manage apps.

## Log Viewer

Access the built-in log viewer at:

```
http://localhost:3978/api/logs
```

The log viewer provides:

- **Filterable interaction history** -- filter by user ID, date range
- **Interaction details** -- query, response, sources cited, confidence score, response time
- **Data export** -- retrieve raw JSON via the `/api/logs/data` API endpoint
- **Auto-refresh** -- stays up to date as new interactions come in

The raw data API supports query parameters for filtering:

```
GET /api/logs/data?userId=<id>&startDate=<iso>&endDate=<iso>
```

## Sample Questions to Try

Once the bot is running and the travel policy has been ingested, try these questions in Teams:

- "What visa do I need for India?"
- "What's the per diem rate for Mumbai?"
- "What vaccinations are required?"
- "How do I submit expenses after my trip?"
- "What are the emergency contacts in India?"
- "How do I book accommodation?"
- "What is the baggage allowance policy?"

You can also use the built-in commands:

- `/help` -- display available commands and example questions
- `/sources` -- learn about the indexed data sources

## Project Structure

```
apps/teams-copilot/
├── appPackage/
│   ├── manifest.json          # Teams app manifest
│   ├── color.png              # App icon (color)
│   └── outline.png            # App icon (outline)
├── data/
│   └── travel-policy-india.md # Local fallback policy document
├── src/
│   ├── index.ts               # Express server, Bot Framework adapter, HTTP endpoints
│   ├── bot.ts                 # Teams AI Application, ActionPlanner, RAG actions, commands
│   ├── config.ts              # Typed configuration from environment variables
│   ├── services/
│   │   ├── sharepoint.ts      # Microsoft Graph client for SharePoint document access
│   │   ├── embeddings.ts      # Azure OpenAI embeddings + document chunking logic
│   │   ├── search.ts          # Azure AI Search index management + hybrid vector search
│   │   └── logger.ts          # Cosmos DB + Application Insights interaction logging
│   ├── scripts/
│   │   └── ingest.ts          # One-shot ingestion: read -> chunk -> embed -> index
│   ├── prompts/
│   │   └── chat/
│   │       ├── config.json    # Prompt configuration (model, temperature, token limits)
│   │       └── skprompt.txt   # System prompt template with {{$context}} and {{$input}}
│   └── pages/
│       └── logs.html          # Browser-based log viewer UI
├── .env.sample                # Environment variable template
├── package.json               # Dependencies and npm scripts
├── tsconfig.json              # TypeScript configuration (ES2022, NodeNext modules)
└── README.md                  # This file
```

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [Teams AI Library](https://github.com/microsoft/teams-ai) | v1.7+ | Bot framework with ActionPlanner for AI-driven conversations |
| [Azure OpenAI](https://azure.microsoft.com/products/ai-services/openai-service) | GPT-4o + text-embedding-3-small | Chat completion and vector embeddings |
| [Azure AI Search](https://azure.microsoft.com/products/ai-services/ai-search) | HNSW vector index | Hybrid keyword + vector semantic search |
| [Azure Cosmos DB](https://azure.microsoft.com/products/cosmos-db) | NoSQL API | Interaction logging with partition key on userId |
| [Application Insights](https://learn.microsoft.com/azure/azure-monitor/app/app-insights-overview) | v3 SDK | Telemetry, custom events, and performance metrics |
| [Express](https://expressjs.com/) | v4 | HTTP server for bot endpoint, logs API, and health check |
| [TypeScript](https://www.typescriptlang.org/) | v5.4+ | Type-safe development with strict mode |
| [Bot Framework SDK](https://github.com/microsoft/botbuilder-js) | v4.23+ | CloudAdapter and authentication for Azure Bot Service |
| [Microsoft Graph SDK](https://github.com/microsoftgraph/msgraph-sdk-javascript) | v3 | SharePoint document retrieval via Graph API |

## npm Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `tsx watch src/index.ts` | Start dev server with hot reload |
| `start` | `node dist/index.js` | Start production server from compiled output |
| `build` | `tsc` | Compile TypeScript to `dist/` |
| `ingest` | `tsx src/scripts/ingest.ts` | Run the document ingestion pipeline |
| `package` | Creates `dist/teams-copilot.zip` | Package the Teams app for sideloading |

## License

MIT
