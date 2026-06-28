import { useState, useEffect } from "react";
import { FaCalendarAlt, FaUser, FaEnvelope, FaSearch } from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/shared/DashboardLayout";
import { tourGuideSidebarItems } from "../../components/dashboard/tourGuide/tourGuideSidebarItems";
import { API } from "../../config/api";

export default function TourGuideBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch(API.GUIDE.BOOKINGS, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.status === "success") {
        setBookings(data.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking =>
    booking.tour?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group bookings by start date
  const groupedBookings = Object.values(
    filteredBookings.reduce((acc, booking) => {
      // Ensure we have a start date
      if (!booking.startDate) return acc;
      
      const dateObj = new Date(booking.startDate);
      // Normalize to midnight for grouping
      const dateKey = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime();
      
      if (!acc[dateKey]) {
        acc[dateKey] = { 
          date: dateKey, 
          bookings: [] 
        };
      }
      acc[dateKey].bookings.push(booking);
      return acc;
    }, {})
  ).sort((a, b) => a.date - b.date);

  if (loading) {
    return (
      <DashboardLayout title="Bookings" sidebarItems={tourGuideSidebarItems}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-[#003366] rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Bookings" sidebarItems={tourGuideSidebarItems}>
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="border-b border-gray-100 pb-6">
          <h1 className="text-4xl font-serif font-bold text-[#003366] mb-2 flex items-center gap-3">
            <span className="bg-blue-50 p-2 rounded-xl text-3xl"></span> Tour Bookings
          </h1>
          <p className="text-gray-500 text-lg">View and manage all bookings for your tours.</p>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by tour name, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Bookings</div>
            <div className="text-4xl font-bold text-[#003366]">{bookings.length}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-[2rem] shadow-xl shadow-green-900/20 text-white">
            <div className="text-green-100 text-xs font-bold uppercase tracking-widest mb-2">Confirmed</div>
            <div className="text-4xl font-bold">{bookings.filter(b => b.status === 'confirmed').length}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-[2rem] shadow-xl shadow-yellow-900/20 text-white">
            <div className="text-yellow-100 text-xs font-bold uppercase tracking-widest mb-2">Pending</div>
            <div className="text-4xl font-bold">{bookings.filter(b => b.status === 'pending').length}</div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Revenue</div>
            <div className="text-3xl font-bold text-green-600">₹{bookings.reduce((sum, b) => sum + (b.price || 0), 0).toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Bookings Grid */}
        {filteredBookings.length === 0 ? (
          <div className="bg-gray-50 rounded-[2rem] p-12 text-center border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No bookings found</h3>
            <p className="text-gray-500">
              {bookings.length === 0 ? "You don't have any bookings yet." : "Try adjusting your search."}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {groupedBookings.map((group, groupIdx) => (
              <div key={group.date} className="animate-slide-up" style={{ animationDelay: `${groupIdx * 100}ms` }}>
                {/* Date Header */}
                <div className="flex items-center gap-4 mb-6 sticky top-0 bg-gray-50/95 backdrop-blur-sm p-4 rounded-xl z-20 border border-gray-100 shadow-sm">
                   <div className="bg-[#003366] text-white p-3 rounded-lg shadow-lg min-w-[60px]">
                      <span className="block text-xs font-bold uppercase tracking-wider text-blue-200 text-center">
                        {new Date(group.date).toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="block text-xl font-bold text-center leading-none mt-1">
                        {new Date(group.date).getDate()}
                      </span>
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {new Date(group.date).toLocaleDateString("en-US", { weekday: "long" })}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">
                        {new Date(group.date).getFullYear()} • {group.bookings.length} {group.bookings.length === 1 ? 'Tour' : 'Tours'} Scheduled
                      </p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
                  {group.bookings.map((booking, idx) => (
                    <div
                      key={booking._id}
                      className="bg-white rounded-[2rem] p-6 shadow-lg shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#003366] to-[#0055aa] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-900/20">
                            {booking.user?.fullName?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                              <FaUser size={14} className="text-gray-400" /> {booking.user?.fullName || "Unknown User"}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <FaEnvelope size={12} className="text-blue-400" /> {booking.user?.email}
                            </p>
                          </div>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700 border border-green-200' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                          'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="space-y-3 pt-4 border-t border-gray-100">
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tour</span>
                          <p className="text-sm font-bold text-[#003366] mt-1 line-clamp-1" title={booking.tour?.title}>
                            {booking.tour?.title || "Unknown Tour"}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                              <FaCalendarAlt /> Date
                            </span>
                            <p className="text-sm font-bold text-gray-800 mt-1">
                              {new Date(booking.startDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <span className="text-xs font-bold text-green-600/70 uppercase tracking-widest">Amount</span>
                            <p className="text-sm font-bold text-green-700 mt-1">₹{booking.price?.toLocaleString('en-IN') || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
