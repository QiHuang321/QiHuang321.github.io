import { useEffect, useRef, useState } from "react";
import { Menu, X, Sun, Moon, ArrowUpRight } from "lucide-react";
import "../css/Header.css";
export default function Header({ personal }) {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const toggle = useRef(null);
  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
    const close = event => { if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); } };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  function changeTheme() {
    const next = !dark;
    setDark(next); document.documentElement.dataset.theme = next ? "dark" : "light";
    try { localStorage.setItem("qi-theme", next ? "dark" : "light"); } catch { /* Storage is optional. */ }
  }
  const nav = [["About", "/#about"], ["Papers", "/#publications"], ["Research", "/#research"], ["Background", "/#background"], ["Personal", "/personal/"]];
  return <header className={`header-wrapper${open ? " menu-open" : ""}`}><div className="header-container"><a className="header-name" href="/" aria-label="Qi Huang home">Qi Huang<span className="brand-dot" aria-hidden="true">.</span></a><div className="header-actions"><nav className={`header-nav${open ? " show" : ""}`} aria-label="Main navigation" id="site-navigation">{nav.map(([label, href]) => <a key={label} href={href} aria-current={personal && label === "Personal" ? "page" : undefined} onClick={() => setOpen(false)}>{label}</a>)}<a className="nav-cv" href="/assets/file/Qi_Huang_CV.pdf" target="_blank" rel="noreferrer">CV <ArrowUpRight size={14} aria-hidden="true" /></a></nav><button className="theme-toggle" type="button" aria-label={dark ? "Use light theme" : "Use dark theme"} onClick={changeTheme}>{dark ? <Sun /> : <Moon />}</button><button ref={toggle} className="hamburger" type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div></div></header>;
}
