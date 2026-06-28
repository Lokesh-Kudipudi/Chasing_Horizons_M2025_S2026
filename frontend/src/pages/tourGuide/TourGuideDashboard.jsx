import React, { useState, useEffect } from "react";
import { FaRoute, FaCalendarAlt, FaDollarSign, FaChartLine, FaHandshake } from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/shared/DashboardLayout";
import { tourGuideSidebarItems } from "../../components/dashboard/tourGuide/tourGuideSidebarItems";
import AssignedCustomTours from "../../components/tourGuide/AssignedCustomTours";
import toast from "react-hot-toast";
import { API } from "../../config/api";

export default function TourGuideDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(API.GUIDE.STATS, {
          credentials: "include",
        });
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error("Failed to fetch dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Tour Guide Dashboard" sidebarItems={tourGuideSidebarItems}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-[#003366] rounded-full animate-spin"></div>

          {/* Assigned Custom Tours */}
          <AssignedCustomTours />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Tour Guide Dashboard" sidebarItems={tourGuideSidebarItems}>
      <div className="p-8 space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="border-b border-gray-100 pb-6">
          <h1 className="text-4xl font-serif font-bold text-[#003366] mb-2 flex items-center gap-3">
            <span className="bg-blue-50 p-2 rounded-xl text-3xl">️</span> Dashboard Overview
          </h1>
          <p className="text-gray-500 text-lg">Welcome back! Here's how your tours are performing.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            className="bg-gradient-to-br from-[#003366] to-[#0055aa] p-6 rounded-[2rem] shadow-xl shadow-blue-900/20 text-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 animate-slide-up"
            style={{ animationDelay: '0ms' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <FaRoute size={24} />
              </div>
            </div>
            <div className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Total Tours</div>
            <div className="text-4xl font-bold">{stats?.totalTours || 0}</div>
          </div>

          <div 
            className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 animate-slide-up"
            style={{ animationDelay: '100ms' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                <FaCalendarAlt size={24} />
              </div>
            </div>
            <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Active Bookings</div>
            <div className="text-4xl font-bold text-green-600">{stats?.activeBookings || 0}</div>
          </div>

          <div 
            className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 animate-slide-up"
            style={{ animationDelay: '150ms' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                <FaHandshake size={24} />
              </div>
            </div>
            <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Accepted Custom Tours</div>
            <div className="text-4xl font-bold text-orange-600">{stats?.acceptedCustomTours || 0}</div>
            <div className="text-xs text-gray-400 mt-1">
              Rev: ₹{stats?.customTourRevenue?.toLocaleString('en-IN') || 0}
            </div>
          </div>

          <div 
            className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 animate-slide-up"
            style={{ animationDelay: '200ms' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                <FaDollarSign size={24} />
              </div>
            </div>
            <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</div>
            <div className="text-3xl font-bold text-purple-600">₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}</div>
          </div>

          <div 
            className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 animate-slide-up"
            style={{ animationDelay: '250ms' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                <FaDollarSign size={24} />
              </div>
            </div>
            <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Commission Paid</div>
            <div className="text-3xl font-bold text-red-600">₹{stats?.commissionPaid?.toLocaleString('en-IN') || 0}</div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-[2rem] p-8 border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="text-5xl"></div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Your Dashboard!</h2>
              <p className="text-gray-600">
                Manage your tours, track bookings, and grow your travel business all in one place. 
                Create amazing experiences for your customers!
              </p>
              <div className="mt-4 flex gap-4">
                <a
                  href="/tour-guide/create-tour"
                  className="bg-[#003366] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg inline-block"
                >
                  Create New Tour
                </a>
                <a
                  href="/tour-guide/my-tours"
                  className="bg-white text-[#003366] px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all border-2 border-[#003366] inline-block"
                >
                  View My Tours
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Custom Tours */}
        <div className="mb-8">
          <AssignedCustomTours />
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FaChartLine className="text-[#003366]" /> Quick Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600">Average Tour Price</span>
              <span className="text-xl font-bold text-[#003366]">
                ₹{stats?.totalTours > 0 ? Math.round((stats?.totalRevenue || 0) / stats.totalTours).toLocaleString('en-IN') : 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600">Bookings Per Tour</span>
              <span className="text-xl font-bold text-green-600">
                {stats?.totalTours > 0 ? Math.round((stats?.activeBookings || 0) / stats.totalTours) : 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
