# docs/

Generated static site for browsing `notes/`. Deployed via GitHub Pages
("Deploy from a branch" → `main` → `/docs`).

- `index.html`, `app.js`, `style.css` — hand-written, the viewer itself.
- `notes-data.js` — **generated, do not hand-edit.** Regenerate with:

  ```bash
  node docs/generate-notes-data.js
  ```

  Run this from the repo root any time `notes/` changes, then commit the
  regenerated `notes-data.js` along with the note changes and push — there's
  no CI build step, so whatever is committed here is exactly what GitHub
  Pages serves.

## Images in notes

Put images next to the note that uses them, under an `images/` folder, e.g.
`notes/system-design/designs/images/02-rate-limiter-architecture.png`.
Reference them with a plain relative path in the markdown:

```markdown
![Token bucket flow across gateways](images/02-rate-limiter-architecture.png)
```

`app.js` rewrites these note-relative paths to the real location under
`../notes/` at render time, so no path changes are needed elsewhere.
