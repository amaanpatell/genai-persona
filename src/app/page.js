'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Input } from './components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar'
import { ArrowLeft, Send, User, Coffee, Code2, Sparkles } from 'lucide-react'


const personas = [
  {
    id: 'hitesh',
    name: 'Hitesh Choudhary',
    title: 'Chai aur Code Founder',
    description: 'Passionate about teaching programming with chai analogies. 15+ years experience, 1.6M+ students taught!',
    avatar: 'https://pbs.twimg.com/profile_images/1724344976715468800/MasktpKz_400x400.jpg',
    skills: ['JavaScript', 'Python', 'Web Development', 'Teaching', 'Chai ☕'],
    greeting: 'Hanjii! Namaste! Hitesh Choudhary hu, apka apna chai-loving tech educator! Chai pe charcha karte hain coding ki? ☕😊',
    color: 'from-orange-500 to-amber-500',
    icon: <Coffee className="w-5 h-5" />
  },
  {
    id: 'piyush',
    name: 'Piyush Garg',
    title: 'Full-Stack Developer & Educator',
    description: 'Reality-first teaching approach. 5+ years industry experience, focusing on bridging theory and practical implementation.',
    avatar: 'https://pbs.twimg.com/profile_images/1879075502356586496/V9wQzW7V_400x400.jpg',
    skills: ['Docker', 'React', 'Node.js', 'System Design', 'Reality Checks'],
    greeting: 'Hey everyone! Piyush Garg here. Ready for some reality checks? Let\'s bridge the gap between theory and real-world implementation! 💻',
    color: 'from-blue-500 to-cyan-500',
    icon: <Code2 className="w-5 h-5" />
  }
]

export default function EnhancedPersonaChatBot() {
  const [selectedPersona, setSelectedPersona] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // This effect saves the messages to session storage whenever the messages state changes.
  // It uses a unique key for each persona to maintain separate chat histories.
  useEffect(() => {
    if (selectedPersona) {
      sessionStorage.setItem(`chat-history-${selectedPersona.id}`, JSON.stringify(messages))
    }
  }, [messages, selectedPersona])

  const handlePersonaSelect = (persona) => {
    // Check if there's an existing chat for this persona in session storage.
    const storedChat = sessionStorage.getItem(`chat-history-${persona.id}`)
    if (storedChat) {
      // If a chat exists, load it from storage.
      setMessages(JSON.parse(storedChat))
    } else {
      // If no chat exists, start a new one with the persona's greeting.
      const initialMessage = {
        id: 'greeting',
        content: persona.greeting,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages([initialMessage])
    }
    setSelectedPersona(persona)
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedPersona || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputMessage
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: currentInput,
          persona: selectedPersona.name
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      const botMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again! 😅',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const goBack = () => {
    setSelectedPersona(null)
    setMessages([])
  }

  if (selectedPersona) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Animated Header */}
        <div className={`p-2 bg-gradient-to-r ${selectedPersona.color} shadow-lg`}>
          <div className="flex items-center gap-4 max-w-4xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="w-10 h-10 ring-2 ring-white/30">
                  <AvatarImage src={selectedPersona.avatar} alt={selectedPersona.name} />
                  <AvatarFallback className="bg-white/20 text-white text-sm backdrop-blur-sm">
                    {selectedPersona.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1">
                  {selectedPersona.icon}
                </div>
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">{selectedPersona.name}</h2>
                <p className="text-xs text-white/80">{selectedPersona.title}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-950/50 to-slate-900">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 mb-4 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage
                    src={message.sender === 'bot' ? selectedPersona.avatar : '/api/placeholder/32/32'}
                    alt={message.sender === 'bot' ? selectedPersona.name : 'User'}
                  />
                  <AvatarFallback className={`text-white text-sm ${message.sender === 'bot' ? 'bg-gradient-to-br ' + selectedPersona.color : 'bg-gray-600'}`}>
                    {message.sender === 'bot'
                      ? selectedPersona.name.split(' ').map(n => n[0]).join('')
                      : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 max-w-2xl">
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-lg ${
                      message.sender === 'user'
                        ? `bg-gradient-to-r ${selectedPersona.color} text-white rounded-br-md`
                        : 'bg-white/10 backdrop-blur-sm text-gray-100 border border-white/20 rounded-bl-md'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <div className={`flex items-center gap-2 mt-1 text-xs text-gray-400 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <span>{message.sender === 'bot' ? selectedPersona.name : 'You'}</span>
                    <span>•</span>
                    <span>{message.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 mb-4">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={selectedPersona.avatar} alt={selectedPersona.name} />
                  <AvatarFallback className={`bg-gradient-to-br ${selectedPersona.color} text-white text-sm`}>
                    {selectedPersona.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Enhanced Input */}
        <div className="p-4 bg-gray-800/80 backdrop-blur-sm border-t border-gray-700">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${selectedPersona.name}...`}
              disabled={isLoading}
              className="flex-1 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-300 focus:border-white/40 focus:ring-white/20"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="icon"
              className={`bg-gradient-to-r ${selectedPersona.color} hover:opacity-90 text-white shadow-lg transition-all duration-200`}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 shadow-xl">
        <div className="container mx-auto p-2 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="text-4xl">☕</div>
            <div>
              <h1 className="text-2xl font-bold text-white">Chai With AI Buddies</h1>
              <p className="text-orange-100 text-sm">Your favorite tech educators, now as AI!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl p-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-100 mb-4">Choose Your Coding Buddy</h2>
          <p className="text-gray-400 text-lg">Select who you'd like to learn from today</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {personas.map((persona) => (
            <Card
              key={persona.id}
              className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/30 cursor-pointer transition-all duration-500 hover:scale-105 hover:bg-white/10 group shadow-2xl overflow-hidden relative"
              onClick={() => handlePersonaSelect(persona)}
            >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="text-left pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className={`h-20 w-20 ring-4 ring-gradient-to-r ${persona.color} ring-opacity-50`}>
                        <AvatarImage src={persona.avatar} />
                        <AvatarFallback className={`bg-gradient-to-br ${persona.color} text-white text-xl font-bold`}>
                          {persona.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-2 -right-2 p-2 rounded-full bg-gradient-to-br ${persona.color} shadow-lg`}>
                        {persona.icon}
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-white text-xl group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all">
                        {persona.name}
                      </CardTitle>
                      <CardDescription className="text-gray-400 text-sm">{persona.title}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-left">
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">{persona.description}</p>
                <div className="flex flex-wrap gap-2">
                  {persona.skills.map((skill) => (
                    <span
                      key={skill}
                      className={`px-3 py-1 bg-gradient-to-r ${persona.color} bg-opacity-10 text-white text-xs rounded-full border border-white/20 backdrop-blur-sm`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-400 mb-4">
            Ready to start learning with AI-powered versions of your favorite educators?
          </p>
          <div className="text-sm text-gray-500">
            Powered by OpenAI GPT-4 • Made with ❤️ by Amaan Patel
          </div>
        </div>
      </div>
    </div>
  )
}