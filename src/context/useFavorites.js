import { useContext } from "react";
import { FavoritesContext } from "./FavoritesContextObject";

export function useFavorites() {
  return useContext(FavoritesContext);
}
