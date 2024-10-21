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

// // DrawCommand (mouseDown)
// class DrawCommand implements Command {
//     private x: number;
//     private y: number;
  
//     constructor(x: number, y: number) {
//       this.x = x;
//       this.y = y;
//     }
  
//     execute() {
//       // create a new drawable.

//     }
  
//     // undo() {

//     // }
// }

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
        // stamp the stamp offset by half the size
        ctx.fillText(this.stampString, currMouseX - this.size / 2
            , currMouseY + this.size / 2);
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
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (const drawThing of this.history) {
            drawThing.draw(ctx);
        }
        if (currToolPreview && isDrawing == false){
            currToolPreview.execute();
        }
    }
}

class Line implements Drawable {
  points: Point[] = [];
  lineWidth: number;
  opacity: number = 1;

  constructor (lineWidth: number, opacity: number){
    this.lineWidth = lineWidth;
    this.opacity = opacity;
  }

  drag(x: number, y:number){
    this.points.push ({x, y});
  }

  draw(ctx: CanvasRenderingContext2D){
    ctx.lineWidth = this.lineWidth;
    // set the opacity for just this line
    ctx.globalAlpha = this.opacity;
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
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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
        // draw the string of the stamp using filltext at the position offset by half the size
        ctx.font = `${this.sizeScalar}px Arial`;
        ctx.fillText(this.stampString, this.position.x - this.sizeScalar / 2, this.position.y + this.sizeScalar / 2);
        // ctx.fillText(this.stampString, this.position.x, this.position.y);
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
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const SAVE_SCALE = 2;
const canvas = addCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)!;
const ctx = canvas.getContext("2d")!;
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);
let currentLineWidth = 1;
let currentOpacity = 1;
let currDrawableBuffer: Drawable = new Line(currentLineWidth, currentOpacity);
let currTool: { type: string, size: number, symbol?: string } | null = null;
let currToolPreview: Command | null = null;
let isDrawing = false;
let currMouseX = 0;
let currMouseY = 0;
const drawManager = new DrawableManager();
const INITIAL_STICKERS: string[] = ["🤪", "😎", "🤣"];
const stampsArray: string[] = [...INITIAL_STICKERS];

// CANVAS EVENT LISTENERS
canvas.addEventListener("tool-moved", (e) => {
    drawManager.redraw(ctx);
});
canvas.addEventListener("mousedown", (e) => {   // when mouse is pressed down
    isDrawing = true;                             // begins new line.
    // drawManager.addDrawable(currDrawableBuffer);      // add the line to the draw stack
    // add the line to the draw stack
    // currDrawableBuffer = new Line(currentLineWidth);
    // create new drawable depending on currTool and set currDrawableBuffer equal to it
    if (currTool) {
        if (currTool.type === "line") {
            currDrawableBuffer = new Line(currentLineWidth, currentOpacity);
        } else if (currTool.type === "stamp") {
            currDrawableBuffer = new Stamp(currTool.size, currTool.symbol!, {x: currMouseX, y: currMouseY});
        }
    }
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

function createButtonWithText(text: string, onClick: () => void) {
  const button = document.createElement("button");
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}

// CLEAR BUTTON
const clearButton = createButtonWithText("Clear", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawManager.addDrawable(new Clear());
    canvas.dispatchEvent(new Event("drawing-changed"));
});

// UNDO BUTTON
const undoButton = createButtonWithText("Undo", () => {            // When undo button clicked
    drawManager.undo();
    canvas.dispatchEvent(new Event("drawing-changed"));
});
// let's make ctrl z trigger undo as well
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "z") {
        drawManager.undo();
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
});


// REDO BUTTON
const redoButton = createButtonWithText("Redo", () => {            // When redo button clicked
    drawManager.redo();
    canvas.dispatchEvent(new Event("drawing-changed"));
});
// let's make ctrl y trigger redo as well
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "y") {
        drawManager.redo();
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
});

const fnSetSize = function (size: number) {               // function to thicken the marker
    currentLineWidth = size;                              // set the line width to 5
}

// THIN MARKER BUTTON
app.append(document.createElement("br"));
const thinMarkerButton = createButtonWithText("Marker", () => {
    // fnSetSize(1);
    currTool = { type: "line", size: currentLineWidth };
    currToolPreview = new PreviewLineCommand(currentLineWidth); // abstract execute() in redraw
});

// create a slider to change the size of the marker
const markerSizeSlider = document.createElement("input");
markerSizeSlider.type = "range";
markerSizeSlider.min = "1";
markerSizeSlider.max = "50";
markerSizeSlider.value = "1";
markerSizeSlider.step = "1";
markerSizeSlider.addEventListener("input", () => {
    fnSetSize(parseInt(markerSizeSlider.value));
    currTool = { type: "line", size: currentLineWidth };
    currToolPreview = new PreviewLineCommand(currentLineWidth);
});

// create a slider to change the opacity of the marker
const markerOpacitySlider = document.createElement("input");
markerOpacitySlider.type = "range";
markerOpacitySlider.min = "0";
markerOpacitySlider.max = "1";
markerOpacitySlider.value = "1";
markerOpacitySlider.step = "0.1";
markerOpacitySlider.addEventListener("input", () => {
    // ctx.globalAlpha = parseFloat(markerOpacitySlider.value);
    currentOpacity = parseFloat(markerOpacitySlider.value);
});

// Function to create an emoji stamp button.
function createEmojiStampButton(emoji: string){
    const emojiStampButton = createButtonWithText(emoji, () => {
        currTool = { type: "stamp", size: 50, symbol: emoji };
        currToolPreview = new PreviewStampCommand(50, 0, emoji);
    });
    return emojiStampButton;
}

// append buttons to the app
app.append(document.createElement("br"));
app.append(clearButton);
app.append(undoButton);             
app.append(redoButton);        

// create an export button that creates an upscaled canvas temporarily
const exportButton = createButtonWithText("Export", () => {
    const exportCanvas = addCanvas(CANVAS_WIDTH * SAVE_SCALE, CANVAS_HEIGHT * SAVE_SCALE);
    const exportCtx = exportCanvas.getContext("2d")!;
    exportCtx.scale(SAVE_SCALE, SAVE_SCALE);
    exportCtx.fillStyle = "white";
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    drawManager.redraw(exportCtx);
    const dataUrl = exportCanvas.toDataURL();
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "sketch.png";
    a.click();
    exportCanvas.remove();
});
app.append(exportButton);          

app.append(document.createElement("br")); 
app.append(thinMarkerButton);
// add a label for size slider
app.append(document.createElement("br"));
app.append(document.createTextNode("Marker Size:"));
app.append(markerSizeSlider);
app.append(document.createElement("br"));
// add a label for opacity slider
app.append(document.createTextNode("Marker Opacity:"));
app.append(markerOpacitySlider);


app.append(document.createElement("br"));
// add the stamp create button
const createCustomStampButton = createButtonWithText("Create Stamp", () => {
    const customStamp = prompt("Enter a custom stamp:");
    if (customStamp) {
        stampsArray.push(customStamp);
        app.append(createEmojiStampButton(customStamp));
    }
});
app.append(createCustomStampButton);


app.append(document.createElement("br"));
stampsArray.forEach((emoji) => {
    app.append(createEmojiStampButton(emoji));
  }
);

fnSetSize(1);
currTool = { type: "line", size: currentLineWidth };
currToolPreview = new PreviewLineCommand(currentLineWidth);