import { FaMapMarkerAlt } from "react-icons/fa";

const HotelHero = ({ hotel }) => {
  return (
    <div className="relative h-[85vh] w-full overflow-hidden mt-16 group">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img 
          src={hotel.mainImage} 
          alt="Hero" 
          className="w-full h-full object-cover transform transition-transform duration-[10s] ease-out scale-100 group-hover:scale-110" 
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end pb-20 px-8 max-w-7xl mx-auto">
           <div className="animate-slide-up bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 max-w-3xl">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                 {"".repeat(Math.round(hotel.rating || 0))}
                 <span className="text-white text-sm font-medium tracking-wide ml-2 bg-white/20 px-2 py-0.5 rounded-full">{hotel.rating} Excellent</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight tracking-tight drop-shadow-lg">{hotel.title}</h1>
              <p className="flex items-center gap-2 text-xl text-white/90 font-light"><FaMapMarkerAlt /> {hotel.location}</p>
           </div>
        </div>
    </div>
  );
};

export default HotelHero;
