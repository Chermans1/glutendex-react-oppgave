import assert from "node:assert/strict";
import { test, afterEach } from "node:test";
import { readFile } from "node:fs/promises";
import handler from "../api/books.js";
import fallbackBooks from "../data/fallbackBooks.js";

const originalFetch = globalThis.fetch;
const originalTimeout = AbortSignal.timeout;
afterEach(() => {
  globalThis.fetch = originalFetch;
  AbortSignal.timeout = originalTimeout;
});

async function request(query = {}, method = "GET") {
  const result = { status: 200, headers: {} };
  const response = {
    setHeader(name, value) { result.headers[name] = value; },
    status(code) { result.status = code; return this; },
    json(data) { result.data = data; },
  };
  await handler({ method, query }, response);
  return result;
}
function failWith(status) {
  globalThis.fetch = async () => new Response(null, { status });
}

test("datasettet har 12 unike, komplette bøker uten oppdiktede omslag", () => {
  assert.equal(fallbackBooks.length, 12);
  assert.equal(new Set(fallbackBooks.map((book) => book.id)).size, 12);
  for (const book of fallbackBooks) {
    assert.ok(book.id > 0 && book.title && book.authors[0].name);
    assert.ok(book.subjects.length && book.languages.length);
    assert.equal(typeof book.download_count, "number");
    assert.equal(book.formats["image/jpeg"], undefined);
  }
});

for (const status of [403, 503, 404, 500]) {
  test(`HTTP ${status} gir reserve på forsiden`, async () => {
    failWith(status);
    const result = await request();
    assert.equal(result.status, 200);
    assert.equal(result.data.fallback, true);
    assert.equal(result.data.count, 12);
    assert.equal(result.data.results.length, 6);
    assert.equal(result.data.previous, null);
    assert.ok(result.data.next);
  });
}

test("nettverksfeil gir reserve", async () => {
  globalThis.fetch = async () => { throw new TypeError("Simulert nettverksfeil"); };
  assert.equal((await request()).data.fallback, true);
});

test("tidsavbrudd avbryter forespørselen og gir reserve", async () => {
  AbortSignal.timeout = (milliseconds) => {
    assert.equal(milliseconds, 5000);
    return originalTimeout.call(AbortSignal, 10);
  };
  globalThis.fetch = async (url, { signal }) => new Promise((resolve, reject) => {
    const keepAlive = setTimeout(resolve, 1000);
    signal.addEventListener("abort", () => {
      clearTimeout(keepAlive);
      reject(signal.reason);
    }, { once: true });
  });
  assert.equal((await request()).data.fallback, true);
});

for (const data of [null, {}, { count: 12, next: null, previous: null, results: [{}] }]) {
  test(`ugyldige listedata ${JSON.stringify(data)} gir reserve`, async () => {
    globalThis.fetch = async () => Response.json(data);
    assert.equal((await request()).data.fallback, true);
  });
}

test("ugyldig JSON gir reserve", async () => {
  globalThis.fetch = async () => new Response("<html>Feil</html>");
  assert.equal((await request()).data.fallback, true);
});

test("søk i tittel og forfatter, også med store bokstaver og mellomrom", async () => {
  failWith(403);
  assert.equal((await request({ search: " PRIDE " })).data.results[0].id, 1342);
  assert.equal((await request({ search: "austen" })).data.results[0].id, 1342);
  const empty = (await request({ search: "ingen-slik-bok" })).data;
  assert.equal(empty.count, 0);
  assert.deepEqual(empty.results, []);
  assert.equal(empty.next, null);
});

test("kategorier bruker subjects og kan kombineres med søk", async () => {
  failWith(403);
  const fantasy = (await request({ topic: "FANTASY" })).data;
  assert.equal(fantasy.count, 2);
  assert.ok(fantasy.results.every((book) => book.subjects.includes("Fantasy")));
  assert.equal((await request({ topic: "fantasy", search: "carroll" })).data.count, 1);
  assert.equal((await request({ topic: "mangler" })).data.count, 0);
});

test("paginering har riktige lenker, beholder filtre og stopper på siste side", async () => {
  failWith(403);
  const first = (await request({ topic: "fiction", search: "", page: "1" })).data;
  const nextUrl = new URL(first.next, "http://localhost");
  assert.equal(nextUrl.searchParams.get("topic"), "fiction");
  assert.equal(nextUrl.searchParams.get("page"), "2");
  const second = (await request(Object.fromEntries(nextUrl.searchParams))).data;
  assert.equal(second.next, null);
  assert.ok(second.previous);
  assert.ok(second.results.every((book) => !first.results.some((other) => other.id === book.id)));
  for (const page of ["0", "-1", "1.5", "abc"]) {
    assert.deepEqual((await request({ topic: "fiction", page })).data.results, first.results);
  }
  const outside = (await request({ page: "999" })).data;
  assert.deepEqual(outside.results, []);
  assert.equal(outside.next, null);
  assert.ok(outside.previous.includes("page=2"));
});

test("bokdetaljer har riktig ID, ukjent bok gir 404 og reservemetadata", async () => {
  failWith(403);
  const book = await request({ id: "1342" });
  assert.equal(book.data.id, 1342);
  assert.equal(book.data.fallback, true);
  const missing = await request({ id: "999999" });
  assert.equal(missing.status, 404);
  assert.equal(missing.data.fallback, true);
  assert.match(missing.data.error, /eksempelbøker/);
});

test("feil bok-ID i et vellykket Gutendex-svar bruker reserve", async () => {
  globalThis.fetch = async () => Response.json(fallbackBooks[1]);
  assert.equal((await request({ id: "1342" })).data.id, 1342);
  assert.equal((await request({ id: "1342" })).data.fallback, true);
});

test("GET og ID-validering avviser feil uten å kontakte Gutendex", async () => {
  globalThis.fetch = () => { throw new Error("Skal ikke hente data"); };
  const post = await request({}, "POST");
  assert.equal(post.status, 405);
  assert.equal(post.headers.Allow, "GET");
  for (const id of ["0", "-1", "abc", "1/2", ["11", "84"]]) {
    assert.equal((await request({ id })).status, 400);
  }
  assert.equal((await request({ search: ["a", "b"] })).status, 400);
});

test("gyldige Gutendex-data prioriteres uten reservemelding", async () => {
  let upstreamUrl;
  const live = { count: 1, next: null, previous: null, results: [fallbackBooks[0]] };
  globalThis.fetch = async (url) => { upstreamUrl = url; return Response.json(live); };
  const result = await request({ search: "austen" });
  assert.equal(upstreamUrl, "https://gutendex.com/books/?search=austen");
  assert.equal(result.data.fallback, false);
  assert.deepEqual(result.data.results, live.results);
  globalThis.fetch = async () => Response.json(fallbackBooks[0]);
  assert.equal((await request({ id: "1342" })).data.fallback, false);
});

test("Vercel-API-ruter går til funksjonen, mens sider går til index.html", async () => {
  const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url)));
  function destination(path) {
    for (const rule of config.rewrites) {
      const expression = new RegExp(`^${rule.source.replace(/:([a-z]+)/g, "([^/]+)")}$`);
      const match = path.match(expression);
      if (match) return rule.destination.replace(/:([a-z]+)/g, match[1]);
    }
    return path;
  }
  for (const path of ["/api/books", "/api/books/", "/api/books/1342", "/api/books/1342/"]) {
    assert.match(destination(path), /^\/api\/books/);
    assert.ok(!destination(path).includes("index.html"));
  }
  for (const path of ["/favorites", "/book/1342", "/category/fantasy"]) {
    assert.equal(destination(path), "/index.html");
  }
  assert.equal(config.functions["api/books.js"].maxDuration, 30);
});
