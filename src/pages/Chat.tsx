import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { api } from '../api/client';
import MessageBubble from '../components/chat/MessageBubble';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI Nutritionist. I can help you with meal planning, nutrition advice, dietary questions, and understanding your food logs. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load chat history (excluding the default welcome message)
    api.getChatHistory().then((response) => {
      if (response.data.messages && response.data.messages.length > 0) {
        const historyMessages = response.data.messages.map((msg: any) => ({
          role: msg.who === 'user' ? 'user' : 'assistant',
          content: msg.message
        }));
        setMessages([messages[0], ...historyMessages]);
      }
    }).catch((err) => {
      console.error('Failed to load chat history:', err);
    });
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.sendChatMessage(userMessage.content);
      const aiMessage: Message = {
        role: 'assistant',
        content: response.data.message
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-3xl font-bold text-[#6B5B95]" style={{ fontFamily: 'Georgia, serif' }}>
          Talk to AharaGPT
        </h1>
        <p className="text-[#8B7355] text-sm">Ask for recipes, progress, meal plans & nutrition advice</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-thin scrollbar-thumb-[#D4E7FF] scrollbar-track-transparent">
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/50 backdrop-blur-sm rounded-[20px] px-6 py-4 clay-shadow">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#6B5B95] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-[#6B5B95] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-[#6B5B95] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white/50 backdrop-blur-sm rounded-[20px] p-4 clay-shadow">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about nutrition..."
            className="flex-1 min-h-[60px] max-h-[120px] resize-none rounded-[16px] bg-white/70 border-0 p-3 text-[#6B5B95] placeholder:text-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#C4B5E8]/50"
            style={{
              boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.7)'
            }}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-[60px] w-[60px] bg-gradient-to-br from-[#E8DEFF] to-[#D4E7FF] rounded-[16px] clay-shadow flex-shrink-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
          >
            <Send className="w-6 h-6 text-[#6B5B95]" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;

