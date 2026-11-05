import FallbackNotice from "../components/FallbackNotice";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import BookCard from "../components/BookCard";

function Category() {
  const { category } = useParams();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fallback, setFallback] = useState(false);

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
      setFallback(false);
      setBooks([]);

      try {
        const response = await fetch(
          `/api/books/?topic=${encodeURIComponent(category)}`,
          { signal: controller.signal },
        );

        const data = await response.json();
        if (!active || controller.signal.aborted) return;
        setFallback(data?.fallback === true);
        if (!response.ok) {
          throw new Error(data?.error || "Kunne ikke hente bøker i denne kategorien.");
        }

        if (!Array.isArray(data?.results)) {
          throw new Error("Gutendex returnerte ugyldige bokdata.");
        }
        if (!active || controller.signal.aborted) return;
        setBooks(data.results.filter((book) => book && Number.isInteger(book.id) && typeof book.title === "string"));
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
  }, [category]);

  return (
    <section>
      <h2>Kategori: {category.charAt(0).toUpperCase() + category.slice(1)}</h2>

      {!loading && <FallbackNotice show={fallback} />}

      {loading && <p>Laster bøker...</p>}

      {error && <p>Feil: {error}</p>}

      {!loading && !error && books.length === 0 && (
        <p>Ingen bøker funnet i denne kategorien.</p>
      )}

      {!loading && !error && books.length > 0 && (
        <div className="book-grid">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Category;
