'use client'

import { useState, useEffect } from 'react'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { 
  FiUser, 
  FiLock, 
  FiMail, 
  FiPhone, 
  FiCamera, 
  FiSave,
  FiShield,
  FiSettings as FiSettingsIcon,
} from 'react-icons/fi'

interface Profile {
  id: string
  email: string
  full_name: string
  phone: string | null
  profile_image_url: string | null
  role: string
}

export default function SuperadminSettings() {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  
  // Profile form
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState('')
  
  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        return
      }

      const response = await fetch('/api/superadmin/settings', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()
      
      if (result.success) {
        setProfile(result.data)
        setFullName(result.data.full_name || '')
        setEmail(result.data.email || '')
        setPhone(result.data.phone || '')
        setProfileImageUrl(result.data.profile_image_url || '')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate full name
    if (!fullName || fullName.trim().length === 0) {
      alert('❌ Full name is required')
      return
    }
    
    if (fullName.length > 100) {
      alert('❌ Full name must be less than 100 characters')
      return
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      alert('❌ Please enter a valid email address')
      return
    }
    
    // Validate phone (if provided)
    if (phone && phone.trim()) {
      // Remove all formatting characters to count digits
      const digitsOnly = phone.replace(/[\s+\-()]/g, '')
      
      if (digitsOnly.length < 10) {
        alert('❌ Phone number must contain at least 10 digits')
        return
      }
      
      if (phone.length > 20) {
        alert('❌ Phone number must be 20 characters or less (including formatting)')
        return
      }
      
      // Validate phone format (only digits, spaces, +, -, (), allowed)
      const phoneRegex = /^[\d\s+\-()]+$/
      if (!phoneRegex.test(phone)) {
        alert('❌ Phone number can only contain digits, spaces, +, -, and ()')
        return
      }
    }
    
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        alert('Please login again')
        return
      }

      const response = await fetch('/api/superadmin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          profile_image_url: profileImageUrl.trim() || null
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert('✅ Profile updated successfully!')
        fetchProfile()
      } else {
        alert('❌ Failed to update profile: ' + result.error)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('❌ An error occurred while updating profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      alert('❌ New passwords do not match!')
      return
    }

    if (newPassword.length < 6) {
      alert('❌ Password must be at least 6 characters long!')
      return
    }

    try {
      setLoading(true)
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        alert('❌ Failed to change password: ' + error.message)
      } else {
        alert('✅ Password changed successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      alert('❌ An error occurred while changing password')
    } finally {
      setLoading(false)
    }
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <FiSettingsIcon className="text-3xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">Superadmin Settings</h1>
            <p className="text-white/90">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white font-semibold shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiUser className="text-xl" />
              <span>Profile</span>
            </button>
            
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'security'
                  ? 'bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white font-semibold shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiLock className="text-xl" />
              <span>Security</span>
            </button>
          </nav>

          {/* Profile Card */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#C81E4E] to-[#D91E5B] rounded-full flex items-center justify-center mb-3">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <FiShield className="text-4xl text-white" />
                )}
              </div>
              <p className="font-semibold text-gray-900">{profile.full_name}</p>
              <p className="text-sm text-gray-500">{profile.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                👑 Superadmin
              </span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-6">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FiUser className="mr-3 text-[#C81E4E]" />
                Profile Information
              </h2>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Profile Image */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiCamera className="inline mr-2" />
                    Profile Image URL
                  </label>
                  <input
                    type="url"
                    value={profileImageUrl}
                    onChange={(e) => setProfileImageUrl(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="mt-1 text-xs text-gray-500">Enter a direct image URL</p>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiUser className="inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    maxLength={100}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                  <p className="mt-1 text-xs text-gray-500">Max 100 characters</p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiMail className="inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiPhone className="inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      // Sanitize input - only allow digits, spaces, +, -, ()
                      const sanitized = e.target.value.replace(/[^\d\s+\-()]/g, '')
                      // Limit to 20 characters
                      if (sanitized.length <= 20) {
                        setPhone(sanitized)
                      }
                    }}
                    maxLength={20}
                    pattern="[\d\s+\-()]+"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
                    placeholder="+91 1234567890"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Max 20 characters. Use digits, spaces, +, -, () only. Example: +91 98765 43210
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
                  >
                    <FiSave />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FiLock className="mr-3 text-[#C81E4E]" />
                Change Password
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiShield className="text-yellow-500 text-xl" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Security Note:</strong> Choose a strong password with at least 6 characters. 
                        After changing your password, you'll need to log in again.
                      </p>
                    </div>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiLock className="inline mr-2" />
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
                    placeholder="Enter new password (min. 6 characters)"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiLock className="inline mr-2" />
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
                    placeholder="Re-enter new password"
                  />
                </div>

                {/* Password Match Indicator */}
                {newPassword && confirmPassword && (
                  <div className={`text-sm ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                    {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPassword('')
                      setNewPassword('')
                      setConfirmPassword('')
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                    className="px-6 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
                  >
                    <FiLock />
                    <span>{loading ? 'Updating...' : 'Change Password'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
