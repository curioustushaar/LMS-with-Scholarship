'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getClientAuthToken } from '@/lib/auth-helpers'
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
} from 'react-icons/fi'

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
  }
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
  created_at: string
  
  // Admit Card
  admit_card_status: 'provisional' | 'approved' | 'released' | 'rejected'
  roll_number?: string
  exam_center?: string
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

  const [tab, setTab] = useState<'schemes' | 'applications' | 'admit_cards' | 'evaluation' | 'awards'>('schemes')
  const [scholarships, setScholarships] = useState<ScholarshipScheme[]>([])
  const [applicants, setApplicants] = useState<ScholarshipApplicant[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterScheme, setFilterScheme] = useState<string>('all')

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

  // Scheme Form State
  const [centerInput, setCenterInput] = useState('')
  const [docInput, setDocInput] = useState('')
  const [customQualInput, setCustomQualInput] = useState('')
  const [availableQualifications, setAvailableQualifications] = useState<string[]>([
    '10th',
    '12th (PCM)',
    '12th (PCB)',
    '12th (Commerce/Arts)',
    'Undergraduate',
    'Postgraduate',
    'Diploma / Polytechnic',
  ])
  const [schemeForm, setSchemeForm] = useState<Partial<ScholarshipScheme>>({
    title: '',
    category: 'Merit',
    description: '',
    eligibility_criteria: 'Minimum 75% aggregate in 12th / Undergraduate degrees',
    min_percentage: 75,
    eligible_qualifications: ['10th', '12th (PCM)', 'Undergraduate'],
    age_limit: '16 - 28 Years',
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
    },
    number_of_winners: 50,
    exam_date: '2026-09-20',
    exam_time: '10:00 AM - 12:00 PM',
    exam_duration: '120 Minutes',
    total_questions: 100,
    exam_mode: 'online',
    exam_venue: 'National Proctored Online Platform',
    exam_centers: [
      'National Proctored Online Assessment Hub',
      'Patna Center - Boring Road Campus',
      'Delhi NCR - Cyber Hub Test Lab'
    ],
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

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/superadmin/scholarships', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        if (data.data) setScholarships(data.data)
        if (data.applicants) setApplicants(data.applicants)
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
      },
      number_of_winners: 50,
      exam_date: '',
      exam_time: '10:00 AM - 12:00 PM',
      exam_duration: '120 Minutes',
      total_questions: 100,
      exam_mode: 'online',
      exam_venue: 'National Proctored Online Assessment Hub',
      exam_centers: ['National Proctored Online Assessment Hub'],
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
    setSchemeForm({
      ...scheme,
      prize_distribution: scheme.prize_distribution || {
        first_prize: '₹50,000',
        second_prize: '₹25,000',
        third_prize: '₹10,000',
        consolation: 'Certificate & 50% Fee Waiver',
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
        : (scheme.exam_venue ? [scheme.exam_venue] : ['National Proctored Online Assessment Hub']),
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
          setScholarships(scholarships.map((s) => (s.id === editingScheme.id ? { ...s, ...schemeForm } : s)))
        }
      } else {
        const res = await fetch('/api/superadmin/scholarships', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(schemeForm),
        })
        const data = await res.json()
        if (data.success && data.data) {
          setScholarships([data.data, ...scholarships])
        }
      }
      setShowSchemeModal(false)
    } catch (err) {
      console.error(err)
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
                  roll_number: a.roll_number || `AAGAJ-26-${Math.floor(1000 + Math.random() * 9000)}`,
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

  // Submit Exam Marks & Re-rank
  const handleSaveMarks = async () => {
    if (!evaluatingApplicant) return
    const marksNum = parseFloat(enteredMarks)
    if (isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
      alert('Please enter valid marks between 0 and 100.')
      return
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
          marks: marksNum,
          total_marks: 100,
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
    setVoucherCode(app.award_voucher_code || `AAGAJ-100-FREE-${app.application_no ? app.application_no.slice(-4) : '2026'}`)
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

  // Filtered applicants
  const filteredApplicants = applicants.filter((app) => {
    const matchScheme = filterScheme === 'all' || app.scholarship_id === filterScheme
    const matchQuery =
      !searchQuery.trim() ||
      app.applicant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.application_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.registration_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.roll_number && app.roll_number.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchScheme && matchQuery
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiAward className="text-[#C81E4E]" />
            Scholarships & Examination Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete institutional lifecycle from eligibility criteria, bulk admit card release to merit evaluation & prize disbursement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          {tab === 'schemes' && (
            <button
              onClick={handleOpenAddScheme}
              className="px-4 py-2 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2"
            >
              <FiPlus />
              Create Scholarship Scheme
            </button>
          )}
          {tab === 'admit_cards' && provisionalAdmitCards > 0 && (
            <button
              onClick={handleBulkApproveAdmitCards}
              disabled={actionLoading}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2 hover:shadow-lg animate-pulse"
            >
              <FiCheckSquare />
              ⚡ Bulk Approve All Admit Cards ({provisionalAdmitCards})
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Schemes</span>
            <FiAward className="text-[#FF2D8D]" />
          </div>
          <div className="text-2xl font-black text-gray-900">{totalSchemes}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Active Programs</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Applicants</span>
            <FiUsers className="text-[#9C27FF]" />
          </div>
          <div className="text-2xl font-black text-gray-900">{totalApps}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Verified Intake</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 bg-amber-50/30 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Provisional Cards</span>
            <FiClock className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-700">{provisionalAdmitCards}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-0.5">Awaiting Bulk Approval</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Hall Tickets</span>
            <FiCheckCircle className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{releasedAdmitCards}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Released to Students</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-pink-100 bg-pink-50/30 shadow-sm">
          <div className="flex items-center justify-between text-[#FF2D8D] mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Scholars Awarded</span>
            <FiTrendingUp className="text-[#FF2D8D]" />
          </div>
          <div className="text-2xl font-black text-[#FF2D8D]">{awardedScholars}</div>
          <div className="text-[11px] text-[#FF2D8D] font-semibold mt-0.5">Waiver & Cash Grants</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap border-b border-gray-200 gap-2 sm:gap-6">
        <button
          onClick={() => setTab('schemes')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            tab === 'schemes' ? 'text-[#C81E4E]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          1. Schemes & Policy Builder ({scholarships.length})
          {tab === 'schemes' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C81E4E]" />}
        </button>

        <button
          onClick={() => setTab('applications')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            tab === 'applications' ? 'text-[#C81E4E]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          2. Candidate Requests ({applicants.length})
          {tab === 'applications' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C81E4E]" />}
        </button>

        <button
          onClick={() => setTab('admit_cards')}
          className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-1.5 ${
            tab === 'admit_cards' ? 'text-[#C81E4E]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          3. Admit Card Desk & Bulk Approval
          {provisionalAdmitCards > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
              {provisionalAdmitCards} New
            </span>
          )}
          {tab === 'admit_cards' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C81E4E]" />}
        </button>

        <button
          onClick={() => setTab('evaluation')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            tab === 'evaluation' ? 'text-[#C81E4E]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          4. Exam Evaluation & Merit List
          {tab === 'evaluation' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C81E4E]" />}
        </button>

        <button
          onClick={() => setTab('awards')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            tab === 'awards' ? 'text-[#C81E4E]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          5. Document Verification & Awards ({awardedScholars})
          {tab === 'awards' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C81E4E]" />}
        </button>
      </div>

      {/* Global Filter Bar (for Applications, Admit Cards, Evaluation, Awards) */}
      {tab !== 'schemes' && (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <FiSearch className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidate name, App No., Code, Roll..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
              />
            </div>

            <select
              value={filterScheme}
              onChange={(e) => setFilterScheme(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 bg-white"
            >
              <option value="all">All Scholarship Schemes</option>
              {scholarships.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-gray-400">
            Showing <strong className="text-gray-700">{filteredApplicants.length}</strong> candidates
          </div>
        </div>
      )}

      {/* TAB 1: SCHEMES & BUILDER */}
      {tab === 'schemes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scholarships.map((item) => {
            const isDraft = item.status === 'draft'
            const isPublished = item.status === 'published' || item.status === 'active'
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div className="space-y-4">
                  {/* Top Header: Badge, Category, Status */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        item.color_theme === 'pink'
                          ? 'bg-pink-50 text-[#FF2D8D]'
                          : item.color_theme === 'purple'
                          ? 'bg-purple-50 text-[#9C27FF]'
                          : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      <FiAward size={24} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-pink-50 text-[#FF2D8D]">
                        {item.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleSchemeStatus(item)}
                        title="Click to toggle Draft / Published status"
                        className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 transition-all cursor-pointer ${
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
                    <h3 className="font-bold text-gray-900 text-lg leading-snug group-hover:text-[#FF2D8D] transition-colors">
                      {item.title}
                    </h3>
                    <div className="font-black text-[#FF2D8D] text-sm mt-1">{item.scholarship_value}</div>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{item.description}</p>

                  {/* Tiered Prizes Highlight (1st, 2nd, 3rd Prize) */}
                  <div className="p-3 bg-gradient-to-r from-pink-50/70 to-purple-50/70 rounded-2xl border border-pink-100/60 space-y-1.5">
                    <div className="text-[11px] font-bold text-gray-700 flex justify-between">
                      <span>🏆 Prize Pool Breakdown</span>
                      <span className="text-purple-700 font-extrabold">{item.number_of_winners || 50} Winners</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                      <div className="bg-white/80 p-1.5 rounded-xl border border-pink-100">
                        <div className="text-gray-400 font-semibold">🥇 1st Prize</div>
                        <div className="font-black text-[#FF2D8D]">{item.prize_distribution?.first_prize || '₹50,000'}</div>
                      </div>
                      <div className="bg-white/80 p-1.5 rounded-xl border border-pink-100">
                        <div className="text-gray-400 font-semibold">🥈 2nd Prize</div>
                        <div className="font-black text-purple-700">{item.prize_distribution?.second_prize || '₹25,000'}</div>
                      </div>
                      <div className="bg-white/80 p-1.5 rounded-xl border border-pink-100">
                        <div className="text-gray-400 font-semibold">🥉 3rd Prize</div>
                        <div className="font-black text-blue-600">{item.prize_distribution?.third_prize || '₹10,000'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Policy Specs */}
                  <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Registration Fee:</span>
                      <span className="font-bold text-gray-800">
                        {item.application_fee === 0 ? 'FREE (₹0)' : `₹${item.application_fee}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Application Window:</span>
                      <span className="font-semibold text-gray-800">
                        {item.application_start_date || 'Open'} ➔ {item.application_end_date || 'TBD'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Exam Pattern:</span>
                      <span className="font-semibold text-gray-800">
                        {item.exam_mode?.toUpperCase()} • {item.exam_duration || '120 Mins'} • {item.total_questions || 100} Qs
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Eligibility:</span>
                      <span className="font-bold text-emerald-700">
                        ≥ {item.min_percentage}% • {item.age_limit || '16-28 Yrs'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-gray-100/60">
                      <span className="text-gray-400">Exam Centers:</span>
                      <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md text-[11px]">
                        {item.exam_centers && item.exam_centers.length > 0
                          ? `${item.exam_centers.length} Center(s) Configured`
                          : '1 Center'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSchemeStatus(item)}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                        isDraft
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      {isDraft ? '🚀 Publish Scheme' : '📝 Set to Draft'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditScheme(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title="Edit Scheme"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteScheme(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete Scheme"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* TAB 2: CANDIDATE APPLICATIONS */}
      {tab === 'applications' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50/80 text-[11px] uppercase font-bold text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">App No. & Date</th>
                  <th className="px-6 py-4">Candidate Details</th>
                  <th className="px-6 py-4">Target Scheme</th>
                  <th className="px-6 py-4">Academics & Income</th>
                  <th className="px-6 py-4">Fee Payment</th>
                  <th className="px-6 py-4">Secret Code</th>
                  <th className="px-6 py-4 text-right">Admit Card Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredApplicants.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-gray-900">{app.application_no}</div>
                      <div className="text-gray-400 text-[10px] mt-0.5">{new Date(app.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                          <img
                            src={app.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face'}
                            alt={app.applicant_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{app.applicant_name}</div>
                          <div className="text-gray-400">{app.applicant_email}</div>
                          <div className="text-gray-400 text-[10px]">{app.applicant_phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#FF2D8D]">{app.scholarship_title}</div>
                      <div className="text-gray-400 text-[10px] mt-0.5">Pref: {app.exam_city_preference || 'Online'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{app.qualification}</div>
                      <div className="font-bold text-emerald-600">{app.percentage}% Score</div>
                      <div className="text-gray-400 text-[10px]">Income: ₹{app.annual_family_income || 5} LPA</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
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
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold px-2 py-1 bg-purple-50 text-[#9C27FF] rounded-lg text-xs">
                        {app.registration_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          app.admit_card_status === 'released' || app.admit_card_status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}
                      >
                        {app.admit_card_status === 'released' ? 'Official Issued' : 'Provisional'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ADMIT CARD DESK & BULK APPROVAL */}
      {tab === 'admit_cards' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 bg-white/20 rounded-full">
                Examination Hall Ticket Release Engine
              </span>
              <h2 className="text-2xl font-extrabold">Instant Bulk Admit Card Approval & Roll Generation</h2>
              <p className="text-xs text-purple-200 max-w-2xl leading-relaxed">
                When candidates register, they hold a <strong>Provisional Admit Card</strong> with their Registration Code. Once you click <strong>Bulk Approve</strong>, the system generates Roll Numbers, allocates exam slots, and unlocks their official Hall Ticket.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={handleBulkApproveAdmitCards}
                disabled={actionLoading || provisionalAdmitCards === 0}
                className={`px-6 py-3.5 rounded-2xl text-xs font-extrabold transition-all shadow-xl flex items-center justify-center gap-2 ${
                  provisionalAdmitCards > 0
                    ? 'bg-gradient-to-r from-[#FF2D8D] to-[#FF5E62] text-white hover:opacity-95 shadow-pink-500/30'
                    : 'bg-white/20 text-gray-300 cursor-not-allowed'
                }`}
              >
                <FiCheckSquare size={16} />
                {actionLoading ? 'Processing Approval...' : `⚡ Bulk Approve All Pending (${provisionalAdmitCards})`}
              </button>
            </div>
          </div>

          {/* Table of candidates for admit card desk */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50/80 text-[11px] uppercase font-bold text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">App No. & Code</th>
                    <th className="px-6 py-4">Candidate & Contact</th>
                    <th className="px-6 py-4">Target Scheme</th>
                    <th className="px-6 py-4">Roll Number</th>
                    <th className="px-6 py-4">Exam Venue / Center</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredApplicants.map((app) => {
                    const isReleased = app.admit_card_status === 'released' || app.admit_card_status === 'approved'
                    return (
                      <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-mono font-bold text-gray-900">{app.application_no}</div>
                          <div className="font-mono text-[#9C27FF] text-[11px] font-semibold mt-0.5">
                            {app.registration_code}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 text-sm">{app.applicant_name}</div>
                          <div className="text-gray-400">{app.applicant_email}</div>
                          <div className="text-gray-400">{app.applicant_phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#FF2D8D]">{app.scholarship_title}</div>
                          <div className="text-gray-400 text-[10px]">City: {app.exam_city_preference || 'Online'}</div>
                        </td>
                        <td className="px-6 py-4">
                          {app.roll_number ? (
                            <span className="font-mono font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                              {app.roll_number}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Pending Approval</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <div className="max-w-[200px] truncate text-gray-800">
                            {app.exam_center || 'National Online Center'}
                          </div>
                          <div className="text-gray-400 text-[10px]">{app.exam_slot || 'Slot Assigned on Approval'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              isReleased ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                            }`}
                          >
                            ● {isReleased ? 'Official Released' : 'Provisional'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!isReleased ? (
                              <button
                                onClick={() => handleSingleApproveAdmitCard(app.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1"
                              >
                                <FiCheckCircle /> Approve
                              </button>
                            ) : (
                              <button
                                onClick={() => setPreviewAdmitCard(app)}
                                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#9C27FF] font-bold text-xs rounded-xl transition-all flex items-center gap-1"
                              >
                                <FiDownload /> View Card
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

      {/* TAB 4: EXAM EVALUATION & MERIT LIST */}
      {tab === 'evaluation' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-bold text-[#FF2D8D] uppercase tracking-widest px-3 py-1 bg-pink-50 rounded-full border border-pink-100">
                  Categorized Examination Evaluation Desk
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">Scholarship Examination Scoring & Merit Builder</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select a scholarship exam scheme to evaluate candidates, enter scores, and generate automated scheme ranks.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                  Passing Cutoff: ≥ 50 Marks
                </span>
              </div>
            </div>

            {/* CATEGORY & SCHEME SELECTOR TABS */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setFilterScheme('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
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
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      filterScheme === s.id
                        ? 'bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white shadow-md shadow-pink-500/20'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 uppercase font-semibold">
                      {s.category}
                    </span>
                    <span>{s.title}</span>
                    <span className="text-[10px] opacity-80 font-mono">({evaluated}/{count} Scored)</span>
                  </button>
                )
              })}
            </div>

            {/* Scheme Evaluation KPI Card & Bulk Release Controls */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 border border-purple-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {(() => {
                const active = filterScheme !== 'all' ? scholarships.find((s) => s.id === filterScheme) : null
                const schemeApps = filterScheme !== 'all' ? applicants.filter((a) => a.scholarship_id === filterScheme) : applicants
                const evaluatedCount = schemeApps.filter((a) => a.exam_marks != null).length
                const releasedCount = schemeApps.filter((a) => a.result_status === 'released').length
                const qualifiedCount = schemeApps.filter((a) => a.merit_status === 'qualified').length
                const isAllReleased = evaluatedCount > 0 && evaluatedCount === releasedCount

                return (
                  <>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FF2D8D] text-white">
                          {active ? active.category : 'All Programs'}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm">{active ? active.title : 'All Scholarship Programs'}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isAllReleased ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isAllReleased ? '● Results Released Live' : '● Evaluation In Draft'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                        <span>Total: <strong className="text-gray-900">{schemeApps.length}</strong></span>
                        <span>Evaluated / Scored: <strong className="text-purple-700">{evaluatedCount}</strong></span>
                        <span>Qualified: <strong className="text-emerald-700">{qualifiedCount}</strong></span>
                        <span>Published Online: <strong className="text-blue-700">{releasedCount}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
                      <button
                        onClick={() => handleBulkReleaseResults(filterScheme)}
                        disabled={actionLoading || evaluatedCount === 0}
                        className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <FiSend size={14} />
                        Release & Declare Results Live ({evaluatedCount})
                      </button>

                      {releasedCount > 0 && (
                        <button
                          onClick={() => handleRevertResultsToDraft(filterScheme)}
                          disabled={actionLoading}
                          className="px-3 py-2.5 bg-white text-gray-700 border border-gray-200 font-bold text-xs rounded-xl hover:bg-gray-50 transition-all"
                        >
                          Revert to Draft
                        </button>
                      )}
                    </div>
                  </>
                )
              })()}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50/80 text-[11px] uppercase font-bold text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Merit Rank</th>
                    <th className="px-6 py-4">Roll Number</th>
                    <th className="px-6 py-4">Candidate Name</th>
                    <th className="px-6 py-4">Scholarship Scheme</th>
                    <th className="px-6 py-4">Exam Score (/100)</th>
                    <th className="px-6 py-4">Merit Status</th>
                    <th className="px-6 py-4">Release Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredApplicants.length > 0 ? (
                    filteredApplicants.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          {app.rank ? (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-sm ${
                              app.rank === 1
                                ? 'bg-amber-500 text-white shadow-amber-500/30'
                                : app.rank === 2
                                ? 'bg-gray-400 text-white'
                                : app.rank === 3
                                ? 'bg-amber-700 text-white'
                                : 'bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white'
                            }`}>
                              #{app.rank}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Unranked</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-gray-800">
                          {app.roll_number || 'AAGAJ-26-XXXX'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                              <img
                                src={app.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face'}
                                alt={app.applicant_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-sm">{app.applicant_name}</div>
                              <div className="text-gray-400 text-[10px]">{app.applicant_email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-[#FF2D8D]">{app.scholarship_title}</td>
                        <td className="px-6 py-4">
                          {app.exam_marks != null ? (
                            <div className="font-black text-emerald-600 text-base">{app.exam_marks} / 100</div>
                          ) : (
                            <span className="text-amber-600 font-semibold">Not Evaluated</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              app.merit_status === 'qualified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.merit_status === 'not_qualified'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            ● {app.merit_status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                              app.result_status === 'released'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {app.result_status === 'released' ? '🚀 Released' : '📝 Draft Score'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setEvaluatingApplicant(app)
                              setEnteredMarks(app.exam_marks != null ? String(app.exam_marks) : '85')
                              setShowMarksModal(true)
                            }}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all"
                          >
                            {app.exam_marks != null ? 'Edit Score' : 'Enter Marks'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                        No candidates found for the selected scholarship scheme.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DOCUMENT VERIFICATION & SCHOLARSHIP AWARDS */}
      {tab === 'awards' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 bg-white/20 rounded-full">
                Grants & Disbursement Engine
              </span>
              <h2 className="text-2xl font-extrabold">Document Verification & Scholarship Grant Allocation</h2>
              <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
                Verify original academic dossiers and disburse scholarship benefits: Choose between direct <strong>LMS Tuition Fee Waiver Enrollment</strong> or <strong>Cash Prize / Living Grant Payout</strong>.
              </p>
            </div>
          </div>

          {/* Scheme Selector Tabs for Awards */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterScheme('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
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
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    filterScheme === s.id
                      ? 'bg-emerald-700 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 uppercase font-semibold">
                    {s.category}
                  </span>
                  <span>{s.title}</span>
                  <span className="text-[10px] opacity-80 font-mono">({awarded}/{count} Awarded)</span>
                </button>
              )
            })}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50/80 text-[11px] uppercase font-bold text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Rank & Student</th>
                    <th className="px-6 py-4">Scheme & Score</th>
                    <th className="px-6 py-4">Document Verification</th>
                    <th className="px-6 py-4">Award Status</th>
                    <th className="px-6 py-4">Award Voucher & Bank Grant</th>
                    <th className="px-6 py-4 text-right">Disbursement Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredApplicants.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                          {app.rank && (
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] text-white shadow-sm ${
                              app.rank === 1 ? 'bg-amber-500' : app.rank === 2 ? 'bg-gray-400' : app.rank === 3 ? 'bg-amber-700' : 'bg-[#FF2D8D]'
                            }`}>
                              #{app.rank}
                            </span>
                          )}
                          {app.applicant_name}
                        </div>
                        <div className="text-gray-400">{app.applicant_email}</div>
                        <div className="font-mono text-[10px] text-gray-400 mt-0.5">App: {app.application_no}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#FF2D8D]">{app.scholarship_title}</div>
                        <div className="font-bold text-emerald-600 text-xs mt-0.5">
                          Score: {app.exam_marks != null ? `${app.exam_marks}/100` : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          <div>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                app.document_status === 'verified'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : app.document_status === 'action_needed'
                                  ? 'bg-amber-100 text-amber-800'
                                  : app.document_status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              ● {app.document_status === 'verified' ? 'Verified Dossier' : app.document_status === 'action_needed' ? 'Action Needed' : app.document_status === 'rejected' ? 'Rejected' : 'Pending Review'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleOpenDossier(app)}
                            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#9C27FF] text-xs font-bold rounded-xl border border-purple-200 transition-all flex items-center gap-1 shadow-sm"
                          >
                            <FiEye size={13} />
                            Inspect Dossier
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            app.award_status === 'awarded'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          ● {app.award_status === 'awarded' ? 'Awarded' : 'Not Awarded'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {app.award_status === 'awarded' ? (
                          <div className="space-y-1">
                            <div className="font-bold text-gray-900">{app.award_amount}</div>
                            {app.award_voucher_code && (
                              <div className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md inline-block">
                                🎟️ {app.award_voucher_code}
                              </div>
                            )}
                            <div className="font-mono text-[10px] text-gray-400">Ref: {app.award_disbursement_ref}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Pending Allocation</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenAwardModal(app)}
                          className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 ml-auto"
                        >
                          <FiAward size={14} />
                          {app.award_status === 'awarded' ? 'Manage Award' : 'Disburse Grant'}
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

                {/* Exam Centers Builder */}
                <div className="space-y-2.5 pt-2 border-t border-purple-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="block text-xs font-bold text-gray-800 uppercase">
                      Exam Centers & Venues (Create 1 or More) *
                    </label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 w-fit">
                      {(schemeForm.exam_centers || []).length} Center(s) Added
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(schemeForm.exam_centers || []).map((center, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-purple-950 text-xs font-bold shadow-sm"
                      >
                        <span className="text-purple-600">📍</span>
                        <span>{center}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExamCenter(idx)}
                          className="text-gray-400 hover:text-red-600 p-0.5 rounded-full hover:bg-red-50"
                        >
                          <FiXCircle size={14} />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      value={centerInput}
                      onChange={(e) => setCenterInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddExamCenter()
                        }
                      }}
                      placeholder="Add exam center name (e.g. Patna Hub / Delhi NCR / Online Proctored)..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:ring-2 focus:ring-purple-200"
                    />
                    <button
                      type="button"
                      onClick={handleAddExamCenter}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1"
                    >
                      <FiPlus size={14} />
                      Add Center
                    </button>
                  </div>
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

      {/* MARKS ENTRY MODAL */}
      {mounted && showMarksModal && evaluatingApplicant && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          style={{
            backgroundColor: 'rgba(5, 8, 20, 0.88)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
          }}
        >
          <div className="bg-white sm:rounded-3xl rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6">
            <div>
              <span className="text-[10px] font-bold text-[#FF2D8D] uppercase tracking-widest">
                Scholarship Exam Scoring
              </span>
              <h3 className="text-xl font-bold text-gray-900 mt-1">{evaluatingApplicant.applicant_name}</h3>
              <p className="text-xs text-gray-500 font-mono">App No: {evaluatingApplicant.application_no}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Exam Score (Out of 100) *</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.5"
                  value={enteredMarks}
                  onChange={(e) => setEnteredMarks(e.target.value)}
                  placeholder="e.g. 92.5"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-lg font-black text-[#FF2D8D] focus:ring-2 focus:ring-[#FF2D8D]"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl text-xs space-y-1">
                <div className="text-gray-500">Scheme: <strong className="text-gray-800">{evaluatingApplicant.scholarship_title}</strong></div>
                <div className="text-gray-500">Qualifying Cutoff: <strong className="text-emerald-700">50% Minimum</strong></div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowMarksModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMarks}
                disabled={actionLoading}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] shadow-md hover:shadow-lg transition-all"
              >
                {actionLoading ? 'Saving...' : 'Save & Recompute Rankings'}
              </button>
            </div>
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
                      placeholder="e.g. AAGAJ-100-FREE-1360"
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

              <div id="printable-hall-ticket" className="border-4 border-double border-gray-800 p-6 rounded-2xl space-y-6 bg-amber-50/10">
                <div className="text-center border-b-2 border-gray-800 pb-4 space-y-1">
                  <div className="font-mono text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    AAGAJ NATIONAL SCHOLARSHIP BOARD
                  </div>
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                    Official Examination Admit Card (Hall Ticket)
                  </h2>
                  <p className="text-xs font-bold text-[#FF2D8D]">{previewAdmitCard.scholarship_title}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="col-span-2 space-y-2">
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
                        {previewAdmitCard.roll_number || 'AAGAJ-26-0041'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-400">Security Reg Code: </span>
                      <strong className="font-mono text-purple-700">{previewAdmitCard.registration_code}</strong>
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

                <div className="p-3 bg-gray-100/80 rounded-xl border border-gray-200 space-y-1 text-xs">
                  <div>
                    <span className="text-gray-500 font-bold">Exam Center / Venue: </span>
                    <span className="text-gray-800 font-semibold">{previewAdmitCard.exam_center || 'National Proctored Online Assessment Hub'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-bold">Test Slot & Timing: </span>
                    <span className="text-gray-800 font-semibold">{previewAdmitCard.exam_slot || '2026-09-20 | 10:00 AM - 12:30 PM (Reporting 09:15 AM)'}</span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-1 text-[11px] text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="font-bold text-gray-800 uppercase text-[10px]">Mandatory Instructions:</div>
                  <div>• Candidate must carry a printed copy of this Admit Card along with an original Photo ID proof.</div>
                  <div>• For online exams, log in 30 minutes prior to the test slot using your Roll Number and Registration Code.</div>
                  <div>• Electronic gadgets, smartwatches, and unauthorized items are strictly prohibited inside examination premises.</div>
                </div>

                {/* Barcode & Signature */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-xs">
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
    </div>
  )
}
