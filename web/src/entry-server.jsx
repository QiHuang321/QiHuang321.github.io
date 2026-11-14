import { renderToString } from "react-dom/server";
import App from "./App.jsx";
export function render(personal = false) { return renderToString(<App personal={personal} />); }
