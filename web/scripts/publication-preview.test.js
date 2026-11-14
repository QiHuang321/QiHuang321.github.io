import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

test("paper details use actual figures, honest status, available resources, and a text-only fallback", async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false, watch: null }, appType: "custom", optimizeDeps: { noDiscovery: true, include: [] } });
  try {
    const { default: Preview } = await server.ssrLoadModule("/src/components/PublicationPreview.jsx");
    const { publications, publicationPreviews } = await server.ssrLoadModule("/src/siteConfig.js");
    const fallback = { ...publications[0], id: "new-paper", title: "A new paper", abstract: "A new overview.", links: [] };
    for (const paper of [...publications, fallback]) {
      const html = renderToStaticMarkup(React.createElement(Preview, { paper, papers: publications, onChange() {}, onClose() {} }));
      assert.match(html, /<dialog/);
      assert.doesNotMatch(html, /NaN|undefined|Original abstract/);
      assert.match(html, /Overview/);
      for (const link of paper.links) assert.ok(html.includes(link.url));
      if (publicationPreviews[paper.id]) assert.ok(html.includes(publicationPreviews[paper.id].figure));
      else assert.doesNotMatch(html, /<figure/);
      if (paper.id === "pub-cawn") {
        assert.match(html, /presentation slides/);
        assert.doesNotMatch(html, /Equal contribution|Huang\*|Wang\*/);
      }
    }
  } finally { await server.close(); }
});
