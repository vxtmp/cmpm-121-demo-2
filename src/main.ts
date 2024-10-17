import "./style.css";

const APP_NAME = "Sketchpad App";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

// add an app title in a h1 element
const title = document.createElement("h1");
title.textContent = APP_NAME;

app.append (title);

// define a typescript interface for an object known as a point that has an x and y property
interface Point {
  x: number;
  y: number;
}
// define a typescript interface for an object known as a line that has an array of points
interface Line {
  points: Point[];
  // give it a display function that will take a canvas rendering context and draw the line
  display(ctx: CanvasRenderingContext2D, pointArray: Point[]): void;
  drag(x: number, y:number, pointArray: Point[]): void;
}
// define a line display function in a const display = function (ctx: CanvasRenderingContext2D 
const fnLineDisplay = function (ctx: CanvasRenderingContext2D, pointArray: Point[]) {
  ctx.beginPath();
  ctx.moveTo(pointArray[0].x, pointArray[0].y);
  for (const point of pointArray) {
    ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();
};

const fnLineDrag = function (x: number, y: number, pointArray: Point[]){
    // push the x y coord to the point array
    pointArray.push({x, y});

}


function addCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  app.append(canvas);
  return canvas;
}

const canvas = addCanvas(256, 256)!;
const ctx = canvas.getContext("2d")!;
const lines: Line[] = [];   // draw stack. stores lines drawn by the user.
const redoStack: Line[] = []; // added to via Undo. Stores lines undo'd by user.
let isDrawing = false;

// add event listeners
canvas.addEventListener("mousedown", (e) => {   // when mouse is pressed down
  isDrawing = true;                             // begins new line.
//   lines.push([{ x: e.offsetX, y: e.offsetY }]);  // push new line with point at current mousePos (e)
    const newLine = { points: [{ x: e.offsetX, y: e.offsetY }], display: fnLineDisplay, drag: fnLineDrag};
    // push the newline
    lines.push(newLine);
    redoStack.length = 0;                          // clear the redo stack
    canvas.dispatchEvent(new Event("drawing-changed")); // trigger the drawing changed event

});
canvas.addEventListener("mousemove", (e) => {   // when mouse moves
  if (isDrawing) {                              // if drawing,
    // push current point to the points array in the current line
    lines[lines.length - 1].drag(e.offsetX, e.offsetY, lines[lines.length - 1].points);
    canvas.dispatchEvent(new Event("drawing-changed"));  // trigger the drawing changed event
  }
  
});
canvas.addEventListener("mouseup", () => {             // when mouse is released
  isDrawing = false;                                   // stop drawing
  redoStack.length = 0;                                // clear the redo stack
});

// add the drawing changed event
canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  // loop through each line in the lines array
    for (const line of lines) {
        ctx.moveTo(line.points[0].x, line.points[0].y); // move to the first point in the line
        for (const point of line.points) {              // loop through each point in the line
            ctx.lineTo(point.x, point.y);        // draw a line to the next point
        }
    }
  ctx.stroke();
});

// Add a button to clear the canvas
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lines.length = 0;                                       // clear the array of lines too
    canvas.dispatchEvent(new Event("drawing-changed"));
});
app.append(clearButton);

// Add an undo button
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.addEventListener("click", () => {            // When undo button clicked
    if (lines.length === 0) {                           // If there are no lines to undo, return
        return;
    }
    redoStack.push(lines[lines.length - 1]);            // Add the last line to the redo stack
    lines.length = lines.length - 1;                    // Remove the last line from the lines array
  canvas.dispatchEvent(new Event("drawing-changed"));
});
app.append(undoButton);                                 // Add undo button to app

// Add a redo button
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.addEventListener("click", () => {            // When redo button clicked
    if (redoStack.length === 0) {                       // if stack empty, return.
        return;
    }
    lines.push(redoStack[redoStack.length - 1]);        // Add line from redo stack to lines array
    redoStack.length = redoStack.length - 1;            // Remove line from redo stack
    canvas.dispatchEvent(new Event("drawing-changed")); // trigger drawing changed event.
    }
);
app.append(redoButton);                                 // Add redo button to app
