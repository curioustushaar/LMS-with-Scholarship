'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { FiCalendar, FiClock, FiUser, FiUpload, FiCheck, FiX } from 'react-icons/fi'
import { api } from '@/lib/api'

interface Task {
  id: string
  title: string
  description: string
  max_points: number
  deadline: string
  status: string
  course_id: string
  courses?: {
    title: string
  }
  task_submissions?: {
    id: string
    status: string
    points_awarded?: number
    feedback?: string
    submitted_at: string
    evaluated_at?: string
  }[]
}

export default function StudentTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [submissionData, setSubmissionData] = useState({
    submission_url: '',
    submission_text: '',
    github_url: '',
    deploy_url: '',
    project_name: '',
    submission_description: '',
    submission_file_url: ''
  })
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('')

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const result = await api.student.tasks.getAll()
      if (result.success && result.data) {
        setTasks(result.data)
      }
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitTask = (task: Task) => {
    setSelectedTask(task)
    setShowSubmitModal(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/student/submissions/upload-file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      const result = await response.json()

      if (result.success && result.data) {
        setSubmissionData({ 
          ...submissionData, 
          submission_file_url: result.data.file_url 
        })
        setUploadedFileName(file.name)
        alert('File uploaded successfully!')
      } else {
        alert(result.error || 'File upload failed')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error uploading file')
    } finally {
      setUploadingFile(false)
    }
  }

  const submitTask = async () => {
    if (!selectedTask || !submissionData.submission_url.trim()) {
      alert('Please provide submission URL')
      return
    }

    try {
      const result = await api.student.submissions.create({
        task_id: selectedTask.id,
        submission_url: submissionData.submission_url,
        submission_text: submissionData.submission_text || undefined,
        github_url: submissionData.github_url || undefined,
        deploy_url: submissionData.deploy_url || undefined,
        project_name: submissionData.project_name || undefined,
        submission_description: submissionData.submission_description || undefined,
        submission_file_url: submissionData.submission_file_url || undefined
      })

      if (result.success) {
        setShowSubmitModal(false)
        setSubmissionData({
          submission_url: '',
          submission_text: '',
          github_url: '',
          deploy_url: '',
          project_name: '',
          submission_description: '',
          submission_file_url: ''
        })
        setUploadedFileName('')
        loadTasks()
        alert('Task submitted successfully!')
      } else {
        alert(result.error || 'Submission failed')
      }
    } catch (error) {
      console.error('Error submitting task:', error)
      alert('Error submitting task')
    }
  }

  const getStatusIcon = (task: Task) => {
    const submission = task.task_submissions?.[0]
    if (submission) {
      switch (submission.status) {
        case 'submitted':
        case 'pending': return <FiClock className="text-orange-500" />
        case 'approved': return <FiCheck className="text-green-500" />
        case 'rejected': return <FiX className="text-red-500" />
        default: return <FiUpload className="text-gray-400" />
      }
    }
    return <FiUpload className="text-gray-400" />
  }

  const getStatusBadge = (task: Task) => {
    const submission = task.task_submissions?.[0]
    if (submission) {
      switch (submission.status) {
        case 'submitted':
        case 'pending': return 'bg-orange-100 text-orange-800'
        case 'approved': return 'bg-green-100 text-green-800'
        case 'rejected': return 'bg-red-100 text-red-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }
    return 'bg-gray-100 text-gray-800'
  }

  const isTaskSubmitted = (task: Task) => {
    return task.task_submissions && task.task_submissions.length > 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E] mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading tasks...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">My Tasks</h1>
          <p className="text-gray-600">Submit and track your assigned tasks</p>
        </div>

        {/* Tasks Grid */}
        {tasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FiUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No tasks assigned yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#C81E4E] to-[#D91E5B] rounded-xl flex items-center justify-center text-white text-2xl shadow-sm">
                      {getStatusIcon(task)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{task.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
                        {task.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <FiCalendar className="w-4 h-4" />
                          <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>📚</span>
                          <span>{task.courses?.title || 'General'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>🏆</span>
                          <span>{task.max_points} points</span>
                        </div>
                      </div>
                      
                      {/* Submission Status */}
                      <div className="mt-4">
                        {isTaskSubmitted(task) ? (
                          <div className="space-y-3">
                            <div className="flex items-center flex-wrap gap-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadge(task)}`}>
                                {task.task_submissions?.[0]?.status}
                              </span>
                              <span className="text-xs text-gray-500">
                                Submitted: {task.task_submissions?.[0] ? new Date(task.task_submissions[0].submitted_at).toLocaleDateString() : 'Unknown'}
                              </span>
                            </div>
                            
                            {/* Score Display */}
                            {task.task_submissions?.[0]?.points_awarded !== undefined && task.task_submissions?.[0]?.points_awarded !== null && (
                              <div className="bg-gradient-to-r from-[#C81E4E]/10 to-[#D91E5B]/10 border-l-4 border-[#C81E4E] p-3 rounded">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-bold text-gray-700">Your Score:</span>
                                  <span className="text-2xl font-black text-[#C81E4E]">
                                    {task.task_submissions[0].points_awarded}/{task.max_points}
                                  </span>
                                </div>
                                {task.task_submissions?.[0]?.evaluated_at && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Evaluated on {new Date(task.task_submissions[0].evaluated_at).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            )}
                            
                            {/* Feedback Display */}
                            {task.task_submissions?.[0]?.feedback && (
                              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                                <p className="text-xs font-bold text-blue-700 mb-1">Teacher's Feedback:</p>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {task.task_submissions[0].feedback}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Not submitted yet</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex-shrink-0">
                    {!isTaskSubmitted(task) ? (
                      <button
                        onClick={() => handleSubmitTask(task)}
                        className="px-6 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg hover:shadow-lg transition-all font-bold flex items-center space-x-2"
                      >
                        <FiUpload />
                        <span>Submit</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSubmitTask(task)}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-bold flex items-center space-x-2"
                      >
                        <FiUpload />
                        <span>Resubmit</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Modal */}
        {showSubmitModal && selectedTask && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] p-6 text-white">
                <h2 className="text-2xl font-bold">Submit Task</h2>
                <p className="text-pink-100 text-sm mt-1">{selectedTask.title}</p>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={submissionData.project_name}
                    onChange={(e) => setSubmissionData({ ...submissionData, project_name: e.target.value })}
                    placeholder="Enter your project name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Submission URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={submissionData.submission_url}
                    onChange={(e) => setSubmissionData({ ...submissionData, submission_url: e.target.value })}
                    placeholder="https://your-project-link.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    GitHub Repository URL
                  </label>
                  <input
                    type="url"
                    value={submissionData.github_url}
                    onChange={(e) => setSubmissionData({ ...submissionData, github_url: e.target.value })}
                    placeholder="https://github.com/username/repo"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={submissionData.deploy_url}
                    onChange={(e) => setSubmissionData({ ...submissionData, deploy_url: e.target.value })}
                    placeholder="https://your-deployed-app.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Upload Document (PDF, DOC, etc.)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#C81E4E] file:text-white hover:file:bg-[#D91E5B] disabled:opacity-50"
                    />
                    {uploadingFile && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#C81E4E]"></div>
                      </div>
                    )}
                  </div>
                  {uploadedFileName && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <FiCheck /> {uploadedFileName} uploaded successfully
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Max size: 50MB. Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP, RAR, Images
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Project Description
                  </label>
                  <textarea
                    value={submissionData.submission_description}
                    onChange={(e) => setSubmissionData({ ...submissionData, submission_description: e.target.value })}
                    placeholder="Describe your project, features, technologies used..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={submissionData.submission_text}
                    onChange={(e) => setSubmissionData({ ...submissionData, submission_text: e.target.value })}
                    placeholder="Any additional notes or comments..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowSubmitModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitTask}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg hover:shadow-lg transition-all font-bold"
                  >
                    Submit Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}