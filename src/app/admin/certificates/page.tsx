'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { FiDownload, FiPlus, FiTrash2, FiFilter, FiCheck, FiX } from 'react-icons/fi'
import Link from 'next/link'
import { api } from '@/lib/api'

interface Certificate {
  id: string
  user_id: string
  course_id: string
  certificate_number: string
  issued_at: string
  certificate_url?: string
  domain?: string
  users?: { id: string; full_name: string; email: string }
  courses?: { id: string; title: string; description?: string }
  status?: string
}

export default function CertificatesPage() {
  // State management
  const [filterCourse, setFilterCourse] = useState('all')
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [issueData, setIssueData] = useState({
    domain: 'Web Development',
    course_id: '',
    issue_type: 'Manual',
    send_email: true
  })
  const [eligibleStudents, setEligibleStudents] = useState<any[]>([])
  const [fetchingEligible, setFetchingEligible] = useState(false)
  const [issuing, setIssuing] = useState(false)
  const [issueResult, setIssueResult] = useState<any>(null)
  const [allEligible, setAllEligible] = useState<any>(null)
  const [loadingEligible, setLoadingEligible] = useState(true)

  useEffect(() => {
    loadData()
    loadAllEligible()
  }, [])

  const loadData = async () => {
    try {
      const [certsResult, coursesResult, studentsResult] = await Promise.all([
        api.certificates.getAll(),
        api.courses.getAll(),
        api.students.getAll()
      ])

      console.log('📜 Certificates API Response:', certsResult)

      if (certsResult.success && certsResult.data) {
        const certs = Array.isArray(certsResult.data) ? certsResult.data : []
        console.log('📜 Total certificates loaded:', certs.length)
        console.log('📜 Certificates data:', certs)
        setCertificates(certs)

        const total = certs.length
        const thisMonth = certs.filter((c: any) => {
          const issueDate = new Date(c.issued_at)
          const now = new Date()
          return issueDate.getMonth() === now.getMonth() &&
            issueDate.getFullYear() === now.getFullYear()
        }).length

        setStats({ total, thisMonth, pending: 0 })
      }

      if (coursesResult.success && coursesResult.data) {
        setCourses(Array.isArray(coursesResult.data) ? coursesResult.data : [])
      }

      if (studentsResult.success && studentsResult.data) {
        setStudents(Array.isArray(studentsResult.data) ? studentsResult.data : [])
      }
    } catch (error) {
      console.error('❌ Failed to load data:', error)
      alert('Failed to load certificates. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const loadAllEligible = async () => {
    setLoadingEligible(true)
    try {
      const result = await api.certificates.getAllEligible()
      if (result.success) {
        setAllEligible(result.data)
      }
    } catch (error) {
      console.error('Failed to load eligible students:', error)
    } finally {
      setLoadingEligible(false)
    }
  }

  const fetchEligibleStudents = async (courseId: string) => {
    if (!courseId) return
    setFetchingEligible(true)
    try {
      const result = await api.certificates.getEligible(courseId)
      if (result.success) {
        setEligibleStudents(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch eligible students:', error)
    } finally {
      setFetchingEligible(false)
    }
  }

  const handleIssueBatch = async () => {
    if (eligibleStudents.length === 0) return
    setIssuing(true)
    try {
      const result = await api.certificates.issueBatch({
        course_id: issueData.course_id,
        domain: issueData.domain,
        student_ids: eligibleStudents.map(s => s.id),
        issue_type: issueData.issue_type,
        send_email: issueData.send_email
      })
      if (result.success) {
        setIssueResult(result.data)
        loadData()
        loadAllEligible() // Refresh eligible list
      }
    } catch (error) {
      console.error('Batch issuance failed:', error)
    } finally {
      setIssuing(false)
    }
  }

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this certificate?')) return
    try {
      await api.certificates.revoke(id)
      loadData()
    } catch (error) {
      console.error('Failed to revoke certificate:', error)
    }
  }

  const getFilteredCertificates = () => {
    if (filterCourse === 'all') return certificates
    return certificates.filter(c => c.course_id === filterCourse)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificates...</p>
        </div>
      </div>
    )
  }

  const filteredCerts = getFilteredCertificates()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Certificates</h1>
          <p className="text-gray-600 mt-1 text-xs md:text-base">Manage course completion certificates</p>
        </div>
        <button
          onClick={() => {
            setIssueResult(null)
            setEligibleStudents([])
            setIssueData({
              domain: 'Web Development',
              course_id: '',
              issue_type: 'Manual',
              send_email: true
            })
            setShowIssueForm(true)
          }}
          className="flex items-center justify-center md:space-x-2 p-3 md:px-6 md:py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg md:rounded-xl font-bold hover:shadow-xl transition-all shadow-lg flex-shrink-0"
          title="Issue Certificate"
        >
          <FiPlus className="text-xl md:text-xl" />
          <span className="hidden md:inline">Issue Certificate</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Total Issued</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Issued This Month</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.thisMonth}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Active Certificates</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{stats.total}</p>
        </div>
      </div>

      {/* Eligible Students Section - NEW */}
      {loadingEligible ? (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : allEligible && allEligible.total_eligible > 0 ? (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-yellow-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                <span className="text-2xl">🎓</span>
                <span>Students Eligible for Certificates</span>
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                These students have completed all course requirements
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-orange-600">{allEligible.total_eligible}</p>
              <p className="text-sm font-medium text-gray-600">Total Eligible</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allEligible.courses.map((courseData: any) => (
              <div 
                key={courseData.course_id}
                className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-all border-l-4 border-orange-500"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">📚</span>
                      <h3 className="font-bold text-gray-800">{courseData.course_title}</h3>
                    </div>
                    <p className="text-xs text-gray-500">
                      ✓ {courseData.total_videos} videos
                      {courseData.total_tasks > 0 && ` • ${courseData.total_tasks} tasks`}
                      {courseData.total_projects > 0 && ` • ${courseData.total_projects} projects`}
                      {' • All requirements completed'}
                    </p>
                  </div>
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold flex-shrink-0">
                    {courseData.eligible_count} ready
                  </span>
                </div>
                
                <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                  {courseData.eligible_students.slice(0, 5).map((student: any) => (
                    <div key={student.id} className="flex items-start space-x-2 text-xs bg-gray-50 p-2 rounded">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {student.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{student.full_name}</p>
                        <p className="text-gray-500 truncate">{student.email}</p>
                      </div>
                    </div>
                  ))}
                  {courseData.eligible_count > 5 && (
                    <p className="text-xs text-gray-500 italic mt-1 text-center">
                      +{courseData.eligible_count - 5} more students...
                    </p>
                  )}
                </div>

                <button
                  onClick={() => {
                    setIssueData({
                      ...issueData,
                      course_id: courseData.course_id
                    })
                    fetchEligibleStudents(courseData.course_id)
                    setShowIssueForm(true)
                  }}
                  className="mt-3 w-full bg-gradient-to-r from-orange-500 to-pink-600 text-white py-2 rounded-lg font-bold text-sm hover:shadow-lg transition-all"
                >
                  Issue Certificates →
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl shadow-md p-6 border-2 border-dashed border-gray-200">
          <div className="text-center py-4">
            <span className="text-4xl mb-2 block">✅</span>
            <p className="text-gray-600 font-medium">No students currently eligible for certificates</p>
            <p className="text-gray-500 text-sm mt-1">Students will appear here when they complete all course videos</p>
          </div>
        </div>
      )}

      {/*  className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Total Issued</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Issued This Month</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.thisMonth}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Active Certificates</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{stats.total}</p>
        </div>
      </div>

      {/* Issue Certificate Modal */}
      {showIssueForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] p-6 text-white flex justify-between items-center">
              <h2 className="text-2xl font-bold">Smart Certificate Issuance</h2>
              <button
                onClick={() => setShowIssueForm(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto">
              {!issueResult ? (
                <div className="space-y-6">
                  {/* Course Selection Info */}
                  {issueData.course_id && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">📚</span>
                        <div>
                          <p className="text-xs font-bold text-blue-600 uppercase">Selected Course</p>
                          <p className="text-sm font-bold text-gray-800">
                            {courses.find(c => c.id === issueData.course_id)?.title || 'Select a course'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Select Course</label>
                    <select
                      value={issueData.course_id}
                      onChange={(e) => {
                        const val = e.target.value;
                        const selectedCourse = courses.find(c => c.id === val);
                        setIssueData({ 
                          ...issueData, 
                          course_id: val,
                          domain: selectedCourse?.title || 'Web Development'
                        });
                        fetchEligibleStudents(val);
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-[#C81E4E] outline-none transition-all font-medium"
                    >
                      <option value="">Choose course...</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Issue Type</label>
                      <div className="flex bg-gray-100 p-1 rounded-xl">
                        {['Manual', 'Auto'].map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setIssueData({ ...issueData, issue_type: type })}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${issueData.issue_type === type ? 'bg-white text-[#C81E4E] shadow-sm' : 'text-gray-500'
                              }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center pt-8">
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={issueData.send_email}
                          onChange={(e) => setIssueData({ ...issueData, send_email: e.target.checked })}
                          className="w-5 h-5 accent-[#C81E4E] cursor-pointer"
                        />
                        <span className="text-sm font-bold text-gray-700 group-hover:text-[#C81E4E] transition-colors">Notify via Email ✅</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-black text-gray-800 uppercase text-xs tracking-widest">Eligible Students Preview</h4>
                      {fetchingEligible && <div className="animate-spin h-4 w-4 border-2 border-[#C81E4E] border-t-transparent rounded-full"></div>}
                    </div>

                    {!issueData.course_id ? (
                      <p className="text-gray-400 text-sm text-center py-4 italic">Select a course to analyze eligible students</p>
                    ) : eligibleStudents.length === 0 && !fetchingEligible ? (
                      <p className="text-red-400 text-sm text-center py-4 font-bold">No eligible students found or already issued for this course.</p>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-3xl font-black text-gray-900">{eligibleStudents.length}</p>
                            <p className="text-xs font-bold text-gray-500 uppercase">Students Ready for Certificates</p>
                          </div>
                          <div className="bg-green-100 px-3 py-1 rounded-full">
                            <span className="text-green-700 font-bold text-xs">✓ All Videos Completed</span>
                          </div>
                        </div>
                        
                        {/* Student Details List */}
                        <div className="mt-4 max-h-64 overflow-y-auto space-y-2">
                          {eligibleStudents.map((student: any, index: number) => (
                            <div key={student.id} className="bg-white p-3 rounded-lg border border-gray-200 hover:border-[#C81E4E] transition-colors">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] flex items-center justify-center text-white font-bold flex-shrink-0">
                                  {(index + 1)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-gray-800 truncate">{student.full_name}</p>
                                  <p className="text-xs text-gray-500 truncate">📧 {student.email}</p>
                                  <p className="text-xs text-green-600 font-semibold mt-1">
                                    ✓ Videos: {student.completedVideos || 0}
                                    {student.completedTasks > 0 && ` • Tasks: ${student.completedTasks}`}
                                    {student.completedProjects > 0 && ` • Projects: ${student.completedProjects}`}
                                  </p>
                                </div>
                                <div className="text-green-500">
                                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex space-x-4">
                    <button
                      onClick={handleIssueBatch}
                      disabled={issuing || eligibleStudents.length === 0}
                      className="flex-1 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white py-4 rounded-xl font-black uppercase tracking-wider shadow-lg disabled:opacity-50 transition-all active:scale-95"
                    >
                      {issuing ? 'Processing...' : `Confirm & Issue ${eligibleStudents.length} Certificates`}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiCheck size={40} />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-2">Success!</h3>
                  <p className="text-gray-500 font-medium mb-8">
                    {issueResult.processed} certificates have been generated and deployed.
                  </p>

                  <div className="bg-gray-50 rounded-2xl p-6 mb-8 grid grid-cols-2 gap-4">
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-400 uppercase">Processed</p>
                      <p className="text-xl font-black text-gray-800">{issueResult.processed}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-400 uppercase">Emails Sent</p>
                      <p className="text-xl font-black text-green-600">{issueData.send_email ? issueResult.processed : 0}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowIssueForm(false)}
                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-black uppercase tracking-wider"
                  >
                    Close Window
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center space-x-4">
          <FiFilter className="text-gray-600 text-xl" />
          <div className="flex-1">
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
        </div>
      </div>

      {/* Certificates List */}
      {filteredCerts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No certificates found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCerts.map(cert => (
            <div
              key={cert.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">
                      {cert.users?.full_name || 'Unknown Student'}
                    </h3>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      Issued
                    </span>
                    {(!cert.users?.full_name || !cert.users?.email || !cert.courses?.title) && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                        Incomplete Data
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">
                    <span className="font-medium">Course:</span> {cert.courses?.title || 'Course Not Found'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span> {cert.users?.email || 'Email Not Available'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Certificate #:</span> {cert.certificate_number}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Domain:</span> {cert.domain || 'Web Development'}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Issued: {new Date(cert.issued_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <a
                    href={cert.certificate_url || `/certificate/${cert.certificate_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Download Certificate"
                  >
                    <FiDownload className="text-xl" />
                  </a>
                  <button
                    onClick={() => handleRevoke(cert.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Revoke Certificate"
                  >
                    <FiTrash2 className="text-xl" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

