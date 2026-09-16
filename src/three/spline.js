/* ============================================================
   SPLINE INTEGRATION SLOT
   ------------------------------------------------------------
   Drop your own published Spline scene URL into SPLINE_SCENE_URL
   below. To create one: open https://spline.design, build/bake your
   scene, click Export > Code > React/vanilla, and copy the
   "prod.spline.design/xxxxxxxx/scene.splinecode" URL.

   While the URL is empty the site runs on the procedural Three.js
   scene alone — nothing breaks, and the slot stays dormant.
   ============================================================ */

export const SPLINE_SCENE_URL = '';

export async function mountSpline(hostEl, { onProgress } = {}) {
  if (!SPLINE_SCENE_URL) {
    return { mounted: false, reason: 'no-url' };
  }

  const { Application } = await import('@splinetool/runtime');

  const app = new Application(hostEl);

  await app.load(SPLINE_SCENE_URL, (p) => {
    if (typeof onProgress === 'function') onProgress(p);
  });

  /* Scroll-reactive camera framing.
     The procedural core owns the deep background; Spline owns the
     hero object, so we only nudge its camera between chapters. */
  const states = [
    { pos: [0, 0, 6], look: [0, 0, 0] },
    { pos: [1.2, 0.4, 7], look: [0, 0, 0] },
    { pos: [0, 1.0, 5.5], look: [0, 0, 0] },
    { pos: [-1.4, 0.2, 6.5], look: [0, 0, 0] },
    { pos: [0, -0.6, 5], look: [0, 0, 0] },
    { pos: [1.6, -0.2, 7.5], look: [0, 0, 0] },
    { pos: [0, 0.8, 5], look: [0, 0, 0] },
    { pos: [0, 0, 10], look: [0, 0, 0] },
  ];

  let target = states[0];
  const current = { pos: [...target.pos], look: [...target.look] };

  const tick = () => {
    requestAnimationFrame(tick);
    const lerp = (a, b, t) => a + (b - a) * t;
    current.pos = current.pos.map((v, i) => lerp(v, target.pos[i], 0.06));
    current.look = current.look.map((v, i) => lerp(v, target.look[i], 0.06));

    const cam = app.camera;
    if (cam && cam.position) {
      cam.position.set(current.pos[0], current.pos[1], current.pos[2]);
      if (cam.lookAt) cam.lookAt(current.look[0], current.look[1], current.look[2]);
    }
  };
  tick();

  return {
    mounted: true,
    app,
    setChapter(i) { target = states[Math.min(i, states.length - 1)]; },
  };
}
