import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/dashboard/shared/DashboardLayout";
import { adminSidebarItems } from "../../components/dashboard/admin/adminSidebarItems";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import BookingFilters from "../../components/admin/BookingFilters";
import AdminStatsGrid from "../../components/admin/AdminStatsGrid";
import BookingsTable from "../../components/admin/BookingsTable";
import BookingDetailsModal from "../../components/admin/BookingDetailsModal";
import ConfirmationModal from "../../components/shared/ConfirmationModal";
import { API } from "../../config/api";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API.ADMIN.BOOKINGS, {
        credentials: "include",
      });
      const data = await response.json();
      
      if (data.status === "success") {
        setBookings(data.data);
      } else {
        toast.error("Failed to load bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Error loading bookings");
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
      const response = await fetch(API.ADMIN.CANCEL_BOOKING(bookingToCancel), {
        method: "POST",
        credentials: "include",
      });
      
      const data = await response.json();
      
      if (data.status === "success") {
        toast.success("Booking cancelled successfully!");
        setSelectedBooking(null);
        fetchBookings();
      } else {
        toast.error(data.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Error cancelling booking");
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === "all") return true;
    return booking.type === filter;
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-[#003366] rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = [
    { label: "Total Bookings", value: bookings.length, bgClass: "bg-white shadow-gray-200/40 border border-gray-100", valueClass: "text-[#003366]" },
    { label: "Hotel Bookings", value: bookings.filter(b => b.type === "Hotel").length, bgClass: "bg-white shadow-gray-200/40 border border-gray-100", valueClass: "text-orange-600" },
    { label: "Tour Bookings", value: bookings.filter(b => b.type === "Tour").length, bgClass: "bg-white shadow-gray-200/40 border border-gray-100", valueClass: "text-blue-600" },
  ];

  return (
    <DashboardLayout title="Bookings Management" sidebarItems={adminSidebarItems}>
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      <AdminPageHeader 
        title="All Bookings" 
        subtitle="View and manage all platform bookings."
        icon=""
      />

      <BookingFilters filter={filter} setFilter={setFilter} />

      <AdminStatsGrid stats={stats} />

      <BookingsTable bookings={filteredBookings} onView={setSelectedBooking} />

      <BookingDetailsModal 
        selectedBooking={selectedBooking} 
        onClose={() => setSelectedBooking(null)} 
        onCancel={handleCancelClick} 
      />

      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setBookingToCancel(null);
        }}
        onConfirm={executeCancelBooking}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Cancel Booking"
        cancelText="Close"
        type="danger"
      />

    </div>
    </DashboardLayout>
  );
};

export default AdminBookings;
