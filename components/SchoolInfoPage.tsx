import React, { useMemo } from 'react';
import { MapPin, Phone, Award, BookOpen, Target, Clock, School, ExternalLink, Users, Layers, Briefcase, PenTool } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { INITIAL_CLASSES } from '../constants';
import { ClassSection } from '../types';

const SchoolInfoPage: React.FC = () => {
  // --- Data Calculation Logic ---
  const stats = useMemo(() => {
    // 1. Get Student Stats
    const studentsJson = localStorage.getItem('madaba_school_students_v5');
    let classes: ClassSection[] = INITIAL_CLASSES; // Default to static data if local storage is empty

    if (studentsJson) {
      try {
        const parsed = JSON.parse(studentsJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
            classes = parsed;
        }
      } catch (e) { console.error(e); }
    }

    let totalStudents = 0;
    let grade11Count = 0;
    let grade12Count = 0;
    let grade11Sections = 0;
    let grade12Sections = 0;

    classes.forEach((cls) => {
      const count = cls.students.length;
      totalStudents += count;
      if (cls.gradeLevel === '11') {
        grade11Count += count;
        grade11Sections++;
      } else {
        grade12Count += count;
        grade12Sections++;
      }
    });

    // 2. Get Staff Stats
    const staffJson = localStorage.getItem('madaba_school_staff_v4');
    let totalStaff = 0;
    if (staffJson) {
      try {
        const staff = JSON.parse(staffJson);
        if (Array.isArray(staff)) {
          totalStaff = staff.length;
        }
      } catch (e) { console.error(e); }
    } else {
        // Fallback length based on initial data logic (usually around 32)
        totalStaff = 32; 
    }

    return {
      totalStudents,
      totalStaff,
      grade11: { count: grade11Count, sections: grade11Sections },
      grade12: { count: grade12Count, sections: grade12Sections },
      totalSections: grade11Sections + grade12Sections
    };
  }, []);

  const chartData = [
    { name: 'الحادي عشر', students: stats.grade11.count, fill: '#3b82f6' },
    { name: 'الثاني عشر', students: stats.grade12.count, fill: '#8b5cf6' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 text-white shadow-md relative overflow-hidden flex items-center">
        <div className="absolute right-0 top-0 h-full w-2 bg-yellow-500"></div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-inner">
            <School size={32} className="text-yellow-400" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold mb-1">مدرسة مادبا الثانوية للبنين</h2>
            <p className="text-gray-300 text-sm md:text-base font-medium">منارة للعلم والتربية منذ التأسيس</p>
          </div>
        </div>
      </div>

      {/* 1. About (Statistics Summary) */}
      <div className="bg-indigo-50 rounded-xl p-8 border border-indigo-100 relative">
        <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
          <BookOpen size={24} />
          نبذة عن المدرسة
        </h3>
        <div className="prose prose-indigo max-w-none text-gray-700 leading-9 text-lg text-justify">
          <p>
            تُعدّ مدرسة مادبا الثانوية للبنين من أعرق المدارس في المحافظة، حيث تحمل تاريخًا طويلًا في التعليم وتخرّج منها العديد من رجالات المجتمع وكبار السن الذين كان لهم أثر بارز في مختلف المجالات. ورغم قِدم مبانيها وبساطة مرافقها، فقد بقيت المدرسة رمزًا للعلم والانضباط، وبيئة أسهمت في تشكيل أجيال متعاقبة بروح المسؤولية والمعرفة. وتستمر المدرسة في أداء رسالتها التربوية عبر كادر تعليمي وإداري يمتلك الخبرة والالتزام.
          </p>
          
          <div className="mt-8 flex justify-end">
             <div className="flex flex-col items-center justify-center transform -rotate-2">
                <span className="text-xs text-gray-500 mb-1 font-bold">مدير المدرسة</span>
                <div className="font-bold text-indigo-900 text-lg border-b-2 border-yellow-400 pb-1 px-3 flex items-center gap-2" style={{ fontFamily: 'Tajawal' }}>
                   <PenTool size={16} className="text-indigo-600" />
                   لطفي المشارفة
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* 2. Vision & Mission (Moved Up) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 duration-300">
          <div className="flex items-center gap-3 mb-4 border-b border-gray-50 pb-4">
            <div className="bg-yellow-100 p-2.5 rounded-full text-yellow-600">
              <Target size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">الرؤية</h3>
          </div>
          <p className="text-gray-600 leading-relaxed text-justify text-lg">
            إعداد جيل مؤمن بالله، منتمٍ لوطنه وأمته، متسلح بالعلم والمعرفة، قادر على مواكبة التطورات التكنولوجية والعلمية، والمساهمة الفاعلة في بناء المجتمع وتقدمه.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 duration-300">
          <div className="flex items-center gap-3 mb-4 border-b border-gray-50 pb-4">
            <div className="bg-blue-100 p-2.5 rounded-full text-blue-600">
              <Award size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">الرسالة</h3>
          </div>
          <p className="text-gray-600 leading-relaxed text-justify text-lg">
            توفير بيئة تعليمية آمنة ومحفزة للإبداع والتميز، وتوظيف التكنولوجيا الحديثة في التعليم، وتنمية مهارات التفكير الناقد وحل المشكلات لدى الطلبة، وتعزيز القيم الأخلاقية والوطنية.
          </p>
        </div>
      </div>

      {/* NEW SECTION: School Structure & Statistics (Moved Down) */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gray-900 p-4 text-white flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Layers className="text-yellow-400" />
            الهيكلية والإحصائيات
          </h3>
          <span className="bg-white/10 px-3 py-1 rounded-full text-xs text-yellow-300 border border-yellow-500/30">
            مدرسة ثانوية (11 - 12)
          </span>
        </div>

        <div className="p-6">
          {/* Top Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center group hover:bg-blue-100 transition">
              <div className="mx-auto w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2 group-hover:bg-white group-hover:scale-110 transition">
                <Users size={20} />
              </div>
              <div className="text-3xl font-black text-blue-900 mb-1">{stats.totalStudents}</div>
              <div className="text-xs font-bold text-blue-600">إجمالي الطلبة</div>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center group hover:bg-indigo-100 transition">
              <div className="mx-auto w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-2 group-hover:bg-white group-hover:scale-110 transition">
                <Briefcase size={20} />
              </div>
              <div className="text-3xl font-black text-indigo-900 mb-1">{stats.totalStaff}</div>
              <div className="text-xs font-bold text-indigo-600">الكادر الإداري والتدريسي</div>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center group hover:bg-purple-100 transition">
              <div className="mx-auto w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2 group-hover:bg-white group-hover:scale-110 transition">
                <Layers size={20} />
              </div>
              <div className="text-3xl font-black text-purple-900 mb-1">2</div>
              <div className="text-xs font-bold text-purple-600">المراحل الدراسية</div>
            </div>

             <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center group hover:bg-emerald-100 transition">
              <div className="mx-auto w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2 group-hover:bg-white group-hover:scale-110 transition">
                <School size={20} />
              </div>
              <div className="text-3xl font-black text-emerald-900 mb-1">{stats.totalSections}</div>
              <div className="text-xs font-bold text-emerald-600">عدد الشعب الصفية</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
             {/* Visual Diagram */}
             <div className="relative">
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {/* School Node */}
                <div className="relative z-10 flex justify-center mb-8">
                  <div className="bg-gray-800 text-white px-6 py-2 rounded-lg shadow-md font-bold text-sm border-b-4 border-yellow-500">
                    مدرسة مادبا الثانوية للبنين
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 relative z-10">
                   {/* Grade 11 Branch */}
                   <div className="flex flex-col items-center">
                      <div className="bg-blue-600 text-white w-full py-2 rounded-t-lg text-center font-bold text-sm shadow-md mb-4 relative">
                        الصف الحادي عشر
                        <div className="absolute left-1/2 -bottom-4 w-0.5 h-4 bg-blue-300 -translate-x-1/2"></div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 w-full text-center shadow-sm">
                        <div className="text-2xl font-black text-blue-800 mb-1">{stats.grade11.count}</div>
                        <div className="text-xs text-blue-600 mb-2">طالب</div>
                        <div className="flex flex-wrap justify-center gap-1">
                          <span className="bg-blue-200 text-blue-800 text-[10px] px-2 py-0.5 rounded-full">أكاديمي</span>
                        </div>
                      </div>
                   </div>

                   {/* Grade 12 Branch */}
                   <div className="flex flex-col items-center">
                      <div className="bg-purple-600 text-white w-full py-2 rounded-t-lg text-center font-bold text-sm shadow-md mb-4 relative">
                        الصف الثاني عشر
                        <div className="absolute left-1/2 -bottom-4 w-0.5 h-4 bg-purple-300 -translate-x-1/2"></div>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 w-full text-center shadow-sm">
                        <div className="text-2xl font-black text-purple-800 mb-1">{stats.grade12.count}</div>
                        <div className="text-xs text-purple-600 mb-2">طالب</div>
                        <div className="flex flex-wrap justify-center gap-1">
                          <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.5 rounded-full">صحي</span>
                          <span className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.5 rounded-full">هندسي</span>
                          <span className="bg-cyan-100 text-cyan-700 text-[10px] px-1.5 py-0.5 rounded-full">تكنولوجيا</span>
                          <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full">قانون</span>
                          <span className="bg-fuchsia-100 text-fuchsia-700 text-[10px] px-1.5 py-0.5 rounded-full">لغات</span>
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded-full">أعمال</span>
                        </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Chart */}
             <div className="h-64 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h4 className="text-center text-sm font-bold text-gray-500 mb-4">توزيع الطلبة حسب المستوى الدراسي</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontFamily: 'Tajawal'}} />
                    <YAxis />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'Tajawal', textAlign: 'right' }}
                    />
                    <Bar dataKey="students" radius={[4, 4, 0, 0]} barSize={50} animationDuration={1500}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>

      {/* 3. Contact Info Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 border border-indigo-100">
              <MapPin size={28} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1 text-lg">العنوان</h3>
              <p className="text-gray-600 leading-relaxed">
                المملكة الأردنية الهاشمية<br />
                محافظة مادبا - شارع فلسطين<br />
                بجانب مديرية التربية والتعليم
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 border border-indigo-100">
              <Phone size={28} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1 text-lg">أرقام التواصل</h3>
              <p className="text-gray-600" dir="ltr">+962 5 324 XXXX</p>
              <p className="text-gray-600 mt-1">الإدارة المدرسية</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 border border-indigo-100">
              <Clock size={28} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1 text-lg">أوقات الدوام</h3>
              <p className="text-gray-600">الأحد - الخميس</p>
              <p className="text-gray-600 mt-1">7:30 صباحاً - 2:00 ظهراً</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Location Map Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full text-red-600">
              <MapPin size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">موقع المدرسة على الخريطة</h3>
          </div>
          <a 
            href="https://maps.app.goo.gl/Myc1qwkiNWPHd2FYA?g_st=aw" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold text-sm transition"
          >
            فتح في خرائط جوجل
            <ExternalLink size={16} />
          </a>
        </div>
        
        <div className="w-full h-80 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner relative">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d393.7164395142282!2d35.790151998973094!3d31.72069525806699!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sar!2sjo!4v1764407765836!5m2!1sar!2sjo"
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="موقع مدرسة مادبا الثانوية للبنين"
            className="absolute inset-0"
          ></iframe>
        </div>

        <a 
          href="https://maps.app.goo.gl/Myc1qwkiNWPHd2FYA?g_st=aw" 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-4 w-full sm:hidden flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 font-bold py-3 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition"
        >
          <MapPin size={18} />
          فتح الموقع في تطبيق Google Maps
        </a>
      </div>
    </div>
  );
};

export default SchoolInfoPage;