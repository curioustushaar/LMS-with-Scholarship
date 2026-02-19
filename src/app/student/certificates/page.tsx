'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { FiDownload, FiAward, FiCheckCircle, FiExternalLink, FiShare2 } from 'react-icons/fi'
import Link from 'next/link'
import { api } from '@/lib/api'

interface Certificate {
    id: string
    certificate_number: string
    course_id: string
    issued_at: string
    domain: string
    certificate_url?: string
    courses?: {
        title: string
        description: string
        image_url?: string
    }
}

export default function StudentCertificatesPage() {
    const [certificates, setCertificates] = useState<Certificate[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadCertificates()
    }, [])

    const loadCertificates = async () => {
        try {
            setLoading(true)
            const result = await api.certificates.getStudentCertificates()
            if (result.success) {
                setCertificates(result.data || [])
            }
        } catch (error) {
            console.error('Failed to load certificates:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Retrieving your achievements...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-3xl p-12 text-white shadow-2xl">
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/20">
                        <FiAward className="text-yellow-400" />
                        <span className="text-sm font-bold uppercase tracking-widest">Achiever's Portal</span>
                    </div>
                    <h1 className="text-5xl font-black mb-4 leading-tight">Your Wall of Fame</h1>
                    <p className="text-lg text-gray-300 font-medium">
                        Congratulations! Every certificate here represents your hard work, dedication, and the skills you've mastered. Keep learning, keep growing.
                    </p>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#C81E4E]/40 to-transparent blur-3xl rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/20 to-transparent blur-2xl rounded-full -ml-32 -mb-32"></div>
            </div>

            {/* Certificates Grid */}
            {certificates.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-xl p-20 text-center border-2 border-dashed border-gray-100">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiAward className="text-5xl text-gray-200" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-4">No Certificates Yet</h2>
                    <p className="text-gray-500 text-lg max-w-md mx-auto mb-10">
                        Complete your courses and watch all videos to earn your prestigious certificates.
                    </p>
                    <Link
                        href="/student/videos"
                        className="inline-flex items-center space-x-3 px-10 py-5 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-2xl font-black uppercase tracking-widest hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
                    >
                        <span>Start Learning Now</span>
                        <FiExternalLink />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {certificates.map((cert) => (
                        <div
                            key={cert.id}
                            className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100"
                        >
                            {/* Certificate Preview Placeholder */}
                            <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-200 p-8 flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center space-x-4 z-20 backdrop-blur-sm">
                                    <a
                                        href={cert.certificate_url}
                                        target="_blank"
                                        className="p-4 bg-white text-[#C81E4E] rounded-2xl shadow-xl hover:scale-110 transition-transform"
                                        title="View PDF"
                                    >
                                        <FiExternalLink size={24} />
                                    </a>
                                    <button
                                        className="p-4 bg-white text-blue-600 rounded-2xl shadow-xl hover:scale-110 transition-transform"
                                        title="Share Achievement"
                                    >
                                        <FiShare2 size={24} />
                                    </button>
                                </div>

                                {/* Visual Certificate Card */}
                                <div className="w-full h-full border-4 border-double border-gray-300 rounded-xl p-4 flex flex-col justify-between relative bg-white shadow-inner">
                                    <div className="flex justify-between items-start">
                                        <div className="w-10 h-10 bg-[#C81E4E] rounded-lg"></div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Verified Achievement</div>
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">Certificate of Completion</p>
                                        <h4 className="text-sm font-black text-gray-800 line-clamp-1">{cert.courses?.title}</h4>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="text-[8px] font-bold text-gray-400 uppercase">{cert.certificate_number}</div>
                                        <FiAward className="text-yellow-500 text-xl" />
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8">
                                <div className="flex items-center space-x-2 text-[#C81E4E] mb-3">
                                    <FiCheckCircle className="flex-shrink-0" />
                                    <span className="text-xs font-black uppercase tracking-widest">{cert.domain}</span>
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-[#C81E4E] transition-colors">
                                    {cert.courses?.title}
                                </h3>
                                <p className="text-gray-500 text-sm line-clamp-2 mb-6 font-medium">
                                    {cert.courses?.description}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase">
                                        Issued on {new Date(cert.issued_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                    </div>
                                    <a
                                        href={cert.certificate_url}
                                        download
                                        className="flex items-center space-x-2 text-sm font-black text-[#C81E4E] hover:underline"
                                    >
                                        <span>Download PDF</span>
                                        <FiDownload />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer Motivation */}
            {certificates.length > 0 && (
                <div className="text-center py-10">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">More achievements await you</p>
                    <div className="mt-4 flex justify-center space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-2 h-2 bg-gray-200 rounded-full"></div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
