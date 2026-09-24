'use client'

import { useState, useEffect } from 'react'
import { getSuperadminClientAuthToken } from '@/lib/auth-helpers'
import {
  FiMapPin,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiUsers,
  FiAward,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiKey,
  FiEye,
  FiCopy,
  FiCheck,
  FiSearch,
  FiSliders,
  FiLayers,
  FiArrowRight,
  FiPhone,
  FiMail,
  FiFileText,
  FiTrendingUp,
} from 'react-icons/fi'

interface SchoolItem {
  id: string
  school_id: string
  institution_type?: 'school' | 'coaching' | string
  name: string
  udise_code?: string
  school_type: string
  board: string
  address: string
  city: string
  state: string
  pincode: string
  contact_person_name: string
  designation: string
  official_email: string
  mobile: string
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED'
  bank_details?: any
  associated_scholarships_count?: number
  total_students_registered?: number
  total_verified_registrations?: number
  total_incentive_earned?: number
  total_incentive_paid?: number
  total_incentive_pending?: number
  assigned_scholarships?: any[]
  created_at: string
}

interface ScholarshipScheme {
  id: string
  title: string
  application_fee: number
  status: string
}

export default function SuperadminSchoolsPage() {
  const [schools, setSchools] = useState<SchoolItem[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [boardFilter, setBoardFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [summary, setSummary] = useState<any>({})

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false)
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)

  const [selectedSchool, setSelectedSchool] = useState<SchoolItem | null>(null)
  const [schoolDetailsData, setSchoolDetailsData] = useState<any>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsTab, setDetailsTab] = useState<'overview' | 'scholarships' | 'students' | 'results' | 'payouts'>('overview')

  const [schemesList, setSchemesList] = useState<ScholarshipScheme[]>([])
  const [assignedSchemes, setAssignedSchemes] = useState<any[]>([])

  // Temporary credentials display state
  const [credentials, setCredentials] = useState<{
    school_id: string
    institution_type?: string
    login_email: string
    temporary_password?: string
    login_url?: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    institution_type: 'school' as 'school' | 'coaching',
    udise_code: '',
    school_type: 'Private',
    board: 'CBSE',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contact_person_name: '',
    designation: 'Principal',
    official_email: '',
    mobile: '',
    status: 'ACTIVE',
    scholarship_ids: [] as string[],
    initial_scholarship_id: '',
    incentive_rate: 20,
    registration_fee: 100,
  })

  // Form state for Assign Scholarship Modal
  const [assignFormData, setAssignFormData] = useState({
    scholarship_id: '',
    registration_fee: 100,
    incentive_per_verified_registration: 20,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    status: 'ACTIVE',
  })

  const getToken = async () => await getSuperadminClientAuthToken()

  const fetchSchools = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      let url = `/api/superadmin/schools?status=${statusFilter}&board=${boardFilter}&category=${categoryFilter}`
      if (searchQuery) url += `&query=${encodeURIComponent(searchQuery)}`

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setSchools(data.data || [])
        setSummary(data.summary || {})
      }
    } catch (err) {
      console.error('Fetch schools error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSchemes = async () => {
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/scholarships', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && data.data) {
        setSchemesList(data.data)
      }
    } catch (err) {
      console.error('Fetch schemes error:', err)
    }
  }

  useEffect(() => {
    fetchSchools()
    fetchSchemes()
  }, [statusFilter, boardFilter, categoryFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchSchools()
  }

  // Open Add Partner Modal
  const handleOpenAdd = (defaultType: 'school' | 'coaching' = 'school') => {
    setFormData({
      name: '',
      institution_type: defaultType,
      udise_code: '',
      school_type: defaultType === 'coaching' ? 'Competitive Exam Institute (JEE/NEET)' : 'Private',
      board: defaultType === 'coaching' ? 'JEE & NEET Foundation' : 'CBSE',
      address: '',
      city: '',
      state: '',
      pincode: '',
      contact_person_name: '',
      designation: defaultType === 'coaching' ? 'Director / Center Head' : 'Principal',
      official_email: '',
      mobile: '',
      status: 'ACTIVE',
      scholarship_ids: schemesList.map((s) => s.id), // Pre-select all available schemes by default
      initial_scholarship_id: schemesList[0]?.id || '',
      incentive_rate: 20,
      registration_fee: 100,
    })
    setShowAddModal(true)
  }

  // Create Partner (School / Coaching) Submit
  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) {
        setShowAddModal(false)
        setCredentials(data.credentials)
        setShowCredentialsModal(true)
        fetchSchools()
      } else {
        alert(data.error || 'Failed to create institution partner')
      }
    } catch (err: any) {
      alert(err.message || 'Error creating institution partner')
    }
  }

  // Open Edit School / Coaching Modal
  const handleOpenEdit = (school: SchoolItem) => {
    setSelectedSchool(school)
    const isCoaching = school.institution_type === 'coaching' || school.school_id?.startsWith('CCH')
    
    const currentAssignments = school.assigned_scholarships || []
    const currentAssn = currentAssignments[0]
    const assignedIds = currentAssignments.map((a: any) => a.scholarship_id).filter(Boolean)

    setFormData({
      name: school.name,
      institution_type: isCoaching ? 'coaching' : 'school',
      udise_code: school.udise_code || '',
      school_type: school.school_type,
      board: school.board,
      address: school.address,
      city: school.city,
      state: school.state,
      pincode: school.pincode,
      contact_person_name: school.contact_person_name,
      designation: school.designation,
      official_email: school.official_email,
      mobile: school.mobile,
      status: school.status,
      scholarship_ids: assignedIds.length > 0 ? assignedIds : schemesList.map((s) => s.id),
      initial_scholarship_id: currentAssn?.scholarship_id || schemesList[0]?.id || '',
      incentive_rate: currentAssn?.incentive_per_verified_registration !== undefined ? Number(currentAssn.incentive_per_verified_registration) : 20,
      registration_fee: currentAssn?.registration_fee !== undefined ? Number(currentAssn.registration_fee) : 100,
    })
    setShowEditModal(true)
  }

  // Update Partner Submit
  const handleUpdateSchool = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSchool) return
    try {
      const token = await getToken()
      const res = await fetch(`/api/superadmin/schools/${selectedSchool.school_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) {
        setShowEditModal(false)
        fetchSchools()
      } else {
        alert(data.error || 'Failed to update partner details')
      }
    } catch (err: any) {
      alert(err.message || 'Error updating partner')
    }
  }

  // Quick Status Toggle (Approve, Suspend, Activate)
  const handleQuickStatusChange = async (school: SchoolItem, newStatus: string) => {
    if (!confirm(`Are you sure you want to change status of ${school.name} to ${newStatus}?`)) return
    try {
      const token = await getToken()
      const res = await fetch(`/api/superadmin/schools/${school.school_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        fetchSchools()
      } else {
        alert(data.error)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Delete Partner Tie-up
  const handleDeleteSchool = async (school: SchoolItem) => {
    if (!confirm(`⚠️ ARE YOU SURE YOU WANT TO PERMANENTLY DELETE THIS PARTNER TIE-UP?\n\nPartner Name: ${school.name}\nPartner ID: ${school.school_id}\n\nThis will permanently delete the account, assigned schemes, and tie-up credentials.`)) {
      return
    }

    try {
      const token = await getToken()
      const res = await fetch(`/api/superadmin/schools/${school.school_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        alert(`Partner "${school.name}" deleted successfully.`)
        setShowDetailsDrawer(false)
        setShowEditModal(false)
        fetchSchools()
      } else {
        alert(data.error || 'Failed to delete partner.')
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting partner.')
    }
  }

  // Open Reset Password Modal
  const handleOpenReset = (school: SchoolItem) => {
    setSelectedSchool(school)
    setShowResetModal(true)
  }

  // Execute Password Reset
  const handleExecuteResetPassword = async () => {
    if (!selectedSchool) return
    try {
      const token = await getToken()
      const res = await fetch(`/api/superadmin/schools/${selectedSchool.school_id}/reset-password`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setShowResetModal(false)
        setCredentials(data.credentials)
        setShowCredentialsModal(true)
      } else {
        alert(data.error || 'Failed to reset password')
      }
    } catch (err: any) {
      alert(err.message || 'Error resetting password')
    }
  }

  // Open Manage Scholarships Modal
  const handleOpenManageScholarships = async (school: SchoolItem) => {
    setSelectedSchool(school)
    try {
      const token = await getToken()
      const res = await fetch(`/api/superadmin/schools/${school.school_id}/scholarships`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setAssignedSchemes(data.assigned || [])
        setAssignFormData({
          scholarship_id: data.available_schemes?.[0]?.id || schemesList[0]?.id || '',
          registration_fee: 100,
          incentive_per_verified_registration: 20,
          start_date: new Date().toISOString().split('T')[0],
          end_date: '',
          status: 'ACTIVE',
        })
      }
    } catch (err) {
      console.error(err)
    }
    setShowAssignModal(true)
  }

  // Assign Scholarship to School Submit
  const handleAssignScholarshipSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSchool || !assignFormData.scholarship_id) return
    try {
      const token = await getToken()
      const res = await fetch(`/api/superadmin/schools/${selectedSchool.school_id}/scholarships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(assignFormData),
      })
      const data = await res.json()
      if (data.success) {
        // Refresh assigned scholarships
        const refreshRes = await fetch(`/api/superadmin/schools/${selectedSchool.school_id}/scholarships`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const refreshData = await refreshRes.json()
        if (refreshData.success) {
          setAssignedSchemes(refreshData.assigned || [])
        }
        fetchSchools()
      } else {
        alert(data.error || 'Failed to assign scholarship')
      }
    } catch (err: any) {
      alert(err.message || 'Error assigning scholarship')
    }
  }

  // Delete Assignment
  const handleDeleteAssignment = async (scholarshipId: string) => {
    if (!selectedSchool || !confirm('Remove this scholarship assignment from the school?')) return
    try {
      const token = await getToken()
      await fetch(`/api/superadmin/schools/${selectedSchool.school_id}/scholarships?scholarship_id=${scholarshipId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setAssignedSchemes(assignedSchemes.filter((a) => a.scholarship_id !== scholarshipId))
      fetchSchools()
    } catch (err) {
      console.error(err)
    }
  }

  // Open Full Details Drawer
  const handleOpenDetails = async (school: SchoolItem) => {
    setSelectedSchool(school)
    setShowDetailsDrawer(true)
    setDetailsLoading(true)
    setDetailsTab('overview')
    try {
      const token = await getToken()
      const res = await fetch(`/api/superadmin/schools/${school.school_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setSchoolDetailsData(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setDetailsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiMapPin className="text-[#C81E4E]" />
            School & Coaching Tie-up Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage authorized partner schools, coaching institutes, login credentials, scholarship tie-ups, student enrollments, and incentive payouts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSchools}
            className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenAdd('school')}
              className="px-4 py-2 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2"
            >
              <FiPlus />
              Add Partner
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Total Partners</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{summary.total_schools || schools.length}</p>
          <span className="text-[10px] text-gray-400 font-medium">
            🏫 {summary.total_pure_schools || schools.filter(s => s.institution_type !== 'coaching').length} Schools • 🎓 {summary.total_coaching || schools.filter(s => s.institution_type === 'coaching').length} Coaching
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-emerald-600 font-medium">Active Tie-ups</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{summary.active_schools || 0}</p>
          <span className="text-[10px] text-emerald-500">Live partner portals</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-amber-600 font-medium">Pending Review</p>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{summary.pending_schools || 0}</p>
          <span className="text-[10px] text-amber-500">Awaiting approval</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-purple-600 font-medium">Partner Registrations</p>
          <p className="text-2xl font-extrabold text-purple-700 mt-1">{summary.total_school_registrations || 0}</p>
          <span className="text-[10px] text-purple-500">Verified: {summary.total_verified_school_registrations || 0}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-pink-600 font-medium">Incentive Generated</p>
          <p className="text-2xl font-extrabold text-pink-700 mt-1">₹{(summary.total_incentive_generated || 0).toLocaleString()}</p>
          <span className="text-[10px] text-pink-500">From verified entries</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-blue-600 font-medium">Pending Payouts</p>
          <p className="text-2xl font-extrabold text-blue-700 mt-1">₹{(summary.total_incentive_pending || 0).toLocaleString()}</p>
          <span className="text-[10px] text-blue-500">To be disbursed</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by school/coaching name, ID (e.g. SCH000101, CCH000101), city, UDISE/Center code, or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF2D8D]"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-gray-800 text-white text-sm font-semibold rounded-xl hover:bg-gray-900">
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Institution Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Type:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 bg-white"
            >
              <option value="ALL">All Partners</option>
              <option value="school">🏫 Schools Only</option>
              <option value="coaching">🎓 Coaching Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Board / Stream:</span>
            <select
              value={boardFilter}
              onChange={(e) => setBoardFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 bg-white"
            >
              <option value="ALL">All Boards & Streams</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="STATE BOARD">State Board</option>
              <option value="JEE & NEET Foundation">JEE & NEET</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schools & Coaching Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading partner institutions...</div>
        ) : schools.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-2">
            <p className="text-base font-semibold text-gray-600">No partner institutions found matching criteria.</p>
            <p className="text-xs">Click "Add Partner" above to register a new school or coaching tie-up.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-600 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Partner ID & Name</th>
                  <th className="px-4 py-3.5">Category & Board / Stream</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Authorized Contact</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-center">Tie-up Schemes</th>
                  <th className="px-4 py-3.5 text-center">Students</th>
                  <th className="px-4 py-3.5">Incentive Earned</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {schools.map((sch) => {
                  const isCoaching = sch.institution_type === 'coaching' || sch.school_id?.startsWith('CCH')
                  return (
                    <tr key={sch.id || sch.school_id} className="hover:bg-pink-50/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${
                              isCoaching 
                                ? 'text-amber-800 bg-amber-50 border-amber-200' 
                                : 'text-purple-700 bg-purple-50 border-purple-100'
                            }`}>
                              {sch.school_id}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isCoaching 
                                ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                                : 'bg-blue-50 text-blue-700 border border-blue-100'
                            }`}>
                              {isCoaching ? '🎓 Coaching' : '🏫 School'}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-900 text-sm mt-1">{sch.name}</h4>
                          {sch.udise_code && (
                            <p className="text-[10px] text-gray-400">
                              {isCoaching ? 'Center Code' : 'UDISE'}: {sch.udise_code}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-gray-800">{sch.board}</span>
                        <p className="text-[11px] text-gray-400">{sch.school_type}</p>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="text-gray-800 font-medium">{sch.city}</span>
                        <p className="text-[11px] text-gray-400">{sch.state}</p>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-gray-900">{sch.contact_person_name}</p>
                          <p className="text-[11px] text-gray-500">{sch.designation}</p>
                          <p className="text-[11px] text-gray-400 flex items-center gap-1 font-mono">
                            <FiMail size={10} /> {sch.official_email}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            sch.status === 'ACTIVE' || sch.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : sch.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-red-50 text-red-700 border border-red-100'
                          }`}
                        >
                          {sch.status === 'ACTIVE' && <FiCheckCircle size={11} />}
                          {sch.status === 'PENDING' && <FiAlertCircle size={11} />}
                          {sch.status === 'SUSPENDED' && <FiXCircle size={11} />}
                          {sch.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => handleOpenManageScholarships(sch)}
                          className="px-2.5 py-1 bg-pink-50 text-[#C81E4E] hover:bg-pink-100 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 border border-pink-100"
                          title="Manage Assigned Scholarships"
                        >
                          <FiAward size={12} />
                          {sch.associated_scholarships_count || 0} Schemes
                        </button>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="font-bold text-gray-900 text-sm">
                          {sch.total_students_registered || 0}
                        </span>
                        <p className="text-[10px] text-emerald-600 font-semibold">
                          {sch.total_verified_registrations || 0} verified
                        </p>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-bold text-gray-900 text-sm">
                          ₹{(sch.total_incentive_earned || 0).toLocaleString()}
                        </span>
                        <p className="text-[10px] text-gray-400">
                          Pending: ₹{(sch.total_incentive_pending || 0).toLocaleString()}
                        </p>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenDetails(sch)}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="View Full Dashboard & Analytics"
                          >
                            <FiEye size={15} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(sch)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Partner Information"
                          >
                            <FiEdit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleOpenReset(sch)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Reset Temporary Password"
                          >
                            <FiKey size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteSchool(sch)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Partner Tie-up"
                          >
                            <FiTrash2 size={15} />
                          </button>
                          {sch.status === 'PENDING' && (
                            <button
                              onClick={() => handleQuickStatusChange(sch, 'ACTIVE')}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                            >
                              Approve
                            </button>
                          )}
                          {sch.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleQuickStatusChange(sch, 'SUSPENDED')}
                              className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold hover:bg-amber-100 transition-colors"
                            >
                              Suspend
                            </button>
                          )}
                          {sch.status === 'SUSPENDED' && (
                            <button
                              onClick={() => handleQuickStatusChange(sch, 'ACTIVE')}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition-colors"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD PARTNER MODAL (SCHOOL & COACHING)                            */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {formData.institution_type === 'coaching' ? 'Add New Partner Coaching Center' : 'Add New Partner School'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formData.institution_type === 'coaching' 
                    ? 'Coaching ID (CCH...) & initial login credentials will be generated automatically.' 
                    : 'School ID (SCH...) & initial login credentials will be generated automatically.'}
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSchool} className="space-y-6">
              {/* Section 1: Basic Partner Information */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#C81E4E] uppercase tracking-wider">
                  1. Institution Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Institution Category Dropdown */}
                  <div className="md:col-span-2 bg-pink-50/40 p-3.5 rounded-2xl border border-pink-100">
                    <label className="block text-xs font-bold text-purple-900 uppercase mb-1">
                      Institution Category *
                    </label>
                    <div className="grid grid-cols-2 gap-3 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          institution_type: 'school',
                          designation: 'Principal',
                          school_type: 'Private',
                          board: 'CBSE'
                        })}
                        className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                          formData.institution_type === 'school'
                            ? 'bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white border-transparent shadow-md'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        🏫 Partner School
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          institution_type: 'coaching',
                          designation: 'Director / Center Head',
                          school_type: 'Competitive Exam Institute (JEE/NEET)',
                          board: 'JEE & NEET Foundation'
                        })}
                        className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                          formData.institution_type === 'coaching'
                            ? 'bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white border-transparent shadow-md'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        🎓 Coaching Center / Academy
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      {formData.institution_type === 'coaching' ? 'Coaching / Institute Name *' : 'School Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={formData.institution_type === 'coaching' ? 'e.g. Allen Career Institute, Resonance, Physics Wallah, Career Point' : 'e.g. ABC Public School'}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF2D8D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      {formData.institution_type === 'coaching' ? 'Center / Registration Code' : 'UDISE Code'}
                    </label>
                    <input
                      type="text"
                      placeholder={formData.institution_type === 'coaching' ? 'e.g. CCH-DEL-01 or Reg. No.' : 'e.g. 09012345678'}
                      value={formData.udise_code}
                      onChange={(e) => setFormData({ ...formData, udise_code: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      {formData.institution_type === 'coaching' ? 'Coaching Model / Category *' : 'School Type *'}
                    </label>
                    <select
                      value={formData.school_type}
                      onChange={(e) => setFormData({ ...formData, school_type: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    >
                      {formData.institution_type === 'coaching' ? (
                        <>
                          <option value="Competitive Exam Institute (JEE/NEET)">Competitive Exam Institute (JEE/NEET)</option>
                          <option value="Foundation & Integrated Academy">Foundation & Integrated Academy</option>
                          <option value="Private Coaching Center">Private Coaching Center</option>
                          <option value="Test Prep / Tutorial Classes">Test Prep / Tutorial Classes</option>
                          <option value="Other">Other Coaching / Academy</option>
                        </>
                      ) : (
                        <>
                          <option value="Private">Private</option>
                          <option value="Government">Government</option>
                          <option value="Government Aided">Government Aided</option>
                          <option value="International / Other">International / Other</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      {formData.institution_type === 'coaching' ? 'Exam Stream / Target Board *' : 'Affiliation Board *'}
                    </label>
                    <select
                      value={formData.board}
                      onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    >
                      {formData.institution_type === 'coaching' ? (
                        <>
                          <option value="JEE & NEET Foundation">JEE & NEET Foundation</option>
                          <option value="CBSE & State Board Prep">CBSE & State Board Prep</option>
                          <option value="UPSC / State PCS / SSC">UPSC / State PCS / SSC</option>
                          <option value="Olympiad / NTSE / KVPY">Olympiad / NTSE / KVPY</option>
                          <option value="Multiple Streams / General">Multiple Streams / General</option>
                          <option value="Other">Other Exam Stream</option>
                        </>
                      ) : (
                        <>
                          <option value="CBSE">CBSE</option>
                          <option value="ICSE">ICSE</option>
                          <option value="State Board">State Board</option>
                          <option value="IB / Cambridge">IB / Cambridge</option>
                          <option value="Other">Other</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Initial Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    >
                      <option value="ACTIVE">ACTIVE (Immediate Access)</option>
                      <option value="PENDING">PENDING (Review First)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Street address, center / campus locality"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. New Delhi"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">State *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Delhi"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 110085"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Authorized Contact & Login Email */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold text-[#C81E4E] uppercase tracking-wider">
                  2. Authorized Contact Person & Credentials
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      {formData.institution_type === 'coaching' ? 'Director / Center Head Name *' : 'Contact Person Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={formData.institution_type === 'coaching' ? 'e.g. Er. Rajesh Bansal' : 'e.g. Dr. Ramesh Chandra'}
                      value={formData.contact_person_name}
                      onChange={(e) => setFormData({ ...formData, contact_person_name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Designation *
                    </label>
                    <select
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    >
                      {formData.institution_type === 'coaching' ? (
                        <>
                          <option value="Director / Center Head">Director / Center Head</option>
                          <option value="Managing Director">Managing Director</option>
                          <option value="Branch Manager">Branch Manager</option>
                          <option value="Scholarship Coordinator">Scholarship Coordinator</option>
                          <option value="Faculty Head / Incharge">Faculty Head / Incharge</option>
                          <option value="Admin">Admin</option>
                          <option value="Other">Other</option>
                        </>
                      ) : (
                        <>
                          <option value="Principal">Principal</option>
                          <option value="School Administrator">School Administrator</option>
                          <option value="Scholarship Coordinator">Scholarship Coordinator</option>
                          <option value="Vice Principal">Vice Principal</option>
                          <option value="Other">Other</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      {formData.institution_type === 'coaching' ? 'Official Coaching Email (Login ID) *' : 'Official School Email (Login ID) *'}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder={formData.institution_type === 'coaching' ? 'coaching.branch@gmail.com' : 'abcschool@gmail.com'}
                      value={formData.official_email}
                      onChange={(e) => setFormData({ ...formData, official_email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Official Contact Mobile *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+91 9876500101"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Scholarship Tie-up Assignment (Multi-Select) */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#C81E4E] uppercase tracking-wider">
                      3. Assign Scholarship Scheme Tie-ups ({formData.scholarship_ids.length} Selected)
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Selected schemes will be instantly accessible on the partner's dashboard.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, scholarship_ids: schemesList.map((s) => s.id) })}
                      className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, scholarship_ids: [] })}
                      className="text-[11px] font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Scholarship Checkbox List */}
                <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                  {schemesList.length === 0 ? (
                    <p className="text-xs text-gray-400 p-3 bg-gray-50 rounded-xl text-center">No scholarships created yet.</p>
                  ) : (
                    schemesList.map((s) => {
                      const isSelected = formData.scholarship_ids.includes(s.id)
                      return (
                        <label
                          key={s.id}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-pink-50/60 border-pink-200 shadow-sm'
                              : 'bg-white border-gray-100 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ ...formData, scholarship_ids: [...formData.scholarship_ids, s.id] })
                                } else {
                                  setFormData({
                                    ...formData,
                                    scholarship_ids: formData.scholarship_ids.filter((id) => id !== s.id),
                                  })
                                }
                              }}
                              className="w-4 h-4 text-[#FF2D8D] rounded border-gray-300 focus:ring-[#FF2D8D]"
                            />
                            <div>
                              <p className="text-xs font-bold text-gray-900">{s.title}</p>
                              <p className="text-[10px] text-gray-400">ID: {s.id} • Fee: ₹{s.application_fee || 100}</p>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected ? 'bg-pink-200 text-pink-800' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {isSelected ? 'Assigned' : 'Optional'}
                          </span>
                        </label>
                      )
                    })
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Student Registration Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.registration_fee}
                      onChange={(e) => setFormData({ ...formData, registration_fee: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      {formData.institution_type === 'coaching' ? 'Coaching Incentive per Verified (₹)' : 'School Incentive per Verified (₹)'}
                    </label>
                    <input
                      type="number"
                      value={formData.incentive_rate}
                      onChange={(e) => setFormData({ ...formData, incentive_rate: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] shadow-md"
                >
                  {formData.institution_type === 'coaching' ? 'Create Coaching & Generate Credentials' : 'Create School & Generate Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1B: EDIT PARTNER MODAL                                              */}
      {/* ========================================================================= */}
      {showEditModal && selectedSchool && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {formData.institution_type === 'coaching' ? 'Edit Coaching Partner' : 'Edit School Partner'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Partner ID: {selectedSchool.school_id}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSchool} className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#C81E4E] uppercase tracking-wider">
                  Partner Information & Status
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Institution Category *
                    </label>
                    <select
                      value={formData.institution_type}
                      onChange={(e) => setFormData({ ...formData, institution_type: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold"
                    >
                      <option value="school">🏫 School</option>
                      <option value="coaching">🎓 Coaching Center / Academy</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      {formData.institution_type === 'coaching' ? 'Coaching / Institute Name *' : 'School Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF2D8D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      {formData.institution_type === 'coaching' ? 'Center / Reg Code' : 'UDISE Code'}
                    </label>
                    <input
                      type="text"
                      value={formData.udise_code}
                      onChange={(e) => setFormData({ ...formData, udise_code: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      {formData.institution_type === 'coaching' ? 'Exam Stream / Target Board *' : 'Affiliation Board *'}
                    </label>
                    <input
                      type="text"
                      value={formData.board}
                      onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                      placeholder={formData.institution_type === 'coaching' ? 'e.g. JEE & NEET Foundation' : 'e.g. CBSE'}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Contact Person Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contact_person_name}
                      onChange={(e) => setFormData({ ...formData, contact_person_name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Official Contact Mobile *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Tie-up Account Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold"
                    >
                      <option value="ACTIVE">ACTIVE (Operational)</option>
                      <option value="SUSPENDED">SUSPENDED (Temporarily Blocked)</option>
                      <option value="PENDING">PENDING (Approval Awaited)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SCHOLARSHIP SCHEMES, FORM FEE & INCENTIVE SETTINGS */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#C81E4E] uppercase tracking-wider">
                    Tie-up Schemes, Form Fee & Incentive Settings
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Net Intake: ₹{Math.max(0, formData.registration_fee - formData.incentive_rate)} / student
                  </span>
                </div>

                {/* Form Fee & Incentive Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 uppercase mb-1">
                      Student Form Fee (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">₹</span>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.registration_fee}
                        onChange={(e) => setFormData({ ...formData, registration_fee: Number(e.target.value) })}
                        placeholder="e.g. 100"
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-gray-900 bg-white focus:ring-2 focus:ring-[#FF2D8D] focus:border-transparent"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      This fee will be charged to candidates registering under this partner.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 uppercase mb-1">
                      {formData.institution_type === 'coaching' ? 'Coaching Incentive per Student (₹) *' : 'School Incentive per Student (₹) *'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">₹</span>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.incentive_rate}
                        onChange={(e) => setFormData({ ...formData, incentive_rate: Number(e.target.value) })}
                        placeholder="e.g. 20"
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-emerald-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Payout credited to the institution for each verified student registration.
                    </p>
                  </div>
                </div>

                {/* Assigned Schemes Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Assigned Scholarship Schemes ({formData.scholarship_ids.length} Selected)
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {schemesList.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No scholarship schemes found in database.</p>
                    ) : (
                      schemesList.map((s) => {
                        const isSelected = formData.scholarship_ids.includes(s.id)
                        return (
                          <label
                            key={s.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-pink-50/70 border-pink-200 shadow-sm'
                                : 'bg-white border-gray-100 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({ ...formData, scholarship_ids: [...formData.scholarship_ids, s.id] })
                                  } else {
                                    setFormData({
                                      ...formData,
                                      scholarship_ids: formData.scholarship_ids.filter((id) => id !== s.id),
                                    })
                                  }
                                }}
                                className="w-4 h-4 text-[#FF2D8D] rounded border-gray-300 focus:ring-[#FF2D8D]"
                              />
                              <div>
                                <p className="text-xs font-bold text-gray-900">{s.title}</p>
                                <p className="text-[10px] text-gray-400">ID: {s.id} • Standard Scheme Fee: ₹{s.application_fee || 100}</p>
                              </div>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isSelected ? 'bg-pink-200 text-pink-800' : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {isSelected ? 'Assigned' : 'Unassigned'}
                            </span>
                          </label>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => handleDeleteSchool(selectedSchool)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 flex items-center gap-1.5 transition-colors"
                >
                  <FiTrash2 size={14} /> Delete Partner
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREDENTIALS GENERATED ONCE MODAL                                 */}
      {/* ========================================================================= */}
      {showCredentialsModal && credentials && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FiKey size={24} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {credentials.institution_type === 'coaching' ? 'Coaching Partner Credentials Generated' : 'School Partner Credentials Generated'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Please copy and securely share these login credentials with the authorized contact. The password is encrypted in the database and will not be displayed again.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/70 font-mono text-xs space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-sans font-bold">Partner ID:</span>
                <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">{credentials.school_id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-sans font-bold">Login Email:</span>
                <span className="text-gray-900 font-semibold">{credentials.login_email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-sans font-bold">Temporary Password:</span>
                <span className="text-pink-700 font-bold bg-pink-50 px-2 py-0.5 rounded">{credentials.temporary_password}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-gray-500 font-sans font-bold">Partner Portal URL:</span>
                <span className="text-blue-600 font-bold">/school-portal/login</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  copyToClipboard(
                    `${credentials.institution_type === 'coaching' ? 'COACHING' : 'SCHOOL'} PARTNER LOGIN CREDENTIALS\nPartner ID: ${credentials.school_id}\nLogin Email: ${credentials.login_email}\nTemporary Password: ${credentials.temporary_password}\nPortal Link: ${window.location.origin}/school-portal/login`
                  )
                }
                className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
              >
                {copied ? <FiCheck /> : <FiCopy />}
                {copied ? 'Credentials Copied!' : 'Copy Credentials Snippet'}
              </button>
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ASSIGN SCHOLARSHIPS TO SCHOOL                                    */}
      {/* ========================================================================= */}
      {showAssignModal && selectedSchool && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Manage Scholarships for {selectedSchool.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">School ID: {selectedSchool.school_id}</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                ✕
              </button>
            </div>

            {/* Currently Assigned Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Currently Associated Scholarships ({assignedSchemes.length})
              </h4>
              {assignedSchemes.length === 0 ? (
                <p className="text-xs text-gray-400 p-4 bg-gray-50 rounded-xl text-center">
                  No scholarships assigned yet. Assign a scholarship below.
                </p>
              ) : (
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-600 font-bold">
                      <tr>
                        <th className="p-2.5">Scholarship Scheme</th>
                        <th className="p-2.5">Reg. Fee</th>
                        <th className="p-2.5">School Incentive</th>
                        <th className="p-2.5">Enrolled</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {assignedSchemes.map((assn) => (
                        <tr key={assn.id}>
                          <td className="p-2.5 font-bold text-gray-900">{assn.scheme?.title || assn.scholarship_id}</td>
                          <td className="p-2.5">₹{assn.registration_fee}</td>
                          <td className="p-2.5 text-pink-700 font-bold">₹{assn.incentive_per_verified_registration}/student</td>
                          <td className="p-2.5">{assn.students_registered_count || 0}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">
                              {assn.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => handleDeleteAssignment(assn.scholarship_id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Unlink scholarship"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Assign New Scholarship Form */}
            <form onSubmit={handleAssignScholarshipSubmit} className="space-y-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-[#C81E4E] uppercase tracking-wider">
                Assign / Update Scholarship Tie-up
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Select Scholarship Scheme *
                  </label>
                  <select
                    required
                    value={assignFormData.scholarship_id}
                    onChange={(e) => setAssignFormData({ ...assignFormData, scholarship_id: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  >
                    {schemesList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Student Registration Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={assignFormData.registration_fee}
                    onChange={(e) => setAssignFormData({ ...assignFormData, registration_fee: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    School Incentive per Verified Student (₹)
                  </label>
                  <input
                    type="number"
                    value={assignFormData.incentive_per_verified_registration}
                    onChange={(e) =>
                      setAssignFormData({ ...assignFormData, incentive_per_verified_registration: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] shadow"
                >
                  Assign to School
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: RESET PASSWORD CONFIRMATION                                      */}
      {/* ========================================================================= */}
      {showResetModal && selectedSchool && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Reset School Portal Password</h3>
            <p className="text-xs text-gray-600">
              This will generate a new secure temporary password for <b>{selectedSchool.name}</b> ({selectedSchool.official_email}) and require password change on their next login.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteResetPassword}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow"
              >
                Confirm & Generate New Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER: COMPLETE SCHOOL DETAILS                                           */}
      {/* ========================================================================= */}
      {showDetailsDrawer && selectedSchool && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded">
                  {selectedSchool.school_id}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{selectedSchool.name}</h3>
                <p className="text-xs text-gray-400">{selectedSchool.city}, {selectedSchool.state}</p>
              </div>
              <button onClick={() => setShowDetailsDrawer(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                ✕
              </button>
            </div>

            {/* Drawer Tabs */}
            <div className="flex border-b border-gray-100 gap-4 text-xs font-bold">
              {(['overview', 'scholarships', 'students', 'payouts'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDetailsTab(tab)}
                  className={`pb-2 capitalize transition-colors ${
                    detailsTab === tab
                      ? 'text-[#C81E4E] border-b-2 border-[#C81E4E]'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {detailsLoading ? (
              <div className="p-12 text-center text-gray-400">Loading details...</div>
            ) : (
              <div className="space-y-4">
                {detailsTab === 'overview' && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl">
                      <div>
                        <span className="text-gray-400">Affiliation:</span>
                        <p className="font-bold text-gray-900 mt-0.5">{selectedSchool.board} ({selectedSchool.school_type})</p>
                      </div>
                      <div>
                        <span className="text-gray-400">UDISE Code:</span>
                        <p className="font-bold text-gray-900 mt-0.5">{selectedSchool.udise_code || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Authorized Contact:</span>
                        <p className="font-bold text-gray-900 mt-0.5">{selectedSchool.contact_person_name} ({selectedSchool.designation})</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Official Mobile:</span>
                        <p className="font-bold text-gray-900 mt-0.5">{selectedSchool.mobile}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-400">Login Email:</span>
                        <p className="font-bold text-gray-900 mt-0.5 font-mono">{selectedSchool.official_email}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
                      <h4 className="font-bold text-purple-900 mb-2">Performance & Financial Summary</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="text-gray-500 text-[10px]">Registered:</span>
                          <p className="font-bold text-purple-800 text-sm">{schoolDetailsData?.stats?.total_registered || 0}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-[10px]">Verified:</span>
                          <p className="font-bold text-emerald-700 text-sm">{schoolDetailsData?.stats?.total_verified || 0}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-[10px]">Incentive Earned:</span>
                          <p className="font-bold text-pink-700 text-sm">₹{schoolDetailsData?.stats?.total_incentive_earned || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <h4 className="font-bold text-gray-800 mb-2">Bank Payout / KYC Details</h4>
                      {selectedSchool.bank_details?.account_number ? (
                        <div className="space-y-1 text-[11px]">
                          <p><span className="text-gray-500">Beneficiary:</span> {selectedSchool.bank_details.beneficiary_name}</p>
                          <p><span className="text-gray-500">Bank:</span> {selectedSchool.bank_details.bank_name}</p>
                          <p><span className="text-gray-500">Account No:</span> ••••••••{selectedSchool.bank_details.account_number.slice(-4)}</p>
                          <p><span className="text-gray-500">IFSC Code:</span> {selectedSchool.bank_details.ifsc_code}</p>
                        </div>
                      ) : (
                        <p className="text-gray-400 text-[11px]">No bank payout details submitted yet.</p>
                      )}
                    </div>
                  </div>
                )}

                {detailsTab === 'scholarships' && (
                  <div className="space-y-3">
                    {(schoolDetailsData?.assigned_scholarships || []).map((assn: any) => (
                      <div key={assn.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-gray-900">{assn.scholarships?.title || assn.scholarship_id}</p>
                          <p className="text-[11px] text-gray-500">Incentive: ₹{assn.incentive_per_verified_registration}/verified student</p>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">
                          {assn.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {detailsTab === 'students' && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {(schoolDetailsData?.students || []).length === 0 ? (
                      <p className="text-xs text-gray-400 text-center p-6">No students registered yet by this school.</p>
                    ) : (
                      (schoolDetailsData?.students || []).map((s: any) => (
                        <div key={s.id} className="p-3 bg-gray-50 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-gray-900">{s.applicant_name}</p>
                            <p className="text-[10px] text-gray-400">Roll: {s.roll_number || s.application_no} | Class: {s.school_class || s.qualification}</p>
                          </div>
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-bold">
                            {s.merit_status ? s.merit_status.toUpperCase() : 'REGISTERED'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {detailsTab === 'payouts' && (
                  <div className="space-y-2">
                    {(schoolDetailsData?.payouts || []).length === 0 ? (
                      <p className="text-xs text-gray-400 text-center p-6">No payout transactions recorded yet.</p>
                    ) : (
                      (schoolDetailsData?.payouts || []).map((p: any) => (
                        <div key={p.id} className="p-3 bg-gray-50 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-emerald-700">₹{p.amount}</p>
                            <p className="text-[10px] text-gray-400">Ref: {p.payout_reference} | Date: {new Date(p.paid_at).toLocaleDateString()}</p>
                          </div>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                            PAID
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Drawer Action Bar */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDeleteSchool(selectedSchool)}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <FiTrash2 size={14} /> Delete School Tie-up
              </button>

              <div className="flex items-center gap-2">
                {selectedSchool.status === 'ACTIVE' ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleQuickStatusChange(selectedSchool, 'SUSPENDED')
                      setShowDetailsDrawer(false)
                    }}
                    className="px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-xs font-bold transition-colors"
                  >
                    Suspend Partner
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleQuickStatusChange(selectedSchool, 'ACTIVE')
                      setShowDetailsDrawer(false)
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Activate Partner
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowDetailsDrawer(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
