import config from "../config/paper-recommendations.json";
import publications from "../config/publications.json";
import { buildQuery, createArxivService } from "../src/utils/arxivQuery.js";
import { createFigureService } from "../src/utils/arxivFigures.js";

const queryConfig = { ...config, publications };
const getFeed = createArxivService(queryConfig);
const getFigure = createFigureService();
export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin");
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map(value => value.trim());
    const headers = { Vary: "Origin", "Access-Control-Expose-Headers": "X-Fetched-At, X-Feed-Stale" };
    if (origin && !allowed.includes(origin)) return new Response("Origin not allowed", { status: 403 });
    if (origin) headers["Access-Control-Allow-Origin"] = origin;
    if (!["GET", "OPTIONS"].includes(request.method)) return new Response("Method not allowed", { status: 405, headers });
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...headers, "Access-Control-Allow-Methods": "GET, OPTIONS" } });
    const url = new URL(request.url);
    const id = url.searchParams.get("paper") || "";
    const expanded = url.searchParams.get("expanded") === "1";
    const query = buildQuery(queryConfig, id, expanded);
    const figureId = url.searchParams.get("figure");
    if (url.pathname !== "/recommendations" || (figureId === null ? !query : !/^\d{4}\.\d{4,5}(?:v\d+)?$/.test(figureId))) return new Response("Not found", { status: 404, headers });
    // Cache the canonical query, not arbitrary client parameters or request origins.
    const key = new Request(`${url.origin}/cached?${figureId === null ? `query=${encodeURIComponent(query.toString())}` : `figure-v11=${figureId}`}`);
    let response = await caches.default.match(key);
    if (!response) {
      response = figureId === null ? await getFeed(id, expanded) : await getFigure(figureId);
      if (response.ok && !response.headers.has("X-Feed-Stale") && response.headers.get("Cache-Control") !== "no-store") ctx.waitUntil(caches.default.put(key, response.clone()));
    }
    const outgoing = new Response(response.body, response);
    Object.entries(headers).forEach(([name, value]) => outgoing.headers.set(name, value));
    return outgoing;
  },
};
