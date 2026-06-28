import React, { useState, useEffect } from "react";
import {  FaPlus, FaEdit, FaTrash, FaSearch, FaMapMarkerAlt, FaDollarSign } from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/shared/DashboardLayout";
import ConfirmationModal from "../../components/shared/ConfirmationModal";
import { tourGuideSidebarItems } from "../../components/dashboard/tourGuide/tourGuideSidebarItems";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { API } from "../../config/api";

export default function TourGuideMyTours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tourToDelete, setTourToDelete] = useState(null);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const response = await fetch(API.GUIDE.TOURS, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.status === "success") {
        setTours(data.data);
      }
    } catch (error) {
      console.error("Error fetching tours:", error);
      toast.error("Failed to fetch tours");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (tourId) => {
    setTourToDelete(tourId);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!tourToDelete) return;
    setShowDeleteModal(false);

    try {
      const response = await fetch(API.TOURS.DELETE(tourToDelete), {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Tour deleted successfully");
        fetchTours();
        setTourToDelete(null);
      } else {
        toast.error("Failed to delete tour");
      }
    } catch (error) {
      console.error("Error deleting tour:", error);
      toast.error("Error deleting tour");
    }
  };

  const filteredTours = tours.filter(tour =>
    tour.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tour.startLocation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout title="My Tours" sidebarItems={tourGuideSidebarItems}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-[#003366] rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Tours" sidebarItems={tourGuideSidebarItems}>
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-[#003366] mb-3 flex items-center gap-3">
              <span className="bg-blue-50 p-2 rounded-xl text-3xl">️</span> My Tours
            </h1>
            <p className="text-gray-500 text-lg">Manage and track all your tour packages.</p>
          </div>
          <Link
            to="/tour-guide/create-tour"
            className="bg-[#003366] text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-900/20 hover:bg-blue-900 hover:scale-105 transition-all flex items-center gap-2"
          >
            <FaPlus /> Create New Tour
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by tour name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Tours</div>
            <div className="text-4xl font-bold text-[#003366]">{tours.length}</div>
          </div>
          <div className="bg-gradient-to-br from-[#003366] to-[#0055aa] p-6 rounded-[2rem] shadow-xl shadow-blue-900/20 text-white">
            <div className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-2">Search Results</div>
            <div className="text-4xl font-bold">{filteredTours.length}</div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Value</div>
            <div className="text-3xl font-bold text-green-600">₹{tours.reduce((sum, t) => sum + (t.price?.amount || 0), 0).toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Tours Grid */}
        {filteredTours.length === 0 ? (
          <div className="bg-gray-50 rounded-[2rem] p-12 text-center border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No tours found</h3>
            <p className="text-gray-500 mb-6">
              {tours.length === 0 ? "You haven't created any tours yet." : "Try adjusting your search."}
            </p>
            {tours.length === 0 && (
              <Link
                to="/tour-guide/create-tour"
                className="inline-block bg-[#003366] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-900 transition-all"
              >
                Create Your First Tour
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTours.map((tour, idx) => (
              <div
                key={tour._id}
                className="bg-white rounded-[2rem] overflow-hidden shadow-lg shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="h-48 overflow-hidden bg-gray-100 relative">
                  <img
                    src={tour.mainImage || "https://via.placeholder.com/400x300"}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{tour.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-blue-400" /> {tour.startLocation}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-bold text-gray-800">{tour.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1"><FaDollarSign className="text-green-500" /> Price</span>
                      <span className="font-bold text-[#003366]">₹{tour.price?.amount?.toLocaleString('en-IN') || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <Link
                      to={`/tour-guide/edit-tour/${tour._id}`}
                      className="flex-1 bg-[#003366] text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-900 transition-all flex items-center justify-center gap-2"
                    >
                      <FaEdit /> Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(tour._id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
