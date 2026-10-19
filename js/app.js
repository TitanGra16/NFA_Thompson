
const $ = s => document.querySelector(s);
const input = $('#re'), svg = $('#canvas');
let steps = [], k = 0;

const RULE = { sym: 'simbolo', eps: 'ε', empty: '∅', cat: 'concatenazione', alt: 'alternativa', star: 'chiusura' };

// Titolo e spiegazione di ogni passo, con le parole della lezione.
function explain(n) {
  const R = n.l ? str(n.l) : n.c ? str(n.c) : '', S = n.r ? str(n.r) : '';
  switch (n.t) {
    case 'empty': return ['Caso base: R = ∅', 'Nessuna transizione: nessuna stringa viene accettata.'];
    case 'eps': return ['Caso base: R = ε', 'Una sola ε-transizione: si accetta soltanto la stringa vuota.'];
    case 'sym': return [`Caso base: R = ${str(n)}`, `Una transizione etichettata ${n.v}: si accetta soltanto «${n.v}».`];
    case 'cat': return [`Concatenazione: R S con R = ${R}, S = ${S}`,
      'Lo stato accettante di R perde l\'anello e si collega con una ε-transizione all\'iniziale di S. L\'accettante del nuovo automa è quello di S.'];
    case 'alt': return [`Alternativa: R | S con R = ${R}, S = ${S}`,
      'Un nuovo stato iniziale si dirama verso entrambi i frammenti; un nuovo stato accettante li raccoglie. Quattro ε-transizioni in tutto.'];
    case 'star': return [`Chiusura: R* con R = ${R}`,
      'Un nuovo iniziale e un nuovo accettante, con quattro ε-transizioni: entrare in R, uscire da R, saltare R del tutto (zero ripetizioni) e tornare indietro (una ripetizione in più).'];
  }
}

function show() {
  const s = steps[k], f = s.frag, [title, text] = explain(s.node);
  const { markup, vb } = svgMarkup(s);
  svg.setAttribute('viewBox', vb.join(' '));
  svg.style.maxWidth = Math.round(vb[2] * 1.25) + 'px';
  svg.innerHTML = markup;
  $('#title').textContent = title;
  $('#text').textContent = text;
  $('#count').textContent = `Passo ${k + 1} di ${steps.length}`;
  $('#stats').textContent = `${f.s.length} stati, ${f.t.length} transizioni, accettante: ${f.a}`;
  // le tre proprietà che rendono i frammenti componibili
  const checks = [[true, 'un solo stato accettante'],
    [!f.t.some(e => e.t === f.i), 'nessun arco entrante nello stato iniziale'],
    [!f.t.some(e => e.f === f.a), 'nessun arco uscente dallo stato accettante']];
  $('#props').replaceChildren(...checks.map(([ok, t]) => {
    const li = document.createElement('li');
    li.className = ok ? 'ok' : 'ko';
    li.textContent = t;
    return li;
  }));
  [...$('#steps').children].forEach((li, i) => {
    const b = li.firstChild;
    b.classList.toggle('cur', i === k);
    i === k ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current');
  });
  $('#first').disabled = $('#prev').disabled = k === 0;
  $('#next').disabled = $('#last').disabled = k === steps.length - 1;
}

const go = i => { k = Math.max(0, Math.min(steps.length - 1, i)); show(); };

function run(text) {
  try {
    steps = build(parse(text));
  } catch (e) {
    if (!(e instanceof ParseError)) throw e;
    $('#err').textContent = `${e.message} (carattere ${e.pos + 1})`;
    input.setAttribute('aria-invalid', 'true');
    return;
  }
  $('#err').textContent = '';
  input.removeAttribute('aria-invalid');
  $('#steps').replaceChildren(...steps.map((s, i) => {
    const li = document.createElement('li'), b = document.createElement('button');
    b.type = 'button';
    b.textContent = `${str(s.node)}, ${RULE[s.node.t]}`;
    b.onclick = () => go(i);
    li.append(b);
    return li;
  }));
  history.replaceState(null, '', '#' + encodeURIComponent(text));
  go(0);
}

$('#form').onsubmit = e => { e.preventDefault(); run(input.value); };
document.querySelectorAll('[data-ins]').forEach(b => b.onclick = () => {
  input.setRangeText(b.dataset.ins, input.selectionStart, input.selectionEnd, 'end');
  input.focus();
});
document.querySelectorAll('[data-ex]').forEach(b => b.onclick = () => { input.value = b.dataset.ex; run(input.value); });
$('#first').onclick = () => go(0);
$('#prev').onclick = () => go(k - 1);
$('#next').onclick = () => go(k + 1);
$('#last').onclick = () => go(steps.length - 1);
addEventListener('keydown', e => {
  if (e.target === input || !steps.length) return;
  if (e.key === 'ArrowRight') go(k + 1);
  if (e.key === 'ArrowLeft') go(k - 1);
});

let initial = '(a|b)*';
try { initial = decodeURIComponent(location.hash.slice(1)) || initial; } catch {}
input.value = initial;
run(initial);
