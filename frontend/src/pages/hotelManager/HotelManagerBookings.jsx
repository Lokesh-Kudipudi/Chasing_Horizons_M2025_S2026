import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/dashboard/shared/DashboardLayout";
import { hotelManagerSidebarItems } from "../../components/dashboard/hotelManager/hotelManagerSidebarItems.jsx";
import toast from "react-hot-toast";
import { API } from "../../config/api";

// Components
import BookingStats from "../../components/hotelmanager/BookingStats";
import BookingFilters from "../../components/hotelmanager/BookingFilters";
import BookingCard from "../../components/hotelmanager/BookingCard";
import BookingDetailsModal from "../../components/hotelmanager/BookingDetailsModal";
import AssignRoomModal from "../../components/hotelmanager/AssignRoomModal";
import CancelBookingModal from "../../components/hotelmanager/CancelBookingModal";
import EmptyState from "../../components/hotelmanager/EmptyState";

export default function HotelManagerBookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Room Assignment State
  const [rooms, setRooms] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningBooking, setAssigningBooking] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState("");

  // Cancel Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);

    const filterBookings = useCallback(() => {
    let result = [...bookings];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (b) =>
          b.userId?.fullName?.toLowerCase().includes(term) ||
          b._id.toLowerCase().includes(term) ||
          b.userId?.email?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (b) => b.bookingDetails?.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      result = result.filter((b) => {
        const bookingDate = new Date(b.createdAt);
        if (dateFilter === "today") return bookingDate >= today;
        if (dateFilter === "week") {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return bookingDate >= weekAgo;
        }
        if (dateFilter === "month") {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return bookingDate >= monthAgo;
        }
        return true;
      });
    }

    setFilteredBookings(result);
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  useEffect(() => {
    fetchBookings();
    fetchRooms();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [filterBookings]);

  const fetchBookings = async () => {
    try {
      const response = await fetch(API.MANAGER.BOOKINGS, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.bookings) {
        setBookings(data.bookings);
        setFilteredBookings(data.bookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch(API.HOTELS.ROOMS, { credentials: "include" });
      const data = await response.json();
      if (data.status === "success") {
        setRooms(data.data);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };    

  const handleAssignClick = (booking) => {
      setAssigningBooking(booking);
      setSelectedRoomId(booking.assignedRoomId || "");
      setShowAssignModal(true);
  };

  const confirmAssignment = async () => {
      if (!selectedRoomId) return toast.error("Please select a room");
      
      try {
          const response = await fetch(API.HOTELS.ASSIGN_ROOM(assigningBooking._id), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ roomId: selectedRoomId })
          });
          const data = await response.json();
          
          if(data.status === "success") {
              toast.success("Room assigned successfully");
              setShowAssignModal(false);
              setAssigningBooking(null);
              fetchBookings(); // Refresh bookings to show assigned status/room
              fetchRooms(); // Refresh rooms to update status
          } else {
              toast.error(data.message || "Assignment failed");
          }
      } catch (error) {
          toast.error(`Error assigning room : ${error}`);
      }
  };



  const handleStatusUpdate = async (bookingId, newStatus) => {
      try {
           const response = await fetch(API.BOOKINGS.STATUS(bookingId), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status: newStatus })
           });
           const data = await response.json();
           
           if(data.status === "success") {
               toast.success(`Booking ${newStatus} successfully`);
               fetchBookings();
           } else {
               toast.error(data.message || "Update failed");
           }
      } catch (error) {
          console.error(error);
          toast.error("Error updating status");
      }
  };

  const handleCancelClick = (bookingId) => {
    setCancellingBookingId(bookingId);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!cancellingBookingId) return;

    try {
      const response = await fetch(API.BOOKINGS.CANCEL(cancellingBookingId), {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (data.status === "success") {
        fetchBookings();
        toast.success("Booking cancelled successfully");
        setShowCancelModal(false);
      } else {
        toast.error(data.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Error cancelling booking");
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Bookings" sidebarItems={hotelManagerSidebarItems}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-[#003366] rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Bookings" sidebarItems={hotelManagerSidebarItems}>
      <div className="p-8 space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="border-b border-gray-100 pb-6">
          <h1 className="text-4xl font-serif font-bold text-[#003366] mb-2 flex items-center gap-3">
            <span className="bg-blue-50 p-2 rounded-xl text-3xl"></span> Hotel Bookings
          </h1>
          <p className="text-gray-500 text-lg">Manage and track all your hotel reservations.</p>
        </div>

        {/* Filters */}
        <BookingFilters 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
        />

        {/* Stats */}
        <BookingStats bookings={bookings} filteredBookings={filteredBookings} />

        {/* Bookings Grid */}
        {filteredBookings.length === 0 ? (
          <EmptyState 
            message="No bookings found" 
            subMessage={bookings.length === 0 ? "No bookings yet." : "Try adjusting your search or filters."} 
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredBookings.map((booking, idx) => (
              <BookingCard 
                key={booking._id} 
                booking={booking} 
                idx={idx} 
                rooms={rooms}
                onAssign={handleAssignClick}
                onStatusUpdate={handleStatusUpdate}
                onCancel={handleCancelClick}
                onView={setSelectedBooking}
              />
            ))}
          </div>
        )}

        {/* Booking Details Modal */}
        <BookingDetailsModal 
          booking={selectedBooking} 
          onClose={() => setSelectedBooking(null)} 
        />

        {/* Assign Room Modal */}
        <AssignRoomModal 
            isOpen={showAssignModal} 
            booking={assigningBooking} 
            rooms={rooms}
            selectedRoomId={selectedRoomId}
            onSelectRoom={setSelectedRoomId}
            onConfirm={confirmAssignment}
            onClose={() => setShowAssignModal(false)}
        />

        {/* Cancel Confirmation Modal */}
        <CancelBookingModal 
            isOpen={showCancelModal}
            onClose={() => setShowCancelModal(false)}
            onConfirm={confirmCancel}
        />
      </div>
    </DashboardLayout>
  );
}
