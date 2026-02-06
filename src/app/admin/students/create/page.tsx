'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiX, FiMail, FiUser, FiBook } from 'react-icons/fi'

export default function CreateStudentPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    course: '',
    role: 'student',
    autoGeneratePassword: true,
    customPassword: ''
  })
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const password = formData.autoGeneratePassword ? generatePassword() : formData.customPassword
    setGeneratedPassword(password)

    // TODO: Implement actual student creation with Supabase Auth
    setTimeout(() => {
      setLoading(false)
      alert(`Student created successfully!\n\nEmail: ${formData.email}\nPassword: ${password}\n\nCredentials have been sent to the student's email.`)
    }, 1500)
  }

  const copyCredentials = () => {
    const credentials = `Email: ${formData.email}\nPassword: ${generatedPassword}`
    navigator.clipboard.writeText(credentials)
    alert('Credentials copied to clipboard!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Create New Student</h1>
          <p className="text-gray-600 mt-1">Add a new student to the LMS system</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all flex items-center space-x-2"
        >
          <FiX className="text-xl" />
          <span>Cancel</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8">
        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <FiUser className="text-[#C81E4E]" />
              <span>Personal Information</span>
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="input-field"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="input-field"
                  placeholder="Enter last name"
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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
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
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          {/* Course Assignment */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <FiBook className="text-[#C81E4E]" />
              <span>Course Assignment</span>
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Course <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select a course</option>
                  <option value="web-dev">Web Development</option>
                  <option value="data-science">Data Science</option>
                  <option value="mobile-dev">Mobile App Development</option>
                  <option value="ui-ux">UI/UX Design</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-field"
                >
                  <option value="student">Student</option>
                  <option value="mentor">Mentor</option>
                </select>
              </div>
            </div>
          </div>

          {/* Password Settings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <FiMail className="text-[#C81E4E]" />
              <span>Password & Access</span>
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="autoPassword"
                  checked={formData.autoGeneratePassword}
                  onChange={(e) => setFormData({ ...formData, autoGeneratePassword: e.target.checked })}
                  className="w-5 h-5 text-[#C81E4E] border-gray-300 rounded focus:ring-[#C81E4E]"
                />
                <label htmlFor="autoPassword" className="text-gray-700 font-medium">
                  Auto-generate secure password
                </label>
              </div>

              {!formData.autoGeneratePassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Password
                  </label>
                  <input
                    type="text"
                    value={formData.customPassword}
                    onChange={(e) => setFormData({ ...formData, customPassword: e.target.value })}
                    className="input-field"
                    placeholder="Enter custom password"
                  />
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Login credentials will be automatically sent to the student's email address.
                </p>
              </div>
            </div>
          </div>

          {/* Generated Credentials Display */}
          {generatedPassword && (
            <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6">
              <h3 className="text-lg font-bold text-green-800 mb-4">✅ Student Created Successfully!</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Email:</p>
                  <p className="font-mono font-semibold text-gray-800">{formData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Password:</p>
                  <p className="font-mono font-semibold text-gray-800">{generatedPassword}</p>
                </div>
                <button
                  type="button"
                  onClick={copyCredentials}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-medium"
                >
                  Copy Credentials
                </button>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Student'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
