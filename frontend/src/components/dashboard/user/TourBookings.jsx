import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../../shared/ConfirmationModal";
import { FaMapMarkedAlt, FaCalendarAlt, FaRoute, FaMountain, FaClock, FaCheckCircle, FaTimesCircle, FaArrowRight, FaGlobeAmericas } from "react-icons/fa";
import Invoice from "./Invoice";
import { API } from "../../../config/api";

const TourBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [_error, setError] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [isCustomRequestToCancel, setIsCustomRequestToCancel] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTourBookings();
  }, []);

  const fetchTourBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Parallel fetch for standard bookings and custom tours
      const [bookingsResponse, customResponse] = await Promise.all([
         fetch(API.BOOKINGS.LIST, { method: "GET", credentials: "include", headers: { Accept: "application/json" } }),
         fetch(API.CUSTOM_TOURS.LIST, { method: "GET", credentials: "include" })
      ]);

      const bookingsData = await bookingsResponse.json();
      const customData = await customResponse.json();
      
      let combinedBookings = [];

      // Process Standard Bookings
      if (bookingsResponse.ok && bookingsData.status === "success") {
        combinedBookings = (bookingsData.data || []).filter(b => b.type === "Tour");
      }

      // Process Custom Tours -> Normalize to Booking Structure
      if (customResponse.ok && (customData.status === "success" || Array.isArray(customData))) {
          const customTours = Array.isArray(customData) ? customData : (customData.data || []);
          
          // Only show ACCEPTED custom tours in the main bookings list
          const acceptedCustomTours = customTours.filter(ct => ct.status === 'accepted');

          const normalizedCustomTours = acceptedCustomTours.map(ct => {
               // Calculate duration
               const start = new Date(ct.travelDates?.startDate);
               const end = new Date(ct.travelDates?.endDate);
               const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
               
               // Get price (accepted quote or budget)
               const price = ct.status === 'accepted' && ct.quotes 
                    ? ct.quotes.find(q => q._id === ct.acceptedQuote)?.amount 
                    : ct.budget;

               return {
                   _id: ct._id,
                   type: "Custom",
                   itemId: {
                       _id: ct._id,
                       title: `Custom: ${ct.title || ct.places?.[0] || 'Adventure'}`,
                       startLocation: ct.places?.[0] || 'Custom Location',
                       destinations: ct.places || [],
                       mainImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2621&auto=format&fit=crop", // Generic travel image
                       duration: `${days} Days`,
                       itinerary: new Array(days).fill({}) // Mock for count
                   },
                   bookingDetails: {
                       startDate: ct.travelDates?.startDate,
                       endDate: ct.travelDates?.endDate,
                       status: ct.status, // "pending", "accepted", "cancelled", "rejected"
                       price: price,
                       numGuests: ct.numPeople || ct.groupSize,
                       checkInDate: ct.travelDates?.startDate // Consistency fallback
                   },
                   isCustom: true // Flag
               };
          });
          combinedBookings = [...combinedBookings, ...normalizedCustomTours];
      }
      
      setBookings(combinedBookings);

    } catch (err) {
      console.error("Error fetching tour bookings:", err);
      setError("Failed to load tour bookings. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelClick = (bookingId, isCustom) => {
    setBookingToCancel(bookingId);
    setIsCustomRequestToCancel(isCustom);
    setShowCancelModal(true);
  };

  const executeCancelBooking = async () => {
    if (!bookingToCancel) return;
    setShowCancelModal(false);
    const isCustom = isCustomRequestToCancel;
    const bookingId = bookingToCancel;

    try {
      const url = isCustom 
           ? API.CUSTOM_TOURS.CANCEL(bookingId)
           : API.BOOKINGS.CANCEL(bookingId);
      
      if (isCustom) {
           alert("Please manage custom requests from the dedicated Requests page."); // Placeholder safety
           return;
      }

      const response = await fetch(url, {
          method: "POST",
          credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        fetchTourBookings();
      } else {
        setError(data.message || "Failed to cancel booking");
      }
    } catch (error) {
       console.error(error);
       setError("Error cancelling.");
    }
  };

  // Helper Functions
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const getStatus = (booking) => {
      let status = booking?.bookingDetails?.status?.toLowerCase();
      
      // Explicit status overrides
      if (status === "cancel" || status === "cancelled" || status === "rejected") return "cancelled";
      if (status === "complete" || status === "completed") return "completed";
      
      // If status implies active, treat as upcoming/active regardless of date (mostly)
      // or we can say checkedIn is essentially active/upcoming until checkout/complete.
      if (status === "checkedin" || status === "booked") return "upcoming";

      const endDateStr = booking?.bookingDetails?.endDate;
      if (!endDateStr) return "upcoming"; 

      const endDate = new Date(endDateStr);
      endDate.setHours(0, 0, 0, 0);

      // Fallback to date logic if status is pending or unclear
      // But if user marked it complete, we returned above.
      return endDate < currentDate ? "completed" : "upcoming";
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

 const getGuestCount = (booking) => {
      const details = booking.bookingDetails || {};
      if (typeof details.numGuests === 'number') return details.numGuests;
      if (typeof details.travelers === 'number') return details.travelers;
      if (Array.isArray(details.guests)) return details.guests.length;
      if (Array.isArray(details.numGuests)) return details.numGuests.length;
      if (details.numPeople) return details.numPeople;
      return 1;
  };

  // Analytics
  const analytics = {
    total: bookings.filter(b => getStatus(b) !== "cancelled").length,
    upcoming: upcomingBookings.length,
    completed: pastBookings.length,
    totalSpent: bookings.reduce((sum, b) => {
      if (getStatus(b) !== "cancelled") {
        return sum + (b.bookingDetails?.price || b.itemId?.price?.amount || 0);
      }
      return sum;
    }, 0),
    uniqueDestinations: new Set(bookings.filter(b => b.itemId?.startLocation).map(b => b.itemId.startLocation)).size,
    totalDays: bookings.reduce((sum, b) => {
         if(getStatus(b) !== "cancelled") {
             const days = typeof b.itemId?.duration === 'string' ? parseInt(b.itemId.duration) : (b.itemId?.itinerary?.length || 0);
             return sum + days;
         }
         return sum;
    }, 0)
  };

  const BookingCard = ({ booking }) => {
    const status = getStatus(booking);
    const isUpcoming = status === "upcoming";
    const duration = booking.itemId?.duration || (booking.itemId?.itinerary?.length || 0) + " Days";

    return (
      <div className={`bg-white rounded-[2rem] overflow-hidden shadow-lg shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group flex flex-col h-full ${booking.isCustom ? 'ring-2 ring-green-100' : ''}`}>
        {/* Image */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={booking.itemId?.mainImage || "/images/placeholder.jpg"}
            alt={booking.itemId?.title || "Tour"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
           <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
             {booking.isCustom && <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">Custom</span>}
             {status === 'upcoming' && <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1"><FaClock /> Upcoming</span>}
             {status === 'completed' && <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1"><FaCheckCircle /> Completed</span>}
             {status === 'cancelled' && <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1"><FaTimesCircle /> Cancelled</span>}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col relative">
           <div className="mb-4">
             <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#003366] transition-colors mb-1 line-clamp-1">{booking.itemId?.title || "Tour Adventure"}</h3>
             <p className="text-sm text-gray-500 flex items-center gap-1"><FaMapMarkedAlt className="text-blue-400" /> {booking.itemId?.startLocation || "Start location unavailable"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
             <div className="bg-gray-50 p-3 rounded-2xl">
                <span className="block text-xs text-gray-400 uppercase tracking-wide">Start Date</span>
                <span className="font-bold text-gray-800">{formatDate(booking.bookingDetails?.startDate)}</span>
             </div>
              <div className="bg-gray-50 p-3 rounded-2xl">
                <span className="block text-xs text-gray-400 uppercase tracking-wide">Duration</span>
                <span className="font-bold text-gray-800">{duration}</span>
             </div>
          </div>

          <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-auto">
             <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded-lg"><FaRoute className="text-gray-400" /> {booking.itemId?.destinations?.length || 0} stops</span>
                 <span className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded-lg"> {getGuestCount(booking)}</span>
             </div>
             <div className="font-bold text-[#003366] text-lg">
                ₹{(booking.bookingDetails?.price || 0).toLocaleString()}
             </div>
          </div>

           {/* Actions */}
           <div className="mt-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 absolute bottom-6 inset-x-6 bg-white pt-2">
             <button onClick={() => navigate(booking.isCustom ? `/my-custom-requests` : `/tours/${booking.itemId?._id}`)} className="flex-1 py-3 rounded-xl bg-[#003366] text-white font-bold text-sm hover:bg-blue-900 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
               {booking.isCustom ? 'View Request' : 'View Tour'} <FaArrowRight />
             </button>
              {isUpcoming && (
                  <button onClick={() => handleCancelClick(booking._id, booking.isCustom)} className="px-4 py-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors border border-red-100">
                    Cancel
                  </button>
              )}
             {/* Invoice Button */}
             {(status === "completed" || status === "upcoming") && !booking.isCustom && (
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
                   <span className="bg-blue-50 p-2 rounded-xl text-3xl">️</span> My Adventures
                </h1>
                <p className="text-gray-500 text-lg max-w-2xl">Manage your guided tours. Track your upcoming expeditions and relive past journeys.</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => navigate("/my-custom-requests")} className="bg-white text-[#003366] border border-[#003366] px-6 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all flex items-center gap-2">
                  View Custom Requests
              </button>
              <button onClick={() => navigate("/tours")} className="bg-[#003366] text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-900/20 hover:bg-blue-900 hover:scale-105 transition-all flex items-center gap-2">
                  <FaGlobeAmericas /> Explore Tours
              </button>
            </div>
        </div>

        {/* Stats */}
        {!isLoading && bookings.length > 0 && (
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100">
                  <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Tours</div>
                  <div className="text-4xl font-bold text-[#003366]">{analytics.total}</div>
                </div>
                <div className="bg-gradient-to-br from-[#003366] to-[#0055aa] p-6 rounded-[2rem] shadow-xl shadow-blue-900/20 text-white">
                  <div className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-2">Total Invested</div>
                  <div className="text-4xl font-bold">₹{analytics.totalSpent.toLocaleString()}</div>
                </div>
                 <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100">
                  <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Locations</div>
                  <div className="text-4xl font-bold text-[#003366]">{analytics.uniqueDestinations}</div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100">
                  <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Days Traveled</div>
                  <div className="text-4xl font-bold text-[#003366]">{analytics.totalDays}</div>
                </div>
             </div>
        )}

        {/* Bookings Lists */}
        <div className="space-y-16">
            {/* Upcoming Section */}
           <section>
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Upcoming Adventures</h2>
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
                         <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">️</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No upcoming tours</h3>
                        <p className="text-gray-500 mb-6">Ready to climb a mountain or explore a new city?</p>
                        <button onClick={() => navigate("/tours")} className="text-[#003366] font-bold hover:underline">Browse Catalogue</button>
                    </div>
                )}
           </section>

            {/* Past Section */}
           <section>
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 text-opacity-60">Past Expeditions</h2>
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
                    <p className="text-gray-400 italic">No past tour history.</p>
                )}
           </section>
        </div>
        
         {/* Cancelled Section */}
       {cancelledBookings.length > 0 && (
           <section className="pt-8 border-t border-gray-100">
                <details className="group">
                    <summary className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-600 font-medium list-none">
                       <span>Show {cancelledBookings.length} Cancelled Tours</span>
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
        />)}
      {showCancelModal && (
        <ConfirmationModal
          isOpen={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
            setBookingToCancel(null);
          }}
          onConfirm={executeCancelBooking}
          title={`Cancel ${isCustomRequestToCancel ? 'Custom Request' : 'Tour Booking'}`}
          message={`Are you sure you want to cancel this ${isCustomRequestToCancel ? 'custom request' : 'booking'}? This action cannot be undone.`}
          confirmText="Cancel"
          cancelText="Close"
          type="danger"
        />
      )}
    </div>
  );
};

export default TourBookings;
