'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiVideo, FiAward, FiLogOut, FiUser, FiFolder, FiBook, FiClipboard, FiMessageSquare } from 'react-icons/fi'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function StudentLayoutClient({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkStudent = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                
                if (!session) {
                    router.push('/login')
                    return
                }

                // Verify student role from database using supabaseAdmin (bypasses RLS)
                const { data: userData, error } = await supabaseAdmin
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .maybeSingle()

                if (error) {
                    console.error('Error fetching student profile:', error)
                    // Fallback to auth metadata
                    const authRole = session.user.app_metadata?.role || session.user.user_metadata?.role
                    if (authRole === 'student') {
                        setIsLoading(false)
                        return
                    }
                    router.push('/login')
                    return
                }

                if (!userData || userData.role !== 'student') {
                    console.warn('Unauthorized access to student portal')
                    router.push('/login')
                    return
                }

                setIsLoading(false)
            } catch (err) {
                console.error('Exception in checkStudent:', err)
                router.push('/login')
            }
        }

        checkStudent()
    }, [router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C81E4E]"></div>
            </div>
        )
    }

    const navItems = [
        { name: 'My Courses', path: '/student/courses', icon: FiBook },
        { name: 'My Tasks', path: '/student/tasks', icon: FiClipboard },
        { name: 'Course Videos', path: '/student/videos', icon: FiVideo },
        { name: 'My Projects', path: '/student/projects', icon: FiFolder },
        { name: 'My Certificates', path: '/student/certificates', icon: FiAward },
        { name: 'Support', path: '/student/support', icon: FiMessageSquare },
    ]

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Student Topbar */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
                    <div className="flex itemcourseter space-x-8">
                        <Link href="/student/videos" className="flex items-center space-x-2 shrink-0">
                            <img src="/logo.png" alt="Gravity Logo" className="h-10 w-auto object-contain" />
                            <span className="text-xl font-bold text-gray-900 hidden sm:block tracking-tight">LMS STUDENT</span>
                        </Link>

                        <nav className="hidden md:flex items-center space-x-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${pathname === item.path
                                            ? 'bg-[#C81E4E]/10 text-[#C81E4E]'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon className="text-lg" />
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="p-2 text-gray-400 hover:text-[#C81E4E] transition-colors">
                            <FiUser size={24} />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:border-red-100 hover:text-red-500 transition-all"
                        >
                            <FiLogOut />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                <nav className="md:hidden border-t border-gray-100 flex items-center justify-around py-3">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex flex-col items-center space-y-1 transition-all ${pathname === item.path ? 'text-[#C81E4E]' : 'text-gray-400'
                                }`}
                        >
                            <item.icon className="text-xl" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{item.name.split(' ')[1] || item.name}</span>
                        </Link>
                    ))}
                </nav>
            </header>

            <main className="flex-1">
                {children}
            </main>

            {/* Student Footer */}
            <footer className="bg-white border-t border-gray-100 py-10 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">© 2026 LMS Education Platform</p>
                    <p className="text-xs text-gray-300 mt-2">Empowering learners worldwide through quality content</p>
                </div>
            </footer>
        </div>
    )
}
