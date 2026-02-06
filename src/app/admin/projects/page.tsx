'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiPlus, FiEdit, FiTrash2, FiFilter } from 'react-icons/fi'

export default function ProjectsPage() {
  const [filterStatus, setFilterStatus] = useState('all')
  
  const projects = [
    { id: 1, student: 'Rajesh Kumar', title: 'E-Commerce Website', status: 'In Progress', progress: 65, mentor: 'Vikram Joshi' },
    { id: 2, student: 'Priya Sharma', title: 'Data Analytics Dashboard', status: 'Pending Approval', progress: 100, mentor: 'Ananya Singh' },
    { id: 3, student: 'Amit Patel', title: 'Mobile Fitness App', status: 'Approved', progress: 100, mentor: 'Vikram Joshi' },
    { id: 4, student: 'Sneha Reddy', title: 'Portfolio Website Builder', status: 'In Progress', progress: 45, mentor: 'Ananya Singh' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Projects Management</h1>
          <p className="text-gray-600 mt-1">Track and manage student internship projects</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Total Projects</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">156</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">In Progress</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">82</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Pending Approval</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">28</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Approved</p>
          <p className="text-3xl font-bold text-green-600 mt-2">46</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center space-x-4">
          <FiFilter className="text-gray-600 text-xl" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
          >
            <option value="all">All Status</option>
            <option value="in-progress">In Progress</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] p-6 text-white">
              <h3 className="text-xl font-bold">{project.title}</h3>
              <p className="mt-2 opacity-90">by {project.student}</p>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                  <p><strong>Mentor:</strong> {project.mentor}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  project.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  project.status === 'Pending Approval' ? 'bg-orange-100 text-orange-800' :
                  project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {project.status}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span className="font-semibold">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium text-center"
                >
                  View Details
                </Link>
                {project.status === 'Pending Approval' && (
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-sm font-medium">
                    Approve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
