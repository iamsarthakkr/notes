# docs/

Generated static site for browsing `notes/`. Deployed via GitHub Pages
("Deploy from a branch" → `main` → `/docs`).

- `index.html`, `app.js`, `style.css` — hand-written, the viewer itself.
- `notes-data.js` — **generated, do not hand-edit.** Regenerate with:

  ```bash
  node scripts/generate-notes-data.js
  ```

  Run this from the repo root any time `notes/` changes, then commit the
  regenerated `notes-data.js` along with the note changes and push — there's
  no CI build step, so whatever is committed here is exactly what GitHub
  Pages serves.
