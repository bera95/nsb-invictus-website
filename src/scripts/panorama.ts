/**
 * Minimal equirectangular 360° viewer (drag / touch / keyboard to look around).
 * Loaded only when the visitor starts the tour.
 */
import { Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, SphereGeometry, SRGBColorSpace, TextureLoader, WebGLRenderer, MathUtils } from 'three';

export function createPanorama(container: HTMLElement, src: string) {
  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;cursor:grab;touch-action:none';

  const scene = new Scene();
  const camera = new PerspectiveCamera(75, 1, 0.1, 100);
  const geo = new SphereGeometry(10, 64, 40);
  geo.scale(-1, 1, 1);
  const tex = new TextureLoader().load(src, () => render());
  tex.colorSpace = SRGBColorSpace;
  scene.add(new Mesh(geo, new MeshBasicMaterial({ map: tex })));

  let lon = 0, lat = 0, dragging = false, sx = 0, sy = 0, slon = 0, slat = 0;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function render() {
    lat = Math.max(-85, Math.min(85, lat));
    const phi = MathUtils.degToRad(90 - lat), theta = MathUtils.degToRad(lon);
    camera.lookAt(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta));
    renderer.render(scene, camera);
  }
  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    render();
  }
  const el = renderer.domElement;
  el.tabIndex = 0;
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', '360° view. Drag or use arrow keys to look around.');
  el.addEventListener('pointerdown', (e) => { dragging = true; sx = e.clientX; sy = e.clientY; slon = lon; slat = lat; el.setPointerCapture(e.pointerId); el.style.cursor = 'grabbing'; });
  el.addEventListener('pointermove', (e) => { if (!dragging) return; lon = slon - (e.clientX - sx) * 0.15; lat = slat + (e.clientY - sy) * 0.15; render(); });
  el.addEventListener('pointerup', () => { dragging = false; el.style.cursor = 'grab'; });
  el.addEventListener('wheel', (e) => { e.preventDefault(); camera.fov = Math.max(40, Math.min(90, camera.fov + e.deltaY * 0.03)); camera.updateProjectionMatrix(); render(); }, { passive: false });
  el.addEventListener('keydown', (e) => {
    const step = 5;
    if (e.key === 'ArrowLeft') lon -= step; else if (e.key === 'ArrowRight') lon += step;
    else if (e.key === 'ArrowUp') lat += step; else if (e.key === 'ArrowDown') lat -= step; else return;
    e.preventDefault(); render();
  });
  new ResizeObserver(resize).observe(container);
  resize();
  if (!reduce) {
    const idle = () => { if (!dragging) { lon += 0.03; render(); } requestAnimationFrame(idle); };
    requestAnimationFrame(idle);
  }
}
