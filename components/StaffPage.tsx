import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, FileText, Calendar, BarChart, Phone, MapPin, GraduationCap } from 'lucide-react';
import { INITIAL_STAFF } from '../constants';
import { StaffMember, StaffFormData, Category } from '../types';
import StaffModal from './StaffModal';
import DashboardStats from './DashboardStats';

const STORAGE_KEY = 'madaba_school_staff_v4';

const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    // Strict Persistence Strategy:
    // If data exists in local storage, use it exclusively.
    // This ensures that user deletions, edits, and additions are preserved 
    // regardless of changes to the underlying INITIAL_STAFF constant in the code.
    if (saved) {
      try {
        const parsedStaff: StaffMember[] = JSON.parse(saved);
        if (Array.isArray(parsedStaff) && parsedStaff.length > 0) {
           return parsedStaff.sort((a, b) => a.sortId - b.sortId);
        }
      } catch (error) {
        console.error('Error parsing stored staff data:', error);
        // Fallback to initial data only on error
        return INITIAL_STAFF;
      }
    }
    
    // First time load: use the seed data
    return INITIAL_STAFF.sort((a, b) => a.sortId - b.sortId);
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(staff));
  }, [staff]);

  const filteredStaff = useMemo(() => {
    return staff.filter(member => {
      const matchesSearch = 
        member.name.includes(searchTerm) || 
        member.ministryNumber.includes(searchTerm) ||
        member.jobTitle.includes(searchTerm);
      
      const matchesCategory = selectedCategory === 'ALL' || member.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    }).sort((a, b) => a.sortId - b.sortId);
  }, [staff, searchTerm, selectedCategory]);

  const handleAddStaff = (data: StaffFormData) => {
    const newMember: StaffMember = {
      ...data,
      id: Date.now().toString()
    };
    setStaff([...staff, newMember]);
  };

  const handleEditStaff = (data: StaffFormData) => {
    if (!editingStaff) return;
    const updatedStaff = staff.map(s => s.id === editingStaff.id ? { ...data, id: s.id } : s);
    setStaff(updatedStaff);
    setEditingStaff(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      setStaff(staff.filter(s => s.id !== id));
    }
  };

  const openEditModal = (member: StaffMember) => {
    setEditingStaff(member);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-6 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">إدارة الكادر المدرسي</h2>
           <p className="text-gray-500 text-sm mt-1">عرض وتعديل بيانات المعلمين والإداريين والمستخدمين</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-yellow-500 hover:bg-yellow-600 text-indigo-900 px-5 py-2 rounded-lg font-bold transition shadow-md flex items-center gap-2 text-sm"
        >
          <Plus size={18} />
          إضافة موظف
        </button>
      </div>
      
      {/* Stats */}
      <DashboardStats staff={staff} />

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 sticky top-2 z-10">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="بحث بالاسم، الرقم الوزاري، أو الوظيفة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          <button 
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition text-sm ${selectedCategory === 'ALL' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            الكل
          </button>
          <button 
            onClick={() => setSelectedCategory(Category.ADMIN)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition text-sm ${selectedCategory === Category.ADMIN ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            الإداريون
          </button>
          <button 
            onClick={() => setSelectedCategory(Category.TEACHER)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition text-sm ${selectedCategory === Category.TEACHER ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            المعلمون
          </button>
          <button 
            onClick={() => setSelectedCategory(Category.EMPLOYEE)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition text-sm ${selectedCategory === Category.EMPLOYEE ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            المستخدمون
          </button>
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[1200px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 text-sm font-bold text-gray-700 w-12 text-center">#</th>
                <th className="py-3 px-4 text-sm font-bold text-gray-700">الاسم</th>
                <th className="py-3 px-4 text-sm font-bold text-gray-700">الرقم الوطني</th>
                <th className="py-3 px-4 text-sm font-bold text-gray-700">الوظيفة</th>
                <th className="py-3 px-4 text-sm font-bold text-gray-700">المؤهل</th>
                <th className="py-3 px-4 text-sm font-bold text-gray-700">التخصص</th>
                <th className="py-3 px-4 text-sm font-bold text-gray-700">تاريخ التعيين</th>
                <th className="py-3 px-4 text-sm font-bold text-gray-700">النصاب</th>
                <th className="py-3 px-4 text-sm font-bold text-gray-700">السكن والهاتف</th>
                <th className="py-3 px-4 text-sm font-bold text-gray-700 text-left pl-6">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStaff.length > 0 ? (
                filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-indigo-50/30 transition group">
                    <td className="py-3 px-4 text-center font-mono text-sm text-gray-500">{member.sortId}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-bold text-gray-900">{member.name}</div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">{member.ministryNumber}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-sm text-gray-600">{member.nationalNumber || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col items-start gap-1">
                         <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                           {member.jobTitle}
                         </div>
                         {member.degree && <span className="text-[10px] text-gray-500">الدرجة: {member.degree}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                       {member.qualification ? (
                         <div className="flex items-center gap-1 text-sm text-gray-700">
                            <GraduationCap size={14} className="text-indigo-400" />
                            {member.qualification}
                         </div>
                       ) : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{member.specialization || '-'}</td>
                    <td className="py-3 px-4">
                      {member.appointmentDate ? (
                         <div className="flex items-center gap-1 text-sm text-gray-700">
                            <Calendar size={14} className="text-gray-400" />
                            {member.appointmentDate}
                         </div>
                       ) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {member.category === Category.TEACHER && member.workload ? (
                        <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold w-fit mx-auto">
                           <BarChart size={12} />
                           {member.workload} حصة
                        </div>
                      ) : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        {member.residence && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <MapPin size={12} /> {member.residence}
                          </div>
                        )}
                        {member.phoneNumber && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                             <Phone size={12} /> {member.phoneNumber}
                          </div>
                        )}
                        {!member.residence && !member.phoneNumber && <span className="text-gray-300">-</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 pl-6 text-left">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(member)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="تعديل"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(member.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="حذف"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="bg-gray-100 p-3 rounded-full">
                        <FileText size={24} className="text-gray-400" />
                      </div>
                      <p>لا توجد بيانات مطابقة للبحث</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingStaff ? handleEditStaff : handleAddStaff}
        initialData={editingStaff}
      />
    </div>
  );
};

export default StaffPage;