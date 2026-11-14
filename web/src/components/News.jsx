import { newsItems } from "../siteConfig";
function Items({ items }) { return <ul className="news-list">{items.map((item, i) => <li key={`${item.date}-${i}`}><time>{item.date}</time><div dangerouslySetInnerHTML={{ __html: item.html }} /></li>)}</ul>; }
export default function News() {
  return <section className="news-section" id="news" aria-labelledby="news-heading"><h2 className="card-title" id="news-heading">News</h2><Items items={newsItems.slice(0, 3)} /><details className="news-archive"><summary>Earlier updates</summary><Items items={newsItems.slice(3)} /></details></section>;
}
