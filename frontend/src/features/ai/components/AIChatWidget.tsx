/**
 * AIChatWidget Component
 * Floating AI assistant chat widget
 */

import { useState, useRef, useEffect, type JSX, type KeyboardEvent } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, Bot, User } from 'lucide-react';
import Button from '@/features/ai/components/Button';
import { aiService } from '@/features/ai/services/aiService';
import { createLogger } from '@/utils/logger';
import { toastService } from '@/utils/toast';
import type { AIChatMessage } from '@/types';

const logger = createLogger('AIChatWidget');

type ChatMode = 'help' | 'coach';

const INITIAL_MESSAGES: Record<ChatMode, AIChatMessage> = {
  help: {
    role: 'assistant',
    content: '👋 Hi! I\'m your AI assistant. Ask me anything about the app or how to manage your tasks effectively!',
    timestamp: new Date(),
  },
  coach: {
    role: 'assistant',
    content: '🎯 Welcome to coaching mode! Let\'s talk about your productivity, goals, and how to work smarter!',
    timestamp: new Date(),
  },
};

export default function AIChatWidget(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([INITIAL_MESSAGES.help]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('help');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (): Promise<void> => {
    if (!input.trim() || loading) return;

    const userMessage: AIChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    logger.info('Sending message', { mode: chatMode, messageLength: input.length });
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = chatMode === 'help'
        ? await aiService.sendHelpMessage(userMessage.content, chatMode)
        : await aiService.sendCoachMessage(userMessage.content, chatMode);

      const aiMessage: AIChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      logger.info('Response received', { mode: chatMode });
    } catch (error) {
      logger.error('Chat error', error as Error);
      toastService.error('Failed to get response');
      
      // Add error message to chat
      const errorMessage: AIChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const switchMode = (mode: ChatMode): void => {
    logger.info('Switching chat mode', { from: chatMode, to: mode });
    setChatMode(mode);
    setMessages([INITIAL_MESSAGES[mode]]);
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Floating button when closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-violet-500/50 transition-all duration-300 hover:scale-110 z-50 group"
        aria-label="Open AI Assistant"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">AI Assistant</h3>
              <p className="text-xs text-violet-200">Always here to help</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => switchMode('help')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              chatMode === 'help'
                ? 'bg-white text-violet-600'
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            💡 Help Center
          </button>
          <button
            onClick={() => switchMode('coach')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              chatMode === 'coach'
                ? 'bg-white text-violet-600'
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            🎯 Coach
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                message.role === 'user' 
                  ? 'bg-violet-100' 
                  : 'bg-gradient-to-br from-violet-500 to-purple-600'
              }`}>
                {message.role === 'user' 
                  ? <User className="w-4 h-4 text-violet-600" />
                  : <Bot className="w-4 h-4 text-white" />
                }
              </div>

              {/* Message Bubble */}
              <div
                className={`p-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-md'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
                <p className={`text-xs mt-1.5 ${
                  message.role === 'user' ? 'text-violet-200' : 'text-gray-400'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-bl-md border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                  <span className="text-sm text-gray-500">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={chatMode === 'help' ? 'Ask about features...' : 'Ask for advice...'}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-500 focus:bg-white transition-all"
            disabled={loading}
          />
          <Button
            variant="primary"
            size="icon"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>

        {/* Quick suggestions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {chatMode === 'help' ? (
            <>
              <button
                onClick={() => setInput('How do I create a task?')}
                className="text-xs px-2.5 py-1 bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 transition-colors"
              >
                Create task
              </button>
              <button
                onClick={() => setInput('How do voice commands work?')}
                className="text-xs px-2.5 py-1 bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 transition-colors"
              >
                Voice commands
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setInput('How can I be more productive?')}
                className="text-xs px-2.5 py-1 bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 transition-colors"
              >
                Productivity tips
              </button>
              <button
                onClick={() => setInput('Help me prioritize my tasks')}
                className="text-xs px-2.5 py-1 bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 transition-colors"
              >
                Prioritize
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}