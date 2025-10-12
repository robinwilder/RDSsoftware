import React, { useMemo } from 'react';
import { sanitizeHtml } from '../utils/security';

const CustomPageView = ({ page }) => {
  // Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = useMemo(() => {
    return page?.content ? sanitizeHtml(page.content) : '';
  }, [page?.content]);

  if (!page) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h1>
          <p className="text-gray-600">The page you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <article className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-6">{page.title}</h1>
        <div
          className="prose max-w-none custom-page-content"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </article>

      <style jsx>{`
        .custom-page-content h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }

        .custom-page-content h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
        }

        .custom-page-content h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 1em 0;
        }

        .custom-page-content p {
          margin: 1em 0;
          line-height: 1.6;
        }

        .custom-page-content ul, .custom-page-content ol {
          padding-left: 2em;
          margin: 1em 0;
        }

        .custom-page-content blockquote {
          border-left: 3px solid #ddd;
          padding-left: 1em;
          margin-left: 0;
          font-style: italic;
          color: #666;
        }

        .custom-page-content code {
          background-color: #f4f4f4;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: monospace;
        }

        .custom-page-content pre {
          background-color: #f4f4f4;
          padding: 1em;
          border-radius: 5px;
          overflow-x: auto;
        }

        .custom-page-content pre code {
          background: none;
          padding: 0;
        }

        .custom-page-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1em 0;
        }

        .custom-page-content a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .custom-page-content a:hover {
          color: #2563eb;
        }

        .custom-page-content strong {
          font-weight: bold;
        }

        .custom-page-content em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default CustomPageView;