import ReactMarkdown from 'react-markdown';

interface Props {
  content: string;
  className?: string;
}

export const MarkdownRenderer = ({ content, className = '' }: Props) => (
  <div className={`prose prose-invert max-w-none ${className}`}>
    <ReactMarkdown
      components={{
        h1: ({ ...props }) => <h1 className="text-base font-bold mt-3 mb-1.5 text-slate-900 dark:text-white" {...props} />,
        h2: ({ ...props }) => <h2 className="text-sm font-bold mt-2.5 mb-1 text-slate-900 dark:text-white" {...props} />,
        h3: ({ ...props }) => <h3 className="text-xs font-bold mt-2 mb-1 text-slate-900 dark:text-white" {...props} />,
        p: ({ ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
        ul: ({ ...props }) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
        ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
        li: ({ ...props }) => <li className="mb-0.5" {...props} />,
        strong: ({ ...props }) => <strong className="font-bold text-slate-950 dark:text-white" {...props} />,
        code: ({ ...props }) => <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[11px]" {...props} />
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);
