import { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  FileText, 
  Calendar, 
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';
// import { api } from '../services/api';
import { useTaskStore } from '../stores/taskStore';
import toast from 'react-hot-toast';

interface Feature {
  id: string;
  icon: typeof Brain;
  title: string;
  description: string;
  color: string;
}

interface InsightData {
  overall_health_score: number;
  insights: Array<{
    title: string;
    description: string;
    priority: string;
  }>;
  recommendations: string[];
}

interface PredictionData {
  workload_forecast: {
    current_capacity: number;
    projected_capacity_next_week: number;
    overload_risk: string;
  };
  predictions: Array<{
    task_title: string;
    estimated_hours: number;
    bottleneck_risk: string;
  }>;
}

interface MeetingData {
  suggested_slots: Array<{
    date: string;
    start_time: string;
    end_time: string;
    reason: string;
  }>;
}

type ResultData = InsightData | PredictionData | MeetingData;

interface Result {
  type: string;
  data: ResultData;
}

export default function AIAssistant() {
  const tasks = useTaskStore((state) => state.tasks);
  const [loading, setLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const features: Feature[] = [
    {
      id: 'insights',
      icon: Brain,
      title: 'Smart Insights',
      description: 'Get AI-powered productivity insights',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'dependencies',
      icon: Target,
      title: 'Task Dependencies',
      description: 'Analyze task relationships and critical path',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'predictions',
      icon: TrendingUp,
      title: 'Predictive Analytics',
      description: 'Forecast completion times and bottlenecks',
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'bulk',
      icon: Zap,
      title: 'Bulk Operations',
      description: 'Smart suggestions for organizing tasks',
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'meetings',
      icon: Calendar,
      title: 'Meeting Scheduler',
      description: 'AI-optimized meeting time suggestions',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      id: 'documents',
      icon: FileText,
      title: 'Generate Documents',
      description: 'Create reports and summaries',
      color: 'from-teal-500 to-green-500',
    },
  ];

  const runFeature = async (featureId: string): Promise<void> => {
    setActiveFeature(featureId);
    setLoading(true);
    setResult(null);

    try {
      switch (featureId) {
        case 'insights':
          toast('Analyzing your productivity patterns...', { icon: '🔍' });
          setTimeout(() => {
            setResult({
              type: 'insights',
              data: {
                overall_health_score: 78,
                insights: [
                  {
                    title: 'Peak Productivity Hours',
                    description: 'You complete most tasks between 9 AM - 11 AM',
                    priority: 'high',
                  },
                  {
                    title: 'Task Accumulation',
                    description: 'You have 5 overdue tasks that need attention',
                    priority: 'urgent',
                  },
                ],
                recommendations: [
                  'Schedule complex tasks during peak hours',
                  'Address overdue tasks first thing tomorrow',
                ],
              },
            });
            setLoading(false);
          }, 1500);
          break;

        case 'predictions':
          toast('Running predictive analysis...', { icon: '📊' });
          setTimeout(() => {
            setResult({
              type: 'predictions',
              data: {
                workload_forecast: {
                  current_capacity: 75,
                  projected_capacity_next_week: 85,
                  overload_risk: 'medium',
                },
                predictions: tasks.slice(0, 5).map((task) => ({
                  task_title: task.title,
                  estimated_hours: Math.random() * 8 + 1,
                  bottleneck_risk: ['low', 'medium', 'high'][
                    Math.floor(Math.random() * 3)
                  ],
                })),
              },
            });
            setLoading(false);
          }, 1500);
          break;

        case 'meetings':
          toast('Finding optimal meeting times...', { icon: '📅' });
          setTimeout(() => {
            setResult({
              type: 'meetings',
              data: {
                suggested_slots: [
                  {
                    date: '2025-12-24',
                    start_time: '10:00',
                    end_time: '11:00',
                    reason: 'Peak productivity time, no conflicts',
                  },
                  {
                    date: '2025-12-24',
                    start_time: '14:00',
                    end_time: '15:00',
                    reason: 'Post-lunch availability',
                  },
                ],
              },
            });
            setLoading(false);
          }, 1500);
          break;

        default:
          toast.error('Feature coming soon!');
          setLoading(false);
      }
    } catch (error) {
      console.error('AI feature error:', error);
      toast.error('Failed to run AI feature');
      setLoading(false);
    }
  };

  const isInsightData = (data: ResultData): data is InsightData => {
    return 'overall_health_score' in data;
  };

  const isPredictionData = (data: ResultData): data is PredictionData => {
    return 'workload_forecast' in data;
  };

  const isMeetingData = (data: ResultData): data is MeetingData => {
    return 'suggested_slots' in data;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
            <p className="text-gray-600 mt-1">
              Powered by advanced AI to boost your productivity
            </p>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => runFeature(feature.id)}
            disabled={loading}
            className={`group relative overflow-hidden bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-transparent hover:shadow-xl transition-all duration-300 p-6 text-left disabled:opacity-50 ${
              activeFeature === feature.id ? 'ring-4 ring-purple-200' : ''
            }`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
            />

            <div className="relative z-10">
              <div
                className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600">{feature.description}</p>

              <div className="mt-4 flex items-center gap-2 text-purple-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Run Analysis</span>
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Results Panel */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            AI Analysis Results
          </h2>

          {result.type === 'insights' && isInsightData(result.data) && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-1">
                    {result.data.overall_health_score}%
                  </div>
                  <div className="text-gray-600 text-sm">
                    Overall Productivity Health
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Key Insights</h3>
                {result.data.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500"
                  >
                    <div className="font-medium text-gray-900">
                      {insight.title}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {insight.description}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Recommendations</h3>
                {result.data.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="text-green-600">✓</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.type === 'predictions' && isPredictionData(result.data) && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {result.data.workload_forecast.current_capacity}%
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Current Capacity
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {result.data.workload_forecast.projected_capacity_next_week}%
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Next Week Projection
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600 uppercase">
                    {result.data.workload_forecast.overload_risk}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Overload Risk</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Task Predictions
                </h3>
                {result.data.predictions.map((pred, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-3 mb-2 flex justify-between items-center"
                  >
                    <span className="text-sm text-gray-700">
                      {pred.task_title}
                    </span>
                    <div className="flex gap-3 text-xs">
                      <span className="text-blue-600">
                        {pred.estimated_hours.toFixed(1)}h
                      </span>
                      <span
                        className={`px-2 py-1 rounded ${
                          pred.bottleneck_risk === 'high'
                            ? 'bg-red-100 text-red-700'
                            : pred.bottleneck_risk === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {pred.bottleneck_risk} risk
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.type === 'meetings' && isMeetingData(result.data) && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">
                Suggested Meeting Times
              </h3>
              {result.data.suggested_slots.map((slot, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">
                        {slot.date} • {slot.start_time} - {slot.end_time}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {slot.reason}
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition">
                      Schedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <div>
              <div className="text-lg font-semibold text-gray-900">
                AI is analyzing...
              </div>
              <div className="text-sm text-gray-600 mt-1">
                This may take a few moments
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}