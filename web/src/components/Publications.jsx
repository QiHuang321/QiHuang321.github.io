import { lazy, Suspense, useState } from "react";
import { ArrowUpRight, Copy, Check, Plus } from "lucide-react";
import { publications } from "../siteConfig";
import { Segment } from "./About";
const loadPreview = () => import("./PublicationPreview");
const PublicationPreview = lazy(loadPreview);
export function Authors({ paper }) { return <p className="publication-authors">{paper.authors.map((author, i) => <Segment segment={author} key={i} />)}</p>; }
export function Resources({ paper }) { return (paper.links || []).map(link => <a href={link.url} key={link.label} target="_blank" rel="noreferrer">{link.label}<ArrowUpRight aria-hidden="true" size={14} /></a>); }
export default function Publications() {
  const [active, setActive] = useState(null);
  const [copied, setCopied] = useState("");
  const [copyError, setCopyError] = useState("");
  async function copy(paper) {
    try { await navigator.clipboard.writeText(paper.citation); setCopied(paper.id); setCopyError(""); setTimeout(() => setCopied(""), 2000); }
    catch { setCopyError(paper.id); }
  }
  return <section id="publications" aria-labelledby="publications-heading"><div className="section-heading"><h2 className="card-title" id="publications-heading">Publications & manuscripts</h2><span className="section-count">{String(publications.length).padStart(2, "0")} papers</span></div>{[["causal", "Causal inference"], ["ml", "LLMs & machine learning"]].map(([group, title]) => <div className={`publication-group group-${group}`} key={group}><h3 className="group-title">{title}</h3><div className="publications-list">{publications.filter(paper => paper.group === group).map(paper => <article className="publication-card" id={paper.id} key={paper.id}><button className="publication-figure" type="button" aria-label={`View figure and details: ${paper.title}`} aria-haspopup="dialog" onClick={() => setActive(paper)} onPointerEnter={loadPreview} onFocus={loadPreview}><img src={paper.image} alt={paper.imageAlt} loading="lazy" decoding="async" width="640" height="400" /><span className="figure-open" aria-hidden="true"><Plus size={16} /></span></button><div className="publication-content"><div className="publication-venue"><span className="venue-tag">{paper.venue}</span>{paper.status && <span className="paper-status">{paper.status}</span>}</div><h4 className="publication-title"><button type="button" onClick={() => setActive(paper)} aria-haspopup="dialog">{paper.title}</button></h4><Authors paper={paper} /><div className="publication-tags">{paper.tags.map(tag => <span key={tag}>{tag}</span>)}</div><div className="publication-links"><Resources paper={paper} /><button type="button" onClick={() => setActive(paper)} aria-haspopup="dialog">Details <Plus size={13} aria-hidden="true" /></button><button className="publication-cite" type="button" onClick={() => copy(paper)}>{copied === paper.id ? <Check size={13} /> : <Copy size={13} />}<span aria-live="polite">{copied === paper.id ? "Copied" : "Cite"}</span></button></div>{copyError === paper.id && <details open><summary>Select and copy citation</summary><p>{paper.citation}</p></details>}</div></article>)}</div></div>)}{active && <Suspense fallback={<p role="status">Loading paper details…</p>}><PublicationPreview paper={active} papers={publications} onChange={setActive} onClose={() => setActive(null)} /></Suspense>}</section>;
}
