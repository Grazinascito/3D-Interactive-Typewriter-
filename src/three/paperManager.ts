import * as THREE from 'three';

export interface PaperController {
  mesh: THREE.Mesh;
  updateText: (lines: string[], cursorCol: number, isCarriageMoving: boolean) => void;
  advanceLine: (lineIndex: number) => void;
}

export const PAPER_CANVAS_SIZE = 1024;
export const PAPER_MARGIN_LEFT = 96;
export const PAPER_MARGIN_RIGHT = 96;
export const PAPER_MARGIN_TOP = 250;
export const PAPER_MARGIN_BOTTOM = 90;
export const PAPER_CHAR_WIDTH = 27;
export const PAPER_LINE_HEIGHT = 56;

export const PAPER_MAX_COLS = Math.floor(
  (PAPER_CANVAS_SIZE - PAPER_MARGIN_LEFT - PAPER_MARGIN_RIGHT) / PAPER_CHAR_WIDTH
);
export const PAPER_MAX_LINES = Math.floor(
  (PAPER_CANVAS_SIZE - PAPER_MARGIN_TOP - PAPER_MARGIN_BOTTOM) / PAPER_LINE_HEIGHT
);

/**
 * Creates the typed paper with authentic curved geometry and dynamic canvas texture
 */
export function createPaperAssembly(paperBaseMaterial: THREE.Material): PaperController {
  const canvasWidth = 1024;
  const canvasHeight = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  let lastLines: string[] = [''];
  let lastCursorCol = 0;

  // Draw base paper background
  function redrawCanvas(lines: string[], cursorCol: number) {
    if (!ctx) return;
    lastLines = lines;
    lastCursorCol = cursorCol;

    // Vintage off-white textured bond paper
    ctx.fillStyle = '#faf7ee';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Subtle paper edge margins and light watermarks
    ctx.fillStyle = 'rgba(0, 0, 0, 0.015)';
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * canvasWidth;
      const y = Math.random() * canvasHeight;
      const size = Math.random() * 2;
      ctx.fillRect(x, y, size, size);
    }

    const marginLeft = PAPER_MARGIN_LEFT;
    const marginRight = PAPER_MARGIN_RIGHT;
    const marginTop = PAPER_MARGIN_TOP;
    const lineHeight = PAPER_LINE_HEIGHT;
    const charWidth = PAPER_CHAR_WIDTH;
    const maxTextX = PAPER_CANVAS_SIZE - marginRight;

    ctx.font = '36px "Special Elite", serif';
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 0.9;
    ctx.lineJoin = 'round';
    ctx.textBaseline = 'alphabetic';

    lines.forEach((line, rowIdx) => {
      const y = marginTop + rowIdx * lineHeight;
      if (y > PAPER_CANVAS_SIZE - PAPER_MARGIN_BOTTOM) return;

      // Draw character by character for realistic vintage typewriter ink feel
      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        const x = marginLeft + c * charWidth;
        if (x + charWidth > maxTextX) break;

        // Extremely subtle micro-offset
        const xJitter = (Math.sin(rowIdx * 13 + c * 7) * 0.4);
        const yJitter = (Math.cos(rowIdx * 7 + c * 11) * 0.4);
        const px = x + xJitter;
        const py = y + yJitter;

        ctx.fillText(char, px, py);
        ctx.strokeText(char, px, py);
      }

      // Draw blinking cursor if on current active line
      if (rowIdx === lines.length - 1) {
        const cursorX = marginLeft + cursorCol * charWidth;
        if (cursorX + 6 <= maxTextX) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(cursorX + 2, y - 32, 3, 38);
        }
      }
    });
  }

  redrawCanvas([''], 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;

  void document.fonts.load('36px "Special Elite"').then(() => {
    redrawCanvas(lastLines, lastCursorCol);
    texture.needsUpdate = true;
  });

  // Custom material with typed texture
  const paperMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.95,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });

  // Create curved paper geometry that physically enters and wraps around the platen
  // Platen radius is ~0.13.
  const segmentsX = 32;
  const segmentsY = 64;
  const paperWidth = 2.45;
  const paperHeight = 2.8;

  const geom = new THREE.PlaneGeometry(paperWidth, paperHeight, segmentsX, segmentsY);
  const pos = geom.attributes.position;

  // Deform plane so the lower section curves around the platen roller (radius ~0.135)
  // and the upper section extends upwards and slightly tilted back at ~22 degrees
  for (let i = 0; i < pos.count; i++) {
    // Original y goes from -paperHeight/2 to +paperHeight/2
    const yOrig = pos.getY(i);
    const progress = (yOrig + paperHeight / 2) / paperHeight; // 0 (bottom) to 1 (top)

    if (progress < 0.25) {
      // Wrapped around under platen
      const angle = (0.25 - progress) * Math.PI * 1.35;
      const r = 0.145;
      pos.setY(i, -Math.sin(angle) * r);
      pos.setZ(i, -Math.cos(angle) * r);
    } else {
      // Extends up and gently angled backwards
      const upProgress = (progress - 0.25) / 0.75;
      const linearY = upProgress * 1.95;
      const tiltAngle = 0.32; // ~18 deg tilt backward
      pos.setY(i, 0.02 + linearY * Math.cos(tiltAngle));
      pos.setZ(i, -0.14 - linearY * Math.sin(tiltAngle));
    }
  }
  geom.computeVertexNormals();

  const paperMesh = new THREE.Mesh(geom, paperMaterial);
  paperMesh.castShadow = true;
  paperMesh.receiveShadow = true;

  return {
    mesh: paperMesh,
    updateText: (lines: string[], cursorCol: number) => {
      redrawCanvas(lines, cursorCol);
      texture.needsUpdate = true;
    },
    advanceLine: (lineIndex: number) => {
      // Roll paper upward slightly as lines advance
      paperMesh.position.y = Math.min(0.4, lineIndex * 0.045);
    },
  };
}
