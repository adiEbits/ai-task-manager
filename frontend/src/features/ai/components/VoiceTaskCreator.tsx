import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { api } from '@/services/api';
import { taskService } from '@/features/tasks/services/taskService';
import { useTaskStore } from '@/stores/taskStore';
import toast from 'react-hot-toast';

// Type definitions for Speech Recognition
interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function VoiceTaskCreator() {
  const addTask = useTaskStore((state) => state.addTask);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionClass) {
      recognitionRef.current = new SpeechRecognitionClass();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcriptText = Array.from({ length: event.results.length }, (_, i) => event.results[i])
          .map((result) => result[0].transcript)
          .join('');
        
        setTranscript(transcriptText);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript) {
          processVoiceCommand(transcript);
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Voice recognition failed. Please try again.');
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [transcript]);

  const startListening = (): void => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition not supported in this browser');
      return;
    }

    setTranscript('');
    setIsListening(true);
    recognitionRef.current.start();
    toast.success('🎤 Listening... Speak now!');
  };

  const stopListening = (): void => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const processVoiceCommand = async (voiceText: string): Promise<void> => {
    setProcessing(true);
    try {
      // Parse voice command with AI
      const parseResponse = await api.post('/api/ai/voice/parse', {
        voice_text: voiceText
      });

      const parsedCommand = parseResponse.data.parsed_command;

      // Execute command based on action
      if (parsedCommand.action === 'create') {
        const newTask = await taskService.createTask({
          title: parsedCommand.parameters.title,
          description: parsedCommand.parameters.description || '',
          priority: parsedCommand.parameters.priority || 'medium',
          status: parsedCommand.parameters.status || 'todo',
          due_date: parsedCommand.parameters.due_date,
        });

        addTask(newTask);
        toast.success(`✅ Task created: "${parsedCommand.parameters.title}"`);
      } else {
        toast.success(`Command recognized: ${parsedCommand.action}`);
      }

      setTranscript('');
    } catch (error) {
      console.error('Voice command error:', error);
      toast.error('Failed to process voice command');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Mic className="w-6 h-6 text-pink-600" />
        <h3 className="text-xl font-bold text-gray-900">Voice Task Creator</h3>
      </div>

      <p className="text-gray-600 text-sm mb-4">
        Click the microphone and speak your task naturally!
      </p>

      <div className="space-y-4">
        {/* Voice Button */}
        <div className="flex justify-center">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={processing}
            className={`relative w-24 h-24 rounded-full transition-all duration-300 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600'
            } disabled:opacity-50`}
          >
            {processing ? (
              <Loader2 className="w-12 h-12 text-white animate-spin mx-auto" />
            ) : isListening ? (
              <MicOff className="w-12 h-12 text-white mx-auto" />
            ) : (
              <Mic className="w-12 h-12 text-white mx-auto" />
            )}
          </button>
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="bg-white rounded-lg p-4 border border-pink-200">
            <p className="text-sm text-gray-500 mb-1">Heard:</p>
            <p className="text-gray-800 font-medium">{transcript}</p>
          </div>
        )}

        {/* Status */}
        <div className="text-center">
          {isListening && (
            <p className="text-pink-600 font-medium animate-pulse">🎤 Listening...</p>
          )}
          {processing && (
            <p className="text-purple-600 font-medium">🤖 Processing command...</p>
          )}
        </div>

        {/* Examples */}
        <div className="bg-white/50 rounded-lg p-3">
          <p className="text-xs text-gray-600 font-medium mb-2">🎙️ Try saying:</p>
          <div className="space-y-1 text-xs text-gray-600">
            <div>• "Create a task to call John tomorrow"</div>
            <div>• "Add urgent task to fix the bug"</div>
            <div>• "Remind me to review the document"</div>
            <div>• "Schedule meeting prep for next Monday"</div>
          </div>
        </div>
      </div>
    </div>
  );
}