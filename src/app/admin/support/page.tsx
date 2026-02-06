'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiFilter, FiMessageSquare, FiClock, FiUser } from 'react-icons/fi'

export default function SupportPage() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')

  const tickets = [
    { id: '#T-1234', student: 'Kiran Desai', email: 'kiran@email.com', subject: 'Unable to access Week 3 videos', category: 'Technical', priority: 'High', status: 'Open', created: '2026-02-06 10:30 AM', lastUpdated: '2026-02-06 11:15 AM' },
    { id: '#T-1233', student: 'Sanjay Mehta', email: 'sanjay@email.com', subject: 'Certificate not generated', category: 'Certificate', priority: 'Medium', status: 'In Progress', created: '2026-02-05 03:20 PM', lastUpdated: '2026-02-06 09:00 AM' },
    { id: '#T-1232', student: 'Pooja Nair', email: 'pooja@email.com', subject: 'Task submission error', category: 'Technical', priority: 'Low', status: 'Resolved', created: '2026-02-04 11:45 AM', lastUpdated: '2026-02-05 02:30 PM' },
    { id: '#T-1231', student: 'Rahul Verma', email: 'rahul@email.com', subject: 'Payment not reflected', category: 'Billing', priority: 'High', status: 'Open', created: '2026-02-04 09:00 AM', lastUpdated: '2026-02-04 09:00 AM' },
    { id: '#T-1230', student: 'Meera Iyer', email: 'meera@email.com', subject: 'Need course extension', category: 'Course', priority: 'Medium', status: 'In Progress', created: '2026-02-03 04:15 PM', lastUpdated: '2026-02-04 10:20 AM' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Support Tickets</h1>
        <p className="text-gray-600 mt-1">Manage student support requests and issues</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Open Tickets</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">15</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">In Progress</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">8</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Resolved Today</p>
          <p className="text-3xl font-bold text-green-600 mt-2">12</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Avg Response Time</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">2.3h</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <FiFilter className="text-gray-600 text-xl" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]">
            <option value="all">All Categories</option>
            <option value="technical">Technical</option>
            <option value="certificate">Certificate</option>
            <option value="billing">Billing</option>
            <option value="course">Course</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-lg font-bold text-[#C81E4E]">{ticket.id}</span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    ticket.priority === 'High' ? 'bg-red-100 text-red-800' :
                    ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {ticket.priority} Priority
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    ticket.status === 'Open' ? 'bg-orange-100 text-orange-800' :
                    ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    ticket.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ticket.status}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                    {ticket.category}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">{ticket.subject}</h3>
                
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <FiUser />
                    <span>{ticket.student}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiMessageSquare />
                    <span>{ticket.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiClock />
                    <span>Created: {ticket.created}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiClock />
                    <span>Updated: {ticket.lastUpdated}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-6">
                <Link
                  href={`/admin/support/${ticket.id}`}
                  className="px-6 py-2 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg hover:shadow-lg transition-all font-semibold text-center"
                >
                  View & Reply
                </Link>
                {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                  <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold">
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-xl shadow-md px-6 py-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">1</span> to <span className="font-semibold">5</span> of <span className="font-semibold">23</span> tickets
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
            Previous
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg text-sm font-medium">
            1
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
            2
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
