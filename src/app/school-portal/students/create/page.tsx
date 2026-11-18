'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FiX,
  FiMail,
  FiUser,
  FiPhone,
  FiEye,
  FiEyeOff,
  FiCopy,
  FiCheck,
  FiRefreshCw,
  FiBookOpen,
  FiCheckCircle,
  FiArrowLeft,
  FiShield,
  FiAward,
  FiPrinter
} from 'react-icons/fi'
import { getSchoolClientAuthToken } from '@/lib/auth-helpers'

// Generate secure password
function generatePassword() {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'
  
  const allChars = uppercase + lowercase + numbers + symbols
  let password = ''
  
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
  password += numbers.charAt(Math.floor(Math.random() * numbers.length))
  password += symbols.charAt(Math.floor(Math.random() * symbols.length))
  
  for (let i = password.length; i < 12; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length))
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

export default function SchoolCreateStudentPage() {
  const router = useRouter()
  const [schoolInfo, setSchoolInfo] = useState<any>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    parents_contact: '',
    class: '10th',
    password: ''
  })
  const [courses, setCourses] = useState<any[]>([])
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [error, setError] = useState('')
  const [successData, setSuccessData] = useState<any>(null)
  const [copiedField, setCopiedField] = useState('')

  useEffect(() => {
    setFormData(prev => ({ ...prev, password: generatePassword() }))

    const loadData = async () => {
      try {
        const token = await getSchoolClientAuthToken()
        if (!token) {
          router.replace('/school-portal/login')
          return
        }

        // Fetch School Info
        const schoolRes = await fetch('/api/school/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const schoolData = await schoolRes.json()
        if (schoolData.success && schoolData.school) {
          setSchoolInfo(schoolData.school)
        }

        // Fetch Courses
        const coursesRes = await fetch('/api/school/courses', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const coursesData = await coursesRes.json()
        if (coursesData.success && Array.isArray(coursesData.data)) {
          setCourses(coursesData.data)
        }
      } catch (err) {
        console.warn('Data load warning:', err)
      } finally {
        setLoadingCourses(false)
      }
    }

    loadData()
  }, [router])

  const handleGeneratePassword = () => {
    setFormData(prev => ({ ...prev, password: generatePassword() }))
  }

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(''), 2000)
  }

  const toggleCourse = (courseId: string) => {
    setSelectedCourseIds(prev =>
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    )
  }

  const handleSelectAllCourses = () => {
    if (selectedCourseIds.length === courses.length) {
      setSelectedCourseIds([])
    } else {
      setSelectedCourseIds(courses.map(c => c.id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.full_name.trim()) {
      setError('Full name is required')
      setLoading(false)
      return
    }

    if (!formData.email.trim()) {
      setError('Student email is required for login')
      setLoading(false)
      return
    }

    try {
      const token = await getSchoolClientAuthToken()
      const res = await fetch('/api/school/students/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          course_ids: selectedCourseIds
        })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSuccessData({
          fullName: data.data.full_name,
          email: data.data.email,
          password: data.data.password,
          studentId: data.data.id,
          enrolledCourses: courses.filter(c => selectedCourseIds.includes(c.id)),
          schoolName: data.data.school_name
        })
      } else {
        setError(data.error || 'Failed to create student account')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while creating student')
    } finally {
      setLoading(false)
    }
  }

  // Success View - Credentials & Admission Card
  if (successData) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 sm:p-8 text-center relative">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
              <FiCheckCircle className="text-3xl text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">
              Admission & LMS Account Generated
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">Student Enrolled Successfully!</h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">
              Registered under <strong className="text-white">{successData.schoolName || schoolInfo?.name}</strong>
            </p>
          </div>

          {/* Credentials Card Body */}
          <div className="p-6 sm:p-8 space-y-5">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
              <span className="text-lg mt-0.5">⚠️</span>
              <div>
                <strong>Important Student Credentials:</strong> Please copy or print these credentials and share them with the student/parents. They can log in to the student portal using this Email & Password.
              </div>
            </div>

            <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-200">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Student Name
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={successData.fullName}
                    readOnly
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(successData.fullName, 'name')}
                    className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
                    title="Copy Name"
                  >
                    {copiedField === 'name' ? <FiCheck className="text-green-600" /> : <FiCopy />}
                  </button>
                </div>
              </div>

              {/* Email / Username */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Login Email (Username)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={successData.email}
                    readOnly
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-semibold text-gray-900 text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(successData.email, 'email')}
                    className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
                    title="Copy Email"
                  >
                    {copiedField === 'email' ? <FiCheck className="text-green-600" /> : <FiCopy />}
                  </button>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Generated Password
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={successData.password}
                    readOnly
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-purple-700 text-sm font-mono tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
                    title={showPassword ? 'Hide' : 'Show'}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(successData.password, 'password')}
                    className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
                    title="Copy Password"
                  >
                    {copiedField === 'password' ? <FiCheck className="text-green-600" /> : <FiCopy />}
                  </button>
                </div>
              </div>

              {/* Enrolled Courses */}
              {successData.enrolledCourses && successData.enrolledCourses.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Enrolled LMS Courses ({successData.enrolledCourses.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {successData.enrolledCourses.map((c: any) => (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-xl text-xs font-semibold"
                      >
                        <FiBookOpen className="text-purple-600" />
                        {c.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto px-5 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <FiPrinter /> Print Admission Slip
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSuccessData(null)
                    setFormData({
                      full_name: '',
                      email: '',
                      phone: '',
                      parents_contact: '',
                      class: '10th',
                      password: generatePassword()
                    })
                    setSelectedCourseIds([])
                    setError('')
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all text-center"
                >
                  + Add Another Student
                </button>
                <Link
                  href="/school-portal/students"
                  className="w-full sm:w-auto px-5 py-2.5 bg-gray-900 text-white hover:bg-black rounded-xl text-xs font-bold transition-colors text-center"
                >
                  View Students
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/school-portal/students"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-xs"
        >
          <FiArrowLeft /> Back to Student Roster
        </Link>
        {schoolInfo && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-xl text-xs font-semibold text-purple-900">
            <FiShield className="text-purple-600" />
            <span>Enrolling under: <strong>{schoolInfo.name}</strong> ({schoolInfo.school_id})</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-gray-900 via-purple-950 to-gray-900 p-6 sm:p-8 text-white relative">
          <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest px-2.5 py-1 bg-white/10 rounded-full border border-white/10">
            School Partner Access
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">Create Student & Course Enrollment</h1>
          <p className="text-xs sm:text-sm text-purple-200 mt-1">
            Register students from your institution, generate instant login credentials, and enroll them into selected LMS courses.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-semibold flex items-center justify-between">
              <span>{error}</span>
              <button type="button" onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                <FiX />
              </button>
            </div>
          )}

          {/* Student Personal Info */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <FiUser className="text-[#FF2D8D]" /> 1. Student Personal Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-3.5 text-gray-400 text-sm" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aman Sharma"
                    value={formData.full_name}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#FF2D8D] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Student Email (Login ID) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-3.5 text-gray-400 text-sm" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. student@gmail.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#FF2D8D] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Student Phone
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-3.5 text-gray-400 text-sm" />
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#FF2D8D] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Parents / Guardian Contact
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-3.5 text-gray-400 text-sm" />
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 00000"
                    value={formData.parents_contact}
                    onChange={e => setFormData({ ...formData, parents_contact: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#FF2D8D] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Class / Grade
                </label>
                <select
                  value={formData.class}
                  onChange={e => setFormData({ ...formData, class: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#FF2D8D] focus:border-transparent outline-none bg-white"
                >
                  <option value="6th">Class 6th</option>
                  <option value="7th">Class 7th</option>
                  <option value="8th">Class 8th</option>
                  <option value="9th">Class 9th</option>
                  <option value="10th">Class 10th</option>
                  <option value="11th">Class 11th</option>
                  <option value="12th">Class 12th</option>
                  <option value="Undergraduate">Undergraduate / College</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Password Generator */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Generated Password <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] font-bold text-[#FF2D8D] hover:underline flex items-center gap-1"
                  >
                    <FiRefreshCw className="text-[10px]" /> Regenerate
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-mono tracking-wider focus:ring-2 focus:ring-[#FF2D8D] focus:border-transparent outline-none bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2.5 border border-gray-300 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Course Selection */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <FiBookOpen className="text-[#9C27FF]" /> 2. Select LMS Courses to Enroll (Optional)
              </h3>
              {courses.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllCourses}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 self-start sm:self-auto"
                >
                  {selectedCourseIds.length === courses.length ? 'Deselect All' : 'Select All Courses'}
                </button>
              )}
            </div>

            {loadingCourses ? (
              <div className="p-8 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                Loading available LMS courses...
              </div>
            ) : courses.length === 0 ? (
              <div className="p-6 bg-gray-50 rounded-2xl text-center text-gray-500 text-xs">
                No active courses available right now. Student will be created without course enrollment.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-1">
                {courses.map(course => {
                  const isSelected = selectedCourseIds.includes(course.id)
                  return (
                    <div
                      key={course.id}
                      onClick={() => toggleCourse(course.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/70 shadow-xs ring-2 ring-purple-400/30'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && <FiCheck className="text-xs" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate">{course.title}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                          {course.description || 'Interactive online course'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {course.level && (
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                              {course.level}
                            </span>
                          )}
                          {course.duration_weeks && (
                            <span className="text-[10px] text-gray-500">
                              {course.duration_weeks} Weeks
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <p className="text-[11px] text-gray-500 mt-2">
              Selected <strong>{selectedCourseIds.length}</strong> course(s) for instant enrollment.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Link
              href="/school-portal/students"
              className="px-5 py-2.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating Student Account...
                </>
              ) : (
                <>
                  <FiAward /> Create Student & Enroll
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
