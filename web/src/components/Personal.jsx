import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X, Maximize2 } from "lucide-react";
import { useModalDialog } from "../hooks/useModalDialog";
import photos from "../../config/personal.json";
function Gallery({ index, setIndex, onClose }) {
  const dialog = useRef(null); useModalDialog(dialog);
  const photo = photos[index];
  function step(offset) { setIndex((index + offset + photos.length) % photos.length); }
  return <dialog ref={dialog} className="gallery-dialog" aria-label="Photo gallery" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }} onKeyDown={event => { if (event.key === "ArrowLeft") step(-1); if (event.key === "ArrowRight") step(1); }}><div className="dialog-toolbar"><span>{index + 1} / {photos.length}</span><button type="button" aria-label="Close photo" onClick={onClose}><X /></button></div><figure><img src={photo.image} alt={photo.alt} /><figcaption>{photo.caption}</figcaption></figure><div className="gallery-controls"><button type="button" aria-label="Previous photo" onClick={() => step(-1)}><ArrowLeft />Previous</button><a href={photo.image} target="_blank" rel="noreferrer">Original image<Maximize2 size={15} /></a><button type="button" aria-label="Next photo" onClick={() => step(1)}>Next<ArrowRight /></button></div></dialog>;
}
export default function Personal() {
  const [active, setActive] = useState(null);
  return <main id="main" className="personal-page"><div className="personal-intro"><a className="back-link" href="/"><ArrowLeft size={16} /> Academic home</a><p className="eyebrow">Outside research</p><h1>Beyond the desk.</h1><p>I enjoy powerlifting, road trips, and connecting with the fitness community.</p></div><section aria-label="Moments from fitness events" className="photo-grid">{photos.map((photo, index) => <figure key={photo.image}><a href={photo.image} aria-label={`View full photo: ${photo.caption}`} aria-haspopup="dialog" onClick={event => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); setActive(index); } }}><img src={photo.image} alt={photo.alt} width={photo.width} height={photo.height} loading={index < 2 ? "eager" : "lazy"} style={{ objectPosition: photo.position }} /><span className="photo-enlarge" aria-hidden="true"><Maximize2 size={18} /></span></a><figcaption><span className="photo-number">0{index + 1}</span>{photo.caption}</figcaption></figure>)}</section>{active !== null && <Gallery index={active} setIndex={setActive} onClose={() => setActive(null)} />}</main>;
}
