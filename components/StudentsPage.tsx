import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Users, Trash2, FileText, School, Plus, X, Edit2, Check, FileType, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ClassSection } from '../types';
import { INITIAL_CLASSES } from '../constants';

const STORAGE_KEY = 'madaba_school_students_v5';

const StudentsPage: React.FC = () => {
  // --- State ---
  const [classes, setClasses] = useState<ClassSection[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge saved data with initial structure to ensure all classes exist
        return INITIAL_CLASSES.map(initClass => {
          const savedClass = parsed.find((p: ClassSection) => p.id === initClass.id);
          if (savedClass) {
             return savedClass;
          }
          return initClass;
        });
      } catch (e) {
        console.error("Failed to parse students data", e);
        return INITIAL_CLASSES;
      }
    }
    return INITIAL_CLASSES;
  });

  const [activeTabId, setActiveTabId] = useState<string>(INITIAL_CLASSES[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Input States
  const [newStudentName, setNewStudentName] = useState('');
  
  // Editing State (Using Name as Key instead of Index for safety during filtering)
  const [editingOriginalName, setEditingOriginalName] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  
  // Deletion State for Inline Confirmation
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
  }, [classes]);

  // Reset states when tab changes
  useEffect(() => {
    setSearchQuery('');
    setEditingOriginalName(null);
    setStudentToDelete(null);
  }, [activeTabId]);

  // Get current active class
  const activeClass = classes.find(c => c.id === activeTabId) || classes[0];

  // Filtered Students for Search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return activeClass.students;
    return activeClass.students.filter(student => 
      student.includes(searchQuery.trim())
    );
  }, [activeClass.students, searchQuery]);

  // --- Actions ---

  // 1. Add Student (Sorted Alphabetically)
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const nameToAdd = newStudentName.trim();
    if (!nameToAdd) return;

    setClasses(prevClasses => prevClasses.map(cls => {
      if (cls.id === activeTabId) {
        if (cls.students.includes(nameToAdd)) {
          alert('هذا الاسم موجود بالفعل في القائمة.');
          return cls;
        }
        // Add and Sort Alphabetically (Arabic support)
        const updatedStudents = [...cls.students, nameToAdd].sort((a, b) => a.localeCompare(b, 'ar'));
        return { ...cls, students: updatedStudents };
      }
      return cls;
    }));
    setNewStudentName('');
  };

  // 2. Delete Student (Two Step Process)
  
  // Step A: Initiate Delete
  const initiateDelete = (e: React.MouseEvent, studentName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setStudentToDelete(studentName);
    // Close edit if open
    if (editingOriginalName) {
        setEditingOriginalName(null);
        setEditingName('');
    }
  };

  // Step B: Confirm Delete
  const confirmDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!studentToDelete) return;

    setClasses(prevClasses => prevClasses.map(cls => {
      if (cls.id === activeTabId) {
        return { ...cls, students: cls.students.filter(s => s !== studentToDelete) };
      }
      return cls;
    }));
    
    setStudentToDelete(null);
  };

  // Step C: Cancel Delete
  const cancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setStudentToDelete(null);
  };

  // 3. Edit Student
  const startEditing = (e: React.MouseEvent, currentName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingOriginalName(currentName);
    setEditingName(currentName);
    setStudentToDelete(null); // Cancel delete if pending
  };

  const saveEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!editingOriginalName || !editingName.trim()) return;

    setClasses(prevClasses => prevClasses.map(cls => {
      if (cls.id === activeTabId) {
        // Find index of the ORIGINAL name
        const index = cls.students.indexOf(editingOriginalName);
        if (index !== -1) {
          const updatedStudents = [...cls.students];
          updatedStudents[index] = editingName.trim();
          // Re-sort after edit
          updatedStudents.sort((a, b) => a.localeCompare(b, 'ar'));
          return { ...cls, students: updatedStudents };
        }
      }
      return cls;
    }));
    setEditingOriginalName(null);
    setEditingName('');
  };

  const cancelEdit = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setEditingOriginalName(null);
      setEditingName('');
  };

  // 5. File Upload (Excel)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      
      // Get data as 2D array
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      const extractedNames: string[] = [];
      
      // Use a Set for exact matching of headers
      const ignoredTerms = new Set([
        'الاسم', 'اسم الطالب', 'name', 'student name', 
        'م', 'الرقم', 'ملاحظات', 'الرقم الوطني', 
        'الجنس', 'الجنسية', 'التسلسل', 'م.', 'no', 'id'
      ]);

      jsonData.forEach(row => {
        row.forEach(cell => {
          if (cell !== null && cell !== undefined) {
            let cellStr = String(cell).trim();
            
            // Clean leading numbers (e.g., "1. Ahmed")
            const cleanCell = cellStr.replace(/^[\d\.\-\)\s]+/, "").trim();

            if (!cleanCell) return;

            const lowerCell = cleanCell.toLowerCase();
            const isHeader = ignoredTerms.has(lowerCell);
            const isValidLength = cleanCell.length >= 2;
            
            if (isValidLength && !isHeader) {
              extractedNames.push(cleanCell);
            }
          }
        });
      });

      if (extractedNames.length > 0) {
        let newCount = 0;
        setClasses(prevClasses => prevClasses.map(cls => {
            if (cls.id === activeTabId) {
                const uniqueNewNames = extractedNames.filter(name => !cls.students.includes(name));
                newCount = uniqueNewNames.length;
                if (uniqueNewNames.length === 0) return cls;
                // Add and Sort Alphabetically
                const combined = [...cls.students, ...uniqueNewNames].sort((a, b) => a.localeCompare(b, 'ar'));
                return { ...cls, students: combined };
            }
            return cls;
        }));
        
        alert(`تمت العملية بنجاح!\nتم العثور على ${extractedNames.length} اسم في الملف.\nتمت إضافة ${newCount} اسم جديد.`);
        
      } else {
        alert('لم يتم العثور على أسماء صالحة في الملف.');
      }

    } catch (error) {
      console.error("Excel Error:", error);
      alert('حدث خطأ أثناء قراءة الملف.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // --- Helpers for Styling ---
  const getThemeColor = (color: string) => {
    const themes: Record<string, string> = {
      blue: 'indigo',
      indigo: 'indigo',
      violet: 'violet',
      purple: 'purple',
      rose: 'rose',
      pink: 'pink',
      orange: 'orange',
      cyan: 'cyan',
      slate: 'slate',
      fuchsia: 'fuchsia',
      emerald: 'emerald'
    };
    return themes[color] || 'gray';
  };

  const totalStudents = classes.reduce((sum, cls) => sum + cls.students.length, 0);
  const theme = getThemeColor(activeClass.color);

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      {/* Stats Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-indigo-600" />
            إدارة الطلبة
          </h2>
          <p className="text-gray-500 text-sm mt-1">العام الدراسي 2025 / 2026</p>
        </div>
        <div className="text-left bg-indigo-50 px-6 py-3 rounded-xl border border-indigo-100">
          <div className="text-3xl font-black text-indigo-900">{totalStudents}</div>
          <div className="text-xs text-indigo-600 font-bold">إجمالي الطلبة</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {classes.map(cls => (
            <button
              key={cls.id}
              onClick={() => setActiveTabId(cls.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                activeTabId === cls.id 
                  ? `bg-${cls.color}-600 text-white shadow-md` 
                  : `bg-gray-50 text-gray-600 hover:bg-gray-100`
              }`}
            >
              {cls.name}
              <span className={`text-xs py-0.5 px-1.5 rounded ${activeTabId === cls.id ? 'bg-white/20' : 'bg-gray-200 text-gray-700'}`}>
                {cls.students.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Class Panel */}
      <div className={`bg-white rounded-xl shadow-lg border-t-4 border-${theme}-600 min-h-[500px]`}>
        
        {/* Actions Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col lg:flex-row justify-between items-center gap-4">
          <h3 className={`text-lg font-bold text-${theme}-800 flex items-center gap-2`}>
            <School size={20} />
            {activeClass.name}
          </h3>
          
          <div className="flex gap-3 w-full lg:w-auto items-center flex-wrap">
            {/* Search Box */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث عن طالب..."
                className="w-full pr-9 pl-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              />
            </div>

            {/* Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer active:scale-95"
              disabled={isLoading}
            >
              <FileType size={16} />
              {isLoading ? 'جارٍ الرفع...' : 'رفع Excel'}
            </button>
          </div>
        </div>

        {/* Add Student Input */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <form onSubmit={handleAddStudent} className="flex gap-2">
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="اكتب اسم الطالب الجديد هنا لإضافته..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
            />
            <button 
              type="submit"
              disabled={!newStudentName.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus size={18} />
              إضافة
            </button>
          </form>
        </div>

        {/* Student List */}
        <div className="p-6">
          {activeClass.students.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
              <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <FileText className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-600">القائمة فارغة</h3>
              <p className="text-gray-400 text-sm mt-1">أضف طلاب يدوياً أو قم برفع ملف Excel</p>
            </div>
          ) : filteredStudents.length === 0 ? (
             <div className="text-center py-8 text-gray-500">
               <p>لا توجد نتائج مطابقة للبحث "{searchQuery}"</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredStudents.map((student, index) => {
                const isDeleting = studentToDelete === student;
                const isEditing = editingOriginalName === student;

                return (
                  <div 
                    key={`${activeTabId}-${student}`}
                    className={`group flex items-center justify-between p-3 bg-white border rounded-lg transition ${
                      isDeleting 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                      <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold text-white bg-${activeClass.color}-500 shrink-0`}>
                        {index + 1}
                      </span>
                      
                      {isEditing ? (
                        <input 
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 border border-indigo-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className={`font-medium truncate select-all ${isDeleting ? 'text-red-700' : 'text-gray-700'}`}>
                          {student}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-1 mr-2 relative z-10 items-center">
                      {isEditing ? (
                        // Editing Actions
                        <>
                          <button 
                            type="button"
                            onClick={saveEdit}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition cursor-pointer"
                            title="حفظ"
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            type="button"
                            onClick={cancelEdit}
                            className="p-1.5 text-gray-500 hover:bg-gray-50 rounded transition cursor-pointer"
                            title="إلغاء"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : isDeleting ? (
                        // Deletion Confirmation Actions
                        <>
                           <span className="text-xs text-red-600 font-bold ml-1 hidden sm:inline">تأكيد؟</span>
                           <button 
                            type="button"
                            onClick={confirmDelete}
                            className="p-1.5 bg-red-600 text-white hover:bg-red-700 rounded transition cursor-pointer shadow-sm"
                            title="تأكيد الحذف"
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            type="button"
                            onClick={cancelDelete}
                            className="p-1.5 bg-gray-200 text-gray-600 hover:bg-gray-300 rounded transition cursor-pointer shadow-sm"
                            title="إلغاء"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        // Standard Actions
                        <>
                          <button 
                            type="button"
                            onClick={(e) => startEditing(e, student)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                            title="تعديل"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => initiateDelete(e, student)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentsPage;