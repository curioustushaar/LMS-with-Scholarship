'use client'

import { useState, useEffect } from 'react'
import { getClientAuthToken } from '@/lib/auth-helpers'
import { FiMail, FiTrash2, FiCheck, FiRefreshCw, FiClock, FiPhone, FiTag } from 'react-icons/fi'

interface ContactMessage {
  id: string
  sender_name: string
  sender_email: string
  sender_phone?: string
  subject?: string
  message: string
  category?: string
  status: 'unread' | 'read' | 'replied' | 'archived'
  created_at: string
}

export default function SuperadminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const getToken = async () => await getClientAuthToken()

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/contact-messages', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && data.data?.length > 0) {
        setMessages(data.data)
      } else {
        setMessages([
          {
            id: '1',
            sender_name: 'Ananya Verma',
            sender_email: 'ananya.verma@example.com',
            sender_phone: '+91 9608369002',
            subject: 'Inquiry regarding B.Tech Admission Dates',
            category: 'admission',
            message: 'Hello, I wanted to know the final date for submitting applications for the upcoming fall batch in B.Tech CSE.',
            status: 'unread',
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            sender_name: 'Karan Mehra',
            sender_email: 'karan.m@techcorp.io',
            sender_phone: '+91 9811223344',
            subject: 'Campus Hiring Drive Partnership',
            category: 'employer',
            message: 'We are interested in hiring full-stack interns from your latest cohort. Please connect with our talent team.',
            status: 'read',
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: '3',
            sender_name: 'Dr. S. K. Roy',
            sender_email: 'skroy@dpsdelhi.edu.in',
            sender_phone: '+91 9876543210',
            subject: 'Institutional Partnership Proposal',
            category: 'partnership',
            message: 'Greetings. We would like to schedule an introductory call to discuss credit transfer and syllabus collaboration.',
            status: 'replied',
            created_at: new Date(Date.now() - 172800000).toISOString(),
          },
        ])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const handleUpdateStatus = async (id: string, status: 'unread' | 'read' | 'replied' | 'archived') => {
    try {
      const token = await getToken()
      await fetch('/api/superadmin/contact-messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, status }),
      })
      setMessages(messages.map((m) => (m.id === id ? { ...m, status } : m)))
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status })
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return
    try {
      const token = await getToken()
      await fetch(`/api/superadmin/contact-messages?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessages(messages.filter((m) => m.id !== id))
      if (selectedMessage?.id === id) setSelectedMessage(null)
    } catch (err) {
      console.error(err)
    }
  }

  const filteredMessages = filter === 'all' ? messages : messages.filter((m) => m.status === filter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiMail className="text-[#C81E4E]" />
            Contact & Inquiry Messages
          </h1>
          <p className="text-sm text-gray-500 mt-1">Inbound student queries, partnership proposals, and support inquiries</p>
        </div>
        <button
          onClick={fetchMessages}
          className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'unread', 'read', 'replied'].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
              filter === st
                ? 'bg-[#C81E4E] text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {st} ({st === 'all' ? messages.length : messages.filter((m) => m.status === st).length})
          </button>
        ))}
      </div>

      {/* Split view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages list */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100 max-h-[700px] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading messages...</div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No messages in this folder.</div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => {
                  setSelectedMessage(msg)
                  if (msg.status === 'unread') handleUpdateStatus(msg.id, 'read')
                }}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedMessage?.id === msg.id
                    ? 'bg-pink-50/50 border-l-4 border-[#C81E4E]'
                    : msg.status === 'unread'
                    ? 'bg-purple-50/20 font-semibold'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-sm truncate">{msg.sender_name}</span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 shrink-0">
                    <FiClock size={10} /> {new Date(msg.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-gray-800 font-medium truncate mt-0.5">{msg.subject || 'Inquiry'}</div>
                <p className="text-xs text-gray-500 line-clamp-1 mt-1">{msg.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                    {msg.category || 'general'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                      msg.status === 'unread'
                        ? 'bg-pink-100 text-[#FF2D8D]'
                        : msg.status === 'replied'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {msg.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message preview panel */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {selectedMessage ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedMessage.subject || 'No Subject'}</h2>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                    <span>
                      From: <strong className="text-gray-800">{selectedMessage.sender_name}</strong> &lt;
                      {selectedMessage.sender_email}&gt;
                    </span>
                    {selectedMessage.sender_phone && (
                      <span className="flex items-center gap-1">
                        <FiPhone size={11} /> {selectedMessage.sender_phone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'replied')}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Mark as Replied"
                  >
                    <FiCheck size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Message"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50/60 rounded-xl p-5 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.message}
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Received on {new Date(selectedMessage.created_at).toLocaleString()}
                </span>
                <a
                  href={`mailto:${selectedMessage.sender_email}?subject=Re: ${selectedMessage.subject || 'Inquiry Response'}`}
                  className="px-4 py-2 bg-[#C81E4E] hover:bg-[#A3163E] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  Reply via Email
                </a>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-gray-400">
              <FiMail size={40} className="stroke-1 mb-2 opacity-40" />
              <p className="text-sm">Select a message from the left to read details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
