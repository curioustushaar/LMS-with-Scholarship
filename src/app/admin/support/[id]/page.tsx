'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiSend, FiPaperclip, FiClock, FiUser, FiCheck } from 'react-icons/fi'

export default function TicketDetailPage() {
  const params = useParams()
  const [newMessage, setNewMessage] = useState('')
  const [ticketStatus, setTicketStatus] = useState('In Progress')

  const ticket = {
    id: params.id,
    student: 'Kiran Desai',
    email: 'kiran@email.com',
    subject: 'Unable to access Week 3 videos',
    category: 'Technical',
    priority: 'High',
    status: 'In Progress',
    created: '2026-02-06 10:30 AM',
    lastUpdated: '2026-02-06 11:15 AM',
  }

  const messages = [
    {
      id: 1,
      sender: 'Kiran Desai',
      isAdmin: false,
      message: 'Hi, I am unable to access Week 3 videos. When I click on any video, it shows an error message "Video not found". Please help me resolve this issue.',
      time: '2026-02-06 10:30 AM',
      attachments: ['screenshot-error.png']
    },
    {
      id: 2,
      sender: 'Admin Support',
      isAdmin: true,
      message: 'Hello Kiran, thank you for reaching out. We have received your query and are looking into the issue. Could you please confirm if Week 3 is unlocked for you?',
      time: '2026-02-06 10:45 AM',
      attachments: []
    },
    {
      id: 3,
      sender: 'Kiran Desai',
      isAdmin: false,
      message: 'Yes, Week 3 is showing as unlocked in my dashboard. I completed Week 1 and Week 2 successfully.',
      time: '2026-02-06 11:00 AM',
      attachments: []
    },
    {
      id: 4,
      sender: 'Admin Support',
      isAdmin: true,
      message: 'Thank you for confirming. I have checked your account and found the issue. The video URLs for Week 3 need to be updated. I am fixing this now. You should be able to access the videos within the next 10 minutes.',
      time: '2026-02-06 11:15 AM',
      attachments: []
    },
  ]

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    // TODO: Send message to database
    alert(`Message sent: ${newMessage}`)
    setNewMessage('')
  }

  const updateStatus = (status: string) => {
    setTicketStatus(status)
    // TODO: Update status in database
    alert(`Ticket status updated to: ${status}`)
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/support" className="inline-flex items-center space-x-2 text-[#C81E4E] hover:text-[#D91E5B] font-medium">
        <FiArrowLeft />
        <span>Back to Support Tickets</span>
      </Link>

      {/* Ticket Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-800">{ticket.id}: {ticket.subject}</h1>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                ticket.priority === 'High' ? 'bg-red-100 text-red-800' :
                ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {ticket.priority} Priority
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                ticketStatus === 'Open' ? 'bg-orange-100 text-orange-800' :
                ticketStatus === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                ticketStatus === 'Resolved' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {ticketStatus}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                {ticket.category}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
              <div>
                <p className="text-gray-600">Student</p>
                <p className="font-semibold text-gray-800">{ticket.student}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-semibold text-gray-800">{ticket.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Created</p>
                <p className="font-semibold text-gray-800">{ticket.created}</p>
              </div>
              <div>
                <p className="text-gray-600">Last Updated</p>
                <p className="font-semibold text-gray-800">{ticket.lastUpdated}</p>
              </div>
            </div>
          </div>

          {/* Status Update Buttons */}
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => updateStatus('In Progress')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium"
            >
              Mark In Progress
            </button>
            <button
              onClick={() => updateStatus('Resolved')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-sm font-medium flex items-center space-x-2"
            >
              <FiCheck />
              <span>Mark Resolved</span>
            </button>
            <button
              onClick={() => updateStatus('Closed')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all text-sm font-medium"
            >
              Close Ticket
            </button>
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
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl ${msg.isAdmin ? 'order-2' : 'order-1'}`}>
                <div className={`rounded-lg p-4 ${
                  msg.isAdmin
                    ? 'bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      msg.isAdmin ? 'bg-white/20' : 'bg-gray-300'
                    }`}>
                      {msg.sender.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{msg.sender}</p>
                      <p className={`text-xs ${msg.isAdmin ? 'opacity-80' : 'text-gray-500'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{msg.message}</p>
                  
                  {msg.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.attachments.map((file, idx) => (
                        <div key={idx} className={`flex items-center space-x-2 text-sm ${
                          msg.isAdmin ? 'bg-white/20' : 'bg-white'
                        } rounded px-3 py-2`}>
                          <FiPaperclip />
                          <span>{file}</span>
                        </div>
                      ))}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent resize-none"
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
                className="px-6 py-2 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center space-x-2"
              >
                <FiSend />
                <span>Send</span>
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
            href={`/admin/students/${ticket.id}`}
            className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-center font-medium"
          >
            View Student Profile
          </Link>
          <button className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all font-medium">
            Escalate Ticket
          </button>
          <button className="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-medium">
            Assign to Mentor
          </button>
        </div>
      </div>
    </div>
  )
}
