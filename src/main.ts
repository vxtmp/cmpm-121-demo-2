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
// const points: { x: number, y: number }[][] = [];
// const points: { x: number, y: number }[][] = [];
// points array needs to be a 2d array of points. each index is an array of points that make up a line
const points: { x: number, y: number }[][] = [];
const ctx = canvas.getContext("2d")!;
let isDrawing = false;
// add event listeners
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  // push current point to the current line
  points.push([{ x: e.offsetX, y: e.offsetY }]);
});
canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    points[points.length - 1].push({ x: e.offsetX, y: e.offsetY });
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
  // loop through each line in the points array
    for (const line of points) {
        // move to the first point in the line
        ctx.moveTo(line[0].x, line[0].y);
        // loop through each point in the line
        for (const point of line) {
        // draw a line to the next point
            ctx.lineTo(point.x, point.y);
        }
    }
  ctx.stroke();
});

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

// Add an undo button
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.addEventListener("click", () => {
    // If there are no lines to undo, return
    if (points.length === 0) {
        return;
    }
    // Add the last line to the redo stack
    redoStack.push(points[points.length - 1]);
    // Remove the last line from the points array
    points.length = points.length - 1;

  canvas.dispatchEvent(new Event("drawing-changed"));
});
app.append(undoButton);

// Create a redo stack
const redoStack: { x: number, y: number }[][] = [];

// Add a redo button
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.addEventListener("click", () => {
    // If there are no lines to redo, return
    if (redoStack.length === 0) {
        return;
    }
    // Add line from redo stack to points array
    points.push(redoStack[redoStack.length - 1]);
    // Remove line from redo stack
    redoStack.length = redoStack.length - 1;
    canvas.dispatchEvent(new Event("drawing-changed"));
    }
);
app.append(redoButton);
