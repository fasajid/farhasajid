/* =========================================================
   Hero: my henna desk (a top-down flat-lay you can play with)
   - The practice sheet shows a henna Atlanta skyline that darkens as you scroll
   - Scrolling through the hero makes the design stain darker
   - Everything on the desk does something: hover for a caption,
     click / tap / press Enter to play
       bowl → stir · chai → steam + ripple (click to sip) · sketchbook → flip page
       marigolds → petals thrown all over the page · lemon → squeeze + juice · sheet → the cone pipes it again
     The bowl, chai, sketchbook, marigolds and lemon also play when you hover over them.
       cones, oil, cotton → wiggle
   With "Reduce motion" or "Simple view" it's a still picture.
   (Earlier versions are saved in hero-phone.js and hero-ring.js.)
   EDIT the captions in the CAPTIONS list below.
   ========================================================= */
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const body = document.body;
  const svg = document.getElementById("desk");
  const reduced = () => body.classList.contains("reduce-motion") || body.classList.contains("simple");
  const small = () => matchMedia("(max-width:860px)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (p, a, b) => { const t = clamp((p - a) / (b - a)); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (c1, c2, t) => "rgb(" + c1.map((v, i) => Math.round(lerp(v, c2[i], t))).join(",") + ")";
  if (!svg) return;

  /* [name, what it is / what it's for]: a mini henna lesson for people new to it */
  const CAPTIONS = {
    bowl:   ["Henna paste", "Crushed henna leaves, lemon juice and oil, mixed by hand and rested overnight so the dye releases."],
    chai:   ["Chai", "A bridal session can take 4 to 6 hours. This keeps me going. Click to sip ☕"],
    book:   ["Sketchbook", "Every design starts on paper, whether it's for a bride's hands or an app screen."],
    sheet:  ["Practice sheet", "Atlanta, in henna. Watch the stain deepen… or click to see how it began."],
    flowers:["Marigolds", "The flower of South Asian weddings, where bridal henna is a celebration of its own."],
    lemon:  ["Lemon and sugar", "Dabbed on drying henna so it sticks longer and stains darker."],
    cones:  ["Henna cones", "Like tiny piping bags. A gentle squeeze draws lines as fine as a hair."],
    oil:    ["Eucalyptus oil", "A few drops go into the paste. It helps the stain go from orange to a deep, dark brown."],
    notes:  ["Sticky notes", "Where research lives: what users said, and where they got stuck."],
    swatches:["Color palette", "Henna browns and golds, checked for contrast before they go on screen."],
    stylus: ["Stylus", "For sketching wireframes. Same steady hand, different tool."],
    cotton: ["Cotton", "For dabbing on the lemon and sugar, and for tiny clean-ups."]
  };

  const el = (parent, tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
  const rr = (x, y, w, h, r) => `M${x + r},${y} H${x + w - r} A${r},${r} 0 0 1 ${x + w},${y + r} V${y + h - r} A${r},${r} 0 0 1 ${x + w - r},${y + h} H${x + r} A${r},${r} 0 0 1 ${x},${y + h - r} V${y + r} A${r},${r} 0 0 1 ${x + r},${y} Z`;
  const petalD = (r1, r2, w) => `M0,${-r1} C${w},${-(r1 + (r2 - r1) * .3)} ${w * .7},${-(r2 - (r2 - r1) * .15)} 0,${-r2} C${-w * .7},${-(r2 - (r2 - r1) * .15)} ${-w},${-(r1 + (r2 - r1) * .3)} 0,${-r1}Z`;
  const leafD = "M0,0 C4,-4 4,-10 0,-14 C-4,-10 -4,-4 0,0Z";

  /* ---------- gradients, textures and light ---------- */
  const defs = el(svg, "defs");
  const lg = (id, stops, x1 = 0, y1 = 0, x2 = 1, y2 = 1) => { const g = el(defs, "linearGradient", { id, x1, y1, x2, y2 }); stops.forEach(([o, c, a = 1]) => el(g, "stop", { offset: o, "stop-color": c, "stop-opacity": a })); };
  const rg = (id, stops, cx = .38, cy = .32, r = .78) => { const g = el(defs, "radialGradient", { id, cx, cy, r }); stops.forEach(([o, c, a = 1]) => el(g, "stop", { offset: o, "stop-color": c, "stop-opacity": a })); };
  /* wood, linen and paper textures (generated noise, so nothing to download) */
  const tex = (id, freq, oct, matrix, seed = 2) => {
    const f = el(defs, "filter", { id, x: 0, y: 0, width: 1, height: 1 });
    el(f, "feTurbulence", { type: "fractalNoise", baseFrequency: freq, numOctaves: oct, seed, result: "n" });
    el(f, "feColorMatrix", { in: "n", type: "matrix", values: matrix, result: "c" });
    el(f, "feComposite", { in: "c", in2: "SourceGraphic", operator: "in", result: "t" });
    const m = el(f, "feMerge"); el(m, "feMergeNode", { in: "SourceGraphic" }); el(m, "feMergeNode", { in: "t" });
  };
  tex("wood", "0.0035 0.09", 4, "0 0 0 0 .2  0 0 0 0 .1  0 0 0 0 .04  0 0 0 2.4 -.85", 7);
  tex("linen", "0.9 0.9", 2, "0 0 0 0 .45  0 0 0 0 .36  0 0 0 0 .25  0 0 0 .55 -.18", 3);
  tex("paperTex", "1.3", 2, "0 0 0 0 .5  0 0 0 0 .44  0 0 0 0 .36  0 0 0 .35 -.12", 5);
  tex("leather", "0.6", 3, "0 0 0 0 .1  0 0 0 0 .05  0 0 0 0 .02  0 0 0 .8 -.25", 9);
  /* realistic shadows: light comes from the top left */
  const shadow = el(defs, "filter", { id: "lift", x: "-30%", y: "-30%", width: "170%", height: "180%" });
  el(shadow, "feDropShadow", { dx: 1, dy: 2, stdDeviation: 1.4, "flood-color": "#2A1608", "flood-opacity": .3, result: "a" });
  el(shadow, "feDropShadow", { in: "a", dx: 7, dy: 10, stdDeviation: 8, "flood-color": "#2A1608", "flood-opacity": .22 });
  const fluff = el(defs, "filter", { id: "fluff", x: "-20%", y: "-20%", width: "140%", height: "140%" });
  el(fluff, "feTurbulence", { type: "fractalNoise", baseFrequency: .35, numOctaves: 2, result: "n" });
  el(fluff, "feDisplacementMap", { in: "SourceGraphic", in2: "n", scale: 5, xChannelSelector: "R", yChannelSelector: "G" });
  /* materials */
  lg("tableEdge", [[0, "#B07A4C"], [1, "#6E4526"]]);
  lg("matGrad", [[0, "#F3EADB"], [1, "#E6D7BF"]]);
  rg("clay", [[0, "#C9925C"], [.55, "#A56B3D"], [1, "#7C4C28"]]);
  rg("clayIn", [[0, "#6E4424"], [1, "#94603A"]], .62, .66, .7);
  rg("paste", [[0, "#7A6A3F"], [.6, "#56472A"], [1, "#3A2F19"]]);
  lg("stickWood", [[0, "#D9B888"], [.5, "#C49A68"], [1, "#9C7448"]], 0, 0, 1, 0);
  rg("saucer", [[0, "#FFFFFF"], [.75, "#F4ECE0"], [1, "#DCCDB6"]]);
  rg("cup", [[0, "#FFFFFF"], [.8, "#F3EADC"], [1, "#D8C8AE"]]);
  rg("chai", [[0, "#DDAE7A"], [.7, "#C08550"], [1, "#9E6838"]], .4, .38, .7);
  lg("handle", [[0, "#FFFFFF"], [1, "#D9CAB3"]]);
  lg("cover", [[0, "#6B3E22"], [1, "#3A2010"]]);
  lg("pageL", [[0, "#FFFDF8"], [.82, "#F6EEE0"], [1, "#DCCBB0"]], 0, 0, 1, 0);
  lg("pageR", [[0, "#DCCBB0"], [.18, "#F6EEE0"], [1, "#FFFDF8"]], 0, 0, 1, 0);
  lg("paper", [[0, "#FFFEFA"], [1, "#F6EFE3"]]);
  lg("curl", [[0, "#E9DDC8"], [1, "#FFFDF8"]]);
  rg("mari", [[0, "#FBD27A"], [.6, "#F3A23A"], [1, "#D9731A"]], .5, .3, .9);
  rg("mariIn", [[0, "#F6B54A"], [1, "#C8601A"]], .5, .4, .8);
  rg("mariC", [[0, "#9A4A12"], [1, "#6B300A"]]);
  lg("rind", [[0, "#F7D04A"], [1, "#D9A21C"]]);
  rg("flesh", [[0, "#FFF6BC"], [.7, "#F8DC66"], [1, "#EFC63E"]], .5, .5, .6);
  lg("amber", [[0, "#C58434"], [.45, "#8F521C"], [1, "#5E3110"]], 0, 0, 0, 1);
  lg("glassHi", [[0, "#FFFFFF", .55], [1, "#FFFFFF", 0]], 0, 0, 0, 1);
  lg("cello", [[0, "#F3E8D6", .95], [.5, "#E2CFB2", .9], [1, "#CDB58F", .95]], 0, 0, 0, 1);
  rg("cotton", [[0, "#FFFFFF"], [.75, "#F4F0EA"], [1, "#DCD5CA"]]);
  rg("light", [[0, "#FFF6E6", .32], [.5, "#FFF6E6", .06], [1, "#FFF6E6", 0]], .18, .1, .9);
  rg("vignette", [[0, "#000", 0], [.7, "#000", 0], [1, "#2A1608", .28]], .5, .5, .75);

  /* ---------- the table: wood, with a linen mat on top ---------- */
  const scene = el(svg, "g", { class: "scene" });
  el(scene, "path", { d: rr(-300, -210, 600, 420, 26), fill: "url(#tableEdge)" });
  el(scene, "path", { d: rr(-296, -206, 592, 410, 23), fill: "#93623A", filter: "url(#wood)" });
  const mat = el(scene, "g", { filter: "url(#lift)" });
  el(mat, "path", { d: rr(-272, -186, 544, 372, 10), fill: "url(#matGrad)" });
  el(mat, "path", { d: rr(-272, -186, 544, 372, 10), fill: "#EFE4D2", filter: "url(#linen)", opacity: .9 });
  /* embroidered henna border, in gold thread */
  el(scene, "path", { d: rr(-258, -172, 516, 344, 6), class: "k-stitch" });
  for (let i = 0; i < 60; i++){ const x = -246 + i * 8.4; el(scene, "circle", { cx: x.toFixed(1), cy: -180, r: 1.2, class: "k-bead" }); el(scene, "circle", { cx: x.toFixed(1), cy: 180, r: 1.2, class: "k-bead" }); }
  [[-250, -164, 0], [250, -164, 90], [250, 164, 180], [-250, 164, 270]].forEach(([x, y, r]) =>
    el(scene, "path", { d: "M0,0 C10,-2 16,6 12,14 C8,20 0,18 0,12 C0,8 4,6 6,8", transform: `translate(${x} ${y}) rotate(${r})`, class: "k-corner" }));

  /* every desk item is a focusable, clickable group with a caption */
  const items = {};
  const item = (key, parent = scene) => {
    const g = el(parent, "g", { class: "it it-" + key, tabindex: 0, role: "button", "aria-label": CAPTIONS[key] ? CAPTIONS[key].join(": ") : key, filter: "url(#lift)" });
    items[key] = g; return g;
  };

  /* bowl of henna paste with a wooden stirring stick (top left) */
  const bowl = item("bowl");
  el(bowl, "circle", { cx: -200, cy: -110, r: 50, fill: "url(#clay)" });
  el(bowl, "circle", { cx: -200, cy: -110, r: 49, class: "k-rimlight" });
  el(bowl, "circle", { cx: -200, cy: -110, r: 42, fill: "url(#clayIn)" });
  el(bowl, "circle", { cx: -200, cy: -110, r: 37, fill: "url(#paste)" });
  el(bowl, "path", { d: "M-226,-108 C-216,-126 -190,-128 -176,-114 M-222,-96 C-206,-90 -190,-96 -182,-104", class: "k-swirl" });
  el(bowl, "ellipse", { cx: -214, cy: -124, rx: 10, ry: 5, transform: "rotate(-30 -214 -124)", class: "k-spec" });
  el(bowl, "ellipse", { cx: -190, cy: -98, rx: 3, ry: 1.6, class: "k-spec" });
  const stick = el(bowl, "g", { class: "stick" });
  el(stick, "path", { d: rr(-203, -178, 7, 80, 3.5), fill: "url(#stickWood)" });
  el(stick, "path", { d: "M-200,-170 V-104", class: "k-grain" });
  el(stick, "path", { d: rr(-203, -120, 7, 22, 3.5), class: "k-stick-paste" });
  const bubbles = el(bowl, "g");

  /* chai in a ceramic cup on a saucer, steam rising (top right) */
  const chai = item("chai");
  el(chai, "circle", { cx: 205, cy: -112, r: 56, fill: "url(#saucer)" });
  el(chai, "circle", { cx: 205, cy: -112, r: 45, class: "k-saucer-ring" });
  el(chai, "path", { d: "M244,-126 C270,-130 272,-94 244,-98", class: "k-handle" });
  el(chai, "path", { d: "M244,-126 C270,-130 272,-94 244,-98", class: "k-handle-in" });
  el(chai, "circle", { cx: 205, cy: -112, r: 39, fill: "url(#cup)" });
  el(chai, "circle", { cx: 205, cy: -112, r: 38, class: "k-cup-rim" });
  const tea = el(chai, "circle", { cx: 205, cy: -112, r: 32, fill: "url(#chai)" });
  el(chai, "circle", { cx: 205, cy: -112, r: 30.5, class: "k-foam" });
  el(chai, "ellipse", { cx: 193, cy: -124, rx: 11, ry: 5, transform: "rotate(-30 193 -124)", class: "k-spec soft" });
  const chaiFx = el(chai, "g");
  const steam = el(scene, "g", { class: "steam" });
  [[190, 0], [205, .8], [220, 1.6]].forEach(([x, d]) => el(steam, "path", { d: `M${x},-150 C${x - 8},-162 ${x + 8},-170 ${x},-184`, class: "k-steam", style: `animation-delay:-${d}s` }));

  /* open sketchbook, leather cover and a ribbon (bottom left) */
  const book = item("book");
  const bk = el(book, "g", { transform: "rotate(-5 -194 90)" });
  el(bk, "path", { d: rr(-278, 28, 168, 124, 9), fill: "url(#cover)" });
  el(bk, "path", { d: rr(-278, 28, 168, 124, 9), fill: "#4A2C17", filter: "url(#leather)", opacity: .7 });
  el(bk, "path", { d: "M-200,150 L-196,186 L-191,178 L-186,186 L-188,150 Z", class: "k-ribbon" });
  const pages = el(bk, "g");
  el(pages, "path", { d: rr(-271, 35, 77, 110, 3), fill: "url(#pageL)" });
  el(pages, "path", { d: rr(-194, 35, 77, 110, 3), fill: "url(#pageR)" });
  el(pages, "path", { d: rr(-271, 35, 154, 110, 3), fill: "#FFFDF8", filter: "url(#paperTex)", opacity: .5 });
  el(pages, "path", { d: "M-194,35 V145", class: "k-spine" });
  const pageA = el(pages, "g", { class: "page-a" });
  for (let k = 0; k < 6; k++) el(pageA, "path", { d: petalD(5, 18, 7), transform: `translate(-232 80) rotate(${k * 60})`, class: "k-pencil" });
  el(pageA, "path", { d: "M-256,126 C-246,108 -226,128 -210,112", class: "k-pencil" });
  el(pageA, "path", { d: rr(-180, 46, 48, 88, 8), class: "k-pencil" });
  el(pageA, "path", { d: rr(-174, 54, 36, 22, 4) + rr(-174, 82, 36, 6, 3) + rr(-174, 94, 24, 6, 3) + rr(-174, 112, 36, 12, 6), class: "k-pencil" });
  const pageB = el(pages, "g", { class: "page-b" });
  el(pageB, "path", { d: "M-232,56 C-210,56 -204,76 -206,90 C-208,110 -226,124 -244,120 C-258,116 -262,100 -254,90 C-246,80 -232,84 -230,92", class: "k-pencil" });
  [[-250, 64], [-214, 128], [-262, 108]].forEach(([cx, cy]) => el(pageB, "circle", { cx, cy, r: 1.8, class: "k-pencil-dot" }));
  el(pageB, "path", { d: "M-180,60 H-134 M-180,74 H-150 M-180,88 H-140 M-180,102 H-160", class: "k-pencil" });
  el(pageB, "path", { d: "M-176,120 l8,8 l14,-16", class: "k-pencil" });

  /* the practice sheet: textured paper with a soft curled corner */
  const sheet = item("sheet");
  const SHEET = "translate(-4 -6) scale(.86) translate(4 6)";
  el(sheet, "path", { d: rr(-120, -144, 232, 274, 3), transform: SHEET, fill: "url(#paper)" });
  el(sheet, "path", { d: rr(-120, -144, 232, 274, 3), transform: SHEET, fill: "#FFFDF8", filter: "url(#paperTex)", opacity: .6 });
  el(sheet, "path", { d: "M112,104 L112,130 L86,130 Z", transform: SHEET, fill: "url(#curl)", class: "k-curl" });
  const design = el(sheet, "g", { class: "design", transform: SHEET });
  const pipeParts = [];
  const D = (d, extra = {}) => { const p = el(design, "path", Object.assign({ d }, extra)); pipeParts.push(p); return p; };
  /* the Atlanta skyline, in henna line art (left to right):
     SkyView Ferris wheel · Westin Peachtree Plaza · 191 Peachtree · Bank of America Plaza ·
     One Atlantic Center · Truist Plaza · smaller towers */
  const dotPos = [];
  /* ground line */
  D("M-104,84 H100");
  /* SkyView Ferris wheel */
  D("M-80,14 a28,28 0 1 0 0.01,0");
  D("M-80,24 a18,18 0 1 0 0.01,0");
  for (let k = 0; k < 8; k++){ const t = k / 8 * Math.PI * 2; D(`M-80,42 L${(-80 + Math.cos(t) * 28).toFixed(1)},${(42 + Math.sin(t) * 28).toFixed(1)}`); dotPos.push([-80 + Math.cos(t + .39) * 31, 42 + Math.sin(t + .39) * 31]); }
  D("M-94,84 L-80,42 L-66,84");
  /* Westin Peachtree Plaza (the round tower) */
  D("M-58,84 V-34 C-58,-41 -38,-41 -38,-34 V84");
  D("M-58,-34 C-58,-28 -38,-28 -38,-34");
  D("M-58,-8 C-58,-3 -38,-3 -38,-8");
  D("M-58,30 C-58,35 -38,35 -38,30");
  /* 191 Peachtree, with its twin crowns */
  D("M-34,84 V-50 H-12 V84");
  D("M-32,-50 V-60 C-32,-67 -24,-67 -24,-60 V-50");
  D("M-22,-50 V-60 C-22,-67 -14,-67 -14,-60 V-50");
  for (let r = 0; r < 6; r++) for (let c = 0; c < 2; c++) dotPos.push([-28 + c * 10, -36 + r * 18]);
  /* Bank of America Plaza: the tallest, with a lattice pyramid and spire */
  D("M-8,84 V-70 L5,-102 L18,-70 V84");
  D("M-8,-70 H18 M-3,-82 H13 M1,-92 H9");
  D("M5,-102 V-130");
  D("M5,-60 V70");
  /* One Atlantic Center, with its pyramid roof */
  D("M22,84 V-48 L34,-78 L46,-48 V84");
  D("M34,-78 V-88");
  D("M28,-40 V76 M40,-40 V76");
  /* Truist Plaza, stepped top */
  D("M50,84 V-26 H54 V-38 H68 V-26 H72 V84");
  D("M61,-38 V-50");
  for (let r = 0; r < 5; r++) for (let c = 0; c < 2; c++) dotPos.push([57 + c * 8, -14 + r * 18]);
  /* smaller towers on the right */
  D("M75,84 V12 H86 V-2 H98 V84");
  /* sun with a ring of dots, and birds */
  D("M-62,-104 a10,10 0 1 0 0.01,0");
  for (let k = 0; k < 12; k++){ const t = k / 12 * Math.PI * 2; dotPos.push([-62 + Math.cos(t) * 17, -94 + Math.sin(t) * 17]); }
  D("M40,-118 q5,-6 10,0 q5,-6 10,0");
  D("M66,-104 q4,-5 8,0 q4,-5 8,0");
  /* henna lace under the city */
  let lace = "M-100,104"; for (let x = -100; x < 90; x += 19) lace += ` q9.5,-14 19,0`; D(lace);
  for (let x = -90; x < 100; x += 19) dotPos.push([x, 114]);
  const designDots = el(design, "g", { class: "ddots" });
  const dots = dotPos.map(([cx, cy]) => el(designDots, "circle", { cx: cx.toFixed(1), cy: cy.toFixed(1), r: 2, class: "d-dot" }));

  /* the phone wireframe the skyline turns into as you scroll (same henna lines) */
  const wire = el(sheet, "g", { class: "design wire", transform: SHEET });
  const wireParts = [];
  const W = d => { const p = el(wire, "path", { d }); wireParts.push(p); return p; };
  W(rr(-50, -128, 92, 206, 16));                          /* phone body */
  W(rr(-44, -121, 80, 192, 11));                          /* screen */
  W(rr(-14, -117, 24, 6, 3));                             /* notch */
  W("M44,-92 V-74 M-52,-96 V-84 M-52,-78 V-66");          /* side buttons */
  W("M-36,-100 a5,5 0 1 0 0.01,0");                       /* avatar */
  W("M-26,-96 H0 M-26,-90 H-10");                         /* name lines */
  W("M24,-98 H30 M24,-94 H30 M24,-90 H30");               /* menu */
  W(rr(-36, -80, 64, 50, 7));                             /* hero card */
  W("M-4,-38 C-26,-40 -24,-68 -6,-70 C8,-72 12,-58 4,-52 C-2,-48 -8,-54 -4,-58");  /* a henna paisley on the card */
  W("M-36,-20 H18 M-36,-12 H8 M-36,-4 H14");              /* text lines */
  W(rr(-36, 6, 30, 26, 5)); W(rr(-2, 6, 30, 26, 5));      /* two tiles */
  W("M-30,24 H-14 M4,24 H20");
  W(rr(-36, 40, 64, 14, 7));                              /* button */
  W("M-14,47 H6");
  W("M-16,64 H8");                                        /* home indicator */

  /* marigolds: layered, ruffled petals (right, middle) */
  const flowers = item("flowers");
  const marigold = (cx, cy, r) => {
    let seed = cx * 7 + cy * 13; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    /* outer frilly ring, then denser, smaller ruffles toward the centre */
    [[1, 22, "url(#mari)"], [.8, 20, "url(#mari)"], [.6, 16, "url(#mariIn)"], [.4, 12, "url(#mariIn)"]].forEach(([k, n, fill]) => {
      for (let i = 0; i < n; i++){
        const t = (i + rnd() * .6) / n * Math.PI * 2, d = r * k * (.55 + rnd() * .12), px = cx + Math.cos(t) * d, py = cy + Math.sin(t) * d;
        const w = r * k * (.42 + rnd() * .16), hh = r * k * (.42 + rnd() * .14);
        /* a ruffled, scalloped petal pointing outward */
        el(flowers, "path", { d: `M0,${hh * .3} C${-w * .9},${hh * .2} ${-w},${-hh * .5} ${-w * .55},${-hh * .8} Q${-w * .3},${-hh * 1.05} 0,${-hh * .85} Q${w * .3},${-hh * 1.1} ${w * .55},${-hh * .8} C${w},${-hh * .5} ${w * .9},${hh * .2} 0,${hh * .3}Z`,
          transform: `translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${(t * 57.3 + 90 + (rnd() - .5) * 30).toFixed(0)})`, fill, class: "k-mpetal" });
      }
    });
    el(flowers, "circle", { cx, cy, r: r * .16, fill: "url(#mariC)" });
    for (let i = 0; i < 7; i++){ const t = i / 7 * Math.PI * 2; el(flowers, "circle", { cx: (cx + Math.cos(t) * r * .1).toFixed(1), cy: (cy + Math.sin(t) * r * .1).toFixed(1), r: .9, class: "k-pollen" }); }
  };
  marigold(176, 10, 26); marigold(224, 54, 20); marigold(150, 64, 16);
  [[250, 0, 20], [128, 30, 80], [204, 98, 140], [116, 98, 200], [262, 92, 40]].forEach(([x, y, r]) =>
    el(flowers, "path", { d: "M-6,0 C-4,-3.5 4,-4 6,0 C4,3 -4,3 -6,0Z", transform: `translate(${x} ${y}) rotate(${r})`, fill: "url(#mari)", class: "k-mpetal" }));
  const petalFx = el(scene, "g");

  /* lemon slices with rind, pith, juicy segments and seeds; sugar crystals (bottom right) */
  const lemon = item("lemon");
  const slice = (cx, cy, r) => {
    el(lemon, "circle", { cx, cy, r, fill: "url(#rind)" });
    el(lemon, "circle", { cx, cy, r: r * .9, class: "k-pith" });
    for (let k = 0; k < 9; k++){
      const a0 = k / 9 * Math.PI * 2 + .06, a1 = (k + 1) / 9 * Math.PI * 2 - .06, R = r * .82, rin = r * .1;
      el(lemon, "path", { d: `M${(cx + Math.cos(a0) * rin).toFixed(1)},${(cy + Math.sin(a0) * rin).toFixed(1)} L${(cx + Math.cos(a0) * R).toFixed(1)},${(cy + Math.sin(a0) * R).toFixed(1)} A${R},${R} 0 0 1 ${(cx + Math.cos(a1) * R).toFixed(1)},${(cy + Math.sin(a1) * R).toFixed(1)} L${(cx + Math.cos(a1) * rin).toFixed(1)},${(cy + Math.sin(a1) * rin).toFixed(1)} Z`, fill: "url(#flesh)" });
    }
    [[.45, .3], [-.35, .5]].forEach(([dx, dy]) => el(lemon, "ellipse", { cx: cx + dx * r * .5, cy: cy + dy * r * .4, rx: 1.8, ry: 1, class: "k-seed" }));
    el(lemon, "ellipse", { cx: cx - r * .3, cy: cy - r * .35, rx: r * .28, ry: r * .12, transform: `rotate(-30 ${cx - r * .3} ${cy - r * .35})`, class: "k-spec soft" });
  };
  slice(236, 150, 27); slice(196, 167, 21);
  [[158, 146], [165, 156], [152, 158], [170, 141], [160, 166], [146, 150]].forEach(([cx, cy], i) => el(lemon, "rect", { x: cx, y: cy, width: 3.2, height: 3.2, transform: `rotate(${i * 25} ${cx} ${cy})`, class: "k-sugar" }));
  const drops = el(scene, "g");

  /* eucalyptus oil in an amber glass bottle */
  const oil = item("oil");
  const og = el(oil, "g", { transform: "rotate(-14 110 160)" });
  el(og, "path", { d: rr(70, 146, 62, 28, 10), fill: "url(#amber)" });
  el(og, "path", { d: rr(74, 149, 54, 6, 3), fill: "url(#glassHi)" });
  el(og, "path", { d: rr(128, 153, 6, 14, 2), fill: "#5E3110" });
  el(og, "path", { d: rr(133, 151, 15, 18, 3), class: "k-oil-cap" });
  el(og, "path", { d: "M136,152 V168 M139,152 V168 M142,152 V168 M145,152 V168", class: "k-cap-ribs" });
  el(og, "path", { d: rr(82, 152, 34, 17, 2), class: "k-oil-label" });
  el(og, "path", { d: "M88,161 C93,155 99,167 108,159", class: "k-oil-leaf" });
  el(og, "path", { d: "M92,166 H110", class: "k-oil-text" });

  /* fluffy cotton balls */
  const cotton = item("cotton");
  [[8, 172, 11], [28, 166, 9.5], [21, 183, 8.5]].forEach(([cx, cy, r]) => el(cotton, "circle", { cx, cy, r, fill: "url(#cotton)", filter: "url(#fluff)" }));

  /* spare cones, wrapped in cellophane */
  const cones = item("cones");
  [[-74, 172, -8], [-40, 186, 10]].forEach(([x, y, r]) => {
    const c = el(cones, "g", { transform: `translate(${x} ${y}) rotate(${r})` });
    el(c, "path", { d: "M-34,0 L26,-9 L26,9 Z", fill: "url(#cello)", class: "k-cone" });
    el(c, "path", { d: "M-20,-1 L22,-6", class: "k-crease" });
    el(c, "path", { d: "M-28,1 L-14,0 L-14,2 Z", class: "k-cone-paste" });
    el(c, "path", { d: "M26,-9 L38,-10 L38,10 L26,9 Z", class: "k-cone-cap" });
    el(c, "path", { d: "M-10,-3.5 L20,-7.5", class: "k-cello-hi" });
  });
  /* ---------- UX tools on the desk ---------- */
  /* sticky notes from user research (left, middle) */
  const notes = item("notes");
  notes.setAttribute("transform", "translate(-4 -8)");
  const n1 = el(notes, "g", { transform: "rotate(-8 -232 -20)" });
  el(n1, "rect", { x: -262, y: -50, width: 58, height: 58, rx: 2, fill: "#F6D77A" });
  el(n1, "rect", { x: -262, y: -50, width: 58, height: 9, fill: "#EFC95E" });
  el(n1, "path", { d: "M-254,-30 H-214 M-254,-22 H-222 M-254,-14 H-218", stroke: "#8A6A2A", "stroke-width": 1.4, "stroke-linecap": "round", opacity: .6 });
  el(n1, "path", { d: "M-254,-4 l5,5 l9,-11", stroke: "#4A7A46", "stroke-width": 1.8, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" });
  const n2 = el(notes, "g", { transform: "rotate(7 -196 -6)" });
  el(n2, "rect", { x: -222, y: -32, width: 52, height: 52, rx: 2, fill: "#F4BFA6" });
  el(n2, "rect", { x: -214, y: -24, width: 36, height: 22, rx: 3, fill: "none", stroke: "#8A4F22", "stroke-width": 1.2, opacity: .7 });
  el(n2, "path", { d: "M-214,4 H-186 M-214,11 H-194", stroke: "#8A4F22", "stroke-width": 1.3, "stroke-linecap": "round", opacity: .6 });
  el(n2, "circle", { cx: -196, cy: -30, r: 3.2, fill: "#C0392B", opacity: .85 });

  /* color palette swatches (top, centre) */
  const swatches = item("swatches");
  const sw = el(swatches, "g", { transform: "rotate(-3 -6 -152)" });
  el(sw, "rect", { x: -68, y: -168, width: 124, height: 32, rx: 6, fill: "#FFFDF8" });
  ["#F5EDE2", "#E2CFB4", "#B9893F", "#8A4F22", "#4A2C17"].forEach((c, i) => el(sw, "circle", { cx: -52 + i * 22, cy: -152, r: 8.5, fill: c, stroke: "rgba(74,44,23,.25)", "stroke-width": .8 }));
  el(sw, "path", { d: "M47,-158 l3,3 l6,-7", stroke: "#4A7A46", "stroke-width": 1.6, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" });

  /* a stylus for wireframes (between the sheet and the marigolds) */
  const stylus = item("stylus");
  const st = el(stylus, "g", { transform: "rotate(9 116 -10)" });
  el(st, "rect", { x: 112.5, y: -66, width: 7, height: 96, rx: 3.5, fill: "#F3EEE7", stroke: "rgba(74,44,23,.25)", "stroke-width": .6 });
  el(st, "rect", { x: 112.5, y: -66, width: 7, height: 10, rx: 3, fill: "#D9D2C7" });
  el(st, "path", { d: "M112.5,30 L116,42 L119.5,30 Z", fill: "#E9E2D8", stroke: "rgba(74,44,23,.25)", "stroke-width": .6 });
  el(st, "path", { d: "M115,38 L116,42 L117,38 Z", fill: "#4A2C17" });
  el(st, "path", { d: "M114.5,-50 V18", stroke: "#fff", "stroke-width": 1.2, opacity: .7, "stroke-linecap": "round" });

  /* an invisible hit area behind each item, so the gaps between petals, slices etc. are clickable too */
  Object.values(items).forEach(g => {
    const b = g.getBBox();
    const hit = document.createElementNS(NS, "rect");
    hit.setAttribute("x", b.x - 4); hit.setAttribute("y", b.y - 4); hit.setAttribute("width", b.width + 8); hit.setAttribute("height", b.height + 8);
    hit.setAttribute("rx", 12); hit.setAttribute("fill", "transparent");
    g.insertBefore(hit, g.firstChild);
  });

  /* soft light from the top left, and a gentle vignette */
  el(svg, "path", { d: rr(-300, -210, 600, 420, 26), fill: "url(#light)", class: "k-overlay" });
  el(svg, "path", { d: rr(-300, -210, 600, 420, 26), fill: "url(#vignette)", class: "k-overlay" });

  /* the cone that pipes (tip at 0,0) */
  const cone = el(svg, "g", { class: "pcone", opacity: 0 });
  el(cone, "path", { d: "M0,0 L18,-38 L31,-27 Z", fill: "#E2CFB4", stroke: "#4A2C17", "stroke-width": 1.5, "stroke-linejoin": "round" });
  el(cone, "path", { d: "M8,-13 L23,-33 M12,-21 L28,-31", stroke: "#4A2C17", "stroke-width": .8, opacity: .4 });
  el(cone, "path", { d: "M18,-38 L25,-49 L40,-35 L31,-27", fill: "#B9893F", stroke: "#4A2C17", "stroke-width": 1.5, "stroke-linejoin": "round" });
  el(cone, "path", { d: "M0,0 L4.5,-9 L7.3,-6.8 Z", fill: "#6B3E1C" });

  /* ---------- piping the design ---------- */
  const toSvg = (p, node) => {   /* a point on a (possibly transformed) path, in svg coordinates */
    const m = node.getCTM(), r = svg.getCTM().inverse().multiply(m);
    return { x: r.a * p.x + r.c * p.y + r.e, y: r.b * p.x + r.d * p.y + r.f };
  };
  const lens = pipeParts.map(p => p.getTotalLength());
  const FRESH = [196, 128, 62], STAIN = [74, 44, 23];
  let tip = { x: 120, y: -40 }, piping = false;
  const place = (x, y, lift = 0, rot = -6) => { tip = { x, y }; cone.setAttribute("transform", `translate(${x.toFixed(1)} ${(y - lift).toFixed(1)}) rotate(${rot})`); };
  const frame = () => new Promise(r => requestAnimationFrame(r));
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const hideDesign = () => { pipeParts.forEach((p, i) => { p.style.strokeDasharray = lens[i]; p.style.strokeDashoffset = lens[i]; }); dots.forEach(d => d.classList.remove("on")); };
  const showDesign = () => { pipeParts.forEach(p => { p.style.strokeDasharray = "none"; p.style.strokeDashoffset = 0; }); dots.forEach(d => d.classList.add("on")); cone.setAttribute("opacity", 0); };
  async function travel(x, y, ms){
    const f = { ...tip }, t0 = performance.now();
    for (;;){ if (reduced()) throw "stop"; const t = clamp((performance.now() - t0) / ms), e = ease(t); place(lerp(f.x, x, e), lerp(f.y, y, e), Math.sin(t * Math.PI) * 12); if (t >= 1) break; await frame(); }
  }
  /* no piping animation: the design is already on the sheet and simply fades in */
  async function pipe(){
    if (piping) return; piping = true;
    showDesign();
    if (!reduced()){
      design.style.transition = "none"; design.style.opacity = 0;
      await frame(); await frame();
      design.style.transition = "opacity 1.4s ease"; design.style.opacity = 1;
      await wait(1400);
      design.style.transition = "opacity .15s linear";
    }
    piping = false;
  }

  async function pipeAnim(){
    if (piping) return; piping = true;
    hideDesign();
    if (reduced()){ showDesign(); piping = false; return; }
    cone.setAttribute("opacity", 1);
    try {
      for (let i = 0; i < pipeParts.length; i++){
        const p = pipeParts[i], len = lens[i], st = toSvg(p.getPointAtLength(0), p);
        await travel(st.x, st.y, 110);
        const ms = Math.max(160, len / 700 * 1000), t0 = performance.now();
        for (;;){
          if (reduced()) throw "stop";
          const t = clamp((performance.now() - t0) / ms), e = ease(t);
          p.style.strokeDashoffset = len * (1 - e);
          const pt = toSvg(p.getPointAtLength(len * e), p); place(pt.x, pt.y);
          if (t >= 1) break; await frame();
        }
      }
      for (const d of dots){ const q = toSvg({ x: +d.getAttribute("cx"), y: +d.getAttribute("cy") }, d); await travel(q.x, q.y, 45); d.classList.add("on"); }
      await travel(96, 104, 420);      /* rest the cone on the edge of the sheet */
      place(96, 104, 0, 28);
    } catch (e){ showDesign(); }
    piping = false;
  }

  /* ---------- scrolling stains the design darker ---------- */
  const stage = document.querySelector(".hero-scroll"), heroEl = document.querySelector(".hero");
  let stainAmt = 0;
  const setStain = s => { stainAmt = s; design.style.stroke = mix(FRESH, STAIN, s); design.style.setProperty("--dot", mix(FRESH, STAIN, s)); if (typeof wire !== "undefined") wire.style.stroke = mix(FRESH, STAIN, s); };
  setStain(0);
  /* scrolling also turns the skyline into a phone wireframe */
  const wireLens = wireParts.map(p => p.getTotalLength());
  let morphAmt = 0;
  const setMorph = m => {
    morphAmt = m;
    if (piping) return;
    const out = clamp(m / .5), inn = clamp((m - .25) / .65);
    /* the city softly sinks away… */
    design.style.opacity = 1 - out;
    design.setAttribute("transform", `${SHEET} translate(0 ${(out * 14).toFixed(1)})`);
    /* …while the phone is drawn in, line by line */
    wireParts.forEach((p, i) => { const L = wireLens[i] + 1; p.style.strokeDasharray = `${L} ${L}`; p.style.strokeDashoffset = L * (1 - clamp(inn * 1.25 - i * .02)); });
  };
  const scrollProgress = () => {
    if (small() || !stage) return clamp(scrollY / (innerHeight * .7));
    const travelPx = stage.offsetHeight - heroEl.offsetHeight;
    return travelPx > 0 ? clamp(-stage.getBoundingClientRect().top / travelPx / .8) : 0;
  };
  /* (no scroll hold any more: the skyline stays, and its stain deepens on its own) */
  setMorph(0);
  function stainOverTime(ms = 4000){
    const from = stainAmt, t0 = performance.now();
    const step = now => { const t = clamp((now - t0) / ms); setStain(lerp(from, 1, ease(t))); if (t < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  /* ---------- marigold petals thrown all over the page ---------- */
  let rain = null, petals = [], raining = false;
  const PETAL_COLORS = ["#EE9B2A", "#F3B043", "#E8862A", "#F6C25A", "#D9761E"];
  function throwPetals(){
    if (!rain){ rain = document.createElement("div"); rain.className = "petal-rain"; rain.setAttribute("aria-hidden", "true"); body.appendChild(rain); }
    const b = items.flowers.getBoundingClientRect(), ox = b.left + b.width / 2, oy = b.top + b.height / 2;
    const n = small() ? 28 : 55;
    for (let i = 0; i < n; i++){
      const e = document.createElement("span");
      const w = 8 + Math.random() * 9;
      e.style.width = w + "px"; e.style.height = (w * .58) + "px";
      e.style.background = PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0];
      rain.appendChild(e);
      const ang = Math.random() * Math.PI * 2, spd = 8 + Math.random() * 16;
      const reach = (innerWidth / 2 - ox) / 60;   /* lean the throw toward the middle of the page so petals reach everywhere */
      petals.push({ e, x: ox, y: oy, vx: Math.cos(ang) * spd * 2.1 + reach, vy: Math.sin(ang) * spd - 10, r: Math.random() * 360, vr: (Math.random() - .5) * 18,
        flip: Math.random() * 6.28, vf: .08 + Math.random() * .12, sway: Math.random() * 6.28, life: 1, decay: .0045 + Math.random() * .003 });
    }
    if (!raining){ raining = true; requestAnimationFrame(fall); }
  }
  function fall(){
    for (let i = petals.length - 1; i >= 0; i--){
      const p = petals[i];
      p.vx *= .97; p.vy = p.vy * .97 + .32;            /* air drag + gravity, so they float down */
      p.sway += .05; p.x += p.vx + Math.sin(p.sway) * .9; p.y += p.vy;
      p.r += p.vr; p.vr *= .99; p.flip += p.vf; p.life -= p.decay;
      if (p.life <= 0 || p.y > innerHeight + 40){ p.e.remove(); petals.splice(i, 1); continue; }
      p.e.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) rotate(${p.r.toFixed(0)}deg) scaleY(${Math.cos(p.flip).toFixed(2)})`;
      p.e.style.opacity = Math.min(1, p.life * 2.5).toFixed(2);
    }
    if (petals.length) requestAnimationFrame(fall); else raining = false;
  }

  /* ---------- the little desk tricks ---------- */
  const once = (node, cls, ms) => { node.classList.remove(cls); void node.getBoundingClientRect(); node.classList.add(cls); setTimeout(() => node.classList.remove(cls), ms); };
  const burst = (parent, make, n, ms = 1100) => { for (let i = 0; i < n; i++){ const e = make(i); parent.appendChild(e); setTimeout(() => e.remove(), ms); } };
  let sips = 0;
  const actions = {
    bowl(){
      once(stick, "stir", 1100);
      burst(bubbles, i => { const c = document.createElementNS(NS, "circle"); c.setAttribute("cx", -200 + Math.cos(i * 1.3) * 22); c.setAttribute("cy", -110 + Math.sin(i * 1.3) * 18); c.setAttribute("r", 2 + (i % 3)); c.setAttribute("class", "fx-bubble"); c.style.animationDelay = (i * .12) + "s"; return c; }, 7, 1500);
    },
    chaiHover(){
      once(steam, "puff", 1200);
      burst(chaiFx, i => { const c = document.createElementNS(NS, "circle"); c.setAttribute("cx", 205); c.setAttribute("cy", -112); c.setAttribute("r", 6); c.setAttribute("class", "fx-ripple"); c.style.animationDelay = (i * .25) + "s"; return c; }, 3, 1400);
    },
    chai(){
      sips++;
      const r = sips >= 4 ? 31 : 31 - sips * 4;
      tea.style.transition = "r .6s ease"; tea.setAttribute("r", r);
      if (sips >= 4){ sips = 0; setTimeout(() => tea.setAttribute("r", 31), 900); }   /* refill */
      once(steam, "puff", 1200);
    },
    book(){ once(pages, "flip", 700); setTimeout(() => pages.classList.toggle("flipped"), 350); },
    sheet(){
      if (morphAmt > .05){ once(items.sheet, "wiggle", 600); return; }
      if (!piping){ const keep = stainAmt; setStain(0); place(150, -40); pipeAnim().then(() => { setStain(reduced() ? 1 : keep); cone.setAttribute("opacity", 0); setMorph(morphAmt); }); }
    },
    flowers(){
      once(items.flowers, "sway", 900);
      throwPetals();
    },
    lemon(){
      once(items.lemon, "squeeze", 650);
      /* juice sprays from both slices */
      [[236, 150, 16], [196, 166, 10]].forEach(([cx, cy, n]) => {
        burst(drops, i => { const t = -Math.PI * .95 + (i / (n - 1)) * Math.PI * 1.1, d = 70 + (i % 3) * 22, e = document.createElementNS(NS, "circle");
          e.setAttribute("cx", cx); e.setAttribute("cy", cy); e.setAttribute("r", 2.6 + (i % 3) * 1.1); e.setAttribute("class", "fx-drop");
          e.style.setProperty("--dx", (Math.cos(t) * d).toFixed(0) + "px"); e.style.setProperty("--dy", (Math.sin(t) * d).toFixed(0) + "px");
          e.style.animationDelay = (i % 4) * .04 + "s"; return e; }, n, 1200);
        burst(drops, () => { const c = document.createElementNS(NS, "circle"); c.setAttribute("cx", cx); c.setAttribute("cy", cy); c.setAttribute("r", 8); c.setAttribute("class", "fx-splash"); return c; }, 1, 800);
      });
    },
    cones(){ once(items.cones, "wiggle", 700); },
    oil(){ once(items.oil, "wiggle", 700); },
    cotton(){ once(items.cotton, "puffy", 700); },
    notes(){ once(items.notes, "wiggle", 700); },
    swatches(){ once(items.swatches, "wiggle", 700); },
    stylus(){ once(items.stylus, "wiggle", 700); }
  };
  Object.entries(items).forEach(([key, g]) => {
    const go = () => { if (!reduced() && actions[key]) actions[key](); };
    g.addEventListener("click", go);
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); go(); } });
  });

  /* caption bubble that follows the pointer */
  const art = svg.closest(".hero-art");
  const tipBox = document.createElement("div"); tipBox.className = "desk-tip"; tipBox.setAttribute("aria-hidden", "true"); art.appendChild(tipBox);
  const showTip = (key, x, y) => {
    const [name, info] = CAPTIONS[key]; tipBox.innerHTML = ""; const b = document.createElement("strong"); b.textContent = name; const s = document.createElement("span"); s.textContent = info; tipBox.append(b, s);
    const r = art.getBoundingClientRect(), half = tipBox.offsetWidth / 2 + 6;
    const left = Math.min(Math.max(x - r.left, half), r.width - half);   /* keep the caption inside the desk */
    tipBox.style.left = left + "px"; tipBox.style.top = (y - r.top) + "px"; tipBox.classList.add("on");
  };
  Object.entries(items).forEach(([key, g]) => {
    g.addEventListener("pointermove", e => showTip(key, e.clientX, e.clientY));
    g.addEventListener("pointerleave", () => tipBox.classList.remove("on"));
    g.addEventListener("focus", () => { const b = g.getBoundingClientRect(); showTip(key, b.left + b.width / 2, b.top); });
    g.addEventListener("blur", () => tipBox.classList.remove("on"));
  });

  /* ---------- start: wait for the dried paste to be brushed away ---------- */
  hideDesign();
  const t0 = performance.now();
  (function waitForClear(){
    if (!document.querySelector(".paste") && performance.now() - t0 > 1500){
      setTimeout(() => {
        if (reduced()){ showDesign(); setStain(1); return; }
        pipe().then(() => setTimeout(() => stainOverTime(4200), 900));
      }, 400);
    } else setTimeout(waitForClear, 250);
  })();
  new MutationObserver(() => { if (reduced()){ showDesign(); setStain(1); setMorph(0); } }).observe(body, { attributes: true, attributeFilter: ["class"] });
})();
