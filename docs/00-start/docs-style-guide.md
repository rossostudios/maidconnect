# Docs Style Guide

One‑page rules for writing Casaora docs that stay useful and concise.

## Principles
- Single source of truth per topic; link instead of duplicating.
- Keep it scannable: short sections, bullets, and examples.
- Match the code: update docs with changes as part of PRs.

## Structure
- Start with a 1–2 line summary of purpose and scope.
- Add a small table of contents only for longer docs (> ~60 lines).
- Prefer headings that describe actions or outcomes (e.g., "Deploy to Vercel").

## Voice & Style
- Clear, direct, and practical; avoid marketing language in technical docs.
- Present tense and active voice ("Use", "Run", "Add").
- Use bullets; keep paragraphs short (≤ 3 lines where possible).

## Formatting
- Use backticks for commands, paths, and identifiers: `npm run dev`, `src/lib/api`.
- Use fenced code blocks with a language hint for syntax highlighting.
  - Typescript:
    ```ts
    // example
    ```
  - SQL:
    ```sql
    -- example
    ```
  - Shell:
    ```bash
    # example
    ```
- Use relative links to keep portability (e.g., `../03-technical/architecture.md`).

## File Conventions
- Names: kebab‑case (e.g., `api-guidelines.md`, not `API_GUIDELINES.md`).
- Location: put docs where readers expect them (technical → `03-technical/`, ops → `06-operations/`).
- One topic per file; create a new file instead of overloading a catch‑all doc.

## Cross‑Referencing
- Link the canonical doc instead of repeating content.
- Prefer stable concepts ("API Middleware Guide") over file names in prose.

## Diagrams & Images
- Use ASCII or Mermaid only when it clarifies a complex flow.
- Host images in `public/` or reference stable external assets; avoid embedding large images in repos.

## Review Checklist (for PRs)
- Does this doc reflect the current code paths and APIs?
- Is there a single authoritative place for this topic?
- Are links relative and working?
- Is it short enough to grasp quickly? If not, split sections.

## Examples
- Link a snippet to the actual file path: `src/app/[locale]/help/page.tsx`.
- Mention the guide for a deeper dive: `docs/07-guides/api-middleware-guide.md`.

