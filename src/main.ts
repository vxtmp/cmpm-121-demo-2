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

// Allow user to draw on canvas by registering observers for mouse events
const ctx = canvas.getContext("2d")!; // What is the ! at the end of this line?
// The ! at the end of this line is a non-null assertion operator. It tells TypeScript that the value is not null or undefined.

let isDrawing = false;
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});
canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  }
});
canvas.addEventListener("mouseup", () => {
  isDrawing = false;
});
canvas.addEventListener("mouseleave", () => {
  isDrawing = false;
});

// Add a button to clear the canvas
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
app.append(clearButton);

// What is ctx
// ctx is a 2d rendering context of the canvas. It provides methods to draw on the canvas.
// What is ctx.beginPath() and ctx.moveTo()?
// ctx.beginPath() starts a new path. ctx.moveTo(x, y) moves the drawing cursor to the point (x, y) without drawing anything.