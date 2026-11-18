'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiFilter, FiMessageSquare, FiClock, FiUser, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { api } from '@/lib/api'

interface Ticket {
  id: string
  user_id: string
  subject: string
  category: string
  priority: string
  status: string
  created_at: string
  updated_at: string
  profiles?: {
    full_name: string
    email: string
  }
  user?: {
    full_name: string
    email: string
  }
}

export default function SchoolSupportPage() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    try {
      setLoading(true)
      const result = await api.tickets.getAll()
      if (result.success && result.data) {
        const ticketsData = Array.isArray(result.data) ? result.data : []
        setTickets(ticketsData)

        const open = ticketsData.filter((t: any) => t.status === 'open').length
        const inProgress = ticketsData.filter((t: any) => t.status === 'in_progress').length
        const resolved = ticketsData.filter((t: any) => t.status === 'resolved').length

        setStats({ open, inProgress, resolved })
      }
    } catch (error) {
      console.error('Failed to load tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkResolved = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const res = await api.tickets.updateStatus(id, { status: 'resolved' })
      if (res.success) {
        alert('Ticket marked as resolved! ✅')
        loadTickets()
      } else {
        alert('Failed to update ticket: ' + (res.error || 'Unknown error'))
      }
    } catch (err: any) {
      alert('Error updating ticket: ' + err.message)
    }
  }

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF2D8D] mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading student tickets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-purple-950 to-gray-900 text-white rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/10">
        <div>
          <span className="text-xs font-bold text-pink-400 uppercase tracking-widest px-3 py-1 bg-white/10 rounded-full border border-white/10 inline-block mb-2">
            Student Helpdesk
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">🎫 Support Tickets & Queries</h1>
          <p className="mt-1 text-sm text-purple-200">Answer inquiries and provide direct academic assistance to your students</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-center">
            <p className="text-[10px] text-purple-200 font-bold uppercase">Open Queries</p>
            <p className="text-xl font-bold text-orange-400">{stats.open}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-center">
            <p className="text-[10px] text-purple-200 font-bold uppercase">In Progress</p>
            <p className="text-xl font-bold text-blue-400">{stats.inProgress}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-center">
            <p className="text-[10px] text-purple-200 font-bold uppercase">Resolved</p>
            <p className="text-xl font-bold text-green-400">{stats.resolved}</p>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
          <FiFilter />
          <span>Filters:</span>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF2D8D] focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#FF2D8D] focus:outline-none"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-100 shadow-sm">
            <FiMessageSquare className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-700">No student support tickets found</p>
            <p className="text-xs text-gray-400 mt-1">When students ask questions in their courses, they will appear here.</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold text-gray-400">#{ticket.id.substring(0, 8)}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                    ticket.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                    ticket.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {ticket.priority}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                    ticket.status === 'open' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    ticket.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-green-50 text-green-700 border-green-200'
                  }`}>
                    {ticket.status?.replace('_', ' ')}
                  </span>
                  {ticket.category && (
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold rounded-md">
                      {ticket.category}
                    </span>
                  )}
                </div>

                <Link
                  href={`/school-portal/support/${ticket.id}`}
                  className="text-base font-bold text-gray-900 hover:text-[#FF2D8D] transition-colors line-clamp-1 block"
                >
                  {ticket.subject}
                </Link>

                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                  <span className="flex items-center gap-1.5 font-medium">
                    <FiUser size={12} />
                    {ticket.user?.full_name || ticket.profiles?.full_name || 'Student'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FiClock size={12} />
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {ticket.status !== 'resolved' && (
                  <button
                    onClick={(e) => handleMarkResolved(ticket.id, e)}
                    className="px-3.5 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <FiCheckCircle />
                    Resolve
                  </button>
                )}
                <Link
                  href={`/school-portal/support/${ticket.id}`}
                  className="px-4 py-2 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all"
                >
                  View Details & Reply
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

