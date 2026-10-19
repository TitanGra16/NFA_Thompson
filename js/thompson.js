// Algoritmo di Thompson, applicato in post-ordine sull'AST.
// Ogni nodo produce un frammento con: uno stato iniziale senza archi entranti,
// uno stato accettante senza archi uscenti. Ogni nodo diventa un passo da mostrare.
//
// Frammento: {s:[stati], t:[{f,t,l,k,n}], i, a}
//   k: 'fwd' | 'skip' | 'back'  (suggerisce come disegnare l'arco)
//   n: 1 se la transizione è stata aggiunta proprio in questo passo

const prec = n => ({ alt: 0, cat: 1, star: 2 }[n.t] ?? 3);
const wrap = (n, min) => (prec(n) < min ? `(${str(n)})` : str(n));

// Rimette l'AST in forma di stringa (serve per i titoli dei passi).
export function str(n) {
  switch (n.t) {
    case 'sym': return /[|*()\\ε∅]/.test(n.v) ? '\\' + n.v : n.v;
    case 'eps': return 'ε';
    case 'empty': return '∅';
    case 'star': return wrap(n.c, 2) + '*';
    case 'cat': return wrap(n.l, 1) + wrap(n.r, 2);
    case 'alt': return wrap(n.l, 0) + '|' + wrap(n.r, 1);
  }
}

// Ritorna la lista dei passi. Annota ogni nodo con node.ids = {i, a}.
export function build(root) {
  let next = 0;
  const steps = [];

  function go(x) {
    const [R, S] = x.t === 'cat' || x.t === 'alt' ? [go(x.l), go(x.r)]
                 : x.t === 'star' ? [go(x.c)] : [];
    const role = {};
    const mark = (fr, c) => fr && fr.s.forEach(q => (role[q] = c));
    mark(R, 'R'); mark(S, 'S');

    const s = [...(R?.s ?? []), ...(S?.s ?? [])];
    const old = [...(R?.t ?? []), ...(S?.t ?? [])];
    const add = [];
    const E = (f, t, l = 'ε', k = 'fwd') => add.push({ f, t, l, k, n: 1 });
    let i, a;

    if (x.t === 'cat') {                     // R S: l'accettante di R va con ε all'iniziale di S
      i = R.i; a = S.a;
      E(R.a, S.i);
    } else {                                 // tutti gli altri casi creano due stati nuovi
      i = next++; a = next++;
      role[i] = role[a] = 'N';
      s.push(i, a);
      if (x.t === 'sym') E(i, a, x.v);       // caso base: a
      if (x.t === 'eps') E(i, a);            // caso base: ε
      if (x.t === 'alt') { E(i, R.i); E(i, S.i); E(R.a, a); E(S.a, a); }
      if (x.t === 'star') { E(i, R.i); E(R.a, a); E(i, a, 'ε', 'skip'); E(R.a, R.i, 'ε', 'back'); }
    }                                        // caso base ∅: nessuna transizione

    x.ids = { i, a };
    const t = [...old, ...add];
    steps.push({ node: x, role, frag: { s, t, i, a } });
    return { s, i, a, t: t.map(e => ({ ...e, n: 0 })) };
  }

  go(root);
  return steps;
}
