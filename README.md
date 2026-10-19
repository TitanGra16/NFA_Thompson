# Thompson: da espressione regolare a ε-NFA

Pagina statica che costruisce, passo per passo, l'ε-NFA di un'espressione regolare con l'algoritmo di Thompson, seguendo le convenzioni delle slide del corso (Lezione #4).

## Struttura

| File | Ruolo |
| --- | --- |
| `js/parser.js` | regex → AST (`\|`, concatenazione, `*`, `ε`, `∅`, parentesi, `\` per l'escape) |
| `js/thompson.js` | AST → lista di passi, uno per nodo in post-ordine; numera gli stati nell'ordine di creazione |
| `js/render.js` | layout ricorsivo del frammento e disegno SVG |
| `js/app.js` | interfaccia: input, navigazione tra i passi, spiegazioni |

Per aggiungere un operatore: un caso in `parser.js`, uno in `thompson.js` (dentro `go`), uno in `render.js` (dentro `layout`) e uno in `explain` di `app.js`.

## Provarla in locale

I moduli ES non funzionano da `file://`, serve un server:

    python3 -m http.server 8000     # poi apri http://localhost:8000

## Pubblicarla su GitHub Pages

1. Crea un repository e carica questi file nella radice.
2. Settings → Pages → Source: *Deploy from a branch*, branch `main`, cartella `/ (root)`.
3. Dopo un minuto il sito è su `https://<utente>.github.io/<repo>/`.

Il link con `#espressione` nell'indirizzo riapre la pagina già con quella regex.
