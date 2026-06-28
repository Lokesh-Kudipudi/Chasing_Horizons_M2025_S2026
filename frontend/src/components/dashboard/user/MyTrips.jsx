import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaStar, FaPen, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import { API } from "../../../config/api";

const MyTrips = ({ onTripCancel }) => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [_error, setError] = useState(null);
  
  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API.BOOKINGS.LIST, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === "success") {
          setBookings(data.data || []);
        } else {
          setError(data.message || "Failed to load bookings");
        }
      } else {
        setError("Failed to load bookings.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load bookings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    await onTripCancel(bookingId);
    fetchBookings();
  };

  // Review Functions
  const openReviewModal = (booking) => {
    setReviewBooking(booking);
    setRating(5);
    setReviewText("");
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if(!reviewText.trim()) return toast.error("Please write a review!");
    setIsSubmittingReview(true);
    try {
        const response = await fetch(API.REVIEWS.CREATE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                itemId: reviewBooking.itemId._id,
                itemType: reviewBooking.type,
                rating,
                review: reviewText
            })
        });
        const data = await response.json();
        if(data.status === "success") {
            toast.success("Review submitted! Thank you.");
            setShowReviewModal(false);
        } else {
            toast.error(data.message || "Failed to submit review.");
        }
    } catch(err) {
        toast.error(`Something went wrong ${err}`);
    } finally {
        setIsSubmittingReview(false);
    }
  };

  // Helper filters
  const currentDate = new Date();
  currentDate.setHours(0,0,0,0);

  const getStatus = (b) => {
      if(b.bookingDetails?.status === "cancel") return "cancelled";
      const end = b.type === "Tour" ? new Date(b.bookingDetails.endDate) : new Date(b.bookingDetails.checkOut);
      end.setHours(0, 0, 0, 0); // Strip time to ensure "today" is included in upcoming
      return end < currentDate ? "completed" : "upcoming";
  };

  const upcomingBookings = bookings.filter(b => getStatus(b) === "upcoming");
  const pastBookings = bookings.filter(b => getStatus(b) === "completed");

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getGuestCount = (booking) => {
      const details = booking.bookingDetails || {};
      if (typeof details.travelers === 'number') return details.travelers;
      if (typeof details.numGuests === 'number') return details.numGuests;
      if (Array.isArray(details.guests)) return details.guests.length;
      if (Array.isArray(details.numGuests)) return details.numGuests.length;
      return 1;
  };

  const BookingCard = ({ booking, isPast }) => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 group flex flex-col h-full">
        <div className="relative h-48 overflow-hidden">
            <img 
                src={booking.itemId?.mainImage || "/images/placeholder.jpg"} 
                alt={booking.itemId?.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#003366] shadow-sm">
                {booking.type}
            </div>
        </div>
        <div className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
                <div>
                   <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{booking.itemId?.title}</h3>
                   <p className="text-sm text-gray-500 flex items-center gap-1"><FaCalendarAlt className="text-xs" /> {formatDate(booking.bookingDetails?.startDate || booking.bookingDetails?.checkIn)}</p>
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                <span className="font-bold text-[#003366]">₹{(booking.bookingDetails?.price || booking.bookingDetails?.totalPrice || 0).toLocaleString()}</span>
                <span className="text-gray-400">{getGuestCount(booking)} people</span>
            </div>

            <div className="mt-6 flex gap-3">
                {!isPast ? (
                    <>
                    <button onClick={() => navigate(booking.type === "Tour" ? `/tours/${booking.itemId._id}` : `/hotels/hotel/${booking.itemId._id}`)} className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">Details</button>
                    <button onClick={() => handleCancelBooking(booking._id)} className="flex-1 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors">Cancel</button>
                    </>
                ) : (
                    <>
                    <button onClick={() => navigate(booking.type === "Tour" ? `/tours/${booking.itemId._id}` : `/hotels/hotel/${booking.itemId._id}`)} className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">Rebook</button>
                    <button onClick={() => openReviewModal(booking)} className="flex-1 py-2 rounded-xl bg-[#003366] text-white font-bold text-sm hover:bg-blue-900 transition-colors flex items-center justify-center gap-2"><FaStar className="text-yellow-400" /> Review</button>
                    </>
                )}
            </div>
        </div>
    </div>
  );

  if (isLoading) return <div className="p-12 flex justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-gray-100 pb-8">
            <div>
                <h1 className="text-3xl font-serif font-bold text-[#003366]">Your Journeys</h1>
                <p className="text-gray-500">Manage your upcoming adventures and relive past memories.</p>
            </div>
            <button onClick={() => navigate("/")} className="bg-[#003366] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-900 transition-colors">
                + Book New Trip
            </button>
        </div>

        {/* Upcoming */}
        <section>
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"> Upcoming Trips <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{upcomingBookings.length}</span></h2>
            {upcomingBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {upcomingBookings.map(b => <BookingCard key={b._id} booking={b} isPast={false} />)}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-400 mb-4">No upcoming trips. Time to plan one?</p>
                </div>
            )}
        </section>

        {/* Past */}
        <section>
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"> Pasthistory <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{pastBookings.length}</span></h2>
             {pastBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pastBookings.map(b => <BookingCard key={b._id} booking={b} isPast={true} />)}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-400">No travel history yet.</p>
                </div>
            )}
        </section>

        {/* REVIEW MODAL */}
        {showReviewModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
                    <div className="bg-[#003366] p-6 flex justify-between items-center text-white">
                        <h3 className="font-bold text-lg">Rate your experience</h3>
                        <button onClick={() => setShowReviewModal(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20"><FaTimes /></button>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="text-center">
                            <img src={reviewBooking.itemId?.mainImage} alt="Thumb" className="w-20 h-20 rounded-xl object-cover mx-auto mb-4 shadow-md" />
                            <h4 className="font-bold text-gray-900">{reviewBooking.itemId?.title}</h4>
                            <p className="text-sm text-gray-500">How was your stay?</p>
                        </div>

                        <div className="flex justify-center gap-2">
                             {[1,2,3,4,5].map(star => (
                                 <button key={star} onClick={() => setRating(star)} className={`text-3xl transition-transform hover:scale-110 ${rating >= star ? "text-yellow-400" : "text-gray-200"}`}>★</button>
                             ))}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Write a review</label>
                            <textarea 
                                value={reviewText}
                                onChange={e => setReviewText(e.target.value)}
                                className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none resize-none"
                                placeholder="Tell us what you liked..."
                            ></textarea>
                        </div>

                        <button 
                            onClick={submitReview} 
                            disabled={isSubmittingReview}
                            className="w-full bg-[#003366] text-white py-4 rounded-xl font-bold hover:bg-blue-900 transition-colors disabled:opacity-50"
                        >
                            {isSubmittingReview ? "Submitting..." : "Submit Review"}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default MyTrips;
