/**
 * AISuggestions Component
 * AI-powered task suggestion generator
 * 
 * @module features/tasks/components/AISuggestions
 */

import { useState, type JSX, type KeyboardEvent } from 'react';
import { Sparkles, Lightbulb, X } from 'lucide-react';
import { aiService } from '@/features/ai/services/aiService';
import { taskService } from '@/features/tasks/services/taskService';
import { useTaskStore } from '@/stores/taskStore';
import { LoadingSpinner } from '@/components/common';
import type { AISuggestion } from '@/types';
import toast from 'react-hot-toast';

interface SuggestionItemState {
  id: string;
  title: string;
  description: string;
  isCreating: boolean;
}

export default function AISuggestions(): JSX.Element {
  const addTask = useTaskStore((state) => state.addTask);
  
  const [context, setContext] = useState<string>('');
  const [suggestions, setSuggestions] = useState<SuggestionItemState[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getSuggestions = async (): Promise<void> => {
    if (!context.trim()) {
      toast.error('Please enter some context');
      return;
    }

    setLoading(true);
    
    try {
      const results: AISuggestion[] = await aiService.getSuggestions(context);
      
      const mappedSuggestions: SuggestionItemState[] = results.map((item, index) => ({
        id: `suggestion-${Date.now()}-${index}`,
        title: item.title,
        description: item.description,
        isCreating: false,
      }));
      
      setSuggestions(mappedSuggestions);
      toast.success(`Generated ${results.length} suggestions!`);
    } catch (error: unknown) {
      console.error('Failed to get suggestions:', error);
      toast.error('Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (suggestion: SuggestionItemState): Promise<void> => {
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === suggestion.id ? { ...s, isCreating: true } : s
      )
    );

    try {
      const newTask = await taskService.createTask({
        title: suggestion.title.replace(/^\d+\.\s*/, ''),
        description: suggestion.description,
        status: 'todo',
        priority: 'medium',
      });
      
      addTask(newTask);
      toast.success('Task created!');
      
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
    } catch (error: unknown) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task');
      
      setSuggestions((prev) =>
        prev.map((s) =>
          s.id === suggestion.id ? { ...s, isCreating: false } : s
        )
      );
    }
  };

  const removeSuggestion = (id: string): void => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  const clearAllSuggestions = (): void => {
    setSuggestions([]);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      getSuggestions();
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-4 sm:p-6 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
            AI Task Suggestions
          </h3>
          <p className="text-sm text-gray-600 hidden sm:block">
            Describe your project and get task ideas
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <label 
            htmlFor="ai-context"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            What are you working on?
          </label>
          <textarea
            id="ai-context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={3}
            className="w-full px-4 py-3 border border-purple-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all resize-none"
            placeholder="E.g., Planning a wedding, Building a mobile app, Learning Python..."
            disabled={loading}
            aria-describedby="context-hint"
          />
          <p id="context-hint" className="mt-1 text-xs text-gray-500">
            Press Ctrl+Enter to generate
          </p>
        </div>

        <button
          type="button"
          onClick={getSuggestions}
          disabled={loading || !context.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-200"
          aria-busy={loading}
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" className="text-white" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Suggestions</span>
            </>
          )}
        </button>
      </div>

      {/* Suggestions List */}
      {suggestions.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <span>{suggestions.length} Suggestions</span>
            </p>
            <button
              type="button"
              onClick={clearAllSuggestions}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="group relative bg-white border border-purple-100 rounded-xl p-3 sm:p-4 hover:border-purple-300 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-gray-800 truncate">
                      {suggestion.title}
                    </p>
                    {suggestion.description && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                        {suggestion.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => createTask(suggestion)}
                      disabled={suggestion.isCreating}
                      className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {suggestion.isCreating ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <span>Create</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSuggestion(suggestion.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Remove suggestion"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {suggestions.length === 0 && !loading && (
        <div className="mt-6 bg-white/50 rounded-xl p-4">
          <p className="text-xs text-gray-600 font-medium mb-2">💡 Examples:</p>
          <div className="space-y-1 text-xs text-gray-600">
            <p>• Planning a wedding, Building a mobile app</p>
            <p>• Learning Python, Organizing a team event</p>
            <p>• Launching a product, Preparing for interview</p>
          </div>
        </div>
      )}
    </div>
  );
}