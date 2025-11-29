import React, { useState, useEffect } from 'react';
import { Category, StaffMember, StaffFormData } from '../types';
import { X } from 'lucide-react';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StaffFormData) => void;
  initialData?: StaffMember | null;
}

const StaffModal: React.FC<StaffModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<StaffFormData>({
    sortId: 0,
    name: '',
    ministryNumber: '',
    nationalNumber: '',
    jobTitle: '',
    category: Category.TEACHER,
    degree: '',
    qualification: '',
    specialization: '',
    birthDate: '',
    appointmentDate: '',
    workload: 0,
    residence: '',
    phoneNumber: '',
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        sortId: initialData.sortId,
        name: initialData.name,
        ministryNumber: initialData.ministryNumber,
        nationalNumber: initialData.nationalNumber || '',
        jobTitle: initialData.jobTitle,
        category: initialData.category,
        degree: initialData.degree || '',
        qualification: initialData.qualification || '',
        specialization: initialData.specialization || '',
        birthDate: initialData.birthDate || '',
        appointmentDate: initialData.appointmentDate || '',
        workload: initialData.workload || 0,
        residence: initialData.residence || '',
        phoneNumber: initialData.phoneNumber || '',
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        sortId: 0,
        name: '',
        ministryNumber: '',
        nationalNumber: '',
        jobTitle: '',
        category: Category.TEACHER,
        degree: '',
        qualification: '',
        specialization: '',
        birthDate: '',
        appointmentDate: '',
        workload: 0,
        residence: '',
        phoneNumber: '',
        notes: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white sticky top-0 z-10">
          <h2 className="text-xl font-bold">
            {initialData ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الرقم التسلسلي</label>
              <input
                type="number"
                required
                value={formData.sortId || ''}
                onChange={(e) => setFormData({ ...formData, sortId: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الرقم الوزاري</label>
              <input
                type="text"
                required
                value={formData.ministryNumber}
                onChange={(e) => setFormData({ ...formData, ministryNumber: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الرقم الوطني</label>
              <input
                type="text"
                value={formData.nationalNumber || ''}
                onChange={(e) => setFormData({ ...formData, nationalNumber: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الرباعي</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الوظيفة</label>
              <input
                type="text"
                required
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                {Object.values(Category).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المؤهل العلمي</label>
              <input
                type="text"
                value={formData.qualification || ''}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">التخصص</label>
              <input
                type="text"
                value={formData.specialization || ''}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الدرجة</label>
              <input
                type="text"
                value={formData.degree || ''}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الميلاد</label>
              <input
                type="text"
                placeholder="dd/mm/yyyy"
                value={formData.birthDate || ''}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-right"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ التعيين</label>
              <input
                type="text"
                placeholder="dd/mm/yyyy"
                value={formData.appointmentDate || ''}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-right"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">النصاب</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={formData.workload || ''}
                onChange={(e) => setFormData({ ...formData, workload: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">مكان السكن</label>
              <input
                type="text"
                value={formData.residence || ''}
                onChange={(e) => setFormData({ ...formData, residence: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
              <input
                type="text"
                value={formData.phoneNumber || ''}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات إضافية</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-h-[60px]"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-bold"
            >
              حفظ البيانات
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition font-bold"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffModal;