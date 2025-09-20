import React from 'react';
import BotIcon from './BotIcon';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string | React.ReactNode;
  isLoading?: boolean;
}

const MessageBubble = React.memo<MessageBubbleProps>(({ role, content, isLoading = false }) => {
  return (
    <div className={`flex items-start gap-3 message-fade-in ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {role === 'assistant' && <BotIcon />}
      <div className={`max-w-lg px-4 py-3 rounded-2xl shadow-sm ${
        role === 'user' 
          ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-none' 
          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none'
      }`}>
        {typeof content === 'string' ? (
          <p className="text-base leading-relaxed">{content}</p>
        ) : (
          content
        )}
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';
export default MessageBubble;
