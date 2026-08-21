import "./studio.css";

const app = document.querySelector<HTMLDivElement>("#app");
if (app === null) throw new Error("ANVIL Studio requires #app");

document.title = "PROJECT ANVIL — Studio";

const surface = document.createElement("main");
surface.className = "studio-surface";
surface.dataset.anvilStudio = "substrate";

const world = document.createElement("canvas");
world.className = "studio-world";
world.dataset.studioWorld = "true";
world.setAttribute("aria-label", "ANVIL Studio world canvas");

const marker = document.createElement("div");
marker.className = "studio-substrate-marker";
marker.setAttribute("aria-hidden", "true");
marker.textContent = "ANVIL · STUDIO";

surface.append(world, marker);
app.replaceChildren(surface);
