function FallbackNotice({ show }) {
  if (!show) return null;

  return (
    <p role="status">
      Gutendex er midlertidig utilgjengelig. Viser et begrenset utvalg eksempelbøker.
    </p>
  );
}

export default FallbackNotice;
