/* My story: a henna cone draws a vine down the timeline as you scroll.
   When the vine reaches a stop, its text fades in and its little drawing pipes itself. */
(() => {
  const col = document.getElementById("vineCol"), svg = document.getElementById("vineSvg");
  if (!col || !svg) return;
  const NS = "http://www.w3.org/2000/svg";
  const el = (p, n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p.appendChild(e); return e; };
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const calm = () => document.body.classList.contains("reduce-motion") || document.body.classList.contains("simple");
  const stops = [...col.querySelectorAll(".vstop")];
  let vine, cone, L = 0, stopLen = [], leaves = [], knots = [];

  /* the length along the vine where it reaches a given height */
  const lenAtY = y => { let lo = 0, hi = L; for (let k = 0; k < 22; k++){ const m = (lo + hi) / 2; vine.getPointAtLength(m).y < y ? lo = m : hi = m; } return lo; };

  function build(){
    svg.innerHTML = "";
    const H = col.offsetHeight, wide = innerWidth > 860, X = wide ? 55 : 28, A = wide ? 34 : 14;
    svg.setAttribute("viewBox", `0 0 ${wide ? 110 : 60} ${H}`);
    const ys = stops.map(s => s.offsetTop + s.offsetHeight / 2);
    let d = `M${X},0`, prev = 0;
    ys.forEach((y, i) => { const m = (prev + y) / 2, s = i % 2 ? 1 : -1; d += ` C${X + A * s},${prev + (m - prev) * .6} ${X + A * s},${m + (y - m) * .4} ${X},${y}`; prev = y; });
    el(svg, "path", { d, class: "ghost" });
    vine = el(svg, "path", { d, class: "vine" });
    L = vine.getTotalLength();
    vine.style.strokeDasharray = L;
    stopLen = ys.map(lenAtY);
    leaves = [];
    for (let s = 60; s < L - 20; s += 70){
      const p = vine.getPointAtLength(s), q = vine.getPointAtLength(s + 1), ang = Math.atan2(q.y - p.y, q.x - p.x) * 57.3, side = leaves.length % 2 ? 1 : -1;
      if (stopLen.some(t => Math.abs(t - s) < 22)) continue;
      const g = el(svg, "g", { transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${(ang + 90 * side).toFixed(0)})` });
      leaves.push([s, el(g, "path", { d: "M0,0 C6,-6 16,-5 20,0 C16,5 6,6 0,0 Z", class: "leaf" })]);
    }
    knots = stopLen.map(s => { const p = vine.getPointAtLength(s); return el(svg, "circle", { cx: p.x, cy: p.y, r: 7, class: "knot" }); });
    cone = el(svg, "g", { class: "vcone" });
    el(cone, "path", { d: "M0,0 L-9,-30 L9,-30 Z", fill: "#E2CFB4", stroke: "#4A2C17", "stroke-width": 1.5, "stroke-linejoin": "round" });
    el(cone, "path", { d: "M-9,-30 L-9,-38 L9,-38 L9,-30", fill: "#B9893F", stroke: "#4A2C17", "stroke-width": 1.5 });
    update();
  }

  function update(){
    if (!vine) return;
    const len = calm() ? L : clamp(lenAtY(innerHeight * .55 - col.getBoundingClientRect().top), 0, L);
    vine.style.strokeDashoffset = L - len;
    const p = vine.getPointAtLength(len);
    cone.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(-20)`);
    cone.style.opacity = !calm() && len > 2 && len < L - 2 ? 1 : 0;
    leaves.forEach(([s, leaf]) => leaf.classList.toggle("on", len > s));
    stops.forEach((s, i) => {
      const on = len >= stopLen[i] - 4; s.classList.toggle("on", on); knots[i].classList.toggle("on", on);
      /* count up the client number the first time its stop appears */
      const c = s.querySelector(".count[data-to]");
      if (c && on && !c.dataset.done){ c.dataset.done = 1; countUp(c, +c.dataset.to); }
    });
  }

  function countUp(node, to){
    if (calm()){ node.textContent = to + "+"; return; }
    const t0 = performance.now();
    const step = now => { const t = clamp((now - t0) / 1800); node.textContent = Math.round(to * (1 - Math.pow(1 - t, 3))) + "+"; if (t < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  let raf = 0;
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); }, { passive: true });
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(build, 150); });
  addEventListener("load", build);
  new MutationObserver(update).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  build();
})();
