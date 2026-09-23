'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getSchoolClientAuthToken } from '@/lib/auth-helpers'
import { validateName, validatePhone, validateEmail, validatePincode } from '@/lib/scholarship-validation'
import { getIndianStates, getDistrictsForState } from '@/lib/india-locations'
import {
  FiUserPlus,
  FiAward,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
  FiPrinter,
  FiCheck,
  FiUploadCloud,
  FiUser,
  FiBookOpen,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiImage,
  FiShield,
  FiArrowRight,
  FiLayers,
  FiDownload,
  FiCheckSquare,
  FiClock,
  FiPlus,
  FiTrash2,
} from 'react-icons/fi'

const SAMPLE_STUDENT_PHOTOS = [
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
  is_custom?: boolean
}

export default function SchoolIndividualRegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultScheme = searchParams.get('scheme') || ''

  const [schemes, setSchemes] = useState<any[]>([])
  const [loadingSchemes, setLoadingSchemes] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successData, setSuccessData] = useState<any>(null)
  const [activeStep, setActiveStep] = useState<'personal' | 'academic' | 'documents' | 'review'>('personal')

  // Dynamic Academic Records
  const [academicRecords, setAcademicRecords] = useState<AcademicQualificationDetail[]>([])
  const [customQualName, setCustomQualName] = useState('')

  // Dynamic Uploaded Documents Map
  const [uploadedDocs, setUploadedDocs] = useState<{ [docName: string]: string }>({})

  // Form State
  const [formData, setFormData] = useState({
    // Scheme
    scholarship_id: defaultScheme,

    // Personal Details
    applicant_name: '',
    applicant_email: '',
    applicant_phone: '',
    dob: '2008-05-15',
    gender: 'Male',
    category: 'General',
    father_name: '',
    mother_name: '',
    address: '',
    state: 'Bihar',
    city: 'Patna',
    district: 'Patna',
    pincode: '',

    // Institutional Details
    school_roll_number: '',
    school_admission_no: '',
    school_class: '10th',
    qualification: '10th',
    school_section: 'A',
    passing_year: '2026',
    percentage: 85,
    annual_family_income: 3.5,

    // Mandatory uploads
    photo_url: SAMPLE_STUDENT_PHOTOS[0],
    signature_url: '',
    aadhaar_url: '',
    marksheet_url: '',
    college_id_url: '',
    
    // Exam Center Preferences (District-Wise)
    preference_state: 'Bihar',
    preference_district_1: 'Patna',
    preference_district_2: 'Gaya',
    exam_city_preference: 'Patna (Pref 1) / Gaya (Pref 2)',

    // Declaration
    declaration_agreed: true,
  })

  // File Upload Refs
  const photoInputRef = useRef<HTMLInputElement | null>(null)
  const signInputRef = useRef<HTMLInputElement | null>(null)

  const getToken = async () => await getSchoolClientAuthToken()

  // Initialize academic qualifications based on selected scheme (only 1 single record for selected class)
  const initializeQualificationsForScheme = (scheme: any, preferredClass?: string) => {
    const quals = scheme?.eligible_qualifications && scheme.eligible_qualifications.length > 0
      ? scheme.eligible_qualifications
      : ['10th', '12th (PCM)']

    const chosenClass = preferredClass || quals[0] || '10th'

    const initial: AcademicQualificationDetail[] = [{
      id: `qual-0-${Date.now()}`,
      qualification: chosenClass,
      institution: '',
      board_university: chosenClass.toLowerCase().includes('10th') ? 'CBSE' : chosenClass.toLowerCase().includes('12th') ? 'CBSE' : 'CBSE',
      roll_no: '',
      passing_year: new Date().getFullYear().toString(),
      percentage: '85',
      is_custom: false,
    }]
    setAcademicRecords(initial)
  }

  // Handle student selecting their specific standard/class
  const handleSelectClass = (chosenClass: string) => {
    setFormData((prev) => ({
      ...prev,
      school_class: chosenClass,
      qualification: chosenClass,
    }))
    setAcademicRecords((prev) => {
      if (!prev || prev.length === 0) {
        return [{
          id: `qual-0-${Date.now()}`,
          qualification: chosenClass,
          institution: '',
          board_university: chosenClass.toLowerCase().includes('10th') ? 'CBSE' : chosenClass.toLowerCase().includes('12th') ? 'CBSE' : 'CBSE',
          roll_no: '',
          passing_year: new Date().getFullYear().toString(),
          percentage: '85',
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

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const token = await getToken()
        const res = await fetch('/api/school/scholarships', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.success && data.data) {
          setSchemes(data.data)
          if (data.data.length > 0) {
            const initialScheme = defaultScheme
              ? data.data.find((s: any) => s.scholarship_id === defaultScheme) || data.data[0]
              : data.data[0]

            const initialClass = initialScheme.eligible_qualifications?.[0] || '10th'

            setFormData((prev) => {
              const st = prev.state || 'Bihar'
              const dists = getDistrictsForState(st)
              const d1 = prev.preference_district_1 || dists[0] || 'Patna'
              const d2 = prev.preference_district_2 || dists[1] || dists[0] || 'Gaya'
              return {
                ...prev,
                scholarship_id: initialScheme.scholarship_id,
                school_class: initialClass,
                qualification: initialClass,
                preference_state: prev.preference_state || st,
                preference_district_1: d1,
                preference_district_2: d2,
                exam_city_preference: `${d1} (Pref 1) / ${d2} (Pref 2)`,
              }
            })

            initializeQualificationsForScheme(initialScheme, initialClass)
          }
        }
      } catch (err) {
        console.error('Fetch assigned scholarships error:', err)
      } finally {
        setLoadingSchemes(false)
      }
    }

    fetchAssigned()
  }, [defaultScheme])

  const selectedSchemeDetails = schemes.find((s) => s.scholarship_id === formData.scholarship_id)

  // Handle Scheme Selection Switch
  const handleSchemeChange = (schemeId: string) => {
    const sel = schemes.find((s) => s.scholarship_id === schemeId)
    const initialClass = sel?.eligible_qualifications?.[0] || '10th'
    setFormData((prev) => {
      const st = prev.state || 'Bihar'
      const dists = getDistrictsForState(st)
      const d1 = prev.preference_district_1 || dists[0] || 'Patna'
      const d2 = prev.preference_district_2 || dists[1] || dists[0] || 'Gaya'
      return {
        ...prev,
        scholarship_id: schemeId,
        school_class: initialClass,
        qualification: initialClass,
        preference_state: prev.preference_state || st,
        preference_district_1: d1,
        preference_district_2: d2,
        exam_city_preference: `${d1} (Pref 1) / ${d2} (Pref 2)`,
      }
    })
    if (sel) {
      initializeQualificationsForScheme(sel, initialClass)
    }
  }

  // Handle Academic Record Field Change
  const updateAcademicRecord = (id: string, field: keyof AcademicQualificationDetail, value: string) => {
    setAcademicRecords((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, [field]: value } : rec))
    )
  }

  const addCustomQualification = () => {
    if (!customQualName.trim()) return
    const newRec: AcademicQualificationDetail = {
      id: `custom-${Date.now()}`,
      qualification: customQualName.trim(),
      institution: '',
      board_university: 'State University',
      roll_no: '',
      passing_year: new Date().getFullYear().toString(),
      percentage: '',
      is_custom: true,
    }
    setAcademicRecords((prev) => [...prev, newRec])
    setCustomQualName('')
  }

  const removeQualification = (id: string) => {
    setAcademicRecords((prev) => prev.filter((r) => r.id !== id))
  }

  // Handle Dynamic Document File Upload
  const handleDocFileUpload = (docLabel: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      if (dataUrl) {
        setUploadedDocs((prev) => ({ ...prev, [docLabel]: dataUrl }))
        const l = docLabel.toLowerCase()
        if (l.includes('aadhaar') || l.includes('id') || l.includes('pan')) {
          setFormData((prev) => ({ ...prev, aadhaar_url: dataUrl }))
        } else if (l.includes('marksheet')) {
          setFormData((prev) => ({ ...prev, marksheet_url: dataUrl }))
        } else if (l.includes('college') || l.includes('school id')) {
          setFormData((prev) => ({ ...prev, college_id_url: dataUrl }))
        }
      }
    }
    reader.readAsDataURL(file)
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

  // Execute Final Registration Submission
  const executeStudentRegistration = async (paymentRef?: string, razorpayDetails?: any) => {
    setSubmitting(true)
    setError('')
    try {
      const token = await getToken()
      const res = await fetch('/api/school/students/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          payment_reference: paymentRef || `SCH_PAY_${Date.now().toString().slice(-6)}`,
          payment_amount: selectedSchemeDetails?.registration_fee !== undefined ? Number(selectedSchemeDetails.registration_fee) : 100,
          payment_status: 'paid',
          razorpay_details: razorpayDetails || null,
          razorpay_payment_id: razorpayDetails?.razorpay_payment_id || paymentRef || '',
          razorpay_order_id: razorpayDetails?.razorpay_order_id || '',
          qualification: formData.school_class,
          academic_records: academicRecords,
          documents: {
            ...uploadedDocs,
            uploaded_documents: uploadedDocs,
            academic_records: academicRecords,
            school_admission_no: formData.school_admission_no,
            school_roll_no: formData.school_roll_number,
            school_class: formData.school_class,
            school_section: formData.school_section,
            payment_reference: paymentRef || '',
            razorpay_payment_id: razorpayDetails?.razorpay_payment_id || '',
            razorpay_order_id: razorpayDetails?.razorpay_order_id || '',
          },
        }),
      })

      const json = await res.json()
      if (json.success) {
        setSuccessData(json)
      } else {
        setError(json.error || 'Failed to register student.')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Form Submission (Validates and triggers Razorpay checkout if fee > 0)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.scholarship_id) {
      setError('Please select a scholarship scheme.')
      return
    }
    
    const nameVal = validateName(formData.applicant_name, 'Student Full Name')
    if (!nameVal.isValid) {
      setError(nameVal.message!)
      return
    }

    if (formData.applicant_phone) {
      const phoneVal = validatePhone(formData.applicant_phone)
      if (!phoneVal.isValid) {
        setError(phoneVal.message!)
        return
      }
    }

    if (formData.applicant_email) {
      const emailVal = validateEmail(formData.applicant_email)
      if (!emailVal.isValid) {
        setError(emailVal.message!)
        return
      }
    }

    if (formData.pincode) {
      const pinVal = validatePincode(formData.pincode)
      if (!pinVal.isValid) {
        setError(pinVal.message!)
        return
      }
    }

    if (!formData.school_roll_number.trim()) {
      setError('School roll number is required.')
      return
    }
    if (!formData.father_name.trim()) {
      setError("Father's / Guardian's name is required.")
      return
    }
    if (!formData.photo_url) {
      setError('Passport size photograph is required.')
      return
    }

    const regFee = selectedSchemeDetails?.registration_fee !== undefined ? Number(selectedSchemeDetails.registration_fee) : 100

    // If scheme has no registration fee, directly register
    if (regFee <= 0) {
      await executeStudentRegistration('FEE_EXEMPTED')
      return
    }

    // Trigger Razorpay Payment Checkout
    setSubmitting(true)
    try {
      // 1. Call API to create Razorpay Order (with ₹1 test fee)
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: regFee,
          scholarship_id: formData.scholarship_id,
          applicant_name: formData.applicant_name,
          applicant_email: formData.applicant_email || `${formData.applicant_name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}@schoolstudent.internal`,
          applicant_phone: formData.applicant_phone || '9876543210',
        }),
      })

      const data = await res.json()

      if (!data.success) {
        if (data.requires_config || data.error?.includes('missing in system environment variables')) {
          const proceedMock = confirm(
            '⚠️ Razorpay API Keys are not configured in system environment variables.\n\nWould you like to complete registration with Instant Test Confirmation for now?'
          )
          if (proceedMock) {
            await executeStudentRegistration(`PAY_TEST_${Date.now().toString().slice(-8)}`)
          } else {
            setSubmitting(false)
          }
          return
        }
        setError(data.error || 'Unable to initiate Razorpay payment.')
        setSubmitting(false)
        return
      }

      // 2. Load Razorpay script
      const isLoaded = await loadRazorpayScript()
      if (!isLoaded) {
        setError('Razorpay Payment Gateway failed to load. Please check your internet connection.')
        setSubmitting(false)
        return
      }

      // 3. Launch Razorpay Checkout Modal
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'GRAVITY SCHOLARSHIP BOARD',
        description: `Institutional Registration Fee - ${selectedSchemeDetails?.title || 'Scholarship Scheme'}`,
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
              await executeStudentRegistration(response.razorpay_payment_id, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
            } else {
              setError('Payment Verification Failed: ' + (verifyData.error || 'Invalid signature'))
              setSubmitting(false)
            }
          } catch (err: any) {
            console.error('Payment verification error:', err)
            setError('Error verifying payment with server.')
            setSubmitting(false)
          }
        },
        prefill: {
          name: formData.applicant_name,
          email: formData.applicant_email,
          contact: formData.applicant_phone,
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
        setError('Payment Failed: ' + (resp.error.description || 'Transaction cancelled or declined'))
        setSubmitting(false)
      })
      rzp.open()
    } catch (err: any) {
      console.error('Razorpay checkout error:', err)
      setError('Failed to connect to Razorpay payment gateway.')
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/school-portal/students" className="hover:text-[#FF2D8D] flex items-center gap-1">
              <FiArrowLeft /> Back to Registered Students
            </Link>
          </div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <FiUserPlus className="text-[#FF2D8D]" />
            Student Scholarship Enrollment Desk
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Register students directly under your institutional tie-up. Candidates registered by school are <strong>auto-approved</strong> for examination.
          </p>
        </div>

        <Link
          href="/school-portal/students/bulk"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-bold transition-all border border-purple-200 self-start sm:self-auto shadow-xs"
        >
          <FiUploadCloud /> Switch to Bulk CSV Upload
        </Link>
      </div>

      {/* Success View: 1-Page Official Printable Receipt Modal / Card */}
      {successData ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body, html {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                font-size: 11px !important;
                color: #000000 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body * {
                visibility: hidden !important;
              }
              #school-printable-receipt, #school-printable-receipt * {
                visibility: visible !important;
              }
              #school-printable-receipt {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 12px 16px !important;
                border: 1.5px solid #000000 !important;
                border-radius: 6px !important;
                background: #ffffff !important;
                box-shadow: none !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                overflow: hidden !important;
              }
              .no-print, .no-print * {
                display: none !important;
              }
            }
          `}} />

          {/* Success Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/70 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 no-print shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                <FiCheckCircle size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-emerald-950">
                  Student Registration Confirmed & Payment Verified!
                </h3>
                <p className="text-xs text-emerald-800">
                  Institutional Verification is <strong>Approved</strong>. Official 1-Page acknowledgment receipt generated below.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FiPrinter size={15} />
                <span>Print 1-Page PDF</span>
              </button>
            </div>
          </div>

          {/* Official Printable Receipt Canvas */}
          <div id="school-printable-receipt" className="border-2 border-gray-900 p-5 rounded-3xl bg-white space-y-4 text-gray-900 text-xs relative overflow-hidden shadow-lg">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] select-none transform -rotate-12 font-black text-4xl sm:text-6xl text-gray-900 uppercase text-center leading-tight">
              AAGAJ FOUNDATION & INFOTECH
            </div>

            {/* Official Board Letterhead */}
            <div className="border-b-2 border-gray-900 pb-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gray-900 to-purple-950 text-white flex items-center justify-center shrink-0 shadow-md">
                  <FiAward size={26} className="text-[#FF2D8D]" />
                </div>
                <div>
                  <div className="font-mono text-[9px] font-extrabold text-gray-500 uppercase tracking-widest">
                    GRAVITY NATIONAL SCHOLARSHIP BOARD • INSTITUTIONAL PARTNER RECORD
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-tight leading-tight">
                    AAGAJ FOUNDATION & INFOTECH
                  </h2>
                  <p className="text-xs font-extrabold text-[#FF2D8D] uppercase tracking-wide">
                    {selectedSchemeDetails?.title || 'National Scholarship Scheme'}
                  </p>
                </div>
              </div>

              <div className="text-center sm:text-right shrink-0">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
                  ✓ Verified Institutional Receipt
                </span>
                <div className="font-mono text-[10px] text-gray-500 mt-1">
                  Receipt Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Receipt Metadata Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-gray-50/90 border border-gray-200 text-xs relative z-10">
              <div>
                <span className="text-[9px] text-gray-500 uppercase font-bold block">Application Number</span>
                <strong className="font-mono font-black text-gray-900 text-xs">{successData.data?.application_no || successData.application_no}</strong>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 uppercase font-bold block">Security Registration Code</span>
                <strong className="font-mono font-black text-purple-700 text-xs">{successData.data?.registration_code || successData.registration_code}</strong>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 uppercase font-bold block">Payment Status</span>
                <strong className="text-emerald-700 font-extrabold text-xs">
                  ● PAID & CONFIRMED
                </strong>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 uppercase font-bold block">Razorpay Txn Ref</span>
                <strong className="font-mono font-bold text-emerald-800 text-[10px] truncate block">
                  {successData.data?.payment_reference || `pay_${(successData.data?.application_no || '').slice(-6)}`}
                </strong>
              </div>
            </div>

            {/* Candidate & Scheme Details */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 relative z-10">
              <div className="sm:col-span-3 space-y-3">
                {/* Personal / Bio */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white/90">
                  <div className="bg-gray-100 px-3 py-1.5 font-bold text-[10px] text-gray-700 uppercase border-b border-gray-200">
                    1. Candidate & Institutional Credentials
                  </div>
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase font-semibold">Candidate Full Name:</span>
                      <strong className="text-gray-900 uppercase text-xs">{successData.data?.applicant_name || formData.applicant_name}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase font-semibold">Father / Guardian Name:</span>
                      <strong className="text-gray-800 uppercase text-xs">{formData.father_name}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase font-semibold">Date of Birth & Gender:</span>
                      <span className="font-medium text-gray-800">{formData.dob} • {formData.gender}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase font-semibold">Enrolled Class & Section:</span>
                      <strong className="text-purple-700 font-bold">{formData.school_class} (Sec {formData.school_section})</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase font-semibold">School Roll Number:</span>
                      <strong className="font-mono text-gray-900">{formData.school_roll_number}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase font-semibold">Admission / S.R. Number:</span>
                      <strong className="font-mono text-gray-900">{formData.school_admission_no || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase font-semibold">Contact Phone:</span>
                      <strong className="font-mono text-gray-900">{formData.applicant_phone}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase font-semibold">State & City:</span>
                      <span className="font-medium text-gray-800">{formData.city}, {formData.state}</span>
                    </div>
                  </div>
                </div>

                {/* Exam Preferences */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white/90">
                  <div className="bg-gray-100 px-3 py-1.5 font-bold text-[10px] text-gray-700 uppercase border-b border-gray-200">
                    2. Examination District Preferences
                  </div>
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase font-semibold">1st District Preference (Nearest City):</span>
                      <strong className="text-emerald-800 font-bold">📍 {formData.preference_district_1 || formData.city || 'Patna'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase font-semibold">2nd District Preference (Alternative):</span>
                      <strong className="text-gray-700 font-bold">📍 {formData.preference_district_2 || 'Gaya'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo & Signature */}
              <div className="space-y-2 flex flex-col items-center justify-start text-center">
                <div className="w-24 h-28 border-2 border-gray-800 rounded-xl overflow-hidden bg-gray-50 shadow-xs flex items-center justify-center p-0.5">
                  <img
                    src={formData.photo_url || SAMPLE_STUDENT_PHOTOS[0]}
                    alt="Candidate"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <span className="text-[8px] font-bold text-gray-500 uppercase">Verified Student Photo</span>

                <div className="w-24 h-9 border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center p-0.5">
                  {formData.signature_url ? (
                    <img
                      src={formData.signature_url}
                      alt="Signature"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="font-mono text-[8px] text-gray-500 italic">Digitally Signed</span>
                  )}
                </div>
                <span className="text-[8px] font-bold text-gray-500 uppercase">Candidate E-Signature</span>
              </div>
            </div>

            {/* Fee Statement Table */}
            <div className="border border-gray-900 rounded-xl overflow-hidden relative z-10">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-900 text-white text-[10px] uppercase font-bold">
                  <tr>
                    <th className="px-3 py-1.5">Item Description</th>
                    <th className="px-3 py-1.5">Fee Category</th>
                    <th className="px-3 py-1.5">Payment Mode</th>
                    <th className="px-3 py-1.5 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white/90 text-xs">
                  <tr>
                    <td className="px-3 py-2 font-bold text-gray-900">
                      {selectedSchemeDetails?.title || 'Scholarship Scheme Intake'}
                      <span className="block text-[10px] text-gray-500 font-normal">
                        Provisional Hall Ticket & District Assessment Intake Fee
                      </span>
                    </td>
                    <td className="px-3 py-2 font-medium text-gray-700">
                      Institutional Partner Registration
                    </td>
                    <td className="px-3 py-2 font-mono text-gray-700">
                      Razorpay Online (UPI / Card / Netbanking)
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-black text-gray-900">
                      ₹{selectedSchemeDetails?.registration_fee ?? successData?.data?.payment_amount ?? 100}.00
                    </td>
                  </tr>
                  <tr className="bg-gray-50 font-bold">
                    <td colSpan={3} className="px-3 py-1.5 text-right uppercase text-[10px] text-gray-600">
                      Total Amount Received:
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono font-black text-emerald-700 text-sm">
                      ₹{selectedSchemeDetails?.registration_fee ?? successData?.data?.payment_amount ?? 100}.00
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Important Instructions */}
            <div className="p-3 bg-gray-50/90 rounded-2xl border border-gray-200 text-[10px] text-gray-600 space-y-1 relative z-10">
              <div className="font-bold text-gray-900 uppercase text-[10px]">Important Institutional Notice:</div>
              <ol className="list-decimal pl-4 space-y-0.5 leading-tight">
                <li>This official acknowledgment receipt confirms that the student has been enrolled and verified by the school partner.</li>
                <li>Please preserve the <strong>Security Registration Code ({successData.data?.registration_code || successData.registration_code})</strong> for Admit Card verification.</li>
                <li>Superadmin will allocate exact physical examination venues and generate final Hall Tickets prior to examination date.</li>
              </ol>
            </div>

            {/* Official Footer */}
            <div className="pt-2 border-t-2 border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-gray-500 relative z-10">
              <div className="flex items-center gap-1.5">
                <FiShield size={18} className="text-emerald-600" />
                <div>
                  <div className="font-bold text-gray-900 text-[10px]">National Scholarship Examination Authority</div>
                  <div>Digitally Certified & Secured System Generated Slip • Verified by Partner Institution</div>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="font-mono font-bold text-gray-800 text-[10px]">AUTHORIZED CONTROLLER OF EXAMINATIONS</div>
                <div className="text-gray-500 text-[9px] font-bold uppercase">AAGAJ FOUNDATION & INFOTECH</div>
              </div>
            </div>
          </div>

          {/* Action Buttons Below Receipt */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 no-print">
            <button
              type="button"
              onClick={() => {
                setSuccessData(null)
                setFormData((prev) => ({
                  ...prev,
                  applicant_name: '',
                  applicant_email: '',
                  applicant_phone: '',
                  school_roll_number: '',
                  school_admission_no: '',
                  father_name: '',
                  mother_name: '',
                  marksheet_url: '',
                  aadhaar_url: '',
                  college_id_url: '',
                }))
                setUploadedDocs({})
                setActiveStep('personal')
              }}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              + Register Another Student
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer"
              >
                <FiPrinter size={15} />
                <span>Print Official Receipt (PDF)</span>
              </button>

              <Link
                href="/school-portal/students"
                className="px-6 py-2.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white font-black rounded-xl text-xs shadow-md hover:shadow-lg flex items-center gap-2"
              >
                View Registered Students Roster <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-bold">
              <FiAlertCircle className="text-lg shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Scheme Selector Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF2D8D] bg-pink-50 px-2.5 py-1 rounded-full border border-pink-100">
                1. Select Assigned Scholarship Scheme
              </span>
              <span className="text-xs font-bold text-gray-400">
                {schemes.length} Active Schemes Available
              </span>
            </div>

            {loadingSchemes ? (
              <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            ) : schemes.length === 0 ? (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs font-bold">
                No active scholarships assigned to your school yet. Please contact Superadmin.
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={formData.scholarship_id}
                  onChange={(e) => handleSchemeChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#FF2D8D] transition-all bg-white"
                >
                  {schemes.map((s) => (
                    <option key={s.scholarship_id} value={s.scholarship_id}>
                      🏆 {s.title} — {s.scholarship_value} (Fee: ₹{s.registration_fee})
                    </option>
                  ))}
                </select>

                {selectedSchemeDetails && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50/80 to-pink-50/80 border border-purple-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="font-bold text-purple-950 flex items-center gap-2">
                        <span>{selectedSchemeDetails.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200 text-purple-800 font-semibold uppercase">
                          {selectedSchemeDetails.category}
                        </span>
                      </div>
                      <div className="text-gray-500 text-[11px] max-w-xl">
                        {selectedSchemeDetails.description}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Registration Fee</div>
                        <div className="font-mono font-black text-sm text-[#FF2D8D]">
                          ₹{selectedSchemeDetails.registration_fee}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-gray-400 font-bold uppercase">School Incentive</div>
                        <div className="font-mono font-bold text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          +₹{selectedSchemeDetails.incentive_per_verified_registration}/student
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Step Navigation */}
          <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-gray-100 shadow-sm text-xs font-bold">
            {[
              { id: 'personal', label: '1. Personal Details', icon: FiUser },
              { id: 'academic', label: '2. Academic Info', icon: FiBookOpen },
              { id: 'documents', label: '3. Required Docs & Center', icon: FiFileText },
              { id: 'review', label: '4. Review & Confirm', icon: FiCheckSquare },
            ].map((step) => {
              const Icon = step.icon
              const isActive = activeStep === step.id
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(step.id as any)}
                  className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white shadow-md font-black'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
              )
            })}
          </div>

          {/* STEP 1: PERSONAL DETAILS */}
          {activeStep === 'personal' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                <FiUser className="text-[#FF2D8D]" />
                Student Personal & Institutional Identification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.applicant_name}
                    onChange={(e) => setFormData({ ...formData, applicant_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF2D8D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF2D8D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Social Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold bg-white"
                  >
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    value={formData.applicant_phone}
                    onChange={(e) => setFormData({ ...formData, applicant_phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF2D8D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Father&apos;s / Guardian&apos;s Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={formData.father_name}
                    onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF2D8D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Mother&apos;s Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sunita Sharma"
                    value={formData.mother_name}
                    onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF2D8D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Student / Parent Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="rahul.sharma@example.com"
                    value={formData.applicant_email}
                    onChange={(e) => setFormData({ ...formData, applicant_email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF2D8D]"
                  />
                </div>

                {/* Institutional Credentials */}
                <div className="sm:col-span-3 pt-2">
                  <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-extrabold text-purple-900 uppercase mb-1">
                        School Roll No *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 24 / Roll-102"
                        value={formData.school_roll_number}
                        onChange={(e) => setFormData({ ...formData, school_roll_number: e.target.value })}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-purple-200 text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-purple-900 uppercase mb-1">
                        Admission / S.R. No *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ADM-2024-889"
                        value={formData.school_admission_no}
                        onChange={(e) => setFormData({ ...formData, school_admission_no: e.target.value })}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-purple-200 text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-purple-900 uppercase mb-1">
                        Class / Standard *
                      </label>
                      <select
                        value={formData.school_class}
                        onChange={(e) => handleSelectClass(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-purple-200 text-xs font-bold"
                      >
                        {selectedSchemeDetails?.eligible_qualifications && selectedSchemeDetails.eligible_qualifications.length > 0 ? (
                          selectedSchemeDetails.eligible_qualifications.map((q: string) => (
                            <option key={q} value={q}>{q}</option>
                          ))
                        ) : (
                          <>
                            <option value="8th">8th Standard</option>
                            <option value="9th">9th Standard</option>
                            <option value="10th">10th Standard</option>
                            <option value="11th (PCM)">11th (PCM)</option>
                            <option value="12th (PCM)">12th (PCM)</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-purple-900 uppercase mb-1">
                        Section *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. A / B / C"
                        value={formData.school_section}
                        onChange={(e) => setFormData({ ...formData, school_section: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-purple-200 text-xs font-bold uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Residential Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House / Street / Locality address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF2D8D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">State *</label>
                  <select
                    required
                    value={formData.state}
                    onChange={(e) => {
                      const newState = e.target.value
                      const dists = getDistrictsForState(newState)
                      const d1 = dists[0] || 'Patna'
                      const d2 = dists[1] || dists[0] || 'Gaya'
                      setFormData((prev) => ({
                        ...prev,
                        state: newState,
                        city: d1,
                        district: d1,
                        preference_state: newState,
                        preference_district_1: d1,
                        preference_district_2: d2,
                        exam_city_preference: `${d1} (Pref 1) / ${d2} (Pref 2)`,
                      }))
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold bg-white"
                  >
                    {getIndianStates().map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">District / City *</label>
                  <select
                    required
                    value={formData.city}
                    onChange={(e) => {
                      const newCity = e.target.value
                      const d2 = formData.preference_district_2 || 'Gaya'
                      setFormData((prev) => ({
                        ...prev,
                        city: newCity,
                        district: newCity,
                        preference_district_1: newCity,
                        exam_city_preference: `${newCity} (Pref 1) / ${d2} (Pref 2)`,
                      }))
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold bg-white"
                  >
                    {getDistrictsForState(formData.state || 'Bihar').map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Pincode *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 490006"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveStep('academic')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white font-bold rounded-xl text-xs hover:shadow-lg transition-all"
                >
                  Continue to Academic Info <FiArrowRight />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DYNAMIC ACADEMIC QUALIFICATIONS CONFIGURED BY SUPERADMIN */}
          {activeStep === 'academic' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                    <FiBookOpen className="text-[#FF2D8D]" />
                    Academic Records (Configured by Superadmin)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Fill academic marks and school details matching the scheme&apos;s eligibility standards.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Diploma / B.Tech"
                    value={customQualName}
                    onChange={(e) => setCustomQualName(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={addCustomQualification}
                    className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                  >
                    <FiPlus /> Add Degree
                  </button>
                </div>
              </div>

              {/* STUDENT CURRENT CLASS / STANDARD SELECTOR */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-50/90 via-purple-50/70 to-white rounded-2xl border border-pink-200 space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-black text-gray-900 uppercase flex items-center gap-1.5">
                    <FiLayers className="text-[#FF2D8D]" />
                    Select Student&apos;s Enrolled Class / Standard *
                  </label>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-100/70 px-2.5 py-0.5 rounded-full">
                    Choose 1 class configured for this scheme
                  </span>
                </div>

                {/* Quick Badges for Eligible Scheme Qualifications */}
                {selectedSchemeDetails?.eligible_qualifications && selectedSchemeDetails.eligible_qualifications.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedSchemeDetails.eligible_qualifications.map((q: string) => {
                      const isSelected = (formData.school_class || formData.qualification) === q
                      return (
                        <button
                          key={q}
                          type="button"
                          onClick={() => handleSelectClass(q)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white shadow-pink-500/25 shadow-md scale-105 border border-transparent'
                              : 'bg-white text-gray-700 border border-gray-200 hover:border-pink-300 hover:bg-pink-50/50'
                          }`}
                        >
                          <span>{isSelected ? '✓' : '•'}</span>
                          <span>{q}</span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">Class: {formData.school_class}</div>
                )}

                <div className="p-2.5 bg-white/95 rounded-xl border border-pink-100 text-[11px] text-gray-700 flex items-center gap-2">
                  <span className="text-pink-600 font-bold text-sm">💡</span>
                  <span>
                    Enrolling student for <strong>{formData.school_class || formData.qualification}</strong>. Enter the academic details for this standard below (only 1 academic record is required).
                  </span>
                </div>
              </div>

              {/* Dynamic Academic Cards */}
              <div className="space-y-4">
                {academicRecords.map((rec, index) => (
                  <div
                    key={rec.id}
                    className="p-5 rounded-2xl border border-gray-200/80 bg-gray-50/60 space-y-3.5 hover:border-purple-300 transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#FF2D8D] text-white flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <h4 className="font-extrabold text-sm text-gray-900">
                          {rec.qualification} Standard Details
                        </h4>
                        {!rec.is_custom ? (
                          <span className="text-[10px] font-bold bg-pink-100 text-pink-800 px-2.5 py-0.5 rounded-full">
                            Primary Enrolled Class
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                            Additional Qualification
                          </span>
                        )}
                      </div>

                      {rec.is_custom && (
                        <button
                          type="button"
                          onClick={() => removeQualification(rec.id)}
                          className="text-red-500 hover:text-red-700 p-1 text-xs flex items-center gap-1 font-bold"
                        >
                          <FiTrash2 /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                          School / College Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. DPS / St. Xavier's High School"
                          value={rec.institution}
                          onChange={(e) => updateAcademicRecord(rec.id, 'institution', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:ring-2 focus:ring-[#FF2D8D]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                          Board / University *
                        </label>
                        <select
                          value={rec.board_university}
                          onChange={(e) => updateAcademicRecord(rec.id, 'board_university', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-white font-semibold"
                        >
                          <option value="CBSE">CBSE</option>
                          <option value="ICSE">ICSE</option>
                          <option value="State Board">State Board</option>
                          <option value="IB/Cambridge">IB / Cambridge</option>
                          <option value="University">University</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                          Percentage / Score (%) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 85.0"
                          value={rec.percentage}
                          onChange={(e) => updateAcademicRecord(rec.id, 'percentage', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-pink-200 text-xs bg-pink-50/40 font-mono font-black text-[#FF2D8D]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Family Income & Prior Score Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Annual Family Income (₹ Lakhs) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.annual_family_income}
                    onChange={(e) => setFormData({ ...formData, annual_family_income: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Passing / Appearing Year
                  </label>
                  <input
                    type="text"
                    value={formData.passing_year}
                    onChange={(e) => setFormData({ ...formData, passing_year: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveStep('personal')}
                  className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  ← Back to Personal Info
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep('documents')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white font-bold rounded-xl text-xs hover:shadow-lg transition-all"
                >
                  Continue to Docs & Center <FiArrowRight />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DYNAMIC REQUIRED DOCUMENTS UPLOAD & EXAM VENUE */}
          {activeStep === 'documents' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <FiFileText className="text-[#FF2D8D]" />
                  Upload Required Scheme Documents
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Upload all documents required by Superadmin for this scholarship scheme.
                </p>
              </div>

              {/* 1. Mandatory Photo & Signature */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Photo */}
                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200 space-y-3">
                  <label className="block text-xs font-extrabold text-gray-800 uppercase flex items-center gap-1.5">
                    <FiImage className="text-pink-600" /> Passport Photograph *
                  </label>
                  <div className="flex items-center gap-3">
                    <img
                      src={formData.photo_url || SAMPLE_STUDENT_PHOTOS[0]}
                      alt="Student Preview"
                      className="w-16 h-16 rounded-xl object-cover border-2 border-pink-200 shadow-xs shrink-0"
                    />
                    <div className="space-y-1.5">
                      <input
                        type="file"
                        ref={photoInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) {
                            const r = new FileReader()
                            r.onload = () => setFormData((prev) => ({ ...prev, photo_url: r.result as string }))
                            r.readAsDataURL(f)
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="px-3.5 py-1.5 bg-white border border-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-gray-50"
                      >
                        <FiUploadCloud /> Upload Custom Photo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Signature */}
                <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-gray-800 uppercase flex items-center gap-1.5">
                      <FiFileText className="text-purple-600" /> Candidate Signature *
                    </label>
                    {formData.signature_url && (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Uploaded ✓</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={signInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) {
                          const r = new FileReader()
                          r.onload = () => setFormData((prev) => ({ ...prev, signature_url: r.result as string }))
                          r.readAsDataURL(f)
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => signInputRef.current?.click()}
                      className="w-full py-2 bg-white border border-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-gray-50"
                    >
                      <FiUploadCloud /> {formData.signature_url ? 'Replace Signature' : 'Upload Signature'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Dynamic Required Documents from Scheme */}
              <div className="space-y-3">
                <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider block">
                  Mandatory Scheme Dossiers (Configured by Superadmin):
                </span>

                {selectedSchemeDetails?.required_documents && selectedSchemeDetails.required_documents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedSchemeDetails.required_documents.map((docLabel: string) => {
                      const isUploaded = !!uploadedDocs[docLabel]
                      return (
                        <div
                          key={docLabel}
                          className="p-4 border border-gray-200 rounded-2xl space-y-2 bg-gray-50/50 hover:border-purple-200 transition-all"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                              📄 {docLabel} *
                            </span>
                            {isUploaded ? (
                              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                                Uploaded ✓
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded">
                                Required
                              </span>
                            )}
                          </div>

                          <label className="w-full py-2 bg-white border border-gray-200 text-gray-800 rounded-xl text-xs font-bold hover:bg-gray-50 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer">
                            <FiUploadCloud /> {isUploaded ? 'Replace File' : 'Upload File'}
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0]
                                if (f) handleDocFileUpload(docLabel, f)
                              }}
                            />
                          </label>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-500 text-center">
                    No additional custom documents specified for this scheme. Standard Photograph & Signature are sufficient.
                  </div>
                )}
              </div>

              {/* EXAMINATION CENTER PREFERENCES (DISTRICT-WISE) */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-50/70 via-pink-50/40 to-white rounded-2xl border border-purple-200/80 space-y-3.5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-black text-gray-900 uppercase flex items-center gap-1.5">
                    <FiMapPin className="text-[#9C27FF]" /> EXAMINATION CENTER PREFERENCES (DISTRICT-WISE) *
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
                      value={formData.preference_district_1 || getDistrictsForState(formData.preference_state || formData.state || 'Bihar')[0] || ''}
                      onChange={(e) => {
                        const d1 = e.target.value
                        setFormData((prev) => ({
                          ...prev,
                          preference_district_1: d1,
                          exam_city_preference: `${d1} (Pref 1) / ${prev.preference_district_2 || 'Backup'} (Pref 2)`,
                        }))
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 bg-white shadow-xs focus:ring-2 focus:ring-[#FF2D8D]/20 focus:border-[#FF2D8D]"
                    >
                      {getDistrictsForState(formData.preference_state || formData.state || 'Bihar').map((d) => (
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
                      value={formData.preference_district_2 || getDistrictsForState(formData.preference_state || formData.state || 'Bihar')[1] || ''}
                      onChange={(e) => {
                        const d2 = e.target.value
                        setFormData((prev) => ({
                          ...prev,
                          preference_district_2: d2,
                          exam_city_preference: `${prev.preference_district_1 || 'Primary'} (Pref 1) / ${d2} (Pref 2)`,
                        }))
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 bg-white shadow-xs focus:ring-2 focus:ring-[#9C27FF]/20 focus:border-[#9C27FF]"
                    >
                      {getDistrictsForState(formData.preference_state || formData.state || 'Bihar').map((d) => (
                        <option key={d} value={d}>📍 {d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveStep('academic')}
                  className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  ← Back to Academic Info
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep('review')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white font-bold rounded-xl text-xs hover:shadow-lg transition-all"
                >
                  Continue to Review & Confirm <FiArrowRight />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {activeStep === 'review' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                <FiCheckSquare className="text-[#FF2D8D]" />
                Review Student Dossier & Confirm Institutional Registration
              </h3>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                  <span className="font-extrabold text-gray-800 uppercase block text-[10px]">Student Details</span>
                  <p><strong>Name:</strong> {formData.applicant_name}</p>
                  <p><strong>Father:</strong> {formData.father_name}</p>
                  <p><strong>Phone:</strong> {formData.applicant_phone}</p>
                  <p><strong>Class & Sec:</strong> {formData.school_class} (Sec {formData.school_section})</p>
                  <p><strong>School Roll No:</strong> {formData.school_roll_number}</p>
                  <p><strong>Admission No:</strong> {formData.school_admission_no || 'N/A'}</p>
                </div>

                <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2">
                  <span className="font-extrabold text-purple-900 uppercase block text-[10px]">Scheme & Authorization</span>
                  <p><strong>Scholarship:</strong> {selectedSchemeDetails?.title}</p>
                  <p><strong>Registration Fee:</strong> <span className="font-bold text-gray-900">₹{selectedSchemeDetails?.registration_fee ?? 100}</span></p>
                  <p><strong>School Incentive:</strong> +₹{selectedSchemeDetails?.incentive_per_verified_registration || 50}</p>
                  <p><strong>Institutional Status:</strong> <span className="text-emerald-700 font-bold">Auto-Approved by School ✓</span></p>
                  <p><strong>Exam Center Pref:</strong> 📍 1st: {formData.preference_district_1 || formData.city || 'Patna'} | 2nd: {formData.preference_district_2 || 'Gaya'}</p>
                </div>
              </div>

              {/* Razorpay Gateway Information Banner */}
              {Number(selectedSchemeDetails?.registration_fee) > 0 && (
                <div className="p-4 bg-gradient-to-r from-gray-900 via-purple-950 to-pink-950 rounded-2xl text-white space-y-2 border border-purple-800 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiShield className="text-emerald-400" />
                      <span className="font-bold text-xs uppercase tracking-wider text-purple-200">
                        Razorpay 256-Bit SSL Secured Payment
                      </span>
                    </div>
                    <span className="font-mono font-black text-sm text-pink-400">
                      ₹{selectedSchemeDetails?.registration_fee}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    Clicking the button below will open the official <strong>Razorpay Checkout</strong> popup supporting <strong>UPI (GPay, PhonePe, Paytm, BHIM)</strong>, <strong>Debit & Credit Cards</strong>, and <strong>Netbanking</strong>.
                  </p>
                </div>
              )}

              {/* Declaration Checkbox */}
              <div className="p-4 bg-pink-50/40 rounded-2xl border border-pink-100 space-y-2">
                <label className="flex items-start gap-2.5 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.declaration_agreed}
                    onChange={(e) => setFormData({ ...formData, declaration_agreed: e.target.checked })}
                    className="w-4 h-4 text-[#FF2D8D] rounded border-gray-300 focus:ring-[#FF2D8D] mt-0.5 shrink-0"
                  />
                  <span>
                    I confirm that the institutional credentials (Roll No, Admission No, and Academic details) for <strong>{formData.applicant_name || 'this student'}</strong> have been verified with our school records and authorized for scholarship examination.
                  </span>
                </label>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveStep('documents')}
                  className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  ← Back to Documents
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.declaration_agreed}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white font-black rounded-xl text-xs hover:shadow-xl transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submitting
                    ? 'Processing Payment...'
                    : Number(selectedSchemeDetails?.registration_fee) > 0
                    ? `Pay ₹${selectedSchemeDetails?.registration_fee} & Complete Registration 💳`
                    : 'Confirm & Complete Registration ✓'}
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  )
}
