import React, { useState, useRef, useEffect } from 'react';
import { School, Users, GraduationCap, Star, Image as ImageIcon, Database, Download, Upload, X, Check } from 'lucide-react';
import SchoolInfoPage from './components/SchoolInfoPage';
import StaffPage from './components/StaffPage';
import StudentsPage from './components/StudentsPage';
import AssessmentPage from './components/AssessmentPage';
import PhotosPage from './components/PhotosPage';
import { db } from './utils/db'; // Import DB utility

// Define page types
type Page = 'school' | 'staff' | 'students' | 'assessment' | 'photos';

function App() {
  const [activePage, setActivePage] = useState<Page>('school');
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Visitor Counter Logic ---
  useEffect(() => {
    // Check if this session has already been counted
    const sessionKey = 'madaba_school_session_active';
    const storageKey = 'madaba_school_visitors';
    
    const isSessionActive = sessionStorage.getItem(sessionKey);

    if (!isSessionActive) {
      // It's a new visit/session
      const currentCount = parseInt(localStorage.getItem(storageKey) || '1250'); // Default start at 1250 for realism
      const newCount = currentCount + 1;
      
      localStorage.setItem(storageKey, newCount.toString());
      sessionStorage.setItem(sessionKey, 'true'); // Mark session as active
    }
  }, []);

  // --- Backup & Restore Logic ---
  
  const handleExportData = async () => {
    setBackupStatus('جاري تجميع البيانات... قد يستغرق هذا وقتاً للصور الكبيرة');
    try {
        // Fetch gallery from IDB
        const gallery = await db.getAllImages();

        const data = {
          staff: localStorage.getItem('madaba_school_staff_v4'),
          students: localStorage.getItem('madaba_school_students_v5'),
          // Embed gallery in JSON (Note: Large files will create a massive JSON)
          gallery: gallery, 
          rating: localStorage.getItem('madaba_school_rating'),
          visitors: localStorage.getItem('madaba_school_visitors'),
          timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `madaba-school-backup-${new Date().toLocaleDateString('en-CA')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setBackupStatus('');
        setIsBackupModalOpen(false);
    } catch (e) {
        console.error(e);
        setBackupStatus('حدث خطأ أثناء التصدير.');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBackupStatus('جاري قراءة الملف... الرجاء الانتظار');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Validation simple check
        if (!data.timestamp) {
          alert('هذا الملف غير صالح أو تالف.');
          setBackupStatus('');
          return;
        }

        if (confirm('هل أنت متأكد؟ سيتم استبدال جميع البيانات الحالية بالبيانات الموجودة في الملف.')) {
          setBackupStatus('جاري استعادة البيانات...');
          
          if (data.staff) localStorage.setItem('madaba_school_staff_v4', data.staff);
          if (data.students) localStorage.setItem('madaba_school_students_v5', data.students);
          
          // Restore Gallery to IndexedDB
          if (data.gallery && Array.isArray(data.gallery)) {
             setBackupStatus('جاري استعادة الصور (قد يستغرق وقتاً)...');
             await db.clearGallery();
             for (const img of data.gallery) {
                 await db.addImage(img);
             }
          } else if (data.gallery) {
             // Handle legacy local storage backup format if plain string
             localStorage.setItem('madaba_school_gallery_v1', data.gallery);
          }

          if (data.rating) localStorage.setItem('madaba_school_rating', data.rating);
          if (data.visitors) localStorage.setItem('madaba_school_visitors', data.visitors);
          
          alert('تم استعادة البيانات بنجاح! سيتم تحديث الصفحة الآن.');
          window.location.reload();
        } else {
            setBackupStatus('');
        }
      } catch (error) {
        console.error(error);
        alert('حدث خطأ أثناء قراءة الملف.');
        setBackupStatus('');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12 flex flex-col">
      {/* Header */}
      <header className="bg-indigo-900 text-white shadow-lg sticky top-0 z-50 relative overflow-hidden">
        <div className="container mx-auto px-4 pt-6 pb-2 relative z-10">
          {/* Top Section: Logo & Title */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              {/* Logo Container - MOE Logo */}
              <div className="bg-white p-2 rounded-lg shadow-md shrink-0 flex items-center justify-center">
                <img 
                  src="https://moe.gov.jo/sites/all/themes/moe/images/logo3.png" 
                  alt="MOE Logo" 
                  style={{ width: '130px', height: 'auto' }}
                  className="object-contain"
                />
              </div>
              
              {/* Titles Container */}
              <div className="flex flex-col items-start justify-center">
                <h2 className="text-indigo-200 text-xs md:text-sm font-medium mb-0.5">
                  مديرية التربية والتعليم لواء قصبة مادبا
                </h2>
                <h1 className="text-base md:text-lg font-bold whitespace-nowrap leading-tight">
                  مدرسة مادبا الثانوية للبنين
                </h1>
                <p className="text-indigo-300 text-[10px] md:text-xs mt-0.5">
                  نظام الإدارة المدرسي الموحد
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsBackupModalOpen(true)}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-indigo-900 px-4 py-1.5 rounded-full font-bold text-xs md:text-sm transition shadow-md"
              >
                <Database size={16} />
                <span>نسخ / استعادة البيانات</span>
              </button>
              <div className="hidden md:block text-sm text-indigo-300 bg-indigo-950/50 px-4 py-1 rounded-full border border-indigo-800 shadow-sm">
                العام الدراسي 2025 / 2026
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActivePage('school')}
              className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-bold transition-all relative top-[1px] ${
                activePage === 'school' 
                  ? 'bg-gray-50 text-indigo-900 border-b-4 border-yellow-400 shadow-sm' 
                  : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'
              }`}
            >
              <School size={20} />
              <span className="whitespace-nowrap">معلومات المدرسة</span>
            </button>
            
            <button
              onClick={() => setActivePage('staff')}
              className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-bold transition-all relative top-[1px] ${
                activePage === 'staff' 
                  ? 'bg-gray-50 text-indigo-900 border-b-4 border-yellow-400 shadow-sm' 
                  : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'
              }`}
            >
              <Users size={20} />
              <span className="whitespace-nowrap">معلومات الكادر</span>
            </button>

            <button
              onClick={() => setActivePage('students')}
              className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-bold transition-all relative top-[1px] ${
                activePage === 'students' 
                  ? 'bg-gray-50 text-indigo-900 border-b-4 border-yellow-400 shadow-sm' 
                  : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'
              }`}
            >
              <GraduationCap size={20} />
              <span className="whitespace-nowrap">معلومات الطلبة</span>
            </button>

            <button
              onClick={() => setActivePage('photos')}
              className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-bold transition-all relative top-[1px] ${
                activePage === 'photos' 
                  ? 'bg-gray-50 text-indigo-900 border-b-4 border-yellow-400 shadow-sm' 
                  : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'
              }`}
            >
              <ImageIcon size={20} />
              <span className="whitespace-nowrap">الصور</span>
            </button>

            <button
              onClick={() => setActivePage('assessment')}
              className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-bold transition-all relative top-[1px] ${
                activePage === 'assessment' 
                  ? 'bg-gray-50 text-indigo-900 border-b-4 border-yellow-400 shadow-sm' 
                  : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'
              }`}
            >
              <Star size={20} />
              <span className="whitespace-nowrap">التقييم</span>
            </button>
          </div>
        </div>

        {/* Decorative Golden Line */}
        <div className="absolute bottom-0 left-0 w-full z-20">
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-800 via-yellow-500 to-indigo-800 shadow-lg opacity-90"></div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        {activePage === 'school' && <SchoolInfoPage />}
        {activePage === 'staff' && <StaffPage />}
        {activePage === 'students' && <StudentsPage />}
        {activePage === 'photos' && <PhotosPage />}
        {activePage === 'assessment' && <AssessmentPage />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <p className="text-gray-500 text-sm">
              &copy; 2025 مدرسة مادبا الثانوية للبنين - جميع الحقوق محفوظة
            </p>
            
            <div className="text-gray-400 text-xs">
              <span className="font-medium">تطوير المعلم / </span>
              <span className="font-bold text-gray-500">عيسى الرواحنة</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Backup Modal */}
      {isBackupModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-bounce-in">
             <div className="bg-indigo-900 p-4 flex justify-between items-center text-white">
               <h3 className="font-bold text-lg flex items-center gap-2">
                 <Database size={20} className="text-yellow-400" />
                 إدارة بيانات الموقع
               </h3>
               <button onClick={() => setIsBackupModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition">
                 <X size={24} />
               </button>
             </div>

             <div className="p-6 space-y-6">
               <p className="text-sm text-gray-600 text-center leading-relaxed">
                 هذا الموقع لا يستخدم قاعدة بيانات سحابية. البيانات محفوظة على هذا الجهاز فقط (بما في ذلك الصور). لنقل البيانات لجهاز آخر أو لحفظ نسخة احتياطية، استخدم الخيارات أدناه.
               </p>

               <div className="space-y-4">
                 {/* Export Section */}
                 <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:border-indigo-300 transition">
                   <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                     <Download size={18} className="text-indigo-600" />
                     حفظ نسخة احتياطية
                   </h4>
                   <p className="text-xs text-gray-500 mb-3">
                     تحميل ملف يحتوي على كافة بيانات الموقع. <br/>
                     <span className="text-red-500">ملاحظة: إذا كان لديك الكثير من الصور، قد يكون حجم الملف كبيراً جداً.</span>
                   </p>
                   <button 
                    onClick={handleExportData}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition shadow-sm"
                   >
                     تحميل ملف البيانات
                   </button>
                 </div>

                 {/* Import Section */}
                 <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:border-emerald-300 transition">
                   <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                     <Upload size={18} className="text-emerald-600" />
                     استعادة البيانات
                   </h4>
                   <p className="text-xs text-gray-500 mb-3">
                     رفع ملف بيانات تم حفظه سابقاً. <span className="text-red-500 font-bold">تنبيه: سيتم استبدال البيانات الحالية.</span>
                   </p>
                   <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImportData}
                    accept=".json"
                    className="hidden"
                   />
                   <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-bold text-sm hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition shadow-sm"
                   >
                     رفع ملف لاستعادته
                   </button>
                 </div>
                 
                 {backupStatus && (
                     <div className="text-center text-xs font-bold text-indigo-600 bg-indigo-50 p-2 rounded animate-pulse">
                         {backupStatus}
                     </div>
                 )}
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;