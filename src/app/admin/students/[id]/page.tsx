'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiEdit, FiLock, FiUnlock, FiRefreshCw, FiMail, FiPhone, FiCalendar } from 'react-icons/fi'

export default function StudentDetailPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'progress', label: 'Course Progress' },
    { id: 'tasks', label: 'Tasks & Submissions' },
    { id: 'project', label: 'Project' },
    { id: 'badges', label: 'Badges' },
    { id: 'certificate', label: 'Certificate' },
    { id: 'support', label: 'Support History' },
  ]

  // Mock student data
  const student = {
    id: params.id,
    name: 'Rajesh Kumar',
    email: 'rajesh@email.com',
    phone: '+91 98765 43210',
    course: 'Web Development',
    role: 'Student',
    status: 'Active',
    registrationDate: '2025-12-01',
    lastLogin: '2026-02-06 09:30 AM',
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/students" className="inline-flex items-center space-x-2 text-[#C81E4E] hover:text-[#D91E5B] font-medium">
        <FiArrowLeft />
        <span>Back to Students</span>
      </Link>

      {/* Student Header Card */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {student.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{student.name}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-4 py-1 text-sm font-medium rounded-full ${
                  student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {student.status}
                </span>
                <span className="px-4 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                  {student.role}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <FiMail className="text-[#C81E4E]" />
                  <span>{student.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiPhone className="text-[#C81E4E]" />
                  <span>{student.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiCalendar className="text-[#C81E4E]" />
                  <span>Registered: {student.registrationDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiCalendar className="text-[#C81E4E]" />
                  <span>Last Login: {student.lastLogin}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center space-x-2">
              <FiEdit />
              <span>Edit Profile</span>
            </button>
            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all flex items-center space-x-2">
              <FiRefreshCw />
              <span>Reset Password</span>
            </button>
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center space-x-2">
              <FiLock />
              <span>Block Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-4 border-[#C81E4E] text-[#C81E4E]'
                    : 'text-gray-600 hover:text-[#C81E4E]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && <ProfileTab student={student} />}
          {activeTab === 'progress' && <ProgressTab />}
          {activeTab === 'tasks' && <TasksTab />}
          {activeTab === 'project' && <ProjectTab />}
          {activeTab === 'badges' && <BadgesTab />}
          {activeTab === 'certificate' && <CertificateTab />}
          {activeTab === 'support' && <SupportTab />}
        </div>
      </div>
    </div>
  )
}

function ProfileTab({ student }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input 
            type="text" 
            value={student.name} 
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input 
            type="email" 
            value={student.email} 
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input 
            type="tel" 
            value={student.phone} 
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Course Assigned</label>
          <input 
            type="text" 
            value={student.course} 
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <select className="w-full px-4 py-3 border border-gray-300 rounded-lg">
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
          <select className="w-full px-4 py-3 border border-gray-300 rounded-lg">
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <button className="px-6 py-3 border-2 border-[#C81E4E] text-[#C81E4E] rounded-lg font-semibold hover:bg-[#C81E4E] hover:text-white transition-all">
          Cancel
        </button>
        <button className="px-6 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg font-semibold hover:shadow-lg transition-all">
          Save Changes
        </button>
      </div>
    </div>
  )
}

function ProgressTab() {
  const weeks = [
    { week: 1, title: 'Introduction to Web Development', videos: 12, completed: 12, locked: false, progress: 100 },
    { week: 2, title: 'HTML & CSS Fundamentals', videos: 15, completed: 15, locked: false, progress: 100 },
    { week: 3, title: 'JavaScript Basics', videos: 18, completed: 14, locked: false, progress: 78 },
    { week: 4, title: 'Advanced JavaScript', videos: 20, completed: 0, locked: true, progress: 0 },
  ]

  return (
    <div className="space-y-4">
      {weeks.map((week) => (
        <div key={week.week} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Week {week.week}: {week.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{week.completed} / {week.videos} videos completed</p>
            </div>
            <div className="flex items-center space-x-3">
              {week.locked ? (
                <span className="px-4 py-2 bg-red-100 text-red-800 text-sm font-medium rounded-lg flex items-center space-x-2">
                  <FiLock />
                  <span>Locked</span>
                </span>
              ) : (
                <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-lg flex items-center space-x-2">
                  <FiUnlock />
                  <span>Unlocked</span>
                </span>
              )}
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium">
                {week.locked ? 'Unlock Week' : 'Reset Progress'}
              </button>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] h-3 rounded-full transition-all"
              style={{ width: `${week.progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">{week.progress}% Complete</p>
        </div>
      ))}
    </div>
  )
}

function TasksTab() {
  const tasks = [
    { id: 1, title: 'Build a Portfolio Website', week: 2, submitted: '2026-01-15', status: 'Evaluated', marks: 95, feedback: 'Excellent work!' },
    { id: 2, title: 'JavaScript Calculator', week: 3, submitted: '2026-01-28', status: 'Evaluated', marks: 88, feedback: 'Good job, minor improvements needed.' },
    { id: 3, title: 'API Integration Task', week: 3, submitted: '2026-02-05', status: 'Pending', marks: null, feedback: null },
  ]

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
              <p className="text-sm text-gray-600 mt-1">Week {task.week} • Submitted: {task.submitted}</p>
              {task.feedback && (
                <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-3 rounded-lg">
                  <strong>Feedback:</strong> {task.feedback}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {task.marks !== null && (
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#C81E4E]">{task.marks}</p>
                  <p className="text-xs text-gray-600">/ 100</p>
                </div>
              )}
              <span className={`px-4 py-2 text-sm font-medium rounded-lg ${
                task.status === 'Evaluated' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {task.status}
              </span>
            </div>
          </div>
          {task.status === 'Pending' && (
            <div className="mt-4 flex space-x-3">
              <input 
                type="number" 
                placeholder="Enter marks (0-100)" 
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button className="px-6 py-2 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                Evaluate
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function ProjectTab() {
  const project = {
    title: 'E-Commerce Website',
    status: 'In Progress',
    progress: 65,
    milestones: [
      { id: 1, title: 'Project Setup', status: 'Completed', date: '2026-01-10' },
      { id: 2, title: 'UI Design', status: 'Completed', date: '2026-01-20' },
      { id: 3, title: 'Backend Development', status: 'In Progress', date: null },
      { id: 4, title: 'Testing & Deployment', status: 'Pending', date: null },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold">{project.title}</h2>
        <p className="mt-2">Status: {project.status}</p>
        <div className="mt-4 w-full bg-white/30 rounded-full h-4">
          <div
            className="bg-white h-4 rounded-full transition-all"
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
        <p className="mt-2 text-sm">{project.progress}% Complete</p>
      </div>

      <div className="space-y-4">
        {project.milestones.map((milestone) => (
          <div key={milestone.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-800">{milestone.title}</h4>
              {milestone.date && <p className="text-sm text-gray-600 mt-1">Completed: {milestone.date}</p>}
            </div>
            <span className={`px-4 py-2 text-sm font-medium rounded-lg ${
              milestone.status === 'Completed' ? 'bg-green-100 text-green-800' :
              milestone.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {milestone.status}
            </span>
          </div>
        ))}
      </div>

      <div className="flex space-x-3">
        <button className="flex-1 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all">
          Approve Project
        </button>
        <button className="flex-1 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all">
          Reject Project
        </button>
      </div>
    </div>
  )
}

function BadgesTab() {
  const badges = [
    { id: 1, name: 'Early Bird', description: 'Completed Week 1 on time', earned: true, date: '2025-12-08' },
    { id: 2, name: 'Task Master', description: 'Submitted 5 tasks', earned: true, date: '2026-01-15' },
    { id: 3, name: 'Perfect Score', description: 'Got 100% in a task', earned: false, date: null },
    { id: 4, name: 'Course Completer', description: 'Finished entire course', earned: false, date: null },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {badges.map((badge) => (
        <div 
          key={badge.id} 
          className={`border-2 rounded-lg p-6 ${
            badge.earned ? 'border-[#C81E4E] bg-red-50' : 'border-gray-300 bg-gray-50 opacity-60'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{badge.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
              {badge.earned && badge.date && (
                <p className="text-xs text-gray-500 mt-2">Earned on: {badge.date}</p>
              )}
            </div>
            <div className="text-4xl">
              {badge.earned ? '🏆' : '🔒'}
            </div>
          </div>
          {!badge.earned && (
            <button className="mt-4 w-full py-2 bg-[#C81E4E] text-white rounded-lg hover:bg-[#D91E5B] transition-all text-sm font-medium">
              Assign Badge Manually
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

function CertificateTab() {
  const certificate = {
    eligible: true,
    issued: true,
    certificateId: 'CERT-2026-001234',
    issueDate: '2026-02-01',
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 rounded-lg text-center">
        <div className="text-6xl mb-4">🎓</div>
        <h2 className="text-2xl font-bold">Certificate Status</h2>
        {certificate.issued ? (
          <>
            <p className="mt-4 text-lg">Certificate has been issued!</p>
            <p className="mt-2">Certificate ID: {certificate.certificateId}</p>
            <p className="text-sm mt-1">Issued on: {certificate.issueDate}</p>
          </>
        ) : (
          <p className="mt-4 text-lg">{certificate.eligible ? 'Eligible for certificate' : 'Not eligible yet'}</p>
        )}
      </div>

      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Eligibility Checklist</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Course completion</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">All tasks submitted</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Project approved</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Minimum 80% attendance</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">✓ Complete</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        {certificate.issued ? (
          <>
            <button className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all">
              Download Certificate
            </button>
            <button className="flex-1 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all">
              Reissue Certificate
            </button>
            <button className="flex-1 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all">
              Revoke Certificate
            </button>
          </>
        ) : (
          <button className="w-full py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg font-semibold hover:shadow-lg transition-all">
            Issue Certificate
          </button>
        )}
      </div>
    </div>
  )
}

function SupportTab() {
  const tickets = [
    { id: '#T-1234', subject: 'Unable to access Week 3 videos', status: 'Resolved', date: '2026-01-25', priority: 'High' },
    { id: '#T-1156', subject: 'Login issues', status: 'Resolved', date: '2026-01-10', priority: 'Medium' },
  ]

  return (
    <div className="space-y-4">
      {tickets.length > 0 ? (
        tickets.map((ticket) => (
          <div key={ticket.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{ticket.id}: {ticket.subject}</h3>
                <p className="text-sm text-gray-600 mt-1">Created: {ticket.date}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  ticket.priority === 'High' ? 'bg-red-100 text-red-800' :
                  ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {ticket.priority}
                </span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  ticket.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                  ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {ticket.status}
                </span>
                <Link 
                  href={`/admin/support/${ticket.id}`}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>No support tickets raised by this student</p>
        </div>
      )}
    </div>
  )
}
