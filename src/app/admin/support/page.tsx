'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiFilter, FiMessageSquare, FiClock, FiUser } from 'react-icons/fi'
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

export default function SupportPage() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0, avgTime: '-' })
  const [loading, setLoading] = useState(true)
  const [activeActionId, setActiveActionId] = useState<string | null>(null)

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    try {
      const result = await api.tickets.getAll()
      if (result.success && result.data) {
        const ticketsData = Array.isArray(result.data) ? result.data : []
        setTickets(ticketsData)

        const open = ticketsData.filter((t: any) => t.status === 'open').length
        const inProgress = ticketsData.filter((t: any) => t.status === 'in_progress').length
        const resolved = ticketsData.filter((t: any) => t.status === 'resolved').length

        setStats({ open, inProgress, resolved, avgTime: '-' })
      }
    } catch (error) {
      console.error('Failed to load tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setActiveActionId(null) // Close the dropdown menu
    if (!confirm('Are you sure you want to delete this ticket? This will permanently delete the ticket and all its messages. This action cannot be undone.')) return
    
    try {
      const result = await api.tickets.delete(id)
      if (result.success) {
        alert('✅ Ticket deleted successfully')
        loadTickets()
      } else {
        alert('❌ Failed to delete ticket: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Delete failed:', error)
      alert('❌ Error deleting ticket. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading support tickets...</p>
        </div>
      </div>
    )
  }

  const toggleAction = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (activeActionId === id) {
      setActiveActionId(null)
    } else {
      setActiveActionId(id)
    }
  }

  return (
    <div className="space-y-6" onClick={() => setActiveActionId(null)}>
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Support Tickets</h1>
        <p className="text-gray-600 mt-1">Manage student support requests and issues</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Open Tickets</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{stats.open}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">In Progress</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Resolved Today</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolved}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Avg Response</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{stats.avgTime}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative group">
            <FiFilter className="absolute left-4 top-3.5 text-gray-400 group-hover:text-[#C81E4E] transition-colors" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent bg-gray-50 hover:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent bg-gray-50 hover:bg-white transition-all cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent bg-gray-50 hover:bg-white transition-all cursor-pointer">
            <option value="all">All Categories</option>
            <option value="technical">Technical</option>
            <option value="certificate">Certificate</option>
            <option value="billing">Billing</option>
            <option value="course">Course</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMessageSquare className="text-3xl text-gray-300" />
          </div>
          <p className="text-gray-500 text-lg font-medium">No support tickets found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:border-[#C81E4E]/20 transition-all duration-300 relative z-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                <div className="flex-1">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-xs font-mono font-bold text-gray-400">#{ticket.id.substring(0, 8)}</span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${ticket.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100' :
                      ticket.priority === 'medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                      {ticket.priority}
                    </span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${ticket.status === 'open' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      ticket.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        ticket.status === 'resolved' ? 'bg-green-50 text-green-600 border-green-100' :
                          'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                      {ticket.status?.replace('_', ' ')}
                    </span>
                    <span className="px-2.5 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 text-[10px] font-bold uppercase tracking-wider rounded-full">
                      {ticket.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#C81E4E] transition-colors cursor-pointer">
                    <Link href={`/admin/support/${ticket.id}`}>{ticket.subject}</Link>
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-1.5">
                      <FiUser size={14} />
                      <span className="font-medium truncate max-w-[120px]" title={ticket.user?.full_name || ticket.user_id}>
                        {ticket.user?.full_name || ticket.user_id}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <FiClock size={14} />
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                  <Link
                    href={`/admin/support/${ticket.id}`}
                    className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-[#C81E4E] transition-all shadow-md hover:shadow-lg flex-1 md:flex-none text-center"
                  >
                    View Details
                  </Link>

                  <div className="relative">
                    <button
                      onClick={(e) => toggleAction(ticket.id, e)}
                      className={`p-2.5 rounded-xl border transition-all ${activeActionId === ticket.id ? 'bg-gray-100 border-gray-300 transform rotate-90' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-500'}`}
                    >
                      {/* Using vertical dots icon represented by 3 dots manually or reusing filter icon if FiMoreVertical not imported */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                    </button>

                    {activeActionId === ticket.id && (
                      <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200 origin-bottom-right">
                        {ticket.status !== 'resolved' && (
                          <button className="w-full text-left px-4 py-3 hover:bg-green-50 text-sm font-bold text-gray-700 hover:text-green-600 transition-colors border-b border-gray-50">
                            Mark Resolved
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(ticket.id); }}
                          className="w-full text-left px-4 py-3 hover:bg-red-50 text-sm font-bold text-gray-700 hover:text-red-600 transition-colors"
                        >
                          Delete Ticket
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
