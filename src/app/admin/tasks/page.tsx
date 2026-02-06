'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiPlus, FiEdit, FiTrash2, FiFileText, FiFilter } from 'react-icons/fi'

export default function TasksPage() {
  const [filterWeek, setFilterWeek] = useState('all')
  
  const tasks = [
    { id: 1, title: 'Build a Portfolio Website', week: 2, deadline: '2026-02-15', submissions: 45, pending: 12, evaluated: 33 },
    { id: 2, title: 'JavaScript Calculator', week: 3, deadline: '2026-02-20', submissions: 38, pending: 8, evaluated: 30 },
    { id: 3, title: 'API Integration Task', week: 4, deadline: '2026-02-28', submissions: 25, pending: 15, evaluated: 10 },
    { id: 4, title: 'React Components Assignment', week: 5, deadline: '2026-03-05', submissions: 18, pending: 18, evaluated: 0 },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tasks & Assignments</h1>
          <p className="text-gray-600 mt-1">Manage tasks, submissions, and evaluations</p>
        </div>
        <Link
          href="/admin/tasks/create"
          className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
        >
          <FiPlus className="text-xl" />
          <span>Create Task</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Total Tasks</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">48</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Total Submissions</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">126</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Pending Evaluation</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">43</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Evaluated</p>
          <p className="text-3xl font-bold text-green-600 mt-2">83</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center space-x-4">
          <FiFilter className="text-gray-600 text-xl" />
          <select
            value={filterWeek}
            onChange={(e) => setFilterWeek(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
          >
            <option value="all">All Weeks</option>
            <option value="1">Week 1</option>
            <option value="2">Week 2</option>
            <option value="3">Week 3</option>
            <option value="4">Week 4</option>
            <option value="5">Week 5</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800">{task.title}</h3>
                <p className="text-sm text-gray-600 mt-1">Week {task.week} • Deadline: {task.deadline}</p>
                
                <div className="flex items-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      <strong>{task.submissions}</strong> Submissions
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      <strong>{task.pending}</strong> Pending
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      <strong>{task.evaluated}</strong> Evaluated
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <Link
                  href={`/admin/tasks/${task.id}/submissions`}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium text-center"
                >
                  View Submissions
                </Link>
                <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-sm font-medium flex items-center justify-center space-x-2">
                  <FiEdit />
                  <span>Edit Task</span>
                </button>
                <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium flex items-center justify-center space-x-2">
                  <FiTrash2 />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Evaluation Progress</span>
                <span>{Math.round((task.evaluated / task.submissions) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] h-2 rounded-full"
                  style={{ width: `${(task.evaluated / task.submissions) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
