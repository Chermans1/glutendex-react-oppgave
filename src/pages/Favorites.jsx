import BookCard from "../components/BookCard";
import { useFavorites } from "../context/useFavorites";

function Favorites() {
  const { favorites, removeFavorite } = useFavorites();

  return (
    <section>
      <h2>Mine favorittbøker</h2>

      <p>Du har {favorites.length} bøker i favorittlisten.</p>

      {favorites.length === 0 ? (
        <p>Du har ingen favorittbøker ennå.</p>
      ) : (
        <div className="book-grid">
          {favorites.map((book) => (
            <div key={book.id} className="favorite-card">
              <BookCard book={book} />

              <button
                className="remove-favorite"
                onClick={() => removeFavorite(book.id)}
              >
                Fjern fra favoritter
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Favorites;
