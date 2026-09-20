// In-memory + Supabase sync data store for Scholarships and Examinations lifecycle

export interface ScholarshipScheme {
  id: string
  title: string
  category: 'Merit' | 'Need-Based' | 'Women-in-Tech' | 'Sports & Cultural' | 'Special Talent'
  description?: string
  eligibility_criteria?: string
  min_percentage?: number
  eligible_qualifications?: string[]
  max_family_income?: number // in INR Lakhs/year
  application_fee: number // 0 for free
  scholarship_value: string
  reward_type: 'fee_waiver' | 'cash_prize' | 'hybrid' | 'mentorship'
  reward_details: {
    waiver_percentage?: number
    cash_amount?: number
    perks?: string[]
  }
  exam_date?: string
  exam_time?: string
  exam_mode: 'online' | 'offline' | 'hybrid'
  exam_venue?: string
  admit_card_release_date?: string
  result_date?: string
  color_theme?: 'pink' | 'purple' | 'blue' | 'emerald' | 'amber'
  status: 'active' | 'closed' | 'upcoming' | 'results_declared'
  created_at: string
}

export interface ScholarshipApplicant {
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
  mother_name?: string
  gender?: string
  dob?: string
  address?: string
  state?: string
  city?: string
  pincode?: string
  school_college_name?: string
  passing_year?: string
  exam_city_preference?: string
  photo_url?: string
  signature_url?: string
  status: 'applied' | 'payment_pending' | 'confirmed' | 'rejected'
  payment_status: 'paid' | 'free' | 'pending' | 'failed'
  payment_reference?: string
  payment_amount: number
  created_at: string
  
  // Admit Card Fields
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
  
  // Verification & Awarding
  document_status?: 'verified' | 'pending' | 'action_needed' | 'rejected'
  award_status?: 'awarded' | 'disbursed' | 'pending' | 'none'
  award_type?: 'fee_waiver' | 'cash_prize' | 'both'
  award_amount?: string
  award_disbursement_ref?: string
}

// Initial default schemes (Only 1 primary showcase scheme retained for demo)
export const initialScholarships: ScholarshipScheme[] = [
  {
    id: 'sch-1',
    title: 'GRAVITY National STEM Excellence Scholarship',
    category: 'Merit',
    description: 'Premier national merit scholarship recognizing exceptional talent in Mathematics, Computer Science, and Engineering.',
    eligibility_criteria: 'Minimum 80% aggregate in 10+2 PCM / Pre-University or Diploma in CS/IT.',
    min_percentage: 80,
    eligible_qualifications: ['12th (PCM)', 'Undergraduate'],
    max_family_income: 12,
    application_fee: 150,
    scholarship_value: 'Up to 100% Tuition Fee Waiver + ₹25,000 Cash Grant',
    reward_type: 'hybrid',
    reward_details: {
      waiver_percentage: 100,
      cash_amount: 25000,
      perks: ['100% Fee Waiver', '₹25,000 Cash Prize', '1-on-1 AI Mentorship', 'Direct Internship Access']
    },
    exam_date: '2026-09-15',
    exam_time: '10:00 AM - 12:30 PM',
    exam_mode: 'online',
    exam_venue: 'National Proctored Online Portal / Regional Lab Centers',
    admit_card_release_date: '2026-09-05',
    result_date: '2026-09-25',
    color_theme: 'pink',
    status: 'active',
    created_at: new Date('2026-08-01').toISOString(),
  },
]

export const initialApplicants: ScholarshipApplicant[] = [
  {
    id: 'app-001',
    application_no: 'SCH-2026-8801',
    registration_code: 'REG-CODE-9921',
    scholarship_id: 'sch-1',
    scholarship_title: 'GRAVITY National STEM Excellence Scholarship',
    applicant_name: 'Aanya Sharma',
    applicant_email: 'aanya.sharma@example.com',
    applicant_phone: '+91 9876543210',
    qualification: '12th (PCM)',
    percentage: 92.5,
    annual_family_income: 4.5,
    category: 'General',
    father_name: 'Rajesh Sharma',
    mother_name: 'Sunita Sharma',
    gender: 'Female',
    dob: '2007-04-14',
    address: 'Sector 62, Noida, Uttar Pradesh',
    state: 'Uttar Pradesh',
    city: 'Noida',
    pincode: '201301',
    school_college_name: 'Delhi Public School, Noida',
    passing_year: '2026',
    exam_city_preference: 'Delhi NCR',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
    signature_url: 'https://api.iconify.design/fluent:signature-24-regular.svg',
    status: 'confirmed',
    payment_status: 'paid',
    payment_reference: 'PAY_SCH_99281726',
    payment_amount: 150,
    created_at: '2026-08-12T10:30:00.000Z',
    admit_card_status: 'released',
    roll_number: 'GRAVITY-26-0041',
    exam_center: 'Center 01 - Delhi Tech Hub, Cyber Park, Sector 44',
    exam_slot: '2026-09-15 | 10:00 AM - 12:30 PM (Reporting 09:15 AM)',
    admit_card_issued_at: '2026-08-15T09:00:00.000Z',
    exam_marks: 96,
    total_marks: 100,
    rank: 1,
    merit_status: 'qualified',
    document_status: 'verified',
    award_status: 'awarded',
    award_type: 'both',
    award_amount: '100% Tuition Waiver + ₹25,000 Cash Prize',
    award_disbursement_ref: 'DISB-2026-TXN-001',
  },
  {
    id: 'app-002',
    application_no: 'SCH-2026-8802',
    registration_code: 'REG-CODE-5542',
    scholarship_id: 'sch-1',
    scholarship_title: 'GRAVITY National STEM Excellence Scholarship',
    applicant_name: 'Kabir Verma',
    applicant_email: 'kabir.verma@example.com',
    applicant_phone: '+91 9811223344',
    qualification: '12th (PCM)',
    percentage: 84.0,
    annual_family_income: 6.0,
    category: 'OBC',
    father_name: 'Anil Verma',
    mother_name: 'Pooja Verma',
    gender: 'Male',
    dob: '2006-11-20',
    address: 'Koramangala, Bangalore, Karnataka',
    state: 'Karnataka',
    city: 'Bangalore',
    pincode: '560034',
    school_college_name: 'National Public School, Bangalore',
    passing_year: '2026',
    exam_city_preference: 'Bangalore',
    photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&crop=face',
    signature_url: 'https://api.iconify.design/fluent:signature-24-regular.svg',
    status: 'confirmed',
    payment_status: 'paid',
    payment_reference: 'PAY_SCH_11092837',
    payment_amount: 150,
    created_at: '2026-08-13T14:20:00.000Z',
    admit_card_status: 'provisional',
    roll_number: undefined,
    exam_center: undefined,
    exam_slot: undefined,
    admit_card_issued_at: undefined,
    exam_marks: undefined,
    total_marks: 100,
    rank: undefined,
    merit_status: 'waiting',
    document_status: 'pending',
    award_status: 'none',
  },
]

declare global {
  // eslint-disable-next-line no-var
  var __globalScholarships: ScholarshipScheme[] | undefined
  // eslint-disable-next-line no-var
  var __globalApplicants: ScholarshipApplicant[] | undefined
}

export function getScholarshipsStore(): ScholarshipScheme[] {
  if (!globalThis.__globalScholarships) {
    globalThis.__globalScholarships = [...initialScholarships]
  }
  return globalThis.__globalScholarships
}

export function setScholarshipsStore(data: ScholarshipScheme[]) {
  globalThis.__globalScholarships = data
}

export function getApplicantsStore(): ScholarshipApplicant[] {
  if (!globalThis.__globalApplicants) {
    globalThis.__globalApplicants = [...initialApplicants]
  }
  return globalThis.__globalApplicants
}

export function setApplicantsStore(data: ScholarshipApplicant[]) {
  globalThis.__globalApplicants = data
}
