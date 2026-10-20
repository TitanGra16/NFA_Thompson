# Thompson: da espressione regolare a ε-NFA

Pagina statica che costruisce, passo per passo, l'ε-NFA di un'espressione regolare con l'algoritmo di Thompson, seguendo le convenzioni delle slide del corso Compilatori in UnivAq.

## Struttura

| File | Ruolo |
| --- | --- |
| `js/parser.js` | regex → AST (`\|`, concatenazione, `*`, `ε`, `∅`, parentesi, `\` per l'escape) |
| `js/thompson.js` | AST → lista di passi, uno per nodo in post-ordine; numera gli stati nell'ordine di creazione |
| `js/render.js` | layout ricorsivo del frammento e disegno SVG |
| `js/app.js` | interfaccia: input, navigazione tra i passi, spiegazioni |

Il link con `#espressione` nell'indirizzo riapre la pagina già con quella regex.
