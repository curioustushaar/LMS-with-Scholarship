import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const userId = authResult.id

    // Validate small image types
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Invalid file type' }, { status: 400 })
    }

    // Create filename
    const timestamp = Date.now()
    const ext = file.name.split('.').pop() || 'png'
    const filename = `${userId}_${timestamp}.${ext}`
    const filepath = `avatars/${filename}`

    // Upload using service role
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(filepath, file, { cacheControl: '3600', upsert: true })

    if (uploadError) {
      console.error('❌ Avatar upload error:', uploadError.message)
      return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 })
    }

    // Try to get a public URL; if the bucket is private, create a signed URL using the admin client
    let publicUrl: string | null = null
    try {
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filepath)
      publicUrl = urlData?.publicUrl || null
    } catch (e) {
      publicUrl = null
    }

    if (!publicUrl) {
      try {
        // createSignedUrl returns { data: { signedUrl }, error }
        // Use a 7-day expiry (in seconds)
        const expiresIn = 60 * 60 * 24 * 7
        const { data: signedData, error: signedErr } = await supabaseAdmin.storage
          .from('avatars')
          .createSignedUrl(filepath, expiresIn)

        if (signedErr) {
          console.warn('Could not create signed URL:', signedErr.message)
        } else {
          publicUrl = signedData?.signedUrl || null
        }
      } catch (err) {
        console.error('Error creating signed URL:', err)
      }
    }

    // Update user record with profile_image_url (signed or public)
    const { data, error: dbError } = await supabaseAdmin
      .from('profiles')
      .update({ profile_image_url: publicUrl })
      .eq('id', userId)
      .select('id, profile_image_url')
      .maybeSingle()

    if (dbError) {
      console.error('❌ Error updating user with avatar:', dbError.message)
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: { url: publicUrl, user: data } }, { status: 201 })
  } catch (err: any) {
    console.error('💥 Unexpected error uploading avatar:', err)
    return NextResponse.json({ success: false, error: err.message || 'Internal error' }, { status: 500 })
  }
}
