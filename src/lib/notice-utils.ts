/**
 * Utility functions for Notices and YouTube video extraction / embedding.
 */

export interface NoticeVideoMeta {
  video_url?: string | null
  video_description?: string | null
}

/**
 * Extracts standard 11-character YouTube video ID from various YouTube URL formats:
 * - https://www.youtube.com/watch?v=XXXXXXXXXXX
 * - https://youtu.be/XXXXXXXXXXX
 * - https://www.youtube.com/embed/XXXXXXXXXXX
 * - https://www.youtube.com/shorts/XXXXXXXXXXX
 * - https://m.youtube.com/watch?v=XXXXXXXXXXX
 */
export function extractYouTubeId(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null
  const cleanUrl = url.trim()
  if (!cleanUrl) return null

  // youtu.be/<id>
  const shortMatch = cleanUrl.match(/(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/i)
  if (shortMatch && shortMatch[1]) return shortMatch[1]

  // youtube.com/watch?v=<id> or with other params before/after
  const watchMatch = cleanUrl.match(/(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch\?.*?(?:^|&)v=([a-zA-Z0-9_-]{11})/i)
  if (watchMatch && watchMatch[1]) return watchMatch[1]

  // youtube.com/embed/<id>
  const embedMatch = cleanUrl.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i)
  if (embedMatch && embedMatch[1]) return embedMatch[1]

  // youtube.com/shorts/<id>
  const shortsMatch = cleanUrl.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i)
  if (shortsMatch && shortsMatch[1]) return shortsMatch[1]

  // Raw 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl
  }

  return null
}

/**
 * Returns safe privacy-enhanced YouTube embed URL
 */
export function getYouTubeEmbedUrl(url?: string | null): string | null {
  const id = extractYouTubeId(url)
  if (!id) return null
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0`
}

/**
 * Returns high-quality YouTube thumbnail image URL
 */
export function getYouTubeThumbnailUrl(url?: string | null): string | null {
  const id = extractYouTubeId(url)
  if (!id) return null
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}

const VIDEO_META_REGEX = /<!--VIDEO_METADATA:([\s\S]*?)-->/

/**
 * Packs video metadata into a content string as a backward-compatible hidden HTML comment.
 */
export function packNoticeVideoMetadata(
  content: string = '',
  video_url?: string | null,
  video_description?: string | null
): string {
  // Strip any existing metadata comment first
  const cleanContent = stripNoticeVideoMetadata(content)
  const meta: NoticeVideoMeta = {
    video_url: video_url?.trim() || '',
    video_description: video_description?.trim() || '',
  }

  if (!meta.video_url && !meta.video_description) {
    return cleanContent
  }

  const marker = `<!--VIDEO_METADATA:${JSON.stringify(meta)}-->`
  return cleanContent ? `${cleanContent}\n\n${marker}` : marker
}

/**
 * Strips hidden VIDEO_METADATA marker comment from content
 */
export function stripNoticeVideoMetadata(content?: string | null): string {
  if (!content) return ''
  return content.replace(VIDEO_META_REGEX, '').trim()
}

/**
 * Parses video metadata from a notice object.
 * If video_url is already present as a column, preserves it.
 * If not, extracts it from content comment and cleans up content.
 */
export function parseNoticeVideoMetadata<T extends { content?: string | null; video_url?: string | null; video_description?: string | null }>(
  notice: T
): T {
  if (!notice) return notice
  let video_url = notice.video_url || ''
  let video_description = notice.video_description || ''
  let content = notice.content || ''

  if (content && typeof content === 'string') {
    const match = content.match(VIDEO_META_REGEX)
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1])
        if (!video_url && parsed.video_url) {
          video_url = parsed.video_url
        }
        if (!video_description && parsed.video_description) {
          video_description = parsed.video_description
        }
      } catch (e) {
        console.error('Failed to parse video metadata from notice content:', e)
      }
      content = stripNoticeVideoMetadata(content)
    }
  }

  return {
    ...notice,
    video_url: video_url || undefined,
    video_description: video_description || undefined,
    content,
  }
}
