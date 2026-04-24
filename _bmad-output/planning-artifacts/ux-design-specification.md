---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
lastStep: 14
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/product-brief-bmad-todo.md
  - docs/Product Requirement Document (PRD) for the Todo App.md
---

# UX Design Specification — Awesome Todo

**Author:** Francesco
**Date:** 2026-04-24

---

## Executive Summary

### Project Vision

Awesome Todo is a personal task manager that earns trust through deliberate restraint. The UX strategy mirrors the product strategy: remove everything that isn't essential, then make what remains feel inevitable. The interface transparently represents the user's mental model — a list of tasks to do — with zero abstraction, zero configuration, and zero learning curve.

### Target Users

- **Primary:** Individuals overwhelmed by complex task managers — freelancers, students, and anyone who has abandoned a todo app (or never adopted one) because it demanded too much
- **Tech savviness:** Low to moderate — users rely on standard web conventions (text inputs, buttons, checkboxes) and should never encounter unfamiliar interaction patterns
- **Devices:** Split between desktop browsers and mobile browsers (primarily iOS Safari and Android Chrome)
- **Task volume:** Small personal lists (tens of items, not hundreds) — the UI does not need to support search, filtering, or pagination in V1

### Key Design Challenges

- **Simplicity without emptiness:** The minimal interface must feel complete and intentional, not unfinished
- **Optimistic UI trust:** Immediate feedback must feel confident, and failure rollbacks must not break the user's mental model
- **Mobile parity:** All interactions must work with thumb-only operation — touch targets, input focus, and action buttons must be carefully sized and positioned

### Design Opportunities

- **Empty state as onboarding:** The first screen a user sees must communicate the entire product in one glance — no tutorial needed
- **Completion as micro-delight:** The active-to-completed transition (strikethrough + muted color) is a differentiating UX moment worth investing in
- **Speed as feel:** Sub-100ms responses create an "alive" quality that distinguishes Awesome Todo from competitors — the UX should lean into this by avoiding loading indicators for user actions entirely

## Core User Experience

### Defining Experience

The product experience is a single loop: **type → add → see it appear**. Adding a task is the gravitational center — every other interaction (completing, editing, deleting) orbits it. The input field is always visible, always ready. After adding a task, the input clears and refocuses automatically, inviting the next task without requiring the user to reposition or click again.

The core loop must feel like thought-to-list with no intermediary. The user thinks of a task, types it, and it exists. The gap between intent and result should be imperceptible.

### Platform Strategy

- **Platform:** Web application (SPA), no native apps
- **Desktop:** Mouse and keyboard primary. Enter key submits tasks. Tab navigates between elements. Click targets are comfortable but not oversized.
- **Mobile:** Touch primary, thumb-only operation. Minimum 44x44px tap areas. Input field prominent and immediately focusable. No gestures to learn — all actions use standard tap interactions.
- **Offline:** Not supported in V1. Network connectivity required.
- **Responsive approach:** Single codebase, CSS-native breakpoints. Desktop (768px+) uses comfortable spacing; mobile (<768px) uses single-column layout. Identical functionality across both — no features hidden or added by viewport.

### Effortless Interactions

| Interaction | Effort Required | UX Behavior |
|---|---|---|
| Add a task | Type + Enter (or tap Add) | Task appears instantly, input clears and refocuses |
| Complete a task | Single click/tap on checkbox | Immediate strikethrough + muted color transition |
| Edit a task | Click/tap on task text | Inline edit mode, save on blur or Enter |
| Delete a task | Single click/tap on delete button | Task removed instantly |
| View all tasks | Open the app | Full list renders immediately — active and completed |

Every interaction is a single action with immediate visual response. No confirmation dialogs, no multi-step flows, no mode switches.

### Critical Success Moments

1. **First 10 seconds (make or break):** User opens app → sees empty state → types a task → hits Add → task appears instantly. If this sequence feels obvious and fast, the user is onboarded. If any step causes hesitation, the product has failed its core promise.

2. **Next-day return (trust earned):** User reopens the app and everything is exactly as they left it. No login prompt, no sync delay, no surprises. This is where "tool" becomes "habit."

3. **Failure honesty (trust deepened):** A network error occurs during an action. The UI rolls back the optimistic update, a toast appears briefly explaining what happened, and the user is never in a state where displayed data doesn't match reality.

4. **Completion satisfaction (micro-delight):** User checks off a task. The strikethrough animation and color muting feel satisfying — a small visual reward for getting something done. The task stays visible, acknowledging the accomplishment.

### Experience Principles

1. **Immediacy** — Every user action produces visible feedback in under 100ms. No spinners for actions, no loading bars for mutations. The app feels alive.

2. **Transparency** — The UI shows exactly what's real. Completed tasks stay visible. Failures are announced, not hidden. The user is never uncertain about the state of their data.

3. **Forgettability** — The interface should be so intuitive that users forget they're using a tool. Zero cognitive load from the app itself — all mental energy goes to the tasks, not the task manager.

4. **Single-screen focus** — Everything happens on one page. No navigation, no routing, no modes. The user's entire world is one list, one input, and the actions around them.

## Desired Emotional Response

### Primary Emotional Goals

**Calm confidence.** Users should feel quietly in control — certain that their tasks are handled without needing to think about the tool itself. This is not a product that excites or dazzles; it's one that disappears into the background of a productive day. The emotional signature is relief from complexity, not delight from novelty.

### Emotional Journey Mapping

| Stage | Desired Emotion | What Triggers It |
|---|---|---|
| First discovery | Relief | "This is all there is? Thank god." — No sign-up, no tour, no choices to make |
| Core action (add/complete) | Flow | Interaction is so fast it doesn't interrupt the user's train of thought |
| Task completion | Quiet satisfaction | Strikethrough is a small acknowledgment — visible progress, not a celebration |
| Error/failure | Reassurance | "It told me, it fixed itself, nothing was lost" — honesty builds trust |
| Return visit | Trust | "Everything is exactly where I left it" — reliability becomes habit |

### Micro-Emotions

**Prioritized emotional states:**

- **Confidence over confusion** — Every element is self-explanatory. The user never wonders what something does or where something went.
- **Trust over skepticism** — Data displayed is always real. Failures are always announced. The user never doubts the state of their list.
- **Accomplishment over frustration** — Completed tasks remain visible as proof of progress. The user sees what they've done, not just what's left.

**Emotions to actively prevent:**

- **Anxiety** ("Did that save?") — Prevented by optimistic UI with visible confirmation and reliable persistence
- **Overwhelm** ("What do all these options do?") — Prevented by having no options, no settings, no configuration
- **Guilt** ("I should be using more features") — Prevented by there being no more features. The product is complete as-is.

### Design Implications

| Emotional Goal | UX Design Approach |
|---|---|
| Calm confidence | Minimal UI with generous whitespace. No visual noise. Muted color palette. |
| Flow during actions | Sub-100ms response. No interrupting modals or confirmations. Input auto-refocuses. |
| Quiet satisfaction | Smooth strikethrough transition — not flashy, but noticeable. Completed tasks stay in view. |
| Reassurance on failure | Toast notifications that explain briefly and disappear. Automatic rollback with no user action needed. |
| Trust on return | Instant load of full task list. No "syncing..." state. Data is just there. |
| Prevention of anxiety | No ambiguous states. Every action has clear, immediate visual feedback. |

### Emotional Design Principles

1. **Calm over exciting** — The product's emotional register is quiet competence. Avoid animations, sounds, or celebrations that draw attention to the tool rather than the task.

2. **Honest over protective** — When things fail, say so clearly and fix it. Don't hide errors behind retries or silent failures. Users trust honesty more than perfection.

3. **Sufficient over impressive** — The emotional bar is "this is exactly enough." Users should never feel like the product is trying to impress them — just that it works, every time.

4. **Invisible over memorable** — The best emotional outcome is that users don't think about the tool at all. The interface recedes; the tasks remain.

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

**Google Keep**
- Instant capture pattern: input is always front and center, zero friction from thought to note
- Visual simplicity: generous whitespace, minimal chrome, muted palette
- Cross-device trust: users never doubt their data is safe and available
- *Lesson for Awesome Todo:* Match the capture speed and visual calm. Reject the feature expansion (colors, labels, pins, images, collaborators).

**Clear**
- Radical minimalism: proves a todo app can feel premium with almost no visible UI
- Emotional quality: using it feels satisfying, even fun — the interaction IS the experience
- *Lesson for Awesome Todo:* A todo app can be a statement about simplicity, not just a utility. But reject gesture-dependent interactions — standard controls (checkboxes, buttons) ensure zero learning curve.

**iA Writer**
- The benchmark for deliberate restraint in software. A text cursor and your words.
- Proves that "we removed everything unnecessary" is a feature users pay for and recommend
- Emotional register: calm focus, the tool disappears, the work remains
- *Lesson for Awesome Todo:* The confidence that less is the product. The restraint philosophy extends to every pixel — if an element doesn't directly serve task management, it doesn't exist.

### Transferable UX Patterns

| Pattern | Source | Application to Awesome Todo |
|---|---|---|
| Input-first layout | Google Keep | Text input is the most prominent element on screen — always visible, always ready |
| Generous whitespace | Google Keep, iA Writer | Space communicates calm and intentionality, not emptiness |
| Instant persistence | Google Keep | No save button, no "saving..." indicator — data just persists |
| Minimal chrome | Clear, iA Writer | Reduce visual UI to essentials: input, list, action buttons. No toolbar, no sidebar, no header navigation |
| Standard controls | Google Keep | Checkboxes, buttons, text inputs — nothing to learn, nothing to guess |

### Anti-Patterns to Avoid

| Anti-Pattern | Seen In | Why to Avoid |
|---|---|---|
| Feature menus and toolbars | Todoist, Microsoft To Do | Creates visual complexity and implies the user needs to configure something |
| View toggles (grid/list, sort options) | Google Keep, Todoist | Introduces a decision the user doesn't need to make |
| Onboarding tours / tooltips | Most productivity apps | If the product needs explanation, the product is too complex |
| Gamification (streaks, points, badges) | Habitica, some todo apps | Shifts emotional register from calm to anxious. Contradicts "invisible tool" principle |
| Hidden gestures | Clear | Creates a learning curve and discoverability problem. Use visible, standard controls instead |

### Design Inspiration Strategy

**Adopt:**
- Input-first layout from Google Keep — the text input dominates the visual hierarchy
- Generous whitespace from iA Writer — space is a design choice, not wasted screen
- Instant persistence model from Google Keep — no explicit save action

**Adapt:**
- Clear's minimalism — match the spirit (radical simplicity) but use standard controls instead of gestures
- iA Writer's restraint philosophy — apply to a task list context rather than a writing context

**Avoid:**
- Any pattern that requires the user to make a choice before acting (view toggles, sort options, category selection)
- Any pattern that draws attention to the tool instead of the content (animations, gamification, onboarding)
- Any pattern that implies features exist beyond what's visible (hamburger menus, settings icons, "more" buttons)

## Design System Foundation

### Design System Choice

**Tailwind CSS** as the utility-first design foundation, with a small set of hand-built React components. No component library.

### Rationale for Selection

- **Bundle efficiency:** Tailwind purges unused CSS at build time — only ships what's actually used. Aligns with NFR5 (under 200KB gzipped).
- **Full visual control:** No framework opinions to override. The calm, minimal aesthetic is built from scratch, not extracted from a generic system.
- **Proportional complexity:** The component surface is ~6 components. A component library would add more code managing the library than code building the product.
- **Speed of development:** Utility classes enable rapid iteration without context-switching between CSS files and components. Single developer can move fast.
- **No visual debt:** No "this looks like Material Design" or "this looks like Bootstrap" associations. The product looks like itself.

### Implementation Approach

- **Tailwind CSS** for all styling — utility classes directly in JSX
- **Custom React components** for the 6 core UI elements: `TodoForm`, `TodoList`, `TodoItem`, `EmptyState`, `LoadingSpinner`, `Toast`
- **No additional CSS framework or component library**
- **Design tokens** defined in `tailwind.config.js` — colors, spacing, typography, breakpoints
- **Responsive design** via Tailwind's built-in breakpoint prefixes (`md:`, `lg:`)

### Customization Strategy

**Design tokens to define in Tailwind config:**

| Token Category | Purpose |
|---|---|
| Colors | Muted palette — primary action color, text, completed-task muted tone, background, error/toast |
| Typography | Single font family, limited size scale (body, input, heading). Readability over personality. |
| Spacing | Generous whitespace scale — the space between elements communicates calm |
| Borders/Radius | Subtle rounding — enough to feel modern, not enough to feel playful |
| Shadows | Minimal or none — flat design reinforces simplicity |
| Transitions | Subtle duration for strikethrough/muted transition on completion. No bouncy or attention-seeking animations. |

**Component strategy:** Each component is a single file, styled with Tailwind utilities, no abstraction layers. If a component can't be understood in under 30 seconds of reading, it's too complex.

## 2. Core User Experience

### 2.1 Defining Experience

**"Type it, it's there."** The defining interaction is task capture — the moment between thinking "I need to do X" and seeing X on the list. This gap must feel like zero. No clicks to "create," no fields to fill, no categories to choose. The input field is a direct channel from thought to list.

Users will describe this product as: "I just type what I need to do and it's done. That's the whole app."

### 2.2 User Mental Model

Users arrive with the mental model of a **paper checklist**: a vertical list of items you can write on, check off, and cross out. The product succeeds by mapping exactly to this model with no additional abstraction.

**What users expect:**
- A place to write (the input field)
- A list of things written (the task list)
- A way to mark done (the checkbox)
- A way to remove (the delete button)
- A way to fix a mistake (inline edit)

**What users do NOT expect:**
- Categories, projects, or folders
- Priority levels or color coding
- Date pickers or reminders
- Settings or preferences
- Multiple views or layouts

**Current workarounds:** Sticky notes, plain text files, the default notes app. These are "good enough" tools that lack persistence and cross-device access. Awesome Todo replaces them by offering the same simplicity with reliable persistence.

### 2.3 Success Criteria

| Criterion | Measure |
|---|---|
| Instant comprehension | User understands the full interface in under 5 seconds |
| Zero-hesitation capture | User adds first task without pausing to figure out how |
| Perceived immediacy | Task appears in list before the user's finger lifts from Enter/Add |
| Completion satisfaction | Strikethrough transition feels like a small reward, not just a state change |
| Trust on return | Returning user finds list exactly as left — no loading delay, no drift |

### 2.4 Novel UX Patterns

**Pattern approach: Entirely established.** No novel patterns. Every interaction uses standard web conventions users already understand:

- Text input + button for creation (Google Keep, any search bar)
- Checkbox for completion (every form ever built)
- Inline text editing (Google Docs, Notion, any modern app)
- Explicit delete button (standard destructive action pattern)
- Toast notification for errors (standard feedback pattern)

**The innovation is in what's absent, not what's present.** The novelty is the decision to use ONLY these patterns and nothing else. No gestures, no drag-and-drop, no context menus, no keyboard shortcuts (V1). The interaction vocabulary is deliberately limited to what every web user already knows.

### 2.5 Experience Mechanics

**Task Creation:**

| Phase | Detail |
|---|---|
| Initiation | Input field is always visible at top of page, auto-focused on load. Placeholder text hints at action ("Add a new task...") |
| Interaction | User types task description. Submits via Enter key or tap/click Add button. |
| Feedback | Task appears at end of list instantly (optimistic). Input clears and refocuses for next task. |
| Error | If server rejects: task disappears from list (rollback), toast explains the issue. |

**Task Completion:**

| Phase | Detail |
|---|---|
| Initiation | Checkbox visible on each task item. |
| Interaction | Single click/tap toggles completion state. |
| Feedback | Immediate strikethrough + muted color transition. Task stays in place in the list. |
| Error | If server fails: checkbox reverts, toast appears. |

**Task Editing:**

| Phase | Detail |
|---|---|
| Initiation | Click/tap on task text or Edit button enters inline edit mode. |
| Interaction | Text becomes editable. User modifies content. |
| Feedback | Save on blur or Enter. Text updates instantly (optimistic). Escape cancels edit. |
| Error | If server fails: text reverts to previous value, toast appears. |

**Task Deletion:**

| Phase | Detail |
|---|---|
| Initiation | Delete button visible on each task item. |
| Interaction | Single click/tap removes the task. |
| Feedback | Task disappears immediately from list (optimistic). |
| Error | If server fails: task reappears in list, toast appears. |

## Visual Design Foundation

### Color System

**Philosophy:** Muted, neutral palette with a single accent color for primary actions. The color system should feel like a clean sheet of paper — the content (tasks) is the focus, not the interface.

**Core Palette:**

| Role | Color | Hex | Usage |
|---|---|---|---|
| Background | White | `#FFFFFF` | Page background |
| Surface | Light gray | `#F9FAFB` | Input field background, card backgrounds if needed |
| Text (primary) | Near-black | `#111827` | Active task text, headings |
| Text (secondary) | Medium gray | `#6B7280` | Placeholder text, secondary labels |
| Text (completed) | Light gray | `#9CA3AF` | Completed task text (muted) |
| Border | Subtle gray | `#E5E7EB` | Input borders, task separators |
| Primary action | Blue | `#2563EB` | Add button, primary interactive elements |
| Primary hover | Darker blue | `#1D4ED8` | Add button hover state |
| Error/destructive | Red | `#DC2626` | Delete button, error toast background |
| Error hover | Darker red | `#B91C1C` | Delete button hover |
| Success/toast bg | Neutral dark | `#1F2937` | Toast notification background |

**Rationale:** Gray-scale dominance keeps the UI invisible. A single blue accent for the primary action (Add) draws attention exactly where it matters — the task creation flow. Red is reserved for destructive actions (delete) and errors. No greens, yellows, or other colors in V1.

**Accessibility:** All text/background combinations meet WCAG AA contrast ratio (4.5:1 minimum). Completed task text (#9CA3AF on #FFFFFF = 3.0:1) is intentionally below AA for body text — this is a deliberate design choice to visually mute completed items, but the strikethrough provides a redundant visual signal beyond color alone.

### Typography System

**Font:** System font stack — `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

**Rationale:** No custom web font. System fonts load instantly (zero font-loading flash), feel native to each platform, and contribute nothing to bundle size. This aligns with the "invisible tool" principle — the typography should feel like it belongs to the OS, not the app.

**Type Scale:**

| Role | Size | Weight | Usage |
|---|---|---|---|
| App title | 1.5rem (24px) | 700 (bold) | "Awesome Todo" header |
| Task text | 1rem (16px) | 400 (normal) | Active and completed task descriptions |
| Input text | 1rem (16px) | 400 (normal) | Task input field |
| Button text | 0.875rem (14px) | 500 (medium) | Add, Edit, Delete buttons |
| Toast text | 0.875rem (14px) | 400 (normal) | Error/notification messages |
| Empty state | 1rem (16px) | 400 (normal) | "No todos yet" message |

**Line height:** 1.5 for all body text (readability). 1.25 for headings.

**Constraints:** Two weights only (400, 700). No italics. No uppercase text transforms. Typography stays quiet.

### Spacing & Layout Foundation

**Base unit:** 4px. All spacing is a multiple of 4px.

**Spacing scale:**

| Token | Value | Usage |
|---|---|---|
| `xs` | 4px | Tight internal padding (icon gaps) |
| `sm` | 8px | Compact spacing (between button text and icon) |
| `md` | 16px | Standard spacing (between task items, form padding) |
| `lg` | 24px | Section spacing (between input area and task list) |
| `xl` | 32px | Page margins (desktop) |
| `2xl` | 48px | Major section breaks |

**Layout structure:**

```
┌─────────────────────────────────────┐
│           Page margins (xl)          │
│  ┌───────────────────────────────┐  │
│  │  App title                     │  │
│  │                                │  │
│  │  ┌──────────────────┐ [Add]   │  │
│  │  │ Input field       │         │  │
│  │  └──────────────────┘         │  │
│  │          (lg gap)              │  │
│  │  ☐ Task one                   │  │
│  │  ─ ─ ─ ─ ─ ─ ─ (border) ─ ─  │  │
│  │  ☐ Task two                   │  │
│  │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │  │
│  │  ☑ ~~Task three~~             │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Max content width:** 640px, centered. The task list doesn't stretch to fill wide screens — a narrow column reinforces focus and readability. On mobile (<768px), content fills the viewport with `md` (16px) margins.

**Task item layout:** Single row per task. Checkbox on the left, task text fills the middle, Edit and Delete buttons on the right. Vertical padding `md` (16px) per item. Subtle border-bottom separates items.

### Accessibility Considerations

- **Color is never the only indicator** — completed tasks use strikethrough + muted color (two signals)
- **Focus indicators** — visible outline on all interactive elements when focused via keyboard (2px blue outline)
- **Touch targets** — minimum 44x44px on mobile for all interactive elements
- **Font sizing** — base 16px prevents mobile browsers from auto-zooming on input focus
- **Semantic HTML** — `<main>`, `<form>`, `<ul>`, `<li>`, `<button>`, `<input>`, `<label>` used appropriately
- **Contrast ratios** — all primary text meets WCAG AA (4.5:1). Completed text relies on strikethrough as redundant signal.

## Design Direction Decision

### Design Directions Explored

Three directions were explored, all sharing the same layout structure, typography, and blue accent color:

1. **Clean Minimal** — Borderless input (bottom-border only), hair-thin separators, no card container, action buttons hidden until hover. Maximum whitespace.
2. **Structured Card** — Subtle card with shadow, rounded inputs with focus ring, circular checkboxes, hover backgrounds on items. More visual grounding.
3. **Warm Neutral** — Clean Minimal layout with warm stone/beige tones instead of cool grays. Softer, more personal feel.

### Chosen Direction

**Direction 1: Clean Minimal**

### Design Rationale

- **Most aligned with product philosophy** — the interface should disappear. Clean Minimal has the least visual chrome of all three options.
- **Borderless input** — the bottom-border-only input feels like writing on a line, reinforcing the paper checklist mental model.
- **Hidden action buttons** — Edit and Delete appear only on hover (always visible on mobile), keeping the default view as clean as possible. The task text dominates.
- **Cool gray palette** — neutral and professional. Doesn't impose personality — lets the content (tasks) be the only thing with visual weight.
- **No container/card** — the app lives directly on a white background. No box around the content. One less visual element.

### Implementation Approach

- White background (`#FFFFFF`), no surface containers or cards
- Input field: bottom-border only (`#E5E7EB`), turns blue on focus (`#2563EB`)
- Task separators: 1px `#F3F4F6` border — barely visible, just enough structure
- Action buttons: `opacity: 0` by default, `opacity: 1` on item hover. Always visible on touch devices (no hover state).
- Checkboxes: square with subtle border, filled blue when checked
- Max content width 640px, centered on page
- Interactive HTML mockup saved at `_bmad-output/planning-artifacts/ux-design-directions.html`

## User Journey Flows

### Task Creation Flow

```mermaid
flowchart TD
    A[Input field focused] --> B[User types task description]
    B --> C[User presses Enter or clicks Add]
    C --> D{Description empty?}
    D -->|Yes| E[Input shakes briefly / no action]
    E --> A
    D -->|No| F[Task appears in list instantly - optimistic]
    F --> G[Input clears and refocuses]
    G --> H[API POST fires in background]
    H --> I{Server response?}
    I -->|Success| J[Task confirmed - no visible change]
    I -->|Failure| K[Task removed from list - rollback]
    K --> L[Toast: "Couldn't add task. Try again."]
    L --> A
    J --> A
```

### Task Completion Toggle Flow

```mermaid
flowchart TD
    A[User clicks/taps checkbox] --> B[Immediate visual toggle]
    B --> C{Was active?}
    C -->|Yes - completing| D[Strikethrough + muted color applied]
    C -->|No - reactivating| E[Strikethrough + muted removed]
    D --> F[API PATCH fires in background]
    E --> F
    F --> G{Server response?}
    G -->|Success| H[State confirmed - no visible change]
    G -->|Failure| I[Visual toggle reverts]
    I --> J[Toast: "Couldn't update task. Try again."]
```

### Task Edit Flow

```mermaid
flowchart TD
    A[User clicks Edit button or task text] --> B[Text becomes editable input]
    B --> C[User modifies text]
    C --> D{How does user finish?}
    D -->|Enter key| E[Save changes]
    D -->|Blur / click away| E
    D -->|Escape key| F[Cancel - revert to original text]
    E --> G[Text updates instantly - optimistic]
    G --> H[API PATCH fires in background]
    H --> I{Server response?}
    I -->|Success| J[Edit confirmed - no visible change]
    I -->|Failure| K[Text reverts to previous value]
    K --> L[Toast: "Couldn't save edit. Try again."]
    F --> M[Original text restored, edit mode exits]
```

### Task Deletion Flow

```mermaid
flowchart TD
    A[User clicks/taps Delete button] --> B[Task removed from list instantly - optimistic]
    B --> C[API DELETE fires in background]
    C --> D{Server response?}
    D -->|Success| E[Deletion confirmed - no visible change]
    D -->|Failure| F[Task reappears in list at original position]
    F --> G[Toast: "Couldn't delete task. Try again."]
```

### App Load Flow

```mermaid
flowchart TD
    A[User opens app] --> B[Show loading spinner]
    B --> C[API GET /todos]
    C --> D{Server response?}
    D -->|Success + tasks exist| E[Render task list]
    D -->|Success + no tasks| F[Show empty state: "No todos yet"]
    D -->|Failure| G[Show error state with retry button]
    G --> H[User clicks retry]
    H --> C
    E --> I[Input field auto-focused]
    F --> I
```

### Journey Patterns

**Consistent across all flows:**

| Pattern | Implementation |
|---|---|
| Optimistic update | Every mutation reflects in UI before server confirms |
| Silent confirmation | Server success produces no additional UI change — the optimistic state was already correct |
| Visible rollback | Server failure reverts the UI to pre-action state |
| Toast on error | Brief, non-blocking notification. Auto-dismisses after 3-4 seconds. No action required from user. |
| Input refocus | After task creation, input clears and refocuses. The user is always ready to add the next task. |

### Flow Optimization Principles

1. **Zero-step success path** — The happy path has no decision points. User acts, UI responds. Done.
2. **Error paths are self-healing** — Rollback is automatic. The user doesn't need to "fix" anything — just retry.
3. **No confirmation dialogs** — Delete is immediate. Edit saves on blur. No "Are you sure?" interruptions. Speed over safety for low-stakes personal data.
4. **Toast over modal** — Errors never block interaction. A toast appears, the user can ignore it or retry at their pace.
5. **Loading only on initial fetch** — The spinner appears only when the app first loads. All subsequent interactions are optimistic — no per-action loading indicators.

## Component Strategy

### Design System Components

**From Tailwind CSS (utility layer, not components):**
Tailwind provides no pre-built components — it provides utility classes for styling. All components below are custom React components styled with Tailwind utilities.

**Foundation elements used from HTML/Tailwind:**
- `<input>` with Tailwind styling — text input for task creation and inline editing
- `<button>` with Tailwind styling — Add, Edit, Delete actions
- `<input type="checkbox">` with custom Tailwind styling — completion toggle
- `<ul>` / `<li>` — semantic list structure for tasks

### Custom Components

**TodoForm**

| Aspect | Detail |
|---|---|
| Purpose | Task capture — the primary entry point for the core experience |
| Anatomy | Text input (bottom-border style) + Add button (blue, right-aligned) |
| States | Default (placeholder visible), Focused (blue bottom border), Submitting (optimistic — clears immediately) |
| Behavior | Enter key or Add click submits. Empty submission prevented (input shakes or no-op). Input clears and refocuses after submit. |
| Accessibility | `<form>` with `<label>` (visually hidden) for input. Button has text label "Add". |

**TodoList**

| Aspect | Detail |
|---|---|
| Purpose | Renders the ordered list of all tasks (active and completed) |
| Anatomy | `<ul>` containing TodoItem components |
| States | Populated (tasks exist), Empty (delegates to EmptyState) |
| Behavior | Renders tasks in creation order. No reordering, no grouping. |
| Accessibility | Semantic `<ul>` with `<li>` children. |

**TodoItem**

| Aspect | Detail |
|---|---|
| Purpose | Single task row — the most interacted-with component |
| Anatomy | Checkbox (left) + Task text (center, flex-grow) + Edit button + Delete button (right, hidden until hover) |
| States | Active (normal text), Completed (strikethrough + muted), Editing (text becomes input), Hover (action buttons revealed) |
| Variants | Active vs completed visual treatment. Edit mode vs display mode. |
| Behavior | Checkbox toggles completion. Click Edit or task text to enter edit mode. Enter/blur saves edit, Escape cancels. Delete removes immediately. |
| Accessibility | Checkbox has `aria-label` with task text. Buttons have text labels. Edit mode focuses the input. |
| Mobile | Action buttons always visible (no hover on touch). Touch targets minimum 44x44px. |

**EmptyState**

| Aspect | Detail |
|---|---|
| Purpose | First impression and "onboarding" — shown when no tasks exist |
| Anatomy | Centered text message ("No todos yet") — minimal, no illustrations or icons |
| States | Single state only |
| Behavior | Static display. Disappears when first task is added. |
| Accessibility | Text is in a `<p>` or `<div>` with appropriate role. |

**LoadingSpinner**

| Aspect | Detail |
|---|---|
| Purpose | Shown only during initial data fetch on app load |
| Anatomy | Simple CSS spinner, centered on page. No text. |
| States | Single state — visible during loading |
| Behavior | Appears on app mount, disappears when API returns. Never shown for individual task operations. |
| Accessibility | `aria-label="Loading tasks"` on the spinner container. |

**Toast**

| Aspect | Detail |
|---|---|
| Purpose | Non-blocking error/info notification for failed operations |
| Anatomy | Dark background bar, white text, positioned bottom-right (desktop) or bottom-center (mobile) |
| States | Hidden (default), Visible (slides in), Dismissing (slides out after 3-4 seconds) |
| Behavior | Auto-dismisses. Multiple toasts stack vertically. No close button needed — auto-dismiss is sufficient. |
| Accessibility | `role="alert"` and `aria-live="polite"` for screen reader announcement. |

### Component Implementation Strategy

- **All components in single files** — one file per component, styled inline with Tailwind utilities
- **No shared component abstraction layer** — no `<Button variant="primary">` wrapper. Use Tailwind classes directly. The surface is too small to justify abstraction.
- **State management via `useTodos` hook** — components are presentational where possible. TodoForm and TodoItem receive callbacks from the hook.
- **Component tree:** `App` > `TodoForm` + (`TodoList` > `TodoItem[]`) + `EmptyState` + `LoadingSpinner` + `Toast`

### Implementation Roadmap

All 6 components are needed for MVP — the surface is small enough to build in a single pass. No phasing needed.

| Priority | Component | Reason |
|---|---|---|
| 1 | TodoForm | Core experience — task creation is the gravitational center |
| 2 | TodoList + TodoItem | Core experience — viewing and interacting with tasks |
| 3 | EmptyState | First impression — needed before any tasks exist |
| 4 | Toast | Error handling — needed for optimistic UI rollback feedback |
| 5 | LoadingSpinner | Initial load state — simplest component |

## UX Consistency Patterns

### Button Hierarchy

| Level | Style | Usage | Example |
|---|---|---|---|
| Primary | Blue fill (`#2563EB`), white text, rounded | The ONE action we want the user to take | Add button |
| Secondary | Transparent, gray border, gray text | Supporting actions, non-destructive | Edit button |
| Destructive | Transparent, gray border, turns red on hover | Irreversible actions | Delete button |

**Rules:**
- Only ONE primary button visible on screen at any time (the Add button)
- Secondary and destructive buttons are visually identical at rest — differentiation happens on hover/focus (red for destructive)
- All buttons have text labels. No icon-only buttons in V1.
- Minimum touch target: 44x44px on mobile, comfortable click target on desktop
- No disabled states — if an action can't be taken, the button isn't rendered

### Feedback Patterns

| Situation | Pattern | Duration | User Action Required |
|---|---|---|---|
| Action success | No feedback — optimistic update already showed the result | N/A | None |
| Action failure | Toast notification + automatic UI rollback | Auto-dismiss 4 seconds | None (retry at will) |
| Validation error | Inline — input shakes or no-op for empty submission | Immediate | Fix input and retry |
| Unhandled exception | Error boundary — full-screen message with retry button | Persistent until retry | Click retry |

**Rules:**
- **Never use modals** for feedback. Toasts are non-blocking.
- **Never require user acknowledgment** for errors. Toast auto-dismisses.
- **Success is silent.** The optimistic update IS the success feedback. No "Task added!" confirmations.
- **Errors are honest.** Toast text explains what happened in plain language: "Couldn't add task. Try again."
- **Toast position:** Bottom-right on desktop, bottom-center on mobile. Slides in from below.
- **Multiple toasts:** Stack vertically with `sm` (8px) gap. Oldest at top, newest at bottom.

### Form Patterns

**Task creation form:**
- Single text input + single submit button. No multi-field forms anywhere in the app.
- Submit on Enter key or Add button click
- Empty submission: input no-ops (no error toast for this — it's too minor)
- After submit: input clears, refocuses, placeholder reappears
- No character limit displayed (backend validates at 500 chars if needed)

**Inline editing:**
- Activated by clicking Edit button or task text
- Task text transforms into an input field pre-filled with current text
- Save: Enter key or blur (click away)
- Cancel: Escape key — reverts to original text
- No separate "Save" / "Cancel" buttons shown — keyboard conventions are sufficient
- Edit mode is visually distinct: input has bottom-border styling matching the creation input

### State Patterns

| State | When | Visual | Behavior |
|---|---|---|---|
| Loading | Initial app load only | Centered spinner, no text | Disappears when API returns |
| Empty | No tasks exist | Centered text: "No todos yet" | Disappears when first task added |
| Error (load) | Initial fetch fails | Centered message + "Try again" button | Button retriggers fetch |
| Error (action) | Individual operation fails | Toast + rollback | Auto-recovers, user retries at will |

**Rules:**
- Loading spinner appears ONLY on initial page load. Never for individual operations.
- Empty state is text-only. No illustrations, no icons, no suggestions. Just "No todos yet" — the input field above is the obvious next action.
- Error boundary is the last resort. If something truly unhandled occurs, show a clean error screen with a single "Reload" button. No stack traces, no error codes.

## Responsive Design & Accessibility

### Responsive Strategy

**Approach:** Mobile-first CSS with a single breakpoint. The product has one layout (single column, centered) that adapts its spacing and touch targets between two viewport ranges.

**Desktop (768px+):**
- Content centered in 640px max-width column
- `xl` (32px) page margins
- Action buttons (Edit, Delete) hidden by default, revealed on hover
- Comfortable click targets — standard web sizing
- Input auto-focused on page load

**Mobile (<768px):**
- Content fills viewport with `md` (16px) margins
- Action buttons always visible (no hover on touch devices)
- Touch targets minimum 44x44px for all interactive elements
- Input field prominent — large enough for thumb typing
- No viewport meta auto-zoom: base font 16px prevents iOS Safari zoom on input focus

**No tablet-specific treatment.** The single breakpoint at 768px handles the split cleanly. Tablets in landscape get the desktop experience; tablets in portrait get the mobile experience.

### Breakpoint Strategy

| Breakpoint | Range | Tailwind Prefix | Layout Changes |
|---|---|---|---|
| Mobile (default) | 0 - 767px | (none — mobile-first) | Full-width, always-visible actions, 16px margins |
| Desktop | 768px+ | `md:` | 640px centered, hover-reveal actions, 32px margins |

**Implementation:** Mobile-first CSS — base styles target mobile, `md:` prefix overrides for desktop. One breakpoint, one media query. Matches the product philosophy of doing less.

### Accessibility Strategy

**Target:** Basic semantic HTML accessibility (as defined in PRD NFR9-12). Not targeting full WCAG 2.1 AA compliance in V1, but building a foundation that makes AA achievable later.

**What V1 delivers:**

| Requirement | Implementation |
|---|---|
| Keyboard navigation | Tab through all interactive elements. Enter to submit/confirm. Escape to cancel edit. |
| Focus indicators | 2px blue outline (`#2563EB`) on all focused elements via Tailwind `focus:ring` |
| Form labels | Visually hidden `<label>` for task input. Checkbox `aria-label` includes task text. |
| Semantic structure | `<main>`, `<form>`, `<ul>`, `<li>`, `<button>`, `<input>` — no `<div>` soup |
| Color independence | Completed tasks use strikethrough + muted color (two signals, not color alone) |
| Screen reader alerts | Toast uses `role="alert"` and `aria-live="polite"` |
| Touch targets | Minimum 44x44px on all interactive elements (mobile) |
| Font sizing | 16px base prevents iOS auto-zoom on input focus |

**What V1 does NOT deliver (future):**
- Skip navigation links
- High-contrast mode
- Reduced motion preferences (`prefers-reduced-motion`)
- Full ARIA landmark structure
- Screen reader testing validation

### Testing Strategy

**Responsive testing:**
- Chrome DevTools device emulation for layout verification
- Real device testing on iOS Safari (iPhone) and Chrome (Android) for touch interaction validation
- Verify: input focus behavior, touch target sizing, action button visibility, toast positioning

**Accessibility testing:**
- Keyboard-only navigation walkthrough: can all CRUD operations be performed without a mouse?
- Tab order: does it follow visual order (input → Add → first task checkbox → first task edit → first task delete → next task...)?
- Lighthouse accessibility audit — target score 90+
- Manual check: focus indicators visible on all interactive elements

### Implementation Guidelines

**For the developer:**

- Write mobile-first CSS — base styles are mobile, add `md:` for desktop
- Use Tailwind's `focus:ring-2 focus:ring-blue-500` for consistent focus indicators
- Use `sr-only` class for visually hidden labels
- Test keyboard navigation after every component is built — don't defer to end
- Use `@media (hover: hover)` to conditionally hide action buttons on hover-capable devices only — never use viewport width as a proxy for hover capability
- Set `<meta name="viewport" content="width=device-width, initial-scale=1">` — no `maximum-scale` restriction (allows user zoom)
