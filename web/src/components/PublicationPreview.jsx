import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X, Maximize2, Minus } from "lucide-react";
import { useModalDialog } from "../hooks/useModalDialog";
import { publicationPreviews } from "../siteConfig";
import { Authors, Resources } from "./Publications";
export default function PublicationPreview({ paper, papers, onChange, onClose }) {
  const dialog = useRef(null); useModalDialog(dialog);
  const [expanded, setExpanded] = useState(false);
  const index = papers.findIndex(item => item.id === paper.id);
  const figure = publicationPreviews[paper.id];
  function change(offset) { setExpanded(false); onChange(papers[(index + offset + papers.length) % papers.length]); }
  return <dialog className="paper-dialog" ref={dialog} aria-labelledby="paper-dialog-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}><div className="dialog-toolbar"><button type="button" onClick={() => change(-1)} aria-label="Previous paper"><ArrowLeft size={17} /><span>Previous</span></button><span>{index + 1} / {papers.length}</span><div><button type="button" onClick={() => change(1)} aria-label="Next paper"><span>Next</span><ArrowRight size={17} /></button><button type="button" onClick={onClose} aria-label="Close paper details"><X size={21} /></button></div></div><div className="paper-dialog-body" key={paper.id}><p className="eyebrow">{paper.venue}{paper.status && ` · ${paper.status}`}</p><h2 id="paper-dialog-title">{paper.title}</h2><Authors paper={paper} /><div className="publication-links"><Resources paper={paper} /></div><section className="paper-summary"><h3>Overview</h3><p>{paper.abstract}</p></section>{figure && <figure className={expanded ? "paper-detail-figure expanded" : "paper-detail-figure"}><div className="figure-scroll" tabIndex={expanded ? 0 : undefined} aria-label={expanded ? "Enlarged figure; scroll horizontally to explore" : undefined}><img src={figure.figure} alt={figure.figureAlt} /></div><figcaption><p>{figure.figureCaption}<span className="figure-source">{figure.sourceLabel}{figure.sourceKind === "slides" ? " · Figure from presentation slides" : " · Figure from the paper"}</span></p><button type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? <Minus size={16} /> : <Maximize2 size={16} />}{expanded ? "Fit" : "Enlarge"}</button></figcaption></figure>}</div></dialog>;
}
