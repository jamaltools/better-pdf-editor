// Better PDF Editor - app.js
let pdfDoc = null;
let currentPage = 1;
let scale = 1.5;
let canvas = document.getElementById('pdf-canvas');
let ctx = canvas.getContext('2d');
let pdfPreview = document.getElementById('pdf-preview');

const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const blankPdfBtn = document.getElementById('blankPdfBtn');
const saveBtn = document.getElementById('saveBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
let history = [];
let redoStack = [];

const toolButtons = document.querySelectorAll('.tool-btn');
let activeTool = null;

toolButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    activeTool = btn.getAttribute('data-tool');
    toolButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Load PDF File
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFile);

function handleFile(e) {
  const file = e.target.files[0];
  if (file.type !== 'application/pdf') {
    alert('Please upload a valid PDF file.');
    return;
  }
  const fileReader = new FileReader();
  fileReader.onload = function() {
    const typedarray = new Uint8Array(this.result);
    pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
      pdfDoc = pdf;
      currentPage = 1;
      renderAllPages();
    });
  };
  fileReader.readAsArrayBuffer(file);
}

// Blank PDF
blankPdfBtn.addEventListener('click', () => {
  const pdfDocGenerator = PDFLib.PDFDocument.create();
  pdfDocGenerator.addPage([595, 842]);
  PDFLib.PDFDocumentWriter.saveToBytes(pdfDocGenerator).then(bytes => {
    pdfjsLib.getDocument({ data: bytes }).promise.then(function(pdf) {
      pdfDoc = pdf;
      currentPage = 1;
      renderAllPages();
    });
  });
});

function renderAllPages() {
  pdfPreview.innerHTML = '';
  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    pdfDoc.getPage(pageNum).then(function(page) {
      const viewport = page.getViewport({ scale: 0.8 });
      const canvasPage = document.createElement('canvas');
      const ctxPage = canvasPage.getContext('2d');
      canvasPage.height = viewport.height;
      canvasPage.width = viewport.width;
      page.render({ canvasContext: ctxPage, viewport: viewport });
      canvasPage.addEventListener('click', () => {
        currentPage = pageNum;
        renderPage();
      });
      pdfPreview.appendChild(canvasPage);
    });
  }
}

function renderPage() {
  pdfDoc.getPage(currentPage).then(function(page) {
    const viewport = page.getViewport({ scale: scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    page.render({ canvasContext: ctx, viewport: viewport });
  });
}
// Save History (for Undo/Redo)
function saveHistory() {
  const image = canvas.toDataURL();
  history.push(image);
  if (history.length > 20) history.shift(); // Limit history size
  redoStack = [];
}

undoBtn.addEventListener('click', () => {
  if (history.length > 1) {
    redoStack.push(history.pop());
    let img = new Image();
    img.src = history[history.length - 1];
    img.onload = () => ctx.drawImage(img, 0, 0);
  }
});

redoBtn.addEventListener('click', () => {
  if (redoStack.length > 0) {
    let img = new Image();
    let redoImage = redoStack.pop();
    img.src = redoImage;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      history.push(redoImage);
    };
  }
});

// Canvas Mouse Events
let isDrawing = false;
let startX, startY;

canvas.addEventListener('mousedown', e => {
  if (activeTool === 'draw' || activeTool === 'shape' || activeTool === 'whiteout') {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    saveHistory();
  } else if (activeTool === 'text') {
    const text = prompt('Enter text:');
    if (text) {
      ctx.font = "20px Patrick Hand";
      ctx.fillStyle = "#000";
      ctx.fillText(text, e.offsetX, e.offsetY);
      saveHistory();
    }
  } else if (activeTool === 'sign') {
    const sign = prompt('Type your signature:');
    if (sign) {
      ctx.font = "24px Patrick Hand";
      ctx.fillStyle = "#000";
      ctx.fillText(sign, e.offsetX, e.offsetY);
      saveHistory();
    }
  } else if (activeTool === 'image') {
    let imgInput = document.createElement('input');
    imgInput.type = 'file';
    imgInput.accept = 'image/*';
    imgInput.onchange = function(event) {
      let imgFile = event.target.files[0];
      let reader = new FileReader();
      reader.onload = function(e) {
        let img = new Image();
        img.onload = function() {
          ctx.drawImage(img, e.offsetX, e.offsetY, 100, 100);
          saveHistory();
        }
        img.src = e.target.result;
      }
      reader.readAsDataURL(imgFile);
    }
    imgInput.click();
  }
});

canvas.addEventListener('mousemove', e => {
  if (!isDrawing) return;
  if (activeTool === 'draw') {
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  }
});

canvas.addEventListener('mouseup', e => {
  if (isDrawing) {
    isDrawing = false;
    if (activeTool === 'shape') {
      const rect = canvas.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;
      ctx.strokeStyle = "#000";
      ctx.strokeRect(startX, startY, endX - startX, endY - startY);
    }
    if (activeTool === 'whiteout') {
      const rect = canvas.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;
      ctx.fillStyle = "#fff";
      ctx.fillRect(startX, startY, endX - startX, endY - startY);
    }
    ctx.beginPath();
    saveHistory();
  }
});
// Link Tool
function addLink(url, x, y) {
  ctx.font = "16px Roboto";
  ctx.fillStyle = "#0000EE";
  ctx.fillText(url, x, y);
  ctx.beginPath();
  ctx.moveTo(x, y + 2);
  ctx.lineTo(x + ctx.measureText(url).width, y + 2);
  ctx.strokeStyle = "#0000EE";
  ctx.stroke();
  saveHistory();
}

canvas.addEventListener('dblclick', e => {
  if (activeTool === 'link') {
    const link = prompt("Enter URL / Email / Phone:");
    if (link) {
      addLink(link, e.offsetX, e.offsetY);
    }
  } else if (activeTool === 'annotate') {
    const annotation = prompt("Annotation: highlight / underline / strikeout");
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 2;
    if (annotation === 'highlight') {
      ctx.fillStyle = "rgba(255,255,0,0.5)";
      ctx.fillRect(e.offsetX, e.offsetY - 12, 100, 16);
    } else if (annotation === 'underline') {
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
      ctx.lineTo(e.offsetX + 100, e.offsetY);
      ctx.stroke();
    } else if (annotation === 'strikeout') {
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY - 8);
      ctx.lineTo(e.offsetX + 100, e.offsetY + 8);
      ctx.stroke();
    }
    saveHistory();
  } else if (activeTool === 'findreplace') {
    const findText = prompt("Find text:");
    const replaceText = prompt("Replace with:");
    // Simple canvas workaround (in real PDF text layer, this would be smarter)
    alert(`Find/Replace is not live-search. Use whiteout + text tool manually.`);
  }
});

// Save PDF
saveBtn.addEventListener('click', () => {
  canvas.toBlob(blob => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'edited.pdf';
    link.click();
  }, 'application/pdf');
});
