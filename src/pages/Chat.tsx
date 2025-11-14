import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import ReactMarkdown from 'react-markdown';

function Chat() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    setAnswer('');

    try {
      const response = await api.sendChatMessage(question.trim());
      setAnswer(response.data.message);
    } catch (error) {
      console.error('Failed to get answer:', error);
      setAnswer("I'm sorry, I encountered an error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto px-3 sm:px-4">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-[#6B5B95]" style={{ fontFamily: 'Georgia, serif' }}>
          Ask AharaGPT
        </h1>
        <p className="text-[#8B7355] text-sm">Get insights about your nutrition, recipes, progress & meal advice</p>
      </div>

      {/* Search Box */}
      <div className="bg-white/50 backdrop-blur-sm rounded-[20px] p-3 sm:p-4 clay-shadow mb-6">
        <div className="flex gap-2 sm:gap-3 items-center">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#6B5B95] flex-shrink-0" strokeWidth={2} />
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your diet, recipes, progress..."
            className="flex-1 min-w-0 bg-transparent border-0 p-1.5 sm:p-2 text-sm sm:text-base text-[#6B5B95] placeholder:text-[#8B7355] focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSearch}
            disabled={!question.trim() || isLoading}
            className="px-3 py-1.5 sm:px-6 sm:py-2 bg-gradient-to-br from-[#E8DEFF] to-[#D4E7FF] rounded-[12px] sm:rounded-[16px] clay-shadow text-xs sm:text-sm text-[#6B5B95] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 flex-shrink-0 whitespace-nowrap"
          >
            {isLoading ? 'Thinking...' : 'Ask'}
          </button>
        </div>
      </div>

      {/* Answer Container */}
      {(isLoading || answer) && (
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white/50 backdrop-blur-sm rounded-[20px] p-4 sm:p-6 clay-shadow">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-[#6B5B95] animate-pulse" strokeWidth={2} />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#6B5B95] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#6B5B95] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#6B5B95] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-[#6B5B95]" strokeWidth={2} />
                  <span className="text-sm font-semibold text-[#6B5B95]">AharaGPT</span>
                </div>
                <div className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 break-words">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-[#6B5B95]">{children}</p>,
                      ul: ({ children }) => <ul className="my-2 ml-4 list-disc text-[#6B5B95]">{children}</ul>,
                      ol: ({ children }) => <ol className="my-2 ml-4 list-decimal text-[#6B5B95]">{children}</ol>,
                      li: ({ children }) => <li className="mb-1 text-[#6B5B95]">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-[#6B5B95]">{children}</strong>,
                      em: ({ children }) => <em className="italic text-[#6B5B95]">{children}</em>,
                      code: ({ children }) => (
                        <code className="px-1.5 py-0.5 rounded-[8px] bg-[#E8DEFF]/50 text-[#6B5B95] text-xs font-mono">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {answer}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;

