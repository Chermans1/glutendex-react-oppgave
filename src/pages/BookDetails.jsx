import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useFavorites } from "../context/useFavorites";

function BookDetails() {
  const { id } = useParams();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 25000);

    async function fetchBook() {
      setLoading(true);
      setError("");
      setBook(null);

      try {
        const response = await fetch(`/api/books/${id}/`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Kunne ikke hente informasjon om boken.");
        }

        const data = await response.json();

        if (!data || !Number.isInteger(data.id) || typeof data.title !== "string") {
          throw new Error("Gutendex returnerte ugyldige bokdata.");
        }
        if (active && !controller.signal.aborted) setBook(data);
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

    fetchBook();

    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [id]);

  if (loading) {
    return <p>Laster bokinformasjon...</p>;
  }

  if (error) {
    return <p>Feil: {error}</p>;
  }

  if (!book) {
    return <p>Fant ikke boken.</p>;
  }

  const formats = book.formats || {};
  const authors = Array.isArray(book.authors) ? book.authors : [];
  const subjects = Array.isArray(book.subjects) ? book.subjects.filter((value) => typeof value === "string") : [];
  const languages = Array.isArray(book.languages) ? book.languages.filter((value) => typeof value === "string") : [];
  const cover = formats["image/jpeg"];

  const digitalBook =
    formats["text/html"] ||
    formats["application/epub+zip"] ||
    formats["text/plain; charset=utf-8"] ||
    formats["text/plain"] ||
    formats["application/pdf"];

  return (
    <section className="book-details">
      <Link to="/">← Tilbake til forsiden</Link>

      <div className="book-details-content">
        <div className="book-details-cover">
          {cover ? (
            <img src={cover} alt={`Omslag til ${book.title}`} />
          ) : (
            <p>Ingen bokomslag tilgjengelig</p>
          )}
        </div>

        <div className="book-details-info">
          <h2>{book.title}</h2>

          <p>
            <strong>Forfatter:</strong>{" "}
            {authors.map((author) => author?.name).filter((name) => typeof name === "string").join(", ") ||
              "Ukjent forfatter"}
          </p>

          <p>
            <strong>Nedlastninger:</strong>{" "}
            {(typeof book.download_count === "number" ? book.download_count.toLocaleString("nb-NO") : "Ikke oppgitt")}
          </p>

          <p>
            <strong>Kategori:</strong>{" "}
            {subjects.length > 0
              ? subjects.join(", ")
              : "Ikke oppgitt"}
          </p>

          <p>
            <strong>Språk:</strong>{" "}
            {languages.join(", ") || "Ikke oppgitt"}
          </p>

          {digitalBook ? (
            <a
              href={digitalBook}
              target="_blank"
              rel="noopener noreferrer"
              className="read-button"
            >
              Les boken
            </a>
          ) : (
            <p>Ingen digital versjon tilgjengelig.</p>
          )}

          <button
            className="favorite-button"
            onClick={() => {
              if (isFavorite(book.id)) {
                removeFavorite(book.id);
              } else {
                addFavorite(book);
              }
            }}
          >
            {isFavorite(book.id)
              ? "Fjern fra favoritter"
              : "Legg til i favoritter"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default BookDetails;
