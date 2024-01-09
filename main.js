// Text and images are added to content
const content = document.getElementById("content");
const maxWidth = content.offsetWidth;

const drawBtn = document.getElementById("draw_button");
const textBtn = document.getElementById("text_button");

const saveBtn = document.getElementById("save_button");
const insertBtn = document.getElementById("insert_button");
const insertDialog = document.getElementById("insert_dialog");

const submitBtn = document.getElementById("submit_button");
const clearBtn = document.getElementById("clear_button");

// Configure the persistent canvas
const canvasContainer = document.getElementById("canvas_container");
const backdrop = document.getElementById("canvas_backdrop");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = maxWidth * 1.3;
canvas.height = 200 * 1.3; // 200 is height of .drawing
ctx.strokeStyle = "black";
ctx.lineWidth = 5;
ctx.lineJoin = "round";
ctx.lineCap = "round";

let rAF;
let points = [];
let activePointerId = null;

let currentImage;
let hoveredElement;

canvas.addEventListener("pointerdown", startDrawing);
canvas.addEventListener("pointerup", stopDrawing);
canvas.addEventListener("pointerout", stopDrawing);

clearBtn.addEventListener("click", () => ctx.clearRect(0, 0, canvas.width, canvas.height));
submitBtn.addEventListener("click", () => {
  canvas.toBlob((blob) => currentImage.src = URL.createObjectURL(blob));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  toggleCanvas();
});

// Other buttons
drawBtn.addEventListener("click", () => content.appendChild(createDrawField()));
textBtn.addEventListener("click", () => content.appendChild(createTextField()));
insertBtn.addEventListener("click", () => insertDialog.showModal());
insertDialog.addEventListener("close", () => {
  if (insertDialog.returnValue === "Draw") {
    hoveredElement.insertAdjacentElement("afterend", createDrawField());
  } else if (insertDialog.returnValue === "Text") {
    hoveredElement.insertAdjacentElement("afterend", createTextField());
  }
});
saveBtn.addEventListener("click", () => {
  const title = document.getElementById("title_input").value;

  let printWindow = window.open("", "SAVE", "height=400,width=800");
  printWindow.document.write("<html><head><title>Note</title>");
  printWindow.document.write('<link rel="stylesheet" href="main.css" />');
  printWindow.document.write("</head><body >");
  printWindow.document.write("<h1>" + title + "</h1>");
  for (const c of content.children) {
    if (c.nodeName == "IMG") {
      printWindow.document.write(c.outerHTML);
    } else {
      printWindow.document.write("<p>" + c.children[0].value + "</p>");
    }
  }
  printWindow.document.write("</body></html>");
  printWindow.document.close();
  printWindow.print();
});

// Canvas
function startDrawing(event) {
  if (activePointerId || !event.isPrimary) {
  	return;
  }
  activePointerId = event.pointerId;
  console.log(activePointerId);
  points.push([event.offsetX, event.offsetY]);
  canvas.addEventListener("pointermove", savePoints);
  rAF = requestAnimationFrame(drawPoints);
}

function savePoints(event) {
  if (event.pointerId === activePointerId) {
    event.preventDefault();
    points.push([event.offsetX, event.offsetY]);
  }
}

function drawPoints() {
  ctx.beginPath();
  points.forEach(point => {
    ctx.lineTo(point[0], point[1]);
    ctx.moveTo(point[0], point[1]);
  });
  ctx.closePath();
  ctx.stroke();

  if (rAF) {
    rAF = requestAnimationFrame(drawPoints);
  }
}

function stopDrawing(event) {
  activePointerId = null;
  canvas.removeEventListener("pointermove", savePoints);
  cancelAnimationFrame(rAF);
  rAF = null;
  drawPoints();
  points = [];
}

function toggleCanvas() {
  canvasContainer.classList.toggle("hidden");
  backdrop.classList.toggle("hidden");
}

// TODO: Convert this into pointer events, or change the UX
function addFloatButtonListeners(element) {
  element.addEventListener("mouseenter", (e) => {
    hoveredElement = e.target;
    let rect = e.target.getBoundingClientRect();
    insertBtn.style.top = rect.top + window.scrollY + "px";
    insertBtn.style.left = rect.right + window.scrollX + "px";
    insertBtn.classList.toggle("hidden");
  });
  element.addEventListener("mouseleave", () => insertBtn.classList.toggle("hidden"));
}

function createTextField() {
  const textarea = document.createElement("textarea");
  textarea.name = "text";
  textarea.addEventListener("input", (e) => {
    e.target.parentNode.dataset.replicatedValue = e.target.value;
  });

  const div = document.createElement("div");
  div.classList.add("text_field");
  div.appendChild(textarea);
  addFloatButtonListeners(div);
  return div;
}

function createDrawField() {
  const img = document.createElement("img");
  img.className = "draw_field";
  img.addEventListener("click", () => {
    currentImage = img;
    ctx.drawImage(currentImage, 0, 0);
    toggleCanvas();
  });
  addFloatButtonListeners(img);
  return img;
}
