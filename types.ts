import React from 'react';

export enum Category {
  ADMIN = 'الإداريون',
  TEACHER = 'المعلمون',
  EMPLOYEE = 'المستخدمون'
}

export interface StaffMember {
  id: string;
  sortId: number;
  ministryNumber: string; // الرقم الوزاري
  nationalNumber?: string; // الرقم الوطني (New)
  name: string;
  jobTitle: string;
  category: Category;
  degree?: string; // الدرجة (New)
  qualification?: string; // المؤهل العلمي (New)
  specialization?: string; // التخصص (New)
  birthDate?: string; // تاريخ الميلاد (New)
  appointmentDate?: string; // تاريخ التعيين
  workload?: number; // النصاب
  residence?: string; // مكان السكن (New)
  phoneNumber?: string; // رقم الهاتف (New)
  notes?: string;
}

export type StaffFormData = Omit<StaffMember, 'id'>;

export interface ClassSection {
  id: string;
  name: string;
  gradeLevel: string; // "11" or "12"
  color: string;      // Tailwind color class base
  students: string[]; // Array of student names
}

// New Interface for Gallery Images
export interface GalleryImage {
  id: string;
  title: string;
  category: string;
  dataUrl: string; // Base64 string of the image
  dateAdded: string;
}
