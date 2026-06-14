import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * MessageContent — renders chat text as grounded, readable markdown.
 * Used across every chat surface (single, council, campfire, dream team) so
 * character replies get rich formatting per the project's chat UI standards.
 * No raw HTML is rendered (react-markdown is safe by default).
 */
export default function MessageContent({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div className={`md ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
