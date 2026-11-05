import { Link } from "react-router-dom";

function BookCard({ book }) {
  return (
    <Link to={`/book/${book.id}`} className="book-card">
      {book.formats?.["image/jpeg"] ? (
        <img src={book.formats["image/jpeg"]} alt={`Omslag til ${book.title}`} />
      ) : (
        <p>Ingen bokomslag tilgjengelig</p>
      )}

      <h3>{book.title}</h3>

      <p>
        {(Array.isArray(book.authors) ? book.authors : []).map((author) => author?.name).filter((name) => typeof name === "string").join(", ") ||
          "Ukjent forfatter"}
      </p>
    </Link>
  );
}

export default BookCard;
