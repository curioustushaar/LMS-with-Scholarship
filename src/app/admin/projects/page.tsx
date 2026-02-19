'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiPlus, FiEdit, FiTrash2, FiFilter, FiList, FiGrid, FiExternalLink, FiCheckCircle, FiX, FiFile } from 'react-icons/fi'
import { api } from '@/lib/api'

interface Project {
  id: string
  title: string
  description?: string
  user_id: string
  status: string
  progress: number
  mentor_id?: string
  deadline?: string
  submitted_at?: string
  project_url?: string
  github_url?: string
  score?: number
  feedback?: string
  created_at: string
  users?: {
    full_name: string
    email: string
  }
  courses?: {
    title: string
  }
  project_deliverables?: {
    id: string
    file_url: string
    description?: string
    created_at: string
  }[]
}

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCourse, setFilterCourse] = useState('all')
  const [projects, setProjects] = useState<Project[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, inProgress: 0, submitted: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  
  // Evaluation Modal State
  const [showEvalModal, setShowEvalModal] = useState(false)
  const [evalProject, setEvalProject] = useState<Project | null>(null)
  const [score, setScore] = useState('')
  const [feedback, setFeedback] = useState('')
  const [submittingEval, setSubmittingEval] = useState(false)

  useEffect(() => {
    loadProjects()
    loadCourses()
  }, [])

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

  const loadProjects = async () => {
    try {
      console.log('🔄 Loading projects...')
      const result = await api.projects.getAll()
      console.log('📦 API Result:', result)
      
      if (result.success && result.data) {
        const projectsData = Array.isArray(result.data) ? result.data : []
        
        // Debug logging
        console.log('📊 Projects loaded:', projectsData.length)
        projectsData.forEach(p => {
          console.log(`Project: ${p.title}`, {
            github_url: p.github_url,
            project_url: p.project_url,
            deliverables: p.project_deliverables?.length || 0
          })
        })
        
        setProjects(projectsData)

        const total = projectsData.length
        const inProgress = projectsData.filter((p: any) => p.status === 'in_progress').length
        const submitted = projectsData.filter((p: any) => p.status === 'submitted').length
        const approved = projectsData.filter((p: any) => p.status === 'approved').length
        const rejected = projectsData.filter((p: any) => p.status === 'rejected').length

        setStats({ total, inProgress, submitted, approved, rejected })
      } else {
        console.error('❌ API returned unsuccessful or no data:', result)
        setProjects([])
        setStats({ total: 0, inProgress: 0, submitted: 0, approved: 0, rejected: 0 })
      }
    } catch (error) {
      console.error('❌ Failed to load projects:', error)
      setProjects([])
      setStats({ total: 0, inProgress: 0, submitted: 0, approved: 0, rejected: 0 })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return
    try {
      await api.projects.delete(id)
      loadProjects()
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const openEvalModal = (project: Project) => {
    setEvalProject(project)
    setScore(project.score?.toString() || '')
    setFeedback(project.feedback || '')
    setShowEvalModal(true)
  }

  const handleSaveEval = async () => {
    if (!evalProject) return
    setSubmittingEval(true)
    try {
      const result = await api.projects.approve(evalProject.id, {
        status: parseInt(score) >= 40 ? 'approved' : 'rejected',
        score: parseInt(score),
        feedback
      })
      if (result.success) {
        setShowEvalModal(false)
        loadProjects()
      } else {
        alert('Failed to save evaluation')
      }
    } catch (err) {
      console.error(err)
      alert('Error saving evaluation')
    } finally {
      setSubmittingEval(false)
    }
  }

  const getFilteredProjects = () => {
    return projects.filter(p => {
      const statusMatch = filterStatus === 'all' || p.status === filterStatus
      const courseMatch = filterCourse === 'all' || p.course_id === filterCourse
      return statusMatch && courseMatch
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    )
  }

  const filteredProjects = getFilteredProjects()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Projects Management</h1>
          <p className="text-gray-600 mt-1">Track and manage student projects by domain</p>
        </div>
        <Link
          href="/admin/projects/create"
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
        >
          <FiPlus className="text-xl" />
          <span>Create Project</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Total Projects</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">In Progress</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Submitted</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{stats.submitted}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Approved</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Rejected</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 flex-grow">
            <FiFilter className="text-gray-600 text-xl" />
            <div className="flex-1 w-full md:w-auto">
              <label className="text-sm font-medium text-gray-700 block mb-2">Filter by Course/Domain:</label>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
              >
                <option value="all">All Domains</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 w-full md:w-auto">
              <label className="text-sm font-medium text-gray-700 block mb-2">Filter by Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
              >
                <option value="all">All Status</option>
                <option value="in_progress">In Progress</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-[#C81E4E] text-white' : 'bg-gray-200 text-gray-600'}`}>
              <FiGrid />
            </button>
            <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-[#C81E4E] text-white' : 'bg-gray-200 text-gray-600'}`}>
              <FiList />
            </button>
          </div>
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No projects found.</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] p-6 text-white">
                    <h3 className="text-xl font-bold">{project.title}</h3>
                    <p className="text-sm text-pink-100 mt-1">UUID: {project.id}</p>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        project.status === 'approved' ? 'bg-green-100 text-green-800' :
                        project.status === 'submitted' ? 'bg-orange-100 text-orange-800' :
                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status?.replace('_', ' ').toUpperCase()}
                      </span>
                      {project.score && (
                        <span className="text-sm font-semibold text-[#C81E4E]">
                          Score: {project.score}/100
                        </span>
                      )}
                    </div>

                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Student:</span> {project.users?.full_name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span> {project.users?.email || project.user_id}
                      </p>
                      {project.courses?.title && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Course:</span> {project.courses.title}
                        </p>
                      )}
                      {project.deadline && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Deadline:</span> {new Date(project.deadline).toLocaleDateString()}
                        </p>
                      )}
                      {project.submitted_at && (
                        <p className="text-sm text-green-600">
                          <span className="font-medium">Submitted:</span> {new Date(project.submitted_at).toLocaleDateString()}
                        </p>
                      )}
                      {project.project_url && (
                        <p className="text-sm text-blue-600">
                          <span className="font-medium">Deployed Link:</span> 
                          <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="ml-2 underline hover:text-blue-800 flex items-center gap-1 inline-flex">
                            <FiExternalLink className="text-xs" />
                            View Live Project
                          </a>
                        </p>
                      )}
                      {project.github_url && (
                        <p className="text-sm text-purple-600">
                          <span className="font-medium">GitHub Link:</span> 
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="ml-2 underline hover:text-purple-800 flex items-center gap-1 inline-flex">
                            <FiExternalLink className="text-xs" />
                            View Repository
                          </a>
                        </p>
                      )}

                      {!project.project_url && !project.github_url && (!project.project_deliverables || project.project_deliverables.length === 0) && project.status === 'in_progress' && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-yellow-700 text-sm font-medium">⏳ Awaiting student submission</p>
                        </div>
                      )}
                      
                      {project.project_deliverables && project.project_deliverables.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            <FiFile /> Submitted Files:
                          </p>
                          <div className="space-y-2">
                            {project.project_deliverables.map((d, i) => (
                              <div key={i} className="bg-purple-50 border border-purple-200 rounded-lg p-2">
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
                                {d.description && (
                                  <p className="text-gray-600 text-xs mt-1 ml-6">{d.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 pt-4 border-t">
                      <button
                        onClick={() => openEvalModal(project)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
                      >
                        <FiCheckCircle className="text-lg" />
                        <span>Evaluate</span>
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <FiTrash2 className="text-lg" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Student</th>
                    <th scope="col" className="px-6 py-3">Project</th>
                    <th scope="col" className="px-6 py-3">Links</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Score</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{project.users?.full_name || 'N/A'}</div>
                        <div className="text-gray-500">{project.users?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{project.title}</div>
                        <div className="text-gray-500">{project.courses?.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {project.github_url && project.github_url.trim() && (
                            <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 hover:underline text-sm">
                              <span className="font-medium">GitHub:</span>&nbsp;{project.github_url.length > 30 ? project.github_url.substring(0, 30) + '...' : project.github_url}
                              <FiExternalLink className="ml-1" />
                            </a>
                          )}
                          {project.project_url && project.project_url.trim() && (
                            <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-green-600 hover:underline text-sm">
                              <span className="font-medium">Deploy:</span>&nbsp;{project.project_url.length > 30 ? project.project_url.substring(0, 30) + '...' : project.project_url}
                              <FiExternalLink className="ml-1" />
                            </a>
                          )}
                          {project.project_deliverables && project.project_deliverables.length > 0 && project.project_deliverables.map((d, i) => (
                            <a key={d.id} href={d.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-purple-600 hover:underline text-sm">
                              <FiFile className="mr-1" /> File {i+1}
                              <FiExternalLink className="ml-1" />
                            </a>
                          ))}
                          {(!project.github_url || !project.github_url.trim()) && 
                           (!project.project_url || !project.project_url.trim()) && 
                           (!project.project_deliverables || project.project_deliverables.length === 0) && (
                            <span className="text-gray-400 text-sm italic">No links submitted</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          project.status === 'approved' ? 'bg-green-100 text-green-800' :
                          project.status === 'submitted' ? 'bg-orange-100 text-orange-800' :
                          project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">{project.score || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button onClick={() => openEvalModal(project)} className="p-2 text-green-600 hover:bg-green-100 rounded-full"><FiCheckCircle /></button>
                          <button onClick={() => handleDelete(project.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Evaluation Modal */}
      {showEvalModal && evalProject && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-800">Evaluate Project</h3>
              <p className="text-gray-600 mt-1">For: {evalProject.users?.full_name}</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-lg text-gray-800">{evalProject.title}</h4>
                <p className="text-sm text-gray-500">{evalProject.courses?.title}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-700 mb-3">Submitted Links & Files</h5>
                  <div className="space-y-3">
                    {evalProject.github_url && evalProject.github_url.trim() && (
                      <div className="flex items-start">
                        <span className="text-sm font-medium text-gray-700 w-20">GitHub:</span>
                        <a href={evalProject.github_url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center text-blue-600 hover:underline break-all">
                          {evalProject.github_url} <FiExternalLink className="ml-1 flex-shrink-0" />
                        </a>
                      </div>
                    )}
                    {evalProject.project_url && evalProject.project_url.trim() && (
                      <div className="flex items-start">
                        <span className="text-sm font-medium text-gray-700 w-20">Deploy:</span>
                        <a href={evalProject.project_url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center text-green-600 hover:underline break-all">
                          {evalProject.project_url} <FiExternalLink className="ml-1 flex-shrink-0" />
                        </a>
                      </div>
                    )}
                    {evalProject.project_deliverables && evalProject.project_deliverables.length > 0 && evalProject.project_deliverables.map((d, i) => (
                      <div key={d.id} className="flex items-start">
                        <span className="text-sm font-medium text-gray-700 w-20">File {i+1}:</span>
                        <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center text-purple-600 hover:underline break-all">
                          {d.description || 'View File'} <FiExternalLink className="ml-1 flex-shrink-0" />
                        </a>
                      </div>
                    ))}
                    {(!evalProject.github_url || !evalProject.github_url.trim()) && 
                     (!evalProject.project_url || !evalProject.project_url.trim()) && 
                     (!evalProject.project_deliverables || evalProject.project_deliverables.length === 0) && (
                      <p className="text-sm text-gray-500">No links or files submitted.</p>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-1">Score (e.g., 85 / 100)</label>
                    <input
                      type="text"
                      id="score"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                      placeholder="Enter score"
                    />
                  </div>
                  <div>
                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                    <textarea
                      id="feedback"
                      rows={5}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                      placeholder="Provide constructive feedback..."
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
              <button onClick={() => setShowEvalModal(false)} className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100">Cancel</button>
              <button 
                onClick={handleSaveEval} 
                disabled={submittingEval}
                className="px-6 py-2 text-white bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] rounded-lg disabled:opacity-50"
              >
                {submittingEval ? 'Saving...' : 'Save Evaluation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
