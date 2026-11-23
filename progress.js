/* =========================================================
   Henna-dot progress line
   A slim vertical line on the right side of the page.
   The track is a row of tiny henna dots; as you scroll, a fine
   henna-brown line fills over it, led by a small gold dot.
   Little markers show where each section starts and turn gold
   once you pass them; hover one to see the section name, click to go there.
   (Sections are marked with data-next="…".)
   At the very end the line fades softly into the background.
   It also adds a thank-you message with a "Say hello" button to the
   top of the page's <footer>; its heart draws itself when it comes into view.
   (Edit the message text in the note.innerHTML below.)
   Include with: <script src="progress.js" defer></script>
   ========================================================= */
(() => {
  const body = document.body, root = document.documentElement;
  const host = document.querySelector(".chapters") || document.querySelector(".site-header");
  if (!host) return;

  const css = document.createElement("style");
  css.textContent = `
    /* vertical line on the right side of the page */
    .hprog{position:fixed;right:clamp(8px,1.6vw,22px);top:18vh;height:64vh;width:12px;z-index:58;pointer-events:none}
    .hprog .track{position:absolute;top:0;bottom:0;left:5px;width:2px;
      background-image:radial-gradient(circle,rgba(74,44,23,.25) 0.9px,transparent 1.2px);background-size:2px 9px;background-repeat:repeat-y}
    .hprog .fill{position:absolute;top:0;left:5.25px;width:1.5px;height:0;background:var(--stain,#8A4F22);border-radius:2px}
    .hprog .tip{position:absolute;left:2.5px;top:0;width:7px;height:7px;margin-top:-3.5px;border-radius:50%;background:var(--gold,#B9893F);
      box-shadow:0 0 0 3px rgba(185,137,63,.18);transition:opacity .4s}
    .hprog .mark{position:absolute;left:3px;width:6px;height:6px;margin-top:-3px;background:var(--offwhite,var(--cream,#F5EDE2));
      border:1px solid rgba(74,44,23,.35);border-radius:1px;transform:rotate(45deg);pointer-events:auto;cursor:pointer;transition:background .4s,border-color .4s,transform .3s}
    .hprog .mark::before{content:"";position:absolute;inset:-9px} /* bigger target */
    .hprog .mark.passed{background:var(--gold,#B9893F);border-color:var(--gold,#B9893F)}
    .hprog .mark:hover{transform:rotate(45deg) scale(1.5)}
    .hprog .label{position:absolute;right:22px;transform:translateY(-50%);white-space:nowrap;background:var(--deep,var(--maroon,#4A2C17));color:#F5EDE2;
      font:.75rem/1 var(--sans,system-ui,sans-serif);padding:.4rem .65rem;border-radius:999px;opacity:0;pointer-events:none;transition:opacity .25s,transform .25s}
    .hprog .label.on{opacity:1}
    .hprog{transition:opacity .9s ease}
    .hprog.complete{opacity:.28}
    .hprog.complete .tip{box-shadow:none}
    @media (max-width:760px){.hprog{top:22vh;height:56vh;right:4px}.hprog .mark{pointer-events:none}}
    body.simple .hprog .mark{display:none}

    /* thank-you message in the footer */
    .thanks{display:grid;grid-template-columns:auto 1fr auto;gap:.4rem 1.6rem;align-items:center;padding:clamp(.6rem,2vw,1.2rem) 0 clamp(2rem,5vw,3rem);margin-bottom:2rem;
      border-bottom:1px solid rgba(74,44,23,.14);font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#24170F)}
    .thanks svg{grid-row:span 2;width:64px;height:64px;overflow:visible}
    .thanks .heart{fill:none;stroke:var(--stain,#8A4F22);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1}
    .thanks.show .heart{transition:stroke-dashoffset 1.4s .2s ease;stroke-dashoffset:0}
    .thanks .spark{fill:var(--gold,#B9893F);opacity:0;transform-box:fill-box;transform-origin:center;transform:scale(0)}
    .thanks.show .spark{animation:thx-spark .5s cubic-bezier(.3,1.8,.5,1) forwards}
    @keyframes thx-spark{to{opacity:1;transform:scale(1)}}
    .thanks b{font-family:var(--serif,Georgia,serif);font-weight:300;font-size:clamp(1.4rem,2.6vw,1.9rem);line-height:1.15;color:var(--deep,var(--maroon,#4A2C17))}
    .thanks p{margin:0;max-width:52ch;font-size:.95rem;line-height:1.55;color:var(--ink-soft,#5C4433)}
    .thanks .acts{grid-row:1 / span 2;grid-column:3;display:flex;flex-direction:column;align-items:flex-end;gap:.7rem}
    .thanks .go{display:inline-flex;align-items:center;gap:.5rem;text-decoration:none;background:var(--deep,var(--maroon,#4A2C17));color:var(--offwhite,var(--cream,#F5EDE2));
      font-size:.95rem;padding:.8rem 1.4rem;border-radius:999px;transition:background .3s,transform .3s;white-space:nowrap}
    .thanks .go:hover{background:var(--black,#140E0A);transform:translateY(-2px)}
    .thanks .go .wave{display:inline-block;transform-origin:70% 80%}
    .thanks .go:hover .wave{animation:thx-wave .9s ease-in-out}
    @keyframes thx-wave{0%,100%{transform:rotate(0)}20%,60%{transform:rotate(16deg)}40%,80%{transform:rotate(-10deg)}}
    .thanks .up{background:none;border:0;padding:.3rem 0;font:inherit;font-size:.88rem;color:var(--ink-soft,#5C4433);cursor:pointer;border-bottom:1px solid var(--gold,#B9893F)}
    @media (max-width:760px){
      .thanks{grid-template-columns:auto 1fr;gap:.4rem 1rem}
      .thanks svg{width:52px;height:52px}
      .thanks .acts{grid-row:auto;grid-column:1 / -1;flex-direction:row;align-items:center;flex-wrap:wrap;gap:.6rem 1.2rem;margin-top:.8rem}
    }
    body.reduce-motion .thanks .go:hover .wave{animation:none}
    @media print{.hprog{display:none}}
  `;
  document.head.appendChild(css);

  /* the old thin bars, if a page has one, are no longer needed */
  const old = document.getElementById("progress"); if (old) old.style.display = "none";

  const bar = document.createElement("div");
  bar.className = "hprog"; bar.setAttribute("aria-hidden", "true");
  bar.innerHTML = '<div class="track"></div><div class="fill"></div><div class="tip"></div><div class="label"></div>';
  const label = bar.querySelector(".label");
  host.appendChild(bar);
  const fill = bar.querySelector(".fill"), tip = bar.querySelector(".tip");

  /* ---------- thank-you message, added to the top of the footer ---------- */
  const footer = document.querySelector("footer");
  if (footer && !document.getElementById("contact")){   /* the homepage ends with its own closing message */
    const mail = document.querySelector('a[href^="mailto:"]');
    const ctaHref = mail ? mail.getAttribute("href") : "index.html#contact";
    const note = document.createElement("div");
    note.className = "thanks";
    note.innerHTML = `
      <svg viewBox="-30 -30 60 60" aria-hidden="true">
        <path class="heart" pathLength="1" d="M0 16 C-14 6 -22 -2 -20 -11 C-18 -19 -7 -21 0 -12 C7 -21 18 -19 20 -11 C22 -2 14 6 0 16 M0 16 C-2 19 -6 21 -9 20"/>
        <circle class="spark" cx="-24" cy="-20" r="2" style="animation-delay:1.3s"/>
        <circle class="spark" cx="25" cy="-22" r="1.6" style="animation-delay:1.45s"/>
        <circle class="spark" cx="26" cy="12" r="1.3" style="animation-delay:1.6s"/>
        <circle class="spark" cx="-26" cy="10" r="1.3" style="animation-delay:1.75s"/>
      </svg>
      <b>You read all the way to the last petal.</b>
      <p>That kind of attention to detail? I design for people like you. Henna takes hours to stain, but a great collaboration only needs one hello.</p>
      <div class="acts">
        <a class="go" href="${ctaHref}">Say hello <span class="wave" aria-hidden="true">👋</span></a>
        <button type="button" class="up">Back to top ↑</button>
      </div>`;
    const inner = footer.querySelector(".wrap") || footer;
    inner.prepend(note);
    if (inner.classList.contains("footer-inner")){ /* keep the message on its own full-width row */
      note.style.flexBasis = "100%"; note.style.width = "100%";
    }
    note.querySelector(".up").addEventListener("click", () => scrollTo({ top: 0, behavior: body.classList.contains("reduce-motion") ? "auto" : "smooth" }));
    /* draw the heart when the footer comes into view (and again next time) */
    new IntersectionObserver(es => es.forEach(e => note.classList.toggle("show", e.isIntersecting)), { threshold: .4 }).observe(note);
  }

  let marks = [];
  function layout(){
    /* always pinned to the very top of the screen */
    bar.classList.add("fixed");
    if (bar.parentNode !== body) body.appendChild(bar);
    /* place a marker where each section starts (skip the first, that's the top) */
    marks.forEach(m => m.el.remove()); marks = [];
    const max = root.scrollHeight - innerHeight;
    [...document.querySelectorAll("[data-next]")].slice(1).forEach(sec => {
      const top = sec.getBoundingClientRect().top + scrollY - innerHeight * .5;
      const at = Math.min(1, Math.max(0, max > 0 ? top / max : 0));
      if (at <= 0 || at >= 1) return;
      const el = document.createElement("div"); el.className = "mark"; el.style.top = (at * 100) + "%";
      el.addEventListener("mouseenter", () => { label.textContent = sec.dataset.next; label.style.top = (at * 100) + "%"; label.classList.add("on"); });
      el.addEventListener("mouseleave", () => label.classList.remove("on"));
      el.addEventListener("click", () => {
        const head = document.querySelector(".site-header, .chapters");
        const off = head && getComputedStyle(head).position === "sticky" ? head.offsetHeight : 0;
        scrollTo({ top: sec.getBoundingClientRect().top + scrollY - off + 1, behavior: body.classList.contains("reduce-motion") ? "auto" : "smooth" });
      });
      bar.appendChild(el); marks.push({ el, at });
    });
    update();
  }

  function update(){
    const max = root.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    fill.style.height = (p * 100) + "%";
    tip.style.top = (p * 100) + "%";
    tip.style.opacity = p > .002 ? 1 : 0;
    marks.forEach(m => m.el.classList.toggle("passed", p >= m.at - .001));

    /* the end: fade the line into the background */
    const end = max > 0 && p > .985;
    bar.classList.toggle("complete", end);
  }

  let tick = false;
  addEventListener("scroll", () => { if (!tick){ tick = true; requestAnimationFrame(() => { update(); tick = false; }); } }, { passive: true });
  addEventListener("resize", layout);
  addEventListener("load", layout);
  document.fonts && document.fonts.ready.then(layout);
  layout();
})();
