'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSchoolClientAuthToken } from '@/lib/auth-helpers'
import {
  FiUploadCloud,
  FiDownload,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowLeft,
  FiTrash2,
  FiLayers,
  FiCheck,
} from 'react-icons/fi'

export default function SchoolBulkUploadPage() {
  const [schemes, setSchemes] = useState<any[]>([])
  const [selectedScheme, setSelectedScheme] = useState('')
  const [loadingSchemes, setLoadingSchemes] = useState(true)

  const [parsedRows, setParsedRows] = useState<any[]>([])
  const [validationErrors, setValidationErrors] = useState<{ row: number; error: string }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [batchResult, setBatchResult] = useState<any>(null)

  const [pastedCSV, setPastedCSV] = useState('')
  const [uploadMode, setUploadMode] = useState<'file' | 'paste'>('file')

  const getToken = async () => await getSchoolClientAuthToken()

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const token = await getToken()
        const res = await fetch('/api/school/scholarships', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.success && data.data) {
          setSchemes(data.data)
          if (data.data.length > 0) {
            setSelectedScheme(data.data[0].scholarship_id)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingSchemes(false)
      }
    }
    fetchSchemes()
  }, [])

  // Download Sample CSV Template
  const downloadTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Student Name,Class,Section,School Roll No,Date of Birth,Gender,Percentage,Parent Name,Phone,Email',
        'Rahul Sharma,10th,A,101,2008-05-14,Male,88,Rajesh Sharma,+91 9876543210,rahul.sharma@example.com',
        'Pooja Patel,12th (PCM),B,204,2007-08-20,Female,92,Mukesh Patel,+91 9876543211,pooja.patel@example.com',
        'Amit Verma,10th,A,105,2008-11-10,Male,79,Suresh Verma,+91 9876543212,amit.verma@example.com',
      ].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'School_Student_Registration_Template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Parse CSV string into student rows
  const parseCSVContent = (text: string) => {
    const lines = text.trim().split(/\r?\n/)
    if (lines.length <= 1) {
      alert('CSV file is empty or only has headers.')
      return
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''))
    const rows: any[] = []
    const errors: { row: number; error: string }[] = []
    const seenEmails = new Set<string>()

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''))
      const rowObj: Record<string, any> = {}

      headers.forEach((h, idx) => {
        const val = cols[idx] || ''
        if (h.includes('name') && !h.includes('parent')) rowObj.applicant_name = val
        else if (h.includes('class') || h.includes('grade')) rowObj.school_class = val
        else if (h.includes('section')) rowObj.school_section = val
        else if (h.includes('roll')) rowObj.school_roll_number = val
        else if (h.includes('dob') || h.includes('birth')) rowObj.dob = val
        else if (h.includes('gender')) rowObj.gender = val
        else if (h.includes('percent') || h.includes('marks')) rowObj.percentage = Number(val) || 80
        else if (h.includes('parent') || h.includes('father')) rowObj.father_name = val
        else if (h.includes('phone') || h.includes('mobile')) rowObj.applicant_phone = val
        else if (h.includes('email')) rowObj.applicant_email = val
      })

      // Validation
      const rowNum = i
      if (!rowObj.applicant_name) {
        errors.push({ row: rowNum, error: 'Missing student name' })
      }
      if (rowObj.applicant_email) {
        const emailLower = rowObj.applicant_email.toLowerCase()
        if (seenEmails.has(emailLower)) {
          errors.push({ row: rowNum, error: `Duplicate email '${emailLower}' in file` })
        }
        seenEmails.add(emailLower)
      }

      rows.push(rowObj)
    }

    setParsedRows(rows)
    setValidationErrors(errors)
  }

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) parseCSVContent(content)
    }
    reader.readAsText(file)
  }

  // Submit Bulk Records
  const handleBulkSubmit = async () => {
    if (!selectedScheme || parsedRows.length === 0) return
    setSubmitting(true)

    try {
      const token = await getToken()
      const res = await fetch('/api/school/students/bulk-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          scholarship_id: selectedScheme,
          students: parsedRows,
        }),
      })
      const data = await res.json()

      if (data.success) {
        setBatchResult(data)
      } else {
        alert(data.error || 'Bulk registration failed')
      }
    } catch (err: any) {
      alert(err.message || 'Error processing bulk upload')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/school-portal/students"
            className="p-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 shadow-sm"
          >
            <FiArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Bulk Student CSV Upload</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload and register entire classroom batches in a single operation
            </p>
          </div>
        </div>

        <button
          onClick={downloadTemplate}
          className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
        >
          <FiDownload /> Download CSV Template
        </button>
      </div>

      {/* Scheme Selection Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
        <label className="block text-xs font-bold text-[#FF2D8D] uppercase tracking-wider">
          1. Select Target Associated Scholarship Scheme *
        </label>
        <select
          value={selectedScheme}
          onChange={(e) => setSelectedScheme(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#FF2D8D]"
        >
          {schemes.map((s) => (
            <option key={s.scholarship_id} value={s.scholarship_id}>
              {s.title} (Fee: ₹{s.registration_fee} • Incentive: ₹{s.incentive_per_verified_registration}/verified)
            </option>
          ))}
        </select>
      </div>

      {/* Upload & Parse Area */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            2. Choose Upload Method
          </span>
          <div className="flex gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`px-3 py-1 rounded-lg ${
                uploadMode === 'file' ? 'bg-purple-100 text-purple-800' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              CSV File Upload
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('paste')}
              className={`px-3 py-1 rounded-lg ${
                uploadMode === 'paste' ? 'bg-purple-100 text-purple-800' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Paste CSV Data
            </button>
          </div>
        </div>

        {uploadMode === 'file' ? (
          <div className="border-2 border-dashed border-purple-200 rounded-3xl p-8 sm:p-12 text-center hover:border-purple-400 transition-colors bg-purple-50/20 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
              <FiUploadCloud size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Choose CSV File to Upload</p>
              <p className="text-xs text-gray-400 mt-1">Supports standard .csv format with headers</p>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FF2D8D] file:text-white hover:file:bg-pink-600"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              rows={6}
              value={pastedCSV}
              onChange={(e) => setPastedCSV(e.target.value)}
              placeholder="Paste raw CSV text here including headers (e.g. Student Name, Class, Section, School Roll No, Phone, Email...)"
              className="w-full p-4 rounded-2xl border border-gray-200 text-xs font-mono focus:ring-2 focus:ring-[#FF2D8D]"
            />
            <button
              onClick={() => parseCSVContent(pastedCSV)}
              className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black"
            >
              Parse Pasted CSV
            </button>
          </div>
        )}

        {/* Validation & Preview Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Pre-Validation Preview ({parsedRows.length} Students Parsed)
                </h3>
                <p className="text-xs text-gray-500">
                  {validationErrors.length === 0 ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                      <FiCheckCircle size={12} /> All records are valid and ready for registration.
                    </span>
                  ) : (
                    <span className="text-amber-600 font-bold flex items-center gap-1 mt-0.5">
                      <FiAlertCircle size={12} /> {validationErrors.length} warnings detected (invalid records will be reported).
                    </span>
                  )}
                </p>
              </div>

              <button
                onClick={() => {
                  setParsedRows([])
                  setValidationErrors([])
                }}
                className="p-2 text-red-500 hover:bg-red-50 rounded-xl text-xs flex items-center gap-1"
              >
                <FiTrash2 /> Clear Preview
              </button>
            </div>

            <div className="border border-gray-100 rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold sticky top-0">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Student Name</th>
                    <th className="p-2.5">Class / Sec</th>
                    <th className="p-2.5">School Roll</th>
                    <th className="p-2.5">Phone / Email</th>
                    <th className="p-2.5">Parent Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {parsedRows.map((r, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="p-2.5 text-gray-400">{idx + 1}</td>
                      <td className="p-2.5 font-bold text-gray-900">{r.applicant_name}</td>
                      <td className="p-2.5">{r.school_class || '10th'} ({r.school_section || 'A'})</td>
                      <td className="p-2.5">{r.school_roll_number || 'N/A'}</td>
                      <td className="p-2.5 font-mono text-[11px]">{r.applicant_phone || r.applicant_email || 'N/A'}</td>
                      <td className="p-2.5 text-gray-600">{r.father_name || 'Guardian'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleBulkSubmit}
                disabled={submitting}
                className="px-6 py-3 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {submitting ? 'Enrolling Students...' : `Confirm & Register ${parsedRows.length} Students`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Batch Result Modal */}
      {batchResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <FiCheckCircle size={30} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-gray-900">Bulk Registration Completed!</h3>
              <p className="text-xs font-mono text-purple-700 font-bold">
                Batch ID: {batchResult.batch?.id}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl text-center text-xs">
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
                <span className="text-2xl font-extrabold block">{batchResult.successful_count}</span>
                <span className="font-bold text-[10px]">Successfully Enrolled</span>
              </div>
              <div className="p-3 bg-gray-100 text-gray-700 rounded-xl">
                <span className="text-2xl font-extrabold block">{batchResult.failed_count}</span>
                <span className="font-bold text-[10px]">Skipped / Duplicates</span>
              </div>
            </div>

            {batchResult.errors?.length > 0 && (
              <div className="space-y-1 max-h-32 overflow-y-auto p-3 bg-amber-50 rounded-xl text-[11px] text-amber-800 border border-amber-100">
                <p className="font-bold uppercase text-[10px]">Skipped Row Details:</p>
                {batchResult.errors.map((err: any, i: number) => (
                  <p key={i}>Row {err.row}: {err.name} — {err.error}</p>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Link
                href="/school-portal/students"
                className="flex-1 py-2.5 bg-gradient-to-r from-[#FF2D8D] to-[#9C27FF] text-white text-center rounded-xl text-xs font-bold shadow transition-all"
              >
                View Registered Students
              </Link>
              <button
                onClick={() => {
                  setBatchResult(null)
                  setParsedRows([])
                }}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200"
              >
                Upload Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
