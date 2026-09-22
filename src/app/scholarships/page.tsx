'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { motion, AnimatePresence } from 'framer-motion'
import { getIndianStates, getDistrictsForState } from '@/lib/india-locations'
import {
  validateName,
  validatePhone,
  validateEmail,
  validatePincode,
  validatePercentage,
  validateIFSC,
  validateAccountNumber,
  validateUPI,
} from '@/lib/scholarship-validation'
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
  BookOpen,
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
    winner_description?: string
  }
  winner_description?: string
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
    state: 'Bihar',
    district: 'Patna',
    city: 'Patna',
    pincode: '',
    preference_state: 'Bihar',
    preference_district_1: 'Patna',
    preference_district_2: 'Gaya',

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

    // Exam Preferences & Declaration
    exam_city_preference: 'Patna (Pref 1) / Gaya (Pref 2)',
    declaration_agreed: false,

    // Referral / Reference Code (Optional)
    reference_code: '',
  })

  // Referral Code Verification State
  const [refCodeVerifying, setRefCodeVerifying] = useState(false)
  const [refCodeVerifiedData, setRefCodeVerifiedData] = useState<{ representative_name: string; code: string; discount_percent?: number } | null>(null)
  const [refCodeVerifyError, setRefCodeVerifyError] = useState<string | null>(null)

  const handleVerifyRefCode = async (overrideCode?: string) => {
    const codeToVerify = (overrideCode || applicantForm.reference_code).trim()
    if (!codeToVerify) {
      setRefCodeVerifyError('Please enter a referral code first.')
      setRefCodeVerifiedData(null)
      return
    }

    setRefCodeVerifying(true)
    setRefCodeVerifyError(null)
    setRefCodeVerifiedData(null)

    try {
      const res = await fetch(`/api/public/scholarships/reference-codes/verify?code=${encodeURIComponent(codeToVerify)}`)
      const data = await res.json()
      if (data.success && data.valid && data.data) {
        setRefCodeVerifiedData(data.data)
        setApplicantForm((prev) => ({ ...prev, reference_code: data.data.code }))
      } else {
        setRefCodeVerifyError(data.error || 'Invalid or inactive referral code.')
      }
    } catch (err) {
      setRefCodeVerifyError('Network error verifying referral code.')
    } finally {
      setRefCodeVerifying(false)
    }
  }

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

  // MSG91 OTP Verification State for Admit Card & Scorecard Download
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otpTargetMobile, setOtpTargetMobile] = useState('')
  const [otpMaskedPhone, setOtpMaskedPhone] = useState('')
  const [otpInput, setOtpInput] = useState('')
  const [otpReqId, setOtpReqId] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null)
  const [otpPendingData, setOtpPendingData] = useState<any | null>(null)
  const [otpPendingType, setOtpPendingType] = useState<'admit_card' | 'scorecard' | null>(null)

  const handleSendMsg91Otp = async () => {
    if (!otpTargetMobile) return
    setOtpSending(true)
    setOtpError(null)
    setOtpSuccessMsg(null)
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: otpTargetMobile }),
      })
      const data = await res.json()
      if (data.success) {
        setOtpSent(true)
        if (data.req_id) setOtpReqId(data.req_id)
        setOtpSuccessMsg(data.message || 'OTP sent to registered phone number via MSG91.')
      } else {
        setOtpError(data.error || 'Failed to send OTP. Please try again.')
      }
    } catch (err: any) {
      setOtpError('Network error while sending OTP.')
    } finally {
      setOtpSending(false)
    }
  }

  const handleVerifyMsg91Otp = async () => {
    if (!otpInput.trim()) return
    setOtpVerifying(true)
    setOtpError(null)
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: otpTargetMobile,
          otp: otpInput.trim(),
          req_id: otpReqId,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setShowOtpModal(false)
        if (otpPendingType === 'admit_card' && otpPendingData) {
          setAdmitResult(otpPendingData)
        } else if (otpPendingType === 'scorecard' && otpPendingData) {
          setStudentScorecard(otpPendingData)
        }
        setOtpPendingData(null)
        setOtpPendingType(null)
        setOtpInput('')
        setOtpReqId(null)
        setOtpSent(false)
      } else {
        setOtpError(data.error || 'Invalid OTP. Please check the code and try again.')
      }
    } catch (err: any) {
      setOtpError('Network error verifying OTP.')
    } finally {
      setOtpVerifying(false)
    }
  }

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
  const [showReceiptModal, setShowReceiptModal] = useState(false)

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
        const phone = data.individual_scorecard.applicant_phone || data.individual_scorecard.phone || ''
        if (phone) {
          const cleaned = phone.replace(/\D/g, '')
          const masked = cleaned.length >= 10
            ? `+91 ${cleaned.slice(0, 2)}*****${cleaned.slice(-3)}`
            : phone
          setOtpTargetMobile(phone)
          setOtpMaskedPhone(masked)
          setOtpPendingData(data.individual_scorecard)
          setOtpPendingType('scorecard')
          setOtpInput('')
          setOtpSent(false)
          setOtpError(null)
          setOtpSuccessMsg(null)
          setShowOtpModal(true)
        } else {
          setStudentScorecard(data.individual_scorecard)
        }
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

    const accVal = validateAccountNumber(bankClaimForm.account_number)
    if (!accVal.isValid) {
      alert(accVal.message)
      return
    }

    const ifscVal = validateIFSC(bankClaimForm.ifsc_code)
    if (!ifscVal.isValid) {
      alert(ifscVal.message)
      return
    }

    if (bankClaimForm.upi_id) {
      const upiVal = validateUPI(bankClaimForm.upi_id)
      if (!upiVal.isValid) {
        alert(upiVal.message)
        return
      }
    }

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
          bank_name: bankClaimForm.bank_name.trim(),
          account_number: accVal.cleanAcc,
          ifsc_code: ifscVal.cleanIFSC,
          account_holder_name: bankClaimForm.account_holder_name.trim() || studentScorecard.applicant_name,
          upi_id: bankClaimForm.upi_id.trim(),
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
      : ['Class 10th', 'Class 12th (PCM)']
    const defaultQual = quals[0] || 'Class 10th'

    const initialRecords: AcademicQualificationDetail[] = [{
      id: `qual-0-${Date.now()}`,
      qualification: defaultQual,
      institution: '',
      board_university: 'CBSE',
      roll_no: '',
      passing_year: new Date().getFullYear().toString(),
      percentage: '',
      is_custom: false,
    }]
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
      state: 'Bihar',
      district: 'Patna',
      city: 'Patna',
      pincode: '',
      preference_state: 'Bihar',
      preference_district_1: 'Patna',
      preference_district_2: 'Gaya',
      school_college_name: '',
      qualification: defaultQual,
      passing_year: new Date().getFullYear().toString(),
      percentage: '',
      annual_family_income: '',
      aadhaar_url: '',
      marksheet_url: '',
      college_id_url: '',
      photo_url: '',
      signature_url: '',
      exam_city_preference: 'Patna (Pref 1) / Gaya (Pref 2)',
      declaration_agreed: false,
      reference_code: '',
    })
  }

  // Handle student selecting their specific class / standard from the eligible scheme options
  const handleSelectStudentClass = (chosenClass: string) => {
    setApplicantForm((prev) => ({
      ...prev,
      qualification: chosenClass,
    }))
    setAcademicRecords((prev) => {
      if (!prev || prev.length === 0) {
        return [{
          id: `qual-0-${Date.now()}`,
          qualification: chosenClass,
          institution: applicantForm.school_college_name || '',
          board_university: 'CBSE',
          roll_no: '',
          passing_year: new Date().getFullYear().toString(),
          percentage: '',
          is_custom: false,
        }]
      }
      return prev.map((rec, idx) => {
        if (idx === 0) {
          return { ...rec, qualification: chosenClass }
        }
        return rec
      })
    })
  }

  // Determine tailored required documents based on student's selected class
  const getApplicableDocumentList = (scheme: ScholarshipScheme | null, currentClass: string): string[] => {
    const customSchemeDocs = (scheme?.required_documents || []).filter((d) => {
      const l = d.toLowerCase()
      return (
        !l.includes('photo') &&
        !l.includes('photograph') &&
        !l.includes('signature') &&
        !l.includes('sign') &&
        !l.includes('marksheet') &&
        !l.includes('aadhaar') &&
        !l.includes('id card') &&
        !l.includes('college id') &&
        !l.includes('school id')
      )
    })

    const q = (currentClass || '').toLowerCase()
    const isSeniorSecondary = q.includes('11th') || q.includes('12th')
    const isSchool =
      q.includes('6th') ||
      q.includes('7th') ||
      q.includes('8th') ||
      q.includes('9th') ||
      q.includes('10th') ||
      q.includes('school') ||
      q.includes('class')

    let baseDocs: string[] = []
    if (isSchool && !isSeniorSecondary) {
      baseDocs = [
        'Previous Standard Marksheet / Annual Report Card',
        'School ID Card / Principal Bonafide Certificate',
        'Student Aadhaar Card / Birth Certificate',
      ]
    } else if (isSeniorSecondary) {
      baseDocs = [
        'Class 10th Board Passing Marksheet',
        'School / Junior College ID Card',
        'Student Aadhaar Card',
      ]
    } else {
      baseDocs = [
        '12th / Diploma / Degree Marksheet',
        'College / University ID Card',
        'Government Photo ID (Aadhaar/PAN)',
      ]
    }

    return [...baseDocs, ...customSchemeDocs]
  }

  // Update specific field in an academic record
  const handleUpdateAcademicRecord = (id: string, field: keyof AcademicQualificationDetail, value: string) => {
    setAcademicRecords((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, [field]: value } : rec))
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

    const nameVal = validateName(applicantForm.applicant_name, 'Full Name')
    if (!nameVal.isValid) {
      alert(nameVal.message)
      return
    }

    const phoneVal = validatePhone(applicantForm.applicant_phone)
    if (!phoneVal.isValid) {
      alert(phoneVal.message)
      return
    }

    const emailVal = validateEmail(applicantForm.applicant_email)
    if (!emailVal.isValid) {
      alert(emailVal.message)
      return
    }

    if (!applicantForm.address?.trim()) {
      alert('Please enter your Residential Address.')
      return
    }

    if (applicantForm.pincode) {
      const pinVal = validatePincode(applicantForm.pincode)
      if (!pinVal.isValid) {
        alert(pinVal.message)
        return
      }
    }

    // Save cleaned values back to form state
    setApplicantForm((prev) => ({
      ...prev,
      applicant_name: nameVal.cleanName,
      applicant_phone: phoneVal.cleanPhone,
      applicant_email: emailVal.cleanEmail,
    }))

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

  // Computed Referral Discount & Payable Amount
  const baseFormFee = selectedScheme?.application_fee || 0
  const referralDiscountPercent = Math.max(0, Math.min(100, Number(refCodeVerifiedData?.discount_percent) || 0))
  const referralDiscountAmount = Math.round((baseFormFee * referralDiscountPercent) / 100)
  const payableFormFee = Math.max(0, baseFormFee - referralDiscountAmount)

  // Submit Application Form -> Move to Payment or Instant Free Submission
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedScheme) return

    if (!applicantForm.photo_url) {
      alert('Please upload or select your passport-size photograph before submitting.')
      return
    }

    if (payableFormFee === 0) {
      executeSubmitApplication(selectedScheme.application_fee === 0 ? 'FREE_CONFIRMED' : 'REF_100_DISCOUNT_FREE')
    } else {
      setApplyStep('payment')
    }
  }

  // Helper to dynamically load Razorpay Checkout Script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  // Handle Real Production Razorpay Payment Checkout
  const handleRazorpayCheckout = async () => {
    if (!selectedScheme) return
    setSubmitting(true)

    try {
      // 1. Call API to create Razorpay Order
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: payableFormFee,
          scholarship_id: selectedScheme.id,
          applicant_name: applicantForm.applicant_name,
          applicant_email: applicantForm.applicant_email,
          applicant_phone: applicantForm.applicant_phone,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        if (data.requires_config || data.error?.includes('missing in system environment variables')) {
          const proceedMock = confirm(
            '⚠️ Razorpay API Keys are not set in your .env file yet.\n\nWould you like to complete with Instant Test Confirmation for now?'
          )
          if (proceedMock) {
            await executeSubmitApplication(`PAY_MOCK_${Date.now().toString().slice(-8)}`)
          } else {
            setSubmitting(false)
          }
          return
        }
        alert(data.error || 'Unable to initiate Razorpay payment.')
        setSubmitting(false)
        return
      }

      // 2. Load Razorpay script
      const isLoaded = await loadRazorpayScript()
      if (!isLoaded) {
        alert('Razorpay Payment Gateway failed to load. Please check your internet connection.')
        setSubmitting(false)
        return
      }

      // 3. Launch Razorpay modal popup
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'GRAVITY NATIONAL SCHOLARSHIP BOARD',
        description: `Application Fee - ${selectedScheme.title}`,
        image: '/logo.png',
        order_id: data.order_id,
        handler: async function (response: any) {
          try {
            // Verify payment on server
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
            const verifyData = await verifyRes.json()
            if (verifyData.success) {
              await executeSubmitApplication(response.razorpay_payment_id, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
            } else {
              alert('Payment Verification Failed: ' + (verifyData.error || 'Invalid signature'))
              setSubmitting(false)
            }
          } catch (err: any) {
            console.error('Payment verification error:', err)
            alert('Error verifying payment with server.')
            setSubmitting(false)
          }
        },
        prefill: {
          name: applicantForm.applicant_name,
          email: applicantForm.applicant_email,
          contact: applicantForm.applicant_phone,
        },
        theme: {
          color: '#FF2D8D',
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false)
          },
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (resp: any) {
        alert('Payment Failed: ' + (resp.error.description || 'Transaction cancelled or declined'))
        setSubmitting(false)
      })
      rzp.open()
    } catch (err: any) {
      console.error('Razorpay checkout error:', err)
      alert('Failed to connect to Razorpay payment gateway.')
      setSubmitting(false)
    }
  }

  // Execute Final Application Submission
  const executeSubmitApplication = async (paymentRef?: string, razorpayDetails?: any) => {
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
          razorpay_details: razorpayDetails || null,
        },
        payment_reference: paymentRef || `PAY_MOCK_${Date.now().toString().slice(-8)}`,
        payment_amount: payableFormFee,
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
        const phone = data.data.applicant?.applicant_phone || data.data.applicant?.phone || ''
        if (phone) {
          const cleaned = phone.replace(/\D/g, '')
          const masked = cleaned.length >= 10
            ? `+91 ${cleaned.slice(0, 2)}*****${cleaned.slice(-3)}`
            : phone
          setOtpTargetMobile(phone)
          setOtpMaskedPhone(masked)
          setOtpPendingData(data.data)
          setOtpPendingType('admit_card')
          setOtpInput('')
          setOtpSent(false)
          setOtpError(null)
          setOtpSuccessMsg(null)
          setShowOtpModal(true)
        } else {
          setAdmitResult(data.data)
        }
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
      <div className="no-print">
        <Header />
      </div>

      {/* Hero Section */}
      <section className="no-print pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-14 bg-gradient-to-b from-pink-50/70 via-purple-50/30 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 text-center space-y-3 sm:space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold text-[#FF2D8D] uppercase tracking-widest px-3 sm:px-4 py-1 sm:py-1.5 bg-pink-50 rounded-full border border-pink-100 shadow-xs"
          >
            <Sparkles size={13} className="shrink-0" /> National Scholarship & Financial Aid Gateway
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl lg:text-6xl font-heading font-black text-gray-900 tracking-tight leading-tight px-1"
          >
            Empowering Talent with <span className="text-gradient">Merit Grants & Full Rides</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed px-2"
          >
            Check your eligibility instantly, apply with photo verification, receive your provisional admit card, and unlock official examination hall tickets upon Superadmin board approval.
          </motion.p>

          {/* Touch-Friendly Responsive Tab Navigation Pill Bar */}
          <div className="pt-4 sm:pt-8 -mx-3 px-3 sm:mx-0 sm:px-0 flex items-center justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth py-2">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-3.5 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap ${
                activeTab === 'explore'
                  ? 'bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white shadow-pink-500/25 shadow-md scale-[1.02]'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Award size={15} /> Explore Scholarships ({scholarships.length})
            </button>

            <button
              onClick={() => setActiveTab('checker')}
              className={`px-3.5 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap ${
                activeTab === 'checker'
                  ? 'bg-gradient-to-r from-[#9C27FF] to-[#673AB7] text-white shadow-purple-500/25 shadow-md scale-[1.02]'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Percent size={15} /> Eligibility Checker
            </button>

            <button
              onClick={() => setActiveTab('admit_card')}
              className={`px-3.5 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap ${
                activeTab === 'admit_card'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/25 shadow-md scale-[1.02]'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <QrCode size={15} /> Download Admit Card
            </button>

            <button
              onClick={() => setActiveTab('results')}
              className={`px-3.5 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap ${
                activeTab === 'results'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25 shadow-md scale-[1.02]'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <FileText size={15} /> Check Result & Scorecard
            </button>

            <button
              onClick={() => setActiveTab('merit_list')}
              className={`px-3.5 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap ${
                activeTab === 'merit_list'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/25 shadow-md scale-[1.02]'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <TrendingUp size={15} /> Top 3 & Merit List
            </button>
          </div>
        </div>
      </section>

      {/* TAB 1: EXPLORE SCHOLARSHIPS */}
      {activeTab === 'explore' && (
        <section className="py-6 sm:py-12 pb-20 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 -mx-3 px-3 sm:mx-0 sm:px-0">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1">
              {['all', ...Array.from(new Set(scholarships.map((s) => s.category).filter(Boolean)))].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                    categoryFilter === cat
                      ? 'bg-gray-900 text-white shadow-xs'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {cat === 'all' ? 'All Schemes' : cat}
                </button>
              ))}
            </div>

            <div className="text-xs text-gray-400 font-medium">
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
            <div className="space-y-4 sm:space-y-6">
              {filteredSchemes.map((scheme) => (
                <motion.div
                  key={scheme.id}
                  whileHover={{ y: -3 }}
                  className="rounded-2xl sm:rounded-3xl border border-gray-200/90 bg-white p-4 sm:p-7 lg:p-8 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all duration-300 flex flex-col lg:flex-row items-stretch justify-between gap-4 sm:gap-8 group relative overflow-hidden"
                >
                  {/* Accent Left Gradient Bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-2 sm:w-2.5 bg-gradient-to-b from-[#FF2D8D] via-[#9C27FF] to-blue-600 rounded-l-2xl sm:rounded-l-3xl" />

                  {/* Left & Center Main Content Area */}
                  <div className="flex-1 space-y-3.5 sm:space-y-5 pl-1.5 sm:pl-2">
                    {/* Header: Emblem Icon, Badges, Title, Max Value Callout */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                      <div className="flex items-start gap-2.5 sm:gap-3.5">
                        <div
                          className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105 ${
                            scheme.color_theme === 'pink'
                              ? 'bg-pink-50 text-[#FF2D8D] border border-pink-200/70'
                              : scheme.color_theme === 'purple'
                              ? 'bg-purple-50 text-[#9C27FF] border border-purple-200/70'
                              : 'bg-blue-50 text-blue-600 border border-blue-200/70'
                          }`}
                        >
                          <GraduationCap className="w-5 h-5 sm:w-7 sm:h-7" />
                        </div>
                        <div className="space-y-1 sm:space-y-1.5">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-2 sm:px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 tracking-wider">
                              {scheme.category || 'National Merit'}
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Applications Open
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase px-2 sm:px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                              Govt Recognized
                            </span>
                          </div>
                          <h3 className="font-heading font-black text-lg sm:text-2xl lg:text-3xl text-gray-900 group-hover:text-[#FF2D8D] transition-colors leading-tight">
                            {scheme.title}
                          </h3>
                        </div>
                      </div>

                      {/* Max Scholarship Grant Value */}
                      <div className="bg-gradient-to-r from-pink-50/80 to-purple-50/50 sm:bg-none p-2.5 sm:p-0 rounded-xl sm:rounded-none border border-pink-100/80 sm:border-0 shrink-0 flex items-center justify-between sm:block">
                        <span className="text-[9px] sm:text-xs text-gray-500 sm:text-gray-400 font-extrabold uppercase tracking-wider block">Max Grant Value</span>
                        <div className="text-lg sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] bg-clip-text text-transparent">
                          {scheme.scholarship_value}
                        </div>
                      </div>
                    </div>

                    {/* Scheme Description */}
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                      {scheme.description}
                    </p>

                    {/* Two Column Visual Cards: Tiered Cash Prizes + Winner Benefits Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-1">
                      {/* 1. Tiered Cash Prize Pool */}
                      {scheme.prize_distribution ? (
                        <div className="p-3 sm:p-4 bg-gradient-to-br from-pink-50/70 via-purple-50/40 to-white rounded-xl sm:rounded-2xl border border-pink-100/90 space-y-2 sm:space-y-2.5 shadow-xs">
                          <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                            <span className="flex items-center gap-1.5 text-[11px] sm:text-xs">
                              <Sparkles size={13} className="text-[#FF2D8D]" />
                              Tiered Prize Pool
                            </span>
                            <span className="text-purple-700 font-extrabold bg-white px-2 py-0.5 rounded-md border border-purple-100 text-[9px] sm:text-[10px] shadow-2xs">
                              {scheme.number_of_winners || 50} Winners
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-[9px] sm:text-[10px]">
                            <div className="bg-white p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-pink-100/90 shadow-2xs">
                              <div className="text-gray-400 font-semibold text-[9px] sm:text-[10px]">🥇 1st Rank</div>
                              <div className="font-black text-[#FF2D8D] text-xs sm:text-sm mt-0.5">{scheme.prize_distribution.first_prize || '₹50,000'}</div>
                            </div>
                            <div className="bg-white p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-pink-100/90 shadow-2xs">
                              <div className="text-gray-400 font-semibold text-[9px] sm:text-[10px]">🥈 2nd Rank</div>
                              <div className="font-black text-purple-700 text-xs sm:text-sm mt-0.5">{scheme.prize_distribution.second_prize || '₹25,000'}</div>
                            </div>
                            <div className="bg-white p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-pink-100/90 shadow-2xs">
                              <div className="text-gray-400 font-semibold text-[9px] sm:text-[10px]">🥉 3rd Rank</div>
                              <div className="font-black text-blue-600 text-xs sm:text-sm mt-0.5">{scheme.prize_distribution.third_prize || '₹10,000'}</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 sm:p-4 bg-pink-50/40 rounded-xl sm:rounded-2xl border border-pink-100 text-xs flex items-center gap-2 text-gray-600">
                          <Award size={18} className="text-[#FF2D8D] shrink-0" />
                          <span>Official merit grant and institutional scholarship awards.</span>
                        </div>
                      )}

                      {/* 2. Winner Benefits & Rewards Detailed Box */}
                      <div className="p-3 sm:p-4 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white rounded-xl sm:rounded-2xl border border-amber-200/90 space-y-1.5 sm:space-y-2 flex flex-col justify-between shadow-xs">
                        <div className="flex items-center gap-1.5 font-bold text-amber-950 text-[11px] sm:text-xs uppercase tracking-wide">
                          <span className="text-xs sm:text-sm">🏆</span>
                          <span>Winner Benefits & Rewards</span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-gray-700 leading-relaxed font-medium whitespace-pre-line line-clamp-3">
                          {scheme.winner_description || scheme.prize_distribution?.winner_description || 'Direct bank cash awards, merit medals, 100% course scholarships, and certified achievement badges.'}
                        </p>
                        <div className="text-[10px] font-bold text-amber-900 flex items-center gap-1 pt-1 border-t border-amber-100/80">
                          <span>🎖️ Perks:</span>
                          <span className="truncate">{scheme.prize_distribution?.consolation || 'Certificate & 50% Fee Waiver'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Key Eligibility & Schedule Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 text-[11px] sm:text-xs">
                      <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-medium flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                        <span>Min: <strong className="text-gray-900 font-bold">≥ {scheme.min_percentage}%</strong></span>
                      </div>
                      <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-medium flex items-center gap-1.5">
                        <User size={13} className="text-[#9C27FF] shrink-0" />
                        <span>Age: <strong className="text-gray-900 font-bold">{scheme.age_limit || '10 - 28 Yrs'}</strong></span>
                      </div>
                      <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-medium flex items-center gap-1.5">
                        <Calendar size={13} className="text-red-600 shrink-0" />
                        <span>Deadline: <strong className="text-red-600 font-bold">{scheme.application_end_date || 'Open'}</strong></span>
                      </div>
                      <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-medium flex items-center gap-1.5">
                        <Clock size={13} className="text-blue-600 shrink-0" />
                        <span>{scheme.exam_mode?.toUpperCase()} • {scheme.exam_duration || '120 Mins'}</span>
                      </div>
                      {scheme.eligible_qualifications && scheme.eligible_qualifications.length > 0 && (
                        <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-pink-50 text-[#FF2D8D] font-bold text-[10px] sm:text-[11px] border border-pink-100 flex items-center gap-1">
                          <BookOpen size={12} className="shrink-0" />
                          <span>Classes: {scheme.eligible_qualifications.slice(0, 3).join(', ')}{scheme.eligible_qualifications.length > 3 ? ` +${scheme.eligible_qualifications.length - 3}` : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side Action Sidebar Hub */}
                  <div className="lg:w-80 lg:border-l lg:border-gray-100 lg:pl-8 flex flex-col justify-between space-y-3 sm:space-y-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100 shrink-0">
                    <div className="space-y-2 sm:space-y-3">
                      {/* Price / Fee Box */}
                      <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 via-purple-50/20 to-pink-50/20 rounded-xl sm:rounded-2xl border border-gray-200/80 text-center space-y-1">
                        <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Application Fee</span>
                        <div className="text-xl sm:text-3xl font-black text-gray-900 font-mono">
                          {scheme.application_fee === 0 ? (
                            <span className="text-emerald-600">FREE</span>
                          ) : (
                            `₹${scheme.application_fee}`
                          )}
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 rounded-md border border-emerald-100 inline-block">
                          {scheme.application_fee === 0 ? '✓ No Fee Required' : '✓ Direct Bank DBT Eligible'}
                        </span>
                      </div>

                      {/* Benefits Bullets */}
                      <div className="space-y-1 text-xs text-gray-600 px-1 hidden sm:block">
                        <div className="flex items-center gap-2 text-[11px]">
                          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                          <span>Instant Provisional Admit Card</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                          <span>District Exam Center Allocation</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                          <span>Direct Bank Grant Payout</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-1 sm:pt-2">
                      <button
                        onClick={() => handleOpenApply(scheme)}
                        className="w-full py-3 sm:py-3.5 px-4 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-xs font-black uppercase tracking-wider rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <span>Apply Online Now</span>
                        <ArrowRight size={15} />
                      </button>

                      <button
                        onClick={() => setInspectingSchemeDoc(scheme)}
                        className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 transition-all flex items-center justify-center gap-1.5 shadow-2xs hover:text-[#C81E4E]"
                      >
                        <FileText size={13} className="text-[#C81E4E]" />
                        <span>Full Notification & Rules</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: INTERACTIVE ELIGIBILITY CHECKER */}
      {activeTab === 'checker' && (
        <section className="py-6 sm:py-12 pb-20 max-w-4xl mx-auto px-3 sm:px-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-4 sm:p-8 shadow-xl space-y-6 sm:space-y-8">
            <div className="text-center space-y-1.5 sm:space-y-2">
              <span className="text-[10px] font-bold text-[#9C27FF] uppercase tracking-widest px-3 py-1 bg-purple-50 rounded-full">
                Instant Qualification Engine
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-gray-900">
                Check Which Scholarships You Qualify For
              </h2>
              <p className="text-xs text-gray-500 max-w-lg mx-auto px-2">
                Input your academic score and family income to see immediate matched grant schemes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 p-3.5 sm:p-6 bg-gray-50/80 rounded-xl sm:rounded-2xl border border-gray-100">
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-gray-700 uppercase mb-1">Your Academic Stream</label>
                <select
                  value={checkerData.qualification}
                  onChange={(e) => setCheckerData({ ...checkerData, qualification: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-gray-200 text-xs font-semibold bg-white"
                >
                  <option value="10th">10th Standard Matric</option>
                  <option value="12th (PCM)">12th Standard (Science / PCM)</option>
                  <option value="12th (Commerce/Arts)">12th Standard (Commerce / Arts)</option>
                  <option value="Undergraduate">Undergraduate (B.Tech / BCA / B.Sc)</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-gray-700 uppercase mb-1">
                  Marks / Percentage ({checkerData.percentage}%)
                </label>
                <input
                  type="range"
                  min={40}
                  max={100}
                  value={checkerData.percentage}
                  onChange={(e) => setCheckerData({ ...checkerData, percentage: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF2D8D] mt-2 sm:mt-3"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>40%</span>
                  <span className="font-bold text-[#FF2D8D] text-xs">{checkerData.percentage}%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-gray-700 uppercase mb-1">
                  Annual Family Income (₹{checkerData.annual_income} LPA)
                </label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={0.5}
                  value={checkerData.annual_income}
                  onChange={(e) => setCheckerData({ ...checkerData, annual_income: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#9C27FF] mt-2 sm:mt-3"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>₹1 LPA</span>
                  <span className="font-bold text-[#9C27FF] text-xs">₹{checkerData.annual_income} LPA</span>
                  <span>₹20 LPA</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 sm:pb-3">
                <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                  Matched Scholarships for You ({eligibleSchemes.length} Found)
                </h3>
                <span className="text-[11px] sm:text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-emerald-100">
                  🎉 {eligibleSchemes.length} Eligible
                </span>
              </div>

              {eligibleSchemes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {eligibleSchemes.map((scheme) => (
                    <div
                      key={scheme.id}
                      className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs space-y-2.5 sm:space-y-3 hover:border-emerald-300 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            ✓ 100% Eligible
                          </span>
                          <span className="text-xs font-bold text-gray-800">
                            {scheme.application_fee === 0 ? 'Free' : `₹${scheme.application_fee}`}
                          </span>
                        </div>

                        <h4 className="font-bold text-gray-900 text-sm sm:text-base">{scheme.title}</h4>
                        <div className="text-xs font-bold text-[#FF2D8D]">{scheme.scholarship_value}</div>
                        <p className="text-xs text-gray-600 line-clamp-2">{scheme.description}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => setInspectingSchemeDoc(scheme)}
                          className="px-3 sm:px-3.5 py-2 sm:py-2.5 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold text-[11px] sm:text-xs rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1 shadow-xs"
                          title="View Sarkari Result Style Notification"
                        >
                          <FileText size={13} className="text-[#C81E4E]" />
                          Full Notification
                        </button>
                        <button
                          onClick={() => handleOpenApply(scheme)}
                          className="flex-1 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-[11px] sm:text-xs rounded-lg sm:rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                          Apply Online
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 sm:p-8 text-center bg-gray-50 rounded-xl sm:rounded-2xl text-gray-500 space-y-2">
                  <AlertCircle size={28} className="text-amber-500 mx-auto" />
                  <p className="text-xs sm:text-sm font-semibold">No direct matches for the selected criteria.</p>
                  <p className="text-[11px] sm:text-xs">Try adjusting your percentage or exploring our open grant programs.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: DOWNLOAD OFFICIAL ADMIT CARD */}
      {activeTab === 'admit_card' && (
        <section className="py-6 sm:py-12 pb-20 max-w-3xl mx-auto px-3 sm:px-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-4 sm:p-8 shadow-xl space-y-6 sm:space-y-8">
            <div className="text-center space-y-1.5 sm:space-y-2">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                Official Hall Ticket Verification
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-gray-900">
                Download Official Examination Admit Card
              </h2>
              <p className="text-xs text-gray-500 max-w-md mx-auto px-2">
                Enter your <strong>Application Number</strong> and the <strong>Security Registration Code</strong> from your Provisional Admit Card.
              </p>
            </div>

            <form onSubmit={handleFetchAdmitCard} className="space-y-3.5 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-gray-700 uppercase mb-1">
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
                          GRAVITY NATIONAL SCHOLARSHIP BOARD
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

                      <div className="p-4 bg-gray-100/90 rounded-2xl border border-gray-200 space-y-2 text-xs">
                        <div>
                          <span className="text-gray-500 font-bold">Allocated Examination Center: </span>
                          <span className="text-gray-900 font-extrabold text-sm block sm:inline">{admitResult.admit_card.exam_center}</span>
                        </div>
                        {admitResult.admit_card.exam_center_address && (
                          <div className="text-gray-700">
                            <span className="text-gray-500 font-bold">Venue Address: </span>
                            <span>{admitResult.admit_card.exam_center_address}</span>
                          </div>
                        )}
                        {admitResult.admit_card.center_landmark && (
                          <div className="text-gray-700">
                            <span className="text-gray-500 font-bold">Landmark: </span>
                            <span>{admitResult.admit_card.center_landmark}</span>
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1 border-t border-gray-200">
                          <div>
                            <span className="text-gray-500 font-bold">Exam Date & Time Slot: </span>
                            <span className="text-gray-900 font-semibold">{admitResult.admit_card.exam_slot}</span>
                          </div>
                          {admitResult.admit_card.google_maps_url && (
                            <a
                              href={admitResult.admit_card.google_maps_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 shrink-0"
                            >
                              📍 Open in Google Maps
                            </a>
                          )}
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
                  <div className="p-4 sm:p-8 rounded-3xl bg-amber-50 border border-amber-200 text-center space-y-4">
                    <Clock size={40} className="text-amber-600 mx-auto animate-pulse" />
                    <h3 className="font-heading font-black text-amber-950 text-base sm:text-xl">Provisional Registration Confirmed!</h3>
                    <p className="text-xs text-amber-800 max-w-lg mx-auto leading-relaxed">
                      Your application <strong>{admitResult.applicant.application_no}</strong> is verified in the system. Official Hall Tickets are being approved in bulk by the Superadmin Examination Board.
                    </p>

                    <div className="p-3.5 sm:p-5 bg-white rounded-2xl border border-amber-200 max-w-md mx-auto text-xs flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left shadow-xs">
                      <div className="w-20 h-24 border border-gray-200 rounded-xl overflow-hidden shrink-0 bg-gray-50 shadow-2xs">
                        <img
                          src={admitResult.applicant.photo_url || DEFAULT_SAMPLE_PHOTOS[0]}
                          alt={admitResult.applicant.applicant_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1.5 w-full flex-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500 font-semibold">Applicant:</span>
                          <strong className="text-gray-900 font-bold">{admitResult.applicant.applicant_name}</strong>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500 font-semibold">Security Code:</span>
                          <strong className="font-mono text-purple-700 font-bold">{admitResult.applicant.registration_code}</strong>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500 font-semibold">Scheduled Exam Date:</span>
                          <strong className="text-gray-900 font-bold">{admitResult.scholarship?.exam_date || '2026-09-28'}</strong>
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
        <section className="scorecard-active-section py-6 sm:py-12 pb-20 max-w-4xl mx-auto px-3 sm:px-6 space-y-6 sm:space-y-8">
          {/* Result Search Card (Hidden when Printing) */}
          <div className="no-print bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-4 sm:p-8 shadow-xl space-y-4 sm:space-y-6">
            <div className="text-center space-y-1.5 sm:space-y-2">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
                Official Examination Results Desk
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-gray-900">
                Check Examination Result & Scorecard
              </h2>
              <p className="text-xs text-gray-500 max-w-md mx-auto px-2">
                Enter your <strong>Admit Card Roll Number</strong> or <strong>Application Number</strong> to fetch your official marksheet, merit rank, and scholarship grant entitlement.
              </p>
            </div>

            <form onSubmit={handleCheckStudentScorecard} className="space-y-3.5 sm:space-y-4 max-w-xl mx-auto">
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-gray-700 uppercase mb-1">
                  Roll Number / Application Number / Registered Email *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. GRAVITY-26-5467 or SCH-2026-2378"
                    value={resultLookupInput}
                    onChange={(e) => setResultLookupInput(e.target.value)}
                    className="w-full px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white text-gray-900 placeholder:text-gray-400 border-2 border-gray-200 text-xs sm:text-sm font-mono font-bold focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                  {resultLookupInput && (
                    <button
                      type="button"
                      onClick={() => setResultLookupInput('')}
                      className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={resultLookupLoading}
                className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Search size={16} />
                {resultLookupLoading ? 'Verifying Examination Records...' : 'Search & Fetch Official Scorecard'}
              </button>
            </form>

            {resultLookupError && (
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 max-w-xl mx-auto">
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
            studentScorecard.is_released === false ? (
              <div className="p-8 rounded-3xl bg-amber-50 border-2 border-amber-200 text-center space-y-4 shadow-md">
                <Clock size={48} className="text-amber-600 mx-auto animate-pulse" />
                <h3 className="font-heading font-black text-amber-950 text-xl sm:text-2xl">Result Not Issued / Announced Yet</h3>
                <p className="text-xs sm:text-sm text-amber-800 max-w-lg mx-auto leading-relaxed">
                  Your application <strong>{studentScorecard.application_no}</strong> ({studentScorecard.applicant_name}) is registered in the system. The examination evaluation and official result declaration for <strong>{studentScorecard.scholarship_title}</strong> are currently under review by the Superadmin board.
                </p>
                <div className="inline-block p-3 bg-white rounded-2xl border border-amber-200 text-xs text-left max-w-md w-full space-y-1 text-gray-700 shadow-2xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Candidate Name:</span>
                    <strong className="text-gray-900">{studentScorecard.applicant_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Application Number:</span>
                    <strong className="font-mono text-purple-700">{studentScorecard.application_no}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Result Status:</span>
                    <strong className="text-amber-700 font-bold">EVALUATION IN PROGRESS (NOT PUBLISHED)</strong>
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setStudentScorecard(null)}
                    className="px-6 py-2.5 bg-amber-600 text-white font-bold text-xs rounded-xl shadow hover:bg-amber-700 transition-all"
                  >
                    Close Notice
                  </button>
                </div>
              </div>
            ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Embedded Print Stylesheet for STRICT 1-PAGE A4 Output */}
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  @page {
                    size: A4 portrait;
                    margin: 4mm 6mm;
                  }
                  html, body {
                    background: #fff !important;
                    color: #000 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    height: auto !important;
                    min-height: 0 !important;
                    max-height: 297mm !important;
                    overflow: hidden !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  header, footer, nav, aside, section:not(.scorecard-active-section), .no-print, .no-print * {
                    display: none !important;
                    height: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    visibility: hidden !important;
                  }
                  .scorecard-active-section {
                    padding: 0 !important;
                    margin: 0 !important;
                    max-width: 100% !important;
                  }
                  #official-scorecard-certificate {
                    display: block !important;
                    position: static !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 0 auto !important;
                    padding: 14px 18px !important;
                    border: 2px solid #1e3a8a !important;
                    border-radius: 10px !important;
                    background: #fff !important;
                    box-shadow: none !important;
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                    page-break-after: avoid !important;
                    break-after: avoid !important;
                    page-break-before: avoid !important;
                    break-before: avoid !important;
                    box-sizing: border-box !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                }
              `}} />

              {/* Action Bar (Hidden in Print) */}
              <div className="no-print flex justify-between items-center bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    studentScorecard.merit_status === 'qualified'
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-rose-500'
                  }`}></span>
                  <span className="font-bold text-gray-800">
                    {studentScorecard.merit_status === 'qualified'
                      ? 'Official Scorecard: QUALIFIED CANDIDATE'
                      : 'Official Scorecard: NOT QUALIFIED'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                  >
                    <Download size={14} />
                    Print Scorecard (1-Page PDF)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudentScorecard(null)}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all flex items-center gap-1"
                  >
                    <X size={14} />
                    Close
                  </button>
                </div>
              </div>

              {/* Official Certificate Card (Single-Page Optimized) */}
              <div
                id="official-scorecard-certificate"
                className="bg-white rounded-3xl border-4 border-double border-indigo-900/40 p-5 sm:p-7 shadow-2xl space-y-4 relative overflow-hidden"
              >
                {/* Background Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.025] pointer-events-none select-none font-black text-7xl text-indigo-950 rotate-[-22deg]">
                  GRAVITY MERIT 2026
                </div>

                {/* Scorecard Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b-2 border-indigo-900/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-900 text-amber-400 flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                      🏆
                    </div>
                    <div>
                      <span className="text-[10px] font-black tracking-widest text-indigo-900 uppercase">
                        GRAVITY NATIONAL SCHOLARSHIP & MERIT COUNCIL
                      </span>
                      <h3 className="text-lg sm:text-xl font-heading font-black text-gray-900">
                        Candidate Examination Scorecard & Result Dossier
                      </h3>
                      <p className="text-[10px] text-gray-500 font-medium">
                        National Assessment & Academic Evaluation Directorate • Session 2026-27
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:self-center shrink-0">
                    <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                      studentScorecard.merit_status === 'qualified'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-rose-100 text-rose-900 border-rose-300'
                    }`}>
                      {studentScorecard.merit_status === 'qualified'
                        ? '● QUALIFIED'
                        : '● NOT QUALIFIED'}
                    </span>
                    <div className="text-[9px] text-gray-400 font-mono mt-0.5">
                      Ref: {studentScorecard.award_disbursement_ref || `REF-${studentScorecard.application_no || '001'}`}
                    </div>
                  </div>
                </div>

                {/* Candidate Bio & Examination Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-gray-50/90 p-4 rounded-xl border border-gray-200 text-xs">
                  {/* Photo with Verified Badge */}
                  <div className="flex flex-col items-center space-y-1.5 text-center">
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-white border-2 border-indigo-900/30 shadow-sm relative">
                      <img
                        src={studentScorecard.photo_url}
                        alt={studentScorecard.applicant_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck size={10} /> Verified
                    </span>
                  </div>

                  {/* Candidate Bio Information */}
                  <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs">
                    <div>
                      <span className="text-gray-400 font-semibold block text-[9px] uppercase">Candidate Name</span>
                      <strong className="text-gray-950 text-sm font-heading font-black">{studentScorecard.applicant_name}</strong>
                    </div>

                    <div>
                      <span className="text-gray-400 font-semibold block text-[9px] uppercase">Examination Roll Number</span>
                      <strong className="font-mono text-indigo-900 text-xs font-black">{studentScorecard.roll_number}</strong>
                    </div>

                    <div>
                      <span className="text-gray-400 font-semibold block text-[9px] uppercase">Application Reference No</span>
                      <span className="font-mono font-bold text-gray-700 text-[11px]">{studentScorecard.application_no}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 font-semibold block text-[9px] uppercase">Security Registration Code</span>
                      <span className="font-mono font-bold text-purple-700 text-[11px]">{studentScorecard.registration_code}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 font-semibold block text-[9px] uppercase">Father&apos;s Name / DOB</span>
                      <span className="text-gray-800 font-bold text-[11px]">{studentScorecard.father_name || 'N/A'} • {studentScorecard.dob || '2006-05-15'}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 font-semibold block text-[9px] uppercase">Class & Stream</span>
                      <span className="text-gray-800 font-bold text-[11px]">{studentScorecard.qualification} • {studentScorecard.school_college_name || 'Affiliated School'}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 font-semibold block text-[9px] uppercase">Scholarship Scheme</span>
                      <strong className="text-[#FF2D8D] font-bold text-[11px]">{studentScorecard.scholarship_title}</strong>
                    </div>

                    <div>
                      <span className="text-gray-400 font-semibold block text-[9px] uppercase">Examination Venue & Date</span>
                      <span className="text-gray-800 font-bold text-[11px]">{studentScorecard.exam_center} ({studentScorecard.exam_date})</span>
                    </div>
                  </div>
                </div>

                {/* Performance & Marks Breakdown Table */}
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gradient-to-r from-indigo-900 to-blue-900 text-white text-[10px] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-4 py-2.5">Assessment Section</th>
                        <th className="px-4 py-2.5 text-center">Maximum Marks</th>
                        <th className="px-4 py-2.5 text-center">Marks Scored</th>
                        <th className="px-4 py-2.5 text-center">Percentage</th>
                        <th className="px-4 py-2.5 text-right">Result & Merit Standing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white font-medium">
                      <tr>
                        <td className="px-4 py-3">
                          <div className="font-bold text-gray-900 text-xs">National Scholarship Assessment Test</div>
                          <div className="text-[10px] text-gray-400">Section A: General Aptitude • Section B: Technical Core</div>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-gray-600 font-mono text-xs">
                          {studentScorecard.total_marks || 100}.00
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-black text-base font-mono ${
                            studentScorecard.merit_status === 'qualified'
                              ? 'text-emerald-600'
                              : 'text-rose-600'
                          }`}>
                            {studentScorecard.exam_marks != null ? Number(studentScorecard.exam_marks).toFixed(2) : '0.00'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-black text-indigo-900 text-xs font-mono">
                          {studentScorecard.percentage_score}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {studentScorecard.merit_status === 'qualified' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                              🟢 QUALIFIED {studentScorecard.rank ? `(Rank #${studentScorecard.rank})` : ''}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-[11px] bg-rose-100 text-rose-800 border border-rose-300">
                              🔴 NOT QUALIFIED
                            </span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* CONDITIONAL ENTITLEMENT & STATUS BANNER */}
                {studentScorecard.merit_status === 'qualified' ? (
                  /* CASE 1: QUALIFIED CANDIDATE */
                  <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 rounded-xl border-2 border-emerald-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                          ✓ QUALIFIED & AWARDED
                        </span>
                        <span className="text-[10px] font-bold text-gray-500">Official Institutional Scholarship Benefit</span>
                      </div>
                      <div className="text-base font-heading font-black text-emerald-950">
                        {studentScorecard.award_amount || '100% Tuition Fee Waiver + Merit Living Allowance'}
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1 shrink-0">
                      <div className="text-right font-mono text-[11px] text-gray-600">
                        <div>Ref: <strong className="text-indigo-900">{studentScorecard.award_disbursement_ref}</strong></div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowChequeModal(true)}
                        className="no-print px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-black rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1"
                      >
                        🏆 View Official Award Cheque
                      </button>
                    </div>
                  </div>
                ) : (
                  /* CASE 2: NOT QUALIFIED CANDIDATE */
                  <div className="p-4 bg-rose-50 rounded-xl border-2 border-rose-200 flex items-start gap-3 text-xs">
                    <span className="text-2xl shrink-0">🔴</span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white">
                          NOT QUALIFIED (BELOW CUT-OFF)
                        </span>
                        <span className="text-[11px] font-bold text-rose-900">Minimum Qualifying Benchmark Not Met</span>
                      </div>
                      <p className="text-[11px] text-rose-800 leading-relaxed">
                        Thank you for appearing in the National Scholarship Assessment Test. Your obtained score ({studentScorecard.exam_marks != null ? Number(studentScorecard.exam_marks).toFixed(2) : '0'}/{studentScorecard.total_marks || 100}) is below the minimum qualifying cut-off score. No scholarship grant or fee waiver is allocated for this cycle. We encourage you to participate in upcoming assessment rounds!
                      </p>
                    </div>
                  </div>
                )}

                {/* 1. LMS 100% Course Fee Waiver Key (ONLY for QUALIFIED) */}
                {studentScorecard.merit_status === 'qualified' && studentScorecard.award_voucher_code && (
                  <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-purple-200 text-purple-900">
                          🎓 100% FREE COURSE ENROLLMENT KEY
                        </span>
                        <h4 className="font-heading font-black text-purple-950 text-sm mt-0.5">
                          Your Exclusive Scholarship Course Voucher
                        </h4>
                        <p className="text-[10px] text-purple-700">
                          Use this voucher during LMS checkout to enroll in any certified program for ₹0.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-purple-300 shadow-xs shrink-0">
                        <span className="font-mono font-black text-purple-950 text-xs tracking-wider">
                          {studentScorecard.award_voucher_code}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(studentScorecard.award_voucher_code)
                            setCopiedCourseVoucher(true)
                            setTimeout(() => setCopiedCourseVoucher(false), 2000)
                          }}
                          className="no-print px-2 py-0.5 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold rounded transition-all flex items-center gap-1"
                        >
                          {copiedCourseVoucher ? <Check size={11} /> : <Copy size={11} />}
                          {copiedCourseVoucher ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Cash Grant Payout Receipt or Bank Claim Form (ONLY FOR QUALIFIED TOP 3 WINNERS) */}
                {studentScorecard.merit_status === 'qualified' && studentScorecard.rank && studentScorecard.rank <= 3 && (
                  <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-200 text-emerald-950">
                        💰 CASH PRIZE DISBURSEMENT DESK
                      </span>
                      {studentScorecard.payout_details && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          ● Payout Processed (UTR: {studentScorecard.payout_details.bank_utr})
                        </span>
                      )}
                    </div>

                    {studentScorecard.bank_details ? (
                      <div className="bg-white p-3 rounded-lg border border-emerald-200 text-xs space-y-1">
                        <div className="font-bold text-gray-800 text-[11px]">Registered Account for Cash Grant Payout:</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-gray-600 text-[10px] pt-0.5">
                          <div>Bank: <strong>{studentScorecard.bank_details.bank_name || 'N/A'}</strong></div>
                          <div>A/C: <strong className="font-mono">{studentScorecard.bank_details.account_number}</strong></div>
                          <div>IFSC: <strong className="font-mono">{studentScorecard.bank_details.ifsc_code}</strong></div>
                          <div>UPI: <strong className="font-mono text-purple-700">{studentScorecard.bank_details.upi_id || 'N/A'}</strong></div>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitBankClaim} className="no-print bg-white p-3.5 rounded-xl border border-emerald-200 space-y-2.5">
                        <div className="space-y-0.5">
                          <div className="font-bold text-emerald-950 text-xs">
                            🏆 Claim Your Cash Prize Transfer:
                          </div>
                          <p className="text-[10px] text-gray-500">
                            Please provide your Bank Account or UPI ID. The finance council will disburse your cash prize directly.
                          </p>
                        </div>

                        {bankSuccessMsg && (
                          <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-lg text-[11px] font-bold flex items-center gap-1.5">
                            <CheckCircle2 size={14} /> {bankSuccessMsg}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="block text-[9px] font-bold text-gray-700 uppercase mb-0.5">Bank Name *</label>
                            <input
                              type="text"
                              required
                              value={bankClaimForm.bank_name}
                              onChange={(e) => setBankClaimForm({ ...bankClaimForm, bank_name: e.target.value })}
                              placeholder="e.g. State Bank of India"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-gray-50/50"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold text-gray-700 uppercase mb-0.5">Account Number *</label>
                            <input
                              type="text"
                              required
                              value={bankClaimForm.account_number}
                              onChange={(e) => setBankClaimForm({ ...bankClaimForm, account_number: e.target.value })}
                              placeholder="e.g. 102938475610"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-mono bg-gray-50/50"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold text-gray-700 uppercase mb-0.5">IFSC Code *</label>
                            <input
                              type="text"
                              required
                              value={bankClaimForm.ifsc_code}
                              onChange={(e) => setBankClaimForm({ ...bankClaimForm, ifsc_code: e.target.value.toUpperCase() })}
                              placeholder="e.g. SBIN0001234"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-mono uppercase bg-gray-50/50"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold text-gray-700 uppercase mb-0.5">UPI ID (Optional)</label>
                            <input
                              type="text"
                              value={bankClaimForm.upi_id}
                              onChange={(e) => setBankClaimForm({ ...bankClaimForm, upi_id: e.target.value })}
                              placeholder="e.g. username@okhdfcbank"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-mono bg-gray-50/50"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={bankSubmitting}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all"
                        >
                          {bankSubmitting ? 'Saving...' : '✓ Submit Bank Details for Prize'}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* Footer Signatures & QR Code */}
                <div className="pt-3 border-t-2 border-indigo-900/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-2.5">
                    <div className="w-12 h-12 bg-gray-100 border border-gray-300 rounded-lg p-0.5 shadow-inner flex items-center justify-center shrink-0">
                      <QrCode size={36} className="text-indigo-950" />
                    </div>
                    <div className="space-y-0.5 text-[9px]">
                      <div className="font-bold text-gray-800">Tamper-Proof Digital Verification</div>
                      <div>Scan QR code on official portal to verify document authenticity.</div>
                      <div className="font-mono text-gray-400">UID: {studentScorecard.id}</div>
                    </div>
                  </div>

                  <div className="text-center sm:text-right space-y-0.5">
                    <div className="font-serif italic text-sm font-bold text-indigo-950">Dr. Rajeshwari Sen</div>
                    <div className="text-[9px] font-bold uppercase text-gray-600 border-t border-gray-300 pt-0.5">
                      Controller of Examinations • National Evaluation Board
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            )
          )}
        </section>
      )}

      {/* TAB 5: TOP 3 WINNERS PODIUM & COMPLETE MERIT RANKINGS TABLE */}
      {activeTab === 'merit_list' && (
        <section className="py-6 sm:py-12 pb-20 max-w-5xl mx-auto px-3 sm:px-6 space-y-6 sm:space-y-8">
          {/* 1. AUTOMATIC TOP 3 WINNERS PODIUM (VISIBLE ONCE RESULTS ARE RELEASED) */}
          {topThreeWinners.length > 0 && (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-8 shadow-xl space-y-4 sm:space-y-6">
              <div className="text-center space-y-1 sm:space-y-1.5">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest px-3 py-1 bg-amber-50 rounded-full border border-amber-200">
                  🏆 National Honor Roll
                </span>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-gray-900">
                  All-India Top 3 Scholarship Champions
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Congratulations to our top merit scorers receiving highest honors and cash grants!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2 sm:pt-4 items-end">
                {/* 2nd Place (Silver) */}
                {topThreeWinners.find((w) => w.rank === 2) && (() => {
                  const silver = topThreeWinners.find((w) => w.rank === 2)!
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-b from-gray-50 to-slate-100 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-gray-200 text-center space-y-2.5 sm:space-y-3 shadow-md relative"
                    >
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-400 text-white font-black text-xs sm:text-sm flex items-center justify-center mx-auto shadow-xs">
                        🥈 #2
                      </div>
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden mx-auto border-2 border-gray-300 shadow-xs">
                        <img src={silver.photo_url} alt={silver.applicant_name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base">{silver.applicant_name}</h4>
                        <p className="text-[10px] sm:text-[11px] text-gray-500 font-mono">Roll: {silver.roll_number}</p>
                        <p className="text-xs text-[#FF2D8D] font-bold mt-0.5 sm:mt-1">{silver.scholarship_title}</p>
                      </div>
                      <div className="p-2 sm:p-2.5 bg-white rounded-xl sm:rounded-2xl border border-gray-200 space-y-0.5">
                        <div className="text-sm sm:text-base font-black text-emerald-600">{silver.exam_marks} / 100</div>
                        <div className="text-[10px] sm:text-[11px] font-extrabold text-purple-700">{silver.prize_amount}</div>
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
                      className="bg-gradient-to-b from-amber-50 via-yellow-50 to-orange-50 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-amber-300 text-center space-y-3 sm:space-y-4 shadow-xl relative mt-0 md:-mt-4"
                    >
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-0.5 sm:py-1 rounded-full bg-amber-500 text-white font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-md whitespace-nowrap">
                        🥇 1st Prize Champion
                      </div>
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden mx-auto border-4 border-amber-400 shadow-md mt-2">
                        <img src={gold.photo_url} alt={gold.applicant_name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-heading font-black text-gray-900 text-base sm:text-lg">{gold.applicant_name}</h4>
                        <p className="text-[11px] sm:text-xs text-gray-600 font-mono">Roll: {gold.roll_number}</p>
                        <p className="text-xs text-[#FF2D8D] font-black mt-0.5 sm:mt-1">{gold.scholarship_title}</p>
                      </div>
                      <div className="p-2.5 sm:p-3.5 bg-white/90 rounded-xl sm:rounded-2xl border border-amber-200 space-y-0.5 sm:space-y-1 shadow-xs">
                        <div className="text-xl sm:text-2xl font-black text-emerald-600">{gold.exam_marks} / 100</div>
                        <div className="text-[11px] sm:text-xs font-black text-amber-700">{gold.prize_amount}</div>
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
                      className="bg-gradient-to-b from-amber-50/50 to-orange-100/40 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-amber-200 text-center space-y-2.5 sm:space-y-3 shadow-md relative"
                    >
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-700 text-white font-black text-xs sm:text-sm flex items-center justify-center mx-auto shadow-xs">
                        🥉 #3
                      </div>
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden mx-auto border-2 border-amber-300 shadow-xs">
                        <img src={bronze.photo_url} alt={bronze.applicant_name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base">{bronze.applicant_name}</h4>
                        <p className="text-[10px] sm:text-[11px] text-gray-500 font-mono">Roll: {bronze.roll_number}</p>
                        <p className="text-xs text-[#FF2D8D] font-bold mt-0.5 sm:mt-1">{bronze.scholarship_title}</p>
                      </div>
                      <div className="p-2 sm:p-2.5 bg-white rounded-xl sm:rounded-2xl border border-amber-100 space-y-0.5">
                        <div className="text-sm sm:text-base font-black text-emerald-600">{bronze.exam_marks} / 100</div>
                        <div className="text-[10px] sm:text-[11px] font-extrabold text-amber-800">{bronze.prize_amount}</div>
                      </div>
                    </motion.div>
                  )
                })()}
              </div>
            </div>
          )}

          {/* 2. COMPLETE MERIT RANKINGS TABLE */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-8 shadow-xl space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest px-3 py-1 bg-blue-50 rounded-full">
                  Categorized Examination Results Desk
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">Official Scholarship Merit Rankings</h2>
                <p className="text-xs text-gray-500">Select any scholarship exam scheme below to view its specific merit ranks & awards.</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search candidate, Roll..."
                    value={meritQuery}
                    onChange={(e) => setMeritQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchMeritList()}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
                <button
                  onClick={fetchMeritList}
                  className="px-3.5 sm:px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs shrink-0"
                >
                  Search
                </button>
              </div>
            </div>

            {/* SCHOLARSHIP SCHEME TABS */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 pt-2 border-t border-gray-100 -mx-4 px-4 sm:mx-0 sm:px-0">
              <button
                onClick={() => setMeritSchemeFilter('all')}
                className={`px-3.5 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  meritSchemeFilter === 'all'
                    ? 'bg-gray-900 text-white shadow-xs'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>🏆 All Schemes</span>
              </button>

              {scholarships.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setMeritSchemeFilter(s.id)}
                  className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap ${
                    meritSchemeFilter === s.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20 uppercase font-semibold">
                    {s.category}
                  </span>
                  <span>{s.title}</span>
                </button>
              ))}
            </div>

            {/* Active Selected Scheme Detail Banner */}
            {meritSchemeFilter !== 'all' && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-pink-50/40 border border-blue-100 space-y-2.5">
                {(() => {
                  const activeScheme = scholarships.find((s) => s.id === meritSchemeFilter)
                  if (!activeScheme) return null
                  const isReleased = activeScheme.status === 'results_declared'
                  const winnerDesc = activeScheme.winner_description || activeScheme.prize_distribution?.winner_description

                  return (
                    <>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-blue-100/80 pb-2">
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
                      </div>

                      {winnerDesc && (
                        <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200 text-xs flex items-start gap-2">
                          <span className="text-sm">🏆</span>
                          <div>
                            <span className="font-bold text-amber-950 uppercase text-[10px] block">Winner Reward Structure:</span>
                            <p className="text-gray-700 whitespace-pre-line text-[11px] font-medium leading-relaxed">{winnerDesc}</p>
                          </div>
                        </div>
                      )}
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
                  className={`pb-2.5 sm:pb-3 transition-all border-b-2 flex items-center justify-center gap-1.5 sm:gap-2 ${
                    formSection === 'personal'
                      ? 'border-[#FF2D8D] text-[#FF2D8D]'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] shrink-0 ${
                    formSection === 'personal' ? 'bg-[#FF2D8D] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>1</span>
                  <span className="hidden sm:inline">Personal Details</span>
                  <span className="sm:hidden text-[11px]">Personal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormSection('academic')}
                  className={`pb-2.5 sm:pb-3 transition-all border-b-2 flex items-center justify-center gap-1.5 sm:gap-2 ${
                    formSection === 'academic'
                      ? 'border-[#FF2D8D] text-[#FF2D8D]'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] shrink-0 ${
                    formSection === 'academic' ? 'bg-[#FF2D8D] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>2</span>
                  <span className="hidden sm:inline">Academic Details</span>
                  <span className="sm:hidden text-[11px]">Academic</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormSection('documents')}
                  className={`pb-2.5 sm:pb-3 transition-all border-b-2 flex items-center justify-center gap-1.5 sm:gap-2 ${
                    formSection === 'documents'
                      ? 'border-[#FF2D8D] text-[#FF2D8D]'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] shrink-0 ${
                    formSection === 'documents' ? 'bg-[#FF2D8D] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>3</span>
                  <span className="hidden sm:inline">Uploads & Centers</span>
                  <span className="sm:hidden text-[11px]">Docs & Center</span>
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

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">State *</label>
                            <select
                              required
                              value={applicantForm.state || 'Bihar'}
                              onChange={(e) => {
                                const newState = e.target.value
                                const dists = getDistrictsForState(newState)
                                const d1 = dists[0] || ''
                                const d2 = dists[1] || d1
                                setApplicantForm({
                                  ...applicantForm,
                                  state: newState,
                                  district: d1,
                                  city: d1,
                                  preference_state: newState,
                                  preference_district_1: d1,
                                  preference_district_2: d2,
                                  exam_city_preference: `${d1} (Pref 1) / ${d2} (Pref 2)`,
                                })
                              }}
                              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white font-medium"
                            >
                              {getIndianStates().map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">District *</label>
                            <select
                              required
                              value={applicantForm.district || getDistrictsForState(applicantForm.state || 'Bihar')[0] || ''}
                              onChange={(e) => {
                                const newDist = e.target.value
                                setApplicantForm({
                                  ...applicantForm,
                                  district: newDist,
                                  city: newDist,
                                  preference_district_1: newDist,
                                  exam_city_preference: `${newDist} (Pref 1) / ${applicantForm.preference_district_2 || 'Backup'} (Pref 2)`,
                                })
                              }}
                              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white font-medium"
                            >
                              {getDistrictsForState(applicantForm.state || 'Bihar').map((d) => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">City / Town / Village *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Boring Road / Mohalla"
                              value={applicantForm.city}
                              onChange={(e) => setApplicantForm({ ...applicantForm, city: e.target.value })}
                              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">PIN Code *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 800001"
                              value={applicantForm.pincode}
                              onChange={(e) => setApplicantForm({ ...applicantForm, pincode: e.target.value })}
                              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-mono bg-white"
                            />
                          </div>
                        </div>

                        {/* Reference / Referral Code (Optional) */}
                        <div className="pt-2 border-t border-gray-200/60">
                          <div className="p-3.5 bg-gradient-to-r from-pink-50/70 to-purple-50/70 rounded-2xl border border-pink-100 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-0.5">
                                <label className="block text-xs font-extrabold text-gray-800 uppercase tracking-wide">
                                  Reference / Referral Code (Optional)
                                </label>
                                <p className="text-[11px] text-gray-500">
                                  If you were referred by an authorized teacher, campus ambassador, or partner, enter their code here.
                                </p>
                              </div>
                              <div className="w-full sm:w-80 shrink-0 flex items-center gap-1.5">
                                <input
                                  type="text"
                                  placeholder="e.g. REF-VIP-2026"
                                  value={applicantForm.reference_code}
                                  onChange={(e) => {
                                    setApplicantForm({ ...applicantForm, reference_code: e.target.value.toUpperCase() })
                                    setRefCodeVerifiedData(null)
                                    setRefCodeVerifyError(null)
                                  }}
                                  className="flex-1 px-3.5 py-2 border border-pink-200 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-white focus:ring-2 focus:ring-[#FF2D8D]/30 focus:border-[#FF2D8D] placeholder:normal-case placeholder:font-normal"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleVerifyRefCode()}
                                  disabled={refCodeVerifying || !applicantForm.reference_code.trim()}
                                  className="px-3.5 py-2 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-xs font-extrabold rounded-xl shadow-xs hover:shadow-md transition-all disabled:opacity-50 shrink-0"
                                >
                                  {refCodeVerifying ? 'Verifying...' : 'Verify Code'}
                                </button>
                              </div>
                            </div>

                            {/* Verification Result Badges */}
                            {refCodeVerifiedData && (
                              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1 animate-in fade-in duration-150">
                                <div className="flex items-center gap-2 font-bold text-emerald-950">
                                  <span className="text-base">✅</span>
                                  <span>Verified Partner Code: <strong className="text-emerald-950 uppercase">{refCodeVerifiedData.code}</strong> (Representative: <strong className="text-emerald-900">{refCodeVerifiedData.representative_name}</strong>)</span>
                                </div>
                                {referralDiscountPercent > 0 && (
                                  <div className="flex items-center gap-2 pl-6 text-[11px] font-extrabold text-emerald-700">
                                    <span>🎉 {referralDiscountPercent}% Referral Discount Applied!</span>
                                    <span>(You save ₹{referralDiscountAmount} on this scholarship application fee)</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {refCodeVerifyError && (
                              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2 animate-in fade-in duration-150">
                                <span className="text-sm">⚠️</span>
                                <span>{refCodeVerifyError}</span>
                              </div>
                            )}
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
                              Select your current standard/class and provide institutional, board, and marks percentage details.
                            </p>
                          </div>
                          <span className="text-xs font-extrabold text-[#FF2D8D] bg-pink-50 border border-pink-200 px-3 py-1 rounded-full shrink-0">
                            Class: {applicantForm.qualification || 'Not Selected'}
                          </span>
                        </div>

                        {/* STUDENT CURRENT CLASS / STANDARD SELECTOR */}
                        <div className="p-4 bg-gradient-to-r from-pink-50/70 via-purple-50/50 to-white rounded-2xl border border-pink-100 space-y-2.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <label className="text-xs font-black text-gray-900 uppercase flex items-center gap-1.5">
                              <GraduationCap size={15} className="text-[#FF2D8D]" />
                              Select Your Current Class / Standard *
                            </label>
                            <span className="text-[11px] font-bold text-purple-700">
                              Choose from eligible criteria
                            </span>
                          </div>

                          {/* Quick Badges for Eligible Scheme Qualifications */}
                          {selectedScheme?.eligible_qualifications && selectedScheme.eligible_qualifications.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {selectedScheme.eligible_qualifications.map((q) => {
                                const isSelected = applicantForm.qualification === q
                                return (
                                  <button
                                    key={q}
                                    type="button"
                                    onClick={() => handleSelectStudentClass(q)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                                      isSelected
                                        ? 'bg-[#FF2D8D] text-white shadow-pink-500/20 shadow-md scale-105 border border-[#FF2D8D]'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:border-pink-200 hover:bg-pink-50/50'
                                    }`}
                                  >
                                    <span>{isSelected ? '✓' : '•'}</span>
                                    <span>{q}</span>
                                  </button>
                                )
                              })}
                            </div>
                          )}

                          {/* Dynamic Guidance Banner based on Class */}
                          <div className="p-2.5 bg-white/90 rounded-xl border border-pink-100 text-[11px] text-gray-600 flex items-center gap-2">
                            <Sparkles size={14} className="text-[#FF2D8D] shrink-0" />
                            {(() => {
                              const q = (applicantForm.qualification || '').toLowerCase()
                              if (q.includes('6th') || q.includes('7th') || q.includes('8th') || q.includes('9th') || q.includes('10th')) {
                                return (
                                  <span>
                                    Applying as <strong>{applicantForm.qualification} School Scholar</strong>. Enter your current school name and previous standard&apos;s annual exam score.
                                  </span>
                                )
                              } else if (q.includes('11th') || q.includes('12th')) {
                                return (
                                  <span>
                                    Applying as <strong>{applicantForm.qualification} Scholar</strong>. Enter your 10th board passing details and current junior college name.
                                  </span>
                                )
                              }
                              return (
                                <span>
                                  Applying for <strong>{applicantForm.qualification}</strong>. Enter your university / college and qualification details.
                                </span>
                              )
                            })()}
                          </div>
                        </div>

                        {/* List of Dynamic Qualification Standard Cards */}
                        <div className="space-y-4">
                          {academicRecords.map((record, index) => {
                            const q = (record.qualification || '').toLowerCase()
                            const isSchool = q.includes('6th') || q.includes('7th') || q.includes('8th') || q.includes('9th') || q.includes('10th')
                            const isSeniorSec = q.includes('11th') || q.includes('12th')

                            return (
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
                                      {record.qualification} Academic Details
                                    </span>
                                    {!record.is_custom ? (
                                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md">
                                        Primary Standard
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                                        Additional Record
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

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 pt-1">
                                  {/* School / College Name */}
                                  <div className="sm:col-span-2 lg:col-span-6">
                                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                      {isSchool ? 'School Name *' : isSeniorSec ? 'Junior College / School Name *' : 'College / University Name *'}
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      placeholder={
                                        isSchool
                                          ? 'e.g. Delhi Public School / DAV School / Govt High School'
                                          : isSeniorSec
                                          ? 'e.g. Senior Secondary School / Junior College'
                                          : 'e.g. IIT / NIT / State University'
                                      }
                                      value={record.institution}
                                      onChange={(e) => handleUpdateAcademicRecord(record.id, 'institution', e.target.value)}
                                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                                    />
                                  </div>

                                  {/* Board / University */}
                                  <div className="lg:col-span-3">
                                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                      {isSchool ? 'School Board *' : 'Board / University *'}
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      placeholder={isSchool ? 'e.g. CBSE / ICSE / BSEB / State Board' : 'e.g. CBSE / State Board / University'}
                                      value={record.board_university}
                                      onChange={(e) => handleUpdateAcademicRecord(record.id, 'board_university', e.target.value)}
                                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                                    />
                                  </div>

                                  {/* Roll Number / Reg No */}
                                  <div className="lg:col-span-3">
                                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                      {isSchool ? 'School Roll / S.R. No.' : 'Roll No / Reg No'}
                                    </label>
                                    <input
                                      type="text"
                                      placeholder={isSchool ? 'e.g. 18 / SR-2024' : 'e.g. 12489201'}
                                      value={record.roll_no}
                                      onChange={(e) => handleUpdateAcademicRecord(record.id, 'roll_no', e.target.value)}
                                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono bg-white"
                                    />
                                  </div>

                                  {/* Passing Year / Academic Year */}
                                  <div className="sm:col-span-1 lg:col-span-6">
                                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                      {isSchool ? 'Academic Session *' : 'Passing Year *'}
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      placeholder={isSchool ? 'e.g. 2025-2026' : 'e.g. 2024'}
                                      value={record.passing_year}
                                      onChange={(e) => handleUpdateAcademicRecord(record.id, 'passing_year', e.target.value)}
                                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono bg-white"
                                    />
                                  </div>

                                  {/* Final Percentage (%) / CGPA */}
                                  <div className="sm:col-span-1 lg:col-span-6">
                                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                      {isSchool ? 'Previous Class Exam % *' : 'Percentage (%) / CGPA *'}
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
                            )
                          })}
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
                              3. Document Dossier & Identity Verification
                            </span>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Upload student identification (Aadhaar / ID), passport photograph, and signature. Previous marksheet and School ID are optional.
                            </p>
                          </div>
                          <span className="text-xs font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full shrink-0">
                            Candidate Verification & Dossier
                          </span>
                        </div>

                        {/* Dynamic Scheme Documents Grid */}
                        {(() => {
                          const schemeDocs = getApplicableDocumentList(selectedScheme, applicantForm.qualification)

                          return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                              {schemeDocs.map((docName, index) => {
                                const isUploaded = !!uploadedDocs[docName] || (
                                  ((docName.toLowerCase().includes('aadhaar') || docName.toLowerCase().includes('birth')) && !!applicantForm.aadhaar_url) ||
                                  (docName.toLowerCase().includes('marksheet') && !!applicantForm.marksheet_url) ||
                                  ((docName.toLowerCase().includes('college') || docName.toLowerCase().includes('school id') || docName.toLowerCase().includes('bonafide')) && !!applicantForm.college_id_url)
                                )

                                const docLower = docName.toLowerCase()
                                const isOptional =
                                  docLower.includes('marksheet') ||
                                  docLower.includes('report') ||
                                  docLower.includes('school id') ||
                                  docLower.includes('college') ||
                                  docLower.includes('bonafide') ||
                                  docLower.includes('id card')

                                return (
                                  <div
                                    key={index}
                                    className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3 shadow-xs flex flex-col justify-between hover:border-[#FF2D8D]/40 transition-all"
                                  >
                                    <div>
                                      <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-bold text-gray-900 uppercase flex items-center gap-1.5 truncate">
                                          {docLower.includes('marksheet') || docLower.includes('report') ? (
                                            <GraduationCap size={14} className="text-purple-600 shrink-0" />
                                          ) : docLower.includes('income') ? (
                                            <Landmark size={14} className="text-emerald-600 shrink-0" />
                                          ) : docLower.includes('caste') ? (
                                            <ShieldCheck size={14} className="text-amber-600 shrink-0" />
                                          ) : (
                                            <FileText size={14} className="text-blue-600 shrink-0" />
                                          )}
                                          <span className="truncate">{index + 1}. {docName}</span>
                                        </label>
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isOptional ? 'bg-gray-100 text-gray-600 border border-gray-200' : 'bg-pink-50 text-[#FF2D8D] border border-pink-200'}`}>
                                          {isOptional ? 'Optional' : 'Mandatory *'}
                                        </span>
                                        <span className="text-[10px] text-gray-400">PDF / JPG / PNG (Max 5MB)</span>
                                      </div>
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

                                      {isUploaded && (
                                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 block text-center">
                                          ✓ Uploaded & Attached
                                        </span>
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
                                  className="w-full py-2.5 px-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5 shadow-xs"
                                >
                                  <UploadCloud size={13} className="text-[#FF2D8D]" />
                                  {applicantForm.photo_url ? 'Change Photo' : 'Upload Passport Photo'}
                                </button>
                                <p className="text-[10px] text-gray-400">Clear frontal passport size photograph (JPG / PNG)</p>
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
                              <button
                                type="button"
                                onClick={() => signFileInputRef.current?.click()}
                                className="w-full py-2.5 px-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5 shadow-xs"
                              >
                                <UploadCloud size={13} className="text-[#9C27FF]" />
                                {applicantForm.signature_url ? 'Change Signature Scan' : 'Upload Signature Scan'}
                              </button>

                              {applicantForm.signature_url ? (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg block text-center border border-emerald-100">
                                  ✓ Signature Uploaded & Attached
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-400 block text-center">
                                  Upload clear handwritten signature image (JPG / PNG)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Examination City / District Preferences */}
                        <div className="p-4 bg-gradient-to-r from-purple-50/70 to-pink-50/70 rounded-2xl border border-purple-100 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-gray-900 uppercase flex items-center gap-1.5">
                              <MapPin size={15} className="text-[#9C27FF]" /> Examination Center Preferences (District-Wise) *
                            </label>
                            <span className="text-[10px] font-bold text-purple-700 bg-white px-2.5 py-0.5 rounded-full border border-purple-200 shadow-xs">
                              All India / State Allocation
                            </span>
                          </div>

                          <p className="text-[11px] text-gray-600 leading-relaxed">
                            📍 Select your nearest districts. Superadmin will allocate your exact physical examination center / school venue with complete address, room, and reporting time on your <strong>Official Admit Card</strong> based on candidate density.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                            {/* Preference 1 */}
                            <div>
                              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                1st District Preference (Nearest City / District) *
                              </label>
                              <select
                                required
                                value={applicantForm.preference_district_1 || getDistrictsForState(applicantForm.preference_state || applicantForm.state || 'Bihar')[0] || ''}
                                onChange={(e) => {
                                  const d1 = e.target.value
                                  setApplicantForm({
                                    ...applicantForm,
                                    preference_district_1: d1,
                                    exam_city_preference: `${d1} (Pref 1) / ${applicantForm.preference_district_2 || 'Backup'} (Pref 2)`,
                                  })
                                }}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 bg-white shadow-xs focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                              >
                                {getDistrictsForState(applicantForm.preference_state || applicantForm.state || 'Bihar').map((d) => (
                                  <option key={d} value={d}>📍 {d}</option>
                                ))}
                              </select>
                            </div>

                            {/* Preference 2 */}
                            <div>
                              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                2nd District Preference (Alternative District) *
                              </label>
                              <select
                                required
                                value={applicantForm.preference_district_2 || getDistrictsForState(applicantForm.preference_state || applicantForm.state || 'Bihar')[1] || ''}
                                onChange={(e) => {
                                  const d2 = e.target.value
                                  setApplicantForm({
                                    ...applicantForm,
                                    preference_district_2: d2,
                                    exam_city_preference: `${applicantForm.preference_district_1 || 'Primary'} (Pref 1) / ${d2} (Pref 2)`,
                                  })
                                }}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 bg-white shadow-xs focus:ring-2 focus:ring-[#9C27FF]/20 focus:border-[#9C27FF]"
                              >
                                {getDistrictsForState(applicantForm.preference_state || applicantForm.state || 'Bihar').map((d) => (
                                  <option key={d} value={d}>📍 {d}</option>
                                ))}
                              </select>
                            </div>
                          </div>
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
                          {payableFormFee === 0
                            ? (referralDiscountPercent === 100 ? 'Submit 100% Free Application (₹0)' : 'Submit Free Application (₹0)')
                            : referralDiscountPercent > 0
                            ? `Proceed to Discounted Payment (₹${payableFormFee})`
                            : `Proceed to Payment (₹${payableFormFee})`}
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* STEP 2: RAZORPAY PRODUCTION PAYMENT GATEWAY */}
              {applyStep === 'payment' && (
                <div className="space-y-6 max-w-2xl mx-auto py-2">
                  <div className="p-5 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 rounded-2xl border border-purple-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs shadow-sm">
                    <div>
                      <div className="font-bold text-purple-950 text-sm">Payment for {selectedScheme.title}</div>
                      <div className="text-purple-600 text-xs">Examination Processing & Hall Ticket Fee</div>
                      {referralDiscountPercent > 0 && (
                        <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                          ✓ Referral Code Applied: <span className="uppercase font-mono font-black">{refCodeVerifiedData?.code}</span> ({referralDiscountPercent}% OFF)
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {referralDiscountPercent > 0 && (
                        <div className="text-xs text-gray-400 line-through font-semibold">₹{baseFormFee}</div>
                      )}
                      <div className="text-2xl font-black text-[#FF2D8D]">₹{payableFormFee}</div>
                      {referralDiscountPercent > 0 && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Saved ₹{referralDiscountAmount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Razorpay Information Box */}
                  <div className="p-6 bg-gradient-to-br from-slate-900 to-gray-900 rounded-3xl text-white space-y-4 shadow-xl border border-gray-800">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={20} className="text-emerald-400" />
                        <span className="font-bold text-sm text-white">Razorpay 256-Bit SSL Secured Payment</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        Official Production Gateway
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">
                      You will be redirected to the official Razorpay Checkout popup supporting <strong>UPI (GPay, PhonePe, Paytm, BHIM)</strong>, <strong>Debit & Credit Cards</strong>, <strong>Netbanking</strong>, and <strong>Wallets</strong>.
                    </p>

                    <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-pink-300">UPI / QR</div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-purple-300">Cards</div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-emerald-300">Netbanking</div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-amber-300">Wallets</div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setApplyStep('form')}
                      className="px-5 py-3.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleRazorpayCheckout()}
                      className="flex-1 py-4 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white font-extrabold text-sm rounded-xl shadow-lg hover:shadow-pink-500/25 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
                    >
                      <CreditCard size={18} />
                      {submitting ? 'Connecting to Razorpay...' : `Pay & Submit Application (₹${payableFormFee})`}
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

                  {/* Payment & Application Official Receipt Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="font-heading font-black text-emerald-950 text-sm flex items-center gap-1.5">
                          <span>Payment & Application Receipt</span>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                            Ready
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700">
                          Official acknowledgment slip with transaction reference, student bio & fee breakdown.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowReceiptModal(true)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <Download size={14} />
                      <span>Download Receipt (PDF)</span>
                    </button>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1.5">
                    <div className="font-bold text-gray-800 uppercase text-[10px]">Official Hall Ticket Notice:</div>
                    <p className="text-gray-600 leading-relaxed">
                      Please note your <strong>Registration Code</strong>. Once Superadmin releases the batch hall tickets, visit the <strong>&quot;Download Official Admit Card&quot;</strong> tab to download your Hall Ticket with your Roll Number and Assigned Exam Center.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowReceiptModal(true)}
                      className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <FileText size={15} />
                      <span>View & Print Receipt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedScheme(null)
                        setActiveTab('admit_card')
                        setAdmitSearch({
                          application_no: generatedApplication.data.application_no,
                          registration_code: generatedApplication.data.registration_code,
                        })
                      }}
                      className="flex-1 py-3.5 bg-gradient-to-r from-[#9C27FF] to-[#FF2D8D] text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      <QrCode size={14} /> Go to Admit Card Desk
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedScheme(null)}
                      className="px-6 py-3.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 text-center transition-colors"
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
                      GRAVITY NATIONAL MERIT COUNCIL
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
                  ADVT NO: GRAVITY/SCH/2026/0{inspectingSchemeDoc.id?.replace('sch-', '') || '01'}
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
                  Gravity National Scholarship Portal
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
                  {inspectingSchemeDoc.description || 'Gravity Directorate announces the online applications for national level scholarship and cash award grant scheme. Meritorious and eligible candidates across recognized boards and universities can review the complete eligibility standards, exam dates, fee guidelines and submit their online admission form before the deadline.'}
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

                {/* Detailed Winner Perks Description */}
                {(inspectingSchemeDoc.winner_description || inspectingSchemeDoc.prize_distribution?.winner_description) && (
                  <div className="p-4 bg-amber-50/90 border-2 border-amber-300 rounded-2xl space-y-1.5 m-4 mt-0">
                    <div className="flex items-center gap-2 font-black text-amber-950 text-xs uppercase tracking-wide">
                      <span className="text-base">🏆</span>
                      <span>Official Winner Rewards, Grant Structure & Perks:</span>
                    </div>
                    <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-line font-medium">
                      {inspectingSchemeDoc.winner_description || inspectingSchemeDoc.prize_distribution?.winner_description}
                    </p>
                  </div>
                )}
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
                  REF NO: GRAVITY-SCH-BULLETIN-{inspectingSchemeDoc.id?.toUpperCase()}
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

      {/* OFFICIAL SCHOLARSHIP APPLICATION & PAYMENT ACKNOWLEDGMENT RECEIPT MODAL */}
      {mounted && showReceiptModal && generatedApplication && createPortal(
        <div 
          id="receipt-modal-wrapper"
          className="fixed inset-0 z-[999999] flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
          style={{
            backgroundColor: 'rgba(5, 8, 20, 0.88)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
          }}
        >
          {/* Embedded Single-Page Print Stylesheet */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              @page {
                size: A4 portrait;
                margin: 4mm 6mm !important;
              }
              html, body {
                height: 100% !important;
                max-height: 100% !important;
                overflow: hidden !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body > *:not(#receipt-modal-wrapper) {
                display: none !important;
              }
              body > #receipt-modal-wrapper {
                display: block !important;
                position: static !important;
                width: 100% !important;
                height: auto !important;
                max-height: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
                background: #ffffff !important;
                overflow: hidden !important;
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
              }
              #receipt-modal-wrapper > div {
                max-width: 100% !important;
                width: 100% !important;
                height: auto !important;
                max-height: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
                border: none !important;
                box-shadow: none !important;
                overflow: hidden !important;
                border-radius: 0 !important;
              }
              .no-print, .no-print * {
                display: none !important;
                height: 0 !important;
                max-height: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
                overflow: hidden !important;
              }
              #printable-receipt {
                display: block !important;
                position: relative !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 auto !important;
                padding: 10px 14px !important;
                border: 1.5px solid #000000 !important;
                border-radius: 6px !important;
                background: #ffffff !important;
                box-shadow: none !important;
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
                page-break-before: avoid !important;
                break-inside: avoid !important;
                break-after: avoid !important;
                overflow: hidden !important;
              }
            }
          `}} />

          <div className="bg-white sm:rounded-3xl rounded-none max-w-4xl w-full h-full sm:h-auto sm:max-h-[94vh] p-4 sm:p-6 shadow-2xl border border-gray-100 flex flex-col overflow-hidden relative">
            {/* Modal Navigation Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 shrink-0 no-print">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="font-heading font-black text-gray-900 text-sm sm:text-base">
                    Official Fee & Application Receipt (Single Page PDF)
                  </h3>
                  <span className="text-[10px] text-gray-400 font-mono">
                    APP NO: {generatedApplication.data.application_no}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-1.5"
                >
                  <Printer size={14} />
                  <span>Print 1-Page PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-all font-bold text-sm"
                  title="Close Receipt"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Receipt Canvas */}
            <div className="overflow-y-auto pr-1 sm:pr-2 pt-3 flex-1">
              <div id="printable-receipt" className="border-2 border-gray-900 p-4 sm:p-5 rounded-2xl bg-white space-y-3.5 text-gray-900 text-[11px] relative overflow-hidden">
                {/* Background Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] select-none transform -rotate-12 font-black text-3xl sm:text-5xl text-gray-900 uppercase text-center leading-tight">
                  AAGAJ FOUNDATION & INFOTECH
                </div>

                {/* Official Board Letterhead */}
                <div className="border-b-2 border-gray-900 pb-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <div className="font-mono text-[9px] font-extrabold text-gray-500 uppercase tracking-widest">
                        AAGAJ NATIONAL SCHOLARSHIP BOARD • GOVT RECOGNIZED INTAKE
                      </div>
                      <h2 className="text-sm sm:text-lg font-black text-gray-900 uppercase tracking-tight leading-tight">
                        AAGAJ FOUNDATION & INFOTECH
                      </h2>
                      <p className="text-[10px] sm:text-[11px] font-extrabold text-[#FF2D8D] uppercase tracking-wide">
                        {selectedScheme?.title || generatedApplication.data.scholarship_title}
                      </p>
                    </div>
                  </div>

                  <div className="text-center sm:text-right shrink-0">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
                      ✓ Official Acknowledgment Receipt
                    </span>
                    <div className="font-mono text-[9px] text-gray-500 mt-0.5">
                      Receipt Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {/* Receipt Metadata Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 rounded-xl bg-gray-50/90 border border-gray-200 text-[10px] relative z-10">
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase font-bold block">Application Number</span>
                    <strong className="font-mono font-black text-gray-900 text-xs">{generatedApplication.data.application_no}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase font-bold block">Security Registration Code</span>
                    <strong className="font-mono font-black text-purple-700 text-xs">{generatedApplication.data.registration_code}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase font-bold block">Payment Status</span>
                    <strong className="text-emerald-700 font-extrabold text-xs">
                      ● {generatedApplication.data.payment_amount === 0 ? 'FREE CONFIRMED' : 'PAID & CONFIRMED'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase font-bold block">Razorpay Txn Ref</span>
                    <strong className="font-mono font-bold text-emerald-800 text-[10px] truncate block">
                      {generatedApplication.data.payment_reference || `pay_${generatedApplication.data.application_no.slice(-6)}`}
                    </strong>
                  </div>
                </div>

                {/* Candidate & Scheme Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative z-10">
                  {/* Bio Data (3 cols) */}
                  <div className="sm:col-span-3 space-y-2.5">
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white/90">
                      <div className="bg-gray-100 px-2.5 py-1 font-bold text-[10px] text-gray-700 uppercase border-b border-gray-200">
                        1. Candidate & Academic Details
                      </div>
                      <div className="p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <span className="text-[9px] text-gray-500 block uppercase font-semibold">Candidate Full Name:</span>
                          <strong className="text-gray-900 uppercase text-[11px]">{generatedApplication.data.applicant_name}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-500 block uppercase font-semibold">Father / Guardian Name:</span>
                          <strong className="text-gray-800 uppercase text-[11px]">{generatedApplication.data.father_name || applicantForm.father_name || 'N/A'}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-500 block uppercase font-semibold">Date of Birth & Gender:</span>
                          <span className="font-medium text-gray-800">
                            {generatedApplication.data.dob || applicantForm.dob || '2008-05-15'} • {generatedApplication.data.gender || applicantForm.gender || 'General'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-500 block uppercase font-semibold">Social Category:</span>
                          <span className="font-medium text-gray-800">{generatedApplication.data.category || applicantForm.category || 'General'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-500 block uppercase font-semibold">Applied Standard / Class:</span>
                          <strong className="text-purple-700 font-bold">{generatedApplication.data.qualification || applicantForm.qualification || 'Class 10th'}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-500 block uppercase font-semibold">School / Institution Name:</span>
                          <span className="font-medium text-gray-800 truncate block">{generatedApplication.data.school_college_name || applicantForm.school_college_name || 'Designated School'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-500 block uppercase font-semibold">Registered Phone Number:</span>
                          <strong className="font-mono text-gray-900 text-[11px]">{generatedApplication.data.applicant_phone || applicantForm.applicant_phone || 'N/A'}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-500 block uppercase font-semibold">Registered Email Address:</span>
                          <strong className="font-mono text-gray-900 text-[11px] truncate block">{generatedApplication.data.applicant_email || applicantForm.applicant_email}</strong>
                        </div>
                        <div className="sm:col-span-2 pt-0.5 border-t border-gray-100">
                          <span className="text-[9px] text-gray-500 block uppercase font-semibold">State & District:</span>
                          <span className="font-medium text-gray-800">{applicantForm.district || 'Patna'}, {applicantForm.state || 'Bihar'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Examination District Center Preferences */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white/90">
                      <div className="bg-gray-100 px-2.5 py-1 font-bold text-[10px] text-gray-700 uppercase border-b border-gray-200">
                        2. Examination Scheme & District Preferences
                      </div>
                      <div className="p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                        <div className="sm:col-span-2">
                          <span className="text-[9px] text-gray-500 block uppercase font-semibold">Scholarship Scheme Name:</span>
                          <strong className="text-gray-900 text-xs">{selectedScheme?.title || generatedApplication.data.scholarship_title}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-500 block uppercase font-semibold">1st District Preference (Exam City):</span>
                          <strong className="text-emerald-800 font-bold">📍 {applicantForm.preference_district_1 || 'Patna'}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-500 block uppercase font-semibold">2nd District Preference (Alternative):</span>
                          <strong className="text-gray-700 font-bold">📍 {applicantForm.preference_district_2 || 'Gaya'}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Photo & Signature (1 col) */}
                  <div className="space-y-2 flex flex-col items-center justify-start text-center">
                    <div className="w-24 h-30 border-2 border-gray-800 rounded-xl overflow-hidden bg-gray-50 shadow-xs flex items-center justify-center p-0.5">
                      <img
                        src={generatedApplication.data.photo_url || applicantForm.photo_url || DEFAULT_SAMPLE_PHOTOS[0]}
                        alt={generatedApplication.data.applicant_name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <span className="text-[8px] font-bold text-gray-500 uppercase">Verified Candidate Photo</span>

                    <div className="w-24 h-10 border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center p-0.5">
                      {generatedApplication.data.signature_url || applicantForm.signature_url ? (
                        <img
                          src={generatedApplication.data.signature_url || applicantForm.signature_url}
                          alt="Signature"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="font-mono text-[9px] text-gray-500 italic">Digitally Signed</span>
                      )}
                    </div>
                    <span className="text-[8px] font-bold text-gray-500 uppercase">Candidate E-Signature</span>
                  </div>
                </div>

                {/* Fee & Payment Statement Table */}
                <div className="border border-gray-900 rounded-xl overflow-hidden relative z-10">
                  <table className="w-full text-[10px] text-left">
                    <thead className="bg-gray-900 text-white text-[9px] uppercase font-bold">
                      <tr>
                        <th className="px-2.5 py-1.5">Item Description</th>
                        <th className="px-2.5 py-1.5">Fee Category</th>
                        <th className="px-2.5 py-1.5">Payment Mode</th>
                        <th className="px-2.5 py-1.5 text-right">Amount Paid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white/90">
                      <tr>
                        <td className="px-2.5 py-1.5 font-bold text-gray-900">
                          {selectedScheme?.title || generatedApplication.data.scholarship_title}
                          <span className="block text-[9px] text-gray-500 font-normal">
                            Provisional Hall Ticket & District Assessment Desk Intake Fee
                          </span>
                        </td>
                        <td className="px-2.5 py-1.5 font-medium text-gray-700">
                          {generatedApplication.data.payment_amount === 0 ? 'Exempted / Free Tier' : 'Standard Intake'}
                        </td>
                        <td className="px-2.5 py-1.5 font-mono text-gray-700">
                          {generatedApplication.data.payment_amount === 0 ? 'Merit Exemption' : 'Razorpay Online (UPI / Card / Netbanking)'}
                        </td>
                        <td className="px-2.5 py-1.5 text-right font-mono font-black text-gray-900 text-xs">
                          {generatedApplication.data.payment_amount === 0 ? '₹0.00 (FREE)' : `₹${generatedApplication.data.payment_amount}.00`}
                        </td>
                      </tr>
                      <tr className="bg-gray-50 font-bold">
                        <td colSpan={3} className="px-2.5 py-1 text-right uppercase text-[9px] text-gray-600">
                          Total Amount Received:
                        </td>
                        <td className="px-2.5 py-1 text-right font-mono font-black text-emerald-700 text-xs">
                          {generatedApplication.data.payment_amount === 0 ? '₹0.00' : `₹${generatedApplication.data.payment_amount}.00`}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Important Instructions for Candidate */}
                <div className="p-2.5 bg-gray-50/90 rounded-xl border border-gray-200 text-[9px] text-gray-600 space-y-0.5 relative z-10">
                  <div className="font-bold text-gray-900 uppercase text-[9px]">Important Instructions:</div>
                  <ol className="list-decimal pl-3.5 space-y-0.5 leading-tight">
                    <li>This acknowledgment receipt certifies that your scholarship application has been officially recorded in the National Database.</li>
                    <li>Please preserve your <strong>Security Registration Code ({generatedApplication.data.registration_code})</strong> carefully to download your Official Exam Admit Card (Hall Ticket).</li>
                    <li>Superadmin will allocate exact physical exam centers based on candidate district preferences. Admit Cards will be available in the <strong>&quot;Download Admit Card&quot;</strong> tab once published.</li>
                  </ol>
                </div>

                {/* Official Sign & Seal Footer */}
                <div className="pt-2 border-t-2 border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] text-gray-500 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={20} className="text-emerald-600" />
                    <div>
                      <div className="font-bold text-gray-900 text-[10px]">National Scholarship Examination Authority</div>
                      <div>Digitally Certified & Secured System Generated Slip • No Physical Signature Required</div>
                    </div>
                  </div>

                  <div className="text-center sm:text-right">
                    <div className="font-mono font-bold text-gray-800 text-[9px]">AUTHORIZED CONTROLLER OF EXAMINATIONS</div>
                    <div className="text-gray-500 text-[8px] font-bold uppercase">AAGAJ FOUNDATION & INFOTECH</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="pt-3 mt-2 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0 no-print">
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 border border-gray-200 text-center"
              >
                Close Receipt
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Printer size={15} />
                  <span>Print 1-Page PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MSG91 OTP VERIFICATION POPUP MODAL */}
      {mounted && showOtpModal && createPortal(
        <div 
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 animate-in fade-in duration-200"
          style={{
            backgroundColor: 'rgba(5, 8, 20, 0.88)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
          }}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 relative">
            <button
              type="button"
              onClick={() => {
                setShowOtpModal(false)
                setOtpPendingData(null)
                setOtpPendingType(null)
              }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#9C27FF] flex items-center justify-center mx-auto shadow-sm">
                <ShieldCheck size={30} />
              </div>
              <h3 className="font-heading font-black text-gray-900 text-xl">
                Mobile OTP Verification Required
              </h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                An OTP will be sent via MSG91 SMS gateway to registered phone number <strong className="text-gray-900 font-mono">{otpMaskedPhone || otpTargetMobile}</strong> to verify identity.
              </p>
            </div>

            {otpSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{otpSuccessMsg}</span>
              </div>
            )}

            {otpError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            {!otpSent ? (
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleSendMsg91Otp}
                  disabled={otpSending}
                  className="w-full py-3.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles size={15} />
                  {otpSending ? 'Sending MSG91 OTP...' : 'Send OTP to Mobile'}
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Enter 4-Digit OTP Code *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter 4-digit OTP"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-center font-mono font-black text-lg tracking-widest focus:ring-2 focus:ring-[#9C27FF]/20 focus:border-[#9C27FF]"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleSendMsg91Otp}
                    disabled={otpSending}
                    className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all"
                  >
                    Resend OTP
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyMsg91Otp}
                    disabled={otpVerifying || !otpInput.trim()}
                    className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />
                    {otpVerifying ? 'Verifying OTP...' : 'Verify OTP & Access Data'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )
      }

      <div className="no-print">
        <Footer />
      </div>
    </div>
  )
}
