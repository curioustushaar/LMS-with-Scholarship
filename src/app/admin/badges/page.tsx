'use client'

import { useState } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiAward } from 'react-icons/fi'

export default function BadgesPage() {
  const [filterCategory, setFilterCategory] = useState('all')
  
  const badges = [
    { id: 1, name: 'Early Bird', description: 'Completed Week 1 on time', category: 'Completion', earned: 234, icon: '🎯' },
    { id: 2, name: 'Task Master', description: 'Submitted 5 tasks', category: 'Tasks', earned: 189, icon: '✅' },
    { id: 3, name: 'Perfect Score', description: 'Got 100% in a task', category: 'Achievement', earned: 45, icon: '💯' },
    { id: 4, name: 'Course Completer', description: 'Finished entire course', category: 'Completion', earned: 156, icon: '🎓' },
    { id: 5, name: 'Speedy Learner', description: 'Completed course in record time', category: 'Achievement', earned: 23, icon: '⚡' },
    { id: 6, name: 'Helping Hand', description: 'Helped 10 peers', category: 'Community', earned: 67, icon: '🤝' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Badges Management</h1>
          <p className="text-gray-600 mt-1">Manage gamification badges and achievements</p>
        </div>
        <button className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2">
          <FiPlus className="text-xl" />
          <span>Create Badge</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Total Badges</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">24</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Total Earned</p>
          <p className="text-3xl font-bold text-green-600 mt-2">714</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Most Popular</p>
          <p className="text-lg font-bold text-blue-600 mt-2">Early Bird</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Avg per Student</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">3.2</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center space-x-4">
          <label className="text-gray-700 font-medium">Category:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
          >
            <option value="all">All Categories</option>
            <option value="completion">Completion</option>
            <option value="tasks">Tasks</option>
            <option value="achievement">Achievement</option>
            <option value="community">Community</option>
          </select>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge) => (
          <div key={badge.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 text-center">
              <div className="text-6xl mb-3">{badge.icon}</div>
              <h3 className="text-xl font-bold text-gray-800">{badge.name}</h3>
            </div>
            
            <div className="p-6">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mb-3">
                {badge.category}
              </span>
              <p className="text-sm text-gray-600 mb-4">{badge.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#C81E4E]">{badge.earned}</p>
                  <p className="text-xs text-gray-600">Students Earned</p>
                </div>
                <FiAward className="text-4xl text-gray-300" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-sm font-medium flex items-center justify-center space-x-1">
                  <FiEdit />
                  <span>Edit</span>
                </button>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium flex items-center justify-center space-x-1">
                  <FiTrash2 />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
