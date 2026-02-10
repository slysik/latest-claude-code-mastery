# Plan: BCBS Claims AI Demo Application

## Task Description

Build a demo application showcasing enterprise-grade GenAI capabilities for the BCBS SC interview (Monday 2/9 at 9am ET). The app demonstrates an **intelligent routing agent** (LangGraph) that decides between NL2SQL for claims data analytics and RAG-powered Q&A on BCBS PDF documents. Also includes CSV-to-Parquet data ingestion via S3, **DynamoDB for conversation persistence**, and **Docker containerization**. Powered by Claude via switchable providers (direct Anthropic API or **AWS Bedrock**) through LangChain. Hybrid local+AWS architecture, optimized for lowest cost.

## Objective

A polished, screenshareable demo app that proves Steve can build production-grade agentic AI solutions on AWS using Python, LangChain/LangGraph, Claude (via Anthropic API or AWS Bedrock), Docker, DynamoDB, and modern web frameworks -- directly aligned with every requirement in the BCBS SC AI Agentic Engineer job posting. **All AWS services use free tier.**

## Context Management

- **Estimated tasks**: 16
- **Checkpoint file**: specs/.checkpoint-bcbs-claims-ai-demo.json
- **Pause threshold**: 90% context usage
- **Resume command**: `/build specs/bcbs-claims-ai-demo.md --resume`

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (React + Vite + TypeScript + Tailwind)        │
│  ┌───────────────────────────────────────┐              │
│  │  Unified Chat Interface               │              │
│  │  "Ask anything about claims or plans" │              │
│  └────────────────┬──────────────────────┘              │
│  ┌──────────┐     │                                     │
│  │ CSV/PDF  │     │                                     │
│  │ Upload   │     │                                     │
│  └────┬─────┘     │                                     │
└───────┼───────────┼─────────────────────────────────────┘
        │           │
        ▼           ▼
┌─────────────────────────────────────────────────────────┐
│  Backend (FastAPI + Python)                             │
│                                                         │
│  ┌────────────────────────────────────────┐             │
│  │  🧠 Router Agent (LangGraph)           │             │
│  │                                        │             │
│  │  User Query → Classify Intent          │             │
│  │       │                                │             │
│  │       ├─ "data question" ──→ NL2SQL    │             │
│  │       ├─ "policy question" ─→ RAG      │             │
│  │       └─ "ambiguous" ──────→ Clarify   │             │
│  │                                        │             │
│  │  State: LangGraph StateGraph           │             │
│  │  - classify_intent (entry)             │             │
│  │  - generate_sql (NL2SQL path)          │             │
│  │  - execute_query (DuckDB)              │             │
│  │  - search_docs (RAG path)              │             │
│  │  - synthesize_answer (both paths)      │             │
│  │  - format_response (exit)              │             │
│  └────────────────────────────────────────┘             │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ /chat    │  │ /upload  │  │ /docs    │              │
│  │ Unified  │  │ CSV→PQ   │  │ Swagger  │              │
│  │ Agent    │  │ PDF→RAG  │  │ UI       │              │
│  └────┬─────┘  └────┬─────┘  └──────────┘              │
│       │              │                                   │
│       ▼              ▼                                   │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │ DuckDB  │  │ AWS S3   │  │ ChromaDB │  │ DynamoDB ││
│  │ (local) │  │ (Parquet)│  │ (local)  │  │ (convos) ││
│  └─────────┘  └──────────┘  └──────────┘  └──────────┘│
│                                                         │
│  ┌─────────────────────────────────────────────┐       │
│  │  Claude LLM (switchable via env var)         │       │
│  │  LLM_PROVIDER=anthropic → ChatAnthropic     │       │
│  │  LLM_PROVIDER=bedrock  → ChatBedrock        │       │
│  │  + LangGraph for agent orchestration         │       │
│  └─────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Docker                                                  │
│  docker-compose.yml → backend + frontend containers     │
│  Dockerfile.backend  (Python + UV)                      │
│  Dockerfile.frontend (Node/Bun + Vite)                  │
└─────────────────────────────────────────────────────────┘

AWS Resources (ALL FREE TIER):
- S3 bucket: bcbs-demo-data (Parquet storage) -- 5GB free
- DynamoDB table: bcbs-conversations -- 25GB free, 25 WCU/RCU free
- Bedrock: Claude access (pay-per-token, same as direct API)
- IAM user with scoped permissions
- No EC2/Lambda needed (local demo, Docker for portability)
```

## LangGraph Router Agent Design

The centerpiece of the demo -- a **stateful agentic workflow** that intelligently routes user queries:

```python
# Simplified LangGraph state machine
from langgraph.graph import StateGraph, END

class AgentState(TypedDict):
    query: str
    intent: Literal["nl2sql", "rag", "clarify"]
    sql: str | None
    query_results: list[dict] | None
    rag_chunks: list[str] | None
    answer: str
    metadata: dict  # route taken, confidence, timing

def classify_intent(state: AgentState) -> AgentState:
    """Claude classifies: is this a data question or a policy question?"""
    # Uses schema context + document list to decide
    ...

def generate_sql(state: AgentState) -> AgentState:
    """Claude generates SQL from natural language + table schema"""
    ...

def execute_query(state: AgentState) -> AgentState:
    """DuckDB executes the generated SQL"""
    ...

def search_documents(state: AgentState) -> AgentState:
    """ChromaDB retrieves relevant document chunks"""
    ...

def synthesize_answer(state: AgentState) -> AgentState:
    """Claude synthesizes final answer from results or chunks"""
    ...

# Build the graph
graph = StateGraph(AgentState)
graph.add_node("classify", classify_intent)
graph.add_node("generate_sql", generate_sql)
graph.add_node("execute_query", execute_query)
graph.add_node("search_docs", search_documents)
graph.add_node("synthesize", synthesize_answer)

graph.set_entry_point("classify")
graph.add_conditional_edges("classify", route_by_intent, {
    "nl2sql": "generate_sql",
    "rag": "search_docs",
    "clarify": "synthesize",
})
graph.add_edge("generate_sql", "execute_query")
graph.add_edge("execute_query", "synthesize")
graph.add_edge("search_docs", "synthesize")
graph.add_edge("synthesize", END)

agent = graph.compile()
```

**Why this matters for the interview:**
- Demonstrates LangGraph (explicitly listed in job requirements)
- Shows agentic routing/planning (core agentic AI concept)
- The graph is visible in the UI -- shows which path the agent took
- Easy to extend with more nodes (fraud detection, prior auth, etc.)

## Technology Choices & Rationale

| Component | Technology | Why |
|-----------|-----------|-----|
| **Backend** | FastAPI (Python) | Job listing says "FastAPI or Flask" as nice-to-have. FastAPI is modern, async, auto-docs |
| **Frontend** | React + Vite + Tailwind + TS | TypeScript shows JS/TS competency from job listing |
| **Agent Framework** | LangChain + LangGraph | Explicitly listed in job requirements. LangGraph for stateful routing agent |
| **LLM** | Claude via switchable provider | `LLM_PROVIDER=anthropic` → `ChatAnthropic`, `LLM_PROVIDER=bedrock` → `ChatBedrock`. Env var switch |
| **Conversations** | DynamoDB | Persists chat history. "document databases" is a required skill. Free tier: 25GB |
| **Containers** | Docker + docker-compose | "Docker, Kubernetes" is required. Single `docker-compose up` to run everything |
| **NL2SQL DB** | DuckDB (in-process) | Zero config, reads Parquet natively from S3, perfect for demo |
| **Vector Store** | ChromaDB (local) | Lightweight, no server needed, LangChain integration built-in |
| **Data Format** | Parquet on S3 | Enterprise standard columnar format, shows AWS + data eng skills |
| **Embeddings** | sentence-transformers (all-MiniLM-L6-v2) | Local, fast, no API cost. LangChain HuggingFaceEmbeddings |
| **PDF Parsing** | PyMuPDF (fitz) | Fast, reliable PDF text extraction |
| **CSV→Parquet** | Pandas + PyArrow | Industry standard data engineering pipeline |

## Demo Flow (What Steve Shows in Interview)

### Scene 1: CSV Upload & Data Pipeline (2 min)
1. Upload `sample_claims.csv` (synthetic BCBS-like claims data)
2. System converts CSV → Parquet, uploads to S3
3. DuckDB auto-discovers the Parquet schema
4. Show the S3 console briefly -- "Here's the data in enterprise columnar format"

### Scene 2: Unified Agent Chat -- NL2SQL Path (3 min)
1. Ask: "What are the top 5 diagnosis codes by claim count?"
2. UI shows: **Agent routed to: NL2SQL** → generated SQL (collapsible) → results table + bar chart
3. Ask: "Show me the monthly trend of claims over $10,000"
4. Agent auto-routes to NL2SQL → time-series query → line chart
5. Ask: "Which providers have the highest denial rate?"
6. Show the LangGraph execution trace in the UI

### Scene 3: Unified Agent Chat -- RAG Path (2 min)
1. Upload a BCBS benefits summary PDF (already pre-loaded)
2. Ask: "What is the deductible for in-network services?"
3. UI shows: **Agent routed to: RAG** → retrieved chunks (collapsible) → synthesized answer with citations
4. Ask: "Is telehealth covered under this plan?"
5. Agent auto-routes to RAG, shows citations

### Scene 4: The "Wow" Moment -- Seamless Routing (1 min)
1. Ask: "How many telehealth claims were filed last quarter?" -- Agent routes to NL2SQL (it's a data question!)
2. Ask: "What does the plan say about telehealth coverage?" -- Agent routes to RAG (it's a policy question!)
3. Same interface, same chat -- the agent decides. This is agentic AI.

### Scene 5: Architecture Walkthrough (1 min)
1. Show the FastAPI endpoints in Swagger UI
2. Show the LangGraph state machine diagram
3. Briefly mention Claude Code hooks powered the development

## Sample Data Strategy

### Claims CSV (synthetic, no real PHI)
```csv
claim_id,member_id,provider_id,service_date,diagnosis_code,procedure_code,billed_amount,allowed_amount,paid_amount,status,denial_reason
CLM001,MBR100,PRV001,2025-01-15,J06.9,99213,150.00,120.00,96.00,PAID,
CLM002,MBR101,PRV002,2025-01-16,M54.5,99214,200.00,160.00,0.00,DENIED,Not medically necessary
...
```

Generate ~1000 rows covering:
- Multiple diagnosis codes (ICD-10): respiratory, musculoskeletal, cardiovascular, mental health
- Multiple procedure codes (CPT): office visits, imaging, labs
- Mix of PAID, DENIED, PENDING statuses
- Realistic denial reasons
- Provider network (in-network vs out-of-network)
- Date range: 12 months

### BCBS PDF Document
Download a publicly available BCBS SC member handbook or benefits summary from southcarolinablues.com for RAG demo.

## Team Members

### builder-backend
- **Role**: Build FastAPI backend with LangChain/LangGraph agent, Claude integration, DuckDB, ChromaDB
- **Agent Type**: builder
- **Tools**: All (Edit, Write, Bash)

### builder-frontend
- **Role**: Build React frontend with unified chat UI, upload components, data visualization, agent trace display
- **Agent Type**: builder
- **Tools**: All (Edit, Write, Bash)

### builder-data
- **Role**: Generate synthetic claims data, set up S3 integration, create Parquet pipeline
- **Agent Type**: builder
- **Tools**: All (Edit, Write, Bash)

### validator
- **Role**: Read-only verification of all implementations
- **Agent Type**: validator
- **Tools**: Read-only (Read, Glob, Grep)

## Step by Step Tasks

### 1. Project Scaffolding
- **Task ID**: scaffold-project
- **Depends On**: none
- **Assigned To**: builder-backend
- **Checkpoint After**: Yes
- Create `apps/bcbs-demo/` directory structure:
  ```
  apps/bcbs-demo/
  ├── docker-compose.yml       # Backend + frontend containers
  ├── Dockerfile.backend       # Python + UV
  ├── Dockerfile.frontend      # Bun + Vite
  ├── .env.sample              # All env vars (AWS, LLM provider, etc.)
  ├── backend/
  │   ├── app/
  │   │   ├── __init__.py
  │   │   ├── main.py          # FastAPI app
  │   │   ├── config.py        # Settings (env vars, pydantic-settings)
  │   │   ├── routers/
  │   │   │   ├── chat.py      # Unified agent chat endpoint
  │   │   │   ├── upload.py    # CSV/PDF upload + S3
  │   │   │   └── data.py      # Schema, datasets, documents list
  │   │   ├── agent/
  │   │   │   ├── graph.py     # LangGraph StateGraph definition
  │   │   │   ├── nodes.py     # Agent node functions
  │   │   │   ├── state.py     # AgentState TypedDict
  │   │   │   ├── prompts.py   # System prompts for each node
  │   │   │   └── llm.py       # LLM provider factory (Anthropic ↔ Bedrock switch)
  │   │   ├── services/
  │   │   │   ├── database.py  # DuckDB manager
  │   │   │   ├── storage.py   # S3 + Parquet
  │   │   │   ├── conversations.py # DynamoDB conversation persistence
  │   │   │   └── vectorstore.py # ChromaDB + embeddings
  │   │   └── models/
  │   │       └── schemas.py   # Pydantic request/response models
  │   ├── pyproject.toml       # UV project deps
  │   └── .env.sample
  ├── frontend/
  │   ├── src/
  │   │   ├── App.tsx
  │   │   ├── main.tsx
  │   │   ├── index.css
  │   │   ├── components/
  │   │   │   ├── ChatPanel.tsx
  │   │   │   ├── UploadPanel.tsx
  │   │   │   ├── ResultsTable.tsx
  │   │   │   ├── ChartView.tsx
  │   │   │   ├── AgentTrace.tsx  # Shows LangGraph routing path
  │   │   │   ├── SqlViewer.tsx   # Collapsible SQL display
  │   │   │   ├── Citations.tsx   # RAG source citations
  │   │   │   └── Layout.tsx
  │   │   ├── hooks/
  │   │   │   └── useChat.ts
  │   │   └── lib/
  │   │       └── api.ts
  │   ├── package.json
  │   ├── tsconfig.json
  │   ├── vite.config.ts
  │   └── tailwind.config.js
  └── data/
      ├── generate_claims.py
      └── sample_claims.csv
  ```
- Set up pyproject.toml with deps: fastapi, uvicorn, langchain, langchain-anthropic, langchain-aws, langchain-community, langgraph, duckdb, chromadb, sentence-transformers, boto3, pandas, pyarrow, pymupdf, python-multipart, pydantic-settings
- Set up package.json with deps: react, react-dom, vite, @vitejs/plugin-react, tailwindcss, postcss, autoprefixer, recharts, lucide-react, typescript, @types/react, @types/react-dom

### 2. Generate Synthetic Claims Data
- **Task ID**: generate-data
- **Depends On**: scaffold-project
- **Assigned To**: builder-data
- **Checkpoint After**: Yes
- Create Python script `apps/bcbs-demo/data/generate_claims.py` that generates 1000+ synthetic claims
- Include realistic ICD-10 codes, CPT codes, provider IDs, member IDs
- Mix of PAID (70%), DENIED (20%), PENDING (10%) statuses
- Realistic denial reasons (not medically necessary, out of network, prior auth required, etc.)
- Date range: Jan 2025 - Dec 2025
- Generate `sample_claims.csv` output
- Also generate `sample_members.csv` (member demographics - age, plan type, region) and `sample_providers.csv` (provider name, specialty, network status)

### 3. Download Public BCBS PDF
- **Task ID**: download-pdf
- **Depends On**: scaffold-project
- **Assigned To**: builder-data
- **Checkpoint After**: Yes
- Find and download a publicly available BCBS SC benefits summary or member handbook PDF
- Save to `apps/bcbs-demo/data/bcbs_benefits.pdf`
- If direct download fails, create a realistic sample benefits PDF using reportlab with typical sections: deductibles, copays, covered services, exclusions, telehealth, prescription drug coverage, prior authorization requirements

### 4. Build LangGraph Router Agent
- **Task ID**: build-langgraph-agent
- **Depends On**: scaffold-project
- **Assigned To**: builder-backend
- **Checkpoint After**: Yes
- Implement `app/agent/state.py`:
  - `AgentState(TypedDict)` with fields: query, intent, sql, query_results, rag_chunks, answer, metadata, conversation_history
- Implement `app/agent/prompts.py`:
  - `CLASSIFY_PROMPT` -- system prompt for intent classification (nl2sql vs rag vs clarify)
  - `SQL_GENERATION_PROMPT` -- system prompt for SQL generation with schema context
  - `RAG_SYNTHESIS_PROMPT` -- system prompt for RAG answer synthesis with citations
  - `CLARIFICATION_PROMPT` -- when intent is ambiguous
- Implement `app/agent/llm.py`:
  - LLM provider factory: reads `LLM_PROVIDER` env var
  - `get_llm() -> BaseChatModel`:
    - `"anthropic"` → `ChatAnthropic(model="claude-sonnet-4-5-20250929")`
    - `"bedrock"` → `ChatBedrock(model_id="anthropic.claude-sonnet-4-5-20250929-v1:0", region_name=AWS_REGION)`
  - Both use same LangChain `BaseChatModel` interface -- seamless swap
  - Default to `"anthropic"` if env var not set
- Implement `app/agent/nodes.py`:
  - `classify_intent(state)` -- uses `get_llm()` to classify query intent based on available data sources
  - `generate_sql(state)` -- generates SQL from natural language + table schema
  - `execute_query(state)` -- runs SQL via DuckDB, captures results
  - `search_documents(state)` -- retrieves relevant chunks from ChromaDB
  - `synthesize_answer(state)` -- generates final answer from results or chunks
- Implement `app/agent/graph.py`:
  - Build `StateGraph(AgentState)` with conditional routing
  - `classify` → conditional edge → `generate_sql` | `search_docs` | `synthesize`
  - `generate_sql` → `execute_query` → `synthesize`
  - `search_docs` → `synthesize`
  - `synthesize` → END
  - Compile and export `agent` instance
  - Include timing/tracing metadata at each node

### 5. Build DuckDB + S3 Data Layer
- **Task ID**: build-data-layer
- **Depends On**: scaffold-project
- **Assigned To**: builder-backend
- **Checkpoint After**: Yes
- Implement `app/services/database.py`:
  - DuckDB connection manager (in-memory or file-based)
  - `load_parquet(s3_path: str)` -- register Parquet from S3 as DuckDB table
  - `load_csv(file_path: str)` -- load CSV directly for local-only mode
  - `execute_query(sql: str) -> list[dict]` -- execute SQL, return results as list of dicts
  - `get_schema() -> str` -- return table schemas formatted for Claude context (CREATE TABLE statements)
  - `get_sample_data(table: str, limit: int = 5) -> str` -- sample rows for context
- Implement `app/services/storage.py`:
  - S3 upload with boto3 (bucket from env var)
  - CSV → Parquet conversion with pandas/pyarrow
  - Fallback to local-only mode if AWS credentials not configured (store Parquet locally)
  - List uploaded datasets

### 6. Build Vector Store / RAG Pipeline
- **Task ID**: build-rag-pipeline
- **Depends On**: scaffold-project
- **Assigned To**: builder-backend
- **Checkpoint After**: Yes
- Implement `app/services/vectorstore.py`:
  - PDF text extraction with PyMuPDF
  - Chunking strategy (500 tokens, 100 token overlap, with page number metadata)
  - ChromaDB collection management with LangChain `Chroma` wrapper
  - `ingest_pdf(file_path: str, doc_name: str)` -- extract, chunk, embed, store with metadata
  - `search(query: str, top_k: int = 5) -> list[Document]` -- retrieve relevant chunks with scores
  - Use `HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")` for local embeddings
  - `list_documents() -> list[str]` -- list ingested document names
  - `get_document_summary(doc_name: str) -> str` -- first-page summary for context

### 7. Build FastAPI Endpoints
- **Task ID**: build-api-endpoints
- **Depends On**: build-langgraph-agent, build-data-layer, build-rag-pipeline
- **Assigned To**: builder-backend
- **Checkpoint After**: Yes
- Implement `app/routers/chat.py`:
  - `POST /api/chat` -- accepts `{ query: str, conversation_id?: str }`, invokes LangGraph agent, returns structured response:
    ```json
    {
      "answer": "The top 5 diagnosis codes are...",
      "intent": "nl2sql",
      "sql": "SELECT diagnosis_code, COUNT(*) ...",
      "results": [{"diagnosis_code": "J06.9", "count": 142}, ...],
      "citations": null,
      "agent_trace": ["classify→nl2sql", "generate_sql", "execute_query", "synthesize"],
      "timing_ms": 1234
    }
    ```
  - `GET /api/chat/history/{conversation_id}` -- returns conversation history
- Implement `app/routers/upload.py`:
  - `POST /api/upload/csv` -- accepts CSV file, converts to Parquet, uploads to S3, loads into DuckDB
  - `POST /api/upload/pdf` -- accepts PDF file, ingests into ChromaDB
  - `GET /api/datasets` -- list available datasets (CSVs loaded)
  - `GET /api/documents` -- list ingested PDF documents
- Implement `app/routers/data.py`:
  - `GET /api/schema` -- returns current table schemas
  - `GET /api/health` -- health check
  - `GET /api/config` -- returns feature flags (s3_enabled, etc.)
- Implement `app/main.py`:
  - CORS middleware for frontend (localhost:5173)
  - Mount all routers under /api
  - Startup event: initialize DuckDB, ChromaDB, load sample data if present
  - Shutdown event: cleanup

### 8. Build React Frontend -- Core Layout & Chat
- **Task ID**: build-frontend-core
- **Depends On**: build-api-endpoints
- **Assigned To**: builder-frontend
- **Checkpoint After**: Yes
- **Layout.tsx**: Two-panel layout
  - Left sidebar: Navigation (Chat | Upload), uploaded datasets/docs list, app branding
  - Main area: Active panel content
  - Header: "BCBS Claims AI" with blue BCBS-style branding
- **ChatPanel.tsx**: Unified agent chat interface
  - Message bubbles: user (right) and agent (left)
  - Agent responses include:
    - Intent badge ("NL2SQL" or "RAG" or "Clarification")
    - AgentTrace component showing the LangGraph path
    - SqlViewer component (collapsible SQL for NL2SQL)
    - ResultsTable component (for NL2SQL query results)
    - ChartView component (auto-generated chart from results)
    - Citations component (for RAG answers)
  - Suggested queries bar at top: "Top diagnosis codes", "Monthly claim trends", "What does the plan cover?"
  - Input area with Enter to send
  - Typing indicator while agent processes
- **useChat.ts hook**: Manages chat state, API calls, conversation history
- **api.ts**: Typed API client for all backend endpoints

### 9. Build React Frontend -- Data Components
- **Task ID**: build-frontend-components
- **Depends On**: build-frontend-core
- **Assigned To**: builder-frontend
- **Checkpoint After**: Yes
- **UploadPanel.tsx**: Drag-and-drop zone for CSV and PDF files
  - File type detection (CSV → data pipeline, PDF → RAG pipeline)
  - Upload progress indicator
  - Success/error feedback
  - List of uploaded datasets and documents
- **ResultsTable.tsx**: Sortable, paginated data table
  - Column headers from SQL results
  - Sort on click
  - Max 100 rows displayed
- **ChartView.tsx**: Auto-generated charts using Recharts
  - Detect chart type from data: bar chart (categorical), line chart (time series), pie chart (proportional)
  - Simple heuristics: if x-axis is date → line chart, else → bar chart
- **AgentTrace.tsx**: Visual display of LangGraph execution path
  - Horizontal flow: classify → [route] → ... → synthesize
  - Highlighted active path with timing
- **SqlViewer.tsx**: Collapsible SQL code display with syntax highlighting
- **Citations.tsx**: Source citations from RAG with page numbers

### 10. Build DynamoDB Conversation Persistence
- **Task ID**: build-dynamodb
- **Depends On**: scaffold-project
- **Assigned To**: builder-backend
- **Checkpoint After**: Yes
- Implement `app/services/conversations.py`:
  - DynamoDB table: `bcbs-conversations` (partition key: `conversation_id`, sort key: `timestamp`)
  - `save_message(conversation_id: str, role: str, content: str, metadata: dict)` -- persist chat message
  - `get_history(conversation_id: str) -> list[dict]` -- retrieve full conversation history
  - `list_conversations() -> list[dict]` -- list all conversations with summaries
  - `delete_conversation(conversation_id: str)` -- cleanup
  - Fallback to in-memory dict if DynamoDB not configured (for local-only mode)
  - Use `boto3.resource('dynamodb')` with region from env var
- Wire into chat router: save every user message and agent response
- **Free tier**: 25GB storage, 25 read/write capacity units (more than enough for demo)

### 11. AWS Setup (All Free Tier)
- **Task ID**: setup-aws
- **Depends On**: none
- **Assigned To**: builder-data
- **Checkpoint After**: Yes
- Document and script the minimal AWS setup (all within free tier):
  - **S3**: Create bucket `bcbs-demo-data-{unique-suffix}` -- 5GB free storage
  - **DynamoDB**: Create table `bcbs-conversations` -- 25GB free, 25 RCU/WCU free
  - **Bedrock**: Enable Claude model access in us-east-1 (pay-per-token, same as direct API)
  - **IAM**: Create user with scoped policy for S3 + DynamoDB + Bedrock only
  - Generate access key/secret, add to `.env`
- Create setup script `apps/bcbs-demo/scripts/setup_aws.sh` with AWS CLI commands
- Create `apps/bcbs-demo/scripts/setup_aws_dynamodb.sh` for DynamoDB table creation
- Ensure app works in local-only mode (no AWS) as fallback -- test explicitly
- Document estimated monthly cost: ~$0 for demo usage (all free tier except Bedrock per-token)

### 12. Docker Containerization
- **Task ID**: build-docker
- **Depends On**: build-api-endpoints, build-frontend-core
- **Assigned To**: builder-backend
- **Checkpoint After**: Yes
- Create `apps/bcbs-demo/Dockerfile.backend`:
  - Base: `python:3.12-slim`
  - Install UV, copy pyproject.toml, install deps
  - Copy app code, expose port 8000
  - CMD: `uv run uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Create `apps/bcbs-demo/Dockerfile.frontend`:
  - Base: `oven/bun:latest`
  - Copy package.json, install deps
  - Copy src, build with Vite
  - Serve with `bunx serve -s dist -l 3000` (or nginx stage)
- Create `apps/bcbs-demo/docker-compose.yml`:
  - `backend` service: builds from Dockerfile.backend, port 8000, env_file
  - `frontend` service: builds from Dockerfile.frontend, port 3000
  - Shared `.env` file for AWS credentials and LLM provider
  - Volume mount for `data/` directory (sample data persistence)
- Test: `docker-compose up --build` starts both services
- **Interview talking point**: "One command to run the entire stack"

### 13. Integration Testing & Bug Fixes
- **Task ID**: integration-test
- **Depends On**: build-frontend-components, setup-aws, build-dynamodb, build-docker
- **Assigned To**: builder-backend
- **Checkpoint After**: Yes
- Create `apps/bcbs-demo/scripts/run_demo.sh`:
  - Start backend: `cd backend && uv run uvicorn app.main:app --reload --port 8000`
  - Start frontend: `cd frontend && bun run dev` (port 5173)
  - Auto-load sample data on startup
- Test all flows end-to-end:
  - CSV upload → S3/local → DuckDB → NL2SQL via agent → results + chart
  - PDF upload → ChromaDB → RAG via agent → answer + citations
  - Agent routing: data question routes to NL2SQL, policy question routes to RAG
  - LLM provider switch: test with `LLM_PROVIDER=anthropic` and `LLM_PROVIDER=bedrock`
  - DynamoDB persistence: verify conversation history persists across page refreshes
  - Docker: `docker-compose up --build` runs successfully
  - Error handling: bad CSV, invalid SQL, missing PDF, API errors
  - Graceful fallback: app works with no AWS configured (in-memory convos, local Parquet)
- Fix any issues discovered during testing

### 14. Polish & Demo Readiness
- **Task ID**: polish-demo
- **Depends On**: integration-test
- **Assigned To**: builder-frontend
- **Checkpoint After**: Yes
- Add loading states (skeleton loaders while agent processes)
- Add error handling UI (toast notifications, retry buttons)
- Add empty states ("Upload a CSV to start querying data")
- Pre-populate with sample data on startup for instant demo
- Add "About" section/modal explaining the architecture + tech stack + AWS services
- Ensure the app looks professional for screenshare (no debug artifacts)
- Add keyboard shortcuts (Enter to send, Escape to clear)
- Test at 1920x1080 viewport (typical screenshare size)
- Show LLM provider in footer (Anthropic or Bedrock) as visual indicator

### 15. Create Demo Script & README
- **Task ID**: create-demo-docs
- **Depends On**: polish-demo
- **Assigned To**: builder-data
- **Checkpoint After**: Yes
- Create `apps/bcbs-demo/README.md`:
  - Project overview and architecture diagram
  - Quick start: `docker-compose up` OR manual `uv run` + `bun run dev`
  - Environment variables needed (with Anthropic vs Bedrock options)
  - AWS setup guide (free tier, all optional)
  - Tech stack rationale mapped to BCBS job requirements
- Create `apps/bcbs-demo/DEMO_SCRIPT.md`:
  - Step-by-step demo walkthrough matching the interview flow
  - Exact queries to type for best results
  - Talking points for each scene
  - "Switch to Bedrock" moment (change env var, restart)
  - Fallback plan if something breaks

### 16. Final Validation
- **Task ID**: validate-all
- **Depends On**: create-demo-docs
- **Assigned To**: validator
- **Checkpoint After**: Yes
- Verify all acceptance criteria are met
- Check that backend starts without errors: `uv run uvicorn app.main:app`
- Check that frontend builds without errors: `bun run build`
- Check Docker: `docker-compose build` succeeds
- Verify LangGraph agent routes correctly (data question → NL2SQL, policy question → RAG)
- Verify LLM provider switch works (anthropic ↔ bedrock)
- Verify DynamoDB conversation persistence (or in-memory fallback)
- Verify S3 upload/download works (or graceful local fallback)
- Verify RAG pipeline returns relevant answers with citations
- Run Python linting: `ruff check app/`
- Run TypeScript type checking: `bunx tsc --noEmit`
- Verify demo script queries produce good results

## Acceptance Criteria

1. FastAPI backend starts and serves Swagger UI at `/docs`
2. React frontend renders with professional BCBS-themed UI (blue/white palette)
3. LangGraph router agent correctly classifies and routes queries
4. CSV upload converts to Parquet and stores in S3 (or local fallback)
5. NL2SQL path: generates valid SQL from natural language via Claude + LangChain
6. DuckDB executes generated SQL and returns results
7. Results display as both table and auto-detected chart type in frontend
8. PDF upload extracts text and stores embeddings in ChromaDB
9. RAG path: returns relevant answers with source citations and page numbers
10. Agent trace visualization shows the routing path in the UI
11. LLM provider switches cleanly between Anthropic and Bedrock via env var
12. DynamoDB persists conversation history (with in-memory fallback)
13. `docker-compose up --build` starts the full stack successfully
14. All Python code passes `ruff check`
15. All TypeScript code passes `tsc --noEmit`
16. Demo can run locally with `./scripts/run_demo.sh` OR `docker-compose up`
17. README and demo script are complete and accurate

## Validation Commands

```bash
# Backend
cd apps/bcbs-demo/backend && uv run ruff check app/
cd apps/bcbs-demo/backend && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend
cd apps/bcbs-demo/frontend && bun run build
cd apps/bcbs-demo/frontend && bunx tsc --noEmit

# Docker
cd apps/bcbs-demo && docker-compose build
cd apps/bcbs-demo && docker-compose up -d && curl http://localhost:8000/api/health

# Integration
curl http://localhost:8000/api/health
curl http://localhost:8000/api/config  # shows enabled features + LLM provider
curl http://localhost:8000/docs

# Agent test -- NL2SQL route
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the top 5 diagnosis codes?"}'

# Agent test -- RAG route
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the deductible for in-network services?"}'

# Provider switch test
LLM_PROVIDER=bedrock uv run uvicorn app.main:app --port 8001  # test Bedrock
```

## Interview Talking Points (from Research)

### BCBS SC Context
- $3B revenue, 13,000 employees, 20+ subsidiaries
- Processes 20% of all Medicare claims (200M+/year, growing to 500M)
- This is their FIRST dedicated AI Engineer hire -- greenfield opportunity
- CTO: Ravi Ravindra; CEO: Ed Sellers (growth-oriented, "fluid, scalable platform")

### Map Demo to Job Requirements
| Demo Feature | Job Requirement Hit | Status |
|-------------|-------------------|--------|
| LangGraph router agent | "LangChain, LangGraph" (required) | REQUIRED |
| Agentic routing/planning | "Agentic AI concepts (reasoning, planning, tool use)" (required) | REQUIRED |
| FastAPI backend | "FastAPI or Flask with Python" (nice-to-have) | NICE-TO-HAVE |
| Claude via LangChain | "Claude, OpenAI, or comparable LLMs" (required) | REQUIRED |
| NL2SQL agent path | "Prompt engineering, autonomous agents" (required) | REQUIRED |
| RAG pipeline | "RAG, embeddings, knowledge stores" (nice-to-have) | NICE-TO-HAVE |
| **AWS Bedrock (Claude)** | **"Cloud environments (AWS preferred)"** (required) | **REQUIRED** |
| **S3 + Parquet** | **"Cloud environments (AWS preferred)"** (required) | **REQUIRED** |
| **DynamoDB** | **"document databases"** (required) | **REQUIRED** |
| **Docker + docker-compose** | **"Docker, Kubernetes"** (required) | **REQUIRED** |
| **Switchable LLM provider** | **"Experience deploying AI solutions across AWS, Azure"** (nice-to-have) | **NICE-TO-HAVE** |
| React + TypeScript | "JavaScript / TypeScript" (required) | REQUIRED |
| Clean API design | "RESTful API development and integration" (required) | REQUIRED |
| ChromaDB embeddings | "embeddings, knowledge stores" (nice-to-have) | NICE-TO-HAVE |
| Claude Code hooks (dev process) | "Claude Skills (or similar)" (required) | REQUIRED |
| Multi-agent architecture | "multi-agent systems" (nice-to-have) | NICE-TO-HAVE |

**Coverage: 10/10 required skills + 6/8 nice-to-haves demonstrated**

### Questions to Ask
1. "What does success look like in the first 90 days for this role?"
2. "What AI use cases has the team already identified as highest priority?"

### Interview Tips (from recruiter Stephanie)
- Technical answers: 30 sec to 1 min, then ask if they want elaboration
- You'd be their 1st AI Engineer -- mentorship after a few months is important
- Culture fit matters -- show collaborative, learning-oriented mindset
