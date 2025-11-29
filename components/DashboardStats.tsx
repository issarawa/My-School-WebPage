import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Category, StaffMember } from '../types';
import { Users, UserCog, GraduationCap, Briefcase } from 'lucide-react';

interface DashboardStatsProps {
  staff: StaffMember[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ staff }) => {
  const adminCount = staff.filter(s => s.category === Category.ADMIN).length;
  const teacherCount = staff.filter(s => s.category === Category.TEACHER).length;
  const employeeCount = staff.filter(s => s.category === Category.EMPLOYEE).length;

  const data = [
    { name: Category.ADMIN, value: adminCount, color: '#4f46e5' },
    { name: Category.TEACHER, value: teacherCount, color: '#0ea5e9' },
    { name: Category.EMPLOYEE, value: employeeCount, color: '#10b981' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
      {/* Inject styles for the glowing animation */}
      <style>{`
        @keyframes glow-admin {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(79, 70, 229, 0.3)); }
          50% { filter: drop-shadow(0 0 8px rgba(79, 70, 229, 0.8)); }
        }
        @keyframes glow-teacher {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(14, 165, 233, 0.3)); }
          50% { filter: drop-shadow(0 0 8px rgba(14, 165, 233, 0.8)); }
        }
        @keyframes glow-employee {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(16, 185, 129, 0.3)); }
          50% { filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.8)); }
        }
        
        .chart-segment {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .chart-segment:hover {
          opacity: 0.8;
          transform: scale(1.02);
        }
        
        /* Apply animations with delays for alternating effect */
        .segment-admin { animation: glow-admin 3s infinite ease-in-out; }
        .segment-teacher { animation: glow-teacher 3s infinite ease-in-out; animation-delay: 1s; }
        .segment-employee { animation: glow-employee 3s infinite ease-in-out; animation-delay: 2s; }
      `}</style>

      <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">إحصائيات الكادر</h3>
      
      <div className="flex flex-col gap-4 mb-8">
        {/* Total Card - Full Width Banner */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-4 text-white shadow-md flex items-center justify-between px-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-2 bg-yellow-500"></div>
          <div className="flex items-center gap-3 z-10">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Users size={24} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-200 text-xs font-medium">المجموع الكلي</p>
              <p className="font-bold text-lg">إجمالي الكادر</p>
            </div>
          </div>
          <span className="text-4xl font-bold tracking-wider z-10">{staff.length}</span>
        </div>

        {/* The 3 Categories Side-by-Side Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Teachers Card */}
          <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute right-0 top-0 h-full w-1 bg-sky-500"></div>
            <div>
              <p className="text-sm text-sky-700 mb-1 font-medium">المعلمون</p>
              <p className="text-3xl font-bold text-sky-900">{teacherCount}</p>
            </div>
            <div className="bg-sky-100 p-3 rounded-full text-sky-600 group-hover:bg-sky-200 transition-colors">
              <GraduationCap size={24} />
            </div>
          </div>

          {/* Admins Card */}
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute right-0 top-0 h-full w-1 bg-indigo-500"></div>
            <div>
              <p className="text-sm text-indigo-700 mb-1 font-medium">الإداريون</p>
              <p className="text-3xl font-bold text-indigo-900">{adminCount}</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full text-indigo-600 group-hover:bg-indigo-200 transition-colors">
              <UserCog size={24} />
            </div>
          </div>

          {/* Employees Card */}
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute right-0 top-0 h-full w-1 bg-emerald-500"></div>
            <div>
              <p className="text-sm text-emerald-700 mb-1 font-medium">المستخدمون</p>
              <p className="text-3xl font-bold text-emerald-900">{employeeCount}</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 group-hover:bg-emerald-200 transition-colors">
               <Briefcase size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="h-72 w-full flex justify-center items-center bg-gray-50/50 rounded-xl border border-gray-100/50">
        <div className="w-full max-w-3xl h-full py-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => {
                  // Determine class based on category index
                  let animationClass = '';
                  if (index === 0) animationClass = 'segment-admin';
                  else if (index === 1) animationClass = 'segment-teacher';
                  else animationClass = 'segment-employee';

                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      className={`chart-segment ${animationClass}`}
                      stroke="none"
                    />
                  );
                })}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', textAlign: 'right', direction: 'rtl', padding: '10px' }}
                itemStyle={{ color: '#374151', fontWeight: 'bold', fontFamily: 'Tajawal' }}
                formatter={(value: number, name: string) => [`${value} موظف`, name]}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;