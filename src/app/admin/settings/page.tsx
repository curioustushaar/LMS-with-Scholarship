'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { settingsAPI } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { FiUser, FiLock, FiBell, FiMail, FiSettings as FiSettingsIcon, FiPhone, FiAtSign, FiUpload, FiCamera, FiShield, FiGlobe, FiPercent, FiClock, FiMenu, FiX } from 'react-icons/fi'

// Helper function to get valid token from Supabase session
async function getValidToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.access_token) {
      return session.access_token
    }
    
    // Fallback to localStorage check
    const token = localStorage.getItem('supabase.auth.token') || localStorage.getItem('token')
    if (token && token !== 'null' && token !== 'undefined' && token.length > 20) {
      return token
    }
    
    console.warn('⚠️ No valid token found.')
    return null
  } catch (error) {
    console.error('Error getting token:', error)
    return null
  }
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const tabs = [
    { id: 'profile', label: 'Admin Profile', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'email', label: 'Email Templates', icon: FiMail },
    { id: 'system', label: 'System Settings', icon: FiSettingsIcon },
  ]

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    setIsSidebarOpen(false) // Close sidebar on mobile after selection
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Mobile Menu Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600 mt-1">Manage system configuration and preferences</p>
        </div>
        
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Tabs Navigation */}
        <div className={`
          bg-white rounded-xl shadow-md p-4 h-fit
          lg:sticky lg:top-6
          fixed lg:relative top-0 left-0 z-50
          w-72 lg:w-auto
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between mb-4 pb-4 border-b">
            <h2 className="font-bold text-gray-800 text-lg">Menu</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <FiX className="text-xl text-gray-600" />
            </button>
          </div>

          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-left ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white font-semibold shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                }`}
              >
                <tab.icon className="text-xl flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-md p-6 md:p-8">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'email' && <EmailTemplates />}
          {activeTab === 'system' && <SystemSettings />}
        </div>
      </div>
    </div>
  )
}

function ProfileSettings() {
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [directUrl, setDirectUrl] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const res: any = await settingsAPI.getProfile()
        if (res?.success && mounted) {
          const p = res.data
          setFullName(p?.full_name || '')
          setEmail(p?.email || '')
          setPhone(p?.phone || '')
          setRole(p?.role || '')
          setAvatarUrl(p?.profile_image_url || null)
        }
      } catch (e) {
        console.error('Failed to load profile', e)
      } finally {
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setAvatarFile(f)
    if (f) {
      setPreview(URL.createObjectURL(f))
      setDirectUrl('') // Clear direct URL when file is selected
    }
  }

  const handleDirectUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setDirectUrl(url)
    if (url) {
      setPreview(url)
      setAvatarFile(null) // Clear file when URL is provided
    }
  }

  const handleCancel = () => {
    setAvatarFile(null)
    setPreview(null)
    setDirectUrl('')
  }

  const handleSave = async () => {
    try {
      setLoading(true)

      let uploadedUrl = avatarUrl
      
      // If direct URL is provided, use it
      if (directUrl && directUrl.trim()) {
        uploadedUrl = directUrl.trim()
      } 
      // Otherwise, if a file is selected, upload it
      else if (avatarFile) {
        const up = await settingsAPI.uploadAvatar(avatarFile)
        if (up?.success && up.data?.url) {
          uploadedUrl = up.data.url
        } else if (up?.url) {
          uploadedUrl = up.url
        } else {
          // Upload failed - show error and don't continue
          const errorMsg = up?.error || 'Avatar upload failed. Please try again or use direct URL.'
          alert(errorMsg)
          setLoading(false)
          return // Don't proceed with save if upload failed
        }
      }

      const payload: any = { full_name: fullName, email, phone }
      if (uploadedUrl) payload.profile_image_url = uploadedUrl

      const res = await settingsAPI.updateProfile(payload)
      if (res?.success) {
        alert('Profile updated successfully')
        // Only clear preview/file on successful save
        setAvatarFile(null)
        setPreview(null)
        setDirectUrl('')
        // Use the profile_image_url from response
        if (res.data?.profile_image_url) {
          setAvatarUrl(res.data.profile_image_url)
        }
        // Notify other components (Topbar) in same tab
        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('profile:updated', { detail: { profile: res.data } }))
            // Also set localStorage key to notify other tabs
            localStorage.setItem('profile-updated', String(Date.now()))
          }
        } catch (e) {
          // ignore
        }
      } else {
        alert('Failed to update profile: ' + (res?.error || 'unknown'))
      }
    } catch (err: any) {
      console.error('Save error', err)
      alert('Save failed: ' + (err?.message || err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Admin Profile</h2>
        <p className="text-gray-600 mt-1">Manage your personal information and profile picture</p>
      </div>

      {/* Avatar Section */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-100">
        <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center">
          <FiCamera className="mr-2" /> Profile Picture
        </label>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center shadow-lg border-4 border-white">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="avatar preview" className="w-full h-full object-cover" />
              ) : avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="text-5xl font-bold text-white">A</div>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
              <FiUpload className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-2xl" />
            </div>
          </div>

          <div className="flex-1 w-full space-y-4">
            <div className="text-center sm:text-left">
              <label className="inline-block">
                <span className="px-6 py-3 bg-white border-2 border-pink-500 text-pink-600 rounded-lg font-semibold cursor-pointer hover:bg-pink-50 transition-all inline-flex items-center gap-2">
                  <FiUpload /> Choose Image
                </span>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
              <p className="text-sm text-gray-600 mt-3">PNG, JPG or JPEG (max. 5MB)</p>
              <p className="text-xs text-gray-500 mt-1">Recommended: 400x400px square image</p>
            </div>

            {/* OR Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-sm text-gray-500 font-semibold">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Direct URL Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FiGlobe className="mr-2 text-pink-500" /> Direct Image URL
              </label>
              <input 
                type="url" 
                value={directUrl} 
                onChange={handleDirectUrlChange} 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none" 
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">Paste a direct image URL from the web</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <FiUser className="mr-2 text-pink-500" /> Full Name
          </label>
          <div className="relative">
            <input 
              type="text" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none" 
              placeholder="Enter your full name"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <FiAtSign className="mr-2 text-pink-500" /> Email Address
          </label>
          <div className="relative">
            <input 
              type="email" 
              value={email} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed" 
              readOnly
              placeholder="admin@example.com"
            />
            <span className="absolute right-3 top-3 text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full font-semibold">Read-only</span>
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <FiPhone className="mr-2 text-pink-500" /> Phone Number
          </label>
          <div className="relative">
            <input 
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none" 
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <FiShield className="mr-2 text-pink-500" /> Role
          </label>
          <div className="relative">
            <input 
              type="text" 
              value={role} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed" 
              readOnly 
              placeholder="Admin"
            />
            <span className="absolute right-3 top-3 text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full font-semibold">Read-only</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
        <button 
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={handleCancel} 
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          className="px-6 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={handleSave} 
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

function SecuritySettings() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match')
      return
    }

    try {
      setLoading(true)
      const res: any = await settingsAPI.changePassword(currentPassword, newPassword)
      if (res?.success) {
        alert('Password updated. You will be logged out; please login with your new password.')
        // sign out current session
        try {
          await supabase.auth.signOut()
        } catch (e) {
          console.warn('Sign out failed locally', e)
        }
        router.push('/login')
      } else {
        alert('Failed to update password: ' + (res?.error || 'unknown'))
      }
    } catch (err: any) {
      console.error('Password update error', err)
      alert('Password update failed: ' + (err?.message || err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Security Settings</h2>
        <p className="text-gray-600 mt-1">Manage your password and account security</p>
      </div>

      {/* Change Password Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h3 className="font-semibold text-gray-800 mb-1 flex items-center">
          <FiLock className="mr-2 text-blue-600" /> Change Password
        </h3>
        <p className="text-sm text-gray-600 mb-6">Choose a strong password to protect your account</p>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
            <input 
              type="password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white" 
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white" 
              placeholder="Enter new password (min. 6 characters)"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white" 
              placeholder="Confirm new password"
            />
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication Section */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
        <h3 className="font-semibold text-gray-800 mb-1 flex items-center">
          <FiShield className="mr-2 text-green-600" /> Two-Factor Authentication
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
          <div className="flex-1">
            <p className="text-gray-700 font-medium">Enable 2FA for extra security</p>
            <p className="text-sm text-gray-600 mt-1">Add an additional layer of protection to your account</p>
            <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">
              Recommended for admin accounts
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-4 border-t">
        <button 
          className="px-6 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={handleUpdatePassword} 
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </div>
  )
}

function NotificationSettings() {
  const [loading, setLoading] = useState(false)
  const [prefs, setPrefs] = useState({
    new_student_registration: true,
    new_task_submission: true,
    project_pending_approval: true,
    new_support_ticket: true,
    certificate_approval_request: true,
  })

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      const token = await getValidToken()
      if (!token) return
      const response = await fetch('/api/admin/settings/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await response.json()
      if (result.success && result.data) {
        setPrefs({
          new_student_registration: result.data.new_student_registration ?? true,
          new_task_submission: result.data.new_task_submission ?? true,
          project_pending_approval: result.data.project_pending_approval ?? true,
          new_support_ticket: result.data.new_support_ticket ?? true,
          certificate_approval_request: result.data.certificate_approval_request ?? true,
        })
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const token = await getValidToken()
      if (!token) {
        alert('Please log in to save preferences.')
        return
      }
      const response = await fetch('/api/admin/settings/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(prefs)
      })
      const result = await response.json()
      if (result.success) {
        alert('Notification preferences saved successfully!')
      } else {
        alert('Failed to save preferences: ' + result.error)
      }
    } catch (error: any) {
      alert('Error saving preferences: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const notifications = [
    { key: 'new_student_registration', label: 'New student registration' },
    { key: 'new_task_submission', label: 'New task submission' },
    { key: 'project_pending_approval', label: 'Project pending approval' },
    { key: 'new_support_ticket', label: 'New support ticket' },
    { key: 'certificate_approval_request', label: 'Certificate approval request' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Notification Preferences</h2>
      
      <div className="space-y-4">
        {notifications.map((notif) => (
          <div key={notif.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700">{notif.label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={prefs[notif.key as keyof typeof prefs]} 
                onChange={(e) => setPrefs({ ...prefs, [notif.key]: e.target.checked })}
                className="sr-only peer" 
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C81E4E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#C81E4E]"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  )
}

function EmailTemplates() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = await getValidToken()
      if (!token) {
        setError('Authentication required. Please log in.')
        return
      }
      const response = await fetch('/api/admin/settings/email-templates', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await response.json()
      if (result.success) {
        setTemplates(result.data || [])
      } else {
        setError(result.error || 'Failed to load templates')
      }
    } catch (error: any) {
      console.error('Failed to load templates:', error)
      setError('Database tables not created. Please run create-settings-tables.sql in Supabase.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (template: any) => {
    setEditingTemplate({ ...template })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!editingTemplate) return
    try {
      setLoading(true)
      const token = await getValidToken()
      if (!token) {
        alert('Please log in to save template.')
        setLoading(false)
        return
      }
      const response = await fetch('/api/admin/settings/email-templates', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          template_name: editingTemplate.template_name,
          subject: editingTemplate.subject,
          bodyText: editingTemplate.body
        })
      })
      const result = await response.json()
      if (result.success) {
        alert('Template updated successfully!')
        setShowModal(false)
        loadTemplates()
      } else {
        alert('Failed to update template: ' + result.error)
      }
    } catch (error: any) {
      alert('Error updating template: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Email Templates</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 mb-4">{error}</p>
          <p className="text-sm text-gray-600 mb-4">
            Run the following SQL file in your Supabase SQL Editor:
          </p>
          <code className="bg-white px-4 py-2 rounded text-sm text-red-600 border">
            create-settings-tables.sql
          </code>
          <button 
            onClick={loadTemplates}
            className="mt-4 px-4 py-2 bg-[#C81E4E] text-white rounded-lg hover:bg-[#D91E5B]"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Email Templates</h2>
      
      {templates.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No email templates found. Please run the database migration.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
          <div key={template.id} className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 capitalize">{template.template_name.replace(/_/g, ' ')}</h3>
            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            <button 
              onClick={() => handleEdit(template)}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
            >
              Edit Template
            </button>
          </div>
        ))}
        </div>
      )}

      {showModal && editingTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Email Template</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={editingTemplate.subject || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Body</label>
                <textarea
                  value={editingTemplate.body || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                  rows={10}
                  className="input-field font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Variables: &#123;&#123;platform_name&#125;&#125;, &#123;&#123;student_name&#125;&#125;, &#123;&#123;user_name&#125;&#125;, &#123;&#123;course_name&#125;&#125;, &#123;&#123;reset_link&#125;&#125;, &#123;&#123;certificate_link&#125;&#125;
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg hover:shadow-lg"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SystemSettings() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    platform_name: 'LMS Admin',
    support_email: 'support@lms.com',
    default_course_duration: '12',
    certificate_pass_percentage: '80'
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const token = await getValidToken()
      if (!token) return
      const response = await fetch('/api/admin/settings/system', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await response.json()
      if (result.success && result.data) {
        setSettings({
          platform_name: result.data.platform_name || 'LMS Admin',
          support_email: result.data.support_email || 'support@lms.com',
          default_course_duration: result.data.default_course_duration || '12',
          certificate_pass_percentage: result.data.certificate_pass_percentage || '80'
        })
      }
    } catch (error) {
      console.error('Failed to load system settings:', error)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const token = await getValidToken()
      if (!token) {
        alert('Please log in to save settings.')
        return
      }
      const response = await fetch('/api/admin/settings/system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      })
      const result = await response.json()
      if (result.success) {
        alert('System settings saved successfully!')
      } else {
        alert('Failed to save settings: ' + result.error)
      }
    } catch (error: any) {
      alert('Error saving settings: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
        <p className="text-gray-600 mt-1">Configure platform-wide settings and defaults</p>
      </div>

      {/* Platform Settings */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <h3 className="font-semibold text-gray-800 mb-1 flex items-center">
          <FiGlobe className="mr-2 text-purple-600" /> Platform Configuration
        </h3>
        <p className="text-sm text-gray-600 mb-6">Basic platform information and branding</p>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Platform Name</label>
            <input 
              type="text" 
              value={settings.platform_name} 
              onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none bg-white" 
              placeholder="LMS Admin"
            />
            <p className="text-xs text-gray-500 mt-1">This name will appear in emails and certificates</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Support Email</label>
            <input 
              type="email" 
              value={settings.support_email} 
              onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none bg-white" 
              placeholder="support@lms.com"
            />
            <p className="text-xs text-gray-500 mt-1">Students will use this email for support inquiries</p>
          </div>
        </div>
      </div>

      {/* Course Settings */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
        <h3 className="font-semibold text-gray-800 mb-1 flex items-center">
          <FiClock className="mr-2 text-orange-600" /> Course Defaults
        </h3>
        <p className="text-sm text-gray-600 mb-6">Default settings for new courses</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Default Course Duration (weeks)</label>
            <div className="relative">
              <input 
                type="number" 
                value={settings.default_course_duration} 
                onChange={(e) => setSettings({ ...settings, default_course_duration: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none bg-white" 
                placeholder="12"
                min="1"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Standard duration for new courses</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FiPercent className="mr-1" /> Certificate Pass Percentage
            </label>
            <div className="relative">
              <input 
                type="number" 
                value={settings.certificate_pass_percentage} 
                onChange={(e) => setSettings({ ...settings, certificate_pass_percentage: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none bg-white" 
                placeholder="80"
                min="0"
                max="100"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum grade required for certification</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-4 border-t">
        <button 
          className="px-6 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={handleSave} 
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
