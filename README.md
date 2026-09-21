# Agent Guidance

## Project

- This is a static vanilla JavaScript Taskify app. `index.html` owns the markup, `styles.css` owns the responsive glassmorphism UI, and `app.js` owns state, rendering, and event handling.
- There is no package manifest, build system, test suite, backend, or deployment configuration. Open `index.html` directly for a basic smoke check; use a local static server when browser behavior needs an HTTP origin.
- Preserve the existing browser-first structure and avoid adding a framework or bundler for small changes.

## Data And Cloud Boundaries

- Current task and theme persistence uses browser `localStorage` only (`taskify_tasks_v1` and `taskify_theme_v1`). Do not describe it as synchronized, shared, backed up, or cloud-hosted.
- Treat cloud functionality as a new integration, not an assumed capability. Before adding it, identify the provider and API boundary, define the data/auth model, and document required configuration.
- Never place provider secrets, service-role keys, or private credentials in `index.html`, `app.js`, or `styles.css`. Browser code may use only intentionally public client configuration; privileged operations belong behind a server or managed function.
- Cloud sync must preserve local behavior when unavailable: provide loading, offline/error, retry, and conflict behavior, and avoid silently replacing local data.
- Keep storage schema changes explicit and backward-compatible where practical. Migrate or safely fall back when existing `localStorage` data is malformed or from an older version.

## Changes And Validation

- Keep changes focused in the owning file and preserve the existing IDs and storage keys unless the feature requires a deliberate migration.
- After JavaScript changes, run `node --check app.js` and smoke-test the relevant browser interaction. For cloud changes, also verify authenticated and unauthenticated states, network failure, and refresh/persistence behavior.
- Do not add dependencies or deployment files without explaining the runtime and configuration impact.
