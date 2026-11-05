import { useState, useEffect } from "react";
import { FavoritesContext } from "./FavoritesContextObject";

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("favorites") || "[]");
      return Array.isArray(saved)
        ? saved.filter((book) => book && Number.isInteger(book.id) && typeof book.title === "string")
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    } catch {
      console.warn("Kunne ikke lagre favoritter i nettleseren.");
    }
  }, [favorites]);

  function addFavorite(book) {
    setFavorites((previousFavorites) => {
      const alreadyFavorite = previousFavorites.some(
        (favorite) => favorite.id === book.id,
      );

      if (alreadyFavorite) {
        return previousFavorites;
      }

      return [...previousFavorites, book];
    });
  }

  function removeFavorite(id) {
    setFavorites((previousFavorites) =>
      previousFavorites.filter((book) => book.id !== id),
    );
  }

  function isFavorite(id) {
    return favorites.some((book) => book.id === id);
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}
