import { HelpCircle, MessageCircle, Book, Mail } from 'lucide-react';

export default function Help() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
          <p className="text-gray-600 mt-1">Get support and learn more</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <MessageCircle className="w-12 h-12 text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">AI Chat Support</h3>
          <p className="text-sm text-gray-600 mb-4">
            Chat with our AI assistant for instant help
          </p>
          <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">
            Open Chat
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <Book className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
          <p className="text-sm text-gray-600 mb-4">
            Browse our comprehensive guides
          </p>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
            Read Docs
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <Mail className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
          <p className="text-sm text-gray-600 mb-4">
            Contact our team directly
          </p>
          <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
            Send Email
          </button>
        </div>
      </div>

      <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Frequently Asked Questions
        </h3>
        <div className="space-y-3">
          <details className="bg-white rounded-lg p-4">
            <summary className="font-medium text-gray-900 cursor-pointer">
              How do I use AI features?
            </summary>
            <p className="text-sm text-gray-600 mt-2">
              Navigate to the AI Assistant page to access all AI-powered features
              including task suggestions, analytics, and more.
            </p>
          </details>
          <details className="bg-white rounded-lg p-4">
            <summary className="font-medium text-gray-900 cursor-pointer">
              How do email notifications work?
            </summary>
            <p className="text-sm text-gray-600 mt-2">
              Email reminders are sent automatically based on task due dates.
              You'll receive notifications 1 hour before, at due time, and when overdue.
            </p>
          </details>
          <details className="bg-white rounded-lg p-4">
            <summary className="font-medium text-gray-900 cursor-pointer">
              Can I use voice commands?
            </summary>
            <p className="text-sm text-gray-600 mt-2">
              Yes! Use the Voice Task Creator on the Tasks page to create tasks
              using natural speech.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}