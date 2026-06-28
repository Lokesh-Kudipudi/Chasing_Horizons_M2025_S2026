import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/dashboard/shared/DashboardLayout";
import { adminSidebarItems } from "../../components/dashboard/admin/adminSidebarItems";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminSearchBar from "../../components/admin/AdminSearchBar";
import AdminStatsGrid from "../../components/admin/AdminStatsGrid";
import UserCard from "../../components/admin/UserCard";
import CreateUserModal from "../../components/admin/CreateUserModal";
import DeleteConfirmationModal from "../../components/admin/DeleteConfirmationModal";
import { API } from "../../config/api";

const HotelManagers = () => {
  const [hotelManagers, setHotelManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  
  useEffect(() => {
    fetchHotelManagers();
  }, []);

  const fetchHotelManagers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API.ADMIN.HOTEL_MANAGERS, {
        credentials: "include",
      });
      const data = await response.json();
      
      if (data.status === "success") {
        setHotelManagers(data.data);
      } else {
        toast.error("Failed to load hotel managers");
      }
    } catch (error) {
      console.error("Error fetching hotel managers:", error);
      toast.error("Error loading hotel managers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (formData, onSuccess) => {
    setIsCreating(true);
    try {
      const response = await fetch(API.ADMIN.CREATE_USER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...formData, role: "hotelManager" }),
      });
      
      const data = await response.json();
      
      if (data.status === "success") {
        toast.success("Hotel manager created successfully!");
        if (onSuccess) onSuccess();
        setShowCreateModal(false);
        fetchHotelManagers();
      } else {
        toast.error(data.message || "Failed to create hotel manager");
      }
    } catch (error) {
      console.error("Error creating hotel manager:", error);
      toast.error("Error creating hotel manager");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedManager) return;
    
    try {
      const response = await fetch(API.ADMIN.USER(selectedManager._id), {
        method: "DELETE",
        credentials: "include",
      });
      
      const data = await response.json();
      
      if (data.status === "success") {
        toast.success("Hotel manager deleted successfully!");
        setShowDeleteModal(false);
        setSelectedManager(null);
        fetchHotelManagers();
      } else {
        toast.error(data.message || "Failed to delete hotel manager");
      }
    } catch (error) {
      console.error("Error deleting hotel manager:", error);
      toast.error("Error deleting hotel manager");
    }
  };

  const filteredManagers = hotelManagers.filter(manager =>
    manager.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.assignments?.some(asgn => asgn.title?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-[#003366] rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = [
    { label: "Total Managers", value: hotelManagers.length, bgClass: "bg-white shadow-gray-200/40 border border-gray-100", valueClass: "text-[#003366]" },
    { label: "Active", value: hotelManagers.length, textClass: "text-white", bgClass: "bg-gradient-to-br from-[#003366] to-[#0055aa] shadow-blue-900/20", labelClass: "text-blue-100" },
    { label: "Search Results", value: filteredManagers.length, bgClass: "bg-white shadow-gray-200/40 border border-gray-100", valueClass: "text-gray-800" },
  ];

  return (
    <DashboardLayout title="Hotel Managers Management" sidebarItems={adminSidebarItems}>
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      <AdminPageHeader 
        title="Hotel Managers" 
        subtitle="Manage hotel manager accounts and permissions."
        icon=""
      />

      <AdminSearchBar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        placeholder="Search by name or email..." 
      />

      <AdminStatsGrid stats={stats} />

      {filteredManagers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredManagers.map((manager, idx) => (
            <UserCard 
              key={manager._id} 
              user={manager} 
              onDelete={(user) => { setSelectedManager(user); setShowDeleteModal(true); }}
              roleLabel="Hotel Manager"
              roleColorClass="bg-orange-100 text-orange-600"
              animationDelay={`${idx * 50}ms`}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-[2rem] p-12 text-center border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"></div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No hotel managers found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search or add a new hotel manager.</p>
        </div>
      )}

      <CreateUserModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        title="Create Hotel Manager"
        isLoading={isCreating}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedManager(null); }}
        onConfirm={handleDelete}
        itemName={selectedManager?.fullName}
      />
    </div>
    </DashboardLayout>
  );
};

export default HotelManagers;
