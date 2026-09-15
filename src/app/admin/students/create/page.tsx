'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiX, FiMail, FiUser, FiPhone, FiEye, FiEyeOff, FiCopy, FiCheck } from 'react-icons/fi'
import { studentsAPI, coursesAPI } from '@/lib/api'

// Generate secure password
function generatePassword() {
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
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

export default function CreateStudentPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: ''
  })
  const [courses, setCourses] = useState<any[]>([])
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successData, setSuccessData] = useState<any>(null)
  const [copiedField, setCopiedField] = useState('')

  // Generate password on component mount
  useEffect(() => {
    setFormData(prev => ({ ...prev, password: generatePassword() }))
    
    // Fetch all courses on mount
    const fetchAllCourses = async () => {
      try {
        const json = await coursesAPI.getAll() // Fetch ALL courses
        if (json.success && Array.isArray(json.data)) {
          setCourses(json.data)
        }
      } catch (err) {
        console.warn('Could not fetch courses', err)
      }
    }
    
    fetchAllCourses()
  }, [])



  const handleGeneratePassword = () => {
    setFormData(prev => ({ ...prev, password: generatePassword() }))
  }

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(''), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate full name - only letters, spaces, hyphens, apostrophes
    if (!formData.full_name.trim()) {
      setError('Full name is required')
      setLoading(false)
      return
    }

    if (!/^[a-zA-Z\s'-]+$/.test(formData.full_name.trim())) {
      setError('Full name should only contain letters, spaces, hyphens and apostrophes')
      setLoading(false)
      return
    }

    // Validate email
    if (!formData.email.trim()) {
      setError('Email is required')
      setLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    // Validate phone if provided
    if (formData.phone && !/^[0-9\s+()-]+$/.test(formData.phone)) {
      setError('Phone number should only contain numbers and +, -, (, ) characters')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      // Create student with explicit password
      const response = await studentsAPI.create({
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        password: formData.password,
        course_ids: selectedCourseIds.length ? selectedCourseIds : undefined
      })
      
      if (response.success) {
        // Show success with credentials
        setSuccessData({
          studentId: response.data?.id || 'N/A',
          email: formData.email,
          password: formData.password,
          fullName: formData.full_name
        })
      } else {
        setError(response.error || 'Failed to create student')
        console.error('Student creation error:', response)
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error creating student'
      setError(errorMsg)
      console.error('Student creation exception:', err)
    } finally {
      setLoading(false)
    }
  }

  // Success screen
  if (successData) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="text-white text-3xl" />
            </div>
            <h1 className="text-3xl font-bold text-green-800 mb-2">Student Created Successfully!</h1>
            <p className="text-green-700 mb-6">Share the credentials below with the student to login</p>
          </div>
        </div>

        {/* Credentials Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border-2 border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Student Login Credentials</h2>
          
          <div className="space-y-6">
            {/* Student Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={successData.fullName}
                  readOnly
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 font-medium"
                />
                <button
                  onClick={() => handleCopy(successData.fullName, 'name')}
                  className="px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                  title="Copy"
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
                  value={successData.email}
                  readOnly
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 font-medium"
                />
                <button
                  onClick={() => handleCopy(successData.email, 'email')}
                  className="px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                  title="Copy"
                >
                  {copiedField === 'email' ? <FiCheck className="text-green-600" /> : <FiCopy />}
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Temporary Password</label>
              <div className="flex items-center space-x-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={successData.password}
                  readOnly
                  className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 font-medium font-mono text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all shrink-0"
                  title={showPassword ? 'Hide' : 'Show'}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(successData.password, 'password')}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all shrink-0"
                  title="Copy"
                >
                  {copiedField === 'password' ? <FiCheck className="text-green-600" /> : <FiCopy />}
                </button>
              </div>
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={successData.studentId}
                  readOnly
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 font-medium font-mono"
                />
                <button
                  onClick={() => handleCopy(successData.studentId, 'id')}
                  className="px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                  title="Copy"
                >
                  {copiedField === 'id' ? <FiCheck className="text-green-600" /> : <FiCopy />}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Important:</strong> Share these credentials with the student. They should change their password on first login.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <button
            onClick={() => router.push('/admin/students')}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg font-semibold hover:shadow-lg transition-all text-center"
          >
            Go to Students List
          </button>
          <button
            onClick={() => {
              setSuccessData(null)
              setFormData({ full_name: '', email: '', phone: '', password: generatePassword() })
              setError('')
              setSelectedCourseIds([])
            }}
            className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all text-center"
          >
            Create Another Student
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Create New Student</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Add a new student to the LMS system - Login credentials will be generated automatically</p>
        </div>
        <button
          onClick={() => router.back()}
          className="self-start sm:self-auto px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all flex items-center space-x-2"
        >
          <FiX className="text-xl" />
          <span>Cancel</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-4 sm:p-6 md:p-8">
        <div className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Personal Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <FiUser className="text-[#C81E4E]" />
              <span>Student Information</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => {
                    // Only allow letters, spaces, hyphens, and apostrophes in names
                    const value = e.target.value.replace(/[^a-zA-Z\s'-]/g, '')
                    setFormData({ ...formData, full_name: value })
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
                  placeholder="Enter student's full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase().trim() })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
                  placeholder="student@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    // Only allow numbers, spaces, hyphens, parentheses and plus sign
                    const value = e.target.value.replace(/[^0-9\s+()-]/g, '')
                    setFormData({ ...formData, phone: value })
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          {/* Enroll in Courses (domain filtered) */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <FiUser className="text-[#C81E4E]" />
              <span>Enroll in Courses (optional)</span>
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">Select courses to enroll this student</p>
              {courses.length === 0 ? (
                <p className="text-sm text-gray-500">No courses available.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {courses.map((c: any) => (
                    <label key={c.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedCourseIds.includes(c.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedCourseIds(prev => [...prev, c.id])
                          else setSelectedCourseIds(prev => prev.filter(id => id !== c.id))
                        }}
                      />
                      <span className="text-sm text-gray-700">{c.title}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Login Credentials */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <FiMail className="text-[#C81E4E]" />
              <span>Login Credentials</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temporary Password (Auto-generated)
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1 min-w-0">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      readOnly
                      className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-gray-800 text-sm sm:text-base focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-all"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="w-full sm:w-auto px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all font-medium whitespace-nowrap flex items-center justify-center space-x-1.5 shadow-sm shrink-0"
                  >
                    <span>Regenerate</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <p className="text-sm text-blue-800">
              <strong>✓ Student Account Details:</strong>
            </p>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>Student will be created with active status</li>
              <li>Login credentials will be generated automatically</li>
              <li>Email address is used as username for login</li>
              <li>Temporary password is shown on success - must be changed on first login</li>
              <li>All data will be stored in Supabase database</li>
            </ul>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 text-center"
            >
              {loading ? 'Creating...' : 'Create Student'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
