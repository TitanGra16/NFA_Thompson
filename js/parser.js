// Grammatica (precedenza crescente: | < concatenazione < *)
//   alt  := cat ('|' cat)*
//   cat  := rep+
//   rep  := atom '*'*
//   atom := '(' alt ')' | 'ε' | '∅' | simbolo | '\' carattere
// AST: {t:'sym',v} {t:'eps'} {t:'empty'} {t:'cat',l,r} {t:'alt',l,r} {t:'star',c}

export class ParseError extends Error {
  constructor(msg, pos) { super(msg); this.pos = pos; }
}

export function parse(text) {
  let i = 0;
  const peek = () => { while (i < text.length && /\s/.test(text[i])) i++; return text[i]; };
  const fail = msg => { throw new ParseError(msg, i); };

  function alt() {
    let n = cat();
    while (peek() === '|') { i++; n = { t: 'alt', l: n, r: cat() }; }
    return n;
  }
  function cat() {
    let n = null;
    for (let c = peek(); c !== undefined && c !== '|' && c !== ')'; c = peek()) {
      const r = rep();
      n = n ? { t: 'cat', l: n, r } : r;
    }
    return n ?? fail('Manca un operando: usa ε per la stringa vuota.');
  }
  function rep() {
    let n = atom();
    while (peek() === '*') { i++; n = { t: 'star', c: n }; }
    return n;
  }
  function atom() {
    const c = peek();
    if (c === '(') {
      i++;
      const n = alt();
      if (peek() !== ')') fail('Manca la parentesi chiusa.');
      i++;
      return n;
    }
    if (c === '*') fail('L\'operatore * non ha un operando.');
    if (c === '+' || c === '?') fail(`L'operatore ${c} non fa parte dell'algoritmo base: scrivi R+ come RR* e R? come R|ε.`);
    i++;
    if (c === 'ε') return { t: 'eps' };
    if (c === '∅') return { t: 'empty' };
    if (c === '\\') {
      if (i >= text.length) fail('Dopo \\ serve un carattere.');
      return { t: 'sym', v: text[i++] };
    }
    return { t: 'sym', v: c };
  }

  if (!text.trim()) fail('Scrivi un\'espressione regolare.');
  const n = alt();
  if (peek() !== undefined) { i++; fail('Parentesi chiusa senza la corrispondente aperta.'); }
  return n;
}
