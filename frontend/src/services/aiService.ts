import { api } from './api';

export const aiService = {
  getSuggestions: async (context: string): Promise<string[]> => {
    const response = await api.post('/api/ai/suggestions', { context });
    return response.data.suggestions;
  },

  enhanceDescription: async (title: string, description: string): Promise<string> => {
    const response = await api.post('/api/ai/enhance', { title, description });
    return response.data.enhanced_description;
  },

  getPrioritySuggestions: async () => {
    const response = await api.get('/api/ai/prioritize');
    return response.data;
  },
};