'use client'

import { useState, useEffect } from 'react'
import { getSchoolClientAuthToken } from '@/lib/auth-helpers'
import {
  FiUser,
  FiMapPin,
  FiDollarSign,
  FiKey,
  FiCheckCircle,
  FiAlertCircle,
  FiLock,
  FiCheck,
} from 'react-icons/fi'

export default function SchoolProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Bank details form
  const [bankData, setBankData] = useState({
    beneficiary_name: '',
    account_number: '',
    ifsc_code: '',
    bank_name: '',
  })
  const [bankSuccess, setBankSuccess] = useState('')
  const [bankError, setBankError] = useState('')
  const [savingBank, setSavingBank] = useState(false)

  // Password change form
  const [pwData, setPwData] = useState({
    new_password: '',
    confirm_password: '',
  })
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwError, setPwError] = useState('')
  const [savingPw, setSavingPw] = useState(false)

  const getToken = async () => await getSchoolClientAuthToken()

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/school/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success && json.data) {
        setProfile(json.data)
        if (json.data.bank_details) {
          setBankData({
            beneficiary_name: json.data.bank_details.beneficiary_name || '',
            account_number: json.data.bank_details.account_number || '',
            ifsc_code: json.data.bank_details.ifsc_code || '',
            bank_name: json.data.bank_details.bank_name || '',
          })
        }
      }
    } catch (err) {
      console.error('Fetch school profile error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    setBankSuccess('')
    setBankError('')
    setSavingBank(true)

    try {
      const token = await getToken()
      const res = await fetch('/api/school/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(bankData),
      })
      const json = await res.json()
      if (json.success) {
        setBankSuccess('Bank payout & KYC details updated successfully!')
      } else {
        setBankError(json.error || 'Failed to update bank details')
      }
    } catch (err: any) {
      setBankError(err.message || 'Error saving bank details')
    } finally {
      setSavingBank(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwSuccess('')
    setPwError('')

    if (pwData.new_password.length < 6) {
      setPwError('Password must be at least 6 characters long.')
      return
    }
    if (pwData.new_password !== pwData.confirm_password) {
      setPwError('Passwords do not match.')
      return
    }

    setSavingPw(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/school/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ new_password: pwData.new_password }),
      })
      const json = await res.json()
      if (json.success) {
        setPwSuccess('Password updated successfully!')
        setPwData({ new_password: '', confirm_password: '' })
      } else {
        setPwError(json.error || 'Failed to update password')
      }
    } catch (err: any) {
      setPwError(err.message || 'Error updating password')
    } finally {
      setSavingPw(false)
    }
  }

  if (loading || !profile) {
    return <div className="p-16 text-center text-gray-400">Loading school profile...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiUser className="text-[#FF2D8D]" />
          School Partner Profile & Verification
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review your institution’s registered identity, authorized contact details, and payout disbursement information
        </p>
      </div>

      {/* School Information Summary Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
        <div className="flex justify-between items-start border-b border-gray-100 pb-4">
          <div>
            <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-100">
              {profile.school_id}
            </span>
            <h2 className="text-xl font-bold text-gray-900 mt-1">{profile.name}</h2>
            <p className="text-xs text-gray-500">{profile.address}, {profile.city}, {profile.state} - {profile.pincode}</p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase border border-emerald-100">
            {profile.status}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-gray-400 text-[10px] block">Board</span>
            <span className="font-bold text-gray-800">{profile.board}</span>
          </div>
          <div>
            <span className="text-gray-400 text-[10px] block">School Type</span>
            <span className="font-bold text-gray-800">{profile.school_type}</span>
          </div>
          <div>
            <span className="text-gray-400 text-[10px] block">UDISE Code</span>
            <span className="font-bold text-gray-800">{profile.udise_code || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-400 text-[10px] block">Authorized Person</span>
            <span className="font-bold text-gray-800">{profile.contact_person_name} ({profile.designation})</span>
          </div>
        </div>
      </div>

      {/* Bank Payout / KYC Details Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FiDollarSign size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Incentive Disbursement & Bank Account Details</h3>
            <p className="text-xs text-gray-500">
              Provide verified institutional bank details where earned scholarship incentives will be disbursed
            </p>
          </div>
        </div>

        {bankSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <FiCheckCircle /> {bankSuccess}
          </div>
        )}
        {bankError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <FiAlertCircle /> {bankError}
          </div>
        )}

        <form onSubmit={handleSaveBankDetails} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Beneficiary / Account Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ABC Public School Educational Trust"
                value={bankData.beneficiary_name}
                onChange={(e) => setBankData({ ...bankData, beneficiary_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Bank Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. HDFC Bank"
                value={bankData.bank_name}
                onChange={(e) => setBankData({ ...bankData, bank_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Bank Account Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 91802003881928"
                value={bankData.account_number}
                onChange={(e) => setBankData({ ...bankData, account_number: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                IFSC Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. HDFC0001234"
                value={bankData.ifsc_code}
                onChange={(e) => setBankData({ ...bankData, ifsc_code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono uppercase"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingBank}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
            >
              {savingBank ? 'Saving...' : 'Save Payout Details'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <FiKey size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Change Portal Password</h3>
            <p className="text-xs text-gray-500">Update your school partner account password</p>
          </div>
        </div>

        {pwSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <FiCheckCircle /> {pwSuccess}
          </div>
        )}
        {pwError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <FiAlertCircle /> {pwError}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                New Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={pwData.new_password}
                onChange={(e) => setPwData({ ...pwData, new_password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF2D8D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={pwData.confirm_password}
                onChange={(e) => setPwData({ ...pwData, confirm_password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF2D8D]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPw}
              className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-xs shadow transition-all disabled:opacity-50"
            >
              {savingPw ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
