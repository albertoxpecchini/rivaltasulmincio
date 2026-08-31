# Gli stemmi delle sei contrade

Sei disegni, uno per contrada, con lo stesso nome dello `slug` che le contrade hanno già in
`build.mjs` e in `data-contrada`. Il nome file **non è una proposta, è la chiave**: cambiarlo
qui vuol dire cambiarlo anche là.

| File | Contrada | Colore | Cosa c'è dipinto | PNG | WebP |
| :--- | :--- | :--- | :--- | ---: | ---: |
| `filanda` | la Filanda | marrone | La filanda con la ciminiera e il bozzolo del baco da seta | 872 kB | 16 kB |
| `roccolo` | il Roccolo | verde | Il boschetto di alberi | 1071 kB | 20 kB |
| `colonie` | le Colonie | azzurro | La caravella con la croce blu sulla vela | 995 kB | 23 kB |
| `piasaroi` | i Piasaröi | giallo | La torre gialla col tetto rosso e la campana | 312 kB | 7 kB |
| `platana` | la Plàtana | viola | Il platano dalla chioma viola | 1026 kB | 22 kB |
| `fanfane` | le Fanfane | arancione | L'anfora che versa acqua | 796 kB | 19 kB |

**Due file per stemma, e non è un doppione.** Il `.webp` a 256 × 256 è quello che va in
pagina — 107 kB per tutti e sei. Il `.png` a 1254 × 1254 è il master: da lì si riscende a
qualunque misura, e da un webp a 256 px non si risale. I master pesano quasi 5 MB in tutto e
**non li serve nessuno**: stanno qui come archivio, il sito non li nomina mai.

Se un master cambia, il webp si rifà così:

```
node -e "require('sharp')('assets/icone/<slug>.png').resize(256,256,{fit:'contain',
  background:{r:0,g:0,b:0,alpha:0}}).webp({quality:90}).toFile('assets/icone/<slug>.webp')"
```

## Dove finiscono

In due punti, generati tutti e due da `build.mjs`: la scheda grande di
[`/eventi#contrade`](../../_build/eventi.body.html), dove la piastrella è 4 rem, e la fila in
fondo a [`/color-walk`](../../_build/color-walk.body.html), dove è 2,8 rem. La classe è la
stessa, `.sb-riv-stemma--arte`.

Gli stessi sei disegni stanno anche **dentro il banner e la locandina**, ma lì sono cotti
nell'immagine esportata da Claude Design: se un file cambia qui, quelle due vanno riesportate
a mano, non si aggiornano da sole.

La piastrella ha il **fondo chiaro in tutti e due i temi**, come quelle dei loghi in fondo a
`/color-walk` e per la stessa ragione: questi disegni hanno il contorno nero e le campiture
piene, e su fondo scuro il contorno sparisce e i verdi del roccolo affogano. Il velo di tinta
della contrada resta, così il colore si riconosce anche qui.

## Non sono ancora un set

I sei **non hanno lo stesso stile**, e affiancati si vede. Quattro — colonie, fanfane,
platana, roccolo — sono cartoon con volume: contorno di spessore variabile, ombre interne,
riflessi. Due — piasaroi e filanda — sono icone piatte: contorno nero uniforme, campitura
senza ombre. Vanno riportati a un registro solo; nel frattempo stanno in pagina così, perché
comunque dicono più degli stemmi al tratto che sostituiscono.

> Questi sono **ricalchi in pulito di sei clipart ingenue**, non gli stemmi ufficiali. Quelli
> veri sono dipinti a colori pieni sui cartelli che stanno in mostra alle giornate del Palio.
> Se le contrade hanno un artwork loro, quello vince: si sostituisce il file e in pagina non
> cambia nient'altro.
