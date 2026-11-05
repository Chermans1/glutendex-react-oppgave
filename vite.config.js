import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import booksHandler from "./api/books.js";

// Samme API-funksjon lokalt og på Vercel, inkludert reserveløsningen.
function localBooksApi() {
  return {
    name: "local-books-api",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const url = new URL(request.url, "http://localhost");
        if (!url.pathname.startsWith("/api/")) return next();
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        const match = url.pathname.match(/^\/api\/books(?:\/([^/]+))?\/?$/);
        if (!match) {
          response.statusCode = 404;
          return response.end(JSON.stringify({ error: "Fant ikke API-ruten." }));
        }
        const query = {};
        for (const key of url.searchParams.keys()) {
          const values = url.searchParams.getAll(key);
          query[key] = values.length === 1 ? values[0] : values;
        }
        if (match[1]) query.id = match[1];
        const apiResponse = {
          setHeader: (name, value) => response.setHeader(name, value),
          status(code) {
            response.statusCode = code;
            return this;
          },
          json: (data) => response.end(JSON.stringify(data)),
        };
        await booksHandler({ method: request.method, query }, apiResponse);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localBooksApi()],
});
