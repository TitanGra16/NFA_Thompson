// Layout ricorsivo e disegno SVG. Ogni nodo dell'AST occupa un rettangolo (w,h);
// iniziale a sinistra, accettante a destra, entrambi sulla stessa riga (cy).
const r = 18, D = 84, E = 56, V = 30, MT = 34, MB = 34;
const f = x => +x.toFixed(1);
const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const shift = (p, dx, dy) => Object.fromEntries(Object.entries(p).map(([k, [x, y]]) => [k, [x + dx, y + dy]]));

function layout(root) {
  const hint = {};                           // altezza degli archi curvi, chiave "da>a"
  function L(n) {
    const { i, a } = n.ids;
    if (n.t === 'cat') {
      const A = L(n.l), B = L(n.r), ox = A.w + E - 2 * r, cy = Math.max(A.cy, B.cy);
      const ya = cy - A.cy, yb = cy - B.cy;
      return { w: ox + B.w, h: Math.max(ya + A.h, yb + B.h), cy,
               pos: { ...shift(A.pos, 0, ya), ...shift(B.pos, ox, yb) } };
    }
    if (n.t === 'alt') {
      const A = L(n.l), B = L(n.r), W = Math.max(A.w, B.w), w = W + 2 * E;
      const yb = A.h + V, cy = (A.cy + yb + B.cy) / 2;
      return { w, h: yb + B.h, cy, pos: {
        ...shift(A.pos, E + (W - A.w) / 2, 0), ...shift(B.pos, E + (W - B.w) / 2, yb),
        [i]: [r, cy], [a]: [w - r, cy] } };
    }
    if (n.t === 'star') {
      const A = L(n.c), w = A.w + 2 * E, cy = MT + A.cy, h = MT + A.h + MB;
      hint[`${n.c.ids.a}>${n.c.ids.i}`] = (cy - 18) / 0.75;
      hint[`${i}>${a}`] = (h - cy - 14) / 0.75;
      return { w, h, cy, pos: { ...shift(A.pos, E, MT), [i]: [r, cy], [a]: [w - r, cy] } };
    }
    return { w: 2 * r + D, h: 2 * r, cy: r, pos: { [i]: [r, r], [a]: [r + D, r] } };   // casi base
  }
  return { ...L(root), hint };
}

function edge([x1, y1], [x2, y2], k, rise = 40) {
  if (k === 'fwd') {
    const d = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / d, uy = (y2 - y1) / d;
    return { d: `M${f(x1 + ux * r)} ${f(y1 + uy * r)}L${f(x2 - ux * (r + 3))} ${f(y2 - uy * (r + 3))}`,
             x: (x1 + x2) / 2, y: (y1 + y2) / 2 - 8 };
  }
  const s = k === 'back' ? -1 : 1, c1 = [x1 + 26, y1 + s * rise], c2 = [x2 - 26, y2 + s * rise];
  const u = (c, x, y) => { const d = Math.hypot(c[0] - x, c[1] - y); return [(c[0] - x) / d, (c[1] - y) / d]; };
  const [a1, b1] = u(c1, x1, y1), [a2, b2] = u(c2, x2, y2);
  return { d: `M${f(x1 + a1 * r)} ${f(y1 + b1 * r)}C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(x2 + a2 * (r + 3))} ${f(y2 + b2 * (r + 3))}`,
           x: (x1 + 3 * c1[0] + 3 * c2[0] + x2) / 8, y: (y1 + 3 * c1[1] + 3 * c2[1] + y2) / 8 + (s < 0 ? -7 : 15) };
}

// Ritorna il contenuto dell'SVG e il suo viewBox per un passo di build().
export function svgMarkup(step) {
  const { w, h, pos, hint } = layout(step.node);
  const { frag, role } = step;
  const marker = (id, cls) => `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1L10 5L0 9z" class="${cls}"/></marker>`;
  let paths = '', labels = '', nodes = '';

  for (const e of frag.t) {
    const g = edge(pos[e.f], pos[e.t], e.k, hint[`${e.f}>${e.t}`]);
    paths += `<path class="ed${e.n ? ' new' : ''}" d="${g.d}" marker-end="url(#${e.n ? 'an' : 'ao'})"/>`;
    labels += `<text class="lb${e.n ? ' new' : ''}" x="${f(g.x)}" y="${f(g.y)}">${esc(e.l)}</text>`;
  }
  const [sx, sy] = pos[frag.i];
  paths += `<path class="ed" d="M${f(sx - r - 30)} ${f(sy)}L${f(sx - r - 3)} ${f(sy)}" marker-end="url(#ao)"/>`;

  for (const q of frag.s) {
    const [x, y] = pos[q];
    nodes += `<g class="n ${role[q]}"><circle cx="${f(x)}" cy="${f(y)}" r="${r}"/>`
      + (q === frag.a ? `<circle cx="${f(x)}" cy="${f(y)}" r="${r + 4}" class="acc"/>` : '')
      + `<text x="${f(x)}" y="${f(y + 5)}">${q}</text></g>`;
  }
  return {
    markup: `<defs>${marker('ao', 'ao')}${marker('an', 'an')}</defs>${paths}${nodes}${labels}`,
    vb: [-40, 0, w + 52, h + 10],
  };
}
