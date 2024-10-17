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

interface Drawable {
    drag(x: number, y: number): void;
    display(ctx: CanvasRenderingContext2D): void;
}

interface Command {
    execute(): void;
    undo(): void;
}

// define a typescript interface for an object known as a line that has an array of points
class Line implements Drawable {
  points: Point[] = [];
  lineWidth: number;

  constructor (lineWidth: number){
    this.lineWidth = lineWidth;
  }

  drag(x: number, y:number){
    this.points.push ({x, y});
  }
  // give it a display function that will take a canvas rendering context and draw the line
  display(ctx: CanvasRenderingContext2D){
    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();
    if (this.points.length > 0) {
      ctx.moveTo(this.points[0].x, this.points[0].y);
      for (const point of this.points) {
        ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();
    }
  }
}

class Stamp implements Drawable {
    position: Point;
    sizeScalar: number;
    stampString: string;
    
    constructor(sizeScalar: number, stampString: string, position: Point) {
        this.sizeScalar = sizeScalar;
        this.stampString = stampString;
        this.position = position;
    }

    display(ctx: CanvasRenderingContext2D) {
        // draw the string of the stamp using filltext at the position
        ctx.fillText(this.stampString, this.position.x, this.position.y);
    }
    drag(x: number, y: number) {
        this.position = {x, y};
    }
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

function redraw(ctx: CanvasRenderingContext2D, lines: Line[]) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // loop through each line in the lines array
    for (const line of lines) {
        ctx.lineWidth = line.lineWidth;                  // set the line width
        ctx.beginPath();
        ctx.moveTo(line.points[0].x, line.points[0].y); // move to the first point in the line
        for (const point of line.points) {              // loop through each point in the line
            ctx.lineTo(point.x, point.y);        // draw a line to the next point
        }
        ctx.stroke();
    }
    // draw a circle at the mouse with a radius of currentLineWidth and a stroke width of 1 and no fill
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc (currMouseX, currMouseY, currentLineWidth, 0, Math.PI * 2);
    ctx.stroke();
}


function addCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  app.append(canvas);
  return canvas;
}

// globals.
const canvas = addCanvas(256, 256)!;
const ctx = canvas.getContext("2d")!;
let currentLineWidth = 1;
const lines: Line[] = [];   // draw stack. stores lines drawn by the user.
const redoStack: Line[] = []; // added to via Undo. Stores lines undo'd by user.
let isDrawing = false;
let currMouseX = 0;
let currMouseY = 0;

// CANVAS EVENT LISTENERS
canvas.addEventListener("tool-moved", (e) => {
    redraw(ctx, lines);
});
canvas.addEventListener("mousedown", (e) => {   // when mouse is pressed down
    isDrawing = true;                             // begins new line.
    // const newLine = { points: [{ x: e.offsetX, y: e.offsetY }], lineWidth: currentLineWidth, display: fnLineDisplay, drag: fnLineDrag};
    const newLine = new Line(currentLineWidth);
    // push the newline
    lines.push(newLine);
    redoStack.length = 0;                          // clear the redo stack
    canvas.dispatchEvent(new Event("drawing-changed")); // trigger the drawing changed event
});
canvas.addEventListener("mousemove", (e) => {   // when mouse moves
  currMouseX = e.offsetX;
  currMouseY = e.offsetY;
  canvas.dispatchEvent(new Event("tool-moved"));
  if (isDrawing) {                              // if drawing,
    // push current point to the points array in the current line
    lines[lines.length - 1].drag(e.offsetX, e.offsetY);
    canvas.dispatchEvent(new Event("drawing-changed"));  // trigger the drawing changed event
  }
});
canvas.addEventListener("mouseup", () => {             // when mouse is released
  isDrawing = false;                                   // stop drawing
  redoStack.length = 0;                                // clear the redo stack
});
// add the drawing changed event
canvas.addEventListener("drawing-changed", () => {
    redraw(ctx, lines);
});

// CLEAR BUTTON
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lines.length = 0;                                       // clear the array of lines too
    canvas.dispatchEvent(new Event("drawing-changed"));
});
app.append(clearButton);

// UNDO BUTTON
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

// REDO BUTTON
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

const fnThickenMarker = function () {               // function to thicken the marker
    currentLineWidth = 5;                              // set the line width to 5
}
const fnThinMarker = function () {
    currentLineWidth = 1;                              // set the line width to 1
}

// THIN MARKER BUTTON
const thinMarkerButton = document.createElement("button");
thinMarkerButton.textContent = "Thin Marker";
thinMarkerButton.addEventListener("click", () => {
    fnThinMarker();
});
app.append(thinMarkerButton);

// THICK MARKER BUTTON
const thickMarkerButton = document.createElement("button");
thickMarkerButton.textContent = "Thick Marker";
thickMarkerButton.addEventListener("click", () => {
    fnThickenMarker();
});
app.append(thickMarkerButton);
