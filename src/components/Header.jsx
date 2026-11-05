import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const categories = [
  "Fiction",
  "Mystery",
  "Thriller",
  "Romance",
  "Fantasy",
  "Morality",
  "Society",
  "Power",
  "Justice",
  "Adventure",
  "Tragedy",
  "War",
  "Philosophy",
];

function Header() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  function handleSearch(event) {
    event.preventDefault();

    if (search.trim()) {
      navigate(`/?search=${encodeURIComponent(search.trim())}`);
    }
  }

  return (
    <header>
      <h1>Gutendex</h1>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Søk etter bøker..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <button type="submit">Søk</button>
      </form>

      <nav className="main-nav">
        <Link to="/">Hjem</Link>
        <Link to="/favorites">Favoritter</Link>
      </nav>

      <nav className="category-nav">
        {categories.map((category) => (
          <Link key={category} to={`/category/${category.toLowerCase()}`}>
            {category}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export default Header;
