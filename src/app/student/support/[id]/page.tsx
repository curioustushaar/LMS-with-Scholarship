'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiSend, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'

interface Message {
  id: string
  message: string
  is_admin: boolean
  created_at: string
  user?: {
    full_name: string
    role: string
  }
}

interface Ticket {
  id: string
  subject: string
  description: string
  category: string
  status: string
  priority: string
  created_at: string
  updated_at: string
}

export default function StudentTicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (id) {
      loadTicketData()
    }
  }, [id])

  const loadTicketData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/student/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const result = await response.json()
      if (result.success) {
        setTicket(result.data.ticket)
        setMessages(result.data.messages || [])
      } else {
        setError(result.error || 'Failed to load ticket')
      }
    } catch (err) {
      console.error('Error loading ticket:', err)
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    try {
      setSending(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/student/tickets/${id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: newMessage })
      })

      const result = await response.json()
      if (result.success) {
        setNewMessage('')
        loadTicketData() // Refresh to show new message
      } else {
        alert(result.error || 'Failed to send message')
      }
    } catch (err) {
      alert('Error sending message')
    } finally {
      setSending(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200'
      case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">{error || 'Ticket not found'}</h2>
            <Link href="/student/support" className="text-blue-600 font-semibold hover:underline flex items-center justify-center space-x-2">
              <FiArrowLeft />
              <span>Back to Support Tickets</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <Link 
          href="/student/support" 
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 font-medium transition-colors"
        >
          <FiArrowLeft />
          <span>Back to My Tickets</span>
        </Link>

        {/* Ticket Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-2 mb-3">
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(ticket.status)}`}>
              {ticket.status.toUpperCase().replace('_', ' ')}
            </span>
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority.toUpperCase()}
            </span>
            <span className="px-3 py-1 text-xs font-bold rounded-full border bg-purple-100 text-purple-700 border-purple-200">
              {ticket.category.toUpperCase()}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">{ticket.subject}</h1>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <FiClock size={16} />
              <span>Created: {new Date(ticket.created_at).toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              {ticket.status === 'resolved' ? (
                <>
                  <FiCheckCircle size={16} className="text-green-600" />
                  <span className="text-green-600">Resolved</span>
                </>
              ) : (
                <>
                  <FiAlertCircle size={16} className="text-orange-600" />
                  <span className="text-orange-600">Active</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Conversation */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
            <h2 className="text-xl font-bold">Conversation</h2>
            <p className="text-sm opacity-90">Chat with support team</p>
          </div>

          {/* Messages */}
          <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-2xl ${msg.is_admin ? 'order-2' : 'order-1'}`}>
                    <div className={`rounded-xl p-4 ${
                      msg.is_admin
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                        : 'bg-blue-50 text-gray-800 border border-blue-100'
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          msg.is_admin ? 'bg-white/20' : 'bg-blue-200'
                        }`}>
                          {msg.user?.full_name ? msg.user.full_name.charAt(0) : 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {msg.is_admin ? 'Support Team' : (msg.user?.full_name || 'You')}
                          </p>
                          <p className={`text-xs ${msg.is_admin ? 'opacity-80' : 'text-gray-500'}`}>
                            {new Date(msg.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Reply Form */}
          {ticket.status !== 'closed' && (
            <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex items-end space-x-4">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={3}
                    disabled={sending || ticket.status === 'closed'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100"
                    placeholder={ticket.status === 'closed' ? 'Ticket is closed' : 'Type your message here...'}
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim() || ticket.status === 'closed'}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center space-x-2 disabled:opacity-50"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FiSend />
                  )}
                  <span>{sending ? 'Sending...' : 'Send'}</span>
                </button>
              </div>
            </form>
          )}

          {ticket.status === 'closed' && (
            <div className="border-t border-gray-200 p-6 bg-gray-50 text-center">
              <p className="text-gray-600 font-medium">This ticket has been closed.</p>
              <p className="text-sm text-gray-500 mt-1">Create a new ticket if you need further assistance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
