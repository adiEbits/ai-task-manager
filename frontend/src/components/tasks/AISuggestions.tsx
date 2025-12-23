import { useState } from 'react';
import { aiService } from '../../services/aiService';
import { taskService } from '../../services/taskService';
import { useTaskStore } from '../../stores/taskStore';
import { Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AISuggestions() {
  const addTask = useTaskStore((state) => state.addTask);
  const [context, setContext] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<number | null>(null);

  const getSuggestions = async () => {
    if (!context.trim()) {
      toast.error('Please enter some context');
      return;
    }

    setLoading(true);
    try {
      const results = await aiService.getSuggestions(context);
      setSuggestions(results);
      toast.success('AI suggestions generated!');
    } catch (error) {
      toast.error('Failed to generate suggestions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (suggestion: string, index: number) => {
    setCreating(index);
    try {
      const newTask = await taskService.createTask({
        title: suggestion.replace(/^\d+\.\s*/, ''), // Remove numbering
        status: 'todo',
        priority: 'medium',
      });
      addTask(newTask);
      toast.success('Task created!');
      
      // Remove from suggestions
      setSuggestions(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      toast.error('Failed to create task');
      console.error(error);
    } finally {
      setCreating(null);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-bold text-gray-900">AI Task Suggestions</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What are you working on?
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            placeholder="E.g., Planning a wedding, Building a mobile app, Learning Python..."
          />
        </div>

        <button
          onClick={getSuggestions}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Task Suggestions
            </>
          )}
        </button>

        {suggestions.length > 0 && (
          <div className="mt-6 space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-3">
              AI Suggestions (click to create):
            </p>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => createTask(suggestion, index)}
                disabled={creating === index}
                className="w-full text-left px-4 py-3 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg transition group disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 group-hover:text-purple-700">
                    {suggestion}
                  </span>
                  {creating === index ? (
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  ) : (
                    <span className="text-purple-600 text-sm opacity-0 group-hover:opacity-100 transition">
                      Create →
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}