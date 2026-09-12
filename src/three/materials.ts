import * as THREE from 'three';

// Create procedural subtle noise texture for baked enamel micro-roughness
function createEnamelNoiseTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const imgData = ctx.createImageData(size, size);
    for (let i = 0; i < imgData.data.length; i += 4) {
      // Extremely subtle grain for vintage baked enamel paint on magnesium
      const val = 128 + (Math.random() - 0.5) * 14;
      imgData.data[i] = val;
      imgData.data[i + 1] = val;
      imgData.data[i + 2] = val;
      imgData.data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

// Create wood table texture
function createWoodTexture(): THREE.CanvasTexture {
  const width = 512;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Warm blonde/natural oak base
    ctx.fillStyle = '#c7a77b';
    ctx.fillRect(0, 0, width, height);

    // Grain lines
    for (let y = 0; y < height; y++) {
      const noise = Math.sin(y * 0.08) * 4 + Math.sin(y * 0.02) * 12 + (Math.random() - 0.5) * 2;
      const alpha = 0.04 + Math.random() * 0.08;
      ctx.fillStyle = `rgba(145, 108, 68, ${alpha})`;
      ctx.fillRect(0, y, width, 1.5 + noise * 0.2);
    }

    // Soft plank separations
    ctx.fillStyle = 'rgba(90, 60, 35, 0.15)';
    ctx.fillRect(0, 170, width, 2);
    ctx.fillRect(0, 340, width, 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

export function createTypewriterMaterials() {
  const enamelBump = createEnamelNoiseTexture();
  const woodTexture = createWoodTexture();

  // Signature Olivetti Lettera 32 Muted Teal Enamel
  const bodyTeal = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x275951), // Desaturated vintage teal-green
    roughness: 0.74,
    metalness: 0.12,
    bumpMap: enamelBump,
    bumpScale: 0.0018,
  });

  // Dark cast base under-tray & perimeter lip
  const chassisBase = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x202425),
    roughness: 0.85,
    metalness: 0.2,
  });

  // Very dark, matte recessed keyboard cavity
  const keyboardBed = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x162220),
    roughness: 0.94,
    metalness: 0.04,
  });

  // Keycap - Dark Charcoal Bakelite/Matte Plastic
  const keycapDark = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x232628),
    roughness: 0.78,
    metalness: 0.08,
  });

  // Keycap - Vintage Sage/Cream for special keys (Tab, Lock, Return, Shift)
  const keycapSage = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xb2bcab),
    roughness: 0.76,
    metalness: 0.06,
  });

  // Key Chrome/Nickel Rims
  const keyRim = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xdce0e2),
    roughness: 0.26,
    metalness: 0.88,
  });

  // Steel Mechanical Components (Typebars, Segment, Spool bracket)
  const steelMechanics = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xa6abae),
    roughness: 0.36,
    metalness: 0.88,
  });

  // Matte Black Rubber Platen Roller
  const rubberPlaten = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x18191b),
    roughness: 0.88,
    metalness: 0.03,
  });

  // Brushed Aluminum Badge Plate
  const brushedAluminum = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xd5dadb),
    roughness: 0.38,
    metalness: 0.75,
  });

  // Chrome Carriage Return Lever & Platen Hardware
  const chromeLever = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xe4e7eb),
    roughness: 0.20,
    metalness: 0.92,
  });

  // Ribbon Black/Red
  const ribbonBlack = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x111111),
    roughness: 0.9,
    metalness: 0.0,
  });
  const ribbonRed = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x9a2222),
    roughness: 0.9,
    metalness: 0.0,
  });

  // Rough off-white paper
  const paperBase = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xfcfaf2),
    roughness: 0.94,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });

  // Wood tabletop
  const woodTable = new THREE.MeshStandardMaterial({
    map: woodTexture,
    roughness: 0.82,
    metalness: 0.05,
  });

  return {
    bodyTeal,
    chassisBase,
    keyboardBed,
    keycapDark,
    keycapSage,
    keyRim,
    steelMechanics,
    rubberPlaten,
    brushedAluminum,
    chromeLever,
    ribbonBlack,
    ribbonRed,
    paperBase,
    woodTable,
  };
}
