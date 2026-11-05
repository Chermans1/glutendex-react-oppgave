import fallbackBooks from "../data/fallbackBooks.js";

const PAGE_SIZE = 6;
const UPSTREAM_TIMEOUT = 5000;

function isBook(book) {
  return book && Number.isSafeInteger(book.id) && book.id > 0 &&
    typeof book.title === "string" && book.title.trim().length > 0 &&
    Array.isArray(book.authors) && book.authors.every((author) => typeof author?.name === "string") &&
    Array.isArray(book.subjects) && book.subjects.every((subject) => typeof subject === "string") &&
    Array.isArray(book.languages) && book.languages.every((language) => typeof language === "string") &&
    Number.isFinite(book.download_count) && book.download_count >= 0 &&
    book.formats && typeof book.formats === "object" && !Array.isArray(book.formats) &&
    Object.values(book.formats).every((url) => typeof url === "string");
}

function isBookList(data) {
  return data && Number.isSafeInteger(data.count) && data.count >= 0 &&
    (data.next === null || typeof data.next === "string") &&
    (data.previous === null || typeof data.previous === "string") &&
    Array.isArray(data.results) && data.results.every(isBook);
}

function getFallbackList(params) {
  const search = (params.search || "").trim().toLowerCase();
  const topic = (params.topic || "").trim().toLowerCase();
  const requestedPage = Number(params.page || 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const books = fallbackBooks.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(search) ||
      book.authors.some((author) => author.name.toLowerCase().includes(search));
    const matchesTopic = book.subjects.some((subject) => subject.toLowerCase().includes(topic));
    return matchesSearch && matchesTopic;
  });
  const lastPage = Math.max(1, Math.ceil(books.length / PAGE_SIZE));
  function pageLink(number) {
    const query = new URLSearchParams(params);
    query.set("page", String(number));
    return `/api/books?${query.toString()}`;
  }
  return {
    count: books.length,
    next: page < lastPage ? pageLink(page + 1) : null,
    previous: page > 1 ? pageLink(Math.min(page - 1, lastPage)) : null,
    results: books.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    fallback: true,
  };
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Bare GET er tillatt." });
  }
  const { id, ...params } = request.query;
  if (id !== undefined && (typeof id !== "string" || !/^[1-9]\d*$/.test(id))) {
    return response.status(400).json({ error: "Ugyldig bok-ID." });
  }
  if (Object.values(params).some((value) => typeof value !== "string")) {
    return response.status(400).json({ error: "Ugyldige søkeparametere." });
  }

  try {
    const query = new URLSearchParams(params);
    const url = id
      ? `https://gutendex.com/books/${id}/`
      : `https://gutendex.com/books/?${query.toString()}`;
    const apiResponse = await fetch(url, { signal: AbortSignal.timeout(UPSTREAM_TIMEOUT) });
    if (!apiResponse.ok) throw new Error("Gutendex er utilgjengelig.");
    const data = await apiResponse.json();
    const valid = id ? isBook(data) && String(data.id) === id : isBookList(data);
    if (!valid) throw new Error("Ugyldige bokdata fra Gutendex.");
    return response.status(200).json({ ...data, fallback: false });
  } catch {
    // HTTP-feil, nettverksfeil, tidsavbrudd og ugyldige data bruker samme reserve.
    if (id) {
      const book = fallbackBooks.find((book) => String(book.id) === id);
      if (!book) {
        return response.status(404).json({
          error: "Boken finnes ikke i det begrensede utvalget eksempelbøker. Prøv igjen senere.",
          fallback: true,
        });
      }
      return response.status(200).json({ ...book, fallback: true });
    }
    return response.status(200).json(getFallbackList(params));
  }
}
