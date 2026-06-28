import { Link } from "react-router-dom";
import { FaYoutube, FaInstagram, FaFacebookF } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="bg-[#003366] text-white pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        {/* Brand Column */}
        <div>
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            Chasing Horizons
          </h3>
          <p className="text-blue-100/80 text-sm leading-relaxed max-w-xs">
            Embark on unforgettable journeys with us. We craft personalized travel experiences that inspire, connect, and create lasting memories across the globe.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold mb-6 text-white">Quick Links</h4>
          <ul className="space-y-3">
            <li>
              <Link to="/tours" className="text-blue-100/80 hover:text-white transition-colors text-sm">
                Explore Tours
              </Link>
            </li>
            <li>
              <Link to="/hotels" className="text-blue-100/80 hover:text-white transition-colors text-sm">
                Luxury Hotels
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-blue-100/80 hover:text-white transition-colors text-sm">
                Contact Support
              </Link>
            </li>
            <li>
              <Link to="/user/dashboard" className="text-blue-100/80 hover:text-white transition-colors text-sm">
                My Account
              </Link>
            </li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h4 className="text-lg font-semibold mb-6 text-white hover:underline hover:cursor-pointer" onClick={() => navigate("/contact")}>Connect With Us</h4>
          <p className="text-blue-100/80 text-sm mb-4">
            Follow our adventures on social media for daily inspiration.
          </p>
          <div className="flex gap-4">
            <Link
              to="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/10 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-300 group"
            >
              <FaYoutube className="text-xl group-hover:scale-110 transition-transform" />
            </Link>
            <Link
              to="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/10 hover:bg-pink-600 rounded-full flex items-center justify-center transition-all duration-300 group"
            >
              <FaInstagram className="text-xl group-hover:scale-110 transition-transform" />
            </Link>
            <Link
              to="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/10 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 group"
            >
              <FaFacebookF className="text-lg group-hover:scale-110 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10 pt-8 text-center">
        <p className="text-blue-100/60 text-sm">
           {new Date().getFullYear()} Chasing Horizons. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
