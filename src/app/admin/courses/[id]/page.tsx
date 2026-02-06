'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiPlus, FiLock, FiUnlock, FiEdit, FiTrash2, FiVideo } from 'react-icons/fi'

export default function CourseDetailPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState('info')
  const courseId = params.id as string

  const course = {
    id: courseId,
    name: 'Web Development',
    description: 'Complete web development course covering HTML, CSS, JavaScript, React, and Node.js',
    duration: '12 weeks',
    totalStudents: 450,
    status: 'Active',
    weeks: [
      { id: 1, number: 1, title: 'Introduction to Web Development', locked: false, videosCount: 12, duration: '5 hours' },
      { id: 2, number: 2, title: 'HTML & CSS Fundamentals', locked: false, videosCount: 15, duration: '6 hours' },
      { id: 3, number: 3, title: 'JavaScript Basics', locked: false, videosCount: 18, duration: '8 hours' },
      { id: 4, number: 4, title: 'Advanced JavaScript', locked: true, videosCount: 20, duration: '10 hours' },
      { id: 5, number: 5, title: 'React.js Framework', locked: true, videosCount: 22, duration: '12 hours' },
    ]
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/courses" className="inline-flex items-center space-x-2 text-[#C81E4E] hover:text-[#D91E5B] font-medium">
        <FiArrowLeft />
        <span>Back to Courses</span>
      </Link>

      {/* Course Header */}
      <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-xl shadow-lg p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold">{course.name}</h1>
            <p className="mt-3 text-lg opacity-90">{course.description}</p>
            <div className="flex items-center space-x-6 mt-6">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-sm opacity-90">Duration</p>
                <p className="text-xl font-bold">{course.duration}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-sm opacity-90">Students</p>
                <p className="text-xl font-bold">{course.totalStudents}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-sm opacity-90">Weeks</p>
                <p className="text-xl font-bold">{course.weeks.length}</p>
              </div>
            </div>
          </div>
          <button className="px-6 py-3 bg-white text-[#C81E4E] rounded-lg font-semibold hover:shadow-xl transition-all flex items-center space-x-2">
            <FiEdit />
            <span>Edit Course</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-4 font-medium transition-all ${
                activeTab === 'info' ? 'border-b-4 border-[#C81E4E] text-[#C81E4E]' : 'text-gray-600 hover:text-[#C81E4E]'
              }`}
            >
              Course Info
            </button>
            <button
              onClick={() => setActiveTab('weeks')}
              className={`px-6 py-4 font-medium transition-all ${
                activeTab === 'weeks' ? 'border-b-4 border-[#C81E4E] text-[#C81E4E]' : 'text-gray-600 hover:text-[#C81E4E]'
              }`}
            >
              Weeks & Content
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-6 py-4 font-medium transition-all ${
                activeTab === 'students' ? 'border-b-4 border-[#C81E4E] text-[#C81E4E]' : 'text-gray-600 hover:text-[#C81E4E]'
              }`}
            >
              Enrolled Students
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'info' && <CourseInfoTab course={course} />}
          {activeTab === 'weeks' && <WeeksTab weeks={course.weeks} courseId={courseId} />}
          {activeTab === 'students' && <StudentsTab />}
        </div>
      </div>
    </div>
  )
}

function CourseInfoTab({ course }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
          <input type="text" defaultValue={course.name} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
          <input type="text" defaultValue={course.duration} className="input-field" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea rows={4} defaultValue={course.description} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select defaultValue={course.status} className="input-field">
            <option value="Active">Active</option>
            <option value="Archived">Archived</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <button className="btn-secondary">Cancel</button>
        <button className="btn-primary">Save Changes</button>
      </div>
    </div>
  )
}

function WeeksTab({ weeks, courseId }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Course Weeks</h2>
        <button className="px-6 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2">
          <FiPlus />
          <span>Add Week</span>
        </button>
      </div>

      <div className="space-y-4">
        {weeks.map((week: any) => (
          <div key={week.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Week {week.number}: {week.title}
                  </h3>
                  {week.locked ? (
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center space-x-1">
                      <FiLock className="text-sm" />
                      <span>Locked</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center space-x-1">
                      <FiUnlock className="text-sm" />
                      <span>Unlocked</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <FiVideo />
                    <span>{week.videosCount} videos</span>
                  </div>
                  <span>Duration: {week.duration}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    week.locked
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {week.locked ? 'Unlock' : 'Lock'} Week
                </button>
                <Link
                  href={`/admin/courses/${courseId}/weeks/${week.id}`}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium"
                >
                  Manage Videos
                </Link>
                <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all text-sm font-medium">
                  <FiEdit />
                </button>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium">
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StudentsTab() {
  const students = [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@email.com', progress: 85, status: 'Active' },
    { id: 2, name: 'Priya Sharma', email: 'priya@email.com', progress: 72, status: 'Active' },
    { id: 3, name: 'Amit Patel', email: 'amit@email.com', progress: 95, status: 'Active' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Enrolled Students ({students.length})</h2>
        <input
          type="text"
          placeholder="Search students..."
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C81E4E]"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Progress</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                <td className="px-6 py-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] h-2 rounded-full"
                      style={{ width: `${student.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 mt-1">{student.progress}%</span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/students/${student.id}`}
                    className="text-[#C81E4E] hover:text-[#D91E5B] font-medium text-sm"
                  >
                    View Profile
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
