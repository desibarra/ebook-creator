import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MarkdownBlockProps {
    content: string;
    fontSize?: number;
}

export function MarkdownBlock({ content, fontSize }: MarkdownBlockProps) {
    return (
        <div
            className="markdown-content prose prose-slate dark:prose-invert max-w-none prose-p:mb-4 prose-li:mb-2 prose-headings:mb-4 text-gray-700 dark:text-gray-300"
            style={fontSize ? { fontSize: `${fontSize}px` } : undefined}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    // Customizar estilos preservando atributos originales (como style de alineación)
                    strong: ({ node: _node, ...props }) => (
                        <strong className="font-bold text-gray-900 dark:text-white" {...props} />
                    ),
                    em: ({ node: _node, ...props }) => (
                        <em className="italic text-gray-800 dark:text-gray-200" {...props} />
                    ),
                    p: ({ node: _node, ...props }) => (
                        <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed last:mb-0" {...props} />
                    ),
                    ul: ({ node: _node, ...props }) => (
                        <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300" {...props} />
                    ),
                    ol: ({ node: _node, ...props }) => (
                        <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300" {...props} />
                    ),
                    li: ({ node: _node, ...props }) => (
                        <li className="text-gray-700 dark:text-gray-300" {...props} />
                    ),
                    h1: ({ node: _node, ...props }) => (
                        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white mt-8 first:mt-0" {...props} />
                    ),
                    h2: ({ node: _node, ...props }) => (
                        <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white mt-6 first:mt-0" {...props} />
                    ),
                    h3: ({ node: _node, ...props }) => (
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white mt-4 first:mt-0" {...props} />
                    ),
                    table: ({ node: _node, ...props }) => (
                        <div className="overflow-x-auto mb-4 border rounded-lg">
                            <table className="min-w-full border-collapse" {...props} />
                        </div>
                    ),
                    // ... el resto de la tabla
                    thead: ({ node: _node, ...props }) => <thead className="bg-gray-100 dark:bg-gray-800" {...props} />,
                    tbody: ({ node: _node, ...props }) => <tbody className="bg-white dark:bg-gray-900" {...props} />,
                    tr: ({ node: _node, ...props }) => <tr className="border-b border-gray-200 dark:border-gray-700 last:border-0 text-sm" {...props} />,
                    th: ({ node: _node, ...props }) => <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 last:border-0 uppercase text-[10px] tracking-wider" {...props} />,
                    td: ({ node: _node, ...props }) => <td className="px-4 py-2 text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-0 leading-relaxed" {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
