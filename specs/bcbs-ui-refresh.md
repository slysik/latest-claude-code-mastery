# Plan: BCBS Claims AI — Production UI Refresh

## Task Description
Comprehensive visual refresh of the BCBS Claims AI frontend application. The app is a Vite + React 19 + Tailwind 3 chat/upload interface backed by a Python API. The goal is to elevate the existing "demo-grade" UI into something that looks and feels production-ready — improved hierarchy, spacing, typography, responsiveness, and interaction polish — while **preserving all existing functionality and data contracts exactly as-is**.

## Objective
When this plan is complete the app will:
- Feel like a polished, production healthcare SaaS tool (not a hackathon demo).
- Use a coherent blue tonal design system defined via Tailwind theme tokens.
- Be fully responsive (desktop + tablet + mobile).
- Have subtle, performant transitions for tabs, buttons, and content reveal.
- Pass `npm run build` with zero errors and no dead code.

## Problem Statement
The current UI is functional but visually basic:
- The Tailwind config only defines 3 BCBS colors (`blue`, `blue-dark`, `blue-light`). There are no semantic surface/border/text tokens — components rely on ad-hoc gray-* utilities.
- The header is flat (#0057B8 solid bar) with minimal visual depth.
- Components lack consistent card elevation, padding rhythm, and focus/hover states.
- No transitions on tab switch or content panels.
- Empty/loading states are minimal placeholders.
- Mobile breakpoints are not explicitly handled.

## Solution Approach
1. **Extend the Tailwind theme** with a full blue tonal palette and semantic tokens (surface, border, text hierarchy).
2. **Refine the Layout shell** — modernize the header with subtle gradient/shadow depth, improve the footer, add smooth tab-switching.
3. **Polish every component** with consistent card surfaces, borders, radius, hover/focus states, and transitions.
4. **Add responsive breakpoints** for mobile and tablet.
5. **Improve empty/loading states** to look designed, not stubbed.
6. **Keep the work purely CSS/className changes** — no API, type, or data flow modifications.

## Relevant Files
Use these files to complete the task:

- `/Users/slysik/bcbs/frontend/tailwind.config.js` — Extend with full design system tokens
- `/Users/slysik/bcbs/frontend/src/index.css` — Add global base/component layer styles, transitions, keyframes
- `/Users/slysik/bcbs/frontend/src/components/Layout.tsx` — Header, footer, tab navigation, app shell
- `/Users/slysik/bcbs/frontend/src/components/ChatPanel.tsx` — Chat messages area, empty state, input area, suggestion chips
- `/Users/slysik/bcbs/frontend/src/components/MessageBubble.tsx` — User/assistant message cards, intent badges
- `/Users/slysik/bcbs/frontend/src/components/AgentTrace.tsx` — Pipeline step badges
- `/Users/slysik/bcbs/frontend/src/components/SqlViewer.tsx` — Collapsible SQL code block
- `/Users/slysik/bcbs/frontend/src/components/ResultsTable.tsx` — Sortable data table
- `/Users/slysik/bcbs/frontend/src/components/ChartView.tsx` — Recharts wrapper (update COLORS to match new palette)
- `/Users/slysik/bcbs/frontend/src/components/Citations.tsx` — Expandable citation list
- `/Users/slysik/bcbs/frontend/src/components/UploadPanel.tsx` — Drag-and-drop upload zone, dataset/document cards
- `/Users/slysik/bcbs/frontend/src/App.tsx` — Root (add tab transition wrapper if needed)
- `/Users/slysik/bcbs/frontend/index.html` — May add Inter/system font link
- `/Users/slysik/bcbs/frontend/src/lib/api.ts` — **DO NOT MODIFY** (reference only)
- `/Users/slysik/bcbs/frontend/src/hooks/useChat.ts` — **DO NOT MODIFY** (reference only)

## Implementation Phases

### Phase 1: Foundation — Design System & Global Styles
Establish the visual vocabulary that all components will consume.

1. **tailwind.config.js** — Extend the `bcbs` color palette:
   ```js
   bcbs: {
     50:  '#EFF6FF',   // lightest tint (surfaces)
     100: '#DBEAFE',   // hover backgrounds
     200: '#BFDBFE',   // borders, focus rings
     300: '#93C5FD',   // secondary accents
     400: '#60A5FA',   // interactive hover
     500: '#0057B8',   // primary (existing bcbs-blue)
     600: '#003D82',   // primary-dark (existing bcbs-blue-dark)
     700: '#002D6B',   // deep accents
     800: '#001E4D',   // header gradient end
     900: '#001233',   // darkest
   }
   ```
   Keep existing `bcbs-blue`, `bcbs-blue-dark`, `bcbs-blue-light` as aliases so nothing breaks. Add `fontFamily` extend for `sans: ['Inter', ...defaultTheme.fontFamily.sans]`.

2. **index.css** — Add:
   - CSS custom properties mapping to the Tailwind tokens (for non-Tailwind contexts like Recharts).
   - `.transition-panel` utility for content fade/slide on tab switch.
   - Smoother scrollbar (already exists, refine colors to blue tonal).
   - Markdown prose table styles updated from gray to blue-tinted.

### Phase 2: Core Component Refresh
Systematically touch each component — className-level changes only.

**Layout.tsx**:
- Header: subtle bottom-to-top gradient (`from-bcbs-600 to-bcbs-800`), slight shadow-xl.
- Tabs: pill-shaped with backdrop blur, active state with white/15 bg + white text + bottom indicator dot or underline.
- Footer: lighter, more subtle. Config badges use the new token scale.

**ChatPanel.tsx**:
- Empty state: larger icon, warmer copy, suggestion chips with subtle shadow + ring-1.
- Messages area: increase py spacing. Add fade-in animation on new messages.
- Input area: card surface with shadow-sm, rounded-xl border, focus ring in bcbs-300.
- Streaming indicator: refined bouncing dots using bcbs-400.

**MessageBubble.tsx**:
- User bubble: gradient from bcbs-500 to bcbs-600, shadow-md.
- Assistant bubble card: ring-1 ring-bcbs-100, shadow-sm, hover:shadow-md transition.
- Intent badges: use bcbs tokens for "Data Query" (blue), keep green/amber for rag/clarify.

**AgentTrace.tsx**:
- Running state: bcbs-100 bg, bcbs-500 text, ring in bcbs-200.
- Complete state: keep green but soften.
- Connector line: bcbs-200 instead of gray-300.

**SqlViewer.tsx**:
- Header: bcbs-50 bg, hover bcbs-100.
- Code block: bg-slate-900 (keep dark), but add rounded-b-lg.

**ResultsTable.tsx**:
- Sticky header: bcbs-50 bg, text-bcbs-700.
- Hover row: bcbs-50/50.
- Border: ring-1 ring-bcbs-100.

**ChartView.tsx**:
- Update COLORS array to use new bcbs-500, bcbs-600, bcbs-400, bcbs-300, bcbs-200, bcbs-100.
- Card: ring-1 ring-bcbs-100, shadow-sm.

**Citations.tsx**:
- Header bar: bcbs-50 bg, text-bcbs-600 (instead of green — these are document citations, blue theme is more appropriate).
- Match % badge: text-bcbs-400.

**UploadPanel.tsx**:
- Drop zone: border-bcbs-200 idle, border-bcbs-500 + bg-bcbs-50 on drag.
- Browse button: rounded-xl, shadow-sm, gradient.
- Dataset/Document cards: ring-1 ring-bcbs-100, shadow-sm.
- Empty text: styled intentionally, not just gray placeholder.

### Phase 3: Interaction Polish & Responsive
- Add `transition-all duration-200` to all interactive elements (buttons, cards, badges).
- Tab content: CSS `animate-fadeIn` keyframe (opacity 0→1, translateY 4px→0, 200ms ease-out).
- Button hover: scale-[1.02] or shadow lift.
- Focus-visible: ring-2 ring-bcbs-300 ring-offset-2.
- Responsive: on `sm:` breakpoint, stack tab nav vertically, reduce padding, full-width cards.
- Input area: on mobile, shorter min-height, larger touch targets (min-h-[48px] for buttons).

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
  - Name: builder-design-system
  - Role: Extend Tailwind config and global CSS with the blue tonal design system tokens, custom properties, keyframes, and transitions.
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-layout-shell
  - Role: Refresh Layout.tsx (header gradient, tab navigation, footer polish) and App.tsx (tab transition wrapper).
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-chat-components
  - Role: Refresh ChatPanel.tsx, MessageBubble.tsx, AgentTrace.tsx, and the streaming/empty states.
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-data-components
  - Role: Refresh SqlViewer.tsx, ResultsTable.tsx, ChartView.tsx, and Citations.tsx.
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-upload-responsive
  - Role: Refresh UploadPanel.tsx and add responsive breakpoints across all components.
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: validator-final
  - Role: Run `npm run build`, verify no TypeScript or Tailwind errors, inspect all changed files for dead code, confirm no API/type contract changes.
  - Agent Type: validator
  - Resume: false

## Step by Step Tasks

- IMPORTANT: Execute every step in order, top to bottom. Each task maps directly to a `TaskCreate` call.
- Before you start, run `TaskCreate` to create the initial task list that all team members can see and execute.

### 1. Extend Tailwind Design System
- **Task ID**: design-system
- **Depends On**: none
- **Assigned To**: builder-design-system
- **Agent Type**: builder
- **Parallel**: true (can run alongside task 2 prep work)
- Extend `tailwind.config.js` with full bcbs 50-900 blue tonal scale while preserving existing `bcbs-blue`, `bcbs-blue-dark`, `bcbs-blue-light` aliases.
- Add Inter font family to the theme.
- Update `index.css` with CSS custom properties (`:root { --bcbs-500: #0057B8; ... }`), `.transition-panel` utility, `@keyframes fadeIn` (opacity+translateY), refined scrollbar colors (bcbs tones), and updated markdown prose table styles using blue tonal borders/headers.
- Verify: `cd /Users/slysik/bcbs/frontend && npx tailwindcss --help` (config parses).

### 2. Refresh Layout Shell
- **Task ID**: layout-shell
- **Depends On**: design-system
- **Assigned To**: builder-layout-shell
- **Agent Type**: builder
- **Parallel**: false
- In `Layout.tsx`: header gradient (`bg-gradient-to-r from-bcbs-600 to-bcbs-800`), shadow-xl, refined tab pills (active: `bg-white/15 backdrop-blur`, inactive: `text-white/70 hover:text-white hover:bg-white/10`), add underline indicator on active tab.
- Footer: subtle top border in bcbs-100, badges use bcbs-50/bcbs-600 and green-50/green-700.
- In `App.tsx`: wrap the child panel in a `<div className="animate-fadeIn" key={activeTab}>` so tab switches trigger the fade animation.
- Do NOT modify LayoutProps interface or config fetching logic.

### 3. Refresh Chat Panel & Message Components
- **Task ID**: chat-components
- **Depends On**: design-system
- **Assigned To**: builder-chat-components
- **Agent Type**: builder
- **Parallel**: true (can run alongside task 2, 4, 5 after task 1 completes)
- **ChatPanel.tsx**: Empty state — larger Sparkles icon, refined typography, suggestion chips with `shadow-sm ring-1 ring-bcbs-200 hover:ring-bcbs-300 hover:shadow-md`. Input area — `bg-white shadow-sm rounded-xl border border-bcbs-100`, textarea `focus:ring-2 focus:ring-bcbs-300 focus:border-bcbs-400`. Send button gradient. Streaming dots refined to bcbs-400.
- **MessageBubble.tsx**: User bubble — `bg-gradient-to-br from-bcbs-500 to-bcbs-600 shadow-md`. Assistant card — `ring-1 ring-bcbs-100 shadow-sm hover:shadow-md transition-shadow`. Intent badges — nl2sql uses `bg-bcbs-50 text-bcbs-600 ring-1 ring-bcbs-200`.
- **AgentTrace.tsx**: Running — `bg-bcbs-50 text-bcbs-600 ring-1 ring-bcbs-200`. Connector — `bg-bcbs-200`.
- Do NOT modify any Props interfaces, data flow, or the `useChat` hook.

### 4. Refresh Data Display Components
- **Task ID**: data-components
- **Depends On**: design-system
- **Assigned To**: builder-data-components
- **Agent Type**: builder
- **Parallel**: true (can run alongside task 2, 3, 5 after task 1 completes)
- **SqlViewer.tsx**: Header — `bg-bcbs-50 hover:bg-bcbs-100`. Copy button — `text-bcbs-400 hover:text-bcbs-600`. Outer border — `ring-1 ring-bcbs-100`. Code block — keep dark bg, add `rounded-b-lg`.
- **ResultsTable.tsx**: Outer — `ring-1 ring-bcbs-100 shadow-sm rounded-xl`. Sticky header — `bg-bcbs-50 text-bcbs-700`. Sort icon — `text-bcbs-300`. Hover row — `hover:bg-bcbs-50/50`. Footer — `bg-bcbs-50 text-bcbs-500`.
- **ChartView.tsx**: Update `COLORS` to `['#0057B8', '#003D82', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE']`. Card — `ring-1 ring-bcbs-100 shadow-sm rounded-xl`.
- **Citations.tsx**: Header — `bg-bcbs-50 text-bcbs-600 hover:bg-bcbs-100` (swap from green). Outer — `ring-1 ring-bcbs-100`. Match badge — `text-bcbs-400`. Expanded text bg — `bg-bcbs-50`.
- Do NOT modify any Props interfaces or data handling logic.

### 5. Refresh Upload Panel & Add Responsive Styles
- **Task ID**: upload-responsive
- **Depends On**: design-system
- **Assigned To**: builder-upload-responsive
- **Agent Type**: builder
- **Parallel**: true (can run alongside tasks 2, 3, 4 after task 1 completes)
- **UploadPanel.tsx**: Drop zone — idle: `border-bcbs-200`, active: `border-bcbs-500 bg-bcbs-50`. Browse button — `rounded-xl shadow-sm bg-gradient-to-r from-bcbs-500 to-bcbs-600 hover:from-bcbs-600 hover:to-bcbs-700`. Status toast — keep green/red semantics but use ring-1. Dataset/Document cards — `ring-1 ring-bcbs-100 shadow-sm rounded-xl`. Empty text — styled: `text-bcbs-400 italic`.
- **Responsive (all components)**: Add responsive overrides:
  - `Layout.tsx`: On `sm:` (mobile), stack header — logo left, tabs below. `h-auto` instead of `h-16`. Footer stack vertically.
  - `ChatPanel.tsx`: On `sm:`, reduce px from 4 to 3, suggestion chips wrap. Input button min-h-[48px] for touch.
  - `UploadPanel.tsx`: On `sm:`, grid-cols-1 instead of grid-cols-2.
  - `ResultsTable.tsx`: On `sm:`, `text-xs` for table cells.
- Do NOT modify any Props interfaces, API calls, or event handlers.

### 6. Build Verification & Final Validation
- **Task ID**: validate-all
- **Depends On**: design-system, layout-shell, chat-components, data-components, upload-responsive
- **Assigned To**: validator-final
- **Agent Type**: validator
- **Parallel**: false
- Run `cd /Users/slysik/bcbs/frontend && npm run build` — must succeed with zero errors.
- Inspect all changed files: no dead code, no commented-out blocks, no unused imports.
- Verify `api.ts` and `useChat.ts` are **unmodified** (checksum or diff).
- Confirm no new dependencies were added (package.json unchanged except possibly Inter font link in index.html).
- Confirm all color references are from the bcbs-* palette (no random hex literals outside ChartView COLORS).
- Check that all component Props interfaces are unchanged.

## Acceptance Criteria
- [ ] `npm run build` passes with zero TypeScript errors.
- [ ] All 10 component files are refreshed with consistent blue tonal styling.
- [ ] Tailwind config has full bcbs 50-900 palette + Inter font.
- [ ] index.css has fadeIn keyframe, transition-panel utility, blue-toned scrollbar, blue-toned prose tables.
- [ ] Tab switching triggers a fade animation.
- [ ] Interactive elements (buttons, cards, badges, chips) have hover/focus transitions.
- [ ] Mobile-responsive breakpoints are present for Layout, ChatPanel, UploadPanel, ResultsTable.
- [ ] `api.ts` and `useChat.ts` are completely untouched.
- [ ] No new npm dependencies added (unless Inter font is added via index.html `<link>`).
- [ ] No purple tones — strictly blue tonal palette.
- [ ] No dead code or commented-out blocks.

## Validation Commands
Execute these commands to validate the task is complete:

- `cd /Users/slysik/bcbs/frontend && npm run build` — Must exit 0 with no errors
- `diff <(git show HEAD:frontend/src/lib/api.ts) frontend/src/lib/api.ts` — Must show no diff (api.ts untouched)
- `diff <(git show HEAD:frontend/src/hooks/useChat.ts) frontend/src/hooks/useChat.ts` — Must show no diff (useChat.ts untouched)
- `grep -r 'purple\|violet\|fuchsia' frontend/src/ --include='*.tsx' --include='*.css' --include='*.js'` — Must return nothing
- `grep -rn 'TODO\|FIXME\|HACK\|XXX' frontend/src/ --include='*.tsx' --include='*.css'` — Should return nothing new

## Notes
- The project uses Vite with `@` path alias pointing to `./src`. All imports use this pattern.
- Tailwind 3.4 is in use — utility classes must be Tailwind 3 compatible.
- The app uses `lucide-react` for icons, `recharts` for charts, `react-markdown` + `remark-gfm` for markdown rendering, and `class-variance-authority` + `clsx` + `tailwind-merge` (CVA stack is available but not currently used — builders may optionally use it for variant-based styling).
- The Inter font can be loaded via Google Fonts `<link>` in `index.html` — no npm package needed.
- All work happens in `/Users/slysik/bcbs/frontend/`. The backend (`/Users/slysik/bcbs/backend/`) must not be touched.
