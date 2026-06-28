import { useState, useEffect } from "react";
import BookingChart from "../../components/dashboard/admin/BookingChart.jsx";
import CustomTourRequests from "../../components/admin/CustomTourRequests.jsx";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/shared/DashboardLayout.jsx";
import { adminSidebarItems } from "../../components/dashboard/admin/adminSidebarItems.jsx";
import { FaChartBar, FaDollarSign, FaUsers, FaHotel, FaMapMarkedAlt, FaHistory, FaBolt } from "react-icons/fa";
import { API } from "../../config/api";
import RevenueDistributionChart from "../../components/dashboard/admin/RevenueDistributionChart.jsx";
import ContributionList from "../../components/dashboard/admin/ContributionList.jsx";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(API.ADMIN.DASHBOARD, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-[#003366] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500 bg-red-50 p-6 rounded-2xl border border-red-100 font-bold">Error: {error}</div>
      </div>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard" sidebarItems={adminSidebarItems}>
      <div className="p-8 space-y-8 animate-fade-in">
        <div className="border-b border-gray-100 pb-6">
          <h1 className="text-4xl font-serif font-bold text-[#003366] mb-2">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 text-lg font-medium">Welcome back! Here's a real-time performance summary of your platform.</p>
        </div>

        {/* Top Level Stats */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 animate-slide-up" style={{ animationDelay: '0ms' }}>
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-[#003366] mb-4">
              <FaChartBar size={24} />
            </div>
            <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Bookings</div>
            <div className="text-4xl font-black text-[#003366]">{analytics?.totalBookings || 0}</div>
          </div>

          <div className="bg-gradient-to-br from-[#003366] to-[#0055aa] p-6 rounded-[2rem] shadow-xl shadow-blue-900/20 text-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
              <FaDollarSign size={24} />
            </div>
            <div className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</div>
            <div className="text-3xl font-black">₹{analytics?.totalRevenue?.toLocaleString('en-IN') || 0}</div>
          </div>

          <div className="bg-gradient-to-br from-[#004d00] to-[#008000] p-6 rounded-[2rem] shadow-xl shadow-green-900/20 text-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 animate-slide-up" style={{ animationDelay: '150ms' }}>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
              <FaDollarSign size={24} />
            </div>
            <div className="text-green-100 text-xs font-bold uppercase tracking-widest mb-1">Total Commission</div>
            <div className="text-3xl font-black">₹{analytics?.totalCommission?.toLocaleString('en-IN') || 0}</div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-4">
              <FaUsers size={24} />
            </div>
            <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Customers</div>
            <div className="text-4xl font-black text-gray-800">{analytics?.totalCustomers || 0}</div>
          </div>
        </div>

        {/* Middle Section: Management Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/admin/hotel-management" className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-orange-100 rounded-3xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                  <FaHotel size={30} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-800">Hotel Management</h3>
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{analytics?.totalHotels || 0} Registered Hotels</p>
                </div>
              </div>
              <div className="text-gray-300 group-hover:text-orange-600 transition-colors">
                <FaBolt size={24} />
              </div>
            </div>
          </Link>

          <Link to="/admin/packages" className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-purple-100 rounded-3xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                  <FaMapMarkedAlt size={30} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-800">Packages Management</h3>
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{analytics?.totalTours || 0} Active Packages</p>
                </div>
              </div>
              <div className="text-gray-300 group-hover:text-purple-600 transition-colors">
                <FaBolt size={24} />
              </div>
            </div>
          </Link>
        </div>

        {/* Main Analytics Row */}
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 p-8">
            <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
              <span className="p-2 bg-blue-50 rounded-xl text-xl"></span> Booking Velocity
            </h2>
            <BookingChart monthlyData={analytics?.monthlyBookings} />
          </div>

          <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 p-8">
            <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
              <span className="p-2 bg-green-50 rounded-xl text-xl"></span> Revenue Mix
            </h2>
            <RevenueDistributionChart
              hotelRevenue={analytics?.totalHotelRevenue || 0}
              tourRevenue={analytics?.totalTourRevenue || 0}
            />
          </div>
        </div>

        {/* Performance Breakdown Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 p-8">
            <ContributionList
              title="Top Performing Hotels"
              icon=""
              items={analytics?.topHotels?.map(h => ({ id: h._id, title: h.title, revenue: h.totalRevenue })) || []}
              totalValue={analytics?.totalHotelRevenue || 0}
              colorClass="bg-[#003366]"
            />
          </div>
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 p-8">
            <ContributionList
              title="Top Performing Packages"
              icon="️"
              items={analytics?.topTours?.map(t => ({ id: t._id, title: t.title, revenue: t.totalRevenue })) || []}
              totalValue={analytics?.totalTourRevenue || 0}
              colorClass="bg-[#008000]"
            />
          </div>
        </div>

        {/* Activity Row */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <span className="p-2 bg-orange-50 rounded-xl text-xl"></span> Recent Transactions
            </h2>
            <Link className="px-5 py-2 bg-blue-50 text-[#003366] text-sm font-black rounded-xl hover:bg-[#003366] hover:text-white transition-all" to="/admin/bookings">
              History →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {analytics?.recentBookings?.slice(0, 5).map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50/80 transition-all group">
                    <td className="py-5">
                      <div className="font-bold text-gray-800 text-sm group-hover:text-[#003366] transition-colors">{booking.userId?.fullName || "Unknown"}</div>
                      <div className="text-[9px] text-gray-400 uppercase font-black tracking-tight">{booking.type} Booking</div>
                    </td>
                    <td className="py-5 text-xs text-gray-500 font-bold">
                      {new Date(booking.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-5 text-right font-black text-gray-900">
                      ₹{booking.bookingDetails?.price?.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!analytics?.recentBookings?.length && (
              <div className="py-12 text-center text-gray-400 italic font-bold">
                No recent bookings found.
              </div>
            )}
          </div>
        </div>

        {/* Full Width Custom Tour Requests */}
        <div className="w-full">
          <CustomTourRequests isCompact={true} />
        </div>

        {/* Quick Access */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/40 border border-gray-100">
          <h3 className="text-xl font-black text-[#003366] mb-6 flex items-center gap-2">
            <FaBolt className="text-yellow-500" /> Quick Access
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to="/admin/customers" className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-center">
              <FaUsers size={20} className="mx-auto mb-2 text-gray-600" />
              <span className="text-[10px] font-black uppercase text-gray-500 tracking-tighter">Customers</span>
            </Link>
            <Link to="/admin/employees" className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-center">
              <FaUsers size={20} className="mx-auto mb-2 text-gray-600" />
              <span className="text-[10px] font-black uppercase text-gray-500 tracking-tighter">Employees</span>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
