'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getSchoolClientAuthToken } from '@/lib/auth-helpers'
import { validateName, validatePhone, validateEmail, validatePincode } from '@/lib/scholarship-validation'
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
    city: '',
    state: '',
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
    exam_city_preference: '',

    // Declaration
    declaration_agreed: true,
  })

  // File Upload Refs
  const photoInputRef = useRef<HTMLInputElement | null>(null)
  const signInputRef = useRef<HTMLInputElement | null>(null)

  const getToken = async () => await getSchoolClientAuthToken()

  // Initialize academic qualifications based on selected scheme
  const initializeQualificationsForScheme = (scheme: any) => {
    const quals = scheme?.eligible_qualifications && scheme.eligible_qualifications.length > 0
      ? scheme.eligible_qualifications
      : ['10th', '12th (PCM)']

    const initial: AcademicQualificationDetail[] = quals.map((q: string, idx: number) => ({
      id: `qual-${idx}-${Date.now()}`,
      qualification: q,
      institution: '',
      board_university: q.toLowerCase().includes('10th') ? 'CBSE' : q.toLowerCase().includes('12th') ? 'CBSE' : 'State / Central University',
      roll_no: '',
      passing_year: q.toLowerCase().includes('10th') ? '2022' : q.toLowerCase().includes('12th') ? '2024' : '2026',
      percentage: '85',
      is_custom: false,
    }))
    setAcademicRecords(initial)
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

            setFormData((prev) => ({
              ...prev,
              scholarship_id: initialScheme.scholarship_id,
              exam_city_preference:
                initialScheme.exam_centers?.[0] ||
                initialScheme.exam_venue ||
                'School Proctored Computer Lab / Assessment Hub',
              school_class: initialScheme.eligible_qualifications?.[0] || '10th',
              qualification: initialScheme.eligible_qualifications?.[0] || '10th',
            }))

            initializeQualificationsForScheme(initialScheme)
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
    setFormData((prev) => ({
      ...prev,
      scholarship_id: schemeId,
      exam_city_preference:
        sel?.exam_centers?.[0] ||
        sel?.exam_venue ||
        'School Proctored Computer Lab / Assessment Hub',
      school_class: sel?.eligible_qualifications?.[0] || prev.school_class,
      qualification: sel?.eligible_qualifications?.[0] || prev.qualification,
    }))
    if (sel) {
      initializeQualificationsForScheme(sel)
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

  // Handle Form Submission
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

    setSubmitting(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/school/students/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
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

      {/* School Emergency / Priority Access Notice */}
      <div className="p-4 bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 rounded-2xl border border-purple-200 shadow-xs flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <FiClock size={18} />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-extrabold text-purple-950 flex items-center gap-2">
            <span>School Partner Extended Registration Authority</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              Active Authorization
            </span>
          </div>
          <p className="text-gray-700 leading-relaxed">
            As a verified partner institution, your school has continuous access to enroll students directly from this dashboard even if public application dates have ended, until official Examination Hall Tickets are finalized by Superadmin.
          </p>
        </div>
      </div>

      {/* Success View */}
      {successData ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 border border-emerald-200 text-center space-y-2">
            <FiCheckCircle className="text-4xl text-emerald-600 mx-auto" />
            <h3 className="text-xl font-black text-emerald-950">
              Student Registration Confirmed & Auto-Approved!
            </h3>
            <p className="text-xs text-emerald-800 max-w-md mx-auto">
              The student has been enrolled successfully. Because this application was submitted directly by your school, their <strong>Institutional Verification is Approved</strong> and authorized for Admit Card issuance.
            </p>
          </div>

          {/* Credentials Card */}
          <div className="p-6 bg-purple-50/50 rounded-3xl border border-purple-100 space-y-4">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <span className="text-xs font-black text-purple-900 uppercase">Student Registration Record</span>
              <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                VERIFIED BY SCHOOL ✓
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400 font-bold">Student Full Name:</span>
                <p className="text-sm font-black text-gray-900 mt-0.5">{successData.data?.applicant_name || formData.applicant_name}</p>
              </div>
              <div>
                <span className="text-gray-400 font-bold">Application Number:</span>
                <p className="font-mono text-sm font-black text-purple-700 mt-0.5">{successData.data?.application_no}</p>
              </div>
              <div>
                <span className="text-gray-400 font-bold">Security Registration Code:</span>
                <p className="font-mono text-sm font-black text-pink-700 mt-0.5">{successData.data?.registration_code}</p>
              </div>
              <div>
                <span className="text-gray-400 font-bold">Scholarship Scheme:</span>
                <p className="font-bold text-gray-900 mt-0.5">{selectedSchemeDetails?.title}</p>
              </div>
              <div>
                <span className="text-gray-400 font-bold">School Class & Section:</span>
                <p className="font-bold text-gray-900 mt-0.5">{formData.school_class} (Sec {formData.school_section})</p>
              </div>
              <div>
                <span className="text-gray-400 font-bold">School Roll No:</span>
                <p className="font-mono font-bold text-gray-900 mt-0.5">{formData.school_roll_number}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
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
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
            >
              + Register Another Student
            </button>

            <Link
              href="/school-portal/students"
              className="px-6 py-2.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white font-black rounded-xl text-xs shadow-md hover:shadow-lg flex items-center gap-2"
            >
              View Registered Students Roster <FiArrowRight />
            </Link>
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
                        onChange={(e) => setFormData({ ...formData, school_class: e.target.value, qualification: e.target.value })}
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
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bhilai / Raipur"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chhattisgarh"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
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

              {/* Dynamic Academic Cards */}
              <div className="space-y-4">
                {academicRecords.map((rec, index) => (
                  <div
                    key={rec.id}
                    className="p-5 rounded-2xl border border-gray-200/80 bg-gray-50/60 space-y-3.5 hover:border-purple-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#FF2D8D] text-white flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <h4 className="font-extrabold text-sm text-gray-900">
                          {rec.qualification} Standard Details
                        </h4>
                        {!rec.is_custom && (
                          <span className="text-[10px] font-bold bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full">
                            Scheme Requirement
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
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs bg-white"
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

              {/* Exam Center Selection */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-gray-700 uppercase">
                  Exam Venue / Assessment Hub *
                </label>
                <select
                  value={formData.exam_city_preference}
                  onChange={(e) => setFormData({ ...formData, exam_city_preference: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold bg-white"
                >
                  {selectedSchemeDetails?.exam_centers && selectedSchemeDetails.exam_centers.length > 0 ? (
                    selectedSchemeDetails.exam_centers.map((c: string) => (
                      <option key={c} value={c}>{c}</option>
                    ))
                  ) : (
                    <option value="School Proctored Computer Lab / Assessment Hub">
                      School Proctored Computer Lab / Assessment Hub
                    </option>
                  )}
                </select>
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
                  <p><strong>Fee:</strong> ₹{selectedSchemeDetails?.registration_fee}</p>
                  <p><strong>School Incentive:</strong> +₹{selectedSchemeDetails?.incentive_per_verified_registration}</p>
                  <p><strong>Institutional Status:</strong> <span className="text-emerald-700 font-bold">Auto-Approved by School ✓</span></p>
                  <p><strong>Exam Center:</strong> {formData.exam_city_preference}</p>
                </div>
              </div>

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
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white font-black rounded-xl text-xs hover:shadow-xl transition-all shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Registering Student...' : 'Confirm & Complete Registration ✓'}
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  )
}
