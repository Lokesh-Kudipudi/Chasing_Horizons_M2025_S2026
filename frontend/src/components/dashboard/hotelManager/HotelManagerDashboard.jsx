import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaMoneyBillWave, FaCalendarCheck, FaHotel, FaChartLine } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { API } from "../../../config/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const getStatusColor = (status) => {
  const s = status?.toLowerCase() || "";
  if (s === "booked") return { bg: "bg-green-100", text: "text-green-700" };
  if (s === "cancel") return { bg: "bg-red-100", text: "text-red-700" };
  if (s === "checkedIn") return { bg: "bg-blue-100", text: "text-blue-700" };
  if (s === "complete") return { bg: "bg-yellow-100", text: "text-yellow-700" };
  return { bg: "bg-gray-100", text: "text-gray-700" };
};

function BookingsTable({ bookings }) {
  if (!bookings?.length) {
    return (
      <div className="bg-gray-50 rounded-[2rem] p-12 text-center border-2 border-dashed border-gray-200">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"></div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No bookings yet</h3>
        <p className="text-gray-500">Bookings will appear here once guests start reserving rooms.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
      <table className="w-full text-gray-800 border-collapse">
        <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-bold">Guest</th>
            <th className="px-6 py-4 text-center text-sm font-bold">Status</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Check-In</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Check-Out</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Contact</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking, i) => {
            const id = booking._id || `b${i}`;
            const guestName = booking.userId?.fullName ?? "N/A";
            const email = booking.userId?.email ?? "N/A";
            const checkIn = booking.bookingDetails?.checkInDate ?? "N/A";
            const checkOut = booking.bookingDetails?.checkOutDate ?? "N/A";
            const status = booking.bookingDetails?.status ?? "N/A";
            const color = getStatusColor(status);

            return (
              <tr key={id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{guestName}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${color.bg} ${color.text}`}>
                    {status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{checkIn}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{checkOut}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{email}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function HotelManagerDashboard({ initialBookings = [] }) {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    recentBookings: [],
    monthlyBookings: [],
    bookingStatusCounts: { booked: 0, cancelled: 0, checkedin: 0, complete: 0 },
  });
  const [_bookings, setBookings] = useState(initialBookings);
  const [filteredBookings, setFilteredBookings] = useState(initialBookings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(API.MANAGER.STATS, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.status === "success") {
          setStats(data);
          setBookings(data.recentBookings);
          setFilteredBookings(data.recentBookings);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const chartData = {
    labels: stats.monthlyBookings.map((item) => {
      const date = new Date();
      date.setMonth(item._id - 1);
      return date.toLocaleString("default", { month: "short" });
    }),
    datasets: [
      {
        label: "Bookings",
        data: stats.monthlyBookings.map((item) => item.count),
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(0, 51, 102, 0.4)");
          gradient.addColorStop(1, "rgba(0, 51, 102, 0.0)");
          return gradient;
        },
        borderColor: "#003366",
        borderWidth: 3,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#003366",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4, // Smooth curve
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#003366",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#9CA3AF", font: { size: 12 } },
        grid: { color: "rgba(0, 0, 0, 0.03)", borderDash: [5, 5] },
        border: { display: false },
      },
      x: {
        ticks: { color: "#9CA3AF", font: { size: 12 } },
        grid: { display: false },
        border: { display: false },
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-[#003366] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-4xl font-serif font-bold text-[#003366] mb-2 flex items-center gap-3">
          <span className="bg-blue-50 p-2 rounded-xl text-3xl"></span> Dashboard Overview
        </h1>
        <p className="text-gray-500 text-lg">Welcome back! Here's what's happening with your hotel.</p>
      </div>

     {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* 1. Total Bookings */}
        <div 
          className="bg-white p-4 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 animate-slide-up"
          style={{ animationDelay: '0ms' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-[#003366]">
              <FaCalendarCheck size={20} />
            </div>
          </div>
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Bookings</div>
          <div className="text-2xl font-bold text-[#003366]">{stats.totalBookings}</div>
        </div>

        {/* 2. Checked In */}
        <div 
          className="bg-white p-4 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 animate-slide-up"
          style={{ animationDelay: '50ms' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-[#003366]">
              <FaHotel size={20} />
            </div>
          </div>
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Checked In</div>
          <div className="text-2xl font-bold text-[#003366]">{stats.bookingStatusCounts.checkedin}</div>
        </div>

        {/* 3. Complete */}
        <div 
          className="bg-white p-4 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 animate-slide-up"
          style={{ animationDelay: '100ms' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
              <FaCalendarCheck size={20} />
            </div>
          </div>
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Complete</div>
          <div className="text-2xl font-bold text-[#003366]">{stats.bookingStatusCounts.complete}</div>
        </div>

        {/* 4. Upcoming (Booked) */}
        <div 
          className="bg-white p-4 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 animate-slide-up"
          style={{ animationDelay: '150ms' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600">
              <FaCalendarCheck size={20} />
            </div>
          </div>
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Upcoming</div>
          <div className="text-2xl font-bold text-[#003366]">{stats.bookingStatusCounts.booked}</div>
        </div>

        {/* 5. Total Revenue */}
        <div 
          className="bg-white p-4 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 animate-slide-up"
          style={{ animationDelay: '200ms' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-[#003366]">
              <FaMoneyBillWave size={20} />
            </div>
          </div>
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-[#003366]">₹{stats.totalRevenue.toLocaleString("en-IN")}</div>
        </div>

        {/* 6. Commission Paid */}
        <div 
          className="bg-white p-4 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 animate-slide-up"
          style={{ animationDelay: '250ms' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
              <FaMoneyBillWave size={20} />
            </div>
          </div>
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Commission Paid</div>
          <div className="text-xl font-bold text-red-600">₹{stats.commissionPaid ? stats.commissionPaid.toLocaleString("en-IN") : 0}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FaChartLine className="text-[#003366]" /> Bookings Trend
          </h2>
          <div className="h-[300px]">
            <Line options={chartOptions} data={chartData} />
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <Link
              to="/hotel-manager/room-inventory"
              className="block w-full py-4 px-6 bg-[#003366] hover:bg-blue-900 text-white text-center rounded-2xl transition-all shadow-lg font-bold"
            >
              Add New Room
            </Link>
            <Link
              to="/hotel-manager/bookings"
              className="block w-full py-4 px-6 bg-white hover:bg-gray-50 text-[#003366] border-2 border-[#003366] text-center rounded-2xl transition-all font-bold"
            >
              View All Bookings
            </Link>
            <Link
              to="/hotel-manager/my-hotel"
              className="block w-full py-4 px-6 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 text-center rounded-2xl transition-all font-bold"
            >
              Edit Hotel Details
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Bookings</h2>
        <BookingsTable bookings={filteredBookings} />
      </div>
    </div>
  );
}
