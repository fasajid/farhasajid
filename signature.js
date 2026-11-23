/* =========================================================
   Hand-piped signature logo
   A tiny henna cone draws the name stroke by stroke (with pen
   lifts between strokes), then the paste darkens like a real stain.
   Hover the logo to watch it draw again.

   Use on any page:
     <a class="logo" href="index.html" aria-label="Farha Sajid, home" data-signature data-delay="300"></a>
     <script src="signature.js" defer></script>
   data-delay = milliseconds to wait before drawing (e.g. after a loader).

   The strokes below spell "Farha Sajid". Changing the name means drawing new paths.
   ========================================================= */
(() => {
  const logo = document.querySelector(".logo[data-signature]");
  if (!logo) return;
  const NS = "http://www.w3.org/2000/svg";
  const body = document.body;
  const startDelay = window.INTRO === "name" ? 250 : (+logo.dataset.delay || 300);
  let turbo = window.INTRO === "name";   /* the opening intro writes the name a little faster (about 4–5 seconds) */

  const css = document.createElement("style");
  css.textContent = `
    .logo[data-signature]{display:inline-block;line-height:0;text-decoration:none;padding:.15rem 0}
    .logo[data-signature] svg{width:clamp(160px,14.5vw,205px);height:auto;display:block;overflow:visible}
    @media (max-width:860px){.logo[data-signature] svg{width:165px}}
    .sig-ink{color:#B3783A;transition:color 2.6s ease}
    .sig-ink.stained{color:var(--deep,var(--maroon,#4A2C17))}
    .sig-ink path{fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
    .sig-ink circle{fill:currentColor}
    .sig-gold path{fill:none;stroke:var(--gold,#B9893F);stroke-width:1.15;stroke-linecap:round}
    .sig-gold circle{fill:var(--gold,#B9893F)}
    .sig-pop{transform-box:fill-box;transform-origin:center;transform:scale(0);transition:transform .35s cubic-bezier(.3,1.7,.5,1)}
    .sig-pop.on{transform:scale(1)}
    .sig-cone{transition:opacity .3s}
  `;
  document.head.appendChild(css);

  /* ---------- the strokes, in writing order (viewBox 0 0 288 76) ---------- */
  const INK = [
    /* F: stem, curving down with a hook at the bottom */
    "M35 13 C34 27 32 40 29 48 C27 54 20 56 15 52",
    /* F: wavy top bar */
    "M10 18 C18 9 32 15 43 12 C50 10 55 7 58 10",
    /* a r h a: one connected line, like real cursive */
    "M48 47 C54 45 60 37 66 33 C59 30 52 37 53 44 C54 50 61 49 65 41 L66 33 C65 40 65 46 67 49 C69 51 72 49 74 46 " +
    "C76 41 77 37 78 32 C80 33.5 82 34 85 33 C84.5 38 85 43 87 47 C89 51 93 50 96 45 " +
    "C100 35 106 21 106 13 C106 6 100 7 99 13 C98 24 98 38 97 49 C99 40 104 33 109 34 C113 35 112 42 112 46 C112 50 115 50 118 47 " +
    "C122 44 126 36 131 33 C124 30 117 37 118 44 C119 50 126 49 130 41 L131 33 C130 40 130 46 132 49 C134 51 139 49 144 44",
    /* F: little crossbar */
    "M24 31 C29 28.5 34 31 41 27.5",
    /* S */
    "M186 17 C179 9 164 11 164 20 C164 29 182 30 183 40 C184 50 169 55 160 48",
    /* a j i d: one connected line */
    "M178 47 C184 45 190 37 196 33 C189 30 182 37 183 44 C184 50 191 49 195 41 L196 33 C195 40 195 46 197 49 C199 51 202 49 204 46 " +
    "C206 40 207 37 208 33 C208 42 208 52 206 59 C204 66 196 66 197 61 C198 56 205 52 212 48 " +
    "C214 44 216 38 217 33 C216 40 216 46 218 49 C220 51 223 49 226 46 " +
    "C230 43 234 36 239 33 C232 30 225 37 226 44 C227 50 234 49 238 41 C240 32 242 20 242 9 C241 21 240 37 241 46 C242 51 247 50 252 44",
    /* dots on the j and the i: two quick taps */
    "M208.6 24.5 C209.2 24.1 209.9 24.4 209.8 25.1",
    "M217.6 24.5 C218.2 24.1 218.9 24.4 218.8 25.1"
  ];
  const VINE = "M14 69 C70 63 140 73 200 67 C236 63 258 61 268 55 C273 52 273 47 270 48 C267 49 268 53 272 54";
  const DOTS = [[280, 54, 1.9], [278, 47.5, 1.3], [278, 60.5, 1.3]];

  /* ---------- build the svg ---------- */
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
  const svg = el("svg", { viewBox: "0 0 288 76", "aria-hidden": "true" });
  const ink = el("g", { class: "sig-ink" }, svg);
  const gold = el("g", { class: "sig-gold" }, svg);
  const strokes = INK.map(d => el("path", { d }, ink));
  const blobs = strokes.map(() => el("circle", { r: 1.6, class: "sig-pop" }, ink));
  const vine = el("path", { d: VINE }, gold);
  const dots = DOTS.map(([cx, cy, r]) => el("circle", { cx, cy, r, class: "sig-pop" }, gold));
  /* henna cone: tip at (0,0) */
  const cone = el("g", { class: "sig-cone", opacity: 0 }, svg);
  el("path", { d: "M0 0 L10 -19 L16 -14 Z", fill: "#E2CFB4", stroke: "#4A2C17", "stroke-width": .8, "stroke-linejoin": "round" }, cone);
  el("path", { d: "M4 -6 L12 -16 M6.5 -10 L13.5 -15", stroke: "#4A2C17", "stroke-width": .5, opacity: .45 }, cone);
  el("path", { d: "M10 -19 L13 -24 L20 -17.5 L16 -14", fill: "#B9893F", stroke: "#4A2C17", "stroke-width": .8, "stroke-linejoin": "round" }, cone);
  el("path", { d: "M0 0 L2.4 -4.4 L3.6 -3.6 Z", fill: "#6B3E1C" }, cone);
  logo.replaceChildren(svg);

  const all = [...strokes, vine];
  const lens = all.map(p => p.getTotalLength());
  const blobAt = strokes.map(p => p.getPointAtLength(0));
  blobs.forEach((b, i) => { b.setAttribute("cx", blobAt[i].x); b.setAttribute("cy", blobAt[i].y); });

  /* ---------- helpers ---------- */
  const reduced = () => body.classList.contains("reduce-motion");
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const frame = () => new Promise(r => requestAnimationFrame(r));
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; /* slow start, quick middle, careful finish */
  let tip = { x: 60, y: 20 }, t0 = 0;
  const placeCone = (x, y, lift = 0, wobble = 0) => {
    tip = { x, y };
    cone.setAttribute("transform", `translate(${x} ${y - lift}) rotate(${-8 + wobble})`);
  };

  function reset(){
    all.forEach((p, i) => { p.style.strokeDasharray = lens[i]; p.style.strokeDashoffset = lens[i]; });
    [...blobs, ...dots].forEach(c => c.classList.remove("on"));
    ink.classList.remove("stained");
  }
  function showFinal(){
    all.forEach(p => { p.style.strokeDasharray = "none"; p.style.strokeDashoffset = 0; });
    [...blobs, ...dots].forEach(c => c.classList.add("on"));
    ink.classList.add("stained");
    cone.setAttribute("opacity", 0);
  }

  /* lift the cone and glide to the next stroke */
  async function travel(to, ms){
    const from = { ...tip }, start = performance.now();
    for (;;){
      const t = Math.min(1, (performance.now() - start) / ms), e = ease(t);
      if (reduced()) throw "stop";
      placeCone(from.x + (to.x - from.x) * e, from.y + (to.y - from.y) * e, Math.sin(t * Math.PI) * 6);
      if (t >= 1) break; await frame();
    }
  }

  /* pipe one stroke */
  async function pipe(i, speed){
    const p = all[i], len = lens[i], ms = Math.max(turbo ? 150 : 260, len / speed * 1000), start = performance.now();
    for (;;){
      const t = Math.min(1, (performance.now() - start) / ms), e = ease(t);
      if (reduced()) throw "stop";
      p.style.strokeDashoffset = len * (1 - e);
      const pt = p.getPointAtLength(len * e);
      placeCone(pt.x, pt.y, 0, Math.sin((performance.now() - t0) / 60) * 2.5); /* a little hand tremor */
      if (t >= 1) break; await frame();
    }
  }

  let running = false;
  async function draw(fast = false){
    if (running) return;
    if (reduced()){ showFinal(); return; }
    running = true; reset();
    const speed = turbo ? 720 : fast ? 520 : 320; /* svg units per second */
    t0 = performance.now();
    placeCone(blobAt[0].x + 8, blobAt[0].y - 10, 6);
    cone.setAttribute("opacity", 1);
    try {
      for (let i = 0; i < all.length; i++){
        const start = all[i].getPointAtLength(0);
        await travel(start, turbo ? 100 : fast ? 120 : 220);
        if (i < blobs.length) blobs[i].classList.add("on");   /* paste blob where the cone touches down */
        await wait(turbo ? 25 : fast ? 30 : 90);
        await pipe(i, i === all.length - 1 ? speed * 1.4 : speed);
        await wait(turbo ? 45 : fast ? 40 : 140);                          /* pen lift */
      }
      for (const d of dots){ await travel({ x: +d.getAttribute("cx"), y: +d.getAttribute("cy") }, turbo ? 40 : fast ? 70 : 140); d.classList.add("on"); await wait(turbo ? 15 : fast ? 40 : 90); }
      await travel({ x: tip.x + 10, y: tip.y - 14 }, 260);
      cone.setAttribute("opacity", 0);
      ink.classList.add("stained");                           /* fresh paste darkens to a deep stain */
      turbo = false;
    } catch (e) { showFinal(); }
    running = false;
  }

  reset();
  setTimeout(() => draw(turbo), reduced() ? 0 : startDelay);
  logo.addEventListener("mouseenter", () => { if (!reduced()) draw(true); });
  new MutationObserver(() => { if (reduced() && !running) showFinal(); }).observe(body, { attributes: true, attributeFilter: ["class"] });
})();
