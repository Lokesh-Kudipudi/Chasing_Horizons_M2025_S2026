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

const TourGuides = () => {
  const [tourGuides, setTourGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  
  useEffect(() => {
    fetchTourGuides();
  }, []);

  const fetchTourGuides = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API.ADMIN.TOUR_GUIDES, {
        credentials: "include",
      });
      const data = await response.json();
      
      if (data.status === "success") {
        setTourGuides(data.data);
      } else {
        toast.error("Failed to load tour guides");
      }
    } catch (error) {
      console.error("Error fetching tour guides:", error);
      toast.error("Error loading tour guides");
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
        body: JSON.stringify({ ...formData, role: "tourGuide" }),
      });
      
      const data = await response.json();
      
      if (data.status === "success") {
        toast.success("Tour guide created successfully!");
        if (onSuccess) onSuccess();
        setShowCreateModal(false);
        fetchTourGuides();
      } else {
        toast.error(data.message || "Failed to create tour guide");
      }
    } catch (error) {
      console.error("Error creating tour guide:", error);
      toast.error("Error creating tour guide");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedGuide) return;
    
    try {
      const response = await fetch(API.ADMIN.USER(selectedGuide._id), {
        method: "DELETE",
        credentials: "include",
      });
      
      const data = await response.json();
      
      if (data.status === "success") {
        toast.success("Tour guide deleted successfully!");
        setShowDeleteModal(false);
        setSelectedGuide(null);
        fetchTourGuides();
      } else {
        toast.error(data.message || "Failed to delete tour guide");
      }
    } catch (error) {
      console.error("Error deleting tour guide:", error);
      toast.error("Error deleting tour guide");
    }
  };

  const filteredGuides = tourGuides.filter(guide =>
    guide.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.assignments?.some(asgn => asgn.title?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-[#003366] rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = [
    { label: "Total Guides", value: tourGuides.length, bgClass: "bg-white shadow-gray-200/40 border border-gray-100", valueClass: "text-[#003366]" },
    { label: "Active", value: tourGuides.length, textClass: "text-white", bgClass: "bg-gradient-to-br from-[#003366] to-[#0055aa] shadow-blue-900/20", labelClass: "text-blue-100" },
    { label: "Search Results", value: filteredGuides.length, bgClass: "bg-white shadow-gray-200/40 border border-gray-100", valueClass: "text-gray-800" },
  ];

  return (
    <DashboardLayout title="Tour Guides Management" sidebarItems={adminSidebarItems}>
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      <AdminPageHeader 
        title="Tour Guides" 
        subtitle="Manage tour guide accounts and permissions."
        icon="‍️"
      />

      <AdminSearchBar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        placeholder="Search by name or email..." 
      />

      <AdminStatsGrid stats={stats} />

      {filteredGuides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGuides.map((guide, idx) => (
            <UserCard 
              key={guide._id} 
              user={guide} 
              onDelete={(user) => { setSelectedGuide(user); setShowDeleteModal(true); }}
              roleLabel="Tour Guide"
              roleColorClass="bg-blue-100 text-[#003366]"
              animationDelay={`${idx * 50}ms`}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-[2rem] p-12 text-center border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"></div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No tour guides found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search or add a new tour guide.</p>
        </div>
      )}

      <CreateUserModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        title="Create Tour Guide"
        isLoading={isCreating}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedGuide(null); }}
        onConfirm={handleDelete}
        itemName={selectedGuide?.fullName}
      />
    </div>
    </DashboardLayout>
  );
};

export default TourGuides;
