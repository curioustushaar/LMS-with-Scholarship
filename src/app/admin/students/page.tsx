'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiSearch, FiPlus, FiEye, FiEdit, FiLock, FiUnlock, FiRefreshCw, FiFilter, FiX, FiCheck, FiCopy, FiEyeOff, FiFolder } from 'react-icons/fi'
import { studentsAPI } from '@/lib/api'

interface Student {
  id: string
  email: string
  full_name: string
  phone?: string
  parents_contact?: string
  class?: string
  school_coaching?: string
  role: string
  status: string
  enrollment_date?: string
  last_active?: string
  profile_image_url?: string
  created_at?: string
}

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newThisWeek: 0
  })
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [copiedField, setCopiedField] = useState('')

  // Fetch students
  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    console.log('Fetching students...')
    const response = await studentsAPI.getAll()
    console.log('Students response:', response)
    
    if (response.success && response.data) {
      const studentsList = Array.isArray(response.data) ? response.data : []
      setStudents(studentsList)
      
      // Calculate stats
      const active = studentsList.filter((s: Student) => s.status === 'active').length
      const inactive = studentsList.filter((s: Student) => s.status === 'inactive').length
      
      // Students enrolled in last 7 days
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const newThisWeek = studentsList.filter((s: Student) => 
        s.enrollment_date && new Date(s.enrollment_date) > oneWeekAgo
      ).length

      setStats({
        total: studentsList.length,
        active,
        inactive,
        newThisWeek
      })
    } else {
      console.error('Failed to fetch students:', response.error)
      setStudents([])
    }
    setLoading(false)
  }

  // Handle search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleFilter()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery, filterStatus])

  const handleFilter = async () => {
    setLoading(true)
    const filters: any = {}
    
    if (filterStatus !== 'all') {
      filters.status = filterStatus
    }
    
    if (searchQuery) {
      filters.search = searchQuery
    }

    const response = await studentsAPI.getAll(filters)
    if (response.success && response.data) {
      setStudents(response.data)
    }
    setLoading(false)
  }

  const handleResetPassword = async (id: string, name: string) => {
    if (!confirm(`Generate new password for ${name}?`)) return
    
    // Generate new password
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*'
    
    const allChars = uppercase + lowercase + numbers + symbols
    let password = ''
    
    // Ensure at least one character from each type
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
    password += numbers.charAt(Math.floor(Math.random() * numbers.length))
    password += symbols.charAt(Math.floor(Math.random() * symbols.length))
    
    // Fill the rest randomly
    for (let i = password.length; i < 12; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length))
    }
    
    // Shuffle password
    password = password.split('').sort(() => Math.random() - 0.5).join('')
    
    const response = await studentsAPI.resetPassword(id)
    if (response.success) {
      // Show modal with new password
      const student = students.find(s => s.id === id)
      setPasswordData({
        studentId: id,
        name: name,
        email: student?.email || 'N/A',
        password: password
      })
      setShowPasswordModal(true)
    } else {
      alert(response.error || 'Failed to reset password')
    }
  }

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(''), 2000)
  }

  const handleToggleStatus = async (student: Student) => {
    const newStatus = student.status === 'active' ? 'inactive' : 'active'
    const action = newStatus === 'inactive' ? 'block' : 'unblock'
    
    if (!confirm(`Are you sure you want to ${action} ${student.full_name}?`)) return
    
    const response = await studentsAPI.update(student.id, { status: newStatus })
    if (response.success) {
      // Refresh students list
      fetchStudents()
    } else {
      alert(response.error || 'Failed to update student status')
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Students Management</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Manage all students, their profiles, and access control</p>
        </div>
        <Link 
          href="/admin/students/create"
          className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm md:text-base"
        >
          <FiPlus className="text-lg md:text-xl" />
          <span>Add Student</span>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
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
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
          <p className="text-sm text-gray-500 mt-2">All registered students</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Active Students</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
          <p className="text-sm text-gray-500 mt-2">{stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Inactive Students</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.inactive}</p>
          <p className="text-sm text-gray-500 mt-2">{stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}% of total</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">New This Week</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.newThisWeek}</p>
          <p className="text-sm text-gray-500 mt-2">Last 7 days</p>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Parents Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Class / School</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Enrolled</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E]"></div>
                      <p className="mt-4 text-gray-600">Loading students...</p>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No students found. {searchQuery || filterStatus !== 'all' ? 'Try adjusting your filters.' : 'Add your first student to get started.'}
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {student.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-semibold text-gray-800">{student.full_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{student.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.parents_contact || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div>
                        {student.class ? (
                          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-purple-50 text-purple-700 rounded border border-purple-200">
                            {student.class}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                        {student.school_coaching && (
                          <p className="text-xs text-gray-500 truncate max-w-[170px] mt-0.5" title={student.school_coaching}>
                            {student.school_coaching}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        student.status === 'active' ? 'bg-green-100 text-green-800' : 
                        student.status === 'inactive' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {student.status ? student.status.charAt(0).toUpperCase() + student.status.slice(1) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(student.enrollment_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-3">
                        <Link 
                          href={`/admin/students/${student.id}`}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="View Profile"
                        >
                          <FiEye className="text-lg" />
                        </Link>
                        <Link
                          href={`/admin/projects?assignUserId=${student.id}`}
                          className="text-purple-600 hover:text-purple-800 transition-colors"
                          title="Assign Project to Student"
                        >
                          <FiFolder className="text-lg" />
                        </Link>
                        <button 
                          onClick={() => handleResetPassword(student.id, student.full_name)}
                          className="text-orange-600 hover:text-orange-800 transition-colors"
                          title="Reset Password"
                        >
                          <FiRefreshCw className="text-lg" />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(student)}
                          className={`transition-colors ${
                            student.status === 'active' 
                              ? 'text-red-600 hover:text-red-800' 
                              : 'text-green-600 hover:text-green-800'
                          }`}
                          title={student.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {student.status === 'active' ? <FiLock className="text-lg" /> : <FiUnlock className="text-lg" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold">{students.length}</span> of <span className="font-semibold">{stats.total}</span> students
          </div>
          <div className="text-sm text-gray-500">
            {searchQuery || filterStatus !== 'all' ? 'Filtered results' : 'All students'}
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showPasswordModal && passwordData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
            {/* Success Icon */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="text-white text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">New Password Generated</h2>
              <p className="text-gray-600 mt-2">Share this new password with {passwordData.name}</p>
            </div>

            {/* Credential Fields */}
            <div className="space-y-4 mb-6">
              {/* Student Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={passwordData.name}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg font-medium"
                  />
                  <button
                    onClick={() => handleCopy(passwordData.name, 'name')}
                    className="px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    {copiedField === 'name' ? <FiCheck className="text-green-600" /> : <FiCopy />}
                  </button>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email (Username)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="email"
                    value={passwordData.email}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg font-medium"
                  />
                  <button
                    onClick={() => handleCopy(passwordData.email, 'email')}
                    className="px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    {copiedField === 'email' ? <FiCheck className="text-green-600" /> : <FiCopy />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="flex items-center space-x-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.password}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg font-mono font-medium"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                  <button
                    onClick={() => handleCopy(passwordData.password, 'password')}
                    className="px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    {copiedField === 'password' ? <FiCheck className="text-green-600" /> : <FiCopy />}
                  </button>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Important:</strong> Share this password with the student. They should change it on first login for security.
              </p>
            </div>

            {/* Close Button */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Email: ${passwordData.email}\nPassword: ${passwordData.password}`)
                  setCopiedField('all')
                  setTimeout(() => setCopiedField(''), 2000)
                }}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                  copiedField === 'all' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {copiedField === 'all' ? 'Copied All ✓' : 'Copy All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
