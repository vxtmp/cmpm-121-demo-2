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
    // draw(x: number, y: number): void;
    // initialize a new drawable in the mousedown. call commands in mouseMove
    drag(x: number, y: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
}

interface Command {
    execute(): void;
    // undo(): void;
}

// DrawCommand (mouseDown)
class DrawCommand implements Command {
    private x: number;
    private y: number;
  
    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
  
    execute() {
      // create a new drawable.

    }
  
    // undo() {

    // }
}

// DragCommand (mouseDown + mouseMove)
class DragCommand implements Command {
    private drawable: Drawable;
    private x: number;
    private y: number;
  
    constructor(drawable: Drawable, x: number, y: number) {
      this.drawable = drawable;
      this.x = x;
      this.y = y;
    }
  
    execute() {
      this.drawable.drag(this.x, this.y);
    }
  
    // undo() {

    // }
}

class PreviewLineCommand implements Command{
    private r: number;

    constructor(r: number){
        this.r = r;
    }

    execute(){
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(currMouseX, currMouseY, this.r, 0, Math.PI * 2);
        ctx.stroke();
    }
}

class PreviewStampCommand implements Command{
    private size: number;
    private rotation: number;
    private stampString: string;

    constructor(size: number, rotation: number, stampString: string){
        this.size = size;
        this.rotation = rotation;
        this.stampString = stampString;
    }

    execute(){
        ctx.font = `${this.size}px Arial`;
        ctx.fillText(this.stampString, currMouseX, currMouseY);
    }
}

class DrawableManager {
    private history: Drawable[] = [];
    private redoStack: Drawable[] = [];
  
    addDrawable(drawable: Drawable) {
      this.history.push(drawable);
      this.redoStack.length = 0;
    }
  
    undo() {
      const undoThing = this.history.pop();
      if (undoThing) {
        this.redoStack.push(undoThing);
      }
    }
  
    redo() {
      const redoThing = this.redoStack.pop();
      if (redoThing) {
        this.history.push(redoThing);
      }
    }
    
    redraw(ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // loop through each drawable in history
        for (const drawThing of this.history) {
            drawThing.draw(ctx);
        }
        // create a preview event for the current drawable
        if (currToolPreview){
            currToolPreview.execute();
        }
    }
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
  draw(ctx: CanvasRenderingContext2D){
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

class Clear implements Drawable {
    draw(ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    drag(x: number, y: number) {
        // do nothing
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

    draw(ctx: CanvasRenderingContext2D) {
        // draw the string of the stamp using filltext at the position
        ctx.fillText(this.stampString, this.position.x, this.position.y);
    }
    drag(x: number, y: number) {
        this.position = {x, y};
    }
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
let currDrawableBuffer: Drawable = new Line(currentLineWidth);
let currToolPreview: Command | null = null;
let isDrawing = false;
let currMouseX = 0;
let currMouseY = 0;
const drawManager = new DrawableManager();

// CANVAS EVENT LISTENERS
canvas.addEventListener("tool-moved", (e) => {
    drawManager.redraw(ctx);
});
canvas.addEventListener("mousedown", (e) => {   // when mouse is pressed down
    isDrawing = true;                             // begins new line.
    // drawManager.addDrawable(currDrawableBuffer);      // add the line to the draw stack
    // add the line to the draw stack
    currDrawableBuffer = new Line(currentLineWidth);
    drawManager.addDrawable(currDrawableBuffer);
    canvas.dispatchEvent(new Event("drawing-changed")); // trigger the drawing changed event
});
canvas.addEventListener("mousemove", (e) => {   // when mouse moves
  currMouseX = e.offsetX;
  currMouseY = e.offsetY;
  canvas.dispatchEvent(new Event("tool-moved"));
  if (isDrawing) {                              // if drawing,
    // create a new command event to drag the line
    const command = new DragCommand(currDrawableBuffer, e.offsetX, e.offsetY);
    command.execute();
    // trigger drawing-changed which will create a display command
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});
canvas.addEventListener("mouseup", () => {             // when mouse is released
  isDrawing = false;                                   // stop drawing
});
// add the drawing changed event
canvas.addEventListener("drawing-changed", () => {
    drawManager.redraw(ctx);
});

// CLEAR BUTTON
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawManager.addDrawable(new Clear());
    canvas.dispatchEvent(new Event("drawing-changed"));
});

// UNDO BUTTON
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.addEventListener("click", () => {            // When undo button clicked
    drawManager.undo();
    canvas.dispatchEvent(new Event("drawing-changed"));
});


// REDO BUTTON
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.addEventListener("click", () => {            // When redo button clicked
    drawManager.redo();
    canvas.dispatchEvent(new Event("drawing-changed"));
});

const fnSetSize = function (size: number) {               // function to thicken the marker
    currentLineWidth = size;                              // set the line width to 5
}

// THIN MARKER BUTTON
const thinMarkerButton = document.createElement("button");
thinMarkerButton.textContent = "Thin Marker (size 1)";
thinMarkerButton.addEventListener("click", () => {
    console.log ("Thin marker clicked");
    fnSetSize(1);
    currDrawableBuffer = new Line(currentLineWidth)!;   // gets added to the history stack later.
    currToolPreview = new PreviewLineCommand(currentLineWidth); // abstract execute() in redraw
});

// THICK MARKER BUTTON
const thickMarkerButton = document.createElement("button");
thickMarkerButton.textContent = "Thick Marker (size 5)";
thickMarkerButton.addEventListener("click", () => {
    console.log ("Thick marker clicked");   
    fnSetSize(5);
    currDrawableBuffer = new Line(currentLineWidth)!; // gets added to history stack later
    currToolPreview = new PreviewLineCommand(currentLineWidth); // abstract execute() in redraw
});

// add the buttons to the app
app.append(clearButton);
app.append(undoButton);                                 // Add undo button to app
app.append(redoButton);                                 // Add redo button to app
app.append(thinMarkerButton);
app.append(thickMarkerButton);
