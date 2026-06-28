import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../../shared/ConfirmationModal";
import { FaCalendarAlt, FaMapMarkerAlt, FaBed, FaUserFriends, FaCheckCircle, FaTimesCircle, FaClock, FaHotel, FaArrowRight } from "react-icons/fa";
import Invoice from "./Invoice";
import { API } from "../../../config/api";

const HotelBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [_error, setError] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHotelBookings();
  }, []);

  const fetchHotelBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        API.BOOKINGS.LIST,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.status === "success") {
          const hotelBookings = (data.data || []).filter(
            (booking) => booking.type === "Hotel"
          );
          setBookings(hotelBookings);
        } else {
          setError(data.message || "Failed to load hotel bookings");
        }
      } else {
        setError("Failed to load hotel bookings. Please try again later.");
      }
    } catch (err) {
      console.error("Error fetching hotel bookings:", err);
      setError("Failed to load hotel bookings. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelClick = (bookingId) => {
    setBookingToCancel(bookingId);
    setShowCancelModal(true);
  };

  const executeCancelBooking = async () => {
    if (!bookingToCancel) return;
    setShowCancelModal(false);

    try {
      const response = await fetch(
        API.BOOKINGS.CANCEL(bookingToCancel),
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        fetchHotelBookings();
      } else {
        setError(data.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      setError("An error occurred while cancelling the booking");
    }
  };

  // Helper Functions
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const getCheckIn = (b) => b.bookingDetails?.checkInDate || b.bookingDetails?.checkIn || b.bookingDetails?.startDate;
  const getCheckOut = (b) => b.bookingDetails?.checkOutDate || b.bookingDetails?.checkOut || b.bookingDetails?.endDate;

  const getStatus = (booking) => {
      const status = booking?.bookingDetails?.status;
      if (status === "cancel") return "cancelled";
      
      const checkOutStr = getCheckOut(booking);
      if (!checkOutStr) return "upcoming"; // Default if missing

      const checkOut = new Date(checkOutStr);
      checkOut.setHours(0, 0, 0, 0);

      return checkOut < currentDate ? "completed" : "upcoming";
  };

  const upcomingBookings = bookings.filter(b => getStatus(b) === "upcoming");
  const pastBookings = bookings.filter(b => getStatus(b) === "completed");
  const cancelledBookings = bookings.filter(b => getStatus(b) === "cancelled");

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getGuestCount = (booking) => {
      const details = booking.bookingDetails || {};
      if (typeof details.guests === 'number') return details.guests;
      if (typeof details.numGuests === 'number') return details.numGuests;
      if (Array.isArray(details.guests)) return details.guests.length;
      if (Array.isArray(details.numGuests)) return details.numGuests.length;
      return 1;
  };

  // Analytics
  const analytics = {
    total: bookings.filter(b => getStatus(b) !== "cancelled").length,
    upcoming: upcomingBookings.length,
    completed: pastBookings.length,
    cancelled: cancelledBookings.length,
    totalNights: bookings.reduce((sum, b) => {
       if (getStatus(b) !== "cancelled") {
         return sum + calculateNights(getCheckIn(b), getCheckOut(b));
       }
       return sum;
    }, 0),
    totalSpent: bookings.reduce((sum, b) => {
      if (getStatus(b) !== "cancelled") {
        return sum + (b.bookingDetails?.totalPrice || b.bookingDetails?.price || 0);
      }
      return sum;
    }, 0),
  };

  const BookingCard = ({ booking }) => {
    const status = getStatus(booking);
    const isUpcoming = status === "upcoming";
    const nights = calculateNights(getCheckIn(booking), getCheckOut(booking));

    return (
      <div className="bg-white rounded-[2rem] overflow-hidden shadow-lg shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group flex flex-col h-full">
        {/* Image Section */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={booking.itemId?.mainImage || "/images/placeholder.jpg"}
            alt={booking.itemId?.title || "Hotel"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="absolute top-4 right-4">
             {status === 'upcoming' && <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1"><FaClock /> Upcoming</span>}
             {status === 'completed' && <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1"><FaCheckCircle /> Completed</span>}
             {status === 'cancelled' && <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1"><FaTimesCircle /> Cancelled</span>}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col relative">
          <div className="mb-4">
             <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#003366] transition-colors mb-1 line-clamp-1">{booking.itemId?.title || "Hotel Booking"}</h3>
             <p className="text-sm text-gray-500 flex items-center gap-1"><FaMapMarkerAlt className="text-blue-400" /> {booking.itemId?.location || "Location unavailable"}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
             <div className="bg-gray-50 p-3 rounded-2xl">
                <span className="block text-xs text-gray-400 uppercase tracking-wide">Check-in</span>
                <span className="font-bold text-gray-800">{formatDate(getCheckIn(booking))}</span>
             </div>
             <div className="bg-gray-50 p-3 rounded-2xl">
                <span className="block text-xs text-gray-400 uppercase tracking-wide">Check-out</span>
                <span className="font-bold text-gray-800">{formatDate(getCheckOut(booking))}</span>
             </div>
          </div>

          <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-auto">
             <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded-lg"><FaBed className="text-gray-400" /> {nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                <span className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded-lg"><FaUserFriends className="text-gray-400" /> {getGuestCount(booking)}</span>
             </div>
             <div className="font-bold text-[#003366] text-lg">
                ₹{(booking.bookingDetails?.totalPrice || booking.bookingDetails?.price || 0).toLocaleString()}
             </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 absolute bottom-6 inset-x-6 bg-white pt-2">
             <button onClick={() => navigate(`/hotels/hotel/${booking.itemId?._id}`)} className="flex-1 py-3 rounded-xl bg-[#003366] text-white font-bold text-sm hover:bg-blue-900 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
               View Details <FaArrowRight />
             </button>
             {isUpcoming && (
                 <button onClick={() => handleCancelClick(booking._id)} className="px-4 py-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors border border-red-100">
                   Cancel
                 </button>
             )}
             {/* Invoice Button */}
             {(status === "completed" || status === "upcoming") && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInvoiceBooking(booking);
                        setShowInvoiceModal(true);
                    }}
                    className="px-4 py-3 rounded-xl bg-gray-50 text-gray-600 font-bold text-sm hover:bg-gray-100 transition-colors border border-gray-100"
                    title="View Invoice"
                >
                    Invoice
                </button>
             )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative">
             <div className="w-16 h-16 border-4 border-blue-100 border-t-[#003366] rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#003366]">Loading</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-100 pb-8">
            <div>
                <h1 className="text-4xl font-serif font-bold text-[#003366] mb-3 flex items-center gap-3">
                   <span className="bg-blue-50 p-2 rounded-xl text-3xl"></span> Luxury Stays
                </h1>
                <p className="text-gray-500 text-lg max-w-2xl">Manage your hotel reservations. From upcoming getaways to past memorable stays, find everything here.</p>
            </div>
            <button onClick={() => navigate("/hotels")} className="bg-[#003366] text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-900/20 hover:bg-blue-900 hover:scale-105 transition-all flex items-center gap-2">
                <FaHotel /> Book New Stay
            </button>
        </div>

        {/* Stats Row */}
       {!isLoading && bookings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100">
                  <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Bookings</div>
                  <div className="text-4xl font-bold text-[#003366]">{analytics.total}</div>
              </div>
              <div className="bg-gradient-to-br from-[#003366] to-[#0055aa] p-6 rounded-[2rem] shadow-xl shadow-blue-900/20 text-white">
                  <div className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-2">Total Spent</div>
                  <div className="text-4xl font-bold">₹{analytics.totalSpent.toLocaleString()}</div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100">
                  <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Nights Stayed</div>
                  <div className="text-4xl font-bold text-gray-800">{analytics.totalNights}</div>
              </div>
               <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100">
                  <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Next Check-in</div>
                  <div className="text-xl font-bold text-gray-800 truncate">
                      {upcomingBookings.length > 0 ? formatDate(getCheckIn(upcomingBookings[0])) : "No upcoming"}
                  </div>
              </div>
          </div>
       )}

       {/* Bookings Lists */}
       <div className="space-y-16">
           {/* Upcoming Section */}
           <section>
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Upcoming Stays</h2>
                    <span className="bg-blue-100 text-[#003366] px-3 py-1 rounded-full text-sm font-bold">{upcomingBookings.length}</span>
                    <div className="h-px bg-gray-100 flex-1"></div>
                </div>
                
                {upcomingBookings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {upcomingBookings.map((booking, idx) => (
                            <div key={booking._id} className="animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                                <BookingCard booking={booking} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-[2rem] p-12 text-center border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"></div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No upcoming trips</h3>
                        <p className="text-gray-500 mb-6">Time to treat yourself to a luxury getaway?</p>
                        <button onClick={() => navigate("/hotels")} className="text-[#003366] font-bold hover:underline">Explore Hotels</button>
                    </div>
                )}
           </section>

           {/* Past Section */}
           <section>
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 text-opacity-60">Past History</h2>
                    <div className="h-px bg-gray-100 flex-1"></div>
                </div>

                {pastBookings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-80 hover:opacity-100 transition-opacity duration-500">
                        {pastBookings.map((booking) => (
                            <div key={booking._id}>
                                <BookingCard booking={booking} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 italic">No past booking history.</p>
                )}
           </section>
       </div>

       {/* Cancelled Section (Collapsed or Subtle) */}
       {cancelledBookings.length > 0 && (
           <section className="pt-8 border-t border-gray-100">
                <details className="group">
                    <summary className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-600 font-medium list-none">
                       <span>Show {cancelledBookings.length} Cancelled Bookings</span>
                       <span className="group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                         {cancelledBookings.map(booking => (
                             <div key={booking._id} className="grayscale opacity-60">
                                 <BookingCard booking={booking} />
                             </div>
                         ))}
                    </div>
                </details>
           </section>
       )}
       
       {/* Invoice Modal */}
       {showInvoiceModal && selectedInvoiceBooking && (
        <Invoice
          booking={selectedInvoiceBooking}
          onClose={() => {
            setShowInvoiceModal(false);
            setSelectedInvoiceBooking(null);
          }}
        />
      )}
      {showCancelModal && (
        <ConfirmationModal
          isOpen={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
            setBookingToCancel(null);
          }}
          onConfirm={executeCancelBooking}
          title="Cancel Hotel Booking"
          message="Are you sure you want to cancel this booking? This action cannot be undone."
          confirmText="Cancel Booking"
          cancelText="Close"
          type="danger"
        />
      )}
    </div>
  );
};

export default HotelBookings;
