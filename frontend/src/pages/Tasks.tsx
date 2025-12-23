import TaskList from '../components/tasks/TaskList';
import VoiceTaskCreator from '../components/ai/VoiceTaskCreator';
import NaturalLanguageTaskCreator from '../components/ai/NaturalLanguageTaskCreator';
import AISuggestions from '../components/ai/AIInsightsPanel';
import AIInsightsPanel from '../components/ai/AIInsightsPanel';

export default function Tasks() {
  return (
    <div className="p-6">
      {/* AI-Powered Task Creation */}
      <div className="space-y-6 mb-6">
        <VoiceTaskCreator />
        <NaturalLanguageTaskCreator />
        <AISuggestions />
      </div>

      {/* AI Insights */}
      <AIInsightsPanel />

      {/* Task List */}
      <TaskList />
    </div>
  );
}