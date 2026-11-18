'use client'

import { useEffect, useState } from 'react'
import { superadminAPI } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiSearch,
  FiUserCheck,
  FiActivity,
  FiToggleLeft,
  FiToggleRight,
  FiBookOpen,
  FiX,
} from 'react-icons/fi'
import Link from 'next/link'

interface Admin {
  admin_id: string
  email: string
  full_name: string
  role: string
  account_status: string
  admin_since: string
  assigned_school_id?: string
  assigned_school_name?: string
  assigned_courses_count: number
  assigned_students_count: number
  assigned_tasks_count: number
  assigned_projects_count: number
  total_courses_added: number
  total_students_added: number
  total_projects_evaluated: number
  total_tasks_created: number
  total_tickets_resolved: number
  total_videos_uploaded: number
  total_badges_awarded: number
  active_days: number
}

export default function AdminsManagement() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    setLoading(true)
    console.log('📊 Fetching admins list...')
    const response = await superadminAPI.getAllAdmins()
    console.log('📊 getAllAdmins response:', response)
    if (response.success) {
      console.log('✅ Admins data received:', response.data.length, 'admins')
      console.log('📋 Admins:', response.data)
      setAdmins(response.data)
    } else {
      console.error('❌ Failed to fetch admins:', response.error)
    }
    setLoading(false)
  }

  const filteredAdmins = admins.filter((admin) =>
    admin.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteAdmin = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate admin "${name}"?`)) {
      return
    }

    const response = await superadminAPI.deleteAdmin(id)
    if (response.success) {
      alert('Admin deactivated successfully')
      fetchAdmins()
    } else {
      alert('Failed to deactivate admin: ' + response.error)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string, name: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    const action = newStatus === 'active' ? 'enable' : 'disable'
    
    if (!confirm(`Are you sure you want to ${action} admin "${name}"?`)) {
      return
    }

    const response = await superadminAPI.toggleAdminStatus(id, newStatus)
    if (response.success) {
      alert(`Admin ${action}d successfully`)
      fetchAdmins()
    } else {
      alert(`Failed to ${action} admin: ` + response.error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] rounded-lg shadow-lg p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Management</h1>
            <p className="text-white/90 text-sm sm:text-base">Manage admin accounts and track their activities</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto bg-white text-[#C81E4E] px-4 sm:px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
          >
            <FiPlus />
            <span>Create Admin</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search admins by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
          />
        </div>
      </div>

      {/* Admins Table - Desktop */}
      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Admin</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Courses</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Students</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Tasks</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Projects</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Tickets</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Active Days</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAdmins.map((admin) => (
                <tr key={admin.admin_id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-semibold text-gray-900">{admin.full_name}</p>
                      <p className="text-sm text-gray-500">{admin.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {admin.role === 'superadmin' ? '👑 Superadmin' : 'Admin'} • Since {new Date(admin.admin_since).toLocaleDateString()}
                      </p>
                      {admin.assigned_school_name && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md mt-1 border border-purple-200">
                          🏫 {admin.assigned_school_name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      admin.account_status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {admin.account_status || 'active'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {admin.assigned_courses_count || 0}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {admin.assigned_students_count || 0}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 text-cyan-800">
                      {admin.assigned_tasks_count || 0}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {admin.assigned_projects_count || 0}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      {admin.total_tickets_resolved}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-semibold text-gray-700">{admin.active_days}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end space-x-2">
                      {admin.role !== 'superadmin' && (
                        <Link
                          href={`/superadmin/admins/${admin.admin_id}/courses`}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Manage Courses"
                        >
                          <FiBookOpen />
                        </Link>
                      )}
                      {/* <Link
                        href={`/superadmin/admins/${admin.admin_id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FiEye />
                      </Link> */}
                      <button
                        className="p-2 text-gray-400 cursor-not-allowed rounded-lg"
                        title="View Details (Coming Soon)"
                        disabled
                      >
                        <FiEye />
                      </button>
                      {admin.role !== 'superadmin' && (
                        <>
                          <button
                            onClick={() => handleToggleStatus(admin.admin_id, admin.account_status || 'active', admin.full_name)}
                            className={`p-2 rounded-lg transition-colors ${
                              admin.account_status === 'active'
                                ? 'text-orange-600 hover:bg-orange-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={admin.account_status === 'active' ? 'Disable Admin' : 'Enable Admin'}
                          >
                            {admin.account_status === 'active' ? <FiToggleRight /> : <FiToggleLeft />}
                          </button>
                          <button
                            onClick={() => handleDeleteAdmin(admin.admin_id, admin.full_name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Deactivate Admin"
                          >
                            <FiTrash2 />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAdmins.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FiUserCheck className="text-5xl mx-auto mb-3 opacity-50" />
            <p>No admins found</p>
          </div>
        )}
      </div>

      {/* Admins Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {filteredAdmins.map((admin) => (
          <div key={admin.admin_id} className="bg-white rounded-lg shadow-md p-4">
            {/* Admin Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{admin.full_name}</p>
                <p className="text-sm text-gray-500">{admin.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {admin.role === 'superadmin' ? '👑 Superadmin' : 'Admin'} • Since {new Date(admin.admin_since).toLocaleDateString()}
                </p>
                {admin.assigned_school_name && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md mt-1 border border-purple-200">
                    🏫 {admin.assigned_school_name}
                  </span>
                )}
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                admin.account_status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {admin.account_status || 'active'}
              </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center p-2 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-600 font-medium">Courses</p>
                <p className="text-lg font-bold text-purple-800">{admin.assigned_courses_count || 0}</p>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 font-medium">Students</p>
                <p className="text-lg font-bold text-blue-800">{admin.assigned_students_count || 0}</p>
              </div>
              <div className="text-center p-2 bg-cyan-50 rounded-lg">
                <p className="text-xs text-cyan-600 font-medium">Tasks</p>
                <p className="text-lg font-bold text-cyan-800">{admin.assigned_tasks_count || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600 font-medium">Projects</p>
                <p className="text-lg font-bold text-green-800">{admin.assigned_projects_count || 0}</p>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded-lg">
                <p className="text-xs text-yellow-600 font-medium">Tickets</p>
                <p className="text-lg font-bold text-yellow-800">{admin.total_tickets_resolved}</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 font-medium">Active Days</p>
                <p className="text-lg font-bold text-gray-800">{admin.active_days}</p>
              </div>
            </div>

            {/* Actions */}
            {admin.role !== 'superadmin' && (
              <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                <Link
                  href={`/superadmin/admins/${admin.admin_id}/courses`}
                  className="flex items-center space-x-1 px-3 py-2 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-sm font-medium"
                >
                  <FiBookOpen />
                  <span>Courses</span>
                </Link>
                <button
                  onClick={() => handleToggleStatus(admin.admin_id, admin.account_status || 'active', admin.full_name)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    admin.account_status === 'active'
                      ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                      : 'text-green-600 bg-green-50 hover:bg-green-100'
                  }`}
                >
                  {admin.account_status === 'active' ? <FiToggleRight /> : <FiToggleLeft />}
                  <span>{admin.account_status === 'active' ? 'Disable' : 'Enable'}</span>
                </button>
                <button
                  onClick={() => handleDeleteAdmin(admin.admin_id, admin.full_name)}
                  className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  title="Deactivate Admin"
                >
                  <FiTrash2 />
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredAdmins.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-md">
            <FiUserCheck className="text-5xl mx-auto mb-3 opacity-50" />
            <p>No admins found</p>
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <CreateAdminModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchAdmins()
          }}
        />
      )}
    </div>
  )
}

// Create Admin Modal Component
function CreateAdminModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    assigned_school_id: '',
    assigned_school_name: '',
  })
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [schools, setSchools] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [error, setError] = useState('')

  // Fetch available courses and registered schools
  useEffect(() => {
    loadCourses()
    loadSchools()
  }, [])

  const loadSchools = async () => {
    try {
      const session = (await supabase.auth.getSession()).data.session
      const res = await fetch('/api/superadmin/schools', {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setSchools(data.data)
      }
    } catch (err) {
      console.warn('Could not load schools list for admin creation:', err)
    }
  }

  const loadCourses = async () => {
    try {
      // Call superadmin or admin courses API to get all courses
      const response = await fetch('/api/admin/courses', {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setCourses(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load courses:', err)
    } finally {
      setLoadingCourses(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Client-side validation
    if (!formData.full_name.trim()) {
      setError('Full name is required')
      return
    }

    if (!formData.email.trim()) {
      setError('Email is required')
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    if (!formData.password) {
      setError('Password is required')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    // Phone validation (if provided)
    if (formData.phone && formData.phone.trim()) {
      const digitsOnly = formData.phone.replace(/[\s+\-()]/g, '')
      
      if (digitsOnly.length < 10) {
        setError('Phone number must contain at least 10 digits')
        return
      }
      
      if (formData.phone.length > 20) {
        setError('Phone number must be 20 characters or less (including formatting)')
        return
      }
      
      const phoneRegex = /^[\d\s+\-()]+$/
      if (!phoneRegex.test(formData.phone)) {
        setError('Phone number can only contain digits, spaces, +, -, and ()')
        return
      }
    }

    setLoading(true)

    try {
      // First create the admin
      const response = await superadminAPI.createAdmin(formData)
      
      if (response.success) {
        console.log('✅ Admin created successfully:', response.data)
        
        // If courses are selected, assign them to the new admin
        if (selectedCourses.length > 0 && response.data?.id) {
          console.log('📚 Assigning courses to admin:', response.data.id, selectedCourses)
          const assignResponse = await superadminAPI.assignCourses(response.data.id, selectedCourses)
          console.log('📚 Course assignment response:', assignResponse)
          
          if (!assignResponse.success) {
            console.warn('⚠️ Failed to assign courses:', assignResponse.error)
            alert('Admin created but course assignment failed. You can assign courses later.')
          } else {
            console.log('✅ Courses assigned successfully')
            alert(`Admin created and courses assigned successfully!\nLogin credentials have been emailed to ${formData.email}.`)
          }
        } else {
          console.log('ℹ️ No courses selected or admin ID missing')
          alert(`Admin created successfully!\nLogin credentials have been emailed to ${formData.email}.`)
        }
        
        onSuccess()
      } else {
        setError(response.error || 'Failed to create admin')
      }
    } catch (err: any) {
      console.error('Create admin error:', err)
      setError(err.message || 'An error occurred while creating admin')
    } finally {
      setLoading(false)
    }
  }

  const toggleCourse = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 px-4 sm:px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Create New Admin</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={100}
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
                placeholder="John Doe"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 3 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                pattern="[\d\s+\-()]+"
                maxLength={20}
                value={formData.phone}
                onChange={(e) => {
                  // Allow only digits, spaces, +, -, ()
                  const sanitized = e.target.value.replace(/[^\d\s+\-()]/g, '')
                  // Limit to 20 characters
                  if (sanitized.length <= 20) {
                    setFormData({ ...formData, phone: sanitized })
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
                placeholder="+91 98765 43210"
              />
              <p className="text-xs text-gray-500 mt-1">Optional • Max 20 chars • Min 10 digits • Format: +91 98765 43210</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
              placeholder="admin@example.com"
            />
            <p className="text-xs text-gray-500 mt-1">Must be a valid email address</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              maxLength={50}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
              placeholder="Minimum 6 characters"
            />
            <p className="text-xs text-gray-500 mt-1">At least 6 characters required</p>
          </div>

          {/* School Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign to Partner School / Institution (Optional)
            </label>
            <select
              value={formData.assigned_school_id}
              onChange={(e) => {
                const selectedId = e.target.value
                const foundSchool = schools.find((s: any) => s.school_id === selectedId || s.id === selectedId)
                setFormData({
                  ...formData,
                  assigned_school_id: selectedId,
                  assigned_school_name: foundSchool ? foundSchool.name : '',
                })
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent bg-white text-sm"
            >
              <option value="">-- None (Central Faculty / General Admin) --</option>
              {schools.map((school: any) => (
                <option key={school.id || school.school_id} value={school.school_id || school.id}>
                  {school.name} ({school.school_id})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              This admin will be assigned as the designated partner coordinator for this school.
            </p>
          </div>

          {/* Course Assignment */}
          <div className="border-t pt-4 mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Courses (Faculty Responsibility)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Select which courses this admin will be responsible for teaching
            </p>
            
            {loadingCourses ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C81E4E] mx-auto"></div>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                No courses available. Create courses first.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                {courses.map((course) => (
                  <label
                    key={course.id}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course.id)}
                      onChange={() => toggleCourse(course.id)}
                      className="w-4 h-4 text-[#C81E4E] focus:ring-[#C81E4E] border-gray-300 rounded"
                    />
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{course.title}</p>
                      <p className="text-xs text-gray-500">{course.level} • {course.duration_weeks} weeks</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {selectedCourses.length} course(s) selected
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}
