import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { StudioApp } from "./app.js";
import "./studio.css";

const app = document.querySelector<HTMLDivElement>("#app");
if (app === null) throw new Error("ANVIL Studio requires #app");

document.title = "PROJECT ANVIL — Studio";
createRoot(app).render(createElement(StudioApp));
