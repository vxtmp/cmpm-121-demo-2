import "./style.css";

const APP_NAME = "Heeeeeeeeeelloooooooooooooo";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

// add an app title in a h1 element
const title = document.createElement("h1");
title.textContent = APP_NAME;

app.append (title);

function addCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  app.append(canvas);
  return canvas;
}
// Add a canvas to the webpage of size 256x256 pixels.
const canvas = addCanvas(256, 256);

// Add a drawing-changed event on the canvas and instead of drawing directly, save the user's drawing into an array of an array of points
// Each point is an object with x and y properties
// const points: { x: number, y: number }[] = [];
const points: { x: number, y: number }[] = [];
const ctx = canvas.getContext("2d")!;
let isDrawing = false;
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  points.push({ x: e.offsetX, y: e.offsetY });
});
canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    points.push({ x: e.offsetX, y: e.offsetY });
  }
});
canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  // trigger the drawing changed event
  canvas.dispatchEvent(new Event("drawing-changed"));
});

// add the drawing changed event
canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  for (const point of points) {
    ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();
});


// Allow user to draw on canvas by registering observers for mouse events
// const ctx = canvas.getContext("2d")!;
// let isDrawing = false;
// canvas.addEventListener("mousedown", (e) => {
//   isDrawing = true;
//   ctx.beginPath();
//   ctx.moveTo(e.offsetX, e.offsetY);
// });
// canvas.addEventListener("mousemove", (e) => {
//   if (isDrawing) {
//     ctx.lineTo(e.offsetX, e.offsetY);
//     ctx.stroke();
//   }
// });
// canvas.addEventListener("mouseup", () => {
//   isDrawing = false;
// });
// canvas.addEventListener("mouseleave", () => {
//   isDrawing = false;
// });

// Add a button to clear the canvas
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // clear the array of points too
    points.length = 0;
    canvas.dispatchEvent(new Event("drawing-changed"));
    
});
app.append(clearButton);

// What is ctx
// ctx is a 2d rendering context of the canvas. It provides methods to draw on the canvas.
// What is ctx.beginPath() and ctx.moveTo()?
// ctx.beginPath() starts a new path. ctx.moveTo(x, y) moves the drawing cursor to the point (x, y) without drawing anything.