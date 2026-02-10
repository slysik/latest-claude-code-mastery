# Plan: BCBS AI Opportunities Demo Section

## Task Description
Add a new top-level "AI Opportunities" demo section to the existing Palmetto AI frontend that showcases 4 unmet AI capabilities for healthcare payers. The section demonstrates natural-language claims analytics, self-service AI insights/visualizations, and agentic multi-step task workflows -- all as frontend-only additions with mock data. Every flow includes human handoff CTAs and trust/safety UI elements (confidence indicators, disclaimers, audit logs).

## Objective
When complete, the Palmetto AI frontend will have a third top-level tab ("AI Opportunities") containing:
- 4 interactive feature modules with realistic mock flows
- A "Proactive Recommendations" panel with personalized suggestions
- Trust/safety UI elements throughout (confidence bars, disclaimers, activity logs)
- Human handoff CTAs in every flow
- Feature flag constant to show/hide the entire section
- All mock data in dedicated files
- Zero changes to existing Chat/Upload functionality or backend APIs
- `tsc -b && vite build` passes with zero errors

## Problem Statement
The current Palmetto AI demo shows NL2SQL and RAG capabilities (Chat tab) plus data ingestion (Upload tab), but does not demonstrate several high-value AI capabilities that would resonate with BCBS SC leadership during the interview:
1. **Self-service claims analytics** with NL query input, sample prompts, and SQL/result preview
2. **AI-powered document Q&A** with citations and source snippets
3. **AI-generated health spend insights** with charts and narrative analysis
4. **Agentic multi-step workflows** (appeals, cost comparison, benefits verification)

Additionally, there are no trust/safety patterns (confidence indicators, disclaimers, audit traces) or human-in-the-loop handoff moments -- both critical for enterprise healthcare AI.

## Solution Approach
1. **Add a feature flag** (`ENABLE_AI_OPPORTUNITIES`) and a third tab in Layout
2. **Create mock data module** (`src/mocks/aiOpportunities.ts`) with all sample data, responses, and workflow steps
3. **Build 4 feature modules** as self-contained components, each with mock interaction flows
4. **Add shared trust/safety components** (ConfidenceIndicator, AiDisclaimer, ActivityLog, HandoffCTA)
5. **Wire everything into an AiOpportunitiesPanel** that renders feature cards with expand-to-interactive-flow behavior
6. **Keep everything frontend-only** -- no API calls, no backend changes, no modifications to existing components

## Relevant Files

### Existing Files (to modify minimally)
- `/Users/slysik/bcbs/frontend/src/App.tsx` -- Add third tab state and `AiOpportunitiesPanel` render
- `/Users/slysik/bcbs/frontend/src/components/Layout.tsx` -- Add "AI Opportunities" tab button (update `activeTab` type)
- `/Users/slysik/bcbs/frontend/src/index.css` -- Add keyframes/utilities for new components (pulse animation, progress bar)
- `/Users/slysik/bcbs/frontend/tailwind.config.js` -- No changes needed (palette already sufficient)

### New Files
- `/Users/slysik/bcbs/frontend/src/components/PalmettoLogo.tsx` -- SVG component: South Carolina palmetto tree with crescent moon in white, used in header branding
- `/Users/slysik/bcbs/frontend/src/config/featureFlags.ts` -- Feature flag constants
- `/Users/slysik/bcbs/frontend/src/mocks/aiOpportunities.ts` -- All mock data: sample queries, responses, workflow steps, recommendations, activity log entries
- `/Users/slysik/bcbs/frontend/src/components/ai-opportunities/AiOpportunitiesPanel.tsx` -- Main panel with feature cards grid + proactive recommendations
- `/Users/slysik/bcbs/frontend/src/components/ai-opportunities/AskMyClaimsModule.tsx` -- NL claims analytics demo
- `/Users/slysik/bcbs/frontend/src/components/ai-opportunities/AskMyPlanDocsModule.tsx` -- Document Q&A with citations
- `/Users/slysik/bcbs/frontend/src/components/ai-opportunities/HealthSpendInsightsModule.tsx` -- Charts + AI narrative insights
- `/Users/slysik/bcbs/frontend/src/components/ai-opportunities/AiWorkflowsModule.tsx` -- Multi-step task runner with progress
- `/Users/slysik/bcbs/frontend/src/components/ai-opportunities/shared/ConfidenceIndicator.tsx` -- Visual confidence bar/badge
- `/Users/slysik/bcbs/frontend/src/components/ai-opportunities/shared/AiDisclaimer.tsx` -- "AI-generated, verify details" notice
- `/Users/slysik/bcbs/frontend/src/components/ai-opportunities/shared/ActivityLog.tsx` -- Audit-trace style log panel
- `/Users/slysik/bcbs/frontend/src/components/ai-opportunities/shared/HandoffCTA.tsx` -- "Speak to a representative" button
- `/Users/slysik/bcbs/frontend/src/components/ai-opportunities/shared/FeatureCard.tsx` -- Reusable card with icon, title, description, business value tooltip
- `/Users/slysik/bcbs/frontend/src/components/ai-opportunities/shared/ProactiveRecommendations.tsx` -- Personalized suggestions panel

### Reference Only (DO NOT MODIFY)
- `/Users/slysik/bcbs/frontend/src/lib/api.ts` -- Existing API client (no changes)
- `/Users/slysik/bcbs/frontend/src/hooks/useChat.ts` -- Existing chat hook (no changes)
- All existing components in `/Users/slysik/bcbs/frontend/src/components/` -- Preserve exactly as-is

## Implementation Phases

### Phase 1: Foundation
- Create feature flag module
- Create comprehensive mock data file
- Create shared UI components (ConfidenceIndicator, AiDisclaimer, ActivityLog, HandoffCTA, FeatureCard, ProactiveRecommendations)
- Update Layout.tsx to support 3-tab navigation
- Update App.tsx to render the new panel

### Phase 2: Core Implementation
- Build AiOpportunitiesPanel (feature cards grid layout)
- Build AskMyClaimsModule (NL input, sample prompts, simulated SQL/result preview)
- Build AskMyPlanDocsModule (chat with citations panel)
- Build HealthSpendInsightsModule (Recharts + AI narrative)
- Build AiWorkflowsModule (step-by-step task runner with state machine)

### Phase 3: Integration & Polish
- Wire ProactiveRecommendations panel into the main panel
- Add loading/empty/error states for each module
- Add responsive breakpoints for all new components
- Add CSS animations for card expand, step transitions, confidence bar fill
- Validate TypeScript strict mode compliance
- Verify build passes

## Team Orchestration

- You operate as the team lead and orchestrate the team to execute the plan.
- You're responsible for deploying the right team members with the right context to execute the plan.
- IMPORTANT: You NEVER operate directly on the codebase. You use `Task` and `Task*` tools to deploy team members to do the building, validating, testing, deploying, and other tasks.
  - This is critical. Your job is to act as a high level director of the team, not a builder.
  - You're role is to validate all work is going well and make sure the team is on track to complete the plan.
  - You'll orchestrate this by using the Task* Tools to manage coordination between the team members.
  - Communication is paramount. You'll use the Task* Tools to communicate with the team members and ensure they're on track to complete the plan.
- Take note of the session id of each team member. This is how you'll reference them.

### Team Members

- Builder
  - Name: builder-foundation
  - Role: Create feature flags, mock data file, and all shared UI components (ConfidenceIndicator, AiDisclaimer, ActivityLog, HandoffCTA, FeatureCard, ProactiveRecommendations). Update Layout.tsx and App.tsx to support 3-tab navigation.
  - Agent Type: general-purpose
  - Resume: true

- Builder
  - Name: builder-claims-docs
  - Role: Build AskMyClaimsModule (NL claims analytics with sample prompts, simulated SQL preview, results table, charts) and AskMyPlanDocsModule (chat interface with citations panel, source snippets, page references).
  - Agent Type: general-purpose
  - Resume: true

- Builder
  - Name: builder-insights-workflows
  - Role: Build HealthSpendInsightsModule (Recharts charts + AI-generated narrative insights panel) and AiWorkflowsModule (multi-step task runner with progress state, step descriptions, completion tracking).
  - Agent Type: general-purpose
  - Resume: true

- Builder
  - Name: builder-panel-polish
  - Role: Build AiOpportunitiesPanel (feature cards grid with expand-to-module), wire ProactiveRecommendations, add responsive breakpoints, loading/empty states, CSS animations, and final integration across all modules.
  - Agent Type: general-purpose
  - Resume: true

- Builder
  - Name: validator-final
  - Role: Run `tsc -b && vite build`, verify all existing components are unmodified, confirm feature flag works, inspect for dead code, validate responsive behavior, check accessibility contrast.
  - Agent Type: validator
  - Resume: false

## Step by Step Tasks

- IMPORTANT: Execute every step in order, top to bottom. Each task maps directly to a `TaskCreate` call.
- Before you start, run `TaskCreate` to create the initial task list that all team members can see and execute.

### 1. Create Feature Flags & Mock Data
- **Task ID**: foundation-data
- **Depends On**: none
- **Assigned To**: builder-foundation
- **Agent Type**: general-purpose
- **Parallel**: true
- Create `/Users/slysik/bcbs/frontend/src/config/featureFlags.ts`:
  ```typescript
  export const ENABLE_AI_OPPORTUNITIES = true
  ```
- Create `/Users/slysik/bcbs/frontend/src/mocks/aiOpportunities.ts` containing:
  - `SAMPLE_CLAIMS_QUERIES`: Array of `{ query: string, description: string }` (8-10 items covering claim status, diagnosis codes, provider networks, denials, trends)
  - `MOCK_CLAIMS_RESPONSE`: Object with `{ sql: string, results: Record<string, unknown>[], summary: string, confidence: number }` for 3 sample queries
  - `SAMPLE_PLAN_QUESTIONS`: Array of `{ question: string, category: string }` (8-10 items: deductibles, copays, telehealth, Rx, prior auth)
  - `MOCK_PLAN_RESPONSE`: Object with `{ answer: string, citations: { text: string, page: number, section: string, relevance: number }[], confidence: number }`
  - `MOCK_SPEND_INSIGHTS`: Object with `{ monthlySpend: { month: string, amount: number, category: string }[], insights: { title: string, description: string, type: 'savings' | 'alert' | 'trend' }[], totalSpend: number, projectedAnnual: number }`
  - `MOCK_WORKFLOWS`: Array of workflow definitions `{ id: string, title: string, description: string, steps: { id: string, label: string, description: string, estimatedTime: string, status: 'pending' | 'active' | 'complete' | 'error' }[] }` for: Appeal a Denied Claim, Compare Provider Costs, Verify Benefits Coverage, Request Prior Authorization
  - `MOCK_RECOMMENDATIONS`: Array of `{ id: string, title: string, description: string, priority: 'high' | 'medium' | 'low', category: string, actionLabel: string }`
  - `MOCK_ACTIVITY_LOG`: Array of `{ timestamp: string, action: string, detail: string, source: string }` (20+ realistic entries)
- All data should use realistic BCBS-style healthcare terminology, ICD-10/CPT codes, dollar amounts, dates, and provider names. Tone should be professional and member-facing.

### 2. Build Shared UI Components
- **Task ID**: shared-components
- **Depends On**: foundation-data
- **Assigned To**: builder-foundation
- **Agent Type**: general-purpose
- **Parallel**: false
- Create directory `/Users/slysik/bcbs/frontend/src/components/ai-opportunities/shared/`
- Build `ConfidenceIndicator.tsx`:
  - Props: `{ score: number, label?: string }` (0-100)
  - Visual: colored progress bar (green >80, amber 50-80, red <50) with percentage label
  - Accessible: aria-valuenow, aria-label
- Build `AiDisclaimer.tsx`:
  - Props: `{ variant?: 'inline' | 'banner' }`
  - Inline: small italic text with shield icon
  - Banner: full-width amber/blue bar with info icon
  - Text: "AI-generated content. Please verify important details with your plan documents or a representative."
  - Include optional privacy note: "Your data is processed securely. No PHI is stored or shared."
- Build `ActivityLog.tsx`:
  - Props: `{ entries: ActivityLogEntry[], maxVisible?: number }`
  - Collapsible panel with timestamp, action, detail columns
  - Scrollable, most recent first
  - Header: "Activity & Audit Trail" with clock icon
- Build `HandoffCTA.tsx`:
  - Props: `{ label?: string, context?: string }`
  - Blue-outlined button with phone icon: "Speak to a Representative"
  - Subtext: "Get personalized help from a BCBS representative"
  - Subtle pulse animation on hover
- Build `FeatureCard.tsx`:
  - Props: `{ icon: LucideIcon, title: string, description: string, businessValue: string, onClick: () => void, isActive?: boolean }`
  - Card surface with bcbs palette, hover lift, icon top-left, title, 2-line description
  - Tooltip/popover showing businessValue on info icon click
  - Active state: blue left border + subtle bg tint
- Build `ProactiveRecommendations.tsx`:
  - Props: `{ recommendations: Recommendation[] }`
  - Horizontal scrollable row of recommendation cards
  - Each card: priority badge (high=red, medium=amber, low=green), title, description, action button
  - Header: "Proactive Recommendations" with lightbulb icon

### 3. Update Layout & App for 3-Tab Navigation + Palmetto Branding
- **Task ID**: update-navigation
- **Depends On**: shared-components
- **Assigned To**: builder-foundation
- **Agent Type**: general-purpose
- **Parallel**: false
- Create `/Users/slysik/bcbs/frontend/src/components/PalmettoLogo.tsx`:
  - SVG component rendering the **South Carolina palmetto tree with crescent moon** in white
  - Props: `{ className?: string }` for sizing (default h-8 w-8)
  - The palmetto tree should be a clean, iconic silhouette: tall trunk with fan palm fronds at top, crescent moon to the left (matching the SC state flag design)
  - Render as inline SVG (no external image files), white fill for use on dark header backgrounds
- In `Layout.tsx`:
  - **Rename app title** from "BCBS Claims AI" to **"Palmetto AI"**
  - Replace the `Activity` icon with the new `PalmettoLogo` component
  - Update `LayoutProps.activeTab` type from `'chat' | 'upload'` to `'chat' | 'upload' | 'ai'`
  - Update `onTabChange` type accordingly
  - Add a third tab button with `Lightbulb` icon from lucide-react, label "AI Opportunities"
  - Import `ENABLE_AI_OPPORTUNITIES` from feature flags; conditionally render the tab
  - Keep existing Chat and Upload tabs exactly as-is
- In `App.tsx`:
  - Update `activeTab` state type to `'chat' | 'upload' | 'ai'`
  - Import `AiOpportunitiesPanel` (lazy import for code splitting)
  - Add render branch: `activeTab === 'ai' ? <AiOpportunitiesPanel /> : ...`
  - Import `ENABLE_AI_OPPORTUNITIES` and conditionally include the ai tab handling
- Do NOT modify any existing component logic, Props interfaces on ChatPanel/UploadPanel, or API calls

### 4. Build Ask My Claims Module
- **Task ID**: build-claims-module
- **Depends On**: foundation-data, shared-components
- **Assigned To**: builder-claims-docs
- **Agent Type**: general-purpose
- **Parallel**: true (can run alongside tasks 5 and 6 after dependencies met)
- Create `/Users/slysik/bcbs/frontend/src/components/ai-opportunities/AskMyClaimsModule.tsx`:
  - **Header**: "Ask My Claims" with database icon
  - **Business value tooltip**: "Enable members to query their claims data using natural language instead of navigating complex portals"
  - **NL Query Input**: Text input with placeholder "e.g., Show me all denied claims in the last 90 days"
  - **Sample Prompts**: Horizontal row of clickable chips from `SAMPLE_CLAIMS_QUERIES`
  - **Simulated Flow** (on submit/chip click):
    1. Show "Analyzing query..." loading state (1s simulated delay)
    2. Show generated SQL in collapsible SqlViewer-style block (from mock data)
    3. Show results in a simple table (reuse ResultsTable patterns but as a new component to avoid modifying existing)
    4. Show AI summary paragraph with `ConfidenceIndicator`
  - **Trust elements**: `AiDisclaimer` banner above results, `ConfidenceIndicator` on the summary
  - **Handoff**: `HandoffCTA` at bottom "Need help understanding your claims?"
  - **State machine**: `idle | loading | results | error`
  - Use `setTimeout` for simulated delays (1-2s)
  - Mobile responsive: stack layout on small screens

### 5. Build Ask My Plan Docs Module
- **Task ID**: build-docs-module
- **Depends On**: foundation-data, shared-components
- **Assigned To**: builder-claims-docs
- **Agent Type**: general-purpose
- **Parallel**: true
- Create `/Users/slysik/bcbs/frontend/src/components/ai-opportunities/AskMyPlanDocsModule.tsx`:
  - **Header**: "Ask My Plan Documents" with file-text icon
  - **Business value tooltip**: "Let members get instant answers from their benefits documents with source citations"
  - **Chat Interface**: Simple question input + response display (NOT using existing useChat -- standalone state)
  - **Sample Questions**: Clickable chips from `SAMPLE_PLAN_QUESTIONS`
  - **Simulated Flow** (on submit/chip click):
    1. Show "Searching plan documents..." loading (1.5s)
    2. Display answer with markdown rendering
    3. Show citations panel: expandable list with page numbers, section names, relevance scores, text snippets
    4. Show `ConfidenceIndicator` on the answer
  - **Trust elements**: `AiDisclaimer` inline below answer, privacy note
  - **Handoff**: `HandoffCTA` "Questions about your benefits? Talk to a specialist"
  - **Conversation-style**: Allow 2-3 follow-up questions (hardcoded mock responses)
  - Mobile responsive

### 6. Build Health Spend Insights Module
- **Task ID**: build-insights-module
- **Depends On**: foundation-data, shared-components
- **Assigned To**: builder-insights-workflows
- **Agent Type**: general-purpose
- **Parallel**: true (can run alongside tasks 4 and 5 after dependencies met)
- Create `/Users/slysik/bcbs/frontend/src/components/ai-opportunities/HealthSpendInsightsModule.tsx`:
  - **Header**: "My Health Spend Insights" with trending-up icon
  - **Business value tooltip**: "Proactively surface spending patterns and savings opportunities using AI analysis"
  - **Summary Cards Row**: Total YTD spend, projected annual, vs. deductible progress, category breakdown (4 cards)
  - **Charts** (using Recharts, bcbs color palette):
    - Monthly spend bar chart (stacked by category: medical, Rx, dental, vision)
    - Category breakdown pie chart
    - Trend line chart showing 12-month spending trajectory
  - **AI Insights Panel**: List of insight cards from `MOCK_SPEND_INSIGHTS.insights`:
    - Savings opportunity (green): "You could save $180/year by switching to generic alternatives for 2 of your prescriptions"
    - Alert (amber): "Your out-of-pocket spending is trending 15% higher than last year"
    - Trend (blue): "Preventive care visits have decreased. Schedule your annual wellness check"
  - **Trust elements**: `AiDisclaimer` banner, `ConfidenceIndicator` on each insight
  - **Handoff**: `HandoffCTA` "Want personalized cost-saving advice?"
  - Mobile: charts stack vertically, summary cards 2x2 grid then 1-col

### 7. Build AI Workflows Module
- **Task ID**: build-workflows-module
- **Depends On**: foundation-data, shared-components
- **Assigned To**: builder-insights-workflows
- **Agent Type**: general-purpose
- **Parallel**: true
- Create `/Users/slysik/bcbs/frontend/src/components/ai-opportunities/AiWorkflowsModule.tsx`:
  - **Header**: "AI Assistant Workflows" with workflow/zap icon
  - **Business value tooltip**: "Automate complex multi-step member tasks that currently require phone calls and manual forms"
  - **Workflow Selector**: 4 workflow cards from `MOCK_WORKFLOWS` (Appeal, Cost Compare, Benefits Verify, Prior Auth)
  - **Task Runner UI** (when workflow selected):
    - Vertical stepper with numbered steps
    - Each step shows: label, description, estimated time, status badge
    - "Run" button starts simulated execution:
      - Steps transition: pending → active (with spinner) → complete (with checkmark)
      - Each step takes 1-3s simulated delay
      - Optional: one step shows "error" state briefly then retries successfully (demonstrates resilience)
    - Progress bar at top showing overall completion
    - At completion: summary card with results and next steps
  - **Trust elements**: `AiDisclaimer`, activity log entries generated per step
  - **Handoff**: `HandoffCTA` at each step "Prefer to complete this with an agent?"
  - **State**: workflow selection | running | complete | error
  - Mobile: stepper goes vertical (already should be), cards stack

### 8. Build AI Opportunities Panel & Integration
- **Task ID**: build-panel-integration
- **Depends On**: build-claims-module, build-docs-module, build-insights-module, build-workflows-module, update-navigation
- **Assigned To**: builder-panel-polish
- **Agent Type**: general-purpose
- **Parallel**: false
- Create `/Users/slysik/bcbs/frontend/src/components/ai-opportunities/AiOpportunitiesPanel.tsx`:
  - **Layout**: Full-height scrollable panel with max-w-6xl mx-auto
  - **Header section**: Palmetto logo (small, bcbs-400 tinted) + "Future of Member AI" title, subtitle describing the demo purpose
  - **Feature Cards Grid**: 2x2 grid of `FeatureCard` components (Claims, Docs, Insights, Workflows)
  - **Card click expands to module**: clicking a card replaces the grid with the full module view + back button
  - **Proactive Recommendations**: Rendered below the grid (or above the module when expanded)
  - **Activity Log**: Collapsible panel at bottom of page showing audit trail
  - **Back navigation**: breadcrumb or back arrow to return from module to grid
  - **Demo script tooltips**: Each feature card includes a "Business Value" info icon that shows what this demonstrates for BCBS SC
  - **Responsive**: 2-col grid → 1-col on mobile, proper spacing
- Update `index.css` if needed:
  - Add `@keyframes slideIn` for module expand animation
  - Add `@keyframes progressFill` for progress bar animation

### 9. Final Build Verification & Validation
- **Task ID**: validate-all
- **Depends On**: build-panel-integration
- **Assigned To**: validator-final
- **Agent Type**: validator
- **Parallel**: false
- Run `cd /Users/slysik/bcbs/frontend && npx tsc -b` -- must pass with zero errors
- Run `cd /Users/slysik/bcbs/frontend && npx vite build` -- must succeed
- Verify existing files are UNMODIFIED (except Layout.tsx and App.tsx which have minimal tab additions):
  - `src/lib/api.ts` -- no changes
  - `src/hooks/useChat.ts` -- no changes
  - `src/components/ChatPanel.tsx` -- no changes
  - `src/components/UploadPanel.tsx` -- no changes
  - `src/components/MessageBubble.tsx` -- no changes
  - All other existing components -- no changes
- Verify `ENABLE_AI_OPPORTUNITIES = false` hides the AI tab completely
- Check all new TypeScript files for:
  - Strict mode compliance (no `any` types, proper null checks)
  - No unused imports or variables
  - Proper Props interfaces exported for all components
- Verify mock data is realistic (healthcare terminology, dollar amounts, dates)
- Check responsive behavior: all new components should render cleanly at 375px, 768px, and 1440px widths
- Verify accessibility: all interactive elements have focus states, confidence bars have aria attributes, color contrast meets WCAG AA

## Acceptance Criteria

1. `tsc -b && vite build` passes with zero errors
2. New "AI Opportunities" tab appears in header navigation when `ENABLE_AI_OPPORTUNITIES = true`
3. Tab is hidden when `ENABLE_AI_OPPORTUNITIES = false`
4. All existing Chat and Upload functionality works unchanged
5. `src/lib/api.ts` and `src/hooks/useChat.ts` are completely unmodified
6. No existing component files are modified (except Layout.tsx tab type + App.tsx routing)
7. 4 interactive feature modules render correctly:
   - Ask My Claims: NL input → simulated SQL + results + summary
   - Ask My Plan Docs: question input → answer + citations panel
   - Health Spend Insights: charts + AI narrative insights
   - AI Workflows: step-by-step runner with progress
8. Each module includes `HandoffCTA` (human escalation)
9. Each module includes `ConfidenceIndicator` and `AiDisclaimer`
10. `ActivityLog` panel with realistic audit entries is visible
11. `ProactiveRecommendations` panel renders with 4+ personalized suggestions
12. All mock data lives in `src/mocks/aiOpportunities.ts`
13. Feature flag lives in `src/config/featureFlags.ts`
14. All new components are in `src/components/ai-opportunities/`
15. Mobile responsive at 375px width
16. No `any` types in new TypeScript files
17. Blue tonal palette (bcbs-*) used consistently -- no random hex colors
18. No new npm dependencies added (use existing: React, Recharts, lucide-react, tailwind)

## Validation Commands
Execute these commands to validate the task is complete:

- `cd /Users/slysik/bcbs/frontend && npx tsc -b` -- TypeScript compilation must pass
- `cd /Users/slysik/bcbs/frontend && npx vite build` -- Vite build must succeed
- `diff <(git show HEAD:frontend/src/lib/api.ts) /Users/slysik/bcbs/frontend/src/lib/api.ts` -- Must show no diff
- `diff <(git show HEAD:frontend/src/hooks/useChat.ts) /Users/slysik/bcbs/frontend/src/hooks/useChat.ts` -- Must show no diff
- `grep -rn 'any' /Users/slysik/bcbs/frontend/src/components/ai-opportunities/ --include='*.tsx' --include='*.ts'` -- Should return no `any` type usage
- `grep -rn 'ENABLE_AI_OPPORTUNITIES' /Users/slysik/bcbs/frontend/src/` -- Should show flag in featureFlags.ts, Layout.tsx, App.tsx
- `ls /Users/slysik/bcbs/frontend/src/components/ai-opportunities/` -- Should show all expected component files
- `ls /Users/slysik/bcbs/frontend/src/components/ai-opportunities/shared/` -- Should show all shared component files
- `ls /Users/slysik/bcbs/frontend/src/mocks/` -- Should contain aiOpportunities.ts

## Notes
- The app is now branded **"Palmetto AI"** (not "BCBS Claims AI"). The header uses a custom SVG palmetto tree + crescent moon logo (South Carolina state flag motif). This branding change happens in Layout.tsx via the new PalmettoLogo component.
- The BCBS frontend project is located at `/Users/slysik/bcbs/frontend/` (NOT in the hooks mastery repo).
- The project uses Vite + React 19 + TypeScript strict mode + Tailwind 3.4 with the `@/` path alias pointing to `./src/`.
- Available packages: `react`, `react-dom`, `recharts`, `lucide-react`, `react-markdown`, `remark-gfm`, `class-variance-authority`, `clsx`, `tailwind-merge`.
- Do NOT add any new npm dependencies.
- The builder agent PostToolUse hooks run Ruff/Ty validators on `.py` files. Since this is all TypeScript, those hooks won't fire -- but the TSC validator (`tsc_validator.py`) will validate `.ts/.tsx` files on Write/Edit.
- All simulated delays should use `setTimeout` wrapped in Promises for clean async/await patterns.
- The `tsconfig.json` has `noUnusedLocals: true` and `noUnusedParameters: true` -- be careful about unused imports.
- The `tsconfig.json` has `noUncheckedIndexedAccess: true` -- array/object indexing returns `T | undefined`.
- Keep component files under 200 lines where possible. Extract sub-components as needed.
- Use the existing Recharts library for all charting (bar, line, pie). Use the bcbs color palette: `['#0057B8', '#003D82', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE']`.
