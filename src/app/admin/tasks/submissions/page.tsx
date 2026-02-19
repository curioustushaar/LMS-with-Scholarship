'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiDownload, FiCheck, FiX, FiClock } from 'react-icons/fi'
import { api } from '@/lib/api'

interface Submission {
  id: string
  user_id: string
  task_id: string
  submitted_at: string
  status: string
  points_awarded?: number
  feedback?: string
  submission_url?: string
  submission_text?: string
  github_url?: string
  deploy_url?: string
  project_name?: string
  submission_file_url?: string
  submission_description?: string
  users?: {
    full_name: string
    email: string
  }
  tasks?: {
    title: string
    max_points: number
  }
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [stats, setStats] = useState({ total: 0, pending: 0, avgScore: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  // Evaluation Modal State
  const [evaluatingSubmission, setEvaluatingSubmission] = useState<Submission | null>(null)
  const [score, setScore] = useState('')
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadSubmissions()
  }, [filter])

  const loadSubmissions = async () => {
    setLoading(true)
    try {
      const result = await api.submissions.getAll(filter)
      if (result.success && result.data) {
        const submissionsData = Array.isArray(result.data) ? result.data : []
        setSubmissions(submissionsData)

        const pending = submissionsData.filter((s: any) => s.status === 'pending' || s.status === 'submitted').length
        const evaluated = submissionsData.filter((s: any) => s.status === 'reviewed' || s.status === 'approved')

        // Industrial Score Calculation: (Sum of Awarded / Sum of Max) * 100
        const totalAwarded = evaluated.reduce((sum: number, s: any) => sum + (s.points_awarded || 0), 0)
        const totalMax = evaluated.reduce((sum: number, s: any) => sum + (s.tasks?.max_points || 100), 0)
        const avgScore = totalMax > 0 ? Math.round((totalAwarded / totalMax) * 100) : 0

        setStats({
          total: submissionsData.length,
          pending,
          avgScore
        })
      }
    } catch (error) {
      console.error('Failed to load submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!evaluatingSubmission) return

    setSubmitting(true)
    try {
      const result = await api.submissions.evaluate(evaluatingSubmission.id, {
        status: 'approved',
        points_awarded: parseInt(score),
        feedback: feedback
      })

      if (result.success) {
        setEvaluatingSubmission(null)
        setScore('')
        setFeedback('')
        loadSubmissions()
      } else {
        alert(result.error || 'Failed to evaluate submission')
      }
    } catch (error) {
      console.error('Evaluation failed:', error)
      alert('An error occurred during evaluation')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && submissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Student Submissions</h1>
          <p className="text-gray-600 mt-1">Review and evaluate student task submissions</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
          >
            <option value="all">All Submissions</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium uppercase tracking-wider">Total Work</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <p className="text-gray-600 text-sm font-medium uppercase tracking-wider">Awaiting Review</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium uppercase tracking-wider">Average Performance</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.avgScore}%</p>
        </div>
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No submissions found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#C81E4E] to-[#D91E5B] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
                    {(submission.users?.full_name || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {submission.users?.full_name || 'Unknown Student'}
                    </h3>
                    <p className="text-[#C81E4E] font-medium text-sm">
                      {submission.tasks?.title || 'Unknown Task'}
                    </p>
                    
                    {/* Project Details */}
                    {submission.project_name && (
                      <div className="mt-2">
                        <span className="text-xs font-semibold text-gray-700">Project: </span>
                        <span className="text-xs text-gray-600">{submission.project_name}</span>
                      </div>
                    )}
                    
                    {/* Links */}
                    <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <FiClock className="mt-0.5" />
                        <span>{new Date(submission.submitted_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded italic">
                        {submission.users?.email}
                      </span>
                    </div>
                    
                    {/* Submission Links */}
                    <div className="flex gap-2 mt-2">
                      {submission.github_url && (
                        <a href={submission.github_url} target="_blank" rel="noopener noreferrer" 
                           className="text-xs bg-gray-800 text-white px-2 py-1 rounded hover:bg-gray-900">
                          GitHub
                        </a>
                      )}
                      {submission.deploy_url && (
                        <a href={submission.deploy_url} target="_blank" rel="noopener noreferrer"
                           className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">
                          Live Demo
                        </a>
                      )}
                      {submission.submission_url && (
                        <a href={submission.submission_url} target="_blank" rel="noopener noreferrer"
                           className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
                          Submission
                        </a>
                      )}
                      {submission.submission_file_url && (
                        <a href={submission.submission_file_url} target="_blank" rel="noopener noreferrer"
                           className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700">
                          Download File
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {(submission.status === 'pending' || submission.status === 'submitted') ? (
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full uppercase">
                        Pending
                      </span>
                      <button
                        onClick={() => {
                          setEvaluatingSubmission(submission)
                          setScore(submission.points_awarded?.toString() || '')
                          setFeedback(submission.feedback || '')
                        }}
                        className="px-5 py-2 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg hover:shadow-lg transition-all text-sm font-bold flex items-center space-x-2"
                      >
                        <FiCheck className="text-lg" />
                        <span>Evaluate</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${submission.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                          {submission.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1 italic">
                          Reviewed on {new Date(submission.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="bg-gray-50 px-4 py-2 rounded-lg text-center min-w-[80px] border border-gray-100">
                        <p className="text-2xl font-black text-[#C81E4E]">{submission.points_awarded || 0}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">/ {submission.tasks?.max_points || 100}</p>
                      </div>
                      <button
                        onClick={() => {
                          setEvaluatingSubmission(submission)
                          setScore(submission.points_awarded?.toString() || '')
                          setFeedback(submission.feedback || '')
                        }}
                        className="p-2 text-gray-400 hover:text-[#C81E4E] transition-colors"
                        title="Edit Evaluation"
                      >
                        <FiCheck />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evaluation Modal */}
      {evaluatingSubmission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">Evaluate Submission</h2>
                  <p className="text-pink-100 text-sm mt-1">{evaluatingSubmission.users?.full_name}</p>
                  <p className="text-pink-100 text-xs">{evaluatingSubmission.tasks?.title}</p>
                </div>
                <button
                  onClick={() => setEvaluatingSubmission(null)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>
            </div>

            <form onSubmit={handleEvaluate} className="p-6 space-y-6">
              {/* Submission Details Section */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-gray-800">Submission Details</h3>
                
                {evaluatingSubmission.project_name && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Project Name: </span>
                    <span className="text-sm text-gray-800">{evaluatingSubmission.project_name}</span>
                  </div>
                )}
                
                {evaluatingSubmission.submission_description && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Description: </span>
                    <div className="text-sm text-gray-800 mt-1 bg-white p-2 rounded border">
                      {evaluatingSubmission.submission_description}
                    </div>
                  </div>
                )}
                
                {evaluatingSubmission.submission_text && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Notes: </span>
                    <div className="text-sm text-gray-800 mt-1 bg-white p-2 rounded border">
                      {evaluatingSubmission.submission_text}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {evaluatingSubmission.github_url && (
                    <a href={evaluatingSubmission.github_url} target="_blank" rel="noopener noreferrer"
                       className="text-sm bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-900 flex items-center gap-1">
                      <span>🔗</span> GitHub Repository
                    </a>
                  )}
                  {evaluatingSubmission.deploy_url && (
                    <a href={evaluatingSubmission.deploy_url} target="_blank" rel="noopener noreferrer"
                       className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1">
                      <span>🚀</span> Live Demo
                    </a>
                  )}
                  {evaluatingSubmission.submission_url && (
                    <a href={evaluatingSubmission.submission_url} target="_blank" rel="noopener noreferrer"
                       className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1">
                      <span>📝</span> Submission Link
                    </a>
                  )}
                  {evaluatingSubmission.submission_file_url && (
                    <a href={evaluatingSubmission.submission_file_url} target="_blank" rel="noopener noreferrer"
                       className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 flex items-center gap-1">
                      <span>💾</span> Download File
                    </a>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Score (Max {evaluatingSubmission.tasks?.max_points || 100})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    max={evaluatingSubmission.tasks?.max_points || 100}
                    min="0"
                    placeholder="Enter points awarded"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:bg-white transition-all text-lg font-bold"
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                    / {evaluatingSubmission.tasks?.max_points || 100}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Feedback to Student
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide detailed feedback on their work..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:bg-white transition-all resize-none"
                  required
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setEvaluatingSubmission(null)}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] px-6 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <FiCheck />
                      <span>Submit Grade</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
