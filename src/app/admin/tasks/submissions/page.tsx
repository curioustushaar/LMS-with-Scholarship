'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiDownload, FiCheck, FiX, FiClock } from 'react-icons/fi'

export default function SubmissionsPage() {
  const submissions = [
    { id: 1, student: 'Rajesh Kumar', task: 'Build a Portfolio Website', submitted: '2026-02-14 03:30 PM', status: 'Pending', file: 'portfolio.zip' },
    { id: 2, student: 'Priya Sharma', task: 'JavaScript Calculator', submitted: '2026-02-13 11:20 AM', status: 'Pending', file: 'calculator.zip' },
    { id: 3, student: 'Amit Patel', task: 'API Integration Task', submitted: '2026-02-12 09:15 AM', status: 'Evaluated', marks: 88, file: 'api-task.zip' },
    { id: 4, student: 'Sneha Reddy', task: 'React Components Assignment', submitted: '2026-02-11 06:45 PM', status: 'Evaluated', marks: 95, file: 'react-components.zip' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">All Submissions</h1>
        <p className="text-gray-600 mt-1">Review and evaluate student task submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Total Submissions</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">126</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Pending Evaluation</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">43</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Average Score</p>
          <p className="text-3xl font-bold text-green-600 mt-2">87%</p>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.map((submission) => (
          <div key={submission.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {submission.student.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{submission.student}</h3>
                    <p className="text-sm text-gray-600">{submission.task}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <FiClock />
                    <span>Submitted: {submission.submitted}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiDownload />
                    <a href="#" className="text-[#C81E4E] hover:text-[#D91E5B] font-medium">
                      {submission.file}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-3">
                {submission.status === 'Pending' ? (
                  <>
                    <span className="px-4 py-2 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-lg">
                      Pending Evaluation
                    </span>
                    <button className="px-6 py-2 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold">
                      Evaluate Now
                    </button>
                  </>
                ) : (
                  <>
                    <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-lg flex items-center space-x-2">
                      <FiCheck />
                      <span>Evaluated</span>
                    </span>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-[#C81E4E]">{submission.marks}</p>
                      <p className="text-xs text-gray-600">/ 100</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
