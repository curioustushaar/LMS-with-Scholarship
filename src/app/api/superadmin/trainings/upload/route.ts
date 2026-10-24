import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

// POST /api/superadmin/trainings/upload
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const originalName = file.name || 'thumbnail.jpg'
    const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg'
    const cleanFileName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const uniqueFileName = `${Date.now()}_${cleanFileName}`
    const mimeType = file.type || `image/${ext}`

    let fileUrl = ''

    // 1. Try uploading to Supabase Storage bucket 'trainings' or 'notices'
    try {
      const bucketName = 'notices' // reuse notices bucket if trainings bucket does not exist
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(`workshops/${uniqueFileName}`, buffer, {
          contentType: mimeType,
          upsert: true,
        })

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from(bucketName)
          .getPublicUrl(`workshops/${uniqueFileName}`)
        fileUrl = publicUrlData.publicUrl
      }
    } catch (storageErr) {
      console.warn('⚠️ Supabase storage upload attempt error for training thumbnail:', storageErr)
    }

    // 2. Local public directory fallback if storage bucket wasn't reachable
    if (!fileUrl) {
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'trainings')
        await mkdir(uploadDir, { recursive: true })
        const filePath = path.join(uploadDir, uniqueFileName)
        await writeFile(filePath, buffer)
        fileUrl = `/uploads/trainings/${uniqueFileName}`
      } catch (localErr) {
        console.error('Local file write error:', localErr)
        // Fallback to base64 data url
        fileUrl = `data:${mimeType};base64,${buffer.toString('base64')}`
      }
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: cleanFileName,
    })
  } catch (error: any) {
    console.error('Training thumbnail upload error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'File upload failed' },
      { status: 500 }
    )
  }
}
