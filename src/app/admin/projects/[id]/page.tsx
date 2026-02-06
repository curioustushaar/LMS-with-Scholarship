'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiCheck, FiX, FiEdit, FiMessageSquare } from 'react-icons/fi'

export default function ProjectDetailPage() {
  const params = useParams()
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedback, setFeedback] = useState('')

  const project = {
    id: params.id,
    student: {
      id: 1,
      name: 'Priya Sharma',
      email: 'priya@email.com',
      course: 'Data Science'
    },
    title: 'Data Analytics Dashboard',
    description: 'Build a comprehensive data analytics dashboard using React and D3.js to visualize sales data',
    status: 'Pending Approval',
    progress: 100,
    startDate: '2026-01-01',
    submissionDate: '2026-02-05',
    mentor: 'Ananya Singh',
    githubUrl: 'https://github.com/priya/analytics-dashboard',
    liveUrl: 'https://analytics-dashboard.vercel.app',
    milestones: [
      { id: 1, title: 'Project Setup & Planning', status: 'Completed', completedDate: '2026-01-05', description: 'Initial setup and project structure' },
      { id: 2, title: 'UI/UX Design', status: 'Completed', completedDate: '2026-01-15', description: 'Complete design mockups and wireframes' },
      { id: 3, title: 'Frontend Development', status: 'Completed', completedDate: '2026-01-25', description: 'React components and UI implementation' },
      { id: 4, title: 'Data Visualization', status: 'Completed', completedDate: '2026-02-01', description: 'D3.js charts and graphs integration' },
      { id: 5, title: 'Testing & Deployment', status: 'Completed', completedDate: '2026-02-05', description: 'Final testing and production deployment' },
    ],
    deliverables: [
      { id: 1, name: 'Project Documentation', file: 'documentation.pdf', uploadedDate: '2026-02-05' },
      { id: 2, name: 'Source Code (GitHub)', file: 'github-link', uploadedDate: '2026-02-05' },
      { id: 3, name: 'Live Demo', file: 'vercel-deployment', uploadedDate: '2026-02-05' },
      { id: 4, name: 'Presentation Slides', file: 'presentation.pptx', uploadedDate: '2026-02-05' },
    ],
    previousFeedback: [
      { id: 1, mentor: 'Ananya Singh', date: '2026-01-20', message: 'Great progress on the UI design. The color scheme and layout look professional.' },
      { id: 2, mentor: 'Ananya Singh', date: '2026-02-01', message: 'Excellent work on the data visualization. The charts are clear and interactive.' },
    ]
  }

  const handleApprove = () => {
    if (confirm('Are you sure you want to approve this project?')) {
      // TODO: Update project status in database
      alert('Project approved successfully!')
    }
  }

  const handleReject = () => {
    if (feedback.trim() === '') {
      alert('Please provide feedback before rejecting the project.')
      return
    }
    if (confirm('Are you sure you want to reject this project?')) {
      // TODO: Update project status in database
      alert('Project rejected. Feedback sent to student.')
      setShowFeedbackModal(false)
    }
  }

  const handleAddFeedback = () => {
    if (feedback.trim() === '') {
      alert('Please enter your feedback.')
      return
    }
    // TODO: Save feedback to database
    alert('Feedback added successfully!')
    setFeedback('')
    setShowFeedbackModal(false)
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/projects" className="inline-flex items-center space-x-2 text-[#C81E4E] hover:text-[#D91E5B] font-medium">
        <FiArrowLeft />
        <span>Back to Projects</span>
      </Link>

      {/* Project Header */}
      <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-xl shadow-lg p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3">{project.title}</h1>
            <p className="text-lg opacity-90 mb-4">{project.description}</p>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg">
                <p className="text-sm opacity-90">Student</p>
                <p className="font-semibold text-lg">{project.student.name}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg">
                <p className="text-sm opacity-90">Mentor</p>
                <p className="font-semibold text-lg">{project.mentor}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg">
                <p className="text-sm opacity-90">Status</p>
                <p className="font-semibold text-lg">{project.status}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg">
                <p className="text-sm opacity-90">Progress</p>
                <p className="font-semibold text-lg">{project.progress}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 w-full bg-white/30 rounded-full h-4">
          <div
            className="bg-white h-4 rounded-full transition-all"
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Links */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Project Links</h2>
            <div className="space-y-3">
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
              >
                🔗 GitHub Repository: {project.githubUrl}
              </a>
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
              >
                🚀 Live Demo: {project.liveUrl}
              </a>
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Project Milestones</h2>
            <div className="space-y-4">
              {project.milestones.map((milestone, index) => (
                <div key={milestone.id} className="relative">
                  {index !== project.milestones.length - 1 && (
                    <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200"></div>
                  )}
                  <div className="flex items-start space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      milestone.status === 'Completed' ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {milestone.status === 'Completed' ? (
                        <FiCheck className="text-white" />
                      ) : (
                        <span className="text-white text-sm">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <h3 className="font-semibold text-gray-800">{milestone.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                      {milestone.completedDate && (
                        <p className="text-xs text-gray-500 mt-2">
                          Completed on: {milestone.completedDate}
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      milestone.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {milestone.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deliverables */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Deliverables</h2>
            <div className="space-y-3">
              {project.deliverables.map((deliverable) => (
                <div key={deliverable.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                      📄
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{deliverable.name}</p>
                      <p className="text-xs text-gray-500">Uploaded: {deliverable.uploadedDate}</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Admin Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleApprove}
                className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold flex items-center justify-center space-x-2"
              >
                <FiCheck />
                <span>Approve Project</span>
              </button>
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold flex items-center justify-center space-x-2"
              >
                <FiX />
                <span>Reject Project</span>
              </button>
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold flex items-center justify-center space-x-2"
              >
                <FiMessageSquare />
                <span>Add Feedback</span>
              </button>
              <Link
                href={`/admin/students/${project.student.id}`}
                className="block w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-semibold text-center"
              >
                View Student Profile
              </Link>
            </div>
          </div>

          {/* Project Timeline */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Timeline</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date:</span>
                <span className="font-semibold">{project.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Submission Date:</span>
                <span className="font-semibold">{project.submissionDate}</span>
              </div>
            </div>
          </div>

          {/* Previous Feedback */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Previous Feedback</h3>
            <div className="space-y-4">
              {project.previousFeedback.map((fb) => (
                <div key={fb.id} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm font-semibold text-gray-800">{fb.mentor}</p>
                  <p className="text-xs text-gray-600 mb-2">{fb.date}</p>
                  <p className="text-sm text-gray-700">{fb.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Mentor Feedback</h2>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
              placeholder="Enter your feedback for the student..."
            />
            <div className="flex items-center justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFeedback}
                className="px-6 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
