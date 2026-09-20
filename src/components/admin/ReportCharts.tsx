'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface ReportChartsProps {
  studentActivityData: Array<{ month: string; students: number }>
  courseCompletionData: Array<{ course: string; completion: number }>
  certificateData: Array<{ name: string; value: number; color: string }>
}

export default function ReportCharts({
  studentActivityData,
  courseCompletionData,
  certificateData,
}: ReportChartsProps) {
  return (
    <>
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
    </>
  )
}
