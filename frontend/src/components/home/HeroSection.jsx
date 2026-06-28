
export default function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/images/homePage.jpg" 
          alt="Travel Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-white px-4 max-w-4xl animate-fade-in">
        <div className="inline-block px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6 animate-slide-down">
          <span className="text-sm font-semibold tracking-wider"> Your Journey Starts Here</span>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold mb-6 drop-shadow-2xl bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent animate-gradient-x">
          Chasing Horizons
        </h1>
        
        <p className="text-xl md:text-2xl opacity-90 drop-shadow-lg mb-10 font-light">
          Explore, Dream, Achieve.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center flex-wrap animate-slide-up">
          <a 
            href="/tours" 
            className="px-8 py-4 bg-white text-[#003366] rounded-2xl font-bold hover:bg-blue-50 transition-all shadow-2xl hover:scale-105 transform hover:shadow-white/20 flex items-center gap-2"
          >
            ️ Explore Tours
          </a>
          <a 
            href="/hotels" 
            className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-2xl font-bold hover:bg-white/20 transition-all shadow-2xl hover:scale-105 transform flex items-center gap-2"
          >
             Find Hotels
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in-delayed">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
            <div className="text-3xl font-bold mb-1">500+</div>
            <div className="text-sm opacity-80">Destinations</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
            <div className="text-3xl font-bold mb-1">10K+</div>
            <div className="text-sm opacity-80">Happy Travelers</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
            <div className="text-3xl font-bold mb-1">4.9★</div>
            <div className="text-sm opacity-80">Average Rating</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-1">
          <div className="w-1.5 h-3 bg-white/60 rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
