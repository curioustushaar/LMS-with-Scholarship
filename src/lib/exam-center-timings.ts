export function packCenterTimingToLandmark(
  userLandmark?: string,
  reportingTime?: string,
  startTime?: string,
  endTime?: string,
  shiftName?: string
): string {
  const base = (userLandmark || '').replace(/\[Timing:[^\]]+\]/gi, '').trim()
  const rep = reportingTime?.trim() || '09:00 AM'
  const start = startTime?.trim() || '10:00 AM'
  const end = endTime?.trim() || '12:00 PM'
  const shift = shiftName?.trim() || 'Shift 1 (Morning Session)'

  return `${base ? base + ' ' : ''}[Timing: Rep=${rep}|Start=${start}|End=${end}|Shift=${shift}]`.trim()
}

export function parseCenterTimingFromLandmark(rawLandmark?: string) {
  const str = rawLandmark || ''
  const repMatch = str.match(/Rep=([^|\]]+)/i)
  const startMatch = str.match(/Start=([^|\]]+)/i)
  const endMatch = str.match(/End=([^|\]]+)/i)
  const shiftMatch = str.match(/Shift=([^|\]]+)/i)

  const cleanLandmark = str.replace(/\[Timing:[^\]]+\]/gi, '').trim()

  return {
    clean_landmark: cleanLandmark || str,
    reporting_time: repMatch ? repMatch[1].trim() : '09:00 AM',
    exam_start_time: startMatch ? startMatch[1].trim() : '10:00 AM',
    exam_end_time: endMatch ? endMatch[1].trim() : '12:00 PM',
    exam_shift: shiftMatch ? shiftMatch[1].trim() : 'Shift 1 (Morning Session)',
  }
}
