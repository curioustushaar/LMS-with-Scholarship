'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiDownload, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi'

export default function CertificatesPage() {
  const [activeTab, setActiveTab] = useState('pending')

  const pendingCertificates = [
    { id: 1, student: 'Rajesh Kumar', course: 'Web Development', completion: 100, eligible: true },
    { id: 2, student: 'Priya Sharma', course: 'Data Science', completion: 100, eligible: true },
    { id: 3, student: 'Amit Patel', course: 'Mobile App Dev', completion: 95, eligible: false },
  ]

  const issuedCertificates = [
    { id: 'CERT-2026-001', student: 'Sneha Reddy', course: 'UI/UX Design', issueDate: '2026-02-01' },
    { id: 'CERT-2026-002', student: 'Vikram Joshi', course: 'Web Development', issueDate: '2026-01-28' },
    { id: 'CERT-2026-003', student: 'Ananya Singh', course: 'Data Science', issueDate: '2026-01-25' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Certificates Management</h1>
        <p className="text-gray-600 mt-1">Approve, issue, and manage course certificates</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Pending Approval</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">12</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Issued This Month</p>
          <p className="text-3xl font-bold text-green-600 mt-2">45</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Total Issued</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">234</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Revoked</p>
          <p className="text-3xl font-bold text-red-600 mt-2">2</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-4 font-medium transition-all ${
                activeTab === 'pending'
                  ? 'border-b-4 border-[#C81E4E] text-[#C81E4E]'
                  : 'text-gray-600 hover:text-[#C81E4E]'
              }`}
            >
              Pending Certificates ({pendingCertificates.length})
            </button>
            <button
              onClick={() => setActiveTab('issued')}
              className={`px-6 py-4 font-medium transition-all ${
                activeTab === 'issued'
                  ? 'border-b-4 border-[#C81E4E] text-[#C81E4E]'
                  : 'text-gray-600 hover:text-[#C81E4E]'
              }`}
            >
              Issued Certificates ({issuedCertificates.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {pendingCertificates.map((cert) => (
                <div key={cert.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {cert.student.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">{cert.student}</h3>
                        <p className="text-sm text-gray-600 mt-1">{cert.course}</p>
                        
                        {/* Eligibility Checklist */}
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <FiCheck className="text-green-600" />
                            <span className="text-gray-700">Course completion: {cert.completion}%</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            {cert.eligible ? (
                              <>
                                <FiCheck className="text-green-600" />
                                <span className="text-green-700 font-medium">Eligible for certificate</span>
                              </>
                            ) : (
                              <>
                                <FiX className="text-red-600" />
                                <span className="text-red-700 font-medium">Not eligible yet</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-3">
                      {cert.eligible ? (
                        <>
                          <button className="px-6 py-2 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center space-x-2">
                            <FiCheck />
                            <span>Approve & Issue</span>
                          </button>
                          <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold flex items-center space-x-2">
                            <FiX />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <span className="px-6 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium text-center">
                          Awaiting Completion
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'issued' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Certificate ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Issue Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {issuedCertificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cert.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{cert.student}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{cert.course}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{cert.issueDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-3">
                          <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1">
                            <FiDownload />
                            <span>Download</span>
                          </button>
                          <button className="text-orange-600 hover:text-orange-800 font-medium flex items-center space-x-1">
                            <FiRefreshCw />
                            <span>Reissue</span>
                          </button>
                          <button className="text-red-600 hover:text-red-800 font-medium flex items-center space-x-1">
                            <FiX />
                            <span>Revoke</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
