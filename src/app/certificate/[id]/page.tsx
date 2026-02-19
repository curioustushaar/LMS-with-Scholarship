'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { FaDownload, FaShareAlt, FaCheckCircle, FaAward } from 'react-icons/fa'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// Create a public Supabase client (no auth required for viewing certificates)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CertificateViewPage() {
    const params = useParams()
    const id = params?.id as string
    const [certificate, setCertificate] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const certificateRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (id) fetchCertificate()
    }, [id])

    const fetchCertificate = async () => {
        try {
            console.log('Fetching certificate for:', id)

            // First, get the certificate
            const { data: certData, error: certError } = await supabase
                .from('certificates')
                .select('*')
                .eq('certificate_number', id)
                .maybeSingle()

            if (certError || !certData) {
                console.error('Certificate fetch error:', certError)
                setError('Certificate not found')
                setLoading(false)
                return
            }

            console.log('Certificate found:', certData)

            // Then get user data
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('full_name, email')
                .eq('id', certData.user_id)
                .single()

            if (userError) {
                console.error('User fetch error:', userError)
            } else {
                console.log('User found:', userData)
            }

            // Then get course data
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select('title, description')
                .eq('id', certData.course_id)
                .single()

            if (courseError) {
                console.error('Course fetch error:', courseError)
            } else {
                console.log('Course found:', courseData)
            }

            // Combine the data
            setCertificate({
                ...certData,
                user: userData,
                course: courseData
            })

            console.log('Certificate loaded successfully')

        } catch (err: any) {
            console.error('Error fetching certificate:', err)
            setError('Failed to load certificate. Please verify the link.')
        } finally {
            setLoading(false)
        }
    }

    const downloadPDF = async () => {
        if (!certificateRef.current) return

        try {
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            })

            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            })

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
            pdf.save(`${certificate.certificate_number || 'certificate'}.pdf`)
        } catch (err) {
            console.error('PDF generation failed:', err)
            alert('Failed to generate PDF.')
        }
    }

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading Certificate...</div>
    if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>
    if (!certificate) return null

    // Fallback data
    const studentName = certificate.user?.full_name || certificate.student_name || 'Student Name'
    const courseName = certificate.course?.title || certificate.course_title || 'Course Title'
    const issueDate = new Date(certificate.issued_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6 md:py-12 px-4">

            {/* Header / Actions */}
            <div className="w-full max-w-[800px] flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8 gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                    <FaAward className="text-2xl text-blue-600" />
                    <span className="font-bold text-lg md:text-xl">LMS Certificate Verification</span>
                </div>
                <button
                    onClick={downloadPDF}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow-lg w-full md:w-auto justify-center"
                >
                    <FaDownload /> Download PDF
                </button>
            </div>

            {/* Certificate Card - Responsive Container */}
            {/* We use width w-full but max-width constrained. Aspect ratio ensures shape. */}
            <div className="relative w-full max-w-[900px] bg-white text-gray-800 shadow-2xl overflow-hidden aspect-[1.414/1] print:shadow-none bg-white" ref={certificateRef}>

                {/* Border Frame */}
                <div className="absolute inset-0 border-[8px] md:border-[16px] border-blue-900 m-0 pointer-events-none z-10"></div>
                <div className="absolute inset-0 border-[1px] md:border-[2px] border-yellow-500 m-2 md:m-4 pointer-events-none z-10"></div>

                {/* Background Design */}
                <div className="absolute inset-0 opacity-[0.03] bg-repeat pattern-grid-lg"></div>

                {/* Corner Decorations */}
                <div className="absolute top-0 left-0 w-16 h-16 md:w-32 md:h-32 bg-blue-900 transform -translate-x-8 -translate-y-8 md:-translate-x-16 md:-translate-y-16 rotate-45"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 md:w-32 md:h-32 bg-blue-900 transform translate-x-8 translate-y-8 md:translate-x-16 md:translate-y-16 rotate-45"></div>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 md:p-16 z-20">

                    {/* Certificate Header */}
                    <div className="mb-4 md:mb-8">
                        <div className="mx-auto mb-2 md:mb-4 w-10 h-10 md:w-16 md:h-16 bg-blue-50 rounded-full flex items-center justify-center">
                            <FaAward className="text-xl md:text-4xl text-blue-800" />
                        </div>

                        <h1 className="text-2xl md:text-5xl font-serif font-bold text-gray-900 tracking-wide mb-1 md:mb-2 uppercase">Certificate</h1>
                        <span className="block w-12 md:w-24 h-0.5 md:h-1 bg-yellow-500 mx-auto my-2 md:my-4"></span>
                        <h2 className="text-sm md:text-2xl font-light text-gray-600 uppercase tracking-widest">Of Completion</h2>
                    </div>

                    {/* Main Content */}
                    <div className="my-2 md:my-8 w-full max-w-3xl flex-1 flex flex-col justify-center">
                        <p className="text-sm md:text-lg text-gray-500 mb-1 md:mb-2 italic">This is to certify that</p>

                        <h3 className="text-xl md:text-4xl font-bold text-blue-900 mb-4 md:mb-6 py-2 border-b border-gray-300 inline-block px-4 md:px-12 min-w-[200px] md:min-w-[300px]">
                            {studentName}
                        </h3>

                        <p className="text-sm md:text-lg text-gray-500 mb-1 md:mb-2 italic">Has satisfactorily completed the course</p>

                        <h4 className="text-lg md:text-3xl font-serif text-gray-800 mb-4 md:mb-8 px-4">
                            {courseName}
                        </h4>
                    </div>

                    {/* Footer / Signatures */}
                    <div className="flex justify-between items-end w-full max-w-3xl mt-auto px-2 md:px-8 pb-2 md:pb-0">
                        <div className="text-center">
                            <div className="h-6 md:h-10 flex items-end justify-center mb-1">
                                <span className="font-signature text-sm md:text-2xl text-blue-800">John Doe</span>
                            </div>
                            <div className="w-24 md:w-48 border-t border-gray-400"></div>
                            <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase mt-1">Instructor</p>
                        </div>

                        <div className="text-center px-2 md:px-4">
                            {/* Gold Seal */}
                            <div className="w-12 h-12 md:w-24 md:h-24 relative flex items-center justify-center">
                                <div className="absolute inset-0 border-2 md:border-4 border-yellow-500 border-dashed rounded-full animate-spin-slow opacity-50"></div>
                                <FaCheckCircle className="text-3xl md:text-6xl text-yellow-500 shadow-sm" />
                            </div>
                            <div className="mt-1 md:mt-2 text-[8px] md:text-[10px] text-gray-400 font-mono hidden md:block">
                                ID: {certificate.certificate_number}
                            </div>
                            <div className="text-[8px] md:text-[10px] text-gray-400 font-mono block md:hidden">
                                Verified
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="h-6 md:h-10 flex items-end justify-center mb-1">
                                <span className="font-signature text-sm md:text-2xl text-blue-800">LMS Admin</span>
                            </div>
                            <div className="w-24 md:w-48 border-t border-gray-400"></div>
                            <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase mt-1">Director</p>
                        </div>
                    </div>

                </div>
            </div>

            <p className="mt-4 md:mt-8 text-gray-500 text-xs md:text-sm text-center">
                Verify authenticity at: {typeof window !== 'undefined' ? window.location.origin : ''}/certificate/{certificate.certificate_number}
            </p>
        </div>
    )
}
