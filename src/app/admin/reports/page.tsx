'use client'

import { FiBarChart2, FiTrendingUp, FiUsers, FiAward } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

export default function ReportsPage() {
  const studentActivityData = [
    { month: 'Aug', students: 120 },
    { month: 'Sep', students: 180 },
    { month: 'Oct', students: 240 },
    { month: 'Nov', students: 320 },
    { month: 'Dec', students: 410 },
    { month: 'Jan', students: 520 },
    { month: 'Feb', students: 650 },
  ]

  const courseCompletionData = [
    { course: 'Web Dev', completion: 85 },
    { course: 'Data Science', completion: 72 },
    { course: 'Mobile Dev', completion: 68 },
    { course: 'UI/UX', completion: 91 },
  ]

  const certificateData = [
    { name: 'Issued', value: 234, color: '#10B981' },
    { name: 'Pending', value: 45, color: '#F59E0B' },
    { name: 'Rejected', value: 12, color: '#EF4444' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Data-driven insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Students</p>
              <p className="text-3xl font-bold mt-2">1,245</p>
              <p className="text-sm mt-2 opacity-90">↑ 12% vs last month</p>
            </div>
            <FiUsers className="text-5xl opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Avg Completion</p>
              <p className="text-3xl font-bold mt-2">79%</p>
              <p className="text-sm mt-2 opacity-90">↑ 5% vs last month</p>
            </div>
            <FiTrendingUp className="text-5xl opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Certificates</p>
              <p className="text-3xl font-bold mt-2">234</p>
              <p className="text-sm mt-2 opacity-90">↑ 25% vs last month</p>
            </div>
            <FiAward className="text-5xl opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Avg Task Score</p>
              <p className="text-3xl font-bold mt-2">87%</p>
              <p className="text-sm mt-2 opacity-90">↑ 3% vs last month</p>
            </div>
            <FiBarChart2 className="text-5xl opacity-80" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Growth Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Student Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={studentActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="students" stroke="#C81E4E" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Course Completion Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Course Completion Rate</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={courseCompletionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="course" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completion" fill="#D91E5B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Certificate Statistics */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Certificate Statistics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={certificateData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {certificateData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col justify-center space-y-4">
            {certificateData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="font-semibold text-gray-800">{item.name}</span>
                </div>
                <span className="text-2xl font-bold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Export Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-6 py-3 bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white rounded-lg font-semibold hover:shadow-lg transition-all">
            Export Student Data (CSV)
          </button>
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all">
            Export Task Analytics (CSV)
          </button>
          <button className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all">
            Export Certificate Report (PDF)
          </button>
        </div>
      </div>
    </div>
  )
}
