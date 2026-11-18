'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiSend, FiClock, FiUser, FiCheck, FiX, FiCheckCircle } from 'react-icons/fi'
import { api } from '@/lib/api'

export default function SchoolTicketDetailPage() {
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
      const res = await api.tickets.reply(id, {
        message: newMessage.trim(),
        sender_type: 'admin'
      })

      if (res.success) {
        setNewMessage('')
        const updated = await api.tickets.getMessages(id)
        if (updated.success && updated.data) {
          setMessages(updated.data)
        }
      } else {
        alert(res.error || 'Failed to send reply')
      }
    } catch (err: any) {
      alert('Error sending message: ' + err.message)
    } finally {
      setIsSending(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await api.tickets.updateStatus(id, { status: newStatus })
      if (res.success) {
        setTicketStatus(newStatus)
        setTicket({ ...ticket, status: newStatus })
      } else {
        alert(res.error || 'Failed to update ticket status')
      }
    } catch (err: any) {
      alert('Error updating status: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF2D8D] mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading ticket conversation...</p>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-bold mb-4">{error || 'Ticket not found'}</p>
        <Link href="/school-portal/support" className="text-xs font-bold text-purple-600 underline">
          Back to Support Tickets
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/school-portal/support"
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
      >
        <FiArrowLeft />
        <span>Back to Support Tickets</span>
      </Link>

      {/* Ticket Details Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold text-gray-400">#{ticket.id.substring(0, 8)}</span>
              <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                ticket.status === 'open' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                ticket.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-green-50 text-green-700 border-green-200'
              }`}>
                {ticket.status?.replace('_', ' ')}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200 rounded-md">
                {ticket.category || 'General'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">{ticket.subject}</h1>
            <p className="text-xs text-gray-500 mt-1">
              Raised by <span className="font-bold text-gray-800">{ticket.user?.full_name || ticket.profiles?.full_name || 'Student'}</span> on {new Date(ticket.created_at).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={ticketStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#FF2D8D] focus:outline-none"
            >
              <option value="open">Status: Open</option>
              <option value="in_progress">Status: In Progress</option>
              <option value="resolved">Status: Resolved</option>
              <option value="closed">Status: Closed</option>
            </select>
          </div>
        </div>

        {ticket.description && (
          <div className="pt-4 text-xs text-gray-700 leading-relaxed bg-gray-50/50 p-4 rounded-2xl mt-4">
            <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px] mb-1">Original Issue Description:</p>
            {ticket.description}
          </div>
        )}
      </div>

      {/* Messages Thread */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Conversation Thread</h2>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {messages.length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-6">No replies yet. Type a response below to assist the student.</p>
          ) : (
            messages.map((msg: any) => {
              const isAdmin = msg.sender_type === 'admin' || msg.is_staff
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                      isAdmin
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none'
                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    <p className={`font-bold text-[10px] uppercase mb-1 ${isAdmin ? 'text-purple-200' : 'text-gray-500'}`}>
                      {isAdmin ? 'School Partner / Instructor' : (ticket.user?.full_name || 'Student')}
                    </p>
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                    <span className={`block text-[9px] mt-2 ${isAdmin ? 'text-purple-200 text-right' : 'text-gray-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Reply Box */}
        <form onSubmit={handleSendMessage} className="pt-4 border-t border-gray-100 flex items-center gap-3">
          <input
            type="text"
            placeholder="Type your response to the student..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-[#FF2D8D] focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSending || !newMessage.trim()}
            className="px-5 py-3 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2 shrink-0"
          >
            <FiSend />
            <span>{isSending ? 'Sending...' : 'Send Reply'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}

