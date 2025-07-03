'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  AlertTriangle,
  Heart,
  Brain,
  Activity,
  Stethoscope
} from 'lucide-react'
import toast from 'react-hot-toast'

interface HealthQueryProps {
  onBack?: () => void
}

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

export default function HealthQuery({ onBack }: HealthQueryProps) {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      type: 'ai',
      content: `Hello! I'm your AI Health Assistant. I can help answer general health questions and provide information about symptoms, wellness tips, and when to seek medical care.

**Important:** I provide general information only and cannot replace professional medical advice. For medical emergencies, please call emergency services immediately.

What health question can I help you with today?`,
      timestamp: new Date()
    }
  ])

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!query.trim()) {
      toast.error('Please enter a health question')
      return
    }

    if (query.length > 1000) {
      toast.error('Query too long. Please limit to 1000 characters.')
      return
    }

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: query.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setQuery('')

    try {
      const response = await fetch('/api/health-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get health information')
      }

      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
      
    } catch (error) {
      console.error('Health query error:', error)
      
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'ai',
        content: `I apologize, but I'm having trouble processing your question right now. Here's some general guidance:

For immediate medical concerns, please contact:
- Emergency services (911) for emergencies
- Your healthcare provider for urgent concerns
- A telehealth service for general questions

Please try again later or consult with a healthcare professional for personalized medical advice.`,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
      toast.error('Failed to get health information. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const quickQuestions = [
    "What are the symptoms of dehydration?",
    "How can I improve my sleep quality?",
    "What should I do for a mild headache?",
    "When should I see a doctor for a fever?",
    "How can I boost my immune system?",
    "What are signs of stress I should watch for?"
  ]

  const handleQuickQuestion = (question: string) => {
    setQuery(question)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-full">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            AI Health Assistant
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get instant answers to your health questions. Our AI provides general health information 
            and guidance on when to seek professional medical care.
          </p>
        </motion.div>

        {/* Quick Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
            Quick Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-6xl mx-auto">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="p-3 text-left bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-sm"
              >
                <MessageCircle className="h-4 w-4 text-blue-500 mb-2" />
                {question}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {/* Messages Container */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-4">
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-start space-x-3 max-w-3xl ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user'
                          ? 'bg-blue-500'
                          : 'bg-gradient-to-r from-green-400 to-blue-500'
                      }`}
                    >
                      {message.type === 'user' ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`px-4 py-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      <div
                        className={`text-xs mt-2 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3 max-w-3xl">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="px-4 py-3 rounded-lg bg-gray-100">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        <span className="text-sm text-gray-600">Analyzing your question...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmitQuery} className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask me about symptoms, health concerns, wellness tips, or when to seek medical care..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  maxLength={1000}
                  disabled={isLoading}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    {query.length}/1000 characters
                  </span>
                  <div className="flex items-center space-x-2 text-xs text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    <span>For emergencies, call 911 immediately</span>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                <span>{isLoading ? 'Analyzing...' : 'Ask'}</span>
              </button>
            </div>
          </form>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg"
          >
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Important Medical Disclaimer</p>
                <p>
                  This AI assistant provides general health information for educational purposes only. 
                  It cannot diagnose conditions, prescribe treatments, or replace professional medical advice. 
                  Always consult qualified healthcare professionals for medical concerns, and seek immediate 
                  emergency care for serious symptoms.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}