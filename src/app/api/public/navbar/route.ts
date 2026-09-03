import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/public/navbar
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('navbar_items')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })

    if (error) throw error

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    console.error('Public navbar API error:', error)
    return NextResponse.json({
      success: true,
      data: [
        { id: 'nav-1', name: 'Home', href: '/', sort_order: 1, is_visible: true, is_external: false },
        { id: 'nav-2', name: 'About', href: '/about', sort_order: 2, is_visible: true, is_external: false },
        { id: 'nav-3', name: 'Courses', href: '/courses', sort_order: 3, is_visible: true, is_external: false },
        { id: 'nav-4', name: 'Admissions', href: '/admissions', sort_order: 4, is_visible: true, is_external: false },
        { id: 'nav-5', name: 'Internships', href: '/internships', sort_order: 5, is_visible: true, is_external: false },
        { id: 'nav-6', name: 'Scholarships', href: '/scholarships', sort_order: 6, is_visible: true, is_external: false },
        { id: 'nav-7', name: 'Employers', href: '/employers', sort_order: 7, is_visible: true, is_external: false },
        { id: 'nav-8', name: 'School Partners', href: '/school-partners', sort_order: 8, is_visible: true, is_external: false },
        { id: 'nav-9', name: 'Training', href: '/training', sort_order: 9, is_visible: true, is_external: false },
        { id: 'nav-10', name: 'Contact', href: '/contact', sort_order: 10, is_visible: true, is_external: false },
      ]
    })
  }
}
