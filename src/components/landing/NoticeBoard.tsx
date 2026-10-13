'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  FileText, 
  Download, 
  Eye, 
  Pin, 
  Search, 
  Calendar, 
  ArrowRight, 
  X, 
  Sparkles, 
  ExternalLink,
  ImageIcon,
  AlertCircle,
  CheckCircle2,
  Share2,
  Play,
  Video
} from 'lucide-react'
import { FiYoutube as Youtube } from 'react-icons/fi'
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '@/lib/notice-utils'

export interface NoticeItem {
  id: string
  title: string
  category: string
  badge_text: string
  description: string
  content?: string
  video_url?: string
  video_description?: string
  file_url?: string
  file_type?: string
  file_name?: string
  file_size?: string
  is_pinned: boolean
  is_active: boolean
  published_at: string
  created_at: string
}

const CATEGORIES = ['All', 'Scholarship', 'Admissions', 'Examination', 'Event', 'General']

export default function NoticeBoard() {
  const [notices, setNotices] = useState<NoticeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null)
  const [previewMediaUrl, setPreviewMediaUrl] = useState<{ url: string; type: string; title: string; filename?: string } | null>(null)
  const [activeVideoNotice, setActiveVideoNotice] = useState<NoticeItem | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/public/notices')
      const data = await res.json()
      if (data.success && data.data) {
        setNotices(data.data)
      }
    } catch (err) {
      console.error('Error loading public notices:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredNotices = notices.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category?.toLowerCase() === activeCategory.toLowerCase()
    const matchesSearch = 
      !searchQuery.trim() ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.video_description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getCategoryColor = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'scholarship':
        return 'bg-pink-50 text-[#FF2D8D] border-pink-200'
      case 'examination':
        return 'bg-purple-50 text-[#9C27FF] border-purple-200'
      case 'admissions':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200'
      case 'event':
        return 'bg-amber-50 text-amber-600 border-amber-200'
      case 'urgent':
        return 'bg-red-50 text-red-600 border-red-200'
      default:
        return 'bg-blue-50 text-blue-600 border-blue-200'
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recent Update'
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const handleShare = (notice: NoticeItem) => {
    if (navigator.clipboard) {
      const url = `${window.location.origin}/#notices`
      navigator.clipboard.writeText(`${notice.title} - Read more at GRAVITY: ${url}`)
      setCopiedId(notice.id)
      setTimeout(() => setCopiedId(null), 2500)
    }
  }

  return (
    <section id="notices" className="relative py-20 lg:py-28 bg-gradient-to-b from-white via-pink-50/20 to-purple-50/20 overflow-hidden border-t border-gray-100">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#FF2D8D]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-[#9C27FF]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-50 border border-pink-200/60 shadow-sm mb-3">
              <Bell size={13} className="text-[#FF2D8D] animate-bounce" />
              <span className="text-xs font-bold text-[#FF2D8D] uppercase tracking-wider">Official Announcements</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
              Notice Board & <span className="bg-gradient-to-r from-[#FF2D8D] via-[#9C27FF] to-[#00F0FF] bg-clip-text text-transparent">Circulars</span>
            </h2>
            <p className="text-sm text-gray-500 max-w-xl mt-2 font-medium">
              Stay up-to-date with official exam notifications, scholarship circulars, admission updates, and event posters released by GRAVITY.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-gray-100 shadow-sm self-start md:self-auto">
            <div className="px-4 py-2 text-center border-r border-gray-100">
              <span className="text-xs text-gray-400 font-semibold block">Total Circulars</span>
              <span className="text-lg font-black text-gray-900">{notices.length}</span>
            </div>
            <div className="px-4 py-2 text-center">
              <span className="text-xs text-emerald-500 font-semibold block">Active Updates</span>
              <span className="text-lg font-black text-emerald-600">{notices.filter(n => n.is_active).length}</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white/80 backdrop-blur-lg p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-sm mb-10 flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white shadow-md shadow-[#FF2D8D]/20'
                    : 'bg-gray-100/70 hover:bg-gray-200/70 text-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notices & circulars..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:border-[#FF2D8D] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Notices Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-pulse space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-5 w-20 bg-gray-200 rounded-full" />
                  <div className="h-4 w-24 bg-gray-100 rounded-md" />
                </div>
                <div className="h-6 w-3/4 bg-gray-200 rounded-lg" />
                <div className="h-16 w-full bg-gray-100 rounded-xl" />
                <div className="h-10 w-full bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="text-center py-16 bg-white/70 backdrop-blur-md rounded-3xl border border-gray-100 shadow-sm p-8 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-pink-50 text-[#FF2D8D] flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={26} />
            </div>
            <h3 className="text-base font-bold text-gray-800">No Notices Found</h3>
            <p className="text-xs text-gray-500 mt-1">
              No official announcements match your current filter. Check back shortly for new updates.
            </p>
            {(activeCategory !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setActiveCategory('All')
                  setSearchQuery('')
                }}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotices.map((notice, idx) => {
              const isImagePoster = notice.file_type?.startsWith('image/') || (notice.file_url && /\.(jpg|jpeg|png|webp)/i.test(notice.file_url))
              const isPdf = notice.file_type === 'pdf' || (notice.file_url && /\.pdf/i.test(notice.file_url)) || notice.file_name?.toLowerCase().endsWith('.pdf')
              const hasVideo = !!notice.video_url && !!extractYouTubeId(notice.video_url)

              return (
                <motion.div
                  key={notice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={`group relative bg-white/95 backdrop-blur-xl rounded-3xl p-6 border transition-all duration-300 hover:shadow-xl flex flex-col justify-between ${
                    notice.is_pinned
                      ? 'border-[#FF2D8D]/30 shadow-md shadow-[#FF2D8D]/5 bg-gradient-to-br from-white via-white to-pink-50/20'
                      : 'border-gray-100 hover:border-pink-200/80'
                  }`}
                >
                  {/* Top Bar with Badges & Pin */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {notice.is_pinned && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm">
                            <Pin size={10} className="fill-current rotate-45" />
                            PINNED
                          </span>
                        )}

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryColor(notice.category)}`}>
                          {notice.category || 'General'}
                        </span>

                        {notice.badge_text && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-pink-100 text-[#FF2D8D] tracking-wide">
                            {notice.badge_text}
                          </span>
                        )}

                        {notice.video_url && extractYouTubeId(notice.video_url) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-red-50 text-red-600 border border-red-200">
                            <Youtube size={10} className="fill-current text-red-600" />
                            VIDEO
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1 shrink-0">
                        <Calendar size={12} className="text-gray-400" />
                        {formatDate(notice.published_at)}
                      </span>
                    </div>

                    {/* Notice Title */}
                    <h3 
                      onClick={() => setSelectedNotice(notice)}
                      className="text-base font-bold text-gray-900 group-hover:text-[#FF2D8D] transition-colors leading-snug cursor-pointer line-clamp-2"
                    >
                      {notice.title}
                    </h3>

                    {/* Description Excerpt */}
                    <p className="text-xs text-gray-500 line-clamp-3 mt-2 font-normal leading-relaxed">
                      {notice.description}
                    </p>

                    {/* YouTube Video Action Strip (Option 1) */}
                    {hasVideo && (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveVideoNotice(notice);
                        }}
                        className="mt-3.5 p-3 rounded-2xl bg-gradient-to-r from-red-50/80 via-rose-50/50 to-pink-50/40 border border-red-100 hover:border-red-200 transition-all cursor-pointer flex items-center justify-between gap-3 group/vidbox shadow-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-red-600/30 group-hover/vidbox:scale-105 transition-transform">
                            <Play size={12} className="ml-0.5 fill-current" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate" title={notice.video_description || 'Official Video Briefing'}>
                              {notice.video_description || 'Official Video Briefing'}
                            </p>
                            <span className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
                              <Youtube size={11} className="fill-current text-red-600" />
                              YouTube Video • Click to Watch
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveVideoNotice(notice);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold shadow-sm shadow-red-600/20 flex items-center gap-1 shrink-0 transition-all group-hover/vidbox:scale-105"
                        >
                          <Play size={10} className="fill-current" />
                          <span>Watch</span>
                        </button>
                      </div>
                    )}

                    {/* Image Poster Preview (if attached) */}
                    {isImagePoster && notice.file_url && (
                      <div 
                        onClick={() => setPreviewMediaUrl({
                          url: notice.file_url!,
                          type: 'image',
                          title: notice.title,
                          filename: notice.file_name,
                        })}
                        className="mt-4 relative rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 aspect-video cursor-pointer group/poster shadow-inner"
                      >
                        <img
                          src={notice.file_url}
                          alt={notice.title}
                          className="w-full h-full object-cover group-hover/poster:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs">
                          <Eye size={16} />
                          <span>View Full Poster</span>
                        </div>
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 backdrop-blur-sm text-white rounded-md text-[9px] font-bold flex items-center gap-1">
                          <ImageIcon size={10} />
                          Poster
                        </span>
                      </div>
                    )}

                    {/* PDF Circular Card Preview (if attached) */}
                    {isPdf && (
                      <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-purple-50/70 to-pink-50/50 border border-purple-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-[#9C27FF]/10 text-[#9C27FF] flex items-center justify-center shrink-0 font-bold text-xs">
                            <FileText size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">
                              {notice.file_name || 'Official_Circular.pdf'}
                            </p>
                            <span className="text-[10px] text-gray-400 font-medium">
                              PDF Document {notice.file_size ? `• ${notice.file_size}` : ''}
                            </span>
                          </div>
                        </div>

                        {notice.file_url && (
                          <a
                            href={notice.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={notice.file_name || 'Notice.pdf'}
                            className="p-2 rounded-lg bg-white text-gray-700 hover:text-[#9C27FF] hover:shadow-sm border border-gray-100 transition-all shrink-0"
                            title="Download PDF"
                          >
                            <Download size={14} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedNotice(notice)}
                      className="text-xs font-bold text-[#FF2D8D] hover:text-[#9C27FF] flex items-center gap-1 transition-colors"
                    >
                      <span>Read Full Notice</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleShare(notice)}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all text-xs flex items-center gap-1"
                        title="Copy notice share link"
                      >
                        {copiedId === notice.id ? (
                          <CheckCircle2 size={14} className="text-emerald-500" />
                        ) : (
                          <Share2 size={14} />
                        )}
                      </button>

                      {hasVideo && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveVideoNotice(notice);
                          }}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-red-600/25 flex items-center gap-1.5 shrink-0"
                          title="Watch official YouTube video"
                        >
                          <Play size={11} className="fill-current" />
                          <span>Watch</span>
                        </button>
                      )}

                      {notice.file_url && (
                        <a
                          href={notice.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={notice.file_name || 'Notice'}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-pink-50 text-gray-700 hover:text-[#FF2D8D] rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                        >
                          <Download size={12} />
                          <span>Download</span>
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Full Notice Reading Modal */}
      <AnimatePresence>
        {selectedNotice && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNotice(null)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 hover:bg-pink-50 hover:text-[#FF2D8D] text-gray-500 transition-all shadow-sm"
                >
                  <X size={18} />
                </button>

                {/* Badges & Date */}
                <div className="flex items-center gap-2 mb-3 flex-wrap pr-10">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoryColor(selectedNotice.category)}`}>
                    {selectedNotice.category}
                  </span>
                  {selectedNotice.badge_text && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-pink-100 text-[#FF2D8D]">
                      {selectedNotice.badge_text}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 font-semibold ml-auto">
                    Published: {formatDate(selectedNotice.published_at)}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
                  {selectedNotice.title}
                </h2>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-700 leading-relaxed">
                    {selectedNotice.description}
                  </p>

                  {selectedNotice.content && selectedNotice.content !== selectedNotice.description && (
                    <div className="mt-4 p-4 rounded-2xl bg-gray-50 text-xs text-gray-600 leading-relaxed whitespace-pre-line border border-gray-100">
                      {selectedNotice.content}
                    </div>
                  )}
                </div>

                {/* Official YouTube Video Walkthrough / Briefing */}
                {selectedNotice.video_url && extractYouTubeId(selectedNotice.video_url) && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-sm">
                          <Youtube size={14} className="fill-current" />
                        </div>
                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                          Official Video Briefing & Walkthrough
                        </h4>
                      </div>
                      <a
                        href={selectedNotice.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
                      >
                        <span>Open on YouTube</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>

                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-gray-200 bg-black shadow-lg">
                      <iframe
                        src={getYouTubeEmbedUrl(selectedNotice.video_url) || ''}
                        title={selectedNotice.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>

                    {selectedNotice.video_description && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-red-50/70 via-rose-50/50 to-pink-50/40 border border-red-100 text-xs text-gray-700 leading-relaxed flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                          <Play size={11} className="ml-0.5 fill-current" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-red-700 text-[11px] uppercase tracking-wider">Video Overview / Summary</p>
                          <p className="mt-0.5 text-gray-800">{selectedNotice.video_description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Poster or PDF Viewer in Modal */}
                {selectedNotice.file_url && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Official Attachment / Poster</h4>
                    
                    {selectedNotice.file_type?.startsWith('image/') || /\.(jpg|jpeg|png|webp)/i.test(selectedNotice.file_url) ? (
                      <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 max-h-96">
                        <img
                          src={selectedNotice.file_url}
                          alt={selectedNotice.title}
                          className="w-full h-full object-contain cursor-pointer"
                          onClick={() => setPreviewMediaUrl({
                            url: selectedNotice.file_url!,
                            type: 'image',
                            title: selectedNotice.title,
                            filename: selectedNotice.file_name,
                          })}
                        />
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText size={24} className="text-[#9C27FF]" />
                          <div>
                            <p className="text-sm font-bold text-gray-800">{selectedNotice.file_name || 'Official_Circular.pdf'}</p>
                            <span className="text-xs text-gray-500">PDF Document {selectedNotice.file_size ? `(${selectedNotice.file_size})` : ''}</span>
                          </div>
                        </div>
                        <a
                          href={selectedNotice.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={selectedNotice.file_name || 'Notice.pdf'}
                          className="px-4 py-2 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
                        >
                          <Download size={14} />
                          Download PDF
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Modal Actions */}
                <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
                  <button
                    onClick={() => setSelectedNotice(null)}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
                  >
                    Close
                  </button>

                  <div className="flex items-center gap-2">
                    {selectedNotice.video_url && extractYouTubeId(selectedNotice.video_url) && (
                      <a
                        href={selectedNotice.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-600/20 flex items-center gap-1.5 transition-all"
                      >
                        <Youtube size={14} className="fill-current" />
                        <span>Watch on YouTube</span>
                      </a>
                    )}

                    {selectedNotice.file_url && (
                      <a
                        href={selectedNotice.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={selectedNotice.file_name || 'Notice'}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#FF2D8D] via-[#9C27FF] to-[#7B1FA2] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
                      >
                        <Download size={14} />
                        Download Attachment
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Lightbox / Media Viewer Modal */}
      <AnimatePresence>
        {previewMediaUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewMediaUrl(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 flex flex-col items-center justify-center"
          >
            <div className="w-full max-w-4xl flex items-center justify-between text-white mb-3">
              <h3 className="text-sm font-bold truncate max-w-md">{previewMediaUrl.title}</h3>
              <div className="flex items-center gap-3">
                <a
                  href={previewMediaUrl.url}
                  download={previewMediaUrl.filename || 'Poster'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 bg-white text-gray-900 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-pink-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download size={14} />
                  Download
                </a>
                <button
                  onClick={() => setPreviewMediaUrl(null)}
                  className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="max-w-4xl max-h-[80vh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <img
                src={previewMediaUrl.url}
                alt={previewMediaUrl.title}
                className="max-h-[80vh] w-auto object-contain mx-auto"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Player Lightbox Modal (Option 1) */}
      <AnimatePresence>
        {activeVideoNotice && extractYouTubeId(activeVideoNotice.video_url) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideoNotice(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-3xl w-full p-5 sm:p-7 relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-gray-100">
                <div className="min-w-0 pr-6">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-50 text-red-600 border border-red-200 uppercase tracking-wider flex items-center gap-1">
                      <Youtube size={11} className="fill-current text-red-600" />
                      Official Video Briefing
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryColor(activeVideoNotice.category)}`}>
                      {activeVideoNotice.category}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 leading-snug line-clamp-2">
                    {activeVideoNotice.title}
                  </h3>
                </div>

                <button
                  onClick={() => setActiveVideoNotice(null)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-500 transition-all shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Responsive Video Player */}
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg border border-gray-200">
                <iframe
                  src={`${getYouTubeEmbedUrl(activeVideoNotice.video_url)}?autoplay=1`}
                  title={activeVideoNotice.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Description & Footer Actions */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {activeVideoNotice.video_description ? (
                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                      <strong className="text-red-700 font-bold mr-1">Overview:</strong>
                      {activeVideoNotice.video_description}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 italic">
                      Official circular video walkthrough released by GRAVITY.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={activeVideoNotice.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 flex items-center gap-1.5"
                  >
                    <Youtube size={13} className="fill-current" />
                    <span>Open on YouTube</span>
                  </a>
                  <button
                    onClick={() => {
                      const noticeToOpen = activeVideoNotice
                      setActiveVideoNotice(null)
                      setSelectedNotice(noticeToOpen)
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <span>Full Circular</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
