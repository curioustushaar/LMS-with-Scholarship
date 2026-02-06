'use client'

import { useState } from 'react'
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
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Admin Profile</h2>
      
      <div className="flex items-center space-x-6">
        <div className="w-24 h-24 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] rounded-full flex items-center justify-center text-white text-4xl font-bold">
          A
        </div>
        <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all">
          Change Avatar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input type="text" defaultValue="Admin User" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input type="email" defaultValue="admin@lms.com" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input type="tel" defaultValue="+91 98765 43210" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <input type="text" defaultValue="Super Admin" className="input-field" readOnly />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button className="btn-secondary">Cancel</button>
        <button className="btn-primary">Save Changes</button>
      </div>
    </div>
  )
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Security Settings</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
          <input type="password" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <input type="password" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
          <input type="password" className="input-field" />
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
        <button className="btn-primary">Update Password</button>
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
