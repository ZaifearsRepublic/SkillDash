import React, { useMemo } from 'react';

interface RichTextRendererProps {
  content: any;
}

const RichTextRenderer = React.memo<RichTextRendererProps>(({ content }) => {
  const renderedContent = useMemo(() => {
    if (typeof content === 'string') {
      return content;
    }
    
    if (content && content.content) {
      return content.content.map((node: any, index: number) => {
        if (node.nodeType === 'paragraph') {
          return (
            <p key={index} className="mb-4">
              {node.content?.map((textNode: any, textIndex: number) => (
                <span key={textIndex}>{textNode.value}</span>
              )) || ''}
            </p>
          );
        }
        return null;
      });
    }
    
    return content || 'No content available';
  }, [content]);

  return (
    <div className="whitespace-pre-line text-gray-600 dark:text-gray-400 leading-relaxed">
      {renderedContent}
    </div>
  );
});

RichTextRenderer.displayName = 'RichTextRenderer';
export default RichTextRenderer;
