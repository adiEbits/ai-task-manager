/**
 * Tasks Page
 * Main task management view with AI features
 * 
 * @module features/tasks/pages/Tasks
 */

import { type JSX } from 'react';
import TaskList from '@/features/tasks/components/TaskList';
import VoiceTaskCreator from '@/features/ai/components/VoiceTaskCreator';
import NaturalLanguageTaskCreator from '@/features/ai/components/NaturalLanguageTaskCreator';
import AIInsightsPanel from '@/features/ai/components/AIInsightsPanel';

export default function Tasks(): JSX.Element {
  return (
    <div className="p-4 sm:p-6">
      {/* AI-Powered Task Creation */}
      <div className="space-y-6 mb-6">
        <VoiceTaskCreator />
        <NaturalLanguageTaskCreator />
      </div>

      {/* AI Insights */}
      <AIInsightsPanel />

      {/* Task List - handles its own loading state */}
      <TaskList />
    </div>
  );
}