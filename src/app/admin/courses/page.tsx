'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiPlus, FiEdit, FiTrash2, FiUsers, FiArchive, FiEye } from 'react-icons/fi'

export default function CoursesPage() {
  const courses = [
    { id: 1, name: 'Web Development', duration: '12 weeks', students: 450, status: 'Active', weeks: 12 },
    { id: 2, name: 'Data Science', duration: '16 weeks', students: 320, status: 'Active', weeks: 16 },
    { id: 3, name: 'Mobile App Development', duration: '10 weeks', students: 275, status: 'Active', weeks: 10 },
    { id: 4, name: 'UI/UX Design', duration: '8 weeks', students: 200, status: 'Active', weeks: 8 },
  ]

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Courses & Content</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Manage courses, weeks, and learning materials</p>
        </div>
        <button className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm md:text-base">
          <FiPlus className="text-lg md:text-xl" />
          <span>Create Course</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Total Courses</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">12</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Active Courses</p>
          <p className="text-3xl font-bold text-green-600 mt-2">10</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Total Students</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">1,245</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Total Videos</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">384</p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <div className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] p-6 text-white">
              <h2 className="text-2xl font-bold">{course.name}</h2>
              <p className="mt-2 opacity-90">{course.duration} • {course.weeks} weeks</p>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-gray-700">
                  <FiUsers className="text-xl" />
                  <span className="font-semibold">{course.students} Students</span>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  course.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {course.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Link
                  href={`/admin/courses/${course.id}`}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium text-center flex items-center justify-center space-x-1"
                >
                  <FiEye />
                  <span>View</span>
                </Link>
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-sm font-medium flex items-center justify-center space-x-1">
                  <FiEdit />
                  <span>Edit</span>
                </button>
                <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all text-sm font-medium flex items-center justify-center space-x-1">
                  <FiArchive />
                  <span>Archive</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
