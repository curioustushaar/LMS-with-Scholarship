'use client'

import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { getClientAuthToken } from '@/lib/auth-helpers'
import { getIndianStates, getDistrictsForState } from '@/lib/india-locations'
import { validateName, validatePhone, validateEmail } from '@/lib/scholarship-validation'
import {
  FiAward,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiUsers,
  FiClock,
  FiFileText,
  FiDollarSign,
  FiCheckSquare,
  FiSearch,
  FiDownload,
  FiSend,
  FiSliders,
  FiAlertCircle,
  FiTrendingUp,
  FiEye,
  FiExternalLink,
  FiCopy,
  FiCheck,
  FiShield,
  FiKey,
  FiCreditCard,
  FiPaperclip,
  FiMapPin,
  FiLayers,
  FiZap,
  FiNavigation,
  FiPhone,
  FiMail,
  FiArrowRight,
  FiInfo,
  FiPieChart,
  FiActivity,
  FiPrinter,
  FiUploadCloud,
  FiUpload,
  FiFilter,
  FiTarget,
  FiShare2,
  FiX,
} from 'react-icons/fi'

export interface ReferenceCode {
  id: string
  name: string
  phone: string
  email: string
  code: string
  status: 'active' | 'inactive'
  notes?: string
  created_at: string
  updated_at?: string
  students_count?: number
  referred_students?: Array<{
    id: string
    application_no: string
    applicant_name: string
    applicant_email: string
    applicant_phone: string
    scholarship_title: string
    created_at: string
    status: string
    payment_status: string
    admit_card_status: string
  }>
}

export interface ExamCenter {
  id: string
  center_code: string
  center_name: string
  state: string
  district: string
  city: string
  address: string
  pincode?: string
  landmark?: string
  google_maps_url?: string
  max_capacity: number
  allocated_count: number
  contact_person?: string
  contact_phone?: string
  contact_email?: string
  is_partner_school?: boolean
  school_id?: string
  status: 'active' | 'inactive' | 'full'
  reporting_time?: string
  exam_start_time?: string
  exam_end_time?: string
  exam_shift?: string
  created_at?: string
}

interface ScholarshipScheme {
  id: string
  title: string
  category: string
  description?: string
  eligibility_criteria?: string
  min_percentage?: number
  eligible_qualifications?: string[]
  age_limit?: string
  max_family_income?: number
  application_start_date?: string
  application_end_date?: string
  application_fee: number
  scholarship_value: string
  reward_type: 'fee_waiver' | 'cash_prize' | 'hybrid' | 'mentorship'
  reward_details?: {
    waiver_percentage?: number
    cash_amount?: number
    perks?: string[]
  }
  prize_distribution?: {
    first_prize?: string
    second_prize?: string
    third_prize?: string
    consolation?: string
    winner_description?: string
  }
  winner_description?: string
  number_of_winners?: number
  exam_date?: string
  exam_time?: string
  exam_duration?: string
  total_questions?: number
  exam_mode: 'online' | 'offline' | 'hybrid'
  exam_venue?: string
  exam_centers?: string[]
  terms_and_conditions?: string
  required_documents?: string[]
  admit_card_release_date?: string
  result_date?: string
  color_theme?: string
  status: 'draft' | 'published' | 'active' | 'closed' | 'upcoming' | 'results_declared'
}

interface ScholarshipApplicant {
  id: string
  application_no: string
  registration_code: string
  scholarship_id: string
  scholarship_title: string
  applicant_name: string
  applicant_email: string
  applicant_phone: string
  qualification: string
  percentage: number
  annual_family_income?: number
  category?: string
  father_name?: string
  dob?: string
  address?: string
  state?: string
  district?: string
  city?: string
  pincode?: string
  preference_state?: string
  preference_district_1?: string
  preference_district_2?: string
  exam_city_preference?: string
  photo_url?: string
  signature_url?: string
  aadhaar_url?: string
  marksheet_url?: string
  college_id_url?: string
  documents?: Record<string, any>
  status: string
  payment_status: 'paid' | 'free' | 'pending' | 'failed'
  payment_reference?: string
  payment_amount: number
  reference_code?: string
  created_at: string
  
  // Admit Card & Center Allocation
  admit_card_status: 'provisional' | 'approved' | 'released' | 'rejected'
  roll_number?: string
  exam_center?: string
  assigned_center_id?: string
  assigned_center_code?: string
  assigned_center_name?: string
  assigned_center_address?: string
  assigned_center_landmark?: string
  assigned_center_maps_url?: string
  exam_slot?: string
  admit_card_issued_at?: string
  
  // Evaluation & Merit
  exam_marks?: number
  total_marks?: number
  rank?: number
  merit_status?: 'qualified' | 'waiting' | 'not_qualified'
  result_status?: 'draft' | 'released'
  result_released_at?: string
  
  // Verification & Award
  document_status?: 'verified' | 'pending' | 'action_needed' | 'rejected'
  document_remarks?: string
  verification_checklist?: Record<string, boolean>
  award_status?: 'awarded' | 'disbursed' | 'pending' | 'none'
  award_type?: 'fee_waiver' | 'cash_prize' | 'both'
  award_amount?: string
  award_disbursement_ref?: string
  award_voucher_code?: string
  payout_details?: Record<string, any>
  bank_details?: Record<string, any>
  cheque_details?: Record<string, any>
}

export default function SuperadminScholarshipsPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const [tab, setTab] = useState<'schemes' | 'applications' | 'centers' | 'admit_cards' | 'evaluation' | 'awards' | 'referral_codes'>('schemes')
  const [scholarships, setScholarships] = useState<ScholarshipScheme[]>([])
  const [applicants, setApplicants] = useState<ScholarshipApplicant[]>([])
  const [centers, setCenters] = useState<ExamCenter[]>([])
  const [demographics, setDemographics] = useState<Record<string, { total: number; districts: Record<string, number> }>>({})
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterScheme, setFilterScheme] = useState<string>('all')

  // Reference Codes State
  const [referenceCodes, setReferenceCodes] = useState<ReferenceCode[]>([])
  const [refCodeStats, setRefCodeStats] = useState({ total_codes: 0, active_codes: 0, inactive_codes: 0, total_referred_students: 0 })
  const [showRefCodeModal, setShowRefCodeModal] = useState(false)
  const [showRefStudentsModal, setShowRefStudentsModal] = useState<ReferenceCode | null>(null)
  const [refCodeActionLoading, setRefCodeActionLoading] = useState<string | null>(null)
  const [copiedRefCode, setCopiedRefCode] = useState<string | null>(null)
  const [refCodeForm, setRefCodeForm] = useState({ name: '', phone: '', email: '', code: '', notes: '' })

  // Exam Centers Master State
  const [showCenterModal, setShowCenterModal] = useState(false)
  const [editingCenter, setEditingCenter] = useState<ExamCenter | null>(null)
  const [filterCenterState, setFilterCenterState] = useState<string>('all')
  const [filterCenterDistrict, setFilterCenterDistrict] = useState<string>('all')
  const [centerForm, setCenterForm] = useState<Partial<ExamCenter>>({
    center_code: '',
    center_name: '',
    state: 'Bihar',
    district: 'Patna',
    city: 'Patna',
    address: '',
    pincode: '',
    landmark: '',
    google_maps_url: '',
    max_capacity: 200,
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    reporting_time: '09:00 AM',
    exam_start_time: '10:00 AM',
    exam_end_time: '12:00 PM',
    exam_shift: 'Shift 1 (Morning Session)',
    status: 'active',
    is_partner_school: false,
  })

  // Allocation & Admit Card Desk State
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([])
  const [manualTargetCenterId, setManualTargetCenterId] = useState<string>('')
  const [filterAllocState, setFilterAllocState] = useState<string>('all')
  const [filterAllocDistrict, setFilterAllocDistrict] = useState<string>('all')
  const [allocFilterTab, setAllocFilterTab] = useState<'all' | 'unallocated' | 'allocated' | 'provisional' | 'released'>('all')

  // Modals
  const [showSchemeModal, setShowSchemeModal] = useState(false)
  const [editingScheme, setEditingScheme] = useState<ScholarshipScheme | null>(null)
  const [showMarksModal, setShowMarksModal] = useState(false)
  const [evaluatingApplicant, setEvaluatingApplicant] = useState<ScholarshipApplicant | null>(null)
  const [enteredMarks, setEnteredMarks] = useState<string>('')
  
  // Enhanced Award Modal
  const [showAwardModal, setShowAwardModal] = useState(false)
  const [awardingApplicant, setAwardingApplicant] = useState<ScholarshipApplicant | null>(null)
  const [awardType, setAwardType] = useState<'fee_waiver' | 'cash_prize' | 'both'>('both')
  const [awardAmount, setAwardAmount] = useState('100% Tuition Fee Waiver')
  const [disbursementRef, setDisbursementRef] = useState('')
  const [voucherCode, setVoucherCode] = useState('')
  const [payoutBankUtr, setPayoutBankUtr] = useState('')
  const [payoutCashAmount, setPayoutCashAmount] = useState('50,000')
  const [payoutNote, setPayoutNote] = useState('Official scholarship prize payout processed via institutional RTGS/UPI.')

  // Dossier Inspection Modal State
  const [showDossierModal, setShowDossierModal] = useState(false)
  const [inspectingApplicant, setInspectingApplicant] = useState<ScholarshipApplicant | null>(null)
  const [dossierStatus, setDossierStatus] = useState<'pending' | 'verified' | 'action_needed' | 'rejected'>('verified')
  const [dossierRemarks, setDossierRemarks] = useState('')
  const [dossierChecklist, setDossierChecklist] = useState({
    marksheet_percentage_matched: true,
    identity_dob_matched: true,
    eligibility_stream_valid: true,
  })
  const [activeDocTab, setActiveDocTab] = useState<string>('marksheet')
  const [copiedVoucher, setCopiedVoucher] = useState(false)

  const [previewAdmitCard, setPreviewAdmitCard] = useState<ScholarshipApplicant | null>(null)

  // Center-Wise Candidate Verification Roster Modal State
  const [showRosterModal, setShowRosterModal] = useState(false)
  const [rosterSelectedCenterId, setRosterSelectedCenterId] = useState<string>('all')
  const [rosterSelectedSchemeId, setRosterSelectedSchemeId] = useState<string>('all')
  const [copiedRosterText, setCopiedRosterText] = useState(false)

  // Bulk Examination Marks Evaluation State
  const [showBulkMarksModal, setShowBulkMarksModal] = useState(false)
  const [bulkUploadSchemeId, setBulkUploadSchemeId] = useState<string>('all')
  const [bulkUploadMode, setBulkUploadMode] = useState<'file' | 'paste'>('file')
  const [bulkPastedText, setBulkPastedText] = useState('')
  const [bulkParsedRows, setBulkParsedRows] = useState<any[]>([])
  const [bulkMaxMarks, setBulkMaxMarks] = useState<number>(100)
  const [bulkSubmitting, setBulkSubmitting] = useState(false)
  const [bulkFilterValidation, setBulkFilterValidation] = useState<'all' | 'valid' | 'errors' | 'absent'>('all')
  const [copiedExcelData, setCopiedExcelData] = useState(false)

  // Merit Cut-off & Qualification Rule Engine State
  const [cutoffMode, setCutoffMode] = useState<'marks_range' | 'top_ranks'>('marks_range')
  const [cutoffQualifiedMin, setCutoffQualifiedMin] = useState<number>(60)
  const [cutoffTopQualified, setCutoffTopQualified] = useState<number>(50)
  const [cutoffApplying, setCutoffApplying] = useState(false)
  const [evalTableStatusFilter, setEvalTableStatusFilter] = useState<'all' | 'qualified' | 'not_qualified' | 'absent'>('all')

  // Single Marks Modal State
  const [enteredTotalMarks, setEnteredTotalMarks] = useState<number>(100)
  const [enteredMeritStatus, setEnteredMeritStatus] = useState<'qualified' | 'not_qualified'>('qualified')
  const [enteredRemarks, setEnteredRemarks] = useState<string>('')
  const [enteredIsAbsent, setEnteredIsAbsent] = useState<boolean>(false)

  // Scheme Form State
  const [centerInput, setCenterInput] = useState('')
  const [docInput, setDocInput] = useState('')
  const [customQualInput, setCustomQualInput] = useState('')
  const [availableQualifications, setAvailableQualifications] = useState<string[]>([
    'Class 6th',
    'Class 7th',
    'Class 8th',
    'Class 9th',
    'Class 10th',
    'Class 11th (Science - PCM)',
    'Class 11th (Science - PCB)',
    'Class 11th (Commerce/Arts)',
    'Class 12th (Science - PCM)',
    'Class 12th (Science - PCB)',
    'Class 12th (Commerce/Arts)',
    'Undergraduate (B.Tech / BSc / BCA / B.Com / BA)',
    'Postgraduate',
    'Diploma / Polytechnic / ITI',
  ])
  const [schemeForm, setSchemeForm] = useState<Partial<ScholarshipScheme>>({
    title: '',
    category: 'Merit',
    description: '',
    eligibility_criteria: 'Students enrolled in eligible classes with consistent academic record',
    min_percentage: 60,
    eligible_qualifications: ['Class 6th', 'Class 7th', 'Class 8th', 'Class 9th', 'Class 10th'],
    age_limit: '10 - 18 Years',
    max_family_income: 8,
    application_start_date: new Date().toISOString().split('T')[0],
    application_end_date: '2026-09-15',
    application_fee: 199,
    scholarship_value: 'Up to ₹50,000 Cash Prize + 100% Fee Waiver',
    reward_type: 'hybrid',
    prize_distribution: {
      first_prize: '₹50,000',
      second_prize: '₹25,000',
      third_prize: '₹10,000',
      consolation: 'Certificate & 50% Fee Waiver',
      winner_description: '🥇 1st Rank: ₹50,000 Cash + 100% Scholarship Waiver\n🥈 2nd Rank: ₹25,000 Cash + 75% Scholarship Waiver\n🥉 3rd Rank: ₹10,000 Cash + 50% Scholarship Waiver\n🎖️ Top 50: Official Merit Certificate & Course Access',
    },
    winner_description: '🥇 1st Rank: ₹50,000 Cash + 100% Scholarship Waiver\n🥈 2nd Rank: ₹25,000 Cash + 75% Scholarship Waiver\n🥉 3rd Rank: ₹10,000 Cash + 50% Scholarship Waiver\n🎖️ Top 50: Official Merit Certificate & Course Access',
    number_of_winners: 50,
    exam_date: '2026-09-20',
    exam_time: '10:00 AM - 12:00 PM',
    exam_duration: '120 Minutes',
    total_questions: 100,
    exam_mode: 'online',
    exam_venue: '',
    exam_centers: [],
    terms_and_conditions: '1. Candidate must provide authentic academic credentials.\n2. Malpractice or proxy in online/offline exam leads to instant disqualification.\n3. Cash grants will be credited directly to verified student bank accounts.\n4. Merit list is finalized solely by the Academic Evaluation Committee.',
    required_documents: [
      '10th / 12th Marksheet',
      'Government Photo ID (Aadhaar/PAN)',
      'Recent Passport Size Photograph',
      'Income Certificate (Optional)',
    ],
    admit_card_release_date: '2026-09-10',
    result_date: '2026-09-30',
    color_theme: 'pink',
    status: 'published',
  })

  const getToken = async () => {
    return await getClientAuthToken()
  }

  const fetchCenters = async () => {
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/scholarships/centers', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && data.data) {
        setCenters(data.data)
      }
    } catch (err) {
      console.error('Failed to load centers', err)
    }
  }

  const fetchAdmitCardsData = async () => {
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/scholarships/admit-cards', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        if (data.demographics) setDemographics(data.demographics)
        if (data.centers) setCenters(data.centers)
        if (data.applicants) setApplicants(data.applicants)
      }
    } catch (err) {
      console.error('Failed to load admit cards & demographics', err)
    }
  }

  const fetchReferenceCodes = async () => {
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/scholarships/reference-codes', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setReferenceCodes(data.data || [])
        if (data.stats) setRefCodeStats(data.stats)
      }
    } catch (err) {
      console.error('Failed to load reference codes', err)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const [schRes, centersRes, admitRes, refRes] = await Promise.all([
        fetch('/api/superadmin/scholarships', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/superadmin/scholarships/centers', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/superadmin/scholarships/admit-cards', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/superadmin/scholarships/reference-codes', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const schData = await schRes.json()
      const centersData = await centersRes.json()
      const admitData = await admitRes.json()
      const refData = await refRes.json()

      if (schData.success) {
        if (schData.data) setScholarships(schData.data)
        if (schData.applicants) setApplicants(schData.applicants)
      }
      if (centersData.success && centersData.data) {
        setCenters(centersData.data)
      }
      if (admitData.success) {
        if (admitData.demographics) setDemographics(admitData.demographics)
        if (admitData.applicants) setApplicants(admitData.applicants)
      }
      if (refData.success) {
        if (refData.data) setReferenceCodes(refData.data)
        if (refData.stats) setRefCodeStats(refData.stats)
      }
    } catch (err) {
      console.error('Failed to load scholarship data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Reference Code Handlers
  const handleGenerateRefCode = async (e: React.FormEvent) => {
    e.preventDefault()

    const nameVal = validateName(refCodeForm.name, 'Representative Name')
    if (!nameVal.isValid) {
      alert(nameVal.message)
      return
    }

    const phoneVal = validatePhone(refCodeForm.phone)
    if (!phoneVal.isValid) {
      alert(phoneVal.message)
      return
    }

    if (refCodeForm.email) {
      const emailVal = validateEmail(refCodeForm.email)
      if (!emailVal.isValid) {
        alert(emailVal.message)
        return
      }
    }

    setRefCodeActionLoading('create')
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/scholarships/reference-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...refCodeForm,
          name: nameVal.cleanName,
          phone: phoneVal.cleanPhone,
          email: refCodeForm.email ? validateEmail(refCodeForm.email).cleanEmail : '',
        })
      })
      const data = await res.json()
      if (data.success) {
        setShowRefCodeModal(false)
        setRefCodeForm({ name: '', phone: '', email: '', code: '', notes: '' })
        await fetchReferenceCodes()
        alert(`Reference Code Generated Successfully: ${data.data?.code || 'Generated'}`)
      } else {
        alert(data.error || 'Failed to generate reference code')
      }
    } catch (err) {
      console.error('Failed to generate reference code:', err)
      alert('An error occurred while generating reference code')
    } finally {
      setRefCodeActionLoading(null)
    }
  }

  const handleToggleRefCodeStatus = async (item: ReferenceCode) => {
    const newStatus = item.status === 'active' ? 'inactive' : 'active'
    setRefCodeActionLoading(item.id)
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/scholarships/reference-codes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id: item.id, status: newStatus })
      })
      const data = await res.json()
      if (data.success) {
        await fetchReferenceCodes()
      } else {
        alert(data.error || 'Failed to update status')
      }
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setRefCodeActionLoading(null)
    }
  }

  const handleDeleteRefCode = async (id: string, codeStr: string) => {
    if (!confirm(`Are you sure you want to delete reference code "${codeStr}"?`)) return
    setRefCodeActionLoading(id)
    try {
      const token = await getToken()
      const res = await fetch(`/api/superadmin/scholarships/reference-codes?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        await fetchReferenceCodes()
      } else {
        alert(data.error || 'Failed to delete reference code')
      }
    } catch (err) {
      console.error('Failed to delete reference code:', err)
    } finally {
      setRefCodeActionLoading(null)
    }
  }

  // Exam Centers Master Handlers
  const handleOpenAddCenter = () => {
    setEditingCenter(null)
    setCenterForm({
      center_code: '',
      center_name: '',
      state: 'Bihar',
      district: 'Patna',
      city: 'Patna',
      address: '',
      pincode: '',
      landmark: '',
      google_maps_url: '',
      max_capacity: 200,
      contact_person: '',
      contact_phone: '',
      contact_email: '',
      reporting_time: '09:00 AM',
      exam_start_time: '10:00 AM',
      exam_end_time: '12:00 PM',
      exam_shift: 'Shift 1 (Morning Session)',
      status: 'active',
      is_partner_school: false,
    })
    setShowCenterModal(true)
  }

  const handleOpenEditCenter = (c: ExamCenter) => {
    setEditingCenter(c)
    setCenterForm({
      ...c,
      reporting_time: c.reporting_time || '09:00 AM',
      exam_start_time: c.exam_start_time || '10:00 AM',
      exam_end_time: c.exam_end_time || '12:00 PM',
      exam_shift: c.exam_shift || 'Shift 1 (Morning Session)',
    })
    setShowCenterModal(true)
  }

  // 1-Click Quick Exam Center Creator from District Analytics
  const handleQuickCreateCenterForDistrict = (districtName: string, stateName: string, applicantCount: number) => {
    setEditingCenter(null)
    const cleanDist = districtName.trim()
    const cleanState = stateName.trim() || 'Bihar'
    const codeSuffix = cleanDist.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4)
    const rand = Math.floor(10 + Math.random() * 90)
    const suggestedCap = Math.max(100, Math.ceil(applicantCount * 1.5))

    setCenterForm({
      center_code: `CTR-${codeSuffix || 'EXAM'}-${rand}`,
      center_name: `${cleanDist} National Assessment Hub (Center 01)`,
      state: cleanState,
      district: cleanDist,
      city: cleanDist,
      address: `${cleanDist} Digital Examination Center & Lab Facility, Main Campus Road, ${cleanDist}`,
      pincode: '',
      landmark: 'Near District Collectorate / Central Railway Station',
      google_maps_url: '',
      max_capacity: suggestedCap,
      contact_person: `${cleanDist} District Coordinator`,
      contact_phone: '9876543210',
      contact_email: `center.${cleanDist.toLowerCase().replace(/[^a-z]/g, '')}@gravityinfotech.com`,
      reporting_time: '09:00 AM',
      exam_start_time: '10:00 AM',
      exam_end_time: '12:00 PM',
      exam_shift: 'Shift 1 (Morning Session)',
      status: 'active',
      is_partner_school: false,
    })
    setShowCenterModal(true)
  }

  const handleSaveCenter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!centerForm.center_name?.trim() || !centerForm.address?.trim()) {
      alert('Center Name, State, District, and Address are required.')
      return
    }
    setActionLoading(true)
    try {
      const token = await getToken()
      if (editingCenter) {
        const res = await fetch('/api/superadmin/scholarships/centers', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id: editingCenter.id, ...centerForm }),
        })
        const data = await res.json()
        if (data.success) {
          setShowCenterModal(false)
          fetchCenters()
        } else {
          alert(data.error || 'Failed to update center.')
        }
      } else {
        const res = await fetch('/api/superadmin/scholarships/centers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(centerForm),
        })
        const data = await res.json()
        if (data.success) {
          setShowCenterModal(false)
          fetchCenters()
        } else {
          alert(data.error || 'Failed to create center.')
        }
      }
    } catch (err: any) {
      alert('Error saving center: ' + (err?.message || err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteCenter = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Exam Center?')) return
    setActionLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`/api/superadmin/scholarships/centers?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        fetchCenters()
      } else {
        alert(data.error || 'Failed to delete center.')
      }
    } catch (err: any) {
      alert('Error deleting center: ' + (err?.message || err))
    } finally {
      setActionLoading(false)
    }
  }

  // Smart Auto-Allocation Engine Handler
  const handleRunAutoAllocation = async () => {
    if (centers.length === 0) {
      alert('No active exam centers found. Please add at least one Exam Center in the Centers tab first.')
      setTab('centers')
      return
    }
    if (!confirm('Run Smart Allocation Engine? This will match candidates to nearest district centers based on their 1st & 2nd preferences and check capacity limits.')) {
      return
    }
    setActionLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/scholarships/admit-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'auto_allocate',
          scheme_id: filterScheme,
          applicant_ids: selectedAppIds.length > 0 ? selectedAppIds : undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert(data.message || 'Auto-Allocation completed successfully!')
        setSelectedAppIds([])
        fetchData()
      } else {
        alert(data.error || 'Failed to run allocation.')
      }
    } catch (err: any) {
      alert('Error running allocation: ' + (err?.message || err))
    } finally {
      setActionLoading(false)
    }
  }

  // Manual Bulk Allocation to a Specific Center
  const handleManualBulkAssign = async () => {
    if (selectedAppIds.length === 0) {
      alert('Please select at least one candidate using the table checkboxes.')
      return
    }
    if (!manualTargetCenterId) {
      alert('Please select a target Exam Center to assign the selected candidates.')
      return
    }
    setActionLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/scholarships/admit-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'manual_allocate',
          center_id: manualTargetCenterId,
          applicant_ids: selectedAppIds,
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert(data.message || 'Candidates allocated to center successfully!')
        setSelectedAppIds([])
        setManualTargetCenterId('')
        fetchData()
      } else {
        alert(data.error || 'Failed to assign candidates.')
      }
    } catch (err: any) {
      alert('Error assigning candidates: ' + (err?.message || err))
    } finally {
      setActionLoading(false)
    }
  }

  // Publish Official Admit Cards (Bulk Release)
  const handlePublishAdmitCards = async () => {
    const provisionalCount = applicants.filter((a) => a.admit_card_status === 'provisional').length
    if (provisionalCount === 0) {
      alert('All candidates have already received their Official Admit Cards!')
      return
    }
    const countToPublish = selectedAppIds.length > 0 ? selectedAppIds.length : provisionalCount
    if (!confirm(`Are you sure you want to publish and release ${countToPublish} Official Hall Tickets? Candidates will immediately be able to download their official admit cards with allocated venues and roll numbers.`)) {
      return
    }
    setActionLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/scholarships/admit-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'publish_admit_cards',
          scheme_id: filterScheme,
          applicant_ids: selectedAppIds.length > 0 ? selectedAppIds : undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert(data.message || 'Admit cards published successfully!')
        setSelectedAppIds([])
        fetchData()
      } else {
        alert(data.error || 'Failed to publish admit cards.')
      }
    } catch (err: any) {
      alert('Error publishing admit cards: ' + (err?.message || err))
    } finally {
      setActionLoading(false)
    }
  }

  // Delete Candidate Application (Superadmin Action)
  const handleDeleteApplicant = async (app: any) => {
    if (!confirm(`Are you sure you want to delete candidate "${app.applicant_name}" (Application No: ${app.application_no})? This will permanently remove their intake application, scorecard, and credentials.`)) {
      return
    }
    setActionLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`/api/superadmin/scholarships/admit-cards?id=${encodeURIComponent(app.id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        alert(data.message || 'Candidate deleted successfully.')
        setApplicants((prev) => prev.filter((a) => a.id !== app.id))
        fetchData()
      } else {
        alert(data.error || 'Failed to delete candidate.')
      }
    } catch (err: any) {
      alert('Error deleting candidate: ' + (err?.message || err))
    } finally {
      setActionLoading(false)
    }
  }

  // Exam Centers helper handlers
  const handleAddExamCenter = () => {
    const trimmed = centerInput.trim()
    if (!trimmed) return
    const current = schemeForm.exam_centers || []
    if (current.includes(trimmed)) {
      setCenterInput('')
      return
    }
    const updated = [...current, trimmed]
    setSchemeForm({
      ...schemeForm,
      exam_centers: updated,
      exam_venue: updated[0] || 'National Proctored Online Platform',
    })
    setCenterInput('')
  }

  const handleRemoveExamCenter = (indexToRemove: number) => {
    const current = schemeForm.exam_centers || []
    const updated = current.filter((_, idx) => idx !== indexToRemove)
    setSchemeForm({
      ...schemeForm,
      exam_centers: updated,
      exam_venue: updated[0] || 'National Proctored Online Platform',
    })
  }

  // Required Documents helper handlers
  const handleAddDoc = (docName: string) => {
    const trimmed = docName.trim()
    if (!trimmed) return
    const current = schemeForm.required_documents || []
    if (current.includes(trimmed)) {
      setDocInput('')
      return
    }
    setSchemeForm({
      ...schemeForm,
      required_documents: [...current, trimmed],
    })
    setDocInput('')
  }

  const handleRemoveDoc = (indexToRemove: number) => {
    const current = schemeForm.required_documents || []
    setSchemeForm({
      ...schemeForm,
      required_documents: current.filter((_, idx) => idx !== indexToRemove),
    })
  }

  // Qualification Chips Toggle, Add Custom, & Remove
  const handleToggleQualification = (qual: string) => {
    const current = schemeForm.eligible_qualifications || []
    if (current.includes(qual)) {
      setSchemeForm({
        ...schemeForm,
        eligible_qualifications: current.filter((q) => q !== qual),
      })
    } else {
      setSchemeForm({
        ...schemeForm,
        eligible_qualifications: [...current, qual],
      })
    }
  }

  const handleAddCustomQualification = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = customQualInput.trim()
    if (!trimmed) return
    if (!availableQualifications.includes(trimmed)) {
      setAvailableQualifications((prev) => [...prev, trimmed])
    }
    const current = schemeForm.eligible_qualifications || []
    if (!current.includes(trimmed)) {
      setSchemeForm({
        ...schemeForm,
        eligible_qualifications: [...current, trimmed],
      })
    }
    setCustomQualInput('')
  }

  const handleRemoveQualificationPill = (qualToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setAvailableQualifications((prev) => prev.filter((q) => q !== qualToRemove))
    const current = schemeForm.eligible_qualifications || []
    if (current.includes(qualToRemove)) {
      setSchemeForm({
        ...schemeForm,
        eligible_qualifications: current.filter((q) => q !== qualToRemove),
      })
    }
  }

  // Quick Toggle Status (Draft <-> Published)
  const handleToggleSchemeStatus = async (scheme: ScholarshipScheme) => {
    const newStatus: ScholarshipScheme['status'] =
      scheme.status === 'published' || scheme.status === 'active' ? 'draft' : 'published'
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/scholarships', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: scheme.id, status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setScholarships((prev) => prev.map((s) => (s.id === scheme.id ? { ...s, status: newStatus } : s)))
      }
    } catch (err) {
      console.error('Failed to toggle status', err)
    }
  }

  // Handle Scheme Add/Edit
  const handleOpenAddScheme = () => {
    setEditingScheme(null)
    setCenterInput('')
    setDocInput('')
    setCustomQualInput('')
    setSchemeForm({
      title: '',
      category: 'Merit',
      description: '',
      eligibility_criteria: '',
      min_percentage: 60,
      eligible_qualifications: ['10th', '12th (PCM)', 'Undergraduate'],
      age_limit: '16 - 28 Years',
      max_family_income: 10,
      application_start_date: new Date().toISOString().split('T')[0],
      application_end_date: '',
      application_fee: 0,
      scholarship_value: '',
      reward_type: 'hybrid',
      prize_distribution: {
        first_prize: '',
        second_prize: '',
        third_prize: '',
        consolation: '',
        winner_description: '',
      },
      winner_description: '',
      number_of_winners: 50,
      exam_date: '',
      exam_time: '10:00 AM - 12:00 PM',
      exam_duration: '120 Minutes',
      total_questions: 100,
      exam_mode: 'online',
      exam_venue: '',
      exam_centers: [],
      terms_and_conditions: '1. Candidate must provide authentic academic credentials.\n2. Malpractice in examination leads to instant disqualification.\n3. Cash prizes will be transferred directly to verified student bank accounts.',
      required_documents: [
        '10th / 12th Marksheet',
        'Government Photo ID (Aadhaar/PAN)',
        'Recent Passport Size Photograph',
      ],
      admit_card_release_date: '',
      result_date: '',
      color_theme: 'pink',
      status: 'published',
    })
    setShowSchemeModal(true)
  }

  const handleOpenEditScheme = (scheme: ScholarshipScheme) => {
    setEditingScheme(scheme)
    setCenterInput('')
    setDocInput('')
    setCustomQualInput('')
    if (scheme.eligible_qualifications && scheme.eligible_qualifications.length > 0) {
      setAvailableQualifications((prev) =>
        Array.from(new Set([...prev, ...scheme.eligible_qualifications!]))
      )
    }
    const resolvedWinnerDesc = scheme.winner_description || scheme.prize_distribution?.winner_description || ''
    setSchemeForm({
      ...scheme,
      winner_description: resolvedWinnerDesc,
      prize_distribution: {
        first_prize: scheme.prize_distribution?.first_prize || '₹50,000',
        second_prize: scheme.prize_distribution?.second_prize || '₹25,000',
        third_prize: scheme.prize_distribution?.third_prize || '₹10,000',
        consolation: scheme.prize_distribution?.consolation || 'Certificate & 50% Fee Waiver',
        winner_description: resolvedWinnerDesc,
      },
      number_of_winners: scheme.number_of_winners || 50,
      exam_duration: scheme.exam_duration || '120 Minutes',
      total_questions: scheme.total_questions || 100,
      age_limit: scheme.age_limit || '16 - 28 Years',
      application_start_date: scheme.application_start_date || '2026-08-01',
      application_end_date: scheme.application_end_date || '2026-09-15',
      required_documents: scheme.required_documents || [
        '10th / 12th Marksheet',
        'Government Photo ID (Aadhaar/PAN)',
        'Recent Passport Size Photograph',
      ],
      terms_and_conditions: scheme.terms_and_conditions || '1. Candidate must provide authentic academic credentials.\n2. Cash prizes will be transferred directly to verified bank accounts.',
      exam_centers: scheme.exam_centers && scheme.exam_centers.length > 0
        ? scheme.exam_centers
        : (scheme.exam_venue ? [scheme.exam_venue] : []),
    })
    setShowSchemeModal(true)
  }

  const handleSaveScheme = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = await getToken()
      if (editingScheme) {
        const res = await fetch('/api/superadmin/scholarships', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id: editingScheme.id, ...schemeForm }),
        })
        const data = await res.json()
        if (data.success) {
          setShowSchemeModal(false)
          fetchData()
        } else {
          alert('Failed to update scholarship: ' + (data.error || 'Server error'))
          return
        }
      } else {
        const res = await fetch('/api/superadmin/scholarships', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(schemeForm),
        })
        const data = await res.json()
        if (data.success) {
          setShowSchemeModal(false)
          fetchData()
        } else {
          alert('Failed to create scholarship: ' + (data.error || 'Server error'))
          return
        }
      }
    } catch (err: any) {
      console.error(err)
      alert('Network error while saving scholarship: ' + (err?.message || err))
    }
  }

  const handleDeleteScheme = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scholarship scheme?')) return
    try {
      const token = await getToken()
      await fetch(`/api/superadmin/scholarships?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setScholarships(scholarships.filter((s) => s.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  // Bulk Approve Admit Cards ("Ek Saath Approved")
  const handleBulkApproveAdmitCards = async () => {
    const provisionalCount = applicants.filter((a) => a.admit_card_status === 'provisional').length
    if (provisionalCount === 0) {
      alert('All applicants have already received their official Admit Cards!')
      return
    }

    if (!confirm(`Are you sure you want to Bulk Approve and Release Official Admit Cards for all ${provisionalCount} provisional applicants?`)) {
      return
    }

    setActionLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/scholarships/admit-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'bulk_approve', scheme_id: filterScheme }),
      })
      const data = await res.json()
      if (data.success) {
        alert(data.message || 'Admit cards bulk approved successfully!')
        if (data.updated_applicants) {
          setApplicants(data.updated_applicants)
        } else {
          fetchData()
        }
      }
    } catch (err) {
      console.error('Bulk approve error', err)
    } finally {
      setActionLoading(false)
    }
  }

  // Single Approve Admit Card
  const handleSingleApproveAdmitCard = async (applicantId: string) => {
    setActionLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/scholarships/admit-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'single_approve', applicant_id: applicantId }),
      })
      const data = await res.json()
      if (data.success) {
        setApplicants(
          applicants.map((a) =>
            a.id === applicantId
              ? {
                  ...a,
                  admit_card_status: 'released',
                  roll_number: a.roll_number || `GRAVITY-26-${Math.floor(1000 + Math.random() * 9000)}`,
                }
              : a
          )
        )
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  // Submit Exam Marks & Merit Status & Re-rank
  const handleSaveMarks = async () => {
    if (!evaluatingApplicant) return
    let marksNum = 0
    if (!enteredIsAbsent) {
      marksNum = parseFloat(enteredMarks)
      if (isNaN(marksNum) || marksNum < 0 || marksNum > (enteredTotalMarks || 100)) {
        alert(`Please enter valid marks between 0 and ${enteredTotalMarks || 100}.`)
        return
      }
    }

    setActionLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/scholarships/evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'submit_marks',
          applicant_id: evaluatingApplicant.id,
          marks: enteredIsAbsent ? 'ABSENT' : marksNum,
          total_marks: enteredTotalMarks || 100,
          merit_status: enteredIsAbsent ? 'not_qualified' : enteredMeritStatus,
          remarks: enteredRemarks,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setShowMarksModal(false)
        if (data.applicants) {
          setApplicants(data.applicants)
        } else {
          fetchData()
        }
      } else {
        alert(data.error || 'Failed to update marks. Please check server logs.')
      }
    } catch (err: any) {
      console.error(err)
      alert('Network error while saving marks: ' + (err?.message || err))
    } finally {
      setActionLoading(false)
    }
  }

  // Apply Superadmin Cut-off Rules in Bulk
  const handleApplyCutoffRules = async () => {
    const targetSchemeApps = filterScheme === 'all'
      ? applicants.filter((a) => a.exam_marks != null)
      : applicants.filter((a) => a.scholarship_id === filterScheme && a.exam_marks != null)

    if (targetSchemeApps.length === 0) {
      alert('No evaluated/scored candidates found in the selected scheme to apply cut-off rules. Please upload or enter marks first.')
      return
    }

    if (cutoffMode === 'marks_range' && (isNaN(Number(cutoffQualifiedMin)) || Number(cutoffQualifiedMin) < 0 || Number(cutoffQualifiedMin) > 100)) {
      alert('Please enter a valid Qualified Minimum Marks score between 0 and 100.')
      return
    }

    setCutoffApplying(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/scholarships/evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'apply_cutoff_rules',
          scheme_id: filterScheme,
          mode: cutoffMode,
          qualified_min: Number(cutoffQualifiedMin),
          top_qualified_count: Number(cutoffTopQualified),
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert(data.message || 'Cut-off rules successfully applied!')
        if (data.applicants) {
          setApplicants(data.applicants)
        } else {
          fetchData()
        }
      } else {
        alert(data.error || 'Failed to apply cut-off rules.')
      }
    } catch (err: any) {
      console.error(err)
      alert('Network error while applying cut-off: ' + (err?.message || err))
    } finally {
      setCutoffApplying(false)
    }
  }

  // Generate & Download Pre-filled Evaluation Sheet (Real Excel .xlsx format)
  const handleDownloadEvaluationSheet = async (targetSchemeId?: string) => {
    const XLSX = await import('xlsx')
    const targetId = targetSchemeId || filterScheme
    const targetScheme = scholarships.find((s) => s.id === targetId)
    const targetApplicants = targetId === 'all'
      ? applicants
      : applicants.filter((a) => a.scholarship_id === targetId)

    if (targetApplicants.length === 0) {
      alert('No candidates registered in this scheme to export.')
      return
    }

    const maxMarks = targetScheme?.total_questions || 100

    // 1. Prepare structured data with clear column names for teachers/examiners
    const worksheetData = targetApplicants.map((app, idx) => ({
      'Sr. No': idx + 1,
      'Official Roll Number': app.roll_number || `GRAVITY-26-${app.application_no ? app.application_no.slice(-4) : 'XXXX'}`,
      'Application Number': app.application_no || '',
      'Student Full Name': app.applicant_name || '',
      'Scholarship Program': app.scholarship_title || targetScheme?.title || 'Scholarship Scheme',
      'Class / Stream': app.qualification || 'Class 10th',
      'Assigned Exam Center': app.assigned_center_name || app.exam_center || 'Main Assessment Center',
      'Max Marks': maxMarks,
      'Obtained Marks (Fill Here)': app.exam_marks != null ? app.exam_marks : '',
      'Attendance (PRESENT / ABSENT)': (app.documents?.attendance as string) || (app.exam_marks != null ? 'PRESENT' : 'PRESENT'),
      'Examiner Remarks': app.document_remarks || '',
    }))

    const ws = XLSX.utils.json_to_sheet(worksheetData)

    // 2. Set wide column widths so Excel displays all texts with zero clipping
    ws['!cols'] = [
      { wch: 8 },  // Sr. No
      { wch: 28 }, // Official Roll Number
      { wch: 20 }, // Application Number
      { wch: 26 }, // Student Full Name
      { wch: 38 }, // Scholarship Program
      { wch: 18 }, // Class / Stream
      { wch: 38 }, // Assigned Exam Center
      { wch: 12 }, // Max Marks
      { wch: 28 }, // Obtained Marks (Fill Here)
      { wch: 30 }, // Attendance (PRESENT / ABSENT)
      { wch: 25 }, // Examiner Remarks
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Marks Evaluation Sheet')

    const schemeSlug = (targetScheme?.title || 'All_Schemes').replace(/[^a-zA-Z0-9_-]/g, '_')
    XLSX.writeFile(wb, `Scholarship_Marks_Entry_Sheet_${schemeSlug}.xlsx`)
  }

  // Parse JSON Rows from Excel (.xlsx/.xls) or structured objects
  const handleParseJsonRows = (rows: any[], targetSchemeId: string) => {
    if (!rows || rows.length === 0) {
      alert('Excel sheet has no rows or is empty.')
      return
    }

    const schemeApplicants = targetSchemeId === 'all'
      ? applicants
      : applicants.filter((a) => a.scholarship_id === targetSchemeId)

    const normalizeKey = (val: any) => String(val || '').trim().toLowerCase().replace(/[\s\-_]/g, '')
    const byRoll = new Map<string, ScholarshipApplicant>()
    const byAppNo = new Map<string, ScholarshipApplicant>()

    schemeApplicants.forEach((a) => {
      if (a.roll_number) byRoll.set(normalizeKey(a.roll_number), a)
      if (a.application_no) byAppNo.set(normalizeKey(a.application_no), a)
    })

    const parsed: any[] = []
    const seenRolls = new Set<string>()

    for (let i = 0; i < rows.length; i++) {
      const rowObj = rows[i]
      const rowNum = i + 1

      const keys = Object.keys(rowObj)

      // 1. Resolve Roll Number Key
      let rollKey = keys.find((k) => {
        const c = k.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
        return c.includes('roll')
      })

      // 2. Resolve Application Number Key
      let appNoKey = keys.find((k) => {
        const c = k.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
        return c.includes('application') || c.includes('appno')
      })

      // 3. Resolve Candidate Name Key
      let nameKey = keys.find((k) => {
        const c = k.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
        return (c.includes('student') || c.includes('candidate') || c.includes('name')) && !c.includes('father') && !c.includes('mother')
      })

      // 4. Resolve Obtained Marks Key (Strictly exclude max_marks, total_marks, and remarks)
      let marksKey = keys.find((k) => {
        const c = k.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
        return (c.includes('obtained') || c.includes('fillhere') || c.includes('secured')) && !c.includes('max') && !c.includes('total') && !c.includes('remark')
      })
      if (!marksKey) {
        marksKey = keys.find((k) => {
          const c = k.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
          return (c === 'marks' || c === 'score' || c.includes('mark') || c.includes('score')) && !c.includes('max') && !c.includes('total') && !c.includes('remark')
        })
      }

      // 5. Resolve Attendance Key
      let attendKey = keys.find((k) => {
        const c = k.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
        return (c.includes('attend') || c.includes('present') || c.includes('absent')) && !c.includes('merit') && !c.includes('release')
      })

      const rawRoll = rollKey ? String(rowObj[rollKey] ?? '').trim() : ''
      const rawAppNo = appNoKey ? String(rowObj[appNoKey] ?? '').trim() : ''
      const rawName = nameKey ? String(rowObj[nameKey] ?? '').trim() : ''
      const rawMarks = marksKey ? String(rowObj[marksKey] ?? '').trim() : ''
      const rawAttend = attendKey ? String(rowObj[attendKey] ?? '').trim() : ''

      let matched = byRoll.get(normalizeKey(rawRoll)) || byAppNo.get(normalizeKey(rawAppNo))

      const isAbsent = String(rawAttend).toUpperCase().includes('ABS') ||
                       String(rawMarks).toUpperCase().includes('ABS') ||
                       String(rawMarks).toUpperCase() === 'AB'

      let marksVal: number | null = null
      let error: string | null = null
      let isValid = true

      if (!matched) {
        isValid = false
        error = 'Candidate Roll/App No not found in target scheme'
      } else {
        if (seenRolls.has(matched.id)) {
          isValid = false
          error = 'Duplicate candidate record in Excel sheet'
        } else {
          seenRolls.add(matched.id)
        }
      }

      if (!isAbsent) {
        if (rawMarks === '' || rawMarks == null) {
          isValid = false
          error = error || 'Marks value is missing'
        } else {
          const num = parseFloat(rawMarks)
          if (isNaN(num) || num < 0) {
            isValid = false
            error = error || 'Invalid score (must be a number >= 0)'
          } else if (num > bulkMaxMarks) {
            isValid = false
            error = error || `Marks exceeds Maximum (${bulkMaxMarks})`
          } else {
            marksVal = num
          }
        }
      } else {
        marksVal = 0
      }

      parsed.push({
        rowNum,
        roll_number: rawRoll || matched?.roll_number || 'N/A',
        application_no: rawAppNo || matched?.application_no || 'N/A',
        applicant_name: matched?.applicant_name || rawName || 'Unknown Student',
        marks: isAbsent ? 'ABSENT' : (marksVal != null ? String(marksVal) : rawMarks),
        rawMarksNum: marksVal,
        attendance: isAbsent ? 'ABSENT' : 'PRESENT',
        isAbsent,
        isValid,
        error,
        matchedApplicant: matched,
      })
    }

    setBulkParsedRows(parsed)
  }

  // Parse Bulk CSV / Tab-separated Data
  const handleParseBulkMarks = (text: string, targetSchemeId: string) => {
    const lines = text.trim().split(/\r?\n/)
    if (lines.length <= 1) {
      alert('Data is empty or contains only header row.')
      return
    }

    const delimiter = lines[0].includes('\t') ? '\t' : ','
    const headerCols = lines[0].split(delimiter).map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''))

    const rollIdx = headerCols.findIndex((h) => h.includes('roll'))
    const appNoIdx = headerCols.findIndex((h) => h.includes('application') || h.includes('appno'))
    const nameIdx = headerCols.findIndex((h) => (h.includes('student') || h.includes('candidate') || h.includes('name')) && !h.includes('father') && !h.includes('mother'))
    
    // Priority for Marks (exclude max, total, remarks)
    let marksIdx = headerCols.findIndex((h) => (h.includes('obtained') || h.includes('fillhere') || h.includes('secured')) && !h.includes('max') && !h.includes('total') && !h.includes('remark'))
    if (marksIdx < 0) {
      marksIdx = headerCols.findIndex((h) => (h === 'marks' || h === 'score' || h.includes('mark') || h.includes('score')) && !h.includes('max') && !h.includes('total') && !h.includes('remark'))
    }

    const attendIdx = headerCols.findIndex((h) => (h.includes('attend') || h.includes('present') || h.includes('absent')) && !h.includes('merit') && !h.includes('release'))

    const schemeApplicants = targetSchemeId === 'all'
      ? applicants
      : applicants.filter((a) => a.scholarship_id === targetSchemeId)

    const normalizeKey = (val: any) => String(val || '').trim().toLowerCase().replace(/[\s\-_]/g, '')
    const byRoll = new Map<string, ScholarshipApplicant>()
    const byAppNo = new Map<string, ScholarshipApplicant>()

    schemeApplicants.forEach((a) => {
      if (a.roll_number) byRoll.set(normalizeKey(a.roll_number), a)
      if (a.application_no) byAppNo.set(normalizeKey(a.application_no), a)
    })

    const parsed: any[] = []
    const seenRolls = new Set<string>()

    for (let i = 1; i < lines.length; i++) {
      const rawLine = lines[i].trim()
      if (!rawLine) continue

      let cols: string[] = []
      if (delimiter === '\t') {
        cols = rawLine.split('\t').map((c) => c.trim().replace(/^"|"$/g, ''))
      } else {
        cols = (rawLine.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || rawLine.split(',')).map((c) => c.trim().replace(/^"|"$/g, ''))
      }

      const rawRoll = rollIdx >= 0 ? cols[rollIdx] || '' : cols[0] || ''
      const rawAppNo = appNoIdx >= 0 ? cols[appNoIdx] || '' : (cols[1] || '')
      const rawMarks = marksIdx >= 0 ? cols[marksIdx] || '' : (cols[6] || cols[cols.length - 2] || '')
      const rawAttend = attendIdx >= 0 ? cols[attendIdx] || '' : (cols[cols.length - 1] || '')
      const rawName = nameIdx >= 0 ? cols[nameIdx] || '' : ''

      let matched = byRoll.get(normalizeKey(rawRoll)) || byAppNo.get(normalizeKey(rawAppNo))

      const isAbsent = String(rawAttend).toUpperCase().includes('ABS') ||
                       String(rawMarks).toUpperCase().includes('ABS') ||
                       String(rawMarks).toUpperCase() === 'AB'

      let marksVal: number | null = null
      let error: string | null = null
      let isValid = true

      if (!matched) {
        isValid = false
        error = 'Candidate Roll/App No not found in target scheme'
      } else {
        if (seenRolls.has(matched.id)) {
          isValid = false
          error = 'Duplicate candidate record in upload'
        } else {
          seenRolls.add(matched.id)
        }
      }

      if (!isAbsent) {
        if (rawMarks === '' || rawMarks == null) {
          isValid = false
          error = error || 'Marks value is missing'
        } else {
          const num = parseFloat(rawMarks)
          if (isNaN(num) || num < 0) {
            isValid = false
            error = error || 'Invalid score (must be a number >= 0)'
          } else if (num > bulkMaxMarks) {
            isValid = false
            error = error || `Marks exceeds Maximum (${bulkMaxMarks})`
          } else {
            marksVal = num
          }
        }
      } else {
        marksVal = 0
      }

      parsed.push({
        rowNum: i,
        roll_number: rawRoll || matched?.roll_number || 'N/A',
        application_no: rawAppNo || matched?.application_no || 'N/A',
        applicant_name: matched?.applicant_name || rawName || 'Unknown Student',
        marks: isAbsent ? 'ABSENT' : (marksVal != null ? String(marksVal) : rawMarks),
        rawMarksNum: marksVal,
        attendance: isAbsent ? 'ABSENT' : 'PRESENT',
        isAbsent,
        isValid,
        error,
        matchedApplicant: matched,
      })
    }

    setBulkParsedRows(parsed)
  }

  // Copy Clean Spreadsheet Data (TSV) to Clipboard for Google Sheets / Excel Online
  const handleCopySpreadsheetData = (targetSchemeId?: string) => {
    const targetId = targetSchemeId || filterScheme
    const targetScheme = scholarships.find((s) => s.id === targetId)
    const targetApplicants = targetId === 'all'
      ? applicants
      : applicants.filter((a) => a.scholarship_id === targetId)

    if (targetApplicants.length === 0) {
      alert('No candidates found registered under this scheme to copy.')
      return
    }

    const maxMarks = targetScheme?.total_questions || 100

    const headers = [
      'Sr. No',
      'Official Roll Number',
      'Application Number',
      'Student Full Name',
      'Scholarship Program',
      'Class / Stream',
      'Assigned Exam Center',
      'Max Marks',
      'Obtained Marks (Fill Here)',
      'Attendance (PRESENT / ABSENT)',
      'Examiner Remarks',
    ]

    const rows = targetApplicants.map((app, idx) => [
      idx + 1,
      app.roll_number || `GRAVITY-26-${app.application_no ? app.application_no.slice(-4) : 'XXXX'}`,
      app.application_no || '',
      app.applicant_name || '',
      app.scholarship_title || targetScheme?.title || 'Scholarship Scheme',
      app.qualification || 'Class 10th',
      app.assigned_center_name || app.exam_center || 'Main Assessment Center',
      maxMarks,
      app.exam_marks != null ? app.exam_marks : '',
      (app.documents?.attendance as string) || (app.exam_marks != null ? 'PRESENT' : 'PRESENT'),
      app.document_remarks || '',
    ])

    const tsvContent = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n')

    navigator.clipboard.writeText(tsvContent).then(() => {
      setCopiedExcelData(true)
      setTimeout(() => setCopiedExcelData(false), 3000)
    }).catch(() => {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = tsvContent
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedExcelData(true)
      setTimeout(() => setCopiedExcelData(false), 3000)
    })
  }

  // Handle Bulk Marks File Upload (Supports .xlsx, .xls, .csv)
  const handleFileUploadMarks = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    const reader = new FileReader()

    reader.onload = async (event) => {
      try {
        if (isExcel) {
          const XLSX = await import('xlsx')
          const data = new Uint8Array(event.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
          handleParseJsonRows(jsonRows, bulkUploadSchemeId)
        } else {
          const content = event.target?.result as string
          if (content) {
            handleParseBulkMarks(content, bulkUploadSchemeId)
          }
        }
      } catch (err: any) {
        alert('Failed to parse file: ' + (err?.message || err))
      } finally {
        e.target.value = '' // Crucial: Reset so re-uploading an edited file with the same name triggers immediately!
      }
    }

    if (isExcel) {
      reader.readAsArrayBuffer(file)
    } else {
      reader.readAsText(file)
    }
  }

  // Execute Batch Marks Submission to Backend
  const handleExecuteBulkEvaluation = async () => {
    const validRows = bulkParsedRows.filter((r) => r.isValid && r.matchedApplicant)
    if (validRows.length === 0) {
      alert('No valid candidate rows to submit. Please fix the errors in your data first.')
      return
    }

    const errorCount = bulkParsedRows.length - validRows.length
    if (errorCount > 0) {
      if (!confirm(`Warning: ${errorCount} invalid rows will be skipped. Do you want to proceed with updating ${validRows.length} valid candidates?`)) {
        return
      }
    }

    setBulkSubmitting(true)
    try {
      const token = await getToken()
      const payloadRecords = validRows.map((r) => ({
        applicant_id: r.matchedApplicant.id,
        roll_number: r.roll_number,
        application_no: r.application_no,
        marks: r.isAbsent ? 0 : r.rawMarksNum,
        total_marks: bulkMaxMarks,
        is_absent: r.isAbsent,
        attendance: r.attendance,
      }))

      const res = await fetch('/api/superadmin/scholarships/evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'bulk_upload_marks',
          scholarship_id: bulkUploadSchemeId,
          total_marks: bulkMaxMarks,
          records: payloadRecords,
        }),
      })

      const data = await res.json()
      if (data.success) {
        alert(data.message || `Successfully processed ${validRows.length} student scores and auto-computed ranks!`)
        setShowBulkMarksModal(false)
        setBulkParsedRows([])
        setBulkPastedText('')
        if (data.applicants) {
          setApplicants(data.applicants)
        } else {
          fetchData()
        }
      } else {
        alert(data.error || 'Failed to execute bulk scoring.')
      }
    } catch (err: any) {
      console.error(err)
      alert('Network error during bulk evaluation: ' + (err?.message || err))
    } finally {
      setBulkSubmitting(false)
    }
  }

  // Open Dossier Inspection Deck
  const handleOpenDossier = (app: ScholarshipApplicant) => {
    setInspectingApplicant(app)
    setDossierStatus(app.document_status || 'verified')
    setDossierRemarks(app.document_remarks || '')
    setDossierChecklist({
      marksheet_percentage_matched: true,
      identity_dob_matched: true,
      eligibility_stream_valid: true,
    })
    setActiveDocTab('marksheet')
    setShowDossierModal(true)
  }

  // Save Dossier Verification
  const handleSaveDossierVerification = async () => {
    if (!inspectingApplicant) return
    setActionLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/scholarships/evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'verify_document',
          applicant_id: inspectingApplicant.id,
          document_status: dossierStatus,
          document_remarks: dossierRemarks,
          checklist: dossierChecklist,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setShowDossierModal(false)
        setApplicants((prev) =>
          prev.map((a) =>
            a.id === inspectingApplicant.id
              ? { ...a, document_status: dossierStatus, document_remarks: dossierRemarks }
              : a
          )
        )
        if (data.applicants) {
          setApplicants(data.applicants)
        } else {
          fetchData()
        }
      } else {
        alert(data.error || 'Failed to update dossier verification.')
      }
    } catch (err: any) {
      console.error(err)
      alert('Error updating dossier: ' + (err?.message || err))
    } finally {
      setActionLoading(false)
    }
  }

  // Quick verify dropdown fallback
  const handleVerifyDocument = async (applicantId: string, status: 'verified' | 'action_needed' | 'rejected') => {
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/scholarships/evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'verify_document',
          applicant_id: applicantId,
          document_status: status,
        }),
      })
      const data = await res.json()
      if (data.success && data.applicants) {
        setApplicants(data.applicants)
      } else {
        setApplicants(applicants.map((a) => (a.id === applicantId ? { ...a, document_status: status } : a)))
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Open Enhanced Award Modal
  const handleOpenAwardModal = (app: ScholarshipApplicant) => {
    setAwardingApplicant(app)
    const defType = app.rank && app.rank <= 3 ? 'both' : 'fee_waiver'
    setAwardType(defType)
    const defAmt =
      app.award_amount ||
      (app.rank === 1
        ? '₹50,000 Cash + 100% Tuition Fee Waiver'
        : app.rank === 2
        ? '₹25,000 Cash + 75% Tuition Fee Waiver'
        : app.rank === 3
        ? '₹10,000 Cash + 50% Tuition Fee Waiver'
        : '100% Tuition Fee Waiver')
    setAwardAmount(defAmt)
    setDisbursementRef(
      app.award_disbursement_ref ||
        `DISB-2026-TXN-${app.application_no ? app.application_no.slice(-4) : Math.floor(1000 + Math.random() * 9000)}`
    )
    setVoucherCode(app.award_voucher_code || `GRAVITY-100-FREE-${app.application_no ? app.application_no.slice(-4) : '2026'}`)
    setPayoutBankUtr(app.payout_details?.bank_utr || `UTR${Date.now().toString().slice(-8)}`)
    setPayoutCashAmount(app.rank === 1 ? '50,000' : app.rank === 2 ? '25,000' : app.rank === 3 ? '10,000' : '0')
    setPayoutNote('Official scholarship prize payout processed via institutional RTGS/UPI.')
    setCopiedVoucher(false)
    setShowAwardModal(true)
  }

  // Execute & Disburse Award
  const handleDisburseAward = async () => {
    if (!awardingApplicant) return
    setActionLoading(true)
    try {
      const token = await getToken()
      const ref = disbursementRef || `DISB-2026-TXN-${Math.floor(1000 + Math.random() * 9000)}`
      const res = await fetch('/api/superadmin/scholarships/evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'award_scholarship',
          applicant_id: awardingApplicant.id,
          award_type: awardType,
          award_amount: awardAmount,
          disbursement_ref: ref,
          voucher_code: voucherCode,
          payout_details: {
            bank_utr: payoutBankUtr,
            amount: payoutCashAmount,
            disbursed_at: new Date().toISOString(),
            status: 'completed',
            note: payoutNote,
          },
          cheque_details: {
            cheque_no: `CQ-${Math.floor(100000 + Math.random() * 900000)}`,
            issue_date: new Date().toISOString().split('T')[0],
            signatory: 'Academic Evaluation & Award Directorate',
          },
        }),
      })
      const data = await res.json()
      if (data.success) {
        setShowAwardModal(false)
        if (data.applicants) {
          setApplicants(data.applicants)
        } else {
          fetchData()
        }
      } else {
        alert(data.error || 'Failed to disburse award.')
      }
    } catch (err: any) {
      console.error(err)
      alert('Error disbursing award: ' + (err?.message || err))
    } finally {
      setActionLoading(false)
    }
  }

  // Bulk Release Results for Active / All Schemes
  const handleBulkReleaseResults = async (targetSchemeId?: string) => {
    const sId = targetSchemeId || filterScheme
    if (!confirm(`Are you sure you want to publish and release official results for ${sId === 'all' ? 'ALL schemes' : 'the selected scheme'}? Top 3 winners will automatically receive their merit awards and rankings will become visible on the public portal.`)) {
      return
    }

    setActionLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/scholarships/evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'bulk_release_results',
          scheme_id: sId,
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert(data.message || 'Results declared and published successfully!')
        fetchData()
      } else {
        alert(data.error || 'Failed to release results.')
      }
    } catch (err) {
      console.error(err)
      alert('Network error while releasing results.')
    } finally {
      setActionLoading(false)
    }
  }

  // Revert Results to Draft
  const handleRevertResultsToDraft = async (targetSchemeId?: string) => {
    const sId = targetSchemeId || filterScheme
    if (!confirm('Revert results back to draft mode? This will hide the results from the public portal until re-declared.')) {
      return
    }

    setActionLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/scholarships/evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'revert_results_to_draft',
          scheme_id: sId,
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert('Results reverted to draft state.')
        fetchData()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  // Metrics
  const totalSchemes = scholarships.length
  const totalApps = applicants.length
  const provisionalAdmitCards = applicants.filter((a) => a.admit_card_status === 'provisional').length
  const releasedAdmitCards = applicants.filter((a) => a.admit_card_status === 'released' || a.admit_card_status === 'approved').length
  const awardedScholars = applicants.filter((a) => a.award_status === 'awarded').length
  const totalCapacity = centers.reduce((sum, c) => sum + (c.max_capacity || 0), 0)
  const allocatedCandidates = applicants.filter((a) => a.assigned_center_id || a.exam_center).length
  const unallocatedCandidates = totalApps - allocatedCandidates

  // Filtered applicants
  const filteredApplicants = applicants.filter((app) => {
    const matchScheme = filterScheme === 'all' || app.scholarship_id === filterScheme
    const matchQuery =
      !searchQuery.trim() ||
      app.applicant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.application_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.registration_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.district && app.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.state && app.state.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.preference_district_1 && app.preference_district_1.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.assigned_center_name && app.assigned_center_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.roll_number && app.roll_number.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchScheme && matchQuery
  })

  // Filtered Centers
  const filteredCenters = centers.filter((c) => {
    const matchState = filterCenterState === 'all' || c.state === filterCenterState
    const matchDist = filterCenterDistrict === 'all' || c.district === filterCenterDistrict
    const matchQuery =
      !searchQuery.trim() ||
      c.center_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.center_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase())
    return matchState && matchDist && matchQuery
  })

  // Geographic Candidate Origin & District Demand Analytics for Active Filtered Scheme
  const activeSchemeApplicants = applicants.filter((a) => {
    if (filterScheme === 'all') return true
    return a.scholarship_id === filterScheme
  })

  interface DistrictDemandStats {
    district: string
    state: string
    pref1Count: number
    pref2Count: number
    homeCount: number
    totalUniqueCandidates: number
    candidateIds: string[]
    existingCenters: ExamCenter[]
    totalCenterCapacity: number
    totalAllocatedSeats: number
    availableCapacity: number
    centerStatus: 'no_center' | 'adequate' | 'warning'
  }

  const districtAnalyticsMap: Record<string, DistrictDemandStats> = {}

  activeSchemeApplicants.forEach((app) => {
    const p1 = (app.preference_district_1 || '').trim()
    const p2 = (app.preference_district_2 || '').trim()
    const homeDist = (app.district || app.city || '').trim()
    const st = (app.preference_state || app.state || 'Bihar').trim()

    // Primary preference district (Main demand)
    if (p1) {
      const key = `${p1}__${st}`.toLowerCase()
      if (!districtAnalyticsMap[key]) {
        districtAnalyticsMap[key] = {
          district: p1,
          state: st,
          pref1Count: 0,
          pref2Count: 0,
          homeCount: 0,
          totalUniqueCandidates: 0,
          candidateIds: [],
          existingCenters: [],
          totalCenterCapacity: 0,
          totalAllocatedSeats: 0,
          availableCapacity: 0,
          centerStatus: 'no_center',
        }
      }
      districtAnalyticsMap[key].pref1Count += 1
      if (!districtAnalyticsMap[key].candidateIds.includes(app.id)) {
        districtAnalyticsMap[key].candidateIds.push(app.id)
        districtAnalyticsMap[key].totalUniqueCandidates += 1
      }
    }

    // Secondary preference district (Alternative demand)
    if (p2) {
      const key = `${p2}__${st}`.toLowerCase()
      if (!districtAnalyticsMap[key]) {
        districtAnalyticsMap[key] = {
          district: p2,
          state: st,
          pref1Count: 0,
          pref2Count: 0,
          homeCount: 0,
          totalUniqueCandidates: 0,
          candidateIds: [],
          existingCenters: [],
          totalCenterCapacity: 0,
          totalAllocatedSeats: 0,
          availableCapacity: 0,
          centerStatus: 'no_center',
        }
      }
      districtAnalyticsMap[key].pref2Count += 1
      if (!districtAnalyticsMap[key].candidateIds.includes(app.id)) {
        districtAnalyticsMap[key].candidateIds.push(app.id)
        districtAnalyticsMap[key].totalUniqueCandidates += 1
      }
    }

    // Home / Native resident district
    if (homeDist) {
      const key = `${homeDist}__${st}`.toLowerCase()
      if (!districtAnalyticsMap[key]) {
        districtAnalyticsMap[key] = {
          district: homeDist,
          state: st,
          pref1Count: 0,
          pref2Count: 0,
          homeCount: 0,
          totalUniqueCandidates: 0,
          candidateIds: [],
          existingCenters: [],
          totalCenterCapacity: 0,
          totalAllocatedSeats: 0,
          availableCapacity: 0,
          centerStatus: 'no_center',
        }
      }
      districtAnalyticsMap[key].homeCount += 1
      if (!districtAnalyticsMap[key].candidateIds.includes(app.id)) {
        districtAnalyticsMap[key].candidateIds.push(app.id)
        districtAnalyticsMap[key].totalUniqueCandidates += 1
      }
    }
  })

  // Match each district with existing centers
  Object.values(districtAnalyticsMap).forEach((stat) => {
    const matching = centers.filter(
      (c) =>
        c.district.toLowerCase() === stat.district.toLowerCase() &&
        (stat.state.toLowerCase() === 'all' || c.state.toLowerCase() === stat.state.toLowerCase())
    )
    stat.existingCenters = matching
    stat.totalCenterCapacity = matching.reduce((sum, c) => sum + (c.max_capacity || 0), 0)
    stat.totalAllocatedSeats = matching.reduce((sum, c) => sum + (c.allocated_count || 0), 0)
    stat.availableCapacity = Math.max(0, stat.totalCenterCapacity - stat.totalAllocatedSeats)
    if (matching.length === 0) {
      stat.centerStatus = 'no_center'
    } else if (stat.availableCapacity >= stat.pref1Count) {
      stat.centerStatus = 'adequate'
    } else {
      stat.centerStatus = 'warning'
    }
  })

  const sortedDistrictAnalytics = Object.values(districtAnalyticsMap).sort((a, b) => {
    return (b.pref1Count + b.homeCount) - (a.pref1Count + a.homeCount)
  })

  const districtsNeedingCenters = sortedDistrictAnalytics.filter((d) => d.existingCenters.length === 0)

  // Grouping candidates by allocated Exam Center for Verification Rosters & Attendance Sheets
  const centerRosterGroups = useMemo(() => {
    const eligibleApps = applicants.filter((app) => {
      const matchScheme = rosterSelectedSchemeId === 'all' || app.scholarship_id === rosterSelectedSchemeId
      const hasCenter = !!(app.assigned_center_id || app.assigned_center_name || app.exam_center)
      return matchScheme && hasCenter
    })

    const groupMap: Record<
      string,
      {
        centerId: string
        centerCode: string
        centerName: string
        state: string
        district: string
        city: string
        address: string
        landmark?: string
        googleMapsUrl?: string
        contactPerson?: string
        contactPhone?: string
        contactEmail?: string
        maxCapacity: number
        students: ScholarshipApplicant[]
      }
    > = {}

    // Initialize all known centers
    centers.forEach((c) => {
      groupMap[c.id] = {
        centerId: c.id,
        centerCode: c.center_code || 'CTR-EXAM',
        centerName: c.center_name,
        state: c.state || '',
        district: c.district || '',
        city: c.city || c.district || '',
        address: c.address || '',
        landmark: c.landmark || '',
        googleMapsUrl: c.google_maps_url || '',
        contactPerson: c.contact_person || 'Center Superintendent',
        contactPhone: c.contact_phone || '',
        contactEmail: c.contact_email || '',
        maxCapacity: c.max_capacity || 100,
        students: [],
      }
    })

    // Assign eligible students to their center group
    eligibleApps.forEach((app) => {
      let matchedGroup = null
      if (app.assigned_center_id && groupMap[app.assigned_center_id]) {
        matchedGroup = groupMap[app.assigned_center_id]
      } else if (app.assigned_center_name) {
        const found = Object.values(groupMap).find(
          (g) => g.centerName.toLowerCase() === app.assigned_center_name?.toLowerCase()
        )
        if (found) matchedGroup = found
      } else if (app.exam_center) {
        const found = Object.values(groupMap).find(
          (g) => g.centerName.toLowerCase() === app.exam_center?.toLowerCase()
        )
        if (found) matchedGroup = found
      }

      if (!matchedGroup) {
        const fallbackKey = `center_${(app.assigned_center_name || app.exam_center || 'General').toLowerCase().replace(/\s+/g, '_')}`
        if (!groupMap[fallbackKey]) {
          groupMap[fallbackKey] = {
            centerId: fallbackKey,
            centerCode: app.assigned_center_code || 'CTR-ALLOT',
            centerName: app.assigned_center_name || app.exam_center || 'Designated Examination Center',
            state: app.state || 'Bihar',
            district: app.district || 'Patna',
            city: app.city || app.district || 'Patna',
            address: app.assigned_center_address || 'Official Examination Center Campus',
            landmark: app.assigned_center_landmark || '',
            googleMapsUrl: app.assigned_center_maps_url || '',
            contactPerson: 'Center Superintendent',
            contactPhone: '',
            contactEmail: '',
            maxCapacity: 100,
            students: [],
          }
        }
        matchedGroup = groupMap[fallbackKey]
      }

      matchedGroup.students.push(app)
    })

    // Sort students within each center sequentially by Roll Number -> App Number
    Object.values(groupMap).forEach((g) => {
      g.students.sort((a, b) => {
        if (a.roll_number && b.roll_number) return a.roll_number.localeCompare(b.roll_number)
        if (a.roll_number && !b.roll_number) return -1
        if (!a.roll_number && b.roll_number) return 1
        return a.application_no.localeCompare(b.application_no)
      })
    })

    // Return groups filtered by selected center
    return Object.values(groupMap).filter((g) => {
      if (rosterSelectedCenterId !== 'all') {
        return g.centerId === rosterSelectedCenterId || g.centerName.toLowerCase() === rosterSelectedCenterId.toLowerCase()
      }
      return g.students.length > 0
    })
  }, [applicants, centers, rosterSelectedCenterId, rosterSelectedSchemeId])

  const handleCopyRosterEmailText = (group: any) => {
    const lines = [
      `=============================================================`,
      `OFFICIAL CANDIDATE EXAMINATION & VERIFICATION ROSTER`,
      `GRAVITY & FOUNDATION — NATIONAL SCHOLARSHIP 2026`,
      `=============================================================`,
      `CENTER: [${group.centerCode}] ${group.centerName}`,
      `LOCATION: ${group.address}, ${group.city}, ${group.district}, ${group.state}`,
      `SUPERINTENDENT: ${group.contactPerson} (${group.contactPhone || 'N/A'})`,
      `TOTAL ALLOCATED CANDIDATES: ${group.students.length}`,
      `-------------------------------------------------------------`,
      `SR | STUDENT NAME | ROLL NO. | REG CODE | APP NO. | CLASS`,
      `-------------------------------------------------------------`,
      ...group.students.map(
        (s: ScholarshipApplicant, idx: number) =>
          `${(idx + 1).toString().padStart(2, '0')}. ${s.applicant_name} | ROLL: ${s.roll_number || 'PENDING'} | REG: ${s.registration_code} | APP: ${s.application_no} | CLASS: ${s.qualification || 'N/A'}`
      ),
      `-------------------------------------------------------------`,
      `INSTRUCTIONS FOR EXAM CENTER:`,
      `1. Verify each candidate's printed Admit Card and Photo ID proof against this nominal roll before exam room entry.`,
      `2. Obtain candidate signatures in the attendance roster.`,
      `=============================================================`,
    ]
    navigator.clipboard.writeText(lines.join('\n'))
    setCopiedRosterText(true)
    setTimeout(() => setCopiedRosterText(false), 2500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4 bg-gradient-to-r from-white via-pink-50/20 to-purple-50/20 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="flex items-start sm:items-center gap-3 sm:gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#C81E4E] via-[#FF2D8D] to-[#9C27FF] flex items-center justify-center text-white shadow-md shadow-pink-500/20 ring-4 ring-pink-50 flex-shrink-0">
            <FiAward size={20} className="animate-pulse sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
                Scholarships, Exam Centers & Hall Ticket Allocation
              </h1>
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full bg-pink-100 text-[#C81E4E] border border-pink-200">
                Exam Portal v2.0
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 max-w-3xl leading-relaxed">
              End-to-end examination lifecycle: District preferences, Master Exam Centers, Smart Capacity Allocation, and Official Admit Cards
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto self-start lg:self-center pt-1 sm:pt-0">
          <button
            onClick={fetchData}
            className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-2 shadow-xs hover:shadow-sm"
          >
            <FiRefreshCw className={`text-gray-500 ${loading ? 'animate-spin text-[#C81E4E]' : ''}`} size={14} />
            Refresh
          </button>

          {tab === 'schemes' && (
            <button
              onClick={handleOpenAddScheme}
              className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-[#FF2D8D] via-[#E11D48] to-[#9C27FF] hover:opacity-95 text-white rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shadow-md shadow-pink-500/20 hover:shadow-lg flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 whitespace-nowrap"
            >
              <FiPlus size={15} />
              <span>Create Scholarship Scheme</span>
            </button>
          )}

          {tab === 'centers' && (
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setRosterSelectedCenterId('all')
                  setShowRosterModal(true)
                }}
                className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 sm:py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
                title="Download Candidate Verification Rosters for all centers"
              >
                <FiFileText size={14} />
                <span>📄 Rosters (PDF)</span>
              </button>
              <button
                onClick={handleOpenAddCenter}
                className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-[#9C27FF] to-[#FF2D8D] hover:opacity-95 text-white rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shadow-md shadow-purple-500/20 hover:shadow-lg flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 whitespace-nowrap"
              >
                <FiPlus size={15} />
                <span>Add Exam Center</span>
              </button>
            </div>
          )}

          {tab === 'admit_cards' && (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setRosterSelectedCenterId('all')
                  setShowRosterModal(true)
                }}
                className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap"
                title="Download & Print Candidate Verification Nominal Rolls for Centers"
              >
                <FiFileText size={14} />
                <span>📄 Rosters (PDF)</span>
              </button>

              <button
                onClick={handleRunAutoAllocation}
                disabled={actionLoading || unallocatedCandidates === 0}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  unallocatedCandidates > 0
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg shadow-purple-500/20 active:scale-95'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                }`}
                title="Automatically allocate nearest center based on District Preference 1 & 2"
              >
                <FiZap size={14} />
                <span>⚡ Auto-Allocate ({unallocatedCandidates})</span>
              </button>

              <button
                onClick={handlePublishAdmitCards}
                disabled={actionLoading || provisionalAdmitCards === 0}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  provisionalAdmitCards > 0
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-lg shadow-emerald-500/20 animate-pulse active:scale-95'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                <FiCheckSquare size={14} />
                <span>Publish Cards ({provisionalAdmitCards})</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3.5">
        {/* Schemes */}
        <div className="group relative bg-gradient-to-b from-pink-50/60 via-white to-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-pink-200/70 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 to-[#FF2D8D] opacity-80" />
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-pink-700/80">Schemes</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-pink-100 text-[#FF2D8D] flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiAward size={14} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">{totalSchemes}</div>
          <div className="mt-1.5 sm:mt-2 inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-pink-700 bg-pink-50/80 px-1.5 sm:px-2 py-0.5 rounded-md border border-pink-200/50">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 inline-block shrink-0" />
            Active Programs
          </div>
        </div>

        {/* Applicants */}
        <div className="group relative bg-gradient-to-b from-purple-50/60 via-white to-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-purple-200/70 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-[#9C27FF] opacity-80" />
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-purple-700/80">Applicants</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-purple-100 text-[#9C27FF] flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiUsers size={14} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">{totalApps}</div>
          <div className="mt-1.5 sm:mt-2 inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-md border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
            Verified Intake
          </div>
        </div>

        {/* Exam Centers */}
        <div className="group relative bg-gradient-to-b from-indigo-50/60 via-white to-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-indigo-200/70 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-purple-500 opacity-80" />
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-indigo-700/80">Exam Centers</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiMapPin size={14} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">{centers.length}</div>
          <div className="mt-1.5 sm:mt-2 inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 sm:px-2 py-0.5 rounded-md border border-indigo-200/60 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block shrink-0" />
            {totalCapacity} Seats
          </div>
        </div>

        {/* Provisional */}
        <div className="group relative bg-gradient-to-b from-amber-50/60 via-white to-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-amber-200/70 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 opacity-80" />
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-700/80">Provisional</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiClock size={14} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-900 tracking-tight">{provisionalAdmitCards}</div>
          <div className="mt-1.5 sm:mt-2 inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-amber-700 bg-amber-50 px-1.5 sm:px-2 py-0.5 rounded-md border border-amber-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block shrink-0" />
            Awaiting Release
          </div>
        </div>

        {/* Official Tickets */}
        <div className="group relative bg-gradient-to-b from-emerald-50/60 via-white to-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-200/70 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-80" />
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-700/80">Official Tickets</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiCheckCircle size={14} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-950 tracking-tight">{releasedAdmitCards}</div>
          <div className="mt-1.5 sm:mt-2 inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-md border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
            Released & Live
          </div>
        </div>

        {/* Scholars Awarded */}
        <div className="group relative bg-gradient-to-b from-rose-50/60 via-white to-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-rose-200/70 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 to-[#C81E4E] opacity-80" />
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-rose-700/80">Scholars Awarded</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-rose-100 text-[#C81E4E] flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiTrendingUp size={14} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-rose-900 tracking-tight">{awardedScholars}</div>
          <div className="mt-1.5 sm:mt-2 inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-[#C81E4E] bg-rose-50 px-1.5 sm:px-2 py-0.5 rounded-md border border-rose-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C81E4E] inline-block shrink-0" />
            Grants Disbursed
          </div>
        </div>
      </div>

      {/* Touch-Friendly Swipeable Tabs Navigation */}
      <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-xl sm:rounded-2xl border border-gray-200/90 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth -mx-1 px-1 sm:mx-0 sm:px-1.5">
        <button
          onClick={() => setTab('schemes')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 whitespace-nowrap ${
            tab === 'schemes'
              ? 'bg-gradient-to-r from-[#C81E4E] to-[#E11D48] text-white shadow-md shadow-pink-500/20'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
          }`}
        >
          <FiLayers size={14} className={tab === 'schemes' ? 'text-white' : 'text-gray-400'} />
          <span className="hidden sm:inline">1. Schemes & Policy</span>
          <span className="sm:hidden">1. Schemes</span>
          <span
            className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold ${
              tab === 'schemes'
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-600 border border-gray-200/60'
            }`}
          >
            {scholarships.length}
          </span>
        </button>

        <button
          onClick={() => setTab('applications')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 whitespace-nowrap ${
            tab === 'applications'
              ? 'bg-gradient-to-r from-[#C81E4E] to-[#E11D48] text-white shadow-md shadow-pink-500/20'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
          }`}
        >
          <FiUsers size={14} className={tab === 'applications' ? 'text-white' : 'text-[#9C27FF]'} />
          <span className="hidden sm:inline">2. Candidate Intake</span>
          <span className="sm:hidden">2. Intake</span>
          <span
            className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold ${
              tab === 'applications'
                ? 'bg-white/20 text-white'
                : 'bg-purple-50 text-purple-700 border border-purple-200/60'
            }`}
          >
            {applicants.length}
          </span>
        </button>

        <button
          onClick={() => setTab('centers')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 whitespace-nowrap ${
            tab === 'centers'
              ? 'bg-gradient-to-r from-[#C81E4E] to-[#E11D48] text-white shadow-md shadow-pink-500/20'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
          }`}
        >
          <FiMapPin size={14} className={tab === 'centers' ? 'text-white' : 'text-indigo-600'} />
          <span className="hidden sm:inline">3. Exam Centers Master</span>
          <span className="sm:hidden">3. Centers</span>
          <span
            className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold ${
              tab === 'centers'
                ? 'bg-white/20 text-white'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
            }`}
          >
            {centers.length}
          </span>
        </button>

        <button
          onClick={() => setTab('admit_cards')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 whitespace-nowrap ${
            tab === 'admit_cards'
              ? 'bg-gradient-to-r from-[#C81E4E] to-[#E11D48] text-white shadow-md shadow-pink-500/20'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
          }`}
        >
          <FiZap size={14} className={tab === 'admit_cards' ? 'text-white' : 'text-amber-500'} />
          <span className="hidden sm:inline">4. Center Allocation & Cards</span>
          <span className="sm:hidden">4. Allocation</span>
          {provisionalAdmitCards > 0 ? (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black bg-amber-400 text-amber-950 shadow-xs animate-pulse">
              {provisionalAdmitCards} Provisional
            </span>
          ) : (
            <span
              className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold ${
                tab === 'admit_cards'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
              }`}
            >
              {releasedAdmitCards} Live
            </span>
          )}
        </button>

        <button
          onClick={() => setTab('evaluation')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 whitespace-nowrap ${
            tab === 'evaluation'
              ? 'bg-gradient-to-r from-[#C81E4E] to-[#E11D48] text-white shadow-md shadow-pink-500/20'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
          }`}
        >
          <FiAward size={14} className={tab === 'evaluation' ? 'text-white' : 'text-amber-500'} />
          <span className="hidden sm:inline">5. Exam Evaluation & Merit List</span>
          <span className="sm:hidden">5. Evaluation</span>
        </button>

        <button
          onClick={() => setTab('awards')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 whitespace-nowrap ${
            tab === 'awards'
              ? 'bg-gradient-to-r from-[#C81E4E] to-[#E11D48] text-white shadow-md shadow-pink-500/20'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
          }`}
        >
          <FiCheckCircle size={14} className={tab === 'awards' ? 'text-white' : 'text-[#C81E4E]'} />
          <span className="hidden sm:inline">6. Verification & Awards</span>
          <span className="sm:hidden">6. Awards</span>
          <span
            className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold ${
              tab === 'awards'
                ? 'bg-white/20 text-white'
                : 'bg-rose-50 text-[#C81E4E] border border-rose-200/60'
            }`}
          >
            {awardedScholars}
          </span>
        </button>

        <button
          onClick={() => setTab('referral_codes')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 whitespace-nowrap ${
            tab === 'referral_codes'
              ? 'bg-gradient-to-r from-[#C81E4E] to-[#E11D48] text-white shadow-md shadow-pink-500/20'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
          }`}
        >
          <FiShare2 size={14} className={tab === 'referral_codes' ? 'text-white' : 'text-fuchsia-600'} />
          <span className="hidden sm:inline">7. Referral & Ref Codes</span>
          <span className="sm:hidden">7. Refs</span>
          <span
            className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold ${
              tab === 'referral_codes'
                ? 'bg-white/20 text-white'
                : 'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200/60'
            }`}
          >
            {refCodeStats.active_codes}
          </span>
        </button>
      </div>

      {/* Global Filter Bar (for Applications, Admit Cards, Evaluation, Awards) */}
      {tab !== 'schemes' && tab !== 'centers' && tab !== 'referral_codes' && (
        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 shadow-xs sm:shadow-sm flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search candidate name, App No., Code, Roll..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
              />
            </div>

            <select
              value={filterScheme}
              onChange={(e) => setFilterScheme(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 bg-white"
            >
              <option value="all">All Scholarship Schemes</option>
              {scholarships.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-gray-500 font-medium flex items-center justify-between sm:justify-start gap-2">
            <span>Filtered Candidates:</span>
            <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-lg border border-gray-200">
              {filteredApplicants.length}
            </span>
          </div>
        </div>
      )}

      {/* TAB 1: SCHEMES & BUILDER */}
      {tab === 'schemes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {scholarships.map((item) => {
            const isDraft = item.status === 'draft'
            const isPublished = item.status === 'published' || item.status === 'active'
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 shadow-xs sm:shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div className="space-y-3.5 sm:space-y-4">
                  {/* Top Header: Badge, Category, Status */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center ${
                        item.color_theme === 'pink'
                          ? 'bg-pink-50 text-[#FF2D8D]'
                          : item.color_theme === 'purple'
                          ? 'bg-purple-50 text-[#9C27FF]'
                          : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      <FiAward size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-pink-50 text-[#FF2D8D]">
                        {item.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleSchemeStatus(item)}
                        title="Click to toggle Draft / Published status"
                        className={`text-[9px] sm:text-[10px] font-bold uppercase px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex items-center gap-1 transition-all cursor-pointer ${
                          isDraft
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                            : isPublished
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isDraft ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        {item.status?.toUpperCase() || 'PUBLISHED'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug group-hover:text-[#FF2D8D] transition-colors">
                      {item.title}
                    </h3>
                    <div className="font-black text-[#FF2D8D] text-xs sm:text-sm mt-0.5 sm:mt-1">{item.scholarship_value}</div>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{item.description}</p>

                  {/* Tiered Prizes Highlight (1st, 2nd, 3rd Prize) */}
                  <div className="p-2.5 sm:p-3 bg-gradient-to-r from-pink-50/70 to-purple-50/70 rounded-xl sm:rounded-2xl border border-pink-100/60 space-y-1.5">
                    <div className="text-[10px] sm:text-[11px] font-bold text-gray-700 flex justify-between">
                      <span>🏆 Prize Pool Breakdown</span>
                      <span className="text-purple-700 font-extrabold">{item.number_of_winners || 50} Winners</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 sm:gap-1.5 text-center text-[9px] sm:text-[10px]">
                      <div className="bg-white/80 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-pink-100">
                        <div className="text-gray-400 font-semibold truncate">🥇 1st Prize</div>
                        <div className="font-black text-[#FF2D8D] truncate">{item.prize_distribution?.first_prize || '₹50,000'}</div>
                      </div>
                      <div className="bg-white/80 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-pink-100">
                        <div className="text-gray-400 font-semibold truncate">🥈 2nd Prize</div>
                        <div className="font-black text-purple-700 truncate">{item.prize_distribution?.second_prize || '₹25,000'}</div>
                      </div>
                      <div className="bg-white/80 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-pink-100">
                        <div className="text-gray-400 font-semibold truncate">🥉 3rd Prize</div>
                        <div className="font-black text-blue-600 truncate">{item.prize_distribution?.third_prize || '₹10,000'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Policy Specs */}
                  <div className="p-3 sm:p-3.5 bg-gray-50/80 rounded-xl sm:rounded-2xl border border-gray-100 space-y-1.5 sm:space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Registration Fee:</span>
                      <span className="font-bold text-gray-800">
                        {item.application_fee === 0 ? 'FREE (₹0)' : `₹${item.application_fee}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Application Window:</span>
                      <span className="font-semibold text-gray-800 text-[11px] sm:text-xs">
                        {item.application_start_date || 'Open'} ➔ {item.application_end_date || 'TBD'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Exam Pattern:</span>
                      <span className="font-semibold text-gray-800 text-[11px] sm:text-xs">
                        {item.exam_mode?.toUpperCase()} • {item.exam_duration || '120 Mins'} • {item.total_questions || 100} Qs
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Eligibility:</span>
                      <span className="font-bold text-emerald-700 text-[11px] sm:text-xs">
                        ≥ {item.min_percentage}% • {item.age_limit || '16-28 Yrs'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-gray-100/60">
                      <span className="text-gray-400">Exam Centers:</span>
                      <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px]">
                        {item.exam_centers && item.exam_centers.length > 0
                          ? `${item.exam_centers.length} Center(s) Configured`
                          : '1 Center'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3.5 sm:pt-4 mt-3.5 sm:mt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSchemeStatus(item)}
                      className={`px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-bold rounded-lg transition-all ${
                        isDraft
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      {isDraft ? '🚀 Publish Scheme' : '📝 Set to Draft'}
                    </button>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => handleOpenEditScheme(item)}
                      className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title="Edit Scheme"
                    >
                      <FiEdit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteScheme(item.id)}
                      className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete Scheme"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* TAB 2: CANDIDATE APPLICATIONS & GEOGRAPHIC INTELLIGENCE */}
      {tab === 'applications' && (
        <div className="space-y-4 sm:space-y-6">
          {/* 📍 GEOGRAPHIC CANDIDATE ORIGIN & DISTRICT EXAM CENTER DEMAND HUB */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white shadow-xl space-y-3.5 sm:space-y-4 border border-indigo-900/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4 border-b border-white/10 pb-3.5 sm:pb-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-pink-500/20 text-[#FF2D8D] border border-pink-500/30 flex items-center gap-1">
                    <FiMapPin size={11} className="text-[#FF2D8D]" /> Candidate Geographic Intelligence
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Scheme: {filterScheme === 'all' ? 'All Active Scholarships' : (scholarships.find((s) => s.id === filterScheme)?.title || 'Selected Scheme')}
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-white leading-tight">
                  Where are Students Applying From? (District Demand & Center Status)
                </h3>
                <p className="text-xs text-purple-200 max-w-3xl leading-relaxed font-normal">
                  Real-time breakdown of candidate physical locations and district exam preferences for the selected scholarship. Use this data to determine where new Exam Centers are needed and with what seat capacity.
                </p>
              </div>

              {/* Geographic Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 shrink-0 text-center text-xs">
                <div className="bg-white/10 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-white/10">
                  <div className="text-[9px] sm:text-[10px] uppercase font-bold text-purple-200">Total Intake</div>
                  <div className="text-base sm:text-lg font-black text-white mt-0.5">{activeSchemeApplicants.length}</div>
                </div>
                <div className="bg-white/10 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-white/10">
                  <div className="text-[9px] sm:text-[10px] uppercase font-bold text-purple-200">Active Districts</div>
                  <div className="text-base sm:text-lg font-black text-white mt-0.5">{sortedDistrictAnalytics.length}</div>
                </div>
                <div className="bg-white/10 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-white/10">
                  <div className="text-[9px] sm:text-[10px] uppercase font-bold text-amber-300">Pending Centers</div>
                  <div className="text-base sm:text-lg font-black text-amber-400 mt-0.5">{districtsNeedingCenters.length}</div>
                </div>
                <div className="bg-white/10 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-white/10">
                  <div className="text-[9px] sm:text-[10px] uppercase font-bold text-emerald-300">Master Centers</div>
                  <div className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">{centers.length}</div>
                </div>
              </div>
            </div>

            {/* District Breakdown Cards Grid */}
            {sortedDistrictAnalytics.length === 0 ? (
              <div className="p-6 sm:p-8 text-center bg-white/5 rounded-2xl border border-white/10 text-xs text-purple-200">
                No candidate registrations found for the selected filter.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-purple-200 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <FiLayers size={13} className="text-pink-400" /> District Demand vs Center Readiness:
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-purple-300 font-normal lowercase">
                    Click any district to filter candidate table below
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
                  {sortedDistrictAnalytics.map((stat) => {
                    const hasCenter = stat.existingCenters.length > 0
                    const isFiltered = searchQuery.toLowerCase() === stat.district.toLowerCase()

                    return (
                      <div
                        key={`${stat.district}_${stat.state}`}
                        className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 relative group ${
                          isFiltered
                            ? 'bg-purple-900/80 border-[#FF2D8D] ring-2 ring-[#FF2D8D]/40 shadow-lg'
                            : hasCenter
                            ? 'bg-white/10 hover:bg-white/15 border-white/15'
                            : 'bg-gradient-to-b from-amber-500/10 via-purple-900/40 to-slate-900 border-amber-500/30 hover:border-amber-400/60'
                        }`}
                      >
                        {/* District Card Header */}
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <span className="text-sm sm:text-base font-black text-white flex items-center gap-1">
                                📍 {stat.district}
                              </span>
                              <span className="text-[9px] sm:text-[10px] font-bold text-purple-300 uppercase px-1.5 py-0.5 rounded-md bg-white/10">
                                {stat.state}
                              </span>
                            </div>

                            <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-black bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white shadow-xs shrink-0">
                              {stat.totalUniqueCandidates} Candidate{stat.totalUniqueCandidates > 1 ? 's' : ''}
                            </span>
                          </div>

                          {/* 3-Way Preference Breakdown */}
                          <div className="grid grid-cols-3 gap-1 sm:gap-1.5 pt-1 text-[10px] text-center">
                            <div className="bg-white/10 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-white/10">
                              <div className="text-gray-300 font-semibold text-[9px] truncate">🥇 1st Choice</div>
                              <div className="font-extrabold text-pink-300 text-xs mt-0.5">{stat.pref1Count}</div>
                            </div>
                            <div className="bg-white/10 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-white/10">
                              <div className="text-gray-300 font-semibold text-[9px] truncate">🥈 2nd Choice</div>
                              <div className="font-extrabold text-purple-300 text-xs mt-0.5">{stat.pref2Count}</div>
                            </div>
                            <div className="bg-white/10 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-white/10">
                              <div className="text-gray-300 font-semibold text-[9px] truncate">🏠 Home Dist</div>
                              <div className="font-extrabold text-blue-300 text-xs mt-0.5">{stat.homeCount}</div>
                            </div>
                          </div>
                        </div>

                        {/* Center Status & Action Box */}
                        <div className="space-y-2 pt-2 border-t border-white/10">
                          {hasCenter ? (
                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-0.5">
                                <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                                  <FiCheckCircle size={12} className="text-emerald-400 shrink-0" />
                                  <span>{stat.existingCenters.length} Center(s) Available</span>
                                </div>
                                <div className="text-[10px] text-purple-200">
                                  Capacity: {stat.totalAllocatedSeats} / {stat.totalCenterCapacity} Seats
                                </div>
                              </div>
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTab('centers')
                                    setFilterCenterState(stat.state)
                                    setFilterCenterDistrict(stat.district)
                                  }}
                                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] sm:text-[11px] rounded-xl transition-all"
                                  title="Manage Centers in this district"
                                >
                                  View Center
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold">
                                <span className="flex items-center gap-1 truncate">
                                  <FiAlertCircle size={12} className="text-amber-400 shrink-0" />
                                  No Center in {stat.district}
                                </span>
                                <span className="text-[9px] sm:text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 font-mono shrink-0">
                                  Need ≥ {stat.pref1Count || stat.homeCount}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleQuickCreateCenterForDistrict(stat.district, stat.state, stat.pref1Count || stat.homeCount)}
                                  className="flex-1 py-1.5 sm:py-2 px-2.5 sm:px-3 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] hover:opacity-95 text-white font-extrabold text-[10px] sm:text-[11px] rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                                >
                                  <FiPlus size={12} />
                                  <span>+ Center in {stat.district}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSearchQuery(stat.district)}
                                  className="px-2.5 py-1.5 sm:py-2 bg-white/15 hover:bg-white/25 text-white font-bold text-[11px] rounded-xl transition-all"
                                  title="Filter students"
                                >
                                  <FiSearch size={12} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Active Search / Filter reset bar */}
            {searchQuery && (
              <div className="p-2.5 bg-white/10 rounded-xl flex items-center justify-between text-xs text-purple-200">
                <span>
                  Filtering: <strong className="text-white">&quot;{searchQuery}&quot;</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold text-[10px] sm:text-[11px] transition-colors"
                >
                  ✕ Clear
                </button>
              </div>
            )}
          </div>

          {/* CANDIDATE INTAKE: MOBILE CARDS VIEW (md:hidden) */}
          <div className="block md:hidden space-y-3">
            {filteredApplicants.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs space-y-3"
              >
                {/* Header: Photo + Name + App No + Reg Code */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 shadow-xs">
                      <img
                        src={app.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face'}
                        alt={app.applicant_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-gray-900 text-sm truncate">{app.applicant_name}</div>
                      <div className="text-gray-500 text-[11px] truncate">{app.applicant_email}</div>
                      <div className="text-gray-400 text-[10px]">{app.applicant_phone}</div>
                    </div>
                  </div>

                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                      app.admit_card_status === 'released' || app.admit_card_status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                    }`}
                  >
                    ● {app.admit_card_status === 'released' ? 'Live' : 'Provisional'}
                  </span>
                </div>

                {/* Scheme & Roll / App Details */}
                <div className="p-2.5 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#FF2D8D] text-xs truncate max-w-[200px]">{app.scholarship_title}</span>
                    <span className="font-mono font-bold text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                      {app.registration_code}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono pt-1 border-t border-gray-200/60">
                    <span>App: <strong className="text-gray-800">{app.application_no}</strong></span>
                    <span>{new Date(app.created_at).toLocaleDateString()}</span>
                  </div>
                  {(app.reference_code || app.documents?.reference_code) && (
                    <div className="font-mono text-[9px] font-bold text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-200/60 px-2 py-0.5 rounded-md inline-flex items-center gap-1 mt-1">
                      <span>🔗 Ref Code:</span>
                      <span className="font-extrabold">{app.reference_code || app.documents?.reference_code}</span>
                    </div>
                  )}
                </div>

                {/* District Preferences */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-pink-50/60 p-2 rounded-xl border border-pink-100/80">
                    <span className="text-[10px] uppercase font-bold text-pink-700 block">1st District Choice</span>
                    <span className="font-bold text-gray-900 text-xs mt-0.5 flex items-center gap-1">
                      📍 {app.preference_district_1 || app.district || 'Patna'}
                    </span>
                  </div>
                  <div className="bg-purple-50/60 p-2 rounded-xl border border-purple-100/80">
                    <span className="text-[10px] uppercase font-bold text-purple-700 block">2nd District Choice</span>
                    <span className="font-bold text-gray-900 text-xs mt-0.5 flex items-center gap-1">
                      📍 {app.preference_district_2 || 'Gaya'}
                    </span>
                  </div>
                </div>

                {/* Academics, Score & Fee Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                      {app.percentage}% Score
                    </span>
                    <span className="text-gray-500 text-[11px] font-medium">{app.qualification}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        app.payment_status === 'paid' || app.payment_status === 'free'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      ● {app.payment_status === 'free' ? 'Free (₹0)' : `Paid ₹${app.payment_amount}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteApplicant(app)}
                      disabled={actionLoading}
                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                      title="Delete Candidate"
                    >
                      <FiTrash2 size={11} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredApplicants.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 text-gray-400 text-xs">
                No candidates found matching the search criteria.
              </div>
            )}
          </div>

          {/* CANDIDATE INTAKE: DESKTOP DATA TABLE (hidden md:block) */}
          <div className="hidden md:block bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs sm:shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600 min-w-[750px]">
                <thead className="bg-gray-50/80 text-[10px] sm:text-[11px] uppercase font-bold text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4">App No. & Date</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4">Candidate Details</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4">Target Scheme</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4">District Preferences</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4">Academics & Income</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4">Fee Payment</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4">Secret Code</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4 text-center">Admit Card Status</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredApplicants.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4">
                        <div className="font-mono font-bold text-gray-900">{app.application_no}</div>
                        <div className="text-gray-400 text-[10px] mt-0.5">{new Date(app.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                            <img
                              src={app.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face'}
                              alt={app.applicant_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-xs sm:text-sm">{app.applicant_name}</div>
                            <div className="text-gray-400 text-[11px] truncate max-w-[140px] sm:max-w-none">{app.applicant_email}</div>
                            <div className="text-gray-400 text-[10px]">{app.applicant_phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4">
                        <div className="font-bold text-[#FF2D8D]">{app.scholarship_title}</div>
                        <div className="text-gray-400 text-[10px] mt-0.5">Native: {app.district || 'N/A'}, {app.state || 'Bihar'}</div>
                        {(app.reference_code || app.documents?.reference_code) && (
                          <div className="font-mono text-[9px] font-bold text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-200/60 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 mt-1">
                            <span>🔗 Ref:</span>
                            <span>{app.reference_code || app.documents?.reference_code}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4">
                        <div className="space-y-0.5">
                          <div className="font-bold text-gray-800 text-[11px]">
                            1st: <span className="text-[#FF2D8D]">📍 {app.preference_district_1 || app.district || 'Patna'}</span>
                          </div>
                          <div className="text-gray-500 text-[10px]">
                            2nd: 📍 {app.preference_district_2 || 'Gaya'}
                          </div>
                        </div>
                      </td>
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4">
                        <div>{app.qualification}</div>
                        <div className="font-bold text-emerald-600">{app.percentage}% Score</div>
                        <div className="text-gray-400 text-[10px]">Income: ₹{app.annual_family_income || 5} LPA</div>
                      </td>
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4">
                        <span
                          className={`inline-block px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase ${
                            app.payment_status === 'paid' || app.payment_status === 'free'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}
                        >
                          ● {app.payment_status === 'free' ? 'Free (₹0)' : `Paid ₹${app.payment_amount}`}
                        </span>
                        {app.payment_reference && (
                          <div className="font-mono text-[9px] text-gray-400 mt-1">{app.payment_reference}</div>
                        )}
                      </td>
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4">
                        <span className="font-mono font-bold px-2 py-1 bg-purple-50 text-[#9C27FF] rounded-lg text-xs">
                          {app.registration_code}
                        </span>
                      </td>
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4 text-center">
                        <span
                          className={`inline-block px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase ${
                            app.admit_card_status === 'released' || app.admit_card_status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}
                        >
                          {app.admit_card_status === 'released' ? 'Official Issued' : 'Provisional'}
                        </span>
                      </td>
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteApplicant(app)}
                          disabled={actionLoading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs disabled:opacity-50"
                          title={`Delete application for ${app.applicant_name}`}
                        >
                          <FiTrash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EXAM CENTERS MASTER MANAGEMENT */}
      {tab === 'centers' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Centers Overview Banner */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-1.5 sm:space-y-2">
              <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase px-2.5 sm:px-3 py-0.5 sm:py-1 bg-white/20 rounded-full flex items-center gap-1.5 w-max">
                <FiMapPin size={11} className="text-[#FF2D8D]" /> Physical Infrastructure & Logistics
              </span>
              <h2 className="text-lg sm:text-2xl font-extrabold">Master Examination Centers & Assessment Hubs</h2>
              <p className="text-xs text-purple-200 max-w-2xl leading-relaxed">
                Manage physical test centers, school partner campuses, and lab facilities across India. During student registration, candidates submit their district preferences. Once registration closes, use the <strong>Allocation Engine</strong> to distribute students based on center capacity.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 shrink-0">
              <button
                onClick={handleOpenAddCenter}
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold transition-all shadow-xl hover:shadow-pink-500/30 flex items-center justify-center gap-2"
              >
                <FiPlus size={16} />
                + Add New Exam Center
              </button>
            </div>
          </div>

          {/* District Demand Recommendation Alert Banner */}
          {districtsNeedingCenters.length > 0 && (
            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2.5 sm:space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5">
                <div className="flex items-center gap-2 text-amber-950 font-black text-xs sm:text-sm">
                  <FiAlertCircle className="text-amber-600 shrink-0" size={16} />
                  <span>District Demand Recommendations: {districtsNeedingCenters.length} District(s) with 0 Centers</span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100 self-start sm:self-auto">
                  Target: {filterScheme === 'all' ? 'All Active' : (scholarships.find((s) => s.id === filterScheme)?.title || 'Selected')}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
                {districtsNeedingCenters.slice(0, 8).map((d) => (
                  <div key={`${d.district}_${d.state}`} className="bg-white p-2.5 sm:p-3 rounded-xl border border-amber-200/80 shadow-xs flex items-center justify-between gap-2 hover:border-amber-400 transition-all">
                    <div>
                      <div className="font-extrabold text-gray-900 text-xs flex items-center gap-1">
                        📍 {d.district} <span className="text-[9px] sm:text-[10px] text-gray-400 font-normal">({d.state})</span>
                      </div>
                      <div className="text-[10px] text-amber-800 font-bold mt-0.5">
                        {d.pref1Count} 1st Choice • {d.totalUniqueCandidates} Total
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuickCreateCenterForDistrict(d.district, d.state, d.pref1Count || d.homeCount)}
                      className="px-2.5 py-1 sm:py-1.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] hover:opacity-95 text-white rounded-lg text-[10px] font-extrabold shadow-xs shrink-0 flex items-center gap-1"
                      title={`Quick create center in ${d.district}`}
                    >
                      <FiPlus size={11} /> + Center
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Centers Filter & Search Bar */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 shadow-xs sm:shadow-sm flex flex-col md:flex-row gap-2.5 sm:gap-3 items-stretch md:items-center justify-between">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search center name, code, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                />
              </div>

              <select
                value={filterCenterState}
                onChange={(e) => {
                  setFilterCenterState(e.target.value)
                  setFilterCenterDistrict('all')
                }}
                className="w-full sm:w-auto px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 bg-white"
              >
                <option value="all">All States</option>
                {getIndianStates().map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {filterCenterState !== 'all' && (
                <select
                  value={filterCenterDistrict}
                  onChange={(e) => setFilterCenterDistrict(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 bg-white"
                >
                  <option value="all">All Districts in {filterCenterState}</option>
                  {getDistrictsForState(filterCenterState).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="text-xs text-gray-400 text-right md:text-left">
              Showing <strong className="text-gray-700">{filteredCenters.length}</strong> of {centers.length} Centers
            </div>
          </div>

          {/* EXAM CENTERS: MOBILE CARDS VIEW (md:hidden) */}
          <div className="block md:hidden space-y-3">
            {filteredCenters.map((c) => {
              const allocated = c.allocated_count || 0
              const maxCap = c.max_capacity || 100
              const percent = Math.min(100, Math.round((allocated / maxCap) * 100))
              const isFull = allocated >= maxCap

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs space-y-3"
                >
                  {/* Top Bar: Code, Name, Partner Badge, Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-black px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 text-xs">
                          {c.center_code}
                        </span>
                        {c.is_partner_school && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            Partner Campus
                          </span>
                        )}
                      </div>
                      <h4 className="font-black text-gray-900 text-sm leading-snug">{c.center_name}</h4>
                    </div>

                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                        c.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : c.status === 'full'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      ● {c.status}
                    </span>
                  </div>

                  {/* Location & Address */}
                  <div className="p-2.5 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1 text-xs">
                    <div className="font-bold text-gray-800 flex items-center gap-1">
                      <FiMapPin size={12} className="text-[#FF2D8D] shrink-0" />
                      <span>{c.district}, {c.state}</span>
                    </div>
                    <div className="text-gray-500 text-[11px] leading-relaxed">{c.address}</div>
                    {c.landmark && (
                      <div className="text-gray-400 text-[10px]">Landmark: {c.landmark}</div>
                    )}
                    {c.google_maps_url && (
                      <a
                        href={c.google_maps_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1 pt-0.5"
                      >
                        <FiNavigation size={11} /> Open Google Maps Directions
                      </a>
                    )}
                  </div>

                  {/* Capacity Bar & Exam Timings */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-600 font-semibold">Seat Utilization:</span>
                      <span className="font-bold text-gray-900">
                        {allocated} / {maxCap} Seats ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isFull ? 'bg-red-500' : percent > 75 ? 'bg-amber-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    {(c.reporting_time || c.exam_start_time) && (
                      <div className="flex items-center gap-1.5 text-[10px] text-purple-800 bg-purple-50/70 border border-purple-100 px-2.5 py-1 rounded-lg font-bold">
                        <FiClock size={11} className="text-purple-600 shrink-0" />
                        <span>
                          {c.exam_start_time || '10:00 AM'} - {c.exam_end_time || '12:00 PM'} (Reporting: {c.reporting_time || '09:00 AM'})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Superintendent & Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-gray-100 text-xs">
                    <div className="text-[11px]">
                      <div className="font-bold text-gray-800">{c.contact_person || 'Center Superintendent'}</div>
                      {c.contact_phone && (
                        <div className="text-gray-500 text-[10px] flex items-center gap-1">
                          <FiPhone size={10} /> {c.contact_phone}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 self-stretch sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setRosterSelectedCenterId(c.id)
                          setShowRosterModal(true)
                        }}
                        className="flex-1 sm:flex-initial px-3 py-1.5 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors flex items-center justify-center gap-1"
                      >
                        <FiFileText size={12} />
                        <span>Roster PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditCenter(c)}
                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                        title="Edit Center"
                      >
                        <FiEdit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCenter(c.id)}
                        className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                        title="Delete Center"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredCenters.length === 0 && (
              <div className="p-8 text-center text-gray-400 space-y-3 bg-white rounded-2xl border border-gray-100">
                <FiMapPin size={32} className="mx-auto text-gray-300" />
                <p className="text-xs">No exam centers match the selected filters.</p>
                <button
                  onClick={handleOpenAddCenter}
                  className="px-4 py-2 bg-[#9C27FF] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  + Add First Exam Center
                </button>
              </div>
            )}
          </div>

          {/* EXAM CENTERS: DESKTOP DATA TABLE (hidden md:block) */}
          <div className="hidden md:block bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs sm:shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600 min-w-[700px]">
                <thead className="bg-gray-50/80 text-[10px] sm:text-[11px] uppercase font-bold text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4">Center Code & Name</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4">Location & Address</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4">Seat Capacity & Allocation</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4">Superintendent / Contact</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4">Status</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredCenters.map((c) => {
                    const allocated = c.allocated_count || 0
                    const maxCap = c.max_capacity || 100
                    const percent = Math.min(100, Math.round((allocated / maxCap) * 100))
                    const isFull = allocated >= maxCap

                    return (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-3.5 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="font-mono font-black px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 text-xs">
                              {c.center_code}
                            </span>
                            {c.is_partner_school && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                Partner
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-gray-900 text-xs sm:text-sm mt-1">{c.center_name}</div>
                          {(c.reporting_time || c.exam_start_time) && (
                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-purple-700 bg-purple-50/70 border border-purple-100/80 px-2 py-0.5 rounded-md w-fit font-semibold">
                              <FiClock size={10} className="text-purple-600 shrink-0" />
                              <span>
                                {c.exam_start_time || '10:00 AM'} - {c.exam_end_time || '12:00 PM'}
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="px-3.5 sm:px-6 py-3 sm:py-4">
                          <div className="font-bold text-gray-800 flex items-center gap-1">
                            <FiMapPin size={11} className="text-[#FF2D8D]" />
                            {c.district}, {c.state}
                          </div>
                          <div className="text-gray-500 text-[11px] max-w-[200px] sm:max-w-[240px] truncate mt-0.5">
                            {c.address}
                          </div>
                          {c.landmark && (
                            <div className="text-gray-400 text-[10px]">Landmark: {c.landmark}</div>
                          )}
                          {c.google_maps_url && (
                            <a
                              href={c.google_maps_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <FiNavigation size={10} /> View Map
                            </a>
                          )}
                        </td>

                        <td className="px-3.5 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="text-gray-700 font-bold">{allocated} / {maxCap}</span>
                            <span className={`font-mono font-bold ${percent > 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {percent}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 h-1.5 sm:h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                isFull ? 'bg-red-500' : percent > 75 ? 'bg-amber-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </td>

                        <td className="px-3.5 sm:px-6 py-3 sm:py-4 text-xs">
                          <div className="font-bold text-gray-900">{c.contact_person || 'Coordinator'}</div>
                          {c.contact_phone && (
                            <div className="text-gray-500 text-[11px] flex items-center gap-1 mt-0.5">
                              <FiPhone size={10} className="text-gray-400" /> {c.contact_phone}
                            </div>
                          )}
                        </td>

                        <td className="px-3.5 sm:px-6 py-3 sm:py-4">
                          <span
                            className={`inline-block px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase ${
                              c.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : c.status === 'full'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            ● {c.status}
                          </span>
                        </td>

                        <td className="px-3.5 sm:px-6 py-3 sm:py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setRosterSelectedCenterId(c.id)
                                setShowRosterModal(true)
                              }}
                              className="px-2 sm:px-2.5 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg sm:rounded-xl border border-purple-200 transition-colors flex items-center gap-1 shrink-0"
                              title={`Download Candidate Verification Roster for ${c.center_name}`}
                            >
                              <FiFileText size={11} />
                              <span>Roster ({c.allocated_count || 0})</span>
                            </button>
                            <button
                              onClick={() => handleOpenEditCenter(c)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg sm:rounded-xl transition-colors"
                              title="Edit Center"
                            >
                              <FiEdit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteCenter(c.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors"
                              title="Delete Center"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {filteredCenters.length === 0 && (
                <div className="p-8 sm:p-12 text-center text-gray-400 space-y-3">
                  <FiMapPin size={32} className="mx-auto text-gray-300" />
                  <p className="text-xs sm:text-sm">No exam centers match the selected filters.</p>
                  <button
                    onClick={handleOpenAddCenter}
                    className="px-3.5 py-2 bg-[#9C27FF] text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    + Add First Exam Center
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ADMIT CARD DESK & SMART ALLOCATION ENGINE */}
      {tab === 'admit_cards' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Main Action Engine Banner */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-900 to-purple-900 text-white shadow-xl space-y-3.5 sm:space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 sm:gap-4 border-b border-purple-800/60 pb-3.5 sm:pb-4">
              <div className="space-y-1">
                <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase px-2.5 sm:px-3 py-0.5 sm:py-1 bg-white/20 rounded-full flex items-center gap-1.5 w-max">
                  <FiZap size={11} className="text-amber-400" /> Rule-Based Allocation Engine
                </span>
                <h2 className="text-lg sm:text-2xl font-black">District-Wise Center Allocation & Hall Ticket Publishing</h2>
                <p className="text-xs text-purple-200 max-w-2xl leading-relaxed">
                  Automatically match candidates to active exam centers in their <strong>1st & 2nd Preferred Districts</strong> according to venue capacity limits, or manually bulk-assign students to designated test centers.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-2 shrink-0">
                <button
                  onClick={handleRunAutoAllocation}
                  disabled={actionLoading || unallocatedCandidates === 0}
                  className={`w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-extrabold transition-all shadow-xl flex items-center justify-center gap-1.5 sm:gap-2 ${
                    unallocatedCandidates > 0
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-95 shadow-orange-500/30'
                      : 'bg-white/20 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <FiZap size={14} />
                  {actionLoading ? 'Allocating Centers...' : `⚡ Auto-Allocate (${unallocatedCandidates} Unallocated)`}
                </button>

                <button
                  onClick={handlePublishAdmitCards}
                  disabled={actionLoading || provisionalAdmitCards === 0}
                  className={`w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-extrabold transition-all shadow-xl flex items-center justify-center gap-1.5 sm:gap-2 ${
                    provisionalAdmitCards > 0
                      ? 'bg-gradient-to-r from-[#FF2D8D] to-[#FF5E62] text-white hover:opacity-95 shadow-pink-500/30 animate-pulse'
                      : 'bg-white/20 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <FiCheckSquare size={14} />
                  Publish Admit Cards ({provisionalAdmitCards})
                </button>
              </div>
            </div>

            {/* Demographic Heatmap & Applicant Density Breakdown */}
            <div className="space-y-2 pt-1">
              <div className="text-[10px] sm:text-xs font-bold text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
                <FiLayers size={12} className="text-pink-400" /> Geographic Density (Click any District to filter):
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-24 overflow-y-auto pr-1 sm:pr-2">
                {Object.entries(demographics).map(([st, data]) => (
                  <div key={st} className="flex flex-wrap items-center gap-1 sm:gap-1.5 bg-white/10 p-1.5 rounded-xl border border-white/15 text-[10px] sm:text-[11px]">
                    <span className="font-extrabold text-white pl-1">{st} ({data.total}):</span>
                    {Object.entries(data.districts).map(([dist, count]) => (
                      <button
                        key={dist}
                        onClick={() => {
                          setSearchQuery(dist)
                        }}
                        className="px-1.5 sm:px-2 py-0.5 rounded-lg bg-white/20 hover:bg-[#FF2D8D] text-white text-[9px] sm:text-[10px] font-bold transition-colors"
                        title={`Click to filter ${dist} applicants`}
                      >
                        📍 {dist} ({count})
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Allocation Action Toolbar & Filters */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 shadow-xs sm:shadow-sm space-y-3">
            {/* Status Filter Tabs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth -mx-1 px-1 sm:mx-0 sm:px-0 text-xs">
                <button
                  onClick={() => setAllocFilterTab('all')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl font-bold transition-all shrink-0 whitespace-nowrap text-[11px] sm:text-xs ${
                    allocFilterTab === 'all' ? 'bg-[#9C27FF] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All ({applicants.length})
                </button>
                <button
                  onClick={() => setAllocFilterTab('unallocated')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl font-bold transition-all shrink-0 whitespace-nowrap text-[11px] sm:text-xs ${
                    allocFilterTab === 'unallocated' ? 'bg-amber-500 text-white shadow-xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  ⚠️ Unallocated ({unallocatedCandidates})
                </button>
                <button
                  onClick={() => setAllocFilterTab('allocated')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl font-bold transition-all shrink-0 whitespace-nowrap text-[11px] sm:text-xs ${
                    allocFilterTab === 'allocated' ? 'bg-purple-600 text-white shadow-xs' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                  }`}
                >
                  ✓ Allocated ({allocatedCandidates})
                </button>
                <button
                  onClick={() => setAllocFilterTab('provisional')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl font-bold transition-all shrink-0 whitespace-nowrap text-[11px] sm:text-xs ${
                    allocFilterTab === 'provisional' ? 'bg-blue-600 text-white shadow-xs' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                  }`}
                >
                  ⏳ Provisional ({provisionalAdmitCards})
                </button>
                <button
                  onClick={() => setAllocFilterTab('released')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl font-bold transition-all shrink-0 whitespace-nowrap text-[11px] sm:text-xs ${
                    allocFilterTab === 'released' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  🎉 Released ({releasedAdmitCards})
                </button>
              </div>

              {/* Multi-Select Status Indicator */}
              {selectedAppIds.length > 0 && (
                <div className="text-[11px] sm:text-xs font-bold text-purple-700 bg-purple-50 px-2.5 sm:px-3 py-1 rounded-xl border border-purple-200 self-start sm:self-auto">
                  {selectedAppIds.length} selected
                </div>
              )}
            </div>

            {/* Bulk Manual Assignment Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 sm:gap-3 pt-1">
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
                <button
                  onClick={() => {
                    if (selectedAppIds.length === filteredApplicants.length) {
                      setSelectedAppIds([])
                    } else {
                      setSelectedAppIds(filteredApplicants.map((a) => a.id))
                    }
                  }}
                  className="px-3 py-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-colors text-center"
                >
                  {selectedAppIds.length === filteredApplicants.length && filteredApplicants.length > 0 ? 'Deselect All' : 'Select All Filtered'}
                </button>

                {/* Assign to Center Selector */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                  <select
                    value={manualTargetCenterId}
                    onChange={(e) => setManualTargetCenterId(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 rounded-xl border border-purple-200 text-xs font-bold text-purple-900 bg-purple-50/60 focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="">-- Choose Exam Center --</option>
                    {centers.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.center_code}] {c.center_name} ({c.district}) [{c.allocated_count || 0}/{c.max_capacity}]
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleManualBulkAssign}
                      disabled={actionLoading || selectedAppIds.length === 0 || !manualTargetCenterId}
                      className="flex-1 sm:flex-initial px-3.5 py-2 bg-[#9C27FF] hover:bg-[#8314e3] disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-xs transition-all whitespace-nowrap"
                    >
                      Assign ({selectedAppIds.length})
                    </button>

                    <button
                      onClick={() => {
                        setRosterSelectedCenterId('all')
                        setShowRosterModal(true)
                      }}
                      className="flex-1 sm:flex-initial px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold rounded-xl border border-indigo-200 shadow-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
                      title="Export and Print candidate nominal roll PDF categorized by center"
                    >
                      <FiPrinter size={13} />
                      <span>Rosters</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-400 text-right lg:text-left">
                Matching: <strong className="text-gray-800">{filteredApplicants.length}</strong>
              </div>
            </div>
          </div>

          {/* ALLOCATION & ADMIT CARDS: MOBILE CARDS VIEW (md:hidden) */}
          <div className="block md:hidden space-y-3">
            {filteredApplicants
              .filter((app) => {
                if (allocFilterTab === 'unallocated') return !app.assigned_center_id && !app.exam_center
                if (allocFilterTab === 'allocated') return !!app.assigned_center_id || !!app.exam_center
                if (allocFilterTab === 'provisional') return app.admit_card_status === 'provisional'
                if (allocFilterTab === 'released') return app.admit_card_status === 'released' || app.admit_card_status === 'approved'
                return true
              })
              .map((app) => {
                const isReleased = app.admit_card_status === 'released' || app.admit_card_status === 'approved'
                const isSelected = selectedAppIds.includes(app.id)
                const isAllocated = !!app.assigned_center_id || !!app.exam_center

                return (
                  <div
                    key={app.id}
                    className={`bg-white rounded-2xl border p-4 shadow-xs space-y-3 transition-colors ${
                      isSelected ? 'border-purple-300 ring-2 ring-purple-100 bg-purple-50/20' : 'border-gray-200/80'
                    }`}
                  >
                    {/* Header: Select Checkbox + Photo + Candidate Name + Status */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedAppIds([...selectedAppIds, app.id])
                            else setSelectedAppIds(selectedAppIds.filter((id) => id !== app.id))
                          }}
                          className="rounded text-[#FF2D8D] focus:ring-[#FF2D8D] w-4 h-4"
                        />
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 shadow-xs">
                          <img
                            src={app.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face'}
                            alt={app.applicant_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-gray-900 text-sm truncate">{app.applicant_name}</div>
                          <div className="font-mono text-gray-500 text-[10px]">{app.application_no}</div>
                          <div className="font-mono text-[#9C27FF] text-[9px] font-bold">{app.registration_code}</div>
                        </div>
                      </div>

                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                          isReleased
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                        }`}
                      >
                        ● {isReleased ? 'Live' : 'Provisional'}
                      </span>
                    </div>

                    {/* District Preferences */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-pink-50/60 p-2 rounded-xl border border-pink-100/80">
                        <span className="text-[10px] uppercase font-bold text-pink-700 block">1st Pref</span>
                        <span className="font-bold text-gray-900 text-xs truncate block mt-0.5">
                          📍 {app.preference_district_1 || app.city || 'Patna'}
                        </span>
                      </div>
                      <div className="bg-purple-50/60 p-2 rounded-xl border border-purple-100/80">
                        <span className="text-[10px] uppercase font-bold text-purple-700 block">2nd Pref</span>
                        <span className="font-bold text-gray-900 text-xs truncate block mt-0.5">
                          📍 {app.preference_district_2 || 'Gaya'}
                        </span>
                      </div>
                    </div>

                    {/* Allocated Center Card Box */}
                    <div className="p-2.5 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1 text-xs">
                      <span className="text-[10px] font-bold uppercase text-gray-500 block">Allocated Examination Venue</span>
                      {isAllocated ? (
                        <div className="space-y-0.5">
                          <div className="font-bold text-emerald-800 text-xs flex items-center gap-1">
                            <span className="font-mono px-1.5 py-0.5 bg-emerald-100 text-emerald-900 rounded text-[10px] shrink-0">
                              {app.assigned_center_code || 'HUB'}
                            </span>
                            <span className="truncate">{app.assigned_center_name || app.exam_center}</span>
                          </div>
                          <div className="text-gray-500 text-[11px] leading-relaxed">
                            {app.assigned_center_address || 'Designated Examination Campus'}
                          </div>
                        </div>
                      ) : (
                        <div className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          ⚠️ Center Allocation Pending
                        </div>
                      )}
                    </div>

                    {/* Roll Number, Slot & Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
                      <div>
                        {app.roll_number ? (
                          <span className="font-mono font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[11px] border border-emerald-100">
                            {app.roll_number}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic text-[10px]">Auto Roll on Release</span>
                        )}
                        <div className="text-gray-400 text-[9px] mt-0.5">
                          {app.exam_slot || '10:00 AM - 12:30 PM'}
                        </div>
                      </div>

                      <div>
                        {!isReleased ? (
                          <button
                            type="button"
                            onClick={() => handleSingleApproveAdmitCard(app.id)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1"
                          >
                            <FiCheckCircle size={12} /> Release
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPreviewAdmitCard(app)}
                            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#9C27FF] font-bold text-xs rounded-xl transition-all flex items-center gap-1 border border-purple-200"
                          >
                            <FiDownload size={12} /> Hall Ticket
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

            {filteredApplicants.length === 0 && (
              <div className="p-8 text-center text-gray-400 bg-white rounded-2xl border border-gray-100 text-xs">
                No candidates match the filter criteria.
              </div>
            )}
          </div>

          {/* ALLOCATION & ADMIT CARDS: DESKTOP DATA TABLE (hidden md:block) */}
          <div className="hidden md:block bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs sm:shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600 min-w-[700px]">
                <thead className="bg-gray-50/80 text-[10px] sm:text-[11px] uppercase font-bold text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 sm:py-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedAppIds.length > 0 && selectedAppIds.length === filteredApplicants.length}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedAppIds(filteredApplicants.map((a) => a.id))
                          else setSelectedAppIds([])
                        }}
                        className="rounded text-[#FF2D8D] focus:ring-[#FF2D8D]"
                      />
                    </th>
                    <th className="px-3 sm:px-4 py-3 sm:py-4">App No. & Candidate</th>
                    <th className="px-3 sm:px-4 py-3 sm:py-4">District Preferences</th>
                    <th className="px-3 sm:px-4 py-3 sm:py-4">Allocated Exam Center</th>
                    <th className="px-3 sm:px-4 py-3 sm:py-4">Roll Number & Slot</th>
                    <th className="px-3 sm:px-4 py-3 sm:py-4">Admit Card Status</th>
                    <th className="px-3 sm:px-4 py-3 sm:py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredApplicants
                    .filter((app) => {
                      if (allocFilterTab === 'unallocated') return !app.assigned_center_id && !app.exam_center
                      if (allocFilterTab === 'allocated') return !!app.assigned_center_id || !!app.exam_center
                      if (allocFilterTab === 'provisional') return app.admit_card_status === 'provisional'
                      if (allocFilterTab === 'released') return app.admit_card_status === 'released' || app.admit_card_status === 'approved'
                      return true
                    })
                    .map((app) => {
                      const isReleased = app.admit_card_status === 'released' || app.admit_card_status === 'approved'
                      const isSelected = selectedAppIds.includes(app.id)
                      const isAllocated = !!app.assigned_center_id || !!app.exam_center

                      return (
                        <tr key={app.id} className={`hover:bg-gray-50/50 transition-colors ${isSelected ? 'bg-purple-50/40' : ''}`}>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedAppIds([...selectedAppIds, app.id])
                                else setSelectedAppIds(selectedAppIds.filter((id) => id !== app.id))
                              }}
                              className="rounded text-[#FF2D8D] focus:ring-[#FF2D8D]"
                            />
                          </td>

                          <td className="px-3 sm:px-4 py-3 sm:py-4">
                            <div className="flex items-center gap-2.5 sm:gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 shadow-xs">
                                <img
                                  src={app.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face'}
                                  alt={app.applicant_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 text-xs sm:text-sm">{app.applicant_name}</div>
                                <div className="font-mono text-gray-600 text-[10px] sm:text-[11px]">{app.application_no}</div>
                                <div className="font-mono text-[#9C27FF] text-[9px] sm:text-[10px] font-bold">{app.registration_code}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 sm:px-4 py-3 sm:py-4">
                            <div className="space-y-1">
                              <div className="text-gray-800 font-bold flex items-center gap-1">
                                <span className="text-purple-700">1st:</span> 📍 {app.preference_district_1 || app.city || 'Patna'}
                              </div>
                              <div className="text-gray-600 text-[11px] flex items-center gap-1">
                                <span className="text-gray-400">2nd:</span> 📍 {app.preference_district_2 || 'Gaya'}
                              </div>
                              <div className="text-gray-400 text-[10px]">
                                Residence: {app.district || app.city || 'District'}, {app.state || 'State'}
                              </div>
                            </div>
                          </td>

                          <td className="px-3 sm:px-4 py-3 sm:py-4">
                            {isAllocated ? (
                              <div className="space-y-0.5">
                                <div className="font-bold text-emerald-800 text-xs flex items-center gap-1">
                                  <span className="font-mono px-1.5 py-0.5 bg-emerald-100 text-emerald-900 rounded text-[10px]">
                                    {app.assigned_center_code || 'HUB'}
                                  </span>
                                  <span className="truncate max-w-[160px] sm:max-w-[200px]">{app.assigned_center_name || app.exam_center}</span>
                                </div>
                                <div className="text-gray-500 text-[10px] max-w-[180px] sm:max-w-[220px] truncate">
                                  {app.assigned_center_address || 'Designated Assessment Campus'}
                                </div>
                              </div>
                            ) : (
                              <span className="inline-block px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                ⚠️ Allocation Pending
                              </span>
                            )}
                          </td>

                          <td className="px-3 sm:px-4 py-3 sm:py-4">
                            {app.roll_number ? (
                              <span className="font-mono font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs">
                                {app.roll_number}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic text-[10px] sm:text-[11px]">Auto on Release</span>
                            )}
                            <div className="text-gray-400 text-[10px] mt-0.5">Slot: {app.exam_slot || '10:00 AM - 12:30 PM'}</div>
                          </td>

                          <td className="px-3 sm:px-4 py-3 sm:py-4">
                            <span
                              className={`inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase ${
                                isReleased
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                              }`}
                            >
                              ● {isReleased ? 'Official Released' : 'Provisional'}
                            </span>
                          </td>

                          <td className="px-3 sm:px-4 py-3 sm:py-4 text-right">
                            <div className="flex items-center justify-end gap-1 sm:gap-1.5">
                              {!isReleased ? (
                                <button
                                  onClick={() => handleSingleApproveAdmitCard(app.id)}
                                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] sm:text-xs rounded-lg sm:rounded-xl shadow-xs transition-all flex items-center gap-1"
                                >
                                  <FiCheckCircle size={12} /> Release
                                </button>
                              ) : (
                                <button
                                  onClick={() => setPreviewAdmitCard(app)}
                                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-purple-50 hover:bg-purple-100 text-[#9C27FF] font-bold text-[11px] sm:text-xs rounded-lg sm:rounded-xl transition-all flex items-center gap-1 border border-purple-200"
                                >
                                  <FiDownload size={12} /> Hall Ticket
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
          </div>
        </div>
      )}

      {/* TAB 5: EXAM EVALUATION & MERIT LIST */}
      {tab === 'evaluation' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs sm:shadow-sm space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div>
                <span className="text-[9px] sm:text-[10px] font-bold text-[#FF2D8D] uppercase tracking-widest px-2.5 sm:px-3 py-0.5 sm:py-1 bg-pink-50 rounded-full border border-pink-100">
                  Categorized Examination Evaluation Desk
                </span>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-1">Scholarship Examination Scoring & Merit Builder</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select a scholarship exam scheme to evaluate candidates, enter scores, and generate automated scheme ranks.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-emerald-100">
                  Cutoff: ≥ 50 Marks
                </span>
              </div>
            </div>

            {/* CATEGORY & SCHEME SELECTOR TABS */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth -mx-1 px-1 sm:mx-0 sm:px-0 pt-2 border-t border-gray-100">
              <button
                onClick={() => setFilterScheme('all')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  filterScheme === 'all'
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>🏆 All Schemes ({applicants.length})</span>
              </button>

              {scholarships.map((s) => {
                const count = applicants.filter((a) => a.scholarship_id === s.id).length
                const evaluated = applicants.filter((a) => a.scholarship_id === s.id && a.exam_marks != null).length
                return (
                  <button
                    key={s.id}
                    onClick={() => setFilterScheme(s.id)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap ${
                      filterScheme === s.id
                        ? 'bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white shadow-md shadow-pink-500/20'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-white/20 uppercase font-semibold">
                      {s.category}
                    </span>
                    <span>{s.title}</span>
                    <span className="text-[9px] sm:text-[10px] opacity-80 font-mono">({evaluated}/{count})</span>
                  </button>
                )
              })}
            </div>

            {/* Scheme Evaluation KPI Card & Bulk Release Controls */}
            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 border border-purple-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5 sm:gap-4">
              {(() => {
                const active = filterScheme !== 'all' ? scholarships.find((s) => s.id === filterScheme) : null
                const schemeApps = filterScheme !== 'all' ? applicants.filter((a) => a.scholarship_id === filterScheme) : applicants
                const evaluatedCount = schemeApps.filter((a) => a.exam_marks != null).length
                const releasedCount = schemeApps.filter((a) => a.result_status === 'released').length
                const qualifiedCount = schemeApps.filter((a) => a.merit_status === 'qualified').length
                const notQualifiedCount = schemeApps.filter((a) => a.merit_status === 'not_qualified').length
                const isAllReleased = evaluatedCount > 0 && evaluatedCount === releasedCount

                return (
                  <>
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase px-2 sm:px-2.5 py-0.5 rounded-full bg-[#FF2D8D] text-white">
                          {active ? active.category : 'All Programs'}
                        </span>
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm">{active ? active.title : 'All Scholarship Programs'}</h4>
                        <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isAllReleased ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isAllReleased ? '● Released' : '● Draft'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-gray-600">
                        <span>Total: <strong className="text-gray-900">{schemeApps.length}</strong></span>
                        <span>Scored: <strong className="text-purple-700">{evaluatedCount}</strong></span>
                        <span>🟢 Qual: <strong className="text-emerald-700">{qualifiedCount}</strong></span>
                        <span>🔴 Not Qual: <strong className="text-rose-700">{notQualifiedCount}</strong></span>
                        <span>Live: <strong className="text-blue-700">{releasedCount}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0 flex-wrap w-full md:w-auto">
                      <button
                        onClick={() => handleBulkReleaseResults(filterScheme)}
                        disabled={actionLoading || evaluatedCount === 0}
                        className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
                      >
                        <FiSend size={13} />
                        Release & Publish ({evaluatedCount})
                      </button>

                      {releasedCount > 0 && (
                        <button
                          onClick={() => handleRevertResultsToDraft(filterScheme)}
                          disabled={actionLoading}
                          className="px-3 py-2 sm:py-2.5 bg-white text-gray-700 border border-gray-200 font-bold text-xs rounded-xl hover:bg-gray-50 transition-all whitespace-nowrap"
                        >
                          Revert Draft
                        </button>
                      )}
                    </div>
                  </>
                )
              })()}
            </div>

            {/* 🎯 SUPERADMIN MERIT CUT-OFF & QUALIFICATION RULE ENGINE */}
            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white shadow-xl border border-indigo-500/30 space-y-3 sm:space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 sm:gap-3 pb-2.5 sm:pb-3 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 sm:p-1.5 rounded-lg bg-pink-500/20 text-[#FF2D8D] border border-pink-500/30">
                      <FiTarget size={15} />
                    </span>
                    <h4 className="font-extrabold text-xs sm:text-base text-white flex items-center gap-1.5 sm:gap-2">
                      Merit Cut-off Policy Controller
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-[#FF2D8D] text-white">
                        Superadmin
                      </span>
                    </h4>
                  </div>
                  <p className="text-[11px] sm:text-xs text-indigo-200">
                    Define dynamic score cut-offs or quotas to determine qualification.
                  </p>
                </div>

                {/* Mode Switcher */}
                <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/15 text-xs font-bold w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setCutoffMode('marks_range')}
                    className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs ${
                      cutoffMode === 'marks_range'
                        ? 'bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white shadow-md'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <FiSliders size={12} />
                    <span>Scores Range</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCutoffMode('top_ranks')}
                    className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs ${
                      cutoffMode === 'top_ranks'
                        ? 'bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white shadow-md'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <FiUsers size={12} />
                    <span>Top Ranks</span>
                  </button>
                </div>
              </div>

              {/* CONTROLS & BRACKETS */}
              {cutoffMode === 'marks_range' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    {/* Bracket 1: Qualified */}
                    <div className="p-3 sm:p-3.5 bg-emerald-950/60 rounded-xl border border-emerald-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] sm:text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          1. Qualified Bracket
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {cutoffQualifiedMin} – 100 Marks
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-gray-300 font-semibold shrink-0">Min Marks (≥):</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={cutoffQualifiedMin}
                          onChange={(e) => setCutoffQualifiedMin(Number(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-emerald-500/50 font-black text-emerald-300 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                        />
                      </div>
                      <p className="text-[10px] text-emerald-200/70">
                        Scores from <strong>{cutoffQualifiedMin} to 100</strong> receive <strong>QUALIFIED</strong> status.
                      </p>
                    </div>

                    {/* Bracket 2: Not Qualified */}
                    <div className="p-3 sm:p-3.5 bg-rose-950/60 rounded-xl border border-rose-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] sm:text-xs font-black uppercase text-rose-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-400" />
                          2. Not Qualified Bracket
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          0 – {Math.max(0, cutoffQualifiedMin - 1)} Marks
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-black/30 border border-rose-500/30 text-[11px] text-rose-300 font-semibold">
                        Scores below {cutoffQualifiedMin} Marks (Auto-evaluated)
                      </div>
                      <p className="text-[10px] text-rose-200/70">
                        Scores below <strong>{cutoffQualifiedMin}</strong> will be marked <strong>NOT QUALIFIED</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                    <span className="text-gray-400 text-[10px] sm:text-[11px] font-bold">Presets:</span>
                    {[
                      { label: '🎯 60+', q: 60 },
                      { label: '🎓 50%', q: 50 },
                      { label: '⚡ 70+', q: 70 },
                      { label: '🏆 80+', q: 80 },
                      { label: '🌟 90+', q: 90 },
                    ].map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => setCutoffQualifiedMin(preset.q)}
                        className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-[10px] sm:text-[11px] font-medium text-gray-200 transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div className="p-3 sm:p-3.5 bg-emerald-950/60 rounded-xl border border-emerald-500/40 space-y-2">
                    <span className="text-xs font-black uppercase text-emerald-400 block">
                      1. Top N Candidates to Qualify
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-gray-300 font-semibold shrink-0">Quota:</label>
                      <input
                        type="number"
                        min={1}
                        value={cutoffTopQualified}
                        onChange={(e) => setCutoffTopQualified(Number(e.target.value) || 1)}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-emerald-500/50 font-black text-emerald-300 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-emerald-200/70">
                      Ranks <strong>#1 to #{cutoffTopQualified}</strong> marked <strong>QUALIFIED</strong>.
                    </p>
                  </div>

                  <div className="p-3 sm:p-3.5 bg-rose-950/60 rounded-xl border border-rose-500/40 space-y-2">
                    <span className="text-xs font-black uppercase text-rose-400 block">
                      2. Remaining Candidates
                    </span>
                    <div className="p-2 rounded-lg bg-black/30 border border-rose-500/30 text-[11px] text-rose-300 font-semibold">
                      Rank #{cutoffTopQualified + 1} and beyond
                    </div>
                    <p className="text-[10px] text-rose-200/70">
                      Remaining will be assigned <strong>NOT QUALIFIED</strong> status.
                    </p>
                  </div>
                </div>
              )}

              {/* LIVE IMPACT PREVIEW COUNTER & APPLY BUTTON */}
              {(() => {
                const targetSchemeApps = filterScheme === 'all'
                  ? applicants.filter((a) => a.exam_marks != null)
                  : applicants.filter((a) => a.scholarship_id === filterScheme && a.exam_marks != null)

                let simQual = 0
                let simNotQual = 0
                let simAbsent = 0

                if (cutoffMode === 'top_ranks') {
                  const present = targetSchemeApps.filter((a) => a.documents?.attendance !== 'ABSENT')
                  simAbsent = targetSchemeApps.length - present.length
                  simQual = Math.min(present.length, Number(cutoffTopQualified))
                  simNotQual = Math.max(0, present.length - simQual)
                } else {
                  const qMin = Number(cutoffQualifiedMin)

                  targetSchemeApps.forEach((a) => {
                    if (a.documents?.attendance === 'ABSENT') {
                      simAbsent++
                    } else {
                      const m = Number(a.exam_marks || 0)
                      if (m >= qMin) simQual++
                      else simNotQual++
                    }
                  })
                }

                return (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pt-2.5 sm:pt-3 border-t border-white/10">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                      <span className="font-bold text-gray-300">Simulation:</span>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/40">
                        🟢 Qual: {simQual}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 font-extrabold border border-rose-500/40">
                        🔴 Fail: {simNotQual}
                      </span>
                      {simAbsent > 0 && (
                        <span className="px-2 py-0.5 rounded-lg bg-gray-500/20 text-gray-300 font-bold border border-gray-500/30">
                          ⚪ Absent: {simAbsent}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyCutoffRules}
                      disabled={cutoffApplying || targetSchemeApps.length === 0}
                      className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:opacity-95 text-white font-black text-xs rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
                    >
                      <FiZap size={14} />
                      <span>{cutoffApplying ? 'Applying...' : `Apply Rules (${targetSchemeApps.length})`}</span>
                    </button>
                  </div>
                )
              })()}
            </div>

            {/* PRODUCTION BULK MARKS TOOLBAR */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2.5 sm:gap-3 pt-3 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadEvaluationSheet(filterScheme)}
                  className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs rounded-xl border border-gray-200 shadow-xs hover:border-gray-300 transition-all flex items-center justify-center gap-1.5"
                >
                  <FiDownload className="text-emerald-600" size={14} />
                  <span>Download Sheet (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopySpreadsheetData(filterScheme)}
                  className={`px-3.5 py-2 font-bold text-xs rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                    copiedExcelData
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200 shadow-xs'
                  }`}
                >
                  {copiedExcelData ? <FiCheck className="text-white" size={14} /> : <FiCopy className="text-purple-600" size={14} />}
                  <span>{copiedExcelData ? 'Copied Data!' : 'Copy for Sheets'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBulkUploadSchemeId(filterScheme !== 'all' ? filterScheme : (scholarships[0]?.id || 'all'))
                    const currentScheme = scholarships.find((s) => s.id === filterScheme)
                    setBulkMaxMarks(currentScheme?.total_questions || 100)
                    setBulkParsedRows([])
                    setBulkPastedText('')
                    setShowBulkMarksModal(true)
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <FiUploadCloud size={15} />
                  <span>Bulk Upload Marks</span>
                  <span className="px-1.5 py-0.2 rounded bg-white/20 text-[9px] uppercase font-mono">Fast</span>
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search evaluated candidate..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>
            </div>
          </div>

          {/* CANDIDATES EVALUATION TABLE WITH STATUS FILTER TABS */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs sm:shadow-sm overflow-hidden space-y-3 p-3.5 sm:p-6">
            {/* Status Filter Tabs Bar */}
            {(() => {
              const currentSchemeApps = filterScheme === 'all'
                ? filteredApplicants
                : filteredApplicants.filter((a) => a.scholarship_id === filterScheme)

              const countAll = currentSchemeApps.length
              const countQual = currentSchemeApps.filter((a) => a.merit_status === 'qualified').length
              const countNotQual = currentSchemeApps.filter((a) => a.merit_status === 'not_qualified' && a.documents?.attendance !== 'ABSENT').length
              const countAbsent = currentSchemeApps.filter((a) => a.documents?.attendance === 'ABSENT').length

              return (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth -mx-1 px-1 sm:mx-0 sm:px-0 text-xs">
                    <span className="text-gray-500 font-bold mr-1 flex items-center gap-1 shrink-0">
                      <FiFilter size={12} /> Filter:
                    </span>
                    {[
                      { id: 'all', label: `All (${countAll})`, activeCls: 'bg-gray-900 text-white' },
                      { id: 'qualified', label: `🟢 Qualified (${countQual})`, activeCls: 'bg-emerald-600 text-white shadow-sm' },
                      { id: 'not_qualified', label: `🔴 Not Qualified (${countNotQual})`, activeCls: 'bg-rose-600 text-white shadow-sm' },
                      { id: 'absent', label: `⚪ Absent (${countAbsent})`, activeCls: 'bg-slate-700 text-white' },
                    ].map((tabBtn) => (
                      <button
                        key={tabBtn.id}
                        type="button"
                        onClick={() => setEvalTableStatusFilter(tabBtn.id as any)}
                        className={`px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl font-bold transition-all text-[11px] sm:text-xs shrink-0 whitespace-nowrap ${
                          evalTableStatusFilter === tabBtn.id
                            ? tabBtn.activeCls
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {tabBtn.label}
                      </button>
                    ))}
                  </div>

                  <div className="text-xs text-gray-400 font-medium text-right sm:text-left">
                    Showing <strong>{
                      currentSchemeApps.filter((app) => {
                        if (evalTableStatusFilter === 'qualified') return app.merit_status === 'qualified'
                        if (evalTableStatusFilter === 'not_qualified') return app.merit_status === 'not_qualified' && app.documents?.attendance !== 'ABSENT'
                        if (evalTableStatusFilter === 'absent') return app.documents?.attendance === 'ABSENT'
                        return true
                      }).length
                    }</strong> of {countAll}
                  </div>
                </div>
              )
            })()}

            {/* EVALUATION: MOBILE CARDS VIEW (md:hidden) */}
            <div className="block md:hidden space-y-3">
              {(() => {
                const displayCandidates = filteredApplicants.filter((app) => {
                  if (evalTableStatusFilter === 'qualified') return app.merit_status === 'qualified'
                  if (evalTableStatusFilter === 'not_qualified') return app.merit_status === 'not_qualified' && app.documents?.attendance !== 'ABSENT'
                  if (evalTableStatusFilter === 'absent') return app.documents?.attendance === 'ABSENT'
                  return true
                })

                if (displayCandidates.length === 0) {
                  return (
                    <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
                      No candidates match the selected filter criteria.
                    </div>
                  )
                }

                return displayCandidates.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs space-y-3"
                  >
                    {/* Header: Rank + Avatar + Name + Roll */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {app.documents?.attendance === 'ABSENT' ? (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500 shrink-0">
                            ABSENT
                          </span>
                        ) : app.rank ? (
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-xs shrink-0 ${
                              app.rank === 1
                                ? 'bg-amber-500 text-white shadow-amber-500/30 ring-2 ring-amber-400/50'
                                : app.rank === 2
                                ? 'bg-slate-400 text-white ring-2 ring-slate-300/50'
                                : app.rank === 3
                                ? 'bg-amber-700 text-white ring-2 ring-amber-600/50'
                                : 'bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white'
                            }`}
                          >
                            #{app.rank}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-[11px] shrink-0">Unranked</span>
                        )}

                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 shadow-xs">
                          <img
                            src={app.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face'}
                            alt={app.applicant_name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="font-extrabold text-gray-900 text-sm truncate">{app.applicant_name}</div>
                          <div className="font-mono text-gray-600 text-[10px] font-bold">Roll: {app.roll_number || 'GRAVITY-26-XXXX'}</div>
                        </div>
                      </div>

                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                          app.result_status === 'released'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {app.result_status === 'released' ? '🚀 Live' : '📝 Draft'}
                      </span>
                    </div>

                    {/* Scheme & Score Box */}
                    <div className="p-2.5 rounded-xl bg-gray-50/80 border border-gray-100 flex items-center justify-between text-xs">
                      <div className="truncate max-w-[170px]">
                        <span className="font-bold text-[#FF2D8D] text-xs truncate block">{app.scholarship_title}</span>
                        <span className="text-gray-400 text-[10px]">Max: {app.total_marks || 100} Marks</span>
                      </div>

                      <div className="text-right">
                        {app.documents?.attendance === 'ABSENT' ? (
                          <span className="font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-xs">
                            ABSENT
                          </span>
                        ) : app.exam_marks != null ? (
                          <div className="font-black text-emerald-600 text-base">
                            {app.exam_marks} <span className="text-xs text-gray-400 font-normal">/ {app.total_marks || 100}</span>
                          </div>
                        ) : (
                          <span className="text-amber-600 font-bold text-xs">Pending Score</span>
                        )}
                      </div>
                    </div>

                    {/* Merit Status & Quick Score Button */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          app.merit_status === 'qualified'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          app.merit_status === 'qualified' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`} />
                        {app.merit_status === 'qualified' ? 'QUALIFIED' : 'NOT QUALIFIED'}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setEvaluatingApplicant(app)
                          setEnteredMarks(app.exam_marks != null ? String(app.exam_marks) : '80')
                          setEnteredTotalMarks(app.total_marks || 100)
                          setEnteredMeritStatus((app.merit_status as any) || 'qualified')
                          setEnteredRemarks((app.documents?.examiner_remarks as string) || (app.document_remarks as string) || '')
                          setEnteredIsAbsent(app.documents?.attendance === 'ABSENT')
                          setShowMarksModal(true)
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1"
                      >
                        <FiEdit2 size={11} />
                        <span>{app.exam_marks != null ? 'Edit Score' : 'Enter Score'}</span>
                      </button>
                    </div>
                  </div>
                ))
              })()}
            </div>

            {/* EVALUATION: DESKTOP DATA TABLE (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto rounded-xl sm:rounded-2xl border border-gray-100">
              <table className="w-full text-left text-xs text-gray-600 min-w-[700px]">
                <thead className="bg-gray-50/80 text-[10px] sm:text-[11px] uppercase font-bold text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4">Merit Rank</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4">Roll Number</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4">Candidate Name</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4">Scholarship Scheme</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4">Score (/100)</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4">Merit Status</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4">Release Status</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {(() => {
                    const displayCandidates = filteredApplicants.filter((app) => {
                      if (evalTableStatusFilter === 'qualified') return app.merit_status === 'qualified'
                      if (evalTableStatusFilter === 'not_qualified') return app.merit_status === 'not_qualified' && app.documents?.attendance !== 'ABSENT'
                      if (evalTableStatusFilter === 'absent') return app.documents?.attendance === 'ABSENT'
                      return true
                    })

                    if (displayCandidates.length === 0) {
                      return (
                        <tr>
                          <td colSpan={8} className="px-6 py-8 sm:py-12 text-center text-gray-400">
                            No candidates match the selected filter criteria.
                          </td>
                        </tr>
                      )
                    }

                    return displayCandidates.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-3.5 sm:px-6 py-3 sm:py-4">
                          {app.documents?.attendance === 'ABSENT' ? (
                            <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                              ABSENT
                            </span>
                          ) : app.rank ? (
                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs shadow-sm ${
                              app.rank === 1
                                ? 'bg-amber-500 text-white shadow-amber-500/30 ring-2 ring-amber-400/50'
                                : app.rank === 2
                                ? 'bg-slate-400 text-white ring-2 ring-slate-300/50'
                                : app.rank === 3
                                ? 'bg-amber-700 text-white ring-2 ring-amber-600/50'
                                : 'bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white'
                            }`}>
                              #{app.rank}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Unranked</span>
                          )}
                        </td>
                        <td className="px-3.5 sm:px-6 py-3 sm:py-4 font-mono font-bold text-gray-800">
                          {app.roll_number || 'GRAVITY-26-XXXX'}
                        </td>
                        <td className="px-3.5 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                              <img
                                src={app.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face'}
                                alt={app.applicant_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-xs sm:text-sm">{app.applicant_name}</div>
                              <div className="text-gray-400 text-[10px] truncate max-w-[120px] sm:max-w-none">{app.applicant_email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3.5 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-[#FF2D8D]">{app.scholarship_title}</td>
                        <td className="px-3.5 sm:px-6 py-3 sm:py-4">
                          {app.documents?.attendance === 'ABSENT' ? (
                            <span className="font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-xs">
                              ABSENT
                            </span>
                          ) : app.exam_marks != null ? (
                            <div className="font-black text-emerald-600 text-sm sm:text-base">{app.exam_marks} / {app.total_marks || 100}</div>
                          ) : (
                            <span className="text-amber-600 font-semibold text-[11px]">Pending</span>
                          )}
                        </td>
                        <td className="px-3.5 sm:px-6 py-3 sm:py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase border ${
                              app.merit_status === 'qualified'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              app.merit_status === 'qualified'
                                ? 'bg-emerald-500'
                                : 'bg-rose-500'
                            }`} />
                            {app.merit_status === 'qualified'
                              ? 'QUALIFIED'
                              : 'NOT QUALIFIED'}
                          </span>
                        </td>
                        <td className="px-3.5 sm:px-6 py-3 sm:py-4">
                          <span
                            className={`inline-block px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase ${
                              app.result_status === 'released'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {app.result_status === 'released' ? '🚀 Released' : '📝 Draft'}
                          </span>
                        </td>
                        <td className="px-3.5 sm:px-6 py-3 sm:py-4 text-right">
                          <button
                            onClick={() => {
                              setEvaluatingApplicant(app)
                              setEnteredMarks(app.exam_marks != null ? String(app.exam_marks) : '80')
                              setEnteredTotalMarks(app.total_marks || 100)
                              setEnteredMeritStatus((app.merit_status as any) || 'qualified')
                              setEnteredRemarks((app.documents?.examiner_remarks as string) || (app.document_remarks as string) || '')
                              setEnteredIsAbsent(app.documents?.attendance === 'ABSENT')
                              setShowMarksModal(true)
                            }}
                            className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] hover:opacity-90 text-white text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1 ml-auto whitespace-nowrap"
                          >
                            <FiEdit2 size={11} />
                            <span>{app.exam_marks != null ? 'Edit' : 'Score'}</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DOCUMENT VERIFICATION & SCHOLARSHIP AWARDS */}
      {tab === 'awards' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-1.5 sm:space-y-2">
              <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase px-2.5 sm:px-3 py-0.5 sm:py-1 bg-white/20 rounded-full">
                Grants & Disbursement Engine
              </span>
              <h2 className="text-lg sm:text-2xl font-extrabold">Document Verification & Scholarship Grant Allocation</h2>
              <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
                Verify original academic dossiers and disburse scholarship benefits: Choose between direct <strong>LMS Tuition Fee Waiver Enrollment</strong> or <strong>Cash Prize / Living Grant Payout</strong>.
              </p>
            </div>
          </div>

          {/* Scheme Selector Tabs for Awards */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth -mx-1 px-1 sm:mx-0 sm:px-0">
            <button
              onClick={() => setFilterScheme('all')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                filterScheme === 'all'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <span>🏆 All Schemes</span>
            </button>

            {scholarships.map((s) => {
              const count = applicants.filter((a) => a.scholarship_id === s.id).length
              const awarded = applicants.filter((a) => a.scholarship_id === s.id && a.award_status === 'awarded').length
              return (
                <button
                  key={s.id}
                  onClick={() => setFilterScheme(s.id)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap ${
                    filterScheme === s.id
                      ? 'bg-emerald-700 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-white/20 uppercase font-semibold">
                    {s.category}
                  </span>
                  <span>{s.title}</span>
                  <span className="text-[9px] sm:text-[10px] opacity-80 font-mono">({awarded}/{count})</span>
                </button>
              )
            })}
          </div>

          {/* VERIFICATION & AWARDS: MOBILE CARDS VIEW (md:hidden) */}
          <div className="block md:hidden space-y-3">
            {filteredApplicants.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs space-y-3"
              >
                {/* Header: Rank + Avatar + Name + App No */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {app.rank && (
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white shadow-xs shrink-0 ${
                          app.rank === 1
                            ? 'bg-amber-500 ring-2 ring-amber-400/50'
                            : app.rank === 2
                            ? 'bg-gray-400'
                            : app.rank === 3
                            ? 'bg-amber-700'
                            : 'bg-[#FF2D8D]'
                        }`}
                      >
                        #{app.rank}
                      </span>
                    )}

                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 shadow-xs">
                      <img
                        src={app.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face'}
                        alt={app.applicant_name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="font-extrabold text-gray-900 text-sm truncate">{app.applicant_name}</div>
                      <div className="font-mono text-gray-500 text-[10px]">App: {app.application_no}</div>
                    </div>
                  </div>

                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                      app.award_status === 'awarded'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    ● {app.award_status === 'awarded' ? 'Awarded' : 'Pending'}
                  </span>
                </div>

                {/* Scheme & Score Box */}
                <div className="p-2.5 rounded-xl bg-gray-50/80 border border-gray-100 flex items-center justify-between text-xs">
                  <div className="truncate max-w-[180px]">
                    <span className="font-bold text-[#FF2D8D] text-xs truncate block">{app.scholarship_title}</span>
                    <span className="text-gray-400 text-[10px]">Class: {app.qualification}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 block">Exam Score</span>
                    <span className="font-black text-emerald-600 text-sm">
                      {app.exam_marks != null ? `${app.exam_marks}/100` : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Verification Status & Dossier Trigger */}
                <div className="flex items-center justify-between gap-2 p-2.5 bg-purple-50/50 rounded-xl border border-purple-100/70 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Dossier Status</span>
                    <span
                      className={`inline-flex items-center gap-1 font-bold text-[11px] uppercase ${
                        app.document_status === 'verified'
                          ? 'text-emerald-700'
                          : app.document_status === 'action_needed'
                          ? 'text-amber-700'
                          : app.document_status === 'rejected'
                          ? 'text-red-700'
                          : 'text-gray-600'
                      }`}
                    >
                      ● {app.document_status === 'verified' ? 'Verified' : app.document_status === 'action_needed' ? 'Re-upload' : app.document_status === 'rejected' ? 'Rejected' : 'Pending'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenDossier(app)}
                    className="px-3 py-1.5 bg-white hover:bg-purple-100 text-[#9C27FF] text-xs font-bold rounded-xl border border-purple-200 transition-all flex items-center gap-1 shadow-xs"
                  >
                    <FiEye size={12} />
                    <span>Inspect Dossier</span>
                  </button>
                </div>

                {/* Award Details (if awarded) */}
                {app.award_status === 'awarded' && (
                  <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1 text-xs">
                    <div className="font-bold text-gray-900 text-xs">{app.award_amount}</div>
                    {app.award_voucher_code && (
                      <div className="font-mono text-[10px] font-bold text-purple-700 bg-white px-2 py-0.5 rounded-md inline-block border border-purple-200">
                        🎟️ {app.award_voucher_code}
                      </div>
                    )}
                    {app.award_disbursement_ref && (
                      <div className="font-mono text-[10px] text-gray-400">Ref: {app.award_disbursement_ref}</div>
                    )}
                  </div>
                )}

                {/* Disbursement Action Button */}
                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleOpenAwardModal(app)}
                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <FiAward size={13} />
                    <span>{app.award_status === 'awarded' ? 'Manage Benefits' : 'Disburse Grant'}</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredApplicants.length === 0 && (
              <div className="p-8 text-center text-gray-400 bg-white rounded-2xl border border-gray-100 text-xs">
                No candidate records match the selected filter.
              </div>
            )}
          </div>

          {/* VERIFICATION & AWARDS: DESKTOP DATA TABLE (hidden md:block) */}
          <div className="hidden md:block bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs sm:shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600 min-w-[700px]">
                <thead className="bg-gray-50/80 text-[10px] sm:text-[11px] uppercase font-bold text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4">Rank & Student</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4">Scheme & Score</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4">Document Verification</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4">Award Status</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4">Award Voucher & Bank Grant</th>
                    <th className="px-3.5 sm:px-6 py-3 sm:py-4 text-right">Disbursement Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredApplicants.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4">
                        <div className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                          {app.rank && (
                            <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center font-black text-[10px] sm:text-[11px] text-white shadow-xs shrink-0 ${
                              app.rank === 1 ? 'bg-amber-500' : app.rank === 2 ? 'bg-gray-400' : app.rank === 3 ? 'bg-amber-700' : 'bg-[#FF2D8D]'
                            }`}>
                              #{app.rank}
                            </span>
                          )}
                          <span className="truncate">{app.applicant_name}</span>
                        </div>
                        <div className="text-gray-400 text-[11px] truncate max-w-[130px] sm:max-w-none">{app.applicant_email}</div>
                        <div className="font-mono text-[9px] sm:text-[10px] text-gray-400 mt-0.5">App: {app.application_no}</div>
                      </td>
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4">
                        <div className="font-bold text-[#FF2D8D] text-xs">{app.scholarship_title}</div>
                        <div className="font-bold text-emerald-600 text-xs mt-0.5">
                          Score: {app.exam_marks != null ? `${app.exam_marks}/100` : 'N/A'}
                        </div>
                      </td>
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4">
                        <div className="space-y-1 sm:space-y-1.5">
                          <div>
                            <span
                              className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase ${
                                app.document_status === 'verified'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : app.document_status === 'action_needed'
                                  ? 'bg-amber-100 text-amber-800'
                                  : app.document_status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              ● {app.document_status === 'verified' ? 'Verified' : app.document_status === 'action_needed' ? 'Re-upload' : app.document_status === 'rejected' ? 'Rejected' : 'Pending'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleOpenDossier(app)}
                            className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-purple-50 hover:bg-purple-100 text-[#9C27FF] text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl border border-purple-200 transition-all flex items-center gap-1 shadow-xs"
                          >
                            <FiEye size={12} />
                            Dossier
                          </button>
                        </div>
                      </td>
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4">
                        <span
                          className={`inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase ${
                            app.award_status === 'awarded'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          ● {app.award_status === 'awarded' ? 'Awarded' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4 text-xs">
                        {app.award_status === 'awarded' ? (
                          <div className="space-y-1">
                            <div className="font-bold text-gray-900 text-xs">{app.award_amount}</div>
                            {app.award_voucher_code && (
                              <div className="font-mono text-[9px] sm:text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 sm:px-2 py-0.5 rounded-md inline-block">
                                🎟️ {app.award_voucher_code}
                              </div>
                            )}
                            <div className="font-mono text-[9px] sm:text-[10px] text-gray-400">Ref: {app.award_disbursement_ref}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">Pending Allocation</span>
                        )}
                      </td>
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4 text-right">
                        <button
                          onClick={() => handleOpenAwardModal(app)}
                          className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1 ml-auto whitespace-nowrap"
                        >
                          <FiAward size={13} />
                          {app.award_status === 'awarded' ? 'Manage' : 'Disburse'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: REFERRAL & REFERENCE CODES */}
      {tab === 'referral_codes' && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-fuchsia-950 via-purple-900 to-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 text-xs font-bold mb-2">
                  <FiShare2 size={13} />
                  <span>Agent & Affiliate Referral System</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Reference Code Management
                </h2>
                <p className="text-gray-300 text-xs sm:text-sm mt-1 max-w-2xl">
                  Generate unique referral codes for agents, schools, and partners. Track student applications coming through each reference code in real-time.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowRefCodeModal(true)}
                className="px-5 py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-600 hover:to-pink-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-fuchsia-500/25 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <FiPlus size={16} />
                <span>+ Generate Reference Code</span>
              </button>
            </div>

            {/* Overview Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl sm:rounded-2xl border border-white/10">
                <span className="text-[10px] sm:text-xs font-bold text-fuchsia-200 uppercase tracking-wider block">Total Codes</span>
                <span className="text-lg sm:text-2xl font-black text-white mt-0.5 block">{refCodeStats.total_codes}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl sm:rounded-2xl border border-white/10">
                <span className="text-[10px] sm:text-xs font-bold text-emerald-300 uppercase tracking-wider block">Active Codes</span>
                <span className="text-lg sm:text-2xl font-black text-emerald-300 mt-0.5 block">{refCodeStats.active_codes}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl sm:rounded-2xl border border-white/10">
                <span className="text-[10px] sm:text-xs font-bold text-amber-300 uppercase tracking-wider block">Inactive Codes</span>
                <span className="text-lg sm:text-2xl font-black text-amber-300 mt-0.5 block">{refCodeStats.inactive_codes}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl sm:rounded-2xl border border-white/10">
                <span className="text-[10px] sm:text-xs font-bold text-pink-300 uppercase tracking-wider block">Referred Students</span>
                <span className="text-lg sm:text-2xl font-black text-pink-300 mt-0.5 block">{refCodeStats.total_referred_students}</span>
              </div>
            </div>
          </div>

          {/* Reference Codes Table */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                <span>Issued Reference Codes</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200/60">
                  {referenceCodes.length}
                </span>
              </h3>

              <div className="relative sm:w-72">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search code, name, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600 min-w-[700px]">
                <thead className="bg-gray-50/80 text-[10px] sm:text-[11px] uppercase font-bold text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-4 sm:px-6 py-3.5">Reference Code</th>
                    <th className="px-4 sm:px-6 py-3.5">Representative / Partner</th>
                    <th className="px-4 sm:px-6 py-3.5 text-center">Status</th>
                    <th className="px-4 sm:px-6 py-3.5 text-center">Referred Students</th>
                    <th className="px-4 sm:px-6 py-3.5">Created Date</th>
                    <th className="px-4 sm:px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {referenceCodes
                    .filter((rc) => {
                      if (!searchQuery.trim()) return true
                      const q = searchQuery.toLowerCase()
                      return (
                        rc.code.toLowerCase().includes(q) ||
                        rc.name.toLowerCase().includes(q) ||
                        rc.phone.includes(q) ||
                        (rc.email && rc.email.toLowerCase().includes(q))
                      )
                    })
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-fuchsia-50/30 transition-colors">
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-fuchsia-800 bg-fuchsia-50 border border-fuchsia-200/80 px-2.5 py-1 rounded-lg">
                              {item.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(item.code)
                                setCopiedRefCode(item.id)
                                setTimeout(() => setCopiedRefCode(null), 2000)
                              }}
                              className="p-1.5 text-gray-400 hover:text-fuchsia-700 hover:bg-fuchsia-50 rounded-lg transition-colors"
                              title="Copy Code"
                            >
                              {copiedRefCode === item.id ? <FiCheck size={14} className="text-emerald-600" /> : <FiCopy size={14} />}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="font-bold text-gray-900 text-xs sm:text-sm">{item.name}</div>
                          <div className="text-gray-500 text-[11px] font-mono mt-0.5">📞 {item.phone}</div>
                          {item.email && <div className="text-gray-400 text-[10px] truncate">{item.email}</div>}
                          {item.notes && <div className="text-gray-400 text-[10px] italic mt-0.5 max-w-xs">{item.notes}</div>}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleRefCodeStatus(item)}
                            disabled={refCodeActionLoading === item.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all shadow-xs ${
                              item.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300/80'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'active' ? 'bg-emerald-600 animate-ping' : 'bg-gray-400'}`} />
                            <span>{item.status === 'active' ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => setShowRefStudentsModal(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-50 to-fuchsia-50 hover:from-purple-100 hover:to-fuchsia-100 text-fuchsia-800 border border-fuchsia-200 font-bold text-xs transition-all shadow-xs"
                          >
                            <FiUsers size={13} />
                            <span>{item.students_count || 0} Candidates</span>
                          </button>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs text-gray-500 font-mono">
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDeleteRefCode(item.id, item.code)}
                              disabled={refCodeActionLoading === item.id}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                              title="Delete Reference Code"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {referenceCodes.length === 0 && (
                <div className="p-12 text-center text-gray-400 bg-white text-xs">
                  <FiShare2 size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="font-bold text-gray-600 text-sm">No Reference Codes Generated Yet</p>
                  <p className="text-gray-400 text-xs mt-1">Click "+ Generate Reference Code" to issue referral codes for your representatives.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SCHEME CREATE/EDIT MODAL */}
      {mounted && showSchemeModal && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-0 sm:p-4 md:p-6 lg:p-8 overflow-y-auto animate-in fade-in duration-200"
          style={{
            backgroundColor: 'rgba(5, 8, 20, 0.88)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
          }}
        >
          <div className="bg-white sm:rounded-3xl rounded-none max-w-6xl w-full h-full sm:h-auto sm:max-h-[94vh] p-4 sm:p-7 md:p-8 shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
              <div>
                <span className="text-[10px] font-bold text-[#FF2D8D] uppercase tracking-widest">
                  Scholarship Policy Builder
                </span>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mt-0.5">
                  {editingScheme ? 'Edit Scholarship Scheme' : 'Create New Scholarship Scheme'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSchemeModal(false)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-all text-base sm:text-lg font-bold shrink-0 ml-2"
                title="Close Form"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveScheme} className="space-y-5 sm:space-y-6 overflow-y-auto pr-1 sm:pr-2 pt-4 flex-1">
              {/* SECTION 1: SCHOLARSHIP IDENTITY & STATUS */}
              <div className="p-3.5 sm:p-5 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    1. Basic Identity & Publishing Status
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-gray-600 shrink-0">Status:</label>
                    <select
                      value={schemeForm.status || 'published'}
                      onChange={(e) => setSchemeForm({ ...schemeForm, status: e.target.value as any })}
                      className={`w-full sm:w-auto px-3 py-1.5 text-xs font-bold rounded-xl border ${
                        schemeForm.status === 'draft'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : schemeForm.status === 'closed'
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      <option value="published">🚀 Published (Live for Students)</option>
                      <option value="draft">📝 Draft (Superadmin Only)</option>
                      <option value="closed">⏹️ Closed / Archived</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Scholarship Title *</label>
                    <input
                      type="text"
                      required
                      value={schemeForm.title}
                      onChange={(e) => setSchemeForm({ ...schemeForm, title: e.target.value })}
                      placeholder="e.g. ABC National Scholarship 2026"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category *</label>
                    <input
                      type="text"
                      required
                      list="scholarship-category-list"
                      value={schemeForm.category}
                      onChange={(e) => setSchemeForm({ ...schemeForm, category: e.target.value })}
                      placeholder="e.g. Academic Merit, Need-Based, Sports..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                    />
                    <datalist id="scholarship-category-list">
                      {Array.from(
                        new Set([
                          'Academic Merit',
                          'Need-Based (EWS)',
                          'Women in Tech',
                          'STEM Excellence',
                          'Special Talent / Sports',
                          ...scholarships.map((s) => s.category).filter(Boolean),
                        ])
                      ).map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Scholarship Description *</label>
                  <textarea
                    rows={2}
                    required
                    value={schemeForm.description || ''}
                    onChange={(e) => setSchemeForm({ ...schemeForm, description: e.target.value })}
                    placeholder="Provide a clear description of the scholarship, goals, and opportunities..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                  />
                </div>
              </div>

              {/* SECTION 2: ELIGIBILITY CRITERIA */}
              <div className="p-3.5 sm:p-5 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-4">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  2. Eligibility & Candidate Standards
                </span>

                {/* Eligible Classes / Qualifications Pills & Custom Stream Adder */}
                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase">
                      Eligible Classes / Streams (Click to select) *
                    </label>
                    <span className="text-[11px] font-semibold text-pink-600">
                      {(schemeForm.eligible_qualifications || []).length} Selected
                    </span>
                  </div>

                  {/* 1-Click Quick Presets */}
                  <div className="flex flex-wrap gap-1.5 p-2 bg-white rounded-xl border border-purple-100">
                    <span className="text-[10px] font-bold text-purple-900 uppercase self-center mr-1">Quick Presets:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const schoolTier = ['Class 6th', 'Class 7th', 'Class 8th', 'Class 9th', 'Class 10th']
                        setSchemeForm({
                          ...schemeForm,
                          eligible_qualifications: schoolTier,
                          age_limit: '10 - 16 Years',
                          eligibility_criteria: 'Students currently studying in Class 6th, 7th, 8th, 9th, or 10th in any recognized school board.',
                        })
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-pink-50 text-[#FF2D8D] border border-pink-200 hover:bg-pink-100 transition-all"
                    >
                      🏫 School Tier (6th to 10th)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const highSchool = [
                          'Class 11th (Science - PCM)',
                          'Class 11th (Science - PCB)',
                          'Class 11th (Commerce/Arts)',
                          'Class 12th (Science - PCM)',
                          'Class 12th (Science - PCB)',
                          'Class 12th (Commerce/Arts)',
                        ]
                        setSchemeForm({
                          ...schemeForm,
                          eligible_qualifications: highSchool,
                          age_limit: '15 - 19 Years',
                          eligibility_criteria: 'Students currently enrolled in Class 11th or 12th (Senior Secondary / Junior College).',
                        })
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-50 text-[#9C27FF] border border-purple-200 hover:bg-purple-100 transition-all"
                    >
                      🎓 Senior Secondary (11th & 12th)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const college = [
                          'Undergraduate (B.Tech / BSc / BCA / B.Com / BA)',
                          'Diploma / Polytechnic / ITI',
                          'Postgraduate',
                        ]
                        setSchemeForm({
                          ...schemeForm,
                          eligible_qualifications: college,
                          age_limit: '17 - 28 Years',
                          eligibility_criteria: 'Students enrolled in Undergraduate, Diploma, or Postgraduate college programs.',
                        })
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
                    >
                      🏛️ College / Higher Ed
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSchemeForm({
                          ...schemeForm,
                          eligible_qualifications: [...availableQualifications],
                          age_limit: '10 - 28 Years',
                        })
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-all"
                    >
                      🌐 Select All
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    {availableQualifications.map((qual) => {
                      const isSelected = (schemeForm.eligible_qualifications || []).includes(qual)
                      return (
                        <div
                          key={qual}
                          className={`inline-flex items-center rounded-xl text-xs font-bold transition-all border shadow-xs group ${
                            isSelected
                              ? 'bg-[#FF2D8D] text-white border-[#FF2D8D]'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleQualification(qual)}
                            className="px-3 py-1.5 flex items-center gap-1.5 focus:outline-none"
                          >
                            <span>{isSelected ? '✓' : '+'}</span>
                            <span>{qual}</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleRemoveQualificationPill(qual, e)}
                            title={`Remove "${qual}"`}
                            className={`pr-2.5 pl-0.5 py-1.5 text-[11px] transition-all opacity-70 hover:opacity-100 ${
                              isSelected
                                ? 'text-white hover:text-white/80'
                                : 'text-gray-400 hover:text-red-600'
                            }`}
                          >
                            ✕
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  {/* Add New Stream / Eligibility Input */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={customQualInput}
                      onChange={(e) => setCustomQualInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddCustomQualification()
                        }
                      }}
                      placeholder="Type custom stream e.g. B.Tech / BCA / ITI / 8th Pass / Class 9..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCustomQualification()}
                      disabled={!customQualInput.trim()}
                      className="px-4 py-2 bg-[#FF2D8D] text-white rounded-xl text-xs font-bold hover:bg-[#FF2D8D]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <FiPlus size={14} />
                      Add Stream
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Min Percentage (%) *</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={schemeForm.min_percentage}
                      onChange={(e) => setSchemeForm({ ...schemeForm, min_percentage: Number(e.target.value) })}
                      placeholder="e.g. 60"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Age Limit</label>
                    <input
                      type="text"
                      value={schemeForm.age_limit || ''}
                      onChange={(e) => setSchemeForm({ ...schemeForm, age_limit: e.target.value })}
                      placeholder="e.g. 16 - 28 Years"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Max Annual Income (LPA)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={schemeForm.max_family_income}
                      onChange={(e) => setSchemeForm({ ...schemeForm, max_family_income: Number(e.target.value) })}
                      placeholder="e.g. 10"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Eligibility Criteria Details</label>
                  <textarea
                    rows={2}
                    value={schemeForm.eligibility_criteria}
                    onChange={(e) => setSchemeForm({ ...schemeForm, eligibility_criteria: e.target.value })}
                    placeholder="e.g. Students currently enrolled in recognized boards or universities with consistent academic performance."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                  />
                </div>
              </div>

              {/* SECTION 3: APPLICATION DATES & TIMELINE */}
              <div className="p-3.5 sm:p-5 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-4">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  3. Key Dates & Deadlines
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">App Start Date</label>
                    <input
                      type="date"
                      value={schemeForm.application_start_date || ''}
                      onChange={(e) => setSchemeForm({ ...schemeForm, application_start_date: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">App End Date (Deadline) *</label>
                    <input
                      type="date"
                      required
                      value={schemeForm.application_end_date || ''}
                      onChange={(e) => setSchemeForm({ ...schemeForm, application_end_date: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-white font-bold text-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Admit Card Date</label>
                    <input
                      type="date"
                      value={schemeForm.admit_card_release_date || ''}
                      onChange={(e) => setSchemeForm({ ...schemeForm, admit_card_release_date: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Result Date</label>
                    <input
                      type="date"
                      value={schemeForm.result_date || ''}
                      onChange={(e) => setSchemeForm({ ...schemeForm, result_date: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: EXAM SPECIFICATION & MULTI-CENTERS */}
              <div className="p-3.5 sm:p-5 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-4">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider block">
                  4. Examination Pattern & Multi-Exam Centers
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Exam Mode *</label>
                    <select
                      value={schemeForm.exam_mode}
                      onChange={(e) => setSchemeForm({ ...schemeForm, exam_mode: e.target.value as any })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                    >
                      <option value="online">Online Proctored</option>
                      <option value="offline">Offline Test Center</option>
                      <option value="hybrid">Hybrid Choice</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Exam Date *</label>
                    <input
                      type="date"
                      value={schemeForm.exam_date || ''}
                      onChange={(e) => setSchemeForm({ ...schemeForm, exam_date: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Exam Duration</label>
                    <input
                      type="text"
                      value={schemeForm.exam_duration || '120 Minutes'}
                      onChange={(e) => setSchemeForm({ ...schemeForm, exam_duration: e.target.value })}
                      placeholder="e.g. 120 Minutes / 90 Mins"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Total Questions</label>
                    <input
                      type="number"
                      min={10}
                      value={schemeForm.total_questions || 100}
                      onChange={(e) => setSchemeForm({ ...schemeForm, total_questions: Number(e.target.value) })}
                      placeholder="e.g. 100"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                    />
                  </div>
                </div>

                {/* Dynamic Center Allocation Note */}
                <div className="p-3.5 bg-white/90 rounded-2xl border border-purple-200/80 space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📍</span>
                    <span className="text-xs font-bold text-purple-950 uppercase">
                      Dynamic Regional Exam Center Allocation
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Auto Enabled
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Exam centers are not fixed during scheme creation. Candidates apply from their respective states and districts. Superadmin configures local district venues in the <strong>Centers Tab</strong> and automatically assigns nearest centers when generating Official Admit Cards.
                  </p>
                </div>
              </div>

              {/* SECTION 5: REGISTRATION FEE, PRIZES & WINNERS */}
              <div className="p-3.5 sm:p-5 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-4">
                <span className="text-xs font-bold text-[#FF2D8D] uppercase tracking-wider block">
                  5. Registration Fee & Tiered Prize Distribution
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Registration Fee (₹) *</label>
                    <input
                      type="number"
                      min={0}
                      value={schemeForm.application_fee}
                      onChange={(e) => setSchemeForm({ ...schemeForm, application_fee: Number(e.target.value) })}
                      placeholder="e.g. 199 (0 for Free)"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Prize Summary Header *</label>
                    <input
                      type="text"
                      required
                      value={schemeForm.scholarship_value}
                      onChange={(e) => setSchemeForm({ ...schemeForm, scholarship_value: e.target.value })}
                      placeholder="e.g. Up to ₹50,000 Cash + 100% Fee Waiver"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Number of Winners</label>
                    <input
                      type="number"
                      min={1}
                      value={schemeForm.number_of_winners || 50}
                      onChange={(e) => setSchemeForm({ ...schemeForm, number_of_winners: Number(e.target.value) })}
                      placeholder="e.g. 50"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold bg-white"
                    />
                  </div>
                </div>

                {/* Tiered Prizes: 1st, 2nd, 3rd Prize */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-pink-100">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">🥇 1st Prize Amount</label>
                    <input
                      type="text"
                      value={schemeForm.prize_distribution?.first_prize || '₹50,000'}
                      onChange={(e) =>
                        setSchemeForm({
                          ...schemeForm,
                          prize_distribution: {
                            ...schemeForm.prize_distribution,
                            first_prize: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. ₹50,000"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-[#FF2D8D] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">🥈 2nd Prize Amount</label>
                    <input
                      type="text"
                      value={schemeForm.prize_distribution?.second_prize || '₹25,000'}
                      onChange={(e) =>
                        setSchemeForm({
                          ...schemeForm,
                          prize_distribution: {
                            ...schemeForm.prize_distribution,
                            second_prize: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. ₹25,000"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-purple-700 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">🥉 3rd Prize Amount</label>
                    <input
                      type="text"
                      value={schemeForm.prize_distribution?.third_prize || '₹10,000'}
                      onChange={(e) =>
                        setSchemeForm({
                          ...schemeForm,
                          prize_distribution: {
                            ...schemeForm.prize_distribution,
                            third_prize: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. ₹10,000"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-blue-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">🎖️ Consolation / Perks</label>
                    <input
                      type="text"
                      value={schemeForm.prize_distribution?.consolation || 'Certificate & 50% Fee Waiver'}
                      onChange={(e) =>
                        setSchemeForm({
                          ...schemeForm,
                          prize_distribution: {
                            ...schemeForm.prize_distribution,
                            consolation: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Certificate + Fee Waiver"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                    />
                  </div>
                </div>

                {/* Detailed Winner Description / Benefits Breakdown */}
                <div className="pt-3 border-t border-pink-100 space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="block text-xs font-bold text-gray-800 uppercase flex items-center gap-1.5">
                      <span className="text-base">🏆</span>
                      Winner Prize & Rewards Detailed Description *
                    </label>
                    <span className="text-[10px] text-pink-600 font-semibold">
                      Visible on Public Portal & Candidate Dashboard
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={schemeForm.winner_description || ''}
                    onChange={(e) =>
                      setSchemeForm({
                        ...schemeForm,
                        winner_description: e.target.value,
                        prize_distribution: {
                          ...schemeForm.prize_distribution,
                          winner_description: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. 🥇 Rank 1: ₹50,000 Direct Bank Transfer + Gold Medal + Laptop + 100% Scholarship&#10;🥈 Rank 2: ₹25,000 Cash + Silver Medal + Tablet&#10;🥉 Rank 3: ₹10,000 Cash + Bronze Medal&#10;🎖️ Top 50: Official Merit Certificate + Free Mentorship Bootcamp + 50% Tuition Waiver"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                  />
                  <p className="text-[10px] text-gray-400">
                    Specify everything winners will receive (Cash Prizes, Medals, Laptops/Tablets, Fee Waivers, Certificates, Mentorship).
                  </p>
                </div>
              </div>

              {/* SECTION 6: REQUIRED DOCUMENTS & TERMS */}
              <div className="p-3.5 sm:p-5 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-4">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  6. Required Documents & Terms and Conditions
                </span>

                {/* Required Documents Tag Manager */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase">
                    Required Candidate Documents (Add / Remove)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(schemeForm.required_documents || []).map((doc, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-800 text-xs font-semibold shadow-sm"
                      >
                        <span>📄 {doc}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc(idx)}
                          className="text-gray-400 hover:text-red-600 p-0.5 rounded-full hover:bg-red-50"
                        >
                          <FiXCircle size={14} />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Preset quick add document buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Quick Add:</span>
                    {[
                      '10th / 12th Marksheet',
                      'Aadhaar Card',
                      'Passport Size Photograph',
                      'Income Certificate',
                      'Caste Certificate',
                      'College ID Card',
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAddDoc(preset)}
                        className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 text-[11px] font-semibold text-gray-600 rounded-xl transition-colors"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={docInput}
                      onChange={(e) => setDocInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddDoc(docInput)
                        }
                      }}
                      placeholder="Type custom required document name..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:ring-2 focus:ring-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddDoc(docInput)}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1"
                    >
                      <FiPlus size={14} />
                      Add Doc
                    </button>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Terms & Conditions</label>
                  <textarea
                    rows={3}
                    value={schemeForm.terms_and_conditions || ''}
                    onChange={(e) => setSchemeForm({ ...schemeForm, terms_and_conditions: e.target.value })}
                    placeholder="Enter examination guidelines, scholarship disbursement rules, disqualification policy..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                  />
                </div>
              </div>

              {/* Form Action Footer (Sticky Bottom) */}
              <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-3.5 pb-2 -mx-1 px-1 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 z-20">
                <button
                  type="button"
                  onClick={() => setShowSchemeModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-all text-center"
                >
                  Cancel
                </button>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      setSchemeForm((prev) => ({ ...prev, status: 'draft' }))
                      setTimeout(() => {
                        const form = document.querySelector('form')
                        if (form) form.requestSubmit()
                      }, 50)
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all text-center justify-center flex items-center"
                  >
                    📝 Save as Draft
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] shadow-md hover:shadow-lg transition-all text-center justify-center flex items-center"
                  >
                    {schemeForm.status === 'draft' ? 'Save Scheme' : '🚀 Save & Publish Live'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}



      {/* DOSSIER INSPECTION MODAL */}
      {mounted && showDossierModal && inspectingApplicant && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
          style={{
            backgroundColor: 'rgba(5, 8, 20, 0.88)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
          }}
        >
          <div className="bg-white sm:rounded-3xl rounded-2xl max-w-4xl w-full p-4 sm:p-6 md:p-8 shadow-2xl border border-gray-100 space-y-6 max-h-[94vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-100">
                  Candidate Dossier Inspection Deck
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-1 flex items-center gap-2">
                  <span>{inspectingApplicant.applicant_name}</span>
                  {inspectingApplicant.rank && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black">
                      Merit Rank #{inspectingApplicant.rank}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  App: {inspectingApplicant.application_no} • Roll: {inspectingApplicant.roll_number || 'N/A'} • Scheme: {inspectingApplicant.scholarship_title}
                </p>
              </div>
              <button
                onClick={() => setShowDossierModal(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
              >
                <FiXCircle size={22} />
              </button>
            </div>

            {/* Main Content Grid: Left Document Viewer, Right Verification Desk */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Uploaded Documents Tabs & Live Viewer (7 cols) */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Uploaded Candidate Dossiers
                  </span>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg">
                    Live Document Preview
                  </span>
                </div>

                {/* Dynamic Document Selector Pills */}
                {(() => {
                  const docsList: { id: string; label: string; url: string; icon: string }[] = [
                    { id: 'marksheet', label: 'Marksheet (10th/12th)', url: inspectingApplicant.marksheet_url || '', icon: '📄' },
                    { id: 'aadhaar', label: 'Aadhaar / ID Card', url: inspectingApplicant.aadhaar_url || '', icon: '🪪' },
                    { id: 'college_id', label: 'College/School ID', url: inspectingApplicant.college_id_url || '', icon: '🎓' },
                    { id: 'photo', label: 'Passport Photo', url: inspectingApplicant.photo_url || '', icon: '👤' },
                    { id: 'signature', label: 'Digital Sign', url: inspectingApplicant.signature_url || '', icon: '✍️' },
                  ]

                  const uploadedMap = (inspectingApplicant.documents?.uploaded_documents || inspectingApplicant.documents || {}) as Record<string, any>
                  Object.keys(uploadedMap).forEach((key) => {
                    if (typeof uploadedMap[key] === 'string' && (uploadedMap[key].startsWith('data:') || uploadedMap[key].startsWith('http'))) {
                      const exists = docsList.some(d => d.id === key || d.label.toLowerCase().includes(key.toLowerCase()))
                      if (!exists) {
                        docsList.push({
                          id: key,
                          label: key,
                          url: uploadedMap[key],
                          icon: key.toLowerCase().includes('income') ? '💰' : key.toLowerCase().includes('caste') ? '📜' : '📁',
                        })
                      }
                    }
                  })

                  return (
                    <div className="flex flex-wrap gap-1.5 p-1 bg-gray-100/80 rounded-2xl">
                      {docsList.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveDocTab(item.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                            activeDocTab === item.id
                              ? 'bg-white text-purple-900 shadow-sm border border-purple-100'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                          {item.url && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        </button>
                      ))}
                    </div>
                  )
                })()}

                {/* Live Document Preview Box */}
                <div className="bg-gray-900/5 rounded-3xl border border-gray-200 p-4 min-h-[320px] flex flex-col items-center justify-center relative overflow-hidden group">
                  {(() => {
                    let activeUrl = ''
                    let activeName = activeDocTab
                    if (activeDocTab === 'marksheet') {
                      activeUrl = inspectingApplicant.marksheet_url || ''
                      activeName = 'Qualifying Academic Marksheet'
                    } else if (activeDocTab === 'aadhaar') {
                      activeUrl = inspectingApplicant.aadhaar_url || ''
                      activeName = 'Government Photo ID / Aadhaar'
                    } else if (activeDocTab === 'college_id') {
                      activeUrl = inspectingApplicant.college_id_url || ''
                      activeName = 'School / College Identity Card'
                    } else if (activeDocTab === 'photo') {
                      activeUrl = inspectingApplicant.photo_url || ''
                      activeName = 'Passport Size Photograph'
                    } else if (activeDocTab === 'signature') {
                      activeUrl = inspectingApplicant.signature_url || ''
                      activeName = 'Candidate Digital Signature'
                    } else {
                      const uploadedMap = (inspectingApplicant.documents?.uploaded_documents || inspectingApplicant.documents || {}) as Record<string, any>
                      activeUrl = uploadedMap[activeDocTab] || ''
                      activeName = activeDocTab
                    }

                    if (!activeUrl) {
                      return (
                        <div className="text-center p-8 space-y-2">
                          <FiPaperclip size={36} className="text-gray-300 mx-auto" />
                          <div className="font-bold text-gray-600 text-sm">{activeName}</div>
                          <p className="text-xs text-gray-400">No document uploaded by student for this section.</p>
                        </div>
                      )
                    }

                    const isPdf = activeUrl.includes('application/pdf') || activeUrl.endsWith('.pdf')

                    return (
                      <div className="w-full flex flex-col items-center space-y-3">
                        <div className="w-full max-h-[360px] overflow-auto rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center p-2">
                          {isPdf ? (
                            <div className="p-8 text-center space-y-3">
                              <FiFileText size={48} className="text-red-500 mx-auto" />
                              <div className="font-bold text-gray-800 text-sm">PDF Document Dossier Attached</div>
                              <p className="text-xs text-gray-500">Official authentic certificate document</p>
                              <a
                                href={activeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md"
                              >
                                <FiExternalLink /> Open PDF in Full Viewer
                              </a>
                            </div>
                          ) : (
                            <img
                              src={activeUrl}
                              alt={activeName}
                              className="max-h-[340px] w-auto object-contain rounded-xl"
                            />
                          )}
                        </div>

                        <div className="flex items-center justify-between w-full text-xs px-1">
                          <span className="font-bold text-gray-700">{activeName}</span>
                          <a
                            href={activeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1"
                          >
                            <FiExternalLink size={13} /> Full Screen / Download
                          </a>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Right Column: Criteria Match Checklist & Decision (5 cols) */}
              <div className="md:col-span-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                      Academic & Bio Verification Checklist
                    </span>
                    <div className="space-y-2 p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dossierChecklist.marksheet_percentage_matched}
                          onChange={(e) =>
                            setDossierChecklist({
                              ...dossierChecklist,
                              marksheet_percentage_matched: e.target.checked,
                            })
                          }
                          className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                        />
                        <div>
                          <div className="font-bold text-gray-800">
                            Academic Score: {inspectingApplicant.percentage}% Agg.
                          </div>
                          <div className="text-gray-400 text-[11px]">Marksheet credentials and board verified</div>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-gray-200/60">
                        <input
                          type="checkbox"
                          checked={dossierChecklist.identity_dob_matched}
                          onChange={(e) =>
                            setDossierChecklist({
                              ...dossierChecklist,
                              identity_dob_matched: e.target.checked,
                            })
                          }
                          className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                        />
                        <div>
                          <div className="font-bold text-gray-800">
                            Identity & DOB: {inspectingApplicant.dob || 'Verified'}
                          </div>
                          <div className="text-gray-400 text-[11px]">Aadhaar / ID name & face matches candidate</div>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-gray-200/60">
                        <input
                          type="checkbox"
                          checked={dossierChecklist.eligibility_stream_valid}
                          onChange={(e) =>
                            setDossierChecklist({
                              ...dossierChecklist,
                              eligibility_stream_valid: e.target.checked,
                            })
                          }
                          className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                        />
                        <div>
                          <div className="font-bold text-gray-800">
                            Stream: {inspectingApplicant.qualification}
                          </div>
                          <div className="text-gray-400 text-[11px]">Eligibility criteria & income limits confirmed</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Dynamic Multi-Standard Academic Breakdown */}
                  {inspectingApplicant.documents?.academic_records && inspectingApplicant.documents.academic_records.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                        Detailed Academic Qualifications ({inspectingApplicant.documents.academic_records.length} Standards)
                      </span>
                      <div className="bg-purple-50/50 rounded-2xl border border-purple-100 p-2.5 space-y-2 max-h-48 overflow-y-auto">
                        {inspectingApplicant.documents.academic_records.map((rec: any, idx: number) => (
                          <div key={idx} className="p-2.5 bg-white rounded-xl border border-purple-100 text-xs space-y-1 shadow-xs">
                            <div className="flex items-center justify-between font-bold">
                              <span className="text-[#FF2D8D] font-extrabold">{rec.qualification} Record</span>
                              <span className="font-mono text-emerald-700 font-black text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                {rec.percentage}% Agg.
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-800 font-medium truncate">
                              🏫 {rec.institution || 'Institute not specified'}
                            </div>
                            <div className="flex flex-wrap justify-between text-[10px] text-gray-500 pt-0.5 border-t border-gray-50">
                              <span>Board: <strong>{rec.board_university || 'State/CBSE'}</strong></span>
                              <span>Passing Year: <strong>{rec.passing_year}</strong></span>
                              {rec.roll_no && <span>Roll: <strong>{rec.roll_no}</strong></span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Verification Decision Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Verification Final Decision *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setDossierStatus('verified')}
                        className={`p-2.5 rounded-2xl text-xs font-bold border transition-all text-center ${
                          dossierStatus === 'verified'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        ✅ Verified
                      </button>

                      <button
                        type="button"
                        onClick={() => setDossierStatus('action_needed')}
                        className={`p-2.5 rounded-2xl text-xs font-bold border transition-all text-center ${
                          dossierStatus === 'action_needed'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                            : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        ⚠️ Re-upload
                      </button>

                      <button
                        type="button"
                        onClick={() => setDossierStatus('rejected')}
                        className={`p-2.5 rounded-2xl text-xs font-bold border transition-all text-center ${
                          dossierStatus === 'rejected'
                            ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20'
                            : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                        }`}
                      >
                        ❌ Ineligible
                      </button>
                    </div>
                  </div>

                  {/* Verification Remarks Note */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Inspection Remarks / Feedback Note
                    </label>
                    <textarea
                      rows={3}
                      value={dossierRemarks}
                      onChange={(e) => setDossierRemarks(e.target.value)}
                      placeholder="e.g. All academic credentials verified with 90% score. Candidate is fully eligible for merit prize disbursement."
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowDossierModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 border border-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDossierVerification}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md hover:shadow-lg transition-all"
                  >
                    {actionLoading ? 'Updating...' : 'Confirm Decision'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ENHANCED SCHOLARSHIP AWARD & BENEFIT DISBURSEMENT SUITE */}
      {mounted && showAwardModal && awardingApplicant && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
          style={{
            backgroundColor: 'rgba(5, 8, 20, 0.88)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
          }}
        >
          <div className="bg-white sm:rounded-3xl rounded-2xl max-w-2xl w-full p-4 sm:p-6 md:p-8 shadow-2xl border border-gray-100 space-y-6 max-h-[94vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                  Award Handover & Benefit Allocation Suite
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-1 flex items-center gap-2">
                  <span>Grant Disbursement to {awardingApplicant.applicant_name}</span>
                  {awardingApplicant.rank && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black">
                      Rank #{awardingApplicant.rank}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  App: {awardingApplicant.application_no} • Exam Score: {awardingApplicant.exam_marks || 0}/100 • Status: {awardingApplicant.document_status?.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setShowAwardModal(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
              >
                <FiXCircle size={22} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Award Channel Options */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Award Disbursement Channel *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'both', label: '🏆 Complete Hybrid Grant', desc: '100% Free LMS Key + Cash Grant + Cheque' },
                    { id: 'fee_waiver', label: '🎓 100% LMS Fee Waiver', desc: 'Direct ₹0 Course Enrollment Key' },
                    { id: 'cash_prize', label: '💰 Bank Cash Payout', desc: 'Direct RTGS/UPI Bank Grant' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAwardType(item.id as any)}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        awardType === item.id
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-xs text-gray-900">{item.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* LMS 100% Course Fee Waiver Key Generator Box */}
              {(awardType === 'fee_waiver' || awardType === 'both') && (
                <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <FiKey className="text-purple-600" />
                      1. LMS 100% Tuition Fee Waiver & Course Enrollment Token
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 uppercase">
                      Instant 100% Discount Key
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      placeholder="e.g. GRAVITY-100-FREE-1360"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-purple-200 font-mono font-bold text-sm bg-white text-purple-950 uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(voucherCode)
                        setCopiedVoucher(true)
                        setTimeout(() => setCopiedVoucher(false), 2000)
                      }}
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 shadow-sm"
                    >
                      {copiedVoucher ? <FiCheck /> : <FiCopy />}
                      {copiedVoucher ? 'Copied' : 'Copy Key'}
                    </button>
                  </div>
                  <p className="text-[11px] text-purple-700">
                    Student will receive this coupon key on their scorecard to enroll in any premier tech program with 100% tuition waiver.
                  </p>
                </div>
              )}

              {/* Direct Cash Grant Bank Transfer Box */}
              {(awardType === 'cash_prize' || awardType === 'both') && (
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <FiCreditCard className="text-emerald-600" />
                      2. Cash Grant Direct Bank / UPI Payout Record
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                      Bank Transfer Receipt
                    </span>
                  </div>

                  {/* Student Bank details if already provided */}
                  {awardingApplicant.documents?.bank_details ? (
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs space-y-1">
                      <div className="font-bold text-gray-800">Beneficiary Bank Details (Submitted by Student):</div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 pt-1">
                        <div>Bank: <strong>{awardingApplicant.documents.bank_details.bank_name || 'N/A'}</strong></div>
                        <div>A/C No: <strong className="font-mono">{awardingApplicant.documents.bank_details.account_number}</strong></div>
                        <div>IFSC: <strong className="font-mono">{awardingApplicant.documents.bank_details.ifsc_code}</strong></div>
                        <div>UPI ID: <strong className="font-mono text-purple-700">{awardingApplicant.documents.bank_details.upi_id || 'N/A'}</strong></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center gap-2">
                      <FiAlertCircle /> Student has not yet submitted bank details. You can still disburse and issue the grant UTR.
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Cash Grant Amount (₹) *</label>
                      <input
                        type="text"
                        value={payoutCashAmount}
                        onChange={(e) => setPayoutCashAmount(e.target.value)}
                        placeholder="e.g. 50,000"
                        className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs font-black text-emerald-800 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Bank Transfer UTR / Ref No *</label>
                      <input
                        type="text"
                        value={payoutBankUtr}
                        onChange={(e) => setPayoutBankUtr(e.target.value)}
                        placeholder="e.g. UTR998827162"
                        className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-xs font-mono font-bold bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* General Summary & Award Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Award Certificate Title</label>
                  <input
                    type="text"
                    value={awardAmount}
                    onChange={(e) => setAwardAmount(e.target.value)}
                    placeholder="e.g. 100% Tuition Fee Waiver + ₹50,000 Cash Prize"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white font-bold text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Internal Disbursement Audit Ref</label>
                  <input
                    type="text"
                    value={disbursementRef}
                    onChange={(e) => setDisbursementRef(e.target.value)}
                    placeholder="e.g. DISB-2026-TXN-001"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAwardModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 border border-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDisburseAward}
                disabled={actionLoading}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
              >
                <FiAward size={14} />
                {actionLoading ? 'Allocating Benefits...' : '⚡ Confirm & Issue Official Grant'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* CENTER ADD / EDIT MODAL */}
      {mounted && showCenterModal && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
          style={{
            backgroundColor: 'rgba(5, 8, 20, 0.88)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
          }}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-6 md:p-8 shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 sm:pb-4 border-b border-gray-100 shrink-0 gap-3">
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] font-bold text-purple-700 uppercase tracking-widest px-2 sm:px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 inline-block">
                  Physical Infrastructure & Logistics
                </span>
                <h3 className="text-base sm:text-xl font-black text-gray-900 mt-1 flex items-center gap-1.5 sm:gap-2">
                  <FiMapPin className="text-purple-600 shrink-0" size={18} />
                  <span className="truncate">{editingCenter ? 'Edit Examination Center' : 'Register New Exam Center'}</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-relaxed">
                  Configure center capacity, district jurisdiction, superintendent contacts, and admit card timings.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCenterModal(false)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-all text-base font-bold shrink-0"
                title="Close Form"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCenter} className="space-y-4 text-xs overflow-y-auto pr-1 sm:pr-2 pt-3 sm:pt-4 flex-1">
              {/* Center Code & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Center Code *</label>
                  <input
                    type="text"
                    required
                    value={centerForm.center_code || ''}
                    onChange={(e) => setCenterForm({ ...centerForm, center_code: e.target.value.toUpperCase() })}
                    placeholder="e.g. PAT-01"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono font-bold text-purple-900 bg-purple-50/50 uppercase text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Center / Institution Name *</label>
                  <input
                    type="text"
                    required
                    value={centerForm.center_name || ''}
                    onChange={(e) => setCenterForm({ ...centerForm, center_name: e.target.value })}
                    placeholder="e.g. Patna Central Public School & Online Test Hub"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold text-gray-900 text-xs"
                  />
                </div>
              </div>

              {/* State & District Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">State / UT *</label>
                  <select
                    required
                    value={centerForm.state || 'Bihar'}
                    onChange={(e) => {
                      const newState = e.target.value
                      const firstDist = getDistrictsForState(newState)[0] || ''
                      setCenterForm({
                        ...centerForm,
                        state: newState,
                        district: firstDist,
                        city: firstDist,
                      })
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-medium text-gray-800 bg-white text-xs"
                  >
                    {getIndianStates().map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">District *</label>
                  <select
                    required
                    value={centerForm.district || 'Patna'}
                    onChange={(e) => {
                      const newDist = e.target.value
                      setCenterForm({
                        ...centerForm,
                        district: newDist,
                        city: centerForm.city || newDist,
                      })
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-medium text-gray-800 bg-white text-xs"
                  >
                    {getDistrictsForState(centerForm.state || 'Bihar').map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* City & Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">City / Town *</label>
                  <input
                    type="text"
                    required
                    value={centerForm.city || ''}
                    onChange={(e) => setCenterForm({ ...centerForm, city: e.target.value })}
                    placeholder="e.g. Patna"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Postal Pincode</label>
                  <input
                    type="text"
                    value={centerForm.pincode || ''}
                    onChange={(e) => setCenterForm({ ...centerForm, pincode: e.target.value })}
                    placeholder="e.g. 800001"
                    maxLength={6}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono text-gray-800 text-xs"
                  />
                </div>
              </div>

              {/* Full Address & Landmark */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Detailed Venue Address *</label>
                <textarea
                  rows={2}
                  required
                  value={centerForm.address || ''}
                  onChange={(e) => setCenterForm({ ...centerForm, address: e.target.value })}
                  placeholder="e.g. Plot No 42, Bailey Road, Near Dak Bungalow Crossing, Patna, Bihar"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-gray-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nearest Landmark</label>
                  <input
                    type="text"
                    value={centerForm.landmark || ''}
                    onChange={(e) => setCenterForm({ ...centerForm, landmark: e.target.value })}
                    placeholder="e.g. Opp. City Hospital, Gate #2"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Google Maps Direction URL</label>
                  <input
                    type="url"
                    value={centerForm.google_maps_url || ''}
                    onChange={(e) => setCenterForm({ ...centerForm, google_maps_url: e.target.value })}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-blue-600 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Capacity & Operational Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 p-3 sm:p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Seating Capacity *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={centerForm.max_capacity || 200}
                    onChange={(e) => setCenterForm({ ...centerForm, max_capacity: parseInt(e.target.value) || 100 })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-black text-gray-900 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={centerForm.status || 'active'}
                    onChange={(e) => setCenterForm({ ...centerForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold bg-white text-gray-800 text-xs"
                  >
                    <option value="active">Active (Accepting Candidates)</option>
                    <option value="full">Full (Capacity Reached)</option>
                    <option value="inactive">Inactive / Standby</option>
                  </select>
                </div>
                <div className="flex items-center pt-1 sm:pt-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!centerForm.is_partner_school}
                      onChange={(e) => setCenterForm({ ...centerForm, is_partner_school: e.target.checked })}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <span className="font-bold text-gray-800 text-xs">Partner School Campus</span>
                  </label>
                </div>
              </div>

              {/* Examination Timing & Reporting Schedule (Prints on Admit Cards) */}
              <div className="p-3 sm:p-4 bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-pink-50/40 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-indigo-100/80 pb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <FiClock size={14} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-indigo-950 block text-xs uppercase tracking-wider truncate">
                        Timing & Reporting Schedule
                      </span>
                      <p className="text-[10px] sm:text-[11px] text-indigo-700/80 truncate">
                        Auto-prints on candidate Admit Cards & Verification Rosters.
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 self-start sm:self-center shrink-0">
                    Prints on Admit Card
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {/* Reporting Time */}
                  <div className="bg-white/90 p-2.5 rounded-xl border border-indigo-100">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Reporting Time *
                    </label>
                    <input
                      type="text"
                      required
                      value={centerForm.reporting_time || '09:00 AM'}
                      onChange={(e) => setCenterForm({ ...centerForm, reporting_time: e.target.value })}
                      placeholder="e.g. 09:00 AM"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-indigo-200 font-bold text-indigo-900 bg-white text-xs"
                    />
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      {['08:30 AM', '09:00 AM', '09:15 AM', '01:00 PM'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setCenterForm({ ...centerForm, reporting_time: t })}
                          className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold transition-all ${
                            centerForm.reporting_time === t
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Exam Start Time */}
                  <div className="bg-white/90 p-2.5 rounded-xl border border-indigo-100">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Exam Start Time *
                    </label>
                    <input
                      type="text"
                      required
                      value={centerForm.exam_start_time || '10:00 AM'}
                      onChange={(e) => setCenterForm({ ...centerForm, exam_start_time: e.target.value })}
                      placeholder="e.g. 10:00 AM"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-indigo-200 font-bold text-indigo-900 bg-white text-xs"
                    />
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      {['09:30 AM', '10:00 AM', '10:30 AM', '02:00 PM'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setCenterForm({ ...centerForm, exam_start_time: t })}
                          className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold transition-all ${
                            centerForm.exam_start_time === t
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Exam End Time */}
                  <div className="bg-white/90 p-2.5 rounded-xl border border-indigo-100">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Exam End Time *
                    </label>
                    <input
                      type="text"
                      required
                      value={centerForm.exam_end_time || '12:00 PM'}
                      onChange={(e) => setCenterForm({ ...centerForm, exam_end_time: e.target.value })}
                      placeholder="e.g. 12:00 PM"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-indigo-200 font-bold text-indigo-900 bg-white text-xs"
                    />
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      {['11:30 AM', '12:00 PM', '12:30 PM', '04:00 PM'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setCenterForm({ ...centerForm, exam_end_time: t })}
                          className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold transition-all ${
                            centerForm.exam_end_time === t
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Shift Selection & Live Output Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Session / Shift</label>
                    <select
                      value={centerForm.exam_shift || 'Shift 1 (Morning Session)'}
                      onChange={(e) => setCenterForm({ ...centerForm, exam_shift: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white font-medium text-gray-800 text-xs"
                    >
                      <option value="Shift 1 (Morning Session)">Shift 1 (Morning Session)</option>
                      <option value="Shift 2 (Afternoon Session)">Shift 2 (Afternoon Session)</option>
                      <option value="Shift 3 (Evening Session)">Shift 3 (Evening Session)</option>
                      <option value="General Single Session">General Single Session</option>
                    </select>
                  </div>

                  <div className="bg-indigo-950 text-white p-2.5 sm:p-3 rounded-xl flex flex-col justify-center text-[11px] border border-indigo-800">
                    <span className="text-[10px] text-indigo-300 font-bold uppercase flex items-center gap-1">
                      <FiCheck size={11} className="text-emerald-400" /> Admit Card Slot Preview:
                    </span>
                    <span className="font-mono font-bold mt-0.5 text-amber-300 text-xs break-words">
                      {centerForm.exam_start_time || '10:00 AM'} - {centerForm.exam_end_time || '12:00 PM'} (Rep: {centerForm.reporting_time || '09:00 AM'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Superintendent / Contact Details */}
              <div className="p-3 sm:p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2.5">
                <span className="font-bold text-purple-900 block text-[11px] uppercase tracking-wider">
                  Center Superintendent & Logistics Coordinator
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-semibold text-gray-600 mb-0.5">Coordinator Name</label>
                    <input
                      type="text"
                      value={centerForm.contact_person || ''}
                      onChange={(e) => setCenterForm({ ...centerForm, contact_person: e.target.value })}
                      placeholder="e.g. Dr. Rajesh Verma"
                      className="w-full px-3 py-1.5 rounded-xl border border-purple-200 bg-white text-gray-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-semibold text-gray-600 mb-0.5">Contact Phone</label>
                    <input
                      type="text"
                      value={centerForm.contact_phone || ''}
                      onChange={(e) => setCenterForm({ ...centerForm, contact_phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3 py-1.5 rounded-xl border border-purple-200 bg-white text-gray-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-semibold text-gray-600 mb-0.5">Contact Email</label>
                    <input
                      type="email"
                      value={centerForm.contact_email || ''}
                      onChange={(e) => setCenterForm({ ...centerForm, contact_email: e.target.value })}
                      placeholder="e.g. center@school.edu"
                      className="w-full px-3 py-1.5 rounded-xl border border-purple-200 bg-white text-gray-800 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-3 pb-1 -mx-1 px-1 border-t border-gray-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 z-10">
                <button
                  type="button"
                  onClick={() => setShowCenterModal(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 border border-gray-200 text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <FiCheck size={14} />
                  <span>{actionLoading ? 'Saving Center...' : editingCenter ? 'Update Center Details' : 'Create Exam Center'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ADMIT CARD PREVIEW MODAL */}
      {mounted && previewAdmitCard && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          style={{
            backgroundColor: 'rgba(5, 8, 20, 0.88)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
          }}
        >
          <div className="bg-white sm:rounded-3xl rounded-2xl max-w-xl w-full p-5 sm:p-8 shadow-2xl border border-gray-200 space-y-6 relative max-h-[94vh] overflow-y-auto">
            <button
              onClick={() => setPreviewAdmitCard(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <FiXCircle size={22} />
            </button>

            {/* Official Hall Ticket Print Layout */}
            <div>
              {/* Embedded Print Stylesheet */}
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  html, body {
                    background: #fff !important;
                    color: #000 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    height: auto !important;
                    overflow: visible !important;
                  }
                  body * {
                    visibility: hidden !important;
                  }
                  #printable-hall-ticket, #printable-hall-ticket * {
                    visibility: visible !important;
                  }
                  #printable-hall-ticket {
                    position: fixed !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 0 !important;
                    padding: 20px 24px !important;
                    border: 3px double #000 !important;
                    border-radius: 12px !important;
                    background: #fff !important;
                    box-shadow: none !important;
                    z-index: 999999 !important;
                    page-break-after: avoid !important;
                    page-break-inside: avoid !important;
                  }
                  .no-print, .no-print * {
                    display: none !important;
                    visibility: hidden !important;
                  }
                  @page {
                    size: A4 portrait;
                    margin: 10mm 12mm;
                  }
                }
              `}} />

              <div id="printable-hall-ticket" className="border-4 border-double border-gray-800 p-6 rounded-2xl space-y-5 bg-amber-50/10">
                <div className="text-center border-b-2 border-gray-800 pb-3 space-y-1">
                  <div className="font-mono text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    GRAVITY NATIONAL SCHOLARSHIP BOARD
                  </div>
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                    Official Examination Admit Card (Hall Ticket)
                  </h2>
                  <p className="text-xs font-bold text-[#FF2D8D]">{previewAdmitCard.scholarship_title}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="col-span-2 space-y-1.5">
                    <div>
                      <span className="text-gray-400">Candidate Name: </span>
                      <strong className="text-gray-900 uppercase">{previewAdmitCard.applicant_name}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400">Application Number: </span>
                      <strong className="font-mono">{previewAdmitCard.application_no}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400">Roll Number: </span>
                      <strong className="font-mono text-emerald-700 font-black text-sm">
                        {previewAdmitCard.roll_number || 'GRAVITY-26-0041'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-400">Security Reg Code: </span>
                      <strong className="font-mono text-purple-700">{previewAdmitCard.registration_code}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400">District Preferences: </span>
                      <span className="text-gray-700 font-medium">
                        1st: {previewAdmitCard.preference_district_1 || 'N/A'} | 2nd: {previewAdmitCard.preference_district_2 || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Candidate Photo Box */}
                  <div className="w-24 h-32 border-2 border-gray-800 rounded-xl bg-gray-100 overflow-hidden flex flex-col items-center justify-center text-[10px] text-gray-400 text-center p-0.5 shadow-sm">
                    <img
                      src={previewAdmitCard.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face'}
                      alt={previewAdmitCard.applicant_name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                </div>

                {/* Allotted Examination Venue & Address Box */}
                <div className="p-3.5 bg-gray-100/90 rounded-xl border border-gray-300 space-y-1.5 text-xs">
                  <div>
                    <span className="text-gray-500 font-bold block text-[10px] uppercase">Allotted Physical Examination Center:</span>
                    <span className="text-gray-950 font-black text-sm">
                      {previewAdmitCard.assigned_center_name || previewAdmitCard.exam_center || 'National Proctored Online Assessment Hub'}
                    </span>
                    {previewAdmitCard.assigned_center_code && (
                      <span className="ml-2 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                        Code: {previewAdmitCard.assigned_center_code}
                      </span>
                    )}
                  </div>
                  {previewAdmitCard.assigned_center_address && (
                    <div className="text-gray-700 text-[11px] leading-relaxed">
                      <strong>Address:</strong> {previewAdmitCard.assigned_center_address}
                    </div>
                  )}
                  {previewAdmitCard.assigned_center_landmark && (
                    <div className="text-gray-500 text-[10px]">
                      <strong>Landmark:</strong> {previewAdmitCard.assigned_center_landmark}
                    </div>
                  )}
                  {previewAdmitCard.assigned_center_maps_url && (
                    <div className="no-print pt-0.5">
                      <a
                        href={previewAdmitCard.assigned_center_maps_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        <FiNavigation size={11} /> Open Google Maps Directions
                      </a>
                    </div>
                  )}
                  <div className="pt-1 border-t border-gray-200">
                    <span className="text-gray-500 font-bold">Exam Timing: </span>
                    <span className="text-gray-900 font-semibold">{previewAdmitCard.exam_slot || '2026-09-20 | 10:00 AM - 12:30 PM (Reporting: 09:15 AM)'}</span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-1 text-[11px] text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="font-bold text-gray-800 uppercase text-[10px]">Mandatory Exam Guidelines:</div>
                  <div>1. Candidate must carry a printed hardcopy of this Admit Card along with an original Photo ID proof.</div>
                  <div>2. Reach the examination center at least 45 minutes prior to the test slot for biometric verification.</div>
                  <div>3. Electronic gadgets, smartwatches, and unauthorized materials are strictly prohibited.</div>
                </div>

                {/* Barcode & Signature */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 text-xs">
                  <div className="font-mono text-[10px] tracking-widest text-gray-600 bg-gray-100 px-3 py-1.5 rounded border border-gray-300">
                    ||||| | |||| || ||||| | |||||
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800 text-[11px] underline">Controller of Examinations</div>
                    <div className="text-[10px] text-gray-400">Digitally Verified & Stamped</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 no-print">
              <button
                type="button"
                onClick={() => setPreviewAdmitCard(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] shadow-md flex items-center gap-1.5"
              >
                <FiDownload /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* CENTER-WISE CANDIDATE VERIFICATION ROSTER & ATTENDANCE DECK MODAL */}
      {mounted && showRosterModal && createPortal(
        <div
          id="center-roster-modal-wrapper"
          className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          style={{
            backgroundColor: 'rgba(5, 8, 20, 0.88)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
          }}
        >
          <div className="bg-slate-100 rounded-2xl sm:rounded-3xl max-w-6xl w-full p-2.5 sm:p-6 shadow-2xl border border-gray-300 space-y-2.5 sm:space-y-4 relative max-h-[92vh] sm:max-h-[94vh] flex flex-col overflow-hidden">
            {/* Modal Header Toolbar (no-print) */}
            <div className="no-print bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 shadow-xs sm:shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-purple-100 text-purple-700 shrink-0">
                      <FiFileText size={16} />
                    </span>
                    <h3 className="text-sm sm:text-lg font-black text-gray-900 leading-tight">
                      Centre-Wise Candidate Verification & Nominal Roll PDF
                    </h3>
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed max-w-2xl">
                    Student nominal rolls per examination center with Roll Number, Reg Code, App No., and Signatures.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRosterModal(false)}
                  className="w-8 h-8 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex md:hidden items-center justify-center shrink-0"
                  title="Close Modal"
                >
                  <FiXCircle size={20} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <FiPrinter size={14} />
                  <span>🖨️ Print / Save PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowRosterModal(false)}
                  className="hidden md:flex p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  title="Close Modal"
                >
                  <FiXCircle size={22} />
                </button>
              </div>
            </div>

            {/* Filter Bar (no-print) */}
            <div className="no-print bg-white p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-gray-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 sm:gap-3 text-xs shrink-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full lg:w-auto">
                {/* Center Filter */}
                <div className="space-y-1">
                  <label className="block text-[10px] sm:text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                    Exam Center:
                  </label>
                  <select
                    value={rosterSelectedCenterId}
                    onChange={(e) => setRosterSelectedCenterId(e.target.value)}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-purple-200 font-bold text-purple-900 bg-purple-50/60 focus:ring-2 focus:ring-purple-400 text-xs truncate"
                  >
                    <option value="all">🏢 All Exam Centers ({centers.length} Centers)</option>
                    {centers.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.center_code}] {c.center_name} ({c.district}) [{c.allocated_count || 0} Students]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Scheme Filter */}
                <div className="space-y-1">
                  <label className="block text-[10px] sm:text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                    Scholarship Scheme:
                  </label>
                  <select
                    value={rosterSelectedSchemeId}
                    onChange={(e) => setRosterSelectedSchemeId(e.target.value)}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-gray-200 font-semibold text-gray-800 bg-gray-50 focus:ring-2 focus:ring-[#FF2D8D]/20 text-xs truncate"
                  >
                    <option value="all">All Scholarship Schemes</option>
                    {scholarships.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 pt-1 lg:pt-0 border-t lg:border-t-0 border-gray-100 text-[11px]">
                {copiedRosterText && (
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg font-bold text-[10px] border border-emerald-200 animate-fade-in">
                    ✓ Summary Copied!
                  </span>
                )}
                <span className="text-gray-500 font-medium">
                  Showing <strong className="text-gray-900">{centerRosterGroups.reduce((acc, g) => acc + g.students.length, 0)}</strong> Candidates in <strong className="text-gray-900">{centerRosterGroups.length}</strong> Center(s)
                </span>
              </div>
            </div>

            {/* Scrollable Printable Document Container */}
            <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 pr-1">
              {/* Embedded Print Stylesheet */}
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  @page {
                    size: A4 portrait;
                    margin: 8mm 8mm 8mm 8mm;
                  }
                  html, body {
                    background: #fff !important;
                    color: #000 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    height: auto !important;
                    width: 100% !important;
                    overflow: visible !important;
                  }
                  body > *:not(#center-roster-modal-wrapper) {
                    display: none !important;
                  }
                  #center-roster-modal-wrapper {
                    position: static !important;
                    display: block !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    background: #fff !important;
                    overflow: visible !important;
                    inset: auto !important;
                    z-index: 999999 !important;
                  }
                  #center-roster-modal-wrapper > div {
                    position: static !important;
                    background: #fff !important;
                    box-shadow: none !important;
                    border: none !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    max-width: 100% !important;
                    width: 100% !important;
                    max-height: none !important;
                    overflow: visible !important;
                    border-radius: 0 !important;
                  }
                  .no-print, .no-print * {
                    display: none !important;
                    visibility: hidden !important;
                  }
                  #printable-center-roster-deck {
                    display: block !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    position: static !important;
                  }
                  .center-roster-sheet {
                    page-break-after: always !important;
                    break-after: page !important;
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                    margin: 0 0 10mm 0 !important;
                    padding: 6mm 8mm !important;
                    border: 2px solid #000 !important;
                    border-radius: 6px !important;
                    background: #fff !important;
                    box-shadow: none !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                  }
                  .screen-only-mobile-roster {
                    display: none !important;
                  }
                  .print-table-view {
                    display: block !important;
                  }
                  table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                  }
                  th, td {
                    border: 1px solid #000 !important;
                    padding: 3px 5px !important;
                  }
                }
              `}} />

              <div id="printable-center-roster-deck" className="space-y-4 sm:space-y-8">
                {centerRosterGroups.length === 0 ? (
                  <div className="p-8 sm:p-12 text-center bg-white rounded-2xl sm:rounded-3xl border border-gray-200 text-gray-400 space-y-2">
                    <FiMapPin size={36} className="mx-auto text-gray-300" />
                    <h4 className="text-sm sm:text-base font-bold text-gray-700">No Candidates Allocated to Centers Yet</h4>
                    <p className="text-xs max-w-md mx-auto">
                      Use the "⚡ Auto-Allocate Centers" feature in Tab 4 to allocate students to their nearest examination centers first.
                    </p>
                  </div>
                ) : (
                  centerRosterGroups.map((group) => (
                    <div
                      key={group.centerId}
                      className="center-roster-sheet bg-white p-3.5 sm:p-7 rounded-xl sm:rounded-2xl border border-gray-300 sm:border-2 sm:border-gray-900 shadow-md space-y-3 sm:space-y-4"
                    >
                      {/* Center Header with Action Toolbar (Toolbar hidden in print) */}
                      <div className="space-y-2">
                        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
                          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 self-start sm:self-center">
                            Center Code: {group.centerCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyRosterEmailText(group)}
                            className="w-full sm:w-auto px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-[11px] rounded-xl border border-gray-300 transition-colors flex items-center justify-center gap-1.5"
                            title="Copy formatted text to email or message the Center Superintendent"
                          >
                            <FiCopy size={12} />
                            <span>📋 Copy Center Email Summary</span>
                          </button>
                        </div>

                        {/* Official Institutional Letterhead */}
                        <div className="text-center border-b-2 border-gray-900 pb-2 space-y-0.5">
                          <div className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest text-gray-600 uppercase">
                            GRAVITY & FOUNDATION — NATIONAL SCHOLARSHIP BOARD
                          </div>
                          <h2 className="text-base sm:text-xl font-black text-gray-950 uppercase tracking-tight">
                            Official Candidate Examination & Verification Nominal Roll
                          </h2>
                          <div className="text-[10px] sm:text-[11px] font-bold text-[#C81E4E] uppercase tracking-wider">
                            Center Verification & Attendance Master Copy • 2026 Examination
                          </div>
                        </div>

                        {/* Center & In-Charge Details Box */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 rounded-xl border border-gray-400 text-xs">
                          <div className="space-y-0.5">
                            <div>
                              <span className="text-gray-600 font-semibold text-[10px] sm:text-[11px]">Allocated Center: </span>
                              <strong className="text-gray-950 font-black text-xs sm:text-sm">
                                [{group.centerCode}] {group.centerName}
                              </strong>
                            </div>
                            <div className="text-[10px] sm:text-[11px]">
                              <span className="text-gray-600 font-semibold">Venue Address: </span>
                              <span className="text-gray-800">
                                {group.address}, {group.city}, {group.district}, {group.state}
                              </span>
                            </div>
                            {group.landmark && (
                              <div className="text-[9px] sm:text-[10px] text-gray-600">
                                <strong>Landmark:</strong> {group.landmark}
                              </div>
                            )}
                          </div>

                          <div className="space-y-0.5 md:text-right text-[10px] sm:text-[11px]">
                            <div>
                              <span className="text-gray-600 font-semibold">Superintendent: </span>
                              <strong className="text-gray-900">
                                {group.contactPerson} {group.contactPhone ? `(${group.contactPhone})` : ''}
                              </strong>
                            </div>
                            <div>
                              <span className="text-gray-600 font-semibold">Candidate Strength: </span>
                              <span className="font-mono font-black text-purple-900 bg-purple-100 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px]">
                                {group.students.length} Candidates
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 font-semibold">Exam Timing / Slot: </span>
                              <span className="text-gray-900 font-bold">
                                {group.students[0]?.exam_slot || '10:00 AM - 12:00 PM (Reporting: 09:15 AM)'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Screen View (Mobile Cards): Visible only on screen for small viewports */}
                      <div className="screen-only-mobile-roster block sm:hidden space-y-2.5">
                        {group.students.map((st, idx) => (
                          <div key={st.id} className="p-3 bg-gray-50/80 rounded-xl border border-gray-300 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="font-mono font-bold text-gray-500 text-xs w-5 shrink-0">
                                  #{(idx + 1).toString().padStart(2, '0')}
                                </span>
                                <div className="w-9 h-11 rounded border border-gray-300 overflow-hidden bg-white shrink-0">
                                  <img
                                    src={st.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=120&fit=crop&crop=face'}
                                    alt={st.applicant_name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-black text-gray-950 text-xs truncate uppercase">{st.applicant_name}</div>
                                  {st.father_name && <div className="text-[10px] text-gray-500 truncate">F: {st.father_name}</div>}
                                  <div className="text-[10px] text-purple-700 font-semibold">{st.qualification || 'Class 6-10'}</div>
                                </div>
                              </div>
                              <span className="font-mono font-black text-[11px] text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-300 shrink-0">
                                {st.roll_number || 'PENDING'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono bg-white p-2 rounded-lg border border-gray-200">
                              <div>
                                <span className="text-gray-400 block text-[9px]">Reg Code:</span>
                                <strong className="text-purple-800">{st.registration_code}</strong>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[9px]">App No:</span>
                                <strong className="text-gray-800">{st.application_no}</strong>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Printable & Desktop Table */}
                      <div className="print-table-view hidden sm:block overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-900 text-left text-xs min-w-[650px]">
                          <thead>
                            <tr className="bg-gray-100 text-gray-950 font-black uppercase text-[9px] border-b-2 border-gray-900">
                              <th className="p-1.5 border border-gray-900 text-center w-7">Sr.</th>
                              <th className="p-1.5 border border-gray-900 w-12 text-center">Photo</th>
                              <th className="p-1.5 border border-gray-900">Student Name</th>
                              <th className="p-1.5 border border-gray-900">Official Roll No.</th>
                              <th className="p-1.5 border border-gray-900">Security Reg Code</th>
                              <th className="p-1.5 border border-gray-900">Application No.</th>
                              <th className="p-1.5 border border-gray-900">Class</th>
                              <th className="p-1.5 border border-gray-900 w-28 text-center">Candidate Signature (Entry)</th>
                              <th className="p-1.5 border border-gray-900 w-16 text-center">Invigilator</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.students.map((st, idx) => (
                              <tr key={st.id} className="border-b border-gray-800">
                                <td className="p-1.5 border border-gray-900 text-center font-mono font-bold text-gray-700 text-[10px]">
                                  {(idx + 1).toString().padStart(2, '0')}
                                </td>
                                <td className="p-1 border border-gray-900 text-center">
                                  <div className="w-8 h-10 mx-auto rounded border border-gray-400 overflow-hidden bg-gray-100">
                                    <img
                                      src={
                                        st.photo_url ||
                                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=120&fit=crop&crop=face'
                                      }
                                      alt={st.applicant_name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </td>
                                <td className="p-1.5 border border-gray-900 font-bold text-gray-950 uppercase text-[10px]">
                                  {st.applicant_name}
                                  {st.father_name && (
                                    <div className="text-[9px] font-normal text-gray-500">
                                      F: {st.father_name}
                                    </div>
                                  )}
                                </td>
                                <td className="p-1.5 border border-gray-900 font-mono font-black text-gray-950 text-[11px]">
                                  {st.roll_number || 'PENDING ALLOT'}
                                </td>
                                <td className="p-1.5 border border-gray-900 font-mono font-bold text-purple-900 text-[10px]">
                                  {st.registration_code}
                                </td>
                                <td className="p-1.5 border border-gray-900 font-mono text-gray-800 text-[10px]">
                                  {st.application_no}
                                </td>
                                <td className="p-1.5 border border-gray-900 font-semibold text-gray-800 text-[10px]">
                                  {st.qualification || 'Class 6th-10th'}
                                </td>
                                <td className="p-1 border border-gray-900 text-center">
                                  <div className="h-8 border border-dashed border-gray-400 rounded bg-gray-50/40 flex items-center justify-center text-[8px] text-gray-400 italic">
                                    Sign Here
                                  </div>
                                </td>
                                <td className="p-1 border border-gray-900 text-center">
                                  <div className="h-8 border border-gray-300 rounded bg-gray-50/40 flex items-center justify-center text-[8px] text-gray-400">
                                    [ &nbsp; ]
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Center Superintendent Certification Footer */}
                      <div className="pt-3 border-t-2 border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-[10px]">
                        <div className="space-y-0.5 text-gray-700 text-center sm:text-left">
                          <div>
                            <strong>Total Candidates on Roster:</strong> {group.students.length}
                          </div>
                          <div>
                            <strong>Total Present:</strong> _______ &nbsp;&nbsp;&nbsp;&nbsp;{' '}
                            <strong>Total Absent:</strong> _______
                          </div>
                        </div>

                        <div className="text-center sm:text-right space-y-0.5">
                          <div className="w-52 border-b border-gray-900 pb-0.5 font-bold text-gray-950 text-center">
                            Center Superintendent Seal & Signature
                          </div>
                          <div className="text-[9px] text-gray-500 text-center">
                            Date: ________________________
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Bottom Footer Toolbar (no-print) */}
            <div className="no-print bg-white p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
              <div className="text-[10px] sm:text-xs text-gray-500 leading-tight">
                💡 Tip: Click <strong>"Print / Save PDF"</strong> and select <strong>"Save as PDF"</strong> in browser print dialog.
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowRosterModal(false)}
                  className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 text-center"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] shadow-md flex items-center justify-center gap-1.5 text-center whitespace-nowrap"
                >
                  <FiPrinter size={13} />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* PRODUCTION BULK EXAMINATION MARKS EVALUATION & AUTO-RANK MODAL */}
      {mounted && showBulkMarksModal && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
          style={{
            backgroundColor: 'rgba(5, 8, 20, 0.88)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
          }}
        >
          <div className="bg-white sm:rounded-3xl rounded-2xl max-w-5xl w-full p-4 sm:p-6 md:p-8 shadow-2xl border border-gray-100 space-y-5 max-h-[94vh] overflow-y-auto flex flex-col justify-between">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#FF2D8D] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-pink-50 border border-pink-100">
                    High-Throughput Scoring Engine
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
                    1000+ Scalable
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FiUploadCloud className="text-[#9C27FF]" />
                  <span>Bulk Marks Evaluation & Automated Merit Builder</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Import examiner sheets via CSV/Excel or direct copy-paste. System pre-validates roll numbers, prevents out-of-bounds scores, and calculates merit ranks instantly.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowBulkMarksModal(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
              >
                <FiXCircle size={22} />
              </button>
            </div>

            {/* Config Toolbar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 bg-gray-50/80 rounded-2xl border border-gray-200/80 text-xs">
              <div className="sm:col-span-6">
                <label className="block font-bold text-gray-700 mb-1">Target Scholarship Scheme *</label>
                <select
                  value={bulkUploadSchemeId}
                  onChange={(e) => {
                    const sid = e.target.value
                    setBulkUploadSchemeId(sid)
                    const sc = scholarships.find((s) => s.id === sid)
                    if (sc?.total_questions) setBulkMaxMarks(sc.total_questions)
                    if (bulkParsedRows.length > 0 && bulkPastedText) {
                      handleParseBulkMarks(bulkPastedText, sid)
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-bold text-gray-800"
                >
                  <option value="all">🏆 All Scholarship Schemes ({applicants.length} registered)</option>
                  {scholarships.map((s) => {
                    const cnt = applicants.filter((a) => a.scholarship_id === s.id).length
                    return (
                      <option key={s.id} value={s.id}>
                        {s.title} ({cnt} Candidates)
                      </option>
                    )
                  })}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold text-gray-700 mb-1">Maximum Marks (100%)</label>
                <input
                  type="number"
                  min={10}
                  value={bulkMaxMarks}
                  onChange={(e) => setBulkMaxMarks(Number(e.target.value) || 100)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-black text-gray-900"
                />
              </div>

              <div className="sm:col-span-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadEvaluationSheet(bulkUploadSchemeId)}
                  className="flex-1 py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 text-[11px]"
                >
                  <FiDownload size={13} />
                  <span>Download Excel (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopySpreadsheetData(bulkUploadSchemeId)}
                  className={`flex-1 py-2 px-2.5 font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 text-[11px] ${
                    copiedExcelData
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200'
                  }`}
                >
                  {copiedExcelData ? <FiCheck size={13} /> : <FiCopy size={13} />}
                  <span>{copiedExcelData ? 'Copied Data!' : 'Copy for Google Sheets'}</span>
                </button>
              </div>
            </div>

            {/* UPLOAD TABS: FILE vs PASTE */}
            <div className="space-y-3">
              <div className="flex border-b border-gray-200 gap-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setBulkUploadMode('file')}
                  className={`pb-2.5 transition-all flex items-center gap-2 border-b-2 ${
                    bulkUploadMode === 'file'
                      ? 'border-[#FF2D8D] text-[#FF2D8D]'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <FiFileText />
                  <span>Upload Excel Sheet (.xlsx / .xls / .csv)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBulkUploadMode('paste')}
                  className={`pb-2.5 transition-all flex items-center gap-2 border-b-2 ${
                    bulkUploadMode === 'paste'
                      ? 'border-[#FF2D8D] text-[#FF2D8D]'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <FiCopy />
                  <span>Copy-Paste from Excel Grid</span>
                </button>
              </div>

              {bulkUploadMode === 'file' ? (
                <div className="p-6 border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/20 hover:bg-emerald-50/40 rounded-2xl text-center transition-all">
                  <FiUploadCloud size={38} className="mx-auto text-emerald-600 mb-2" />
                  <div className="text-sm font-bold text-gray-800">
                    Upload Filled Excel Sheet (.xlsx / .xls / .csv)
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 mb-3">
                    Supported: <strong>Microsoft Excel (.xlsx, .xls)</strong> and CSV format. All student marks and attendance will be mapped automatically.
                  </p>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all">
                    <FiUpload /> Browse Excel File (.xlsx)
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                      onChange={handleFileUploadMarks}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    rows={4}
                    value={bulkPastedText}
                    onChange={(e) => setBulkPastedText(e.target.value)}
                    placeholder="Paste copied rows directly from Excel or Google Sheets here (e.g. Roll_No \t Obtained_Marks \t Attendance)..."
                    className="w-full p-3 rounded-2xl border border-gray-200 text-xs font-mono bg-gray-50/50 focus:bg-white"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleParseBulkMarks(bulkPastedText, bulkUploadSchemeId)}
                      disabled={!bulkPastedText.trim()}
                      className="px-4 py-2 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-black transition-all disabled:opacity-50"
                    >
                      Parse & Validate Pasted Rows
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* LIVE PREVIEW & VALIDATION REPORT */}
            {bulkParsedRows.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                {(() => {
                  const validRows = bulkParsedRows.filter((r) => r.isValid)
                  const absentRows = bulkParsedRows.filter((r) => r.isAbsent)
                  const errorRows = bulkParsedRows.filter((r) => !r.isValid)

                  const displayRows = bulkParsedRows.filter((r) => {
                    if (bulkFilterValidation === 'valid') return r.isValid
                    if (bulkFilterValidation === 'errors') return !r.isValid
                    if (bulkFilterValidation === 'absent') return r.isAbsent
                    return true
                  })

                  return (
                    <>
                      {/* Summary Metrics Banner */}
                      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-purple-50/60 rounded-2xl border border-purple-100 text-xs">
                        <div className="flex flex-wrap items-center gap-2 font-bold">
                          <span className="text-gray-700">Scanned: <strong>{bulkParsedRows.length}</strong></span>
                          <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-lg border border-emerald-200">
                            ✅ {validRows.length} Valid to Score
                          </span>
                          <span className="text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-lg border border-amber-200">
                            ⚠️ {absentRows.length} Absent
                          </span>
                          {errorRows.length > 0 && (
                            <span className="text-red-700 bg-red-100/80 px-2 py-0.5 rounded-lg border border-red-200 animate-pulse">
                              ❌ {errorRows.length} Errors Found
                            </span>
                          )}
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200">
                          {[
                            { id: 'all', label: `All (${bulkParsedRows.length})` },
                            { id: 'valid', label: `Valid (${validRows.length})` },
                            { id: 'errors', label: `Errors (${errorRows.length})` },
                            { id: 'absent', label: `Absent (${absentRows.length})` },
                          ].map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setBulkFilterValidation(f.id as any)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                bulkFilterValidation === f.id
                                  ? 'bg-purple-600 text-white shadow-xs'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Preview Table */}
                      <div className="max-h-60 overflow-y-auto rounded-2xl border border-gray-200">
                        <table className="w-full text-left text-xs text-gray-700">
                          <thead className="bg-gray-100 text-[10px] uppercase font-bold text-gray-600 sticky top-0 border-b border-gray-200">
                            <tr>
                              <th className="p-2.5 text-center w-12">Row</th>
                              <th className="p-2.5">Roll Number</th>
                              <th className="p-2.5">Candidate Name</th>
                              <th className="p-2.5 text-center">Score (/{bulkMaxMarks})</th>
                              <th className="p-2.5 text-center">Attendance</th>
                              <th className="p-2.5">Validation Status</th>
                              <th className="p-2.5 text-right">Quick Edit</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 font-medium">
                            {displayRows.map((row) => (
                              <tr
                                key={row.rowNum}
                                className={!row.isValid ? 'bg-red-50/60' : row.isAbsent ? 'bg-amber-50/40' : 'hover:bg-gray-50'}
                              >
                                <td className="p-2.5 text-center font-mono text-gray-400 text-[11px]">
                                  {row.rowNum}
                                </td>
                                <td className="p-2.5 font-mono font-bold text-gray-900">
                                  {row.roll_number}
                                </td>
                                <td className="p-2.5">
                                  <div className="font-bold text-gray-900">{row.applicant_name}</div>
                                  <div className="text-[10px] text-gray-400 font-mono">{row.application_no}</div>
                                </td>
                                <td className="p-2.5 text-center">
                                  {row.isAbsent ? (
                                    <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                                      ABSENT
                                    </span>
                                  ) : (
                                    <span className="font-black text-purple-700 text-sm">
                                      {row.marks}
                                    </span>
                                  )}
                                </td>
                                <td className="p-2.5 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                    row.isAbsent ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {row.attendance}
                                  </span>
                                </td>
                                <td className="p-2.5">
                                  {row.isValid ? (
                                    <span className="text-emerald-700 text-[11px] font-bold flex items-center gap-1">
                                      <FiCheckCircle /> Match Verified
                                    </span>
                                  ) : (
                                    <span className="text-red-700 text-[11px] font-bold flex items-center gap-1">
                                      <FiAlertCircle /> {row.error}
                                    </span>
                                  )}
                                </td>
                                <td className="p-2.5 text-right">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newMarks = prompt(`Update marks for ${row.applicant_name} (Enter number or 'ABSENT'):`, row.marks)
                                      if (newMarks !== null) {
                                        const isAbs = newMarks.toUpperCase().includes('ABS') || newMarks.toUpperCase() === 'AB'
                                        const num = parseFloat(newMarks)
                                        const updatedRows = bulkParsedRows.map((r) => {
                                          if (r.rowNum === row.rowNum) {
                                            const validMarks = !isAbs && !isNaN(num) && num >= 0 && num <= bulkMaxMarks
                                            return {
                                              ...r,
                                              isAbsent: isAbs,
                                              attendance: isAbs ? 'ABSENT' : 'PRESENT',
                                              marks: isAbs ? 'ABSENT' : (validMarks ? String(num) : newMarks),
                                              rawMarksNum: validMarks ? num : (isAbs ? 0 : null),
                                              isValid: isAbs || (validMarks && !!r.matchedApplicant),
                                              error: isAbs || validMarks ? null : 'Invalid score format',
                                            }
                                          }
                                          return r
                                        })
                                        setBulkParsedRows(updatedRows)
                                      }
                                    }}
                                    className="px-2.5 py-1 text-[11px] font-bold text-gray-700 hover:text-purple-700 bg-white hover:bg-purple-50 rounded-lg border border-gray-200"
                                  >
                                    Edit
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )
                })()}
              </div>
            )}

            {/* Modal Footer Controls */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Tip: After submitting, candidate scores will be saved in <strong>Draft State</strong>. You can preview rankings before releasing live.
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowBulkMarksModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 border border-gray-200"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleExecuteBulkEvaluation}
                  disabled={bulkSubmitting || bulkParsedRows.filter((r) => r.isValid).length === 0}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <FiZap size={14} />
                  {bulkSubmitting
                    ? 'Processing & Computing Ranks...'
                    : `Commit & Build Merit List (${bulkParsedRows.filter((r) => r.isValid).length} Scored)`}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* SINGLE CANDIDATE SCORE & MERIT STATUS MODAL */}
      {mounted && showMarksModal && evaluatingApplicant && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          style={{
            backgroundColor: 'rgba(5, 8, 20, 0.88)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
          }}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#FF2D8D] uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-50 border border-pink-100">
                    Candidate Evaluation
                  </span>
                  <span className="text-[10px] font-bold text-purple-800 uppercase px-2 py-0.5 rounded-full bg-purple-50 border border-purple-100">
                    Score & Merit Override
                  </span>
                </div>
                <h3 className="text-lg font-black text-gray-900">
                  {evaluatingApplicant.exam_marks != null ? 'Edit Examination Score' : 'Enter Examination Score'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowMarksModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiXCircle size={20} />
              </button>
            </div>

            {/* Candidate Summary Card */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-center gap-3 text-xs">
              <div className="w-12 h-14 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 shrink-0">
                <img
                  src={evaluatingApplicant.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face'}
                  alt={evaluatingApplicant.applicant_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="font-extrabold text-gray-950 text-sm truncate">{evaluatingApplicant.applicant_name}</div>
                <div className="text-[11px] font-mono text-purple-700 font-bold">
                  Roll: {evaluatingApplicant.roll_number || 'GRAVITY-26-XXXX'}
                </div>
                <div className="text-[10px] text-gray-500 truncate">
                  {evaluatingApplicant.scholarship_title} • {evaluatingApplicant.qualification || 'Class 10th'}
                </div>
              </div>
            </div>

            {/* Attendance Toggle */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">Attendance Status</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEnteredIsAbsent(false)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                    !enteredIsAbsent
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <FiCheckCircle size={14} className={!enteredIsAbsent ? 'text-emerald-600' : 'text-gray-400'} />
                  <span>PRESENT (Attended Exam)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEnteredIsAbsent(true)
                    setEnteredMeritStatus('not_qualified')
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                    enteredIsAbsent
                      ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <FiAlertCircle size={14} className={enteredIsAbsent ? 'text-amber-600' : 'text-gray-400'} />
                  <span>ABSENT (Did Not Appear)</span>
                </button>
              </div>
            </div>

            {/* Score Inputs (If Present) */}
            {!enteredIsAbsent ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Obtained Marks (Score) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={enteredTotalMarks || 100}
                    value={enteredMarks}
                    onChange={(e) => {
                      const val = e.target.value
                      setEnteredMarks(val)
                      const num = parseFloat(val)
                      if (!isNaN(num)) {
                        if (num >= (cutoffQualifiedMin || 60)) setEnteredMeritStatus('qualified')
                        else setEnteredMeritStatus('not_qualified')
                      }
                    }}
                    placeholder="e.g. 85"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-black text-gray-950 text-base focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Total Maximum Marks
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={enteredTotalMarks}
                    onChange={(e) => setEnteredTotalMarks(Number(e.target.value) || 100)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-bold text-gray-700 text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                ⚠️ Candidate is marked <strong>ABSENT</strong>. Score will be recorded as 0 and candidate will not receive merit rank.
              </div>
            )}

            {/* Merit Qualification Status Selection */}
            {!enteredIsAbsent && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Merit Qualification Status *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: 'qualified',
                      label: 'QUALIFIED',
                      sub: 'Scholarship Award',
                      activeCls: 'bg-emerald-600 text-white border-emerald-600 shadow-md',
                    },
                    {
                      id: 'not_qualified',
                      label: 'NOT QUALIFIED',
                      sub: 'Below Cut-off',
                      activeCls: 'bg-rose-600 text-white border-rose-600 shadow-md',
                    },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setEnteredMeritStatus(st.id as any)}
                      className={`p-2.5 rounded-xl text-center border transition-all ${
                        enteredMeritStatus === st.id
                          ? st.activeCls
                          : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      <div className="text-[11px] font-black">{st.label}</div>
                      <div className={`text-[9px] ${enteredMeritStatus === st.id ? 'opacity-90' : 'text-gray-400'}`}>
                        {st.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Examiner Remarks */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">Examiner Remarks / Notes</label>
              <input
                type="text"
                value={enteredRemarks}
                onChange={(e) => setEnteredRemarks(e.target.value)}
                placeholder="e.g. Paper verified by Senior Evaluator"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-800"
              />
            </div>

            {/* Modal Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowMarksModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 border border-gray-200 text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMarks}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <FiCheck size={14} />
                <span>{actionLoading ? 'Saving Score & Ranks...' : 'Save & Re-rank Candidate'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* GENERATE REFERENCE CODE MODAL */}
      {mounted && showRefCodeModal && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          style={{
            backgroundColor: 'rgba(5, 8, 20, 0.88)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
          }}
        >
          <div className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto">
            <div className="bg-gradient-to-r from-fuchsia-900 via-purple-900 to-slate-900 p-5 sm:p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg sm:text-xl tracking-tight flex items-center gap-2">
                  <FiShare2 className="text-fuchsia-400" />
                  <span>Generate Reference Code</span>
                </h3>
                <p className="text-gray-300 text-xs mt-0.5">
                  Issue a new referral code for a representative or partner
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRefCodeModal(false)}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleGenerateRefCode} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Representative Name *
                </label>
                <input
                  type="text"
                  required
                  value={refCodeForm.name}
                  onChange={(e) => setRefCodeForm({ ...refCodeForm, name: e.target.value })}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={refCodeForm.phone}
                    onChange={(e) => setRefCodeForm({ ...refCodeForm, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={refCodeForm.email}
                    onChange={(e) => setRefCodeForm({ ...refCodeForm, email: e.target.value })}
                    placeholder="e.g. agent@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Custom Code (Optional)
                </label>
                <input
                  type="text"
                  value={refCodeForm.code}
                  onChange={(e) => setRefCodeForm({ ...refCodeForm, code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '') })}
                  placeholder="Leave blank to auto-generate (e.g. REF-RAJESH-8392)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Only uppercase letters, numbers, and hyphens allowed.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Notes / Organization (Optional)
                </label>
                <textarea
                  rows={2}
                  value={refCodeForm.notes}
                  onChange={(e) => setRefCodeForm({ ...refCodeForm, notes: e.target.value })}
                  placeholder="e.g. Patna District Franchise Agent"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowRefCodeModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refCodeActionLoading === 'create'}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white font-extrabold text-xs shadow-md shadow-fuchsia-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <FiCheck size={14} />
                  <span>{refCodeActionLoading === 'create' ? 'Generating...' : 'Generate Code'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* VIEW REFERRED STUDENTS MODAL */}
      {mounted && showRefStudentsModal && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          style={{
            backgroundColor: 'rgba(5, 8, 20, 0.88)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
          }}
        >
          <div className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto max-h-[85vh] flex flex-col">
            <div className="bg-gradient-to-r from-purple-900 via-fuchsia-950 to-slate-900 p-5 text-white flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-xs bg-fuchsia-500/30 border border-fuchsia-400/40 text-fuchsia-200 px-2 py-0.5 rounded-md">
                    {showRefStudentsModal.code}
                  </span>
                  <span className="text-xs text-gray-300">({showRefStudentsModal.name})</span>
                </div>
                <h3 className="font-black text-lg text-white mt-1">
                  Referred Students ({showRefStudentsModal.referred_students?.length || showRefStudentsModal.students_count || 0})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRefStudentsModal(null)}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {showRefStudentsModal.referred_students && showRefStudentsModal.referred_students.length > 0 ? (
                <div className="space-y-3">
                  {showRefStudentsModal.referred_students.map((st) => (
                    <div key={st.id} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-fuchsia-50/20 transition-colors flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{st.applicant_name}</div>
                        <div className="text-gray-500 font-mono text-[11px] mt-0.5">App No: <strong className="text-gray-800">{st.application_no}</strong></div>
                        <div className="text-gray-400 text-[10px] mt-0.5">📞 {st.applicant_phone} | ✉️ {st.applicant_email}</div>
                        <div className="text-[#FF2D8D] font-bold text-[11px] mt-1">{st.scholarship_title}</div>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {st.status || 'Submitted'}
                        </span>
                        <div className="text-gray-400 text-[10px] font-mono block">
                          {new Date(st.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400 text-xs">
                  <FiUsers size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="font-bold text-gray-600 text-sm">No Students Applied Yet</p>
                  <p className="text-gray-400 text-xs mt-1">No candidate has registered using this reference code so far.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowRefStudentsModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
