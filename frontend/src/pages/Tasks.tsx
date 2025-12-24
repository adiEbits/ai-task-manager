import { type JSX } from 'react';
import TaskList from '../components/tasks/TaskList';
import VoiceTaskCreator from '../components/ai/VoiceTaskCreator';
import NaturalLanguageTaskCreator from '../components/ai/NaturalLanguageTaskCreator';
import AIInsightsPanel from '../components/ai/AIInsightsPanel';

export default function Tasks(): JSX.Element {
  return (
    <div className="p-6">
      {/* AI-Powered Task Creation */}
      <div className="space-y-6 mb-6">
        <VoiceTaskCreator />
        <NaturalLanguageTaskCreator />
      </div>

      {/* AI Insights */}
      <AIInsightsPanel />

      {/* Task List */}
      <TaskList />
    </div>
  );
}