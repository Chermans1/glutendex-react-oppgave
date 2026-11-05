import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import BookCard from "../components/BookCard";

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const requestedPage = Number(searchParams.get("page"));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 25000);

    async function fetchBooks() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/books/?search=${encodeURIComponent(search)}&page=${page}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Kunne ikke hente bøker.");
        }

        const data = await response.json();

        if (!Array.isArray(data?.results)) {
          throw new Error("Gutendex returnerte ugyldige bokdata.");
        }
        if (!active || controller.signal.aborted) return;
        setBooks(data.results.filter((book) => book && Number.isInteger(book.id) && typeof book.title === "string"));
        setHasNext(Boolean(data.next));
        setHasPrevious(Boolean(data.previous));
      } catch (error) {
        if (active && (timedOut || !controller.signal.aborted)) {
          setError(timedOut ? "Gutendex bruker for lang tid. Prøv igjen om litt." : error.message);
        }
      } finally {
        clearTimeout(timeout);
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchBooks();

    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search, page]);

  function changePage(newPage) {
    setSearchParams({
      search,
      page: String(newPage),
    });

    window.scrollTo(0, 0);
  }

  if (loading) {
    return <p>Laster bøker...</p>;
  }

  if (error) {
    return <p>Feil: {error}</p>;
  }

  return (
    <section>
      <h2>{search ? `Søkeresultater for "${search}"` : "Utforsk bøker"}</h2>

      {books.length === 0 ? (
        <p>Ingen bøker funnet.</p>
      ) : (
        <>
          <div className="book-grid">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          <div className="pagination">
            <button
              onClick={() => changePage(page - 1)}
              disabled={!hasPrevious}
            >
              ← Forrige
            </button>

            <span>Side {page}</span>

            <button onClick={() => changePage(page + 1)} disabled={!hasNext}>
              Neste →
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default Home;
