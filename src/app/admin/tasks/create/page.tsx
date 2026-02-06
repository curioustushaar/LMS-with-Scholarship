'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiX, FiCalendar, FiFileText } from 'react-icons/fi'

export default function CreateTaskPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    week: '',
    course: '',
    deadline: '',
    maxMarks: 100,
    instructions: '',
    attachmentRequired: true,
    allowLateSubmission: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Create task in database
    alert('Task created successfully!')
    router.push('/admin/tasks')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Create New Task</h1>
          <p className="text-gray-600 mt-1">Add a new assignment or task for students</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all flex items-center space-x-2"
        >
          <FiX className="text-xl" />
          <span>Cancel</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <FiFileText className="text-[#C81E4E]" />
              <span>Task Information</span>
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Build a Portfolio Website"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  placeholder="Provide a brief description of the task"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select a course</option>
                    <option value="web-dev">Web Development</option>
                    <option value="data-science">Data Science</option>
                    <option value="mobile-dev">Mobile App Development</option>
                    <option value="ui-ux">UI/UX Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Week <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.week}
                    onChange={(e) => setFormData({ ...formData, week: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select a week</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                      <option key={w} value={w}>Week {w}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <FiCalendar className="text-[#C81E4E]" />
              <span>Submission Details</span>
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Marks <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="1000"
                  value={formData.maxMarks}
                  onChange={(e) => setFormData({ ...formData, maxMarks: parseInt(e.target.value) })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Instructions
            </label>
            <textarea
              rows={6}
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="input-field"
              placeholder="Provide detailed instructions for completing this task..."
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="attachmentRequired"
                checked={formData.attachmentRequired}
                onChange={(e) => setFormData({ ...formData, attachmentRequired: e.target.checked })}
                className="w-5 h-5 text-[#C81E4E] border-gray-300 rounded focus:ring-[#C81E4E]"
              />
              <label htmlFor="attachmentRequired" className="text-gray-700 font-medium">
                Require file attachment for submission
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="allowLate"
                checked={formData.allowLateSubmission}
                onChange={(e) => setFormData({ ...formData, allowLateSubmission: e.target.checked })}
                className="w-5 h-5 text-[#C81E4E] border-gray-300 rounded focus:ring-[#C81E4E]"
              />
              <label htmlFor="allowLate" className="text-gray-700 font-medium">
                Allow late submissions (with penalty)
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Create Task
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
