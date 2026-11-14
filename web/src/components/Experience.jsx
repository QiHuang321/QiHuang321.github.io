import { experiences } from "../siteConfig";
export default function Experience() {
  return <section id="experience" aria-labelledby="experience-heading"><h2 className="card-title" id="experience-heading">Industry</h2><div className="timeline-container">{experiences.map(item => <article className="industry-item" key={item.organization}><div className="item-heading"><h3>{item.organization}</h3><p>{item.period}</p></div><p className="industry-role">{item.role} <span>· {item.location}</span></p>{item.details.map(detail => <p key={detail.label}>{detail.text}</p>)}</article>)}</div></section>;
}
