// Reelle Project Gutenberg-ID-er. Emneordene er et forenklet eksempelutvalg.
// download_count = 0 betyr at vi ikke har lokale nedlastingstall.
// Ingen omslagslenker: grensesnittet viser sin eksisterende reservetekst.
const fallbackBooks = [
  { id: 1342, title: "Pride and Prejudice", authors: [{ name: "Austen, Jane" }], subjects: ["Fiction", "Romance", "Society"], languages: ["en"], download_count: 0, formats: { "text/html": "https://www.gutenberg.org/files/1342/1342-h/1342-h.htm" } },
  { id: 11, title: "Alice's Adventures in Wonderland", authors: [{ name: "Carroll, Lewis" }], subjects: ["Fiction", "Fantasy", "Adventure"], languages: ["en"], download_count: 0, formats: { "text/html": "https://www.gutenberg.org/cache/epub/11/pg11-images.html" } },
  { id: 84, title: "Frankenstein; or, The Modern Prometheus", authors: [{ name: "Shelley, Mary Wollstonecraft" }], subjects: ["Fiction", "Science fiction", "Morality", "Tragedy"], languages: ["en"], download_count: 0, formats: { "text/html": "https://www.gutenberg.org/cache/epub/84/pg84-images.html" } },
  { id: 345, title: "Dracula", authors: [{ name: "Stoker, Bram" }], subjects: ["Fiction", "Horror", "Thriller"], languages: ["en"], download_count: 0, formats: { "text/html": "https://www.gutenberg.org/cache/epub/345/pg345-images.html" } },
  { id: 1661, title: "The Adventures of Sherlock Holmes", authors: [{ name: "Doyle, Arthur Conan" }], subjects: ["Fiction", "Mystery", "Justice"], languages: ["en"], download_count: 0, formats: {} },
  { id: 2701, title: "Moby Dick; or, The Whale", authors: [{ name: "Melville, Herman" }], subjects: ["Fiction", "Adventure", "Tragedy"], languages: ["en"], download_count: 0, formats: { "text/html": "https://www.gutenberg.org/cache/epub/2701/pg2701-images.html" } },
  { id: 74, title: "The Adventures of Tom Sawyer", authors: [{ name: "Twain, Mark" }], subjects: ["Fiction", "Adventure", "Society"], languages: ["en"], download_count: 0, formats: { "text/html": "https://www.gutenberg.org/cache/epub/74/pg74-images.html" } },
  { id: 46, title: "A Christmas Carol", authors: [{ name: "Dickens, Charles" }], subjects: ["Fiction", "Fantasy", "Morality", "Society"], languages: ["en"], download_count: 0, formats: {} },
  { id: 1232, title: "The Prince", authors: [{ name: "Machiavelli, Niccolò" }], subjects: ["Philosophy", "Power", "Politics", "War"], languages: ["en"], download_count: 0, formats: { "text/html": "https://www.gutenberg.org/cache/epub/1232/pg1232-images.html" } },
  { id: 1524, title: "Hamlet", authors: [{ name: "Shakespeare, William" }], subjects: ["Drama", "Tragedy", "Power", "Justice"], languages: ["en"], download_count: 0, formats: { "text/html": "https://www.gutenberg.org/cache/epub/1524/pg1524-images.html" } },
  { id: 1497, title: "The Republic", authors: [{ name: "Plato" }], subjects: ["Philosophy", "Justice", "Society", "Power"], languages: ["en"], download_count: 0, formats: { "text/html": "https://www.gutenberg.org/cache/epub/1497/pg1497-images.html" } },
  { id: 35, title: "The Time Machine", authors: [{ name: "Wells, H. G." }], subjects: ["Fiction", "Science fiction", "Adventure", "Society"], languages: ["en"], download_count: 0, formats: { "text/html": "https://www.gutenberg.org/cache/epub/35/pg35-images.html" } },
];

export default fallbackBooks;
