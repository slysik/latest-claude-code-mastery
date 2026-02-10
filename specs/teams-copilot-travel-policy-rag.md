# Plan: Microsoft Teams Travel Policy Copilot with SharePoint RAG

## Task Description
Build a Microsoft Teams-based copilot that pulls one policy document from SharePoint (a sample travel guidelines document for Gates Foundation employees traveling to India), uses Azure OpenAI + Azure AI Search vector search for retrieval-augmented generation (RAG), and logs all user interactions for review. The solution is a fully functional demo that showcases the end-to-end flow: document ingestion from SharePoint, vector embedding, conversational Q&A in Teams, and an interaction log viewer.

## Objective
Deliver a working Teams bot copilot that:
1. Contains a realistic sample travel policy document (Gates Foundation India Travel Guidelines)
2. Ingests the document into Azure AI Search with vector embeddings via Azure OpenAI
3. Answers natural-language questions about the travel policy using RAG
4. Runs as a Teams bot via Azure Bot Service
5. Logs every user interaction (query, response, sources, timestamps) for admin review

## Problem Statement
Organizations need AI-powered assistants that can answer employee questions about internal policies stored in SharePoint. Current approaches require employees to manually search SharePoint document libraries, read lengthy policy documents, and interpret guidelines themselves. A Teams copilot that uses RAG over policy documents provides instant, contextual answers directly in the tool employees already use for communication.

## Solution Approach
Build a TypeScript/Node.js Teams bot using the `@microsoft/teams-ai` library (v1 stable) with Azure OpenAI for embeddings and completions, Azure AI Search for vector retrieval, Microsoft Graph API for SharePoint document access, and Application Insights + Cosmos DB for interaction logging. The architecture follows the standard RAG pattern: document chunking → vector embedding → semantic search → grounded LLM response.

**Key Architecture Decisions:**
- **Teams AI Library v1** (stable `@microsoft/teams-ai@1.7.4`) over v2 SDK — v1 is well-documented with proven patterns; v2 is GA but TypeScript docs are still maturing
- **Azure AI Search** with integrated vectorization — handles chunking, embedding, and search in a managed pipeline
- **`text-embedding-3-small`** — cost-effective for a single-document demo (1536 dimensions); upgrade path to `text-embedding-3-large` for production
- **Application Insights** for real-time monitoring + **Cosmos DB** for structured interaction logs — dual logging gives both operational visibility and queryable review UI
- **Local dev with Bot Emulator + ngrok** before Azure deployment

## Relevant Files

### New Files

- `apps/teams-copilot/` — Root project directory
- `apps/teams-copilot/package.json` — Dependencies and scripts
- `apps/teams-copilot/tsconfig.json` — TypeScript configuration
- `apps/teams-copilot/.env.sample` — Environment variable template
- `apps/teams-copilot/src/index.ts` — Express server + bot adapter entry point
- `apps/teams-copilot/src/bot.ts` — Teams AI Application setup, prompt config, action handlers
- `apps/teams-copilot/src/config.ts` — Centralized configuration from env vars
- `apps/teams-copilot/src/services/sharepoint.ts` — Microsoft Graph client for SharePoint document retrieval
- `apps/teams-copilot/src/services/search.ts` — Azure AI Search client for vector queries
- `apps/teams-copilot/src/services/embeddings.ts` — Azure OpenAI embedding generation
- `apps/teams-copilot/src/services/logger.ts` — Interaction logging to Application Insights + Cosmos DB
- `apps/teams-copilot/src/scripts/ingest.ts` — One-time script to chunk, embed, and index the travel policy document
- `apps/teams-copilot/src/scripts/seed-sharepoint.ts` — Upload sample document to SharePoint (or local fallback)
- `apps/teams-copilot/src/prompts/chat/skprompt.txt` — System prompt for the RAG copilot
- `apps/teams-copilot/src/prompts/chat/config.json` — Prompt template configuration
- `apps/teams-copilot/data/travel-policy-india.md` — Sample Gates Foundation India Travel Guidelines document
- `apps/teams-copilot/appPackage/manifest.json` — Teams app manifest
- `apps/teams-copilot/appPackage/color.png` — Teams app icon (32x32)
- `apps/teams-copilot/appPackage/outline.png` — Teams app outline icon (32x32)
- `apps/teams-copilot/src/pages/logs.html` — Simple HTML page to view interaction logs (served by Express)

### Reference Files (Existing Patterns)

- `apps/task-manager/` — Reference for project structure and Bun/TypeScript patterns
- `.claude/agents/team/builder.md` — Builder agent configuration (used for task execution)
- `.claude/agents/team/validator.md` — Validator agent configuration (used for verification)

## Implementation Phases

### Phase 1: Foundation
- Project scaffolding (package.json, tsconfig, env config)
- Sample travel policy document creation (realistic Gates Foundation India guidelines)
- Configuration module for all Azure service connections

### Phase 2: Core Implementation
- SharePoint service (Graph API client for document retrieval)
- Azure AI Search service (vector index creation, query execution)
- Azure OpenAI embeddings service (document chunking + embedding generation)
- Ingestion script (document → chunks → vectors → search index)
- Teams bot with RAG pipeline (query → search → grounded response)
- Interaction logging service (Application Insights + Cosmos DB)

### Phase 3: Integration & Polish
- Teams app manifest and packaging
- Log viewer HTML page
- End-to-end testing and validation
- Documentation (README with setup instructions)

## Team Orchestration

- You operate as the team lead and orchestrate the team to execute the plan.
- You're responsible for deploying the right team members with the right context to execute the plan.
- IMPORTANT: You NEVER operate directly on the codebase. You use `Task` and `Task*` tools to deploy team members to to the building, validating, testing, deploying, and other tasks.
  - This is critical. You're job is to act as a high level director of the team, not a builder.
  - You're role is to validate all work is going well and make sure the team is on track to complete the plan.
  - You'll orchestrate this by using the Task* Tools to manage coordination between the team members.
  - Communication is paramount. You'll use the Task* Tools to communicate with the team members and ensure they're on track to complete the plan.
- Take note of the session id of each team member. This is how you'll reference them.

### Team Members

- Builder
  - Name: builder-scaffold
  - Role: Project scaffolding, configuration, and sample data creation (Phase 1)
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-services
  - Role: Core service implementations — SharePoint, Search, Embeddings, Logger (Phase 2 services)
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-bot
  - Role: Teams bot implementation, ingestion script, RAG pipeline, log viewer (Phase 2 bot + Phase 3)
  - Agent Type: builder
  - Resume: true

- Validator
  - Name: validator-final
  - Role: Read-only verification that all files exist, compile, and meet acceptance criteria
  - Agent Type: validator
  - Resume: false

## Step by Step Tasks

- IMPORTANT: Execute every step in order, top to bottom. Each task maps directly to a `TaskCreate` call.
- Before you start, run `TaskCreate` to create the initial task list that all team members can see and execute.

### 1. Project Scaffolding
- **Task ID**: scaffold-project
- **Depends On**: none
- **Assigned To**: builder-scaffold
- **Agent Type**: builder
- **Parallel**: false
- Create `apps/teams-copilot/` directory structure
- Create `package.json` with these dependencies:
  - `@microsoft/teams-ai@^1.7.4`
  - `botbuilder@^4.23.0`
  - `@microsoft/microsoft-graph-client@^3.0.0`
  - `@azure/msal-node@^2.0.0`
  - `@azure/search-documents@^12.0.0`
  - `@azure/openai@^2.0.0`
  - `@azure/cosmos@^4.0.0`
  - `applicationinsights@^3.0.0`
  - `express@^4.18.0`
  - `dotenv@^16.0.0`
  - Dev deps: `typescript@^5.4.0`, `@types/express`, `@types/node`, `tsx`
- Create `tsconfig.json` targeting ES2022, NodeNext module resolution
- Create `.env.sample` with all required environment variables:
  ```
  # Azure Bot
  BOT_ID=
  BOT_PASSWORD=
  BOT_TYPE=MultiTenant

  # Azure OpenAI
  AZURE_OPENAI_ENDPOINT=
  AZURE_OPENAI_API_KEY=
  AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-small
  AZURE_OPENAI_CHAT_DEPLOYMENT=gpt-4o
  AZURE_OPENAI_API_VERSION=2024-10-21

  # Azure AI Search
  AZURE_SEARCH_ENDPOINT=
  AZURE_SEARCH_API_KEY=
  AZURE_SEARCH_INDEX_NAME=travel-policy-index

  # SharePoint / Microsoft Graph
  GRAPH_TENANT_ID=
  GRAPH_CLIENT_ID=
  GRAPH_CLIENT_SECRET=
  SHAREPOINT_SITE_ID=
  SHAREPOINT_DRIVE_ID=

  # Azure Cosmos DB
  COSMOS_ENDPOINT=
  COSMOS_KEY=
  COSMOS_DATABASE=copilot-logs
  COSMOS_CONTAINER=interactions

  # Application Insights
  APPINSIGHTS_INSTRUMENTATIONKEY=

  # Server
  PORT=3978
  ```
- Create `src/config.ts` — typed configuration module that reads from env vars with validation

### 2. Sample Travel Policy Document
- **Task ID**: create-travel-policy
- **Depends On**: scaffold-project
- **Assigned To**: builder-scaffold
- **Agent Type**: builder
- **Parallel**: false
- Create `apps/teams-copilot/data/travel-policy-india.md` — a realistic 2-3 page Gates Foundation travel policy document for India containing:
  - **Header**: "Gates Foundation — International Travel Guidelines: India" with effective date and version
  - **Section 1: Visa Requirements** — e-Business Visa for US citizens, online application at indianvisaonline.gov.in, 3-5 business day processing, 6-month passport validity requirement, multiple entry valid 1 year
  - **Section 2: Health & Vaccinations** — Required: Hepatitis A, Hepatitis B, COVID-19, MMR; Recommended for rural travel: Typhoid, Japanese Encephalitis, Rabies; consult travel medicine provider 4+ weeks before departure
  - **Section 3: Per Diem Rates** — Table with rates for New Delhi ($233 lodging / $120 M&IE), Mumbai ($245 / $125), Bangalore ($280 / $135); note rates follow US State Department DSSR 925
  - **Section 4: Approved Accommodations** — Foundation-approved hotel chains (Taj, Oberoi, JW Marriott, ITC, Fortune Hotels); book through Foundation Travel Department; lodging folios required for reimbursement
  - **Section 5: Ground Transportation** — Pre-arranged car service recommended; Uber/Ola permitted for urban travel; Foundation-approved drivers for rural field visits; women travelers should use verified transport only
  - **Section 6: Safety & Security** — India is US State Dept Level 2 ("Exercise Increased Caution"); avoid solo travel after dark; secure passport copies separately; register with STEP (Smart Traveler Enrollment Program); Foundation Security team 24/7 contact
  - **Section 7: Cultural Considerations** — Business dress code, Namaste greeting etiquette, meeting punctuality norms, dietary considerations (vegetarian preferences common), right-hand etiquette, hierarchy and titles
  - **Section 8: Expense Reporting** — All expenses submitted within 14 days of return via Concur; domestic flights in economy, international in premium economy; personal vehicle mileage at IRS rate; visa/passport costs NOT reimbursable
  - **Section 9: Emergency Contacts** — Foundation Security Operations Center (24/7), Delhi Office, US Embassy New Delhi, local emergency numbers (100 police, 101 fire, 102 ambulance)
  - **Section 10: Foundation India Operations** — Office at Capital Court, Munirka, New Delhi; primary program states (Bihar, UP); key program areas (health, agriculture, financial inclusion, sanitation)
- Ensure the document is detailed enough to generate meaningful Q&A but concise enough for a demo (target ~2000-2500 words)

### 3. Core Services — SharePoint Client
- **Task ID**: build-sharepoint-service
- **Depends On**: scaffold-project
- **Assigned To**: builder-services
- **Agent Type**: builder
- **Parallel**: true (can run alongside task 4 and 5)
- Create `src/services/sharepoint.ts`:
  - Use `@azure/msal-node` `ConfidentialClientApplication` for auth
  - Use `@microsoft/microsoft-graph-client` for Graph API calls
  - Implement `getDocumentContent(siteId, driveId, filePath): Promise<string>` — downloads document content from SharePoint
  - Implement `listDocuments(siteId, driveId): Promise<DriveItem[]>` — lists available documents
  - Include a `getLocalFallback(filePath): Promise<string>` method that reads from `data/` directory when SharePoint is not configured (for local dev/demo)
  - Export typed interfaces for DriveItem, SharePointConfig

### 4. Core Services — Embeddings & Search
- **Task ID**: build-search-embeddings
- **Depends On**: scaffold-project
- **Assigned To**: builder-services
- **Agent Type**: builder
- **Parallel**: true (can run alongside task 3 and 5)
- Create `src/services/embeddings.ts`:
  - Use `@azure/openai` client
  - Implement `generateEmbedding(text: string): Promise<number[]>` — generates vector embedding for a text chunk
  - Implement `chunkDocument(content: string, chunkSize?: number, overlap?: number): string[]` — splits document into overlapping chunks (default 500 tokens, 50 token overlap)
  - Include metadata extraction (section headers, document title) per chunk
- Create `src/services/search.ts`:
  - Use `@azure/search-documents` `SearchClient` and `SearchIndexClient`
  - Implement `createIndex(indexName: string): Promise<void>` — creates vector search index with fields: id, content, contentVector, title, section, metadata
  - Implement `indexDocuments(chunks: ChunkWithVector[]): Promise<void>` — uploads chunked + embedded documents
  - Implement `searchDocuments(query: string, topK?: number): Promise<SearchResult[]>` — vector search with optional hybrid (keyword + vector)
  - Vector field config: 1536 dimensions (text-embedding-3-small), HNSW algorithm, cosine similarity

### 5. Core Services — Interaction Logger
- **Task ID**: build-logger-service
- **Depends On**: scaffold-project
- **Assigned To**: builder-services
- **Agent Type**: builder
- **Parallel**: true (can run alongside task 3 and 4)
- Create `src/services/logger.ts`:
  - Initialize Application Insights with auto-collection enabled
  - Initialize Cosmos DB client (database: copilot-logs, container: interactions, partition key: /userId)
  - Implement `logInteraction(data: InteractionLog): Promise<void>`:
    ```typescript
    interface InteractionLog {
      id: string;              // UUID
      userId: string;          // Teams user ID
      userName: string;        // Display name
      query: string;           // User's question
      response: string;        // Bot's answer
      sources: string[];       // Retrieved document chunks used
      confidenceScore: number; // Search relevance score
      timestamp: string;       // ISO timestamp
      conversationId: string;  // Teams conversation ID
      responseTimeMs: number;  // End-to-end latency
    }
    ```
  - Log to both Application Insights (trackEvent) and Cosmos DB (create document)
  - Implement `getInteractions(filters?: { userId?, startDate?, endDate? }): Promise<InteractionLog[]>` — query Cosmos DB for log review
  - Graceful degradation: if Cosmos DB is not configured, log to Application Insights only; if neither, log to console

### 6. Document Ingestion Script
- **Task ID**: build-ingestion-script
- **Depends On**: build-sharepoint-service, build-search-embeddings
- **Assigned To**: builder-bot
- **Agent Type**: builder
- **Parallel**: false
- Create `src/scripts/ingest.ts`:
  - Read document from SharePoint (or local fallback from `data/travel-policy-india.md`)
  - Chunk the document using `embeddings.chunkDocument()`
  - Generate embeddings for each chunk using `embeddings.generateEmbedding()`
  - Create search index using `search.createIndex()`
  - Upload all chunks with vectors using `search.indexDocuments()`
  - Print summary: number of chunks, index name, total vectors indexed
  - Add npm script: `"ingest": "tsx src/scripts/ingest.ts"`

### 7. Teams Bot with RAG Pipeline
- **Task ID**: build-teams-bot
- **Depends On**: build-search-embeddings, build-logger-service, create-travel-policy
- **Assigned To**: builder-bot
- **Agent Type**: builder
- **Parallel**: false
- Create `src/prompts/chat/skprompt.txt`:
  ```
  You are the Gates Foundation Travel Policy Assistant. You help employees understand travel guidelines for India.

  INSTRUCTIONS:
  - Answer questions ONLY based on the provided context from the travel policy document
  - If the context doesn't contain enough information to answer, say so clearly
  - Always cite the relevant section of the policy in your answer
  - Keep responses concise and professional
  - If asked about topics outside the travel policy, redirect politely

  CONTEXT (from travel policy document):
  {{$context}}

  USER QUESTION:
  {{$input}}
  ```
- Create `src/prompts/chat/config.json`:
  ```json
  {
    "schema": 1.1,
    "description": "Travel policy RAG assistant",
    "type": "completion",
    "completion": {
      "model": "gpt-4o",
      "completion_type": "chat",
      "include_history": true,
      "include_input": true,
      "max_input_tokens": 4096,
      "max_tokens": 1024,
      "temperature": 0.3,
      "top_p": 0.95
    }
  }
  ```
- Create `src/bot.ts`:
  - Initialize `Application` from `@microsoft/teams-ai` with `MemoryStorage`
  - Configure `ActionPlanner` with `OpenAIModel` pointing to Azure OpenAI
  - Before each turn, intercept user message → call `search.searchDocuments(query)` → inject top 3 results into prompt context via `state.temp.context`
  - After each turn, call `logger.logInteraction()` with query, response, sources, timing
  - Handle `/help` command — list available topics
  - Handle `/sources` command — show last query's source chunks
  - Handle adaptive card responses for rich formatting
- Create `src/index.ts`:
  - Express server on configurable port (default 3978)
  - Bot Framework adapter with CloudAdapter
  - POST `/api/messages` endpoint for Teams webhook
  - GET `/api/logs` endpoint — serves log viewer HTML
  - GET `/api/logs/data` endpoint — returns interaction logs as JSON
  - Health check endpoint at GET `/health`

### 8. Teams App Manifest
- **Task ID**: build-app-manifest
- **Depends On**: build-teams-bot
- **Assigned To**: builder-bot
- **Agent Type**: builder
- **Parallel**: false
- Create `appPackage/manifest.json`:
  ```json
  {
    "$schema": "https://developer.microsoft.com/en-us/json-schemas/teams/v1.16/MicrosoftTeams.schema.json",
    "manifestVersion": "1.16",
    "version": "1.0.0",
    "id": "{{BOT_ID}}",
    "developer": {
      "name": "Gates Foundation IT",
      "websiteUrl": "https://www.gatesfoundation.org",
      "privacyUrl": "https://www.gatesfoundation.org/privacy",
      "termsOfUseUrl": "https://www.gatesfoundation.org/terms"
    },
    "name": {
      "short": "Travel Policy Copilot",
      "full": "Gates Foundation Travel Policy Assistant"
    },
    "description": {
      "short": "Ask questions about India travel guidelines",
      "full": "AI-powered assistant that answers questions about the Gates Foundation's India travel policy using retrieval-augmented generation from SharePoint documents."
    },
    "icons": {
      "color": "color.png",
      "outline": "outline.png"
    },
    "accentColor": "#1A6FC4",
    "bots": [
      {
        "botId": "{{BOT_ID}}",
        "scopes": ["personal", "team", "groupChat"],
        "commandLists": [
          {
            "scopes": ["personal"],
            "commands": [
              { "title": "help", "description": "Show available topics and commands" },
              { "title": "sources", "description": "Show sources from last answer" }
            ]
          }
        ]
      }
    ],
    "permissions": ["identity", "messageTeamMembers"],
    "validDomains": ["token.botframework.com", "{{BOT_DOMAIN}}"]
  }
  ```
- Create simple placeholder PNG icons (32x32) for color.png and outline.png
- Add npm script: `"package": "mkdir -p dist && cd appPackage && zip -r ../dist/teams-copilot.zip ."`

### 9. Interaction Log Viewer
- **Task ID**: build-log-viewer
- **Depends On**: build-logger-service
- **Assigned To**: builder-bot
- **Agent Type**: builder
- **Parallel**: true (can run alongside tasks 7-8)
- Create `src/pages/logs.html`:
  - Clean, professional HTML page with embedded CSS (no external dependencies)
  - Table view of all interactions: timestamp, user, query, response (truncated), confidence score, response time
  - Click to expand full response and source chunks
  - Filter controls: date range picker, user search, minimum confidence score
  - Auto-refresh toggle (polls `/api/logs/data` every 30 seconds)
  - Export to CSV button
  - Responsive layout with Foundation blue accent color (#1A6FC4)

### 10. README and Documentation
- **Task ID**: write-docs
- **Depends On**: build-app-manifest, build-log-viewer
- **Assigned To**: builder-bot
- **Agent Type**: builder
- **Parallel**: false
- Create `apps/teams-copilot/README.md`:
  - Project overview and architecture diagram (ASCII)
  - Prerequisites: Node.js 20+, Azure subscription, Teams admin access
  - Azure resource setup guide (step-by-step):
    1. Azure OpenAI Service — deploy `text-embedding-3-small` and `gpt-4o`
    2. Azure AI Search — create service, no manual index creation needed
    3. Azure Cosmos DB — create account with `copilot-logs` database
    4. Azure App Registration — permissions: Sites.Read.All, Files.Read.All
    5. Azure Bot Service — create with Teams channel enabled
    6. Application Insights — create and note instrumentation key
  - Local development setup:
    1. `cp .env.sample .env` and fill in values
    2. `npm install`
    3. `npm run ingest` — index the travel policy
    4. `npm run dev` — start with hot reload
    5. Use Bot Framework Emulator + ngrok for local Teams testing
  - Deployment to Azure App Service
  - Teams app sideloading instructions
  - Log viewer access instructions
  - Sample questions to try:
    - "What visa do I need for India?"
    - "What's the per diem rate for Mumbai?"
    - "What vaccinations are required?"
    - "How do I submit expenses after my trip?"
    - "What are the emergency contacts in India?"

### 11. Final Validation
- **Task ID**: validate-all
- **Depends On**: scaffold-project, create-travel-policy, build-sharepoint-service, build-search-embeddings, build-logger-service, build-ingestion-script, build-teams-bot, build-app-manifest, build-log-viewer, write-docs
- **Assigned To**: validator-final
- **Agent Type**: validator
- **Parallel**: false
- Verify all files exist in `apps/teams-copilot/`:
  - `package.json`, `tsconfig.json`, `.env.sample`
  - `src/index.ts`, `src/bot.ts`, `src/config.ts`
  - `src/services/sharepoint.ts`, `src/services/search.ts`, `src/services/embeddings.ts`, `src/services/logger.ts`
  - `src/scripts/ingest.ts`
  - `src/prompts/chat/skprompt.txt`, `src/prompts/chat/config.json`
  - `data/travel-policy-india.md`
  - `appPackage/manifest.json`
  - `src/pages/logs.html`
  - `README.md`
- Run `cd apps/teams-copilot && npm install && npx tsc --noEmit` — verify TypeScript compiles without errors
- Verify `data/travel-policy-india.md` contains all 10 required sections and is 2000-2500 words
- Verify `manifest.json` is valid JSON with schema 1.16
- Verify all service files export the documented interfaces and functions
- Verify `src/index.ts` sets up Express with `/api/messages`, `/api/logs`, `/api/logs/data`, and `/health` endpoints
- Verify `logs.html` includes table view, filters, expand/collapse, export, and auto-refresh
- Verify `README.md` includes setup instructions, architecture, and sample questions

## Acceptance Criteria

1. **Project compiles**: `npx tsc --noEmit` succeeds with zero errors
2. **All files present**: Every file listed in "New Files" exists with meaningful content
3. **Travel policy document**: Contains all 10 sections, is realistic and detailed (2000-2500 words)
4. **RAG pipeline**: Bot intercepts user messages, searches vector index, injects context into prompt, returns grounded response
5. **Interaction logging**: Every query/response pair is logged with userId, query, response, sources, confidence, timing
6. **Log viewer**: HTML page displays interactions in a filterable, sortable table with expand/collapse
7. **Teams manifest**: Valid v1.16 manifest with bot configuration, commands, and valid domains
8. **Local dev path**: Can run locally with `npm run dev` + Bot Emulator without Azure (using local document fallback)
9. **SharePoint integration**: Graph API client can authenticate and retrieve documents (with graceful local fallback)
10. **Documentation**: README covers all setup steps, architecture, and sample queries

## Validation Commands
Execute these commands to validate the task is complete:

- `ls -la apps/teams-copilot/` - Verify project directory exists
- `cat apps/teams-copilot/package.json | jq '.dependencies'` - Verify all required dependencies
- `cd apps/teams-copilot && npm install && npx tsc --noEmit` - TypeScript compilation check
- `wc -w apps/teams-copilot/data/travel-policy-india.md` - Verify document word count (2000-2500)
- `cat apps/teams-copilot/appPackage/manifest.json | jq '.manifestVersion'` - Verify manifest version is "1.16"
- `grep -l "logInteraction" apps/teams-copilot/src/services/logger.ts` - Verify logger interface exists
- `grep -l "searchDocuments" apps/teams-copilot/src/services/search.ts` - Verify search interface exists
- `grep -l "/api/messages" apps/teams-copilot/src/index.ts` - Verify bot endpoint exists
- `grep -l "/api/logs" apps/teams-copilot/src/index.ts` - Verify log viewer endpoint exists

## Notes

- **Azure Resources**: This plan creates application code only. Azure resources (OpenAI, AI Search, Cosmos DB, Bot Service, App Registration) must be provisioned separately via Azure Portal or Bicep/Terraform.
- **Local Development**: The codebase supports a fully local dev path using the document from `data/` directory and Bot Framework Emulator — no Azure resources required for initial development and testing.
- **Security**: The `.env.sample` file contains no actual secrets. The `.gitignore` should exclude `.env` files. Never commit API keys.
- **Package Manager**: Use `npm` (not Bun) for this project since `@microsoft/teams-ai` and `botbuilder` packages are optimized for the Node.js/npm ecosystem.
- **Icon Assets**: Simple placeholder PNGs are sufficient for demo; production would use proper branded icons.
- **Teams AI v2 Migration**: The codebase is structured to make future migration to Teams SDK v2 straightforward — services are decoupled from the bot framework layer.
