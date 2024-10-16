import "./style.css";

const APP_NAME = "Sketchpad App";
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

const canvas = addCanvas(256, 256);
const ctx = canvas.getContext("2d")!;
const lines: { x: number, y: number }[][] = []; // draw stack. Stores lines drawn by user.
const redoStack: { x: number, y: number }[][] = []; // added to via Undo. Stores lines undo'd by user.

let isDrawing = false;
// add event listeners
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  // push current point to the current line
  lines.push([{ x: e.offsetX, y: e.offsetY }]);
});
canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    lines[lines.length - 1].push({ x: e.offsetX, y: e.offsetY });
  }
});
canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  // trigger the drawing changed event
  canvas.dispatchEvent(new Event("drawing-changed"));
  // clear the redo stack
  redoStack.length = 0;
});

// add the drawing changed event
canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  // loop through each line in the lines array
    for (const line of lines) {
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
  // clear the array of lines too
    lines.length = 0;
    canvas.dispatchEvent(new Event("drawing-changed"));

});
app.append(clearButton);

// Add an undo button
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.addEventListener("click", () => {
    // If there are no lines to undo, return
    if (lines.length === 0) {
        return;
    }
    // Add the last line to the redo stack
    redoStack.push(lines[lines.length - 1]);
    // Remove the last line from the lines array
    lines.length = lines.length - 1;

  canvas.dispatchEvent(new Event("drawing-changed"));
});
app.append(undoButton);

// Add a redo button
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.addEventListener("click", () => {
    // If there are no lines to redo, return
    if (redoStack.length === 0) {
        return;
    }
    // Add line from redo stack to lines array
    lines.push(redoStack[redoStack.length - 1]);
    // Remove line from redo stack
    redoStack.length = redoStack.length - 1;
    canvas.dispatchEvent(new Event("drawing-changed"));
    }
);
app.append(redoButton);
