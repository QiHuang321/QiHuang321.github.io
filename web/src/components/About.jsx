import { about } from "../siteConfig";
export function Segment({ segment }) {
  const content = segment.strong ? <strong>{segment.text}</strong> : segment.text;
  return segment.href ? <a href={segment.href} target={segment.href.startsWith("https:") ? "_blank" : undefined} rel={segment.href.startsWith("https:") ? "noreferrer" : undefined}>{content}</a> : content;
}
export default function About() {
  return <section id="about" className="about-section" aria-labelledby="about-heading"><p className="eyebrow">Causal inference · LLMs · Machine learning</p><h2 id="about-heading" className="about-title">About me</h2>{about.paragraphs.map((paragraph, i) => <p key={i}>{paragraph.map((segment, j) => <Segment segment={segment} key={j} />)}</p>)}</section>;
}
