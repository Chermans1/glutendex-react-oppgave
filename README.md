# Gutendex – React-oppgave

En bokapp med søk, kategorier, bokdetaljer, paginering og favoritter lagret i localStorage.

## Lokal kjøring

```sh
npm run dev
```

Åpne adressen Vite viser. Vite behandler `/api/books`, `/api/books/` og
`/api/books/:id/` med samme `api/books.js` som Vercel. Den gamle direkteproxyen
er erstattet for at reserveløsningen også skal virke lokalt. `npm run preview`
viser kun produksjonsfilene og kjører ikke API-funksjonen; bruk dev for lokal funksjonstesting.

## Reserveløsningen

Gutendex forsøkes først, med en frist på fem sekunder. HTTP-feil, nettverksfeil,
tidsavbrudd, ugyldig JSON eller ugyldig bokstruktur gir lokale eksempeldata fra
`data/fallbackBooks.js`. Denne filen ligger utenfor `api/` for å unngå en ekstra
Vercel-funksjon. Ingen nye pakker er brukt.

Listen har `count`, `next`, `previous` og `results`. Søk treffer titler og
forfatternavn, og `topic` søker i `subjects`. Reservelisten har seks bøker per
side. Ugyldige sidetall behandles som side 1. En side utenfor utvalget gir en tom
liste uten neste side. En ukjent bok-ID gir 404 når reserven brukes.

API-et legger til `fallback: true` på reservedata (og reserve-404), ellers
`fallback: false`. React viser meldingen om eksempeldata bare når dette feltet
er `true`. Favorittsystemet er beholdt.

De tolv bøkene har reelle Project Gutenberg-ID-er. Emneordene er forenklet for
skoleoppgaven. `download_count: 0` er en lokal plassholder, ikke et målt antall
nedlastinger. Ingen omslagslenker er lagt til; eksisterende reservetekst brukes.
`formats` inneholder bare bekreftede leselenker, eller et tomt objekt når ingen
leselenke er tatt med.

Kildesider for bøkenes ID-er og forfattere:
[1342](https://www.gutenberg.org/ebooks/1342), [11](https://www.gutenberg.org/ebooks/11),
[84](https://www.gutenberg.org/ebooks/84), [345](https://www.gutenberg.org/ebooks/345),
[1661](https://www.gutenberg.org/ebooks/1661), [2701](https://www.gutenberg.org/ebooks/2701),
[74](https://www.gutenberg.org/ebooks/74), [46](https://www.gutenberg.org/ebooks/46),
[1232](https://www.gutenberg.org/ebooks/1232), [1524](https://www.gutenberg.org/ebooks/1524),
[1497](https://www.gutenberg.org/ebooks/1497), [35](https://www.gutenberg.org/ebooks/35).

## Kontroller

```sh
node --test tests/api.test.mjs
npm run lint
npm run build
```

API-testene erstatter `fetch` med simulerte 403/503/404/500-svar, nettverksfeil,
tidsavbrudd og ugyldige data. De kontakter ikke Gutendex. Timeout-testen forkorter
femsekundersfristen til ti millisekunder og kontrollerer at signalet avbrytes.
Testene dekker også gyldige primærdata, søk, kategorier, paginering, detaljer,
404/400/405 og Vercel-rutemønstre. Begrens hver testkommando til maks 60 sekunder.

## Vercel

`vercel.json` sender API-detaljruter til `api/books.js` og bare de navngitte
React-sidene til `index.html`. Funksjonens grense på 30 sekunder gir rom for
Gutendex-fristen og reserven. Endringene må publiseres separat før de vises på
nettsiden som allerede er publisert.
