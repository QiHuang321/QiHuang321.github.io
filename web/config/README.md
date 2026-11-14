# Site content

This site adapts Anleeno Academic. Edit JSON files here, then run `npm run build` from `web/`.

- `hero.json`, `about.json`: profile, biography, CV and social links.
- `publications.json`: publications, author order, status, links and topic grouping. `abstract` is a source-grounded overview, displayed as “Overview”.
- `publication-previews.json`: enlarged figures and displayed captions.
- `figure-sources.json`: extraction provenance and source page numbers.
- `research.json`: existing approved research descriptions. Trusted local HTML is preserved for links.
- `news.json`, `education.json`, `experience.json`, `service.json`: academic background.
- `personal.json`: independent `/personal/` gallery, exact user-provided captions.
- `theme.jsonc`: template theme variables.

Stable `/assets/...` URLs resolve from the repository root. Do not add ICLR/AISTATS manuscripts or equal-contribution marks to CAWN. Paper summaries must be verified against their source PDFs.
