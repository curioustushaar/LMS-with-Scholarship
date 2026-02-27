'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { FiPlus, FiFolder, FiClock, FiCheckCircle, FiXCircle, FiUpload, FiFile, FiExternalLink } from 'react-icons/fi'
import { api } from '@/lib/api'

interface Project {
  id: string
  title: string
  description: string
  status: 'in_progress' | 'submitted' | 'approved' | 'rejected'
  deadline?: string
  project_url?: string
  github_url?: string
  score?: number
  feedback?: string
  created_at: string
  courses?: {
    title: string
  }
  project_deliverables?: {
    id: string
    file_url: string
    github_url?: string
    deploy_url?: string
    external_link?: string
    description?: string
  }[]
}

export default function StudentProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [submissionData, setSubmissionData] = useState({
    project_url: '',
    github_url: '',
    notes: ''
  })
  const [uploadingFile, setUploadingFile] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileDescription, setFileDescription] = useState('')

  useEffect(() => {
    loadProjects()
    loadCourses()
  }, [])

  const loadProjects = async () => {
    try {
      const result = await api.student.projects.getAll()
      if (result.success && result.data) {
        setProjects(Array.isArray(result.data) ? result.data : [])
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCourses = async () => {
    try {
      const result = await api.courses.getAll()
      if (result.success && result.data) {
        setCourses(Array.isArray(result.data) ? result.data : [])
      }
    } catch (error) {
      console.error('Failed to load courses:', error)
    }
  }

  const handleSubmitProject = async (projectId: string) => {
    setSelectedProject(projectId)
    setShowSubmitModal(true)
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return

    setUploadingFile(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      if (fileDescription) {
        formData.append('description', fileDescription)
      }

      const token = localStorage.getItem('token')
      const response = await fetch(`/api/student/projects/${selectedProject}/upload-file`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        alert('File uploaded successfully!')
        setSelectedFile(null)
        setFileDescription('')
        loadProjects()
      } else {
        alert(result.error || 'File upload failed')
      }
    } catch (error) {
      alert('Error uploading file')
    } finally {
      setUploadingFile(false)
    }
  }

  const submitProject = async () => {
    if (!submissionData.project_url.trim()) {
      alert('Please provide a project URL')
      return
    }

    try {
      const result = await api.student.projects.submit(selectedProject, {
        project_url: submissionData.project_url,
        github_url: submissionData.github_url || undefined,
        status: 'submitted',
        notes: submissionData.notes || undefined
      })

      if (result.success) {
        setShowSubmitModal(false)
        setSubmissionData({ project_url: '', github_url: '', notes: '' })
        loadProjects()
        alert('Project submitted successfully!')
      } else {
        alert(result.error || 'Submission failed')
      }
    } catch (error) {
      alert('Error submitting project')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <FiUpload className="text-blue-500" />
      case 'approved': return <FiCheckCircle className="text-green-500" />
      case 'rejected': return <FiXCircle className="text-red-500" />
      default: return <FiClock className="text-orange-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-orange-100 text-orange-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Projects</h1>
          <p className="text-gray-600 mt-1">Track and submit your course projects</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Total Projects</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{projects.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">In Progress</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {projects.filter(p => p.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Submitted</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {projects.filter(p => p.status === 'submitted').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Approved</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {projects.filter(p => p.status === 'approved').length}
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{project.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
              </div>
              {getStatusIcon(project.status)}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ').toUpperCase()}
                </span>
                {project.score && (
                  <span className="text-sm font-semibold text-[#C81E4E]">
                    Score: {project.score}/100
                  </span>
                )}
              </div>

              {project.deadline && (
                <div className="text-sm text-gray-500">
                  <FiClock className="inline mr-1" />
                  Due: {new Date(project.deadline).toLocaleDateString()}
                </div>
              )}

              {project.courses?.title && (
                <div className="text-sm text-gray-500">
                  <FiFolder className="inline mr-1" />
                  {project.courses.title}
                </div>
              )}

              {project.feedback && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Feedback:</p>
                  <p className="text-sm text-gray-600 mt-1">{project.feedback}</p>
                </div>
              )}

              {/* Uploaded Files */}
              {project.project_deliverables && project.project_deliverables.length > 0 && (
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <FiFile /> Submitted Links & Files:
                  </p>
                  <div className="space-y-2">
                    {project.project_deliverables.map((d, i) => (
                      <div key={d.id} className="space-y-1">
                        {d.github_url && d.github_url.trim() ? (
                          <a 
                            href={d.github_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-purple-700 hover:text-purple-900 font-medium flex items-center gap-2 text-sm"
                          >
                            <FiFile />
                            GitHub Repository
                            <FiExternalLink className="text-xs" />
                          </a>
                        ) : null}
                        {d.deploy_url && d.deploy_url.trim() ? (
                          <a 
                            href={d.deploy_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-green-700 hover:text-green-900 font-medium flex items-center gap-2 text-sm"
                          >
                            <FiExternalLink />
                            Live Project
                            <FiExternalLink className="text-xs" />
                          </a>
                        ) : null}
                        {d.external_link && d.external_link.trim() ? (
                          <a 
                            href={d.external_link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-700 hover:text-blue-900 font-medium flex items-center gap-2 text-sm"
                          >
                            <FiExternalLink />
                            External Link
                            <FiExternalLink className="text-xs" />
                          </a>
                        ) : null}
                        {d.file_url && d.file_url.trim() ? (
                          <a 
                            href={d.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-purple-700 hover:text-purple-900 font-medium flex items-center gap-2 text-sm"
                          >
                            <FiFile />
                            Document {i + 1}
                            <FiExternalLink className="text-xs" />
                          </a>
                        ) : null}
                        {!d.github_url && !d.deploy_url && !d.external_link && !d.file_url && (
                          <span className="text-gray-500 text-sm">Entry {i + 1} (No links)</span>
                        )}
                        {d.description && (
                          <p className="text-gray-600 text-xs mt-1 ml-6 italic">{d.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t">
                {project.status === 'in_progress' && (
                  <button
                    onClick={() => handleSubmitProject(project.id)}
                    className="w-full bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <FiUpload className="text-lg" />
                    <span>Submit Project</span>
                  </button>
                )}

                {project.project_url && (
                  <a
                    href={project.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-all text-center block"
                  >
                    View Project
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <FiFolder className="text-5xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">No projects assigned yet</p>
          <p className="text-gray-400">Projects will appear here when they are assigned by your instructors.</p>
        </div>
      )}

      {/* Submit Project Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Submit Project</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={submissionData.project_url}
                  onChange={(e) => setSubmissionData({ ...submissionData, project_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                  placeholder="https://your-project.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub URL (Optional)
                </label>
                <input
                  type="url"
                  value={submissionData.github_url}
                  onChange={(e) => setSubmissionData({ ...submissionData, github_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={submissionData.notes}
                  onChange={(e) => setSubmissionData({ ...submissionData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                  placeholder="Any additional notes about your submission..."
                />
              </div>

              {/* File Upload Section */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Document (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] text-sm"
                  accept=".pdf,.doc,.docx,.txt,.zip"
                />
                {selectedFile && (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>
                    <input
                      type="text"
                      placeholder="File description (optional)"
                      value={fileDescription}
                      onChange={(e) => setFileDescription(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] text-sm"
                    />
                    <button
                      onClick={handleFileUpload}
                      disabled={uploadingFile}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      {uploadingFile ? 'Uploading...' : 'Upload File'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={submitProject}
                className="flex-1 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Submit Project
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false)
                  setSubmissionData({ project_url: '', github_url: '', notes: '' })
                  setSelectedFile(null)
                  setFileDescription('')
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}