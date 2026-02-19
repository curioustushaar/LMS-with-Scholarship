'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiSend, FiPaperclip, FiClock, FiUser, FiCheck, FiX } from 'react-icons/fi'
import { api } from '@/lib/api'

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [ticket, setTicket] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [ticketStatus, setTicketStatus] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [mentors, setMentors] = useState<any[]>([])
  const [loadingMentors, setLoadingMentors] = useState(false)

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      const [ticketRes, messagesRes] = await Promise.all([
        api.tickets.getById(id),
        api.tickets.getMessages(id)
      ])

      if (ticketRes.success && ticketRes.data) {
        setTicket(ticketRes.data)
        setTicketStatus(ticketRes.data.status)
      } else {
        setError(ticketRes.error || 'Failed to load ticket details')
      }

      if (messagesRes.success && messagesRes.data) {
        setMessages(messagesRes.data)
      }
    } catch (err: any) {
      console.error('Error loading ticket data:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    try {
      setIsSending(true)
      const result = await api.tickets.reply(id, { message: newMessage })
      if (result.success) {
        setNewMessage('')
        // Refresh messages
        const messagesRes = await api.tickets.getMessages(id)
        if (messagesRes.success) setMessages(messagesRes.data)
      } else {
        alert(result.error || 'Failed to send message')
      }
    } catch (err: any) {
      alert('Error sending message')
    } finally {
      setIsSending(false)
    }
  }

  const updateStatus = async (status: string) => {
    try {
      const result = await api.tickets.updateStatus(id, { status })
      if (result.success) {
        setTicketStatus(status)
        // Refresh ticket data to get updated student info if needed
        const ticketRes = await api.tickets.getById(id)
        if (ticketRes.success) setTicket(ticketRes.data)
      } else {
        alert(result.error || 'Failed to update status')
      }
    } catch (err: any) {
      alert('Error updating status')
    }
  }

  const handleEscalate = async () => {
    if (!confirm('Are you sure you want to escalate this ticket to URGENT priority?')) return
    
    try {
      const result = await api.tickets.update(id, { priority: 'urgent' })
      if (result.success) {
        setTicket({ ...ticket, priority: 'urgent' })
        alert('Ticket escalated to urgent priority!')
      } else {
        alert(result.error || 'Failed to escalate ticket')
      }
    } catch (err: any) {
      alert('Error escalating ticket')
    }
  }

  const handleAssignToMentor = async () => {
    setShowAssignModal(true)
    setLoadingMentors(true)
    try {
      // Fetch admin users only
      const result = await api.users.getAll({ role: 'admin' })
      if (result.success) {
        setMentors(result.data || [])
      } else {
        alert(result.error || 'Failed to fetch mentors')
      }
    } catch (err: any) {
      alert('Error loading mentors')
    } finally {
      setLoadingMentors(false)
    }
  }

  const assignTicket = async (mentorId: string) => {
    try {
      const result = await api.tickets.update(id, { assigned_to: mentorId })
      if (result.success) {
        setTicket({ ...ticket, assigned_to: mentorId })
        setShowAssignModal(false)
        alert('Ticket assigned successfully!')
        // Refresh to get assigned user details
        loadData()
      } else {
        alert(result.error || 'Failed to assign ticket')
      }
    } catch (err: any) {
      alert('Error assigning ticket')
    }
  }

  const [showActions, setShowActions] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E]"></div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{error || 'Ticket not found'}</h2>
        <Link href="/admin/support" className="text-[#C81E4E] font-semibold hover:underline flex items-center gap-2">
          <FiArrowLeft /> Back to Support Tickets
        </Link>
      </div>
    )
  }

  // Helper for UI
  const student = ticket.user || {}
  const studentName = student.full_name || 'Unknown Student'
  const studentEmail = student.email || 'No Email'

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/support" className="inline-flex items-center space-x-2 text-gray-500 hover:text-[#C81E4E] font-medium transition-colors">
        <FiArrowLeft />
        <span>Back to Support Tickets</span>
      </Link>

      {/* Ticket Header & Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-4">

          <div className="flex-1 w-full">
            {/* Badges Row - Responsive wrap */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${ticket.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100' :
                ticket.priority === 'medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                  'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                {ticket.priority.toUpperCase()} PRIORITY
              </span>
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${ticketStatus === 'open' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                ticketStatus === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                  ticketStatus === 'resolved' ? 'bg-green-50 text-green-600 border-green-100' :
                    'bg-gray-100 text-gray-600 border-gray-200'
                }`}>
                {ticketStatus.toUpperCase().replace('_', ' ')}
              </span>
              <span className="px-3 py-1 text-xs font-bold rounded-full border bg-purple-50 text-purple-600 border-purple-100">
                {ticket.category.toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-2">
              {ticket.subject}
            </h1>
            <p className="text-gray-400 text-sm font-mono flex items-center gap-2">
              <span>ID: {ticket.id}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span>via Portal</span>
            </p>
          </div>

          {/* Action Dropdown - Top Right */}
          <div className="relative self-end md:self-start mt-2 md:mt-0">
            <button
              onClick={() => setShowActions(!showActions)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 font-medium transition-all"
            >
              <span>Actions</span>
              <FiCheck className={`transform transition-transform ${showActions ? 'rotate-180' : ''}`} />
            </button>

            {showActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <button
                    onClick={() => { updateStatus('in_progress'); setShowActions(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm font-medium text-gray-700 hover:text-blue-600 flex items-center space-x-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Mark In Progress</span>
                  </button>
                  <button
                    onClick={() => { updateStatus('resolved'); setShowActions(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-green-50 text-sm font-medium text-gray-700 hover:text-green-600 flex items-center space-x-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>Mark Resolved</span>
                  </button>
                  <div className="h-px bg-gray-100 my-1"></div>
                  <button
                    onClick={() => { updateStatus('closed'); setShowActions(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium text-red-600 flex items-center space-x-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                    <span>Close Ticket</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Meta Info Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8 pt-6 border-t border-gray-100">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Student</p>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                {studentName.charAt(0)}
              </div>
              <p className="font-semibold text-gray-900">{studentName}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Contact</p>
            <p className="font-medium text-gray-700 md:truncate" title={studentEmail}>{studentEmail}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Created</p>
            <div className="flex items-center space-x-1 text-gray-700">
              <FiClock size={14} className="text-gray-400" />
              <span className="font-medium">{new Date(ticket.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Last Update</p>
            <p className="font-medium text-gray-700">{new Date(ticket.updated_at || ticket.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white px-6 py-4">
          <h2 className="text-xl font-semibold">Conversation</h2>
        </div>

        {/* Messages */}
        <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center py-10 text-gray-500">No messages found.</div>
          )}
          {messages.map((msg: any) => (
            <div
              key={msg.id}
              className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl ${msg.is_admin ? 'order-2' : 'order-1'}`}>
                <div className={`rounded-lg p-4 ${msg.is_admin
                  ? 'bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white'
                  : 'bg-gray-100 text-gray-800'
                  }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${msg.is_admin ? 'bg-white/20' : 'bg-gray-300'
                      }`}>
                      {(msg.user?.full_name || 'U').charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{msg.user?.full_name || 'User'}</p>
                      <p className={`text-xs ${msg.is_admin ? 'opacity-80' : 'text-gray-500'}`}>
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{msg.message}</p>

                  {msg.attachment_url && (
                    <div className="mt-3 space-y-2">
                      <div className={`flex items-center space-x-2 text-sm ${msg.is_admin ? 'bg-white/20' : 'bg-white'
                        } rounded px-3 py-2`}>
                        <FiPaperclip />
                        <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          View Attachment
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-6">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={3}
                disabled={isSending}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent resize-none disabled:bg-gray-50"
                placeholder="Type your reply here..."
              />
            </div>
            <div className="flex flex-col space-y-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all flex items-center space-x-2"
              >
                <FiPaperclip />
                <span>Attach</span>
              </button>
              <button
                type="submit"
                disabled={isSending || !newMessage.trim()}
                className="px-6 py-2 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center space-x-2 disabled:opacity-50"
              >
                {isSending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <FiSend />
                )}
                <span>{isSending ? 'Sending...' : 'Send'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-4">
          <Link
            href={`/admin/students/${ticket.user_id}`}
            className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-center font-medium"
          >
            View Student Profile
          </Link>
          <button 
            onClick={handleEscalate}
            className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all font-medium"
          >
            Escalate Ticket
          </button>
          <button 
            onClick={handleAssignToMentor}
            className="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-medium"
          >
            Assign to Mentor
          </button>
        </div>
      </div>

      {/* Assign to Mentor Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Assign to Mentor</h3>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6">
              {loadingMentors ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : mentors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No mentors available</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {mentors.map((mentor) => (
                    <button
                      key={mentor.id}
                      onClick={() => assignTicket(mentor.id)}
                      className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                          {mentor.full_name?.charAt(0) || 'M'}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{mentor.full_name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{mentor.email}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
