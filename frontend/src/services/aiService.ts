/**
 * AI Service
 * Handles all AI-related API operations
 */

import { api } from './api';
import { createLogger } from '../utils/logger';
import { API_ENDPOINTS } from '../constants';
import type {
  AIParseResult,
  AIAutomation,
  AISuggestion,
} from '../types';

const logger = createLogger('AIService');

interface VoiceParseResponse {
  parsed_command: AIParseResult;
  confidence: number;
  raw_text: string;
}

interface NLPParseResponse {
  parsed_task: {
    title: string;
    description?: string;
    priority?: string;
    status?: string;
    category?: string;
    tags?: string[];
    due_date?: string;
  };
  confidence: number;
}

interface ChatResponse {
  response: string;
  suggestions?: string[];
}

interface ReportResponse {
  report: string;
  generated_at: string;
}

interface DocumentResponse {
  document: string;
  format: string;
  generated_at: string;
}

class AIService {
  /**
   * Get AI suggestions based on context
   */
  async getSuggestions(context: string): Promise<AISuggestion[]> {
    logger.info('Getting AI suggestions');
    
    try {
      const response = await api.post<{ suggestions: AISuggestion[] }>(
        API_ENDPOINTS.AI.SUGGESTIONS,
        { context }
      );
      
      logger.info('AI suggestions received', { count: response.data.suggestions.length });
      return response.data.suggestions;
    } catch (error) {
      logger.error('Failed to get AI suggestions', error as Error);
      throw error;
    }
  }

  /**
   * Enhance task description with AI
   */
  async enhanceDescription(title: string, description: string): Promise<string> {
    logger.info('Enhancing description with AI');
    
    try {
      const response = await api.post<{ enhanced_description: string }>(
        API_ENDPOINTS.AI.ENHANCE,
        { title, description }
      );
      
      logger.info('Description enhanced successfully');
      return response.data.enhanced_description;
    } catch (error) {
      logger.error('Failed to enhance description', error as Error);
      throw error;
    }
  }

  /**
   * Get priority suggestions
   */
  async getPrioritySuggestions(): Promise<{
    suggestions: Array<{ task_id: string; suggested_priority: string; reason: string }>;
  }> {
    logger.info('Getting priority suggestions');
    
    try {
      const response = await api.get<{
        suggestions: Array<{ task_id: string; suggested_priority: string; reason: string }>;
      }>(API_ENDPOINTS.AI.PRIORITIZE);
      
      logger.info('Priority suggestions received');
      return response.data;
    } catch (error) {
      logger.error('Failed to get priority suggestions', error as Error);
      throw error;
    }
  }

  /**
   * Parse voice command
   */
  async parseVoiceCommand(voiceText: string): Promise<VoiceParseResponse> {
    logger.info('Parsing voice command', { textLength: voiceText.length });
    
    try {
      const response = await api.post<VoiceParseResponse>(
        API_ENDPOINTS.AI.VOICE_PARSE,
        { voice_text: voiceText }
      );
      
      logger.info('Voice command parsed', { action: response.data.parsed_command.action });
      return response.data;
    } catch (error) {
      logger.error('Failed to parse voice command', error as Error);
      throw error;
    }
  }

  /**
   * Parse natural language task input
   */
  async parseNaturalLanguage(userInput: string): Promise<NLPParseResponse> {
    logger.info('Parsing natural language input');
    
    try {
      const response = await api.post<NLPParseResponse>(
        API_ENDPOINTS.AI.NLP_PARSE,
        { user_input: userInput }
      );
      
      logger.info('Natural language parsed', { title: response.data.parsed_task.title });
      return response.data;
    } catch (error) {
      logger.error('Failed to parse natural language', error as Error);
      throw error;
    }
  }

  /**
   * Send message to help chat
   */
  async sendHelpMessage(message: string, conversationId?: string): Promise<ChatResponse> {
    logger.info('Sending help message');
    
    try {
      const response = await api.post<ChatResponse>(API_ENDPOINTS.AI.HELP_CHAT, {
        message,
        conversation_id: conversationId,
      });
      
      logger.info('Help response received');
      return response.data;
    } catch (error) {
      logger.error('Failed to send help message', error as Error);
      throw error;
    }
  }

  /**
   * Send message to coach chat
   */
  async sendCoachMessage(message: string, conversationId?: string): Promise<ChatResponse> {
    logger.info('Sending coach message');
    
    try {
      const response = await api.post<ChatResponse>(API_ENDPOINTS.AI.COACH_CHAT, {
        message,
        conversation_id: conversationId,
      });
      
      logger.info('Coach response received');
      return response.data;
    } catch (error) {
      logger.error('Failed to send coach message', error as Error);
      throw error;
    }
  }

  /**
   * Generate productivity report
   */
  async generateReport(
    reportType: string = 'productivity',
    dateRange: string = 'all_time'
  ): Promise<ReportResponse> {
    logger.info('Generating report', { reportType, dateRange });
    
    try {
      const response = await api.post<ReportResponse>(API_ENDPOINTS.AI.REPORTS, {
        report_type: reportType,
        date_range: dateRange,
      });
      
      logger.info('Report generated successfully');
      return response.data;
    } catch (error) {
      logger.error('Failed to generate report', error as Error);
      throw error;
    }
  }

  /**
   * Analyze automation opportunities
   */
  async analyzeAutomations(): Promise<{ automations: AIAutomation[] }> {
    logger.info('Analyzing automation opportunities');
    
    try {
      const response = await api.get<{ automations: AIAutomation[] }>(
        API_ENDPOINTS.AI.AUTOMATIONS
      );
      
      logger.info('Automations analyzed', { count: response.data.automations.length });
      return response.data;
    } catch (error) {
      logger.error('Failed to analyze automations', error as Error);
      throw error;
    }
  }

  /**
   * Generate document
   */
  async generateDocument(
    docType: string = 'achievement_report',
    customPrompt?: string
  ): Promise<DocumentResponse> {
    logger.info('Generating document', { docType });
    
    try {
      const response = await api.post<DocumentResponse>(API_ENDPOINTS.AI.DOCUMENTS, {
        doc_type: docType,
        custom_prompt: customPrompt || '',
      });
      
      logger.info('Document generated successfully');
      return response.data;
    } catch (error) {
      logger.error('Failed to generate document', error as Error);
      throw error;
    }
  }
}

// Export singleton instance
export const aiService = new AIService();