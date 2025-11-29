import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Plus, Trash2, Tag, Calendar, X, UploadCloud, Filter } from 'lucide-react';
import { GalleryImage } from '../types';
import { db } from '../utils/db';

const categories = ['فعاليات', 'حفلات', 'صور تثقيفية', 'مرافق المدرسة', 'نشاطات طلابية', 'أخرى'];

const PhotosPage: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('الكل');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(categories[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load images from IndexedDB on mount
  useEffect(() => {
    const loadImages = async () => {
      try {
        const storedImages = await db.getAllImages();
        setImages(storedImages);
      } catch (error) {
        console.error("Failed to load images from DB", error);
      } finally {
        setLoading(false);
      }
    };
    loadImages();
  }, []);

  // Handle File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 10MB Limit calculation (10 * 1024 * 1024)
      if (file.size > 10 * 1024 * 1024) { 
        alert('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 10 ميجابايت.');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !previewUrl) return;

    const newImage: GalleryImage = {
      id: Date.now().toString(),
      title: newTitle,
      category: newCategory,
      dataUrl: previewUrl,
      dateAdded: new Date().toLocaleDateString('ar-JO')
    };

    try {
      await db.addImage(newImage);
      // Update local state to reflect change immediately
      setImages([newImage, ...images]);
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save image", error);
      alert("حدث خطأ أثناء حفظ الصورة. قد تكون المساحة ممتلئة.");
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewCategory(categories[0]);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
      try {
        await db.deleteImage(id);
        setImages(images.filter(img => img.id !== id));
      } catch (error) {
        console.error("Failed to delete image", error);
        alert("حدث خطأ أثناء حذف الصورة.");
      }
    }
  };

  const filteredImages = activeCategory === 'الكل' 
    ? images 
    : images.filter(img => img.category === activeCategory);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ImageIcon className="text-indigo-600" />
            الصور
          </h2>
          <p className="text-gray-500 text-sm mt-1">أرشيف صور المدرسة والفعاليات (مساحة تخزين عالية)</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold transition shadow-md flex items-center gap-2"
        >
          <Plus size={20} />
          إضافة صورة جديدة
        </button>
      </div>

      {/* Categories / Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveCategory('الكل')}
          className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition text-sm flex items-center gap-2 ${
            activeCategory === 'الكل' 
              ? 'bg-gray-800 text-white shadow-md' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Filter size={14} />
          الكل
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition text-sm ${
              activeCategory === cat 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {loading ? (
         <div className="py-20 text-center text-gray-500">جاري تحميل الصور...</div>
      ) : filteredImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <ImageIcon size={40} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-600">لا توجد صور لعرضها</h3>
          <p className="text-gray-400 text-sm mt-1">
            {activeCategory === 'الكل' ? 'ابدأ بإضافة صور للمعرض' : 'لا توجد صور في هذا التصنيف'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image) => (
            <div key={image.id} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              {/* Image Container */}
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                <img 
                  src={image.dataUrl} 
                  alt={image.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => handleDelete(image.id)}
                    className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition transform scale-0 group-hover:scale-100"
                    title="حذف الصورة"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm">
                  {image.category}
                </div>
              </div>
              
              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-800 text-lg mb-2 truncate">{image.title}</h3>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {image.dateAdded}
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag size={14} />
                    {image.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-bounce-in">
            <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg">إضافة صورة جديدة</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Image Upload Area */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  previewUrl ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  accept="image/*" 
                  className="hidden" 
                />
                {previewUrl ? (
                  <div className="relative group">
                    <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-sm" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                      <p className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full">تغيير الصورة</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-gray-500">
                    <div className="bg-indigo-100 p-4 rounded-full text-indigo-600">
                      <UploadCloud size={32} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-700">اضغط هنا لاختيار صورة</p>
                      <p className="text-xs mt-1">JPG, PNG (الحد الأقصى 10 ميجابايت)</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الصورة</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: حفل تكريم الأوائل"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className={`text-sm py-2 px-3 rounded-lg border transition ${
                        newCategory === cat 
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' 
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedFile || !newTitle}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                حفظ الصورة
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotosPage;