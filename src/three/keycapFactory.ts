import * as THREE from 'three';

// Cache generated canvas textures for performance
const keyTextureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Creates a circular keycap face texture with vintage typewriter typography
 */
export function createKeycapTexture(
  label: string,
  subLabel?: string,
  colorType: 'dark' | 'sage' = 'dark'
): THREE.CanvasTexture {
  const cacheKey = `${label}_${subLabel || ''}_${colorType}`;
  if (keyTextureCache.has(cacheKey)) {
    return keyTextureCache.get(cacheKey)!;
  }

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const center = size / 2;
    const radius = size / 2 - 2;

    // Background circle
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = colorType === 'sage' ? '#b6c0af' : '#222527';
    ctx.fill();

    // Subtle inner shadow / concave dish gradient
    const grad = ctx.createRadialGradient(center, center, radius * 0.2, center, center, radius);
    if (colorType === 'sage') {
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
      grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.0)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
    } else {
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.0)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    }
    ctx.fillStyle = grad;
    ctx.fill();

    // Typography
    const textColor = colorType === 'sage' ? '#1c211e' : '#f0f2f3';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (subLabel) {
      // Dual-character key (number + symbol or punctuation)
      ctx.font = 'bold 28px "Courier Prime", monospace';
      ctx.fillText(subLabel, center, center - 16);

      ctx.font = 'bold 30px "Courier Prime", monospace';
      ctx.fillText(label, center, center + 16);
    } else {
      // Single character or word
      if (label.length > 2) {
        // Special word keys like TAB, LOCK, BACK, RETURN
        ctx.font = 'bold 21px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(label, center, center);
      } else {
        ctx.font = 'bold 44px "Courier Prime", monospace';
        ctx.fillText(label, center, center + 1);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  keyTextureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates the brushed aluminum Olivetti badge plate texture
 */
export function createBadgeTexture(text: string): THREE.CanvasTexture {
  const width = 512;
  const height = 64;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Brushed aluminum plate base
    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, '#cbcfd2');
    grad.addColorStop(0.3, '#e5e9eb');
    grad.addColorStop(0.7, '#d8dcde');
    grad.addColorStop(1, '#c5c9cc');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle horizontal brushed lines
    for (let y = 0; y < height; y++) {
      const alpha = 0.04 + Math.random() * 0.06;
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.fillRect(0, y, width, 1);
    }

    // Outer thin bevel border
    ctx.strokeStyle = '#9ca2a5';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    // Text: STUDIO -- VIBE CODING 1.0 (or custom)
    ctx.fillStyle = '#1e2426';
    ctx.font = 'bold 22px "Courier Prime", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '5px';
    ctx.fillText(text.toUpperCase(), width / 2, height / 2 + 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
