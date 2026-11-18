'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  FiPlus,
  FiTrash2,
  FiFilter,
  FiList,
  FiGrid,
  FiExternalLink,
  FiCheckCircle,
  FiX,
  FiFile,
  FiSearch,
  FiCopy,
  FiCheck,
  FiGlobe,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiUser,
  FiFolder,
  FiAlertCircle
} from 'react-icons/fi'
import { api } from '@/lib/api'

interface Project {
  id: string
  title: string
  description?: string
  user_id: string
  course_id?: string
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
    id?: string
    title: string
  }
  project_deliverables?: {
    id: string
    file_url: string
    github_url?: string
    deploy_url?: string
    external_link?: string
    description?: string
    created_at: string
  }[]
}

interface StudentUser {
  id: string
  full_name: string
  email: string
  role?: string
  status?: string
}

export default function ProjectsPageContent() {
  const searchParams = useSearchParams()
  const initialAssignUserId = searchParams.get('assignUserId') || searchParams.get('student_id') || ''

  // View & Filter States (Default is TABLE as requested for 100+ students)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCourse, setFilterCourse] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)

  // Data States
  const [projects, setProjects] = useState<Project[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [allStudents, setAllStudents] = useState<StudentUser[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [stats, setStats] = useState({ total: 0, inProgress: 0, submitted: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Evaluation Modal State
  const [showEvalModal, setShowEvalModal] = useState(false)
  const [evalProject, setEvalProject] = useState<Project | null>(null)
  const [score, setScore] = useState('')
  const [feedback, setFeedback] = useState('')
  const [submittingEval, setSubmittingEval] = useState(false)

  // Assign Project Modal State
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [studentSearch, setStudentSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(null)
  const [assignForm, setAssignForm] = useState({
    user_id: '',
    course_id: '',
    title: '',
    description: '',
    deadline: ''
  })
  const [assigning, setAssigning] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
    loadCourses()
    loadStudents()
  }, [])

  // If URL has assignUserId, open modal automatically
  useEffect(() => {
    if (initialAssignUserId && allStudents.length > 0) {
      const foundStudent = allStudents.find(s => s.id === initialAssignUserId)
      if (foundStudent) {
        setSelectedStudent(foundStudent)
        setAssignForm(prev => ({ ...prev, user_id: foundStudent.id }))
        setShowAssignModal(true)
      }
    }
  }, [initialAssignUserId, allStudents])

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

  const loadStudents = async () => {
    setLoadingStudents(true)
    try {
      const result = await api.students.getAll()
      if (result.success && result.data) {
        setAllStudents(Array.isArray(result.data) ? result.data : [])
      }
    } catch (error) {
      console.error('Failed to load students:', error)
    } finally {
      setLoadingStudents(false)
    }
  }

  const loadProjects = async () => {
    try {
      console.log('🔄 Loading projects...')
      const result = await api.projects.getAll()
      
      if (result.success && result.data) {
        const projectsData = Array.isArray(result.data) ? result.data : []
        setProjects(projectsData)

        const total = projectsData.length
        const inProgress = projectsData.filter((p: any) => p.status === 'in_progress').length
        const submitted = projectsData.filter((p: any) => p.status === 'submitted').length
        const approved = projectsData.filter((p: any) => p.status === 'approved').length
        const rejected = projectsData.filter((p: any) => p.status === 'rejected').length

        setStats({ total, inProgress, submitted, approved, rejected })
      } else {
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
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return
    try {
      const res = await api.projects.delete(id)
      if (res.success) {
        loadProjects()
      } else {
        alert(res.error || 'Failed to delete project')
      }
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Error deleting project')
    }
  }

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Evaluation Modal Handlers
  const openEvalModal = (project: Project) => {
    setEvalProject(project)
    setScore(project.score !== undefined && project.score !== null ? project.score.toString() : '')
    setFeedback(project.feedback || '')
    setShowEvalModal(true)
  }

  const handleSaveEval = async () => {
    if (!evalProject) return
    
    const scoreValue = parseInt(score)
    if (isNaN(scoreValue)) {
      alert('Please enter a valid score (0-100)')
      return
    }
    if (scoreValue < 0 || scoreValue > 100) {
      alert('Score must be between 0 and 100')
      return
    }
    if (!feedback || feedback.trim() === '') {
      alert('Please provide feedback for the student')
      return
    }
    
    setSubmittingEval(true)
    try {
      const result = await api.projects.approve(evalProject.id, {
        status: scoreValue >= 40 ? 'approved' : 'rejected',
        score: scoreValue,
        feedback: feedback.trim()
      })
      if (result.success) {
        setShowEvalModal(false)
        loadProjects()
      } else {
        alert(result.error || 'Failed to save evaluation')
      }
    } catch (err) {
      console.error(err)
      alert('Error saving evaluation')
    } finally {
      setSubmittingEval(false)
    }
  }

  // Assign Project Modal Handlers
  const openAssignModal = (student?: StudentUser) => {
    setAssignError(null)
    setAssignSuccess(null)
    if (student) {
      setSelectedStudent(student)
      setAssignForm({
        user_id: student.id,
        course_id: '',
        title: '',
        description: '',
        deadline: ''
      })
    } else {
      setSelectedStudent(null)
      setAssignForm({
        user_id: '',
        course_id: '',
        title: '',
        description: '',
        deadline: ''
      })
    }
    setStudentSearch('')
    setShowAssignModal(true)
    if (allStudents.length === 0) {
      loadStudents()
    }
  }

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAssignError(null)
    setAssignSuccess(null)

    if (!assignForm.user_id) {
      setAssignError('Please select a student to assign the project to')
      return
    }
    if (!assignForm.course_id) {
      setAssignError('Please select a course / domain')
      return
    }
    if (!assignForm.title.trim()) {
      setAssignError('Project title is required')
      return
    }

    setAssigning(true)
    try {
      const result = await api.projects.create({
        title: assignForm.title.trim(),
        description: assignForm.description.trim() || undefined,
        course_id: assignForm.course_id,
        user_id: assignForm.user_id,
        deadline: assignForm.deadline || undefined
      })

      if (result.success) {
        setAssignSuccess('Project assigned successfully!')
        setTimeout(() => {
          setShowAssignModal(false)
          loadProjects()
        }, 1200)
      } else {
        setAssignError(result.error || 'Failed to assign project')
      }
    } catch (err: any) {
      setAssignError(err.message || 'Error assigning project')
    } finally {
      setAssigning(false)
    }
  }

  // Filtered & Paginated Projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const statusMatch = filterStatus === 'all' || p.status === filterStatus
      const courseMatch = filterCourse === 'all' || p.course_id === filterCourse

      if (!statusMatch || !courseMatch) return false

      if (!searchQuery.trim()) return true

      const query = searchQuery.toLowerCase().trim()
      const studentName = p.users?.full_name?.toLowerCase() || ''
      const studentEmail = p.users?.email?.toLowerCase() || ''
      const projectTitle = p.title?.toLowerCase() || ''
      const courseTitle = p.courses?.title?.toLowerCase() || ''
      const uuid = p.id?.toLowerCase() || ''

      return (
        studentName.includes(query) ||
        studentEmail.includes(query) ||
        projectTitle.includes(query) ||
        courseTitle.includes(query) ||
        uuid.includes(query)
      )
    })
  }, [projects, filterStatus, filterCourse, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage) || 1
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredProjects.slice(start, start + itemsPerPage)
  }, [filteredProjects, currentPage, itemsPerPage])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filterStatus, filterCourse, searchQuery, itemsPerPage])

  // Filter students in Assign Modal
  const modalFilteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return allStudents.slice(0, 50)
    const q = studentSearch.toLowerCase()
    return allStudents
      .filter(s => (s.full_name?.toLowerCase() || '').includes(q) || (s.email?.toLowerCase() || '').includes(q))
      .slice(0, 50)
  }, [allStudents, studentSearch])

  // Quick Project Title Suggestions
  const projectSuggestions = [
    'Full Stack Web Application',
    'Frontend Portfolio Project',
    'REST API & Database Backend',
    'Data Analysis & Visualization',
    'Mobile Application Development',
    'Capstone Final Project'
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Projects Management</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Assign, track, and evaluate student projects in compact list view</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openAssignModal()}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            <FiPlus className="text-xl" />
            <span>Assign Project</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <p className="text-gray-500 text-xs md:text-sm font-medium">Total Projects</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <p className="text-blue-600 text-xs md:text-sm font-medium">In Progress</p>
          <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-1">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <p className="text-orange-600 text-xs md:text-sm font-medium">Submitted (Needs Eval)</p>
          <p className="text-2xl md:text-3xl font-bold text-orange-600 mt-1">{stats.submitted}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <p className="text-green-600 text-xs md:text-sm font-medium">Approved</p>
          <p className="text-2xl md:text-3xl font-bold text-green-600 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <p className="text-red-600 text-xs md:text-sm font-medium">Rejected</p>
          <p className="text-2xl md:text-3xl font-bold text-red-600 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, email, project title, or UUID..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            {/* Filter by Course */}
            <div className="w-full sm:w-auto min-w-[180px]">
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
              >
                <option value="all">All Domains / Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Status */}
            <div className="w-full sm:w-auto min-w-[140px]">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
              >
                <option value="all">All Status</option>
                <option value="in_progress">In Progress</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Rows Per Page */}
            <div className="w-full sm:w-auto">
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                title="Rows per page"
              >
                <option value={10}>10 per page</option>
                <option value={15}>15 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden flex-shrink-0">
              <button
                onClick={() => setViewMode('table')}
                title="List/Table View (Recommended)"
                className={`p-2.5 text-base transition-colors ${
                  viewMode === 'table' ? 'bg-[#C81E4E] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FiList />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Card View"
                className={`p-2.5 text-base transition-colors ${
                  viewMode === 'grid' ? 'bg-[#C81E4E] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FiGrid />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Display: List/Table Form (Primary) or Grid Form */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-pink-50 text-[#C81E4E] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            <FiFolder />
          </div>
          <h3 className="text-lg font-bold text-gray-800">No Projects Found</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
            {searchQuery || filterStatus !== 'all' || filterCourse !== 'all'
              ? 'No projects match your current filters. Try resetting search or filters.'
              : 'No projects have been assigned yet. Click below to assign a project to any student.'}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            {(searchQuery || filterStatus !== 'all' || filterCourse !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setFilterStatus('all')
                  setFilterCourse('all')
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={() => openAssignModal()}
              className="px-4 py-2 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg text-sm font-medium hover:shadow-md"
            >
              + Assign New Project
            </button>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* ======================== TABLE / LIST VIEW ======================== */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-600">
                  <th scope="col" className="py-3.5 px-4 w-12 text-center">#</th>
                  <th scope="col" className="py-3.5 px-4 min-w-[200px]">Student</th>
                  <th scope="col" className="py-3.5 px-4 min-w-[160px]">Course / Domain</th>
                  <th scope="col" className="py-3.5 px-4 min-w-[220px]">Project Details</th>
                  <th scope="col" className="py-3.5 px-4 min-w-[130px]">Deadline</th>
                  <th scope="col" className="py-3.5 px-4 min-w-[180px]">Submission & Links</th>
                  <th scope="col" className="py-3.5 px-4 min-w-[110px]">Status</th>
                  <th scope="col" className="py-3.5 px-4 min-w-[90px]">Score</th>
                  <th scope="col" className="py-3.5 px-4 min-w-[160px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedProjects.map((project, idx) => {
                  const studentName = project.users?.full_name || 'Unknown Student'
                  const studentEmail = project.users?.email || project.user_id
                  const initial = studentName.charAt(0).toUpperCase()
                  const isSubmitted = project.status === 'submitted'
                  const isApproved = project.status === 'approved'
                  const isRejected = project.status === 'rejected'
                  const hasDeliverables = project.project_deliverables && project.project_deliverables.length > 0
                  const hasLinks = !!(project.github_url || project.project_url || hasDeliverables)

                  return (
                    <tr key={project.id} className="hover:bg-pink-50/30 transition-colors">
                      {/* Index */}
                      <td className="py-3.5 px-4 text-center text-xs font-medium text-gray-400">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>

                      {/* Student */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate leading-snug">{studentName}</p>
                            <p className="text-xs text-gray-500 truncate">{studentEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">
                          {project.courses?.title || 'General'}
                        </span>
                      </td>

                      {/* Project Details & UUID */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900">{project.title}</div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <span className="font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                              {project.id.substring(0, 8)}...
                            </span>
                            <button
                              onClick={() => handleCopyId(project.id)}
                              title="Copy full UUID"
                              className="text-gray-400 hover:text-gray-700 transition-colors"
                            >
                              {copiedId === project.id ? <FiCheck className="text-green-600" /> : <FiCopy />}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Deadline */}
                      <td className="py-3.5 px-4 text-xs text-gray-600">
                        {project.deadline ? (
                          <div className="flex items-center gap-1">
                            <FiClock className="text-gray-400 flex-shrink-0" />
                            <span>{new Date(project.deadline).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No deadline</span>
                        )}
                        {project.submitted_at && (
                          <div className="text-[11px] text-green-700 font-medium mt-0.5">
                            Sub: {new Date(project.submitted_at).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      {/* Submission & Deliverables */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 max-w-[220px]">
                          {project.github_url && project.github_url.trim() && (
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 hover:text-purple-900 hover:underline"
                            >
                              <FiExternalLink className="text-[11px]" />
                              <span>GitHub Repo</span>
                            </a>
                          )}
                          {project.project_url && project.project_url.trim() && (
                            <a
                              href={project.project_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900 hover:underline"
                            >
                              <FiGlobe className="text-[11px]" />
                              <span>Live Website</span>
                            </a>
                          )}
                          {hasDeliverables && (
                            <div className="flex flex-wrap gap-1">
                              {project.project_deliverables!.map((d, i) => (
                                <a
                                  key={d.id || i}
                                  href={d.deploy_url || d.github_url || d.file_url || d.external_link || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium rounded bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
                                >
                                  <FiFile className="text-[10px]" /> File {i + 1}
                                </a>
                              ))}
                            </div>
                          )}
                          {!hasLinks && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 w-fit">
                              ⏳ Awaiting submission
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                            isApproved
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : isSubmitted
                              ? 'bg-orange-100 text-orange-800 border border-orange-300 font-bold'
                              : isRejected
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {project.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4">
                        {project.score !== undefined && project.score !== null ? (
                          <span className="font-bold text-gray-900 text-sm">
                            {project.score} <span className="text-xs text-gray-400 font-normal">/ 100</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEvalModal(project)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                            title="Evaluate student submission"
                          >
                            <FiCheckCircle className="text-sm" />
                            <span>Evaluate</span>
                          </button>
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors"
                            title="Delete project"
                          >
                            <FiTrash2 className="text-base" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600">
            <div>
              Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-semibold text-gray-900">
                {Math.min(currentPage * itemsPerPage, filteredProjects.length)}
              </span>{' '}
              of <span className="font-semibold text-gray-900">{filteredProjects.length}</span> projects
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <FiChevronLeft />
                <span>Prev</span>
              </button>

              <div className="text-xs font-semibold px-2">
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <span>Next</span>
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ======================== GRID / CARD VIEW ======================== */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
                <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] p-5 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{project.title}</h3>
                      <p className="text-xs text-pink-100 mt-1">UUID: {project.id}</p>
                    </div>
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-white/20 text-white backdrop-blur-sm">
                      {project.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="space-y-1.5 p-3.5 bg-gray-50 rounded-lg text-sm text-gray-600">
                    <p>
                      <span className="font-semibold text-gray-700">Student:</span> {project.users?.full_name || 'Unknown'}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-700">Email:</span> {project.users?.email || project.user_id}
                    </p>
                    {project.courses?.title && (
                      <p>
                        <span className="font-semibold text-gray-700">Course:</span> {project.courses.title}
                      </p>
                    )}
                    {project.deadline && (
                      <p>
                        <span className="font-semibold text-gray-700">Deadline:</span> {new Date(project.deadline).toLocaleDateString()}
                      </p>
                    )}
                    {project.score !== undefined && project.score !== null && (
                      <p className="font-bold text-[#C81E4E]">
                        Score: {project.score}/100
                      </p>
                    )}
                  </div>

                  {/* Submission Links Preview */}
                  <div className="space-y-1.5">
                    {project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-purple-700 hover:underline">
                        <FiExternalLink /> GitHub: {project.github_url}
                      </a>
                    )}
                    {project.project_url && (
                      <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-blue-700 hover:underline">
                        <FiGlobe /> Live: {project.project_url}
                      </a>
                    )}
                    {!project.github_url && !project.project_url && (!project.project_deliverables || project.project_deliverables.length === 0) && (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 font-medium">
                        ⏳ Awaiting student submission
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-3 border-t">
                    <button
                      onClick={() => openEvalModal(project)}
                      className="flex-1 flex items-center justify-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
                    >
                      <FiCheckCircle className="text-base" />
                      <span>Evaluate</span>
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="flex items-center justify-center space-x-1 px-4 py-2 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                    >
                      <FiTrash2 />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination in Grid Mode */}
          <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-between text-sm">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border rounded-lg text-xs disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border rounded-lg text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================== ASSIGN PROJECT MODAL ======================== */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold">Assign Project to Student</h3>
                <p className="text-pink-100 text-sm mt-1">Assign a new project assignment to any existing or newly added student</p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAssignSubmit} className="p-6 space-y-5">
              {assignError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-lg text-sm flex items-center gap-2">
                  <FiAlertCircle className="flex-shrink-0" />
                  <span>{assignError}</span>
                </div>
              )}

              {assignSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-3.5 rounded-lg text-sm flex items-center gap-2">
                  <FiCheck className="flex-shrink-0" />
                  <span>{assignSuccess}</span>
                </div>
              )}

              {/* Step 1: Select Student */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  1. Select Student <span className="text-red-500">*</span>
                </label>

                {selectedStudent ? (
                  <div className="flex items-center justify-between p-3.5 bg-pink-50/60 border border-pink-200 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white flex items-center justify-center font-bold text-sm">
                        {selectedStudent.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{selectedStudent.full_name}</p>
                        <p className="text-xs text-gray-600">{selectedStudent.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudent(null)
                        setAssignForm(prev => ({ ...prev, user_id: '' }))
                      }}
                      className="text-xs font-semibold text-[#C81E4E] hover:underline px-3 py-1.5 border border-[#C81E4E]/30 rounded-lg hover:bg-pink-100/50"
                    >
                      Change Student
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 border border-gray-300 rounded-xl p-3 bg-gray-50/50">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Search student by name or email..."
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 bg-white border border-gray-200 rounded-lg">
                      {loadingStudents ? (
                        <div className="p-4 text-center text-xs text-gray-500">Loading students...</div>
                      ) : modalFilteredStudents.length === 0 ? (
                        <div className="p-4 text-center text-xs text-gray-500">
                          {studentSearch ? 'No students found matching your search.' : 'No students available.'}
                        </div>
                      ) : (
                        modalFilteredStudents.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => {
                              setSelectedStudent(s)
                              setAssignForm(prev => ({ ...prev, user_id: s.id }))
                            }}
                            className="p-2.5 flex items-center justify-between hover:bg-pink-50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                {s.full_name?.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{s.full_name}</p>
                                <p className="text-xs text-gray-500 truncate">{s.email}</p>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-[#C81E4E] hover:underline flex-shrink-0">
                              Select
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Select Course / Domain */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  2. Course / Domain <span className="text-red-500">*</span>
                </label>
                <select
                  value={assignForm.course_id}
                  onChange={(e) => setAssignForm({ ...assignForm, course_id: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                >
                  <option value="">Select course / domain...</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  💡 The student will be automatically enrolled in this course if not already enrolled.
                </p>
              </div>

              {/* Step 3: Project Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  3. Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={assignForm.title}
                  onChange={(e) => setAssignForm({ ...assignForm, title: e.target.value })}
                  placeholder="e.g. E-Commerce Web Application, Social Media Dashboard..."
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                />

                {/* Quick Suggestion Pills */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-xs text-gray-400 self-center mr-1">Suggestions:</span>
                  {projectSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setAssignForm(prev => ({ ...prev, title: suggestion }))}
                      className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-pink-100 hover:text-[#C81E4E] rounded text-gray-700 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Description (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  4. Description / Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  value={assignForm.description}
                  onChange={(e) => setAssignForm({ ...assignForm, description: e.target.value })}
                  placeholder="Provide project objectives, guidelines, deliverables, and submission instructions..."
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E] resize-none"
                />
              </div>

              {/* Step 5: Submission Deadline (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  5. Submission Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={assignForm.deadline}
                  onChange={(e) => setAssignForm({ ...assignForm, deadline: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  disabled={assigning}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning || !assignForm.user_id || !assignForm.course_id || !assignForm.title.trim()}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg text-sm font-semibold shadow hover:shadow-lg disabled:opacity-50 transition-all flex items-center space-x-2"
                >
                  {assigning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Assigning...</span>
                    </>
                  ) : (
                    <>
                      <FiCheckCircle />
                      <span>Confirm & Assign</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================== EVALUATION MODAL ======================== */}
      {showEvalModal && evalProject && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold">Evaluate Project</h3>
                <p className="text-pink-100 text-sm mt-1">Student: {evalProject.users?.full_name || 'Student'}</p>
              </div>
              <button
                onClick={() => setShowEvalModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Project Info Banner */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 text-base">{evalProject.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">Course: {evalProject.courses?.title || 'General'}</p>
                {evalProject.description && (
                  <p className="text-xs text-gray-600 mt-2 bg-white p-2.5 rounded border border-gray-200">
                    {evalProject.description}
                  </p>
                )}
              </div>

              {/* Submitted Links & Files */}
              <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200">
                <h5 className="font-semibold text-purple-900 text-sm mb-3 flex items-center gap-1.5">
                  <FiFile /> Submitted Deliverables & Links:
                </h5>
                <div className="space-y-2 text-sm">
                  {evalProject.github_url && evalProject.github_url.trim() && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700 text-xs w-16">GitHub:</span>
                      <a
                        href={evalProject.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-700 hover:text-purple-900 underline flex items-center gap-1 text-xs break-all"
                      >
                        {evalProject.github_url} <FiExternalLink className="text-[10px]" />
                      </a>
                    </div>
                  )}

                  {evalProject.project_url && evalProject.project_url.trim() && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700 text-xs w-16">Deploy:</span>
                      <a
                        href={evalProject.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:text-blue-900 underline flex items-center gap-1 text-xs break-all"
                      >
                        {evalProject.project_url} <FiExternalLink className="text-[10px]" />
                      </a>
                    </div>
                  )}

                  {evalProject.project_deliverables && evalProject.project_deliverables.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {evalProject.project_deliverables.map((d, i) => (
                        <div key={d.id || i} className="flex items-center gap-2 text-xs">
                          <span className="font-semibold text-gray-700 w-16">File {i + 1}:</span>
                          <a
                            href={d.file_url || d.deploy_url || d.github_url || d.external_link || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-700 hover:underline flex items-center gap-1"
                          >
                            {d.description || d.file_url || 'View Deliverable'} <FiExternalLink className="text-[10px]" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  {!evalProject.github_url && !evalProject.project_url && (!evalProject.project_deliverables || evalProject.project_deliverables.length === 0) && (
                    <p className="text-xs text-gray-500 italic">No links or files submitted by student yet.</p>
                  )}
                </div>
              </div>

              {/* Scoring and Feedback Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Score (0 - 100) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={score}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val === '') {
                          setScore('')
                          return
                        }
                        const num = parseInt(val)
                        if (num < 0) setScore('0')
                        else if (num > 100) setScore('100')
                        else setScore(val)
                      }}
                      placeholder="e.g. 85"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-lg font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-bold">/ 100</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Score &ge; 40 will mark project as Approved</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Evaluation Feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide constructive feedback for student..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C81E4E] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 flex items-center justify-end space-x-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowEvalModal(false)}
                disabled={submittingEval}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEval}
                disabled={submittingEval || !score}
                className="px-6 py-2.5 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg text-sm font-semibold shadow hover:shadow-lg disabled:opacity-50 transition-all flex items-center space-x-2"
              >
                {submittingEval ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiCheckCircle />
                    <span>Save Evaluation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
