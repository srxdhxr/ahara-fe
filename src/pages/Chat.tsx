import { useState, useRef, useEffect } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import ReactMarkdown from 'react-markdown';

function Chat() {
  // Load saved question and answer from sessionStorage on mount
  const [question, setQuestion] = useState(() => {
    const saved = sessionStorage.getItem('chatQuestion');
    return saved || '';
  });
  const [answer, setAnswer] = useState(() => {
    const saved = sessionStorage.getItem('chatAnswer');
    return saved || '';
  });
  const [isLoading, setIsLoading] = useState(false);
  const answerContainerRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLDivElement>(null);

  // Save question and answer to sessionStorage
  useEffect(() => {
    if (question) {
      sessionStorage.setItem('chatQuestion', question);
    }
  }, [question]);

  useEffect(() => {
    if (answer) {
      sessionStorage.setItem('chatAnswer', answer);
    } else {
      sessionStorage.removeItem('chatAnswer');
    }
  }, [answer]);

  const handleSearch = async (queryOverride?: string) => {
    const queryToUse = queryOverride || question.trim();
    if (!queryToUse || isLoading) return;

    setIsLoading(true);
    setAnswer('');
    if (queryOverride) {
      setQuestion(queryOverride);
    }

    try {
      // Get nutrition context from sessionStorage
      let nutritionContext = null;
      try {
        const contextStr = sessionStorage.getItem('nutritionContext');
        if (contextStr) {
          const context = JSON.parse(contextStr);
          // Check if context is recent (within last 24 hours)
          const contextTime = new Date(context.timestamp);
          const now = new Date();
          const hoursDiff = (now.getTime() - contextTime.getTime()) / (1000 * 60 * 60);
          if (hoursDiff < 24) {
            nutritionContext = {
              todayTotalCalories: context.todayTotalCalories,
              todayTotalProtein: context.todayTotalProtein,
              todayTotalCarbs: context.todayTotalCarbs,
              todayTotalFat: context.todayTotalFat,
              todayCalGoal: context.todayCalGoal,
              calorieStatus: context.calorieStatus
            };
          }
        }
      } catch (e) {
        console.error('Error reading nutrition context:', e);
      }
      
      const response = await api.sendChatMessage(queryToUse, nutritionContext);
      setAnswer(response.data.message);
    } catch (error) {
      console.error('Failed to get answer:', error);
      setAnswer("I'm sorry, I encountered an error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to answer container when answer appears
  useEffect(() => {
    if (answer || isLoading) {
      setTimeout(() => {
        answerContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [answer, isLoading]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const hasResponse = isLoading || answer;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto px-3 sm:px-4">
      {/* Header */}
      <div className={`text-center space-y-2 transition-all duration-300 ${hasResponse ? 'mb-4' : 'mb-auto'}`}>
        <h1 className="text-3xl font-bold text-[#6B5B95]" style={{ fontFamily: 'Georgia, serif' }}>
          Ask AharaGPT
        </h1>
        <p className="text-[#8B7355] text-sm">Get insights about your nutrition, recipes, progress & meal advice</p>
      </div>

      {/* Search Box - Centered when no response, moves up when response appears */}
      <div 
        ref={chatInputRef}
        className={`bg-white/50 backdrop-blur-sm rounded-[20px] p-3 sm:p-4 clay-shadow transition-all duration-300 ${
          hasResponse ? 'mb-4' : 'mb-4 mx-auto w-full max-w-2xl'
        }`}
      >
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
            onClick={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            disabled={!question.trim() || isLoading}
            className="px-3 py-1.5 sm:px-6 sm:py-2 bg-gradient-to-br from-[#E8DEFF] to-[#D4E7FF] rounded-[12px] sm:rounded-[16px] clay-shadow text-xs sm:text-sm text-[#6B5B95] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 flex-shrink-0 whitespace-nowrap"
          >
            {isLoading ? 'Thinking...' : 'Ask'}
          </button>
        </div>
      </div>

      {/* Sample Query Capsules - Only show when no response */}
      {!hasResponse && (
        <div className="flex flex-wrap gap-2 justify-center items-center mx-auto w-full max-w-2xl mb-auto">
          {[
            "What did I eat today?",
            "Suggest a healthy breakfast",
            "How many calories did I consume?",
            "Give me a recipe idea"
          ].map((sampleQuery) => (
            <button
              key={sampleQuery}
              onClick={(e) => {
                e.preventDefault();
                handleSearch(sampleQuery);
              }}
              disabled={isLoading}
              className="px-3 py-1.5 bg-white/40 backdrop-blur-sm rounded-[12px] text-xs sm:text-sm text-[#6B5B95] font-medium hover:bg-white/60 transition-all hover:scale-105 clay-shadow border border-white/60 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sampleQuery}
            </button>
          ))}
        </div>
      )}

      {/* Answer Container */}
      {(isLoading || answer) && (
        <div ref={answerContainerRef} className="flex-1 overflow-y-auto flex items-start justify-center pt-4">
          <div className="bg-white/50 backdrop-blur-sm rounded-[20px] p-4 sm:p-6 clay-shadow w-full max-w-3xl">
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="w-6 h-6 text-[#6B5B95] animate-pulse" strokeWidth={2} />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#6B5B95] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#6B5B95] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#6B5B95] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-center gap-2 mb-4">
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

