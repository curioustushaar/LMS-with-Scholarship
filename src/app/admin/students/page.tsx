'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiSearch, FiPlus, FiEye, FiEdit, FiLock, FiUnlock, FiRefreshCw, FiFilter } from 'react-icons/fi'

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const students = [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@email.com', course: 'Web Development', role: 'Student', status: 'Active', lastLogin: '2026-02-06 09:30 AM' },
    { id: 2, name: 'Priya Sharma', email: 'priya@email.com', course: 'Data Science', role: 'Student', status: 'Active', lastLogin: '2026-02-05 04:15 PM' },
    { id: 3, name: 'Amit Patel', email: 'amit@email.com', course: 'Mobile App Dev', role: 'Student', status: 'Active', lastLogin: '2026-02-05 11:20 AM' },
    { id: 4, name: 'Sneha Reddy', email: 'sneha@email.com', course: 'UI/UX Design', role: 'Student', status: 'Blocked', lastLogin: '2026-01-28 02:45 PM' },
    { id: 5, name: 'Vikram Joshi', email: 'vikram@email.com', course: 'Web Development', role: 'Mentor', status: 'Active', lastLogin: '2026-02-06 08:00 AM' },
    { id: 6, name: 'Ananya Singh', email: 'ananya@email.com', course: 'Data Science', role: 'Student', status: 'Active', lastLogin: '2026-02-04 06:30 PM' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Students Management</h1>
          <p className="text-gray-600 mt-1">Manage all students, their profiles, and access control</p>
        </div>
        <Link 
          href="/admin/students/create"
          className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
        >
          <FiPlus className="text-xl" />
          <span>Add Student</span>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400 text-xl" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
                placeholder="Search by name, email, or course..."
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Total Students</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">1,245</p>
          <p className="text-sm text-green-600 mt-2">↑ 12% vs last month</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Active Students</p>
          <p className="text-3xl font-bold text-green-600 mt-2">987</p>
          <p className="text-sm text-gray-500 mt-2">79% of total</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Blocked Students</p>
          <p className="text-3xl font-bold text-red-600 mt-2">15</p>
          <p className="text-sm text-gray-500 mt-2">1% of total</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">New This Week</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">28</p>
          <p className="text-sm text-green-600 mt-2">↑ 8 vs last week</p>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Course</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {student.name.charAt(0)}
                      </div>
                      <div className="font-semibold text-gray-800">{student.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.course}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      student.role === 'Mentor' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {student.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.lastLogin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-3">
                      <Link 
                        href={`/admin/students/${student.id}`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="View Profile"
                      >
                        <FiEye className="text-lg" />
                      </Link>
                      <button 
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title="Edit"
                      >
                        <FiEdit className="text-lg" />
                      </button>
                      <button 
                        className="text-orange-600 hover:text-orange-800 transition-colors"
                        title="Reset Password"
                      >
                        <FiRefreshCw className="text-lg" />
                      </button>
                      <button 
                        className={`transition-colors ${
                          student.status === 'Active' 
                            ? 'text-red-600 hover:text-red-800' 
                            : 'text-green-600 hover:text-green-800'
                        }`}
                        title={student.status === 'Active' ? 'Block' : 'Unblock'}
                      >
                        {student.status === 'Active' ? <FiLock className="text-lg" /> : <FiUnlock className="text-lg" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold">1</span> to <span className="font-semibold">6</span> of <span className="font-semibold">1,245</span> results
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              Previous
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg text-sm font-medium">
              1
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              2
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              3
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
