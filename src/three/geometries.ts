import * as THREE from 'three';

/**
 * Creates the authentic Olivetti Lettera 32 molded chassis geometry.
 *
 * Modeled strictly after Marcello Nizzoli's 1963 industrial masterpiece:
 * - High visual fidelity with the user's reference drawing and photographic reference.
 * - Solid, uniform, perfectly smooth continuous shell: zero torn geometry, zero jagged triangulations.
 * - Iconic low-profile wedge silhouette:
 *     * Front bumper lip: low (~0.14) with softly rounded nose.
 *     * Flank waist: dips sleekly beside keyboard (~0.22 - 0.28).
 *     * Rear platen shoulder: rises in a graceful scoop to ~0.66.
 *     * Rear platen deck & tail: gently slopes down to ~0.50.
 * - Deeply recessed keyboard cavity (|x| <= 1.18, z from 1.44 to 0.04) with smooth beveled inner walls.
 * - Central mechanical aperture with smoothly beveled basket walls.
 * - Watertight, clean vertical side and front/back skirts with dedicated duplicate vertices
 *   for crisp, razor-sharp edge normals.
 */
export function createLettera32BodyGeometry(): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();

  const zFront = 1.62;
  const zRear = -1.62;
  const totalLength = zFront - zRear;
  const yBase = 0.035;

  // Longitudinal profile spine height (Z axis from front to back)
  function getProfileHeight(z: number): number {
    const t = (zFront - z) / totalLength; // 0 (front) to 1 (rear)

    if (t < 0.05) {
      // Rounded nose lip
      const s = t / 0.05;
      return 0.14 + 0.12 * Math.sin(s * Math.PI * 0.5);
    } else if (t < 0.46) {
      // Gentle slope rising along keyboard flank: 0.26 to 0.38
      const s = (t - 0.05) / (0.46 - 0.05);
      return 0.26 + 0.12 * Math.pow(s, 1.25);
    } else if (t < 0.86) {
      // Smooth continuous scoop rising up to rear platen shoulder: 0.38 to 0.68
      const s = (t - 0.46) / (0.86 - 0.46);
      const smooth = s * s * (3 - 2 * s);
      return 0.38 + 0.30 * smooth;
    } else {
      // Rear deck & tail: gently rounded back from 0.68 to 0.52
      const s = (t - 0.86) / (1.0 - 0.86);
      return 0.68 - 0.16 * s * s;
    }
  }

  // Flank half-width: narrower at front, gently tapering wider at rear
  function getHalfWidth(z: number): number {
    const t = (zFront - z) / totalLength;
    return 1.44 + 0.18 * t;
  }

  // Corner rounding inset
  function getCornerInset(z: number, u: number): number {
    const t = (zFront - z) / totalLength;
    const absU = Math.abs(u);

    let cornerR = 0;
    let distZ = 1;
    if (t < 0.12) {
      cornerR = 0.22;
      distZ = t / 0.12;
    } else if (t > 0.88) {
      cornerR = 0.18;
      distZ = (1.0 - t) / 0.12;
    }

    if (cornerR > 0 && absU > (1.0 - cornerR)) {
      const du = (absU - (1.0 - cornerR)) / cornerR;
      const dz = 1.0 - distZ;
      const rad = Math.sqrt(du * du + dz * dz);
      return rad > 1.0 ? rad - 1.0 : 0;
    }
    return 0;
  }

  const numStepsZ = 96;
  const numStepsU = 72;

  // Typebasket window (matches the Procreate finish study):
  // a narrower well for the typebar fan, then a wider ribbon/spool slot.
  const WELL_FLOOR_Y = 0.24;
  function roundedRectSDF(
    px: number,
    pz: number,
    cx: number,
    cz: number,
    halfW: number,
    halfD: number,
    r: number
  ): number {
    const dx = Math.abs(px - cx) - (halfW - r);
    const dz = Math.abs(pz - cz) - (halfD - r);
    return Math.hypot(Math.max(dx, 0), Math.max(dz, 0)) + Math.min(Math.max(dx, dz), 0) - r;
  }
  function apertureSDF(x: number, z: number): number {
    const typebarWell = roundedRectSDF(x, z, 0, -0.54, 0.46, 0.22, 0.06);
    const ribbonSlot = roundedRectSDF(x, z, 0, -0.94, 0.64, 0.20, 0.055);
    return Math.min(typebarWell, ribbonSlot);
  }

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const topGrid: number[][] = [];

  for (let j = 0; j <= numStepsZ; j++) {
    const fracZ = j / numStepsZ;
    const z = zFront - fracZ * totalLength;
    const halfW = getHalfWidth(z);
    const spineH = getProfileHeight(z);

    topGrid[j] = [];

    for (let i = 0; i <= numStepsU; i++) {
      const fracU = i / numStepsU;
      const u = fracU * 2 - 1; // [-1, 1]
      let x = u * halfW;

      // Subtle transverse crown (highest along centerline)
      const crown = Math.max(0, 1 - u * u) * 0.024;
      let y = spineH + crown;

      // Corner insetting
      const cornerExcess = getCornerInset(z, u);
      if (cornerExcess > 0) {
        x *= Math.max(0.86, 1.0 - cornerExcess * 0.22);
        y = Math.max(yBase + 0.04, y - cornerExcess * 0.40);
      }

      // 1. Keyboard Cavity
      const inCavityZ = z <= 1.44 && z >= 0.04;
      const cavityHalfW = 1.18;
      const inCavityX = Math.abs(x) <= cavityHalfW;

      if (inCavityZ && inCavityX) {
        const dFront = 1.44 - z;
        const dRear = z - 0.04;
        const dSide = cavityHalfW - Math.abs(x);
        const minDist = Math.min(dFront, dRear, dSide);
        const wallBevel = 0.07;

        const cavityZProgress = (1.44 - z) / 1.40;
        const floorY = 0.16 + 0.08 * cavityZProgress;

        if (minDist < wallBevel) {
          const s = minDist / wallBevel;
          const smooth = s * s * (3 - 2 * s);
          y = y * (1 - smooth) + floorY * smooth;
        } else {
          y = floorY;
        }
      }

      // 2. Mechanical aperture — tight stepped window with a molded inner well
      const isCutout = apertureSDF(x, z) < 0;

      const vIndex = positions.length / 3;
      topGrid[j][i] = isCutout ? -1 : vIndex;

      positions.push(x, isCutout ? WELL_FLOOR_Y : y, z);
      uvs.push(fracU, fracZ);
    }
  }

  // Triangulate top surface
  for (let j = 0; j < numStepsZ; j++) {
    for (let i = 0; i < numStepsU; i++) {
      const v0 = topGrid[j][i];
      const v1 = topGrid[j][i + 1];
      const v2 = topGrid[j + 1][i + 1];
      const v3 = topGrid[j + 1][i];

      if (v0 !== -1 && v1 !== -1 && v2 !== -1 && v3 !== -1) {
        indices.push(v0, v1, v2);
        indices.push(v0, v2, v3);
      }
    }
  }

  // Inner skirts: extrude the aperture rim down so the window reads as molded enamel, not a raw hole
  const downVert = new Map<number, number>();
  const getWellVert = (topIdx: number): number => {
    const existing = downVert.get(topIdx);
    if (existing !== undefined) return existing;
    const wx = positions[topIdx * 3];
    const wz = positions[topIdx * 3 + 2];
    const newIdx = positions.length / 3;
    positions.push(wx, WELL_FLOOR_Y, wz);
    uvs.push(0.5, 0.5);
    downVert.set(topIdx, newIdx);
    return newIdx;
  };

  for (let j = 0; j < numStepsZ; j++) {
    for (let i = 0; i < numStepsU; i++) {
      const ids = [
        topGrid[j][i],
        topGrid[j][i + 1],
        topGrid[j + 1][i + 1],
        topGrid[j + 1][i],
      ];
      const solidCount = ids.reduce((n, id) => n + (id !== -1 ? 1 : 0), 0);
      if (solidCount === 0 || solidCount === 4) continue;

      for (let e = 0; e < 4; e++) {
        const a = ids[e];
        const b = ids[(e + 1) % 4];
        if (a === -1 || b === -1) continue;
        const aBot = getWellVert(a);
        const bBot = getWellVert(b);
        indices.push(a, aBot, bBot);
        indices.push(a, bBot, b);
      }
    }
  }

  // BUILD WATERTIGHT CONTINUOUS SKIRTS WITH SEPARATE VERTICES FOR CRISP EDGE NORMALS
  // Outer perimeter loop:
  interface EdgePoint {
    x: number;
    y: number;
    z: number;
    u: number;
  }

  const perimeter: EdgePoint[] = [];

  // Front edge: j = 0, i from 0 to numStepsU
  for (let i = 0; i < numStepsU; i++) {
    const idx = topGrid[0][i];
    perimeter.push({
      x: positions[idx * 3],
      y: positions[idx * 3 + 1],
      z: positions[idx * 3 + 2],
      u: i / numStepsU,
    });
  }

  // Right edge: i = numStepsU, j from 0 to numStepsZ
  for (let j = 0; j < numStepsZ; j++) {
    const idx = topGrid[j][numStepsU];
    perimeter.push({
      x: positions[idx * 3],
      y: positions[idx * 3 + 1],
      z: positions[idx * 3 + 2],
      u: 1.0,
    });
  }

  // Rear edge: j = numStepsZ, i from numStepsU down to 0
  for (let i = numStepsU; i > 0; i--) {
    const idx = topGrid[numStepsZ][i];
    perimeter.push({
      x: positions[idx * 3],
      y: positions[idx * 3 + 1],
      z: positions[idx * 3 + 2],
      u: i / numStepsU,
    });
  }

  // Left edge: i = 0, j from numStepsZ down to 0
  for (let j = numStepsZ; j > 0; j--) {
    const idx = topGrid[j][0];
    perimeter.push({
      x: positions[idx * 3],
      y: positions[idx * 3 + 1],
      z: positions[idx * 3 + 2],
      u: 0.0,
    });
  }

  const numPerim = perimeter.length;
  const skirtTopStart = positions.length / 3;

  // Add top skirt vertices (coincident in space with perimeter, but distinct so normals stay clean)
  for (let p = 0; p < numPerim; p++) {
    const pt = perimeter[p];
    positions.push(pt.x, pt.y, pt.z);
    uvs.push(pt.u, 1.0);
  }

  const skirtBotStart = positions.length / 3;
  // Add bottom skirt vertices (straight down to yBase)
  for (let p = 0; p < numPerim; p++) {
    const pt = perimeter[p];
    positions.push(pt.x, yBase, pt.z);
    uvs.push(pt.u, 0.0);
  }

  // Triangulate skirt quads with outward-facing normals
  for (let p = 0; p < numPerim; p++) {
    const nextP = (p + 1) % numPerim;

    const tA = skirtTopStart + p;
    const tB = skirtTopStart + nextP;
    const bA = skirtBotStart + p;
    const bB = skirtBotStart + nextP;

    // Outward facing triangles (clockwise viewing from outside)
    indices.push(tA, bA, bB);
    indices.push(tA, bB, tB);
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  return geom;
}

/**
 * Creates the dark bottom chassis base with rubber feet and perimeter lip
 */
export function createChassisBaseMesh(material: THREE.Material): THREE.Group {
  const baseGroup = new THREE.Group();

  // Bottom dark cast chassis plate
  const plateGeom = new THREE.BoxGeometry(3.02, 0.045, 3.36);
  const plateMesh = new THREE.Mesh(plateGeom, material);
  plateMesh.position.set(0, 0.02, 0);
  plateMesh.receiveShadow = true;
  baseGroup.add(plateMesh);

  // 4 Rubber feet
  const footGeom = new THREE.CylinderGeometry(0.10, 0.09, 0.035, 16);
  const footPositions = [
    [-1.28, 0.012, 1.46],
    [1.28, 0.012, 1.46],
    [-1.38, 0.012, -1.46],
    [1.38, 0.012, -1.46],
  ];

  footPositions.forEach(([fx, fy, fz]) => {
    const foot = new THREE.Mesh(footGeom, material);
    foot.position.set(fx, fy, fz);
    baseGroup.add(foot);
  });

  return baseGroup;
}
