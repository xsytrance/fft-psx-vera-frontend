/**
 * TruthSeal — the parser-verified mark. It communicates that the data is drawn
 * straight from the uploaded save ("this is your actual save"), not invented by
 * the model. Reserve it for parser-confirmed truth.
 */
export default function TruthSeal({
  label = 'Parser-verified',
  className = '',
  title,
}: {
  label?: string;
  className?: string;
  title?: string;
}) {
  return (
    <span className={`truth-seal ${className}`.trim()} title={title ?? 'Drawn from your parsed save file'}>
      <span className="truth-seal__dot" aria-hidden="true" />
      {label}
    </span>
  );
}
