/* =========================================================
   intro.js
   1) "The paste flakes off": the hero starts covered in dried henna
      paste. Brush it with the mouse and it cracks and flakes away,
      revealing the design underneath, just like real henna.
      Once about half is gone (or you scroll, tap, or use the keyboard)
      the rest crumbles off by itself. It only appears once per visit.
   0) A small greeting above the headline that changes with the time of day
   2) "What brings you here?": three buttons that guide each visitor
      to the part of the page meant for them, with a short note.
   Skipped with "Reduce motion" or "Simple view".
   ========================================================= */
(() => {
  const body = document.body;
  const hero = document.querySelector(".hero");
  const calm = () => body.classList.contains("reduce-motion") || body.classList.contains("simple");

  /* =====================  1) THE PASTE  ===================== */
  if (hero){
    const css = document.createElement("style");
    css.textContent = `
      .paste{position:fixed;inset:0;z-index:200;cursor:none;transition:opacity .9s ease}
      .paste.drying{opacity:0}
      .paste canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
      .paste-hint{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2;pointer-events:none;text-align:center;
        color:#F3E7D3;font-family:var(--serif,Georgia,serif);font-style:italic;font-weight:300;font-size:clamp(1.3rem,2.6vw,2rem);
        text-shadow:0 2px 14px rgba(20,14,10,.55);transition:opacity .6s,transform .6s}
      .paste-hint small{display:block;margin-top:.6rem;font-family:var(--sans,system-ui,sans-serif);font-style:normal;font-size:.72rem;
        letter-spacing:.24em;text-transform:uppercase;opacity:.75}
      .paste-hint.gone{opacity:0;transform:translate(-50%,-60%)}
      .flakes{position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:201}
    `;
    document.head.appendChild(css);

    const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const COL = ["#4F3E24", "#5A4729", "#463620", "#625031", "#3E3019"];
    const rnd = (a, b) => a + Math.random() * (b - a);
    const dpr = Math.min(devicePixelRatio || 1, 2);

    /* falling flakes live on their own canvas, shared by every coat of paste */
    const fx = document.createElement("canvas"); fx.className = "flakes"; fx.setAttribute("aria-hidden", "true"); body.appendChild(fx);
    const fctx = fx.getContext("2d");
    const flakes = [];
    const sizeFx = () => { fx.width = innerWidth * dpr; fx.height = innerHeight * dpr; fctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    sizeFx(); addEventListener("resize", sizeFx);
    let running = false;
    const kick = () => { if (!running){ running = true; requestAnimationFrame(step); } };
    function step(){
      fctx.clearRect(0, 0, innerWidth, innerHeight);
      for (let i = flakes.length - 1; i >= 0; i--){
        const f = flakes[i];
        f.vy += .32; f.vx *= .99; f.x += f.vx; f.y += f.vy; f.r += f.vr; f.life -= .012;
        if (f.y > innerHeight + 20 || f.life <= 0){ flakes.splice(i, 1); continue; }
        fctx.save(); fctx.translate(f.x, f.y); fctx.rotate(f.r); fctx.scale(f.s, f.s);
        fctx.globalAlpha = Math.min(1, f.life * 1.5);
        fctx.fillStyle = f.c; fctx.beginPath(); f.pts.forEach(([px, py], k) => k ? fctx.lineTo(px, py) : fctx.moveTo(px, py)); fctx.closePath(); fctx.fill();
        fctx.restore();
      }
      if (flakes.length) requestAnimationFrame(step); else running = false;
    }

    let coat = null;        /* the current layer of paste, if any */
    let clearedAt = 0;      /* when the last coat fell off */

    /* lay down a fresh coat of dried paste */
    function makePaste(again){
      if (coat || calm()) return;
      const wrap = document.createElement("div"); wrap.className = "paste" + (again ? " drying" : ""); wrap.setAttribute("aria-hidden", "true");
      const cvs = document.createElement("canvas"); wrap.appendChild(cvs);
      const hint = document.createElement("div"); hint.className = "paste-hint";
      hint.innerHTML = 'Brush away' + (finePointer ? '<small>move your mouse · or scroll</small>' : '<small>tap · or scroll</small>');
      wrap.appendChild(hint);
      body.appendChild(wrap);
      if (again) requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.remove("drying")));

      const ctx = cvs.getContext("2d");
      let W = 0, H = 0, grid = [], cols = 0, rows = 0, cleared = 0, done = false, last = null;
      const CELL = 34;

      /* paint the dried paste: base, grain, raised lumps, cracks */
      function paint(){
        const r = wrap.getBoundingClientRect(); W = r.width; H = r.height;
        cvs.width = W * dpr; cvs.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const g = ctx.createRadialGradient(W * .6, H * .4, 0, W * .6, H * .4, Math.max(W, H));
        g.addColorStop(0, "#5C4A2B"); g.addColorStop(1, "#3F311C");
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < (W * H) / 90; i++){
          ctx.fillStyle = Math.random() < .5 ? "rgba(255,240,200,.05)" : "rgba(0,0,0,.08)";
          ctx.fillRect(rnd(0, W), rnd(0, H), rnd(.6, 2), rnd(.6, 2));
        }
        for (let i = 0; i < (W * H) / 9000; i++){
          const x = rnd(0, W), y = rnd(0, H), s = rnd(6, 26);
          const lg = ctx.createRadialGradient(x - s * .3, y - s * .3, 0, x, y, s);
          lg.addColorStop(0, "rgba(140,115,70,.22)"); lg.addColorStop(1, "rgba(140,115,70,0)");
          ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
        }
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        const crack = (x, y, ang, len, w, depth) => {
          ctx.beginPath(); ctx.moveTo(x, y);
          for (let s = 0; s < len; s += 8){
            ang += rnd(-.5, .5); x += Math.cos(ang) * 8; y += Math.sin(ang) * 8; ctx.lineTo(x, y);
            if (depth < 2 && Math.random() < .05) crack(x, y, ang + rnd(-1.4, 1.4), len * .45, w * .7, depth + 1);
          }
          ctx.strokeStyle = "rgba(20,14,8,.55)"; ctx.lineWidth = w; ctx.stroke();
          ctx.strokeStyle = "rgba(170,145,95,.12)"; ctx.lineWidth = w * .5; ctx.translate(.8, .8); ctx.stroke(); ctx.translate(-.8, -.8);
        };
        for (let i = 0; i < (W * H) / 26000; i++) crack(rnd(0, W), rnd(0, H), rnd(0, Math.PI * 2), rnd(80, 260), rnd(.8, 1.8), 0);
        cols = Math.ceil(W / CELL); rows = Math.ceil(H / CELL);
        grid = new Array(cols * rows).fill(false); cleared = 0;
      }

      const spawn = (x, y, n, spread = 14) => {
        const hr = wrap.getBoundingClientRect();
        for (let i = 0; i < n && flakes.length < 260; i++){
          const pts = Array.from({ length: 5 }, (_, k) => { const a = k / 5 * Math.PI * 2 + rnd(-.3, .3), d = rnd(3, 9); return [Math.cos(a) * d, Math.sin(a) * d]; });
          flakes.push({ x: hr.left + x + rnd(-spread, spread), y: hr.top + y + rnd(-spread, spread), vx: rnd(-1.6, 1.6), vy: rnd(-2.2, .4),
            r: rnd(0, 6.28), vr: rnd(-.15, .15), s: rnd(.6, 1.5), pts, c: COL[(Math.random() * COL.length) | 0], life: 1 });
        }
        kick();
      };

      function brush(x, y){
        ctx.save(); ctx.globalCompositeOperation = "destination-out"; ctx.fillStyle = "#000";
        for (let i = 0; i < 9; i++){ ctx.beginPath(); ctx.arc(x + rnd(-44, 44), y + rnd(-44, 44), rnd(34, 64), 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
        const c0 = Math.max(0, Math.floor((x - 85) / CELL)), c1 = Math.min(cols - 1, Math.floor((x + 85) / CELL));
        const r0 = Math.max(0, Math.floor((y - 85) / CELL)), r1 = Math.min(rows - 1, Math.floor((y + 85) / CELL));
        for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++){ const i = r * cols + c; if (!grid[i]){ grid[i] = true; cleared++; } }
        spawn(x, y, 7);
        if (cleared / grid.length > .5) crumble();
      }

      function crumble(){
        if (done) return; done = true;
        hint.classList.add("gone");
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++){
          if (!grid[r * cols + c] && Math.random() < .55) spawn(c * CELL + CELL / 2, r * CELL + CELL / 2, 1, CELL / 2);
        }
        wrap.style.transition = "opacity .6s"; wrap.style.opacity = 0;
        setTimeout(() => wrap.remove(), 650);
        coat = null; clearedAt = performance.now();
      }

      wrap.addEventListener("pointermove", e => {
        if (done || e.pointerType !== "mouse") return;
        const r = wrap.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        hint.classList.add("gone");
        if (last){ const d = Math.hypot(x - last.x, y - last.y), n = Math.ceil(d / 34); for (let k = 1; k <= n; k++) brush(last.x + (x - last.x) * k / n, last.y + (y - last.y) * k / n); }
        else brush(x, y);
        last = { x, y };
      });
      wrap.addEventListener("pointerleave", () => last = null);
      wrap.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") crumble(); });

      paint();
      coat = { crumble, repaint: () => { if (!done) paint(); } };
      /* on touch screens there's no mouse to brush with, so it flakes off by itself */
      if (!finePointer) setTimeout(crumble, again ? 2600 : 3800);
    }

    /* scrolling away knocks the paste off (it only appears once per visit) */
    addEventListener("scroll", () => { if (scrollY > 40 && coat) coat.crumble(); }, { passive: true });
    document.addEventListener("keydown", e => { if (e.key === "Tab" && coat) coat.crumble(); });
    addEventListener("resize", () => coat && coat.repaint());
    new MutationObserver(() => { if (calm() && coat) coat.crumble(); }).observe(body, { attributes: true, attributeFilter: ["class"] });

    if (window.INTRO === "paste") makePaste(false);   /* the old dried-paste intro, kept but switched off */
  }

  /* =====================  1b) A HENNA CONE WRITES MY NAME  ===================== */
  {
    const loader = document.getElementById("loader");
    if (window.INTRO === "name" && loader) loader.classList.add("done");
  /* ---------- 1) a henna cone writes my name big in the middle, then it flies up into the corner ---------- */
  if (window.INTRO === "name"){
    const logo = document.querySelector(".logo[data-signature]");
    if (logo && !calm()) {
    const css = document.createElement("style");
    css.textContent = `
      .name-veil{position:fixed;inset:0;z-index:45;background:var(--offwhite,#F5EDE2);transition:opacity .6s ease .1s}
      .name-veil.go{opacity:0;pointer-events:none}
      .name-veil p{position:absolute;left:0;right:0;top:calc(50% + 110px);margin:0;text-align:center;max-width:none;padding:0 1.5rem;font-family:var(--sans);font-size:.72rem;letter-spacing:.24em;text-transform:uppercase;color:var(--henna,#8A4F22);opacity:0;transition:opacity .6s}
      .name-veil.hint p{opacity:1}
      body.intro-name .site-nav, body.intro-name .display-toggle, body.intro-name .hdr-cv, body.intro-name .hprog{opacity:0}
      .site-nav,.display-toggle,.hdr-cv,.hprog{transition:opacity .6s ease .4s}
      .logo[data-signature].big{position:relative;z-index:46}
    `;
    document.head.appendChild(css);
    const veil = document.createElement("div"); veil.className = "name-veil"; veil.setAttribute("aria-hidden", "true");
    veil.innerHTML = "<p>UX/UI designer &amp; web developer</p>";
    body.appendChild(veil); body.classList.add("intro-name");
    /* place the logo big in the centre of the screen */
    const r = logo.getBoundingClientRect(), scale = Math.min(3.2, innerWidth * .7 / r.width);
    const dx = innerWidth / 2 - (r.left + r.width / 2), dy = innerHeight / 2 - (r.top + r.height / 2);
    logo.classList.add("big");
    logo.style.transformOrigin = "50% 50%";
    logo.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
    setTimeout(() => veil.classList.add("hint"), 500);
    const done = () => {
      logo.style.transition = "transform .85s cubic-bezier(.65,0,.2,1)";
      logo.style.transform = "";
      veil.classList.add("go"); body.classList.remove("intro-name");
      setTimeout(() => { veil.remove(); logo.classList.remove("big"); logo.style.transition = ""; }, 1000);
    };
    const t0 = performance.now();
    (function wait(){
      if (document.querySelector(".sig-ink.stained") || performance.now() - t0 > 7000) setTimeout(done, 300);
      else requestAnimationFrame(wait);
    })();
    /* let impatient visitors skip it */
    const skip = () => { if (veil.isConnected && !veil.classList.contains("go")) done(); };
    veil.addEventListener("click", skip); addEventListener("keydown", skip, { once: true }); addEventListener("wheel", skip, { once: true, passive: true });
    addEventListener("scroll", skip, { once: true, passive: true }); addEventListener("touchstart", skip, { once: true, passive: true }); addEventListener("pointerdown", skip, { once: true });
    }
  }

  }

  /* =====================  0) A GREETING FOR THE TIME OF DAY  ===================== */
  const greet = document.getElementById("greet");
  if (greet){
    const hr = new Date().getHours();
    const hello = hr >= 5 && hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : hr < 22 ? "Good evening" : "Up late?";
    greet.innerHTML = `${hello} <span class="spark" aria-hidden="true">✦</span> thanks for stopping by.`;
  }

  /* =====================  2) WHAT BRINGS YOU HERE?  ===================== */
  const chips = document.querySelectorAll(".why button[data-why]");
  if (!chips.length) return;
  const resume = document.querySelector('a[href$=".pdf"]');
  const paths = {
    hiring:    { go: "#work",    text: "Welcome! Here's my strongest work.", link: resume ? resume.getAttribute("href") : "#contact", linkText: "Grab my résumé →" },
    freelance: { go: "#process", text: "Here's how I work, from first chat to final design.", link: "#contact", linkText: "Let's talk about your project →" },
    curious:   { go: "#story",   text: "Grab a chai ☕ and enjoy the story.", link: "#henna", linkText: "Don't miss the henna →" }
  };

  const css2 = document.createElement("style");
  css2.textContent = `
    .why-note{position:fixed;left:clamp(1rem,3vw,2rem);bottom:clamp(1rem,3vw,2rem);z-index:57;max-width:min(88vw,330px);padding:1rem 2.4rem 1rem 1.1rem;
      background:var(--deep,#4A2C17);color:#F5EDE2;border-radius:18px;box-shadow:0 16px 36px -18px rgba(20,14,10,.7);font-size:.92rem;line-height:1.45;
      opacity:0;transform:translateY(16px);pointer-events:none;transition:opacity .45s,transform .55s cubic-bezier(.3,1.4,.5,1)}
    .why-note.show{opacity:1;transform:none;pointer-events:auto}
    .why-note a{display:inline-block;margin-top:.45rem;color:var(--gold,#B9893F);text-decoration:none;border-bottom:1px solid currentColor}
    .why-note button{position:absolute;top:.4rem;right:.5rem;border:0;background:none;color:#F5EDE2;opacity:.7;font-size:1.05rem;cursor:pointer;padding:.2rem .45rem}
  `;
  document.head.appendChild(css2);
  const note = document.createElement("div"); note.className = "why-note"; note.setAttribute("role", "status");
  note.innerHTML = '<span class="t"></span><br><a></a><button type="button" aria-label="Close">×</button>';
  body.appendChild(note);
  let hideT;
  note.querySelector("button").addEventListener("click", () => note.classList.remove("show"));

  const head = () => { const h = document.querySelector(".site-header"); return h && getComputedStyle(h).position === "sticky" ? h.offsetHeight : 0; };
  chips.forEach(chip => chip.addEventListener("click", () => {
    const p = paths[chip.dataset.why]; if (!p) return;
    chips.forEach(c => c.setAttribute("aria-pressed", c === chip));
    try { localStorage.setItem("why", chip.dataset.why); } catch (e) {}
    const target = document.querySelector(p.go);
    if (target) scrollTo({ top: target.getBoundingClientRect().top + scrollY - head() + 1, behavior: calm() ? "auto" : "smooth" });
    note.querySelector(".t").textContent = p.text;
    const a = note.querySelector("a"); a.textContent = p.linkText; a.href = p.link;
    clearTimeout(hideT);
    setTimeout(() => note.classList.add("show"), calm() ? 0 : 700);
    hideT = setTimeout(() => note.classList.remove("show"), 9000);
  }));
  /* remember the choice for next visit */
  try { const w = localStorage.getItem("why"); if (w) chips.forEach(c => c.setAttribute("aria-pressed", c.dataset.why === w)); } catch (e) {}
})();
