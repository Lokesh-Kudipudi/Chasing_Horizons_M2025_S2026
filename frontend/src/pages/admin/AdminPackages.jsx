import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEye } from "react-icons/fa";
import TourBookingsChart from "../../components/dashboard/admin/TourBookingsChart.jsx";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/dashboard/shared/DashboardLayout.jsx";
import { adminSidebarItems } from "../../components/dashboard/admin/adminSidebarItems.jsx";
import { API } from "../../config/api";
import AssignEmployeeModal from "../../components/admin/AssignEmployeeModal.jsx";
import { FaUserPlus, FaUserAlt } from "react-icons/fa";

export default function AdminPackages() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 9;
  const [sortBy, setSortBy] = useState("bookings");
  const [editingCommissionId, setEditingCommissionId] = useState(null);
  const [newCommissionRate, setNewCommissionRate] = useState("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTourForAssign, setSelectedTourForAssign] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssignEmployee = async (employeeId) => {
    setIsAssigning(true);
    try {
      const response = await fetch(API.ADMIN.ASSIGN_TOUR(selectedTourForAssign._id), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employeeId }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to assign employee");

      const result = await response.json();

      // Update local state
      const updatedAnalytics = { ...analytics };
      const tourIndex = updatedAnalytics.bookingAnalytics.findIndex(p => p._id === selectedTourForAssign._id);
      if (tourIndex !== -1) {
        updatedAnalytics.bookingAnalytics[tourIndex].assignedEmployeeId = employeeId;
      }
      setAnalytics(updatedAnalytics);
      setIsAssignModalOpen(false);
      setSelectedTourForAssign(null);
      toast.success("Employee assigned successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign employee");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCommissionUpdate = async (tourId) => {
    try {
      const response = await fetch(API.ADMIN.TOUR_COMMISSION(tourId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commissionRate: newCommissionRate }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to update commission");

      const updatedTour = await response.json();

      // Update local state
      const updatedAnalytics = { ...analytics };
      const packageIndex = updatedAnalytics.bookingAnalytics.findIndex(p => p._id === tourId);
      if (packageIndex !== -1) {
        updatedAnalytics.bookingAnalytics[packageIndex].commissionRate = parseFloat(newCommissionRate);
      }
      setAnalytics(updatedAnalytics);
      setEditingCommissionId(null);
      setNewCommissionRate("");
      toast.success("Commission updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update commission rate");
    }
  };

  const handleTourStatusUpdate = async (tourId, status) => {
    try {
      const response = await fetch(API.ADMIN.TOUR_STATUS(tourId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update tour status");
      const result = await response.json();

      setAnalytics((prev) => {
        if (!prev) return prev;
        const next = { ...prev };
        next.bookingAnalytics = (next.bookingAnalytics || []).map((tour) =>
          tour._id === tourId ? { ...tour, status: result.data?.status || status } : tour
        );
        next.activePackages = next.bookingAnalytics.filter((t) => (t.status || "").toLowerCase() === "active").length;
        next.pendingPackages = next.bookingAnalytics.filter((t) => (t.status || "").toLowerCase() === "pending").length;
        next.inactivePackages = next.bookingAnalytics.filter((t) => (t.status || "").toLowerCase() === "inactive").length;
        return next;
      });

      toast.success(status === "active" ? "Tour approved successfully" : "Tour marked inactive");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update tour status");
    }
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(API.ADMIN.TOURS_ANALYTICS, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch package analytics");
        }
        const data = await response.json();
        setAnalytics(data);
        console.log(data);

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const packages = useMemo(() => analytics?.bookingAnalytics || [], [analytics]);

  const filtered = useMemo(() => {
    let list = packages.slice();

    if (activeTab === "active")
      list = list.filter((p) => p.status === "active");
    if (activeTab === "pending")
      list = list.filter((p) => p.status === "pending");
    if (activeTab === "inactive")
      list = list.filter((p) => p.status === "inactive");

    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(s) ||
          p.startLocation.toLowerCase().includes(s) ||
          String(p.price.amount).includes(s)
      );
    }

    if (sortBy === "bookings")
      list.sort((a, b) => (b.totalBookings || 0) - (a.totalBookings || 0));
    if (sortBy === "price")
      list.sort((a, b) => (a.price.amount || 0) - (b.price.amount || 0));
    if (sortBy === "rating") list.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return list;
  }, [packages, activeTab, q, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);


  if (loading) {
    return (
      <DashboardLayout title="Packages Management" sidebarItems={adminSidebarItems}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-[#003366] rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Packages Management" sidebarItems={adminSidebarItems}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Packages Management" sidebarItems={adminSidebarItems}>
      <div className="p-8 space-y-8 animate-fade-in">

        {/* Header */}
        <div className="border-b border-gray-100 pb-6">
          <h1 className="text-4xl font-serif font-bold text-[#003366] mb-2 flex items-center gap-3">
            <span className="bg-blue-50 p-2 rounded-xl text-3xl"></span> Packages Management
          </h1>
          <p className="text-gray-500 text-lg">Manage tour packages, pricing, and availability.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Packages</div>
            <div className="text-4xl font-bold text-[#003366]">{analytics?.totalPackages || 0}</div>
          </div>
          <div className="bg-gradient-to-br from-[#003366] to-[#0055aa] p-6 rounded-[2rem] shadow-xl shadow-blue-900/20 text-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
            <div className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-2">Active Packages</div>
            <div className="text-4xl font-bold">{analytics?.activePackages || 0}</div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Bookings</div>
            <div className="text-4xl font-bold text-green-600">{packages.reduce((s, p) => s + (p.totalBookings || 0), 0)}</div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Pending Approval</div>
            <div className="text-4xl font-bold text-amber-600">{analytics?.pendingPackages || 0}</div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Bookings Overview</h2>
          <TourBookingsChart packages={packages} />
        </div>

        {/* Tabs */}
        <div className="flex gap-4">
          {["all", "pending", "active", "inactive"].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`px-6 py-3 rounded-2xl font-bold transition-all capitalize ${activeTab === tab
                ? "bg-[#003366] text-white shadow-xl shadow-blue-900/20"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Search packages, location, or price..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-3">
            <span className="text-sm font-bold text-gray-600">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none font-medium"
            >
              <option value="bookings">Bookings</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        {/* Packages Grid */}
        {pageItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pageItems.map((pkg, idx) => (
              <div
                key={pkg._id}
                className="bg-white rounded-[2rem] overflow-hidden shadow-lg shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="h-48 overflow-hidden bg-gray-100 relative">
                  {pkg.mainImage ? (
                    <img src={pkg.mainImage} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl"></div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${pkg.status === "active" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                      }`}>
                      {pkg.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{pkg.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                     {pkg.startLocation}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-bold text-gray-800">{pkg.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Price</span>
                      <span className="font-bold text-[#003366]">₹{pkg.price.amount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Bookings</span>
                      <span className="font-bold text-green-600">{pkg.totalBookings || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Rating</span>
                      <span className="font-bold text-yellow-500"> {pkg.rating?.toFixed(1) || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Revenue</span>
                      <span className="font-bold text-green-600">₹{pkg.totalRevenue?.toLocaleString('en-IN') || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Comm. Paid</span>
                      <span className="font-bold text-blue-600">₹{pkg.totalCommission?.toLocaleString('en-IN') || 0}</span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-dashed border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700">Commission Rate</span>
                        {editingCommissionId === pkg._id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={newCommissionRate}
                              onChange={(e) => setNewCommissionRate(e.target.value)}
                              className="w-16 border rounded px-2 py-1 text-sm"
                              min="0"
                              max="100"
                            />
                            <button onClick={() => handleCommissionUpdate(pkg._id)} className="text-green-600 text-xs font-bold hover:underline">Save</button>
                            <button onClick={() => setEditingCommissionId(null)} className="text-red-500 text-xs hover:underline">Cancel</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#003366]">{pkg.commissionRate || 10}%</span>
                            <button
                              onClick={() => {
                                setEditingCommissionId(pkg._id);
                                setNewCommissionRate(pkg.commissionRate || 10);
                              }}
                              className="text-gray-400 hover:text-[#003366] text-xs"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => navigate(`/tours/${pkg._id}`)}
                      className="flex-1 bg-[#003366] text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-900 transition-all flex items-center justify-center gap-2"
                    >
                      <FaEye /> View
                    </button>
                    <button
                      disabled={(pkg.status || "").toLowerCase() !== "active"}
                      onClick={() => {
                        setSelectedTourForAssign(pkg);
                        setIsAssignModalOpen(true);
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${pkg.assignedEmployeeId
                        ? 'bg-blue-50 text-[#003366] hover:bg-blue-100'
                        : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {pkg.assignedEmployeeId ? <><FaUserAlt /> Reassign</> : <><FaUserPlus /> Assign</>}
                    </button>
                  </div>

                  {(pkg.status || "").toLowerCase() === "pending" && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleTourStatusUpdate(pkg._id, "active")}
                        className="flex-1 px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-all"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleTourStatusUpdate(pkg._id, "inactive")}
                        className="flex-1 px-3 py-2 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-[2rem] p-12 text-center border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No packages found</h3>
            <p className="text-gray-500">Try adjusting your filters or search.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-6 py-3 rounded-xl border-2 border-gray-200 font-bold disabled:opacity-50 hover:bg-gray-50 transition-all"
            >
              Previous
            </button>
            <div className="flex gap-2">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-12 h-12 rounded-xl font-bold transition-all ${page === pageNum
                      ? "bg-[#003366] text-white shadow-lg"
                      : "bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-6 py-3 rounded-xl border-2 border-gray-200 font-bold disabled:opacity-50 hover:bg-gray-50 transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <AssignEmployeeModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleAssignEmployee}
        entityName={selectedTourForAssign?.title}
        entityType="Tour"
        isLoading={isAssigning}
      />
    </DashboardLayout>
  );
}
