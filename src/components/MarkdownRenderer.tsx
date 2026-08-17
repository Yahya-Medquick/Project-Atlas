import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface Props {
  content: string;
  className?: string;
}

export const MarkdownRenderer = ({ content, className = '' }: Props) => {
  if (!content || content.trim() === '') return null;
  return (
    <div className={`prose prose-invert prose-sm max-w-none
      prose-headings:text-white prose-headings:font-bold prose-headings:mb-2
      prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-3
      prose-strong:text-white prose-strong:font-semibold
      prose-ul:text-gray-300 prose-ul:pl-5 prose-ul:mb-3
      prose-ol:text-gray-300 prose-ol:pl-5 prose-ol:mb-3
      prose-li:mb-1 prose-li:marker:text-blue-400
      prose-code:text-blue-300 prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded
      prose-blockquote:border-l-blue-500 prose-blockquote:text-gray-400
      prose-hr:border-gray-600
      ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ ...props }) => <h1 className="text-base font-bold mt-3 mb-1.5 text-white" {...props} />,
          h2: ({ ...props }) => <h2 className="text-sm font-bold mt-2.5 mb-1 text-white" {...props} />,
          h3: ({ ...props }) => <h3 className="text-xs font-bold mt-2 mb-1 text-white" {...props} />,
          p: ({ ...props }) => <p className="mb-2 last:mb-0 leading-relaxed text-gray-300" {...props} />,
          ul: ({ ...props }) => <ul className="list-disc pl-5 mb-2 space-y-1 text-gray-300" {...props} />,
          ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-1 text-gray-300" {...props} />,
          li: ({ ...props }) => <li className="mb-0.5 text-gray-300" {...props} />,
          strong: ({ ...props }) => <strong className="font-bold text-white" {...props} />,
          code: ({ ...props }) => <code className="bg-gray-800 px-1 py-0.5 rounded font-mono text-blue-300 text-[11px]" {...props} />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
