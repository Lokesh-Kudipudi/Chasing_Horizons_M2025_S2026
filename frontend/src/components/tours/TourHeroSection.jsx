const HeroSection = ({ tour }) => {
  return (
    <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
      {/* Background Image with Parallax-like fixed attachment or just cover */}
      <img
        src={tour.mainImage}
        alt={tour.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#003366] via-black/40 to-black/20" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center text-center px-4">
        <div className="max-w-4xl animate-slide-up">
          <div className="flex justify-center gap-3 mb-4">
             {tour.tags && tour.tags.slice(0, 3).map((tag, idx) => (
               <span key={idx} className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wider border border-white/30">
                 {tag}
               </span>
             ))}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg leading-tight">
            {tour.title}
          </h1>
          
          <div className="flex flex-wrap justify-center gap-6 text-white/90 text-lg font-medium">
             <div className="flex items-center gap-2">
                <span> {tour.startLocation}</span>
             </div>
             <div className="flex items-center gap-2">
                <span> {tour.duration}</span>
             </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
};
export default HeroSection;
