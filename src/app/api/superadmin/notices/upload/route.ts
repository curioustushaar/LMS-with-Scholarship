import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

// POST /api/superadmin/notices/upload
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const originalName = file.name || 'document'
    const ext = originalName.split('.').pop()?.toLowerCase() || 'pdf'
    const cleanFileName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const uniqueFileName = `${Date.now()}_${cleanFileName}`
    const mimeType = file.type || (ext === 'pdf' ? 'application/pdf' : 'image/jpeg')

    const formattedSize = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`

    let fileUrl = ''

    // 1. Try uploading to Supabase Storage bucket 'notices'
    try {
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('notices')
        .upload(uniqueFileName, buffer, {
          contentType: mimeType,
          upsert: true,
        })

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from('notices')
          .getPublicUrl(uniqueFileName)
        fileUrl = publicUrlData.publicUrl
      }
    } catch (storageErr) {
      console.warn('⚠️ Supabase storage upload attempt error:', storageErr)
    }

    // 2. Local public directory fallback if storage bucket wasn't reachable
    if (!fileUrl) {
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'notices')
        await mkdir(uploadDir, { recursive: true })
        const filePath = path.join(uploadDir, uniqueFileName)
        await writeFile(filePath, buffer)
        fileUrl = `/uploads/notices/${uniqueFileName}`
      } catch (localErr) {
        console.warn('⚠️ Local file save fallback warning:', localErr)
        // 3. Base64 data URL fallback for smaller images
        if (buffer.length < 5 * 1024 * 1024) {
          fileUrl = `data:${mimeType};base64,${buffer.toString('base64')}`
        }
      }
    }

    return NextResponse.json({
      success: true,
      file_url: fileUrl,
      file_name: originalName,
      file_type: mimeType.startsWith('image/') ? mimeType : 'pdf',
      file_size: formattedSize,
    })
  } catch (error: any) {
    console.error('Error in notice file upload:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'File upload failed' },
      { status: 500 }
    )
  }
}
