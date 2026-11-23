/* =========================================================
   ui.js: two small interface pieces shared by every page
   1) Main navigation: a sliding highlight under the current section
   2) Display options (below)
   ========================================================= */
(() => {
  const nav = document.querySelector(".site-nav");
  if (!nav) return;
  let chip = nav.querySelector(".nav-chip");
  if (!chip){ chip = document.createElement("span"); chip.className = "nav-chip"; chip.setAttribute("aria-hidden", "true"); nav.prepend(chip); }
  const links = [...nav.querySelectorAll("a:not(.cta)")];
  const local = links.filter(a => a.getAttribute("href").startsWith("#"));
  let current = links.find(a => a.classList.contains("active")) || null, hovered = null;
  const place = a => {
    if (!a){ chip.style.opacity = 0; return; }
    chip.style.opacity = 1; chip.style.left = a.offsetLeft + "px"; chip.style.width = a.offsetWidth + "px";
  };
  const spy = () => {
    if (local.length){
      let found = null;
      for (const a of local){ const sec = document.querySelector(a.getAttribute("href")); if (sec && sec.getBoundingClientRect().top < innerHeight * .45) found = a; }
      const cta = nav.querySelector("a.cta"), ctaSec = cta && cta.getAttribute("href").startsWith("#") && document.querySelector(cta.getAttribute("href"));
      if (ctaSec && ctaSec.getBoundingClientRect().top < innerHeight * .45) found = null;
      current = found;
    }
    links.forEach(a => { a.classList.toggle("active", a === current); if (a === current) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
    if (!hovered) place(current);
  };
  links.forEach(a => {
    a.addEventListener("mouseenter", () => { hovered = a; place(a); });
    a.addEventListener("focus", () => { hovered = a; place(a); });
    a.addEventListener("blur", () => { hovered = null; place(current); });
  });
  nav.addEventListener("mouseleave", () => { hovered = null; place(current); });
  let tick = false;
  addEventListener("scroll", () => { if (!tick){ tick = true; requestAnimationFrame(() => { spy(); tick = false; }); } }, { passive: true });
  addEventListener("resize", spy);
  document.fonts && document.fonts.ready.then(spy);
  spy();
})();

/* =========================================================
   Display options
   A small "Aa" button sits beside the main navigation. Clicking it
   slides a slim row of options down under the header, and the page
   eases down to make room, so nothing gets covered.
   Keyboard: Enter/Space to open, Esc to close.
   The buttons keep their own ids and click logic.
   ========================================================= */
(() => {
  const tools = document.querySelector(".tools");
  if (!tools) return;
  const header = tools.parentNode;
  const buttons = [...tools.querySelectorAll("button")];

  const css = document.createElement("style");
  css.textContent = `
    .header-inner{row-gap:0 !important}
    .display-toggle{position:relative;flex:none;width:40px;height:40px;border-radius:50%;border:1px solid rgba(74,44,23,.18);background:transparent;cursor:pointer;padding:0;
      display:grid;place-items:center;color:var(--ink-soft,#5C4433);font:400 .92rem/1 var(--serif,Georgia,serif);transition:background .3s,color .3s,border-color .3s}
    .display-toggle:hover{color:var(--deep,var(--maroon,#4A2C17));border-color:rgba(74,44,23,.4)}
    .display-toggle[aria-expanded="true"]{background:var(--deep,var(--maroon,#4A2C17));color:var(--offwhite,var(--cream,#F5EDE2));border-color:transparent}
    .display-toggle .on-dot{position:absolute;top:3px;right:3px;width:8px;height:8px;border-radius:50%;background:var(--gold,#B9893F);border:2px solid var(--offwhite,var(--cream,#F5EDE2));display:none}
    .display-toggle.has-on .on-dot{display:block}
    .display-panel{position:fixed;top:96px;right:16px;z-index:120;width:min(250px,82vw);padding:1.1rem 1rem 1rem;border-radius:26px;
      background:rgba(250,244,235,.58);backdrop-filter:blur(18px) saturate(1.4);-webkit-backdrop-filter:blur(18px) saturate(1.4);
      border:1px solid rgba(255,255,255,.75);box-shadow:0 30px 60px -30px rgba(74,44,23,.55),0 0 0 1px rgba(185,137,63,.12),inset 0 1px 0 rgba(255,255,255,.85);
      transform:translateX(calc(100% + 40px));opacity:0;visibility:hidden;transition:transform .55s cubic-bezier(.25,1,.3,1),opacity .35s,visibility .55s}
    .display-panel.open{transform:none;opacity:1;visibility:visible}
    .display-panel .dp-head{display:flex;align-items:center;justify-content:space-between;margin:0 .2rem .8rem}
    .display-panel .dp-head strong{font:400 1.15rem/1 var(--serif,Georgia,serif);color:var(--deep,var(--maroon,#4A2C17))}
    .display-panel .dp-close{width:30px;height:30px;border-radius:50%;border:0;background:rgba(74,44,23,.08);color:var(--ink,#24170F);cursor:pointer;font-size:1rem;line-height:1}
    .display-panel .dp-close:hover{background:rgba(74,44,23,.16)}
    .display-row{display:flex;flex-direction:column;gap:1rem}
    .display-group{display:flex;flex-direction:column;gap:.45rem}
    .display-group > span{font:700 .66rem/1 var(--sans,system-ui,sans-serif);letter-spacing:.18em;text-transform:uppercase;color:var(--henna,var(--teal,#8A4F22));margin:0 .2rem .1rem}
    .display-group.sizes{flex-direction:row;flex-wrap:wrap}
    .display-group.sizes > span{flex:0 0 100%}
    .display-row button{height:42px;padding:0 1rem;border-radius:14px;border:1px solid rgba(74,44,23,.14);background:rgba(255,253,248,.6);cursor:pointer;
      font:400 .9rem/1 var(--sans,system-ui,sans-serif);color:var(--ink,#24170F);white-space:nowrap;display:flex;align-items:center;gap:.6rem;transition:background .25s,color .25s,border-color .25s,transform .25s}
    .display-row button:hover{border-color:rgba(74,44,23,.35);background:rgba(255,253,248,.9)}
    .display-row button[aria-pressed]{justify-content:space-between}
    .display-row button[aria-pressed]::after{content:"";flex:0 0 34px;height:20px;border-radius:999px;background:rgba(74,44,23,.15) radial-gradient(circle at 10px 50%,#fff 6px,transparent 7px);transition:background .3s}
    .display-row button[aria-pressed="true"]{background:var(--deep,var(--maroon,#4A2C17));color:var(--offwhite,var(--cream,#F5EDE2));border-color:transparent}
    .display-row button[aria-pressed="true"]::after{background:var(--gold,#B9893F) radial-gradient(circle at 24px 50%,#fff 6px,transparent 7px)}
    .display-row .size{flex:1;justify-content:center;font-weight:700;font-size:1rem}
    body.reduce-motion .display-panel{transition:opacity .2s,visibility .2s}
    @media (max-width:860px){
      .site-nav{margin-top:.9rem}
      .display-toggle{margin-left:auto}
    }
  `;
  document.head.appendChild(css);

  const labels = { "text-down": ["A−", "Smaller text"], "text-up": ["A+", "Larger text"], "motion-toggle": ["Reduce motion", "Reduce motion"], "simple-toggle": ["Simple view", "Simple view"] };

  /* the Aa button, right after the main navigation */
  const toggle = document.createElement("button");
  toggle.className = "display-toggle";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "display-panel");
  toggle.setAttribute("aria-label", "Display options: text size and motion");
  toggle.title = "Display options";
  toggle.innerHTML = '<span aria-hidden="true">Aa</span><span class="on-dot" aria-hidden="true"></span>';

  /* the slide-down row */
  const panel = document.createElement("div");
  panel.className = "display-panel"; panel.id = "display-panel";
  panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Display options");
  panel.innerHTML = '<div class="dp-head"><strong>Display</strong><button type="button" class="dp-close" aria-label="Close display options">×</button></div><div class="display-row" role="group" aria-label="Display options"></div>';
  const row = panel.querySelector(".display-row");

  const size = document.createElement("div"); size.className = "display-group sizes"; size.innerHTML = "<span>Text size</span>";
  const other = document.createElement("div"); other.className = "display-group"; other.innerHTML = "<span>Comfort</span>";
  buttons.forEach(b => {
    const l = labels[b.id];
    if (l){ b.textContent = l[0]; if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", l[1]); }
    if (b.id === "text-down" || b.id === "text-up"){ b.classList.add("size"); size.appendChild(b); }
    else other.appendChild(b);
  });
  row.append(size, other);

  const nav = document.querySelector(".site-nav");
  (nav && nav.parentNode === header ? nav : tools).after(toggle);
  document.body.appendChild(panel);
  tools.remove();

  /* sit snugly next to the nav pill (10px), whatever the header's gap is */
  const snug = () => {
    if (!nav || matchMedia("(max-width:860px)").matches){ toggle.style.marginLeft = ""; return; }
    const gap = parseFloat(getComputedStyle(header).columnGap) || 0;
    toggle.style.marginLeft = (10 - gap) + "px";
  };
  snug(); addEventListener("resize", snug);

  /* show a small gold dot on Aa when any comfort setting is on */
  const pressed = () => toggle.classList.toggle("has-on", buttons.some(b => b.getAttribute("aria-pressed") === "true"));
  new MutationObserver(pressed).observe(row, { attributes: true, subtree: true, attributeFilter: ["aria-pressed"] });
  pressed();

  const setOpen = open => {
    /* slide in from the right, just under the header */
    panel.style.top = Math.max(12, header.getBoundingClientRect().bottom + 10) + "px";
    panel.classList.toggle("open", open); toggle.setAttribute("aria-expanded", open);
    if (open) setTimeout(() => { const f = panel.querySelector(".display-row button"); if (f) f.focus({ preventScroll: true }); }, 60);
  };
  panel.querySelector(".dp-close").addEventListener("click", () => { setOpen(false); toggle.focus(); });
  toggle.addEventListener("click", () => setOpen(!panel.classList.contains("open")));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && panel.classList.contains("open")){ setOpen(false); toggle.focus(); } });
  document.addEventListener("pointerdown", e => { if (!panel.contains(e.target) && !toggle.contains(e.target)) setOpen(false); });
})();

/* "Chai & chat?" button: on hover it warms to a chai color and a little steam rises from it */
(() => {
  const cta = document.querySelector(".site-nav a.cta");
  if (!cta || cta.querySelector(".cta-label")) return;
  const text = cta.textContent.trim();
  cta.innerHTML = `<span class="cta-steam" aria-hidden="true"><i></i><i></i><i></i></span><span class="cta-label">${text.replace(/&/g, "&amp;")}</span>`;
  const wisp = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 20"><path d="M4 19 C0 15 8 12 4 8 C1 5 6 3 4 1" fill="none" stroke="#9A5E28" stroke-width="1.6" stroke-linecap="round"/></svg>');
  const css = document.createElement("style");
  css.textContent = `
    .site-nav a.cta{display:inline-flex;align-items:center;transition:background .45s ease,box-shadow .45s ease}
    .site-nav a.cta:hover,.site-nav a.cta:focus-visible{background:#9A5E28 !important;box-shadow:0 8px 20px -10px rgba(154,94,40,.8)}
    .cta-steam{position:absolute;left:30%;bottom:calc(100% - 4px);width:30px;height:22px;transform:translateX(-50%);pointer-events:none}
    .cta-steam i{position:absolute;bottom:0;width:8px;height:20px;background:url('${wisp}') no-repeat center/contain;opacity:0}
    .cta-steam i:nth-child(1){left:0}.cta-steam i:nth-child(2){left:11px}.cta-steam i:nth-child(3){left:22px}
    .site-nav a.cta:hover .cta-steam i,.site-nav a.cta:focus-visible .cta-steam i{animation:ctaSteam 1.6s ease-out infinite}
    .site-nav a.cta:hover .cta-steam i:nth-child(2){animation-delay:.35s}
    .site-nav a.cta:hover .cta-steam i:nth-child(3){animation-delay:.7s}
    @keyframes ctaSteam{0%{opacity:0;transform:translateY(6px) scaleY(.6)}35%{opacity:.6}100%{opacity:0;transform:translateY(-12px) scaleY(1.1)}}
    body.reduce-motion .site-nav a.cta .cta-steam i{animation:none !important}
    body.reduce-motion .site-nav a.cta:hover .cta-steam i{opacity:.6}
  `;
  document.head.appendChild(css);
})();
