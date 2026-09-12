import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createTypewriterModel, TypewriterModelController } from './typewriterModel';
import { createTypewriterMaterials } from './materials';

interface TypewriterCanvasProps {
  lines: string[];
  currentCol: number;
  maxCols: number;
  soundEnabled: boolean;
  badgeText: string;
  onKeyClick: (char: string, code: string, keyId: string) => void;
  onReturnLeverClick: () => void;
  onInteraction?: () => void;
  controllerRef: React.MutableRefObject<TypewriterModelController | null>;
}

export const TypewriterCanvas: React.FC<TypewriterCanvasProps> = ({
  lines,
  currentCol,
  maxCols,
  badgeText,
  onKeyClick,
  onReturnLeverClick,
  onInteraction,
  controllerRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.updateBadgeText(badgeText);
    }
  }, [badgeText, controllerRef]);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.paper.updateText(lines, currentCol, false);
      controllerRef.current.paper.advanceLine(lines.length - 1);
      controllerRef.current.setCarriagePosition(currentCol, maxCols, true);
    }
  }, [lines, currentCol, maxCols, controllerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    // Calm, neutral warm studio backdrop
    scene.background = new THREE.Color(0xe5dfd5);
    scene.fog = new THREE.FogExp2(0xe5dfd5, 0.032);

    // 2. Camera setup - framed to encompass the entire typewriter AND the full paper sheet
    // Calculate aspect ratio and responsive FOV / distance so neither top of paper nor typewriter is cut
    const width = container.clientWidth;
    const height = container.clientHeight;
    const aspect = width / height;

    // Visual center of the combined typewriter + paper object
    const visualCenter = new THREE.Vector3(0.0, 0.95, -0.45);

    // Dynamic FOV adjustment: wider on tall/mobile screens to keep wide carriage visible,
    // comfortable 35 deg on desktop/landscape
    const baseFov = aspect < 1.0 ? 44 : aspect < 1.4 ? 38 : 34;

    const camera = new THREE.PerspectiveCamera(
      baseFov,
      aspect,
      0.1,
      50
    );

    // Position camera slightly further back and with natural sitting perspective
    // Looking from front-left 3/4 angle towards visualCenter
    // Distance scaled slightly if aspect is narrow
    const distScale = aspect < 1.0 ? 1.25 : aspect < 1.3 ? 1.1 : 1.0;
    camera.position.set(
      -3.4 * distScale,
      3.85 * distScale,
      4.35 * distScale
    );
    camera.lookAt(visualCenter);
    cameraRef.current = camera;

    // 3. WebGL Renderer with soft shadows and filmic tone
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);

    // 4. Natural Orbit Controls with sensible physical limits centered on [machine + paper]
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    // Sensible polar angle so camera cannot flip under the desk or flip completely overhead
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minPolarAngle = 0.22;
    controls.minDistance = 3.0;   // Keep whole ensemble comfortably in frame when zooming in
    controls.maxDistance = 8.5;   // Allow slight zoom out without getting lost
    controls.target.copy(visualCenter); // Centered on machine + paper
    controlsRef.current = controls;

    // Listen to user orbit drag to report interaction
    const handleControlsStart = () => {
      if (onInteraction) onInteraction();
    };
    controls.addEventListener('start', handleControlsStart);

    // 5. Studio Lighting setup (Soft, professional warm studio lighting)
    // Warm key light
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.55);
    keyLight.position.set(4.2, 7.2, 4.8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 16;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;
    keyLight.shadow.camera.left = -3.5;
    keyLight.shadow.camera.right = 3.5;
    keyLight.shadow.camera.top = 3.5;
    keyLight.shadow.camera.bottom = -3.5;
    scene.add(keyLight);

    // Soft cool-neutral fill light from front-left
    const fillLight = new THREE.DirectionalLight(0xdce5ea, 0.85);
    fillLight.position.set(-5.0, 4.2, 3.2);
    scene.add(fillLight);

    // Subtle rim backlight to separate platen, paper and carriage from background
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.9);
    rimLight.position.set(-1.0, 5.0, -5.0);
    scene.add(rimLight);

    // Ambient diffuse light
    const ambientLight = new THREE.AmbientLight(0xf5f3ee, 0.7);
    scene.add(ambientLight);

    // Hemisphere light for warm desk bounce
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbaa48e, 0.38);
    scene.add(hemiLight);

    // 6. Warm Oak Table Surface
    const materials = createTypewriterMaterials();
    const tableGeom = new THREE.PlaneGeometry(24, 24);
    const tableMesh = new THREE.Mesh(tableGeom, materials.woodTable);
    tableMesh.rotation.x = -Math.PI / 2;
    tableMesh.position.y = 0;
    tableMesh.receiveShadow = true;
    scene.add(tableMesh);

    // Contact shadow catcher for subtle realistic grounding
    const shadowPlaneGeom = new THREE.PlaneGeometry(6, 6);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.26 });
    const shadowMesh = new THREE.Mesh(shadowPlaneGeom, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.002;
    shadowMesh.receiveShadow = true;
    scene.add(shadowMesh);

    // 7. Instantiate the Olivetti Lettera 32 Model
    const model = createTypewriterModel();
    controllerRef.current = model;
    scene.add(model.group);

    // Initial sync
    model.paper.updateText(lines, currentCol, false);
    model.setCarriagePosition(currentCol, maxCols, false);

    // 8. Raycasting for direct mouse interaction on 3D keys and return lever
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredObject: THREE.Mesh | null = null;
    let pointerDownPos = { x: 0, y: 0 };

    const getInteractiveMeshes = () => {
      const meshes: THREE.Mesh[] = [];
      model.interactiveKeys.forEach((binding) => meshes.push(binding.mesh));
      if (model.leverMeshes) {
        model.leverMeshes.forEach((mesh) => meshes.push(mesh));
      }
      return meshes;
    };

    const getIntersectedObject = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const meshes = getInteractiveMeshes();
      const intersects = raycaster.intersectObjects(meshes, false);
      return intersects.length > 0 ? (intersects[0].object as THREE.Mesh) : null;
    };

    const handlePointerMove = (event: MouseEvent) => {
      const hit = getIntersectedObject(event);
      if (hit !== hoveredObject) {
        hoveredObject = hit;
        container.style.cursor = hoveredObject ? 'pointer' : 'default';
      }
    };

    const handlePointerDown = (event: MouseEvent) => {
      pointerDownPos = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event: MouseEvent) => {
      // Avoid triggering when user was dragging the orbit camera
      const dx = Math.abs(event.clientX - pointerDownPos.x);
      const dy = Math.abs(event.clientY - pointerDownPos.y);
      if (dx > 5 || dy > 5) return;

      const hit = getIntersectedObject(event);
      if (!hit) return;

      if (onInteraction) onInteraction();

      // Check if clicked the carriage return lever
      if (hit.userData?.isReturnLever) {
        onReturnLeverClick();
        return;
      }

      // Check if clicked a key
      if (hit.userData?.keyId) {
        const keyId = hit.userData.keyId;
        const config = hit.userData.config;
        onKeyClick(config.char, config.code, keyId);
      }
    };

    renderer.domElement.addEventListener('mousemove', handlePointerMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    // 9. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      controls.update();

      // Update typewriter model animations (springs, typebar, carriage, lever)
      model.update(delta);

      renderer.render(scene, camera);
    };
    animate();

    // 10. Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const curAspect = w / h;
      camera.aspect = curAspect;
      // Maintain breathing room around the typewriter + paper across screen ratios
      camera.fov = curAspect < 1.0 ? 44 : curAspect < 1.4 ? 38 : 34;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      controls.removeEventListener('start', handleControlsStart);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      controllerRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="three-typewriter-viewport"
      className="relative w-full h-full select-none outline-none overflow-hidden touch-none"
    />
  );
};
