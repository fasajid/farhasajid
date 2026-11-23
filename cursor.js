/* =========================================================
   Henna-dot cursor (simple and subtle)
   - A small henna-brown dot follows the mouse exactly
   - A ring of tiny gold dots (like a henna dot border) follows softly
   - Over links and buttons the ring opens up; on project cards it says "View"
   - Clicking gives a tiny squeeze
   Off on touch screens and with "Reduce motion" / "Simple view".
   Include with: <script src="cursor.js" defer></script>
   ========================================================= */
(() => {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const body = document.body;

  const css = document.createElement("style");
  css.textContent = `
    body.cc, body.cc *{cursor:none !important}
    body.cc input[type=text], body.cc textarea{cursor:text !important}
    .cdot,.cring{position:fixed;left:0;top:0;pointer-events:none;z-index:150;opacity:0;transition:opacity .25s}
    .cdot.on,.cring.on{opacity:1}
    .cdot{width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:var(--stain,#8A4F22);transition:opacity .25s}
    .cring{width:30px;height:30px;margin:-15px 0 0 -15px;display:grid;place-items:center}
    .cring svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;transition:transform .35s cubic-bezier(.3,1.3,.5,1)}
    .cring circle{fill:var(--gold,#B9893F);opacity:.75}
    .cring span{position:relative;font:700 .6rem/1 var(--sans,system-ui,sans-serif);letter-spacing:.18em;text-transform:uppercase;color:var(--deep,var(--maroon,#4A2C17));
      opacity:0;transition:opacity .25s}
    .cring.hover svg{transform:scale(1.55)}
    .cring.label svg{transform:scale(2.4)}
    .cring.label span{opacity:1}
    .cring::before{content:"";position:absolute;inset:-19px;border-radius:50%;background:rgba(245,237,226,.94);opacity:0;transform:scale(.4);transition:opacity .25s,transform .35s cubic-bezier(.3,1.3,.5,1)}
    .cring.label::before{opacity:1;transform:scale(1)}
    .cdot.hover{transform:scale(.6)}
    .cdot.label{opacity:0}
    .cring.press svg{transform:scale(.8)}
    .cring.label.press svg{transform:scale(2.1)}
  `;
  document.head.appendChild(css);

  const dot = document.createElement("div"); dot.className = "cdot"; dot.setAttribute("aria-hidden", "true");
  const ring = document.createElement("div"); ring.className = "cring"; ring.setAttribute("aria-hidden", "true");
  /* 12 tiny dots in a circle */
  const dots = Array.from({ length: 12 }, (_, i) => {
    const a = i / 12 * Math.PI * 2;
    return `<circle cx="${(15 + Math.cos(a) * 13).toFixed(2)}" cy="${(15 + Math.sin(a) * 13).toFixed(2)}" r="${i % 3 === 0 ? 1.4 : 0.9}"/>`;
  }).join("");
  ring.innerHTML = `<svg viewBox="0 0 30 30">${dots}</svg><span></span>`;
  body.append(ring, dot);
  const label = ring.querySelector("span");

  const enabled = () => !body.classList.contains("reduce-motion") && !body.classList.contains("simple");
  const sync = () => { const on = enabled(); body.classList.toggle("cc", on); if (!on){ dot.classList.remove("on"); ring.classList.remove("on"); } };
  new MutationObserver(sync).observe(body, { attributes: true, attributeFilter: ["class"] });
  sync();

  let x = -100, y = -100, rx = x, ry = y, spin = 0, running = false;
  const kick = () => { if (!running){ running = true; requestAnimationFrame(frame); } };
  function frame(){
    rx += (x - rx) * .18; ry += (y - ry) * .18;
    spin += Math.hypot(x - rx, y - ry) * .15;  /* the dot ring turns a little as it moves */
    dot.style.transform = `translate(${x}px, ${y}px)` + (dot.classList.contains("hover") ? " scale(.6)" : "");
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    ring.firstElementChild.style.rotate = spin.toFixed(1) + "deg";
    if (Math.abs(x - rx) > .3 || Math.abs(y - ry) > .3) requestAnimationFrame(frame); else running = false;
  }

  addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse" || !enabled()) return;
    x = e.clientX; y = e.clientY;
    dot.classList.add("on"); ring.classList.add("on");
    kick();
  }, { passive: true });
  document.addEventListener("mouseleave", () => { dot.classList.remove("on"); ring.classList.remove("on"); });
  addEventListener("pointerdown", () => ring.classList.add("press"));
  addEventListener("pointerup", () => ring.classList.remove("press"));

  document.addEventListener("pointerover", e => {
    const t = e.target.closest && e.target.closest("a, button, label, [data-cursor]");
    const text = (t && t.dataset.cursor) || "";
    dot.classList.toggle("hover", !!t && !text);
    ring.classList.toggle("hover", !!t && !text);
    dot.classList.toggle("label", !!text);
    ring.classList.toggle("label", !!text);
    label.textContent = text;
  });
})();
