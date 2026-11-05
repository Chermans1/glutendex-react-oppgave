export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Bare GET er tillatt." });
  }
  const { id, ...params } = request.query;
  if (id !== undefined && (typeof id !== "string" || !/^[1-9]\d*$/.test(id))) {
    return response.status(400).json({ error: "Ugyldig bok-ID." });
  }
  try {

    const query = new URLSearchParams(params);

    const url = id
      ? `https://gutendex.com/books/${id}/`
      : `https://gutendex.com/books/?${query.toString()}`;

    const apiResponse = await fetch(url, { signal: AbortSignal.timeout(20000) });

    if (!apiResponse.ok) {
      return response.status(apiResponse.status).json({
        error: "Kunne ikke hente data fra Gutendex.",
      });
    }

    const data = await apiResponse.json();

    return response.status(200).json(data);
  } catch (error) {
    const timedOut = error.name === "TimeoutError" || error.name === "AbortError";
    return response.status(timedOut ? 504 : 502).json({
      error: timedOut
        ? "Gutendex bruker for lang tid. Prøv igjen om litt."
        : "Det oppstod en feil ved henting av bøker.",
    });
  }
}
