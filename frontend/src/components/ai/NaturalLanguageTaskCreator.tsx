import { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { taskService } from '../../services/taskService';
import { useTaskStore } from '../../stores/taskStore';
import toast from 'react-hot-toast';

export default function NaturalLanguageTaskCreator() {
  const addTask = useTaskStore((state) => state.addTask);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const createTaskFromNL = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);
    try {
      // Parse natural language
      const parseResponse = await api.post('/api/ai/nlp/parse-task', {
        user_input: input
      });

      const parsedTask = parseResponse.data.parsed_task;

      // Create the task
      const newTask = await taskService.createTask({
        title: parsedTask.title,
        description: parsedTask.description || '',
        status: parsedTask.status || 'todo',
        priority: parsedTask.priority || 'medium',
        category: parsedTask.category,
        tags: parsedTask.tags || [],
        due_date: parsedTask.due_date
      });

      addTask(newTask);
      toast.success('✨ Task created from your message!');
      setInput('');
    } catch (error) {
      console.error('NLP task creation error:', error);
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      createTaskFromNL();
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Wand2 className="w-6 h-6 text-indigo-600" />
        <h3 className="text-xl font-bold text-gray-900">Natural Language Task Creator</h3>
      </div>

      <p className="text-gray-600 text-sm mb-4">
        Just describe your task naturally, and AI will understand!
      </p>

      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={3}
          className="w-full px-4 py-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
          placeholder='Try: "Call John about the project tomorrow at 3pm" or "Buy groceries this weekend"'
          disabled={loading}
        />

        <button
          onClick={createTaskFromNL}
          disabled={loading || !input.trim()}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Create Task with AI
            </>
          )}
        </button>
      </div>

      <div className="mt-4 bg-white/50 rounded-lg p-3">
        <p className="text-xs text-gray-600 font-medium mb-2">✨ Examples:</p>
        <div className="space-y-1 text-xs text-gray-600">
          <div>• "Finish the urgent report by Friday"</div>
          <div>• "Schedule dentist appointment next week"</div>
          <div>• "Prepare presentation for Monday meeting"</div>
        </div>
      </div>
    </div>
  );
}