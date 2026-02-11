'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { settingsAPI } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { FiUser, FiLock, FiBell, FiMail, FiSettings as FiSettingsIcon } from 'react-icons/fi'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Admin Profile', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'email', label: 'Email Templates', icon: FiMail },
    { id: 'system', label: 'System Settings', icon: FiSettingsIcon },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">Manage system configuration and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="text-xl" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-md p-6">
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
    }
  }

  const handleCancel = () => {
    setAvatarFile(null)
    setPreview(null)
  }

  const handleSave = async () => {
    try {
      setLoading(true)

      let uploadedUrl = avatarUrl
      if (avatarFile) {
        const up = await settingsAPI.uploadAvatar(avatarFile)
        if (up?.success && up.data?.url) {
          uploadedUrl = up.data.url
        } else if (up?.url) {
          uploadedUrl = up.url
        } else {
          console.warn('Avatar upload returned unexpected response', up)
        }
      }

      const payload: any = { full_name: fullName, email, phone }
      if (uploadedUrl) payload.profile_image_url = uploadedUrl

      const res = await settingsAPI.updateProfile(payload)
      if (res?.success) {
        alert('Profile updated successfully')
        setAvatarFile(null)
        setPreview(null)
        setAvatarUrl(uploadedUrl)
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Admin Profile</h2>

      <div className="flex items-center space-x-6">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="avatar preview" className="w-full h-full object-cover" />
          ) : avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="text-4xl font-bold text-gray-600">A</div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Change Avatar</label>
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <input type="text" value={role} className="input-field" readOnly />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button className="btn-secondary" onClick={handleCancel} disabled={loading}>Cancel</button>
        <button className="btn-primary" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Security Settings</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold text-gray-800 mb-4">Two-Factor Authentication</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-700">Enable 2FA for extra security</p>
            <p className="text-sm text-gray-500 mt-1">Recommended for admin accounts</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C81E4E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#C81E4E]"></div>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary" onClick={handleUpdatePassword} disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button>
      </div>
    </div>
  )
}

function NotificationSettings() {
  const notifications = [
    { id: 'newStudent', label: 'New student registration', enabled: true },
    { id: 'taskSubmission', label: 'New task submission', enabled: true },
    { id: 'projectApproval', label: 'Project pending approval', enabled: true },
    { id: 'supportTicket', label: 'New support ticket', enabled: true },
    { id: 'certificateRequest', label: 'Certificate approval request', enabled: false },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Notification Preferences</h2>
      
      <div className="space-y-4">
        {notifications.map((notif) => (
          <div key={notif.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700">{notif.label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={notif.enabled} className="sr-only peer" />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C81E4E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#C81E4E]"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="btn-primary">Save Preferences</button>
      </div>
    </div>
  )
}

function EmailTemplates() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Email Templates</h2>
      
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800">Welcome Email</h3>
          <p className="text-sm text-gray-600 mt-1">Sent when a new student registers</p>
          <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
            Edit Template
          </button>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800">Password Reset</h3>
          <p className="text-sm text-gray-600 mt-1">Sent when password reset is requested</p>
          <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
            Edit Template
          </button>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800">Certificate Issued</h3>
          <p className="text-sm text-gray-600 mt-1">Sent when certificate is approved</p>
          <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
            Edit Template
          </button>
        </div>
      </div>
    </div>
  )
}

function SystemSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
          <input type="text" defaultValue="LMS Admin" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
          <input type="email" defaultValue="support@lms.com" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default Course Duration (weeks)</label>
          <input type="number" defaultValue="12" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Pass Percentage</label>
          <input type="number" defaultValue="80" className="input-field" />
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary">Save Settings</button>
      </div>
    </div>
  )
}
