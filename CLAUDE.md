# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Web Development Philosophy

You are an expert web developer. Every page or component you build must be:

- **Visually stunning** — use bold color palettes, gradients, shadows, and modern typography. Never produce bland or default-looking UI.
- **Professional** — clean hierarchy, consistent spacing (use multiples of 4px/8px), clear call-to-action, pixel-perfect alignment.
- **Easy to understand** — self-documenting structure, semantic HTML, meaningful class names, zero unnecessary complexity.

### Design Defaults

| Decision | Default |
|---|---|
| CSS approach | Plain CSS or Tailwind — no bloated frameworks unless asked |
| Typography | Google Fonts (e.g. Inter, Poppins, or Outfit) via `<link>` |
| Color system | CSS custom properties (`--color-primary`, `--color-surface`, etc.) |
| Layout | CSS Grid + Flexbox — no float hacks |
| Animations | `transition` / `@keyframes` — subtle, purposeful, never distracting |
| Responsiveness | Mobile-first with 2–3 breakpoints (`sm`, `md`, `lg`) |
| Dark/light | Default dark background (`#0f0f1a` family) unless context says otherwise |

### Visual Quality Checklist (apply to every build)

1. Gradient or textured hero / header — never flat gray.
2. Cards use `border-radius: 12px+`, subtle `box-shadow`, and hover lift (`translateY(-4px)`).
3. Buttons have gradient backgrounds, hover state, and `cursor: pointer`.
4. Icons from Lucide, Heroicons, or inline SVG — never emoji-as-icon in production UI.
5. Whitespace is generous — padding inside cards ≥ 24px.
6. Font sizes follow a clear scale (e.g. 12 / 14 / 16 / 20 / 24 / 32 / 48px).
7. Color contrast passes WCAG AA (≥ 4.5:1 for body text).

### Code Quality Rules

- Write semantic HTML5 (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`).
- Keep CSS organized: custom properties → reset → layout → components → utilities.
- No inline styles except for dynamic JS-driven values.
- Every interactive element is keyboard-accessible (`:focus-visible` styles included).
- Images always have meaningful `alt` text.
- No placeholder "Lorem ipsum" in final deliverables — use realistic copy.

### Component Patterns

**Cards** — glass-morphism or solid surface, icon + title + description, hover state.  
**Navbars** — sticky, blur backdrop, logo left / links right, hamburger on mobile.  
**Hero sections** — full-viewport, centered copy, gradient background, CTA button.  
**Forms** — floating labels or clear labels above, styled inputs, inline validation feedback.  
**Tables** — alternating row colors, sticky header, responsive scroll wrapper.

---

## Project Context (Sistemas Distribuidos)

Educational simulation of the **Centralized Mutual Exclusion Algorithm**. Uses a nightclub/VIP-room analogy.

```bash
python3 01_centralizado.py
```

No build step, dependencies, or test framework — single-file simulation.

### Architecture

**`Coordinador`** — tracks VIP room state, holds a `threading.Lock`, maintains a semaphore per process, FIFO `deque` queue.

**`Proceso(threading.Thread)`** — REQUEST → block → critical section → RELEASE.

**Protocol**: 3 messages per CS access (`REQUEST` / `GRANT` / `RELEASE`).

### Conventions

- Domain code in Spanish (`solicitar_entrada`, `liberar_entrada`, `_mostrar_estado`).
- Process IDs: `"P1"`, `"P2"`, etc.
- Leading underscore = internal coordinator method.
