'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  Award,
  Landmark,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  X,
  Search,
  FileText,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  CreditCard,
  Percent,
  TrendingUp,
  UserCheck,
  BadgeCheck,
  Camera,
  UploadCloud,
  Image as ImageIcon,
  User,
  Edit3,
} from 'lucide-react'

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
  exam_mode: string
  exam_venue?: string
  exam_centers?: string[]
  terms_and_conditions?: string
  required_documents?: string[]
  admit_card_release_date?: string
  result_date?: string
  color_theme?: string
  status: string
}

const DEFAULT_SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
]

interface AcademicQualificationDetail {
  id: string
  qualification: string
  institution: string
  board_university: string
  roll_no: string
  passing_year: string
  percentage: string
  marks_obtained?: string
  total_marks?: string
  is_custom?: boolean
}

export default function ScholarshipsPage() {
  const [activeTab, setActiveTab] = useState<'explore' | 'checker' | 'admit_card' | 'results' | 'merit_list'>('explore')
  const [scholarships, setScholarships] = useState<ScholarshipScheme[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Official Sarkari Result Style Eligibility & Notification Document State
  const [inspectingSchemeDoc, setInspectingSchemeDoc] = useState<ScholarshipScheme | null>(null)

  // Dynamic Multi-Standard Academic Details State
  const [academicRecords, setAcademicRecords] = useState<AcademicQualificationDetail[]>([])
  const [customQualName, setCustomQualName] = useState('')
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, string>>({})

  // Eligibility Checker State
  const [checkerData, setCheckerData] = useState({
    qualification: '12th (PCM)',
    percentage: 85,
    annual_income: 4.5,
    gender: 'all',
  })
  const [checkerRun, setCheckerRun] = useState(false)

  // Apply Modal State
  const [selectedScheme, setSelectedScheme] = useState<ScholarshipScheme | null>(null)
  const [applyStep, setApplyStep] = useState<'form' | 'payment' | 'success'>('form')
  const [formSection, setFormSection] = useState<'personal' | 'academic' | 'documents'>('personal')

  // School Partner Intake Channel State
  const [applicantType, setApplicantType] = useState<'DIRECT' | 'SCHOOL_PARTNER'>('DIRECT')
  const [schoolInputId, setSchoolInputId] = useState('')
  const [verifiedSchool, setVerifiedSchool] = useState<any>(null)
  const [schoolVerifying, setSchoolVerifying] = useState(false)
  const [schoolVerifyError, setSchoolVerifyError] = useState<string | null>(null)
  const [schoolStudentInfo, setSchoolStudentInfo] = useState({
    roll_no: '',
    admission_no: '',
    class_name: '10th',
    section: 'A',
  })

  // Dynamic Applicant Form State
  const [applicantForm, setApplicantForm] = useState({
    // Personal Details
    applicant_name: '',
    applicant_email: '',
    applicant_phone: '',
    dob: '',
    gender: 'Male',
    category: 'General',
    father_name: '',
    mother_name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',

    // Academic Details
    school_college_name: '',
    qualification: '12th (PCM)',
    passing_year: new Date().getFullYear().toString(),
    percentage: '',
    annual_family_income: '',

    // Documents Uploads
    aadhaar_url: '',
    marksheet_url: '',
    college_id_url: '',
    photo_url: '',
    signature_url: '',

    // Exam Center & Declaration
    exam_city_preference: '',
    declaration_agreed: false,
  })

  const [submitting, setSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi')
  const [generatedApplication, setGeneratedApplication] = useState<any>(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedAppNo, setCopiedAppNo] = useState(false)

  // Document Upload File Input Refs
  const photoFileInputRef = useRef<HTMLInputElement | null>(null)
  const signFileInputRef = useRef<HTMLInputElement | null>(null)
  const aadhaarFileInputRef = useRef<HTMLInputElement | null>(null)
  const marksheetFileInputRef = useRef<HTMLInputElement | null>(null)
  const collegeIdFileInputRef = useRef<HTMLInputElement | null>(null)

  // Admit Card Verification State
  const [admitSearch, setAdmitSearch] = useState({
    application_no: '',
    registration_code: '',
  })
  const [admitLoading, setAdmitLoading] = useState(false)
  const [admitResult, setAdmitResult] = useState<any>(null)
  const [admitError, setAdmitError] = useState<string | null>(null)

  // Merit List & Results State
  const [meritQuery, setMeritQuery] = useState('')
  const [meritSchemeFilter, setMeritSchemeFilter] = useState('all')
  const [meritList, setMeritList] = useState<any[]>([])
  const [topThreeWinners, setTopThreeWinners] = useState<any[]>([])
  const [meritSchemesMeta, setMeritSchemesMeta] = useState<any[]>([])
  const [meritLoading, setMeritLoading] = useState(false)

  // Individual Candidate Result & Scorecard Lookup State
  const [resultLookupInput, setResultLookupInput] = useState('')
  const [resultLookupLoading, setResultLookupLoading] = useState(false)
  const [resultLookupError, setResultLookupError] = useState<string | null>(null)
  const [studentScorecard, setStudentScorecard] = useState<any | null>(null)
  
  // Award Claim & Bank Details State
  const [copiedCourseVoucher, setCopiedCourseVoucher] = useState(false)
  const [showChequeModal, setShowChequeModal] = useState(false)
  const [bankClaimForm, setBankClaimForm] = useState({
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    account_holder_name: '',
    upi_id: '',
  })
  const [bankSubmitting, setBankSubmitting] = useState(false)
  const [bankSuccessMsg, setBankSuccessMsg] = useState<string | null>(null)

  // Fetch Scholarships Catalog
  const fetchScholarships = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/public/scholarships?limit=50')
      const data = await res.json()
      if (data.success && data.data) {
        setScholarships(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch Merit List & Top 3 Podium
  const fetchMeritList = async () => {
    setMeritLoading(true)
    try {
      const url = `/api/public/scholarships/merit-list?scheme_id=${meritSchemeFilter}&query=${encodeURIComponent(meritQuery)}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setMeritList(data.merit_list || [])
        setTopThreeWinners(data.top_three || [])
        setMeritSchemesMeta(data.schemes || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setMeritLoading(false)
    }
  }

  // Check Candidate Individual Scorecard by Roll Number / Application Number
  const handleCheckStudentScorecard = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!resultLookupInput.trim()) return
    setResultLookupLoading(true)
    setResultLookupError(null)
    setStudentScorecard(null)
    try {
      const res = await fetch(`/api/public/scholarships/merit-list?lookup_app_no=${encodeURIComponent(resultLookupInput.trim())}`)
      const data = await res.json()
      if (data.success && data.individual_scorecard) {
        setStudentScorecard(data.individual_scorecard)
      } else {
        setResultLookupError(data.error || 'No candidate found with the provided Application No / Roll No.')
      }
    } catch (err: any) {
      setResultLookupError('Failed to fetch scorecard. Please try again.')
    } finally {
      setResultLookupLoading(false)
    }
  }

  // Submit Bank & UPI details for cash prize transfer
  const handleSubmitBankClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentScorecard) return
    setBankSubmitting(true)
    setBankSuccessMsg(null)
    try {
      const res = await fetch('/api/public/scholarships/merit-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_bank_details',
          application_no: studentScorecard.application_no,
          registration_code: studentScorecard.registration_code,
          bank_name: bankClaimForm.bank_name,
          account_number: bankClaimForm.account_number,
          ifsc_code: bankClaimForm.ifsc_code,
          account_holder_name: bankClaimForm.account_holder_name || studentScorecard.applicant_name,
          upi_id: bankClaimForm.upi_id,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setBankSuccessMsg(data.message || 'Bank details saved! Superadmin will disburse your cash prize.')
        // Refresh scorecard
        handleCheckStudentScorecard()
      } else {
        alert(data.error || 'Failed to submit bank details.')
      }
    } catch (err) {
      console.error(err)
      alert('Network error while submitting bank details.')
    } finally {
      setBankSubmitting(false)
    }
  }

  useEffect(() => {
    fetchScholarships()
  }, [])

  useEffect(() => {
    if (activeTab === 'merit_list') {
      fetchMeritList()
    }
  }, [activeTab, meritSchemeFilter])

  // Open Application Flow
  const handleOpenApply = (scheme: ScholarshipScheme) => {
    setSelectedScheme(scheme)
    setApplyStep('form')
    setFormSection('personal')
    setGeneratedApplication(null)
    setCustomQualName('')
    setUploadedDocs({})
    setApplicantType('DIRECT')
    setSchoolInputId('')
    setVerifiedSchool(null)
    setSchoolVerifyError(null)
    setSchoolStudentInfo({
      roll_no: '',
      admission_no: '',
      class_name: (scheme.eligible_qualifications && scheme.eligible_qualifications[0]) || '10th',
      section: 'A',
    })
    const availableCenters = scheme.exam_centers && scheme.exam_centers.length > 0
      ? scheme.exam_centers
      : (scheme.exam_venue ? [scheme.exam_venue] : ['National Proctored Online Assessment Hub'])

    // Initialize required qualification records based on Superadmin eligibility
    const quals = scheme.eligible_qualifications && scheme.eligible_qualifications.length > 0
      ? scheme.eligible_qualifications
      : ['10th', '12th (PCM)']

    const initialRecords: AcademicQualificationDetail[] = quals.map((q, idx) => ({
      id: `qual-${idx}-${Date.now()}`,
      qualification: q,
      institution: '',
      board_university: q.toLowerCase().includes('10th') ? 'CBSE' : q.toLowerCase().includes('12th') ? 'CBSE' : 'State / Central University',
      roll_no: '',
      passing_year: q.toLowerCase().includes('10th') ? '2022' : q.toLowerCase().includes('12th') ? '2024' : '2026',
      percentage: '',
      marks_obtained: '',
      total_marks: '500',
      is_custom: false,
    }))
    setAcademicRecords(initialRecords)

    setApplicantForm({
      applicant_name: '',
      applicant_email: '',
      applicant_phone: '',
      dob: '',
      gender: 'Male',
      category: 'General',
      father_name: '',
      mother_name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      school_college_name: '',
      qualification: quals[0] || '12th (PCM)',
      passing_year: new Date().getFullYear().toString(),
      percentage: '',
      annual_family_income: '',
      aadhaar_url: '',
      marksheet_url: '',
      college_id_url: '',
      photo_url: '',
      signature_url: '',
      exam_city_preference: availableCenters[0] || 'National Proctored Online Assessment Hub',
      declaration_agreed: false,
    })
  }

  // Update specific field in an academic record
  const handleUpdateAcademicRecord = (id: string, field: keyof AcademicQualificationDetail, value: string) => {
    setAcademicRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === id) {
          const updated = { ...rec, [field]: value }
          // Auto calculate percentage if marks entered
          if (field === 'marks_obtained' || field === 'total_marks') {
            const obt = parseFloat(field === 'marks_obtained' ? value : rec.marks_obtained || '0')
            const tot = parseFloat(field === 'total_marks' ? value : rec.total_marks || '500')
            if (tot > 0 && obt >= 0 && obt <= tot) {
              updated.percentage = ((obt / tot) * 100).toFixed(2)
            }
          }
          return updated
        }
        return rec
      })
    )
  }

  // Add custom extra degree / qualification
  const handleAddCustomAcademicRecord = () => {
    if (!customQualName.trim()) return
    const newRecord: AcademicQualificationDetail = {
      id: `custom-${Date.now()}`,
      qualification: customQualName.trim(),
      institution: '',
      board_university: 'University / Board',
      roll_no: '',
      passing_year: new Date().getFullYear().toString(),
      percentage: '',
      marks_obtained: '',
      total_marks: '500',
      is_custom: true,
    }
    setAcademicRecords((prev) => [...prev, newRecord])
    setCustomQualName('')
  }

  // Remove qualification record
  const handleRemoveAcademicRecord = (id: string) => {
    setAcademicRecords((prev) => prev.filter((r) => r.id !== id))
  }

  // Generic Document File Upload Handler
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: 'aadhaar_url' | 'marksheet_url' | 'college_id_url' | 'photo_url' | 'signature_url'
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be under 5MB.')
        return
      }
      const reader = new FileReader()
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setApplicantForm((prev) => ({
            ...prev,
            [fieldKey]: uploadEvent.target?.result as string,
          }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Dynamic Required Document Upload Handler
  const handleDynamicDocUpload = (
    docName: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be under 5MB.')
        return
      }
      const reader = new FileReader()
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const dataUrl = uploadEvent.target?.result as string
          setUploadedDocs((prev) => ({
            ...prev,
            [docName]: dataUrl,
          }))
          const l = docName.toLowerCase()
          if (l.includes('aadhaar') || l.includes('id') || l.includes('pan')) {
            setApplicantForm((prev) => ({ ...prev, aadhaar_url: dataUrl }))
          } else if (l.includes('marksheet')) {
            setApplicantForm((prev) => ({ ...prev, marksheet_url: dataUrl }))
          } else if (l.includes('college') || l.includes('school id')) {
            setApplicantForm((prev) => ({ ...prev, college_id_url: dataUrl }))
          }
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Verify School ID via Public API
  const handleVerifySchoolId = async (idOverride?: string) => {
    const raw = (idOverride || schoolInputId).trim()
    if (!raw) {
      setSchoolVerifyError('Please enter a valid School ID.')
      return
    }
    setSchoolVerifying(true)
    setSchoolVerifyError(null)
    try {
      const url = `/api/public/schools/verify?school_id=${encodeURIComponent(raw)}${selectedScheme ? `&scholarship_id=${selectedScheme.id}` : ''}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.success && data.school) {
        setVerifiedSchool(data.school)
        setApplicantForm((prev) => ({
          ...prev,
          school_college_name: data.school.name,
        }))
      } else {
        setVerifiedSchool(null)
        setSchoolVerifyError(data.error || 'Invalid School ID. Please verify with your school administration.')
      }
    } catch (err: any) {
      setVerifiedSchool(null)
      setSchoolVerifyError('Network error while verifying school.')
    } finally {
      setSchoolVerifying(false)
    }
  }

  // Save & Continue from Section 1 (Personal) -> Section 2 (Academic)
  const handleContinueToAcademic = (e: React.FormEvent) => {
    e.preventDefault()

    if (applicantType === 'SCHOOL_PARTNER') {
      if (!verifiedSchool) {
        alert('Please enter your official School ID and click "Verify School" before continuing.')
        return
      }
      if (!schoolStudentInfo.roll_no?.trim()) {
        alert('Please enter your School / Institutional Roll Number.')
        return
      }
      if (!schoolStudentInfo.admission_no?.trim()) {
        alert('Please enter your School Admission / S.R. Number.')
        return
      }
      if (!schoolStudentInfo.section?.trim()) {
        alert('Please enter your Class Section.')
        return
      }
    }

    if (!applicantForm.applicant_name?.trim()) {
      alert('Please enter your Full Name.')
      return
    }
    if (!applicantForm.applicant_phone?.trim()) {
      alert('Please enter your Mobile Number.')
      return
    }
    if (!applicantForm.applicant_email?.trim()) {
      alert('Please enter your Email Address.')
      return
    }
    if (!applicantForm.address?.trim()) {
      alert('Please enter your Residential Address.')
      return
    }
    setFormSection('academic')
  }

  // Save & Continue from Section 2 (Academic) -> Section 3 (Documents)
  const handleContinueToDocuments = (e: React.FormEvent) => {
    e.preventDefault()

    if (academicRecords.length === 0) {
      alert('Please add at least one qualification record.')
      return
    }

    // Validate every required qualification record
    for (let i = 0; i < academicRecords.length; i++) {
      const rec = academicRecords[i]
      if (!rec.institution.trim()) {
        alert(`Please enter the School / College Name for ${rec.qualification}.`)
        return
      }
      if (!rec.percentage || isNaN(parseFloat(rec.percentage))) {
        alert(`Please enter a valid Percentage / CGPA for ${rec.qualification}.`)
        return
      }
      const score = parseFloat(rec.percentage)
      if (score < 0 || score > 100) {
        alert(`Percentage for ${rec.qualification} must be between 0% and 100%.`)
        return
      }
    }

    if (!applicantForm.annual_family_income || parseFloat(applicantForm.annual_family_income) <= 0) {
      alert('Please enter your Annual Family Income.')
      return
    }

    // Aggregate primary qualification summary
    const latestRec = academicRecords[academicRecords.length - 1]
    setApplicantForm((prev) => ({
      ...prev,
      school_college_name: latestRec.institution,
      qualification: latestRec.qualification,
      percentage: latestRec.percentage,
      passing_year: latestRec.passing_year,
    }))

    setFormSection('documents')
  }

  // Submit Application Form -> Move to Payment or Instant Free Submission
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedScheme) return

    if (!applicantForm.photo_url) {
      alert('Please upload or select your passport-size photograph before submitting.')
      return
    }

    if (selectedScheme.application_fee === 0) {
      executeSubmitApplication('FREE_CONFIRMED')
    } else {
      setApplyStep('payment')
    }
  }

  // Execute Final Application Submission
  const executeSubmitApplication = async (paymentRef?: string) => {
    if (!selectedScheme) return
    setSubmitting(true)
    try {
      const payload = {
        scholarship_id: selectedScheme.id,
        ...applicantForm,
        application_type: applicantType,
        school_id: applicantType === 'SCHOOL_PARTNER' && verifiedSchool ? verifiedSchool.school_id : null,
        school_name: applicantType === 'SCHOOL_PARTNER' && verifiedSchool ? verifiedSchool.name : applicantForm.school_college_name,
        school_roll_no: applicantType === 'SCHOOL_PARTNER' ? schoolStudentInfo.roll_no : '',
        school_admission_no: applicantType === 'SCHOOL_PARTNER' ? schoolStudentInfo.admission_no : '',
        school_class: applicantType === 'SCHOOL_PARTNER' ? schoolStudentInfo.class_name : applicantForm.qualification,
        school_section: applicantType === 'SCHOOL_PARTNER' ? schoolStudentInfo.section : '',
        academic_records: academicRecords,
        documents: {
          ...uploadedDocs,
          aadhaar_uploaded: !!applicantForm.aadhaar_url || !!uploadedDocs['Aadhaar Card'] || !!uploadedDocs['Government Photo ID (Aadhaar/PAN)'],
          marksheet_uploaded: !!applicantForm.marksheet_url || !!uploadedDocs['10th / 12th Marksheet'],
          college_id_uploaded: !!applicantForm.college_id_url || !!uploadedDocs['College ID Card'],
          photo_uploaded: !!applicantForm.photo_url,
          signature_uploaded: !!applicantForm.signature_url,
          academic_records: academicRecords,
          uploaded_documents: uploadedDocs,
          application_type: applicantType,
          school_id: applicantType === 'SCHOOL_PARTNER' && verifiedSchool ? verifiedSchool.school_id : null,
          school_name: applicantType === 'SCHOOL_PARTNER' && verifiedSchool ? verifiedSchool.name : null,
          school_roll_no: applicantType === 'SCHOOL_PARTNER' ? schoolStudentInfo.roll_no : null,
          school_admission_no: applicantType === 'SCHOOL_PARTNER' ? schoolStudentInfo.admission_no : null,
          school_class: applicantType === 'SCHOOL_PARTNER' ? schoolStudentInfo.class_name : null,
          school_section: applicantType === 'SCHOOL_PARTNER' ? schoolStudentInfo.section : null,
        },
        payment_reference: paymentRef || `PAY_MOCK_${Date.now().toString().slice(-8)}`,
        payment_amount: selectedScheme.application_fee,
      }

      const res = await fetch('/api/public/scholarships/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success && data.data) {
        setGeneratedApplication(data)
        setApplyStep('success')
      } else {
        alert(data.error || 'Failed to submit application.')
      }
    } catch (err) {
      console.error('Apply submit error', err)
      alert('Error submitting application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Fetch Main Admit Card by Application No. + Registration Code
  const handleFetchAdmitCard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!admitSearch.application_no.trim()) {
      setAdmitError('Please enter your Application Number or Registered Email.')
      return
    }

    setAdmitLoading(true)
    setAdmitError(null)
    setAdmitResult(null)

    try {
      const res = await fetch('/api/public/scholarships/admit-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_no: admitSearch.application_no.trim(),
          registration_code: admitSearch.registration_code.trim(),
        }),
      })
      const data = await res.json()
      if (data.success && data.data) {
        setAdmitResult(data.data)
      } else {
        setAdmitError(data.error || 'Unable to find an application with matching credentials.')
      }
    } catch (err: any) {
      setAdmitError('Connection error. Please try again.')
    } finally {
      setAdmitLoading(false)
    }
  }

  // Filtered schemes
  const filteredSchemes = scholarships.filter((s) => {
    if (categoryFilter === 'all') return true
    return s.category.toLowerCase().includes(categoryFilter.toLowerCase())
  })

  // Eligibility Checker Match Logic
  const eligibleSchemes = scholarships.filter((scheme) => {
    const minP = scheme.min_percentage || 60
    const maxInc = scheme.max_family_income || 15
    const isPercEligible = Number(checkerData.percentage) >= minP
    const isIncomeEligible = Number(checkerData.annual_income) <= maxInc
    return isPercEligible && isIncomeEligible
  })

  const copyToClipboard = (text: string, type: 'code' | 'app') => {
    navigator.clipboard.writeText(text)
    if (type === 'code') {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } else {
      setCopiedAppNo(true)
      setTimeout(() => setCopiedAppNo(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-900 font-sans">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-14 bg-gradient-to-b from-pink-50/70 via-purple-50/30 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#FF2D8D] uppercase tracking-widest px-4 py-1.5 bg-pink-50 rounded-full border border-pink-100 shadow-sm"
          >
            <Sparkles size={14} /> National Scholarship & Financial Aid Gateway
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-heading font-black text-gray-900 tracking-tight"
          >
            Empowering Talent with <span className="text-gradient">Merit Grants & Full Rides</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Check your eligibility instantly, apply with photo verification, receive your provisional admit card, and unlock official examination hall tickets upon Superadmin board approval.
          </motion.p>

          {/* Tab Navigation Pill Bar */}
          <div className="pt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
                activeTab === 'explore'
                  ? 'bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white shadow-pink-500/25 shadow-lg scale-105'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Award size={16} /> Explore Scholarships ({scholarships.length})
            </button>

            <button
              onClick={() => setActiveTab('checker')}
              className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
                activeTab === 'checker'
                  ? 'bg-gradient-to-r from-[#9C27FF] to-[#673AB7] text-white shadow-purple-500/25 shadow-lg scale-105'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Percent size={16} /> Eligibility Checker
            </button>

            <button
              onClick={() => setActiveTab('admit_card')}
              className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
                activeTab === 'admit_card'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/25 shadow-lg scale-105'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <QrCode size={16} /> Download Admit Card
            </button>

            <button
              onClick={() => setActiveTab('results')}
              className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
                activeTab === 'results'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25 shadow-lg scale-105'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <FileText size={16} /> Check Result & Scorecard
            </button>

            <button
              onClick={() => setActiveTab('merit_list')}
              className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
                activeTab === 'merit_list'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/25 shadow-lg scale-105'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <TrendingUp size={16} /> Top 3 & Merit List
            </button>
          </div>
        </div>
      </section>

      {/* TAB 1: EXPLORE SCHOLARSHIPS */}
      {activeTab === 'explore' && (
        <section className="py-12 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {['all', ...Array.from(new Set(scholarships.map((s) => s.category).filter(Boolean)))].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    categoryFilter === cat
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {cat === 'all' ? 'All Schemes' : cat}
                </button>
              ))}
            </div>

            <div className="text-xs text-gray-400">
              Showing <strong className="text-gray-700">{filteredSchemes.length}</strong> active programs
            </div>
          </div>

          {loading ? (
            <div className="p-20 text-center text-gray-400">Loading active scholarship schemes...</div>
          ) : filteredSchemes.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3">
              <GraduationCap size={40} className="mx-auto text-gray-300" />
              <h3 className="text-base font-bold text-gray-800">No Scholarships Available</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No active scholarship schemes found for the selected category. Check back soon for new openings!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {filteredSchemes.map((scheme) => (
                <motion.div
                  key={scheme.id}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl p-8 border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                          scheme.color_theme === 'pink'
                            ? 'bg-pink-50 text-[#FF2D8D]'
                            : scheme.color_theme === 'purple'
                            ? 'bg-purple-50 text-[#9C27FF]'
                            : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        <GraduationCap size={28} />
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {scheme.application_fee === 0 ? 'FREE Application' : `Fee: ₹${scheme.application_fee}`}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase">{scheme.category}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-heading font-extrabold text-xl text-gray-900 group-hover:text-[#FF2D8D] transition-colors leading-snug">
                        {scheme.title}
                      </h3>
                      <div className="text-[#FF2D8D] font-black text-sm mt-1">{scheme.scholarship_value}</div>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed">{scheme.description}</p>

                    {/* Tiered Prizes Breakdown */}
                    {scheme.prize_distribution && (
                      <div className="p-3 bg-gradient-to-r from-pink-50/70 to-purple-50/70 rounded-2xl border border-pink-100/60 space-y-1.5">
                        <div className="text-[11px] font-bold text-gray-700 flex justify-between">
                          <span>🏆 Prize Pool</span>
                          <span className="text-purple-700 font-extrabold">{scheme.number_of_winners || 50} Winners</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
                          <div className="bg-white/80 p-1.5 rounded-xl border border-pink-100">
                            <div className="text-gray-400 font-semibold">🥇 1st</div>
                            <div className="font-black text-[#FF2D8D]">{scheme.prize_distribution.first_prize || '₹50,000'}</div>
                          </div>
                          <div className="bg-white/80 p-1.5 rounded-xl border border-pink-100">
                            <div className="text-gray-400 font-semibold">🥈 2nd</div>
                            <div className="font-black text-purple-700">{scheme.prize_distribution.second_prize || '₹25,000'}</div>
                          </div>
                          <div className="bg-white/80 p-1.5 rounded-xl border border-pink-100">
                            <div className="text-gray-400 font-semibold">🥉 3rd</div>
                            <div className="font-black text-blue-600">{scheme.prize_distribution.third_prize || '₹10,000'}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-gray-700">
                        <span className="flex items-center gap-1.5 text-gray-500">
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          Eligibility:
                        </span>
                        <strong className="text-emerald-700">≥ {scheme.min_percentage}% • {scheme.age_limit || '16-28 Yrs'}</strong>
                      </div>
                      <div className="flex items-center justify-between text-gray-700">
                        <span className="flex items-center gap-1.5 text-gray-500">
                          <Calendar size={13} className="text-[#9C27FF] shrink-0" />
                          Apply Deadline:
                        </span>
                        <strong className="text-red-600">{scheme.application_end_date || 'Open'}</strong>
                      </div>
                      <div className="flex items-center justify-between text-gray-700">
                        <span className="flex items-center gap-1.5 text-gray-500">
                          <Clock size={13} className="text-blue-600 shrink-0" />
                          Exam Format:
                        </span>
                        <strong>{scheme.exam_mode?.toUpperCase()} • {scheme.exam_duration || '120 Mins'} ({scheme.total_questions || 100} Qs)</strong>
                      </div>
                    </div>
                  </div>

                    <div className="pt-6 mt-4 border-t border-gray-50 space-y-2.5">
                      <button
                        onClick={() => handleOpenApply(scheme)}
                        className="w-full py-3.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-xs font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        Apply Now ({scheme.application_fee === 0 ? 'Free' : `₹${scheme.application_fee}`})
                        <ArrowRight size={14} />
                      </button>
                      <button
                        onClick={() => setInspectingSchemeDoc(scheme)}
                        className="w-full py-2.5 px-3 text-xs font-bold text-gray-700 hover:text-[#C81E4E] hover:bg-pink-50/70 rounded-xl transition-all text-center flex items-center justify-center gap-1.5 border border-dashed border-gray-300 hover:border-[#C81E4E]/40"
                      >
                        <FileText size={13} className="text-[#C81E4E]" />
                        Check Eligibility & Official Notification
                      </button>
                    </div>
                  </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: INTERACTIVE ELIGIBILITY CHECKER */}
      {activeTab === 'checker' && (
        <section className="py-12 pb-24 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border border-gray-200/80 p-8 shadow-xl space-y-8">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-bold text-[#9C27FF] uppercase tracking-widest px-3 py-1 bg-purple-50 rounded-full">
                Instant Qualification Engine
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-gray-900">
                Check Which Scholarships You Qualify For
              </h2>
              <p className="text-xs text-gray-500 max-w-lg mx-auto">
                Input your academic score and family income to see immediate matched grant schemes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-gray-50/80 rounded-2xl border border-gray-100">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Academic Stream</label>
                <select
                  value={checkerData.qualification}
                  onChange={(e) => setCheckerData({ ...checkerData, qualification: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-white"
                >
                  <option value="10th">10th Standard Matric</option>
                  <option value="12th (PCM)">12th Standard (Science / PCM)</option>
                  <option value="12th (Commerce/Arts)">12th Standard (Commerce / Arts)</option>
                  <option value="Undergraduate">Undergraduate (B.Tech / BCA / B.Sc)</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Marks / Percentage ({checkerData.percentage}%)
                </label>
                <input
                  type="range"
                  min={40}
                  max={100}
                  value={checkerData.percentage}
                  onChange={(e) => setCheckerData({ ...checkerData, percentage: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF2D8D] mt-3"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>40%</span>
                  <span className="font-bold text-[#FF2D8D] text-xs">{checkerData.percentage}%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Annual Family Income (₹{checkerData.annual_income} LPA)
                </label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={0.5}
                  value={checkerData.annual_income}
                  onChange={(e) => setCheckerData({ ...checkerData, annual_income: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#9C27FF] mt-3"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>₹1 LPA</span>
                  <span className="font-bold text-[#9C27FF] text-xs">₹{checkerData.annual_income} LPA</span>
                  <span>₹20 LPA</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900 text-sm">
                  Matched Scholarships for You ({eligibleSchemes.length} Found)
                </h3>
                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  🎉 {eligibleSchemes.length} Eligible
                </span>
              </div>

              {eligibleSchemes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eligibleSchemes.map((scheme) => (
                    <div
                      key={scheme.id}
                      className="p-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-sm space-y-3 hover:border-emerald-300 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            ✓ 100% Eligible
                          </span>
                          <span className="text-xs font-bold text-gray-800">
                            {scheme.application_fee === 0 ? 'Free' : `₹${scheme.application_fee}`}
                          </span>
                        </div>

                        <h4 className="font-bold text-gray-900 text-base">{scheme.title}</h4>
                        <div className="text-xs font-bold text-[#FF2D8D]">{scheme.scholarship_value}</div>
                        <p className="text-xs text-gray-600 line-clamp-2">{scheme.description}</p>
                      </div>

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => setInspectingSchemeDoc(scheme)}
                            className="px-3.5 py-2.5 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-xs"
                            title="View Sarkari Result Style Notification"
                          >
                            <FileText size={13} className="text-[#C81E4E]" />
                            Full Notification
                          </button>
                          <button
                            onClick={() => handleOpenApply(scheme)}
                            className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                          >
                            Apply Online
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-2xl text-gray-500 space-y-2">
                  <AlertCircle size={32} className="text-amber-500 mx-auto" />
                  <p className="text-sm font-semibold">No direct matches for the selected criteria.</p>
                  <p className="text-xs">Try adjusting your percentage or exploring our open grant programs.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: DOWNLOAD OFFICIAL ADMIT CARD */}
      {activeTab === 'admit_card' && (
        <section className="py-12 pb-24 max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border border-gray-200/80 p-8 shadow-xl space-y-8">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                Official Hall Ticket Verification
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-gray-900">
                Download Official Examination Admit Card
              </h2>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Enter your <strong>Application Number</strong> and the <strong>Security Registration Code</strong> from your Provisional Admit Card.
              </p>
            </div>

            <form onSubmit={handleFetchAdmitCard} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Application Number / Registered Email *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SCH-2026-8801"
                    value={admitSearch.application_no}
                    onChange={(e) => setAdmitSearch({ ...admitSearch, application_no: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-mono focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Security Registration Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. REG-CODE-9921"
                    value={admitSearch.registration_code}
                    onChange={(e) => setAdmitSearch({ ...admitSearch, registration_code: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-mono focus:ring-2 focus:ring-[#9C27FF]/20 focus:border-[#9C27FF]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={admitLoading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Search size={16} />
                {admitLoading ? 'Verifying Credentials...' : 'Search & Fetch Official Admit Card'}
              </button>
            </form>

            {admitError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{admitError}</span>
              </div>
            )}

            {/* Admit Card Result Display */}
            {admitResult && (
              <div className="space-y-6 pt-4 border-t border-gray-100">
                {admitResult.admit_card.is_official ? (
                  /* Official Hall Ticket Print Layout */
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
                        /* Hide all header, footer, background elements */
                        body * {
                          visibility: hidden !important;
                        }
                        /* Show only printable hall ticket */
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

                    <div id="printable-hall-ticket" className="border-4 border-double border-gray-800 p-6 sm:p-8 rounded-3xl space-y-6 bg-amber-50/10 shadow-sm relative">
                      <div className="text-center border-b-2 border-gray-800 pb-4 space-y-1">
                        <div className="font-mono text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          AAGAJ NATIONAL SCHOLARSHIP BOARD
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">
                          Official Examination Admit Card (Hall Ticket)
                        </h2>
                        <p className="text-xs font-bold text-[#FF2D8D]">{admitResult.scholarship.title}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-xs">
                        <div className="sm:col-span-3 space-y-2">
                          <div className="grid grid-cols-2 gap-2 border-b border-gray-100 pb-1.5">
                            <div>
                              <span className="text-gray-400 block text-[10px] uppercase font-bold">Candidate Name</span>
                              <strong className="text-gray-900 uppercase text-sm">{admitResult.applicant.applicant_name}</strong>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[10px] uppercase font-bold">Roll Number</span>
                              <strong className="font-mono text-emerald-700 font-black text-sm">
                                {admitResult.admit_card.roll_number}
                              </strong>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 border-b border-gray-100 pb-1.5">
                            <div>
                              <span className="text-gray-400 block text-[10px] uppercase font-bold">Application Number</span>
                              <strong className="font-mono">{admitResult.applicant.application_no}</strong>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[10px] uppercase font-bold">Registration Code</span>
                              <strong className="font-mono text-purple-700">{admitResult.applicant.registration_code}</strong>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-1.5">
                            <div>
                              <span className="text-gray-400 block text-[10px] uppercase font-bold">Father&apos;s Name</span>
                              <strong className="text-gray-800">{admitResult.applicant.father_name || 'Guardian'}</strong>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[10px] uppercase font-bold">Date of Birth</span>
                              <strong className="text-gray-800">{admitResult.applicant.dob || '2006-05-15'}</strong>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[10px] uppercase font-bold">Category</span>
                              <strong className="text-gray-800">{admitResult.applicant.category}</strong>
                            </div>
                          </div>

                          <div>
                            <span className="text-gray-400 block text-[10px] uppercase font-bold">Academic Stream</span>
                            <strong className="text-gray-800">{admitResult.applicant.qualification} ({admitResult.applicant.school_college_name || 'Verified School'})</strong>
                          </div>
                        </div>

                        {/* Display Uploaded Candidate Photo */}
                        <div className="flex flex-col items-center justify-center space-y-1 mx-auto sm:ml-auto">
                          <div className="w-28 h-36 border-2 border-gray-800 rounded-xl overflow-hidden bg-gray-100 shadow-sm relative">
                            <img
                              src={admitResult.applicant.photo_url || DEFAULT_SAMPLE_PHOTOS[0]}
                              alt={admitResult.applicant.applicant_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wider">
                            ✓ Verified Photo
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-100/90 rounded-2xl border border-gray-200 space-y-1.5 text-xs">
                        <div>
                          <span className="text-gray-500 font-bold">Allocated Center / Platform: </span>
                          <span className="text-gray-900 font-semibold">{admitResult.admit_card.exam_center}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 font-bold">Exam Date & Time Slot: </span>
                          <span className="text-gray-900 font-semibold">{admitResult.admit_card.exam_slot}</span>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="space-y-1 text-[11px] text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="font-bold text-gray-800 uppercase text-[10px]">Mandatory Instructions:</div>
                        {admitResult.admit_card.instructions.map((inst: string, i: number) => (
                          <div key={i}>• {inst}</div>
                        ))}
                      </div>

                      {/* Footer / Barcode & Signature */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-xs">
                        <div className="space-y-1">
                          <div className="font-mono text-[10px] tracking-widest text-gray-700 bg-gray-100 px-3 py-1.5 rounded border border-gray-300">
                            ||||| ||| ||||| || |||||| |
                          </div>
                          <div className="text-[9px] text-gray-400 font-mono">ID: {admitResult.applicant.id}</div>
                        </div>

                        <div className="flex gap-6 items-end">
                          <div className="text-center">
                            <div className="w-24 h-8 border-b border-gray-400 flex items-center justify-center">
                              <span className="text-[10px] italic font-serif text-gray-600">Candidate Sign</span>
                            </div>
                            <div className="text-[9px] text-gray-400 mt-0.5">Candidate Signature</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900 text-[11px] underline">Controller of Examinations</div>
                            <div className="text-[10px] text-emerald-700 font-bold">Digitally Released & Stamped</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2 no-print">
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                        >
                          <Printer size={15} /> Print / Save Official Hall Ticket
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Provisional Notice */
                  <div className="p-8 rounded-3xl bg-amber-50 border border-amber-200 text-center space-y-4">
                    <Clock size={44} className="text-amber-600 mx-auto animate-pulse" />
                    <h3 className="font-bold text-amber-900 text-lg">Provisional Registration Confirmed!</h3>
                    <p className="text-xs text-amber-800 max-w-lg mx-auto leading-relaxed">
                      Your application <strong>{admitResult.applicant.application_no}</strong> is verified in the system. Official Hall Tickets are being approved in bulk by the Superadmin Examination Board.
                    </p>

                    <div className="p-4 bg-white rounded-2xl border border-amber-200 max-w-md mx-auto text-xs text-left flex gap-4 items-center">
                      <div className="w-16 h-20 border border-gray-200 rounded-lg overflow-hidden shrink-0 bg-gray-50">
                        <img
                          src={admitResult.applicant.photo_url || DEFAULT_SAMPLE_PHOTOS[0]}
                          alt={admitResult.applicant.applicant_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Applicant:</span>
                          <strong>{admitResult.applicant.applicant_name}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Security Code:</span>
                          <strong className="font-mono text-purple-700">{admitResult.applicant.registration_code}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Scheduled Exam Date:</span>
                          <strong>{admitResult.scholarship.exam_date}</strong>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500">
                      Please check back soon. Once Superadmin approves the batch, your official Roll Number and Hall Ticket with your photo will unlock here immediately.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 4: DIRECT STUDENT CHECK RESULT & OFFICIAL SCORECARD */}
      {activeTab === 'results' && (
        <section className="py-12 pb-24 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Result Search Card */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-8 shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
                Official Examination Results Desk
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-gray-900">
                Check Examination Result & Scorecard
              </h2>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Enter your <strong>Admit Card Roll Number</strong> or <strong>Application Number</strong> to fetch your official marksheet, merit rank, and scholarship grant entitlement.
              </p>
            </div>

            <form onSubmit={handleCheckStudentScorecard} className="space-y-4 max-w-xl mx-auto">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Roll Number / Application Number / Registered Email *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. AAGAJ-26-5467 or SCH-2026-2378"
                    value={resultLookupInput}
                    onChange={(e) => setResultLookupInput(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl bg-white text-gray-900 placeholder:text-gray-400 border-2 border-gray-200 text-sm font-mono font-bold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                  {resultLookupInput && (
                    <button
                      type="button"
                      onClick={() => setResultLookupInput('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={resultLookupLoading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Search size={18} />
                {resultLookupLoading ? 'Verifying Examination Records...' : 'Search & Fetch Official Scorecard'}
              </button>
            </form>

            {resultLookupError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 max-w-xl mx-auto">
                <AlertCircle size={18} className="text-red-500 shrink-0" />
                <div>
                  <div className="font-bold">Record Not Found</div>
                  <div>{resultLookupError}</div>
                </div>
              </div>
            )}
          </div>

          {/* Official Candidate Examination Scorecard */}
          {studentScorecard && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Embedded Print Stylesheet for Official Scorecard */}
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  html, body {
                    background: #fff !important;
                    color: #000 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                  }
                  body * {
                    visibility: hidden !important;
                  }
                  #official-scorecard-certificate, #official-scorecard-certificate * {
                    visibility: visible !important;
                  }
                  #official-scorecard-certificate {
                    position: fixed !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 0 !important;
                    padding: 24px !important;
                    border: 3px double #1e3a8a !important;
                    background: #fff !important;
                  }
                }
              `}} />

              {/* Action Bar */}
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-bold text-gray-700">Official Institutional Scorecard Loaded</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                  >
                    <Download size={14} />
                    Print Scorecard (PDF)
                  </button>
                  <button
                    onClick={() => setStudentScorecard(null)}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all flex items-center gap-1"
                  >
                    <X size={14} />
                    Close
                  </button>
                </div>
              </div>

              {/* Official Certificate Card */}
              <div
                id="official-scorecard-certificate"
                className="bg-white rounded-3xl border-4 border-double border-indigo-900/40 p-8 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden"
              >
                {/* Background Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none font-black text-8xl text-indigo-950 rotate-[-25deg]">
                  AAGAJ MERIT
                </div>

                {/* Scorecard Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b-2 border-indigo-900/20">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-900 text-amber-400 flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
                      🏆
                    </div>
                    <div>
                      <span className="text-[11px] font-black tracking-widest text-indigo-900 uppercase">
                        AAGAJ NATIONAL SCHOLARSHIP & MERIT COUNCIL
                      </span>
                      <h3 className="text-xl sm:text-2xl font-heading font-black text-gray-900">
                        Candidate Examination Scorecard & Merit Certificate
                      </h3>
                      <p className="text-[11px] text-gray-500 font-medium">
                        National Assessment & Academic Evaluation Directorate • Session 2026-27
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:self-center shrink-0">
                    <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      studentScorecard.is_released
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-sm'
                        : 'bg-amber-100 text-amber-900 border border-amber-300 shadow-sm'
                    }`}>
                      ● {studentScorecard.result_status}
                    </span>
                    <div className="text-[10px] text-gray-400 font-mono mt-1">
                      Issue Ref: {studentScorecard.award_disbursement_ref}
                    </div>
                  </div>
                </div>

                {/* Candidate Bio & Examination Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start bg-gray-50/80 p-6 rounded-2xl border border-gray-200">
                  {/* Photo with Verified Badge */}
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="w-28 h-32 rounded-2xl overflow-hidden bg-white border-2 border-indigo-900/30 shadow-md relative">
                      <img
                        src={studentScorecard.photo_url}
                        alt={studentScorecard.applicant_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck size={11} /> Verified Candidate
                    </span>
                  </div>

                  {/* Candidate Bio Information */}
                  <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-xs">
                    <div>
                      <span className="text-gray-400 font-semibold block text-[10px] uppercase">Candidate Name</span>
                      <strong className="text-gray-900 text-base font-heading font-black">{studentScorecard.applicant_name}</strong>
                    </div>

                    <div>
                      <span className="text-gray-400 font-semibold block text-[10px] uppercase">Examination Roll Number</span>
                      <strong className="font-mono text-indigo-900 text-sm font-black">{studentScorecard.roll_number}</strong>
                    </div>

                    <div>
                      <span className="text-gray-400 font-semibold block text-[10px] uppercase">Application Reference No</span>
                      <span className="font-mono font-bold text-gray-700">{studentScorecard.application_no}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 font-semibold block text-[10px] uppercase">Security Registration Code</span>
                      <span className="font-mono font-bold text-purple-700">{studentScorecard.registration_code}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 font-semibold block text-[10px] uppercase">Father&apos;s Name / DOB</span>
                      <span className="text-gray-800 font-bold">{studentScorecard.father_name || 'N/A'} • {studentScorecard.dob || '2006-05-15'}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 font-semibold block text-[10px] uppercase">Academic Stream & Institution</span>
                      <span className="text-gray-800 font-bold">{studentScorecard.qualification} • {studentScorecard.school_college_name || 'Affiliated Institution'}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 font-semibold block text-[10px] uppercase">Scholarship Program</span>
                      <strong className="text-[#FF2D8D] font-bold">{studentScorecard.scholarship_title}</strong>
                    </div>

                    <div>
                      <span className="text-gray-400 font-semibold block text-[10px] uppercase">Exam Center & Date</span>
                      <span className="text-gray-800 font-bold">{studentScorecard.exam_center} ({studentScorecard.exam_date})</span>
                    </div>
                  </div>
                </div>

                {/* Performance & Marks Breakdown Table */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gradient-to-r from-indigo-900 to-blue-900 text-white text-[11px] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-3.5">Assessment Section</th>
                        <th className="px-6 py-3.5 text-center">Maximum Marks</th>
                        <th className="px-6 py-3.5 text-center">Marks Scored</th>
                        <th className="px-6 py-3.5 text-center">Percentage</th>
                        <th className="px-6 py-3.5 text-right">All-India Merit Rank</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white font-medium">
                      <tr>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 text-sm">National Scholarship Assessment Test (Online/Offline)</div>
                          <div className="text-[11px] text-gray-400">Section A: General Aptitude • Section B: Technical Core Stream</div>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-gray-600 font-mono text-sm">
                          {studentScorecard.total_marks || 100}.00
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-black text-emerald-600 text-lg font-mono">
                            {studentScorecard.exam_marks != null ? Number(studentScorecard.exam_marks).toFixed(2) : '0.00'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-black text-indigo-900 text-base font-mono">
                          {studentScorecard.percentage_score}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-xs shadow-sm ${
                            studentScorecard.rank === 1
                              ? 'bg-amber-500 text-white shadow-amber-500/30'
                              : studentScorecard.rank === 2
                              ? 'bg-gray-400 text-white'
                              : studentScorecard.rank === 3
                              ? 'bg-amber-700 text-white'
                              : 'bg-indigo-900 text-white'
                          }`}>
                            🏆 Rank #{studentScorecard.rank || '1'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Award Entitlement & Status Banner */}
                <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 rounded-2xl border-2 border-emerald-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-600 text-white">
                        ✓ QUALIFIED & AWARDED
                      </span>
                      <span className="text-xs font-bold text-gray-500">Official Institutional Benefit</span>
                    </div>
                    <div className="text-lg font-heading font-black text-emerald-950">
                      {studentScorecard.award_amount || '100% Tuition Fee Waiver + Merit Living Allowance'}
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                    <div className="text-right font-mono text-xs text-gray-600">
                      <div>Disbursement Ref: <strong className="text-indigo-900">{studentScorecard.award_disbursement_ref}</strong></div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Declared: {new Date(studentScorecard.released_at).toLocaleDateString()}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowChequeModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-black rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                    >
                      🏆 View Official Award Cheque & Certificate
                    </button>
                  </div>
                </div>

                {/* 1. LMS 100% Course Fee Waiver Key & Claim Box */}
                {studentScorecard.award_voucher_code && (
                  <div className="p-5 bg-purple-50 rounded-2xl border-2 border-purple-200 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-purple-200 text-purple-900">
                          🎓 100% FREE COURSE ENROLLMENT KEY
                        </span>
                        <h4 className="font-heading font-black text-purple-950 text-base mt-1">
                          Your Exclusive Scholarship Course Voucher
                        </h4>
                        <p className="text-xs text-purple-700">
                          Use this scholarship voucher code during LMS checkout to enroll in any certified program for ₹0.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-purple-300 shadow-sm shrink-0">
                        <span className="font-mono font-black text-purple-950 text-sm tracking-wider">
                          {studentScorecard.award_voucher_code}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(studentScorecard.award_voucher_code)
                            setCopiedCourseVoucher(true)
                            setTimeout(() => setCopiedCourseVoucher(false), 2000)
                          }}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1"
                        >
                          {copiedCourseVoucher ? <Check size={12} /> : <Copy size={12} />}
                          {copiedCourseVoucher ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Cash Grant Payout Receipt or Bank Claim Form (For Rank #1, #2, #3) */}
                {studentScorecard.rank && studentScorecard.rank <= 3 && (
                  <div className="p-5 bg-emerald-50/80 rounded-2xl border-2 border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-emerald-200 text-emerald-950">
                        💰 CASH PRIZE DISBURSEMENT DESK
                      </span>
                      {studentScorecard.payout_details && (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                          ● Payout Processed (UTR: {studentScorecard.payout_details.bank_utr})
                        </span>
                      )}
                    </div>

                    {studentScorecard.bank_details ? (
                      <div className="bg-white p-4 rounded-xl border border-emerald-200 text-xs space-y-1">
                        <div className="font-bold text-gray-800">Your Registered Beneficiary Account for Cash Grant:</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-gray-600 text-[11px] pt-1">
                          <div>Bank: <strong>{studentScorecard.bank_details.bank_name || 'N/A'}</strong></div>
                          <div>A/C: <strong className="font-mono">{studentScorecard.bank_details.account_number}</strong></div>
                          <div>IFSC: <strong className="font-mono">{studentScorecard.bank_details.ifsc_code}</strong></div>
                          <div>UPI: <strong className="font-mono text-purple-700">{studentScorecard.bank_details.upi_id || 'N/A'}</strong></div>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitBankClaim} className="bg-white p-4 rounded-2xl border border-emerald-200 space-y-3">
                        <div className="space-y-0.5">
                          <div className="font-bold text-emerald-950 text-sm">
                            🏆 Claim Your Cash Prize Transfer:
                          </div>
                          <p className="text-xs text-gray-500">
                            Please provide your Bank Account or UPI ID. The finance council will transfer your cash prize directly.
                          </p>
                        </div>

                        {bankSuccessMsg && (
                          <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                            <CheckCircle2 size={16} /> {bankSuccessMsg}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Bank Name *</label>
                            <input
                              type="text"
                              required
                              value={bankClaimForm.bank_name}
                              onChange={(e) => setBankClaimForm({ ...bankClaimForm, bank_name: e.target.value })}
                              placeholder="e.g. State Bank of India / HDFC"
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50/50"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Account Number *</label>
                            <input
                              type="text"
                              required
                              value={bankClaimForm.account_number}
                              onChange={(e) => setBankClaimForm({ ...bankClaimForm, account_number: e.target.value })}
                              placeholder="e.g. 102938475610"
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono bg-gray-50/50"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">IFSC Code *</label>
                            <input
                              type="text"
                              required
                              value={bankClaimForm.ifsc_code}
                              onChange={(e) => setBankClaimForm({ ...bankClaimForm, ifsc_code: e.target.value.toUpperCase() })}
                              placeholder="e.g. SBIN0001234"
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono uppercase bg-gray-50/50"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">UPI ID (Optional)</label>
                            <input
                              type="text"
                              value={bankClaimForm.upi_id}
                              onChange={(e) => setBankClaimForm({ ...bankClaimForm, upi_id: e.target.value })}
                              placeholder="e.g. username@okhdfcbank"
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono bg-gray-50/50"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={bankSubmitting}
                          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                        >
                          {bankSubmitting ? 'Saving Bank Details...' : '✓ Submit Bank Details for Cash Grant'}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* Footer Signatures & QR Code */}
                <div className="pt-6 border-t-2 border-indigo-900/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 border border-gray-300 rounded-xl p-1 shadow-inner flex items-center justify-center">
                      <QrCode size={48} className="text-indigo-950" />
                    </div>
                    <div className="space-y-0.5 text-[10px]">
                      <div className="font-bold text-gray-800">Tamper-Proof Digital Verification</div>
                      <div>Scan QR code on official portal to verify document authenticity.</div>
                      <div className="font-mono text-gray-400">UID: {studentScorecard.id}</div>
                    </div>
                  </div>

                  <div className="text-center sm:text-right space-y-1">
                    <div className="font-serif italic text-base font-bold text-indigo-950">Dr. Rajeshwari Sen</div>
                    <div className="text-[10px] font-bold uppercase text-gray-600 border-t border-gray-300 pt-1">
                      Controller of Examinations • National Evaluation Board
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </section>
      )}

      {/* TAB 5: TOP 3 WINNERS PODIUM & COMPLETE MERIT RANKINGS TABLE */}
      {activeTab === 'merit_list' && (
        <section className="py-12 pb-24 max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
          {/* 1. AUTOMATIC TOP 3 WINNERS PODIUM (VISIBLE ONCE RESULTS ARE RELEASED) */}
          {topThreeWinners.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl space-y-6">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest px-3 py-1 bg-amber-50 rounded-full border border-amber-200">
                  🏆 National Honor Roll
                </span>
                <h3 className="text-2xl sm:text-3xl font-heading font-black text-gray-900">
                  All-India Top 3 Scholarship Champions
                </h3>
                <p className="text-xs text-gray-500">
                  Congratulations to our top merit scorers receiving highest honors and cash grants!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-end">
                {/* 2nd Place (Silver) */}
                {topThreeWinners.find((w) => w.rank === 2) && (() => {
                  const silver = topThreeWinners.find((w) => w.rank === 2)!
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-b from-gray-50 to-slate-100 p-6 rounded-3xl border-2 border-gray-200 text-center space-y-3 shadow-md relative"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-400 text-white font-black text-sm flex items-center justify-center mx-auto shadow-sm">
                        🥈 #2
                      </div>
                      <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto border-2 border-gray-300 shadow-sm">
                        <img src={silver.photo_url} alt={silver.applicant_name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-base">{silver.applicant_name}</h4>
                        <p className="text-[11px] text-gray-500 font-mono">Roll: {silver.roll_number}</p>
                        <p className="text-xs text-[#FF2D8D] font-bold mt-1">{silver.scholarship_title}</p>
                      </div>
                      <div className="p-2.5 bg-white rounded-2xl border border-gray-200 space-y-0.5">
                        <div className="text-base font-black text-emerald-600">{silver.exam_marks} / 100</div>
                        <div className="text-[11px] font-extrabold text-purple-700">{silver.prize_amount}</div>
                      </div>
                    </motion.div>
                  )
                })()}

                {/* 1st Place (Gold Trophy - Highlighted Center) */}
                {topThreeWinners.find((w) => w.rank === 1) && (() => {
                  const gold = topThreeWinners.find((w) => w.rank === 1)!
                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-b from-amber-50 via-yellow-50 to-orange-50 p-8 rounded-3xl border-2 border-amber-300 text-center space-y-4 shadow-xl relative -mt-4"
                    >
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-md">
                        🥇 1st Prize Champion
                      </div>
                      <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto border-4 border-amber-400 shadow-lg mt-2">
                        <img src={gold.photo_url} alt={gold.applicant_name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-heading font-black text-gray-900 text-lg">{gold.applicant_name}</h4>
                        <p className="text-xs text-gray-600 font-mono">Roll: {gold.roll_number}</p>
                        <p className="text-xs text-[#FF2D8D] font-black mt-1">{gold.scholarship_title}</p>
                      </div>
                      <div className="p-3.5 bg-white/90 rounded-2xl border border-amber-200 space-y-1 shadow-sm">
                        <div className="text-2xl font-black text-emerald-600">{gold.exam_marks} / 100</div>
                        <div className="text-xs font-black text-amber-700">{gold.prize_amount}</div>
                      </div>
                    </motion.div>
                  )
                })()}

                {/* 3rd Place (Bronze) */}
                {topThreeWinners.find((w) => w.rank === 3) && (() => {
                  const bronze = topThreeWinners.find((w) => w.rank === 3)!
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-b from-amber-50/50 to-orange-100/40 p-6 rounded-3xl border-2 border-amber-200 text-center space-y-3 shadow-md relative"
                    >
                      <div className="w-10 h-10 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center mx-auto shadow-sm">
                        🥉 #3
                      </div>
                      <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto border-2 border-amber-300 shadow-sm">
                        <img src={bronze.photo_url} alt={bronze.applicant_name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-base">{bronze.applicant_name}</h4>
                        <p className="text-[11px] text-gray-500 font-mono">Roll: {bronze.roll_number}</p>
                        <p className="text-xs text-[#FF2D8D] font-bold mt-1">{bronze.scholarship_title}</p>
                      </div>
                      <div className="p-2.5 bg-white rounded-2xl border border-amber-100 space-y-0.5">
                        <div className="text-base font-black text-emerald-600">{bronze.exam_marks} / 100</div>
                        <div className="text-[11px] font-extrabold text-amber-800">{bronze.prize_amount}</div>
                      </div>
                    </motion.div>
                  )
                })()}
              </div>
            </div>
          )}

          {/* 2. COMPLETE MERIT RANKINGS TABLE */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest px-3 py-1 bg-blue-50 rounded-full">
                  Categorized Examination Results Desk
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mt-1">Official Scholarship Merit Rankings</h2>
                <p className="text-xs text-gray-500">Select any scholarship exam scheme below to view its specific merit ranks & awards.</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3.5 top-3 text-gray-400" size={15} />
                  <input
                    type="text"
                    placeholder="Search candidate, Roll..."
                    value={meritQuery}
                    onChange={(e) => setMeritQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchMeritList()}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
                <button
                  onClick={fetchMeritList}
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Search
                </button>
              </div>
            </div>

            {/* SCHOLARSHIP SCHEME TABS */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setMeritSchemeFilter('all')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  meritSchemeFilter === 'all'
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>🏆 All Schemes</span>
              </button>

              {scholarships.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setMeritSchemeFilter(s.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    meritSchemeFilter === s.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 uppercase font-semibold">
                    {s.category}
                  </span>
                  <span>{s.title}</span>
                </button>
              ))}
            </div>

            {/* Active Selected Scheme Detail Banner */}
            {meritSchemeFilter !== 'all' && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                {(() => {
                  const activeScheme = scholarships.find((s) => s.id === meritSchemeFilter)
                  if (!activeScheme) return null
                  const isReleased = activeScheme.status === 'results_declared'
                  return (
                    <>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-600 text-white">
                            {activeScheme.category}
                          </span>
                          <h4 className="font-bold text-gray-900 text-sm">{activeScheme.title}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isReleased ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isReleased ? '● Official Results Declared' : '● Evaluation In Progress'}
                          </span>
                        </div>
                        <p className="text-xs text-[#FF2D8D] font-bold">{activeScheme.scholarship_value}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs shrink-0">
                        <span className="text-gray-500">Qualifying Cutoff: <strong className="text-emerald-700">≥ 50%</strong></span>
                        <span className="text-gray-500">Ranked: <strong className="text-gray-900">{meritList.length} Scholars</strong></span>
                      </div>
                    </>
                  )
                })()}
              </div>
            )}

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50/80 text-[11px] uppercase font-bold text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Merit Rank</th>
                      <th className="px-6 py-4">Scholar Candidate</th>
                      <th className="px-6 py-4">Scholarship Exam Scheme</th>
                      <th className="px-6 py-4">Exam Score (/100)</th>
                      <th className="px-6 py-4">Merit Status</th>
                      <th className="px-6 py-4 text-right">Award Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {meritList.length > 0 ? (
                      meritList.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-sm ${
                              item.rank === 1
                                ? 'bg-amber-500 text-white shadow-amber-500/30'
                                : item.rank === 2
                                ? 'bg-gray-400 text-white'
                                : item.rank === 3
                                ? 'bg-amber-700 text-white'
                                : 'bg-blue-600 text-white'
                            }`}>
                              #{item.rank}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {item.photo_url && (
                                <div className="w-7 h-7 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                                  <img src={item.photo_url} alt={item.applicant_name} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-gray-900 text-sm">{item.applicant_name}</div>
                                <div className="font-mono text-gray-400 text-[11px]">Roll: {item.roll_number}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-[#FF2D8D]">{item.scholarship_title}</td>
                          <td className="px-6 py-4">
                            <div className="font-black text-emerald-600 text-base">{item.exam_marks} / 100</div>
                            <span className="text-[10px] text-emerald-700 font-bold uppercase">● Qualified</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800">
                              {item.award_status === 'awarded' ? 'Grant Disbursed' : 'In Verification'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="font-bold text-gray-900">{item.award_amount}</div>
                            <div className="font-mono text-[10px] text-gray-400">{item.award_disbursement_ref}</div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          {meritSchemeFilter !== 'all' && scholarships.find((s) => s.id === meritSchemeFilter)?.status !== 'results_declared'
                            ? '⏳ Examination results for this scheme are currently under evaluation. Once released by Superadmin, the official merit list and awards will be published here.'
                            : 'No published merit results found for the selected filter.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* COMPREHENSIVE MULTI-SECTION APPLICATION & PAYMENT MODAL */}
      {mounted && selectedScheme && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-0 sm:p-4 md:p-6 lg:p-8 overflow-y-auto animate-in fade-in duration-200"
          style={{
            backgroundColor: 'rgba(5, 8, 20, 0.88)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
          }}
        >
          <div className="bg-white sm:rounded-3xl rounded-none max-w-6xl w-full h-full sm:h-auto sm:max-h-[94vh] p-4 sm:p-7 md:p-8 shadow-2xl border border-gray-100 flex flex-col overflow-hidden relative">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100 shrink-0">
              <div>
                <span className="text-[10px] font-bold text-[#FF2D8D] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-pink-50 border border-pink-100">
                  Candidate Intake Registration
                </span>
                <h3 className="text-lg sm:text-2xl font-heading font-black text-gray-900 mt-1">
                  {selectedScheme.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs text-[#FF2D8D] font-extrabold">{selectedScheme.scholarship_value}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-[11px] font-bold text-purple-700 uppercase bg-purple-50 px-2 py-0.5 rounded-md">
                    Category: {selectedScheme.category}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-[11px] font-bold text-gray-600">
                    Fee: <strong className="text-gray-900">{selectedScheme.application_fee === 0 ? 'FREE (₹0)' : `₹${selectedScheme.application_fee}`}</strong>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedScheme(null)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-all text-base sm:text-lg font-bold shrink-0 ml-2"
                title="Close Form"
              >
                ✕
              </button>
            </div>

            {/* Form Navigation Tabs */}
            {applyStep === 'form' && (
              <div className="grid grid-cols-3 border-b border-gray-200 text-xs font-bold text-center mt-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setFormSection('personal')}
                  className={`pb-3 transition-all border-b-2 flex items-center justify-center gap-2 ${
                    formSection === 'personal'
                      ? 'border-[#FF2D8D] text-[#FF2D8D]'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    formSection === 'personal' ? 'bg-[#FF2D8D] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>1</span>
                  <span>Personal Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormSection('academic')}
                  className={`pb-3 transition-all border-b-2 flex items-center justify-center gap-2 ${
                    formSection === 'academic'
                      ? 'border-[#FF2D8D] text-[#FF2D8D]'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    formSection === 'academic' ? 'bg-[#FF2D8D] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>2</span>
                  <span>Academic Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormSection('documents')}
                  className={`pb-3 transition-all border-b-2 flex items-center justify-center gap-2 ${
                    formSection === 'documents'
                      ? 'border-[#FF2D8D] text-[#FF2D8D]'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    formSection === 'documents' ? 'bg-[#FF2D8D] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>3</span>
                  <span>Uploads & Centers</span>
                </button>
              </div>
            )}

            {/* Modal Body Container */}
            <div className="overflow-y-auto pr-1 sm:pr-2 pt-4 flex-1">
              
              {/* STEP 1: MULTI-STAGE APPLICANT FORM */}
              {applyStep === 'form' && (
                <div className="space-y-6">
                  {/* SECTION 1: PERSONAL DETAILS & REGISTRATION CHANNEL */}
                  {formSection === 'personal' && (
                    <form onSubmit={handleContinueToAcademic} className="space-y-5">
                      {/* Registration Intake Channel Selector */}
                      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-purple-50/90 via-pink-50/70 to-blue-50/90 rounded-2xl border border-purple-100 shadow-xs space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div>
                            <span className="text-[10px] font-extrabold text-[#9C27FF] uppercase tracking-wider block">
                              Application Intake Channel
                            </span>
                            <p className="text-xs text-gray-800 font-bold">
                              How are you applying for this scholarship?
                            </p>
                          </div>

                          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-purple-200 shadow-xs shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setApplicantType('DIRECT')
                                setVerifiedSchool(null)
                                setSchoolVerifyError(null)
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                                applicantType === 'DIRECT'
                                  ? 'bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white shadow-xs'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              👤 Individual Direct
                            </button>

                            <button
                              type="button"
                              onClick={() => setApplicantType('SCHOOL_PARTNER')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 ${
                                applicantType === 'SCHOOL_PARTNER'
                                  ? 'bg-gradient-to-r from-[#9C27FF] to-[#0070F3] text-white shadow-xs'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              🎓 Apply via School Partner
                            </button>
                          </div>
                        </div>

                        {/* School Partner Verification Card */}
                        {applicantType === 'SCHOOL_PARTNER' && (
                          <div className="p-3.5 bg-white rounded-2xl border-2 border-dashed border-purple-300 space-y-3.5 animate-in fade-in duration-200">
                            <div>
                              <label className="block text-xs font-extrabold text-gray-800 uppercase mb-1">
                                Enter Official School ID (Provided by School / Superadmin) *
                              </label>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                  type="text"
                                  placeholder="e.g. SCH000105 / SCH000101"
                                  value={schoolInputId}
                                  onChange={(e) => {
                                    setSchoolInputId(e.target.value.toUpperCase())
                                    setSchoolVerifyError(null)
                                  }}
                                  className="flex-1 px-4 py-2.5 border border-purple-200 rounded-xl text-xs font-mono font-black uppercase focus:ring-2 focus:ring-purple-500 bg-purple-50/20"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleVerifySchoolId()}
                                  disabled={schoolVerifying || !schoolInputId.trim()}
                                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all disabled:opacity-50 shrink-0"
                                >
                                  {schoolVerifying ? 'Verifying School...' : 'Verify School ID'}
                                </button>
                              </div>
                            </div>

                            {schoolVerifyError && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-start gap-2">
                                <span className="text-base">⚠️</span>
                                <span>{schoolVerifyError}</span>
                              </div>
                            )}

                            {verifiedSchool && (
                              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                                    <span>✅ Verified School Partner:</span>
                                    <span className="text-emerald-700">{verifiedSchool.name}</span>
                                  </div>
                                  <span className="text-[10px] font-mono font-black bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full self-start sm:self-auto border border-emerald-300">
                                    ID: {verifiedSchool.school_id}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-emerald-800">
                                  <span>Board: <strong>{verifiedSchool.board}</strong></span>
                                  <span>Location: <strong>{verifiedSchool.city}, {verifiedSchool.state}</strong></span>
                                  <span>Type: <strong>{verifiedSchool.school_type}</strong></span>
                                  {verifiedSchool.udise_code && <span>UDISE: <strong>{verifiedSchool.udise_code}</strong></span>}
                                </div>
                              </div>
                            )}

                            {/* School Student Enrollment Credentials */}
                            {verifiedSchool && (
                              <div className="pt-2 border-t border-gray-100 space-y-2.5">
                                <span className="text-xs font-extrabold text-gray-800 uppercase tracking-wider block">
                                  Student School Roster Identification:
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                                      Class Roll Number *
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. 24 / ROLL-102"
                                      value={schoolStudentInfo.roll_no}
                                      onChange={(e) => setSchoolStudentInfo({ ...schoolStudentInfo, roll_no: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono bg-white focus:ring-2 focus:ring-purple-400"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                                      Admission / S.R. No *
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. ADM-2024-889"
                                      value={schoolStudentInfo.admission_no}
                                      onChange={(e) => setSchoolStudentInfo({ ...schoolStudentInfo, admission_no: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono bg-white focus:ring-2 focus:ring-purple-400"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                                      Class / Standard *
                                    </label>
                                    <select
                                      value={schoolStudentInfo.class_name}
                                      onChange={(e) => setSchoolStudentInfo({ ...schoolStudentInfo, class_name: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold bg-white"
                                    >
                                      <option value="6th">6th Standard</option>
                                      <option value="7th">7th Standard</option>
                                      <option value="8th">8th Standard</option>
                                      <option value="9th">9th Standard</option>
                                      <option value="10th">10th Standard</option>
                                      <option value="11th (Science)">11th (Science PCM/PCB)</option>
                                      <option value="11th (Commerce/Arts)">11th (Commerce/Arts)</option>
                                      <option value="12th (PCM)">12th (PCM)</option>
                                      <option value="12th (PCB)">12th (PCB)</option>
                                      <option value="12th (Commerce/Arts)">12th (Commerce/Arts)</option>
                                      <option value="Undergraduate">Undergraduate Degree</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                                      Section *
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. A / B / C"
                                      value={schoolStudentInfo.section}
                                      onChange={(e) => setSchoolStudentInfo({ ...schoolStudentInfo, section: e.target.value.toUpperCase() })}
                                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold uppercase bg-white focus:ring-2 focus:ring-purple-400"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="p-4 sm:p-5 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-4">
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                          1. Candidate Personal & Family Identification
                        </span>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Legal Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Aanya Sharma"
                              value={applicantForm.applicant_name}
                              onChange={(e) => setApplicantForm({ ...applicantForm, applicant_name: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Father&apos;s / Guardian&apos;s Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Rajesh Sharma"
                              value={applicantForm.father_name}
                              onChange={(e) => setApplicantForm({ ...applicantForm, father_name: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Date of Birth *</label>
                            <input
                              type="date"
                              required
                              value={applicantForm.dob}
                              onChange={(e) => setApplicantForm({ ...applicantForm, dob: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Gender *</label>
                            <select
                              value={applicantForm.gender}
                              onChange={(e) => setApplicantForm({ ...applicantForm, gender: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs bg-white font-semibold"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category *</label>
                            <select
                              value={applicantForm.category}
                              onChange={(e) => setApplicantForm({ ...applicantForm, category: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs bg-white font-semibold"
                            >
                              <option value="General">General</option>
                              <option value="OBC">OBC</option>
                              <option value="SC">SC</option>
                              <option value="ST">ST</option>
                              <option value="EWS">EWS</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Contact Mobile Number *</label>
                            <input
                              type="tel"
                              required
                              placeholder="e.g. +91 9876543210"
                              value={applicantForm.applicant_phone}
                              onChange={(e) => setApplicantForm({ ...applicantForm, applicant_phone: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Registered Email *</label>
                            <input
                              type="email"
                              required
                              placeholder="e.g. aanya@example.com"
                              value={applicantForm.applicant_email}
                              onChange={(e) => setApplicantForm({ ...applicantForm, applicant_email: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Complete Residential Address *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. House No. 42, Sector 15, Near City Centre"
                            value={applicantForm.address}
                            onChange={(e) => setApplicantForm({ ...applicantForm, address: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">City *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. New Delhi"
                              value={applicantForm.city}
                              onChange={(e) => setApplicantForm({ ...applicantForm, city: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">State *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Delhi"
                              value={applicantForm.state}
                              onChange={(e) => setApplicantForm({ ...applicantForm, state: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">PIN Code *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 110001"
                              value={applicantForm.pincode}
                              onChange={(e) => setApplicantForm({ ...applicantForm, pincode: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-3.5 pb-1 border-t border-gray-100 flex justify-end">
                        <button
                          type="submit"
                          className="px-8 py-3 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-xs font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          Save & Continue to Academic Info <ArrowRight size={14} />
                        </button>
                      </div>
                    </form>
                  )}

                  {/* SECTION 2: ACADEMIC DETAILS */}
                  {formSection === 'academic' && (
                    <form onSubmit={handleContinueToDocuments} className="space-y-5">
                      <div className="p-4 sm:p-5 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/70 pb-3">
                          <div>
                            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                              2. Educational & Academic Record Verification
                            </span>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Please provide complete institutional, board, and marks percentage details for each standard required by this scholarship.
                            </p>
                          </div>
                          <span className="text-xs font-extrabold text-[#FF2D8D] bg-pink-50 border border-pink-200 px-3 py-1 rounded-full shrink-0">
                            {academicRecords.length} Qualification Standards Required
                          </span>
                        </div>

                        {/* List of Dynamic Qualification Standard Cards */}
                        <div className="space-y-4">
                          {academicRecords.map((record, index) => (
                            <div
                              key={record.id}
                              className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3 relative transition-all hover:border-[#FF2D8D]/40"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                                    {index + 1}
                                  </span>
                                  <span className="font-extrabold text-gray-900 text-sm">
                                    {record.qualification} Standard / Degree Record
                                  </span>
                                  {!record.is_custom ? (
                                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md">
                                      Mandatory Standard
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                                      Additional Qualification
                                    </span>
                                  )}
                                </div>

                                {record.is_custom && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAcademicRecord(record.id)}
                                    className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                                    title="Remove this record"
                                  >
                                    ✕ Remove
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
                                {/* School / College Name */}
                                <div className="sm:col-span-2">
                                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                    School / College / Institute Name *
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    placeholder={
                                      record.qualification.toLowerCase().includes('10th')
                                        ? 'e.g. Delhi Public School / St. Mary High School'
                                        : record.qualification.toLowerCase().includes('12th')
                                        ? 'e.g. Junior College / Senior Secondary School'
                                        : 'e.g. IIT / NIT / State University'
                                    }
                                    value={record.institution}
                                    onChange={(e) => handleUpdateAcademicRecord(record.id, 'institution', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                                  />
                                </div>

                                {/* Board / University */}
                                <div>
                                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                    Board / University *
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="e.g. CBSE / ICSE / State Board / AKTU"
                                    value={record.board_university}
                                    onChange={(e) => handleUpdateAcademicRecord(record.id, 'board_university', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                                  />
                                </div>

                                {/* Roll Number / Reg No */}
                                <div>
                                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                    Roll No / Reg No
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. 12489201"
                                    value={record.roll_no}
                                    onChange={(e) => handleUpdateAcademicRecord(record.id, 'roll_no', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono bg-white"
                                  />
                                </div>

                                {/* Passing Year */}
                                <div>
                                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                    Passing Year *
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="e.g. 2022 / 2024"
                                    value={record.passing_year}
                                    onChange={(e) => handleUpdateAcademicRecord(record.id, 'passing_year', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono bg-white"
                                  />
                                </div>

                                {/* Marks Obtained (Optional) */}
                                <div>
                                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                    Marks Obtained (Optional)
                                  </label>
                                  <input
                                    type="number"
                                    step="1"
                                    placeholder="e.g. 465"
                                    value={record.marks_obtained || ''}
                                    onChange={(e) => handleUpdateAcademicRecord(record.id, 'marks_obtained', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                                  />
                                </div>

                                {/* Total Marks (Optional) */}
                                <div>
                                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                    Max / Total Marks
                                  </label>
                                  <input
                                    type="number"
                                    step="1"
                                    placeholder="e.g. 500"
                                    value={record.total_marks || ''}
                                    onChange={(e) => handleUpdateAcademicRecord(record.id, 'total_marks', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                                  />
                                </div>

                                {/* Final Percentage (%) / CGPA */}
                                <div>
                                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                    Percentage (%) / CGPA *
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    max={100}
                                    required
                                    placeholder="e.g. 88.50"
                                    value={record.percentage}
                                    onChange={(e) => handleUpdateAcademicRecord(record.id, 'percentage', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-[#FF2D8D] bg-white focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add Custom / Additional Degree Bar */}
                        <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="text-xs text-purple-900 font-medium">
                            Need to attach another qualification (e.g. Diploma, B.Tech, BCA, Postgrad)?
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <input
                              type="text"
                              placeholder="e.g. B.Tech / Diploma / BCA"
                              value={customQualName}
                              onChange={(e) => setCustomQualName(e.target.value)}
                              className="px-3 py-1.5 rounded-xl border border-purple-200 text-xs bg-white flex-1 sm:w-44"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  handleAddCustomAcademicRecord()
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleAddCustomAcademicRecord}
                              className="px-3.5 py-1.5 bg-[#9C27FF] hover:bg-[#8314e3] text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0"
                            >
                              + Add Degree
                            </button>
                          </div>
                        </div>

                        {/* Family Annual Income */}
                        <div className="pt-2">
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Annual Family Income (in Lakhs INR/year) *
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            required
                            placeholder="e.g. 4.5"
                            value={applicantForm.annual_family_income}
                            onChange={(e) => setApplicantForm({ ...applicantForm, annual_family_income: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">Used to evaluate merit & need-based scholarship quota allocations.</p>
                        </div>
                      </div>

                      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-3.5 pb-1 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setFormSection('personal')}
                          className="px-5 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-center"
                        >
                          ← Back to Personal Details
                        </button>
                        <button
                          type="submit"
                          className="px-8 py-3 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-xs font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          Save & Continue to Documents <ArrowRight size={14} />
                        </button>
                      </div>
                    </form>
                  )}

                  {/* SECTION 3: DOCUMENTS UPLOAD & EXAM VENUE */}
                  {formSection === 'documents' && (
                    <form onSubmit={handleProceedToPayment} className="space-y-5">
                      <div className="p-4 sm:p-5 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/70 pb-3">
                          <div>
                            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                              3. Mandatory Document Dossier & Examination Center Selection
                            </span>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Please upload all verification documents configured by Superadmin for this scholarship scheme, along with your passport photograph and signature.
                            </p>
                          </div>
                          <span className="text-xs font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full shrink-0">
                            {(() => {
                              const docs = (selectedScheme?.required_documents && selectedScheme.required_documents.length > 0)
                                ? selectedScheme.required_documents.filter(d => {
                                    const l = d.toLowerCase()
                                    return !l.includes('photo') && !l.includes('photograph') && !l.includes('signature') && !l.includes('sign')
                                  })
                                : ['10th / 12th Marksheet', 'Government Photo ID (Aadhaar/PAN)']
                              return `${docs.length} Scheme Docs + Photo & Sign`
                            })()}
                          </span>
                        </div>

                        {/* Dynamic Scheme Documents Grid */}
                        {(() => {
                          const schemeDocs = (selectedScheme?.required_documents && selectedScheme.required_documents.length > 0)
                            ? selectedScheme.required_documents.filter(d => {
                                const l = d.toLowerCase()
                                return !l.includes('photo') && !l.includes('photograph') && !l.includes('signature') && !l.includes('sign')
                              })
                            : ['10th / 12th Marksheet', 'Government Photo ID (Aadhaar/PAN)']

                          return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                              {schemeDocs.map((docName, index) => {
                                const isUploaded = !!uploadedDocs[docName] || (
                                  (docName.toLowerCase().includes('aadhaar') && !!applicantForm.aadhaar_url) ||
                                  (docName.toLowerCase().includes('marksheet') && !!applicantForm.marksheet_url) ||
                                  (docName.toLowerCase().includes('college') && !!applicantForm.college_id_url)
                                )

                                return (
                                  <div
                                    key={index}
                                    className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3 shadow-xs flex flex-col justify-between hover:border-[#FF2D8D]/40 transition-all"
                                  >
                                    <div>
                                      <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-bold text-gray-900 uppercase flex items-center gap-1.5 truncate">
                                          {docName.toLowerCase().includes('marksheet') ? (
                                            <GraduationCap size={14} className="text-purple-600 shrink-0" />
                                          ) : docName.toLowerCase().includes('income') ? (
                                            <Landmark size={14} className="text-emerald-600 shrink-0" />
                                          ) : docName.toLowerCase().includes('caste') ? (
                                            <ShieldCheck size={14} className="text-amber-600 shrink-0" />
                                          ) : (
                                            <FileText size={14} className="text-blue-600 shrink-0" />
                                          )}
                                          <span className="truncate">{index + 1}. {docName} *</span>
                                        </label>
                                      </div>
                                      <p className="text-[10px] text-gray-400">PDF / JPG / PNG (Max 5MB)</p>
                                    </div>

                                    <div className="space-y-2">
                                      <input
                                        type="file"
                                        id={`scheme-doc-upload-${index}`}
                                        onChange={(e) => handleDynamicDocUpload(docName, e)}
                                        accept=".pdf,image/*"
                                        className="hidden"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => document.getElementById(`scheme-doc-upload-${index}`)?.click()}
                                        className={`w-full py-2 border rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                                          isUploaded
                                            ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                                            : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800'
                                        }`}
                                      >
                                        <UploadCloud size={13} className={isUploaded ? 'text-emerald-600' : 'text-blue-600'} />
                                        {isUploaded ? 'Change Document' : `Upload ${docName.split(' ')[0]}`}
                                      </button>

                                      {isUploaded ? (
                                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 block text-center">
                                          ✓ Uploaded & Attached
                                        </span>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const sampleUrl = 'data:application/pdf;base64,sample_verified_doc'
                                            setUploadedDocs(prev => ({ ...prev, [docName]: sampleUrl }))
                                            const l = docName.toLowerCase()
                                            if (l.includes('aadhaar') || l.includes('id') || l.includes('pan')) setApplicantForm(prev => ({ ...prev, aadhaar_url: sampleUrl }))
                                            else if (l.includes('marksheet')) setApplicantForm(prev => ({ ...prev, marksheet_url: sampleUrl }))
                                            else if (l.includes('college') || l.includes('school id')) setApplicantForm(prev => ({ ...prev, college_id_url: sampleUrl }))
                                          }}
                                          className="text-[10px] text-blue-600 font-semibold hover:underline block text-center w-full"
                                        >
                                          + Quick Demo {docName.split(' ')[0]}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )
                        })()}

                        {/* Photo & Signature Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Photograph */}
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50/60 to-purple-50/60 border border-pink-100 space-y-3">
                            <label className="text-xs font-bold text-gray-800 uppercase flex items-center gap-1.5">
                              <Camera size={14} className="text-[#FF2D8D]" /> 4. Passport Photo *
                            </label>

                            <div className="flex items-center gap-3">
                              <div className="w-16 h-20 rounded-xl border-2 border-dashed border-[#FF2D8D]/40 bg-white overflow-hidden flex flex-col items-center justify-center shrink-0 shadow-xs">
                                {applicantForm.photo_url ? (
                                  <img
                                    src={applicantForm.photo_url}
                                    alt="Applicant Preview"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User size={20} className="text-gray-300" />
                                )}
                              </div>

                              <div className="space-y-2 flex-1">
                                <input
                                  type="file"
                                  ref={photoFileInputRef}
                                  onChange={(e) => handleFileUpload(e, 'photo_url')}
                                  accept="image/*"
                                  className="hidden"
                                />
                                <button
                                  type="button"
                                  onClick={() => photoFileInputRef.current?.click()}
                                  className="w-full py-2 px-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5 shadow-xs"
                                >
                                  <UploadCloud size={13} className="text-[#FF2D8D]" />
                                  Upload Photo
                                </button>

                                <div className="flex gap-2 items-center">
                                  <span className="text-[10px] text-gray-400">Sample:</span>
                                  {DEFAULT_SAMPLE_PHOTOS.slice(0, 3).map((url, i) => (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => setApplicantForm({ ...applicantForm, photo_url: url })}
                                      className={`w-6 h-6 rounded-full overflow-hidden border ${
                                        applicantForm.photo_url === url ? 'border-[#FF2D8D] scale-110' : 'opacity-60'
                                      }`}
                                    >
                                      <img src={url} alt="sample" className="w-full h-full object-cover" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Signature */}
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50/60 to-blue-50/60 border border-purple-100 space-y-3">
                            <label className="text-xs font-bold text-gray-800 uppercase flex items-center gap-1.5">
                              <Clock size={14} className="text-[#9C27FF]" /> 5. Candidate Signature *
                            </label>

                            <div className="space-y-2">
                              <input
                                type="file"
                                ref={signFileInputRef}
                                onChange={(e) => handleFileUpload(e, 'signature_url')}
                                accept="image/*"
                                className="hidden"
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => signFileInputRef.current?.click()}
                                  className="flex-1 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5 shadow-xs"
                                >
                                  <UploadCloud size={13} className="text-[#9C27FF]" />
                                  Upload Scan
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setApplicantForm({ ...applicantForm, signature_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="30"><text x="10" y="20" font-family="cursive" font-size="16" fill="%23333">Digital Signed</text></svg>' })}
                                  className="px-3 py-2 bg-purple-100 text-purple-800 text-xs font-bold rounded-xl hover:bg-purple-200"
                                >
                                  + E-Sign
                                </button>
                              </div>

                              {applicantForm.signature_url ? (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg block text-center border border-emerald-100">
                                  ✓ Signature Attached
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-400 block text-center">
                                  Upload scanned signature image or click + E-Sign
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Exam Center Selector */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold text-gray-800 uppercase">
                              Select Preferred Examination Center / Venue *
                            </label>
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                              Approved Assessment Centers
                            </span>
                          </div>
                          {(() => {
                            const centers = selectedScheme.exam_centers && selectedScheme.exam_centers.length > 0
                              ? selectedScheme.exam_centers
                              : (selectedScheme.exam_venue ? [selectedScheme.exam_venue] : ['National Proctored Online Assessment Hub'])
                            return (
                              <div className="relative">
                                <select
                                  required
                                  value={applicantForm.exam_city_preference || centers[0]}
                                  onChange={(e) => setApplicantForm({ ...applicantForm, exam_city_preference: e.target.value })}
                                  className="w-full pl-4 pr-10 py-3 rounded-2xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-900 bg-white shadow-xs focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D] cursor-pointer appearance-none"
                                >
                                  {centers.map((center, idx) => (
                                    <option key={idx} value={center}>
                                      📍 {center}
                                    </option>
                                  ))}
                                </select>
                                <div className="absolute right-3.5 top-3.5 pointer-events-none text-[#FF2D8D]">
                                  <MapPin size={18} />
                                </div>
                              </div>
                            )
                          })()}
                        </div>

                        {/* Declaration Checkbox */}
                        <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-start gap-2.5 text-xs text-gray-600">
                          <input
                            type="checkbox"
                            id="decl"
                            required
                            checked={applicantForm.declaration_agreed}
                            onChange={(e) => setApplicantForm({ ...applicantForm, declaration_agreed: e.target.checked })}
                            className="mt-0.5 rounded text-[#FF2D8D] focus:ring-[#FF2D8D]"
                          />
                          <label htmlFor="decl" className="cursor-pointer text-[11px] leading-relaxed text-gray-700">
                            I solemnly declare that all information entered (Identity, Prior Academic Scores, Income, and Attached Documents) is genuine. I agree to the Examination Guidelines and Terms & Conditions.
                          </label>
                        </div>
                      </div>

                      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-3.5 pb-1 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setFormSection('academic')}
                          className="px-5 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-center"
                        >
                          ← Back to Academics
                        </button>
                        <button
                          type="submit"
                          className="px-8 py-3 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          {selectedScheme.application_fee === 0 ? 'Submit Free Application (₹0)' : `Proceed to Payment (₹${selectedScheme.application_fee})`}
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* STEP 2: SIMULATED PAYMENT GATEWAY */}
              {applyStep === 'payment' && (
                <div className="space-y-6 max-w-2xl mx-auto py-2">
                  <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-purple-900 text-sm">Payment for {selectedScheme.title}</div>
                      <div className="text-purple-600 text-xs">Examination Processing & Hall Ticket Fee</div>
                    </div>
                    <div className="text-2xl font-black text-purple-900">₹{selectedScheme.application_fee}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3.5 rounded-2xl border text-xs font-bold text-center transition-all ${
                        paymentMethod === 'upi'
                          ? 'border-[#FF2D8D] bg-pink-50 text-[#FF2D8D] ring-2 ring-[#FF2D8D]/20 shadow-xs'
                          : 'border-gray-200 bg-white text-gray-600'
                      }`}
                    >
                      UPI / QR
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3.5 rounded-2xl border text-xs font-bold text-center transition-all ${
                        paymentMethod === 'card'
                          ? 'border-[#FF2D8D] bg-pink-50 text-[#FF2D8D] ring-2 ring-[#FF2D8D]/20 shadow-xs'
                          : 'border-gray-200 bg-white text-gray-600'
                      }`}
                    >
                      Debit / Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('netbanking')}
                      className={`p-3.5 rounded-2xl border text-xs font-bold text-center transition-all ${
                        paymentMethod === 'netbanking'
                          ? 'border-[#FF2D8D] bg-pink-50 text-[#FF2D8D] ring-2 ring-[#FF2D8D]/20 shadow-xs'
                          : 'border-gray-200 bg-white text-gray-600'
                      }`}
                    >
                      Netbanking
                    </button>
                  </div>

                  {paymentMethod === 'upi' ? (
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 text-center space-y-3">
                      <div className="w-36 h-36 bg-white p-2 border border-gray-200 rounded-2xl mx-auto flex items-center justify-center shadow-xs">
                        <QrCode size={120} className="text-gray-800" />
                      </div>
                      <div className="text-xs font-bold text-gray-800">Scan UPI QR with GPay, PhonePe, Paytm or BHIM</div>
                      <div className="font-mono text-xs font-bold text-purple-700 bg-purple-50 py-1 px-3 rounded-lg inline-block border border-purple-200">
                        UPI ID: aagaj.scholarships@axisbank
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Card Number</label>
                        <input
                          type="text"
                          placeholder="Card Number (4111 2222 3333 4444)"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-mono bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="MM/YY" className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs bg-white" />
                        <input type="password" placeholder="CVV" className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs bg-white" />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setApplyStep('form')}
                      className="px-5 py-3 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => executeSubmitApplication()}
                      className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CreditCard size={15} />
                      {submitting ? 'Confirming Payment...' : `Complete Payment (₹${selectedScheme.application_fee})`}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PROVISIONAL ADMIT CARD & REGISTRATION CODE WITH PHOTO */}
              {applyStep === 'success' && generatedApplication && (
                <div className="space-y-6 max-w-2xl mx-auto py-2">
                  <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                    <CheckCircle2 size={48} className="text-emerald-600 mx-auto" />
                    <h3 className="font-heading font-black text-emerald-900 text-xl">
                      Application Confirmed & Registered!
                    </h3>
                    <p className="text-xs text-emerald-700 max-w-md mx-auto">
                      Your application has been received and your <strong>Provisional Registration Credentials</strong> with verified photograph are generated below.
                    </p>
                  </div>

                  {/* Copyable Credentials Card with Photo */}
                  <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 space-y-3">
                    <div className="flex items-center gap-4">
                      {/* Photo Thumbnail */}
                      <div className="w-16 h-20 rounded-xl border border-purple-200 overflow-hidden bg-white shadow-sm shrink-0">
                        <img
                          src={generatedApplication.data.photo_url || DEFAULT_SAMPLE_PHOTOS[0]}
                          alt={generatedApplication.data.applicant_name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="space-y-2 flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 font-bold">Application No:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-gray-900">
                              {generatedApplication.data.application_no}
                            </span>
                            <button
                              onClick={() => copyToClipboard(generatedApplication.data.application_no, 'app')}
                              className="p-1 text-gray-500 hover:text-gray-900"
                              title="Copy Application Number"
                            >
                              {copiedAppNo ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-purple-200/60">
                          <span className="text-gray-500 font-bold">Registration Code:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-[#9C27FF] bg-white px-2 py-0.5 rounded-lg border border-purple-200">
                              {generatedApplication.data.registration_code}
                            </span>
                            <button
                              onClick={() => copyToClipboard(generatedApplication.data.registration_code, 'code')}
                              className="p-1 text-gray-500 hover:text-gray-900"
                              title="Copy Code"
                            >
                              {copiedCode ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1.5">
                    <div className="font-bold text-gray-800 uppercase text-[10px]">Official Hall Ticket Notice:</div>
                    <p className="text-gray-600 leading-relaxed">
                      Please note your <strong>Registration Code</strong>. Once Superadmin releases the batch hall tickets, visit the <strong>&quot;Download Official Admit Card&quot;</strong> tab to download your Hall Ticket with your Roll Number and Assigned Exam Center.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        setSelectedScheme(null)
                        setActiveTab('admit_card')
                        setAdmitSearch({
                          application_no: generatedApplication.data.application_no,
                          registration_code: generatedApplication.data.registration_code,
                        })
                      }}
                      className="flex-1 py-3.5 bg-gradient-to-r from-[#9C27FF] to-[#FF2D8D] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                    >
                      <QrCode size={14} /> Go to Admit Card Desk
                    </button>
                    <button
                      onClick={() => setSelectedScheme(null)}
                      className="px-6 py-3.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 text-center"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* OFFICIAL DIGITAL AWARD CHEQUE & CERTIFICATE MODAL */}
      {mounted && showChequeModal && studentScorecard && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          style={{
            backgroundColor: 'rgba(5, 8, 20, 0.88)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
          }}
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border-4 border-amber-400 space-y-6 relative max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowChequeModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 no-print"
            >
              <X size={20} />
            </button>

            {/* Printable Cheque Voucher */}
            <div id="printable-award-cheque" className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-50/60 via-yellow-50/40 to-amber-100/40 border-2 border-amber-300 space-y-6 relative overflow-hidden shadow-inner">
              {/* Cheque Top Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b-2 border-amber-400/40 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white flex items-center justify-center text-xl font-black shadow-md">
                    🏛️
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-amber-900 uppercase tracking-widest">
                      AAGAJ NATIONAL MERIT COUNCIL
                    </div>
                    <div className="text-base sm:text-lg font-heading font-black text-gray-900">
                      Official Institutional Award Cheque
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono text-xs text-gray-600">
                  <div className="font-bold text-amber-900">Cheque No: CQ-{studentScorecard.application_no ? studentScorecard.application_no.slice(-4) : '8492'}-2026</div>
                  <div className="text-[10px] text-gray-500">Date: {new Date(studentScorecard.released_at).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Payee Line */}
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-baseline gap-2 border-b border-gray-300 pb-1">
                  <span className="font-black text-gray-500 uppercase text-[11px] shrink-0">PAY TO THE ORDER OF:</span>
                  <span className="font-heading font-black text-gray-900 text-base sm:text-lg tracking-wide flex-1">
                    {studentScorecard.applicant_name}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1 flex-1">
                    <span className="font-bold text-gray-500 uppercase text-[10px]">THE SUM OF:</span>
                    <div className="font-serif italic font-bold text-gray-800 text-sm">
                      {studentScorecard.rank === 1
                        ? 'Fifty Thousand Rupees Only (1st Rank Institutional Prize)'
                        : studentScorecard.rank === 2
                        ? 'Twenty Five Thousand Rupees Only (2nd Rank Prize)'
                        : studentScorecard.rank === 3
                        ? 'Ten Thousand Rupees Only (3rd Rank Prize)'
                        : 'Institutional Merit Scholarship Grant & Full Tuition Credit'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border-2 border-dashed border-amber-400 font-mono font-black text-lg text-amber-900 shadow-sm shrink-0">
                    {studentScorecard.award_amount || '₹50,000/-'}
                  </div>
                </div>

                {/* Scheme & Merit Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-white/70 rounded-xl border border-amber-200 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">Scheme:</span>
                    <span className="font-bold text-gray-900 truncate block">{studentScorecard.scheme_title}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">Merit Rank:</span>
                    <span className="font-bold text-[#FF2D8D] font-mono">Rank #{studentScorecard.rank}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">Score Secured:</span>
                    <span className="font-bold text-emerald-700 font-mono">
                      {studentScorecard.exam_marks} / {studentScorecard.total_marks || 100} ({studentScorecard.percentage_score}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">UTR / Voucher:</span>
                    <span className="font-mono text-gray-700 font-bold truncate block">
                      {studentScorecard.voucher_code || 'VCH-9281-DISB'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Signatory & Stamp */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t-2 border-amber-400/40 text-xs">
                <div className="flex items-center gap-2">
                  <QrCode size={36} className="text-amber-950" />
                  <div className="text-[10px] text-gray-500 font-mono">
                    Official Institutional Grant Voucher
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <div className="font-serif italic font-bold text-sm text-gray-900 underline">
                    Academic Evaluation & Financial Directorate
                  </div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Authorized Signatory & Seal</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 no-print">
              <button
                type="button"
                onClick={() => setShowChequeModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 border border-gray-200"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
              >
                <Printer size={14} /> Print / Save Award Cheque
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* SARKARI RESULT STYLE OFFICIAL SCHOLARSHIP NOTIFICATION & ELIGIBILITY BULLETIN */}
      {/* ========================================================================= */}
      {mounted && inspectingSchemeDoc && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 overflow-y-auto animate-in fade-in duration-200"
          style={{
            backgroundColor: 'rgba(5, 8, 20, 0.88)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
          }}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-5xl w-full p-4 sm:p-7 md:p-8 shadow-2xl border-2 border-red-100 flex flex-col max-h-[94vh] overflow-hidden text-gray-900 font-sans">
            
            {/* Top Modal Controls */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 shrink-0 no-print">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-red-600 text-white font-extrabold text-[10px] uppercase rounded-md tracking-wider">
                  Sarkari Notification
                </span>
                <span className="text-xs font-mono font-bold text-gray-500 hidden sm:inline">
                  ADVT NO: AAGAJ/SCH/2026/0{inspectingSchemeDoc.id?.replace('sch-', '') || '01'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Printer size={13} />
                  <span>Print Bulletin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectingSchemeDoc(null)}
                  className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-500 flex items-center justify-center transition-all text-base font-bold"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Official Document Area */}
            <div className="overflow-y-auto pr-1 sm:pr-2 pt-4 space-y-6 flex-1 text-xs">
              
              {/* Official Header Board Emblem */}
              <div className="border-4 border-double border-red-700 p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-red-50/50 via-white to-amber-50/30 text-center space-y-2 relative">
                <div className="text-[11px] sm:text-xs font-black tracking-widest text-red-700 uppercase">
                  Government & Institutional Scholarship Directorate • National Examination Board
                </div>
                <h2 className="text-lg sm:text-2xl md:text-3xl font-black font-serif text-gray-950 uppercase tracking-tight">
                  Aagaj Infotech National Scholarship Portal
                </h2>
                <div className="inline-block bg-red-700 text-white font-black text-xs sm:text-sm px-4 py-1 rounded-full uppercase shadow-sm">
                  {inspectingSchemeDoc.title}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] font-bold text-gray-600 pt-1">
                  <span>Scheme Category: <strong className="text-red-700 uppercase">{inspectingSchemeDoc.category}</strong></span>
                  <span>•</span>
                  <span>Session: <strong className="text-gray-900">2026-2027</strong></span>
                  <span>•</span>
                  <span className="text-emerald-700 font-black">● LIVE ONLINE APPLICATION OPEN</span>
                </div>
              </div>

              {/* Short Description Box */}
              <div className="bg-amber-50/80 border-l-4 border-amber-500 p-4 rounded-r-2xl space-y-1">
                <div className="font-extrabold text-amber-900 text-xs uppercase flex items-center gap-1.5">
                  <span>📌</span> Short Details of Official Notification & Scheme Overview
                </div>
                <p className="text-xs text-gray-800 leading-relaxed font-medium">
                  {inspectingSchemeDoc.description || 'Aagaj Infotech Directorate announces the online applications for national level scholarship and cash award grant scheme. Meritorious and eligible candidates across recognized boards and universities can review the complete eligibility standards, exam dates, fee guidelines and submit their online admission form before the deadline.'}
                </p>
                <div className="text-[11px] font-bold text-red-700 pt-1">
                  🏆 Scholarship Grant / Value: <strong className="text-gray-900">{inspectingSchemeDoc.scholarship_value}</strong>
                </div>
              </div>

              {/* Sarkari Result 2-Column Classic Table: Dates & Fee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column 1: Important Dates */}
                <div className="border-2 border-red-600 rounded-2xl overflow-hidden shadow-xs">
                  <div className="bg-red-700 text-white font-black text-xs uppercase px-4 py-2.5 text-center tracking-wider">
                    📅 Important Dates & Deadlines
                  </div>
                  <div className="p-3.5 divide-y divide-gray-100 bg-white space-y-2 text-xs">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600 font-semibold">Application Begin Date:</span>
                      <strong className="text-gray-900 font-mono">{inspectingSchemeDoc.application_start_date || 'Immediate'}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600 font-semibold">Last Date for Apply Online:</span>
                      <strong className="text-red-600 font-mono font-bold">{inspectingSchemeDoc.application_end_date || 'To be updated'}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600 font-semibold">Last Date Pay Exam Fee:</span>
                      <strong className="text-gray-900 font-mono">{inspectingSchemeDoc.application_end_date || 'Same as deadline'}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600 font-semibold">Admit Card Release Date:</span>
                      <strong className="text-purple-700 font-mono">{inspectingSchemeDoc.admit_card_release_date || '10 Days Before Exam'}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600 font-semibold">Examination Date & Timing:</span>
                      <strong className="text-blue-700 font-mono">{inspectingSchemeDoc.exam_date || 'To be notified'} ({inspectingSchemeDoc.exam_time || '10:00 AM - 12:00 PM'})</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600 font-semibold">Result Declaration Date:</span>
                      <strong className="text-emerald-700 font-mono">{inspectingSchemeDoc.result_date || 'Within 15 Days Post-Exam'}</strong>
                    </div>
                  </div>
                </div>

                {/* Column 2: Application Fee */}
                <div className="border-2 border-red-600 rounded-2xl overflow-hidden shadow-xs">
                  <div className="bg-red-700 text-white font-black text-xs uppercase px-4 py-2.5 text-center tracking-wider">
                    💳 Application Registration Fee
                  </div>
                  <div className="p-3.5 divide-y divide-gray-100 bg-white space-y-2 text-xs">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600 font-semibold">General / OBC / EWS:</span>
                      <strong className="text-red-700 font-bold text-sm">
                        {inspectingSchemeDoc.application_fee === 0 ? '₹0/- (Exempted / Free)' : `₹${inspectingSchemeDoc.application_fee}/-`}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600 font-semibold">SC / ST / Female Candidates:</span>
                      <strong className="text-red-700 font-bold text-sm">
                        {inspectingSchemeDoc.application_fee === 0 ? '₹0/- (Exempted / Free)' : `₹${inspectingSchemeDoc.application_fee}/-`}
                      </strong>
                    </div>
                    <div className="pt-2 text-[11px] text-gray-600 leading-relaxed">
                      <span className="font-bold text-gray-800">Fee Payment Mode:</span> Pay the examination and processing fee through online methods: <strong>Debit Card, Credit Card, Net Banking, UPI (GPay, PhonePe, Paytm, BHIM)</strong> or QR scan mode only.
                    </div>
                  </div>
                </div>
              </div>

              {/* Eligibility, Streams, & Age Limit Table */}
              <div className="border-2 border-gray-300 rounded-2xl overflow-hidden">
                <div className="bg-gray-800 text-white font-black text-xs uppercase px-4 py-2.5 tracking-wider flex items-center justify-between">
                  <span>🎓 Age Limit, Academic Eligibility & Stream Requirements</span>
                  <span className="text-[10px] text-amber-400 font-mono">Standards Verified</span>
                </div>
                <div className="p-4 bg-white space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <div>
                      <span className="text-gray-500 font-semibold block text-[11px]">Age Limit Criteria:</span>
                      <strong className="text-gray-900 text-sm">{inspectingSchemeDoc.age_limit || '16 - 28 Years'}</strong>
                      <span className="text-[10px] text-gray-400 block mt-0.5">(As per institutional guidelines)</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold block text-[11px]">Minimum Qualifying Score:</span>
                      <strong className="text-emerald-700 text-sm">{inspectingSchemeDoc.min_percentage || 60}% Aggregate</strong>
                      <span className="text-[10px] text-gray-400 block mt-0.5">In previous degree / standard</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold block text-[11px]">Max Family Annual Income:</span>
                      <strong className="text-purple-700 text-sm">₹{inspectingSchemeDoc.max_family_income || 10} Lakhs / LPA</strong>
                      <span className="text-[10px] text-gray-400 block mt-0.5">Annual gross income limit</span>
                    </div>
                  </div>

                  {/* Eligible Educational Streams */}
                  <div>
                    <label className="block text-xs font-bold text-gray-800 uppercase mb-1.5">
                      Eligible Classes / Qualifications / Streams:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(inspectingSchemeDoc.eligible_qualifications && inspectingSchemeDoc.eligible_qualifications.length > 0
                        ? inspectingSchemeDoc.eligible_qualifications
                        : ['10th', '12th (PCM)', '12th (PCB)', 'Undergraduate', 'Diploma']
                      ).map((qual) => (
                        <span
                          key={qual}
                          className="px-3 py-1 bg-pink-50 border border-pink-200 text-[#FF2D8D] font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 size={12} />
                          {qual}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Detailed Eligibility Notes */}
                  <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-xl">
                    <span className="font-bold text-blue-950 block text-[11px] uppercase mb-0.5">
                      Special Eligibility Instructions:
                    </span>
                    <p className="text-blue-900 text-xs leading-relaxed font-medium">
                      {inspectingSchemeDoc.eligibility_criteria || 'Candidate must be an authentic Indian resident/student with active enrollment in recognized board/university. Marksheet verification and photo ID validation is mandatory before grant award.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Examination Pattern & Centers Section */}
              <div className="border-2 border-purple-200 rounded-2xl overflow-hidden bg-purple-50/20">
                <div className="bg-purple-900 text-white font-black text-xs uppercase px-4 py-2.5 tracking-wider">
                  📝 Examination Scheme, Pattern & Venues
                </div>
                <div className="p-4 space-y-3 text-xs bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                      <span className="text-gray-500 font-semibold block text-[10px] uppercase">Exam Mode:</span>
                      <strong className="text-purple-900 font-bold text-sm uppercase">{inspectingSchemeDoc.exam_mode || 'Online Proctored'}</strong>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                      <span className="text-gray-500 font-semibold block text-[10px] uppercase">Exam Duration:</span>
                      <strong className="text-purple-900 font-bold text-sm">{inspectingSchemeDoc.exam_duration || '120 Minutes'}</strong>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                      <span className="text-gray-500 font-semibold block text-[10px] uppercase">Total Assessment Questions:</span>
                      <strong className="text-purple-900 font-bold text-sm">{inspectingSchemeDoc.total_questions || 100} Objective MCQs</strong>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 uppercase mb-1">
                      Assigned Exam Centers & Test Venues:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(inspectingSchemeDoc.exam_centers && inspectingSchemeDoc.exam_centers.length > 0
                        ? inspectingSchemeDoc.exam_centers
                        : [inspectingSchemeDoc.exam_venue || 'National Proctored Online Assessment Hub']
                      ).map((center, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-white border border-purple-300 text-purple-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                        >
                          <MapPin size={13} className="text-purple-600" />
                          {center}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Prize Pool & Winners Distribution */}
              <div className="border-2 border-pink-200 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white font-black text-xs uppercase px-4 py-2.5 tracking-wider flex items-center justify-between">
                  <span>🏆 Cash Prize Pool & Scholarship Allocation Matrix</span>
                  <span className="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                    {inspectingSchemeDoc.number_of_winners || 50} Winners
                  </span>
                </div>
                <div className="p-4 bg-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-pink-50/70 rounded-xl border border-pink-200">
                    <span className="text-pink-900 font-bold block text-[11px]">🥇 1st Rank Prize:</span>
                    <strong className="text-[#FF2D8D] text-base font-black">
                      {inspectingSchemeDoc.prize_distribution?.first_prize || '₹50,000'}
                    </strong>
                    <span className="text-[10px] text-gray-500 block">Direct Bank Disbursed</span>
                  </div>
                  <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200">
                    <span className="text-purple-900 font-bold block text-[11px]">🥈 2nd Rank Prize:</span>
                    <strong className="text-purple-700 text-base font-black">
                      {inspectingSchemeDoc.prize_distribution?.second_prize || '₹25,000'}
                    </strong>
                    <span className="text-[10px] text-gray-500 block">Direct Bank Disbursed</span>
                  </div>
                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                    <span className="text-blue-900 font-bold block text-[11px]">🥉 3rd Rank Prize:</span>
                    <strong className="text-blue-600 text-base font-black">
                      {inspectingSchemeDoc.prize_distribution?.third_prize || '₹10,000'}
                    </strong>
                    <span className="text-[10px] text-gray-500 block">Direct Bank Disbursed</span>
                  </div>
                  <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                    <span className="text-emerald-900 font-bold block text-[11px]">🎖️ Consolation / Tuition:</span>
                    <strong className="text-emerald-800 text-xs font-black block">
                      {inspectingSchemeDoc.prize_distribution?.consolation || '100% Tuition Waiver + Certificate'}
                    </strong>
                    <span className="text-[10px] text-gray-500 block">LMS Course Credit</span>
                  </div>
                </div>
              </div>

              {/* Mandatory Documents Required */}
              <div className="border border-gray-200 p-4 rounded-2xl bg-gray-50/60 space-y-2">
                <span className="font-bold text-gray-800 text-xs uppercase block">
                  📄 Mandatory Verification Documents Checklist:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(inspectingSchemeDoc.required_documents && inspectingSchemeDoc.required_documents.length > 0
                    ? inspectingSchemeDoc.required_documents
                    : ['10th / 12th Marksheet', 'Government Photo ID (Aadhaar/PAN)', 'Recent Passport Size Photograph']
                  ).map((doc, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white border border-gray-300 text-gray-800 font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                    >
                      <Check size={13} className="text-emerald-600" />
                      {doc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Official Terms and Conditions & Guidelines */}
              <div className="border border-gray-200 p-4 rounded-2xl bg-white space-y-2">
                <span className="font-bold text-gray-900 text-xs uppercase block text-red-700">
                  📜 Official Terms, Conditions & Disqualification Policy:
                </span>
                <div className="text-xs text-gray-700 whitespace-pre-line leading-relaxed font-normal bg-gray-50 p-3 rounded-xl border border-gray-200 font-mono">
                  {inspectingSchemeDoc.terms_and_conditions || `1. Candidate must provide authentic and verifiable academic marksheet credentials.
2. Malpractice, impersonation, or unfair means during examination leads to instant cancellation.
3. Cash prizes will be transferred directly to candidate verified bank account through RTGS/UPI.
4. Final merit rankings and cutoff decisions rest solely with the Academic Evaluation Committee.`}
                </div>
              </div>

              {/* Sarkari Result Classic "SOME USEFUL IMPORTANT LINKS" Table */}
              <div className="border-2 border-red-700 rounded-2xl overflow-hidden">
                <div className="bg-red-700 text-white font-black text-xs uppercase px-4 py-2.5 text-center tracking-wider">
                  🔗 Some Useful Important Links
                </div>
                <div className="p-3 bg-white divide-y divide-gray-200 text-xs">
                  <div className="flex items-center justify-between py-2">
                    <span className="font-bold text-gray-900">Apply Online (Candidate Registration)</span>
                    <button
                      onClick={() => {
                        const s = inspectingSchemeDoc
                        setInspectingSchemeDoc(null)
                        handleOpenApply(s)
                      }}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-lg text-xs transition-all shadow-xs"
                    >
                      Click Here (Apply Now)
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="font-bold text-gray-900">Download Admit Card / Hall Ticket</span>
                    <button
                      onClick={() => {
                        setInspectingSchemeDoc(null)
                        setActiveTab('admit_card')
                      }}
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition-all shadow-xs"
                    >
                      Click Here
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="font-bold text-gray-900">Check Scholarship Merit List & Scorecard</span>
                    <button
                      onClick={() => {
                        setInspectingSchemeDoc(null)
                        setActiveTab('merit_list')
                      }}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all shadow-xs"
                    >
                      Click Here
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="font-bold text-gray-900">Official Portal Homepage</span>
                    <a
                      href="/"
                      className="px-4 py-1.5 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-lg text-xs transition-all shadow-xs"
                    >
                      Click Here
                    </a>
                  </div>
                </div>
              </div>

              {/* Bottom Directorate Seal & Verification Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 text-xs text-gray-500 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={28} className="text-red-700" />
                  <div>
                    <div className="font-bold text-gray-800 text-[11px]">Official National Assessment Directorate</div>
                    <div className="text-[10px]">Digitally Certified Document • Session 2026-27</div>
                  </div>
                </div>
                <div className="text-center sm:text-right font-mono text-[10px] text-gray-400">
                  REF NO: AAGAJ-SCH-BULLETIN-{inspectingSchemeDoc.id?.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="pt-3.5 mt-2 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 no-print">
              <button
                type="button"
                onClick={() => setInspectingSchemeDoc(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 border border-gray-200 text-center"
              >
                Close Bulletin
              </button>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Printer size={14} />
                  Print Document
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const s = inspectingSchemeDoc
                    setInspectingSchemeDoc(null)
                    handleOpenApply(s)
                  }}
                  className="flex-1 sm:flex-initial px-6 py-2.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  Apply Online Now ({inspectingSchemeDoc.application_fee === 0 ? 'Free' : `₹${inspectingSchemeDoc.application_fee}`})
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <Footer />
    </div>
  )
}
