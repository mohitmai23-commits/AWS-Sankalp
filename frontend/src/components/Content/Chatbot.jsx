import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Bot, User, Loader2, Sparkles, Lightbulb, HelpCircle, BookOpen, ChevronRight } from 'lucide-react';
import api from '../../utils/api';

export default function Chatbot({ subtopic, onClose }) {
  // Conversation stage for Socratic teaching: new → probing → hint1 → hint2 → hint3 → explaining
  const [conversationStage, setConversationStage] = useState('new');
  const [conversationHistory, setConversationHistory] = useState([]);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hi! 👋 I'm your Quantum Physics tutor using the Socratic method.\n\n💡 Instead of giving you direct answers, I'll guide you with questions and hints to help you discover the answers yourself - this leads to deeper understanding!\n\nAsk me anything about Infinite Potential Wells, Finite Potential Wells, or Quantum Tunnelling.",
      timestamp: new Date(),
      stage: 'welcome'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (overrideMessage = null) => {
    const question = overrideMessage || inputValue.trim();
    if (!question || isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: question,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Build conversation history for the backend
    const newHistory = [...conversationHistory, { role: 'user', content: question }];

    try {
      const response = await api.askChatbot({
        question: question,
        subtopic: subtopic,
        stage: conversationStage,
        conversation_history: newHistory
      });

      const data = response.data;
      
      // Update conversation stage from backend response
      const newStage = data.stage || conversationStage;
      setConversationStage(newStage);
      
      // Update conversation history
      setConversationHistory([
        ...newHistory,
        { role: 'assistant', content: data.answer }
      ]);

      // Add bot response with stage indicator
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: data.answer,
        sources: data.sources,
        timestamp: new Date(),
        stage: newStage,
        stageLabel: getStageLabel(newStage)
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        isError: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStageLabel = (stage) => {
    const labels = {
      'new': null,
      'probing': '🤔 Thinking Question',
      'hint1': '💡 First Hint',
      'hint2': '💡 Second Hint', 
      'hint3': '💡 Third Hint',
      'explaining': '📚 Full Explanation'
    };
    return labels[stage] || null;
  };

  const getStageColor = (stage) => {
    const colors = {
      'probing': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'hint1': 'bg-blue-100 text-blue-800 border-blue-300',
      'hint2': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      'hint3': 'bg-purple-100 text-purple-800 border-purple-300',
      'explaining': 'bg-green-100 text-green-800 border-green-300'
    };
    return colors[stage] || '';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action) => {
    const actionMessages = {
      'hint': "I'm stuck, can you give me a hint?",
      'explain': "I give up, please explain the full answer",
      'new': "I have a new question"
    };
    
    if (action === 'new') {
      // Reset for new question
      setConversationStage('new');
      setConversationHistory([]);
    }
    
    handleSendMessage(actionMessages[action]);
  };

  const startNewQuestion = () => {
    setConversationStage('new');
    setConversationHistory([]);
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'bot',
      text: "Great! What else would you like to understand?",
      timestamp: new Date(),
      stage: 'new'
    }]);
  };

  const suggestedQuestions = [
    "What is the Schrödinger equation?",
    "Explain quantum tunnelling",
    "Why can't energy be zero?",
    "What are wave functions?"
  ];

  // Show quick action buttons based on current stage
  const showQuickActions = conversationStage !== 'new' && conversationStage !== 'explaining';
  const showNewQuestionButton = conversationStage === 'explaining';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[650px] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Socratic Physics Tutor</h3>
              <p className="text-purple-200 text-sm">Learning through guided discovery</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Stage Indicator */}
        {conversationStage !== 'new' && (
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Current stage:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStageColor(conversationStage)}`}>
                {getStageLabel(conversationStage) || conversationStage}
              </span>
              <div className="flex-1" />
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span className={conversationStage === 'probing' ? 'text-yellow-600 font-bold' : ''}>Probe</span>
                <ChevronRight className="w-3 h-3" />
                <span className={['hint1', 'hint2', 'hint3'].includes(conversationStage) ? 'text-blue-600 font-bold' : ''}>Hints</span>
                <ChevronRight className="w-3 h-3" />
                <span className={conversationStage === 'explaining' ? 'text-green-600 font-bold' : ''}>Explain</span>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-500' 
                    : message.isError 
                      ? 'bg-red-500' 
                      : 'bg-purple-500'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Message bubble */}
                <div className={`rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : message.isError
                      ? 'bg-red-100 text-red-800 rounded-bl-md'
                      : 'bg-white text-gray-800 shadow-md rounded-bl-md'
                }`}>
                  {/* Stage label for bot messages */}
                  {message.type === 'bot' && message.stageLabel && (
                    <div className={`text-xs mb-2 px-2 py-1 rounded-full inline-block border ${getStageColor(message.stage)}`}>
                      {message.stageLabel}
                    </div>
                  )}
                  
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
                  
                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">📚 Referenced from:</p>
                      <div className="flex flex-wrap gap-1">
                        {message.sources.map((source, idx) => (
                          <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-md">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Buttons */}
        {showQuickActions && !isLoading && (
          <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 border-t border-purple-100">
            <p className="text-xs text-purple-600 mb-2 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> Need help?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleQuickAction('hint')}
                className="flex items-center gap-1 text-xs bg-white border border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full transition-colors"
              >
                <Lightbulb className="w-3 h-3" /> Give me a hint
              </button>
              <button
                onClick={() => handleQuickAction('explain')}
                className="flex items-center gap-1 text-xs bg-white border border-green-200 hover:border-green-400 hover:bg-green-50 text-green-700 px-3 py-1.5 rounded-full transition-colors"
              >
                <BookOpen className="w-3 h-3" /> Just explain it
              </button>
            </div>
          </div>
        )}

        {/* New Question Button after explanation */}
        {showNewQuestionButton && !isLoading && (
          <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-100">
            <button
              onClick={startNewQuestion}
              className="w-full flex items-center justify-center gap-2 text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Ask another question
            </button>
          </div>
        )}

        {/* Suggested Questions (show only if few messages) */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Try asking:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputValue(q)}
                  className="text-xs bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-600 px-3 py-1.5 rounded-full transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={conversationStage === 'probing' ? "Try to answer the question..." : "Type your question..."}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gray-100 rounded-xl border-2 border-transparent focus:border-purple-500 focus:bg-white focus:outline-none transition-all disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-xl transition-colors flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            🎓 Socratic Method: I'll guide you with questions → hints → full explanation
          </p>
        </div>
      </motion.div>
    </div>
  );
}
