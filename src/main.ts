import "./style.css";

const APP_NAME = "Heeeeeeeeeelloooooooooooooo";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

// add an app title in a h1 element
const title = document.createElement("h1");
title.textContent = APP_NAME;

app.append (title);

// Add a canvas to the webpage of size 256x256 pixels.
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
app.append(canvas);
