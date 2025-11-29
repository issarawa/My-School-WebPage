import React, { useState, useEffect } from 'react';
import { Eye, Star, ThumbsUp, Heart, Smile, Meh, Frown, HeartCrack } from 'lucide-react';

const AssessmentPage: React.FC = () => {
  // --- Visitor Counter Logic ---
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    const storedCount = localStorage.getItem('madaba_school_visitors');
    let count = storedCount ? parseInt(storedCount) : 0;
    setVisitorCount(count);
  }, []);

  // --- Rating Logic ---
  const [rating, setRating] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Animation State
  const [particles, setParticles] = useState<{id: number, left: number, delay: number, duration: number, scale: number}[]>([]);
  const [particleType, setParticleType] = useState<'heart' | 'broken'>('heart');

  useEffect(() => {
    const savedRating = localStorage.getItem('madaba_school_rating');
    if (savedRating) {
      setRating(parseInt(savedRating));
      setHasVoted(true);
    }
  }, []);

  const handleRate = (value: number) => {
    if (isSubmitting || hasVoted) return;

    setIsSubmitting(true);
    setProgress(0);

    // Simulate download/upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(prev + Math.floor(Math.random() * 5) + 2, 99); 
      });
    }, 50);

    // Finish after 1.5 seconds
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      
      // Trigger Particles Animation before showing success message
      setParticleType(value >= 3 ? 'heart' : 'broken');
      const newParticles = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100, // Random horizontal position 0-100%
        delay: Math.random() * 0.5, // Random delay
        duration: 1 + Math.random() * 1.5, // Random duration 1-2.5s
        scale: 0.5 + Math.random() * 0.8 // Random size
      }));
      setParticles(newParticles);

      // Clear particles after animation
      setTimeout(() => setParticles([]), 3000);

      // Small delay at 100% before showing success
      setTimeout(() => {
        setRating(value);
        setHasVoted(true);
        setIsSubmitting(false);
        localStorage.setItem('madaba_school_rating', value.toString());
      }, 300);
    }, 1500);
  };

  const emojis = [
    { id: 1, icon: <Frown size={40} />, label: 'غير راضٍ', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
    { id: 2, icon: <Meh size={40} />, label: 'حيادي', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
    { id: 3, icon: <Smile size={40} />, label: 'جيد', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    { id: 4, icon: <ThumbsUp size={40} />, label: 'ممتاز', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
    { id: 5, icon: <Heart size={40} />, label: 'رائع جداً', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(0.5);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translateY(-200px) scale(1.2);
            opacity: 0;
          }
        }
        .particle {
          position: absolute;
          bottom: 0;
          pointer-events: none;
          animation-name: floatUp;
          animation-timing-function: ease-out;
          z-index: 50;
        }
      `}</style>

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 text-white shadow-md relative overflow-hidden flex items-center">
        <div className="absolute right-0 top-0 h-full w-2 bg-yellow-500"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-inner">
            <Star size={32} className="text-yellow-400" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold mb-1">التقييم ورضا الزوار</h2>
            <p className="text-gray-300 text-sm md:text-base font-medium">رأيك يهمنا لتطوير خدماتنا الإلكترونية</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Rating Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 flex flex-col items-center justify-center text-center min-h-[350px] relative overflow-hidden">
          
          {/* Particles Container */}
          {particles.length > 0 && (
            <div className="absolute inset-0 pointer-events-none w-full h-full overflow-hidden">
              {particles.map((p) => (
                <div
                  key={p.id}
                  className="particle"
                  style={{
                    left: `${p.left}%`,
                    animationDelay: `${p.delay}s`,
                    animationDuration: `${p.duration}s`,
                    fontSize: `${p.scale}rem`
                  }}
                >
                  {particleType === 'heart' ? (
                    <Heart className="fill-rose-500 text-rose-500" size={24} />
                  ) : (
                    <HeartCrack className="text-gray-400 fill-gray-200" size={24} />
                  )}
                </div>
              ))}
            </div>
          )}

          <h3 className="text-2xl font-bold text-gray-800 mb-2 relative z-10">ما مدى رضاك عن الموقع؟</h3>
          
          {isSubmitting ? (
             <div className="w-full max-w-sm mt-8 animate-fade-in relative z-10">
                <div className="flex justify-between text-sm text-gray-500 mb-2 font-bold">
                  <span>جاري تسجيل تقييمك...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner border border-gray-200">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-75 ease-out flex items-center justify-center relative overflow-hidden"
                    style={{ width: `${progress}%` }}
                  >
                    {/* Striped animation effect */}
                    <div className="absolute inset-0 bg-white/20 w-full h-full" 
                         style={{ 
                           backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)',
                           backgroundSize: '1rem 1rem'
                         }}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4 animate-pulse">شكراً لمشاركتك رأيك</p>
             </div>
          ) : !hasVoted ? (
            <>
              <p className="text-gray-500 mb-8 relative z-10">اختر الوجه الذي يعبر عن تجربتك</p>
              <div className="flex flex-wrap justify-center gap-4 mb-8 relative z-10">
                {emojis.map((item) => {
                  const isActive = rating === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleRate(item.id)}
                      disabled={isSubmitting}
                      className={`group relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300 transform 
                        ${isActive 
                          ? `${item.bg} ${item.border} border-2 scale-110 shadow-lg ring-2 ring-offset-2 ring-${item.color.split('-')[1]}-300` 
                          : 'bg-gray-50 border border-gray-100 hover:scale-105 hover:bg-gray-100 hover:shadow-md'
                        }
                      `}
                    >
                      <div className={`transition-colors duration-300 ${isActive ? item.color : 'text-gray-400 group-hover:text-gray-600'}`}>
                        {item.icon}
                      </div>
                      <span className={`text-xs font-bold transition-colors ${isActive ? item.color : 'text-gray-400'}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="w-full bg-green-50 border border-green-100 rounded-xl p-6 animate-bounce-in mt-4 relative z-10">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                <Heart className="fill-green-600" size={32} />
              </div>
              <h4 className="text-xl font-bold text-green-800 mb-2">شكراً لك!</h4>
              <p className="text-green-700 font-medium">
                تم استلام تقييمك بنجاح. نقدر مساهمتك في تحسين الموقع.
              </p>
            </div>
          )}
        </div>

        {/* Visitor Counter Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 flex flex-col items-center justify-center relative overflow-hidden">
           {/* Decorative Background */}
           <div className="absolute inset-0 bg-indigo-50/50 opacity-50 pattern-dots"></div>
           
           <h3 className="text-xl font-bold text-gray-800 mb-8 relative z-10">إحصائيات الزوار</h3>

           <div className="relative group cursor-default z-10">
            {/* Glowing Effect Background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            
            {/* Circular Card */}
            <div className="relative w-48 h-48 bg-white rounded-full flex flex-col items-center justify-center shadow-xl border-4 border-indigo-50 transition-transform duration-300 transform group-hover:scale-105">
              
              {/* Straight Text */}
              <p className="text-indigo-900 font-bold mb-2 text-sm">عدد زوار الموقع</p>
  
              <div className="bg-indigo-50 p-3 rounded-full mb-2 text-indigo-600 z-10">
                <Eye size={24} />
              </div>
              <div className="text-4xl font-black text-gray-800 tabular-nums z-10">
                {visitorCount.toLocaleString()}
              </div>
              
              {/* Active Indicator */}
              <div className="absolute bottom-2 flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full border border-green-100 z-10">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                 <span className="text-[10px] text-green-700 font-bold">متصل الآن</span>
              </div>
            </div>
          </div>
          
          <p className="mt-8 text-sm text-gray-500 text-center relative z-10 max-w-xs">
            يتم تحديث عدد الزوار بشكل دوري لضمان دقة الإحصائيات ومتابعة التفاعل مع الموقع.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AssessmentPage;