# Notes

Knowledge base for job prep — system design, DSA, behavioral, and project deep-dives.

## Structure

### `system-design/`

- **`concepts/`** — one file per concept (`caching.md`, `cap-theorem.md`, etc).
  Generated after completing the teach → quiz → pass cycle for that topic.
- **`patterns/`** — reusable design patterns (`read-heavy.md`, `write-heavy.md`,
  `high-availability.md`, etc).
- **`designs/`** — full HLD practice designs (`url-shortener.md`, `chat-app.md`, etc).
  One file per system designed in mock interviews.
- **`cheatsheets/`** — quick reference sheets to review right before an interview.
- **`topic-phrases/`** — per-topic interview language. Generated alongside
  concept notes after quiz completion.
- **`roadmap.md`** — master progress tracker. Single source of truth for what's
  been covered. Update checkboxes as topics are completed.

### `dsa/`

- **`patterns/`** — one file per DSA pattern (`sliding-window.md`, `two-pointers.md`, etc).
- **`problems/`** — key problems per pattern with approach notes.

### `behavioral/`

- **`stories/`** — STAR format stories from projects (`university-mgmt.md`,
  `api-gateway.md`). Used for behavioral round prep.
- **`common-questions.md`** — common behavioral questions grouped by theme.

### `projects/`

Deep-dive interview prep per project. Used for project presentation rounds.

## Workflow

Most `system-design/` subfolders start empty and fill in over time as topics
in `roadmap.md` are completed via the teach → quiz → pass cycle. `dsa/patterns/`,
`dsa/problems/`, and `behavioral/stories/` follow the same pattern — populated
as topics/projects are worked through, not all at once.
