'use client'

import { FiUsers, FiUserCheck, FiFileText, FiCheckSquare, FiAlertCircle, FiAward, FiTrendingUp, FiClock } from 'react-icons/fi'
import Link from 'next/link'

export default function DashboardPage() {
  const summaryCards = [
    { title: 'Total Students', value: '1,245', icon: FiUsers, color: 'from-blue-500 to-blue-600', change: '+12%' },
    { title: 'Active Students', value: '987', icon: FiUserCheck, color: 'from-green-500 to-green-600', change: '+8%' },
    { title: 'Pending Evaluations', value: '43', icon: FiCheckSquare, color: 'from-orange-500 to-orange-600', change: '-5%' },
    { title: 'Pending Projects', value: '28', icon: FiFileText, color: 'from-purple-500 to-purple-600', change: '+3%' },
    { title: 'Open Tickets', value: '15', icon: FiAlertCircle, color: 'from-red-500 to-red-600', change: '-10%' },
    { title: 'Certificates Issued', value: '234', icon: FiAward, color: 'from-yellow-500 to-yellow-600', change: '+25%' },
  ]

  const recentStudents = [
    { name: 'Rajesh Kumar', email: 'rajesh@email.com', course: 'Web Development', date: '2026-02-06', status: 'Active' },
    { name: 'Priya Sharma', email: 'priya@email.com', course: 'Data Science', date: '2026-02-05', status: 'Active' },
    { name: 'Amit Patel', email: 'amit@email.com', course: 'Mobile App Dev', date: '2026-02-05', status: 'Active' },
    { name: 'Sneha Reddy', email: 'sneha@email.com', course: 'UI/UX Design', date: '2026-02-04', status: 'Active' },
  ]

  const recentTasks = [
    { student: 'Rahul Verma', task: 'React Components Assignment', date: '2026-02-06 10:30 AM', status: 'Pending' },
    { student: 'Ananya Singh', task: 'JavaScript Fundamentals Quiz', date: '2026-02-06 09:15 AM', status: 'Pending' },
    { student: 'Vikram Joshi', task: 'CSS Grid Layout Project', date: '2026-02-05 04:45 PM', status: 'Evaluated' },
    { student: 'Meera Iyer', task: 'API Integration Task', date: '2026-02-05 02:20 PM', status: 'Pending' },
  ]

  const recentTickets = [
    { id: '#T-1234', student: 'Kiran Desai', subject: 'Unable to access Week 3 videos', priority: 'High', status: 'Open' },
    { id: '#T-1233', student: 'Sanjay Mehta', subject: 'Certificate not generated', priority: 'Medium', status: 'In Progress' },
    { id: '#T-1232', student: 'Pooja Nair', subject: 'Task submission error', priority: 'Low', status: 'Resolved' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your LMS today.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {summaryCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
                  <div className="flex items-center mt-3">
                    <span className={`text-sm font-semibold ${card.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {card.change}
                    </span>
                    <span className="text-gray-500 text-xs ml-2">vs last month</span>
                  </div>
                </div>
                <div className={`w-16 h-16 bg-gradient-to-br ${card.color} rounded-full flex items-center justify-center`}>
                  <card.icon className="text-white text-2xl" />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3">
              <Link href="#" className="text-sm text-[#C81E4E] hover:text-[#D91E5B] font-medium flex items-center">
                View Details →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/admin/tasks/submissions" className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:scale-105">
          <FiCheckSquare className="text-3xl mb-3" />
          <p className="font-semibold">Evaluate Tasks</p>
          <p className="text-sm opacity-90 mt-1">43 pending</p>
        </Link>
        <Link href="/admin/projects" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:scale-105">
          <FiFileText className="text-3xl mb-3" />
          <p className="font-semibold">Approve Projects</p>
          <p className="text-sm opacity-90 mt-1">28 pending</p>
        </Link>
        <Link href="/admin/support" className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:scale-105">
          <FiAlertCircle className="text-3xl mb-3" />
          <p className="font-semibold">View Tickets</p>
          <p className="text-sm opacity-90 mt-1">15 open</p>
        </Link>
        <Link href="/admin/certificates" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:scale-105">
          <FiAward className="text-3xl mb-3" />
          <p className="font-semibold">Issue Certificates</p>
          <p className="text-sm opacity-90 mt-1">12 eligible</p>
        </Link>
      </div>

      {/* Recent Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Recent Student Signups</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentStudents.map((student, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] rounded-full flex items-center justify-center text-white font-bold">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      <p className="text-xs text-gray-500 mt-1">{student.course}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      {student.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-2">{student.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <Link href="/admin/students" className="text-sm text-[#C81E4E] hover:text-[#D91E5B] font-medium flex items-center justify-center">
              View All Students →
            </Link>
          </div>
        </div>

        {/* Recent Task Submissions */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Recently Submitted Tasks</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentTasks.map((task, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{task.task}</p>
                      <p className="text-sm text-gray-600 mt-1">by {task.student}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <FiClock className="mr-1" />
                        {task.date}
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      task.status === 'Pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <Link href="/admin/tasks/submissions" className="text-sm text-[#C81E4E] hover:text-[#D91E5B] font-medium flex items-center justify-center">
              View All Submissions →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Recently Raised Tickets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTickets.map((ticket, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ticket.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{ticket.student}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{ticket.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      ticket.priority === 'High' ? 'bg-red-100 text-red-800' :
                      ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      ticket.status === 'Open' ? 'bg-orange-100 text-orange-800' :
                      ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link href={`/admin/support/${ticket.id}`} className="text-[#C81E4E] hover:text-[#D91E5B] font-medium">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <Link href="/admin/support" className="text-sm text-[#C81E4E] hover:text-[#D91E5B] font-medium flex items-center justify-center">
            View All Tickets →
          </Link>
        </div>
      </div>
    </div>
  )
}
