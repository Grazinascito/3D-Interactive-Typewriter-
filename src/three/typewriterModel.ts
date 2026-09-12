import * as THREE from 'three';
import { createLettera32BodyGeometry, createChassisBaseMesh } from './geometries';
import { createTypewriterMaterials } from './materials';
import { KEYBOARD_ROWS, ALL_KEYS } from '../data/keyboardLayout';
import { createKeycapTexture, createBadgeTexture } from './keycapFactory';
import { createPaperAssembly, PaperController } from './paperManager';
import { KeyConfig } from '../types';

export interface KeyMeshBinding {
  config: KeyConfig;
  group: THREE.Group;
  initialY: number;
  targetY: number;
  currentY: number;
  mesh: THREE.Mesh;
}

export interface TypewriterModelController {
  group: THREE.Group;
  paper: PaperController;
  interactiveKeys: Map<string, KeyMeshBinding>;
  leverMeshes: THREE.Mesh[];
  pressKey: (keyId: string) => void;
  releaseKey: (keyId: string) => void;
  triggerTypebarStrike: () => void;
  setCarriagePosition: (col: number, maxCols: number, isAnimated?: boolean) => void;
  triggerReturnLever: () => void;
  updateBadgeText: (text: string) => void;
  update: (delta: number) => void;
}

export function createTypewriterModel(): TypewriterModelController {
  const rootGroup = new THREE.Group();
  const materials = createTypewriterMaterials();

  // 1. MAIN CHASSIS: One continuous molded shell
  const bodyGeom = createLettera32BodyGeometry();
  const bodyMesh = new THREE.Mesh(bodyGeom, materials.bodyTeal);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  rootGroup.add(bodyMesh);

  // 2. BASE CHASSIS & FEET
  const baseGroup = createChassisBaseMesh(materials.chassisBase);
  rootGroup.add(baseGroup);

  // 3. RECESSED KEYBOARD BED
  // Sits inside the cavity, very matte dark teal/charcoal
  const bedGeom = new THREE.BoxGeometry(2.36, 0.04, 1.38);
  const bedMesh = new THREE.Mesh(bedGeom, materials.keyboardBed);
  // Positioned inside the cavity and sloped slightly toward user
  bedMesh.position.set(0, 0.20, 0.74);
  bedMesh.rotation.x = -0.06; // slight forward slope
  bedMesh.receiveShadow = true;
  rootGroup.add(bedMesh);

  // 4. BRUSHED ALUMINUM BADGE PLATE
  // Recessed slot above keyboard: z ~ -0.15, y ~ 0.52
  const badgeGeom = new THREE.PlaneGeometry(1.76, 0.12);
  let currentBadgeText = 'STUDIO -- VIBE CODING 1.0';
  let badgeTexture = createBadgeTexture(currentBadgeText);
  const badgeMaterial = new THREE.MeshStandardMaterial({
    map: badgeTexture,
    metalness: 0.82,
    roughness: 0.32,
  });
  const badgeMesh = new THREE.Mesh(badgeGeom, badgeMaterial);
  badgeMesh.position.set(0, 0.52, -0.15);
  badgeMesh.rotation.x = -0.32; // angled cleanly with the upper deck slope
  badgeMesh.receiveShadow = true;
  rootGroup.add(badgeMesh);

  // 5. MECHANICAL APERTURE INTERNALS (Type Basket)
  const mechanicsGroup = new THREE.Group();
  mechanicsGroup.position.set(0, 0.52, -0.74);

  // Fan of radiating steel typebars
  const numTypebars = 34;
  const typebarGeom = new THREE.BoxGeometry(0.016, 0.012, 0.62);
  for (let i = 0; i < numTypebars; i++) {
    const angle = (i / (numTypebars - 1) - 0.5) * (Math.PI * 0.66);
    const typebar = new THREE.Mesh(typebarGeom, materials.steelMechanics);
    typebar.position.set(Math.sin(angle) * 0.38, -0.02, Math.cos(angle) * 0.38);
    typebar.rotation.y = angle;
    typebar.rotation.x = 0.36; // tilted up towards segment
    typebar.receiveShadow = true;
    mechanicsGroup.add(typebar);
  }

  // Active swinging typebar (animated when typing)
  const activeTypebarPivot = new THREE.Group();
  activeTypebarPivot.position.set(0, 0.02, 0.28);
  const activeTypebarArm = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.014, 0.68), materials.steelMechanics);
  activeTypebarArm.position.set(0, 0, -0.34);
  activeTypebarPivot.add(activeTypebarArm);
  // Hammer head
  const hammerHead = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.04, 0.04), materials.steelMechanics);
  hammerHead.position.set(0, 0.02, -0.68);
  activeTypebarPivot.add(hammerHead);
  activeTypebarPivot.rotation.x = 0.42; // resting in basket
  mechanicsGroup.add(activeTypebarPivot);

  // Chrome ribbon vibrator fork in the center
  const vibratorGeom = new THREE.BoxGeometry(0.08, 0.16, 0.012);
  const vibrator = new THREE.Mesh(vibratorGeom, materials.chromeLever);
  vibrator.position.set(0, 0.14, -0.42);
  mechanicsGroup.add(vibrator);

  // Two-tone typewriter ribbon (Black top half, Red bottom half)
  const ribbonWidth = 1.35;
  const ribbonBlackMesh = new THREE.Mesh(new THREE.BoxGeometry(ribbonWidth, 0.032, 0.004), materials.ribbonBlack);
  ribbonBlackMesh.position.set(0, 0.155, -0.42);
  mechanicsGroup.add(ribbonBlackMesh);

  const ribbonRedMesh = new THREE.Mesh(new THREE.BoxGeometry(ribbonWidth, 0.032, 0.004), materials.ribbonRed);
  ribbonRedMesh.position.set(0, 0.123, -0.42);
  mechanicsGroup.add(ribbonRedMesh);

  // Left & right ribbon spool cover cups
  const spoolGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.06, 24);
  const spoolL = new THREE.Mesh(spoolGeom, materials.steelMechanics);
  spoolL.position.set(-0.62, 0.04, -0.15);
  mechanicsGroup.add(spoolL);

  const spoolR = new THREE.Mesh(spoolGeom, materials.steelMechanics);
  spoolR.position.set(0.62, 0.04, -0.15);
  mechanicsGroup.add(spoolR);

  rootGroup.add(mechanicsGroup);

  // 6. CARRIAGE ASSEMBLY (Sliding on rear tracks)
  const carriageRailGroup = new THREE.Group();
  carriageRailGroup.position.set(0, 0.82, -1.26);

  // Rear carriage rail
  const railGeom = new THREE.BoxGeometry(3.3, 0.04, 0.06);
  const railMesh = new THREE.Mesh(railGeom, materials.steelMechanics);
  railMesh.position.set(0, -0.08, 0);
  rootGroup.add(railMesh);

  // The sliding carriage unit
  const slidingCarriage = new THREE.Group();

  // Left and Right carriage end bracket casting plates (teal molded ends)
  const endBracketGeom = new THREE.BoxGeometry(0.06, 0.36, 0.42);
  const leftBracket = new THREE.Mesh(endBracketGeom, materials.bodyTeal);
  leftBracket.position.set(-1.56, 0.02, -0.04);
  leftBracket.castShadow = true;
  slidingCarriage.add(leftBracket);

  const rightBracket = new THREE.Mesh(endBracketGeom, materials.bodyTeal);
  rightBracket.position.set(1.56, 0.02, -0.04);
  rightBracket.castShadow = true;
  slidingCarriage.add(rightBracket);

  // Black Rubber Platen Roller
  const platenRadius = 0.135;
  const platenLength = 3.08;
  const platenGeom = new THREE.CylinderGeometry(platenRadius, platenRadius, platenLength, 32);
  const platenMesh = new THREE.Mesh(platenGeom, materials.rubberPlaten);
  platenMesh.rotation.z = Math.PI / 2;
  platenMesh.castShadow = true;
  platenMesh.receiveShadow = true;
  slidingCarriage.add(platenMesh);

  // Chrome platen core shaft
  const shaftGeom = new THREE.CylinderGeometry(0.04, 0.04, platenLength + 0.36, 16);
  const shaftMesh = new THREE.Mesh(shaftGeom, materials.chromeLever);
  shaftMesh.rotation.z = Math.PI / 2;
  slidingCarriage.add(shaftMesh);

  // Platen Knobs on left & right with knurled ridges
  const knobGeom = new THREE.CylinderGeometry(0.16, 0.16, 0.14, 24);
  const knobL = new THREE.Mesh(knobGeom, materials.chassisBase);
  knobL.rotation.z = Math.PI / 2;
  knobL.position.set(-platenLength / 2 - 0.10, 0, 0);
  slidingCarriage.add(knobL);

  const knobCapGeom = new THREE.CylinderGeometry(0.07, 0.07, 0.02, 16);
  const knobCapL = new THREE.Mesh(knobCapGeom, materials.chromeLever);
  knobCapL.rotation.z = Math.PI / 2;
  knobCapL.position.set(-platenLength / 2 - 0.17, 0, 0);
  slidingCarriage.add(knobCapL);

  const knobR = new THREE.Mesh(knobGeom, materials.chassisBase);
  knobR.rotation.z = Math.PI / 2;
  knobR.position.set(platenLength / 2 + 0.10, 0, 0);
  slidingCarriage.add(knobR);

  const knobCapR = new THREE.Mesh(knobCapGeom, materials.chromeLever);
  knobCapR.rotation.z = Math.PI / 2;
  knobCapR.position.set(platenLength / 2 + 0.17, 0, 0);
  slidingCarriage.add(knobCapR);

  // Paper Table / Feed guide plate (angled backwards)
  const feedTrayGeom = new THREE.BoxGeometry(2.65, 0.02, 0.45);
  const feedTray = new THREE.Mesh(feedTrayGeom, materials.bodyTeal);
  feedTray.position.set(0, 0.12, -0.22);
  feedTray.rotation.x = 0.52; // angled back
  slidingCarriage.add(feedTray);

  // Paper Bail bar with 2 small rubber pinch rollers
  const bailBarGeom = new THREE.CylinderGeometry(0.016, 0.016, 2.7, 16);
  const bailBar = new THREE.Mesh(bailBarGeom, materials.chromeLever);
  bailBar.rotation.z = Math.PI / 2;
  bailBar.position.set(0, 0.145, 0.06);
  slidingCarriage.add(bailBar);

  const rollerGeom = new THREE.CylinderGeometry(0.042, 0.042, 0.08, 16);
  const rollerL = new THREE.Mesh(rollerGeom, materials.rubberPlaten);
  rollerL.rotation.z = Math.PI / 2;
  rollerL.position.set(-0.65, 0.145, 0.06);
  slidingCarriage.add(rollerL);

  const rollerR = new THREE.Mesh(rollerGeom, materials.rubberPlaten);
  rollerR.rotation.z = Math.PI / 2;
  rollerR.position.set(0.65, 0.145, 0.06);
  slidingCarriage.add(rollerR);

  // ICONIC LEFT CARRIAGE RETURN LEVER (prominently seen in photo)
  // Sculpted chrome arm curving from the left platen end forward into an ergonomic wing handle!
  const leverPivot = new THREE.Group();
  leverPivot.position.set(-platenLength / 2 - 0.02, 0.06, 0.02);

  // Arm segment 1: extending forward
  const leverArm1 = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.038, 0.48), materials.chromeLever);
  leverArm1.position.set(-0.06, 0.04, 0.22);
  leverArm1.rotation.y = 0.18;
  leverArm1.userData = { isReturnLever: true };
  leverPivot.add(leverArm1);

  // Ergonomic flared thumb paddle (curved wing)
  const paddleGeom = new THREE.BoxGeometry(0.024, 0.095, 0.28);
  const paddle = new THREE.Mesh(paddleGeom, materials.chromeLever);
  paddle.position.set(-0.10, 0.06, 0.42);
  paddle.rotation.z = 0.25;
  paddle.rotation.y = 0.15;
  paddle.userData = { isReturnLever: true };
  leverPivot.add(paddle);

  const leverMeshes = [leverArm1, paddle];

  slidingCarriage.add(leverPivot);

  // 7. REAL-TIME TYPED PAPER ASSEMBLY
  const paper = createPaperAssembly(materials.paperBase);
  slidingCarriage.add(paper.mesh);

  carriageRailGroup.add(slidingCarriage);
  rootGroup.add(carriageRailGroup);

  // 8. RECESSED CIRCULAR VINTAGE KEYS
  const interactiveKeys = new Map<string, KeyMeshBinding>();
  const keyRadius = 0.082;
  const keyHeight = 0.055;
  const rimOuterRadius = 0.088;

  // Shared geometries
  const keyCylinderGeom = new THREE.CylinderGeometry(keyRadius, keyRadius, keyHeight, 28);
  const keyRimGeom = new THREE.TorusGeometry(rimOuterRadius, 0.009, 12, 28);
  const keyStemGeom = new THREE.CylinderGeometry(0.014, 0.014, 0.14, 12);
  const spacebarGeom = new THREE.BoxGeometry(1.58, 0.065, 0.18);

  // Keycap top face circle for label texture
  const keyFaceGeom = new THREE.CircleGeometry(keyRadius - 0.002, 28);

  // Setup keys inside the recessed cavity
  KEYBOARD_ROWS.forEach((rowKeys, rowIdx) => {
    // Row z spacing: from z = 0.22 (row 0) to z = 1.28 (spacebar)
    const rowZ = 0.22 + rowIdx * 0.26;
    // Row y height: sloping down towards user from y = 0.39 down to y = 0.23
    const rowY = 0.39 - rowIdx * 0.038;

    const rowKeyCount = rowKeys.length;

    rowKeys.forEach((keyConfig, colIdx) => {
      const keyGroup = new THREE.Group();

      let posX = 0;
      if (keyConfig.id === 'key-space') {
        // Spacebar is centered in Row 4
        posX = 0;
      } else {
        // Standard staggered layout
        const staggerOffset = [0, 0.06, 0.12, 0.18][rowIdx] || 0;
        const totalRowWidth = (rowKeyCount - 1) * 0.192;
        posX = -totalRowWidth / 2 + colIdx * 0.192 + staggerOffset * 0.5;
      }

      keyGroup.position.set(posX, rowY, rowZ);
      keyGroup.rotation.x = -0.06; // slight angle matching cavity bed

      if (keyConfig.id === 'key-space') {
        // Textured dark spacebar
        const spaceMesh = new THREE.Mesh(spacebarGeom, materials.keycapDark);
        spaceMesh.castShadow = true;
        spaceMesh.receiveShadow = true;
        keyGroup.add(spaceMesh);

        // 2 Chrome stabilizer stems
        const stemL = new THREE.Mesh(keyStemGeom, materials.steelMechanics);
        stemL.position.set(-0.45, -0.07, 0);
        keyGroup.add(stemL);

        const stemR = new THREE.Mesh(keyStemGeom, materials.steelMechanics);
        stemR.position.set(0.45, -0.07, 0);
        keyGroup.add(stemR);

        spaceMesh.userData = { keyId: keyConfig.id, config: keyConfig };

        const binding: KeyMeshBinding = {
          config: keyConfig,
          group: keyGroup,
          initialY: rowY,
          targetY: rowY,
          currentY: rowY,
          mesh: spaceMesh,
        };
        interactiveKeys.set(keyConfig.id, binding);
      } else {
        // Circular vintage keycap
        const isSage = keyConfig.colorType === 'sage';
        const keycapMat = isSage ? materials.keycapSage : materials.keycapDark;

        // Base cylindrical key body
        const keyMesh = new THREE.Mesh(keyCylinderGeom, keycapMat);
        keyMesh.castShadow = true;
        keyMesh.receiveShadow = true;
        keyGroup.add(keyMesh);

        // Metallic brushed rim around the keycap
        const rimMesh = new THREE.Mesh(keyRimGeom, materials.keyRim);
        rimMesh.rotation.x = Math.PI / 2;
        rimMesh.position.y = keyHeight / 2;
        keyGroup.add(rimMesh);

        // Stamped typewriter typography face texture
        const labelTexture = createKeycapTexture(keyConfig.label, keyConfig.subLabel, keyConfig.colorType);
        const faceMaterial = new THREE.MeshBasicMaterial({
          map: labelTexture,
          transparent: true,
        });
        const faceMesh = new THREE.Mesh(keyFaceGeom, faceMaterial);
        faceMesh.rotation.x = -Math.PI / 2;
        faceMesh.position.y = keyHeight / 2 + 0.002;
        keyGroup.add(faceMesh);

        // Steel stem underneath
        const stem = new THREE.Mesh(keyStemGeom, materials.steelMechanics);
        stem.position.y = -0.07;
        keyGroup.add(stem);

        keyMesh.userData = { keyId: keyConfig.id, config: keyConfig };

        const binding: KeyMeshBinding = {
          config: keyConfig,
          group: keyGroup,
          initialY: rowY,
          targetY: rowY,
          currentY: rowY,
          mesh: keyMesh,
        };
        interactiveKeys.set(keyConfig.id, binding);
      }

      rootGroup.add(keyGroup);
    });
  });

  // State for continuous animations
  let typebarStrikeProgress = 0;
  let isTypebarStriking = false;
  let leverProgress = 0;
  let isLeverMoving = false;

  let carriageTargetX = 0;
  let carriageCurrentX = 0;

  return {
    group: rootGroup,
    paper,
    interactiveKeys,
    leverMeshes,

    pressKey: (keyId: string) => {
      const keyBinding = interactiveKeys.get(keyId);
      if (keyBinding) {
        keyBinding.targetY = keyBinding.initialY - 0.055;
      }
    },

    releaseKey: (keyId: string) => {
      const keyBinding = interactiveKeys.get(keyId);
      if (keyBinding) {
        keyBinding.targetY = keyBinding.initialY;
      }
    },

    triggerTypebarStrike: () => {
      isTypebarStriking = true;
      typebarStrikeProgress = 0;
    },

    setCarriagePosition: (col: number, maxCols: number, isAnimated: boolean = true) => {
      // Typewriter mechanics: carriage moves LEFTWARD as characters are typed
      // so the current column is positioned at the central strike point
      const stepWidth = 0.038;
      carriageTargetX = -col * stepWidth + 0.12;

      if (!isAnimated) {
        carriageCurrentX = carriageTargetX;
        slidingCarriage.position.x = carriageCurrentX;
      }
    },

    triggerReturnLever: () => {
      isLeverMoving = true;
      leverProgress = 0;
    },

    updateBadgeText: (text: string) => {
      currentBadgeText = text;
      badgeTexture = createBadgeTexture(text);
      badgeMaterial.map = badgeTexture;
      badgeMaterial.needsUpdate = true;
    },

    update: (delta: number) => {
      // 1. Animate interactive keys spring physics
      interactiveKeys.forEach((k) => {
        k.currentY += (k.targetY - k.currentY) * Math.min(1, delta * 24);
        k.group.position.y = k.currentY;
      });

      // 2. Animate carriage smooth sliding
      const carriageSpeed = isLeverMoving ? 14 : 26;
      carriageCurrentX += (carriageTargetX - carriageCurrentX) * Math.min(1, delta * carriageSpeed);
      slidingCarriage.position.x = carriageCurrentX;

      // 3. Animate Typebar rapid strike & bounce back
      if (isTypebarStriking) {
        typebarStrikeProgress += delta * 18; // rapid strike
        if (typebarStrikeProgress < 0.5) {
          // Swinging up towards platen (angle from 0.42 to -0.65 rad)
          const p = typebarStrikeProgress / 0.5;
          activeTypebarPivot.rotation.x = 0.42 - p * 1.07;
        } else if (typebarStrikeProgress < 1.0) {
          // Bouncing back down to basket
          const p = (typebarStrikeProgress - 0.5) / 0.5;
          activeTypebarPivot.rotation.x = -0.65 + p * 1.07;
        } else {
          activeTypebarPivot.rotation.x = 0.42;
          isTypebarStriking = false;
        }
      }

      // 4. Animate Carriage Return lever flick
      if (isLeverMoving) {
        leverProgress += delta * 3.5;
        if (leverProgress < 0.5) {
          // Lever is pulled forward/left
          leverPivot.rotation.y = -(leverProgress / 0.5) * 0.45;
        } else if (leverProgress < 1.0) {
          // Lever springs back to neutral
          leverPivot.rotation.y = -0.45 * (1 - (leverProgress - 0.5) / 0.5);
        } else {
          leverPivot.rotation.y = 0;
          isLeverMoving = false;
        }
      }
    },
  };
}
