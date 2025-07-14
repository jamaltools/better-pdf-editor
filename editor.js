let pdfDoc = null, pageNum = 1, scale = 1.5, canvas = document.getElementById('pdfCanvas'), ctx = canvas.getContext('2d');
let textElements = [], signatures = [], images = [], shapes = [], drawings = [], undoStack = [], redoStack = [];

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

function renderPage(num) {
  pdfDoc.getPage(num).then(function(page) {
    let viewport = page.getViewport({ scale: scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    let renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    page.render(renderContext).promise.then(() => {
      renderElements();
    });
  });
}

function openPDF() {
  let input = document.getElementById('fileInput');
  input.onchange = function(e) {
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.onload = function() {
      let typedarray = new Uint8Array(this.result);
      pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
        pdfDoc = pdf;
        pageNum = 1;
        renderPage(pageNum);
      });
    };
    reader.readAsArrayBuffer(file);
  };
  input.click();
}

function renderElements() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pdfDoc.getPage(pageNum).then(function(page) {
    let viewport = page.getViewport({ scale: scale });
    let renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    page.render(renderContext).promise.then(() => {
      drawElements();
    });
  });
}

function drawElements() {
  textElements.forEach(e => {
    ctx.font = `${e.size}px ${e.font}`;
    ctx.fillStyle = e.color;
    ctx.fillText(e.text, e.x, e.y);
  });
  images.forEach(img => {
    let image = new Image();
    image.src = img.src;
    ctx.drawImage(image, img.x, img.y, img.width, img.height);
  });
  drawings.forEach(draw => {
    ctx.strokeStyle = draw.color;
    ctx.lineWidth = draw.size;
    ctx.beginPath();
    draw.path.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
  });
}

function addText() {
  let text = prompt("Enter text:");
  if (!text) return;
  let font = document.getElementById('fontSelect').value;
  let size = parseInt(document.getElementById('fontSize').value);
  let color = document.getElementById('colorPicker').value;
  textElements.push({ text, x: 50, y: 50, size, font, color });
  saveState();
  renderElements();
}

function addSignature() {
  let method = prompt("Type 'draw', 'upload', or 'type' for signature:");
  if (method === 'draw') {
    drawSignature();
  } else if (method === 'upload') {
    uploadSignature();
  } else if (method === 'type') {
    typeSignature();
  }
}

function drawSignature() {
  alert('Draw your signature directly on the canvas (simplified)');
}

function uploadSignature() {
  let input = document.getElementById('fileInput');
  input.onchange = function(e) {
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.onload = function() {
      images.push({ src: reader.result, x: 50, y: 100, width: 150, height: 50 });
      saveState();
      renderElements();
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function typeSignature() {
  let text = prompt("Type your signature:");
  if (!text) return;
  textElements.push({ text, x: 50, y: 100, size: 24, font: 'Pacifico', color: '#000' });
  saveState();
  renderElements();
}

function insertImage() {
  let input = document.getElementById('fileInput');
  input.onchange = function(e) {
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.onload = function() {
      images.push({ src: reader.result, x: 100, y: 150, width: 200, height: 100 });
      saveState();
      renderElements();
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function drawMode() {
  let isDrawing = false;
  let path = [];
  canvas.onmousedown = e => {
    isDrawing = true;
    path = [{ x: e.offsetX, y: e.offsetY }];
  };
  canvas.onmousemove = e => {
    if (isDrawing) {
      path.push({ x: e.offsetX, y: e.offsetY });
      drawings.push({ color: document.getElementById('colorPicker').value, size: 2, path });
      renderElements();
    }
  };
  canvas.onmouseup = e => {
    isDrawing = false;
    saveState();
  };
}

function addShape() {
  shapes.push({ type: 'rect', x: 150, y: 150, width: 100, height: 50, color: '#000' });
  saveState();
  renderElements();
}

function undo() {
  if (undoStack.length > 0) {
    let state = undoStack.pop();
    redoStack.push(cloneState());
    restoreState(state);
    renderElements();
  }
}

function redo() {
  if (redoStack.length > 0) {
    let state = redoStack.pop();
    undoStack.push(cloneState());
    restoreState(state);
    renderElements();
  }
}

function saveState() {
  undoStack.push(cloneState());
}

function cloneState() {
  return {
    textElements: JSON.parse(JSON.stringify(textElements)),
    images: JSON.parse(JSON.stringify(images)),
    drawings: JSON.parse(JSON.stringify(drawings)),
    shapes: JSON.parse(JSON.stringify(shapes))
  };
}

function restoreState(state) {
  textElements = state.textElements;
  images = state.images;
  drawings = state.drawings;
  shapes = state.shapes;
}

function addPage() {
  pageNum++;
  if (pageNum > pdfDoc.numPages) pageNum = pdfDoc.numPages;
  renderPage(pageNum);
}

function deletePage() {
  alert("Delete Page is visual only (PDF page removal needs server).");
}

function createBlankPDF() {
  const { PDFDocument } = PDFLib;
  PDFDocument.create().then(doc => {
    doc.addPage([595, 842]); // A4 size
    doc.save().then(data => {
      let blob = new Blob([data], { type: 'application/pdf' });
      let url = URL.createObjectURL(blob);
      pdfjsLib.getDocument(url).promise.then(function(pdf) {
        pdfDoc = pdf;
        pageNum = 1;
        renderPage(pageNum);
      });
    });
  });
}

function downloadPDF() {
  alert("Download is for images + canvas elements only. For full PDF saving, backend is needed. This exports annotations.");
}
