import { useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Publications from "./components/Publications";
import Experience from "./components/Experience";
import Footer from "./components/Footer";
import News from "./components/News";
import AcademicBackground from "./components/AcademicBackground";
import Research from "./components/Research";
import Personal from "./components/Personal";
import service from "../config/service.json";
import "@fontsource-variable/newsreader/wght.css";
import "./App.css";
import "./css/Typography.css";
export default function App({ personal = false }) {
  useEffect(() => {
    if (["#outside-research", "#outside-title"].includes(location.hash)) location.replace("/personal/");
    else if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
  }, []);
  return <div className="App" id="top"><a className="skip-link" href="#main">Skip to content</a><Header personal={personal} />
    {personal ? <Personal /> : <div className="main-layout"><aside className="left-hero" aria-label="Qi Huang's profile"><Hero /></aside><main className="right-content" id="main"><div className="content-shell"><About /><News /><Publications /><Research /><div id="background" className="background-sections"><AcademicBackground /><Experience /><section id="service" aria-labelledby="service-heading"><h2 className="card-title" id="service-heading">Academic service</h2><ul className="service-list">{service.map(item => <li key={item.venue}><div><h3>{item.venue}</h3><p>{item.name}</p></div><span>{item.role}</span></li>)}</ul></section></div></div></main></div>}
    <Footer /></div>;
}
