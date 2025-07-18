let pdfDoc = null;
let currentPage = 1;
let canvas = document.getElementById('pdfCanvas');
let ctx = canvas.getContext('2d');
let draw = false;

document.getElementById('fileInput').addEventListener('change', handleFile);

async function handleFile(e) {
  const file = e.target.files[0];
  const arrayBuffer = await file.arrayBuffer();
  pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
  renderPage();
}

function renderPage() {
  // Placeholder: In real use case, pdf.js would render preview here
  canvas.width = 600;
  canvas.height = 800;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText("PDF Page " + currentPage, 50, 50);
}

function addText() {
  const text = prompt("Enter text:");
  if (text) {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(text, 100, 100);
  }
}

function addImage() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 150, 150, 100, 100);
    };
    img.src = URL.createObjectURL(file);
  };
  input.click();
}

function addSignature() {
  addText(); // For demo purposes use text as signature
}

function drawMode() {
  canvas.addEventListener('mousedown', () => draw = true);
  canvas.addEventListener('mouseup', () => draw = false);
  canvas.addEventListener('mousemove', (e) => {
    if (draw) {
      ctx.fillRect(e.offsetX, e.offsetY, 2, 2);
    }
  });
}

function addShape() {
  ctx.strokeStyle = "red";
  ctx.strokeRect(200, 200, 100, 50);
}

function insertLink() {
  const link = prompt("Enter URL:");
  if (link) {
    ctx.fillStyle = "blue";
    ctx.font = "16px Arial";
    ctx.fillText(link, 250, 250);
  }
}

function undo() {
  alert("Undo feature coming soon!");
}

function redo() {
  alert("Redo feature coming soon!");
}

function addPage() {
  currentPage++;
  renderPage();
}

function deletePage() {
  if (currentPage > 1) {
    currentPage--;
    renderPage();
  }
}

async function savePDF() {
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'edited.pdf';
  a.click();
}
