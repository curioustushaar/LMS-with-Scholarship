'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiCheck, FiX, FiEdit, FiMessageSquare } from 'react-icons/fi'
import { api } from '@/lib/api'

interface Project {
  id: string
  title: string
  description: string
  user_id: string
  status: string
  progress: number
  deadline?: string
  feedback?: string
  score?: number
  created_at: string
  updated_at: string
}

export default function ProjectDetailPage() {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [modalMode, setModalMode] = useState<'feedback' | 'approve' | 'reject'>('feedback')
  const [feedback, setFeedback] = useState('')
  const [score, setScore] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const projectId = params.id as string

  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    try {
      const result = await api.projects.getById(projectId)
      if (result.success && result.data) {
        setProject(result.data)
      }
    } catch (error) {
      console.error('Failed to load project:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">Project not found</p>
        <Link href="/admin/projects" className="text-[#C81E4E] mt-2 inline-block">Back to Projects</Link>
      </div>
    )
  }

  const handleEvaluation = async () => {
    if (!project) return

    setSubmitting(true)
    try {
      const status = modalMode === 'approve' ? 'approved' : (modalMode === 'reject' ? 'rejected' : project.status)

      const result = await api.projects.approve(projectId, {
        status,
        feedback: feedback.trim(),
        score: score ? parseInt(score) : undefined
      })

      if (result.success) {
        setShowFeedbackModal(false)
        setFeedback('')
        setScore('')
        loadProject()
      } else {
        alert(result.error || 'Evaluation failed')
      }
    } catch (error) {
      console.error('Evaluation failed:', error)
      alert('An error occurred during evaluation')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/projects" className="inline-flex items-center space-x-2 text-[#C81E4E] hover:text-[#D91E5B] font-medium">
        <FiArrowLeft />
        <span>Back to Projects</span>
      </Link>

      {project && (
        <>
          {/* Project Header */}
          <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-xl shadow-lg p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-3">{project.title}</h1>
                <p className="text-lg opacity-90 mb-4">{project.description}</p>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg">
                    <p className="text-sm opacity-90">Status</p>
                    <p className="font-semibold text-lg">{project.status}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg">
                    <p className="text-sm opacity-90">Progress</p>
                    <p className="font-semibold text-lg">{project.progress}%</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg">
                    <p className="text-sm opacity-90">Deadline</p>
                    <p className="font-semibold text-lg">
                      {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No Deadline'}
                    </p>
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
              {/* Project Description */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Project Details</h2>
                <div className="space-y-3 text-sm text-gray-700">
                  <p><strong>Description:</strong> {project.description}</p>
                  <p><strong>Status:</strong> <span className={`px-3 py-1 rounded-full text-xs font-medium ${project.status === 'approved' ? 'bg-green-100 text-green-800' :
                    project.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>{project.status}</span></p>
                  <p><strong>Created:</strong> {new Date(project.created_at).toLocaleDateString()}</p>
                  <p><strong>Updated:</strong> {new Date(project.updated_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Milestones Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Project Milestones</h2>
                <div className="text-gray-600">
                  <p>Milestones data will be loaded from Supabase when available</p>
                </div>
              </div>

              {/* Deliverables Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Deliverables</h2>
                <div className="text-gray-600">
                  <p>Deliverables data will be loaded from Supabase when available</p>
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
                    onClick={() => {
                      setModalMode('approve')
                      setFeedback(project.feedback || '')
                      setScore(project.score?.toString() || '')
                      setShowFeedbackModal(true)
                    }}
                    className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold flex items-center justify-center space-x-2"
                  >
                    <FiCheck />
                    <span>Approve Project</span>
                  </button>
                  <button
                    onClick={() => {
                      setModalMode('reject')
                      setFeedback(project.feedback || '')
                      setShowFeedbackModal(true)
                    }}
                    className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold flex items-center justify-center space-x-2"
                  >
                    <FiX />
                    <span>Reject Project</span>
                  </button>
                  <button
                    onClick={() => {
                      setModalMode('feedback')
                      setFeedback(project.feedback || '')
                      setShowFeedbackModal(true)
                    }}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold flex items-center justify-center space-x-2"
                  >
                    <FiMessageSquare />
                    <span>Add Feedback</span>
                  </button>
                </div>
              </div>

              {/* Project Info */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Project Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Student ID:</span>
                    <span className="font-semibold">{project.user_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-semibold">{project.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-semibold">{project.progress}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Modal */}
          {showFeedbackModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
                <div className={`p-6 text-white ${modalMode === 'approve' ? 'bg-green-500' :
                    modalMode === 'reject' ? 'bg-red-500' : 'bg-blue-500'
                  }`}>
                  <h2 className="text-2xl font-bold">
                    {modalMode === 'approve' ? 'Approve Project' :
                      modalMode === 'reject' ? 'Reject Project' : 'Add Project Feedback'}
                  </h2>
                  <p className="opacity-90">{project.title}</p>
                </div>

                <div className="p-8 space-y-6">
                  {modalMode === 'approve' && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">PROJECT SCORE (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                        placeholder="Enter score..."
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">FEEDBACK TO STUDENT</label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C81E4E] resize-none"
                      placeholder="Enter detailed feedback..."
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                    <button
                      onClick={() => setShowFeedbackModal(false)}
                      disabled={submitting}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEvaluation}
                      disabled={submitting}
                      className={`px-8 py-3 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center space-x-2 ${modalMode === 'approve' ? 'bg-green-500' :
                          modalMode === 'reject' ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                    >
                      {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (
                        <>
                          <FiCheck />
                          <span>
                            {modalMode === 'approve' ? 'Confirm Approval' :
                              modalMode === 'reject' ? 'Confirm Rejection' : 'Save Feedback'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
