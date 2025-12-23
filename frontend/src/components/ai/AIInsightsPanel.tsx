import { useState } from 'react';
import { BarChart3, FileText, Zap, Loader2, TrendingUp } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export default function AIInsightsPanel() {
  const [activeTab, setActiveTab] = useState<'report' | 'automations' | null>(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string>('');
  const [automations, setAutomations] = useState<any[]>([]);

  const generateReport = async () => {
    setLoading(true);
    setActiveTab('report');
    try {
      const response = await api.post('/api/ai/reports/generate', {
        report_type: 'productivity',
        date_range: 'all_time'
      });

      setContent(response.data.report);
      toast.success('Report generated!');
    } catch (error) {
      console.error('Report error:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const analyzeAutomations = async () => {
    setLoading(true);
    setActiveTab('automations');
    try {
      const response = await api.get('/api/ai/automations/analyze');

      setAutomations(response.data.automations);
      toast.success(`Found ${response.data.automations.length} automation opportunities!`);
    } catch (error) {
      console.error('Automation error:', error);
      toast.error('Failed to analyze automations');
    } finally {
      setLoading(false);
    }
  };

  const generateDocument = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/ai/documents/generate', {
        doc_type: 'achievement_report',
        custom_prompt: ''
      });

      // Create downloadable file
      const blob = new Blob([response.data.document], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'achievement_report.md';
      a.click();

      toast.success('Document downloaded!');
    } catch (error) {
      console.error('Document error:', error);
      toast.error('Failed to generate document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">AI Insights & Tools</h3>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={generateReport}
          disabled={loading}
          className="flex flex-col items-center gap-3 p-6 border-2 border-blue-200 hover:border-blue-400 rounded-xl transition bg-blue-50 hover:bg-blue-100 disabled:opacity-50"
        >
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <div className="text-center">
            <div className="font-semibold text-gray-900">Productivity Report</div>
            <div className="text-xs text-gray-600 mt-1">Analyze your patterns</div>
          </div>
        </button>

        <button
          onClick={analyzeAutomations}
          disabled={loading}
          className="flex flex-col items-center gap-3 p-6 border-2 border-purple-200 hover:border-purple-400 rounded-xl transition bg-purple-50 hover:bg-purple-100 disabled:opacity-50"
        >
          <Zap className="w-8 h-8 text-purple-600" />
          <div className="text-center">
            <div className="font-semibold text-gray-900">Smart Automations</div>
            <div className="text-xs text-gray-600 mt-1">Find opportunities</div>
          </div>
        </button>

        <button
          onClick={generateDocument}
          disabled={loading}
          className="flex flex-col items-center gap-3 p-6 border-2 border-green-200 hover:border-green-400 rounded-xl transition bg-green-50 hover:bg-green-100 disabled:opacity-50"
        >
          <FileText className="w-8 h-8 text-green-600" />
          <div className="text-center">
            <div className="font-semibold text-gray-900">Generate Document</div>
            <div className="text-xs text-gray-600 mt-1">Export achievements</div>
          </div>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">AI is working...</span>
        </div>
      )}

      {/* Report Content */}
      {activeTab === 'report' && content && !loading && (
        <div className="bg-gray-50 rounded-lg p-6 prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-gray-800">{content}</div>
        </div>
      )}

      {/* Automations List */}
      {activeTab === 'automations' && automations.length > 0 && !loading && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 mb-3">
            💡 {automations.length} Automation Opportunities Found
          </h4>
          {automations.map((auto, index) => (
            <div
              key={index}
              className="bg-purple-50 border border-purple-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{auto.description}</div>
                  <div className="text-sm text-gray-600 mt-1">{auto.suggestion}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      auto.confidence === 'high' ? 'bg-green-100 text-green-700' :
                      auto.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {auto.confidence} confidence
                    </span>
                    <span className="text-xs text-gray-500">
                      {auto.tasks_affected.length} tasks affected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}