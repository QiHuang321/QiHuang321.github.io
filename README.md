# Qi Huang — personal academic website

Live: **https://qihuang.me/** · GitHub Pages repository: `QiHuang321/QiHuang321.github.io`.

The site adapts [Anleeno Academic](https://github.com/Anleeno/anleeno-academic) (React + Vite). It preserves the profile sidebar, illustrated publication list, native dialog interactions, and optional CV reader while using Qi Huang’s own content and images. Template code is MIT licensed; see [web/LICENSE](web/LICENSE). Original template author photos, papers, and biography are not included; see [web/CONTENT-LICENSE.md](web/CONTENT-LICENSE.md).

## Edit and preview

```sh
cd web
npm ci
npm run dev
```

Content is in `web/config/`; components and styles are in `web/src/`. All figures come from the corresponding paper PDFs, except CAWN’s diagram, which comes from its public slides. Provenance, figure/page numbers, and descriptions are recorded in `web/config/figure-sources.json`. Full manuscripts are not bundled.

```sh
cd web
npm test
npm run build
cd ..
python3 -m http.server 8000
```

`npm run build` validates content, builds the client, prerenders the academic and personal pages, then replaces only `index.html`, `personal/index.html`, and generated `assets/app/` bundles. The resulting site is static and can be reviewed at `http://localhost:8000/`. The main academic content is present even without JavaScript. Native document links work independently of the optional PDF preview.

## Publish

Review the generated changes, commit source and generated files, then push to the existing public `main` branch. GitHub Pages continues serving the root with `CNAME` set to `qihuang.me`; no hosting-setting changes are needed. Keep `web/node_modules`, `web/dist`, and `web/dist-server` untracked. No build credentials are needed on the client.

Stable resources:

- `/assets/file/Qi_Huang_CV.pdf` — current CV.
- `/assets/file/CAWN_meeting.pdf` — CAWN slides.
- `/assets/papers/` — original paper figure crops and small card versions.
- `/assets/img/fitness/` — existing fitness photos.
- `/personal/` — separate photo page.

Other existing routes, including application/referee pages, are preserved by the build. `robots.txt` excludes the application section; do not add it to the navigation or sitemap.

Content constraints: retain the two research groups, do not list the excluded ICLR/AISTATS manuscripts, and do not add author stars or an equal-contribution note to CAWN. Update statuses only from verified author or publisher information.
