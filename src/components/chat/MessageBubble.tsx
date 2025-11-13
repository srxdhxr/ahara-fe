import { Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#E8DEFF] to-[#D4E7FF] flex items-center justify-center flex-shrink-0 clay-shadow">
          <Sparkles className="w-5 h-5 text-[#6B5B95]" strokeWidth={2} />
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div
          className={`rounded-[20px] px-5 py-3 ${
            isUser
              ? 'bg-gradient-to-br from-[#6B5B95] to-[#8B7BAD] text-white clay-shadow'
              : 'bg-white/50 backdrop-blur-sm clay-shadow'
          }`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-white">
              {message.content}
            </p>
          ) : (
            <div className="text-sm prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0 leading-relaxed text-[#6B5B95]">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="my-2 ml-4 list-disc text-[#6B5B95] space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-2 ml-4 list-decimal text-[#6B5B95] space-y-1">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-[#6B5B95] leading-relaxed">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-[#6B5B95]">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-[#6B5B95]">{children}</em>
                ),
                code: ({ children }) => (
                  <code className="px-1.5 py-0.5 rounded-[8px] bg-[#E8DEFF]/50 text-[#6B5B95] text-xs font-mono">
                    {children}
                  </code>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-bold mb-2 text-[#6B5B95]">{children}</h3>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-[#E8DEFF] pl-3 my-2 text-[#6B5B95] italic">
                    {children}
                  </blockquote>
                ),
              }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

